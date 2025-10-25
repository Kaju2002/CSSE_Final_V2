import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      all: true,
      exclude: [
        "src/main.tsx",
        "src/main.ts",
        "src/vite*.ts",
        "vite.config.ts",
        "vitest.config.ts",
        "src/storybook/**",
        "src/**/*.story.*",
        "src/**/*.stories.*",
        "src/assets/**",
        "coverage/**",
        "node_modules/**",
        "setupTests.ts",
        "vitest.setup.ts",
        "global.d.ts",
        "src/**/*.d.ts",
      ],
    },
  },
});
