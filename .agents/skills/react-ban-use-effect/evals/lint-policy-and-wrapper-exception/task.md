# Enforce the No Direct useEffect Policy

## Problem/Feature Description

A React repository wants to enforce the no-direct-`useEffect` policy. It uses ESLint flat config and already has a shared `src/hooks/` directory. Add a policy that blocks direct `useEffect` imports and `React.useEffect(...)` namespace calls in application code, while allowing one reviewed domain-specific hook for its chat connection.

The hook must call the existing `connectChat({ serverUrl, roomId })` API, open the returned connection, close it during cleanup, and reconnect when either `serverUrl` or `roomId` changes. Do not add a generic effect-callback wrapper, accept a dependency array from callers, or suppress exhaustive-deps.

Do not disable hooks linting globally. Do not block unrelated APIs like `useLayoutEffect` unless asked.

## Output Specification

Produce:

- `eslint.config.ts` with the policy
- `src/hooks/useChatConnection.ts` as the allowed external-integration hook
- `policy-report.md` explaining the enforcement boundary and verification

## Input Files

=============== FILE: eslint.config.ts ===============
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
=============== END FILE ===============

=============== FILE: src/chat/connectChat.ts ===============
export type ChatConnection = {
  open(): void;
  close(): void;
};

export function connectChat(input: { serverUrl: string; roomId: string }): ChatConnection {
  throw new Error(`runtime implementation omitted for ${input.serverUrl}/${input.roomId}`);
}
=============== END FILE ===============
