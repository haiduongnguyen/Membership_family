import { test, expect } from "@playwright/test";

test("home screen loads key UI", async ({ page }) => {
  await page.goto("/");
  const authVisible = await page.getByPlaceholder("Email").isVisible().catch(() => false);
  if (authVisible) {
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(page.getByText("Dang nhap")).toBeVisible();
  } else {
    await expect(page.getByText("Thanh vien")).toBeVisible();
  }
});
