// H · homepage (docs/4-design/screens-and-states.md § 2, UC-12, J3-V1.1; decisions UF16, UF33–UF50).
// The page tells one idea: a deal message can look ready and not be
// (docs/4-design/screens-and-states.md § 2). These tests check the story's order, the
// second look, the cards and sheets, and the versions without script or motion.
import { test, expect, expectFocus, noHorizontalScroll, WIDE, NARROW } from "./helpers.mjs";

const FORBIDDEN = /\b(guarantee\w*|secure\w*|compliant|never|always|100%)\b/i;
const STORY = ["What a second look finds", "What you fix, and what the deal owner decides", "Ready means this version",
  "What DealDesk doesn't do", "Take the second look yourself"];

test.describe("wide", () => {
  test.use({ viewport: WIDE });

  test("the headings, read in order, tell the story (UF45)", async ({ page }) => {
    await page.goto("index.html");
    await expect(page).toHaveTitle("DealDesk · A second look before deal messages leave");
    await expect(page.locator("h1")).toHaveText("A second look before deal messages leave.");
    await expect(page.locator("main h2")).toHaveText(STORY);
    const font = await page.locator("#hero-title").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font).toContain("Newsreader");
  });

  test("the accessibility tree reads the story in the same order (UF45)", async ({ page }) => {
    await page.goto("index.html");
    const tree = await page.locator("main").ariaSnapshot();
    let at = -1;
    for (const text of ["A second look before deal messages leave.", "This message looks ready.", "Project Harbor · draft to the client",
      "Take a second look", ...STORY]) {
      const next = tree.indexOf(text, at + 1);
      expect(next, `"${text}" after position ${at}`).toBeGreaterThan(at);
      at = next;
    }
  });

  test("title and draft side by side; the draft starts as written (UF45, UF46)", async ({ page }) => {
    await page.goto("index.html");
    const title = await page.locator("#hero-title").boundingBox();
    const draft = await page.locator("#draft").boundingBox();
    expect(draft.x).toBeGreaterThan(title.x + title.width - 1);
    await expect(page.locator(".second-look")).toHaveAttribute("data-look", "written");
    await expect(page.locator(".look-summary span:visible")).toHaveText("This message looks ready. Two issues block it, and one is a warning.");
    for (const note of await page.locator("#draft .note").all()) await expect(note).toBeHidden();
    await expect(page.locator("#draft")).toContainText("Completion is guaranteed by 30 June.");
  });

  test("the second look shows the findings next to their lines, and back (UF46)", async ({ page }) => {
    await page.goto("index.html");
    const toggle = page.getByRole("button", { name: "Take a second look" });
    await expect(toggle).toHaveAttribute("aria-controls", "draft");
    await toggle.click();
    await expect(page.locator(".look-summary span:visible")).toHaveText("Two issues block this message, and one is a warning.");
    await expect(page.locator("#draft .note")).toHaveText([
      "Blocking · Not on the deal team · Works at Corvane Holdings, the client, but isn't listed on the Project Harbor deal team.",
      "Warning · Sets a timing expectation for the client. It doesn't block sending: confirm the timing yourself before you send.",
      "Blocking · Flagged wording · States completion as certain. The firm can't guarantee deal outcomes."]);
    await expect(page.locator("#look-status")).toHaveText("Second look: Sam Lee isn't on the deal team. The completion sentence states an outcome as certain. The timing sentence needs a check.");
    await page.getByRole("button", { name: "Show it as written" }).click();
    await expect(page.locator("#look-status")).toHaveText("Showing the message as written.");
    for (const note of await page.locator("#draft .note").all()) await expect(note).toBeHidden();
    expect(await page.evaluate(() => document.activeElement.id)).toBe("look-toggle");
  });

  test("the call to action appears at least twice and opens the sample without sign-up (AC-5)", async ({ page }) => {
    await page.goto("index.html");
    const ctas = page.getByRole("link", { name: "Try the sample review" });
    expect(await ctas.count()).toBeGreaterThanOrEqual(2);
    await expect(page.getByText("No sign-up. Sample data, nothing is sent.").first()).toBeVisible();
    await ctas.first().click();
    await page.waitForSelector("body[data-ready]");
    await expect(page).toHaveURL(/app\.html#\/drafts\/harbor$/);
    await expectFocus(page, { tag: "h1", text: "Project Harbor" });
  });

  test("what a second look finds is said in words, with its weight (AC-1, UF45)", async ({ page }) => {
    await page.goto("index.html");
    await expect(page.locator("#finds .findings li")).toHaveText([
      "Blocking · Sam Lee, copied in, works at the client but isn't on the deal team.",
      "Blocking · The completion date is stated as certain. The firm can't promise deal outcomes.",
      "Warning · The timing of the data-room requests is an expectation. It can go if the timing is confirmed."]);
  });

  test("the limits are all visible, at the same heading level (AC-3)", async ({ page }) => {
    await page.goto("index.html");
    await expect(page.getByRole("heading", { name: "What DealDesk doesn't do", level: 2 })).toBeVisible();
    await expect(page.locator("#limits .home-list li")).toHaveText(["It doesn't send email and can't stop anyone sending from their own. 'Blocked' means the current version isn't ready to send.", "It isn't a legal or compliance engine.",
      "Its checks can miss things: it relies on an up-to-date deal team list, and flagged wording is a prompt to review, not a verdict.",
      "It can't see a message once it leaves DealDesk: the record covers the version reviewed here."]);
    for (const item of await page.locator("#limits li").all()) await expect(item).toBeVisible();
  });

  // UF40: the copies of the product (.product-sample) show the sample's own wording,
  // "Completion is guaranteed by 30 June." and "version 2", flagged as Blocking: they are
  // evidence, not claims. Everything else on the page is checked, the sheets included.
  test("no forbidden claims and no figures outside the product samples (AC-4, D9, UF40)", async ({ page }) => {
    await page.goto("index.html");
    const text = await page.evaluate(() => {
      const body = document.body.cloneNode(true);
      body.querySelectorAll(".product-sample, script, style, template").forEach((el) => el.remove());
      return body.textContent;
    });
    expect(text).not.toMatch(FORBIDDEN);
    expect(text).not.toMatch(/\d/);
  });

  test("the roles: coordinators can't approve their own; who writes, who keeps the list, who reads the record (AC-2, AC-7)", async ({ page }) => {
    await page.goto("index.html");
    await expect(page.locator("#decide")).toContainText("coordinators can't approve their own.");
    await expect(page.locator("#decide")).toContainText("Coordinators write or paste each draft in DealDesk and send it from their usual email.");
    await expect(page.locator("#decide")).toContainText("Deal owners keep their deal's team list up to date");
    await expect(page.locator("#ready")).toContainText("Partners and operations leads can read the review record of each message: the version, the issues and who decided what.");
  });

  test("a card opens its sheet; Next and Previous walk the sequence; Esc closes and returns focus (UF47)", async ({ page }) => {
    await page.goto("index.html");
    const card = page.locator('[data-sheet="blocking"]');
    await expect(card).toHaveAttribute("role", "button");
    await card.click();
    const blocking = page.getByRole("dialog", { name: "The check finds Sam Lee" });
    await expect(blocking).toBeVisible();
    await expect(page).toHaveURL(/#decide-blocking$/);
    await expectFocus(page, { tag: "h3", text: "The check finds Sam Lee" });
    await expect(blocking.locator("dd")).toHaveText([
      "Sam Lee works at Corvane Holdings, the client, but isn't listed on the Project Harbor deal team. The message can't be sent with Sam on it.",
      "The coordinator. They can remove Sam, or ask the deal owner for an exception.",
      "If they ask, Sam's row shows Pending until Dana Whitfield decides."]);
    await blocking.getByRole("button", { name: "Next step" }).click();
    const pending = page.getByRole("dialog", { name: "The coordinator asks Dana Whitfield" });
    await expect(pending).toBeVisible();
    await expect(blocking).toBeHidden();
    await expect(page).toHaveURL(/#decide-pending$/);
    await expect(pending.getByRole("link", { name: "Open this state in the sample review" })).toHaveAttribute("href", "app.html?from=decide#/jump/pending");
    await pending.getByRole("button", { name: "Next step" }).click();
    await page.getByRole("dialog", { name: "Dana Whitfield approves Sam" }).getByRole("button", { name: "Previous step" }).click();
    await expect(pending).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(pending).toBeHidden();
    expect(await page.evaluate(() => document.activeElement.dataset.sheet)).toBe("pending");
    await expect(page).not.toHaveURL(/#decide-/);
  });

  test("Back closes a sheet, a click outside closes it, and a linked sheet opens on arrival (UF47)", async ({ page }) => {
    await page.goto("index.html");
    await page.locator('[data-sheet="approved"]').click();
    const approved = page.getByRole("dialog", { name: "Dana Whitfield approves Sam" });
    await expect(approved).toBeVisible();
    await page.goBack();
    await expect(approved).toBeHidden();
    await page.locator('[data-sheet="approved"]').click();
    await page.mouse.click(5, 5);
    await expect(approved).toBeHidden();
    await page.goto("index.html#decide-pending");
    await expect(page.getByRole("dialog", { name: "The coordinator asks Dana Whitfield" })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).and(page.locator(":visible")).click();
    await expect(page).toHaveURL(/index\.html#decide$/);
  });

  test("before and after an edit, both visible, each a link to its state (UF48, UF43)", async ({ page }) => {
    await page.goto("index.html");
    const rows = page.locator("#ready .state-link");
    await expect(rows).toHaveText([/Sam Lee\s· Approved by Dana Whitfield\s· for version 2/, /Sam Lee\s· Blocking\s· Not on the deal team\s· Approved on version 2\s· doesn't cover version 3/]);
    expect(await rows.evaluateAll((els) => els.map((el) => el.getAttribute("href")))).toEqual(
      ["app.html?from=ready#/jump/approved", "app.html?from=ready#/jump/edited-after-approval"]);
    await expect(page.locator("#ready .change-note")).toHaveText("Jordan edits the message.");
    await expect(page.getByRole("link", { name: "When nothing blocks it, the message can go. A warning doesn't block sending." })).toHaveAttribute("href", "app.html?from=ready#/jump/ready");
    await expect(page.getByRole("link", { name: "the review record of each message" })).toHaveAttribute("href", "app.html?from=ready#/jump/sent");
    await expect(page.getByRole("link", { name: /^If review is unavailable/ })).toHaveAttribute("href", "app.html?from=limits#/jump/review-unavailable");
  });

  test("a state opened from a section returns to that section (UF44)", async ({ page }) => {
    await page.goto("index.html");
    await page.locator("#ready .state-link").nth(1).click();
    await page.waitForSelector("body[data-ready]");
    await expect(page.locator('[data-key="banner-jumped"]')).toHaveText("Jumped to: approved, then edited. The sample restarted to show this state.");
    await page.locator('[data-key="banner-home"]').click(); // the wordmark (UG2)
    await expect(page).toHaveURL(/index\.html#ready$/);
    await expect(page.locator("#ready-title")).toBeInViewport();
    await page.goto("app.html?from=elsewhere#/drafts");
    await page.waitForSelector("body[data-ready]");
    await expect(page.locator('[data-key="banner-home"]')).toHaveAttribute("href", "index.html");
  });

  test("nothing on the page looks like a button without being one (UF36)", async ({ page }) => {
    await page.goto("index.html");
    const fake = await page.locator(".btn").evaluateAll((els) => els.filter((el) => !el.matches("a[href], button")).map((el) => el.textContent.trim()));
    expect(fake).toEqual([]);
  });

  test("each section puts its heading beside its text, in the width of the first screen (UF33)", async ({ page }) => {
    await page.goto("index.html");
    for (const id of ["finds-title", "decide-title", "ready-title", "limits-title", "try-title"]) {
      // Both boxes are read in one step: the first screen reveals its notes after
      // loading, and two separate reads could fall on either side of that shift.
      const { heading, body } = await page.evaluate((hid) => {
        const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width }; };
        return { heading: box(document.getElementById(hid)), body: box(document.querySelector(`[aria-labelledby="${hid}"] .section-body`)) };
      }, id);
      expect(body.x, id).toBeGreaterThan(heading.x + heading.width);
      expect(Math.abs(body.y - heading.y), id).toBeLessThan(24);
    }
  });

  test("the footer lists the ten starting points and the jumps work", async ({ page }) => {
    await page.goto("index.html");
    const links = page.locator(".starting-points a");
    await expect(links).toHaveText(["Homepage", "Sample review from the start", "Jump: Sam flagged, nothing changed yet", "Jump: Sam escalated, wording still open",
      "Jump: exception request pending", "Jump: Sam approved by the deal owner", "Jump: approved, then edited", "Jump: check unavailable", "Jump: ready to send", "Jump: sent"]);
    await page.getByRole("link", { name: "Jump: ready to send" }).click();
    await page.waitForSelector("body[data-ready]");
    await expect(page).toHaveURL(/app\.html#\/drafts\/harbor\/review$/);
    // The final review is over the draft (TC1): the page behind is reached after closing it.
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/app\.html#\/drafts\/harbor$/);
    await page.locator('[data-key="banner-home"]').click(); // the wordmark (UG2)
    await expect(page).toHaveURL(/index\.html$/);
  });

  test("the skip link is first and leads to the content", async ({ page }) => {
    await page.goto("index.html");
    await page.keyboard.press("Tab");
    await expectFocus(page, { tag: "a", text: "Skip to content" });
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#content$/);
  });
});

test.describe("without JavaScript", () => {
  test.use({ viewport: WIDE, javaScriptEnabled: false });

  test("the draft shows its findings and each card is a link to its state (UF46, UF47)", async ({ page }) => {
    await page.goto("index.html");
    await expect(page.locator(".look-summary span:visible")).toHaveText("Two issues block this message, and one is a warning.");
    for (const note of await page.locator("#draft .note").all()) await expect(note).toBeVisible();
    await expect(page.locator(".look-bar")).toBeHidden();
    const cards = page.locator(".card");
    expect(await cards.evaluateAll((els) => els.map((el) => el.getAttribute("href")))).toEqual(
      ["app.html?from=decide#/jump/flagged", "app.html?from=decide#/jump/pending", "app.html?from=decide#/jump/approved"]);
    await expect(page.locator("main h2")).toHaveText(STORY);
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: WIDE, reducedMotion: "reduce" });

  test("the second look and the sheets appear without transition", async ({ page }) => {
    await page.goto("index.html");
    const slot = page.locator("#draft .note-slot").first();
    expect(await slot.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
    await page.locator('[data-sheet="pending"]').click();
    const animation = await page.locator("#sheet-pending").evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
  });
});

test.describe("narrow", () => {
  test.use({ viewport: NARROW });

  test("title, call to action, summary, draft, then the button under it (J3-V1.1, UF46)", async ({ page }) => {
    await page.goto("index.html");
    const y = async (sel) => (await page.locator(sel).first().boundingBox()).y;
    const order = [await y("#hero-title"), await y(".hero .cta"), await y(".look-summary"), await y("#draft"), await y(".look-bar"), await y("#finds")];
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("a sheet fits the screen with its Close button inside", async ({ page }) => {
    await page.goto("index.html");
    await page.locator('[data-sheet="pending"]').click();
    const sheet = await page.locator("#sheet-pending").boundingBox();
    const close = await page.locator("#sheet-pending [data-close]").boundingBox();
    expect(close.x + close.width).toBeLessThanOrEqual(sheet.x + sheet.width);
    expect(sheet.x).toBeGreaterThanOrEqual(0);
  });

  test("at 320 px nothing scrolls horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("index.html");
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});
