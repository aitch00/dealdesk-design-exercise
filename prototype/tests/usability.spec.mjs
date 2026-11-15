// The corrections made after the usability review (decisions US1–US16,
// docs/5-evaluation/usability-review.md). Each test reproduces the problem
// the way the review found it and checks the corrected behaviour.
import { test, expect, openApp, WIDE, NARROW } from "./helpers.mjs";
import { openHarbor, phrase, row, status, decideAsDana, samCard, openCard, card, openSimulation } from "./a2-helpers.mjs";

test.use({ viewport: WIDE });

test.describe("US1 · in-page anchors stay in the draft", () => {
  test("the skip link moves focus to the content and keeps the address", async ({ page }) => {
    await openHarbor(page);
    await page.locator("#skip").focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    await expect(page.locator('[data-key="a2-title"]')).toBeVisible();
    expect(await page.evaluate(() => document.activeElement.id)).toBe("main");
  });

  test("a numbered marker opens its card and moves focus there (TC5)", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="marker-2"]').click();
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    expect(await page.evaluate(() => document.activeElement.dataset.key)).toBe("card-head-wording-guaranteed-completion");
    await expect(page.locator("#exp-2")).toBeVisible();
  });
});

test.describe("US2 · a warning before an edit makes a pending request outdated", () => {
  test("the sentence editor says the request will be outdated", async ({ page }) => {
    await openHarbor(page, "#/jump/escalated-first");
    await page.getByRole("button", { name: "Edit sentence 2" }).click();
    await expect(page.locator('[data-key="editor"]')).toContainText(
      "This change will make your request to Dana Whitfield outdated. You'll need to ask again.");
  });

  test("Edit message asks first", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await page.locator('[data-key="edit-message"]').click();
    await expect(page.locator('[data-key="edit-warning"]')).toContainText(
      "Editing will make your request to Dana Whitfield outdated. You'll need to ask again.");
    await expect(page.locator('[data-key="mode-bar"]')).toHaveCount(0);
  });

  test("without a request or an approval there is no warning", async ({ page }) => {
    await openHarbor(page);
    await openCard(page, "wording:guaranteed-completion");
    await page.getByRole("button", { name: "Edit sentence 2" }).click();
    await expect(page.locator('[data-key="editor"]')).not.toContainText("outdated");
  });
});

test.describe("US3 · an open edit survives leaving the draft", () => {
  test("the text is still there after opening another draft and coming back", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="edit-message"]').click();
    await page.locator('[data-key="edit-body"]').fill("Hi all,\n\nA sentence written before leaving.");
    await page.getByRole("link", { name: /^Kickoff agenda/ }).click();
    await expect(page).toHaveURL(/#\/drafts\/draft-harrow-kickoff$/);
    await page.getByRole("link", { name: /^Timeline update/ }).click();
    await expect(page.locator('[data-key="edit-body"]')).toHaveValue("Hi all,\n\nA sentence written before leaving.");
    await expect(page.locator('[data-key="mode-bar"]')).toBeFocused();
  });

  test("an edit without changes is not kept; a jump discards an open edit", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="edit-message"]').click();
    await page.getByRole("link", { name: /^Kickoff agenda/ }).click();
    await expect(page).toHaveURL(/#\/drafts\/draft-harbor-kickoff$|#\/drafts\/draft-harrow-kickoff$/);
    await page.getByRole("link", { name: /^Timeline update/ }).click();
    await expect(page.locator('[data-key="mode-bar"]')).toHaveCount(0);
    await page.locator('[data-key="edit-message"]').click();
    await page.locator('[data-key="edit-body"]').fill("Changed.");
    await openSimulation(page);
    await page.locator('[data-key="jump-pending"]').click();
    await expect(phrase(page)).toContainText("Waiting for decision");
    await expect(page.locator('[data-key="mode-bar"]')).toHaveCount(0);
  });
});

