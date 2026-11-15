# UC-10 — Send (simulated)

**Actor** coordinator · **Origin** J1-6.1, J1-OP-12 · **Requirements** APP-08, 11, 20, 29 · **Rules** RR4, RR6, RR7, D5, INV-1, INV-10

**Goal.** Send only when every condition holds. No real email ever leaves (RR7).

## Main flow
1. **Coordinator** presses `Send (simulated)` in the final review (UC-09).
2. **System** calculates `canSend` again at that moment.
3. **System** creates the send record; the draft is sent and can no longer be edited.
4. **System** opens the record (UC-11) and announces "Sent (simulated)."

## Extensions
- `canSend` is false: the button is `aria-disabled`, stays reachable with Tab, and pressing it sends nothing; focus stays and the reason next to it is announced (D5).
- `canSend` became false after the view opened (for example the outage was switched on): nothing is sent; the reason is shown and announced.

## Rules
- The block comes from the model's logic, not from `aria-disabled`.
- After the send, edits, checks and requests are refused (UC-11).

## Acceptance criteria
- With `canSend` true, the record opens and the draft is read only.
- With `canSend` false, no record is created and the reason is heard.

**Out of scope.** A delayed send that can be cancelled.
