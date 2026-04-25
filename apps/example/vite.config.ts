import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve the workspace library to its TypeScript source so the demo
      // tracks the latest code without needing a prior `vp pack` build. The
      // published library is built independently for npm consumers.
      "react-json-logic": fileURLToPath(
        new URL("../../packages/react-json-logic/src/index.ts", import.meta.url),
      ),
    },
  },
  build: {
    outDir: "dist",
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
