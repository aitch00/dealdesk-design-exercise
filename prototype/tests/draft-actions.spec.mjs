// A2 interactions: focus after each action, sentence editor, Undo, edit mode,
// P1, the "Checking…" transient and the resume message (F2–F6, UF15, UF20, UF22).
import { test, expect, openApp, expectFocus, noHorizontalScroll, WIDE, NARROW } from "./helpers.mjs";
import { openHarbor, phrase, status, row, runCheck, reword, requestException, decideAsDana, samCard, openCard } from "./a2-helpers.mjs";

test.describe("wide", () => {
  test.use({ viewport: WIDE });

  test("entering from the list focuses the heading; Remove and Undo lead to the next card (F2 3, 3a, TC4)", async ({ page }) => {
    await openApp(page, "#/drafts/draft-harrow-kickoff"); // another draft first: the sample opens on Harbor (GA11)
    await page.getByRole("link", { name: /^Timeline update/ }).click();
    await expectFocus(page, { tag: "h1", text: "Project Harbor" });
    await expect(page).toHaveTitle("Project Harbor · Review · DealDesk sample");
    await page.locator('[data-key="remove-p-sam"]').click();
    await expectFocus(page, { key: "card-head-wording-guaranteed-completion" });
    await openCard(page, "recipient:p-sam");
    await page.locator('[data-key="undo"]').click();
    await expectFocus(page, { key: "card-head-recipient-p-sam" });
    await expect(phrase(page)).toHaveText("Blocked · Check up to date · 2 blocking issues · Can't send yet");
    await expect(page.locator("#main .data")).toHaveText("Version 1");
  });

  test("the sentence editor opens in the draft: focus, Esc cancels, Apply leads to the next card (F2 4–5, TC4, TC6)", async ({ page }) => {
    await openHarbor(page);
    await openCard(page, "wording:guaranteed-completion");
    await page.locator('[data-key="edit-sentence-2"]').click();
    await expect(page.locator(".mail [data-key='editor']")).toBeVisible();
    await expect(page.locator('[data-key="editing-in-message"]')).toHaveText("Editing in the message.");
    await expectFocus(page, { key: "suggested-wording" });
    await page.keyboard.press("Escape");
    await expectFocus(page, { key: "edit-sentence-2" });
    await expect(page.locator("#main .data")).toHaveText("Version 1");
    await reword(page, 2);
    await expectFocus(page, { key: "card-head-recipient-p-sam" });
    await expect(page.locator('[data-key="changed-sentence"]')).toContainText("We are working towards completion by 30 June.");
    await expect(status(page)).toHaveText("Needs a new check · Wording changed since the last check (version 1)");
  });

  test("a rewording that still guarantees stays blocked (SC-8)", async ({ page }) => {
    await openHarbor(page);
    await reword(page, 2, "Completion is guaranteed by the end of June.");
    await runCheck(page);
    await expect(phrase(page)).toHaveText("Blocked · Check up to date · 2 blocking issues · Can't send yet");
    await expect(page.locator(".flag-blocking")).toHaveText("Completion is guaranteed by the end of June.");
  });

  test("during Checking… another action ends the transient at once", async ({ page }) => {
    await page.clock.install();
    await openHarbor(page);
    await reword(page, 2);
    await page.locator('[data-key="run-check"]').click();
    await expect(phrase(page)).toHaveText("Checking…");
    await page.locator('[data-key="remove-p-sam"]').click();
    await expect(phrase(page)).toHaveText("Needs a new check · Recipients changed since the last check (version 2)");
  });

  test("Keep editing moves focus to Edit message (F5 4b)", async ({ page }) => {
    await openHarbor(page, "#/jump/review-unavailable");
    await page.getByRole("button", { name: "Keep editing" }).click();
    await expectFocus(page, { key: "edit-message" });
  });

  test("edit mode without approvals: one version for recipients and text (UF22)", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="edit-message"]').click();
    await expect(page.locator('[data-key="mode-bar"]')).toContainText("Editing · Changes aren't saved yet");
    await expectFocus(page, { key: "mode-bar" });
    await page.locator('[data-key="edit-remove-p-sam"]').click();
    const body = page.getByLabel("Message", { exact: true });
    await body.fill((await body.inputValue()).replace("Best,", "We'll share the call notes after Friday.\n\nBest,"));
    await page.locator('[data-key="save-changes"]').click();
    await expect(page.locator("#main .data")).toHaveText("Version 2");
    await expect(page.locator('[data-key="what-changed"] li')).toHaveText(["Sam Lee removed", "Added 'We'll share the call notes after Friday.'"]);
    // The sentence still to fix is the next step (TC4).
    await expectFocus(page, { key: "card-head-wording-guaranteed-completion" });
    await expect(status(page)).toHaveText("Needs a new check · Recipients and wording changed since the last check (version 1)");
  });

  test("adding Sam back brings the issue back at the next check (UC-04 3a)", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="remove-p-sam"]').click();
    await runCheck(page);
    await page.locator('[data-key="edit-message"]').click();
    await page.locator('[data-key="add-recipient"]').click();
    await expectFocus(page, { key: "add-person" });
    const options = await page.locator('[data-key="add-person"] option').allTextContents();
    expect(options).not.toContain("Pat Morgan");
    await page.locator('[data-key="add-person"]').selectOption({ label: "Sam Lee" });
    await page.getByLabel("CC").check();
    await page.locator('[data-key="add-confirm"]').click();
    await page.locator('[data-key="save-changes"]').click();
    await expect(page.locator('[data-key="what-changed"] li')).toHaveText(["Sam Lee added"]);
    await runCheck(page);
    await expect(await samCard(page)).toContainText("Not on the deal team");
  });

  test("edit mode with an approval warns first; Cancel changes nothing; no difference says so (F4 1, 1a, 3a)", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await decideAsDana(page, "approved");
    await page.locator('[data-key="edit-message"]').click();
    await expect(page.locator('[data-key="edit-warning"]')).toContainText("Editing will make Dana Whitfield's approval outdated. You'll need to ask again.");
    await expectFocus(page, { key: "edit-warning" });
    await page.locator('[data-key="cancel-edit"]').click();
    await expectFocus(page, { key: "edit-message" });
    await page.locator('[data-key="edit-message"]').click();
    await page.locator('[data-key="continue-editing"]').click();
    await page.locator('[data-key="save-changes"]').click();
    await expect(page.locator('[data-key="no-change"]')).toHaveText("No change made");
    await expect(page.locator("#main .data")).toHaveText("Version 2"); // the draft's, not the leaving sheet's copy (DP6)
  });

  test("editing after approval makes it outdated, and asking again shows what changed (F4)", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await decideAsDana(page, "approved");
    await page.locator('[data-key="edit-message"]').click();
    await page.locator('[data-key="continue-editing"]').click();
    const body = page.getByLabel("Message", { exact: true });
    await body.fill((await body.inputValue()).replace("Best,", "We'll share the call notes after Friday.\n\nBest,"));
    await page.locator('[data-key="save-changes"]').click();
    await expect(status(page)).toHaveText("Needs a new check · Wording changed since the last check (version 2) · Approval for Sam Lee outdated");
    await runCheck(page);
    await expect(phrase(page)).toHaveText("Blocked · Check up to date · Approval for Sam Lee outdated · Can't send yet");
    await page.getByRole("button", { name: "Request again for Sam Lee" }).click();
    const panel = page.locator(".p1");
    await expect(panel).toContainText("Changed since Dana approved version 2");
    await expect(panel).toContainText("Added 'We'll share the call notes after Friday.'");
    await expect(page.getByLabel("Why does Sam Lee need this message?")).not.toHaveValue("");
    await page.locator('[data-key="p1-send"]').click();
    await page.locator('[data-key="answer-as-dana"]').click();
    await expect(page.getByRole("dialog")).toContainText("Changed since you approved version 2: Added 'We'll share the call notes after Friday.'");
    await page.keyboard.press("Escape");
    await decideAsDana(page, "approved");
    await expect(await samCard(page)).toContainText("for version 3");
  });

  test("P1: focus on the title, empty reason, Esc returns focus (F3 1–3a)", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="request-recipient:p-sam"]').click();
    await expectFocus(page, { key: "p1-title" });
    const panel = page.locator(".p1");
    await expect(panel).toContainText("To: Dana Whitfield (deal owner)");
    await expect(panel).toContainText("If approved, Sam Lee can receive this message (version 1) only. It doesn't add Sam to the deal team.");
    await expect(panel).toContainText("1 blocking issue can still be fixed by editing. Fix it first so Dana approves the final version.");
    await expect(page.getByRole("dialog")).toHaveAccessibleName("Project Harbor · Exception request · Sam Lee as recipient");
    await page.locator('[data-key="p1-send"]').click();
    await expect(page.locator("#p1-error")).toHaveText("Add a reason so Dana can decide.");
    await expectFocus(page, { key: "p1-reason" });
    await expect(page.getByLabel("Why does Sam Lee need this message?")).toHaveAttribute("aria-invalid", "true");
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expectFocus(page, { key: "request-recipient:p-sam" });
  });

  test("P1 keeps Tab inside the panel", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="request-recipient:p-sam"]').click();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => Boolean(document.activeElement.closest(".p1")))).toBe(true);
    }
  });

  test("Send request waits for Dana; the next step is to answer as Dana (F3 3–4, TC4)", async ({ page }) => {
    await openHarbor(page);
    await reword(page, 2);
    await runCheck(page);
    await requestException(page, "recipient:p-sam", "Sam is joining Corvane's integration workstream next week and asked to be copied.");
    await expectFocus(page, { key: "answer-as-dana" });
    await expect(page.locator('[data-key="next-tag"]')).toHaveText("Next");
    await expect(status(page)).toHaveText(/^Waiting for decision\s· Requested from Dana Whitfield at \d\d:\d\d$/);
  });

  test("resume after leaving: Where you left off, then Since you left (F6, UF20)", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await expect(page.locator('[data-key="resume"]')).toHaveCount(0);
    await page.getByRole("link", { name: /^Kickoff agenda/ }).click();
    await page.getByRole("link", { name: /^Timeline update/ }).click();
    await expect(page.locator('[data-key="resume"]')).toHaveText(/^Where you left off: waiting for Dana Whitfield since \d\d:\d\d\.$/);
    await expectFocus(page, { key: "resume" });
    await page.getByRole("link", { name: /^Kickoff agenda/ }).click();
    await expect(page).toHaveURL(/#\/drafts\/draft-harrow-kickoff$/);
    await decideAsDana(page, "approved");
    await page.getByRole("link", { name: /^Timeline update/ }).click();
    await expect(page.locator('[data-key="resume"]')).toHaveText(/^Since you left: Dana Whitfield approved Sam Lee \(\d\d:\d\d\)\.$/);
    await page.reload();
    await page.waitForSelector("body[data-ready]");
    await expect(page.locator('[data-key="resume"]')).toHaveCount(0);
  });
});

