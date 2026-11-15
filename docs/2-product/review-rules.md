# Review rules

> Rule IDs are `RR1`–`RR7`, so they are not confused with the research notes `R1`–`R7`.

## Rules from the brief (not negotiable)

| ID | Rule | Requirements |
|---|---|---|
| RR1 | A recipient who is not on the team must be **removed** or **approved** by the deal owner. Working for the same company is not enough. | APP-16 |
| RR2 | The guaranteed-completion sentence must be **reworded** or **approved** by the owner. | APP-17 |
| RR3 | The coordinator can **request** an exception, not approve it. | APP-18, CTX-13 |
| RR4 | **Pending is not an approval.** | APP-19 |
| RR5 | Changing recipients or text **invalidates** the earlier check. | APP-10 |
| RR6 | The simulated send is blocked if a blocking issue is unresolved or if the required check is unavailable. | APP-11, APP-20 |
| RR7 | No real email. Owner responses and review results are **simulated and labelled**. | APP-29, APP-31 |

## Send condition

```
canSend =
  check.status == Current                                   (RR5, RR6)
  AND check.version == draft.currentVersion                 (D1)
  AND every Blocking issue is
        Fixed
        OR Approved with decision.version == currentVersion  (RR1, RR2, D1)
  AND no decision is Pending                                (RR4)
  AND no decision is Declined while its object is present   (D1b)
```

If `canSend` is false, the interface says **which condition** is missing, next to the send button (D5). Exact definition: DV-6 in the [data model](data-model.md).

## States → send matrix

| Check | Blocking issues | Decisions | Status shown | Send |
|---|---|---|---|---|
| Not run | n/a | n/a | Needs a check | No |
| Unavailable | n/a | n/a | Check unavailable | No |
| Outdated | any | any | Needs a new check | No |
| Current | ≥1 Open | n/a | Blocked | No |
| Current | ≥1 Declined with object present | n/a | Blocked | No |
| Current | all handled | ≥1 Pending | Waiting for decision | No |
| Current | all handled | ≥1 approval on an earlier version | Blocked (approval doesn't cover this version) | No |
| Current | all Fixed or Approved on the current version | none Pending | Ready to send | Yes |

Warnings and Notes never enter the send condition.

## Product decisions

D1 approval tied to the content · D1b a Declined persists while its object is present · D2 a Note instead of an "external" warning · D3 the owner response is simulated · D4 explicit `Run check`, no timeout · D5 `aria-disabled` and the reason next to the button · D6 one live region · D7 deterministic recipient check, pattern-based wording check · D8 resume after an interruption · D9 no figures on the homepage. Alternatives and reasons: [decisions.md](../decisions.md), section D.
