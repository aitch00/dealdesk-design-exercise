# UC-11 — Read the review record

**Actor** coordinator; the buyer, as evidence · **Origin** J1-6.2, J1-OP-13 · **Requirements** APP-09, CTX-06 · **Rules** RR7, OA4, INV-8, INV-10

**Goal.** Rebuild what left, to whom, when, and who decided what on which version. The record is read only.

## Main flow
1. **System** shows "Review record · Project Harbor" and the line "Sent (simulated) to Pat Morgan and Alex Rivera at 11:05 · Version 3 · No real email left the sample." The line names the recipients so "no real email" is not read as "nobody" (OA4).
2. **"To"**: Pat Morgan, Alex Rivera. **"Removed"**: "Sam Lee · Removed in version 2".
3. **"Issues and outcomes"**: "Sam Lee: removed (version 2)" · "Guaranteed completion: reworded (version 3)" · "Timing expectation: warning unchanged"; or "Sam Lee: approved by Dana Whitfield (version 2)".
4. **"Decisions"**: "No exceptions used", or "Sam Lee: approved by Dana Whitfield, 10:51, for version 2" / "Sam Lee: declined by Dana Whitfield, 10:55, for version 2", in order.
5. **Coordinator** opens `View sent message` ("Sent message (version 3)"), goes `Back to drafts` or uses `Restart sample`.

## Rules
- At least event, time, author, outcome and version for each decision (R1-F5, INV-8).
- It is concise (APP-09), not a full audit log (APP-30).

## Acceptance criteria
- The record shows time, version, recipients, each issue's outcome and each decision with author, time and version.
- A sent draft opened from the list opens the record, not the editor.

**Out of scope.** Exporting the record.
