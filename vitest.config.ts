import { defineConfig } from "vitest/config";

const coreTestPath = "./src/_core/tests/setup.ts";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
        setupFiles: [coreTestPath],
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
            reportsDirectory: "./coverage",
            thresholds: {
                lines: 80,      // fail if <80% lines covered
                functions: 80,  // fail if <80% functions covered
                branches: 70,   // branches usually harder, allow slightly lower
                statements: 80,
            },
        },
    }
});
