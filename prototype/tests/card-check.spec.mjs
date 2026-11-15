// VA7 · when an exception has to wait for a new check, the card offers the check,
// so the option its text names is one step away (found on a phone after removing Sam Lee).
import { test, expect, openApp, WIDE, NARROW } from "./helpers.mjs";

for (const [name, viewport] of [["wide", WIDE], ["narrow", NARROW]]) {
  test.describe(name, () => {
    test.use({ viewport });
    test("after removing Sam Lee, the sentence card runs the check, then offers the exception", async ({ page }) => {
      await openApp(page, "#/jump/flagged");
      await page.locator('[data-key="remove-p-sam"]').click();
      const card = page.locator("#card-wording-guaranteed-completion");
      await expect(card.locator('[data-key="request-after-check"]')).toHaveText("You can request an exception once the check is up to date.");
      await expect(card.locator('[data-key="request-wording:guaranteed-completion"]')).toHaveCount(0);
      const run = card.locator('[data-key="card-run-check-wording-guaranteed-completion"]');
      await expect(run).toHaveText("Run check");
      await run.click();
      await expect(page.locator('[data-key="request-wording:guaranteed-completion"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-key="request-after-check"]')).toHaveCount(0);
    });
  });
}
