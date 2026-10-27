---
name: vite-plus-upgrade
description: Upgrade the Vite+ toolchain by hand. Use when a Vite+ upgrade cannot wait for Renovate or a Renovate upgrade PR needs manual repair.
---

# Vite+ upgrade

Renovate owns routine upgrades through [`renovate.json`](../../../renovate.json).

1. `pnpm --package=vite-plus@<version> dlx vp migrate --no-interactive`
2. Set the `vitest` and `@vitest/coverage-v8` catalog entries to `npm view vite-plus@<version> dependencies.vitest`.
3. `pnpm verify`
