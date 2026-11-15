// Restart from the record's bar (the end of the sample) on every width: the
// question appears where it can be seen, and confirming restarts the sample.
import { test, expect, openApp, WIDE, NARROW } from "./helpers.mjs";

for (const [name, viewport] of [["wide", WIDE], ["narrow", NARROW]]) {
  test.describe(name, () => {
    test.use({ viewport });
    test("Restart sample in the record's bar asks, then restarts", async ({ page }) => {
      await openApp(page, "#/jump/sent");
      await page.locator('[data-key="record-restart"]').click();
      const confirm = page.locator('[data-key="restart-confirm"]');
      await expect(confirm).toBeVisible();
      await expect(confirm).toBeInViewport();
      await expect(confirm).toBeFocused();
      await confirm.click();
      await expect(page).toHaveURL(/#\/drafts(\/harbor)?$/);
      await expect(page.locator('[data-key="harbor-status"], [data-key="phrase"]').first()).toContainText("Blocked");
    });
  });
}
