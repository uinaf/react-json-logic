# AGENTS.md

Guide for working on `react-json-logic`, a headless React component library for visually building [JsonLogic](http://jsonlogic.com) rules.

## What this repo is

- One publishable package: `packages/react-json-logic` (the library on npm)
- One demo app: `apps/example` (consumes the library via `workspace:*`)

All meaningful work happens in `packages/react-json-logic`. The demo exists to exercise the library locally.

## Toolchain

This repo runs on [Vite+](https://viteplus.dev). Drive everything through `vp` (per package) and `pnpm` (workspace-wide):

```bash
vp install           # install deps
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
vp check
vp test
vp test --coverage
vp pack
```

Use `vp` and import test utilities from `vite-plus/test`.

## Library layout

```
packages/react-json-logic/
  src/
    index.ts                       # public exports
    operators.ts                   # OPERATORS + FIELD_TYPES table
    builder.ts                     # typed `rule` factory
    validator.ts                   # `validate()`
    components/
      json-logic-builder.tsx       # default export — top-level controlled wrapper
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
- **Controlled components.** `props.onChange` is the source of truth — no internal `useState` mirror for `value`.
- **Coverage gate** is enforced in `packages/react-json-logic/vite.config.ts`. Run `vp test --coverage` (or `pnpm verify`) to evaluate.
- **Public API is small on purpose.** Default export `JsonLogicBuilder`, plus `applyLogic`, `rule`, `validate`, `OPERATORS`, `FIELD_TYPES`, and the core types. Adding a new public export is an API decision, not a casual change.

## Commit style

Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`). Mark breaking changes with `!` or a `BREAKING CHANGE:` footer.
