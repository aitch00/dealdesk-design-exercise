// Browser tests for the prototype. The site is served from the repository root,
// as on GitHub Pages, so pages reach ../model/*.json without copies.
import { defineConfig } from "@playwright/test";

const PORT = 8790;

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.mjs",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}/prototype/`, browserName: "chromium" },
  webServer: {
    command: `python3 -m http.server ${PORT} --directory ../..`,
    url: `http://localhost:${PORT}/prototype/tests.html`,
    reuseExistingServer: true,
    stdout: "ignore",
    stderr: "ignore",
  },
});
