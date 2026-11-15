// Turns model values into approved copy: change items (DV-7), times, Harbor's
// status in the drafts list, last activity.

import * as m from "./model.js";
import { t, source } from "./copy.js";
import { h } from "./dom.js";
import { counts } from "./issues.js";

// An element whose text is a copy entry; data-source records where it comes from.
export function say(tag, key, vars = {}, attrs = {}) {
  return h(tag, { ...attrs, "data-source": source(key) }, t(key, vars));
}

export function changeText(item) {
  const [kind, a, b] = item;
  if (kind === "removed") return t("change.removed", { name: a });
  if (kind === "added") return t("change.added", { name: a });
  if (kind === "moved") return t(b === "to" ? "change.moved.to" : "change.moved.cc", { name: a });
  if (kind === "subject") return t("change.subject");
  if (kind === "paragraphAdded") return t("change.paragraphAdded", { text: a });
  if (kind === "paragraphRemoved") return t("change.paragraphRemoved", { text: a });
  return t("change.paragraphChanged", { number: a });
}

const minutes = (v) => (typeof v === "string" ? m.toMinutes(v) : v);

// Last activity (decision UF18): the latest event of the interactive draft;
// for the static drafts, their version's createdAt.
export function lastActivity(s, draftRecord) {
  if (!draftRecord.interactive) {
    return s.versions.find((v) => v.id === draftRecord.currentVersionId).createdAt;
  }
  const times = [];
  for (const v of s.versions.filter((x) => x.draftId === draftRecord.id)) {
    times.push(minutes(v.createdAt));
    if (v.discardedAt !== null) times.push(minutes(v.discardedAt));
  }
  for (const c of s.checks.filter((x) => x.draftId === draftRecord.id)) times.push(minutes(c.finishedAt ?? c.startedAt));
  for (const r of s.requests.filter((x) => x.draftId === draftRecord.id)) {
    times.push(r.requestedAt);
    for (const d of s.decisions.filter((x) => x.requestId === r.id)) times.push(d.decidedAt);
  }
  for (const r of s.sendRecords.filter((x) => x.draftId === draftRecord.id)) times.push(r.sentAt);
  return m.fmt(Math.max(...times.filter((x) => typeof x === "number")));
}

// Harbor's status cell in the drafts list (copy inventory, A1).
// Blocked uses the groups of UF26: the waiting part names who must answer.
export function harborStatus(s) {
  const status = m.draftStatus(s);
  if (status === "Blocked") {
    const c = counts(s);
    let text = t("drafts.blocked", { count: c.blocking, plural: c.blocking === 1 ? "" : "s" });
    if (c.waiting) text += `\u00a0· ${t("drafts.waitingPart", { count: c.waiting, owner: m.person(s, m.deal(s).ownerId).name })}`;
    return { key: "drafts.blocked", vars: {}, text };
  }
  if (status === "WaitingForDecision") {
    const req = m.requests(s).find((r) => m.requestStatus(s, r) === "pending");
    return { key: "drafts.waiting", vars: { owner: m.person(s, req.requestedTo).name, time: m.fmt(req.requestedAt) } };
  }
  return { key: `status.${status}`, vars: {} };
}

export function pendingRequest(s) {
  return m.requests(s).find((r) => m.requestStatus(s, r) === "pending") ?? null;
}

// Issues fixed by the coordinator, with the version that fixed them: a removed
// recipient in the version that removed them, a reworded sentence in the version
// of the first completed check that no longer found it (state-to-ui §4, UC-11).
export function fixedIssues(s) {
  const removed = new Map(m.finalChanges(s).removed);
  const done = m.checks(s).filter((c) => c.outcome === "completed");
  return m.fixedKeys(s).map((key) => {
    const label = m.subjectLabel(s, key);
    if (key.startsWith("recipient:")) {
      return { key, kind: "recipient", label, version: removed.get(label) ?? m.version(s, m.lastDone(s).versionId).number };
    }
    let last = -1;
    done.forEach((c, i) => { if (m.issuesOf(s, c).some((x) => x.key === key)) last = i; });
    const check = done[last + 1] ?? m.lastDone(s);
    return { key, kind: "wording", label, version: m.version(s, check.versionId).number };
  });
}
