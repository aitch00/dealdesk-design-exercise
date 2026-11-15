// B · sample review banner, in every view of the app (screens.md § B,
// design.md §5.8). Not fixed: it never covers the focused element.

import { h, icon } from "../dom.js";
import { t, source } from "../copy.js";
import { say, pendingRequest } from "../format.js";
import { m2 } from "../mode.js";
import { TRIED } from "./sim-panel.js";

// Back to homepage returns to the homepage section a link came from (UF44):
// app.html?from=ready#/jump/approved → index.html#ready. Only known sections count.
const RETURN_SECTIONS = ["decide", "ready", "limits"];
export function homeHref(search = location.search) {
  const from = new URLSearchParams(search).get("from");
  return RETURN_SECTIONS.includes(from) ? `index.html#${from}` : "index.html";
}

export function renderBanner({ store, ui, actions }) {
  const s = store.state;
  const pending = pendingRequest(s) !== null;
  const outage = s.simulation.reviewAvailability === "unavailable";
  const tried = TRIED.filter((k) => s.triedItems.includes(k)).length;

  const text = [say("p", "banner.text", {}, { class: "banner-text" }),
    say("p", "banner.role", {}, { class: "banner-text", "data-key": "banner-role" })]; // who the user acts as (US7)
  if (ui.jumped) {
    text.push(say("p", "banner.jumped", ui.jumped, { class: "banner-text", "data-key": "banner-jumped" }));
    // Each jump takes its own path: the versions it made explain the numbers on screen (OA11).
    const made = s.versions.filter((v) => v.draftId === s.draftId && v.number > 1 && !v.discardedAt).sort((a, b) => a.number - b.number);
    if (made.length) {
      const steps = made.map((v) => t("banner.pathStep", { version: v.number, summary: v.changeSummary.replace(/^(Wording|Message)/, (w) => w.toLowerCase()) })).join("\u00a0· ");
      text.push(say("p", "banner.path", { steps }, { class: "banner-text", "data-key": "banner-path" }));
    }
  }

  let controls;
  if (ui.restartConfirm) {
    controls = h("div", { class: "banner-actions", role: "group", "aria-labelledby": "restart-question",
      onkeydown: (e) => { if (e.key === "Escape") { e.preventDefault(); actions.cancelRestart(); } } }, // Esc cancels, as Cancel does (US10)
      say("p", "restart.question", {}, { id: "restart-question", class: "banner-text" }),
      h("button", { class: "btn btn-primary", type: "button", "data-key": "restart-confirm", "data-source": source("restart.confirm"), onclick: actions.restart }, t("restart.confirm")),
      h("button", { class: "btn", type: "button", "data-key": "restart-cancel", "data-source": source("restart.cancel"), onclick: actions.cancelRestart }, t("restart.cancel")));
  } else {
    // Simulation is the bar's call to action on every width (UG2); its description is in the footer.
    const simButton = h("button", {
      class: "btn", type: "button", "data-key": "banner-simulation",
      "aria-haspopup": "dialog", "aria-controls": "sim", "aria-expanded": String(ui.simOpen), "aria-describedby": "sim-sub", "data-source": source("banner.simulation"),
      onclick: actions.toggleSimulation,
    }, pending ? icon("i-clock") : null, outage ? icon("i-cloud-off") : null, t("banner.simulation"),
    pending ? h("span", { class: "visually-hidden", "data-source": source("banner.pending") }, ` · ${t("banner.pending")}`) : null,
    // A switch left on changes the next check: the button says so once the sheet is closed (SM6).
    outage ? h("span", { class: "visually-hidden", "data-source": source("banner.outage") }, ` · ${t("banner.outage")}`) : null,
    // Things to try stays in sight while the sheet is closed (SM9): "2/4" to the eye, words to a screen reader.
    h("span", { class: "sim-counter", "aria-hidden": "true", "data-key": "sim-counter", "data-source": source("banner.triedShort") }, t("banner.triedShort", { count: tried })),
    h("span", { class: "visually-hidden", "data-source": source("banner.tried") }, ` · ${t("banner.tried", { count: tried })}`));
    // On a wide screen the wordmark leads home (UG2); the mobile menu keeps the button.
    controls = h("div", { class: "banner-actions" },
      m2() ? h("a", { class: "btn", href: homeHref(), "data-key": "banner-home", "data-source": source("banner.home") }, t("banner.home")) : null,
      h("button", { class: m2() ? "btn" : "btn btn-quiet", type: "button", "data-key": "banner-restart", "data-source": source("banner.restart"), onclick: actions.askRestart }, t("banner.restart")),
      simButton);
  }
  if (m2()) return mobileBar({ ui, actions, pending, outage, text, controls });
  return wideBar({ ui, actions, text, controls });
}

