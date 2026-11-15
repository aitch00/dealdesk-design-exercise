// Grid, spacing and type of the app's chrome (decisions UG1–UG4): the type scale
// in whole pixels, the wordmark that leads home, Simulation in the bar, the
// drafts list on one left edge, the demo information in the page footer.
import { test, expect, openApp, expectFocus, WIDE, NARROW, noHorizontalScroll } from "./helpers.mjs";

const px = (loc, prop) => loc.evaluate((el, p) => parseFloat(getComputedStyle(el)[p]), prop);
const left = async (loc) => (await loc.boundingBox()).x;

test.describe("wide", () => {
  test.use({ viewport: WIDE });

  test("UG1 · every font size on the drafts page is a whole pixel value of the scale", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    const sizes = await page.evaluate(() => [...new Set([...document.querySelectorAll("#banner *, #workspace *, #footer *")]
      .filter((el) => el.checkVisibility?.() !== false && el.textContent.trim())
      .map((el) => parseFloat(getComputedStyle(el).fontSize)))]);
    for (const size of sizes) expect([12, 14, 16, 20, 24]).toContain(size);
  });

  test("UG2 · SM1 · the wordmark leads home; Simulation is the bar's last button; its sheet opens on the right, Hide where the button was", async ({ page }) => {
    await openApp(page, "#/drafts/harbor");
    const brand = page.locator('[data-key="banner-home"]');
    await expect(brand).toHaveClass(/app-wordmark/);
    await expect(brand).toHaveAccessibleName("DealDesk homepage");
    await expect(brand).toHaveAttribute("href", "index.html");
    await expect(page.getByRole("link", { name: "Back to homepage" })).toHaveCount(0);
    const buttons = page.locator(".app-bar .banner-actions > *");
    await expect(buttons.last()).toHaveAttribute("data-key", "banner-simulation");
    await expect(page.locator(".list [data-key='sim-show']")).toHaveCount(0);
    const trigger = await buttons.last().boundingBox();
    await buttons.last().click();
    // Measured once it has arrived.
    await expect.poll(async () => { const b = await page.locator("#sim").boundingBox(); return Math.round(b.x + b.width); }).toBe(page.viewportSize().width);
    const hide = await page.locator('[data-key="sim-hide"]').boundingBox();
    expect(hide.x + hide.width).toBeCloseTo(trigger.x + trigger.width, 0);
    expect(hide.y).toBeCloseTo(trigger.y, 0);
    await page.keyboard.press("Escape");
    await expectFocus(page, { key: "banner-simulation" });
    await brand.click();
    await expect(page).toHaveURL(/index\.html$/);
  });

  test("UG3 · the deal labels and the state icons share the wordmark's left edge; Drafts sits beside the wordmark (CL6)", async ({ page }) => {
    await openApp(page, "#/drafts/harbor");
    const edge = await left(page.locator(".app-wordmark"));
    const section = page.locator(".app-bar-row .app-section");
    await expect(section).toHaveText("Drafts");
    expect(await left(section)).toBeGreaterThan(edge);
    await expect(page.locator(".list .list-title")).toHaveCount(0);
    for (const loc of [page.locator(".list .group-head").first(), page.locator(".list-item .icon").first(), page.locator(".list-item .icon").last()])
      expect(await left(loc)).toBeCloseTo(edge, 0);
    // Deal labels in small capitals; the subject leads, the state and the time follow.
    const head = page.locator(".list .group-head").first();
    expect(await head.evaluate((el) => getComputedStyle(el).textTransform)).toBe("uppercase");
    expect(await px(head, "fontSize")).toBe(12);
    const item = page.locator(".list-item").first();
    expect(await px(item.locator(".list-subject > span").first(), "fontSize")).toBe(16);
    expect(await px(item.locator(".status-word"), "fontSize")).toBe(14);
    expect(await px(item.locator(".when"), "fontSize")).toBe(12);
    // The state word runs under the subject and the time, on one line.
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
    expect((await page.locator('[data-key="harbor-status"]').boundingBox()).height).toBeLessThan(24);
    // More space between deals than between drafts of one deal.
    const groups = page.locator(".list-group");
    const lastOfFirst = await groups.nth(0).locator(".list-item").last().boundingBox();
    const secondOfFirst = await groups.nth(0).locator(".list-item").nth(1).boundingBox();
    const firstOfFirst = await groups.nth(0).locator(".list-item").nth(0).boundingBox();
    const nextHead = await groups.nth(1).locator(".group-head").boundingBox();
    expect(nextHead.y - (lastOfFirst.y + lastOfFirst.height)).toBeGreaterThan(secondOfFirst.y - (firstOfFirst.y + firstOfFirst.height));
  });

  test("UG4 · the demo information is in the page footer, under a rule, on the same edge", async ({ page }) => {
    await openApp(page);
    const footer = page.locator("footer.app-footer");
    await expect(footer.locator('[data-key="footer-sample"]')).toHaveText("Sample review · Project Harbor · Simulated: no email is sent");
    await expect(footer.locator('[data-key="drafts-note"]')).toHaveText("Only Project Harbor — timeline update is interactive in this sample.");
    await expect(footer.locator("#sim-sub")).toHaveText("Demo controls: the deal owner's answer, check outage, things to try, jumps.");
    expect(await footer.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe("solid");
    expect(await left(footer.locator('[data-key="footer-sample"]'))).toBeCloseTo(await left(page.locator(".app-wordmark")), 0);
    // Nothing of the demo is left in the list.
    await expect(page.locator(".list [data-key='drafts-note'], .list #sim-sub")).toHaveCount(0);
    // The footer closes the page: it is below the list and touches the bottom of a short page.
    const box = await footer.boundingBox();
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(box.y + box.height).toBeCloseTo(height, 0);
  });
});

