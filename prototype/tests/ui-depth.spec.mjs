// Depth on wide screens (decisions DP1–DP6): three planes of one height, sheets
// of the draft's size laid on it, the draft rising for the final review.
import { test, expect, openApp, WIDE } from "./helpers.mjs";

const box = async (loc) => loc.boundingBox();
const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;

test.use({ viewport: WIDE });

test("DP3 · the draft and the notes share one height; the page does not scroll; the action bar sits at the bottom", async ({ page }) => {
  await openApp(page, "#/jump/flagged");
  const [draft, notes, bar] = [await box(page.locator("#main .mail")), await box(page.locator(".notes-slot > .notes")), await box(page.locator("#main .mail > .mail-bar"))];
  expect(near(draft.y, notes.y) && near(draft.height, notes.height)).toBe(true);
  expect(near(bar.y + bar.height, draft.y + draft.height)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  // The notes are apart from the draft, and a tone darker (lighter is closer).
  expect(notes.x).toBeGreaterThan(draft.x + draft.width);
  const bg = (sel) => page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(await bg(".notes-slot > .notes")).toBe("rgb(249, 248, 245)");
  expect(await bg("#main .mail")).toBe("rgb(255, 255, 255)");
});

test("DP4 · the exception request is a sheet of the draft's size, laid 12px down and right; it leaves upwards when sent", async ({ page }) => {
  await openApp(page, "#/jump/flagged");
  const draft = await box(page.locator("#main .mail"));
  await page.locator('[data-key="request-recipient:p-sam"]').click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await page.waitForTimeout(400); // the sheet has arrived
  const s = await box(sheet);
  expect(near(s.width, draft.width) && near(s.height, draft.height)).toBe(true);
  expect(near(s.x - draft.x, 12) && near(s.y - draft.y, 12)).toBe(true);
  await page.locator("#p1-reason").fill("Sam joins the integration workstream next week.");
  await page.locator('[data-key="p1-send"]').click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".sheet-ghost.is-out-up")).toHaveCount(1);
  await expect(page.locator(".sheet-ghost")).toHaveCount(0);
});

test("DP5 · the final review is the draft risen in its place; the notes stay readable, the list steps back", async ({ page }) => {
  await openApp(page, "#/jump/ready");
  const review = page.getByRole("dialog");
  await expect(review).toBeVisible();
  await page.waitForTimeout(400);
  const [r, d] = [await box(review), await box(page.locator("#main .mail"))];
  expect(near(r.x, d.x) && near(r.width, d.width) && near(r.height, d.height)).toBe(true);
  expect(near(d.y - r.y, 4)).toBe(true);
  const opacity = (sel) => page.locator(sel).evaluate((el) => getComputedStyle(el).opacity);
  expect(await opacity(".notes-slot")).toBe("1");
  expect(await opacity(".list-slot")).toBe("0.4");
});
