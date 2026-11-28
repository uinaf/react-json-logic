import uinaf, { env, ignorePatterns } from "@uinaf/oxlint-config/vite-plus";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: {
      generator: "tsgo",
    },
    exports: true,
  },
  lint: {
    extends: [uinaf],
    env,
    ignorePatterns,
    options: {
      typeAware: true,
      typeCheck: true,
    },
    overrides: [{ files: ["src/builder.ts"], rules: { "uinaf/no-comments": "off" } }],
    rules: {
      "anti-slop/require-safety-comment-for-type-assertion": "off",
      "quality/no-chained-type-assertions": "off",
      "quality/no-unsafe-dictionary-type": "off",
      "quality/no-known-value-widening": "off",
      "anti-slop/no-unknown-parameters": "off",
      "anti-slop/no-runtime-typeof": "off",
      "react/refs": "off",
      "no-console": "off",
      "quality/no-unknown-returns": "off",
      "typescript/no-unsafe-assignment": "off",
      "typescript/no-unsafe-argument": "off",
      "typescript/no-unsafe-type-assertion": "off",
      "typescript/no-unsafe-return": "off",
    },
  },
  fmt: {},
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/index.ts"],
      thresholds: {
        lines: 97,
        functions: 95,
        branches: 90,
        statements: 97,
      },
    },
  },
});
