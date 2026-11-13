import { expect, test as setup } from "@playwright/test"
import { ADMIN_STATE } from "../playwright.config"

/**
 * Runs once before the other tests: creates the first account (so it is the admin) and saves its
 * sign-in, which every test then reuses (`storageState` in playwright.config.ts).
 */
setup("create the admin account", async ({ page }) => {
  // The first page of a fresh dev server compiles on demand: give it time.
  setup.setTimeout(120_000)
  await page.goto("/sign-up")
  await page.getByLabel("Name").fill("E2E Admin")
  await page.getByLabel("Email").fill("admin@example.test")
  await page.getByLabel("Password").fill(`e2e-${Date.now()}-password`)
  await page.getByRole("button", { name: "Create account" }).click()
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  await page.context().storageState({ path: ADMIN_STATE })
})
