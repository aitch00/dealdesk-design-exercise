# State model

In the [data model](data-model.md) the true state is **the sequence of saved events** (M1). The state model describes:

1. **commands**: who can do what, when, with which rules, and which events they add;
2. **projections**: how the states the user sees come from the events;
3. **properties**: what must be true in every reachable state.

The model is an executable specification in Python (`dealdesk_model.py`, S1). A script explores every sequence of commands from the seed, up to a depth limit, and checks the properties in each state. The prototype runs the same [`model/scenarios.json`](../../model/scenarios.json) on `prototype/tests.html` and must reach the same states. Decisions S1–S8: [decisions.md](../decisions.md), section S.

## Commands

A command either adds events, or is **refused** by a domain rule and changes nothing. The interface decides when an action is offered; the domain checks the rule **anyway** (S3). Every editing command needs actor = coordinator and a draft not sent (**E**).

| Command | Actor · use case | Domain rule |
|---|---|---|
| `OpenDraft` | Coordinator · UC-01 | — |
| `RemoveRecipient`, `AddRecipient` | Coordinator · UC-03, UC-04 | **E** · at least one recipient left · content changes |
| `ApplyWording` | Coordinator · UC-03 | **E** · wording issue in the last check · sentence still there · text not empty |
| `SaveEdit` | Coordinator · UC-04 | **E** · content changes · valid, distinct recipients (UF22) |
| `Undo` | Coordinator · UC-03 | **E** · no other coordinator action since |
| `RunCheck` | Coordinator · UC-05 | **E** · check not run, Outdated or Unavailable |
| `RequestException` | Coordinator · UC-06 | **E** · check Current · Blocking, not approved, no waiting request · reason not empty |
| `Decide` | Deal owner (simulated) · UC-08 | Actor = owner ≠ requester · request on the current content · outcome differs from the last |
| `Send` | Coordinator · UC-10 | `canSend` |
| `SetReviewAvailability` | Evaluator · UC-14 | Value differs |
| `RestartSample` | Evaluator or coordinator · UC-13 | — |

A check is atomic, so `Running` is not modelled. Repeating the same decision and removing the last recipient are refused.

## Projections

The states the user sees are calculated (DV-2 to DV-5). Any new version makes the check Outdated and approved or waiting requests outdated; a decline stays (D1b). Undo back to the same content restores both. A successful check makes the check Current; a failed one makes it Unavailable. Switching the service back on changes nothing until the next check.

## Properties

Checked in **every reached state** (state properties) or on **every attempted command** (transition properties).

| ID | Checked form | Origin |
|---|---|---|
| INV-1 | `Send` accepted ⇒ `canSend` was true; then content never changes | RR6 |
| INV-2 | Every decision: decider = owner ≠ requester | RR3 |
| INV-3 | An `approved` issue has a last `approved` decision on a request with the current `contentHash` | RR4 |
| INV-4 | Changed content ⇒ check not Current, requests on other content outdated or declined | RR5, D1 |
| INV-5 | A last decline keeps request and issue declined | D1b |
| INV-6 | Check `Unavailable` ⇒ draft `ReviewUnavailable` and `canSend` false | RR6 |
| INV-7 | Removing all Warnings changes neither `canSend` nor `Draft.status` | D2 |
| INV-8 | Every decision has decider, time and a request with `contentHash` | R1-F5 |
| P-CONSISTENT | `canSend` ⇔ `Draft.status = ReadyToSend` | DV-5 and DV-6 cannot diverge |
| P-REASON | `canSend` false ⇔ a block reason exists | D5: the button is never "just grey" |
| P-GUARD | `RequestException` accepted ⇒ check `Current` and blocking issue in the last check | UC-06 |
| P-REFUSE | A refused command changes nothing | S3 |
| P-LIVE | With `canSend` true, the coordinator's `Send` is not refused | The block must not fire when not needed (R5-F4) |
| P-UNDO | `Undo` brings back exactly the previous projection | M4 |
| P-NO-DEADLOCK | From **every** reached state, a fixed recovery strategy reaches `Sent` | No combination blocks the draft for ever |
| P-REACH | Every draft status is reached; Ready to send both with an exception and with fixes, Warning kept | Every variant of the brief can be walked |

INV-9 and INV-10 are about the interface and are checked on the screens.

**Recovery strategy (P-NO-DEADLOCK):** service back on → `RunCheck` → owner approves → remove the recipient or apply the suggestion → `Send`, at most 12 steps, applied to every reached state.

## Scenarios

The ten scenarios are in [`model/scenarios.json`](../../model/scenarios.json); each step runs a command and checks the projection.

- **SC-1** fix both issues: remove Sam, reword, check → Ready to send with the Warning kept → Sent.
- **SC-2** exception: reword, check → Blocked (Sam) → request → Waiting for decision → approve → Ready to send → Sent.
- **SC-3** decline: Blocked (`declined`); an edit keeps the decline; remove Sam, check → Ready to send.
- **SC-4** edit after approval: Needs a new check, request outdated → check → Blocked (`approval-outdated`) → request again, approve → Ready to send.
- **SC-5** check unavailable: outage on, check → Check unavailable; try again → same; outage off → **still** unavailable; check → Blocked ("guaranteed").
- **SC-6** Undo after removing Sam → Blocked, check up to date, version 1.
- **SC-7** request before rewording → request outdated → Blocked (`request-outdated`). The cost of D1, so the form warns.
- **SC-8** "Completion is guaranteed by the end of June." stays Blocked.
- **SC-9** refused commands change nothing: send with open issues, empty reason, request on a Warning, decision by the coordinator, second request, check when up to date, empty Undo, outage switch by the coordinator.
- **SC-10** restart → Blocked, check up to date, version 1, no requests.

## Results

Last saved run, at depth 10 (S2): **PASS**. 172,919 distinct states, 2,001,278 commands attempted, 1,617,241 refused by a domain rule, 2,163 states with the message sent, about 576 seconds. All properties and all 10 scenarios passed. Draft statuses reached: Blocked, NeedsNewCheck, ReadyToSend, ReviewUnavailable, Sent, WaitingForDecision.

**Limits.** Exhaustive within the depth limit, not a proof beyond it. Finite parameters: Sam removed or added, two rewordings of "guaranteed", one free edit, Undo, service on or off, approve or decline. Not explored: removing Pat or Alex, rewording the Warning, free text. Clock, IDs and repeated requests do not count in state identity (S5).

## Does the check really find errors?

Three errors were put into the model on purpose, at depth 5:

| Injected error | Caught by | Scenarios failed |
|---|---|---|
| A `pending` request counts as approved | INV-3 | None: `canSend` stays false thanks to the explicit pending condition (second barrier, DV-6) |
| An approval survives an edit | INV-3, INV-4 | SC-4 |
| The coordinator can decide | INV-2 | SC-9 |

Lesson: scenarios alone are not enough. The first error passes every scenario and only the exploration catches it.

## What came out of writing the model

An outdated request that was never decided needs its own reason (DV-6, row 7; SC-7). The "no pending request" condition is a second barrier. Switching the service back on needs a new check (SC-5). Request history must not count in state identity, or the space grows without end (S5).
