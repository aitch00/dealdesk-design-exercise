// A3 · review before sending, over the draft (screens.md § A3, decision TC1,
// state-to-ui §5, UC-09, UC-10). A modal dialog with the shape of the email.
// Answers the three questions: who it is going to, what it says, what has been
// approved, and whether it can be sent. Send (simulated) stays focusable when it
// cannot send (aria-disabled, D5): pressing it announces the reason and sends nothing.

import { alsoWaiting } from "./draft-review.js";
import * as m from "../model.js";
import { h, clear } from "../dom.js";
import { t, source } from "../copy.js";
import { say } from "../format.js";
import { currentRequests, lastCheckVersion } from "../issues.js";
import { m2Top } from "./mobile.js";

const COORD = "p-jordan";
const SEED = "model/seed.json";
const DV6 = "docs/4-design/copy.md";
const REASON_LINE = {
  sent: 106, "not-run": 107, unavailable: 109, outdated: 110, declined: 111,
  "approval-outdated": 112, "request-outdated": 113, "blocking-open": 114, pending: 115,
};

// The state word of a blocking issue in A3, the same as in A2 (state-to-ui §6, UF28).
function stateWord(s, state) {
  const k = state.kind;
  if (k === "pending") return say("span", "a3.state.pending", {}, { class: "changed-tag" });
  if (k === "approved") return say("span", "a3.state.approved", { version: m.version(s, state.req.versionId).number }, { class: "changed-tag" });
  if (k === "approvalOutdated") {
    return say("span", "a3.state.approvalOutdated", { old: m.version(s, state.req.versionId).number, current: m.cur(s).number }, { class: "changed-tag" });
  }
  if (k === "declined") return say("span", "a3.state.declined", {}, { class: "changed-tag" });
  return say("span", "a3.state.blocking", {}, { class: "changed-tag" }); // open, or a request never decided
}

function issueStateOf(s, issue) {
  return currentRequests(s).find((x) => x.issue.key === issue.key)?.state ?? { kind: "open" };
}

// One line per request that does not approve the current version (UF28).
function notApprovedItem(s, { issue, state }) {
  const subject = m.subjectLabel(s, issue.key);
  const version = m.version(s, state.req.versionId).number;
  if (state.kind === "pending") return say("li", "a3.na.pending", { subject, owner: state.owner, time: m.fmt(state.req.requestedAt) });
  if (state.kind === "approvalOutdated") return say("li", "a3.na.approvalOutdated", { subject, old: version, current: m.cur(s).number });
  if (state.kind === "requestOutdated") return say("li", "a3.na.requestOutdated", { subject, owner: state.owner, version });
  return say("li", "a3.na.declined", { subject, owner: state.owner, time: m.fmt(state.dec.decidedAt) });
}

function verdict(s) {
  if (m.canSend(s)) return t("a3.canSendDetail", { version: m.cur(s).number });
  return m.blockReason(s)[1];
}

export function renderFinalReview(ctx) {
  const status = h("p", { class: "visually-hidden", role: "status", "data-key": "a3-status" });
  const body = h("div", { class: "a3-body" });
  const dialog = h("section", { // (A11Y1)
    class: "mail overlay-mail view-review", role: "dialog", "aria-modal": "true", "aria-labelledby": "a3-title",
    onkeydown: (e) => { if (e.key === "Escape") { e.preventDefault(); location.hash = "#/drafts/harbor"; } },
  }, status, body);
  const root = h("div", { class: "overlay-layer" }, dialog);
  root._slots = { status, body };
  fill(ctx, root);
  return { overlay: root, title: t("title.review"), focus: root.querySelector('[data-key="a3-title"]'), skip: "skip.content" };
}

export function updateFinalReview(ctx, root) {
  fill(ctx, root);
}

