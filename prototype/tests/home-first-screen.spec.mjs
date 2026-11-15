// AC-1 (UC-12): first screen contains category, client, problem and CTA, desktop and mobile.
// Added as baseline for the homepage copy rework.
//
// The first screen is the text actually rendered inside the initial viewport: each text
// node whose rendered box has top < innerHeight and bottom > 0. Text under aria-hidden is
// included, since sighted readers see it, but it is also collected separately so a failure
// or a pass that depends only on aria-hidden content is reported.
import { test, expect } from "./helpers.mjs";

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];

// Returns { all, visibleToAT } strings for the first screen.
const firstScreenText = (page) => page.evaluate(() => {
  const all = [];
  const exposed = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el || el.closest("script, style, template, noscript")) continue;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    range.selectNodeContents(node);
    const inView = [...range.getClientRects()].some(
      (r) => r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0 && r.right > 0 && r.left < innerWidth,
    );
    if (!inView) continue;
    all.push(text);
    if (!el.closest("[aria-hidden='true']")) exposed.push(text);
  }
  return { all: all.join(" "), exposed: exposed.join(" ") };
});

const CHECKS = [
  ["category: \"deal message\"", [/deal message/i]],
  ["category: \"before it's sent\" or \"review\"", [/before it['’]s sent|review/i]],
  ["client: transaction-advisory / advisory firm", [/transaction-advisory|advisory firm/i]],
  ["problem: recipient (who ... going to / deal team)", [/(who .* going to|isn['’]t on the deal team|deal team)/i]],
  ["problem: wording (promises / certain / guaranteed wording)", [/(promises|certain|guaranteed wording)/i]],
];

for (const vp of VIEWPORTS) {
  test.describe(`AC-1 first screen at ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    test("category, client, problem and CTA are on the first screen", async ({ page }) => {
      await page.goto("index.html");
      await page.evaluate(() => document.fonts.ready);
      const { all, exposed } = await firstScreenText(page);
      const at = `${vp.width}x${vp.height}`;

      for (const [label, patterns] of CHECKS) {
        for (const re of patterns) {
          const inAll = re.test(all);
          const onlyAriaHidden = inAll && !re.test(exposed);
          if (onlyAriaHidden) {
            test.info().annotations.push({ type: "aria-hidden-only", description: `${at}: ${label}` });
            console.log(`[AC-1 ${at}] ${label}: matched only in aria-hidden content`);
          }
          expect.soft(inAll, `${at}: ${label} missing from first screen (${re})`).toBe(true);
        }
      }

      const cta = page.getByRole("link", { name: "Try the sample review", exact: true });
      const boxes = await cta.evaluateAll((els) => els
        .filter((el) => el.checkVisibility({ opacityProperty: true, visibilityProperty: true }))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0)
        .map((r) => r.top));
      expect.soft(boxes.length, `${at}: visible link "Try the sample review" missing from first screen`).toBeGreaterThan(0);
    });
  });
}
