// A4 · review record (screens.md § A4, UC-11, decision TC1): the sent message
// read-only in the centre, the record in the Review notes column: what was
// sent, to whom, how each issue ended and who decided what.

import * as m from "../model.js";
import { h, icon, clear } from "../dom.js";
import { t, source } from "../copy.js";
import { say, fixedIssues } from "../format.js";

const SEED = "model/seed.json";

export function renderRecord(ctx) {
  const status = h("p", { class: "visually-hidden", role: "status", "data-key": "a4-status" });
  const body = h("div", { class: "a4-body" });
  const notes = h("section", { class: "notes view-record", "aria-labelledby": "a4-title" }, status, body);
  const main = h("div", { class: "mail-slot" });
  const out = { main, notes, title: t("title.record"), skip: "skip.content" };
  out._slots = { status, body, main };
  fill(ctx, out);
  // Announced once on arrival, after the region is in the page.
  setTimeout(() => { status.textContent = t("a4.announce"); }, 100);
  out.focus = notes.querySelector('[data-key="a4-title"]');
  return out;
}

export function updateRecord(ctx, out) {
  fill(ctx, out);
}

function fill(ctx, out) {
  const s = ctx.store.state;
  const rec = m.sentRecord(s);
  const { body, main } = out._slots;
  clear(body);
  clear(main);
  if (!rec) return;
  const sent = m.version(s, rec.versionId);
  const removed = m.finalChanges(s).removed;
  const fixed = new Map(fixedIssues(s).map((f) => [f.key, f]));

  const outcomes = rec.issueOutcomes.map((o) => {
    const label = m.subjectLabel(s, o.key);
    if (o.outcome === "fixed") {
      const f = fixed.get(o.key);
      return f.kind === "recipient"
        ? say("li", "a4.outcome.removed", { name: label, version: f.version })
        : say("li", "a4.outcome.reworded", { label, version: f.version });
    }
    if (o.outcome === "warning kept") return say("li", "a4.outcome.warning", { label });
    const req = m.latestRequest(s, o.key);
    const dec = m.decisionsOf(s, req).at(-1);
    return say("li", "a4.outcome.approved", { subject: label, owner: m.person(s, dec.decidedBy).name, version: m.version(s, req.versionId).number });
  });
  const decisions = rec.decisions.map((d) => say("li", d.outcome === "approved" ? "a4.decision.approved" : "a4.decision.declined", {
    subject: d.subject, owner: d.decidedBy, time: m.fmt(d.decidedAt), version: d.forVersion,
  }));

  const section = (key, id, content, req) => h("section", { class: "a4-section", "aria-labelledby": id, "data-req": req },
    say("h3", key, {}, { id, class: "group-head" }), content);
  // The line names who received it, so "No real email" is not read as "nobody" (OA4).
  const names = rec.recipients.map((r) => r.name);
  const joined = names.length > 1 ? t("a4.and", { first: names.slice(0, -1).join(", "), last: names.at(-1) }) : names[0];
  const sentLine = () => say("p", "a4.sentLine", { names: joined, time: m.fmt(rec.sentAt), version: sent.number }, { class: "data-line" });

  body.append(...[
    // The title names the panel itself: no eyebrow repeating "Review record" above it (UR7).
    h("div", { class: "state-phrase" }, icon("i-send"),
      h("div", {}, say("h2", "a4.title", { }, { class: "phrase record-title", tabindex: "-1", "data-key": "a4-title", id: "a4-title" }), sentLine())),
    section("a4.to", "a4-to", h("ul", { class: "plain-list" }, rec.recipients.map((r) =>
      h("li", { "data-source": SEED }, r.field === "cc" ? `${r.name}\u00a0· ${t("a3.cc")}` : r.name))), "APP-09"),
    removed.length
      ? section("a4.removed", "a4-removed", h("ul", { class: "plain-list" }, removed.map(([name, version]) =>
        h("li", {}, h("span", { "data-source": SEED }, name), "\u00a0· ", say("span", "a3.removedIn", { version })))), "APP-09")
      : null,
    section("a4.issues", "a4-issues", h("ul", { class: "plain-list" }, outcomes), "APP-09"),
    section("a4.decisions", "a4-decisions", decisions.length ? h("ul", { class: "plain-list" }, decisions) : say("p", "a3.noExceptions"), "APP-09 APP-31"),
  ].filter(Boolean)); // native append() would print null as text

  // The sent message, read-only, where the draft was (TC1).
  const field = (f) => {
    const list = rec.recipients.filter((r) => (f === "cc" ? r.field === "cc" : r.field !== "cc"));
    if (!list.length) return null;
    return h("div", { class: "mail-field" }, say("span", f === "to" ? "edit.to" : "edit.cc", {}, { class: "field-label" }),
      h("ul", { class: "chips" }, list.map((r) => h("li", { class: "chip", "data-source": SEED }, r.name))));
  };
  main.append(h("article", { class: "mail is-sent", "aria-labelledby": "sent-title", id: "sent-message", "data-req": "APP-09" },
    h("header", { class: "mail-head" },
      h("a", { class: "only-narrow back", href: "#/drafts", "data-key": "back-to-drafts", "data-source": source("nav.backToDrafts") }, t("nav.backToDrafts")),
      say("h1", "a2.title", {}, { tabindex: "-1", "data-key": "a2-title" }),
      say("span", "a4.sentMessage", { version: sent.number }, { class: "data" })),
    h("div", { class: "mail-fields" }, field("to"), field("cc")),
    h("h2", { class: "mail-subject", id: "sent-title", "data-source": SEED }, sent.subject),
    h("div", { class: "mail-body message" }, sent.body.map((p) => h("p", { class: "para", "data-source": SEED }, p))),
    h("div", { class: "mail-bar" },
      icon("i-send"),
      h("div", { class: "reason" }, sentLine()),
      h("button", { class: "btn on-dark", type: "button", "data-key": "record-restart", "data-source": source("banner.restart"), onclick: ctx.actions.askRestart }, t("banner.restart")))));
}
