// The mobile layout (decisions MB1–MB6, docs/4-design/structure.md § 6):
// on narrow screens a compact bar at the top with a menu, the draft's bar fixed
// at the bottom, a compact verdict, views over the draft with their own top
// bar, Simulation only in the menu, and the card's details after its actions.
import { test, expect, openApp, expectFocus, noHorizontalScroll, NARROW, WIDE } from "./helpers.mjs";
import { openHarbor, phrase, openCard, decideAsDana } from "./a2-helpers.mjs";

test.use({ viewport: NARROW });

// The rectangle of an element, and the space left between the fixed bars.
const rect = (page, sel) => page.locator(sel).first().evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom };
});

test.describe("MB1 · the top bar", () => {
  test("compact and fixed: Back to drafts in a draft and the menu; the sample label first under it, scrolling with the page (MB18)", async ({ page }) => {
    await openApp(page, "#/drafts");
    await expect(page.locator("#banner")).toHaveCSS("position", "sticky");
    await expect(page.locator('[data-key="m2-back"]')).toHaveCount(0);
    await expect(page.locator(".m2-sample")).toHaveText("Sample review · no email is sent");
    // MB12 · one line down to 320 px.
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 700 });
      expect(await page.locator(".m2-sample").evaluate((el) => { const s = getComputedStyle(el); return Math.round((el.getBoundingClientRect().height - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom)) / parseFloat(s.lineHeight)); })).toBe(1);
    }
    await expect(page.locator('[data-key="banner-home"]')).toHaveCount(0);
    await page.getByRole("link", { name: /^Timeline update/ }).click();
    await expect(page.locator('[data-key="m2-back"]')).toHaveText("Back to drafts");
    // The draft's own Back to drafts would repeat it.
    await expect(page.locator('[data-key="back-to-drafts"]')).toBeHidden();
    const bar = await page.locator("#banner").boundingBox();
    expect(bar.height).toBeLessThanOrEqual(66); // the banner took 150–250 px before MB1, 90 before MB18
    expect(await page.locator(".m2-sample").evaluate((el) => Boolean(el.closest("#banner")))).toBe(false);
    await expect(page.locator(".m2-sample")).toBeInViewport();
    await page.mouse.wheel(0, 800);
    expect((await page.locator("#banner").boundingBox()).y).toBe(0);
    await expect.poll(async () => (await page.locator(".m2-sample").boundingBox()).y).toBeLessThan(0);
  });

  test("the menu holds the role and the banner's buttons; Esc closes it and focus goes back", async ({ page }) => {
    await openHarbor(page);
    const menu = page.locator('[data-key="m2-menu"]');
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#m2-menu");
    await expect(panel).toContainText("You're working as Jordan Blake, deal coordinator.");
    await expect(panel.getByRole("link", { name: "Back to homepage" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Restart sample" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Simulation" })).toBeVisible();
    await expectFocus(page, { key: "banner-home" });
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expectFocus(page, { key: "m2-menu" });
  });

  test("Restart sample asks first, from the menu", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await page.locator('[data-key="m2-menu"]').click();
    await page.locator('[data-key="banner-restart"]').click();
    await expect(page.locator("#m2-menu")).toContainText("Restart the sample? Your changes will be cleared.");
    await page.locator('[data-key="restart-confirm"]').click();
    await expect(page).toHaveURL(/#\/drafts$/);
    await expect(page.locator("#m2-menu")).toHaveCount(0);
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
  });

  test("the note after a jump closes; the menu closes when the view changes", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await expect(page.locator('[data-key="m2-note"]')).toContainText("Jumped to: exception request pending.");
    // MB11 · × with a name that says what it closes, a 40 px target inside the note, the glyph on the Menu button's edge.
    const close = page.locator('[data-key="m2-close-note"]');
    await expect(close).toHaveAccessibleName("Close the jump note");
    await expect(close.locator("svg use")).toHaveAttribute("href", "#i-close");
    const [c, n, m] = [await close.boundingBox(), await page.locator('[data-key="m2-note"]').boundingBox(), await page.locator('[data-key="m2-menu"]').boundingBox()];
    expect(c.width).toBe(40);
    expect(c.height).toBe(40);
    expect(c.y).toBeGreaterThanOrEqual(n.y);
    expect(c.y + c.height).toBeLessThanOrEqual(n.y + n.height);
    expect(c.x + c.width - 12).toBeCloseTo(m.x + m.width, 0);
    await close.click();
    await expect(page.locator('[data-key="m2-note"]')).toHaveCount(0);
    await expectFocus(page, { key: "m2-menu" });
    await page.locator('[data-key="m2-menu"]').click();
    await page.locator('[data-key="m2-back"]').click();
    await expect(page.locator("#m2-menu")).toHaveCount(0);
  });
});

