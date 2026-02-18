import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["lib/index.ts"],
  clean: true,
  format: ["esm"],
  dts: true,
});
