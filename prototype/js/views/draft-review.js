// A2 · the draft in the three-column page (decisions TC1–TC12).
// The draft is an email in the centre (R1, R3, R4 and the bar R6); the Review
// notes on the right hold the verdict (R2), the context and one card per issue,
// grouped by who must act (R5 and the explanations of R3/R4, TC3). One live
// region (role="status") in the verdict reads the state phrase once per change
// (D6); role="alert" is used only when the check just requested fails (UC-05 AC-6).

import * as m from "../model.js";
import { h, icon, clear } from "../dom.js";
import { t, source } from "../copy.js";
import { say, changeText, fixedIssues, pendingRequest } from "../format.js";
import { renderExceptionMail } from "./exception-panel.js";
import { m2 } from "../mode.js";
import { issueState, counts, group, outdatedByEdit, lastCheckVersion, stillPresent, waitingSubjects, currentRequests } from "../issues.js";

const COORD = "p-jordan";
const CHECKING_MS = 800; // "Checking…" is a presentation delay over an atomic check (UF15)
const SEED = "model/seed.json";
const MARKER = "docs/4-design/copy.md"; // numbered marker in square brackets
const DV6 = "docs/4-design/copy.md";
const REASON_LINE = {
  sent: 106, "not-run": 107, unavailable: 109, outdated: 110, declined: 111,
  "approval-outdated": 112, "request-outdated": 113, "blocking-open": 114, pending: 115,
};

const plural = (n, word = "s") => (n === 1 ? "" : word);
const ownerName = (s) => m.person(s, m.deal(s).ownerId).name;
export const wide = () => window.matchMedia("(min-width: 65rem)").matches;
// An issue key as an id or data-key fragment.
export const keyId = (key) => key.replace(/[^\w-]/g, "-");

function btn(key, label, { primary = false, dataKey, aria, onclick, attrs = {}, cls = "" } = {}) {
  return h("button", {
    class: `btn${primary ? " btn-primary" : ""}${cls ? ` ${cls}` : ""}`, type: "button", "data-key": dataKey,
    "data-source": source(key), "aria-label": aria, onclick, ...attrs,
  }, label ?? t(key));
}

// ---------------------------------------------------------------- issue states

function hasValidApproval(s) {
  return m.requests(s).some((r) => m.requestStatus(s, r) === "approved");
}

function hasPendingRequest(s) {
  return m.requests(s).some((r) => m.requestStatus(s, r) === "pending");
}

// Before a change that makes an approval or a pending request outdated, say so (UC-03, US2).
function outdatingNotice(s) {
  if (hasValidApproval(s)) return say("p", "notice.approvalOutdated", { owner: ownerName(s) }, { class: "meta" });
  if (hasPendingRequest(s)) return say("p", "notice.requestOutdated", { owner: ownerName(s) }, { class: "meta" });
  return null;
}

// Where the text offers an exception that cannot be requested yet (US4).
const requestLater = () => say("p", "row.requestAfterCheck", {}, { class: "meta", "data-key": "request-after-check" });
// When an exception has to wait for the check, the card offers the check itself, so the
// option its text names is one step away, where the reader is looking (VA7).
// While the check is unavailable the status already offers "Try again" as the next step.
const checkFromCard = (s, act, issue) => (m.draftStatus(s) === "ReviewUnavailable" ? null : h("div", { class: "actions" },
  btn("action.runCheck", null, { dataKey: `card-run-check-${keyId(issue.key)}`, onclick: act.runCheck })));

// ---------------------------------------------------------------- the state phrase

// Blocked phrases end with "· Can't send yet"; the waiting part goes before it (UF26).
const CANT = "\u00a0· Can't send yet";

function phrase(s) {
  const status = m.draftStatus(s);
  const owner = ownerName(s);
  if (status === "Blocked") {
    const reason = m.blockReason(s)?.[0];
    const c = counts(s);
    let p;
    if (reason === "declined") p = { key: "r2.blocked.declined", vars: { owner } };
    else if (reason === "approval-outdated") {
      // Says whose approval, without opening the card (OA7).
      const subjects = currentRequests(s).filter((x) => x.state.kind === "approvalOutdated").map((x) => m.subjectLabel(s, x.issue.key));
      p = { key: "r2.blocked.approval", vars: { subject: subjects.join(" and ") } };
    }
    else p = { key: "r2.blocked.count", vars: { count: c.blocking, plural: plural(c.blocking) } };
    let text = t(p.key, p.vars);
    if (c.waiting) text = `${text.slice(0, -CANT.length)}\u00a0· ${t("r2.waitingPart", { count: c.waiting, owner })}${CANT}`;
    return { ...p, text, icon: "i-octagon" };
  }
  if (status === "NeedsNewCheck") {
    const w = m.whatChanged(s);
    const words = w.parts.map((p) => t(`parts.${p}`));
    const joined = words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
    const parts = joined.charAt(0) + joined.slice(1).toLowerCase();
    const p = { key: "r2.needsNewCheck", vars: { parts, version: w.sinceVersion }, icon: "i-arrows" };
    // An edit that made a request outdated says so before the check (UF27).
    const outdated = outdatedByEdit(s);
    if (!outdated.length) return p;
    const approvals = outdated.filter((x) => x.state.kind === "approvalOutdated");
    const part = approvals.length ? "r2.part.approvalOutdated" : "r2.part.requestOutdated";
    const subject = (approvals.length ? approvals : outdated).map((x) => m.subjectLabel(s, x.issue.key)).join(" and ");
    return { ...p, text: `${t(p.key, p.vars)}\u00a0· ${t(part, { subject })}` };
  }
  if (status === "WaitingForDecision") {
    const req = m.requests(s).find((r) => m.requestStatus(s, r) === "pending");
    return { key: "r2.waiting", vars: { owner, time: m.fmt(req.requestedAt) }, icon: "i-clock" };
  }
  if (status === "ReviewUnavailable") return { key: "r2.unavailable", vars: {}, icon: "i-cloud-off" };
  if (status === "ReadyToSend") {
    const count = m.issuesOf(s, m.lastDone(s)).filter((i) => i.severity === "warning").length;
    const version = m.cur(s).number;
    return count
      ? { key: "r2.ready", vars: { version, count, plural: plural(count) }, icon: "i-check-circle" }
      : { key: "r2.readyNoWarning", vars: { version }, icon: "i-check-circle" };
  }
  // NeedsCheck has no rendering in the prototype (UF12): report it rather than invent one.
  console.error(`No state-to-ui row for Draft.status ${status}`);
  return { key: "r2.checking", vars: {}, icon: "i-activity" };
}

function reasonParagraph(s, id) {
  const r = m.blockReason(s);
  if (!r) return null;
  return h("p", { class: "reason", id, "data-key": "reason", "data-source": `${DV6}:${REASON_LINE[r[0]]}` }, r[1], alsoWaiting(s, r));
}

// The reason names what the coordinator must do; a decision still waiting is
// said next to it, so the bar agrees with the state phrase (US14).
export function alsoWaiting(s, reason) {
  if (reason[0] !== "blocking-open") return null;
  const subjects = waitingSubjects(s);
  if (!subjects.length) return null;
  return h("span", {}, " ", say("span", "reason.alsoWaiting", { owner: ownerName(s), subject: subjects.join(", ") }, { "data-key": "also-waiting" }));
}

// ---------------------------------------------------------------- the next step (TC4)

// Issues of the last completed check in the order of the draft: recipients
// first, then sentences in reading order.
function orderedIssues(s) {
  const issues = m.issuesOf(s, m.lastDone(s));
  const body = m.cur(s).body;
  const at = (i) => (i.paragraphIndex < body.length ? body[i.paragraphIndex].indexOf(i.matchedText) : 0);
  const words = issues.filter((i) => i.kind === "wording")
    .sort((a, b) => a.paragraphIndex - b.paragraphIndex || at(a) - at(b));
  return [...issues.filter((i) => i.kind === "recipient"), ...words];
}

