// Builds A2 states through the interface: every state comes from commands,
// never from a hand-written session.
import { expect, openApp, isNarrow, openMenu } from "./helpers.mjs";

export const phrase = (page) => page.locator('[data-key="phrase"]');
export const status = (page) => page.locator('[data-key="r2-status"]');
export const row = (page, pid) => page.locator(`[data-key="row-${pid}"]`);

export async function openHarbor(page, hash = "#/drafts/harbor") {
  await openApp(page, hash);
  await expect(page.locator('[data-key="a2-title"]')).toBeVisible();
}

export async function runCheck(page) {
  await page.locator('[data-key="run-check"]').click();
  await expect(page.locator('[data-key="run-check"][aria-busy="true"]')).toHaveCount(0, { timeout: 5000 });
}

// Cards are collapsed except one (TC4): open the card of an issue before using its actions.
export const cardHead = (page, issueKey) => page.locator(`[data-key="card-head-${issueKey.replace(/[^\w-]/g, "-")}"]`);
export const card = (page, issueKey) => page.locator(`.card[data-issue="${issueKey}"]`);
export async function openCard(page, issueKey) {
  const head = cardHead(page, issueKey);
  if ((await head.getAttribute("aria-expanded")) !== "true") await head.click();
  await expect(head).toHaveAttribute("aria-expanded", "true");
}
// Sam Lee's card, opened: what the row of Sam said in A2 is on the card (TC3).
export async function samCard(page) {
  await openCard(page, "recipient:p-sam");
  return card(page, "recipient:p-sam");
}
const SENTENCE = { 1: "wording:timing-expectation", 2: "wording:guaranteed-completion" };

export async function reword(page, paragraph, text) {
  await openCard(page, SENTENCE[paragraph]);
  await page.locator(`[data-key="edit-sentence-${paragraph}"]`).click();
  if (text !== undefined) await page.locator('[data-key="suggested-wording"]').fill(text);
  await page.locator('[data-key="apply-wording"]').click();
}

export async function requestException(page, issueKey, reason = "Needed for the integration workstream.") {
  await openCard(page, issueKey);
  await page.locator(`[data-key="request-${issueKey}"]`).click();
  await page.locator('[data-key="p1-reason"]').fill(reason);
  await page.locator('[data-key="p1-send"]').click();
}

// Opens the Simulation panel when it is closed (narrow screens).
export async function openSimulation(page) {
  if (await page.locator("#sim").count()) return;
  if (await isNarrow(page)) {
    await openMenu(page); // the mobile layout keeps Simulation in the menu (MB5)
    await page.locator('[data-key="banner-simulation"]').click();
  } else await page.locator('[data-key="banner-simulation"]').click(); // in the bar (UG2)
  await expect(page.locator("#sim")).toBeVisible();
}

// The deal owner answers in the foreground, from "Answer as Dana Whitfield" (TC8).
// The view drawn is the one of the address: a hash change renders after it.
export async function settled(page) {
  await page.waitForFunction(() => {
    const h = location.hash;
    const view = h === "#/drafts" ? "drafts" : h === "#/drafts/harbor" ? "draft" : h === "#/drafts/harbor/review" ? "review"
      : h === "#/drafts/harbor/record" ? "record" : /^#\/drafts\/draft-/.test(h) ? "static" : null;
    return view === null || document.body.dataset.view === view;
  });
}

export async function decideAsDana(page, outcome, note) {
  await settled(page);
  const answer = page.locator('[data-key="answer-as-dana"]');
  if (await answer.isVisible()) await answer.click();
  else {
    // Away from the draft, the Simulation drawer leads to the deal owner's view.
    await openSimulation(page);
    await page.locator('[data-key="sim-answer"]').click();
  }
  const view = page.getByRole("dialog");
  await expect(view).toContainText("Acting as Dana Whitfield (deal owner)");
  if (note) await view.getByLabel("Note (optional)").fill(note);
  await view.locator(outcome === "approved" ? '[data-key="sim-approve"]' : '[data-key="sim-decline"]').click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
