# Contributing

## Scope

- `packages/react-json-logic`: publishable library package
- `apps/example`: demo application package

## Local Setup

Use Node 24.18 or newer with Corepack enabled, then run from the workspace root:

```bash
pnpm install --frozen-lockfile
pnpm verify
```

## Daily Workflow

Use the root scripts as the canonical entrypoints:

```bash
pnpm check
pnpm test
pnpm build
pnpm dev:example
pnpm build:example
```

Per-package work is also supported:

```bash
cd packages/react-json-logic
pnpm exec vp run verify
```

## Commit and Pull Request Rules

- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`)
- Keep each pull request focused on one concern
- Fill out the [pull request template](https://github.com/uinaf/.github/blob/main/PULL_REQUEST_TEMPLATE.md)
- Include validation evidence (at minimum `pnpm verify`)

## Release and Deployment Notes

- On every push to `main` without `[skip ci]` in the commit message, CI runs `verify`, then [semantic-release](https://github.com/semantic-release/semantic-release) for `packages/react-json-logic`
- Conventional Commits drive the version bump and npm publish, when applicable
- Publishing uses npm Trusted Publishing (OpenID Connect): the release job grants `id-token: write` and uses no `NPM_TOKEN` secret
- GitHub Releases and version push-back commits are authored by `uinaf-releaser[bot]` via a short-lived App installation token from the `release` Environment
- The demo app deploy is configured through the repository host dashboard

Release preparation uses `packages/react-json-logic/scripts/release-commit.ts`
after npm prepares the package version. The checkout and GitHub's atomic
`expectedHeadOid` are bound to the verified workflow event SHA. GitHub signs
the commit and rejects writeback if `main` has advanced. The plugin fetches the
returned immutable SHA and checks its parent, unchanged source, and exact
prepared manifest before semantic-release tags it. Only the package version
may change. Keep `.github/workflows/ci.yml` and the `release` Environment names:
these identify the npm trusted publisher.

If GitHub accepts writeback but fetching or validating it fails, preparation
stops before tagging or publishing. Inspect that commit's parent, tree, version
and verified signature, plus existing tags, npm versions and GitHub Releases,
before recovery. Reconcile only missing publication steps from the validated
commit; do not create another version or move an existing tag to hide failure.