test.describe("narrow", () => {
  test.use({ viewport: NARROW });

  test("UG3 · the list keeps the bar's 16px edge and the page does not scroll sideways", async ({ page }) => {
    await openApp(page);
    expect(await left(page.locator(".list-title"))).toBeCloseTo(16, 0);
    expect(await left(page.locator(".list-item .icon").first())).toBeCloseTo(16, 0);
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});

// Grid and alignment (decisions GA1–GA4, CL9): measured, so a drift of a few pixels fails.
test.describe("grid and alignment", () => {
  test.use({ viewport: WIDE });
  const firstLine = (page, sel) => page.evaluate((s) => {
    const root = document.querySelector(s);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() && n.parentElement.getClientRects().length && !n.parentElement.closest(".visually-hidden") ? 1 : 3) });
    const r = document.createRange(); r.selectNodeContents(w.nextNode());
    const b = r.getClientRects()[0];
    return { x: b.left, bottom: b.bottom, size: parseFloat(getComputedStyle(r.startContainer.parentElement).fontSize) };
  }, sel);
  const baseline = (l) => l.bottom - l.size * 0.22;

  test("GA1 · the list, the draft and the notes start on one line; the two head rules coincide", async ({ page }) => {
    await openApp(page, "#/drafts/harbor");
    const [list, mail, notes] = [await firstLine(page, "#list"), await firstLine(page, "#main .mail"), await firstLine(page, "#notes .notes")];
    expect(Math.abs(baseline(list) - baseline(mail))).toBeLessThan(2);
    expect(Math.abs(baseline(notes) - baseline(mail))).toBeLessThan(2);
    const [head, eyebrow] = [await page.locator("#main .mail-head").boundingBox(), await page.locator(".notes > .eyebrow").boundingBox()];
    expect(Math.abs(head.y + head.height - (eyebrow.y + eyebrow.height))).toBeLessThan(1);
  });

  test("GA2 · both sheets keep their text 24px from their edge", async ({ page }) => {
    await openApp(page, "#/drafts/harbor");
    const [mail, notes] = [await page.locator("#main .mail").boundingBox(), await page.locator("#notes .notes").boundingBox()];
    expect((await firstLine(page, "#main .mail")).x - mail.x).toBeCloseTo(24, 0);
    expect((await firstLine(page, "#notes .notes")).x - notes.x).toBeCloseTo(24, 0);
  });

  test("GA3 · a card's title starts where its explanation and the verdict's words start", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    const card = page.locator(".card.is-sel");
    const [title, body, verdict] = [await card.locator(".card-title").boundingBox(), await card.locator(".card-body p").first().boundingBox(), await page.locator(".verdict .phrase").boundingBox()];
    expect(title.x).toBeCloseTo(body.x, 0);
    expect(title.x).toBeCloseTo(verdict.x, 0);
  });

  test("GA4 · in the request, the note to fix first and the quoted message share one indent", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    await page.locator('[data-key="request-recipient:p-sam"]').click();
    const [fix, quote] = [await firstLine(page, ".p1 .fix-first"), await firstLine(page, ".p1 .quoted")];
    expect(fix.x).toBeCloseTo(quote.x, 0);
  });

  test("CL9 · the wordmark is the word alone, on the page's left edge", async ({ page }) => {
    await openApp(page, "#/drafts");
    await expect(page.locator(".app-wordmark svg")).toHaveCount(0);
    expect((await page.locator(".app-wordmark").boundingBox()).x).toBeCloseTo((await page.locator(".list .group-head").first().boundingBox()).x, 0);
  });
});

