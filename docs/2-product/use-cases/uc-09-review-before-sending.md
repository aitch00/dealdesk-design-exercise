# UC-09 — Review the message before sending

**Actor** coordinator · **Origin** J1-5.1–5.3, J1-OP-11, J1-OP-12 · **Requirements** APP-07, 28, CTX-08 · **Rules** RR4, RR6, D1, D5, U6, UF28, INV-1

**Goal.** Answer the three questions: who receives it, what is approved, can I send and why. The view opens in every state (U6); it changes nothing.

## Main flow
1. **Coordinator** presses `Review before sending`, or "See why you can't send" while sending is blocked (OA10).
2. **System** lays the view "Review before sending · Project Harbor" over the page.
3. **"Going to"**: "To" and "CC" rows with name, address, organisation and role. A flagged recipient shows "Not on the deal team" and the state of its exception. Removed people: "Removed in version 2".
4. **"Message"**: the final text, read only. Changed sentences are marked "Changed", the Warning "Warning · unchanged", a Blocking sentence still present with its state ("Blocking", "Pending", "Approved for version 2", "Approved on version 2 · doesn't cover version 3", "Declined").
5. **"Exceptions"**: "Approved", for example "Sam Lee by Dana Whitfield, 10:51, for version 2", or "No exceptions used"; requests not approved for this version under "Not approved"; if none is approved, "Nothing approved for version 3." (US8, UF28).
6. **Verdict**: "You can send" with "Check up to date (version 3), no blocking issues open.", or "You can't send yet" with the reason and "Fix this in the draft".
7. **System** shows "Automated checks can miss things. Read the final message before sending.", `Send (simulated)` and `Back to draft`.

## Extensions
- The check is out of date: "From an earlier check (version 2). May be out of date." under the title.

## Rules
- No generic "Are you sure?": the content is the confirmation (R6-F11). The verdict uses the same `canSend` as the send.

## Acceptance criteria
- With Sam removed, Sam appears only as "Removed in version 2".
- With a Pending request: "Can't send yet: waiting for Dana Whitfield's decision on Sam Lee.", and Sam under "Not approved".
