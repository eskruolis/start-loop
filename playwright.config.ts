import { tmpdir } from "node:os"
import { join } from "node:path"
import { defineConfig, devices } from "@playwright/test"

const PORT = 3200
const DATA = join(tmpdir(), "start-loop-e2e")
export const ADMIN_STATE = join(DATA, "admin.json")

/**
 * End-to-end tests walk the app like a person: sign up, click, type, read the screen.
 * They run against a throwaway database in the temp folder, so they never touch real data.
 *
 * Every file Playwright writes while tests run (traces, screenshots, the saved sign-in) goes to the
 * temp folder too: the dev server reloads the page whenever a file inside the project changes, and
 * traces written into ./test-results kept reloading it mid-test.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: join(DATA, "results"),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // Dev servers compile each page on its first visit; the first test of a page needs the room.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: join(DATA, "report") }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "desktop",
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: ADMIN_STATE },
    },
    {
      name: "phone",
      dependencies: ["setup"],
      use: { ...devices["Pixel 7"], storageState: ADMIN_STATE },
    },
  ],
  webServer: {
    command: `rm -rf ${DATA}/postgres && pnpm dev -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      BETTER_AUTH_URL: `http://localhost:${PORT}`,
      BETTER_AUTH_SECRET: "e2e-secret-at-least-32-characters-long!",
      DATA_SOURCE: "postgres",
      // Its own build folder, database and port: runs even while your `pnpm dev` is running.
      NEXT_DIST_DIR: ".next-e2e",
      LOCAL_DB_DIR: join(DATA, "postgres"),
      LOCAL_DB_PORT: "54330",
    },
  },
})
