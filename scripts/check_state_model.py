#!/usr/bin/env python3
"""Check the DealDesk state model.

1. Runs every scenario in model/scenarios.json.
2. Explores every sequence of commands from the seed up to MAX_DEPTH (S2),
   deduplicating states by semantic identity (S5).
3. In every reachable state, tries every command, including ones the UI would
   not offer (S3), with the actor attached (S4), and checks the properties in
   docs/2-product/state-model.md (section Properties).
4. Writes docs/2-product/state-model-results.md.

Bounded exploration: exhaustive within MAX_DEPTH, not a proof beyond it.

Run: python3 -I scripts/check_state_model.py        (depth 8)
     python3 -I scripts/check_state_model.py <depth>
"""
import json
import sys
import time
from collections import deque
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import dealdesk_model as m  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SCENARIOS = ROOT / "model" / "scenarios.json"
RESULTS = ROOT / "docs" / "2-product" / "state-model-results.md"
MAX_DEPTH = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8

CONST = json.loads(SCENARIOS.read_text(encoding="utf-8"))["constants"]
REWORDINGS = {
    "wording:guaranteed-completion": [CONST["suggestion"], CONST["stillGuaranteed"]],
}
COORD, OWNER, EVAL = "p-jordan", "p-dana", "evaluator"


# ---------------------------------------------------------------- helpers

def with_paragraph(state, text):
    body = list(m.cur(state)["body"])
    if text in body:
        body.remove(text)
    else:
        body.insert(len(body) - 1, text)  # before the sign-off
    return body


def resolve(state, params):
    out = {}
    for k, v in (params or {}).items():
        if isinstance(v, str) and v.startswith("$"):
            v = m.requests(state)[-1]["id"] if v == "$latest" else CONST[v[1:]]
        out[k] = v
    if "appendParagraph" in out:
        out = {"body": with_paragraph(state, out.pop("appendParagraph"))}
    return out


def candidates(s):
    """Every command worth trying in state s: legal-looking and adversarial (S3)."""
    c = []
    c.append(("RemoveRecipient", COORD, {"personId": "p-sam"}))
    c.append(("RemoveRecipient", OWNER, {"personId": "p-sam"}))          # wrong actor
    c.append(("AddRecipient", COORD, {"personId": "p-sam", "field": "cc"}))
    for i in m.issues_of(s, m.last_done(s)):
        for text in REWORDINGS.get(i["key"], []):
            c.append(("ApplyWording", COORD, {"issueKey": i["key"], "text": text}))
        c.append(("RequestException", COORD, {"issueKey": i["key"], "reason": CONST["reason"]}))
        c.append(("RequestException", COORD, {"issueKey": i["key"], "reason": " "}))
    c.append(("SaveEdit", COORD, {"body": with_paragraph(s, CONST["extraParagraph"])}))
    c.append(("Undo", COORD, {}))
    c.append(("RunCheck", COORD, {}))
    for r in m.requests(s):
        for outcome in ("approved", "declined"):
            c.append(("Decide", OWNER, {"requestId": r["id"], "outcome": outcome}))
            c.append(("Decide", COORD, {"requestId": r["id"], "outcome": outcome}))  # INV-2
    c.append(("Send", COORD, {}))
    c.append(("Send", OWNER, {}))
    for value in ("available", "unavailable"):
        c.append(("SetReviewAvailability", EVAL, {"value": value}))
        c.append(("SetReviewAvailability", COORD, {"value": value}))
    return c


def label(cmd, actor, params):
    short = {k: (v if not isinstance(v, list) else "<body>") for k, v in params.items()
             if k != "reason"}
    return f"{cmd}({actor}{', ' if short else ''}{', '.join(f'{k}={v}' for k, v in short.items())})"


# ---------------------------------------------------------------- properties

