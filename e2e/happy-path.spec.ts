import { test, expect } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test("happy path with data", async ({ page }) => {
  test.skip(!email || !password, "Set E2E_EMAIL and E2E_PASSWORD to run happy path");

  await page.goto("/");
  await page.getByPlaceholder("Email").fill(email as string);
  await page.getByPlaceholder("Password").fill(password as string);
  await page.getByText("Dang nhap").click();

  await expect(page.getByText("Thanh vien")).toBeVisible();

  await page.getByText("+ Nhom Gia dinh").click();
  await expect(page.getByText("Da tao nhom Gia dinh")).toBeVisible();

  await page.getByLabel("Add Person").click();
  await page.getByLabel("Person Full Name").fill("Nguoi A");
  await page.getByLabel("Person Relationship").fill("Ban than");
  await page.getByText("Luu").click();
  await expect(page.getByText("Da them thanh vien")).toBeVisible();

  await page.getByLabel("Add Person").click();
  await page.getByLabel("Person Full Name").fill("Nguoi B");
  await page.getByLabel("Person Relationship").fill("Ban");
  await page.getByText("Luu").click();

  await page.getByLabel("Add Relationship").click();
  const source = page.getByLabel("Relationship Source");
  const target = page.getByLabel("Relationship Target");
  await source.selectOption({ label: "Nguoi A" });
  await target.selectOption({ label: "Nguoi B" });
  await page.getByLabel("Relationship Type").selectOption("friend");
  await page.getByText("Luu quan he").click();
  await expect(page.getByText("Da them quan he")).toBeVisible();

  await page.getByLabel("Add Event").click();
  await page.getByLabel("Event Title").fill("Sinh nhat A");
  await page.getByLabel("Event Date").fill("2026-12-12");
  await page.getByLabel("Event Recurrence").selectOption("yearly");
  await page.getByLabel("Event Person").selectOption({ label: "Nguoi A" });
  await page.getByText("Luu su kien").click();
  await expect(page.getByText("Da them su kien")).toBeVisible();
});