test.describe("MB2 · the bar at the bottom", () => {
  test("fixed at the bottom, the main action in reach, nothing hidden under the bars", async ({ page }) => {
    await openHarbor(page);
    const bar = page.locator(".mail > .mail-bar");
    await expect(bar).toHaveCSS("position", "sticky");
    await expect(page.locator('[data-key="review-before-sending"]')).toBeInViewport();
    // A control reached with the keyboard is not covered by either bar (scroll-padding).
    await page.locator('[data-key="card-head-wording-timing-expectation"]').focus();
    const el = await rect(page, '[data-key="card-head-wording-timing-expectation"]');
    const top = await rect(page, "#banner");
    const bottom = await rect(page, ".mail > .mail-bar");
    expect(el.top).toBeGreaterThanOrEqual(top.bottom);
    expect(el.bottom).toBeLessThanOrEqual(bottom.top);
  });

  test("with Next, Edit message and the main action share one row; Next is read, not shown (MB19)", async ({ page }) => {
    await openHarbor(page, "#/jump/approved");
    const review = await rect(page, '[data-key="review-before-sending"]');
    const edit = await rect(page, '[data-key="edit-message"]');
    expect(review.top).toBe(edit.top);
    await expect(page.locator('[data-key="review-before-sending"]')).toHaveAccessibleDescription(/^Next/);
    expect(await page.locator(".mail-bar .next-tag").evaluate((el) => el.getBoundingClientRect().width)).toBeLessThanOrEqual(1);
    // On a 320 px phone too, a step smaller.
    await page.setViewportSize({ width: 320, height: 568 });
    const [r2, e2] = [await rect(page, '[data-key="review-before-sending"]'), await rect(page, '[data-key="edit-message"]')];
    expect(r2.top).toBe(e2.top);
  });
});

test.describe("MB3 · a compact verdict", () => {
  test("the notes that only explain are under Details; what leads to an action stays visible", async ({ page }) => {
    await openHarbor(page, "#/jump/review-unavailable");
    const details = page.locator('[data-key="m2-details"]');
    await expect(details).not.toHaveAttribute("open");
    await expect(page.locator('[data-key="unavailable-hint"]')).toBeHidden();
    await expect(page.locator('[data-key="run-check"]')).toBeVisible();
    await details.locator("summary").click();
    await expect(page.locator('[data-key="unavailable-hint"]')).toBeVisible();
    await expect(details).toContainText("From an earlier check (version 1). May be out of date.");
    // It stays open while the page is re-rendered.
    await page.locator('[data-key="card-head-wording-timing-expectation"]').click();
    await expect(details).toHaveAttribute("open");
  });

  test("What changed and the deal owner's frame are not folded away", async ({ page }) => {
    await openHarbor(page, "#/jump/edited-after-approval");
    await expect(page.locator('[data-key="what-changed"]')).toBeVisible();
    await openHarbor(page, "#/jump/pending");
    await expect(page.locator('[data-key="answer-as-dana"]')).toBeVisible();
    await expect(page.locator(".notes > .eyebrow")).toHaveText("Review notes"); // still the region's heading for screen readers
  });
});

test.describe("MB4 · views over the draft", () => {
  test("the deal owner's view: Cancel at the top goes back to Answer as Dana; the decision is fixed at the bottom", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await page.locator('[data-key="answer-as-dana"]').click();
    await expect(page.locator('[data-key="owner-cancel"]')).toBeHidden();
    await expect(page.locator('[data-key="sim-approve"]')).toBeInViewport();
    // Under the view only the sample label stays in the top bar: its own bar leads back.
    await expect(page.locator(".m2-sample")).toBeVisible();
    await expect(page.locator('[data-key="m2-back"]')).toBeHidden();
    await page.locator('[data-key="owner-cancel-top"]').click();
    await expectFocus(page, { key: "answer-as-dana" });
  });

  test("the final review: Back to draft at the top", async ({ page }) => {
    await openApp(page, "#/jump/ready");
    await page.locator('[data-key="back-to-draft-top"]').click();
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    await expectFocus(page, { key: "review-before-sending" });
  });

  test("a decision taken from the view leads to the next step", async ({ page }) => {
    await openHarbor(page, "#/jump/pending");
    await decideAsDana(page, "approved");
    await expect(phrase(page)).toContainText("Ready to send");
  });
});

