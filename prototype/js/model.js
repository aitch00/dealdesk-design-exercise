// DealDesk sample-review model: a function-by-function port of
// scripts/dealdesk_model.py, the executable specification (decision S1).
//
// Pure: no DOM, no storage. Only events are stored (versions, checks, issues,
// requests, decisions, send records); every status is computed from them (M1).
// Commands never mutate their input: they resolve to a new state or reject
// with Rejected. Commands that create a version are asynchronous because the
// content hash uses Web Crypto; projections are synchronous.
//
// Parity with Python is checked by prototype/tests.html on model/scenarios.json
// and model/traces.json. Where JavaScript and Python differ (whitespace, word
// boundaries, string ordering, String.replace), this file reproduces Python.

export const CLOCK_STEP = { version: 1, undo: 1, check: 1, request: 2, decision: 9, send: 2 };

export class Rejected extends Error {
  constructor(message) {
    super(message);
    this.name = "Rejected";
  }
}

// ---------------------------------------------------------------- Python compatibility

// Characters Python's str.isspace() accepts, which str.strip() and the re
// module's \s use. JavaScript's trim() and \s differ (﻿, \x1C-\x1F, \x85).
const PY_WS = "\\t\\n\\v\\f\\r\\x1c-\\x1f \\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";
const STRIP = new RegExp(`^[${PY_WS}]+|[${PY_WS}]+$`, "gu");
const SENTENCE_SPLIT = new RegExp(`(?<=[.!?])[${PY_WS}]+`, "u");

export function pyStrip(text) {
  return text.replace(STRIP, "");
}

// Python compares strings by code point; JavaScript's < compares UTF-16 units.
export function cmpCodePoint(a, b) {
  const x = Array.from(a);
  const y = Array.from(b);
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    const d = x[i].codePointAt(0) - y[i].codePointAt(0);
    if (d) return d < 0 ? -1 : 1;
  }
  return x.length - y.length < 0 ? -1 : x.length === y.length ? 0 : 1;
}

function cmpTuple(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const d = typeof a[i] === "string" ? cmpCodePoint(a[i], b[i]) : a[i] - b[i];
    if (d) return d;
  }
  return a.length - b.length;
}

// Python's \b is Unicode-aware (\w = letters, digits, underscore);
// JavaScript's is ASCII-only, so it is rewritten with lookarounds.
function pyRegex(pattern) {
  const W = "[\\p{L}\\p{N}_]";
  const source = pattern
    .replaceAll("\\b", `(?:(?<=${W})(?!${W})|(?<!${W})(?=${W}))`)
    .replaceAll("\\s", `[${PY_WS}]`);
  return new RegExp(source, "iu");
}

function clone(value) {
  return structuredClone(value);
}

// ---------------------------------------------------------------- loading

