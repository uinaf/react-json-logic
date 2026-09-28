# Stop useEffect creep

Coding agents keep adding `useEffect` all over our React app and reviewers keep
missing it. I want this caught mechanically so new ones can't land. The only
effect code I actually trust is the chat socket hook.

Make the change in this checkout and write `guardrail-notes.md` saying what you
changed, what it now reports in the existing code, and how you checked it.
Don't push, open a PR, or change anything outside this directory.

## Input Files

=============== FILE: package.json ===============
{
  "name": "@acme/web",
  "private": true,
  "type": "module",
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "verify": "pnpm lint && pnpm typecheck && pnpm test"
  },
  "dependencies": { "react": "^19.1.0", "react-dom": "^19.1.0" },
  "devDependencies": {
    "@eslint/js": "^9.30.0",
    "eslint": "^9.30.0",
    "eslint-plugin-react-hooks": "^6.1.0",
    "typescript": "^5.9.0",
    "typescript-eslint": "^8.40.0",
    "vitest": "^3.2.0"
  }
}
=============== END FILE ===============

=============== FILE: eslint.config.js ===============
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["dist/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
=============== END FILE ===============

=============== FILE: .nvmrc ===============
22
=============== END FILE ===============

=============== FILE: .github/workflows/ci.yml ===============
name: CI
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
        with: { node-version-file: .nvmrc, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm run verify
=============== END FILE ===============

=============== FILE: src/chat/connectChat.ts ===============
export type ChatConnection = { open(): void; close(): void };

export function connectChat(input: { serverUrl: string; roomId: string }): ChatConnection {
  throw new Error(`runtime implementation omitted for ${input.serverUrl}/${input.roomId}`);
}
=============== END FILE ===============

=============== FILE: src/hooks/useChatConnection.ts ===============
import { useEffect } from "react";
import { connectChat } from "../chat/connectChat";

export function useChatConnection(serverUrl: string, roomId: string) {
  useEffect(() => {
    const connection = connectChat({ serverUrl, roomId });
    connection.open();
    return () => connection.close();
  }, [serverUrl, roomId]);
}
=============== END FILE ===============

=============== FILE: src/hooks/useUpdateEffect.ts ===============
import { useEffect, useRef, type DependencyList, type EffectCallback } from "react";

// Runs the effect on updates only, skipping the first render.
export function useUpdateEffect(effect: EffectCallback, deps: DependencyList) {
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
=============== END FILE ===============

=============== FILE: src/components/Dashboard.tsx ===============
import * as React from "react";

export function Dashboard({ rows }: { rows: Array<{ id: string; done: boolean }> }) {
  const [openCount, setOpenCount] = React.useState(0);
  React.useEffect(() => {
    setOpenCount(rows.filter((row) => !row.done).length);
  }, [rows]);
  return <p>{openCount} open</p>;
}
=============== END FILE ===============

=============== FILE: src/components/Settings.tsx ===============
import { useState } from "react";
import { useUpdateEffect } from "../hooks/useUpdateEffect";

export function Settings({ onChange }: { onChange: (theme: string) => void }) {
  const [theme, setTheme] = useState("light");
  useUpdateEffect(() => onChange(theme), [theme]);
  return (
    <select value={theme} onChange={(event) => setTheme(event.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
=============== END FILE ===============

=============== FILE: src/signals/cartEffects.ts ===============
type EffectScope = { useEffect(run: () => void): () => void };

export function watchCart(effects: EffectScope, onChange: () => void) {
  return effects.useEffect(onChange);
}
=============== END FILE ===============

=============== FILE: src/components/Tooltip.tsx ===============
import { useLayoutEffect, useRef, useState } from "react";

export function Tooltip({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    setWidth(ref.current?.getBoundingClientRect().width ?? 0);
  }, [label]);
  return <span ref={ref} data-width={width}>{label}</span>;
}
=============== END FILE ===============
