# UC-06 — Ask the owner for an exception

**Actor** coordinator · **Origin** J1-2.2b, 3.2b, V1, V3.2, J2, J1-OP-14, 18, 22, J2-OP-01–04, 07 · **Requirements** APP-05, 18, 23, CTX-13 · **Rules** RR1–RR4, D1, D1b, U7, TC7, INV-2, INV-3

**Precondition.** Check up to date; a Blocking issue that is open, declined or with an outdated request; no waiting request on it. Otherwise the card says "You can request an exception once the check is up to date." (US4).

## Main flow
1. **Coordinator** presses `Request owner exception` in the card.
2. **System** lays a second email over the deal email, with the same header and bottom bar (TC7): subject "Project Harbor · Exception request · Sam Lee as recipient", "To: Dana Whitfield (deal owner)", the rule "Not on the deal team", the scope "If approved, Sam Lee can receive this message (version 2) only. It doesn't add Sam to the deal team." and the quoted message "Message (version 2)".
3. **System** warns if another Blocking can still be fixed by an edit: "1 blocking issue can still be fixed by editing. Fix it first so Dana approves the final version." The coordinator can go on.
4. **Coordinator** fills "Why does Sam Lee need this message?" and presses `Send request`.
5. **System** creates a Pending request. Sam's card: "Pending · Requested from Dana Whitfield at 10:42 · Not approved yet. Sending stays blocked."

## Extensions
- `Request again` after an outdated approval: the request includes "Changed since Dana approved version 2", which cannot be removed; the earlier reason is prefilled.
- A sentence: subject "Project Harbor · Exception request · Wording: 'Completion is guaranteed by 30 June.'", scope "If approved, this sentence can be sent in version 2 only.", field "Why does this sentence need to stay?".
- Empty reason: "Add a reason so Dana can decide." in the field; nothing is sent. `Cancel` sends nothing.

## Rules
- The coordinator can request, never approve: no approve control anywhere in Jordan's view (RR3, INV-2).
- The request is tied to the current content (D1); Pending is not an approval (RR4).
- A waiting request cannot be withdrawn; an edit makes it outdated (U7).

## Acceptance criteria
- The request shows deal, owner, rule, scope and version, and no approve control.
- An empty reason blocks the request with an error in the field.
