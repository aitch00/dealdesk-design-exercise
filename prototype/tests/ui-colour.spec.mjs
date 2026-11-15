// Colour and chrome (decisions CL1–CL8): red where the message must change, green
// where it can go, the simulation on a yellow legal pad, a rule under the bar,
// "Drafts" beside the wordmark, the restart question in line with its buttons.
import { test, expect, openApp, expectFocus, WIDE } from "./helpers.mjs";

const css = (loc, prop) => loc.evaluate((el, p) => getComputedStyle(el)[p], prop);
const RED = "rgb(155, 49, 56)";
const RED_TINT = "rgb(249, 235, 236)";
const GREEN_TINT = "rgb(232, 243, 235)";
const INK = "rgb(34, 31, 27)";
const PAD = "rgb(253, 243, 196)";

test.use({ viewport: WIDE });

test("CL1 · blocked: the verdict is a red alert, the blocking card, sentence, recipient and list icon are red", async ({ page }) => {
  await openApp(page, "#/jump/flagged");
  const verdict = page.locator(".verdict .state-phrase");
  expect(await css(verdict, "backgroundColor")).toBe(RED_TINT);
  expect(await css(verdict.locator(".phrase-head"), "color")).toBe("rgb(105, 28, 33)");
  expect(await css(page.locator(".card.rule-blocks").first(), "borderLeftColor")).toBe(RED);
  expect(await css(page.locator(".flag-blocking").first(), "textDecorationColor")).toBe(RED);
  expect(await css(page.locator('[data-key="row-p-sam"]'), "borderTopColor")).toBe(RED);
  expect(await css(page.locator(".list-item").first().locator(".icon"), "stroke")).toBe(RED);
  // The words are still there: colour is a second signal (WCAG 1.4.1).
  await expect(verdict.locator(".phrase-head")).toHaveText("Blocked");
});

test("CL1 · waiting for Dana: nothing to change, so no red; the rule stays solid because sending waits", async ({ page }) => {
  await openApp(page, "#/jump/pending");
  expect(await css(page.locator(".verdict .state-phrase"), "backgroundColor")).not.toBe(RED_TINT);
  const card = page.locator(".card.rule-blocks.is-waiting").first();
  expect(await css(card, "borderLeftColor")).toBe(INK);
  expect(await css(card, "borderLeftStyle")).toBe("solid");
});

test("CL1 · ready: the verdict is green; the deal owner's name in a request is not flagged", async ({ page }) => {
  await openApp(page, "#/jump/ready");
  expect(await css(page.locator(".verdict .state-phrase"), "backgroundColor")).toBe(GREEN_TINT);
  await openApp(page, "#/jump/pending");
  await page.locator('[data-key="answer-as-dana"]').click();
  expect(await css(page.locator("#owner .chip-to"), "borderTopColor")).toBe(INK);
});

test("CL2 · the simulation is a yellow legal pad: the waiting note, the deal owner's band, the jump note, the head of the Simulation sheet", async ({ page }) => {
  await openApp(page, "#/jump/pending");
  expect(await css(page.locator(".answer.is-simulation"), "backgroundColor")).toBe(PAD);
  expect(await css(page.locator(".answer.is-simulation"), "borderTopStyle")).toBe("none");
  expect(await css(page.locator('[data-key="jump-note"]'), "backgroundColor")).toBe(PAD);
  await page.locator('[data-key="banner-simulation"]').click();
  expect(await css(page.locator(".sim-head"), "backgroundColor")).toBe(PAD); // the sheet's head only (SM2)
});

test("CL5 · CL6 · a rule under the bar; Drafts beside the wordmark is the page's heading and takes focus", async ({ page }) => {
  await openApp(page, "#/drafts");
  expect(await css(page.locator(".banner.app-bar"), "borderBottomStyle")).toBe("solid");
  expect(await css(page.locator(".app-footer"), "borderTopColor")).toBe(await css(page.locator(".banner.app-bar"), "borderBottomColor"));
  await expectFocus(page, { tag: "h1", text: "Project Harbor" }); // the sample opens on the draft (GA11)
  await expect(page.locator(".app-bar-row h2.app-section")).toHaveText("Drafts");
  await expect(page.getByRole("navigation", { name: "Drafts" })).toBeVisible();
});

test("CL7 · the restart question sits on the bar's line with its buttons; the role steps aside", async ({ page }) => {
  await openApp(page, "#/drafts");
  await page.locator('[data-key="banner-restart"]').click();
  const [q, b] = [await page.locator("#restart-question").boundingBox(), await page.locator('[data-key="restart-confirm"]').boundingBox()];
  expect(Math.abs((q.y + q.height / 2) - (b.y + b.height / 2))).toBeLessThan(2);
  await expect(page.locator('[data-key="banner-role"]')).toBeHidden();
});

test("UR8 · the verdict says when the last check ran and on which version, and a new check updates it", async ({ page }) => {
  await openApp(page, "#/jump/flagged");
  await expect(page.locator('[data-key="checked-at"]')).toHaveText(/^Checked at \d\d:\d\d\s· version 1$/);
  await page.locator('[data-key="remove-p-sam"]').click();
  await page.locator('[data-key="run-check"]').first().click();
  await expect(page.locator('[data-key="checked-at"]')).toHaveText(/^Checked at \d\d:\d\d\s· version 2$/);
});