def state_properties(s):
    """Returns a list of (property id, message) violations for state s."""
    bad = []
    owner = m.deal(s)["ownerId"]
    cs, ds, send_ok = m.check_status(s), m.draft_status(s), m.can_send(s)
    rec = m.sent_record(s)
    if rec and rec["contentHash"] != m.cur(s)["contentHash"]:
        bad.append(("INV-1", "content changed after send"))
    for d in s["decisions"]:
        req = next(r for r in s["requests"] if r["id"] == d["requestId"])
        if d["decidedBy"] != owner or d["decidedBy"] == req["requestedBy"]:
            bad.append(("INV-2", f"decision {d['id']} by {d['decidedBy']}"))
        if not (d.get("decidedBy") and d.get("decidedAt") is not None and req.get("contentHash")):
            bad.append(("INV-8", f"decision {d['id']} incomplete"))
    for i in m.issues_of(s, m.last_done(s)):
        res = m.resolution(s, i)
        req = m.latest_request(s, i["key"])
        if res == "approved":
            decs = m.decisions_of(s, req) if req else []
            if not (decs and decs[-1]["outcome"] == "approved"
                    and req["contentHash"] == m.cur(s)["contentHash"]):
                bad.append(("INV-3", f"{i['key']} approved without a current approval"))
        if req and m.decisions_of(s, req) and m.decisions_of(s, req)[-1]["outcome"] == "declined" \
                and res != "declined":
            bad.append(("INV-5", f"{i['key']} declined but resolution {res}"))
    for r in m.requests(s):
        decs = m.decisions_of(s, r)
        if decs and decs[-1]["outcome"] == "declined" and m.request_status(s, r) != "declined":
            bad.append(("INV-5", f"request {r['id']} declined but status changed"))
    if cs == "Unavailable" and (ds != "ReviewUnavailable" or send_ok):
        bad.append(("INV-6", f"Unavailable but status {ds}, canSend {send_ok}"))
    # INV-7: removing warnings never changes canSend
    no_warn = dict(s, issues=[i for i in s["issues"] if i["severity"] != "warning"])
    if m.can_send(no_warn) != send_ok or m.draft_status(no_warn) != ds:
        bad.append(("INV-7", "warnings affect canSend or status"))
    if send_ok != (ds == "ReadyToSend"):
        bad.append(("P-CONSISTENT", f"canSend {send_ok} but status {ds}"))
    if send_ok == (m.block_reason(s) is not None) and not (rec and m.block_reason(s)):
        bad.append(("P-REASON", f"canSend {send_ok} but reason {m.block_reason(s)}"))
    return bad


def transition_properties(src, cmd, actor, params, dst, rejected):
    bad = []
    if cmd == "Send":
        if not rejected and not m.can_send(src):
            bad.append(("INV-1", "Send accepted with canSend false"))
        if rejected and m.can_send(src) and actor == COORD:
            bad.append(("P-LIVE", "Send refused with canSend true"))
    if cmd == "Decide" and not rejected and actor != m.deal(src)["ownerId"]:
        bad.append(("INV-2", "decision accepted from a non-owner"))
    if cmd == "RequestException" and not rejected:
        key = params["issueKey"]
        if m.check_status(src) != "Current" or key not in {i["key"] for i in m.blocking(src)}:
            bad.append(("P-GUARD", "request accepted without a current blocking issue"))
    if not rejected and dst is not None:
        h_old, h_new = m.cur(src)["contentHash"], m.cur(dst)["contentHash"]
        if h_old != h_new:
            ld = m.last_done(dst)
            if m.check_status(dst) == "Current" and not (ld and ld["contentHash"] == h_new):
                bad.append(("INV-4", "content changed but check still current"))
            for r in m.requests(dst):
                if r["contentHash"] != h_new and m.request_status(dst, r) not in ("outdated", "declined"):
                    bad.append(("INV-4", f"request {r['id']} still valid after a change"))
    if rejected and dst is not None:
        bad.append(("P-REFUSE", "rejected command produced a state"))
    return bad


