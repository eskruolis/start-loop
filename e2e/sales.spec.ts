import { expect, test } from "@playwright/test"

/**
 * The main flow, done the way a person does it: open Sales, add a sale through the form, find it,
 * change it, delete it. Signed in as the admin (e2e/auth.setup.ts); runs on a desktop and a phone
 * screen (playwright.config.ts).
 */
const unique = () => Math.random().toString(36).slice(2, 8)

test("a sale can be added, found, edited and deleted", async ({ page }) => {
  await page.goto("/sales")
  await expect(page.getByRole("heading", { name: "Sales" })).toBeVisible()

  const customer = `Customer ${unique()}`
  await page.getByRole("button", { name: "New sale" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Customer *").fill(customer)
  await dialog.getByLabel("Product *").fill("Standing desk")
  await dialog.getByLabel("Category").fill("Furniture")
  await dialog.getByLabel("Total *").fill("1.234,50")
  await dialog.getByRole("button", { name: "Add sale" }).click()
  await expect(page.getByText("Sale added")).toBeVisible()
  await expect(dialog).toBeHidden()

  // Search narrows the list, and the URL keeps the search.
  await page.getByRole("searchbox").fill(customer)
  await expect(page).toHaveURL(/q=Customer/)
  const row = page.getByRole("row").filter({ hasText: customer })
  await expect(row).toHaveCount(1)
  await expect(row).toContainText("€1,234.50")

  // Edit: change the status.
  await row.getByRole("button", { name: /^Edit / }).click()
  await page.getByRole("dialog").getByLabel("Status *").click()
  await page.getByRole("option", { name: "Paid" }).click()
  await page.getByRole("button", { name: "Save changes" }).click()
  await expect(page.getByText("Sale updated")).toBeVisible()

  // Delete asks first, then the list is empty for this search.
  await row.getByRole("button", { name: /^Delete / }).click()
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click()
  await expect(page.getByText("Sale deleted")).toBeVisible()
  await expect(page.getByText("No sales match")).toBeVisible()
})

test("the form explains what is missing", async ({ page }) => {
  await page.goto("/sales")
  await page.getByRole("button", { name: "New sale" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Add sale" }).click()
  await expect(page.getByRole("dialog").getByText("Required").first()).toBeVisible()
  await expect(page.getByRole("dialog").getByText("Enter an amount")).toBeVisible()
})

test.describe("signed out", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("visitors are sent to sign in", async ({ page }) => {
    await page.goto("/sales")
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fsales/)
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
  })

  test("a member cannot delete (the server refuses)", async ({ page }) => {
    await page.goto("/sign-up")
    await page.getByLabel("Name").fill("E2E Member")
    await page.getByLabel("Email").fill(`member-${unique()}@example.test`)
    await page.getByLabel("Password").fill(`e2e-${unique()}-${unique()}`)
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()

    await page.goto("/sales")
    await page.getByRole("button", { name: "New sale" }).click()
    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("Customer *").fill(`Member sale ${unique()}`)
    await dialog.getByLabel("Product *").fill("Chair")
    await dialog.getByLabel("Total *").fill("10")
    await dialog.getByRole("button", { name: "Add sale" }).click()
    await expect(page.getByText("Sale added")).toBeVisible()

    await page
      .getByRole("button", { name: /^Delete Member sale/ })
      .first()
      .click()
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click()
    await expect(page.getByText("Only an admin can do this.")).toBeVisible()
  })
})