// "auto" opens the first card on which the coordinator must act and selects
// it. With nothing left on the issues, the next action is marked instead.
// After an action (a2.advance) the next step also takes the focus.
function resolveAuto(s, a2) {
  if (a2.expanded !== "auto") return;
  const advance = a2.advance;
  a2.advance = false;
  a2.expanded = null;
  a2.next = null;
  if (m.sentRecord(s) || !m.lastDone(s)) return;
  const status = m.draftStatus(s);
  const first = orderedIssues(s).find((i) => i.severity === "blocking" && stillPresent(s, i) && group(s, i) === "blocking");
  if (first) {
    a2.expanded = first.key;
    a2.sel = first.key;
  } else {
    a2.sel = null;
  }
  // The check comes first when it is the only way on: review is unavailable, or
  // the open card waits for a new check (an outdated request or approval). The
  // card stays open but does not carry "Next" (comprehension test, states 5–6).
  const checkFirst = status === "ReviewUnavailable"
    || (status === "NeedsNewCheck" && (!first || ["requestOutdated", "approvalOutdated"].includes(issueState(s, first).kind)));
  if (first && !checkFirst) {
    // The open card is the next step, and says so: two actions waiting at once
    // (the coordinator's and the deal owner's) otherwise read as having no order.
    a2.next = `card-head-${keyId(first.key)}`;
    if (advance) a2.focusNext = `[data-key="card-head-${keyId(first.key)}"]`;
    return;
  }
  if (checkFirst) a2.next = "run-check";
  else if (status === "ReadyToSend") a2.next = "review-before-sending";
  else if (status === "WaitingForDecision") a2.next = "answer-as-dana";
  if (advance && a2.next) a2.focusNext = `[data-key="${a2.next}"]`;
}

// After a successful action, the next card opens (TC4).
export function advance(a2) {
  a2.expanded = "auto";
  a2.advance = true;
}

// The "Next" mark beside the next action, read with it (TC4).
function markNext(root, a2) {
  if (!a2.next) return;
  const target = root.querySelector(`[data-key="${a2.next}"]`);
  if (!target) return;
  target.classList.add("is-next");
  const tag = say("span", "next.label", {}, { class: "next-tag", id: "next-tag", "data-key": "next-tag" });
  target.before(tag);
  const described = target.getAttribute("aria-describedby");
  target.setAttribute("aria-describedby", described ? `next-tag ${described}` : "next-tag");
}

// ---------------------------------------------------------------- the view

const isEditing = (a2) => Boolean(a2.edit && a2.edit.confirmed);

export function renderDraftReview(ctx) {
  // The verdict keeps its live regions across re-renders, so only real changes are announced.
  const status = h("p", { class: "visually-hidden", role: "status", "data-key": "r2-status" });
  const alert = h("div", { class: "visually-hidden", role: "alert", "data-key": "r2-alert" });
  const verdict = h("div", { class: "verdict-body" });
  const groups = h("div", { class: "notes-groups" });
  const notes = h("section", { class: "notes", "aria-labelledby": "notes-title", "data-req": "APP-03 APP-06 APP-10 APP-12 APP-22 APP-24 APP-27 APP-34" },
    say("h2", "notes.title", {}, { class: "eyebrow", id: "notes-title" }),
    h("section", { class: "verdict", "aria-label": "Status" }, status, alert, verdict),
    groups);
  const mail = h("div", { class: "mail-slot" });
  const overlay = h("div", { class: "p1-slot" });
  const out = { main: mail, notes, overlay, title: t("title.draft"), skip: "skip.draft" };
  out._slots = { status, alert, verdict, groups, mail, overlay };
  fill(ctx, out);
  const a2 = ctx.ui.a2;
  let focus = mail.querySelector("h1");
  if (a2.edit && a2.edit.confirmed) focus = mail.querySelector('[data-key="mode-bar"]'); // an edit kept while away (US3)
  else if (a2.resume) focus = notes.querySelector('[data-key="resume"]');
  else if (ctx.from === "review") focus = mail.querySelector('[data-key="review-before-sending"]');
  out.focus = focus;
  return out;
}

export function updateDraftReview(ctx, out) {
  fill(ctx, out);
}

function fill(ctx, out) {
  const { store, ui } = ctx;
  const s = store.state;
  const a2 = ui.a2;
  const slots = out._slots;
  const act = actions(ctx, out);
  // Once sent, the address moves to the record: nothing to draw here.
  if (m.sentRecord(s)) return;
  // While "Checking…" shows, only the verdict changes; the rest keeps the
  // content it had when the check was requested (state-to-ui §1, UF15).
  const frozen = a2.checking && slots.rendered;
  slots.rendered = true;
  if (!a2.checking) resolveAuto(s, a2);
  renderVerdict(ctx, slots, act);
  if (frozen) return;

  const cards = new Map(orderedIssues(s).map((i) => [i.key, card(s, a2, act, i)]));
  clear(slots.mail);
  slots.mail.append(isEditing(a2) ? editMail(s, a2, act) : draftMail(s, a2, act, cards));
  renderGroups(s, a2, slots, cards);

  clear(slots.overlay);
  if (a2.p1) slots.overlay.append(renderExceptionMail(ctx, act));
  // Under the final review the next step is in the review itself, not behind it.
  if (ctx.ui.route?.view !== "review") {
    markNext(out.notes, a2);
    markNext(slots.mail, a2);
  }
}

// ---------------------------------------------------------------- the verdict (R2)

// Long enough for a screen reader to pick up the change (OA2).
const ANNOUNCE_MS = 3000;

