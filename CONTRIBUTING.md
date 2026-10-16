# Contributing

## Scope

- `packages/react-json-logic`: publishable library package
- `apps/example`: demo application package

## Local Setup

Run from the workspace root:

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
- Include validation evidence: `pnpm verify` for code, `pnpm exec vp fmt --check <file>` for root docs alone

## Releases

- Every push to `main` runs `verify`, then [semantic-release](https://github.com/semantic-release/semantic-release) publishes `packages/react-json-logic` to npm when the Conventional Commits call for a version bump
- `apps/example` is not deployed; the public demo on uinaf.dev installs the published package