test.describe("narrow", () => {
  test.use({ viewport: NARROW });

  test("one column: the verdict, then the draft with each card under its element (UF6, TC10)", async ({ page }) => {
    await openHarbor(page);
    const tops = await page.evaluate(() => [".verdict", ".mail-head", ".mail-fields", '.mail .card[data-issue="recipient:p-sam"]', ".mail-subject",
      '.mail .card[data-issue="wording:timing-expectation"]', '.mail .card[data-issue="wording:guaranteed-completion"]']
      .map((s) => document.querySelector(s).getBoundingClientRect().top));
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    // The bar stays at the bottom of the screen, with the main action in reach (MB2).
    await expect(page.locator(".mail > .mail-bar")).toHaveCSS("position", "sticky");
    await expect(page.locator('[data-key="review-before-sending"]')).toBeInViewport();
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("P1 is full screen, Cancel in its top bar and Send request fixed at the bottom (MB4)", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="request-recipient:p-sam"]').click();
    const box = await page.locator(".p1").boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(340);
    // It takes the place of the page: the draft behind is not drawn (TC10).
    await expect(page.locator("#workspace")).toBeHidden();
    await expect(page.locator('[data-key="p1-cancel-top"]')).toBeVisible();
    await expect(page.locator('[data-key="p1-cancel"]')).toBeHidden();
    await expect(page.locator('[data-key="p1-send"]')).toBeInViewport();
    await page.locator('[data-key="p1-cancel-top"]').click();
    await expect(page.locator(".p1")).toHaveCount(0);
  });

  test("at 320 px A2 reflows", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openHarbor(page, "#/jump/edited-after-approval");
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});
