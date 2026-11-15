"""Reference implementation of the DealDesk sample-review model.

Executable specification for docs/2-product/data-model.md and
docs/2-product/state-model.md (decision S1).
The browser prototype (plain HTML/CSS/JS) must produce the same projections on
model/scenarios.json.

Principle (M1): only events are stored (versions, checks, issues, requests,
decisions, send records); every status is a projection computed from them.

Commands never mutate their input: they return a new state or raise Rejected.
"""
import copy
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEED_PATH = ROOT / "model" / "seed.json"

CLOCK_STEP = {  # data-model.md, "Simulated clock" (minutes)
    "version": 1, "undo": 1, "check": 1, "request": 2, "decision": 9, "send": 2,
}


class Rejected(Exception):
    """A command refused by a domain rule. The state is unchanged."""


# ---------------------------------------------------------------- loading

def content_hash(version):
    """DV-1."""
    order = {"to": 0, "cc": 1}
    recipients = sorted(([r["field"], r["personId"]] for r in version["recipients"]),
                        key=lambda r: (order[r[0]], r[1]))
    canonical = json.dumps({"recipients": recipients,
                            "subject": version["subject"].strip(),
                            "body": [p.strip() for p in version["body"]]},
                           ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def to_minutes(hhmm):
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def fmt(minutes):
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def load_seed(path=SEED_PATH):
    seed = json.loads(Path(path).read_text(encoding="utf-8"))
    for v in seed["versions"]:
        v["contentHash"] = content_hash(v)
    by_id = {v["id"]: v for v in seed["versions"]}
    for c in seed["checks"]:
        c["contentHash"] = by_id[c["versionId"]]["contentHash"]
    return seed


def initial_state(seed):
    s = copy.deepcopy(seed)
    s["clock"] = to_minutes(seed["clockStart"])
    s["undoable"] = None          # id of the version an Undo would discard
    s["counter"] = 0              # deterministic id generator
    s["draftId"] = next(d["id"] for d in seed["drafts"] if d["interactive"])
    _SEEDS[seed["seedVersion"]] = seed   # kept outside the state for RestartSample
    return s


_SEEDS = {}


# ---------------------------------------------------------------- lookups

def draft(s):
    return next(d for d in s["drafts"] if d["id"] == s["draftId"])


def deal(s):
    return next(d for d in s["deals"] if d["id"] == draft(s)["dealId"])


def version(s, vid):
    return next(v for v in s["versions"] if v["id"] == vid)


def cur(s):
    return version(s, draft(s)["currentVersionId"])


def person(s, pid):
    return next(p for p in s["people"] if p["id"] == pid)


def team(s):
    return {t["personId"] for t in s["teamMembers"] if t["dealId"] == deal(s)["id"]}


def checks(s):
    return [c for c in s["checks"] if c["draftId"] == s["draftId"]]


def requests(s):
    return [r for r in s["requests"] if r["draftId"] == s["draftId"]]


def decisions_of(s, req):
    return [d for d in s["decisions"] if d["requestId"] == req["id"]]


def sent_record(s):
    return next((r for r in s["sendRecords"] if r["draftId"] == s["draftId"]), None)


# ---------------------------------------------------------------- rules (D7, M2, M6)

def sentences(paragraph):
    return [x for x in re.split(r"(?<=[.!?])\s+", paragraph.strip()) if x]


def run_rules(s, v):
    """Issues the recipient and wording rules find in version v (without ids)."""
    found = []
    members = team(s)
    for r in v["recipients"]:
        if r["personId"] not in members:
            found.append({"key": f"recipient:{r['personId']}", "kind": "recipient",
                          "severity": "blocking", "personId": r["personId"]})
    for pat in s["wordingPatterns"]:
        rx = re.compile(pat["match"], re.IGNORECASE)
        for idx, para in enumerate(v["body"]):
            hit = next((x for x in sentences(para) if rx.search(x)), None)
            if hit:
                found.append({"key": f"wording:{pat['id']}", "kind": "wording",
                              "severity": pat["severity"], "patternId": pat["id"],
                              "matchedText": hit, "paragraphIndex": idx})
                break
    return found


# ---------------------------------------------------------------- projections

def last_done(s):
    done = [c for c in checks(s) if c["outcome"] == "completed"]
    return done[-1] if done else None


def check_status(s):
    """DV-2. Running is a UI transient and is not modelled (checks are atomic)."""
    cs = checks(s)
    if not cs:
        return "NotRun"
    if cs[-1]["outcome"] == "failed":
        return "Unavailable"
    return "Current" if last_done(s)["contentHash"] == cur(s)["contentHash"] else "Outdated"


def issues_of(s, chk):
    return [i for i in s["issues"] if chk and i["checkId"] == chk["id"]]


def latest_request(s, key):
    rs = [r for r in requests(s) if r["issueKey"] == key]
    return rs[-1] if rs else None


def request_status(s, req):
    """DV-4."""
    ds = decisions_of(s, req)
    dec = ds[-1] if ds else None
    if dec and dec["outcome"] == "declined":
        return "declined"
    if req["contentHash"] != cur(s)["contentHash"]:
        return "outdated"
    if dec and dec["outcome"] == "approved":
        return "approved"
    return "pending"


def resolution(s, issue):
    """DV-3 (for issues of the last completed check)."""
    req = latest_request(s, issue["key"])
    if not req:
        return "open"
    st = request_status(s, req)
    return {"declined": "declined", "approved": "approved"}.get(st, "open")


def fixed_keys(s):
    """DV-3: keys seen in an earlier completed check and absent from the last one."""
    ld = last_done(s)
    now = {i["key"] for i in issues_of(s, ld)}
    seen = {i["key"] for c in checks(s) if c["outcome"] == "completed" and c is not ld
            for i in issues_of(s, c)}
    return seen - now


def blocking(s):
    return [i for i in issues_of(s, last_done(s)) if i["severity"] == "blocking"]


def draft_status(s):
    """DV-5."""
    if sent_record(s):
        return "Sent"
    st = check_status(s)
    if st == "NotRun":
        return "NeedsCheck"
    if st == "Unavailable":
        return "ReviewUnavailable"
    if st == "Outdated":
        return "NeedsNewCheck"
    pending = {r["issueKey"] for r in requests(s) if request_status(s, r) == "pending"}
    for i in blocking(s):
        if resolution(s, i) != "approved" and i["key"] not in pending:
            return "Blocked"
    if any(i["key"] in pending for i in blocking(s)):
        return "WaitingForDecision"
    return "ReadyToSend"


def can_send(s):
    """DV-6."""
    return (sent_record(s) is None
            and check_status(s) == "Current"
            and all(resolution(s, i) == "approved" for i in blocking(s))
            and not any(request_status(s, r) == "pending" for r in requests(s)))


def subject_label(s, key):
    kind, ref = key.split(":", 1)
    if kind == "recipient":
        return person(s, ref)["name"]
    return next(p["label"] for p in s["wordingPatterns"] if p["id"] == ref)


def block_reason(s):
    """DV-6: (code, text) of the first failing condition, or None if canSend."""
    owner = person(s, deal(s)["ownerId"])["name"]
    rec = sent_record(s)
    if rec:
        return ("sent", f"Already sent (simulated) at {fmt(rec['sentAt'])}.")
    st = check_status(s)
    if st == "NotRun":
        return ("not-run", "Can't send yet: run the check.")
    if st == "Unavailable":
        return ("unavailable", "Can't send yet: review is unavailable. Your draft is saved.")
    if st == "Outdated":
        return ("outdated", "Can't send yet: the message changed. Run the check again.")
    bl = blocking(s)
    for i in bl:
        if resolution(s, i) == "declined":
            fix = (f"Remove {subject_label(s, i['key'])} to continue." if i["kind"] == "recipient"
                   else "Edit the sentence to continue.")
            return ("declined", f"Can't send yet: {owner} declined the exception for "
                                f"{subject_label(s, i['key'])}. {fix}")
    for i in bl:
        req = latest_request(s, i["key"])
        if resolution(s, i) == "open" and req and request_status(s, req) == "outdated":
            n = version(s, req["versionId"])["number"]
            if decisions_of(s, req):
                return ("approval-outdated", f"Can't send yet: {owner}'s approval covers "
                                             f"version {n} only. Request again.")
            return ("request-outdated", f"Can't send yet: your request to {owner} was for "
                                        f"version {n}. Request again.")
    open_unrequested = [i for i in bl if resolution(s, i) == "open"
                        and not (latest_request(s, i["key"])
                                 and request_status(s, latest_request(s, i["key"])) == "pending")]
    if open_unrequested:
        n = len(open_unrequested)
        return ("blocking-open", f"Can't send yet: {n} blocking issue{'s' if n > 1 else ''} "
                                 f"need{'' if n > 1 else 's'} action.")
    for r in requests(s):
        if request_status(s, r) == "pending":
            return ("pending", f"Can't send yet: waiting for {owner}'s decision on "
                               f"{subject_label(s, r['issueKey'])}.")
    return None


# ---------------------------------------------------------------- differences (DV-7, DV-10)

def _normalised(v):
    """The content DV-1 hashes: recipients as (field, personId), stripped subject and body."""
    return ({r["personId"]: r["field"] for r in v["recipients"]},
            [r["personId"] for r in v["recipients"]],
            v["subject"].strip(), [p.strip() for p in v["body"]])


def _align(a, b):
    """Pairs of equal paragraphs (i, j), by longest common subsequence.

    Ties prefer skipping a paragraph of `a` first, so the result is deterministic
    and the JavaScript port can reproduce it.
    """
    n, k = len(a), len(b)
    lcs = [[0] * (k + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for j in range(k - 1, -1, -1):
            lcs[i][j] = (lcs[i + 1][j + 1] + 1 if a[i] == b[j]
                         else max(lcs[i + 1][j], lcs[i][j + 1]))
    pairs, i, j = [], 0, 0
    while i < n and j < k:
        if a[i] == b[j]:
            pairs.append((i, j))
            i, j = i + 1, j + 1
        elif lcs[i + 1][j] >= lcs[i][j + 1]:
            i += 1
        else:
            j += 1
    return pairs


def _paragraph_changes(a, b):
    """(added indices of b, removed indices of a, changed indices of b).

    Between two aligned equal paragraphs, the unmatched ones are compared by
    position: the first min(len) pairs are changes, the rest additions or removals.
    """
    added, removed, changed = [], [], []
    anchors = _align(a, b) + [(len(a), len(b))]
    pi = pj = 0
    for ai, bj in anchors:
        ga, gb = list(range(pi, ai)), list(range(pj, bj))
        common = min(len(ga), len(gb))
        changed += gb[:common]
        removed += ga[common:]
        added += gb[common:]
        pi, pj = ai + 1, bj + 1
    return added, removed, changed


def diff_versions(s, va, vb):
    """DV-7: (parts, items) from version va to version vb, on normalised content."""
    fa, oa, sa, ba = _normalised(va)
    fb, ob, sb, bb = _normalised(vb)
    items = []
    items += [["removed", person(s, pid)["name"]] for pid in oa if pid not in fb]
    items += [["added", person(s, pid)["name"]] for pid in ob if pid not in fa]
    items += [["moved", person(s, pid)["name"], fb[pid]] for pid in ob
              if pid in fa and fa[pid] != fb[pid]]
    if sa != sb:
        items.append(["subject"])
    added, removed, changed = _paragraph_changes(ba, bb)
    items += [["paragraphAdded", bb[j]] for j in added]
    items += [["paragraphRemoved", ba[i]] for i in removed]
    items += [["paragraphChanged", j + 1] for j in changed]
    parts = []
    if any(x[0] in ("removed", "added", "moved") for x in items):
        parts.append("recipients")
    if sa != sb:
        parts.append("subject")
    if added or removed or changed:
        parts.append("wording")
    return parts, items


def what_changed(s):
    """DV-7 "What changed since the last check": lastDone version against cur (UF14)."""
    ld = last_done(s)
    if not ld or ld["contentHash"] == cur(s)["contentHash"]:
        return None
    since = version(s, ld["versionId"])
    parts, items = diff_versions(s, since, cur(s))
    return {"sinceVersion": since["number"], "parts": parts, "items": items}


def lineage(s):
    """Versions from the first to cur, following previousVersionId (discarded ones excluded)."""
    chain, v = [], cur(s)
    while v:
        chain.append(v)
        v = version(s, v["previousVersionId"]) if v["previousVersionId"] else None
    return list(reversed(chain))


def final_changes(s):
    """DV-10: recipients removed since the first version (with the version that removed
    them) and the paragraphs of cur changed or added since the first version."""
    chain = lineage(s)
    first, now = chain[0], chain[-1]
    now_ids = {r["personId"] for r in now["recipients"]}
    removed = []
    for r in first["recipients"]:
        if r["personId"] in now_ids:
            continue
        at = next(v for v in chain if all(x["personId"] != r["personId"] for x in v["recipients"]))
        removed.append([person(s, r["personId"])["name"], at["number"]])
    added, _removed, changed = _paragraph_changes(_normalised(first)[3], _normalised(now)[3])
    return {"removed": removed, "changedParagraphs": sorted(added + changed)}


def resume(s):
    """DV-8: decisions since the draft was last opened, and where the coordinator left off."""
    opened = draft(s)["lastOpenedAt"]
    if opened is None:
        return {"sinceYouLeft": [], "whereYouLeft": None}
    since = []
    for r in requests(s):
        for d in decisions_of(s, r):
            if d["decidedAt"] > opened:
                since.append([subject_label(s, r["issueKey"]), d["outcome"],
                              person(s, d["decidedBy"])["name"], d["decidedAt"]])
    reason = block_reason(s)
    return {"sinceYouLeft": since,
            "whereYouLeft": [draft_status(s), reason[0] if reason else None]}


def projection(s):
    """Everything a user can observe about the draft, in one comparable value."""
    ld = last_done(s)
    return {
        "draftStatus": draft_status(s),
        "checkStatus": check_status(s),
        "canSend": can_send(s),
        "reason": (block_reason(s) or (None, None))[0],
        "version": cur(s)["number"],
        "recipients": sorted(r["personId"] for r in cur(s)["recipients"]),
        "issues": sorted((i["key"], i["severity"], resolution(s, i)) for i in issues_of(s, ld)),
        "fixed": sorted(fixed_keys(s)),
        "requests": [(r["issueKey"], request_status(s, r)) for r in requests(s)],
        "whatChanged": what_changed(s),
        "finalChanges": final_changes(s),
        "resume": resume(s),
    }


def identity(s):
    """State identity for exploration (S5): semantic content, no clock or ids."""
    # Behaviour depends on which contents were requested and on the latest outcome
    # of each request, not on how many times the same thing happened (history).
    req_part = tuple(sorted({(r["issueKey"], r["contentHash"],
                              (decisions_of(s, r)[-1]["outcome"] if decisions_of(s, r) else ""),
                              r is latest_request(s, r["issueKey"]))
                             for r in requests(s)}))
    ld = last_done(s)
    undo_prev = None
    if s["undoable"]:
        undo_prev = version(s, version(s, s["undoable"])["previousVersionId"])["contentHash"]
    seen = frozenset(i["key"] for c in checks(s) if c["outcome"] == "completed"
                     for i in issues_of(s, c))
    return (cur(s)["contentHash"],
            ld["contentHash"] if ld else None,
            checks(s)[-1]["outcome"] if checks(s) else None,
            tuple(sorted((i["key"], i["severity"]) for i in issues_of(s, ld))),
            seen, req_part, sent_record(s) is not None,
            s["simulation"]["reviewAvailability"], undo_prev)


# ---------------------------------------------------------------- commands

def _new_id(s, prefix):
    s["counter"] += 1
    return f"{prefix}-{s['counter']}"


def _tick(s, kind):
    s["clock"] += CLOCK_STEP[kind]
    return s["clock"]


def _require(cond, reason):
    if not cond:
        raise Rejected(reason)


def _role(s, actor):
    if actor == deal(s)["ownerId"]:
        return "owner"
    if actor == s["actorId"]:
        return "coordinator"
    if actor == "evaluator":
        return "evaluator"
    return "other"


def _new_version(s, recipients, subject, body, summary, undoable):
    old = cur(s)
    v = {"id": _new_id(s, "v"), "draftId": s["draftId"],
         "number": max(x["number"] for x in s["versions"] if x["draftId"] == s["draftId"]) + 1,
         "previousVersionId": old["id"], "recipients": recipients, "subject": subject,
         "body": body, "createdAt": None, "createdBy": s["actorId"],
         "changeSummary": summary, "discardedAt": None}
    v["contentHash"] = content_hash(v)
    _require(v["contentHash"] != old["contentHash"], "No change made.")
    v["createdAt"] = _tick(s, "version")
    if check_status(s) == "Current" and "edited-after-review" not in s["triedItems"]:
        s["triedItems"].append("edited-after-review")
    s["versions"].append(v)
    draft(s)["currentVersionId"] = v["id"]
    s["undoable"] = v["id"] if undoable else None
    return s


def _tried(s, item):
    if item not in s["triedItems"]:
        s["triedItems"].append(item)


def _editable(s, actor):
    _require(_role(s, actor) == "coordinator", "Only the coordinator edits the draft.")
    _require(sent_record(s) is None, "The draft has been sent.")


def open_draft(state, actor):
    s = copy.deepcopy(state)
    _require(_role(s, actor) == "coordinator", "Only the coordinator opens drafts.")
    draft(s)["lastOpenedAt"] = s["clock"]
    return s


def remove_recipient(state, actor, personId):
    s = copy.deepcopy(state)
    _editable(s, actor)
    rs = cur(s)["recipients"]
    _require(any(r["personId"] == personId for r in rs), "Not a recipient.")
    _require(len(rs) > 1, "A message needs at least one recipient.")
    new = [dict(r) for r in rs if r["personId"] != personId]
    s = _new_version(s, new, cur(s)["subject"], list(cur(s)["body"]),
                     f"{person(s, personId)['name']} removed", undoable=True)
    if personId not in team(s):
        _tried(s, "sam-explained")   # acting on the off-team recipient (UF17)
    return s


def add_recipient(state, actor, personId, field="cc"):
    s = copy.deepcopy(state)
    _editable(s, actor)
    _require(any(p["id"] == personId for p in s["people"]), "Unknown person.")
    _require(all(r["personId"] != personId for r in cur(s)["recipients"]), "Already a recipient.")
    new = [dict(r) for r in cur(s)["recipients"]] + [{"personId": personId, "field": field}]
    return _new_version(s, new, cur(s)["subject"], list(cur(s)["body"]),
                        f"{person(s, personId)['name']} added", undoable=False)


def apply_wording(state, actor, issueKey, text):
    s = copy.deepcopy(state)
    _editable(s, actor)
    _require(bool(text and text.strip()), "Wording can't be empty.")
    issue = next((i for i in issues_of(s, last_done(s)) if i["key"] == issueKey
                  and i["kind"] == "wording"), None)
    _require(issue is not None, "No flagged wording to edit.")
    body = list(cur(s)["body"])
    idx = issue["paragraphIndex"]
    _require(idx < len(body) and issue["matchedText"] in body[idx],
             "The flagged sentence is no longer in the message.")
    body[idx] = body[idx].replace(issue["matchedText"], text.strip(), 1)
    return _new_version(s, [dict(r) for r in cur(s)["recipients"]], cur(s)["subject"], body,
                        f"Wording changed in paragraph {idx + 1}", undoable=True)


def save_edit(state, actor, body, subject=None, recipients=None):
    """UC-04: one version for subject, body and recipients edited together (UF22)."""
    s = copy.deepcopy(state)
    _editable(s, actor)
    if recipients is None:
        recipients = [dict(r) for r in cur(s)["recipients"]]
    else:
        ids = [r["personId"] for r in recipients]
        _require(len(ids) > 0, "A message needs at least one recipient.")
        _require(len(set(ids)) == len(ids), "Already a recipient.")
        _require(all(any(p["id"] == i for p in s["people"]) for i in ids), "Unknown person.")
        _require(all(r["field"] in ("to", "cc") for r in recipients), "Unknown field.")
        recipients = [{"personId": r["personId"], "field": r["field"]} for r in recipients]
    return _new_version(s, recipients,
                        subject if subject is not None else cur(s)["subject"],
                        list(body), "Message edited", undoable=False)


def undo(state, actor):
    s = copy.deepcopy(state)
    _editable(s, actor)
    _require(s["undoable"] is not None and s["undoable"] == cur(s)["id"], "Nothing to undo.")
    v = cur(s)
    v["discardedAt"] = _tick(s, "undo")
    draft(s)["currentVersionId"] = v["previousVersionId"]
    s["undoable"] = None
    return s


def run_check(state, actor):
    s = copy.deepcopy(state)
    _editable(s, actor)
    _require(check_status(s) in ("NotRun", "Outdated", "Unavailable"),
             "The check is already current.")
    t = _tick(s, "check")
    v = cur(s)
    chk = {"id": _new_id(s, "chk"), "draftId": s["draftId"], "versionId": v["id"],
           "contentHash": v["contentHash"], "startedAt": t, "finishedAt": t}
    if s["simulation"]["reviewAvailability"] == "unavailable":
        chk["outcome"] = "failed"
        if "review-unavailable" not in s["triedItems"]:
            s["triedItems"].append("review-unavailable")
        s["checks"].append(chk)
    else:
        chk["outcome"] = "completed"
        s["checks"].append(chk)
        for i in run_rules(s, v):
            i.update({"id": _new_id(s, "iss"), "checkId": chk["id"]})
            s["issues"].append(i)
    s["undoable"] = None
    return s


def request_exception(state, actor, issueKey, reason):
    s = copy.deepcopy(state)
    _editable(s, actor)
    _require(check_status(s) == "Current", "Run the check before requesting an exception.")
    issue = next((i for i in blocking(s) if i["key"] == issueKey), None)
    _require(issue is not None, "Only blocking issues can be escalated.")
    _require(resolution(s, issue) != "approved", "Already approved for this version.")
    prev = latest_request(s, issueKey)
    _require(not (prev and request_status(s, prev) == "pending"), "A request is already pending.")
    _require(bool(reason and reason.strip()), "Add a reason so the deal owner can decide.")
    s["requests"].append({"id": _new_id(s, "req"), "draftId": s["draftId"],
                          "issueKey": issueKey, "versionId": cur(s)["id"],
                          "contentHash": cur(s)["contentHash"], "requestedBy": actor,
                          "requestedTo": deal(s)["ownerId"],
                          "requestedAt": _tick(s, "request"), "reason": reason.strip()})
    if issueKey.startswith("recipient:"):
        _tried(s, "sam-explained")   # acting on the off-team recipient (UF17)
    s["undoable"] = None
    return s


def decide(state, actor, requestId, outcome, note=""):
    s = copy.deepcopy(state)
    req = next((r for r in requests(s) if r["id"] == requestId), None)
    _require(req is not None, "Unknown request.")
    _require(actor == deal(s)["ownerId"], "Only the deal owner can decide.")
    _require(actor != req["requestedBy"], "Requesters can't decide their own request.")
    _require(outcome in ("approved", "declined"), "Unknown outcome.")
    _require(sent_record(s) is None, "The draft has been sent.")
    _require(req["contentHash"] == cur(s)["contentHash"],
             "The message changed. This request is outdated.")
    prev = decisions_of(s, req)
    _require(not prev or prev[-1]["outcome"] != outcome, "Same decision already recorded.")
    s["decisions"].append({"id": _new_id(s, "dec"), "requestId": req["id"], "decidedBy": actor,
                           "outcome": outcome, "note": note,
                           "decidedAt": _tick(s, "decision"),
                           "supersedesId": prev[-1]["id"] if prev else None,
                           "simulated": True})
    if "owner-decided" not in s["triedItems"]:
        s["triedItems"].append("owner-decided")
    s["undoable"] = None
    return s


def send(state, actor):
    s = copy.deepcopy(state)
    _require(_role(s, actor) == "coordinator", "Only the coordinator sends.")
    _require(can_send(s), (block_reason(s) or ("", "Can't send."))[1])
    v = cur(s)
    first = next(x for x in s["versions"] if x["draftId"] == s["draftId"] and x["number"] == 1)
    now_ids = {r["personId"] for r in v["recipients"]}
    s["sendRecords"].append({
        "id": _new_id(s, "send"), "draftId": s["draftId"], "versionId": v["id"],
        "contentHash": v["contentHash"], "sentAt": _tick(s, "send"), "sentBy": actor,
        "recipients": [{"name": person(s, r["personId"])["name"],
                        "email": person(s, r["personId"])["email"], "field": r["field"]}
                       for r in v["recipients"]],
        "removedRecipients": [person(s, r["personId"])["name"] for r in first["recipients"]
                              if r["personId"] not in now_ids],
        "issueOutcomes": ([{"key": k, "outcome": "fixed"} for k in sorted(fixed_keys(s))]
                          + [{"key": i["key"], "outcome": resolution(s, i) if i["severity"] == "blocking"
                              else "warning kept"} for i in issues_of(s, last_done(s))]),
        "decisions": [{"subject": subject_label(s, r["issueKey"]), "outcome": d["outcome"],
                       "decidedBy": person(s, d["decidedBy"])["name"], "decidedAt": d["decidedAt"],
                       "forVersion": version(s, r["versionId"])["number"]}
                      for r in requests(s) for d in decisions_of(s, r)],
        "simulated": True})
    s["undoable"] = None
    return s


def set_review_availability(state, actor, value):
    s = copy.deepcopy(state)
    _require(actor == "evaluator", "Only the evaluator controls the simulation.")
    _require(value in ("available", "unavailable"), "Unknown value.")
    _require(s["simulation"]["reviewAvailability"] != value, "Already set.")
    s["simulation"]["reviewAvailability"] = value
    return s


def restart_sample(state, actor):
    _require(actor in ("evaluator", state["actorId"]), "Only a sample user can restart.")
    return initial_state(_SEEDS[state["seedVersion"]])


COMMANDS = {
    "OpenDraft": open_draft, "RemoveRecipient": remove_recipient,
    "AddRecipient": add_recipient, "ApplyWording": apply_wording, "SaveEdit": save_edit,
    "Undo": undo, "RunCheck": run_check, "RequestException": request_exception,
    "Decide": decide, "Send": send, "SetReviewAvailability": set_review_availability,
    "RestartSample": restart_sample,
}


def apply(state, name, actor, **params):
    return COMMANDS[name](state, actor, **params)
