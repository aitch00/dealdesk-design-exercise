// Simulation: the drawer (TC9) and the deal owner's decision in the foreground
// (TC8), docs/4-design/screens-and-states.md § 11, UC-14, UF11, UF17.
import { test, expect, openApp, expectFocus, WIDE, NARROW } from "./helpers.mjs";
import { openSimulation, card } from "./a2-helpers.mjs";

test.describe("wide", () => {
  test.use({ viewport: WIDE });

  test("the drawer is closed at first; without a pending request there is nothing to decide", async ({ page }) => {
    await openApp(page);
    await expect(page.locator("#sim")).toHaveCount(0);
    await openSimulation(page);
    const panel = page.locator("#sim");
    await expect(panel).toContainText("No exception request waiting. Request one from the draft first.");
    await expect(panel.getByRole("button", { name: /^Approve exception|^Answer as/ })).toHaveCount(0);
  });

  test("the deal owner answers only when asked: the request stays pending until then (TC8, APP-19)", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator('[data-key="phrase"]')).toHaveText(/^Waiting for decision\s· Requested from Dana Whitfield at \d\d:\d\d$/);
    await expect(page.locator("#notes .answer")).toContainText(/Simulation\s· Waiting for Dana Whitfield since \d\d:\d\d\./);
    // Nothing of the deal owner's in Jordan's Review notes but the way to it.
    await expect(page.locator("#notes").getByRole("button", { name: /^Approve exception/ })).toHaveCount(0);
    await openSimulation(page);
    await expect(page.locator("#sim").getByRole("button", { name: "Answer as Dana Whitfield" })).toBeVisible();
  });

  test("approving as Dana: the view in the foreground, then the draft is ready and the item is ticked", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await page.locator('[data-key="answer-as-dana"]').click();
    const view = page.getByRole("dialog");
    await expectFocus(page, { key: "owner-title" });
    await expect(view.locator(".owner-band")).toHaveText("Simulation · Acting as Dana Whitfield (deal owner) · You're deciding as deal owner.");
    await expect(view).toContainText("From");
    await expect(view).toContainText("Jordan Blake");
    await expect(view).toContainText("Dana Whitfield (deal owner)");
    await expect(view).toContainText("If approved, Sam Lee can receive this message (version 2) only. It doesn't add Sam to the deal team.");
    // The rest of the page is inert while the deal owner decides.
    expect(await page.locator("#workspace").evaluate((el) => el.inert)).toBe(true);
    // In Dana's own view approving is the main action (TC8).
    await expect(view.getByRole("button", { name: "Approve exception for Sam Lee" })).toHaveClass(/btn-primary/);
    await view.getByRole("button", { name: "Approve exception for Sam Lee" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(await page.locator("#workspace").evaluate((el) => el.inert)).toBe(false);
    await expect(page.locator('[data-key="sim-decided"]')).toHaveText(/^Simulation\s· Approved for version 2 at \d\d:\d\d\. If Jordan edits the message, you'll be asked again\.$/);
    await expect(page.locator("#sim-status")).toHaveText("Things to try: 3 of 4 done.");
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Ready to send");
    await openSimulation(page);
    // Things to try is a record, not a set of controls (SM3).
    const item = page.locator('#sim [data-key="try-owner-decided"]');
    await expect(item).toHaveClass(/is-done/);
    await expect(item).toHaveText(/^Ask the deal owner for an exception, then simulate the answer\.\s· Done$/);
    await expect(page.locator('[data-key="sim-try-count"]')).toHaveText("3 of 4 done");
  });

  test("declining records the note; Cancel and Esc close the view without deciding", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await page.locator('[data-key="answer-as-dana"]').click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expectFocus(page, { key: "answer-as-dana" });
    await page.locator('[data-key="answer-as-dana"]').click();
    await page.getByRole("dialog").getByLabel("Note (optional)").fill("Sam isn't cleared for Harbor.");
    await page.getByRole("dialog").getByRole("button", { name: "Decline" }).click();
    await expect(page.locator('[data-key="sim-decided"]')).toHaveText(/^Simulation\s· Declined at \d\d:\d\d\.$/);
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 1 blocking issue");
    await expect(card(page, "recipient:p-sam")).toContainText("'Sam isn't cleared for Harbor.'");
  });

  test("the drawer also leads to the deal owner's view", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await openSimulation(page);
    await page.locator("#sim").getByRole("button", { name: "Answer as Dana Whitfield" }).click();
    await expect(page.locator("#sim")).toHaveCount(0);
    await expect(page.getByRole("dialog")).toContainText("Acting as Dana Whitfield (deal owner)");
  });

  test("the outage switch announces itself and changes nothing until the next check", async ({ page }) => {
    await openApp(page);
    await openSimulation(page);
    const outage = page.getByRole("switch", { name: "Simulate check outage" });
    await outage.check();
    await expect(page.locator("#sim-status")).toHaveText("Check outage simulated. The next check will fail.");
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
    await outage.uncheck();
    await expect(page.locator("#sim-status")).toHaveText("Check service available. Run the check again.");
  });

  test("the drawer opens from the bar and closes with Hide simulation or Esc (UG2)", async ({ page }) => {
    await openApp(page);
    await page.locator('[data-key="banner-simulation"]').click();
    await expect(page.locator("#sim")).toBeVisible();
    // A modal sheet: its title takes the focus and its purpose describes it (SM1, SM2).
    await expectFocus(page, { key: "sim-title" });
    await expect(page.getByRole("dialog", { name: "Simulation" })).toHaveAttribute("aria-modal", "true");
    await expect(page.getByRole("dialog", { name: "Simulation" })).toHaveAccessibleDescription(/^In the product, other people and services make these things happen\./);
    await page.getByRole("button", { name: "Hide simulation" }).click();
    await expect(page.locator("#sim")).toHaveCount(0);
    await expectFocus(page, { key: "banner-simulation" });
    await page.locator('[data-key="banner-simulation"]').click();
    await page.keyboard.press("Escape");
    await expect(page.locator("#sim")).toHaveCount(0);
  });

  test("Sample review from the start returns to the seed", async ({ page }) => {
    await openApp(page, "#/jump/review-unavailable");
    await openSimulation(page);
    await page.getByRole("link", { name: "Sample review from the start" }).click();
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
  });

  test("the drawer and the deal owner's band are told apart by label and the legal-pad note (CL2)", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await openSimulation(page);
    // White paper with its head on the legal pad (SM2).
    expect(await page.locator(".sim-head").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(253, 243, 196)");
    expect(await page.locator("#sim").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(255, 255, 255)");
    await expect(page.locator("#sim-label")).toHaveText("Simulation");
    await page.locator("#sim").getByRole("button", { name: "Answer as Dana Whitfield" }).click();
    expect(await page.locator(".owner-band").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(253, 243, 196)");
  });

  test("with a request waiting, Simulation in the bar shows the clock and keeps its name", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    const button = page.locator('[data-key="banner-simulation"]');
    await expect(button.locator("svg use")).toHaveAttribute("href", "#i-clock");
    await expect(button).toHaveAccessibleName(/^Simulation · Pending · \d of 4 things tried$/);
  });
});