function renderVerdict(ctx, slots, act) {
  const s = ctx.store.state;
  const a2 = ctx.ui.a2;
  const p = a2.checking ? { key: "r2.checking", vars: {}, icon: "i-activity" } : phrase(s);
  const text = p.text ?? t(p.key, p.vars);
  // Announce the phrase once per change; a failed check is announced by the alert instead.
  // The region empties once the phrase has been announced, so whoever reads the
  // page finds the phrase once, in the verdict (OA2).
  if (a2.suppressStatus) {
    slots.status.textContent = ""; // the alert carries the failure; "Checking…" must not stay behind (US6)
    delete slots.status.dataset.said;
  } else if (slots.status.dataset.said !== text) {
    slots.status.textContent = text;
    slots.status.dataset.said = text;
    slots.status.dataset.source = source(p.key);
    const el = slots.status;
    setTimeout(() => { if (el.textContent === text) el.textContent = ""; }, ANNOUNCE_MS);
  }
  a2.suppressStatus = false;
  if (slots.alert.textContent !== (a2.alert ?? "")) {
    slots.alert.textContent = a2.alert ?? "";
    slots.alert.dataset.source = source("r2.unavailable");
  }

  const status = m.draftStatus(s);
  const editing = isEditing(a2);
  const actionsRow = [];
  if (editing) {
    // The verdict describes the saved version; its actions would act on that version (UF31).
  } else if (a2.checking) {
    actionsRow.push(btn("action.runCheck", null, { dataKey: "run-check", attrs: { "aria-busy": "true" }, onclick: () => {} }));
  } else if (status === "NeedsNewCheck") {
    actionsRow.push(btn("action.runCheck", null, { primary: true, dataKey: "run-check", onclick: act.runCheck }));
  } else if (status === "ReviewUnavailable") {
    actionsRow.push(btn("action.tryAgain", null, { primary: true, dataKey: "run-check", onclick: act.runCheck }),
      btn("action.keepEditing", null, { dataKey: "keep-editing", onclick: act.keepEditing }));
  }

  const below = [];
  // When the last check ran and on which version: the result is visibly fresh,
  // without a Run check that would only repeat it (UR8).
  const done = m.lastDone(s);
  if (done && !a2.checking) below.push(say("p", "r2.checkedAt", { time: typeof done.finishedAt === "string" ? done.finishedAt : m.fmt(done.finishedAt), version: m.version(s, done.versionId).number }, { class: "below checked-at tabular", "data-key": "checked-at" }));
  if (editing) below.push(say("p", "edit.statusNote", { version: m.cur(s).number }, { class: "below", "data-key": "edit-status-note" }));
  if (a2.resume) {
    for (const line of a2.resume) below.push(say("p", line.key, line.vars, { class: "below resume", tabindex: "-1", "data-key": "resume" }));
  }
  const pending = pendingRequest(s);
  // The deal owner answers in the foreground, only when asked to (TC8).
  if (!a2.checking && pending && !editing) {
    // Framed like the Simulation drawer, and says who answers in the real tool (OA8).
    below.push(h("div", { class: "below answer is-simulation", "data-req": "APP-19 APP-31 APP-37" },
      h("p", {}, say("strong", "sim.label"), "\u00a0· ",
        say("span", "drafts.waiting", { owner: m.person(s, pending.requestedTo).name, time: m.fmt(pending.requestedAt) }), "."),
      say("p", "owner.explain", { owner: m.person(s, pending.requestedTo).name }, { class: "meta", "data-key": "owner-explain" }),
      btn("owner.answer", t("owner.answer", { owner: m.person(s, pending.requestedTo).name }), {
        dataKey: "answer-as-dana", onclick: (e) => ctx.actions.openOwner(e.currentTarget),
      })));
  }
  if (ctx.ui.lastDecision) {
    below.push(h("p", { class: "below", tabindex: "-1", "data-key": "sim-decided" },
      say("strong", "sim.label"), "\u00a0· ", say("span", ctx.ui.lastDecision.key, ctx.ui.lastDecision.vars)));
  }
  if (!a2.checking && status === "ReviewUnavailable") below.push(say("p", "r2.unavailableHint", {}, { class: "below", "data-key": "unavailable-hint" }));
  // On a wide screen "From an earlier check" is said once, in the heading of the
  // cards it applies to (UR4); on a narrow one the cards sit in the draft, with no
  // heading, so the verdict says it.
  const earlier = !wide() && m.lastDone(s) && ["ReviewUnavailable", "NeedsNewCheck"].includes(status) && !a2.checking;
  if (earlier) below.push(say("p", "r2.earlier", { version: lastCheckVersion(s) }, { class: "below", "data-key": "earlier" }));
  if (!a2.checking && status === "NeedsNewCheck") {
    const w = m.whatChanged(s);
    const outdated = outdatedByEdit(s).map(({ issue, state }) => say("p",
      state.kind === "approvalOutdated" ? "r2.outdated.approval" : "r2.outdated.request",
      { owner: state.owner, subject: m.subjectLabel(s, issue.key), version: m.version(s, state.req.versionId).number },
      { "data-key": "outdated-request" }));
    below.push(h("div", { class: "below-panel", tabindex: "-1", "data-key": "what-changed", "data-req": "APP-10 APP-26" },
      say("p", "r2.whatChanged"),
      h("ul", { class: "changes" }, w.items.map((it) => h("li", { "data-source": "docs/4-design/copy.md" }, changeText(it)))),
      ...outdated));
  }
  if (a2.noChange) below.push(say("p", "edit.noChange", {}, { class: "below", tabindex: "-1", "data-key": "no-change" }));

  // In the mobile layout the notes that only explain go under "Details" (MB3).
  if (m2()) {
    const quiet = below.filter((el) => el.dataset?.key === "unavailable-hint" || el.dataset?.key === "earlier");
    if (quiet.length) {
      const details = h("details", { class: "below m2-details", "data-key": "m2-details", ontoggle: (e) => { a2.m2Details = e.target.open; } },
        say("summary", "m2.details"), ...quiet);
      if (a2.m2Details) details.open = true;
      below.splice(below.indexOf(quiet[0]), 0, details);
      for (const el of quiet) below.splice(below.lastIndexOf(el), 1);
    }
  }
  // The phrase is one sentence; its first part is set as the title (TC3).
  const [head, ...rest] = text.split("\u00a0· ");
  clear(slots.verdict);
  slots.verdict.append(h("div", { class: "state-phrase" },
    icon(p.icon, a2.checking ? "spin" : ""),
    h("div", {},
      h("p", { class: "phrase tabular", tabindex: "-1", "data-key": "phrase", "data-source": source(p.key) },
        h("span", { class: "phrase-head" }, head),
        rest.length ? [h("span", { class: "visually-hidden" }, "\u00a0· "), h("span", { class: "phrase-rest" }, rest.join("\u00a0· "))] : null),
      actionsRow.length ? h("div", { class: "actions" }, actionsRow) : null,
      ...below)));
}

// ---------------------------------------------------------------- cards

function personLine(s, pid) {
  const p = m.person(s, pid);
  return { name: p.name, email: p.email, org: s.organisations.find((o) => o.id === p.organisationId).name };
}

// "Sets a timing expectation for the client. It doesn't block…" → "Sets a timing expectation for the client"
const firstSentence = (text) => text.split(". ")[0].replace(/\.$/, "");

const fieldWord = (field) => t(field === "to" ? "edit.to" : "edit.cc");

// One card per issue of the last check (TC3, TC4): what the element in the
// draft needs, in the words of state-to-ui §2 and §3.
function card(s, a2, act, issue) {
  const current = m.checkStatus(s) === "Current";
  const present = stillPresent(s, issue);
  const model = issue.kind === "recipient" ? recipientCard(s, act, issue, current, present) : sentenceCard(s, a2, act, issue, current, present);
  const accordion = true;
  const editorHere = a2.editor?.issueKey === issue.key;
  const open = a2.expanded === issue.key || editorHere;
  const id = `card-${keyId(issue.key)}`;
  const editing = isEditing(a2);
  const head = h("button", {
    type: "button", class: "card-head", "data-key": `card-head-${keyId(issue.key)}`,
    "aria-expanded": accordion ? String(open) : null, "aria-controls": `${id}-body`,
    onclick: () => act.toggleCard(issue.key),
  },
  model.icon ? icon(model.icon) : h("span", { class: "card-ref", "data-source": MARKER }, model.ref ?? ""),
  h("span", { class: "card-titles" },
    h("span", { class: "card-title" }, model.icon && model.ref ? h("span", { "data-source": MARKER }, `${model.ref} `) : null, h("span", { "data-source": SEED }, model.title)),
    open && model.text.length ? null : h("span", { class: "card-type" }, model.type)));
  let body = null;
  if (open) {
    // In the mobile layout the person's details come after the actions (MB6).
    const meta = model.meta ? h("p", { class: "meta", "data-source": SEED }, model.meta) : null;
    body = h("div", { class: "card-body", id: `${id}-body` },
      m2() ? null : meta,
      model.text.length ? h("p", { id: model.expId, class: "tabular" }, model.text) : null,
      editorHere ? say("p", "card.editingInMessage", {}, { class: "meta", "data-key": "editing-in-message" }) : null,
      !editing && !editorHere && model.actions.length ? model.warn : null,
      !editing && !editorHere && model.actions.length ? h("div", { class: "actions" }, model.actions) : null,
      !editing && !editorHere ? model.note : null,
      m2() ? meta : null);
  }
  return h("section", {
    class: `card ${model.rule}${a2.sel === issue.key ? " is-sel" : ""}${editing ? " is-readonly" : ""}`,
    id, "data-issue": issue.key, "aria-label": `${model.title}: ${model.typeText}`,
  }, head, body);
}

