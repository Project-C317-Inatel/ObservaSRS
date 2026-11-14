import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  outputDir: "test-results/e2e",
  webServer: [
    {
      command: "npm run dev",
      cwd: "backend",
      url: "http://localhost:3333/status",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: "test",
        PORT: "3333",
        CORS_ORIGIN: "http://localhost:5173",
        DATABASE_URL:
          process.env.DATABASE_URL ??
          "postgresql://postgres:postgres@127.0.0.1:5433/observasrs",
        JWT_SECRET:
          process.env.JWT_SECRET ??
          "chave-exclusiva-do-ambiente-e2e-com-mais-de-32-caracteres",
        RELATORIOS_STORAGE_DIR:
          process.env.RELATORIOS_STORAGE_DIR ?? "storage/e2e-relatorios",
      },
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",
      cwd: "frontend",
      url: "http://localhost:5173",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_API_URL: process.env.VITE_API_URL ?? "http://localhost:3333",
        VITE_USE_MOCKS: "false",
      },
    },
  ],
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
