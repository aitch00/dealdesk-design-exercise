// P2 · simulation controls (screens.md § P2, UC-14, decisions TC9, SM1–SM8): the
// deal owner's answer, the check outage, things to try and the jumps. A modal
// sheet from the right, under the bar's Simulation button, over a scrim (SM1): it
// is the demo's remote control, not part of the product. The owner's answer is
// given in the foreground (owner.js, TC8); the outage is sent with the evaluator
// as actor.

import * as m from "../model.js";
import { h, icon } from "../dom.js";
import { t, source } from "../copy.js";
import { say, pendingRequest } from "../format.js";
import { JUMP_ORDER } from "../jumps.js";

export const TRIED = ["sam-explained", "owner-decided", "edited-after-review", "review-unavailable"];

// The deal owner answers in the foreground (TC8): the sheet only points to it,
// and says what is waiting (SM5).
function ownerResponse(store, actions) {
  const s = store.state;
  const req = pendingRequest(s);
  if (!req) return section("sim-owner", "sim.owner", [say("p", "sim.none", {}, { class: "sim-help" })]);
  const owner = m.person(s, req.requestedTo).name;
  return section("sim-owner", "sim.owner", [
    say("p", "drafts.waiting", { owner, time: m.fmt(req.requestedAt) }, { class: "sim-help", "data-key": "sim-waiting" }),
    h("div", { class: "actions" },
      h("button", { class: "btn", type: "button", "data-key": "sim-answer", "data-source": source("owner.answer"),
        onclick: (e) => actions.openOwner(e.currentTarget) }, t("owner.answer", { owner }))),
  ]);
}

function section(id, key, children) {
  return h("section", { class: "sim-section", "aria-labelledby": id }, say("h3", key, {}, { id, class: "sim-eyebrow" }), ...children);
}

// Things to try is a record of what the sample has reached, not a set of controls:
// a mark and a word, never a disabled checkbox (SM3).
function thingsToTry(s) {
  const done = TRIED.filter((k) => s.triedItems.includes(k)).length;
  return h("section", { class: "sim-section", "aria-labelledby": "sim-try" },
    h("div", { class: "sim-section-head" },
      say("h3", "sim.try", {}, { id: "sim-try", class: "sim-eyebrow" }),
      say("p", "sim.tryCount", { count: done }, { class: "sim-count", "data-key": "sim-try-count" })),
    h("ul", { class: "sim-try-list" }, TRIED.map((k) => {
      const on = s.triedItems.includes(k);
      return h("li", { class: on ? "is-done" : null, "data-key": `try-${k}` },
        on ? icon("i-check-circle", "sim-mark") : h("span", { class: "sim-mark is-open", "aria-hidden": "true" }),
        h("span", {}, say("span", `sim.try.${k}`),
          say("span", on ? "sim.tryItemDone" : "sim.tryItemOpen", {}, { class: "visually-hidden" })));
    })),
    say("p", "sim.tryNote", {}, { class: "sim-help", "data-key": "sim-try-note" }));
}

// The heading says "Jump to a state": the links drop the "Jump: " of their label,
// and the state on screen, if it came from a jump, is marked (SM4).
const label = (key) => {
  const text = t(key).replace(/^Jump: /, "");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

function jumps(ui) {
  const current = ui.jumped?.id ?? null; // cleared by any change after the jump (app.js)
  const item = (id, href, key) => h("li", {},
    h("a", { href, "data-key": `jump-${id}`, "data-source": source(key), "aria-current": current === id ? "true" : null },
      h("span", {}, label(key)),
      current === id ? say("span", "sim.jumpCurrent", {}, { class: "sim-current" }) : null));
  return section("sim-jump", "sim.jump", [
    say("p", "sim.jumpNote", {}, { class: "sim-help", "data-key": "sim-jump-note" }),
    h("ul", { class: "sim-jump-list" },
      item("start", "#/start", "jump.start"),
      JUMP_ORDER.map((id) => item(id, `#/jump/${id}`, `jump.${id}`))),
  ]);
}

export function renderSimPanel({ store, ui, actions }) {
  const s = store.state;
  if (!ui.simOpen) return h("div", { class: "sim-collapsed" });
  const outage = s.simulation.reviewAvailability === "unavailable";
  const close = () => actions.toggleSimulation();
  const panel = h("section", {
    class: "sim-panel", id: "sim", role: "dialog", "aria-modal": "true", "aria-labelledby": "sim-label", "aria-describedby": "sim-purpose",
    "data-req": "APP-31 APP-37 GEN-07",
    onkeydown: (e) => { if (e.key === "Escape") { e.preventDefault(); close(); } },
  },
    // The legal-pad band says whose this is: the demo's, not the product's (CL2, SM2).
    h("header", { class: "sim-head" },
      h("div", { class: "sim-title-row" },
        say("h2", "sim.label", {}, { class: "sim-label", id: "sim-label", tabindex: "-1", "data-key": "sim-title" }),
        h("button", { class: "btn btn-quiet", type: "button", "data-key": "sim-hide", "aria-controls": "sim", "aria-expanded": "true",
          "data-source": source("sim.hide"), onclick: close }, t("sim.hide"))),
      say("p", "sim.purpose", {}, { class: "sim-purpose", id: "sim-purpose" })),
    h("div", { class: "sim-body" },
      ownerResponse(store, actions),
      section("sim-service", "sim.service", [
        h("label", { class: "switch" },
          h("input", { type: "checkbox", role: "switch", "data-key": "sim-outage", checked: outage, "aria-describedby": "sim-outage-help", onchange: actions.toggleOutage }),
          say("span", "sim.outage")),
        say("p", "sim.outageHelp", {}, { class: "sim-help", id: "sim-outage-help" }),
      ]),
      thingsToTry(s),
      jumps(ui)));
  // The scrim takes the rest of the page: a click on it closes the sheet (SM1).
  return h("div", { class: "sim-layer", onclick: (e) => { if (e.target === e.currentTarget) close(); } }, panel);
}
