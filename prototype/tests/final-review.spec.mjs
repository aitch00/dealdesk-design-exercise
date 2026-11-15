// A3 · review before sending, over the draft, and A4 · review record in the
// page (docs/4-design/screens-and-states.md § 8, § 9; UC-09, UC-10, UC-11, TC1).
import { test, expect, openApp, expectFocus, noHorizontalScroll, WIDE, NARROW } from "./helpers.mjs";
import { decideAsDana } from "./a2-helpers.mjs";

test.describe("wide", () => {
  test.use({ viewport: WIDE });

  test("after fixing both issues: the three answers and You can send (F2 9)", async ({ page }) => {
    await openApp(page, "#/jump/ready");
    await expectFocus(page, { key: "a3-title", text: "Review before sending · Project Harbor" });
    await expect(page).toHaveTitle("Project Harbor · Review before sending · DealDesk sample");
    // A dialog over the draft: the page behind is inert (TC1).
    await expect(page.getByRole("dialog")).toHaveAccessibleName("Review before sending · Project Harbor");
    expect(await page.locator("#workspace").evaluate((el) => el.inert)).toBe(true);
    const going = page.locator('[aria-labelledby="a3-going"]');
    await expect(going.locator("li")).toHaveText([
      "Pat Morgan · pat.morgan@haldenward.example · Halden & Ward Advisory · Advisor",
      "Alex Rivera · alex.rivera@corvane.example · Corvane Holdings · Client representative",
      "Removed in version 2 · Sam Lee",
    ]);
    const message = page.locator('[aria-labelledby="a3-message"]');
    await expect(message.locator(".changed-tag")).toHaveText(["Warning · unchanged", "Changed"]);
    await expect(page.locator('[aria-labelledby="a3-approved"]')).toContainText("No exceptions used");
    await expect(page.locator("#a3-verdict-title")).toHaveText("You can send");
    await expect(page.locator("#a3-verdict")).toHaveText("Check up to date (version 3), no blocking issues open."); // the heading says "You can send" (UR4)
    await expect(page.getByText("Automated checks can miss things. Read the final message before sending.")).toBeVisible();
    const send = page.locator('[data-key="send"]');
    await expect(send).toHaveClass(/btn-primary/);
    await expect(send).not.toHaveAttribute("aria-disabled", "true");
    await expect(send).toHaveAttribute("aria-describedby", "a3-verdict");
  });

  test("Send (simulated) opens the record, announces it, and A2 redirects there (F2 9–10)", async ({ page }) => {
    await openApp(page, "#/jump/ready");
    await page.locator('[data-key="send"]').click();
    await expect(page).toHaveURL(/#\/drafts\/harbor\/record$/);
    await expectFocus(page, { key: "a4-title", text: "Review record · Project Harbor" });
    await expect(page.locator('[data-key="a4-status"]')).toHaveText("Sent (simulated).");
    await expect(page.locator("#notes .data-line")).toHaveText(/^Sent \(simulated\) to Pat Morgan and Alex Rivera at \d\d:\d\d\s· Version 3\s· No real email left the sample\.$/);
    await expect(page.locator('[aria-labelledby="a4-to"] li')).toHaveText(["Pat Morgan", "Alex Rivera"]);
    await expect(page.locator('[aria-labelledby="a4-removed"] li')).toHaveText(["Sam Lee · Removed in version 2"]);
    await expect(page.locator('[aria-labelledby="a4-issues"] li')).toHaveText([
      "Sam Lee: removed (version 2)", "Guaranteed completion: reworded (version 3)", "Timing expectation: warning unchanged",
    ]);
    await expect(page.locator('[aria-labelledby="a4-decisions"]')).toContainText("No exceptions used");
    await openApp(page, "#/drafts/harbor");
    await expect(page).toHaveURL(/#\/drafts\/harbor\/record$/);
  });

  test("the sent message is read-only in the centre, the record beside it (TC1, replaces UF23)", async ({ page }) => {
    await openApp(page, "#/jump/sent");
    await expect(page.locator(".mail-head .data")).toHaveText("Sent message (version 3)");
    await expect(page.locator("#sent-message")).toContainText("We are working towards completion by 30 June.");
    await expect(page.locator("#sent-message .chips")).not.toContainText("Sam Lee");
    await expect(page.locator("#sent-message .mail-bar")).toContainText(/Sent \(simulated\) to Pat Morgan and Alex Rivera at \d\d:\d\d\s· Version 3\s· No real email left the sample\./);
    await expect(page.locator("#sent-message textarea, #sent-message [data-key='edit-message']")).toHaveCount(0);
  });

  test("with a pending request: You can't send yet, aria-disabled, the press does nothing (AE4, UC-10 1a)", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await openApp(page, "#/drafts/harbor/review");
    await expect(page.locator("#a3-verdict-title")).toHaveText("You can't send yet");
    await expect(page.locator("#a3-verdict")).toHaveText("Can't send yet: waiting for Dana Whitfield's decision on Sam Lee. Fix this in the draft");
    const send = page.locator('[data-key="send"]');
    await expect(send).toHaveAttribute("aria-disabled", "true");
    await send.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-key="a3-status"]')).toHaveText("Can't send yet: waiting for Dana Whitfield's decision on Sam Lee.");
    await expect(page).toHaveURL(/#\/drafts\/harbor\/review$/);
    await expectFocus(page, { key: "send" });
    const color = await send.evaluate((el) => getComputedStyle(el).color);
    expect(color).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("after the deal owner approves, the final review lists the exception and the record keeps it (F3 5–6)", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await decideAsDana(page, "approved");
    await page.locator('[data-key="review-before-sending"]').click();
    await expect(page.locator("#a3-verdict-title")).toHaveText("You can send");
    await expect(page.locator('[aria-labelledby="a3-approved"] li')).toHaveText(/^Sam Lee by Dana Whitfield, \d\d:\d\d, for version 2$/);
    await expect(page.locator('[aria-labelledby="a3-going"]')).toContainText("Sam Lee · sam.lee@corvane.example · Corvane Holdings · Not on the deal team");
    await page.locator('[data-key="send"]').click();
    await expect(page.locator('[aria-labelledby="a4-decisions"] li')).toHaveText(/^Sam Lee: approved by Dana Whitfield, \d\d:\d\d, for version 2$/);
    await expect(page.locator('[aria-labelledby="a4-issues"] li')).toContainText([/^Sam Lee: approved by Dana Whitfield \(version 2\)$/]);
  });

  test("the link in the reason and Back to draft lead to A2; Back to draft focuses Review before sending", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await openApp(page, "#/drafts/harbor/review");
    await page.locator('[data-key="back-to-draft"]').click();
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    await expectFocus(page, { key: "review-before-sending" });
    await page.locator('[data-key="review-before-sending"]').click();
    await expectFocus(page, { key: "a3-title" });
    await page.locator('[data-key="fix-link"]').click();
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    await page.locator('[data-key="review-before-sending"]').click();
    await expectFocus(page, { key: "a3-title" });
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Restart sample from the record returns to the seed", async ({ page }) => {
    await openApp(page, "#/jump/sent");
    await page.locator('[data-key="record-restart"]').click();
    await page.locator('[data-key="restart-confirm"]').click();
    await expectFocus(page, { tag: "h1", text: "Project Harbor" });
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
  });

  test("in the list Harbor shows as sent", async ({ page }) => {
    await openApp(page, "#/jump/sent");
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Sent (simulated)");
    await expect(page.locator('.list-item[aria-current="page"] svg use')).toHaveAttribute("href", "#i-send");
  });
});

test.describe("narrow", () => {
  test.use({ viewport: NARROW });

  test("A3 keeps the order; the verdict and Send stay fixed at the bottom, Back to draft at the top (MB4)", async ({ page }) => {
    await openApp(page, "#/jump/ready");
    await expect(page.locator(".view-review .send-area")).toHaveCSS("position", "sticky");
    await expect(page.locator('[data-key="send"]')).toBeInViewport();
    await expect(page.locator('[data-key="back-to-draft-top"]')).toBeVisible();
    await expect(page.locator('[data-key="back-to-draft"]')).toBeHidden();
    const tops = await page.evaluate(() => ["#a3-going", "#a3-message", "#a3-approved"]
      .map((s) => document.querySelector(s).getBoundingClientRect().top));
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("at 320 px A3 and A4 reflow", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openApp(page, "#/jump/ready");
    expect(await noHorizontalScroll(page)).toBe(true);
    await openApp(page, "#/jump/sent");
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});
