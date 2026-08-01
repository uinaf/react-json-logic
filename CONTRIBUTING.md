# Contributing

Thanks for improving this repository.

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
- Fill out the pull request template
- Include validation evidence (at minimum `pnpm verify`)

## Release and Deployment Notes

- On every push to `main` that is not tagged `[skip ci]`, CI runs `verify` and then [semantic-release](https://github.com/semantic-release/semantic-release) for `packages/react-json-logic` (Conventional Commits → version bump and npm publish, when applicable). The `NPM_TOKEN` secret must be set on the repository.
- The demo app deploy is configured through the repository host dashboard
