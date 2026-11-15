// Shared helpers for the prototype's browser tests.
import { test as base, expect } from "@playwright/test";

// Every test fails if a page logs an error to the console.
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    await use(page);
    expect(errors, "console errors").toEqual([]);
  },
});
export { expect };

export const NARROW = { width: 375, height: 800 };
export const WIDE = { width: 1280, height: 900 };

// Opens app.html at a hash and waits for the first render.
export async function openApp(page, hash = "#/drafts") {
  // a full load each time, so a hash-only change cannot race the first render
  await page.goto("about:blank");
  await page.goto(`app.html${hash}`);
  await page.waitForSelector("body[data-ready]");
}

export const focused = (page) => page.evaluate(() => {
  const el = document.activeElement;
  return { tag: el.tagName.toLowerCase(), text: el.textContent.replace(/\s+/g, " ").trim(), key: el.dataset.key ?? null }; // the separator binds with a no-break space (GA5)
});

// Focus moves after an asynchronous render: wait for it rather than for a fixed time.
export async function expectFocus(page, expected) {
  await expect.poll(() => focused(page)).toMatchObject(expected);
}

export const noHorizontalScroll = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

// The mobile layout (MB1–MB6): on narrow screens the banner's buttons are in the menu.
export const isNarrow = (page) => page.evaluate(() => document.body.classList.contains("m2"));
export async function openMenu(page) {
  const menu = page.locator('[data-key="m2-menu"]');
  if (await menu.count() && (await menu.getAttribute("aria-expanded")) !== "true") await menu.click();
}
// A control of the banner: on narrow screens it is reached through the menu.
export async function bannerControl(page, key) {
  if (await isNarrow(page)) await openMenu(page);
  return page.locator(`[data-key="${key}"]`);
}
// The way back to the list: the top bar on narrow screens (MB1).
export async function backToDrafts(page) {
  if (await isNarrow(page)) await page.locator('[data-key="m2-back"]').click();
  else await page.locator('[data-key="back-to-drafts"]').click();
}
// The way back from the final review: its own top bar on narrow screens (MB4).
export const backToDraftKey = async (page) => ((await isNarrow(page)) ? "back-to-draft-top" : "back-to-draft");
export const p1CancelKey = async (page) => ((await isNarrow(page)) ? "p1-cancel-top" : "p1-cancel");
