// Every row of the state tables (docs/4-design/screens-and-states.md § 5) is
// reached with commands and rendered in the three-column page
// (docs/4-design/structure.md § 4): the verdict, the cards, the bar under the draft —
// phrase, icon shape, rule, actions and accessible names.
// NeedsCheck has no rendering in the prototype (decision UF12).
import { test, expect, openApp, WIDE } from "./helpers.mjs";
import { openHarbor, phrase, status, row, runCheck, reword, requestException, decideAsDana, samCard, card, openCard, openSimulation } from "./a2-helpers.mjs";

test.use({ viewport: WIDE });

const iconOf = (locator) => locator.locator("svg use").first().getAttribute("href");
const ruleOf = (locator) => locator.evaluate((el) => [...el.classList].find((c) => c.startsWith("rule-")));
const statePhrase = (page) => page.locator(".verdict .state-phrase");
const explanation = (c) => c.locator(".card-body p.tabular");

test.describe("§ 5.3 Draft.status in the verdict and the bar", () => {
  test("Blocked (initial)", async ({ page }) => {
    await openHarbor(page);
    await expect(phrase(page)).toHaveText("Blocked · Check up to date · 2 blocking issues · Can't send yet");
    expect(await iconOf(statePhrase(page))).toBe("#i-octagon");
    await expect(page.locator(".phrase-head")).toHaveText("Blocked");
    await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: 2 blocking issues need action.");
    await expect(page.locator('[data-key="review-before-sending"]')).toHaveAttribute("aria-describedby", "r6-reason");
  });

  test("Blocked (declined)", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await decideAsDana(page, "declined", "Sam isn't cleared for Harbor.");
    await expect(phrase(page)).toHaveText("Blocked · Check up to date · Dana Whitfield declined an exception · Can't send yet");
    await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: Dana Whitfield declined the exception for Sam Lee. Remove Sam Lee to continue.");
  });

  test("Blocked (approval outdated)", async ({ page }) => {
    await openHarbor(page, "#/jump/edited-after-approval");
    await runCheck(page);
    await expect(phrase(page)).toHaveText("Blocked · Check up to date · Approval for Sam Lee outdated · Can't send yet");
    await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: Dana Whitfield's approval covers version 2 only. Request again.");
  });

  test("NeedsNewCheck, with What changed", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="remove-p-sam"]').click();
    await expect(phrase(page)).toHaveText("Needs a new check · Recipients changed since the last check (version 1)");
    expect(await iconOf(statePhrase(page))).toBe("#i-arrows");
    await expect(page.locator('[data-key="run-check"]')).toHaveText("Run check");
    await expect(page.locator('[data-key="what-changed"]')).toContainText("What changed since the last check");
    await expect(page.locator('[data-key="what-changed"] li')).toHaveText(["Sam Lee removed"]);
    await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: the message changed. Run the check again.");
  });

  test("WaitingForDecision", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await expect(phrase(page)).toHaveText(/^Waiting for decision\s· Requested from Dana Whitfield at \d\d:\d\d$/);
    expect(await iconOf(statePhrase(page))).toBe("#i-clock");
    // The deal owner answers in the foreground, from here (TC8).
    await expect(page.locator(".verdict .answer")).toContainText(/^Simulation\s· Waiting for Dana Whitfield since \d\d:\d\d\./);
    await expect(page.locator('[data-key="answer-as-dana"]')).toHaveText("Answer as Dana Whitfield");
    await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: waiting for Dana Whitfield's decision on Sam Lee.");
  });

  test("ReviewUnavailable", async ({ page }) => {
    await openHarbor(page, "#/jump/review-unavailable");
    await expect(phrase(page)).toHaveText("Check unavailable · Your draft is saved. Sending stays blocked until the check runs.");
    expect(await iconOf(statePhrase(page))).toBe("#i-cloud-off");
    const actions = page.locator(".verdict .actions").first();
    await expect(actions.locator("button, a")).toHaveText(["Try again", "Keep editing"]); // the list is beside the draft (TC1)
    await expect(page.locator('[data-key="summary-earlier"]')).toContainText("Still open from the last check (version 1, may be out of date):"); // UR4
    await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: review is unavailable. Your draft is saved.");
  });

  test("ReadyToSend", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="remove-p-sam"]').click();
    await reword(page, 2);
    await runCheck(page);
    await expect(phrase(page)).toHaveText("Ready to send · Check up to date (version 3) · 1 warning unchanged");
    expect(await iconOf(statePhrase(page))).toBe("#i-check-circle");
    const review = page.locator('[data-key="review-before-sending"]');
    await expect(review).toHaveClass(/btn-primary/);
    // Nothing blocks: the button is the next step, marked "Next" (TC4).
    await expect(review).toHaveAttribute("aria-describedby", "next-tag");
    await expect(page.locator("#r6-reason")).toHaveText("You can send: check up to date (version 3), no blocking issues open.");
  });

  test("Sent opens the record", async ({ page }) => {
    await openApp(page, "#/jump/sent");
    await openApp(page, "#/drafts/harbor");
    await expect(page).toHaveURL(/#\/drafts\/harbor\/record$/);
  });

  test("Checking… is transient, busy, and leaves R6 unchanged", async ({ page }) => {
    await page.clock.install();
    await openHarbor(page);
    await page.locator('[data-key="remove-p-sam"]').click();
    const reason = await page.locator("#r6-reason").textContent();
    await page.locator('[data-key="run-check"]').click();
    await expect(phrase(page)).toHaveText("Checking…");
    await expect(page.locator('[data-key="run-check"]')).toHaveAttribute("aria-busy", "true");
    expect(await iconOf(statePhrase(page))).toBe("#i-activity");
    await expect(statePhrase(page).locator("svg")).toHaveClass(/spin/);
    await expect(page.locator("#r6-reason")).toHaveText(reason);
    await page.clock.runFor(800);
    await expect(phrase(page)).toHaveText("Blocked · Check up to date · 1 blocking issue · Can't send yet");
  });
});

