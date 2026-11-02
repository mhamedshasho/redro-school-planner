const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { PNG } = require("pngjs");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("ordinary user can edit separate cells without changing neighboring cells", async ({ page }) => {
  const cells = page.locator("#schedule td");
  await cells.nth(0).locator("input").fill("Mathematics");
  await cells.nth(1).locator("input").fill("Science");
  await cells.nth(0).click();
  await page.locator('[data-tab="color"]').click();
  await page.locator('[data-color="#dcecff"]').click();
  await expect(cells.nth(0)).toHaveCSS("background-color", "rgb(220, 236, 255)");
  await expect(cells.nth(1)).not.toHaveCSS("background-color", "rgb(220, 236, 255)");
  await expect(cells.nth(0).locator("input")).toHaveValue("Mathematics");
  await expect(cells.nth(1).locator("input")).toHaveValue("Science");
});

test("subject templates stay inside the selected cell", async ({ page }) => {
  const cells = page.locator("#schedule td");
  await cells.nth(0).click();
  await page.locator('[data-subject="science"]').click();
  await expect(cells.nth(0).locator(".cell-template")).toBeVisible();
  await expect(cells.nth(1).locator(".cell-template")).toHaveCount(0);
  await expect(page.locator(".brand-mark")).toHaveCSS("background-color", "rgb(102, 88, 232)");
});

test("table header color does not recolor the site branding", async ({ page }) => {
  const before = await page.locator(".brand-mark").evaluate(el => getComputedStyle(el).backgroundColor);
  await page.locator("#accent").evaluate(el => {
    el.value = "#ff0000";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const after = await page.locator(".brand-mark").evaluate(el => getComputedStyle(el).backgroundColor);
  expect(after).toBe(before);
  await expect(page.locator("#schedule th").nth(1)).toHaveCSS("background-color", "rgb(255, 0, 0)");
});

test("added rows and columns can be removed without corrupting remaining cells", async ({ page }) => {
  await page.locator("#schedule td").nth(0).locator("input").fill("Keep this");
  await page.locator("#addRow").click();
  await page.locator("#addCol").click();
  await expect(page.locator("#schedule tr")).toHaveCount(8);
  await page.locator("#delRow").click();
  await page.locator("#delCol").click();
  await expect(page.locator("#schedule tr")).toHaveCount(7);
  await expect(page.locator("#schedule td").nth(0).locator("input")).toHaveValue("Keep this");
});

test("saved timetable survives a reload", async ({ page }) => {
  await page.locator("#studentName").fill("QA Student");
  await page.locator("#title").fill("My Weekly Plan");
  await page.locator("#schedule td").nth(0).locator("input").fill("Physics");
  await page.reload();
  await expect(page.locator("#studentName")).toHaveValue("QA Student");
  await expect(page.locator("#title")).toHaveValue("My Weekly Plan");
  await expect(page.locator("#schedule td").nth(0).locator("input")).toHaveValue("Physics");
});

test("PNG export downloads a valid image with the timetable", async ({ page }) => {
  await page.locator("#studentName").fill("QA Student");
  await page.locator("#schedule td").nth(0).locator("input").fill("Physics");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#pngBtn").click();
  const download = await downloadPromise;
  const filePath = path.join(os.tmpdir(), download.suggestedFilename());
  await download.saveAs(filePath);
  const bytes = fs.readFileSync(filePath);
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  const image = PNG.sync.read(bytes);
  expect(image.width).toBeGreaterThan(500);
  expect(image.height).toBeGreaterThan(300);
  fs.unlinkSync(filePath);
});

test("PDF print output is generated with the timetable visible", async ({ page }) => {
  await page.locator("#schedule td").nth(0).locator("input").fill("PDF QA Check");
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  expect(pdf.length).toBeGreaterThan(1000);
});

test("preview opens and closes without losing timetable data", async ({ page }) => {
  await page.locator("#schedule td").nth(0).locator("input").fill("English");
  await page.locator("#previewBtn").click();
  await expect(page.locator(".preview-modal")).toBeVisible();
  await expect(page.locator(".preview-table")).toContainText("English");
  await page.getByRole("button", { name: "إغلاق المعاينة" }).click();
  await expect(page.locator(".preview-modal")).toHaveCount(0);
  await expect(page.locator("#schedule td").nth(0).locator("input")).toHaveValue("English");
});
