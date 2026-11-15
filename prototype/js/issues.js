// Issue states and counts shared by the drafts list, the draft review and the
// final review, so the three views never disagree (decision UF26).
// Reads the model only; it adds no rule of its own.

import * as m from "./model.js";

// The state of a blocking issue as rows and sentences show it (state-to-ui §2, §3):
// open, pending, approved, declined, approvalOutdated or requestOutdated.
export function issueState(s, issue) {
  const req = m.latestRequest(s, issue.key);
  if (!req) return { kind: "open" };
  const st = m.requestStatus(s, req);
  const decs = m.decisionsOf(s, req);
  const dec = decs.at(-1);
  const base = { req, dec, owner: m.person(s, req.requestedTo).name };
  if (st === "pending") return { kind: "pending", ...base };
  if (st === "approved") return { kind: "approved", ...base };
  if (st === "declined") return { kind: "declined", ...base };
  return { kind: decs.length ? "approvalOutdated" : "requestOutdated", ...base };
}

// Who must act on a blocking issue (state-to-ui §1 "Conteggi"): the coordinator
// ("blocking"), the owner ("waiting") or nobody ("approved").
export function group(s, issue) {
  const kind = issueState(s, issue).kind;
  if (kind === "pending") return "waiting";
  if (kind === "approved") return "approved";
  return "blocking";
}

// Counts over the last completed check, one group per blocking issue. While
// the reason is DV-6 row 8, "blocking" equals the count in that reason.
export function counts(s) {
  const issues = m.issuesOf(s, m.lastDone(s));
  const out = { blocking: 0, waiting: 0, approved: 0, warnings: 0 };
  for (const i of issues) {
    if (i.severity === "warning") out.warnings += 1;
    else if (i.severity === "blocking") out[group(s, i)] += 1;
  }
  return out;
}

// Latest requests on blocking issues of the last completed check; requests on
// issues no longer present are left out (state-to-ui §6).
export function currentRequests(s) {
  return m.issuesOf(s, m.lastDone(s))
    .filter((i) => i.severity === "blocking")
    .map((i) => ({ issue: i, state: issueState(s, i) }))
    .filter((x) => x.state.kind !== "open");
}

// Requests that the latest version made outdated, before the next check
// (decision UF27). Declined requests stay declined (D1b), so they are not here.
export function outdatedByEdit(s) {
  return currentRequests(s).filter((x) => x.state.kind === "approvalOutdated" || x.state.kind === "requestOutdated");
}

// An issue of the last check that the current content still contains: the
// recipient is still there, the sentence is still in its paragraph (US15).
export function stillPresent(s, issue) {
  const cur = m.cur(s);
  if (issue.kind === "wording") {
    return issue.paragraphIndex < cur.body.length && cur.body[issue.paragraphIndex].includes(issue.matchedText);
  }
  return cur.recipients.some((r) => `recipient:${r.personId}` === issue.key);
}

// Subjects of the requests still waiting, for the reason that names only the
// coordinator's part (DV-6 "blocking-open"; US14).
export function waitingSubjects(s) {
  return m.issuesOf(s, m.lastDone(s))
    .filter((i) => i.severity === "blocking" && group(s, i) === "waiting")
    .map((i) => m.subjectLabel(s, i.key));
}

// The version number of the last completed check, or null.
export function lastCheckVersion(s) {
  const ld = m.lastDone(s);
  return ld ? m.version(s, ld.versionId).number : null;
}
