# UC-08 — Decide an exception

**Actor** deal owner; in the sample, the evaluator acting as Dana · **Origin** J2, J2-OP-01–07 · **Requirements** CTX-12, CTX-14, APP-31 · **Rules** RR3, RR7, D1, D3, U3, TC8, OA8, INV-2, INV-8, INV-10

**Precondition.** A Pending request; the decider is the deal owner and not the requester (INV-2).

## Main flow
1. **Evaluator** presses "Answer as Dana Whitfield". It sits in a simulation frame with "In the real tool, Dana Whitfield answers from their own inbox. Here you answer for them." (OA8).
2. **System** puts the page in the background and shows the request as Dana reads it, under "Simulation" and "Acting as Dana Whitfield (deal owner)": "From" Jordan Blake, "To" Dana, the subject "Project Harbor · Exception request · Sam Lee as recipient", "You're deciding as deal owner.", the scope "If approved, Sam Lee can receive this message (version 2) only. It doesn't add Sam to the deal team.", "Jordan's reason" apart from the facts, and "Message (version 2)" (TC8).
3. **Dana** chooses `Approve exception for Sam Lee` (the primary button in this view) or `Decline`, with "Note (optional)".
4. **System** records the decision: "Approved for version 2 at 10:51. If Jordan edits the message, you'll be asked again." or "Declined at 10:55."

## Extensions
- A request after an outdated approval opens with "Changed since you approved version 2: ‹changes›".
- A sentence: `Approve exception for this sentence`.
- Correcting a decision is a new decision that replaces the earlier one; both stay in the history (U3).

## Rules
- Only the deal owner decides (RR3). The decision counts for the request's content (D1) and has author, time and outcome (INV-8).

## Acceptance criteria
- The view shows deal, requester, scope, reason and the quoted version.
- After Approve, Jordan's card shows Dana, the time and the version, and "Simulated owner response".
