import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import assert from "node:assert/strict";

interface Context {
  cwd: string;
  env: NodeJS.ProcessEnv;
  nextRelease: { version: string; gitHead: string };
}

function record(value: unknown): Record<string, unknown> {
  assert(value !== null && typeof value === "object" && !Array.isArray(value), "Expected object");
  return Object.fromEntries(Object.entries(value));
}
function oid(value: unknown): string {
  assert(typeof value === "string" && /^[a-f0-9]{40}$/.test(value), "Expected commit SHA");
  return value;
}

// npm's prepare runs first. Only its version edit may enter the signed commit.
export async function prepare(_config: unknown, context: Context): Promise<void> {
  const { cwd, env, nextRelease } = context;
  const expected = oid(env.GITHUB_SHA);
  const repository = env.GITHUB_REPOSITORY;
  assert.equal(repository, "uinaf/react-json-logic");
  const token = env.GITHUB_TOKEN ?? env.GH_TOKEN;
  assert(token, "Release token required");
  const git = (...args: string[]) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
  if (git("rev-parse", "HEAD") !== expected || nextRelease.gitHead !== expected)
    throw new Error("release checkout must match the verified event commit");
  if (
    git(
      "diff",
      "--name-only",
      expected,
      "--",
      ".",
      ":(exclude)packages/react-json-logic/package.json",
    )
  )
    throw new Error(
      "release preparation changed files other than packages/react-json-logic/package.json",
    );
  const before = record(
    JSON.parse(git("show", `${expected}:packages/react-json-logic/package.json`)),
  );
  const content = fs.readFileSync(path.join(cwd, "packages/react-json-logic/package.json"));
  const prepared = record(JSON.parse(content.toString("utf8")));
  if (!isDeepStrictEqual(prepared, { ...before, version: nextRelease.version }))
    throw new Error("release preparation must change only the package version");

  // GitHub signs this commit and rejects a moved branch atomically. A preflight
  // against main would leave a race between reading its head and writing it.
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    signal: AbortSignal.timeout(30_000),
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `mutation($input: CreateCommitOnBranchInput!) {
        createCommitOnBranch(input: $input) { commit { oid } }
      }`,
      variables: {
        input: {
          branch: { repositoryNameWithOwner: repository, branchName: "main" },
          expectedHeadOid: expected,
          message: { headline: `chore(release): ${nextRelease.version} [skip ci]` },
          fileChanges: {
            additions: [
              {
                path: "packages/react-json-logic/package.json",
                contents: content.toString("base64"),
              },
            ],
          },
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`release writeback failed: GitHub HTTP ${response.status}`);
  const result = record(await response.json());
  if (result.errors !== undefined) {
    assert(Array.isArray(result.errors), "Expected GraphQL errors array");
    if (result.errors.length) {
      const messages = result.errors.map((error) => {
        const message = record(error).message;
        assert.equal(typeof message, "string");
        return message;
      });
      throw new Error(`release writeback rejected: ${messages.join("; ")}`);
    }
  }
  const committed = oid(record(record(record(result.data).createCommitOnBranch).commit).oid);

  // main may advance after the mutation. Fetch and tag the returned commit,
  // never the moving branch. A failure here leaves writeback without a release.
  git("fetch", "origin", committed);
  if (git("show", "-s", "--format=%P", committed) !== expected)
    throw new Error("release writeback has an unexpected parent");
  if (
    git(
      "diff",
      "--name-only",
      expected,
      committed,
      "--",
      ".",
      ":(exclude)packages/react-json-logic/package.json",
    )
  )
    throw new Error(
      "release writeback changed source outside packages/react-json-logic/package.json",
    );
  if (
    !execFileSync("git", ["show", `${committed}:packages/react-json-logic/package.json`], {
      cwd,
    }).equals(content)
  )
    throw new Error("release writeback does not match the prepared package");
  git("reset", "--hard", committed);
  nextRelease.gitHead = committed;
}
