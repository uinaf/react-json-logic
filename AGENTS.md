# AGENTS.md

`react-json-logic`: a headless React component library for building [JsonLogic](http://jsonlogic.com) rules.

- `packages/react-json-logic` is the npm library.
- `apps/example` is a local demo on `workspace:*`. The public demo on uinaf.dev installs the published package, so it sees a change only after a release.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm verify          # check, build, and tests with coverage
pnpm dev:example     # run the demo
```

In `packages/react-json-logic`, `pnpm exec vp check`, `pnpm exec vp test`, and `pnpm exec vp pack` give a faster loop. Use bare `vp` inside package scripts, and import test utilities from `vite-plus/test`.

Root docs (`AGENTS.md`, `CONTRIBUTING.md`, `README.md`) need `pnpm exec vp fmt --check <file>`; every other change needs `pnpm verify`.

## Toolchain

[`renovate.json`](renovate.json) uses the shared [Vite+ mapping](https://github.com/uinaf/.github/blob/main/renovate-vite-plus.json). It updates the toolchain together using the Vitest version bundled by Vite+.

For a manual upgrade:

1. `pnpm --package=vite-plus@<version> dlx vp migrate --no-interactive`
2. Set the `vitest` and `@vitest/coverage-v8` catalog entries to `npm view vite-plus@<version> dependencies.vitest`.
3. `pnpm verify`

## Conventions

- **Headless.** Ship no CSS. A new `data-rjl-*` attribute goes in the [styling table](packages/react-json-logic/README.md#styling).
- **Base UI primitives.** Dropdowns use `Select` (`@base-ui/react/select`); the accessor field uses `Autocomplete` (`@base-ui/react/autocomplete`). Both render through portals.
- **Controlled.** `value` and `onChange` are the only source of truth for the rule.
- **Small public API.** A new export in [`src/index.ts`](packages/react-json-logic/src/index.ts) is an API decision.
- Filenames are kebab-case. `components/any.tsx` is the recursive operator dispatcher.

## Releases

A push to `main` publishes to npm when the commit type calls for it ([`.releaserc.json`](.releaserc.json)); pick the type for the release it should cause.

npm Trusted Publishing is registered to `.github/workflows/ci.yml` and the `release` Environment. Renaming either breaks publishing.

## Repository skills

- React effect changes: [react-ban-use-effect](.agents/skills/react-ban-use-effect/SKILL.md).
- React feature and bug verification or diagnostics: [react-doctor](.agents/skills/react-doctor/SKILL.md).
