import { test, expect } from "@playwright/test";

test("home page responds", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Relationship Memory|Create Next App/i);
});
