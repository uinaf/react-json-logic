# react-json-logic — Agent Guide

A React component library for visually building [JsonLogic](http://jsonlogic.com) rules.

## Toolchain

This repo runs on [Vite+](https://viteplus.dev). Drive everything through `vp`:

- `vp install` — install deps after pulling
- `vp check` — format, lint, typecheck (the gate before commit)
- `vp test` — run vitest
- `vp pack` — build the library (entry `src/index.ts` → `dist/`)
- `vp dev` — `vp pack --watch` for library-mode dev

Do not invoke `pnpm`, `vite`, or `vitest` directly. Do not install `vitest` — import test utilities from `vite-plus/test`.

## Layout

```
src/
  index.ts                    # public exports
  operators.ts                # OPERATORS + FIELD_TYPES table
  components/
    JsonLogicBuilder.tsx      # default export, top-level controlled wrapper
    Any.tsx                   # recursive operator dispatcher
    Input.tsx                 # value field
    Accessor.tsx              # var/accessor field
    HigherOrder.tsx           # some/every/map/filter wrapper
    SelectOperator.tsx        # dropdown
    *.module.css
tests/
```

## Notes for Future Work

- Demo site (`examples/`) was removed during the v3 migration. Rebuild target: Cloudflare Pages, ideally as interactive OSS docs.
- Several class-era patterns survived the modernization (prop-mirror via `useEffect`, mutating-state writes in `Any`). Step 3 of the cleanup roadmap fixes these.
- Operator table at `src/operators.ts` still uses string keys like `"Between"` that aren't real JSON Logic operators. Audit before assuming any entry is canonical.