test.describe("grid and alignment, round 2", () => {
  test.use({ viewport: WIDE });

  test("GA6 · entering edit mode keeps the sheet at the top; the bar's content starts on the draft's text edge", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    await page.locator('[data-key="edit-message"]').click();
    expect(await page.locator("#main .mail").evaluate((el) => el.scrollTop)).toBe(0);
    const [mail, pen] = [await page.locator("#main .mail").boundingBox(), await page.locator('[data-key="mode-bar"] .icon').boundingBox()];
    expect(pen.x - mail.x).toBeCloseTo(24, 0);
  });

  test("GA7 · a card without a rule keeps its title on the ruled cards' text edge", async ({ page }) => {
    await openApp(page, "#/jump/review-unavailable");
    const removed = await page.locator('[data-key="card-head-recipient-p-sam"] .card-title').boundingBox();
    const ruled = await page.locator('[data-key="card-head-wording-guaranteed-completion"] .card-title').boundingBox();
    expect(removed.x).toBeCloseTo(ruled.x, 0);
  });

  test("GA8 · homepage: list text on the paragraphs' edge; the footer's links on the sections' text column", async ({ page }) => {
    await page.goto("index.html");
    const [li, para] = [await page.locator("#limits .home-list li").first().boundingBox(), await page.locator("#limits .section-body > p").last().boundingBox()];
    expect(li.x).toBeCloseTo(para.x, 0);
    const [links, body] = [await page.locator(".starting-points").boundingBox(), await page.locator("#finds .section-body").boundingBox()];
    expect(links.x).toBeCloseTo(body.x, 0);
  });
});

test.describe("text and states", () => {
  test.use({ viewport: WIDE });

  test("GA5 · no line of the notes or the draft starts with the separator", async ({ page }) => {
    for (const hash of ["#/jump/flagged", "#/jump/pending", "#/jump/review-unavailable", "#/jump/approved"]) {
      await openApp(page, hash);
      const starts = await page.evaluate(() => {
        const out = [];
        for (const root of document.querySelectorAll("#notes, #main, #list")) {
          const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          for (let t; (t = w.nextNode());) {
            const i = t.textContent.indexOf("·");
            if (i < 0) continue;
            const r = document.createRange();
            r.setStart(t, i); r.setEnd(t, i + 1);
            const dot = r.getClientRects()[0];
            if (!dot) continue;
            // the dot starts a line when nothing of the same line sits to its left in its block
            const block = t.parentElement.closest("p, li, .card-type, .card-title, .phrase, .status-word, .reason") ?? t.parentElement;
            const left = block.getBoundingClientRect().left;
            if (dot.left - left < 2) out.push(t.textContent.trim().slice(0, 40));
          }
        }
        return out;
      });
      expect(starts, hash).toEqual([]);
    }
  });

  test("GA10 · before the next check, a blocking issue still open keeps its red rule", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    await page.locator('[data-key="remove-p-sam"]').click();
    const card = page.locator(".card.is-earlier.rule-blocks");
    await expect(card).toHaveCount(1);
    expect(await card.evaluate((el) => [getComputedStyle(el).borderLeftStyle, getComputedStyle(el).borderLeftColor])).toEqual(["solid", "rgb(155, 49, 56)"]);
  });
});

