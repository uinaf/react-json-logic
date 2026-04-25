# react-json-logic — Agent Guide

A headless React component library for visually building [JsonLogic](http://jsonlogic.com) rules.

## Toolchain

This repo runs on [Vite+](https://viteplus.dev). Drive everything through `vp`:

- `vp install` — install deps after pulling
- `vp check` — format, lint, typecheck (the gate before commit)
- `vp test` — run vitest
- `vp test --coverage` — with v8 coverage report
- `vp pack` — build the library (entry `src/index.ts` → `dist/`)
- `vp dev` — `vp pack --watch` for library-mode dev
- `pnpm verify` — the full gate: `vp check && vp test --coverage && vp pack`

Do not invoke `pnpm`, `vite`, or `vitest` directly. Do not install `vitest` — import test utilities from `vite-plus/test`. The repo intentionally has no `lint`/`fmt`/`tsc` scripts; `vp check` is the unified gate.

## Layout

```
src/
  index.ts                       # public exports
  operators.ts                   # OPERATORS + FIELD_TYPES table
  components/
    json-logic-builder.tsx       # default export — top-level controlled wrapper
    any.tsx                      # recursive operator dispatcher
    input.tsx                    # value field (uses Base UI Select for type chooser)
    accessor.tsx                 # var/accessor field (uses Base UI Autocomplete)
    higher-order.tsx             # some/all/none/map/filter wrapper
    select-operator.tsx          # operator dropdown (uses Base UI Select)
tests/
  json-logic-builder.test.tsx    # vitest + @testing-library/react
```

All filenames are kebab-case.

## Conventions

- **No CSS shipped.** The library is headless. We do not import or emit CSS modules. Consumers style via `data-rjl-*` attributes (documented in README) or by wrapping the components.
- **Base UI for primitives.** Operator/type dropdowns use `Select` from `@base-ui/react/select`. The accessor field uses `Autocomplete` from `@base-ui/react/autocomplete`. Both render through portals.
- **`onChange` is the source of truth.** Components are controlled — every state change emits through `props.onChange` and the parent re-renders us with the new value. No prop-mirror, no internal `useState` for value.
- **Coverage gate** is enforced in `vite.config.ts` at **97/95/90/97** (lines/functions/branches/statements). Run `vp test --coverage` (or `pnpm verify` from the workspace root) to evaluate.

## Release flow

Auto-published to npm by `.github/workflows/ci.yml` on every push to `main`:

- Verify gate (`pnpm verify`) runs first; release job runs only on green.
- `cycjimmy/semantic-release-action@v4` with conventional-commits picks the next version from commit messages: `feat:` → minor, `fix:` → patch, `feat!:`/`BREAKING CHANGE:` → major.
- Releases tag the repo (`vN.N.N`), publish to npm (`react-json-logic`), open a GitHub Release with the conventional changelog, and commit the version bump back as `chore(release): N.N.N [skip ci]`.
- semantic-release reads `.releaserc.json` from this directory and runs from here via `working_directory: packages/react-json-logic` in the workflow.
- Skip a release on a given push by including `[skip ci]` in the commit message.

`.node-version` at the workspace root locks the runner Node version so CI and the Cloudflare Pages demo (`react-json-logic.uinaf.dev`) agree.

## Notes for Future Work

- Coverage today: **99%+ lines**, **100% functions**, **91%+ branches**, **98%+ statements**. The two remaining uncovered branches are `next == null` defensive guards on Base UI Select callbacks (Base UI never emits null in practice; the guards stay as belt-and-suspenders).
- Builder API + `validate()` shipped — `rule.eq(rule.var("a"), 1)`, `validate(rule)` walks against `OPERATORS`. A tighter discriminated-union `JsonLogicRule` type is still on the queue if we want full arity-checked autocomplete on the public surface (currently `value`/`onChange` are typed as `JsonLogicValue`, the recursive any-shape type).
- `accessor.tsx` walks `data[0]` only when descending into arrays. Heterogeneous-shape arrays surface keys from the first element; deeper-but-only-on-later-elements paths are invisible. Worth a redesign pass.
