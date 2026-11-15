# UC-05 — Run the check

**Actor** coordinator; the check service (simulated) · **Origin** J1-4.1, 4.2, V4.1, J1-OP-10, J1-OP-19 · **Requirements** APP-06, 07, 12, 20, 27 · **Rules** RR5, RR6, D1, D1b, D4, D7, U4, INV-6

**Goal.** Get a check on the current content and see what changed. `Run check` is offered only when the check is not run, out of date or unavailable (U4).

## Main flow
1. **Coordinator** presses `Run check` (marked "Next" when it is the next action, TC4).
2. **System** shows "Checking…", checks recipients against the deal team (deterministic) and wording against the patterns (D7).
3. **System** compares with the previous check: issues gone are fixed, new ones open, approved on this content approved, declined with the object present declined.
4. **System** shows the result in the verdict, for example "Ready to send · Check up to date (version 3) · 1 warning unchanged", with "Checked at 10:36 · version 3". Fixed issues move to "Resolved": "Sam Lee — removed (version 2)", "Guaranteed completion — reworded (version 3)".

## Extensions
- **2a.** Service down (outage on): "Check unavailable · Your draft is saved. Sending stays blocked until the check runs." and "In this sample, switch off Simulate check outage in the Simulation panel, then try again." Actions `Try again` · `Keep editing` · `Back to drafts`. Old issues: "From an earlier check (version 2). May be out of date."
- **2b.** `Try again` while still down: same result, not repeated (R5-F2).

## Rules
- No timeout: a check stays up to date until the content changes (D4).
- While unavailable, sending is blocked with no shortcut (RR6).

## Acceptance criteria
- With Sam removed and the sentence reworded, both issues are resolved and the status is "Ready to send".
- With the outage on, the status is "Check unavailable" and no old issue looks current.

**Simulation.** Fixed sample rules, not a real analysis.
