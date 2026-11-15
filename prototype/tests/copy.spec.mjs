// The copy on screen: every visible state label is a term of product-language.md,
// and every visible text has a source (data-source on it or an ancestor).
import { test, expect, openApp, WIDE } from "./helpers.mjs";
import { runCheck, decideAsDana } from "./a2-helpers.mjs";

test.use({ viewport: WIDE });

async function productTerms(request) {
  const text = await (await request.get("../docs/2-product/product-language.md")).text();
  return [...new Set([...text.matchAll(/^\|[^\n]*?\*\*([^*]+)\*\*/gm)].map((m) => m[1]))];
}

// The state labels the views show: the first part of the state phrase and of
// Harbor's status in the list, and the state words on the cards.
const visibleLabels = (page) => page.evaluate(() => {
  const first = (el) => el.textContent.trim().split(/\s·\s/)[0];
  const labels = [];
  document.querySelectorAll('[data-key="phrase"], [data-key="harbor-status"]').forEach((el) => labels.push(first(el)));
  // Cards (TC4): the type of a collapsed card, the words in an open one.
  document.querySelectorAll(".card-body strong, .card-body .label-word, .card-type > span:first-child").forEach((el) => labels.push(first(el)));
  return labels.filter(Boolean);
});

// Text nodes with words that have no data-source on them or on an ancestor.
const unsourced = (page) => page.evaluate(() => {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent.trim();
    if (!/[A-Za-z0-9]/.test(text)) continue; // separators and punctuation
    const el = node.parentElement;
    if (el.closest("script, style, svg, .visually-hidden:empty, title")) continue;
    if (!el.getClientRects().length) continue; // not rendered
    if (!el.closest("[data-source]")) out.push(text.slice(0, 60));
  }
  return out;
});

const STATES = [
  ["seed", "#/drafts/harbor"],
  ["pending", "#/jump/pending"],
  ["edited after approval", "#/jump/edited-after-approval"],
  ["review unavailable", "#/jump/review-unavailable"],
  ["ready, final review", "#/jump/ready"],
  ["sent, record", "#/jump/sent"],
  ["drafts list", "#/drafts"],
];

test("every visible state label is a term of product-language.md", async ({ page, request }) => {
  const terms = await productTerms(request);
  expect(terms).toEqual(expect.arrayContaining(["Blocked", "Pending", "Outdated", "Needs a new check", "Not on the deal team"]));
  const seen = new Set();
  const check = async () => {
    for (const label of await visibleLabels(page)) {
      // Harbor's status in the list while a request waits is A1's own sentence (UC-01 § 9).
      if (/^Waiting for Dana Whitfield since \d\d:\d\d$/.test(label)) continue;
      // A removed recipient's card says what happened, not a state ("Removed · The next check confirms it", UR7).
      if (label === "Removed") continue;
      seen.add(label);
      expect(terms.some((term) => label.startsWith(term)), `"${label}" is not in product-language.md`).toBe(true);
    }
  };
  for (const [, hash] of STATES) {
    await openApp(page, hash);
    await check();
  }
  await openApp(page, "#/jump/edited-after-approval");
  await runCheck(page);
  await check();
  await openApp(page, "#/jump/pending");
  await decideAsDana(page, "declined", "Sam isn't cleared for Harbor.");
  await check();
  expect([...seen]).toEqual(expect.arrayContaining(["Blocked", "Waiting for decision", "Needs a new check",
    "Check unavailable", "Pending", "Declined", "Approved on version 2", "Not on the deal team", "Blocking", "Warning"]));
});

test("the label check rejects a label outside product-language.md", async ({ request }) => {
  const terms = await productTerms(request);
  expect(terms.some((term) => "Almost ready".startsWith(term))).toBe(false);
});

test("every visible text on the homepage and in the app has a source", async ({ page }) => {
  await page.goto("index.html");
  expect(await unsourced(page)).toEqual([]);
  for (const [, hash] of STATES) {
    await openApp(page, hash);
    expect(await unsourced(page), hash).toEqual([]);
  }
  await page.evaluate(() => localStorage.clear());
  await openApp(page, "#/drafts/harbor");
  await page.locator('[data-key="request-recipient:p-sam"]').click();
  expect(await unsourced(page), "P1").toEqual([]);
  await openApp(page, "#/jump/pending");
  await page.locator('[data-key="answer-as-dana"]').click();
  expect(await unsourced(page), "deal owner's view").toEqual([]);
});
