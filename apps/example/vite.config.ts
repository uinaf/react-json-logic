import { defineConfig } from "vite-plus";

export default defineConfig({
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
