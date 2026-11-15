// The UI review (decisions UR1–UR6): the wide bar, "Next" and the selection
// apart from the focus ring, one statement of "from an earlier check", the
// approved card, and the homepage's brand pass.
import { test, expect, openApp, expectFocus, WIDE, NARROW, noHorizontalScroll } from "./helpers.mjs";

const style = (loc, prop) => loc.evaluate((el, p) => getComputedStyle(el)[p], prop);

test.describe("wide", () => {
  test.use({ viewport: WIDE });

  test("UR1 · one bar: brand, role and buttons; the jump note closes", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    const row = page.locator(".app-bar-row");
    await expect(row.locator(".app-wordmark")).toHaveText("DealDesk");
    // The sample label moved to the page footer (UG4).
    await expect(row.locator('[data-key="footer-sample"]')).toHaveCount(0);
    await expect(row.locator('[data-key="banner-role"]')).toBeVisible();
    // The bar's controls sit on one row at 1280 px.
    const [restart, sim] = [await page.locator('[data-key="banner-restart"]').boundingBox(), await page.locator('[data-key="banner-simulation"]').boundingBox()];
    expect(Math.abs(sim.y - restart.y)).toBeLessThan(2);
    expect((await page.locator("#banner").boundingBox()).height).toBeLessThan(120);
    // The note after a jump is its own row and closes; focus stays in the bar.
    await expect(page.locator('[data-key="banner-jumped"]')).toBeVisible();
    await page.locator('[data-key="jump-close"]').click();
    await expect(page.locator('[data-key="jump-note"]')).toHaveCount(0);
    await expectFocus(page, { key: "banner-restart" });
  });

  test("UR2 · Next is a label and the action it marks is the filled button; no ring around it", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    const answer = page.locator('[data-key="answer-as-dana"]');
    await expect(page.locator('[data-key="next-tag"]')).toHaveText("Next");
    await expect(answer).toHaveClass(/is-next/);
    expect(await style(answer, "backgroundColor")).toBe("rgb(122, 69, 32)"); // the action colour, as btn-primary
    expect(await style(answer, "boxShadow")).toBe("none");
    expect(await style(answer, "outlineStyle")).toBe("none");
  });

  test("UR2 · the selected recipient and sentence are not framed like the focus ring", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    const chip = page.locator('.chip.is-sel');
    await expect(chip).toHaveCount(1);
    expect(await style(chip, "outlineStyle")).toBe("none");
    expect(await style(chip, "backgroundColor")).toBe("rgb(239, 230, 210)"); // the proofreader's highlight, as the sentence (CL4)
    await page.locator('[data-key="card-head-wording-guaranteed-completion"]').click();
    const sentence = page.locator(".flag-blocking.is-sel");
    await expect(sentence).toHaveCount(1);
    expect(await style(sentence, "outlineStyle")).toBe("none");
    expect(await style(sentence, "backgroundColor")).toBe("rgb(239, 230, 210)"); // the highlight
  });

  test("UR3 · a heading focused by a script shows no ring until the keyboard is used", async ({ page }) => {
    await openApp(page, "#/jump/sent");
    const title = page.locator('[data-key="a4-title"]');
    await expect(title).toBeFocused();
    expect(await style(title, "outlineStyle")).toBe("none");
    // After a key press, the same script focus shows the ring.
    await page.keyboard.press("Tab");
    await title.evaluate((el) => el.focus());
    await expect(title).toBeFocused();
    expect(await style(title, "outlineStyle")).toBe("solid");
  });

  test("UR4 · the final review says You can send once; the bar puts the reason above its buttons", async ({ page }) => {
    await openApp(page, "#/jump/ready");
    await expect(page.locator("#a3-verdict-title")).toHaveText("You can send");
    await expect(page.locator("#a3-verdict")).not.toContainText("You can send");
    const back = await page.locator('[data-key="back-to-draft"]').boundingBox();
    const send = await page.locator('[data-key="send"]').boundingBox();
    const why = await page.locator("#a3-verdict").boundingBox();
    expect(why.y + why.height).toBeLessThanOrEqual(back.y);
    expect(Math.abs(back.y - send.y)).toBeLessThan(2);
    expect(send.x).toBeGreaterThan(back.x);
  });

  test("UR5 · the approved card says who approved and for which version, also when closed", async ({ page }) => {
    await openApp(page, "#/jump/approved");
    await expect(page.locator('[data-key="card-head-recipient-p-sam"] .card-type')).toHaveText("Approved by Dana Whitfield · for version 2");
  });

  test("UR6 · the homepage sections are numbered and the closing band is in ink", async ({ page }) => {
    await page.goto("index.html");
    const first = page.locator("#finds-title");
    expect(await first.evaluate((el) => getComputedStyle(el, "::before").content)).not.toBe("none");
    const band = page.locator("#try");
    expect(await style(band, "backgroundColor")).toBe("rgb(34, 31, 27)");
    expect(await style(band.locator(".btn-primary"), "backgroundColor")).toBe("rgb(255, 255, 255)");
  });
});

test.describe("wide · UR7", () => {
  test.use({ viewport: WIDE });

  test("UR7 · the record has one title; a removed recipient's card doesn't repeat the name", async ({ page }) => {
    await openApp(page, "#/jump/sent");
    await expect(page.locator("#notes").getByText("Review record", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Review record · Project Harbor" })).toBeVisible();
    await openApp(page, "#/jump/review-unavailable");
    const sam = page.locator('[data-key="card-head-recipient-p-sam"]');
    await expect(sam.locator(".card-title")).toHaveText("Sam Lee");
    await expect(sam.locator(".card-type")).toHaveText("Removed · The next check confirms it");
  });
});

test.describe("narrow", () => {
  test.use({ viewport: NARROW });

  test("UR7 · the jump note is one line; how the sample got there opens under it", async ({ page }) => {
    await openApp(page, "#/jump/sent");
    const note = page.locator('[data-key="m2-note"]');
    await expect(page.locator('[data-key="banner-jumped-short"]')).toHaveText("Jumped to: sent.");
    expect((await note.boundingBox()).height).toBeLessThan(60);
    await expect(page.locator('[data-key="banner-path"]')).toBeHidden();
    await page.locator('[data-key="banner-jumped-short"]').click();
    await expect(page.locator('[data-key="banner-path"]')).toHaveText("On this path: version 2, Sam Lee removed · version 3, wording changed in paragraph 3.");
  });
  test("UR6 · the homepage bands do not scroll sideways at 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("index.html");
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});
