#!/usr/bin/env python3
"""Validate model/seed.json against the data model.

Checks:
  1. referential integrity and identity rules (docs/2-product/data-model.md, Entities)
  2. the recipient and wording rules, applied to the seed content, produce
     exactly the issues declared in the seed (data-model.md, Derived values,
     DV-1..DV-3)
  3. derived values of the initial state match the scenario
     (checkStatus = Current, Draft.status = Blocked, canSend = false)

Rules and projections come from the shared model (dealdesk_model.py, S6).

Run: python3 -I scripts/validate_seed.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import dealdesk_model as m  # noqa: E402

errors = []


def fail(msg):
    errors.append(msg)


def main():
    seed = m.load_seed()
    ids = {}
    for coll in ["organisations", "people", "deals", "drafts", "versions", "checks", "issues",
                 "requests", "decisions", "sendRecords", "wordingPatterns"]:
        for item in seed[coll]:
            if item["id"] in ids:
                fail(f"duplicate id {item['id']}")
            ids[item["id"]] = coll

    def ref(value, coll, where):
        if ids.get(value) != coll:
            fail(f"{where}: {value!r} is not a {coll} id")

    # 1. integrity
    for p in seed["people"]:
        ref(p["organisationId"], "organisations", p["id"])
        if not p["email"].endswith(".example"):
            fail(f"{p['id']}: email must use the reserved .example domain")
    for d in seed["deals"]:
        ref(d["ownerId"], "people", d["id"])
    pairs = set()
    for t in seed["teamMembers"]:
        ref(t["dealId"], "deals", "teamMember")
        ref(t["personId"], "people", "teamMember")
        if (t["dealId"], t["personId"]) in pairs:
            fail(f"duplicate team member {t}")
        pairs.add((t["dealId"], t["personId"]))
    for d in seed["deals"]:
        if (d["id"], d["ownerId"]) not in pairs:
            fail(f"{d['id']}: owner is not in the deal team")
    for dr in seed["drafts"]:
        ref(dr["dealId"], "deals", dr["id"])
        ref(dr["currentVersionId"], "versions", dr["id"])
        if not dr["interactive"] and not dr["staticStatusLabel"]:
            fail(f"{dr['id']}: static draft needs staticStatusLabel")
    if sum(d["interactive"] for d in seed["drafts"]) != 1:
        fail("exactly one draft must be interactive")
    for v in seed["versions"]:
        ref(v["draftId"], "drafts", v["id"])
        persons = [r["personId"] for r in v["recipients"]]
        if not persons:
            fail(f"{v['id']}: at least one recipient")
        if len(persons) != len(set(persons)):
            fail(f"{v['id']}: a person appears twice")
        for pid in persons:
            ref(pid, "people", v["id"])

    # 2. declared issues == rules applied to the checked version
    s = m.initial_state(seed)
    for c in seed["checks"]:
        ref(c["versionId"], "versions", c["id"])
        strip = lambda i: {k: v for k, v in i.items() if k not in ("id", "checkId")}  # noqa: E731
        declared = sorted((strip(i) for i in seed["issues"] if i["checkId"] == c["id"]),
                          key=lambda i: i["key"])
        expected = sorted(m.run_rules(s, m.version(s, c["versionId"])), key=lambda i: i["key"])
        if declared != expected:
            fail(f"{c['id']}: declared issues differ from rules\n  declared={declared}\n  expected={expected}")

    # 3. initial projection
    p = m.projection(s)
    for k, want in {"checkStatus": "Current", "draftStatus": "Blocked", "canSend": False,
                    "reason": "blocking-open"}.items():
        if p[k] != want:
            fail(f"initial {k}: expected {want}, got {p[k]}")

    if errors:
        print("FAIL")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    print("OK  seed", seed["seedVersion"])
    print(f"    v1 contentHash {m.cur(s)['contentHash'][:12]}…")
    print(f"    checkStatus={p['checkStatus']}  Draft.status={p['draftStatus']}  canSend={p['canSend']}")
    print(f"    reason: {m.block_reason(s)[1]}")
    print(f"    issues: {', '.join(f'{k} ({sev})' for k, sev, _ in p['issues'])}")


if __name__ == "__main__":
    main()