// The wide bar (UR1, UG2): one row with the brand, which leads home, the role and
// the buttons, Simulation last; the sample label is in the page footer. The note
// after a jump goes on a second row of its own, and closes.
function wideBar({ ui, actions, text, controls }) {
  const [, role, ...jump] = text;
  role.classList.add("role");
  const brand = h("a", { class: "wordmark app-wordmark", href: homeHref(), "data-key": "banner-home",
    "aria-label": t("banner.brandHome"), "data-source": source("banner.brandHome") });
  brand.textContent = "DealDesk"; // the wordmark alone, without the caret (CL9)
  // The section beside the wordmark: "DealDesk  Drafts" in the app, the wordmark alone
  // on the homepage (CL6). It is the page's heading and names the list (aria-labelledby).
  const section = say(ui.route?.view === "drafts" ? "h1" : "h2", "drafts.title", {},
    { id: "list-title", class: "app-section", tabindex: "-1", "data-key": "list-title" });
  const note = jump.length && !ui.jumped?.closed
    ? h("div", { class: "jump-note", "data-key": "jump-note" },
      h("div", { class: "jump-text" }, ...jump),
      h("button", { class: "btn btn-quiet", type: "button", "data-key": "jump-close", "data-source": source("m2.closeNote"), onclick: actions.closeJumpNote }, t("m2.closeNote")))
    : null;
  return h("div", { class: "banner app-bar", "data-req": "APP-29 APP-31 APP-37" },
    h("div", { class: "app-bar-row" }, brand, section, h("span", { class: "app-bar-space" }), role, controls),
    note);
}

// The mobile layout (MB1): one compact bar, fixed at the top. "Back to drafts"
// on the left, a menu with the role, the banner's buttons and Simulation on the
// right; the sample label stays visible; the jump note can be closed.
function mobileBar({ ui, actions, pending, outage, text, controls }) {
  const [, role, ...jump] = text;
  // One line on a phone (MB12): the project is named by the draft and the footer.
  const label = say("p", "banner.textShort", {}, { class: "m2-sample", "data-key": "m2-sample" });
  const inDraft = ["draft", "review", "record", "static"].includes(ui.route?.view);
  const back = inDraft
    ? h("a", { class: "m2-back", href: "#/drafts", "data-key": "m2-back", "data-source": source("nav.backToDrafts") }, t("nav.backToDrafts"))
    // In the list the bar's left end is the wordmark, which leads home (MB7).
    : h("a", { class: "wordmark m2-wordmark", href: homeHref(), "data-key": "m2-wordmark", "aria-label": t("banner.brandHome"), "data-source": source("banner.brandHome") }, "DealDesk");
  const menu = h("button", {
    class: "btn m2-menu-btn", type: "button", "data-key": "m2-menu", "aria-expanded": String(Boolean(ui.menuOpen)), "aria-controls": "m2-menu",
    "data-source": source("m2.menu"), onclick: actions.toggleMenu,
  }, pending ? icon("i-clock") : null, outage ? icon("i-cloud-off") : null, t("m2.menu"),
  pending ? h("span", { class: "visually-hidden", "data-source": source("banner.pending") }, ` · ${t("banner.pending")}`) : null,
  outage ? h("span", { class: "visually-hidden", "data-source": source("banner.outage") }, ` · ${t("banner.outage")}`) : null);
  // One line: where the jump landed; how the sample got there opens under it (UR7).
  const path = jump.find((el) => el.dataset.key === "banner-path");
  const note = jump.length && !ui.jumped?.closed
    ? h("div", { class: "m2-note", "data-key": "m2-note" },
      h("details", { class: "m2-jump", ontoggle: (e) => { ui.jumped.open = e.target.open; }, ...(ui.jumped.open ? { open: "" } : {}) },
        say("summary", "m2.jumped", { label: ui.jumped.label }, { "data-key": "banner-jumped-short" }),
        say("p", "m2.restarted"), path ?? null),
      // An icon button: × is understood without words, and the name says what it closes (MB11).
      h("button", { class: "btn btn-quiet m2-close", type: "button", "data-key": "m2-close-note", "aria-label": t("m2.closeNoteName"),
        "data-source": source("m2.closeNoteName"), onclick: actions.closeJumpNote }, icon("i-close")))
    : null;
  // The sample label and the jump note go under the fixed bar and scroll with the
  // page (MB13, MB18): the bar keeps what is needed on every screen, the way back and the menu.
  return [h("div", { class: "banner m2-bar", "data-req": "APP-29 APP-31 APP-37" },
    h("div", { class: "m2-row" }, back, menu),
    ui.menuOpen ? h("div", { class: "m2-menu", id: "m2-menu", "data-key": "m2-menu-panel" }, role, controls) : null), label, note];
}
