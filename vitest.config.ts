import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["tests/**/*.spec.ts"],
    coverage: {
      include: [
        "src/modules/customers/domain/**/*.ts",
        "src/modules/customers/application/**/*.ts",
        "src/modules/authentication/application/login/login.usecase.ts",
        "src/modules/reports/application/get-average-execution-time/get-average-execution-time.usecase.ts",
        "src/modules/vehicles/domain/value-objects/vehicle-plate.ts",
        "src/modules/work-orders/domain/**/*.ts",
        "src/modules/reports/domain/**/*.ts",
      ],
      reporter: ["text", "html"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
