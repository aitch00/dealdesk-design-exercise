# UC-02 — Read the context and status of a draft

**Actor** coordinator (sub-function) · **Origin** J1-1.2, 2.1, 3.1, 3.3, J1-OP-02, 03, 04, 06, 08 · **Requirements** APP-03, 04, 06, 21, 22, 24, 34, CTX-18–20 · **Rules** D2, D5, D6, D7, TC3, TC4, INV-6, INV-7

**Goal.** Say the project, the recipients, the status and what stops the send. No old result is ever shown as current (INV-6).

## Main flow
1. **System** shows the draft as an email. A recipient off the team has a red border; a flagged sentence a red underline and a number; a Warning a dashed grey underline.
2. **System** shows "Review notes" in a fixed order: the verdict, with its action and the only live region; the context; issue cards grouped by who must act, under counts such as "1 blocking", "1 waiting for decision", "1 approved", "1 warning"; then "Resolved" (TC3, UF26).
3. **System** opens the first card the coordinator must act on and marks it "Next" (TC4). Clicking a chip or a sentence opens its card (TC5).
4. **System** shows the bottom bar: `Edit message`, the reason if sending is blocked, and "See why you can't send" or `Review before sending` (TC12, OA10).

## Extensions
- **1a.** Check out of date: "Needs a new check · Recipients changed since the last check (version 1)"; the cards show "Still open from the last check (version 1, may be out of date):" (US15).
- **1b.** Check unavailable: "Check unavailable · Your draft is saved. Sending stays blocked until the check runs."
- **2a.** One issue to fix and one waiting: "Blocked · Check up to date · 1 blocking issue · 1 waiting for Dana Whitfield · Can't send yet" (UF26).
- **3a.** A Warning card has only `Edit sentence` and, closed, says "Warning · Sets a timing expectation for the client · Doesn't block" (D2, OA9).

## Rules
- The severity word comes first: "Blocking · Not on the deal team · …", "Blocking · Flagged wording · …" (D7, UF29).

## Acceptance criteria
- On opening: "Blocked · Check up to date · 2 blocking issues · Can't send yet".
- Pat and Alex read as Notes; Sam's card names Corvane Holdings and has no "Ignore".
