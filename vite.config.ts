import { defineConfig } from "vitest/config";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      ssr: false, // This makes it a SPA for static hosting
    }),
    tsconfigPaths(),
  ],

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
