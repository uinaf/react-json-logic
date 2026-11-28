import uinaf, { env, ignorePatterns } from "@uinaf/oxlint-config/vite-plus";
import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    outDir: "dist",
  },
  lint: {
    extends: [uinaf],
    env,
    ignorePatterns,
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "anti-slop/require-readable-spacing": "off",
      "typescript/no-non-null-assertion": "off",
      "unicorn/catch-error-name": "off",
      "anti-slop/no-runtime-typeof": "off",
      "anti-slop/require-safety-comment-for-type-assertion": "off",
      "quality/no-known-value-widening": "off",
      "typescript/no-unsafe-type-assertion": "off",
      "typescript/no-unnecessary-type-assertion": "off",
    },
  },
  fmt: {},
});
