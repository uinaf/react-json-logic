---
name: react-ban-use-effect
description: "Review or replace React useEffect calls, or enforce a no-direct-effect policy. Use for effect implementation, refactoring, or lint policy; excludes unrelated React work and non-React effect systems."
---

# React Ban useEffect

Direct `useEffect` is an external-synchronization escape hatch. Components do
not call it; a reviewed, domain-specific hook for a real external system may.

## Scope

Effect replacement changes the touched behavior. Repository-wide lint
enforcement is a separate task: apply it when requested or required by existing
repository policy. A review request produces findings; an implementation
request authorizes in-scope replacements and verification without another
approval checkpoint.

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
or cleanup reads. The component calling it stays effect-free. Prefer an
existing repository hook.

Never:

- write a generic wrapper that takes a callback and a caller-provided
  dependency array (`useUpdateEffect(fn, deps)`, `useAsyncEffect(fn, deps)`,
  `useMountEffect(fn)`);
- suppress `react-hooks/exhaustive-deps`;
- use an exception hook to fetch server state, copy props into state, relay
  user actions, or hide a reset that belongs at a keyed boundary.

## Enforcement

When enforcement is in scope, extend the repository's existing linter so it
rejects both named `useEffect` imports and `React.useEffect(...)` calls. Allow
only the named, reviewed integration-hook files, never a directory such as
`src/hooks/**`, and never a generic wrapper; report the wrapper and its callers
as violations to migrate. Keep the canonical local gate and CI on that same lint
surface; agent guidance or optional scanners do not replace it. Do not use
`@latest` diagnostic tools as durable enforcement.

In review, every new direct effect is a finding unless the change documents and
proves a legitimate external-system boundary. Ask for a replacement, not
dependency-array tuning.

## Boundaries

- Scope migrations to the touched or requested surface.
- Leave `useLayoutEffect`, `useInsertionEffect`, framework lifecycle APIs, and
  non-React effect systems alone, including in lint rules, unless requested.
- Apply performance primitives only for measured behavior or an established
  repository pattern.
- Upstream attribution: [upstream](references/upstream.md).
