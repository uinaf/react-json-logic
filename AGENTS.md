# AGENTS.md

Guide for working on `react-json-logic`, a headless React component library for visually building [JsonLogic](http://jsonlogic.com) rules.

## What this repo is

- `packages/react-json-logic`: the library published to npm. All meaningful work happens here.
- `apps/example`: a local demo that consumes the library via `workspace:*`. The public demo on uinaf.dev installs the published npm package, so it picks up a change only after a release.

## Toolchain

This repo runs on [Vite+](https://viteplus.dev) with the pnpm version pinned in `package.json`:

```bash
pnpm install --frozen-lockfile
pnpm verify          # check + build + tests with coverage
```

The other entry points are the scripts in the root and package `package.json`. Inside `packages/react-json-logic`, `pnpm exec vp check`, `pnpm exec vp test`, and `pnpm exec vp pack` give a faster loop.

Use `pnpm exec vp` interactively, bare `vp` inside package scripts, and import test utilities from `vite-plus/test`.

Renovate skips `vite-plus`, its `vite` alias, `vitest`, and `@vitest/coverage-v8`, because the last two must equal the `vitest` that `vite-plus` pins. Upgrade the four in one change: run `pnpm --package=vite-plus@<version> dlx vp migrate --no-interactive`, set the `vitest` and `@vitest/coverage-v8` catalog entries to `npm view vite-plus@<version> dependencies.vitest`, then run `pnpm verify`.

## Proof

| Change                                                        | Check                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Root docs (`AGENTS.md`, `CONTRIBUTING.md`, `README.md`)       | `pnpm exec vp fmt --check <file>`; no workspace script reads them                    |
| Library code, tests, or `packages/react-json-logic/README.md` | `pnpm exec vp test` in the package while iterating, then `pnpm verify`               |
| Demo app                                                      | `pnpm verify` (runs the demo's `vp check && vp build`); `pnpm dev:example` to use it |

The coverage thresholds live in `packages/react-json-logic/vite.config.ts`.

## Development conventions

- **Headless.** The library ships no CSS. Consumers style it through the `data-rjl-*` attributes listed in the [package README](packages/react-json-logic/README.md#styling); a new attribute goes in that table.
- **Base UI for primitives.** Dropdowns use `Select` from `@base-ui/react/select`, and the accessor field uses `Autocomplete` from `@base-ui/react/autocomplete`. Both render through portals.
- **Controlled components.** `value` and `onChange` props are the only source of truth for the rule.
- **Small public API.** [`src/index.ts`](packages/react-json-logic/src/index.ts) defines it; a new export is an API decision.
- `components/any.tsx` is the recursive operator dispatcher. Filenames are kebab-case.

## Releases

Every push to `main` whose head commit lacks `[skip ci]` runs `verify`, then semantic-release publishes `packages/react-json-logic` to npm when the commits call for it: `feat` is a minor, `fix`, `perf`, and reverts a patch, and `!` or a `BREAKING CHANGE:` footer a major. `docs`, `chore`, `refactor`, `test`, and `ci` publish nothing, so pick the commit type for the release it should cause. npm Trusted Publishing is registered to `.github/workflows/ci.yml` and the `release` Environment, so renaming either breaks publishing. Credentials, version writeback, and recovery: [Package releases](https://app.notion.com/p/3e5e75710b52814ab798f9febefb38ed) in the uinaf Notion.

## Repository Skills

- For React effect changes, use [react-ban-use-effect](.agents/skills/react-ban-use-effect/SKILL.md).
- For React feature and bug verification or diagnostics, use [react-doctor](.agents/skills/react-doctor/SKILL.md).
