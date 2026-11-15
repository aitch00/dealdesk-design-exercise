// Keyboard order of the three-column page (decision TC11): banner → list →
// Review notes → draft; every stop shows the focus ring; nothing behind a view
// in the foreground can be reached.
import { test, expect, openApp, WIDE, NARROW } from "./helpers.mjs";

// Presses Tab from the top of the page and records each focused element.
async function tabStops(page, count) {
  // Start from the top of the page: the sequential focus starting point moves to the body.
  await page.evaluate(() => { document.body.tabIndex = -1; document.body.focus(); document.body.removeAttribute("tabindex"); });
  const stops = [];
  for (let i = 0; i < count; i++) {
    await page.keyboard.press("Tab");
    stops.push(await page.evaluate(() => {
      const el = document.activeElement;
      const zone = el.closest("#banner") ? "banner" : el.closest("#list") ? "list" : el.closest("#notes") ? "notes"
        : el.closest("#main") ? "main" : el.closest("#overlay, #owner") ? "overlay" : el.classList.contains("skip-link") ? "skip" : "other";
      return { zone, key: el.dataset.key ?? el.id ?? el.tagName, outline: getComputedStyle(el).outlineStyle };
    }));
  }
  return stops;
}

const firstIndex = (stops, zone) => stops.findIndex((s) => s.zone === zone);

for (const [name, viewport] of [["wide", WIDE], ["narrow", NARROW]]) {
  test.describe(name, () => {
    test.use({ viewport });

    test("Tab goes banner → list → Review notes → draft, with a visible ring on every stop", async ({ page }) => {
      await openApp(page, "#/jump/flagged");
      const stops = await tabStops(page, 40);
      const order = ["skip", "banner", "list", "notes", "main"].filter((z) => firstIndex(stops, z) >= 0);
      const indexes = order.map((z) => firstIndex(stops, z));
      expect(indexes).toEqual([...indexes].sort((a, b) => a - b));
      if (name === "wide") expect(order).toEqual(["skip", "banner", "list", "notes", "main"]);
      // On a narrow screen the list is its own view and the cards sit in the draft (TC10):
      // the verdict above the draft has nothing to press when the state is Blocked.
      else expect(order).toEqual(["skip", "banner", "main"]);
      // The verdict's next step and the first card come before the draft (TC11).
      expect(stops.findIndex((s) => s.key === "card-head-recipient-p-sam")).toBeLessThan(stops.findIndex((s) => s.key === "edit-message"));
      for (const stop of stops.filter((s) => s.zone !== "other")) expect(stop.outline, stop.key).toBe("solid");
    });

    test("with a view in the foreground, Tab and Shift+Tab stay inside it", async ({ page }) => {
      await openApp(page, "#/jump/pending");
      await page.locator('[data-key="answer-as-dana"]').click();
      for (const key of ["Tab", "Shift+Tab"]) {
        for (let i = 0; i < 12; i++) {
          await page.keyboard.press(key);
          expect(await page.evaluate(() => Boolean(document.activeElement.closest("#owner [role=dialog]")))).toBe(true);
        }
      }
    });
  });
}