test.describe("US5 · from the start means from the starting data", () => {
  test("#/start restarts a saved session and opens the drafts list", async ({ page }) => {
    await openApp(page, "#/jump/sent");
    await page.goto("app.html#/drafts");
    await expect(page.locator('[data-key="harbor-status"]')).toContainText("Sent (simulated)");
    await page.goto("app.html#/start");
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
    await expect(page.locator('[data-key="banner-jumped"]')).toHaveCount(0);
  });

  test("the panel says that a jump restarts the sample", async ({ page }) => {
    await openApp(page);
    await openSimulation(page);
    await expect(page.locator('[data-key="sim-jump-note"]')).toHaveText("Each jump restarts the sample and replays the steps up to that state. What you changed is lost.");
    await expect(page.locator('[data-key="jump-start"]')).toHaveAttribute("href", "#/start");
  });

  test("on a narrow screen the panel closes after a jump", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await openHarbor(page);
    await openSimulation(page);
    await page.locator('[data-key="jump-pending"]').click();
    await expect(phrase(page)).toContainText("Waiting for decision");
    await expect(page.locator('[data-key="sim-hide"]')).toBeHidden();
    await expect(page.locator('[data-key="a2-title"]')).toBeFocused();
  });
});

test.describe("US6 · review unavailable", () => {
  test("the view says where the outage is simulated and the hidden status does not stay on Checking…", async ({ page }) => {
    await openHarbor(page, "#/jump/review-unavailable");
    await expect(page.locator('[data-key="unavailable-hint"]')).toHaveText(
      "In this sample, switch off Simulate check outage in the Simulation panel, then try again.");
    await page.locator('[data-key="run-check"]').click();
    await expect(page.locator('[data-key="r2-alert"]')).toHaveText(/^Check unavailable/);
    await expect(status(page)).not.toHaveText("Checking…");
  });

  test("the text offers an exception only together with when it can be requested", async ({ page }) => {
    await openHarbor(page, "#/jump/review-unavailable");
    await openCard(page, "wording:guaranteed-completion");
    await expect(page.locator("#exp-2")).toContainText("ask Dana Whitfield to approve an exception");
    await expect(page.locator('[data-key="request-after-check"]')).toHaveText("You can request an exception once the check is up to date.");
  });
});

test.describe("US7 · who receives the message and who the user is", () => {
  test("the draft reads as an email: To and CC with the people, the field on Sam's card (TC1 replaces the titles of US7)", async ({ page }) => {
    await openHarbor(page);
    await expect(page.locator(".mail .mail-fields .field-label")).toHaveText(["To", "CC"]);
    await expect(page.locator("#field-to + .chips-row .chips")).toContainText("Pat Morgan");
    await expect(page.locator("#field-to + .chips-row .chips")).toContainText("Alex Rivera");
    await expect(page.locator("#field-cc + .chips-row .chips")).toContainText("Sam Lee");
    await expect((await samCard(page)).locator(".card-body .meta")).toHaveText(/^CC\s· /);
    await expect(await samCard(page)).toContainText("ask deal owner Dana Whitfield to approve an exception.");
  });

  test("the banner names the role on every view", async ({ page }) => {
    for (const hash of ["#/drafts", "#/drafts/harbor", "#/jump/ready", "#/jump/sent"]) {
      await openApp(page, hash);
      await expect(page.locator('[data-key="banner-role"]')).toHaveText("You're working as Jordan Blake, deal coordinator.");
    }
  });
});

test.describe("US8 · reopened wordings", () => {
  test("before the next check the counts cover what is still in the draft and name the blocking issues", async ({ page }) => {
    await openHarbor(page);
    await page.getByRole("button", { name: "Remove Sam Lee" }).click();
    await expect(page.locator(".summary")).toContainText("Still open from the last check (version 1, may be out of date): 1 blocking (Guaranteed completion) · 1 warning"); // Sam, just removed, is not counted (US15)
  });

  test("with a current check the counts have no prefix", async ({ page }) => {
    await openHarbor(page);
    await expect(page.locator('[data-key="summary-earlier"]')).toHaveCount(0);
  });

  test("the final review calls the section Exceptions; Approved only heads approved exceptions", async ({ page }) => {
    await openApp(page, "#/jump/ready");
    const section = page.locator('[aria-labelledby="a3-approved"]');
    await expect(section.locator("h3")).toHaveText("Exceptions");
    await expect(section).toContainText("No exceptions used");
    await expect(section.locator("h4")).toHaveCount(0);
    await openHarbor(page, "#/jump/pending");
    await decideAsDana(page, "approved");
    await page.locator('[data-key="review-before-sending"]').click();
    await expect(page.locator('[aria-labelledby="a3-approved"] h4')).toHaveText(["Approved"]);
  });
});

