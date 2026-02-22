import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["lib/index.ts"],
    inlineOnly: false,
  },
  {
    entry: ["lib/generator.ts"],
    inlineOnly: false,
  },
]);