export async function contentHash(version) {
  const order = { to: 0, cc: 1 };
  const recipients = version.recipients
    .map((r) => [r.field, r.personId])
    .sort((a, b) => order[a[0]] - order[b[0]] || cmpCodePoint(a[1], b[1]));
  const canonical = JSON.stringify({
    recipients,
    subject: pyStrip(version.subject),
    body: version.body.map(pyStrip),
  });
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

export function fmt(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export async function loadSeed(raw) {
  const seed = clone(raw);
  for (const v of seed.versions) v.contentHash = await contentHash(v);
  const byId = Object.fromEntries(seed.versions.map((v) => [v.id, v]));
  for (const c of seed.checks) c.contentHash = byId[c.versionId].contentHash;
  return seed;
}

const SEEDS = {};

export function initialState(seed) {
  const s = clone(seed);
  s.clock = toMinutes(seed.clockStart);
  s.undoable = null;
  s.counter = 0;
  s.draftId = seed.drafts.find((d) => d.interactive).id;
  SEEDS[seed.seedVersion] = seed;
  return s;
}

// ---------------------------------------------------------------- lookups

export const draft = (s) => s.drafts.find((d) => d.id === s.draftId);
export const deal = (s) => s.deals.find((d) => d.id === draft(s).dealId);
export const version = (s, vid) => s.versions.find((v) => v.id === vid);
export const cur = (s) => version(s, draft(s).currentVersionId);
export const person = (s, pid) => s.people.find((p) => p.id === pid);
export const team = (s) =>
  new Set(s.teamMembers.filter((t) => t.dealId === deal(s).id).map((t) => t.personId));
export const checks = (s) => s.checks.filter((c) => c.draftId === s.draftId);
export const requests = (s) => s.requests.filter((r) => r.draftId === s.draftId);
export const decisionsOf = (s, req) => s.decisions.filter((d) => d.requestId === req.id);
export const sentRecord = (s) => s.sendRecords.find((r) => r.draftId === s.draftId) ?? null;

// ---------------------------------------------------------------- rules (D7, M2, M6)

export function sentences(paragraph) {
  return pyStrip(paragraph).split(SENTENCE_SPLIT).filter((x) => x);
}

export function runRules(s, v) {
  const found = [];
  const members = team(s);
  for (const r of v.recipients) {
    if (!members.has(r.personId)) {
      found.push({ key: `recipient:${r.personId}`, kind: "recipient", severity: "blocking", personId: r.personId });
    }
  }
  for (const pat of s.wordingPatterns) {
    const rx = pyRegex(pat.match);
    for (let idx = 0; idx < v.body.length; idx++) {
      const hit = sentences(v.body[idx]).find((x) => rx.test(x));
      if (hit) {
        found.push({
          key: `wording:${pat.id}`, kind: "wording", severity: pat.severity,
          patternId: pat.id, matchedText: hit, paragraphIndex: idx,
        });
        break;
      }
    }
  }
  return found;
}

// ---------------------------------------------------------------- projections

export function lastDone(s) {
  const done = checks(s).filter((c) => c.outcome === "completed");
  return done.length ? done[done.length - 1] : null;
}

export function checkStatus(s) {
  const cs = checks(s);
  if (!cs.length) return "NotRun";
  if (cs[cs.length - 1].outcome === "failed") return "Unavailable";
  return lastDone(s).contentHash === cur(s).contentHash ? "Current" : "Outdated";
}

export const issuesOf = (s, chk) => s.issues.filter((i) => chk && i.checkId === chk.id);

export function latestRequest(s, key) {
  const rs = requests(s).filter((r) => r.issueKey === key);
  return rs.length ? rs[rs.length - 1] : null;
}

export function requestStatus(s, req) {
  const ds = decisionsOf(s, req);
  const dec = ds.length ? ds[ds.length - 1] : null;
  if (dec && dec.outcome === "declined") return "declined";
  if (req.contentHash !== cur(s).contentHash) return "outdated";
  if (dec && dec.outcome === "approved") return "approved";
  return "pending";
}

export function resolution(s, issue) {
  const req = latestRequest(s, issue.key);
  if (!req) return "open";
  const st = requestStatus(s, req);
  return st === "declined" || st === "approved" ? st : "open";
}

export function fixedKeys(s) {
  const ld = lastDone(s);
  const now = new Set(issuesOf(s, ld).map((i) => i.key));
  const seen = new Set();
  for (const c of checks(s)) {
    if (c.outcome !== "completed" || c === ld) continue;
    for (const i of issuesOf(s, c)) seen.add(i.key);
  }
  return [...seen].filter((k) => !now.has(k));
}

export const blocking = (s) => issuesOf(s, lastDone(s)).filter((i) => i.severity === "blocking");

export function draftStatus(s) {
  if (sentRecord(s)) return "Sent";
  const st = checkStatus(s);
  if (st === "NotRun") return "NeedsCheck";
  if (st === "Unavailable") return "ReviewUnavailable";
  if (st === "Outdated") return "NeedsNewCheck";
  const pending = new Set(requests(s).filter((r) => requestStatus(s, r) === "pending").map((r) => r.issueKey));
  for (const i of blocking(s)) {
    if (resolution(s, i) !== "approved" && !pending.has(i.key)) return "Blocked";
  }
  if (blocking(s).some((i) => pending.has(i.key))) return "WaitingForDecision";
  return "ReadyToSend";
}

export function canSend(s) {
  return (
    sentRecord(s) === null &&
    checkStatus(s) === "Current" &&
    blocking(s).every((i) => resolution(s, i) === "approved") &&
    !requests(s).some((r) => requestStatus(s, r) === "pending")
  );
}

export function subjectLabel(s, key) {
  const at = key.indexOf(":");
  const kind = key.slice(0, at);
  const ref = key.slice(at + 1);
  if (kind === "recipient") return person(s, ref).name;
  return s.wordingPatterns.find((p) => p.id === ref).label;
}

export function blockReason(s) {
  const owner = person(s, deal(s).ownerId).name;
  const rec = sentRecord(s);
  if (rec) return ["sent", `Already sent (simulated) at ${fmt(rec.sentAt)}.`];
  const st = checkStatus(s);
  if (st === "NotRun") return ["not-run", "Can't send yet: run the check."];
  if (st === "Unavailable") return ["unavailable", "Can't send yet: review is unavailable. Your draft is saved."];
  if (st === "Outdated") return ["outdated", "Can't send yet: the message changed. Run the check again."];
  const bl = blocking(s);
  for (const i of bl) {
    if (resolution(s, i) === "declined") {
      const fix = i.kind === "recipient" ? `Remove ${subjectLabel(s, i.key)} to continue.` : "Edit the sentence to continue.";
      return ["declined", `Can't send yet: ${owner} declined the exception for ${subjectLabel(s, i.key)}. ${fix}`];
    }
  }
  for (const i of bl) {
    const req = latestRequest(s, i.key);
    if (resolution(s, i) === "open" && req && requestStatus(s, req) === "outdated") {
      const n = version(s, req.versionId).number;
      if (decisionsOf(s, req).length) {
        return ["approval-outdated", `Can't send yet: ${owner}'s approval covers version ${n} only. Request again.`];
      }
      return ["request-outdated", `Can't send yet: your request to ${owner} was for version ${n}. Request again.`];
    }
  }
  const openUnrequested = bl.filter((i) => {
    if (resolution(s, i) !== "open") return false;
    const req = latestRequest(s, i.key);
    return !(req && requestStatus(s, req) === "pending");
  });
  if (openUnrequested.length) {
    const n = openUnrequested.length;
    return ["blocking-open", `Can't send yet: ${n} blocking issue${n > 1 ? "s" : ""} need${n > 1 ? "" : "s"} action.`];
  }
  for (const r of requests(s)) {
    if (requestStatus(s, r) === "pending") {
      return ["pending", `Can't send yet: waiting for ${owner}'s decision on ${subjectLabel(s, r.issueKey)}.`];
    }
  }
  return null;
}

// ---------------------------------------------------------------- differences (DV-7, DV-10)

function normalised(v) {
  const fields = new Map(v.recipients.map((r) => [r.personId, r.field]));
  return [fields, v.recipients.map((r) => r.personId), pyStrip(v.subject), v.body.map(pyStrip)];
}

// Pairs of equal paragraphs by longest common subsequence; ties prefer skipping
// a paragraph of `a` first, exactly as the Python reference.
function align(a, b) {
  const n = a.length;
  const k = b.length;
  const lcs = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = k - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const pairs = [];
  let i = 0;
  let j = 0;
  while (i < n && j < k) {
    if (a[i] === b[j]) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

function paragraphChanges(a, b) {
  const added = [];
  const removed = [];
  const changed = [];
  const anchors = [...align(a, b), [a.length, b.length]];
  let pi = 0;
  let pj = 0;
  for (const [ai, bj] of anchors) {
    const ga = [];
    const gb = [];
    for (let x = pi; x < ai; x++) ga.push(x);
    for (let x = pj; x < bj; x++) gb.push(x);
    const common = Math.min(ga.length, gb.length);
    changed.push(...gb.slice(0, common));
    removed.push(...ga.slice(common));
    added.push(...gb.slice(common));
    pi = ai + 1;
    pj = bj + 1;
  }
  return [added, removed, changed];
}

export function diffVersions(s, va, vb) {
  const [fa, oa, sa, ba] = normalised(va);
  const [fb, ob, sb, bb] = normalised(vb);
  const items = [];
  for (const pid of oa) if (!fb.has(pid)) items.push(["removed", person(s, pid).name]);
  for (const pid of ob) if (!fa.has(pid)) items.push(["added", person(s, pid).name]);
  for (const pid of ob) {
    if (fa.has(pid) && fa.get(pid) !== fb.get(pid)) items.push(["moved", person(s, pid).name, fb.get(pid)]);
  }
  if (sa !== sb) items.push(["subject"]);
  const [added, removed, changed] = paragraphChanges(ba, bb);
  for (const j of added) items.push(["paragraphAdded", bb[j]]);
  for (const i of removed) items.push(["paragraphRemoved", ba[i]]);
  for (const j of changed) items.push(["paragraphChanged", j + 1]);
  const parts = [];
  if (items.some((x) => ["removed", "added", "moved"].includes(x[0]))) parts.push("recipients");
  if (sa !== sb) parts.push("subject");
  if (added.length || removed.length || changed.length) parts.push("wording");
  return [parts, items];
}

export function whatChanged(s) {
  const ld = lastDone(s);
  if (!ld || ld.contentHash === cur(s).contentHash) return null;
  const since = version(s, ld.versionId);
  const [parts, items] = diffVersions(s, since, cur(s));
  return { sinceVersion: since.number, parts, items };
}

export function lineage(s) {
  const chain = [];
  let v = cur(s);
  while (v) {
    chain.push(v);
    v = v.previousVersionId ? version(s, v.previousVersionId) : null;
  }
  return chain.reverse();
}

export function finalChanges(s) {
  const chain = lineage(s);
  const first = chain[0];
  const now = chain[chain.length - 1];
  const nowIds = new Set(now.recipients.map((r) => r.personId));
  const removed = [];
  for (const r of first.recipients) {
    if (nowIds.has(r.personId)) continue;
    const at = chain.find((v) => v.recipients.every((x) => x.personId !== r.personId));
    removed.push([person(s, r.personId).name, at.number]);
  }
  const [added, , changed] = paragraphChanges(normalised(first)[3], normalised(now)[3]);
  return { removed, changedParagraphs: [...added, ...changed].sort((a, b) => a - b) };
}

export function resume(s) {
  const opened = draft(s).lastOpenedAt;
  if (opened === null || opened === undefined) return { sinceYouLeft: [], whereYouLeft: null };
  const since = [];
  for (const r of requests(s)) {
    for (const d of decisionsOf(s, r)) {
      if (d.decidedAt > opened) {
        since.push([subjectLabel(s, r.issueKey), d.outcome, person(s, d.decidedBy).name, d.decidedAt]);
      }
    }
  }
  const reason = blockReason(s);
  return { sinceYouLeft: since, whereYouLeft: [draftStatus(s), reason ? reason[0] : null] };
}

export function projection(s) {
  const ld = lastDone(s);
  const reason = blockReason(s);
  return {
    draftStatus: draftStatus(s),
    checkStatus: checkStatus(s),
    canSend: canSend(s),
    reason: reason ? reason[0] : null,
    version: cur(s).number,
    recipients: cur(s).recipients.map((r) => r.personId).sort(cmpCodePoint),
    issues: issuesOf(s, ld).map((i) => [i.key, i.severity, resolution(s, i)]).sort(cmpTuple),
    fixed: fixedKeys(s).sort(cmpCodePoint),
    requests: requests(s).map((r) => [r.issueKey, requestStatus(s, r)]),
    whatChanged: whatChanged(s),
    finalChanges: finalChanges(s),
    resume: resume(s),
  };
}

// ---------------------------------------------------------------- commands

function newId(s, prefix) {
  s.counter += 1;
  return `${prefix}-${s.counter}`;
}

function tick(s, kind) {
  s.clock += CLOCK_STEP[kind];
  return s.clock;
}

function require(cond, reason) {
  if (!cond) throw new Rejected(reason);
}

function role(s, actor) {
  if (actor === deal(s).ownerId) return "owner";
  if (actor === s.actorId) return "coordinator";
  if (actor === "evaluator") return "evaluator";
  return "other";
}

function tried(s, item) {
  if (!s.triedItems.includes(item)) s.triedItems.push(item);
}

async function newVersion(s, recipients, subject, body, summary, undoable) {
  const old = cur(s);
  const v = {
    id: newId(s, "v"),
    draftId: s.draftId,
    number: Math.max(...s.versions.filter((x) => x.draftId === s.draftId).map((x) => x.number)) + 1,
    previousVersionId: old.id,
    recipients,
    subject,
    body,
    createdAt: null,
    createdBy: s.actorId,
    changeSummary: summary,
    discardedAt: null,
  };
  v.contentHash = await contentHash(v);
  require(v.contentHash !== old.contentHash, "No change made.");
  v.createdAt = tick(s, "version");
  if (checkStatus(s) === "Current") tried(s, "edited-after-review");
  s.versions.push(v);
  draft(s).currentVersionId = v.id;
  s.undoable = undoable ? v.id : null;
  return s;
}

function editable(s, actor) {
  require(role(s, actor) === "coordinator", "Only the coordinator edits the draft.");
  require(sentRecord(s) === null, "The draft has been sent.");
}

export async function openDraft(state, actor) {
  const s = clone(state);
  require(role(s, actor) === "coordinator", "Only the coordinator opens drafts.");
  draft(s).lastOpenedAt = s.clock;
  return s;
}

export async function removeRecipient(state, actor, { personId }) {
  let s = clone(state);
  editable(s, actor);
  const rs = cur(s).recipients;
  require(rs.some((r) => r.personId === personId), "Not a recipient.");
  require(rs.length > 1, "A message needs at least one recipient.");
  const kept = rs.filter((r) => r.personId !== personId).map((r) => ({ ...r }));
  s = await newVersion(s, kept, cur(s).subject, [...cur(s).body], `${person(s, personId).name} removed`, true);
  if (!team(s).has(personId)) tried(s, "sam-explained"); // acting on the off-team recipient (UF17)
  return s;
}

export async function addRecipient(state, actor, { personId, field = "cc" }) {
  const s = clone(state);
  editable(s, actor);
  require(s.people.some((p) => p.id === personId), "Unknown person.");
  require(cur(s).recipients.every((r) => r.personId !== personId), "Already a recipient.");
  const next = [...cur(s).recipients.map((r) => ({ ...r })), { personId, field }];
  return newVersion(s, next, cur(s).subject, [...cur(s).body], `${person(s, personId).name} added`, false);
}

export async function applyWording(state, actor, { issueKey, text }) {
  const s = clone(state);
  editable(s, actor);
  require(Boolean(text && pyStrip(text)), "Wording can't be empty.");
  const issue = issuesOf(s, lastDone(s)).find((i) => i.key === issueKey && i.kind === "wording");
  require(issue !== undefined, "No flagged wording to edit.");
  const body = [...cur(s).body];
  const idx = issue.paragraphIndex;
  require(idx < body.length && body[idx].includes(issue.matchedText), "The flagged sentence is no longer in the message.");
  // literal replacement of the first occurrence, as Python's str.replace(…, 1);
  // String.replace would interpret "$" patterns in the typed text
  const at = body[idx].indexOf(issue.matchedText);
  body[idx] = body[idx].slice(0, at) + pyStrip(text) + body[idx].slice(at + issue.matchedText.length);
  return newVersion(s, cur(s).recipients.map((r) => ({ ...r })), cur(s).subject, body, `Wording changed in paragraph ${idx + 1}`, true);
}

export async function saveEdit(state, actor, { body, subject = null, recipients = null }) {
  const s = clone(state);
  editable(s, actor);
  let next;
  if (recipients === null) {
    next = cur(s).recipients.map((r) => ({ ...r }));
  } else {
    const ids = recipients.map((r) => r.personId);
    require(ids.length > 0, "A message needs at least one recipient.");
    require(new Set(ids).size === ids.length, "Already a recipient.");
    require(ids.every((i) => s.people.some((p) => p.id === i)), "Unknown person.");
    require(recipients.every((r) => r.field === "to" || r.field === "cc"), "Unknown field.");
    next = recipients.map((r) => ({ personId: r.personId, field: r.field }));
  }
  return newVersion(s, next, subject !== null ? subject : cur(s).subject, [...body], "Message edited", false);
}

export async function undo(state, actor) {
  const s = clone(state);
  editable(s, actor);
  require(s.undoable !== null && s.undoable === cur(s).id, "Nothing to undo.");
  const v = cur(s);
  v.discardedAt = tick(s, "undo");
  draft(s).currentVersionId = v.previousVersionId;
  s.undoable = null;
  return s;
}

export async function runCheck(state, actor) {
  const s = clone(state);
  editable(s, actor);
  require(["NotRun", "Outdated", "Unavailable"].includes(checkStatus(s)), "The check is already current.");
  const t = tick(s, "check");
  const v = cur(s);
  const chk = { id: newId(s, "chk"), draftId: s.draftId, versionId: v.id, contentHash: v.contentHash, startedAt: t, finishedAt: t };
  if (s.simulation.reviewAvailability === "unavailable") {
    chk.outcome = "failed";
    tried(s, "review-unavailable");
    s.checks.push(chk);
  } else {
    chk.outcome = "completed";
    s.checks.push(chk);
    for (const i of runRules(s, v)) {
      i.id = newId(s, "iss");
      i.checkId = chk.id;
      s.issues.push(i);
    }
  }
  s.undoable = null;
  return s;
}

export async function requestException(state, actor, { issueKey, reason }) {
  const s = clone(state);
  editable(s, actor);
  require(checkStatus(s) === "Current", "Run the check before requesting an exception.");
  const issue = blocking(s).find((i) => i.key === issueKey);
  require(issue !== undefined, "Only blocking issues can be escalated.");
  require(resolution(s, issue) !== "approved", "Already approved for this version.");
  const prev = latestRequest(s, issueKey);
  require(!(prev && requestStatus(s, prev) === "pending"), "A request is already pending.");
  require(Boolean(reason && pyStrip(reason)), "Add a reason so the deal owner can decide.");
  s.requests.push({
    id: newId(s, "req"), draftId: s.draftId, issueKey, versionId: cur(s).id,
    contentHash: cur(s).contentHash, requestedBy: actor, requestedTo: deal(s).ownerId,
    requestedAt: tick(s, "request"), reason: pyStrip(reason),
  });
  if (issueKey.startsWith("recipient:")) tried(s, "sam-explained"); // acting on the off-team recipient (UF17)
  s.undoable = null;
  return s;
}

export async function decide(state, actor, { requestId, outcome, note = "" }) {
  const s = clone(state);
  const req = requests(s).find((r) => r.id === requestId);
  require(req !== undefined, "Unknown request.");
  require(actor === deal(s).ownerId, "Only the deal owner can decide.");
  require(actor !== req.requestedBy, "Requesters can't decide their own request.");
  require(outcome === "approved" || outcome === "declined", "Unknown outcome.");
  require(sentRecord(s) === null, "The draft has been sent.");
  require(req.contentHash === cur(s).contentHash, "The message changed. This request is outdated.");
  const prev = decisionsOf(s, req);
  require(!prev.length || prev[prev.length - 1].outcome !== outcome, "Same decision already recorded.");
  s.decisions.push({
    id: newId(s, "dec"), requestId: req.id, decidedBy: actor, outcome, note,
    decidedAt: tick(s, "decision"), supersedesId: prev.length ? prev[prev.length - 1].id : null, simulated: true,
  });
  tried(s, "owner-decided");
  s.undoable = null;
  return s;
}

export async function send(state, actor) {
  const s = clone(state);
  require(role(s, actor) === "coordinator", "Only the coordinator sends.");
  require(canSend(s), (blockReason(s) ?? ["", "Can't send."])[1]);
  const v = cur(s);
  const first = s.versions.find((x) => x.draftId === s.draftId && x.number === 1);
  const nowIds = new Set(v.recipients.map((r) => r.personId));
  const fixed = fixedKeys(s).sort(cmpCodePoint);
  s.sendRecords.push({
    id: newId(s, "send"), draftId: s.draftId, versionId: v.id, contentHash: v.contentHash,
    sentAt: tick(s, "send"), sentBy: actor,
    recipients: v.recipients.map((r) => ({ name: person(s, r.personId).name, email: person(s, r.personId).email, field: r.field })),
    removedRecipients: first.recipients.filter((r) => !nowIds.has(r.personId)).map((r) => person(s, r.personId).name),
    issueOutcomes: [
      ...fixed.map((k) => ({ key: k, outcome: "fixed" })),
      ...issuesOf(s, lastDone(s)).map((i) => ({ key: i.key, outcome: i.severity === "blocking" ? resolution(s, i) : "warning kept" })),
    ],
    decisions: requests(s).flatMap((r) => decisionsOf(s, r).map((d) => ({
      subject: subjectLabel(s, r.issueKey), outcome: d.outcome, decidedBy: person(s, d.decidedBy).name,
      decidedAt: d.decidedAt, forVersion: version(s, r.versionId).number,
    }))),
    simulated: true,
  });
  s.undoable = null;
  return s;
}

export async function setReviewAvailability(state, actor, { value }) {
  const s = clone(state);
  require(actor === "evaluator", "Only the evaluator controls the simulation.");
  require(value === "available" || value === "unavailable", "Unknown value.");
  require(s.simulation.reviewAvailability !== value, "Already set.");
  s.simulation.reviewAvailability = value;
  return s;
}

export async function restartSample(state, actor) {
  require(actor === "evaluator" || actor === state.actorId, "Only a sample user can restart.");
  return initialState(SEEDS[state.seedVersion]);
}

export const COMMANDS = {
  OpenDraft: openDraft,
  RemoveRecipient: removeRecipient,
  AddRecipient: addRecipient,
  ApplyWording: applyWording,
  SaveEdit: saveEdit,
  Undo: undo,
  RunCheck: runCheck,
  RequestException: requestException,
  Decide: decide,
  Send: send,
  SetReviewAvailability: setReviewAvailability,
  RestartSample: restartSample,
};

export function apply(state, name, actor, params = {}) {
  return COMMANDS[name](state, actor, params);
}
