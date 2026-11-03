---
name: react-ban-use-effect
description: "Review or replace React useEffect calls, or enforce a no-direct-effect policy. Use for effect implementation, refactoring, or lint policy; excludes unrelated React work and non-React effect systems."
---

# React Ban useEffect

Direct `useEffect` is an external-synchronization escape hatch. It lives in a
reviewed, domain-specific hook for a real external system; components stay
effect-free.

## Scope

Replace effects only in the touched or requested surface. Add
repository-wide lint enforcement only when requested or required by existing
repository policy.

## Workflow

1. Find direct imports, `React.useEffect(...)` namespace calls, and wrappers
   around `useEffect` in the touched surface.
2. Classify each effect and replace it in this order of preference:
   1. render-time calculation
   2. server, loader, or framework data API
   3. the repository's server-state layer (for example a TanStack Query
      `queryOptions` factory with variables in the key and the `signal` passed
      through)
   4. event handler, action, or mutation
   5. keyed component boundary
   6. `useSyncExternalStore`
   7. reviewed domain-specific hook for a real external system

   If none fits, state the external synchronization contract before keeping an
   effect. [Replacements](references/replacements.md) covers the non-obvious
   cases.
3. Preserve the repository's framework, data layer, lint shape, and dependency
   policy. Add a library only when the request or repository policy authorizes
   it; without a server-state layer, call the remaining effect a design gap.
4. Run lint, type, and test gates plus the smallest real UI or hook check for
   the changed behavior.

## Legitimate Effects

Put every legitimate effect in a hook named for its external system (a chat
connection, a map SDK, a widget), in its own file. The hook owns setup and
cleanup, takes its reactive inputs as parameters, and lists every value setup
or cleanup reads, so `react-hooks/exhaustive-deps` passes unsuppressed. Prefer
an existing repository hook.

The hook is specific to one external system. A generic wrapper that takes a
callback and a caller-provided dependency array (`useUpdateEffect(fn, deps)`,
`useMountEffect(fn)`) is a direct effect under another name, and server state,
prop copies, user actions, and keyed resets each have their own replacement
above.

## Enforcement

When enforcement is in scope, extend the repository's existing linter so it
rejects both named `useEffect` imports and `React.useEffect(...)` calls. Allow
only the named, reviewed integration-hook files, not a directory such as
`src/hooks/**`; report generic wrappers and their callers as violations to
migrate. Run the same lint surface in the canonical local gate and CI, with
pinned tool versions.

In review, every new direct effect is a finding unless the change documents and
proves a legitimate external-system boundary. Ask for a replacement, not
dependency-array tuning.

## Boundaries

- Leave `useLayoutEffect`, `useInsertionEffect`, framework lifecycle APIs, and
  non-React effect systems alone, including in lint rules, unless requested.
- Credit: adapted from Tyler Gibbs'
  [`useeffect-ban`](https://github.com/tylergibbs1/useeffectban/tree/69d3252c58e33de3c28b3dae504ee13fc40aa137/skills/useeffect-ban)
  (MIT), not vendored. Add its notice here before copying upstream text or code.