test.describe("US9 · the Simulation panel", () => {
  test("while a decision is waiting no filled button is on Jordan's page; in Dana's view Approve is (TC8)", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await expect(page.locator(".btn-primary:visible")).toHaveCount(0);
    await page.locator('[data-key="answer-as-dana"]').click();
    await expect(page.locator(".btn-primary:visible")).toHaveText(["Approve exception for Sam Lee"]);
  });

  test("Things to try says how to finish the sample", async ({ page }) => {
    await openApp(page);
    await openSimulation(page);
    await expect(page.locator('[data-key="sim-try-note"]')).toContainText("also fix the guaranteed-completion sentence, review the final message and send");
  });
});

test.describe("US10 · keyboard and names", () => {
  test("the accessible name of Edit sentence contains its visible label", async ({ page }) => {
    await openHarbor(page);
    await openCard(page, "wording:guaranteed-completion");
    const button = page.locator('[data-key="edit-sentence-2"]');
    await expect(button).toHaveText("Edit sentence");
    expect(await button.getAttribute("aria-label")).toMatch(/^Edit sentence /);
  });

  test("Esc closes the sentence editor from its buttons and cancels the restart question", async ({ page }) => {
    await openHarbor(page);
    await openCard(page, "wording:guaranteed-completion");
    await page.getByRole("button", { name: "Edit sentence 2" }).click();
    await page.locator('[data-key="apply-wording"]').focus();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-key="editor"]')).toHaveCount(0);
    await page.locator('[data-key="banner-restart"]').click();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-key="restart-confirm"]')).toHaveCount(0);
    await expect(page.locator('[data-key="banner-restart"]')).toBeFocused();
  });

  test("after a keyboard action the card that takes focus shows the focus ring", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="request-recipient:p-sam"]').focus();
    await page.keyboard.press("Enter");
    await page.locator('[data-key="p1-reason"]').focus();
    await page.keyboard.type("Needed for the integration workstream.");
    await page.locator('[data-key="p1-send"]').focus();
    await page.keyboard.press("Enter");
    // The sentence still to fix is the next step (TC4).
    const head = page.locator('[data-key="card-head-wording-guaranteed-completion"]');
    await expect(head).toBeFocused();
    expect(await head.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  });
});

test.describe("US11 · forced colours", () => {
  test.use({ forcedColors: "active" });

  test("a thick rule only where there is something to do, visible icons, a blocked Send that looks blocked", async ({ page }) => {
    await openHarbor(page, "#/jump/approved");
    const css = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop);
    expect(await css(card(page, "recipient:p-sam"), "borderLeftWidth")).toBe("1px"); // approved: nothing to do
    await openHarbor(page, "#/jump/flagged");
    expect(await css(card(page, "recipient:p-sam"), "borderLeftWidth")).toBe("4px"); // blocking
    const text = await page.evaluate(() => getComputedStyle(document.body).color);
    expect(await css((await samCard(page)).locator("svg").first(), "stroke")).toBe(text);
    await page.locator('[data-key="review-before-sending"]').click();
    const send = page.getByRole("button", { name: /Send \(simulated\)/ });
    expect(await css(send, "color")).not.toBe(text);
  });
});

