#!/usr/bin/env python3
"""Export random command traces from the reference model, for the parity test.

The browser prototype replays model/traces.json with its JavaScript port and
compares every step with what the Python model recorded here (decision S8):
whether the command was accepted, the rejection message, the full projection,
the content hash, the clock, the "Things to try" items and the undo pointer.

Traces are random walks from the seed: 100 traces of 30 steps, seed 20261109.
At each step the walk picks an accepted command 80% of the time and a rejected
one 20% of the time (a command name first, then one of its variants), from the candidates of check_state_model.py plus opening
the draft, subject and recipient edits, and texts with non-ASCII characters.

The script fails if the traces do not reach every reachable Draft.status and
block reason, a "since you left" decision, a "where you left off" message and
a subject change, so a gap in coverage cannot pass unnoticed.

Run:   python3 -I scripts/export_traces.py           (writes model/traces.json)
       python3 -I scripts/export_traces.py --check   (fails if the file is stale)
"""
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import dealdesk_model as m  # noqa: E402
import check_state_model as chk  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "model" / "traces.json"
SEED, TRACES, STEPS, ACCEPTED_SHARE = 20261109, 100, 30, 0.8
COORD, OWNER, EVAL = chk.COORD, chk.OWNER, chk.EVAL

# Texts that exercise the serialisation: spaces at the edges, typographic
# punctuation, accented letters, a character outside the BMP and "$" patterns
# that JavaScript's String.replace would interpret. No non-ASCII letter touches
# a word of the wording patterns, and no exotic spaces (see the parity limits).
REWORDINGS = [
    chk.CONST["suggestion"],
    chk.CONST["stillGuaranteed"],
    "  We’re working towards completion by 30 June — subject to approvals.  ",
    "Completion is targeted for 30 June; the café call may move it 🙂.",
    "Completion is guaranteed — naïve as that sounds.",
    "Target date: 30 June ($& and $1 are placeholders, not promises).",
]
PARAGRAPHS = [
    chk.CONST["extraParagraph"],
    "Notes from the café meeting — résumés attached 📎.",
]
SUBJECTS = ["Project Harbor — revised timeline", "  Harbor: timeline ✓  "]

REQUIRED_STATUS = {"Blocked", "NeedsNewCheck", "ReviewUnavailable", "WaitingForDecision",
                   "ReadyToSend", "Sent"}
REQUIRED_REASONS = {"sent", "unavailable", "outdated", "declined", "approval-outdated",
                    "request-outdated", "blocking-open", "pending", None}


def with_paragraph(state, text):
    return chk.with_paragraph(state, text)


def candidates(s):
    c = []
    for cmd, actor, params in chk.candidates(s):
        if cmd == "ApplyWording":
            continue  # replaced by the wider set of texts below
        c.append((cmd, actor, params))
    for i in m.issues_of(s, m.last_done(s)):
        if i["kind"] == "wording":
            for text in REWORDINGS:
                c.append(("ApplyWording", COORD, {"issueKey": i["key"], "text": text}))
    for text in PARAGRAPHS[1:]:
        c.append(("SaveEdit", COORD, {"body": with_paragraph(s, text)}))
    body = list(m.cur(s)["body"])
    for subject in SUBJECTS:
        c.append(("SaveEdit", COORD, {"body": body, "subject": subject}))
    recipients = [dict(r) for r in m.cur(s)["recipients"]]
    if all(r["personId"] != "p-sam" for r in recipients):
        c.append(("SaveEdit", COORD, {"body": body,
                                      "recipients": recipients + [{"personId": "p-sam", "field": "cc"}]}))
    moved = [dict(r, field="cc" if r["field"] == "to" else "to") if r["personId"] == "p-pat" else r
             for r in recipients]
    c.append(("SaveEdit", COORD, {"body": body, "recipients": moved}))
    c.append(("SaveEdit", COORD, {"body": body, "recipients": []}))             # rejected
    c.append(("OpenDraft", COORD, {}))
    c.append(("OpenDraft", OWNER, {}))                                          # rejected
    return c


def plain(value):
    """JSON-ready copy: tuples become lists."""
    return json.loads(json.dumps(value))


def observed(s):
    return {"projection": plain(m.projection(s)),
            "contentHash": m.cur(s)["contentHash"],
            "clock": s["clock"],
            "triedItems": list(s["triedItems"]),
            "undoable": s["undoable"]}


