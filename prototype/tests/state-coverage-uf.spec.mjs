// The rows added to the state tables (docs/4-design/screens-and-states.md § 5)
// by decisions UF26–UF29: counts by who must act, what an edit makes outdated, the state of each exception in A3, and the
// severity word first. Every state is built through the interface.
import { test, expect, openApp, WIDE } from "./helpers.mjs";
import { openHarbor, phrase, row, runCheck, reword, requestException, decideAsDana, samCard, openCard } from "./a2-helpers.mjs";

// The counts are the headings of the card groups (TC3).
const heads = (page) => page.locator("#notes .notes-groups .group-head");

test.use({ viewport: WIDE });

const openReview = async (page) => {
  await page.locator('[data-key="review-before-sending"]').click();
  await expect(page.locator('[data-key="a3-title"]')).toBeVisible();
};
const going = (page) => page.locator('[aria-labelledby="a3-going"]');
const approved = (page) => page.locator('[aria-labelledby="a3-approved"]');

test.describe("UF26 · counts by who must act", () => {
  test("Sam waiting, wording still open: the verdict, the groups, the bar and the list agree", async ({ page }) => {
    await openHarbor(page);
    await requestException(page, "recipient:p-sam");
    await expect(phrase(page)).toHaveText("Blocked · Check up to date · 1 blocking issue · 1 waiting for Dana Whitfield · Can't send yet");
    await expect(heads(page)).toHaveText(["1 blocking", "1 waiting for decision", "1 warning"]);
    await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: 1 blocking issue needs action. Also waiting for Dana Whitfield's decision on Sam Lee."); // US14
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 1 blocking issue · 1 waiting for Dana Whitfield");
  });

  test("an approved exception is counted as approved, not as blocking", async ({ page }) => {
    await openHarbor(page);
    await requestException(page, "recipient:p-sam");
    await decideAsDana(page, "approved");
    await expect(phrase(page)).toHaveText("Blocked · Check up to date · 1 blocking issue · Can't send yet");
    await expect(heads(page)).toHaveText(["1 blocking", "1 approved", "1 warning"]);
  });
});

test.describe("UF27 · what an edit makes outdated", () => {
  test("approval outdated before the check", async ({ page }) => {
    await openHarbor(page, "#/jump/edited-after-approval");
    await expect(phrase(page)).toHaveText("Needs a new check · Wording changed since the last check (version 2) · Approval for Sam Lee outdated");
    await expect(page.locator('[data-key="outdated-request"]')).toHaveText(
      "Dana Whitfield's approval for Sam Lee covered version 2. If it's still flagged after the check, request again from Dana Whitfield.");
    // Which check the cards come from is said once, in their heading (UR4), not again in the verdict.
    await expect(page.getByText("From an earlier check")).toHaveCount(0);
    // Request again comes after the check; removing stays possible and the card says when to ask (US4).
    await expect((await samCard(page)).locator(".card-body").getByRole("button")).toHaveText(["Remove Sam Lee", "Run check"]); // the check is offered in the card (VA7)
    await expect((await samCard(page)).locator('[data-key="request-after-check"]')).toHaveText("You can request an exception once the check is up to date.");
    // What is still open, and which check found it (US15), as the heading of the cards.
    await expect(page.locator('[data-key="summary-earlier"]')).toHaveText("Still open from the last check (version 2, may be out of date): 1 blocking (Sam Lee) · 1 warning");
  });

  test("request outdated, never decided, before the check", async ({ page }) => {
    await openHarbor(page);
    await requestException(page, "recipient:p-sam");
    await reword(page, 2);
    await expect(phrase(page)).toHaveText("Needs a new check · Wording changed since the last check (version 1) · Request for Sam Lee outdated");
    await expect(page.locator('[data-key="outdated-request"]')).toHaveText(
      "Your request to Dana Whitfield for Sam Lee was for version 1. If it's still flagged after the check, request again from Dana Whitfield.");
  });

  test("an edit with no request adds nothing", async ({ page }) => {
    await openHarbor(page);
    await reword(page, 2);
    await expect(phrase(page)).toHaveText("Needs a new check · Wording changed since the last check (version 1)");
    await expect(page.locator('[data-key="outdated-request"]')).toHaveCount(0);
  });
});

