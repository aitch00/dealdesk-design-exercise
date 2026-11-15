# Use cases

A use case is **a goal the system must let an actor reach**, with its branches. The 37 journey opportunities are grouped into 14 use cases, which fed the [data model](../data-model.md) and the [state model](../state-model.md).

**Actors.** Coordinator (Jordan Blake, J1); deal owner (Dana Whitfield, J2), simulated; buyer (Chris Okafor, J3); evaluator, who uses the Simulation sheet; the system.

**Where things are.** The app is one page in three columns: the drafts list, the draft shown as an email, and "Review notes" (TC1). Issues are cards grouped by who must act; the first one to act on is open and marked "Next" (TC3, TC4). The exception request, the owner's answer, the final review and Simulation are views laid over the page (TC7, TC8, SM1). Decisions: [decisions.md](../../decisions.md).

| ID | Use case | Actor |
|---|---|---|
| [UC-01](uc-01-open-draft.md) | Open a draft from the list | Coordinator |
| [UC-02](uc-02-read-draft-status.md) | Read the context and status of a draft | Coordinator |
| [UC-03](uc-03-resolve-issue-by-editing.md) | Resolve an issue by editing | Coordinator |
| [UC-04](uc-04-edit-reviewed-draft.md) | Edit a draft that was already checked | Coordinator |
| [UC-05](uc-05-run-check.md) | Run the check | Coordinator |
| [UC-06](uc-06-request-exception.md) | Ask the owner for an exception | Coordinator |
| [UC-07](uc-07-follow-pending-request.md) | Follow a waiting request | Coordinator |
| [UC-08](uc-08-decide-exception.md) | Decide an exception | Deal owner (simulated) |
| [UC-09](uc-09-review-before-sending.md) | Review the message before sending | Coordinator |
| [UC-10](uc-10-send-simulated.md) | Send (simulated) | Coordinator |
| [UC-11](uc-11-view-review-record.md) | Read the review record | Coordinator |
| [UC-12](uc-12-evaluate-from-homepage.md) | Judge DealDesk from the homepage | Buyer |
| [UC-13](uc-13-enter-sample-review.md) | Enter, restart and leave the sample | Buyer, evaluator |
| [UC-14](uc-14-simulate-events.md) | Simulate outside events | Evaluator |

**Out of scope:** writing a draft from scratch, managing the deal team, delegating approvals, real email, notifications, login, several real users.

## Global invariants

True in every use case; they became properties of the state model.

| ID | Invariant | Rule |
|---|---|---|
| INV-1 | Nothing reaches "sent" if `canSend` is false at that moment | RR6 |
| INV-2 | The decider is never the requester; the coordinator never has an approve action | RR3 |
| INV-3 | A Pending request never makes an issue approved | RR4 |
| INV-4 | Any change to recipients, subject or text makes the check and the approvals on the old content out of date | RR5, D1 |
| INV-5 | A Declined stays while its object is in the current version | D1b |
| INV-6 | While the check is unavailable, no earlier result is shown as current | RR6 |
| INV-7 | Warnings and Notes never count for sending | D2 |
| INV-8 | Every decision has decider, time and the content it refers to | R1-F5 |
| INV-9 | Status is always said in words, not only colour or icon | CTX-19 |
| INV-10 | Every simulated action is labelled | RR7 |

INV-1 to INV-8 are checked on the model; INV-9 and INV-10 on the screens.

**Out of date** means the content fingerprint changed, not the version number (U1): an Undo back to checked content makes the check valid again.