def pick(rng, options):
    """Choose a command name first, then one of its variants: text variants would
    otherwise crowd out rarer commands such as Decide."""
    names = sorted({o[0] for o in options})
    name = rng.choice(names)
    return rng.choice([o for o in options if o[0] == name])


def walk(rng, seed):
    s = m.initial_state(seed)
    steps = []
    for _ in range(STEPS):
        accepted, rejected = [], []
        for cmd, actor, params in candidates(s):
            try:
                accepted.append((cmd, actor, params, m.apply(s, cmd, actor, **params)))
            except m.Rejected as e:
                rejected.append((cmd, actor, params, str(e)))
        if accepted and (not rejected or rng.random() < ACCEPTED_SHARE):
            cmd, actor, params, s = pick(rng, accepted)
            steps.append({"cmd": cmd, "actor": actor, "params": params, "rejected": False,
                          "message": None, "after": observed(s)})
        else:
            cmd, actor, params, msg = pick(rng, rejected)
            steps.append({"cmd": cmd, "actor": actor, "params": params, "rejected": True,
                          "message": msg, "after": observed(s)})
    return steps


def build():
    seed = m.load_seed()
    rng = random.Random(SEED)
    traces = [{"id": f"T{n + 1:03d}", "steps": walk(rng, seed)} for n in range(TRACES)]
    return {"about": "Generated by scripts/export_traces.py from scripts/dealdesk_model.py. "
                     "Do not edit by hand. Replayed by prototype/tests.html (decision S8).",
            "seed": SEED, "stepsPerTrace": STEPS, "traces": traces}


def coverage(data):
    status, reasons, since, where, subject, astral = set(), set(), False, False, False, False
    for t in data["traces"]:
        for st in t["steps"]:
            p = st["after"]["projection"]
            status.add(p["draftStatus"])
            reasons.add(p["reason"])
            since |= bool(p["resume"]["sinceYouLeft"])
            where |= p["resume"]["whereYouLeft"] is not None
            subject |= bool(p["whatChanged"] and ["subject"] in p["whatChanged"]["items"])
            astral |= (not st["rejected"] and any(ord(ch) > 0xFFFF for ch in json.dumps(
                st["params"], ensure_ascii=False)))
    missing = [f"status {x}" for x in sorted(REQUIRED_STATUS - status)]
    missing += [f"reason {x}" for x in sorted(REQUIRED_REASONS - reasons, key=str)]
    missing += [name for name, ok in (("sinceYouLeft", since), ("whereYouLeft", where),
                                      ("subject change", subject),
                                      ("accepted text outside the BMP", astral)) if not ok]
    return status, reasons, missing


def serialise(data):
    """Valid JSON with one step per line, so a change in the model shows as a readable diff."""
    def enc(v):
        return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    head = {k: v for k, v in data.items() if k != "traces"}
    lines = ["{" + ",".join(f"{enc(k)}:{enc(v)}" for k, v in sorted(head.items())) + ',"traces":[']
    for n, t in enumerate(data["traces"]):
        lines.append('{"id":' + enc(t["id"]) + ',"steps":[')
        lines += [enc(st) + ("," if i < len(t["steps"]) - 1 else "") for i, st in enumerate(t["steps"])]
        lines.append("]}" + ("," if n < len(data["traces"]) - 1 else ""))
    lines.append("]}")
    return "\n".join(lines) + "\n"


def main():
    data = build()
    status, reasons, missing = coverage(data)
    text = serialise(data)
    if "--check" in sys.argv[1:]:
        if not OUT.is_file() or OUT.read_text(encoding="utf-8") != text:
            print("FAIL model/traces.json is stale: run python3 -I scripts/export_traces.py")
            return 1
    else:
        OUT.write_text(text, encoding="utf-8")
    steps = sum(len(t["steps"]) for t in data["traces"])
    rejected = sum(st["rejected"] for t in data["traces"] for st in t["steps"])
    print(f"traces={len(data['traces'])} steps={steps} rejected={rejected} bytes={len(text.encode())}")
    print("statuses:", ", ".join(sorted(status)))
    print("reasons:", ", ".join(sorted(str(r) for r in reasons)))
    if missing:
        print("FAIL coverage missing:", "; ".join(missing))
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