function recipientCard(s, act, issue, current, present) {
  const pid = issue.key.slice("recipient:".length);
  const who = personLine(s, pid);
  const name = who.name;
  if (!present) {
    // Removed until the next check (state-to-ui §2, Removed).
    const undoable = s.undoable === m.cur(s).id && m.cur(s).changeSummary === `${name} removed`;
    // The title already names the person: the line says what happened and what comes next (UR7).
    const typeText = t("row.removedType");
    return {
      icon: null, ref: null, title: name, type: [say("span", "row.removedType.word"), "\u00a0· ", say("span", "row.removedType.next")], typeText, text: [], meta: null, rule: "rule-none",
      actions: undoable ? [btn("action.undo", null, { dataKey: "undo", aria: t("aria.undoRemove", { name }), onclick: act.undo })] : [],
      warn: null, note: null,
    };
  }
  const field = m.version(s, m.lastDone(s).versionId).recipients.find((r) => r.personId === pid)?.field
    ?? m.cur(s).recipients.find((r) => r.personId === pid)?.field ?? "cc";
  const meta = `${fieldWord(field)}\u00a0· ${who.email}\u00a0· ${who.org}`;
  const st = issueState(s, issue);
  // While review is unavailable "Try again" is the one filled button (comprehension test, third round).
  const remove = (primary) => btn("action.remove", t("action.remove", { name }), { primary: primary && m.draftStatus(s) !== "ReviewUnavailable", dataKey: `remove-${pid}`, onclick: () => act.remove(pid) });
  const again = () => (current
    ? btn("action.requestAgain", null, { dataKey: `request-${issue.key}`, aria: t("aria.requestAgain", { name }), onclick: (e) => act.openP1(issue.key, e.currentTarget) })
    : null);
  const why = [say("strong", "row.notOnTeam"), "\u00a0· "];
  const blockingWord = [say("strong", "row.blocking.word"), "\u00a0· "];
  const typeOf = (word) => [say("span", word), "\u00a0· ", say("span", "row.notOnTeam")];
  let iconId = "i-octagon";
  let rule = "rule-blocks";
  let text;
  let type = typeOf("row.blocking.word");
  let typeText = `${t("row.blocking.word")} · ${t("row.notOnTeam")}`;
  let actionsRow = [];
  let note = null;
  if (st.kind === "open") {
    text = [...blockingWord, say("strong", "row.notOnTeam"), "\u00a0· ",
      say("span", "row.notOnTeamWhy", { org: who.org, deal: m.deal(s).name }), " ",
      say("span", "row.notOnTeamAction", { name, owner: `deal owner ${ownerName(s)}` })];
    actionsRow = [remove(false), current
      ? btn("action.requestException", null, { dataKey: `request-${issue.key}`, aria: t("aria.requestException", { name }), onclick: (e) => act.openP1(issue.key, e.currentTarget) })
      : null];
    if (!current) note = [requestLater(), checkFromCard(s, act, issue)];
  } else if (st.kind === "pending") {
    iconId = "i-clock";
    rule = "rule-blocks is-waiting"; // sending waits, nothing to change: solid rule, no red (CL1)
    type = typeOf("row.pending.word");
    typeText = `${t("row.pending.word")} · ${t("row.notOnTeam")}`;
    text = [say("strong", "row.pending.word"), "\u00a0· ", ...why, say("span", "row.pending", { owner: st.owner, time: m.fmt(st.req.requestedAt) })];
    actionsRow = [remove(false)];
  } else if (st.kind === "approved") {
    iconId = "i-check-circle";
    rule = "rule-none";
    // Collapsed, the card still says who approved and for which version (UR5).
    const short = { owner: st.owner, version: m.version(s, st.req.versionId).number };
    type = [say("span", "row.approved.word"), " ", say("span", "row.approvedShort", short)];
    typeText = `${t("row.approved.word")} ${t("row.approvedShort", short)}`;
    text = [say("strong", "row.approved.word"), " ",
      say("span", "row.approved", { owner: st.owner, time: m.fmt(st.dec.decidedAt), version: m.version(s, st.req.versionId).number })];
  } else if (st.kind === "approvalOutdated") {
    iconId = "i-check-struck";
    text = [...blockingWord, ...why, say("strong", "row.approvalOutdated", { old: m.version(s, st.req.versionId).number, current: m.cur(s).number })];
    actionsRow = [remove(false), again()];
    if (!current) note = [requestLater(), checkFromCard(s, act, issue)];
  } else if (st.kind === "requestOutdated") {
    iconId = "i-clock-struck";
    text = [...blockingWord, ...why, say("span", "row.requestOutdated", { owner: st.owner, version: m.version(s, st.req.versionId).number })];
    actionsRow = [remove(false), again()];
    if (!current) note = [requestLater(), checkFromCard(s, act, issue)];
  } else {
    iconId = "i-x-circle";
    type = [say("span", "row.blocking.word"), "\u00a0· ", say("span", "row.declined.word")];
    typeText = `${t("row.blocking.word")} · ${t("row.declined.word")}`;
    text = [...blockingWord, ...why, say("strong", "row.declined.word"), " ",
      say("span", "row.declined", { owner: st.owner, time: m.fmt(st.dec.decidedAt) }),
      st.dec.note ? h("span", { "data-source": "docs/4-design/copy.md" }, `\u00a0· '${st.dec.note}'`) : null];
    actionsRow = [remove(true), again()];
  }
  // Removing the person a request is waiting for needs no warning: there is nothing left to ask.
  const warn = st.kind !== "approved" && st.kind !== "pending" ? outdatingNotice(s) : null;
  return {
    // From an earlier check the card keeps its rule: a blocking issue still reads as
    // blocking until the next check says otherwise (GA10).
    icon: iconId, ref: null, title: name, type, typeText, meta, text, rule: current ? rule : `${rule} is-earlier`,
    actions: actionsRow.filter(Boolean), warn, note, expId: `exp-${pid}`,
  };
}