test.describe("US12–US15 · what the readers of the repeated comprehension test still reported", () => {
  test("US12 · while sending is blocked the button says what it does", async ({ page }) => {
    await openHarbor(page);
    const button = page.locator('[data-key="review-before-sending"]');
    await expect(button).toHaveText("See why you can't send");
    await button.click();
    await expect(page.locator('[data-key="a3-title"]')).toBeVisible();
    await openApp(page, "#/jump/ready");
    await page.locator('[data-key="back-to-draft"]').click();
    await expect(page.locator('[data-key="review-before-sending"]')).toHaveText("Review before sending");
  });

  test("US13 · the warning says who confirms and that it does not block", async ({ page }) => {
    await openHarbor(page);
    await openCard(page, "wording:timing-expectation");
    await expect(page.locator("#exp-1")).toHaveText(
      "Warning · Sets a timing expectation for the client. It doesn't block sending: confirm the timing yourself before you send.");
  });

  test("US14 · the reason names the decision still waiting, in the draft and in the final review", async ({ page }) => {
    await openHarbor(page, "#/jump/escalated-first");
    await expect(page.locator("#r6-reason")).toHaveText(
      "Can't send yet: 1 blocking issue needs action. Also waiting for Dana Whitfield's decision on Sam Lee.");
    await page.locator('[data-key="review-before-sending"]').click();
    await expect(page.locator("#a3-verdict")).toContainText("Also waiting for Dana Whitfield's decision on Sam Lee.");
  });

  test("US14 · no extra sentence when nothing is waiting or waiting is the only reason", async ({ page }) => {
    await openHarbor(page);
    await expect(page.locator('[data-key="also-waiting"]')).toHaveCount(0);
    await openHarbor(page, "#/jump/pending");
    await expect(page.locator('[data-key="also-waiting"]')).toHaveCount(0);
  });

  test("US15 · an issue fixed before the check is no longer counted", async ({ page }) => {
    await openHarbor(page);
    await page.getByRole("button", { name: "Remove Sam Lee" }).click();
    await page.getByRole("button", { name: "Edit sentence 2" }).click();
    await page.locator('[data-key="apply-wording"]').click();
    await expect(page.locator(".summary")).toContainText("Still open from the last check (version 1, may be out of date): 1 warning");
  });
});

// Found while trying the three-column layout (docs/4-design/structure.md).
test.describe("US16 · the sentence editor and an unchanged wording", () => {
  test("a warning without a suggestion: its own label, Apply unavailable until the text changes", async ({ page }) => {
    await openHarbor(page);
    await openCard(page, "wording:timing-expectation");
    await page.getByRole("button", { name: "Edit sentence 1" }).click();
    const field = page.getByLabel("Wording (edit it to change it)");
    await expect(field).toBeFocused();
    await expect(page.getByText("Suggested wording (you can edit it)")).toHaveCount(0);
    const apply = page.locator('[data-key="apply-wording"]');
    await expect(apply).toHaveAttribute("aria-disabled", "true");
    await apply.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-key="editor-no-change"]')).toHaveText("No change made");
    await expect(field).toBeFocused();
    await expect(field).toHaveAttribute("aria-describedby", "editor-no-change");
    await expect(page.locator("#main .data")).toHaveText("Version 1");
    await field.fill("The diligence workstreams are on track, and the remaining data-room requests should close this week.");
    await expect(apply).not.toHaveAttribute("aria-disabled", /.*/);
    await apply.click();
    await expect(status(page)).toHaveText("Needs a new check · Wording changed since the last check (version 1)");
  });

  test("a blocking sentence keeps the suggested wording; typing the sentence back makes Apply unavailable", async ({ page }) => {
    await openHarbor(page);
    await openCard(page, "wording:guaranteed-completion");
    await page.getByRole("button", { name: "Edit sentence 2" }).click();
    const field = page.getByLabel("Suggested wording (you can edit it)");
    await expect(field).toHaveValue("We are working towards completion by 30 June.");
    const apply = page.locator('[data-key="apply-wording"]');
    await expect(apply).not.toHaveAttribute("aria-disabled", /.*/);
    await field.fill("Completion is guaranteed by 30 June. ");
    await expect(apply).toHaveAttribute("aria-disabled", "true");
  });
});

