// The deal owner's decision, simulated, in the foreground (decision TC8, UC-08,
// UC-14). Opened only with "Answer as …", so the request stays visibly pending
// until then (APP-19). The page goes to the background (inert) and the request
// arrives as the deal owner reads it, under a Simulation band that says who is
// deciding (APP-18, APP-31). Decisions are sent with the deal owner as actor.

import * as m from "../model.js";
import { h } from "../dom.js";
import { t, source } from "../copy.js";
import { say, changeText, pendingRequest } from "../format.js";
import { m2Top } from "./mobile.js";

const SEED = "model/seed.json";

export function renderOwner({ store, ui, actions }) {
  const s = store.state;
  const req = pendingRequest(s);
  if (!req) return null;
  const isRecipient = req.issueKey.startsWith("recipient:");
  const name = m.subjectLabel(s, req.issueKey);
  const short = isRecipient ? name.split(" ")[0] : name;
  const v = m.version(s, req.versionId);
  const issue = m.issuesOf(s, m.lastDone(s)).find((i) => i.key === req.issueKey);
  const owner = m.person(s, req.requestedTo).name;
  const from = m.person(s, req.requestedBy).name;
  // A request made again after an earlier approval: what changed since then.
  const earlier = m.requests(s).filter((r) => r.issueKey === req.issueKey && r.id !== req.id
    && m.decisionsOf(s, r).some((d) => d.outcome === "approved"));
  let changed = null;
  if (earlier.length) {
    const before = m.version(s, earlier.at(-1).versionId);
    const [, items] = m.diffVersions(s, before, v);
    changed = say("p", "sim.changedSince", { version: before.number, changes: items.map(changeText).join("\u00a0· ") });
  }
  const close = () => actions.closeOwner();
  return h("div", { class: "overlay-layer owner-layer" },
    h("section", { // (A11Y1)
      class: "mail overlay-mail owner", role: "dialog", "aria-modal": "true", "aria-labelledby": "owner-title", "aria-describedby": "owner-band",
      "data-req": "APP-18 APP-19 APP-31 APP-37",
      onkeydown: (e) => { if (e.key === "Escape") { e.preventDefault(); close(); } },
    },
    m2Top({ key: "action.cancel", dataKey: "owner-cancel-top", onclick: close, titleKey: "owner.answer", title: t("owner.answer", { owner }) }),
    h("p", { class: "owner-band", id: "owner-band" },
      say("strong", "sim.label"), "\u00a0· ", say("span", "sim.acting"), "\u00a0· ", say("span", "sim.deciding")),
    h("header", { class: "mail-head" },
      say("span", "a2.title", {}, { class: "mail-from" }),
      say("span", "a2.version", { version: v.number }, { class: "data" })),
    h("div", { class: "mail-fields" },
      h("div", { class: "mail-field" }, say("span", "owner.from", {}, { class: "field-label" }),
        h("ul", { class: "chips" }, h("li", { class: "chip", "data-source": SEED }, from))),
      h("div", { class: "mail-field" }, say("span", "edit.to", {}, { class: "field-label" }),
        h("ul", { class: "chips" }, h("li", { class: "chip chip-to", "data-source": source("p1.to") }, t("p1.to", { owner }).replace(/^To: /, ""))))),
    isRecipient
      ? say("h2", "p1.title.recipient", { name }, { id: "owner-title", class: "mail-subject", tabindex: "-1", "data-key": "owner-title" })
      : say("h2", "p1.title.wording", { sentence: issue?.matchedText ?? name }, { id: "owner-title", class: "mail-subject", tabindex: "-1", "data-key": "owner-title" }),
    h("div", { class: "mail-body" },
      h("p", {}, say("strong", "sim.reason"), "\u00a0· ", h("span", { "data-source": "docs/4-design/copy.md" }, req.reason)),
      isRecipient
        ? say("p", "scope.recipient", { name, version: v.number, short })
        : say("p", "scope.wording", { version: v.number }),
      changed,
      h("blockquote", { class: "preview quoted" },
        say("p", "preview.title", { version: v.number }, { class: "label-word" }),
        h("p", { "data-source": SEED }, v.subject),
        h("p", { class: "meta", "data-source": SEED }, v.recipients.map((r) => m.person(s, r.personId).name).join(", ")),
        ...v.body.map((p) => h("p", { class: "para", "data-source": SEED }, p))),
      h("div", { class: "field" },
        h("label", { for: "sim-note", "data-source": source("sim.note") }, t("sim.note")),
        h("textarea", { id: "sim-note", "data-key": "sim-note", oninput: (e) => { ui.note = e.target.value; } }, ui.note ?? ""))),
    h("div", { class: "mail-bar" },
      h("button", { class: "btn on-dark", type: "button", "data-key": "owner-cancel", "data-source": source("action.cancel"), onclick: close }, t("action.cancel")),
      h("span", { class: "bar-space" }),
      h("button", { class: "btn on-dark", type: "button", "data-key": "sim-decline", "data-source": source("sim.decline"),
        onclick: () => actions.decide(req.id, "declined") }, t("sim.decline")),
      // Dana's own view: approving is its main action (TC8; US9 keeps Jordan's view quiet).
      h("button", { class: "btn btn-primary on-dark", type: "button", "data-key": "sim-approve",
        "data-source": source(isRecipient ? "sim.approve" : "sim.approveSentence"),
        onclick: () => actions.decide(req.id, "approved") }, isRecipient ? t("sim.approve", { name }) : t("sim.approveSentence")))));
}