function sentenceCard(s, a2, act, issue, current, present) {
  const pattern = s.wordingPatterns.find((p) => p.id === issue.patternId);
  const label = pattern.label;
  if (!present) {
    // Reworded until the next check (state-to-ui §3, Changed).
    const undoable = s.undoable === m.cur(s).id && /^Wording changed in paragraph/.test(m.cur(s).changeSummary ?? "");
    return {
      icon: null, ref: null, title: label, type: [say("span", "changed.tag"), "\u00a0· ", say("span", "changed.text")],
      typeText: `${t("changed.tag")} · ${t("changed.text")}`, text: [], meta: null, rule: "rule-none",
      actions: undoable ? [btn("action.undo", null, { dataKey: "undo", aria: t("aria.undoReword"), onclick: act.undo })] : [],
      warn: null, note: null,
    };
  }
  const number = flaggedSentences(s).indexOf(issue) + 1;
  const ref = `[${number}]`;
  const edit = (primary) => btn("action.editSentence", null, {
    primary: primary && m.draftStatus(s) !== "ReviewUnavailable", dataKey: `edit-sentence-${issue.paragraphIndex}`, aria: t("aria.editSentence", { number }),
    onclick: () => act.openEditor(issue),
  });
  if (issue.severity === "warning") {
    return {
      // The closed card says what the warning is about and that it does not block (OA9).
      icon: null, ref, title: label,
      type: [say("span", "flag.warning"), "\u00a0· ", h("span", { "data-source": SEED }, firstSentence(pattern.explanation)), "\u00a0· ", say("span", "flag.noBlock")],
      typeText: `${t("flag.warning")} · ${firstSentence(pattern.explanation)} · ${t("flag.noBlock")}`, meta: null,
      text: [say("span", "flag.warning", {}, { class: "label-word" }), "\u00a0· ", h("span", { "data-source": SEED }, pattern.explanation)],
      rule: current ? "rule-warning" : "rule-warning is-earlier", actions: [edit(false)], warn: null, note: null, expId: `exp-${number}`,
    };
  }
  const st = issueState(s, issue);
  const owner = st.owner;
  const blockingWord = [say("span", "flag.blocking", {}, { class: "label-word" }), "\u00a0· "];
  let iconId = "i-octagon";
  let rule = "rule-blocks";
  let text;
  let type = [say("span", "flag.blocking"), "\u00a0· ", say("span", "flag.wording")];
  let typeText = `${t("flag.blocking")} · ${t("flag.wording")}`;
  let actionsRow = [];
  const request = (key, aria) => (current
    ? btn(key, null, { dataKey: `request-${issue.key}`, aria, onclick: (e) => act.openP1(issue.key, e.currentTarget) })
    : null);
  let note = null;
  if (st.kind === "open") {
    text = [...blockingWord, say("span", "flag.wording"), "\u00a0· ", h("span", { "data-source": SEED }, pattern.explanation), " ",
      say("span", "flag.wordingAction", { owner: ownerName(s) })];
    actionsRow = [edit(true), request("action.requestException", t("aria.requestExceptionSentence", { number }))];
    if (!current) note = [requestLater(), checkFromCard(s, act, issue)];
  } else if (st.kind === "pending") {
    iconId = "i-clock";
    rule = "rule-blocks is-waiting"; // (CL1)
    type = [say("span", "row.pending.word"), "\u00a0· ", say("span", "flag.wording")];
    typeText = `${t("row.pending.word")} · ${t("flag.wording")}`;
    text = [say("span", "row.pending.word", {}, { class: "label-word" }), "\u00a0· ", say("span", "row.pending", { owner, time: m.fmt(st.req.requestedAt) })];
  } else if (st.kind === "approved") {
    iconId = "i-check-circle";
    rule = "rule-none";
    // Collapsed, the card still says who approved and for which version (UR5).
    const short = { owner: st.owner, version: m.version(s, st.req.versionId).number };
    type = [say("span", "row.approved.word"), " ", say("span", "row.approvedShort", short)];
    typeText = `${t("row.approved.word")} ${t("row.approvedShort", short)}`;
    text = [say("span", "row.approved.word", {}, { class: "label-word" }), " ",
      say("span", "row.approved", { owner, time: m.fmt(st.dec.decidedAt), version: m.version(s, st.req.versionId).number })];
  } else if (st.kind === "approvalOutdated") {
    iconId = "i-check-struck";
    text = [...blockingWord, say("span", "row.approvalOutdated", { old: m.version(s, st.req.versionId).number, current: m.cur(s).number }, { class: "label-word" })];
    actionsRow = [request("action.requestAgain")];
  } else if (st.kind === "requestOutdated") {
    iconId = "i-clock-struck";
    text = [...blockingWord, say("span", "row.requestOutdated", { owner, version: m.version(s, st.req.versionId).number })];
    actionsRow = [request("action.requestAgain")];
  } else {
    iconId = "i-x-circle";
    type = [say("span", "flag.blocking"), "\u00a0· ", say("span", "row.declined.word")];
    typeText = `${t("flag.blocking")} · ${t("row.declined.word")}`;
    text = [...blockingWord, say("span", "row.declined.word", {}, { class: "label-word" }), " ", say("span", "row.declined", { owner, time: m.fmt(st.dec.decidedAt) }),
      st.dec.note ? h("span", { "data-source": "docs/4-design/copy.md" }, `\u00a0· '${st.dec.note}'`) : null];
    actionsRow = [edit(true)]; // Declined: the sentence must be edited (design.md §5.3)
  }
  return {
    icon: iconId, ref, title: label, type, typeText, meta: null, text, rule: current ? rule : `${rule} is-earlier`, // (GA10)
    actions: actionsRow.filter(Boolean), warn: null, note, expId: `exp-${number}`,
  };
}

// Cards in groups by who must act (UF26), with the counts as headings (TC3).
// On a narrow screen the cards sit under their element in the draft (TC10).
function renderGroups(s, a2, slots, cards) {
  clear(slots.groups);
  const resolved = resolvedItems(s);
  const resolvedBlock = resolved.length
    ? h("section", { class: "resolved", "aria-labelledby": "resolved-title", "data-req": "APP-06" },
      say("h3", "summary.resolved", {}, { class: "group-head", id: "resolved-title" }),
      h("ul", { class: "plain-list" }, resolved.map((r) => h("li", { "data-source": source("resolved.removed") }, r))))
    : null;
  if (!wide()) {
    if (resolvedBlock) slots.groups.append(resolvedBlock);
    return;
  }
  const ld = m.lastDone(s);
  if (!ld) return;
  const issues = orderedIssues(s);
  if (m.checkStatus(s) !== "Current") {
    slots.groups.append(h("section", { class: "group summary", "data-req": "APP-06 APP-24" },
      staleHeading(s), ...issues.map((i) => cards.get(i.key))));
  } else {
    const by = (g) => issues.filter((i) => i.severity === "blocking" && group(s, i) === g);
    const sets = [
      ["summary.blocking", by("blocking")], ["summary.waiting", by("waiting")], ["summary.approved", by("approved")],
      ["summary.warning", issues.filter((i) => i.severity === "warning")],
    ];
    const sections = sets.filter(([, list]) => list.length).map(([key, list]) => h("section", { class: "group" },
      say("h3", key, { count: list.length, plural: plural(list.length) }, { class: "group-head" }),
      ...list.map((i) => cards.get(i.key))));
    slots.groups.append(sections.length
      ? h("div", { class: "summary", "data-req": "APP-06 APP-24" }, sections)
      : say("p", "summary.none", {}, { class: "summary meta" }));
  }
  if (resolvedBlock) slots.groups.append(resolvedBlock);
}

// Before the next check the heading counts only what the current content
// still contains, and names the blocking issues (US15).
function staleHeading(s) {
  const version = lastCheckVersion(s);
  const open = m.issuesOf(s, m.lastDone(s)).filter((i) => stillPresent(s, i));
  const blocking = open.filter((i) => i.severity === "blocking" && group(s, i) === "blocking");
  const waiting = open.filter((i) => i.severity === "blocking" && group(s, i) === "waiting").length;
  const approved = open.filter((i) => i.severity === "blocking" && group(s, i) === "approved").length;
  const warnings = open.filter((i) => i.severity === "warning").length;
  const parts = [];
  if (blocking.length) parts.push(t("summary.blockingNamed", { count: blocking.length, names: blocking.map((i) => m.subjectLabel(s, i.key)).join(", ") }));
  if (waiting) parts.push(t("summary.waiting", { count: waiting }));
  if (approved) parts.push(t("summary.approved", { count: approved }));
  if (warnings) parts.push(t("summary.warning", { count: warnings, plural: plural(warnings) }));
  return parts.length
    ? h("h3", { class: "group-head stale", "data-key": "summary-earlier" }, say("span", "summary.earlier", { version }), " ",
      h("span", { "data-source": source("summary.blockingNamed") }, parts.join("\u00a0· ")))
    : say("h3", "summary.earlierNone", { version }, { class: "group-head stale", "data-key": "summary-earlier" });
}

function resolvedItems(s) {
  return fixedIssues(s).map((f) => (f.kind === "recipient"
    ? t("resolved.removed", { name: f.label, version: f.version })
    : t("resolved.reworded", { label: f.label, version: f.version })));
}

