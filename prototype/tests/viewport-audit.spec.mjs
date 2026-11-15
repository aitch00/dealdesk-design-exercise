// What the viewport audit found (VA1–VA6): controls and focus at short heights and
// odd sizes, beyond the two standard test widths. Each test reproduces one finding.
import { test, expect, openApp } from "./helpers.mjs";

// The element is inside the window and nothing else is drawn over its centre.
const clear = (page, selector) => page.locator(selector).first().evaluate((el) => {
  const r = el.getBoundingClientRect();
  if (r.height === 0 || r.top < 0 || r.bottom > window.innerHeight) return false;
  const at = document.elementFromPoint(r.left + Math.min(r.width / 2, 20), r.top + r.height / 2);
  return el === at || el.contains(at);
});
const focusedClear = (page) => page.evaluate(() => {
  const el = document.activeElement;
  const r = el.getBoundingClientRect();
  if (el === document.body || r.height === 0 || r.top < 0 || r.bottom > window.innerHeight) return false;
  const at = document.elementFromPoint(r.left + Math.min(r.width / 2, 20), r.top + r.height / 2);
  return el === at || el.contains(at);
});

test.describe("phone held sideways, 568 × 320", () => {
  test.use({ viewport: { width: 568, height: 320 }, isMobile: true, hasTouch: true });

  test("VA1 · after a jump the focus is on something visible", async ({ page }) => {
    for (const jump of ["flagged", "pending", "edited-after-approval"]) {
      await openApp(page, `#/jump/${jump}`);
      await expect.poll(() => focusedClear(page), jump).toBe(true);
    }
  });

  test("VA4 · the final review's bar scrolls with it, so there is room to read", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await page.locator('[data-key="review-before-sending"]').click();
    const bar = page.locator(".overlay-mail .mail-bar").first();
    await expect(bar).toBeAttached();
    expect(await bar.evaluate((el) => getComputedStyle(el).position)).toBe("static");
  });
});

test.describe("short phone, 375 × 667", () => {
  test.use({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });

  test("VA1 · edited after approval: the focus is not under the bottom bar", async ({ page }) => {
    await openApp(page, "#/jump/edited-after-approval");
    await expect.poll(() => focusedClear(page)).toBe(true);
  });

  test("VA6 · on the drafts list, Skip to content reaches the list", async ({ page }) => {
    await openApp(page, "#/drafts");
    await page.locator("#skip").focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => Boolean(document.activeElement.closest("#list")))).toBe(true);
  });
});

test.describe("phone, 390 × 844", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("VA2 · turning on the check outage keeps the Simulation sheet where it was", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    await page.locator('[data-key="m2-menu"]').click();
    await page.locator('[data-key="banner-simulation"]').click();
    const sheet = page.locator(".sim-panel");
    await expect(sheet).toBeVisible();
    // Scroll the sheet so the switch is still in view but no longer at the top.
    const before = await sheet.evaluate((el) => {
      const sw = el.querySelector('[data-key="sim-outage"]');
      const head = el.querySelector(".sim-head").offsetHeight;
      el.scrollTop = Math.max(0, sw.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - head - 16);
      return el.scrollTop;
    });
    expect(before).toBeGreaterThan(0);
    await page.locator('[data-key="sim-outage"]').click();
    await expect.poll(() => sheet.evaluate((el) => el.scrollTop)).toBe(before);
    expect(await clear(page, '[data-key="sim-outage"]')).toBe(true);
  });
});

test.describe("short wide screen, 1040 × 600", () => {
  test.use({ viewport: { width: 1040, height: 600 } });

  test("VA3 · while editing, the bar holds Cancel and Save, and the new field is not covered", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    await page.locator('[data-key="edit-message"]').click();
    const confirmEdit = page.locator('[data-key="continue-editing"]');
    if (await confirmEdit.isVisible()) await confirmEdit.click(); // the warning before editing, when there is one
    const bar = page.locator('[data-key="mode-bar"]');
    await expect(bar).toBeVisible();
    await expect(bar.locator('[data-key="review-before-sending"]')).toBeHidden();
    expect((await bar.boundingBox()).height).toBeLessThan(150);
    await page.locator('[data-key="add-recipient"]').click();
    await expect(page.locator('[data-key="add-person"]')).toBeFocused();
    await expect.poll(() => focusedClear(page)).toBe(true);
  });

  test("VA5 · with the final review open, Skip to content goes into the review", async ({ page }) => {
    await openApp(page, "#/jump/ready");
    await page.locator("#skip").focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => Boolean(document.activeElement.closest('[role="dialog"]')))).toBe(true);
  });
});
