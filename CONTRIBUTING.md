# Contributing

The workspace holds the library in `packages/react-json-logic` and a demo app in `apps/example`.

## Local Setup

Run from the workspace root:

```bash
pnpm install --frozen-lockfile
pnpm verify
```

The root `package.json` scripts (`check`, `test`, `build`, `dev:example`, `build:example`) are the day-to-day entry points.

## Commits and Pull Requests

- Use [Conventional Commits](https://www.conventionalcommits.org); the type decides the release.
- Keep each pull request to one concern.
- Fill out the [pull request template](https://github.com/uinaf/.github/blob/main/PULL_REQUEST_TEMPLATE.md).
- Include validation evidence: `pnpm verify` for code, `pnpm exec vp fmt --check <file>` for root docs alone.

## Releases

Every push to `main` runs `verify`, then [semantic-release](https://github.com/semantic-release/semantic-release) publishes `packages/react-json-logic` to npm when the commits call for a version bump. `apps/example` is not deployed; the public demo on uinaf.dev installs the published package.
