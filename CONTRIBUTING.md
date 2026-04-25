# Contributing

Thanks for improving this repository.

## Scope

- `packages/react-json-logic`: publishable library package
- `apps/example`: demo application package

## Local Setup

Run from the workspace root:

```bash
vp install
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
vp run verify
```

## Commit and Pull Request Rules

- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`)
- Keep each pull request focused on one concern
- Fill out the pull request template
- Include validation evidence (at minimum `pnpm verify`)

## Release and Deployment Notes

- The library release pipeline is configured but currently disabled
- The demo app deploy is configured through the repository host dashboard
