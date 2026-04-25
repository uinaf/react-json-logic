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
