// Accessibility audit (not part of the suite): run with
//   node a11y-audit.mjs   (from prototype/tests, with the site served on :8765)
// axe with best-practice rules after animations settle, target sizes (WCAG 2.5.8),
// the keyboard path with a visible ring on every stop, reflow at 320 px, text at
// 200 %, forced colours and reduced motion, at 1440 and 390 px.
import { chromium } from "@playwright/test";
import { createRequire } from "node:module";

const AXE = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
const APP = "http://localhost:8765/prototype/app.html";
const HOME = "http://localhost:8765/prototype/index.html";
const out = (...a) => console.log(...a);

const STATES = [
  ["homepage", HOME, null],
  ["drafts list", APP + "#/start", null],
  ["blocked draft", APP + "#/jump/flagged", null],
  ["after Remove (earlier check)", APP + "#/jump/flagged", async (p) => p.locator('[data-key="remove-p-sam"]').click()],
  ["exception request sheet", APP + "#/jump/flagged", async (p) => p.locator('[data-key="request-recipient:p-sam"]').click()],
  ["waiting for Dana", APP + "#/jump/pending", null],
  ["Dana's view", APP + "#/jump/pending", async (p) => p.locator('[data-key="answer-as-dana"]').click()],
  ["edit mode", APP + "#/jump/flagged", async (p) => p.locator('[data-key="edit-message"]').click()],
  ["check unavailable", APP + "#/jump/review-unavailable", null],
  ["final review (risen)", APP + "#/jump/ready", null],
  ["record", APP + "#/jump/sent", null],
  ["Simulation open", APP + "#/jump/flagged", async (p) => {
    const menu = p.locator('[data-key="m2-menu"]');
    if (await menu.count()) await menu.click();
    await p.locator('[data-key="banner-simulation"]').click();
  }],
];

async function open(p, url, prep) {
  await p.goto("about:blank");
  await p.goto(url);
  if (url.includes("app.html")) await p.waitForSelector("body[data-ready]");
  if (prep) await prep(p);
  await p.waitForTimeout(700); // sheets and the risen draft have finished moving
}