test.describe("§ 5.5 recipients: chips in the draft, cards in the Review notes", () => {
  test("Note, Blocking · Open with accessible names", async ({ page }) => {
    await openHarbor(page);
    // A person on the deal team is a chip; the details are read, not shown (TC1).
    await expect(row(page, "p-pat")).toHaveText("Pat Morgan · pat.morgan@haldenward.example · Halden & Ward Advisory · Advisor · On deal team");
    await expect(row(page, "p-pat").locator(".visually-hidden")).toHaveCount(1);
    // Sam's chip is a button that opens the card, with the card's name.
    await expect(row(page, "p-sam")).toHaveAccessibleName("Sam Lee: Blocking · Not on the deal team");
    expect(await iconOf(row(page, "p-sam"))).toBe("#i-octagon");
    const sam = await samCard(page);
    await expect(sam.locator(".card-body .meta")).toHaveText("CC · sam.lee@corvane.example · Corvane Holdings");
    await expect(explanation(sam)).toHaveText("Blocking · Not on the deal team · Works at Corvane Holdings, the client, but isn't listed on the Project Harbor deal team. Remove Sam Lee, or ask deal owner Dana Whitfield to approve an exception.");
    expect(await iconOf(sam)).toBe("#i-octagon");
    expect(await ruleOf(sam)).toBe("rule-blocks");
    await expect(sam.getByRole("button", { name: "Remove Sam Lee" })).toBeVisible();
    await expect(sam.getByRole("button", { name: "Request owner exception for Sam Lee" })).toHaveText("Request owner exception");
  });

  test("Pending", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    const sam = await samCard(page);
    await expect(explanation(sam)).toHaveText(/^Pending\s· Not on the deal team\s· Requested from Dana Whitfield at \d\d:\d\d\s· Not approved yet\. Sending stays blocked\.$/);
    expect(await iconOf(sam)).toBe("#i-clock");
    // The reason stays on the row and removing stays possible while waiting (US4).
    await expect(sam.locator(".card-body").getByRole("button")).toHaveText(["Remove Sam Lee"]);
    await expect(sam).not.toContainText("You'll need to ask again."); // nothing to ask again once Sam is removed
  });

  test("Approved", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await decideAsDana(page, "approved");
    const sam = await samCard(page);
    await expect(explanation(sam)).toHaveText(/^Approved by Dana Whitfield\s· \d\d:\d\d\s· for version 2\s· Simulated owner response$/);
    expect(await iconOf(sam)).toBe("#i-check-circle");
    expect(await ruleOf(sam)).toBe("rule-none");
  });

  test("Approved on an earlier version", async ({ page }) => {
    await openHarbor(page, "#/jump/edited-after-approval");
    await runCheck(page);
    const sam = await samCard(page);
    await expect(explanation(sam)).toHaveText("Blocking · Not on the deal team · Approved on version 2 · doesn't cover version 3");
    await expect(sam.getByRole("button", { name: "Remove Sam Lee" })).toBeVisible(); // both ways stay open (US4)
    expect(await iconOf(sam)).toBe("#i-check-struck");
    await expect(sam.getByRole("button", { name: "Request again for Sam Lee" })).toHaveText("Request again");
  });

  test("Request superseded, never decided", async ({ page }) => {
    await openHarbor(page);
    await requestException(page, "recipient:p-sam");
    await reword(page, 2);
    await runCheck(page);
    const sam = await samCard(page);
    await expect(explanation(sam)).toHaveText("Blocking · Not on the deal team · Your request to Dana Whitfield was for version 1.");
    await expect(sam.getByRole("button", { name: "Remove Sam Lee" })).toBeVisible();
    expect(await iconOf(sam)).toBe("#i-clock-struck");
    await expect(sam.getByRole("button", { name: "Request again for Sam Lee" })).toBeVisible();
    await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: your request to Dana Whitfield was for version 1. Request again.");
  });

  test("Declined", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await decideAsDana(page, "declined", "Sam isn't cleared for Harbor.");
    const sam = await samCard(page);
    await expect(explanation(sam)).toHaveText(/^Blocking\s· Not on the deal team\s· Declined by Dana Whitfield\s· \d\d:\d\d\s· 'Sam isn't cleared for Harbor\.'$/);
    expect(await iconOf(sam)).toBe("#i-x-circle");
    await expect(sam.getByRole("button", { name: "Remove Sam Lee" })).toHaveClass(/btn-primary/);
    await expect(sam.getByRole("button", { name: "Request again for Sam Lee" })).toBeVisible();
  });

  test("Removed, until the check", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="remove-p-sam"]').click();
    const sam = await samCard(page);
    await expect(sam).toContainText("Removed · The next check confirms it"); // the name is the title, not repeated (UR7)
    await expect(sam.getByRole("button", { name: "Undo removing Sam Lee" })).toHaveText("Undo");
    // The chip stays, struck through, until the check (screens-and-states.md § 5.5).
    await expect(page.locator(".chip.is-removed")).toHaveText("Sam Lee");
    await runCheck(page);
    await expect(card(page, "recipient:p-sam")).toHaveCount(0);
    await expect(page.locator(".chip.is-removed")).toHaveCount(0);
  });
});

