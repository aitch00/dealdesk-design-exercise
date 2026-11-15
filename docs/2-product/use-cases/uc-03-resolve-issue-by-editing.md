# UC-03 — Resolve an issue by editing the draft

**Actor** coordinator · **Origin** J1-2.2a, 3.2a, 3.3, J1-OP-04, 05, 07, 08, 09 · **Requirements** APP-05, 10, 16, 17, 23 · **Rules** RR1, RR2, RR5, D1, D6, INV-4

**Goal.** Fix an issue directly. Each applied edit creates a new version and makes the check out of date; the issue counts as fixed only after the next check (UC-05).

## Main flow
**A. Remove a recipient.** The coordinator presses `Remove Sam Lee` in Sam's card. The system creates version 2 and shows "Sam Lee removed." with `Undo`. The chip is struck through, outside the To/CC list (OA1); the card says "Removed · The next check confirms it". Verdict: "Needs a new check · Recipients changed since the last check (version 1)".

**B. Reword a sentence.** The coordinator presses `Edit sentence`. The editor opens in the email under the sentence; the card says "Editing in the message." (TC6). It shows "Original" and "Suggested wording (you can edit it)". The coordinator presses `Apply wording`: a new version, the sentence is marked "Changed", and "Wording changed. Run the check again."

## Extensions
- A valid approval or a waiting request exists: before applying, "This change will make Dana Whitfield's approval outdated." or "This change will make your request to Dana Whitfield outdated. You'll need to ask again." (US2).
- `Undo`: the content goes back; with the same fingerprint the check is up to date again (U1, M4).
- No suggestion (the Warning): the field is "Wording (edit it to change it)" (US16).
- Text equal to the original, or `Cancel`: no new version ("No change made").

## Rules
- The suggestion is never applied without `Apply wording` (R6-F5).

## Acceptance criteria
- After `Remove Sam Lee`, Sam is not a recipient, `Undo` is offered and the status is "Needs a new check".
- The issue is not "Resolved" before the check.

**Simulation.** The suggestion "We are working towards completion by 30 June." is fixed sample text, not generated.