def recover(s, limit=12):
    """Recovery policy used by P-NO-DEADLOCK. Returns (reached Sent, steps taken)."""
    steps = []
    for _ in range(limit):
        if m.sent_record(s):
            return True, steps
        st = m.draft_status(s)
        if st in ("NeedsCheck", "NeedsNewCheck", "ReviewUnavailable"):
            if s["simulation"]["reviewAvailability"] == "unavailable":
                s, step = m.set_review_availability(s, EVAL, "available"), "SetReviewAvailability"
            else:
                s, step = m.run_check(s, COORD), "RunCheck"
        elif st == "WaitingForDecision":
            req = next(r for r in m.requests(s) if m.request_status(s, r) == "pending")
            s, step = m.decide(s, OWNER, req["id"], "approved"), "Decide"
        elif st == "Blocked":
            issue = next(i for i in m.blocking(s) if m.resolution(s, i) != "approved")
            if issue["kind"] == "recipient":
                s, step = m.remove_recipient(s, COORD, issue["personId"]), "RemoveRecipient"
            else:
                s, step = m.apply_wording(s, COORD, issue["key"], CONST["suggestion"]), "ApplyWording"
        elif st == "ReadyToSend":
            s, step = m.send(s, COORD), "Send"
        else:
            return False, steps
        steps.append(step)
    return bool(m.sent_record(s)), steps


# ---------------------------------------------------------------- scenarios

def run_scenarios(seed):
    report = []
    spec = json.loads(SCENARIOS.read_text(encoding="utf-8"))
    for sc in spec["scenarios"]:
        s = m.initial_state(seed)
        failures = []
        for n, step in enumerate(sc["steps"]):
            if "cmd" in step:
                params = resolve(s, step.get("params"))
                before = m.projection(s)
                try:
                    nxt = m.apply(s, step["cmd"], step["actor"], **params)
                    if step.get("rejected"):
                        failures.append(f"step {n}: {step['cmd']} should be rejected")
                    s = nxt
                except m.Rejected as e:
                    if not step.get("rejected"):
                        failures.append(f"step {n}: {step['cmd']} rejected: {e}")
                    elif m.projection(s) != before:
                        failures.append(f"step {n}: rejection changed the state")
            proj = m.projection(s)
            for k, want in step.get("expect", {}).items():
                got = proj[k]
                if isinstance(got, list):
                    got = [list(x) if isinstance(x, tuple) else x for x in got]
                if got != want:
                    failures.append(f"step {n}: {k} expected {want!r}, got {got!r}")
        report.append((sc["id"], sc["name"], failures, len(sc["steps"])))
    return report


# ---------------------------------------------------------------- exploration

def explore(seed):
    start = m.initial_state(seed)
    sid = m.identity(start)
    states = {sid: start}
    depth = {sid: 0}
    parent = {sid: None}
    edges = {sid: set()}
    violations = {}
    attempts = rejections = 0
    queue = deque([sid])

    def record(prop, msg, at):
        violations.setdefault(prop, (msg, at))

    def trace(i):
        out = []
        while parent[i]:
            p, lab = parent[i]
            out.append(lab)
            i = p
        return list(reversed(out))

    while queue:
        cid = queue.popleft()
        s = states[cid]
        for prop, msg in state_properties(s):
            record(prop, msg, trace(cid))
        if depth[cid] >= MAX_DEPTH:
            continue
        snapshot = (m.identity(s), json.dumps(m.projection(s), sort_keys=True))
        for cmd, actor, params in candidates(s):
            attempts += 1
            try:
                dst = m.apply(s, cmd, actor, **params)
                rejected = False
            except m.Rejected:
                dst, rejected = None, True
                rejections += 1
            for prop, msg in transition_properties(s, cmd, actor, params, dst, rejected):
                record(prop, msg, trace(cid) + [label(cmd, actor, params)])
            if rejected:
                continue
            # P-UNDO: undoing the change that created the Undo restores the projection
            if dst["undoable"] and dst["undoable"] != s["undoable"]:
                back = m.undo(dst, COORD)
                if m.projection(back) != m.projection(s):
                    record("P-UNDO", f"undo after {cmd} does not restore", trace(cid))
            nid = m.identity(dst)
            edges[cid].add(nid)
            if nid not in states:
                states[nid] = dst
                depth[nid] = depth[cid] + 1
                parent[nid] = (cid, label(cmd, actor, params))
                edges[nid] = set()
                queue.append(nid)

        if (m.identity(s), json.dumps(m.projection(s), sort_keys=True)) != snapshot:
            record("P-REFUSE", "a command mutated its input state", trace(cid))

    # P-NO-DEADLOCK: from every reachable state, a fixed recovery policy reaches Sent.
    # Constructive and independent of the depth limit.
    for i, st in states.items():
        ok, steps = recover(st)
        if not ok:
            record("P-NO-DEADLOCK", f"recovery stuck after {steps}", trace(i))

    # P-REACH
    statuses = {m.draft_status(st) for st in states.values()}
    wanted = {"Blocked", "WaitingForDecision", "NeedsNewCheck", "ReviewUnavailable", "ReadyToSend", "Sent"}
    if wanted - statuses:
        record("P-REACH", f"unreached statuses {sorted(wanted - statuses)}", [])
    ready = [st for st in states.values() if m.draft_status(st) == "ReadyToSend"]
    via_exception = any(any(m.resolution(st, i) == "approved" for i in m.blocking(st)) for st in ready)
    via_fix = any(not m.blocking(st) for st in ready)
    with_warning = any(any(i["severity"] == "warning" for i in m.issues_of(st, m.last_done(st)))
                       for st in ready)
    for ok, name in [(via_exception, "ReadyToSend via exception"), (via_fix, "ReadyToSend via fixes"),
                     (with_warning, "ReadyToSend with a warning kept")]:
        if not ok:
            record("P-REACH", f"unreached: {name}", [])

    return {"states": len(states), "maxDepth": max(depth.values()), "attempts": attempts,
            "rejections": rejections, "statuses": sorted(statuses),
            "sentStates": sum(1 for st in states.values() if m.sent_record(st)),
            "violations": violations}