test.describe("narrow", () => {
  test.use({ viewport: NARROW });

  test("the drawer is closed at first and opens from the menu, not from the list; Esc closes it (MB5)", async ({ page }) => {
    await openApp(page);
    await expect(page.locator("#sim")).toHaveCount(0);
    await expect(page.locator('[data-key="banner-simulation"]')).toHaveCount(0);
    await page.locator('[data-key="m2-menu"]').click();
    const button = page.locator('[data-key="banner-simulation"]');
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect(page.locator("#sim")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#sim")).toHaveCount(0);
    await expectFocus(page, { key: "m2-menu" });
  });

  test("with a request waiting, the menu and Simulation show the clock and keep their names", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    const menu = page.locator('[data-key="m2-menu"]');
    await expect(menu.locator("svg use")).toHaveAttribute("href", "#i-clock");
    await expect(menu).toHaveAccessibleName("Menu · Pending");
    await menu.click();
    const button = page.locator('[data-key="banner-simulation"]');
    await expect(button.locator("svg use")).toHaveAttribute("href", "#i-clock");
    await expect(button).toHaveAccessibleName(/^Simulation · Pending · \d of 4 things tried$/);
  });

  test("the deal owner's view fills the screen; after a decision the draft shows the next step", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await page.locator('[data-key="answer-as-dana"]').click();
    const box = await page.getByRole("dialog").boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(340);
    // It takes the place of the page: the draft behind is not drawn (TC10).
    await expect(page.locator("#workspace")).toBeHidden();
    await page.getByRole("button", { name: "Approve exception for Sam Lee" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expectFocus(page, { key: "review-before-sending" });
  });
});

// SM1–SM8: the Simulation sheet is a modal remote control for the demo.
test.describe("the Simulation sheet (SM)", () => {
  test.use({ viewport: WIDE });

  test("SM1 · modal over a scrim: the page is inert, Tab stays in the sheet, a click on the scrim closes it", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    await openSimulation(page);
    for (const id of ["#banner", "#workspace", "#footer"]) expect(await page.locator(id).evaluate((el) => el.inert)).toBe(true);
    expect(await page.locator("#sim-slot").evaluate((el) => el.inert)).toBe(false);
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => Boolean(document.activeElement.closest("#sim")))).toBe(true);
    }
    await page.keyboard.press("Shift+Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement.closest("#sim")))).toBe(true);
    await page.mouse.click(200, 400); // on the scrim, over the drafts list
    await expect(page.locator("#sim")).toHaveCount(0);
    await expectFocus(page, { key: "banner-simulation" });
    expect(await page.locator("#workspace").evaluate((el) => el.inert)).toBe(false);
  });

  test("SM3 · Things to try has no checkboxes: a mark and a word for each item, and a count", async ({ page }) => {
    await openApp(page, "#/jump/escalated-first");
    await openSimulation(page);
    await expect(page.locator("#sim").getByRole("checkbox")).toHaveCount(0);
    await expect(page.locator("#sim").getByRole("switch")).toHaveCount(1);
    await expect(page.locator('[data-key="sim-try-count"]')).toHaveText("1 of 4 done");
    await expect(page.locator('#sim [data-key="try-sam-explained"]')).toHaveText(/\s· Done$/);
    await expect(page.locator('#sim [data-key="try-review-unavailable"]')).toHaveText(/\s· Not yet$/);
    await expect(page.locator('[data-key="sim-try-note"]')).toContainText("by your actions or by a jump");
  });

  test("SM4 · the jumps drop their prefix and mark the state on screen until something changes", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await openSimulation(page);
    const current = page.locator('#sim [data-key="jump-pending"]');
    await expect(current).toHaveAttribute("aria-current", "true");
    await expect(current).toHaveText(/^Exception request pending\s*On screen$/);
    await expect(page.locator('#sim a[aria-current]')).toHaveCount(1);
    await expect(page.locator('#sim [data-key="jump-ready"]')).toHaveText("Ready to send");
    await page.getByRole("switch", { name: "Simulate check outage" }).check();
    await expect(page.locator('#sim a[aria-current]')).toHaveCount(0);
  });

  test("SM5 · with a request waiting, the owner section says since when", async ({ page }) => {
    await openApp(page, "#/jump/pending");
    await openSimulation(page);
    await expect(page.locator('[data-key="sim-waiting"]')).toHaveText(/^Waiting for Dana Whitfield since \d\d:\d\d$/);
  });

  test("SM6 · an outage left on is shown on the Simulation button once the sheet is closed", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    await openSimulation(page);
    await page.getByRole("switch", { name: "Simulate check outage" }).check();
    await expect(page.getByRole("switch", { name: "Simulate check outage" })).toHaveAccessibleDescription("While on, the next check fails as if the service were down. Your draft is kept.");
    await page.keyboard.press("Escape");
    const button = page.locator('[data-key="banner-simulation"]');
    await expect(button.locator("svg use")).toHaveAttribute("href", "#i-cloud-off");
    await expect(button).toHaveAccessibleName("Simulation · Check outage on · 0 of 4 things tried");
    await openSimulation(page);
    await page.getByRole("switch", { name: "Simulate check outage" }).uncheck();
    await page.keyboard.press("Escape");
    await expect(button).toHaveAccessibleName("Simulation · 0 of 4 things tried");
  });

  test("SM9 · the Simulation button counts Things to try, and the count follows what the sample reaches", async ({ page }) => {
    await openApp(page, "#/jump/flagged");
    const counter = page.locator('[data-key="banner-simulation"] [data-key="sim-counter"]');
    await expect(counter).toHaveText("0/4");
    await expect(counter).toHaveAttribute("aria-hidden", "true");
    await page.locator('[data-key="remove-p-sam"]').click(); // acting on Sam, after the check: two items reached
    await expect(counter).toHaveText("2/4");
    await expect(page.locator('[data-key="banner-simulation"]')).toHaveAccessibleName("Simulation · 2 of 4 things tried");
    await openSimulation(page);
    await expect(page.locator('[data-key="sim-try-count"]')).toHaveText("2 of 4 done");
  });
});