function fill(ctx, root) {
  const s = ctx.store.state;
  const { status, body } = root._slots;
  // Changes while the view is open (a decision from the Simulation panel) are announced once.
  const now = verdict(s);
  if (root._lastVerdict !== undefined && root._lastVerdict !== now) status.textContent = now;
  root._lastVerdict = now;

  const cur = m.cur(s);
  const team = m.team(s);
  const final = m.finalChanges(s);

  const issues = m.issuesOf(s, m.lastDone(s));
  const person = (r) => {
    const p = m.person(s, r.personId);
    const org = s.organisations.find((o) => o.id === p.organisationId).name;
    const member = s.teamMembers.find((x) => x.dealId === m.deal(s).id && x.personId === r.personId);
    const role = team.has(r.personId) ? member.role : t("a3.notOnTeam");
    const issue = issues.find((i) => i.severity === "blocking" && i.key === `recipient:${r.personId}`);
    return h("li", { "data-source": source("a3.recipient"), "data-key": `a3-${r.personId}` },
      t("a3.recipient", { name: p.name, email: p.email, org, role }),
      issue ? ["\u00a0· ", stateWord(s, issueStateOf(s, issue))] : null);
  };
  const group = (field, key) => {
    const list = cur.recipients.filter((r) => r.field === field);
    return list.length ? [say("h4", key), h("ul", { class: "plain-list" }, list.map(person))] : [];
  };

  const going = h("section", { class: "a3-section", "aria-labelledby": "a3-going", "data-req": "APP-07 APP-25" },
    say("h3", "a3.goingTo", {}, { id: "a3-going" }),
    ...group("to", "a3.to"), ...group("cc", "a3.cc"),
    final.removed.length
      ? h("ul", { class: "plain-list" }, final.removed.map(([name, version]) =>
        h("li", {}, say("span", "a3.removedIn", { version }, { class: "label-word" }), "\u00a0· ", h("span", { "data-source": SEED }, name))))
      : null);

  const here = (i, idx, para) => i.kind === "wording" && i.paragraphIndex === idx && para.includes(i.matchedText);
  const paragraphs = cur.body.map((para, idx) => {
    const warning = issues.find((i) => i.severity === "warning" && here(i, idx, para));
    const blocking = issues.find((i) => i.severity === "blocking" && here(i, idx, para));
    const changed = final.changedParagraphs.includes(idx);
    return h("p", { class: "para", "data-source": SEED, "data-key": blocking ? "a3-blocking-sentence" : null }, para,
      changed ? say("span", "a3.changed", {}, { class: "changed-tag" }) : null,
      warning ? say("span", "a3.warningKept", {}, { class: "changed-tag" }) : null,
      blocking ? stateWord(s, issueStateOf(s, blocking)) : null);
  });
  const message = h("section", { class: "a3-section", "aria-labelledby": "a3-message", "data-req": "APP-07" },
    say("h3", "a3.message", {}, { id: "a3-message" }),
    h("div", { class: "message" }, h("p", { class: "label-word", "data-source": SEED }, cur.subject), paragraphs));

  // "Exceptions": approved, then what is not approved for this version; "No exceptions used"
  // only when nothing was requested (state-to-ui §6, UF28).
  const requested = currentRequests(s);
  const approvals = requested.filter((x) => x.state.kind === "approved").map(({ issue, state }) => say("li", "a3.approval", {
    subject: m.subjectLabel(s, issue.key), owner: m.person(s, state.dec.decidedBy).name,
    time: m.fmt(state.dec.decidedAt), version: m.version(s, state.req.versionId).number,
  }));
  const notApproved = requested.filter((x) => x.state.kind !== "approved");
  const approvedBody = [];
  if (approvals.length) approvedBody.push(say("h4", "a3.approved", {}, { id: "a3-approved-list" }), h("ul", { class: "plain-list", "aria-labelledby": "a3-approved-list" }, approvals));
  else if (notApproved.length) approvedBody.push(say("p", "a3.nothingApproved", { version: cur.number }));
  else approvedBody.push(say("p", "a3.noExceptions"));
  if (notApproved.length) {
    approvedBody.push(say("h4", "a3.notApproved", {}, { id: "a3-not-approved" }),
      h("ul", { class: "plain-list", "aria-labelledby": "a3-not-approved", "data-key": "a3-not-approved" },
        notApproved.map((x) => notApprovedItem(s, x))));
  }
  const approved = h("section", { class: "a3-section", "aria-labelledby": "a3-approved", "data-req": "APP-07 APP-18 APP-19" },
    say("h3", "a3.exceptions", {}, { id: "a3-approved" }), ...approvedBody);

  const can = m.canSend(s);
  const reason = m.blockReason(s);
  const detail = can
    ? say("p", "a3.canSendWhy", { version: cur.number }, { id: "a3-verdict" }) // the heading already says "You can send" (UR4)
    : h("p", { id: "a3-verdict", "data-source": `${DV6}:${REASON_LINE[reason[0]]}` },
      reason[1], alsoWaiting(s, reason), " ",
      reason[0] === "sent" ? null
        : h("a", { href: "#/drafts/harbor", "data-key": "fix-link", "data-source": source("a3.fixLink") }, t("a3.fixLink")));
  const sendArea = h("section", { class: "mail-bar send-area", "aria-labelledby": "a3-verdict-title", "data-req": "APP-08 APP-11 APP-20 APP-28" },
    h("a", { class: "btn on-dark", href: "#/drafts/harbor", "data-key": "back-to-draft", "data-source": source("a3.back") }, t("a3.back")),
    h("div", { class: "reason" }, say("h3", can ? "a3.canSend" : "a3.cannotSend", {}, { id: "a3-verdict-title" }), detail),
    h("button", {
      class: can ? "btn btn-primary on-dark" : "btn on-dark", type: "button", "data-key": "send",
      "aria-disabled": can ? null : "true", "aria-describedby": "a3-verdict", "data-source": source("a3.send"),
      onclick: () => send(ctx, root),
    }, t("a3.send")));

  clear(body);
  body.append(...[
    m2Top({ key: "a3.back", dataKey: "back-to-draft-top", href: "#/drafts/harbor", titleKey: "action.review" }),
    h("header", { class: "mail-head" }, say("span", "a2.title", {}, { class: "mail-from" }), say("span", "a2.version", { version: cur.number }, { class: "data" })),
    say("h2", "a3.title", {}, { class: "mail-subject", id: "a3-title", tabindex: "-1", "data-key": "a3-title" }),
    h("div", { class: "mail-body a3-sections" }, ...[
      // States below come from the last completed check; an older one says so (UF27).
      m.checkStatus(s) !== "Current" && m.lastDone(s)
        ? say("p", "r2.earlier", { version: lastCheckVersion(s) }, { class: "meta", "data-key": "a3-earlier" }) : null,
      going, message, approved,
      say("p", "a3.limit", {}, { class: "meta" }),
    ].filter(Boolean)),
    sendArea,
  ].filter(Boolean)); // native append() would print null as text
}

async function send(ctx, root) {
  const s = ctx.store.state;
  if (!m.canSend(s)) {
    // Pressing the unavailable button says why and does nothing (UC-10 1a).
    const { status } = root._slots;
    const text = verdict(s);
    status.textContent = "";
    requestAnimationFrame(() => { status.textContent = text; });
    return;
  }
  const r = await ctx.store.dispatch("Send", COORD, {});
  if (r.ok) location.hash = "#/drafts/harbor/record";
}