// Found by the comprehension test on the three-column page (docs/5-evaluation/comprehension-test.md).
test.describe("Three-column comprehension test · what the readers found", () => {
  test("only the paragraph added after the check is marked Changed, not the ones after it", async ({ page }) => {
    await openHarbor(page, "#/jump/edited-after-approval");
    const tags = page.locator(".mail .para:has(.changed-tag)");
    await expect(tags).toHaveCount(1);
    await expect(tags).toContainText("We'll share the call notes after Friday.");
  });

  test("the card that opens by itself is marked Next, so the coordinator's turn comes first (TC4)", async ({ page }) => {
    await openHarbor(page, "#/jump/escalated-first");
    const head = page.locator('[data-key="card-head-wording-guaranteed-completion"]');
    await expect(page.locator('[data-key="next-tag"]')).toHaveCount(1);
    await expect(head).toHaveAttribute("aria-describedby", "next-tag");
    await expect(page.locator('[data-key="answer-as-dana"]')).not.toHaveAttribute("aria-describedby", /next-tag/);
    await head.click(); // closing the card takes the mark away
    await expect(page.locator('[data-key="next-tag"]')).toHaveCount(0);
  });

  test("when the check must run first, Next is on Run check or Try again, not on the open card (TC4, second round)", async ({ page }) => {
    for (const [jump, label, card] of [
      ["#/jump/edited-after-approval", "Run check", "card-head-recipient-p-sam"],
      ["#/jump/review-unavailable", "Try again", "card-head-wording-guaranteed-completion"],
    ]) {
      await openHarbor(page, jump);
      await expect(page.locator('[data-key="next-tag"]')).toHaveCount(1);
      const check = page.locator('[data-key="run-check"]');
      await expect(check).toHaveText(label);
      await expect(check).toHaveAttribute("aria-describedby", /next-tag/);
      await expect(page.locator(`[data-key="${card}"]`)).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator(`[data-key="${card}"]`)).not.toHaveAttribute("aria-describedby", /next-tag/);
    }
    // While review is unavailable "Try again" is the only filled button (third round).
    await expect(page.locator('[data-key="edit-sentence-2"]')).not.toHaveClass(/btn-primary/);
  });

  test("under the final review nothing behind it is marked Next", async ({ page }) => {
    await openApp(page, "#/jump/ready"); // the jump opens the final review
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator('[data-key="next-tag"]')).toHaveCount(0);
  });

  test("in the list the time is read apart from the state", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await expect(page.getByRole("link", { name: /^Timeline update\s· Waiting for Dana Whitfield since \d\d:\d\d\s· \d\d:\d\d$/ })).toBeVisible();
  });
});

// The observations the comprehension test left open (docs/5-evaluation/comprehension-test.md, decisions OA1–OA11).
test.describe("OA · open observations of the comprehension test", () => {
  test("OA1 · a removed recipient is outside the list of recipients, named as removed from its field", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="remove-p-sam"]').click();
    await expect(page.locator("#field-cc + .chips-row .chips")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Removed from CC: Sam Lee" })).toBeVisible();
  });

  test("OA3 · OA5 · the Simulation button says what it holds; the empty centre asks to pick a draft", async ({ page }) => {
    await openApp(page, "#/drafts");
    await expect(page.locator('[data-key="banner-simulation"]')).toHaveAttribute("aria-describedby", "sim-sub");
    await expect(page.locator("#sim-sub")).toHaveText("Demo controls: the deal owner's answer, check outage, things to try, jumps.");
    // GA11: on a wide screen there is no empty centre any more: the drafts open on Project Harbor.
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    await expect(page.locator('[data-key="drafts-pick"]')).toHaveCount(0);
  });

  test("OA7 · the phrase names whose approval is outdated, and whom to ask again", async ({ page }) => {
    await openHarbor(page, "#/jump/edited-after-approval");
    await expect(phrase(page)).toHaveText("Needs a new check · Wording changed since the last check (version 2) · Approval for Sam Lee outdated");
    await expect(page.locator('[data-key="outdated-request"]')).toContainText("request again from Dana Whitfield.");
  });

  test("OA8 · Answer as Dana sits in a simulation frame that says who answers in the real tool", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    const frame = page.locator(".answer.is-simulation");
    await expect(frame).toContainText("In the real tool, Dana Whitfield answers from their own inbox. Here you answer for them.");
    await expect(frame.locator('[data-key="answer-as-dana"]')).toBeVisible();
  });

  test("OA9 · the closed warning card says what it is about and that it does not block", async ({ page }) => {
    await openHarbor(page);
    await expect(page.locator('[data-key="card-head-wording-timing-expectation"]')).toContainText("Warning · Sets a timing expectation for the client · Doesn't block");
  });

  test("OA10 · OA11 · the blocked button says why it is there; after a jump the banner lists the versions of its path", async ({ page }) => {
    await openHarbor(page, "#/jump/review-unavailable");
    await expect(page.locator('[data-key="review-before-sending"]')).toHaveText("See why you can't send");
    await expect(page.locator('[data-key="banner-path"]')).toHaveText("On this path: version 2, Sam Lee removed.");
    await openApp(page, "#/jump/sent");
    await expect(page.locator('[data-key="banner-path"]')).toHaveText("On this path: version 2, Sam Lee removed · version 3, wording changed in paragraph 3.");
  });
});
