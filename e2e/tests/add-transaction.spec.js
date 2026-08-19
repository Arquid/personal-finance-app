const { test, expect } = require("@playwright/test");

const API_URL = "http://localhost:4000/api";

let accountId;
let accountName;

test.beforeAll(async ({ request }) => {
  accountName = `E2E Test Account ${Date.now()}`;
  const res = await request.post(`${API_URL}/accounts`, {
    data: { name: accountName, type: "checking", balance: 0 },
  });
  const account = await res.json();
  accountId = account.id;
});

test.afterAll(async ({ request }) => {
  if (accountId) {
    // Cascades to delete any transactions created against this account too.
    await request.delete(`${API_URL}/accounts/${accountId}`);
  }
});

test("adding a transaction shows it in the transactions table", async ({ page }) => {
  await page.goto("/transactions");

  await page.getByRole("button", { name: "+ Add Transaction" }).click();

  await page.getByLabel("Amount").fill("42.50");
  await page.getByLabel("Description").fill("E2E Test Purchase");
  await page.getByLabel("Account").selectOption({ label: accountName });

  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expect(page.getByText("E2E Test Purchase")).toBeVisible();
  await expect(page.getByText("-$42.50")).toBeVisible();
});