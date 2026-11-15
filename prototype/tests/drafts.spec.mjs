// The drafts list (left column, decisions TC1, TC2) and static drafts (UF18, UF21).
import { test, expect, openApp, expectFocus, noHorizontalScroll, WIDE, NARROW } from "./helpers.mjs";

const items = (page) => page.locator(".list .list-item");

test.describe("wide", () => {
  test.use({ viewport: WIDE });

  test("the drafts are grouped by deal; each shows its icon, its subject without the project and its time (TC2)", async ({ page }) => {
    await openApp(page);
    await expect(page.locator(".list .group-head")).toHaveText(["Project Harbor", "Project Harrow", "Project Atlas", "Project Lumen"]);
    await expect(items(page)).toHaveCount(7);
    await expect(items(page).nth(0).locator(".list-subject > span").first()).toHaveText("Timeline update");
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Blocked · 2 blocking issues");
    // The state in words is visible under the subject (OA12, replaces the hidden text of TC2).
    await expect(page.locator('[data-key="harbor-status"]')).toBeVisible();
    await expect(items(page).nth(0)).not.toHaveAttribute("title");
    await expect(items(page).nth(0).locator("svg use")).toHaveAttribute("href", "#i-octagon");
    await expect(page.locator('[data-key="status-draft-harbor-index"]')).toHaveText("Sent (simulated) · Yesterday");
    await expect(page.locator('[data-key="status-draft-harrow-kickoff"]')).toHaveText("Ready to send");
    await expect(page.locator('[data-key="status-draft-harrow-nda"]')).toHaveText("Needs a check");
    await expect(page.locator('.app-footer [data-key="drafts-note"]')).toHaveText("Only Project Harbor — timeline update is interactive in this sample.");
    await expect(page.getByRole("link", { name: /^Timeline update\s· Blocked\s· 2 blocking issues/ })).toBeVisible();
  });

  test("last activity follows Harbor's events and stays fixed for static drafts", async ({ page }) => {
    await openApp(page);
    const harbor = items(page).nth(0).locator(".when");
    await expect(harbor).toHaveText(/10:28$/);
    await expect(items(page).nth(2).locator(".when")).toHaveText(/09:10$/);
    await openApp(page, "#/jump/pending");
    await openApp(page);
    await expect(harbor).toHaveText(/10:34$/);
    await expect(page.locator('[data-key="harbor-status"]')).toHaveText("Waiting for Dana Whitfield since 10:34");
    await expect(items(page).nth(0).locator("svg use")).toHaveAttribute("href", "#i-clock");
    await expect(items(page).nth(2).locator(".when")).toHaveText(/09:10$/);
  });

  test("the open draft is marked in the list", async ({ page }) => {
    await openApp(page, "#/drafts/harbor");
    await expect(items(page).nth(0)).toHaveAttribute("aria-current", "page");
    await expect(page.locator('.list-item[aria-current="page"]')).toHaveCount(1);
  });

  test("a static draft is read-only; the list stays beside it", async ({ page }) => {
    await openApp(page);
    await page.getByRole("link", { name: /^Kickoff agenda/ }).click();
    await expect(page).toHaveURL(/#\/drafts\/draft-harrow-kickoff$/);
    await expectFocus(page, { tag: "h1", text: "Harrow — kickoff agenda" });
    await expect(page).toHaveTitle("Harrow — kickoff agenda · DealDesk sample");
    await expect(page.getByText("This draft isn't interactive in the sample.")).toBeVisible();
    await expect(page.locator("#notes .phrase")).toHaveText("Ready to send");
    await page.getByRole("link", { name: /^Timeline update/ }).click();
    // The sample opened on Harbor (GA11): coming back, the draft says where you left off (UF20).
    await expectFocus(page, { key: "resume" });
  });
});

test.describe("narrow", () => {
  test.use({ viewport: NARROW });

  test("the list is the first view; a draft opens alone and leads back to the list (TC10)", async ({ page }) => {
    await openApp(page);
    await expect(page.locator(".list")).toBeVisible();
    await expect(page.locator("#main")).toBeHidden();
    expect(await noHorizontalScroll(page)).toBe(true);
    await page.getByRole("link", { name: /^Kickoff agenda/ }).click();
    await expect(page.locator(".list")).toBeHidden();
    await page.getByRole("link", { name: "Back to drafts" }).click();
    await expectFocus(page, { tag: "h1", text: "Drafts" });
  });

  test("at 320 px nothing scrolls horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openApp(page);
    expect(await noHorizontalScroll(page)).toBe(true);
    await openApp(page, "#/drafts/harbor");
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});
