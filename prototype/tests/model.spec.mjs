// The JavaScript model gives the same results as the Python reference model:
// every scenario step and every step of the exported parity traces.
import { test, expect } from "@playwright/test";

async function runTestsPage(page) {
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("tests.html");
  const main = page.locator("#tests");
  await expect(main).not.toHaveAttribute("data-result", "running", { timeout: 120_000 });
  return { main, errors };
}

test("scenarios and parity traces pass", async ({ page }) => {
  const { main, errors } = await runTestsPage(page);
  await expect(page.locator("#summary")).toContainText("Passed");
  await expect(main).toHaveAttribute("data-result", "pass");
  expect(errors).toEqual([]);
});

test("a wrong expected value in a trace is reported as failed", async ({ page }) => {
  await page.route("**/model/traces.json", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    data.traces[0].steps[0].after.contentHash = "0".repeat(64);
    await route.fulfill({ response, json: data });
  });
  const { main } = await runTestsPage(page);
  await expect(main).toHaveAttribute("data-result", "fail");
  await expect(page.locator("#traces tbody tr").first()).toContainText("failed");
  await expect(page.locator("#traces tbody tr").first()).toContainText("contentHash");
});