// ---------------------------------------------------------------- the draft as an email

function flaggedSentences(s) {
  const body = m.cur(s).body;
  return m.issuesOf(s, m.lastDone(s))
    .filter((i) => i.kind === "wording" && i.paragraphIndex < body.length && body[i.paragraphIndex].includes(i.matchedText))
    .sort((a, b) => a.paragraphIndex - b.paragraphIndex
      || body[a.paragraphIndex].indexOf(a.matchedText) - body[b.paragraphIndex].indexOf(b.matchedText));
}

const mailHead = (s, extra = null) => h("header", { class: "mail-head", "data-req": "APP-03 APP-14 APP-21" },
  h("a", { class: "only-narrow back", href: "#/drafts", "data-key": "back-to-drafts", "data-source": source("nav.backToDrafts") }, t("nav.backToDrafts")),
  say("h1", "a2.title", {}, { tabindex: "-1", "data-key": "a2-title" }),
  say("span", "a2.version", { version: m.cur(s).number }, { class: "data" }),
  extra);

function draftMail(s, a2, act, cards) {
  const cur = m.cur(s);
  const ld = m.lastDone(s);
  const team = m.team(s);
  const issues = m.issuesOf(s, ld);
  const narrow = !wide();
  const chip = (r) => {
    const key = `recipient:${r.personId}`;
    const issue = issues.find((i) => i.key === key);
    const who = personLine(s, r.personId);
    if (team.has(r.personId) || !issue) {
      const role = team.has(r.personId) ? s.teamMembers.find((x) => x.dealId === m.deal(s).id && x.personId === r.personId).role : null;
      return h("li", { class: "chip", "data-key": `row-${r.personId}` },
        h("span", { "data-source": SEED }, who.name),
        role ? h("span", { class: "visually-hidden", "data-source": source("row.note") }, ` · ${who.email} · ${who.org} · ${role} · On deal team`)
          : h("span", { class: "visually-hidden", "data-source": SEED }, ` · ${who.org}`));
    }
    const st = issueState(s, issue);
    const iconId = { pending: "i-clock", approved: "i-check-circle", approvalOutdated: "i-check-struck", requestOutdated: "i-clock-struck", declined: "i-x-circle" }[st.kind] ?? "i-octagon";
    const label = cards.get(key)?.getAttribute("aria-label") ?? who.name;
    return h("li", { class: "chip-item" }, h("button", {
      type: "button", class: `chip chip-flag${st.kind === "approved" || st.kind === "pending" ? " is-quiet" : ""}${a2.sel === key ? " is-sel" : ""}`,
      "data-issue": key, "data-key": `row-${r.personId}`, "aria-label": label, "aria-controls": `card-${keyId(key)}`,
      onclick: () => act.select(key),
    }, icon(iconId), h("span", { "data-source": SEED }, who.name)));
  };
  // Removed recipients stay visible, struck through, until the next check (state-to-ui §2).
  const removed = { to: [], cc: [] };
  if (ld && m.checkStatus(s) !== "Current") {
    const now = new Set(cur.recipients.map((r) => r.personId));
    for (const r of m.version(s, ld.versionId).recipients) {
      if (now.has(r.personId)) continue;
      const key = `recipient:${r.personId}`;
      const name = m.person(s, r.personId).name;
      // Outside the list of recipients: a screen reader must not count it among them (OA1).
      removed[r.field].push(h("button", {
        type: "button", class: `chip is-removed${a2.sel === key ? " is-sel" : ""}`, "data-issue": key, "data-key": `row-${r.personId}`,
        "aria-label": t("row.removedFrom", { field: fieldWord(r.field), name }), "data-source": source("row.removedFrom"), onclick: () => act.select(key),
      }, h("span", { "data-source": SEED }, name)));
    }
  }
  const field = (f) => {
    const list = cur.recipients.filter((r) => r.field === f).map(chip);
    if (!list.length && !removed[f].length) return null;
    return h("div", { class: "mail-field" }, say("span", f === "to" ? "edit.to" : "edit.cc", {}, { class: "field-label", id: `field-${f}` }),
      h("div", { class: "chips-row" },
        list.length ? h("ul", { class: "chips", "aria-labelledby": `field-${f}` }, list) : null,
        ...removed[f]));
  };
  const recipientCards = narrow
    ? orderedIssues(s).filter((i) => i.kind === "recipient").map((i) => cards.get(i.key))
    : [];

  const flagged = flaggedSentences(s);
  const ldv = ld ? m.version(s, ld.versionId) : null;
  const notCurrent = m.checkStatus(s) !== "Current";
  // Paragraphs added or reworded since the last check, from the difference of
  // DV-7: comparing by position would mark the paragraphs after an added one.
  const changedIdx = new Set();
  if (notCurrent && ldv) {
    for (const [kind, a] of m.diffVersions(s, ldv, cur)[1]) {
      if (kind === "paragraphChanged") changedIdx.add(a - 1);
      if (kind === "paragraphAdded") changedIdx.add(cur.body.findIndex((p) => p.trim() === a));
    }
  }
  const blocks = [];
  cur.body.forEach((para, idx) => {
    const here = flagged.filter((i) => i.paragraphIndex === idx);
    const changed = changedIdx.has(idx);
    const changedIssue = changed ? issues.find((i) => i.kind === "wording" && i.paragraphIndex === idx && !stillPresent(s, i)) : null;
    if (!here.length) {
      blocks.push(h("p", {
        class: `para${changedIssue && a2.sel === changedIssue.key ? " is-sel" : ""}`, tabindex: changed ? "-1" : null,
        "data-key": changed ? "changed-sentence" : null, "data-issue": changedIssue?.key ?? null, "data-source": SEED,
      }, para, changed ? [h("span", { class: "visually-hidden" }, "\u00a0· "), say("span", "changed.tag", {}, { class: "changed-tag" })] : null));
      if (narrow && changedIssue) blocks.push(cards.get(changedIssue.key));
      return;
    }
    const parts = [];
    let rest = para;
    for (const issue of here) {
      const at = rest.indexOf(issue.matchedText);
      const number = flagged.indexOf(issue) + 1;
      const warning = issue.severity === "warning";
      const editing = a2.editor?.issueKey === issue.key;
      const waiting = !warning && issueState(s, issue).kind === "pending"; // nothing to change while Dana decides (CL1)
      parts.push(rest.slice(0, at),
        h("span", {
          class: `${warning ? "flag-warning" : "flag-blocking"}${waiting ? " is-waiting" : ""}${a2.sel === issue.key ? " is-sel" : ""}${editing ? " is-editing" : ""}`,
          "data-issue": issue.key, "data-source": SEED, onclick: () => act.select(issue.key),
        }, issue.matchedText),
        h("button", {
          type: "button", class: "marker", "data-key": `marker-${number}`, "data-issue": issue.key, "data-source": MARKER,
          "aria-label": cards.get(issue.key)?.getAttribute("aria-label") ? `[${number}] ${cards.get(issue.key).getAttribute("aria-label")}` : `[${number}]`,
          "aria-controls": `card-${keyId(issue.key)}`, onclick: () => act.select(issue.key),
        }, `[${number}]`));
      rest = rest.slice(at + issue.matchedText.length);
    }
    parts.push(rest);
    blocks.push(h("p", { class: "para", "data-source": SEED }, parts));
    // The sentence editor opens in the draft, under its sentence (TC6).
    const editorIssue = here.find((i) => a2.editor?.issueKey === i.key);
    if (editorIssue) blocks.push(sentenceEditor(s, a2, act, editorIssue));
    if (narrow) here.forEach((i) => blocks.push(cards.get(i.key)));
  });

  return h("article", { class: "mail", "aria-labelledby": "a2-title-text", "data-req": "APP-03 APP-04 APP-14 APP-15 APP-16 APP-17 APP-22 APP-24 APP-33 APP-36 QLT-07 QLT-12" },
    mailHead(s),
    h("div", { class: "mail-fields", "data-req": "APP-03 APP-16" }, field("to"), field("cc")),
    ...recipientCards,
    h("h2", { class: "mail-subject", id: "a2-title-text", "data-source": SEED }, cur.subject),
    h("div", { class: "mail-body message" }, blocks),
    bar(s, a2, act));
}