test.describe("MB5 · MB6", () => {
  test("Simulation only in the menu; its sheet comes from the bottom over a scrim, the page still in sight (SM1)", async ({ page }) => {
    await openApp(page, "#/drafts");
    // What Simulation holds is said in the footer; the sample label is said once, in the bar (UG4).
    await expect(page.locator(".app-footer #sim-sub")).toBeVisible();
    await expect(page.locator('[data-key="footer-sample"]')).toBeHidden();
    await page.locator('[data-key="m2-menu"]').click();
    await page.locator('[data-key="banner-simulation"]').click();
    // Measured once it has arrived.
    await expect.poll(async () => { const b = await page.locator("#sim").boundingBox(); return Math.round(b.y + b.height); }).toBe(NARROW.height);
    const drawer = await page.locator("#sim").boundingBox();
    expect(drawer.height).toBeLessThanOrEqual(NARROW.height * 0.86);
    expect(await page.locator(".sim-layer").evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    expect(await page.locator("#workspace").evaluate((el) => el.inert)).toBe(true);
  });

  test("in an open card the person's details come after the actions", async ({ page }) => {
    await openHarbor(page);
    await openCard(page, "recipient:p-sam");
    const body = page.locator('.card[data-issue="recipient:p-sam"] .card-body');
    const order = await body.evaluate((el) => [...el.children].map((c) => (c.classList.contains("actions") ? "actions" : c.classList.contains("meta") ? "meta" : "text")));
    expect(order.indexOf("actions")).toBeLessThan(order.lastIndexOf("meta"));
    await expect(body.locator(".meta").last()).toContainText("CC · sam.lee@corvane.example");
  });
});

test.describe("reflow and the lab", () => {
  test("no horizontal scrolling at 320 px in the main states", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    for (const hash of ["#/drafts", "#/jump/flagged", "#/jump/pending", "#/jump/review-unavailable", "#/jump/approved", "#/jump/ready", "#/jump/sent"]) {
      await openApp(page, hash);
      expect(await noHorizontalScroll(page), hash).toBe(true);
    }
  });

  test("on a wide screen nothing of the mobile layout shows", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await openHarbor(page);
    await expect(page.locator("body")).not.toHaveClass(/\bm2\b/);
    await expect(page.locator('[data-key="m2-menu"]')).toHaveCount(0);
    await expect(page.locator('[data-key="banner-home"]')).toBeVisible();
  });

  test("?mobile=prima shows the narrow layout as it was, with its own session (the lab's left phone)", async ({ page }) => {
    await page.goto("app.html?mobile=prima#/jump/pending");
    await page.waitForSelector("body[data-ready]");
    await expect(page.locator("body")).not.toHaveClass(/\bm2\b/);
    await expect(page.locator('[data-key="banner-home"]')).toBeVisible();
    await openApp(page, "#/drafts");
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
  });
});

// The full mobile pass of 14 November 2026 (MB13–MB17).
test.describe("MB13–MB17 · the mobile pass", () => {
  const between = async (page, sel) => page.evaluate((s) => {
    const el = document.querySelector(s);
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + Math.min(r.width / 2, 20), r.top + Math.min(r.height / 2, 10));
    return Boolean(hit && (hit === el || el.contains(hit)));
  }, sel);

  test("MB13 · the jump note is under the fixed bar and scrolls with the page", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    const note = page.locator('[data-key="m2-note"]');
    await expect(note).toBeVisible();
    expect(await note.evaluate((el) => Boolean(el.closest("#banner")))).toBe(false);
    expect((await page.locator("#banner").boundingBox()).height).toBeLessThanOrEqual(92);
    await page.mouse.wheel(0, 400);
    await expect.poll(async () => (await note.boundingBox()).y).toBeLessThan(0);
  });

  test("MB14 · on a small phone a focused control is never under a fixed bar", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await openApp(page, "#/jump/approved");
    for (const key of ["row-p-sam", "card-head-recipient-p-sam", "marker-1", "card-head-wording-timing-expectation"]) {
      await page.locator(`[data-key="${key}"]`).focus();
      expect(await between(page, `[data-key="${key}"]`), key).toBe(true);
    }
    // The request sheet on a phone held sideways scrolls on its own, with the same padding.
    await page.setViewportSize({ width: 844, height: 390 });
    await openApp(page, "#/jump/flagged");
    await page.locator('[data-key="request-recipient:p-sam"]').click();
    await page.locator('[data-key="p1-reason"]').focus();
    expect(await between(page, '[data-key="p1-reason"]')).toBe(true);
  });

  test("MB15 · from 360 px Edit message and the main action share one row", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await openApp(page, "#/jump/flagged");
    const tops = await page.locator(".mail > .mail-bar .btn").evaluateAll((els) => els.filter((e) => e.getClientRects().length).map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
  });

  test("MB17 · a focused skip link shows over the fixed bar", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    await page.keyboard.press("Tab");
    await page.evaluate(() => { window.scrollTo(0, 0); document.getElementById("skip-notes").focus(); });
    expect(await between(page, "#skip-notes")).toBe(true);
  });
});

test.describe("MB20 · the edit bar on a phone", () => {
  test("Cancel and Save only, on one row down to 320 px; the reason stays in the bar", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await openApp(page, "#/jump/flagged");
    await page.locator('[data-key="edit-message"]').click();
    const bar = page.locator('[data-key="mode-bar"]');
    await expect(bar.locator('[data-key="review-before-sending"]')).toBeHidden();
    await expect(bar.locator("#r6-reason")).toHaveText("Can't send yet: save or cancel your changes first.");
    const [c, s] = [await bar.locator('[data-key="cancel-mode"]').boundingBox(), await bar.locator('[data-key="save-changes"]').boundingBox()];
    expect(c.y).toBe(s.y);
    expect((await bar.boundingBox()).height).toBeLessThanOrEqual(128);
  });
});

test.describe("MB16 · on a touch screen", () => {
  test.use({ hasTouch: true });
  test("the jumps in the Simulation sheet are rows of 48 px", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    await page.locator('[data-key="m2-menu"]').tap();
    await page.locator('[data-key="banner-simulation"]').tap();
    const heights = await page.locator(".sim-jump-list a").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(48);
  });
});
