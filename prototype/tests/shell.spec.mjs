// App shell: routes, focus after a view change, session storage, restart,
// banner and jumps (docs/4-design/screens-and-states.md § 13, UC-13).
import { test, expect, openApp, expectFocus, WIDE } from "./helpers.mjs";
import { card, openCard, openSimulation } from "./a2-helpers.mjs";

test.use({ viewport: WIDE });

test("app.html opens on Project Harbor's draft with focus on its heading (GA11)", async ({ page }) => {
  await page.goto("app.html");
  await page.waitForSelector("body[data-ready]");
  await expect(page).toHaveURL(/#\/drafts\/harbor$/);
  await expect(page).toHaveTitle("Project Harbor · Review · DealDesk sample");
  await expectFocus(page, { tag: "h1", text: "Project Harbor" });
  await expect(page.locator('[data-key="footer-sample"]')).toHaveText("Sample review · Project Harbor · Simulated: no email is sent");
});

test("the skip link is the first focusable element and shows when focused", async ({ page }) => {
  await openApp(page);
  const first = await page.evaluate(() =>
    [...document.querySelectorAll("a[href], button, input, textarea, [tabindex='0']")].filter((el) => !el.hidden)[0].textContent.trim());
  expect(first).toMatch(/^Skip to (content|review notes)$/); // on a draft, the notes' skip link comes first
  const skip = page.locator("#skip");
  await skip.focus();
  await expect(skip).toBeInViewport();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#\/drafts\/harbor$/); // the address stays on the open draft (US1)
});

test("the record redirects to the draft before sending", async ({ page }) => {
  await openApp(page, "#/drafts/harbor/record");
  await expect(page).toHaveURL(/#\/drafts\/harbor$/);
  await expectFocus(page, { tag: "h1", text: "Project Harbor" });
});

test("unknown addresses go to the drafts, which open on Project Harbor on a wide screen (GA11)", async ({ page }) => {
  for (const hash of ["#/jump/unknown", "#/drafts/harbor/foo", "#/drafts/nope"]) {
    await openApp(page, hash);
    await expect(page).toHaveURL(/#\/drafts\/harbor$/);
    await expectFocus(page, { tag: "h1", text: "Project Harbor" });
  }
});

test("each jump replays its scenario and opens the view of its address (screens-and-states.md § 13)", async ({ page }) => {
  const cases = [
    ["flagged", /#\/drafts\/harbor$/, "Sam flagged, nothing changed yet", "SC-1"],
    ["escalated-first", /#\/drafts\/harbor$/, "Sam escalated, wording still open", "SC-7"],
    ["pending", /#\/drafts\/harbor$/, "exception request pending", "SC-2"],
    ["approved", /#\/drafts\/harbor$/, "Sam approved by the deal owner", "SC-2"],
    ["edited-after-approval", /#\/drafts\/harbor$/, "approved, then edited", "SC-4"],
    ["review-unavailable", /#\/drafts\/harbor$/, "check unavailable", "SC-5"],
    ["ready", /#\/drafts\/harbor\/review$/, "ready to send", "SC-1", { key: "a3-title" }],
    ["sent", /#\/drafts\/harbor\/record$/, "sent", "SC-1", { key: "a4-title" }],
  ];
  for (const [id, url, label, , focus] of cases) {
    await openApp(page, `#/jump/${id}`);
    await expect(page).toHaveURL(url);
    await expect(page.locator('[data-key="banner-jumped"]')).toHaveText(`Jumped to: ${label}. The sample restarted to show this state.`);
    // The draft focuses its heading; the final review and the record their title (TC1).
    await expectFocus(page, focus ?? { tag: "h1", text: "Project Harbor" });
  }
});

test("the jumps land in the state of their label", async ({ page }) => {
  const statusOf = async (id) => {
    await openApp(page, `#/jump/${id}`);
    await openApp(page, "#/drafts");
    return (await page.locator('[data-key="harbor-status"]').textContent()).replace(/\s+/g, " "); // separators bind with a no-break space
  };
  expect(await statusOf("flagged")).toBe("Blocked · 2 blocking issues");
  expect(await statusOf("approved")).toBe("Ready to send");
  expect(await statusOf("escalated-first")).toBe("Blocked · 1 blocking issue · 1 waiting for Dana Whitfield");
  expect(await statusOf("pending")).toMatch(/^Waiting for Dana Whitfield since \d\d:\d\d$/);
  expect(await statusOf("edited-after-approval")).toBe("Needs a new check");
  expect(await statusOf("review-unavailable")).toBe("Check unavailable");
  expect(await statusOf("ready")).toBe("Ready to send");
  expect(await statusOf("sent")).toBe("Sent (simulated)");
});

test("the homepage's state links land on Sam's card in the state the homepage shows (UF42, UF43)", async ({ page }) => {
  const samRow = async (id) => {
    await openApp(page, `#/jump/${id}`);
    await openCard(page, "recipient:p-sam");
    return card(page, "recipient:p-sam").innerText();
  };
  expect(await samRow("flagged")).toMatch(/Blocking[\s\S]*Not on the deal team/);
  expect(await samRow("pending")).toMatch(/Pending[\s\S]*Requested from Dana Whitfield/);
  expect(await samRow("approved")).toMatch(/Approved by Dana Whitfield/);
  expect(await samRow("edited-after-approval")).toMatch(/Approved on version 2\s· doesn't cover version 3/);
});

test("the session survives a reload and Restart sample returns to the seed", async ({ page }) => {
  await openApp(page, "#/jump/review-unavailable");
  await page.reload();
  await page.waitForSelector("body[data-ready]");
  await openApp(page, "#/drafts");
  await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Check unavailable");

  await page.locator('[data-key="banner-restart"]').click();
  await expect(page.locator("#restart-question")).toHaveText("Restart the sample? Your changes will be cleared.");
  await page.locator('[data-key="restart-cancel"]').click();
  await expectFocus(page, { key: "banner-restart" });
  await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Check unavailable");

  await page.locator('[data-key="banner-restart"]').click();
  await page.locator('[data-key="restart-confirm"]').click();
  await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
  await expectFocus(page, { tag: "h1", text: "Project Harbor" });
  await openSimulation(page);
  await expect(page.locator('[data-key="sim-outage"]')).not.toBeChecked();
});

test("without browser storage the sample works in memory", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("storage blocked"); } });
  });
  await openApp(page, "#/jump/pending");
  await openApp(page, "#/drafts");
  await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
});

test("a session saved with another schema version starts from the seed", async ({ page }) => {
  await page.addInitScript(() => {
    if (location.protocol !== "http:") return; // about:blank has no storage
    localStorage.setItem("dealdesk.sampleSession", JSON.stringify({ schemaVersion: 0, seedVersion: "harbor-1", state: {} }));
  });
  await openApp(page);
  await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
});

test("the banner is not fixed and covers nothing", async ({ page }) => {
  await openApp(page);
  const position = await page.locator("#banner").evaluate((el) => getComputedStyle(el).position);
  expect(position).toBe("static");
});

test("the icon sprite is the same as the design specimen's", async ({ page, request }) => {
  const specimen = await (await request.get("design-specimen.html")).text();
  const icons = await (await request.get("js/icons.js")).text();
  const symbols = (text) => [...text.matchAll(/<symbol[\s\S]*?<\/symbol>/g)].map((m) => m[0]);
  expect(symbols(icons)).toEqual(symbols(specimen));
  expect(symbols(icons).length).toBe(13); // + sent and edit for the three-column page (TC2, TC12), close for the mobile jump note (MB11)
});