// The wording is "unchanged" when, without the spaces at the edges, it is the
// sentence as written: the model would refuse it ("No change made", history-rules).
export const unchangedWording = (text, issue) => text.trim() === issue.matchedText.trim();

function sentenceEditor(s, a2, act, issue) {
  const id = "suggested-wording";
  const errorId = "editor-no-change";
  // A pattern without a suggestion starts from the sentence as written: the
  // field is not called a suggestion (US16).
  const suggested = Boolean(s.wordingPatterns.find((p) => p.id === issue.patternId)?.suggestion);
  const labelKey = suggested ? "editor.suggested" : "editor.wording";
  // Apply wording stays focusable but unavailable until the text differs from
  // the sentence (D5, US16); pressing it then says why.
  const apply = btn("action.applyWording", null, {
    primary: true, dataKey: "apply-wording", onclick: act.applyWording,
    attrs: { "aria-disabled": unchangedWording(a2.editor.text, issue) ? "true" : null },
  });
  return h("div", { class: "editor", "data-key": "editor",
    onkeydown: (e) => { if (e.key === "Escape") { e.stopPropagation(); act.closeEditor(); } } }, // Esc from any control of the editor (US10)
    h("div", { class: "field" }, say("span", "editor.original", {}, { class: "label" }),
      h("p", { class: "readonly", "data-source": SEED }, issue.matchedText)),
    h("div", { class: "field" },
      h("label", { for: id, "data-source": source(labelKey) }, t(labelKey)),
      h("textarea", {
        id, "data-key": "suggested-wording", "aria-describedby": a2.editor.noChange ? errorId : null,
        oninput: (e) => {
          a2.editor.text = e.target.value;
          if (unchangedWording(a2.editor.text, issue)) apply.setAttribute("aria-disabled", "true");
          else apply.removeAttribute("aria-disabled");
        },
      }, a2.editor.text),
      a2.editor.noChange ? say("p", "edit.noChange", {}, { id: errorId, class: "field-error", "data-key": "editor-no-change" }) : null),
    outdatingNotice(s),
    h("div", { class: "actions" },
      apply,
      btn("action.cancel", null, { dataKey: "cancel-editor", onclick: act.closeEditor })));
}

// ---------------------------------------------------------------- the bar (R6, TC12)

function bar(s, a2, act) {
  const editing = isEditing(a2);
  const can = m.canSend(s) && !editing;
  // While sending is blocked the button says what it does, not what it leads to (US12).
  const final = btn(can ? "action.review" : "action.reviewBlocked", null, {
    primary: can, dataKey: "review-before-sending", cls: "on-dark", onclick: editing ? act.focusModeBar : act.review,
    attrs: { "aria-describedby": can ? null : "r6-reason", "aria-disabled": editing ? "true" : null },
  });
  if (a2.edit && !a2.edit.confirmed) {
    const pending = !hasValidApproval(s) && hasPendingRequest(s);
    return h("div", { class: "mail-bar", tabindex: "-1", "data-key": "edit-warning", "data-req": "APP-26" },
      btn("action.cancel", null, { dataKey: "cancel-edit", cls: "on-dark", onclick: act.cancelEdit }),
      say("p", pending ? "edit.warningRequest" : "edit.warning", { owner: ownerName(s) }, { class: "reason" }),
      btn("action.continueEditing", null, { primary: true, cls: "on-dark", dataKey: "continue-editing", onclick: act.confirmEdit }));
  }
  if (editing) {
    return h("div", { class: "mail-bar mode-bar", tabindex: "-1", "data-key": "mode-bar", "data-req": "APP-07 APP-08 APP-11 APP-20 APP-26" },
      icon("i-pen"),
      h("div", { class: "reason" }, say("p", "edit.bar", {}, { class: "mode" }), say("p", "edit.reason", {}, { id: "r6-reason" })),
      btn("action.cancel", null, { dataKey: "cancel-mode", cls: "on-dark", onclick: act.cancelEdit }),
      btn("action.save", null, { primary: true, cls: "on-dark", dataKey: "save-changes", onclick: act.saveEdit }),
      final);
  }
  return h("div", { class: "mail-bar send-area", "data-req": "APP-07 APP-08 APP-11 APP-20" },
    btn("action.editMessage", null, { dataKey: "edit-message", cls: "on-dark", onclick: act.editMessage }),
    can ? say("p", "a3.canSendDetail", { version: m.cur(s).number }, { class: "reason", id: "r6-reason" }) : reasonParagraph(s, "r6-reason"),
    final);
}

// ---------------------------------------------------------------- edit mode (UF22)

function editMail(s, a2, act) {
  const e = a2.edit;
  const chips = (f) => e.recipients.filter((r) => r.field === f).map((r) => {
    const who = personLine(s, r.personId);
    return h("li", { class: "chip" }, h("span", { "data-source": SEED }, who.name),
      btn("action.remove", "×", { cls: "chip-remove", dataKey: `edit-remove-${r.personId}`, aria: t("action.remove", { name: who.name }), onclick: () => act.editRemove(r.personId) }));
  });
  const present = new Set(e.recipients.map((r) => r.personId));
  const available = s.people.filter((p) => !present.has(p.id));
  let adder = null;
  if (e.adding && available.length) {
    adder = h("div", { class: "editor adder", "data-key": "adder" },
      h("div", { class: "field" },
        h("label", { for: "add-person", "data-source": source("edit.person") }, t("edit.person")),
        h("select", { id: "add-person", "data-key": "add-person" }, available.map((p) => h("option", { value: p.id }, p.name)))),
      h("div", { class: "field choice", role: "group" },
        h("label", {}, h("input", { type: "radio", name: "add-field", value: "to", "data-key": "add-to" }), say("span", "edit.to")),
        h("label", {}, h("input", { type: "radio", name: "add-field", value: "cc", checked: true, "data-key": "add-cc" }), say("span", "edit.cc"))),
      h("div", { class: "actions" }, btn("action.add", null, { primary: true, dataKey: "add-confirm", onclick: act.editAdd })));
  }
  const field = (f) => h("div", { class: "mail-field" }, say("span", f === "to" ? "edit.to" : "edit.cc", {}, { class: "field-label" }),
    h("ul", { class: "chips" }, chips(f)));
  return h("article", { class: "mail is-editing", "aria-labelledby": "a2-title-text" },
    mailHead(s),
    h("div", { class: "mail-fields" }, field("to"), field("cc"),
      available.length && !e.adding ? h("div", { class: "actions" }, btn("action.addRecipient", null, { dataKey: "add-recipient", onclick: act.editAdding })) : null,
      adder),
    h("div", { class: "mail-edit" },
      h("div", { class: "field" },
        h("label", { for: "edit-subject", id: "a2-title-text", "data-source": source("edit.subject") }, t("edit.subject")),
        h("input", { id: "edit-subject", type: "text", class: "text-input", "data-key": "edit-subject", value: e.subject,
          oninput: (ev) => { e.subject = ev.target.value; } })),
      h("div", { class: "field" },
        h("label", { for: "edit-body", "data-source": source("edit.message") }, t("edit.message")),
        h("textarea", { id: "edit-body", class: "body-input", "data-key": "edit-body", rows: "12",
          oninput: (ev) => { e.body = ev.target.value; } }, e.body))),
    bar(s, a2, act));
}