test.describe("UF28 · the state of each exception in A3", () => {
  test("pending: marked in Going to, listed as not approved, the sentence marked Blocking", async ({ page }) => {
    await openHarbor(page);
    await requestException(page, "recipient:p-sam");
    await openReview(page);
    await expect(page.locator('[data-key="a3-p-sam"]')).toHaveText("Sam Lee · sam.lee@corvane.example · Corvane Holdings · Not on the deal team · Pending");
    await expect(page.locator('[data-key="a3-blocking-sentence"] .changed-tag')).toHaveText("Blocking");
    await expect(approved(page)).not.toContainText("No exceptions used");
    await expect(approved(page)).toContainText("Nothing approved for version 1.");
    await expect(page.locator('[data-key="a3-not-approved"] li')).toHaveText([/^Sam Lee\s· Pending: requested from Dana Whitfield at \d\d:\d\d$/]);
    await expect(page.getByRole("heading", { name: "Not approved" })).toBeVisible();
  });

  test("approved for this version", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await decideAsDana(page, "approved");
    await openReview(page);
    await expect(page.locator('[data-key="a3-p-sam"]')).toContainText("Not on the deal team · Approved for version 2");
    await expect(approved(page)).toContainText(/Sam Lee by Dana Whitfield, \d\d:\d\d, for version 2/);
    await expect(page.locator('[data-key="a3-not-approved"]')).toHaveCount(0);
  });

  test("approval outdated by an edit, with the earlier-check note", async ({ page }) => {
    await openHarbor(page, "#/jump/edited-after-approval");
    await openReview(page);
    await expect(page.locator('[data-key="a3-earlier"]')).toHaveText("From an earlier check (version 2). May be out of date.");
    await expect(page.locator('[data-key="a3-p-sam"]')).toContainText("Approved on version 2 · doesn't cover version 3");
    await expect(page.locator('[data-key="a3-not-approved"] li')).toHaveText(["Sam Lee · Approved on version 2 · doesn't cover version 3"]);
    await expect(approved(page)).toContainText("Nothing approved for version 3.");
  });

  test("declined", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await decideAsDana(page, "declined");
    await openReview(page);
    await expect(page.locator('[data-key="a3-p-sam"]')).toContainText("Not on the deal team · Declined");
    await expect(page.locator('[data-key="a3-not-approved"] li')).toHaveText([/^Sam Lee\s· Declined by Dana Whitfield, \d\d:\d\d$/]);
  });

  test("no request: No exceptions used", async ({ page }) => {
    await openApp(page, "#/jump/ready");
    await expect(approved(page)).toContainText("No exceptions used");
    await expect(page.locator('[data-key="a3-earlier"]')).toHaveCount(0);
  });

  test("a request on a recipient removed afterwards is not listed", async ({ page }) => {
    await openHarbor(page);
    await requestException(page, "recipient:p-sam");
    await page.locator('[data-key="edit-message"]').click();
    const proceed = page.locator('[data-key="continue-editing"]');
    if (await proceed.isVisible()) await proceed.click();
    await page.locator('[data-key="edit-remove-p-sam"]').click();
    await page.locator('[data-key="save-changes"]').click();
    await runCheck(page);
    await openReview(page);
    await expect(page.locator('[data-key="a3-not-approved"]')).toHaveCount(0);
    await expect(approved(page)).toContainText("No exceptions used");
  });
});

test.describe("UF29 · the severity word comes first", () => {
  test("rows and sentences that need the coordinator start with Blocking; Pending and Approved do not", async ({ page }) => {
    await openHarbor(page);
    await expect((await samCard(page)).locator(".card-body strong").first()).toHaveText("Blocking");
    await openCard(page, "wording:guaranteed-completion");
    await expect(page.locator("#exp-2 .label-word").first()).toHaveText("Blocking");
    await openCard(page, "wording:timing-expectation");
    await expect(page.locator("#exp-1 .label-word").first()).toHaveText("Warning");
    await requestException(page, "recipient:p-sam");
    await expect((await samCard(page)).locator(".card-body strong").first()).toHaveText("Pending");
    await decideAsDana(page, "approved");
    await expect((await samCard(page)).locator(".card-body strong").first()).toHaveText("Approved");
  });
});

test.describe("UF30 · the jump in the brief's order", () => {
  test("lands with Sam waiting and the sentence still to fix", async ({ page }) => {
    await openHarbor(page, "#/jump/escalated-first");
    await expect(page.locator('[data-key="a2-title"]')).toBeVisible();
    await expect(phrase(page)).toHaveText("Blocked · Check up to date · 1 blocking issue · 1 waiting for Dana Whitfield · Can't send yet");
    // The sentence still to fix is the open card; Sam waits for Dana (TC4).
    await expect(page.locator('[data-key="card-head-wording-guaranteed-completion"]')).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#exp-2 .label-word").first()).toHaveText("Blocking");
    await expect(await samCard(page)).toContainText("Pending");
    await expect(page.locator('[data-key="banner-jumped"]')).toHaveText("Jumped to: Sam escalated, wording still open. The sample restarted to show this state.");
  });
});

test.describe("UF31 · with the edit open, the final review is not reachable", () => {
  test("the verdict describes the saved version, offers no action, and the final button leads to the mode bar", async ({ page }) => {
    await openApp(page, "#/jump/ready");
    await page.locator('[data-key="back-to-draft"]').click();
    await expect(phrase(page)).toHaveText("Ready to send · Check up to date (version 3) · 1 warning unchanged");
    await page.locator('[data-key="edit-message"]').click();
    await expect(page.locator('[data-key="mode-bar"]')).toBeVisible();
    await expect(phrase(page)).toHaveText("Ready to send · Check up to date (version 3) · 1 warning unchanged");
    await expect(page.locator('[data-key="edit-status-note"]')).toHaveText(
      "This is the status of the saved version (version 3). Your changes aren't saved or checked yet.");
    await expect(page.locator('[data-key="r2-review"]')).toHaveCount(0);
    const review = page.locator('[data-key="review-before-sending"]');
    await expect(review).toHaveAttribute("aria-disabled", "true");
    await expect(review).not.toHaveClass(/btn-primary/);
    await expect(page.locator("#r6-reason")).toHaveText("Can't send yet: save or cancel your changes first.");
    await review.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    await expect.poll(() => page.evaluate(() => document.activeElement.dataset.key)).toBe("mode-bar");
    await page.locator('[data-key="cancel-mode"]').click();
    await expect(page.locator('[data-key="edit-status-note"]')).toHaveCount(0);
    await expect(review).toHaveClass(/btn-primary/);
    await expect(review).not.toHaveAttribute("aria-disabled", "true");
  });

  test("Run check is not offered on the saved version while editing", async ({ page }) => {
    await openHarbor(page);
    await page.locator('[data-key="remove-p-sam"]').click();
    await expect(page.locator('[data-key="run-check"]')).toBeVisible();
    await page.locator('[data-key="edit-message"]').click();
    await expect(page.locator('[data-key="run-check"]')).toHaveCount(0);
    await expect(page.locator('[data-key="edit-status-note"]')).toContainText("(version 2)");
  });
});
