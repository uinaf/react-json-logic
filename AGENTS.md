# Workspace — Agent Guide

This is a pnpm + Vite+ monorepo with two workspace packages:

- [`packages/react-json-logic`](packages/react-json-logic) — the published headless React library. See its [AGENTS.md](packages/react-json-logic/AGENTS.md) for package-level conventions.
- [`apps/example`](apps/example) — interactive demo app. Consumes `react-json-logic` via `workspace:*`. Built to `apps/example/dist` for deploy to Cloudflare Pages.

## Toolchain

Run everything through `vp` and `pnpm` from the **workspace root**:

```bash
vp install          # bootstrap, workspace-aware
pnpm verify         # full gate: pnpm -r run verify (check + test --coverage + pack per pkg)
pnpm test           # pnpm -r run test
pnpm check          # pnpm -r run check
pnpm build          # build the library
pnpm dev:example    # run the demo app locally
pnpm build:example  # build the demo for deploy
```

For per-package work, `cd` into the package dir and run `vp <command>` directly.

## Conventions

- **Scripts that span packages** live in the root `package.json` and use `pnpm --filter <name>` or `pnpm -r run <task>`. Don't add custom workspace task wrappers.
- **The library is the only publishable package.** `apps/example` is `private: true`.
- **Coverage gate** is enforced inside `packages/react-json-logic/vite.config.ts` (currently 97/95/90/97 lines/functions/branches/statements). Run `pnpm verify` before commit.
- **`workspace:*`** is how the demo references the library. Don't pin a version — workspace resolution will fail.

## Adding a new package

1. Create the directory under `packages/` or `apps/`.
2. Add a `package.json` with `name`, `private` (for apps), and the standard scripts (`build`, `test`, `check`, `verify`).
3. Run `vp install` from the root.
4. Add it to the relevant root scripts if it should run as part of `pnpm test`/`pnpm verify`.

## CI / release

`.github/workflows/ci.yml` runs on every PR and push to `main`:

- **verify** job — `pnpm verify` across the workspace. Enforces the 97/95/90/97 coverage gate and both packages' build steps.
- **release** job — only on push to `main`, only after verify passes. Uses [`cycjimmy/semantic-release-action@v4`](https://github.com/cycjimmy/semantic-release-action) with conventional-commits to publish the lib to npm, tag the repo, and open a GitHub Release.

Conventional commits drive the version: `feat:` → minor, `fix:` → patch, `feat!:`/`BREAKING CHANGE:` → major. Skip a release with `[skip ci]` in the commit message.

**Auth uses npm Trusted Publishing (OIDC) — no `NPM_TOKEN` secret needed.** The release job carries `id-token: write`; npm validates the OIDC token against the package's [Trusted Publisher](https://docs.npmjs.com/trusted-publishers/) entry. `publishConfig.provenance: true` adds a [provenance attestation](https://docs.npmjs.com/generating-provenance-statements/) to every release.

To enable: on npmjs.com, open the `react-json-logic` package settings → Trusted Publishers → Add → provider GitHub Actions, repository `uinaf/react-json-logic`, workflow filename `ci.yml`. (No environment.) Once configured, every push to `main` that warrants a release publishes automatically with provenance.

Node version is locked in `.node-version` at the workspace root — both CI and the Cloudflare Pages demo deploy read it.

## Demo deploy

`apps/example` deploys to Cloudflare Pages at `react-json-logic.uinaf.dev` via the **dashboard git integration** (no GitHub Actions). CF clones, runs the build command, deploys the output:

- Production branch: `main`
- Build command: `pnpm install --frozen-lockfile && pnpm build:example`
- Build output: `apps/example/dist`
- Env: `NODE_VERSION=24.14.0` (or read from `.node-version`)