# ---------------------------------------------------------------- report

PROPS = ["INV-1", "INV-2", "INV-3", "INV-4", "INV-5", "INV-6", "INV-7", "INV-8",
         "P-CONSISTENT", "P-REASON", "P-GUARD", "P-REFUSE", "P-LIVE", "P-UNDO",
         "P-NO-DEADLOCK", "P-REACH"]


def main():
    seed = m.load_seed()
    t0 = time.time()
    scen = run_scenarios(seed)
    ex = explore(seed)
    secs = time.time() - t0
    ok = not ex["violations"] and all(not f for _, _, f, _ in scen)

    lines = ["# State model results", "",
             "> Generated by `python3 -I scripts/check_state_model.py`. Do not edit by hand.", "",
             f"**Outcome: {'PASS' if ok else 'FAIL'}**", "",
             "## Exploration", "",
             "| Measure | Value |", "|---|---|",
             f"| Depth limit (S2) | {MAX_DEPTH} commands |",
             f"| Distinct states reached | {ex['states']} |",
             f"| Deepest state | {ex['maxDepth']} |",
             f"| Commands attempted | {ex['attempts']} |",
             f"| Commands refused by a domain rule | {ex['rejections']} |",
             f"| States in which the message has been sent | {ex['sentStates']} |",
             f"| Draft statuses reached | {', '.join(ex['statuses'])} |",
             f"| Time | {secs:.1f} s |", "",
             "Exhaustive within the depth limit; not a proof beyond it. `Running` is a UI transient and is not modelled.", "",
             "## Properties", "", "| Property | Result | Counterexample |", "|---|---|---|"]
    for p in PROPS:
        if p in ex["violations"]:
            msg, tr = ex["violations"][p]
            lines.append(f"| {p} | ❌ {msg} | {' → '.join(tr) or '—'} |")
        else:
            lines.append(f"| {p} | ✅ | — |")
    lines += ["", "## Scenarios", "", "| Scenario | Steps | Result |", "|---|---|---|"]
    for sid, name, fails, steps in scen:
        lines.append(f"| {sid} {name} | {steps} | {'✅' if not fails else '❌ ' + '; '.join(fails)} |")
    RESULTS.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print("PASS" if ok else "FAIL", f"states={ex['states']} attempts={ex['attempts']} {secs:.1f}s")
    for p, (msg, tr) in ex["violations"].items():
        print(f"  {p}: {msg}\n    trace: {' -> '.join(tr)}")
    for sid, _, fails, _ in scen:
        for f in fails:
            print(f"  {sid}: {f}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
