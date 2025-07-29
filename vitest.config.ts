import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],

    include: [
      "app/**/*.{test,spec}.{js,ts,tsx}",
      "tests/**/*.{test,spec}.{js,ts,tsx}",
    ],

    exclude: ["node_modules", "build", "public"],

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "build/",
        "public/",
        "app/**/*.d.ts",
        "app/entry.client.tsx",
        "app/entry.server.tsx",
        "app/root.tsx",
        "tests/",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000,
  },

  resolve: {
    alias: {
      "~": new URL("./app", import.meta.url).pathname,
      "@tests": new URL("./tests", import.meta.url).pathname,
    },
  },
});
