# Replacements

Non-obvious details for each replacement. Background:
[You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## Server State

- Initial-render data belongs to server components, loaders, or framework data
  APIs; interactive client data to the repository's server-state layer.
- With TanStack Query, preserve query factories, keys that include variables,
  `enabled` for dependent queries, `select` for derivation, the query
  `signal`, mutation invalidation, and optimistic rollback. Do not copy server
  data into component state to reshape or paginate it.
- Use regular `useQuery` when `enabled` gates, placeholder pagination, or
  cancellation matter; v5 Suspense query hooks do not support every option.

## User Actions

- Extract a function that handlers call directly when behavior is shared; do
  not route it through an effect to avoid a helper.
- `useFormStatus` belongs in a child rendered inside the form. Call
  `useOptimistic` updates from an action or transition.

## Resets

Prefer a keyed boundary (`<Profile key={userId} />`). When only a selection
needs adjusting, store stable IDs and derive the selected object during render.
Setting state during render is a guarded last resort.

## External Systems

Use `useSyncExternalStore` when a component reads a changing browser value or
store with a subscribe/snapshot contract. Otherwise write the domain hook:

```tsx
export function useChatConnection(serverUrl: string, roomId: string) {
  useEffect(() => {
    const connection = connectChat({ serverUrl, roomId });
    connection.open();
    return () => connection.close();
  }, [serverUrl, roomId]);
}
```

Before a mount-only exception, mount the child conditionally so the parent owns
the precondition and the child keeps a dependency-aware hook.

## Slow UI

Replace effects that stage render work with `useDeferredValue`,
`useTransition`, `Suspense`, `Promise.all`, or code splitting, and only for
measured latency or an existing repository convention.
