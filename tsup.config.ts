import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/runtime/index.ts", "src/cli/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  outDir: "dist",
  target: "node18",
  shims: true,
});
