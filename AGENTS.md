# AGENTS.md

Guide for working on `react-json-logic`, a headless React component library for visually building [JsonLogic](http://jsonlogic.com) rules.

## What this repo is

- One publishable package: `packages/react-json-logic` (the library on npm)
- One demo app: `apps/example` (consumes the library via `workspace:*`)

All meaningful work happens in `packages/react-json-logic`. The demo exists to exercise the library locally; the public demo on uinaf.dev installs the published npm package, so it picks up a change only after a release.

## Toolchain

This repo runs on [Vite+](https://viteplus.dev). Bootstrap with the
repository-pinned pnpm and invoke the repository-local Vite+ binary explicitly:

```bash
pnpm install --frozen-lockfile
pnpm verify          # full gate: check + tests (with coverage) + build
pnpm test            # tests across packages
pnpm check           # format + lint + typecheck
pnpm build           # build the library
pnpm dev:example     # run the demo locally
pnpm build:example   # build the demo
```

Per-package work (recommended for library development):

```bash
cd packages/react-json-logic
pnpm exec vp check
pnpm exec vp test
pnpm exec vp test --coverage
pnpm exec vp pack
```

Use `pnpm exec vp` interactively, keep bare `vp` inside package scripts, and
import test utilities from `vite-plus/test`.

Renovate skips `vite-plus`, its `vite` alias, `vitest`, and
`@vitest/coverage-v8`, because the last two must equal the `vitest` that
`vite-plus` pins. Upgrade the four in one change: run
`pnpm --package=vite-plus@<version> dlx vp migrate --no-interactive`, set the
`vitest` and `@vitest/coverage-v8` catalog entries to
`npm view vite-plus@<version> dependencies.vitest`, then run `pnpm verify`.

## Proof

| Change                                                        | Check                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Root docs (`AGENTS.md`, `CONTRIBUTING.md`, `README.md`)       | `pnpm exec vp fmt --check <file>`; no workspace script reads them                    |
| Library code, tests, or `packages/react-json-logic/README.md` | `pnpm exec vp test` in the package while iterating, then `pnpm verify`               |
| Demo app                                                      | `pnpm verify` (runs the demo's `vp check && vp build`); `pnpm dev:example` to use it |

## Library layout

```
packages/react-json-logic/
  src/
    index.ts                       # public exports
    operators.ts                   # OPERATORS + FIELD_TYPES table
    builder.ts                     # typed `rule` factory
    validator.ts                   # `validate()`
    components/
      json-logic-builder.tsx       # default export: top-level controlled wrapper
      any.tsx                      # recursive operator dispatcher
      input.tsx                    # value field (Base UI Select for type chooser)
      accessor.tsx                 # var/accessor field (Base UI Autocomplete)
      higher-order.tsx             # some/all/none/map/filter wrapper
      select-operator.tsx          # operator dropdown (Base UI Select)
  tests/                           # vitest + @testing-library/react
```

All filenames are kebab-case.

## Development conventions

- **Headless.** No CSS shipped. Style via `data-rjl-*` attributes documented in the README. Keep CSS modules out of the library.
- **Base UI for primitives.** Operator/type dropdowns use `Select` from `@base-ui/react/select`. The accessor field uses `Autocomplete` from `@base-ui/react/autocomplete`. Both render through portals.
- **Controlled components.** `props.onChange` is the source of truth; no internal `useState` mirror for `value`.
- **Coverage gate** is enforced in `packages/react-json-logic/vite.config.ts`. Run `pnpm exec vp test --coverage` (or `pnpm verify`) to evaluate.
- **Public API is small on purpose.** Default export `JsonLogicBuilder`, plus `applyLogic`, `rule`, `validate`, `OPERATORS`, `FIELD_TYPES`, and the core types. Adding a new public export is an API decision, not a casual change.

## Releases

Every push to `main` whose head commit lacks `[skip ci]` runs `verify`, then semantic-release publishes `packages/react-json-logic` to npm when the commits call for it: `feat` is a minor, `fix`, `perf`, and reverts a patch, and `!` or a `BREAKING CHANGE:` footer a major. `docs`, `chore`, `refactor`, `test`, and `ci` publish nothing, so pick the commit type for the release it should cause. Pipeline and recovery details: [CONTRIBUTING.md](CONTRIBUTING.md#release-and-deployment-notes).

## Repository Skills

- For React effect changes, use [react-ban-use-effect](.agents/skills/react-ban-use-effect/SKILL.md).
- For React feature and bug verification or diagnostics, use [react-doctor](.agents/skills/react-doctor/SKILL.md).
