// axe-core on every view in its main states. axe is injected by the test from
// node_modules; the pages never load it. WCAG 2.2 A and AA rules, zero violations.
import { createRequire } from "node:module";
import { test, expect, openApp, WIDE, NARROW, bannerControl, openMenu } from "./helpers.mjs";
import { openSimulation, runCheck, reword, openCard } from "./a2-helpers.mjs";

const AXE = createRequire(import.meta.url).resolve("axe-core/axe.min.js");

async function axe(page) {
  await page.addScriptTag({ path: AXE });
  const violations = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    });
    // A target that the page has scrolled under a fixed bar of the mobile layout is
    // counted by axe as a target too small. That is where the page stands, not the
    // target's size, which tests/a11y-audit.mjs measures on its own (MB14, MB16).
    const bars = [...document.querySelectorAll("#banner, .mail-bar, .m2-top")]
      .filter((el) => ["sticky", "fixed"].includes(getComputedStyle(el).position))
      .map((el) => el.getBoundingClientRect());
    const underBar = (sel) => {
      const r = document.querySelector(sel)?.getBoundingClientRect();
      return r && bars.some((b) => r.bottom > b.top && r.top < b.bottom && r.right > b.left && r.left < b.right);
    };
    return result.violations
      .map((v) => ({ ...v, nodes: v.id === "target-size" ? v.nodes.filter((n) => !underBar(n.target.join(" "))) : v.nodes }))
      .filter((v) => v.nodes.length)
      .map((v) => ({ id: v.id, impact: v.impact, targets: v.nodes.map((n) => n.target.join(" ")) }));
  });
  return violations.map((v) => `${v.id} (${v.impact}): ${v.targets.join(", ")}`);
}

const STATES = [
  ["H · homepage", async (page) => { await page.goto("index.html"); }],
  ["A1 · drafts", async (page) => openApp(page)],
  ["A1 · static draft", async (page) => openApp(page, "#/drafts/draft-harrow-kickoff")],
  ["A2 · seed", async (page) => openApp(page, "#/drafts/harbor")],
  ["A2 · waiting for decision", async (page) => openApp(page, "#/jump/pending")],
  ["A2 · review unavailable", async (page) => openApp(page, "#/jump/review-unavailable")],
  ["A2 · approval outdated", async (page) => { await openApp(page, "#/jump/edited-after-approval"); await runCheck(page); }],
  ["A2 · sentence editor", async (page) => {
    await openApp(page, "#/drafts/harbor");
    await openCard(page, "wording:guaranteed-completion");
    await page.locator('[data-key="edit-sentence-2"]').click();
  }],
  ["A2 · next step marked", async (page) => { await openApp(page, "#/drafts/harbor"); await page.locator('[data-key="remove-p-sam"]').click(); await reword(page, 2); }],
  ["Owner · decision in the foreground", async (page) => { await openApp(page, "#/jump/pending"); await page.locator('[data-key="answer-as-dana"]').click(); }],
  ["A2 · edit mode", async (page) => {
    await openApp(page, "#/drafts/harbor");
    await page.locator('[data-key="edit-message"]').click();
    await page.locator('[data-key="add-recipient"]').click();
  }],
  ["A2 · P1 open with an error", async (page) => {
    await openApp(page, "#/drafts/harbor");
    await page.locator('[data-key="request-recipient:p-sam"]').click();
    await page.locator('[data-key="p1-send"]').click();
  }],
  ["A3 · can't send yet", async (page) => { await openApp(page, "#/jump/pending"); await openApp(page, "#/drafts/harbor/review"); }],
  ["A3 · can send", async (page) => openApp(page, "#/jump/ready")],
  ["A4 · record with the sent message", async (page) => openApp(page, "#/jump/sent")],
  ["B · restart confirmation", async (page) => { await openApp(page); await (await bannerControl(page, "banner-restart")).click(); }],
  ["B · the mobile menu, or the banner on a wide screen (MB1)", async (page) => { await openApp(page, "#/jump/pending"); await openMenu(page); }],
];

for (const [width, viewport] of [["1280", WIDE], ["375", NARROW]]) {
  test.describe(`at ${width} px`, () => {
    test.use({ viewport });
    for (const [name, open] of STATES) {
      test(name, async ({ page }) => {
        await open(page);
        expect(await axe(page)).toEqual([]);
      });
    }
    test("P2 open with a request waiting", async ({ page }) => {
      await openApp(page, "#/jump/pending");
      await openSimulation(page);
      expect(await axe(page)).toEqual([]);
    });
  });
}

test("axe reports a known violation (the check is not vacuous)", async ({ page }) => {
  await page.setContent('<html lang="en"><body><main><button></button></main></body></html>');
  expect((await axe(page)).join(" ")).toContain("button-name");
});

// The accessibility pass (decisions A11Y1–A11Y5): best-practice rules once the sheets
// have arrived, 24 px targets, and edges that survive forced colours.
async function axeAll(page) {
  await page.addScriptTag({ path: AXE });
  return page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] } }))
    .violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`));
}
const settle = (page) => page.waitForTimeout(700);

test.describe("accessibility pass", () => {
  for (const [width, viewport] of [["1280", WIDE], ["375", NARROW]]) {
    test(`A11Y1 · A11Y2 · A11Y5 · best practice holds with the sheets in place, at ${width} px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openApp(page, "#/start"); await settle(page);
      expect(await axeAll(page), "drafts").toEqual([]);
      await openApp(page, "#/jump/flagged");
      await page.locator('[data-key="request-recipient:p-sam"]').click(); await settle(page);
      expect(await axeAll(page), "request sheet").toEqual([]);
      await openApp(page, "#/jump/ready"); await settle(page);
      expect(await axeAll(page), "final review").toEqual([]);
    });
  }

  test("A11Y3 · every target on a narrow screen is at least 24 px", async ({ page }) => {
    await page.setViewportSize(NARROW);
    for (const hash of ["#/start", "#/jump/pending", "#/jump/review-unavailable"]) {
      await openApp(page, hash);
      const small = await page.evaluate(() => [...document.querySelectorAll("a[href], button, summary, input")]
        .filter((el) => { const r = el.getBoundingClientRect(); const inline = el.tagName === "A" && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); return r.width > 0 && !inline && !el.closest(".visually-hidden") && (r.height < 24 || r.width < 24); })
        .map((el) => el.dataset.key || el.textContent.trim().slice(0, 20)));
      expect(small, hash).toEqual([]);
    }
  });

  test("A11Y4 · under forced colours the draft, the notes and a sheet laid on the draft keep an edge", async ({ browser }) => {
    const page = await browser.newPage({ viewport: WIDE, forcedColors: "active", baseURL: test.info().project.use.baseURL });
    await openApp(page, "#/jump/flagged");
    await page.locator('[data-key="request-recipient:p-sam"]').click();
    const width = (sel) => page.locator(sel).evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));
    expect(await width("#main .mail")).toBeGreaterThanOrEqual(1);
    expect(await width(".notes-slot > .notes")).toBeGreaterThanOrEqual(1);
    expect(await width(".overlay-mail")).toBeGreaterThanOrEqual(2);
    // Only the open draft is framed: the other rows' border is the canvas, not the frame colour.
    const border = (sel) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(await border(".list-item:not([aria-current])")).not.toBe(await border('.list-item[aria-current="page"]'));
    await page.close();
  });
});