async function axe(p) {
  await p.addScriptTag({ path: AXE });
  return p.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } });
    return r.violations.map((v) => `${v.id} [${v.impact}] ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  });
}

// WCAG 2.5.8: a target is 24x24, or nothing else sits within a 24 px circle of it.
const smallTargets = (p) => p.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && !el.closest("[inert], .visually-hidden"); };
  const inSentence = (el) => el.tagName === "A" && el.parentElement && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  return [...document.querySelectorAll("a[href], button, input, select, textarea, summary")]
    .filter(vis).filter((el) => !inSentence(el))
    .map((el) => { const r = el.getBoundingClientRect(); return { el, w: r.width, h: r.height }; })
    .filter((t) => t.w < 24 || t.h < 24)
    .map((t) => `${t.el.tagName.toLowerCase()}${t.el.dataset.key ? `[${t.el.dataset.key}]` : ""} "${(t.el.textContent || t.el.getAttribute("aria-label") || "").trim().slice(0, 24)}" ${Math.round(t.w)}x${Math.round(t.h)}`);
});

// Tab through the page: every stop must show a ring (outline or box-shadow change).
async function tabPath(p, max = 40) {
  const stops = [];
  await p.keyboard.press("Tab");
  for (let i = 0; i < max; i++) {
    const s = await p.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const ring = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== "none";
      const r = el.getBoundingClientRect();
      const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
      return { name: `${el.tagName.toLowerCase()}${el.dataset.key ? `[${el.dataset.key}]` : ""} "${(el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 22)}"`, ring, inView };
    });
    if (!s) break;
    if (stops.length && stops[0].name === s.name) break;
    stops.push(s);
    await p.keyboard.press("Tab");
  }
  return stops;
}

(async () => {
  const b = await chromium.launch();
  for (const [label, size] of [["DESKTOP 1440", { width: 1440, height: 900 }], ["MOBILE 390", { width: 390, height: 844 }]]) {
    out(`\n================ ${label}`);
    const ctx = await b.newContext({ viewport: size });
    const p = await ctx.newPage();
    const errors = []; p.on("pageerror", (e) => errors.push(e.message));
    for (const [name, url, prep] of STATES) {
      await open(p, url, prep);
      const v = await axe(p);
      const small = await smallTargets(p);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      out(`\n• ${name}: axe ${v.length ? v.length + " issue(s)" : "clean"}${small.length ? ` · small targets ${small.length}` : ""}${sw ? " · HORIZONTAL SCROLL" : ""}`);
      v.forEach((x) => out("    axe:", x));
      small.forEach((x) => out("    target:", x));
    }
    // keyboard path on the draft
    await open(p, APP + "#/jump/flagged");
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press("Escape").catch(() => {});
    const stops = await tabPath(p);
    const noRing = stops.filter((s) => !s.ring);
    const outOfView = stops.filter((s) => !s.inView);
    out(`\n• keyboard on the blocked draft: ${stops.length} stops; without a ring: ${noRing.length}; focused out of view: ${outOfView.length}`);
    out("    order:", stops.map((s) => s.name).join(" → ").slice(0, 900));
    noRing.forEach((s) => out("    no ring:", s.name));
    outOfView.forEach((s) => out("    out of view:", s.name));
    // focus trap in the request sheet
    await open(p, APP + "#/jump/flagged", async (q) => q.locator('[data-key="request-recipient:p-sam"]').click());
    const inside = [];
    for (let i = 0; i < 8; i++) { await p.keyboard.press("Tab"); inside.push(await p.evaluate(() => !!document.activeElement.closest('[role="dialog"]'))); }
    out(`• focus stays in the request sheet over 8 Tabs: ${inside.every(Boolean)}`);
    await p.keyboard.press("Escape").catch(() => {});
    if (errors.length) out("  page errors:", errors.join(" | "));
    await ctx.close();
  }

  // reflow at 320 px (WCAG 1.4.10)
  out("\n================ REFLOW 320 px");
  {
    const ctx = await b.newContext({ viewport: { width: 320, height: 640 } });
    const p = await ctx.newPage();
    for (const [name, url, prep] of STATES) {
      await open(p, url, prep);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      if (sw > 320) out(`  ${name}: page is ${sw} px wide`);
    }
    out("  done");
    await ctx.close();
  }

  // text at 200 % (WCAG 1.4.4): text-only zoom on a wide screen
  out("\n================ TEXT 200 % at 1440");
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    for (const [name, url, prep] of STATES) {
      await open(p, url, prep);
      await p.addStyleTag({ content: "html { font-size: 200% !important; }" });
      await p.waitForTimeout(200);
      const r = await p.evaluate(() => {
        const clipped = [];
        for (const el of document.querySelectorAll("p, h1, h2, h3, li, button, a, span.card-title, .phrase")) {
          const s = getComputedStyle(el); const rr = el.getBoundingClientRect();
          if (rr.width === 0 || el.closest(".visually-hidden,[hidden]")) continue;
          if ((s.overflow === "hidden" || s.textOverflow === "ellipsis") && el.scrollWidth > el.clientWidth + 1) clipped.push(el.textContent.trim().slice(0, 30));
        }
        return { sw: document.documentElement.scrollWidth, clipped: clipped.slice(0, 5) };
      });
      if (r.sw > 1440 || r.clipped.length) out(`  ${name}: width ${r.sw}${r.clipped.length ? " clipped: " + r.clipped.join(" | ") : ""}`);
    }
    out("  done");
    await ctx.close();
  }

  // forced colours: screenshots for a look, and the boundaries that survive
  out("\n================ FORCED COLOURS");
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, forcedColors: "active" });
    const p = await ctx.newPage();
    for (const [name, url, prep, file] of [["blocked draft", APP + "#/jump/flagged", null, "fc-draft"], ["request sheet", APP + "#/jump/flagged", async (q) => q.locator('[data-key="request-recipient:p-sam"]').click(), "fc-sheet"], ["final review", APP + "#/jump/ready", null, "fc-review"]]) {
      await open(p, url, prep);
      await p.screenshot({ path: new URL(`test-results/a11y-audit/${file}.png`, import.meta.url).pathname });
      const r = await p.evaluate(() => {
        const bw = (sel) => { const el = document.querySelector(sel); if (!el) return "absent"; const s = getComputedStyle(el); return ["Top", "Right", "Bottom", "Left"].map((k) => s[`border${k}Style`] === "none" ? 0 : parseFloat(s[`border${k}Width`])).join("/"); };
        return { draft: bw("#main .mail"), notes: bw(".notes-slot > .notes"), sheet: bw(".overlay-mail"), selectedRow: bw('.list-item[aria-current="page"]'), verdict: bw(".verdict .state-phrase") };
      });
      out(`  ${name}: border widths (t/r/b/l) ${JSON.stringify(r)}`);
    }
    await ctx.close();
  }

  // reduced motion: no animation runs on the sheets
  out("\n================ REDUCED MOTION");
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await open(p, APP + "#/jump/flagged");
    await p.locator('[data-key="request-recipient:p-sam"]').click();
    const anims = await p.evaluate(() => document.getAnimations().map((a) => a.animationName || a.transitionProperty));
    out("  animations after opening a sheet:", JSON.stringify(anims));
    await p.locator('[data-key="p1-cancel"]').click();
    out("  ghost sheets after closing:", await p.locator(".sheet-ghost").count());
    await ctx.close();
  }
  await b.close();
})();
