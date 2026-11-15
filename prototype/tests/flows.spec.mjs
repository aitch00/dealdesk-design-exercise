// The user flows F1–F6 (docs/2-product/flows/), end to end, at
// 1280 and 375 px: text, ARIA attributes, focus after every transition, Esc.
import { test, expect, openApp, expectFocus, noHorizontalScroll, backToDraftKey } from "./helpers.mjs";
import { phrase, status, row, runCheck, reword, requestException, decideAsDana, openSimulation, samCard, openCard } from "./a2-helpers.mjs";

for (const width of [1280, 375]) {
  test.describe(`at ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } });
    // Leaving the draft: Back to drafts in the top bar on a narrow screen (MB1), another draft of the list on a wide one (TC1, TC10).
    const leave = async (page) => {
      if (width < 1040) {
        await page.locator('[data-key="m2-back"]').click();
        await expectFocus(page, { tag: "h1", text: "Drafts" });
      } else {
        await page.getByRole("link", { name: /^Kickoff agenda/ }).click();
        await expect(page).toHaveURL(/#\/drafts\/draft-harrow-kickoff$/);
      }
    };

    test("F1 · from the homepage to the sample review", async ({ page }) => {
      await page.goto("index.html");
      await expect(page.locator("h1")).toHaveText("A second look before deal messages leave.");
      await expect(page.getByRole("heading", { name: "What a second look finds" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "What DealDesk doesn't do" })).toBeVisible();
      await page.locator(".home-cta").getByRole("link", { name: "Try the sample review" }).click();
      await page.waitForSelector("body[data-ready]");
      await expectFocus(page, width >= 1040 ? { tag: "h1", text: "Project Harbor" } : { tag: "h1", text: "Drafts" }); // a wide screen opens on the draft (GA11)
      // The sample label stays visible: in the footer, and in the compact bar of a narrow screen (MB1, UG4).
      await expect(page.locator('.m2-sample, [data-key="footer-sample"]').first()).toHaveText(width >= 1040
        ? "Sample review · Project Harbor · Simulated: no email is sent" : "Sample review · no email is sent"); // shorter on a phone (MB12)
      await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
      if (width >= 1040) await expect(page.locator('[data-key="banner-simulation"]')).toHaveAttribute("aria-expanded", "false");
      else await expect(page.locator('[data-key="m2-menu"]')).toHaveAttribute("aria-expanded", "false");
      if (width < 1040) await page.locator('[data-key="m2-menu"]').click(); // in the menu on a narrow screen (MB1)
      await page.locator('[data-key="banner-home"]').click(); // the wordmark on a wide screen, the menu on a narrow one (UG2)
      await expect(page).toHaveURL(/index\.html$/);
      expect(await noHorizontalScroll(page)).toBe(true);
    });

    test("F2 · fix both issues and send, with Undo (SC-1, SC-6)", async ({ page }) => {
      await openApp(page, width >= 1040 ? "#/drafts/draft-harrow-kickoff" : "#/drafts"); // a wide screen opens on Harbor (GA11)
      await page.getByRole("link", { name: /^Timeline update/ }).click();
      await expectFocus(page, { tag: "h1", text: "Project Harbor" });
      await expect(phrase(page)).toHaveText("Blocked · Check up to date · 2 blocking issues · Can't send yet");
      await expect(row(page, "p-pat")).toContainText("On deal team");
      await expect(row(page, "p-alex")).toContainText("On deal team");
      await page.getByRole("button", { name: "Remove Sam Lee" }).click();
      // The next step opens: the sentence still to fix (TC4).
      await expectFocus(page, { key: "card-head-wording-guaranteed-completion" });
      await expect(status(page)).toHaveText("Needs a new check · Recipients changed since the last check (version 1)");
      await expect(page.locator('.chip.is-removed')).toHaveText("Sam Lee");
      await openCard(page, "recipient:p-sam");
      await page.getByRole("button", { name: "Undo removing Sam Lee" }).click();
      await expectFocus(page, { key: "card-head-recipient-p-sam" });
      await expect(phrase(page)).toHaveText("Blocked · Check up to date · 2 blocking issues · Can't send yet");
      await page.getByRole("button", { name: "Remove Sam Lee" }).click();
      await page.getByRole("button", { name: "Edit sentence 2" }).click();
      await expectFocus(page, { key: "suggested-wording" });
      await page.getByRole("button", { name: "Apply wording" }).click();
      await expectFocus(page, { key: "run-check" });
      await expect(page.locator('[data-key="next-tag"]')).toHaveText("Next");
      await expect(phrase(page)).toHaveText("Needs a new check · Recipients and wording changed since the last check (version 1)");
      await runCheck(page);
      // the undone version keeps its number (M4): removing again creates version 3
      await expect(status(page)).toHaveText("Ready to send · Check up to date (version 4) · 1 warning unchanged");
      await expect(page.locator(".resolved li")).toHaveText(["Sam Lee — removed (version 3)", "Guaranteed completion — reworded (version 4)"]);
      await expectFocus(page, { key: "review-before-sending" });
      await page.locator('[data-key="review-before-sending"]').click();
      await expectFocus(page, { key: "a3-title", text: "Review before sending · Project Harbor" });
      await expect(page.locator("#a3-verdict-title")).toHaveText("You can send");
      await page.getByRole("button", { name: "Send (simulated)" }).click();
      await expectFocus(page, { key: "a4-title", text: "Review record · Project Harbor" });
      await expect(page.locator('[data-key="a4-status"]')).toHaveText("Sent (simulated).");
      await expect(page.locator("#notes .data-line")).toHaveText(/^Sent \(simulated\) to Pat Morgan and Alex Rivera at \d\d:\d\d\s· Version 4\s· No real email left the sample\.$/);
      expect(await noHorizontalScroll(page)).toBe(true);
    });

    test("F3 · exception approved, then declined, then requested too early (SC-2, SC-3, SC-7)", async ({ page }) => {
      await openApp(page);
      await page.getByRole("link", { name: /^Timeline update/ }).click();
      // SC-7: a request before rewording becomes outdated when the sentence changes
      await page.getByRole("button", { name: "Request owner exception for Sam Lee" }).click();
      await expectFocus(page, { key: "p1-title" });
      await expect(page.locator(".p1")).toContainText("1 blocking issue can still be fixed by editing. Fix it first so Dana approves the final version.");
      await page.locator('[data-key="p1-send"]').click();
      await expect(page.locator("#p1-error")).toHaveText("Add a reason so Dana can decide.");
      await page.keyboard.press("Escape");
      await expectFocus(page, { key: "request-recipient:p-sam" });
      await requestException(page, "recipient:p-sam", "Sam is joining Corvane's integration workstream next week and asked to be copied.");
      await reword(page, 2);
      await runCheck(page);
      await expect(await samCard(page)).toContainText("Your request to Dana Whitfield was for version 1.");
      // SC-2: ask again on the final wording and approve
      await requestException(page, "recipient:p-sam", "Sam is joining Corvane's integration workstream next week and asked to be copied.");
      await expectFocus(page, { key: "answer-as-dana" });
      await expect(await samCard(page)).toContainText("Pending");
      await expect(await samCard(page)).toContainText("Not approved yet. Sending stays blocked.");
      await page.locator('[data-key="review-before-sending"]').click();
      await expect(page.locator('[data-key="send"]')).toHaveAttribute("aria-disabled", "true");
      await page.locator(`[data-key="${await backToDraftKey(page)}"]`).click();
      await expectFocus(page, { key: "review-before-sending" });
      await decideAsDana(page, "approved");
      await expect(await samCard(page)).toContainText(/Approved by Dana Whitfield\s· \d\d:\d\d\s· for version 2\s· Simulated owner response/);
      await expect(status(page)).toHaveText("Ready to send · Check up to date (version 2) · 1 warning unchanged");
      await page.locator('[data-key="review-before-sending"]').click();
      await expect(page.locator('[aria-labelledby="a3-approved"] li')).toHaveText(/^Sam Lee by Dana Whitfield, \d\d:\d\d, for version 2$/);
      await page.getByRole("button", { name: "Send (simulated)" }).click();
      await expect(page.locator('[aria-labelledby="a4-decisions"] li')).toHaveText(/^Sam Lee: approved by Dana Whitfield, \d\d:\d\d, for version 2$/);
    });

    test("F3 5a · owner declines; removing Sam clears it (SC-3)", async ({ page }) => {
      await openApp(page, "#/jump/pending");
      await decideAsDana(page, "declined", "Sam isn't cleared for Harbor.");
      await expect(phrase(page)).toHaveText("Blocked · Check up to date · Dana Whitfield declined an exception · Can't send yet");
      await expect(await samCard(page)).toContainText("'Sam isn't cleared for Harbor.'");
      await (await samCard(page)).getByRole("button", { name: "Remove Sam Lee" }).click();
      await runCheck(page);
      await expect(phrase(page)).toHaveText("Ready to send · Check up to date (version 3) · 1 warning unchanged");
    });

    test("F4 · edit after approval (SC-4)", async ({ page }) => {
      await openApp(page, "#/jump/pending");
      await decideAsDana(page, "approved");
      await page.locator('[data-key="edit-message"]').click();
      await expectFocus(page, { key: "edit-warning" });
      await page.locator('[data-key="continue-editing"]').click();
      await expect(page.locator('[data-key="mode-bar"]')).toContainText("Editing · Changes aren't saved yet");
      const body = page.getByLabel("Message", { exact: true });
      await body.fill((await body.inputValue()).replace("Best,", "We'll share the call notes after Friday.\n\nBest,"));
      await page.locator('[data-key="save-changes"]').click();
      // The approval waits for a new check, so the check is the next step; Sam's card stays open (TC4).
      await expectFocus(page, { key: "run-check" });
      await expect(page.locator('[data-key="card-head-recipient-p-sam"]')).toHaveAttribute("aria-expanded", "true");
      await expect(status(page)).toHaveText("Needs a new check · Wording changed since the last check (version 2) · Approval for Sam Lee outdated");
      await expect(page.locator('[data-key="what-changed"] li')).toHaveText(["Added 'We'll share the call notes after Friday.'"]);
      await runCheck(page);
      await expect(await samCard(page)).toContainText("Approved on version 2 · doesn't cover version 3");
      await page.getByRole("button", { name: "Request again for Sam Lee" }).click();
      await expect(page.locator(".p1")).toContainText("Changed since Dana approved version 2");
      await page.locator('[data-key="p1-send"]').click();
      await decideAsDana(page, "approved");
      await expect(await samCard(page)).toContainText("for version 3");
      await expect(phrase(page)).toHaveText("Ready to send · Check up to date (version 3) · 1 warning unchanged");
    });

    test("F5 · review unavailable (SC-5)", async ({ page }) => {
      await openApp(page, "#/drafts/harbor");
      await openSimulation(page);
      await page.getByRole("switch", { name: "Simulate check outage" }).check();
      await expect(page.locator("#sim-status")).toHaveText("Check outage simulated. The next check will fail.");
      await page.keyboard.press("Escape"); // the Simulation sheet is modal: the draft is used once it is closed (SM1)
      await page.getByRole("button", { name: "Remove Sam Lee" }).click();
      await runCheck(page);
      await expect(page.locator('[data-key="r2-alert"]')).toHaveText("Check unavailable · Your draft is saved. Sending stays blocked until the check runs.");
      // Which check the cards come from is said once: in their heading on a wide screen (UR4),
      // under Details in the verdict on a narrow one, where the cards have no heading (MB3).
      if (width < 1040) {
        await page.locator('[data-key="m2-details"] summary').click();
        await expect(page.locator(".verdict").getByText("From an earlier check (version 1). May be out of date.")).toBeVisible();
      } else {
        await expect(page.locator('[data-key="summary-earlier"]')).toContainText("Still open from the last check (version 1, may be out of date):");
        await expect(page.getByText("From an earlier check")).toHaveCount(0);
      }
      await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: review is unavailable. Your draft is saved.");
      await page.getByRole("button", { name: "Keep editing" }).click();
      await expectFocus(page, { key: "edit-message" });
      await openSimulation(page);
      await page.getByRole("switch", { name: "Simulate check outage" }).uncheck();
      await expect(page.locator("#sim-status")).toHaveText("Check service available. Run the check again.");
      await page.keyboard.press("Escape"); // modal sheet (SM1)
      await expect(phrase(page)).toHaveText("Check unavailable · Your draft is saved. Sending stays blocked until the check runs.");
      await page.getByRole("button", { name: "Try again" }).click();
      await expect(page.locator('[data-key="run-check"][aria-busy="true"]')).toHaveCount(0);
      await expect(phrase(page)).toHaveText("Blocked · Check up to date · 1 blocking issue · Can't send yet");
      await expect(page.locator(".resolved li")).toHaveText(["Sam Lee — removed (version 2)"]);
      await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 1 blocking issue");
    });

    test("F6 · resume after an interruption", async ({ page }) => {
      await openApp(page, "#/jump/pending");
      await leave(page);
      await expect(page.locator('[data-key="harbor-status"]')).toHaveText(/^Waiting for Dana Whitfield since \d\d:\d\d$/);
      await page.getByRole("link", { name: /^Timeline update/ }).click();
      await expect(page.locator('[data-key="resume"]')).toHaveText(/^Where you left off: waiting for Dana Whitfield since \d\d:\d\d\.$/);
      await expectFocus(page, { key: "resume" });
      await leave(page);
      await decideAsDana(page, "approved");
      await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Ready to send");
      await expect(page.locator("#sim")).toHaveCount(0); // answering closes the sheet at every width (SM1)
      await page.getByRole("link", { name: /^Timeline update/ }).click();
      await expect(page.locator('[data-key="resume"]')).toHaveText(/^Since you left: Dana Whitfield approved Sam Lee \(\d\d:\d\d\)\.$/);
      await expectFocus(page, { key: "resume" });
    });
  });
}
