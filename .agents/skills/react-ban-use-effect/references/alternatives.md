# Architecture Alternatives

Use only when replacing an effect exposes a broader ownership problem.

## Server State

Choose the highest existing layer:

1. server component, loader, server function, or framework data API for initial render
2. repository-owned server-state library for interactive client data
3. narrow local async state only when no shared layer exists and adding one is unjustified

For TanStack Query or an equivalent library, preserve query factories, keys,
dependent-query gates, derivation, request cancellation, mutation invalidation,
and optimistic rollback. Do not copy server data into component state merely to
reshape or paginate it.

## Forms and User Actions

Keep work at its cause. Use event handlers, framework or React actions,
repository form primitives, or server-state mutations. Pending, error, and
optimistic UI belongs to the selected action/mutation contract, not a flag that
another effect observes.

## External Stores

Use `useSyncExternalStore` for changing values outside React when a stable
subscribe/snapshot contract exists. This includes browser status, media or
storage state, and stores without first-class React bindings.

## Performance

Fix waterfalls and data ownership before adding memoization. Use parallel async
work, Suspense boundaries, code splitting, deferred values, transitions, or
lazy initialization only when the changed path has measured latency or an
established repository convention.

## Diagnostics

Run repository guardrails first. Use an optional React diagnostic tool only
when repository-owned or explicitly requested; do not introduce `@latest`
commands as durable enforcement. Exercise the changed component or hook and
inspect cleanup, stale closures, request cancellation, pending state, and
dependency correctness.

Primary references:

- [React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React: `useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