test.describe("mobile pass", () => {
  test.use({ viewport: NARROW });

  test("MB7 · in the list the bar starts with the wordmark, which leads home", async ({ page }) => {
    await openApp(page);
    const mark = page.locator('[data-key="m2-wordmark"]');
    await expect(mark).toHaveText("DealDesk");
    await expect(mark).toHaveAttribute("href", "index.html");
    expect((await mark.boundingBox()).x).toBeCloseTo(16, 0);
  });

  test("MB8 · notes and draft run edge to edge without rules; their text keeps the 16px edge", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    expect(await page.locator("#notes .notes").evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe("none");
    expect(await page.locator("#main .mail").evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe("none");
    expect((await page.locator(".verdict .state-phrase > .icon").boundingBox()).x).toBeCloseTo(16, 0);
    expect((await page.locator("#main .mail-head").boundingBox()).x + 16).toBeCloseTo((await page.locator('[data-key="a2-title"]').boundingBox()).x, 0);
  });

  test("MB9 · MB10 · the deal owner's buttons are stacked at full width; the edit bar has no lone pencil", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await page.locator('[data-key="answer-as-dana"]').click();
    const [decline, approve] = [await page.locator('[data-key="sim-decline"]').boundingBox(), await page.locator('[data-key="sim-approve"]').boundingBox()];
    expect(decline.width).toBeCloseTo(approve.width, 0);
    expect(approve.y).toBeGreaterThan(decline.y);
    await openApp(page, "#/jump/flagged");
    await page.locator('[data-key="edit-message"]').click();
    await expect(page.locator('[data-key="mode-bar"] .icon')).toBeHidden();
  });
});

// The desktop pass of 14 November 2026 (GA15, GA16).
test.describe("GA15 · GA16 · the low end of the wide layout", () => {
  test.use({ viewport: { width: 1040, height: 768 } });
  test("the draft is the widest column; a focused control is never under the draft's or the notes' fixed bars", async ({ page }) => {
    await openApp(page, "#/drafts/harbor");
    const [list, main, notes] = await Promise.all(["#list", "#main", "#notes"].map((s) => page.locator(s).boundingBox()));
    expect(main.width).toBeGreaterThan(notes.width);
    expect(main.width).toBeGreaterThan(list.width);
    const onTop = (sel) => page.evaluate((s) => {
      const el = document.querySelector(s); const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + Math.min(r.width / 2, 20), r.top + Math.min(r.height / 2, 10));
      return Boolean(hit && (hit === el || el.contains(hit)));
    }, sel);
    await page.keyboard.press("Tab");
    for (const key of ["marker-1", "marker-2"]) {
      await page.locator(`[data-key="${key}"]`).focus();
      expect(await onTop(`[data-key="${key}"]`), key).toBe(true);
    }
    await page.locator('[data-key="remove-p-sam"]').click();
    await page.locator('[data-key="run-check"]').focus();
    expect(await onTop('[data-key="run-check"]')).toBe(true);
    await page.locator('[data-key="edit-message"]').click();
    for (const key of ["edit-subject", "edit-body"]) {
      await page.locator(`[data-key="${key}"]`).focus();
      expect(await onTop(`[data-key="${key}"]`), key).toBe(true);
    }
  });
});
