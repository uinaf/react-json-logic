# Network Awareness Hook

## Problem/Feature Description

Your React application displays a "You are offline" banner while the browser has no network connection. Create a reusable `useNetworkStatus` hook that components can import to read that state. Consumers must re-render when connectivity changes without managing subscriptions or cleanup themselves.

The codebase follows a strict policy of keeping React components declarative. The team has had problems in the past with effects being misused for things that have cleaner declarative solutions, so there is a preference for reaching for the right React primitive rather than defaulting to a `useState` + manual subscription pattern. When the right primitive is genuinely unavailable, engineers are expected to either use an approved shared wrapper or leave a written explanation of why a lower-level approach is necessary.

## Output Specification

Produce the following files in your working directory:

- `src/hooks/useNetworkStatus.ts` (or `.js`): the custom hook implementation
- `src/components/NetworkBanner.tsx` (or `.jsx`): a small demo component that uses the hook to render an offline notice
- `README.md`: a short explanation of the implementation and why its React primitives fit this problem

Do not generate any build artifacts, bundled output, or files larger than a few kilobytes. The source files are what will be reviewed.