// ---------------------------------------------------------------- actions

function actions(ctx, out) {
  const { store, ui } = ctx;
  const a2 = ui.a2;
  const q = (sel) => document.querySelector(sel);
  const refresh = (focusSelector) => {
    fill(ctx, out);
    // A bar is always in view (sticky): focusing it must not scroll the sheet (GA6).
    const target = focusSelector ? q(focusSelector) : null;
    target?.focus(target.matches(".mail-bar") ? { preventScroll: true } : undefined);
  };
  const clearTransient = () => {
    if (a2.checkTimer) clearTimeout(a2.checkTimer);
    a2.checkTimer = null;
    a2.checking = false;
    a2.alert = null;
    a2.noChange = false;
    a2.resume = null;
    a2.next = null;
    ui.lastDecision = null;
  };
  // Every command goes through the store; the store re-renders the view. A
  // successful command opens the next card or marks the next action (TC4).
  const run = async (cmd, params, focusSelector) => {
    clearTransient();
    const before = a2.expanded;
    advance(a2);
    const r = await store.dispatch(cmd, COORD, params);
    if (!r.ok) {
      a2.expanded = before;
      a2.advance = false;
    }
    focusAfter(focusSelector);
    return r;
  };
  const focusAfter = (fallback) => {
    const next = a2.focusNext;
    a2.focusNext = null;
    const el = (next && q(next)) || (fallback && q(fallback));
    if (el) {
      el.focus();
      el.scrollIntoView({ block: "nearest" });
    }
  };
  return {
    review: () => { clearTransient(); location.hash = "#/drafts/harbor/review"; },
    remove: (pid) => run("RemoveRecipient", { personId: pid }, '[data-key="undo"]'),
    undo: () => run("Undo", {}, '[data-key="phrase"]'),
    async runCheck() {
      if (a2.checking) return;
      clearTransient();
      a2.checking = true;
      await store.dispatch("RunCheck", COORD, {});
      q('[data-key="run-check"]')?.focus();
      a2.checkTimer = setTimeout(() => {
        a2.checking = false;
        a2.checkTimer = null;
        if (m.checkStatus(store.state) === "Unavailable") {
          a2.alert = t("r2.unavailable");
          a2.suppressStatus = true;
        }
        advance(a2);
        fill(ctx, out);
        focusAfter('[data-key="run-check"], [data-key="phrase"]');
      }, CHECKING_MS);
    },
    keepEditing: () => q('[data-key="edit-message"]')?.focus(),
    // A click on an element of the draft opens its card (TC5).
    select(key) {
      if (isEditing(a2)) return;
      a2.sel = key;
      a2.expanded = key;
      a2.next = null;
      fill(ctx, out);
      const head = q(`[data-key="card-head-${keyId(key)}"]`);
      head?.focus({ preventScroll: true });
      head?.scrollIntoView({ block: "nearest" });
    },
    toggleCard(key) {
      a2.next = null;
      a2.sel = key;
      a2.expanded = a2.expanded === key ? null : key;
      if (a2.editor && a2.editor.issueKey !== key) a2.editor = null;
      refresh(`[data-key="card-head-${keyId(key)}"]`);
      q(`.mail [data-issue="${CSS.escape(key)}"]`)?.scrollIntoView({ block: "nearest" });
    },
    openEditor(issue) {
      clearTransient();
      const pattern = store.state.wordingPatterns.find((p) => p.id === issue.patternId);
      a2.editor = { issueKey: issue.key, text: pattern.suggestion ?? issue.matchedText, paragraph: issue.paragraphIndex };
      a2.sel = issue.key;
      a2.expanded = issue.key;
      refresh('[data-key="suggested-wording"]');
      q('[data-key="suggested-wording"]')?.scrollIntoView({ block: "nearest" });
    },
    closeEditor() {
      const p = a2.editor?.paragraph;
      a2.editor = null;
      refresh(`[data-key="edit-sentence-${p}"]`);
    },
    async applyWording() {
      const { issueKey, text, paragraph } = a2.editor;
      const issue = m.issuesOf(store.state, m.lastDone(store.state)).find((i) => i.key === issueKey);
      // An unchanged wording is not applied: say so next to the field (US16).
      if (issue && unchangedWording(text, issue)) {
        a2.editor.noChange = true;
        refresh('[data-key="suggested-wording"]');
        return;
      }
      a2.editor = null;
      const r = await run("ApplyWording", { issueKey, text }, '[data-key="changed-sentence"]');
      if (!r.ok) {
        a2.editor = { issueKey, text, paragraph, noChange: true };
        refresh('[data-key="suggested-wording"]');
      }
    },
    editMessage() {
      clearTransient();
      const s = store.state;
      a2.editor = null;
      a2.edit = {
        confirmed: !hasValidApproval(s) && !hasPendingRequest(s),
        subject: m.cur(s).subject,
        body: m.cur(s).body.join("\n\n"),
        recipients: m.cur(s).recipients.map((r) => ({ ...r })),
        adding: false,
      };
      refresh(a2.edit.confirmed ? '[data-key="mode-bar"]' : '[data-key="edit-warning"]');
    },
    focusModeBar() {
      q('[data-key="mode-bar"]')?.focus({ preventScroll: true }); // (GA6)
    },
    confirmEdit() {
      a2.edit.confirmed = true;
      refresh('[data-key="mode-bar"]');
    },
    cancelEdit() {
      a2.edit = null;
      refresh('[data-key="edit-message"]');
    },
    editRemove(pid) {
      a2.edit.recipients = a2.edit.recipients.filter((r) => r.personId !== pid);
      refresh('[data-key="add-recipient"], [data-key="edit-subject"]');
    },
    editAdding() {
      a2.edit.adding = true;
      refresh('[data-key="add-person"]');
    },
    editAdd() {
      const pid = q('[data-key="add-person"]').value;
      const field = q('input[name="add-field"]:checked').value;
      a2.edit.recipients.push({ personId: pid, field });
      a2.edit.adding = false;
      refresh('[data-key="add-recipient"], [data-key="edit-subject"]');
    },
    async saveEdit() {
      const e = a2.edit;
      const body = e.body.split(/\n\s*\n/).filter((p) => p.trim());
      a2.edit = null;
      const r = await run("SaveEdit", { body, subject: e.subject, recipients: e.recipients }, '[data-key="what-changed"]');
      if (!r.ok) {
        a2.noChange = true;
        refresh('[data-key="no-change"]');
      }
    },
    openP1(issueKey, opener) {
      clearTransient();
      const s = store.state;
      const prev = m.latestRequest(s, issueKey);
      a2.p1 = { issueKey, reason: prev?.reason ?? "", error: false, opener: opener?.dataset.key ?? null };
      ctx.renderChrome?.();
      refresh('[data-key="p1-title"]');
      ctx.syncInert?.();
      q('[data-key="p1-title"]')?.focus();
    },
    closeP1() {
      const opener = a2.p1?.opener;
      a2.p1 = null;
      refresh(null);
      ctx.syncInert?.();
      if (opener) q(`[data-key="${opener}"]`)?.focus();
    },
    async sendRequest() {
      const { issueKey, reason } = a2.p1;
      if (!reason.trim()) {
        a2.p1.error = true;
        refresh('[data-key="p1-reason"]');
        return;
      }
      a2.p1 = null;
      ctx.syncInert?.();
      await run("RequestException", { issueKey, reason }, '[data-key="phrase"]');
      ctx.syncInert?.();
    },
  };
}
