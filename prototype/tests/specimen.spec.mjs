// The design specimen renders without errors with the shared CSS.
import { test, expect, noHorizontalScroll } from "./helpers.mjs";

for (const width of [1280, 375, 320]) {
  test(`specimen at ${width} px: fonts loaded, no horizontal scrolling`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("design-specimen.html");
    expect(await page.evaluate(async () => (await document.fonts.ready).status)).toBe("loaded");
    expect(await noHorizontalScroll(page)).toBe(true);
  });
}
