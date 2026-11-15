// Application shell: loads the seed, keeps the session, routes between views,
// renders the banner, the drafts list, the simulation drawer and the deal
// owner's view, and moves focus after every view change (navigation.md).
// One page in three columns (decision TC1): the list, the draft as an email,
// the Review notes; the final review and the exception request open over the
// draft. Views read projections and send commands only.

import "./input-mode.js";
import { createStore } from "./store.js";
import { parseRoute } from "./router.js";
import { buildJump, JUMPS } from "./jumps.js";
import { installIcons } from "./icons.js";
import { clear, h } from "./dom.js";
import { t, source } from "./copy.js";
import * as m from "./model.js";
import { renderBanner } from "./views/banner.js";
import { renderSimPanel, TRIED } from "./views/sim-panel.js";
import { renderList, renderDrafts, renderStaticDraft, renderFooter } from "./views/drafts.js";
import { renderDraftReview, updateDraftReview, advance } from "./views/draft-review.js";
import { renderFinalReview, updateFinalReview } from "./views/final-review.js";
import { renderRecord, updateRecord } from "./views/record.js";
import { renderOwner } from "./views/owner.js";
import { m2 } from "./mode.js";

// "Since you left" / "Where you left off" (DV-8), from the state before OpenDraft.
function resumeLines(s) {
  const r = m.resume(s);
  if (r.sinceYouLeft.length) {
    return r.sinceYouLeft.map(([subject, outcome, owner, time]) => ({
      key: outcome === "approved" ? "resume.approved" : "resume.declined",
      vars: { owner, subject, time: m.fmt(time) },
    }));
  }
  if (!r.whereYouLeft) return null;
  const [status] = r.whereYouLeft;
  if (status === "Sent") return null;
  if (status === "ReadyToSend") return [{ key: "resume.ready", vars: {} }];
  if (status === "WaitingForDecision") {
    const req = m.requests(s).find((x) => m.requestStatus(s, x) === "pending");
    return [{ key: "resume.waiting", vars: { owner: m.person(s, req.requestedTo).name, time: m.fmt(req.requestedAt) } }];
  }
  const reason = m.blockReason(s)[1].replace(/^Can't send yet: /, "");
  return [{ key: "resume.reason", vars: { reason } }];
}

const OWNER = "p-dana";
const EVALUATOR = "evaluator";
const DRAFT_VIEWS = ["draft", "review"];

// Each view gives the centre, the Review notes and, when it has one, a view
// over the draft; the final review is the draft with A3 over it.
const VIEWS = {
  drafts: renderDrafts,
  static: renderStaticDraft,
  draft: renderDraftReview,
  review: (ctx) => {
    const out = renderDraftReview(ctx);
    const a3 = renderFinalReview(ctx);
    out.a3 = a3;
    out.overlay = a3.overlay;
    out.title = a3.title;
    out.focus = a3.focus;
    out.skip = a3.skip;
    return out;
  },
  record: renderRecord,
};

async function main() {
  const [seed, scenarios] = await Promise.all(
    ["../model/seed.json", "../model/scenarios.json"].map((u) => fetch(u).then((r) => r.json())));
  const store = await createStore(seed);
  installIcons();

  const banner = document.getElementById("banner");
  const listSlot = document.getElementById("list");
  const notesSlot = document.getElementById("notes");
  const view = document.getElementById("main");
  const overlay = document.getElementById("overlay");
  const ownerSlot = document.getElementById("owner");
  const sim = document.getElementById("sim-slot");
  const workspace = document.getElementById("workspace");
  const footer = document.getElementById("footer");
  const context = document.getElementById("m2-context");
  const skip = document.getElementById("skip");
  const skipNotes = document.getElementById("skip-notes");
  const staticIds = store.state.drafts.filter((d) => !d.interactive).map((d) => d.id);

  const ui = { simOpen: false, owner: false, restartConfirm: false, jumped: null, lastDecision: null, route: null, previous: null, a2: {} };
  let current = null; // { view, out } of the rendered view
  let announcedTried = TRIED.filter((k) => store.state.triedItems.includes(k)).length;

  function announceSim(key, vars) {
    const region = document.getElementById("sim-status");
    region.textContent = t(key, vars);
    region.dataset.source = source(key);
  }

  // Re-render keeps the focused control focused, by its data-key.
  function keepFocus(fn) {
    const key = document.activeElement?.dataset?.key;
    fn();
    if (key) document.querySelector(`[data-key="${CSS.escape(key)}"]`)?.focus({ preventScroll: true });
  }

  // While a view is over the page, the rest is inert: it cannot be reached or read (TC7, TC8).
  // The Simulation sheet is modal too (SM1): the page under its scrim is inert, the sheet is not.
  function syncInert() {
    const modal = document.querySelector("#overlay [role=\"dialog\"], #owner [role=\"dialog\"]");
    const simModal = sim.querySelector('[role="dialog"]');
    for (const el of [banner, context, workspace, footer]) el.inert = Boolean(modal || simModal);
    sim.inert = Boolean(modal);
    document.body.classList.toggle("has-overlay", Boolean(modal));
    syncStickyBars(); // every render that can change the page's layers can change the bars
    syncSkipLinks();
  }

  // The skip links lead to what is on screen (VA5, VA6): a view over the draft when
  // one is open, the drafts list when it is a phone's only content, the draft otherwise.
  function syncSkipLinks() {
    const modal = document.querySelector("#overlay [role=\"dialog\"], #owner [role=\"dialog\"]");
    if (modal) {
      if (!modal.id) modal.id = "view";
      skip.setAttribute("href", `#${modal.id}`);
      skipNotes.hidden = true;
    } else if (m2() && ui.route?.view === "drafts") {
      skip.setAttribute("href", "#list");
    } else {
      skip.setAttribute("href", "#main");
    }
  }

  // On a narrow screen the fixed bars change height (a menu, a reason on two lines,
  // a view over the draft): the scroll padding follows them, so a focused control
  // never lands under one (WCAG 2.4.11, MB14).
  function syncStickyBars() {
    const root = document.documentElement;
    // On a wide screen the draft and the sheets scroll on their own, under their own
    // sticky head and bar: each gets the padding of its own bars (GA15).
    for (const box of document.querySelectorAll("#main .mail, .overlay-mail, .notes-slot > .notes")) {
      let head = 0;
      let foot = 0;
      for (const el of box.querySelectorAll(":scope > *, :scope > .a3-body > .mail-bar")) {
        const s = getComputedStyle(el);
        if (s.position !== "sticky" || !el.getClientRects().length) continue;
        if (s.top === "0px") head = Math.max(head, el.getBoundingClientRect().height);
        else if (s.bottom === "0px") foot = Math.max(foot, el.getBoundingClientRect().height);
      }
      box.style.setProperty("--box-sticky-top", `${Math.ceil(head)}px`);
      box.style.setProperty("--box-sticky-bottom", `${Math.ceil(foot)}px`);
    }
    if (!m2()) { root.style.removeProperty("--m2-sticky-top"); root.style.removeProperty("--m2-sticky-bottom"); return; }
    let top = 0;
    let bottom = 0;
    for (const el of document.querySelectorAll("#banner, .m2-top, .mail-bar")) {
      const s = getComputedStyle(el);
      if (s.position !== "sticky" || !el.getClientRects().length) continue;
      const h = el.getBoundingClientRect().height;
      if (s.top === "0px") top = Math.max(top, h);
      else if (s.bottom === "0px") bottom = Math.max(bottom, h);
    }
    root.style.setProperty("--m2-sticky-top", `${Math.ceil(top)}px`);
    root.style.setProperty("--m2-sticky-bottom", `${Math.ceil(bottom)}px`);
  }
  // The views also redraw parts of themselves (a card, the edit bar): measure again
  // once per frame after any change in the page's layers or a change of size.
  let barFrame = 0;
  const syncSoon = () => { if (!barFrame) barFrame = requestAnimationFrame(() => { barFrame = 0; syncStickyBars(); }); };
  const barObserver = new ResizeObserver(syncSoon);
  for (const el of [banner, workspace, overlay]) barObserver.observe(el);
  new MutationObserver(syncSoon).observe(workspace, { childList: true, subtree: true });
  new MutationObserver(syncSoon).observe(overlay, { childList: true, subtree: true });

  const actions = {
    askRestart() {
      ui.restartConfirm = true;
      // On a phone the question lives in the menu of the fixed top bar: open it,
      // so "Restart sample" at the end of the sample (the record's bar) answers too.
      if (m2()) ui.menuOpen = true;
      renderChrome();
      document.querySelector('[data-key="restart-confirm"]')?.focus();
    },
    cancelRestart() {
      ui.restartConfirm = false;
      renderChrome();
      document.querySelector('[data-key="banner-restart"]')?.focus();
    },
    async restart() {
      ui.restartConfirm = false;
      ui.menuOpen = false;
      ui.jumped = null;
      ui.lastDecision = null;
      ui.owner = false;
      ui.a2 = {};
      await store.restart();
      navigate("#/drafts", { forceRender: true });
    },
    toggleSimulation() {
      ui.simOpen = !ui.simOpen;
      if (ui.simOpen) ui.menuOpen = false; // the drawer takes the place of the menu (MB5)
      renderChrome();
      // Opening, the sheet's title takes the focus, so its purpose is read first (SM1).
      const target = ui.simOpen ? '[data-key="sim-title"]' : '[data-key="banner-simulation"]';
      (document.querySelector(target) || document.querySelector('[data-key="m2-menu"]'))?.focus();
    },
    // The mobile layout's menu and jump note (MB1).
    toggleMenu() {
      ui.menuOpen = !ui.menuOpen;
      renderChrome();
      document.querySelector(ui.menuOpen ? '[data-key="banner-home"]' : '[data-key="m2-menu"]')?.focus();
    },
    closeJumpNote() {
      if (ui.jumped) ui.jumped.closed = true;
      renderChrome();
      // Focus goes to the menu on a narrow screen, to Restart sample in the bar on a wide one (UR1).
      (document.querySelector('[data-key="m2-menu"]') ?? document.querySelector('[data-key="banner-restart"]'))?.focus();
    },
    async toggleOutage(event) {
      const value = event.target.checked ? "unavailable" : "available";
      const r = await store.dispatch("SetReviewAvailability", EVALUATOR, { value });
      if (r.ok) announceSim(value === "unavailable" ? "sim.outageOn" : "sim.outageOff");
    },
    // The deal owner's view, in the foreground (TC8).
    openOwner(opener) {
      ui.owner = true;
      ui.ownerOpener = opener?.dataset?.key ?? null;
      ui.simOpen = false;
      ui.note = "";
      renderChrome();
      syncInert();
      document.querySelector('[data-key="owner-title"]')?.focus();
    },
    closeOwner() {
      ui.owner = false;
      renderChrome();
      syncInert();
      const back = ui.ownerOpener && document.querySelector(`[data-key="${ui.ownerOpener}"]`);
      (back || document.querySelector('[data-key="answer-as-dana"]') || document.querySelector('[data-key="phrase"]'))?.focus();
    },
    async decide(requestId, outcome) {
      const note = document.getElementById("sim-note")?.value ?? "";
      const a2 = ui.a2;
      if (DRAFT_VIEWS.includes(ui.route?.view)) advance(a2);
      const r = await store.dispatch("Decide", OWNER, { requestId, outcome, note });
      if (!r.ok) return;
      const s = store.state;
      const dec = s.decisions.at(-1);
      const req = s.requests.find((x) => x.id === requestId);
      ui.lastDecision = outcome === "approved"
        ? { key: "sim.approved", vars: { version: m.version(s, req.versionId).number, time: m.fmt(dec.decidedAt) } }
        : { key: "sim.declined", vars: { time: m.fmt(dec.decidedAt) } };
      ui.owner = false;
      renderAll({ keep: false });
      syncInert();
      const next = a2.focusNext;
      a2.focusNext = null;
      (next && document.querySelector(next) || document.querySelector('[data-key="sim-decided"]') || document.querySelector('[data-key="phrase"]'))?.focus();
    },
  };

  function renderChrome() {
    document.body.classList.toggle("m2", m2());
    clear(banner);
    const [bar, ...under] = [renderBanner({ store, ui, actions })].flat();
    banner.append(bar);
    clear(context);
    context.append(...under.filter(Boolean)); // the sample label and the jump note, on a narrow screen
    // A named region only when it holds something: on a wide screen it is empty (MB18).
    if (context.childElementCount) context.setAttribute("aria-label", t("m2.context"));
    else context.removeAttribute("aria-label");
    clear(listSlot);
    listSlot.append(renderList({ store, ui, actions, route: ui.route }));
    // On a narrow screen with no draft open the list is the page's content, and
    // #main is not shown: the list takes the main landmark (A11Y5).
    if (m2() && ui.route?.view === "drafts") listSlot.setAttribute("role", "main");
    else listSlot.removeAttribute("role");
    clear(footer);
    footer.append(renderFooter());
    const simScroll = sim.querySelector(".sim-panel")?.scrollTop ?? 0;
    clear(sim);
    sim.append(renderSimPanel({ store, ui, actions }));
    const simPanel = sim.querySelector(".sim-panel");
    if (simPanel && simScroll) simPanel.scrollTop = simScroll; // the sheet keeps its place when it is drawn again (VA2)
    clear(ownerSlot);
    const owner = ui.owner ? renderOwner({ store, ui, actions }) : null;
    if (owner) ownerSlot.append(owner);
    else ui.owner = false;
    document.body.classList.toggle("sim-open", ui.simOpen);
    syncInert();
  }

  function place(out) {
    clear(view);
    clear(notesSlot);
    clear(overlay);
    if (out.main) view.append(out.main);
    if (out.notes) notesSlot.append(out.notes);
    if (out.overlay) overlay.append(out.overlay);
    notesSlot.hidden = !out.notes;
  }

  function renderView({ fresh = false } = {}) {
    const ctx = { store, ui, route: ui.route, actions, from: ui.previous, syncInert, renderChrome };
    if (!fresh && current && current.view === ui.route.view) {
      const v = ui.route.view;
      if (DRAFT_VIEWS.includes(v)) {
        updateDraftReview(ctx, current.out);
        if (v === "review") updateFinalReview(ctx, current.out.a3.overlay);
        syncInert();
        return null;
      }
      if (v === "record") {
        updateRecord(ctx, current.out);
        return null;
      }
    }
    const out = VIEWS[ui.route.view](ctx);
    current = { view: ui.route.view, out };
    place(out);
    document.body.dataset.view = ui.route.view;
    document.title = out.title;
    skip.textContent = t(out.skip);
    skip.dataset.source = source(out.skip);
    skipNotes.hidden = !out.notes;
    syncInert();
    return out;
  }

  function renderAll({ keep = true } = {}) {
    const run = () => {
      renderChrome();
      renderView();
    };
    if (keep) keepFocus(run);
    else run();
  }

  function navigate(hash, { forceRender = false } = {}) {
    if (location.hash === hash && forceRender) onRoute();
    else location.hash = hash;
  }

  async function onRoute() {
    // An in-page anchor (the skip links) is not a route: the address stays on
    // the current view and focus moves to the target (US1).
    if (ui.route && location.hash.length > 1 && !location.hash.startsWith("#/")) {
      const target = document.getElementById(location.hash.slice(1));
      history.replaceState(null, "", ui.hash);
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus();
        target.scrollIntoView({ block: "nearest" });
      }
      return;
    }
    const route = parseRoute(location.hash, staticIds);
    if (route.redirect) {
      history.replaceState(null, "", route.redirect);
      return onRoute();
    }
    // On a wide screen the sample opens on Project Harbor's draft: the empty centre
    // ("Select a draft") was a page with nothing to do (GA11). On a narrow screen the
    // list stays the first view (TC10).
    if (route.view === "drafts" && window.matchMedia("(min-width: 65rem)").matches) return redirect("#/drafts/harbor", true);
    const sent = m.sentRecord(store.state) !== null;
    if (DRAFT_VIEWS.includes(route.view) && sent) return redirect("#/drafts/harbor/record");
    if (route.view === "record" && !sent) return redirect("#/drafts/harbor");
    if (route.view === "start") {
      ui.jumped = null;
      ui.lastDecision = null;
      ui.owner = false;
      ui.a2 = {};
      await store.restart();
      ui.simOpen = false;
      return redirect("#/drafts");
    }
    if (route.view === "jump") {
      if (!JUMPS[route.jumpId]) return redirect("#/drafts");
      const { state, jump } = await buildJump(route.jumpId, store.seed, scenarios);
      store.replace(state, { cmd: "Jump" });
      ui.jumped = { id: route.jumpId, label: t(`jump.${route.jumpId}`).replace(/^Jump: /, ""), scenario: jump.scenario };
      ui.lastDecision = null;
      ui.owner = false;
      ui.a2 = {}; // a jump starts again from the starting data: an open edit goes with it (US3)
      ui.simOpen = false; // the view the jump leads to must be the visible one (US5)
      ui.previous = "jump";
      return redirect(jump.route, true);
    }
    if (ui.route && ui.route.view !== route.view) ui.previous = ui.route.view;
    ui.menuOpen = false; // a new view closes the mobile menu (MB1)
    // The final review and the draft are the same page: going between them keeps the draft's state.
    const entering = !ui.route || !(DRAFT_VIEWS.includes(ui.route.view) && DRAFT_VIEWS.includes(route.view));
    ui.route = route;
    ui.hash = location.hash;
    if (DRAFT_VIEWS.includes(route.view) && entering) {
      if (ui.a2.checkTimer) clearTimeout(ui.a2.checkTimer);
      const edit = unsavedEdit() ? ui.a2.edit : null;
      // Entering the draft opens the first card the coordinator must act on (TC4).
      ui.a2 = edit ? { edit, expanded: "auto" } : { expanded: "auto", resume: ui.previous === "drafts" || ui.previous === "static" ? resumeLines(store.state) : null };
    }
    if (route.view === "draft") ui.a2.p1 = null;
    renderChrome();
    const out = renderView({ fresh: true });
    const focus = route.view === "drafts" ? document.querySelector('[data-key="list-title"]') : out.focus;
    focus?.focus();
    if (focus && (focus.tagName === "H1" || route.view === "drafts")) window.scrollTo(0, 0);
    // On a short phone the draft's title can sit under the fixed bottom bar or below
    // the first screen: the focus then goes to the status, the first thing on screen (VA1).
    if (m2() && focus?.tagName === "H1" && !clearOfBars(focus)) {
      const phrase = document.querySelector('[data-key="phrase"]');
      if (phrase && clearOfBars(phrase)) phrase.focus({ preventScroll: true });
    }
    // Opening the draft is recorded after the resume message was computed (UF20).
    if (route.view === "draft" && entering) await store.dispatch("OpenDraft", store.state.actorId, {});
  }

  // Inside the window and not under the fixed top bar or the draft's fixed bottom bar.
  function clearOfBars(el) {
    const r = el.getBoundingClientRect();
    const top = banner.getBoundingClientRect().bottom;
    const bar = document.querySelector("#main .mail > .mail-bar");
    const bottom = Math.min(window.innerHeight, bar ? bar.getBoundingClientRect().top : Infinity);
    return r.height > 0 && r.top >= top - 1 && r.bottom <= bottom + 1;
  }

  // The edit mode is open and differs from the saved version (US3).
  function unsavedEdit() {
    const e = ui.a2.edit;
    if (!e || !e.confirmed) return false;
    const cur = m.cur(store.state);
    const same = (a, b) => a.length === b.length && a.every((r, i) => r.personId === b[i].personId && r.field === b[i].field);
    return e.subject !== cur.subject || e.body !== cur.body.join("\n\n") || !same(e.recipients, cur.recipients);
  }

  function redirect(hash, keepPrevious = false) {
    if (!keepPrevious) ui.previous = ui.route?.view ?? null;
    history.replaceState(null, "", hash);
    ui.route = null;
    return onRoute();
  }

  store.subscribe((change) => {
    if (change.cmd === "Jump") return;
    const quiet = change.cmd === "OpenDraft"; // opening the draft changes nothing the user did
    if (!quiet && change.cmd !== "Decide" && change.cmd !== "RestartSample") ui.lastDecision = null;
    if (!quiet && change.cmd !== "Replace") ui.jumped = null; // the jump notice describes how the state was built
    if (change.cmd !== "RestartSample" && change.cmd !== "Jump") {
      const now = TRIED.filter((k) => store.state.triedItems.includes(k)).length;
      if (ui.route && !quiet) renderAll();
      else if (ui.route) renderChrome();
      if (now > announcedTried) announceSim("sim.tryDone", { count: now });
      announcedTried = now;
    } else {
      announcedTried = TRIED.filter((k) => store.state.triedItems.includes(k)).length;
    }
  });

  document.addEventListener("keydown", (e) => {
    // Tab stays inside a view in the foreground (TC7, TC8, A3).
    if (e.key === "Tab") {
      const dialog = document.querySelector("#overlay [role=\"dialog\"], #owner [role=\"dialog\"], #sim-slot [role=\"dialog\"]");
      if (dialog) {
        const items = [...dialog.querySelectorAll("a[href], button, textarea, input, select")].filter((el) => el.getClientRects().length);
        const first = items[0];
        const last = items.at(-1);
        const inside = dialog.contains(document.activeElement);
        if (!inside || (e.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) || (!e.shiftKey && document.activeElement === last)) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        }
        return;
      }
    }
    if (e.defaultPrevented) return;
    if (e.key === "Escape" && ui.menuOpen) actions.toggleMenu();
    else if (e.key === "Escape" && ui.simOpen) actions.toggleSimulation();
    // The final review closes with Esc wherever the focus is (TC1).
    else if (e.key === "Escape" && ui.route?.view === "review" && !ui.owner) location.hash = "#/drafts/harbor";
  });

  // Passing over an element of the draft highlights its card, and the other way round (TC5).
  const highlight = (e, on) => {
    const el = e.target.closest?.("[data-issue]");
    if (!el) return;
    for (const x of document.querySelectorAll(`[data-issue="${CSS.escape(el.dataset.issue)}"]`)) {
      if (x !== el && !x.contains(el)) x.classList.toggle("is-hl", on);
    }
  };
  workspace.addEventListener("mouseover", (e) => highlight(e, true));
  workspace.addEventListener("mouseout", (e) => highlight(e, false));

  // ---------------------------------------------------------------- sheets laid on the draft (DP4–DP6)
  // On a wide screen a view in the foreground takes the draft's place and size:
  // the draft's box is measured into --desk-* for the stylesheet.
  const WIDE = window.matchMedia("(min-width: 65rem)");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  function measureDesk() {
    const r = view.getBoundingClientRect();
    const st = document.documentElement.style;
    for (const [k, v] of Object.entries({ x: r.left, y: r.top, w: r.width, h: r.height })) st.setProperty(`--desk-${k}`, `${Math.round(v)}px`);
  }
  new ResizeObserver(measureDesk).observe(view);
  window.addEventListener("resize", measureDesk);
  window.addEventListener("scroll", measureDesk, { passive: true });
  measureDesk();

  // A sheet comes in from below once, not at every re-render; when it goes, a copy
  // leaves upwards if it was sent, downwards (or settles, for the risen draft) if not.
  const SENT = ["p1-send", "send", "sim-approve", "sim-decline"];
  let lastKey = null;
  document.addEventListener("click", (e) => { lastKey = e.target.closest?.("[data-key]")?.dataset.key ?? null; }, true);
  let shown = null;
  const sheetNow = () => document.querySelector("#owner .overlay-mail") ?? document.querySelector("#overlay .overlay-mail");
  new MutationObserver(() => {
    const el = sheetNow();
    if (!WIDE.matches) { shown = el; return; }
    if (el && !shown) el.classList.add("is-entering");
    if (!el && shown && !calm.matches) {
      const copy = shown.cloneNode(true);
      for (const x of [copy, ...copy.querySelectorAll("*")]) {
        for (const a of ["id", "data-key", "role", "aria-modal", "data-req", "tabindex"]) x.removeAttribute(a);
      }
      copy.classList.remove("is-entering");
      const ghost = h("div", { class: "sheet-ghost", "aria-hidden": "true" }, copy);
      ghost.inert = true;
      const lift = copy.classList.contains("view-review");
      ghost.classList.add(SENT.includes(lastKey) ? "is-out-up" : lift ? "is-settle" : "is-out-down");
      document.body.append(ghost);
      ghost.addEventListener("animationend", () => ghost.remove(), { once: true });
    }
    shown = el;
  }).observe(document.body, { childList: true, subtree: true });
  // The entering class is spent once the sheet has arrived.
  document.addEventListener("animationend", (e) => e.target.classList?.remove("is-entering"));

  // Crossing the wide breakpoint moves the cards between the panel and the draft (TC10).
  window.matchMedia("(min-width: 65rem)").addEventListener("change", () => {
    if (ui.route) keepFocus(() => { renderChrome(); renderView({ fresh: true }); });
  });

  // Leaving the app or reloading with unsaved changes asks the browser's own confirmation (US3).
  window.addEventListener("beforeunload", (e) => {
    if (unsavedEdit()) e.preventDefault();
  });

  window.addEventListener("hashchange", onRoute);
  await onRoute();
  document.body.dataset.ready = "true";
}

main().catch((e) => {
  console.error(e);
});