test.describe("§ 5.6 flagged sentences", () => {
  test("Blocking · Open and Warning, linked to their explanations", async ({ page }) => {
    await openHarbor(page);
    const blocking = page.locator(".flag-blocking");
    await expect(blocking).toHaveText("Completion is guaranteed by 30 June.");
    await expect(page.locator(".flag-warning")).toHaveText("The diligence workstreams are on track and we expect the remaining data-room requests to close this week.");
    // A marker opens its card and points to it (TC5).
    for (const n of [1, 2]) {
      const marker = page.locator(`[data-key="marker-${n}"]`);
      await expect(marker).toHaveText(`[${n}]`);
      const id = await marker.getAttribute("aria-controls");
      await marker.click();
      await expect(page.locator(`#${id} .card-head`)).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator(`#exp-${n}`)).toBeVisible();
      if (n === 1) await expect(page.locator("#exp-1")).toHaveText("Warning · Sets a timing expectation for the client. It doesn't block sending: confirm the timing yourself before you send.");
    }
    expect(await ruleOf(card(page, "wording:timing-expectation"))).toBe("rule-warning");
    await page.locator('[data-key="marker-2"]').click();
    await expect(page.locator("#exp-2")).toHaveText("Blocking · Flagged wording · States completion as certain. The firm can't guarantee deal outcomes. Edit the sentence, or ask Dana Whitfield to approve an exception.");
    await expect(page.getByRole("button", { name: "Edit sentence 2" })).toHaveText("Edit sentence");
    await expect(page.getByRole("button", { name: "Request owner exception for flagged sentence 2" })).toBeVisible();
  });

  test("Editor open, Changed, Fixed", async ({ page }) => {
    await openHarbor(page);
    await openCard(page, "wording:guaranteed-completion");
    await page.locator('[data-key="edit-sentence-2"]').click();
    await expect(page.getByText("Original", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Suggested wording (you can edit it)")).toHaveValue("We are working towards completion by 30 June.");
    await page.locator('[data-key="apply-wording"]').click();
    await expect(page.locator(".mail .changed-tag")).toHaveText("Changed");
    const changed = card(page, "wording:guaranteed-completion");
    await expect(changed.locator(".card-type")).toHaveText("Changed · Wording changed. Run the check again.");
    await openCard(page, "wording:guaranteed-completion");
    await expect(page.getByRole("button", { name: "Undo rewording" })).toBeVisible();
    await runCheck(page);
    await expect(page.locator(".flag-blocking")).toHaveCount(0);
    await expect(page.locator(".resolved li")).toHaveText(["Guaranteed completion — reworded (version 2)"]);
  });

  test("Pending and Approved on the sentence read like the rows", async ({ page }) => {
    await openHarbor(page);
    await requestException(page, "wording:guaranteed-completion", "The client asked for a firm date.");
    await openCard(page, "wording:guaranteed-completion");
    await expect(page.locator("#exp-2")).toHaveText(/^Pending\s· Requested from Dana Whitfield at \d\d:\d\d\s· Not approved yet\. Sending stays blocked\.$/);
    await decideAsDana(page, "approved");
    await openCard(page, "wording:guaranteed-completion");
    await expect(page.locator("#exp-2")).toHaveText(/^Approved by Dana Whitfield\s· \d\d:\d\d\s· for version 1\s· Simulated owner response$/);
    expect(await ruleOf(card(page, "wording:guaranteed-completion"))).toBe("rule-none");
  });

  test("Declined on the sentence: Edit sentence becomes the primary action", async ({ page }) => {
    await openHarbor(page);
    await requestException(page, "wording:guaranteed-completion", "The client asked for a firm date.");
    await decideAsDana(page, "declined");
    await openCard(page, "wording:guaranteed-completion");
    await expect(page.locator("#exp-2")).toHaveText(/^Blocking\s· Declined by Dana Whitfield\s· \d\d:\d\d$/);
    await expect(page.getByRole("button", { name: "Edit sentence 2" })).toHaveClass(/btn-primary/);
    await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: Dana Whitfield declined the exception for Guaranteed completion. Edit the sentence to continue.");
  });
});

test.describe("§ 5.4 counts as the headings of the card groups (TC3)", () => {
  test("counts in words and the Resolved list", async ({ page }) => {
    await openHarbor(page);
    await expect(page.locator("#notes .group-head")).toHaveText(["2 blocking", "1 warning"]);
    await page.locator('[data-key="remove-p-sam"]').click();
    await reword(page, 2);
    await runCheck(page);
    await expect(page.locator("#notes .group-head")).toHaveText(["1 warning", "Resolved"]);
    await expect(page.locator(".resolved li")).toHaveText(["Sam Lee — removed (version 2)", "Guaranteed completion — reworded (version 3)"]);
  });
});

test("one status live region in the verdict; the alert only after a failed check", async ({ page }) => {
  await openHarbor(page);
  await expect(page.locator(".verdict [role=status]")).toHaveCount(1);
  await expect(page.locator("#workspace [role=status]")).toHaveCount(1);
  await expect(page.locator('[data-key="r2-alert"]')).toHaveText("");
  await page.locator('[data-key="remove-p-sam"]').click();
  await expect(status(page)).toHaveText("Needs a new check · Recipients changed since the last check (version 1)");
  // Once announced, the region empties: the phrase is read once, in the verdict (OA2).
  await expect(status(page)).toHaveText("", { timeout: 6000 });
  await expect(phrase(page)).toHaveText("Needs a new check · Recipients changed since the last check (version 1)");
  await openSimulation(page);
  await page.getByRole("switch", { name: "Simulate check outage" }).check();
  await page.keyboard.press("Escape");
  await runCheck(page);
  await expect(page.locator('[data-key="r2-alert"]')).toHaveText("Check unavailable · Your draft is saved. Sending stays blocked until the check runs.");
  await runCheck(page);
  await expect(page.locator('[data-key="r2-alert"]')).toHaveText("Check unavailable · Your draft is saved. Sending stays blocked until the check runs.");
});
