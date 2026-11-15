# J2 — Dana Whitfield, Deal Owner: deciding an exception

> Task and error analysis. Taxonomy and severity: [README.md](README.md). Decisions: [decisions.md](../../decisions.md).

**Scope.** "An owner response may be simulated; no separate full owner application is required." [BRIEF] (CTX-14). This journey defines **what Jordan's request must contain** and what Dana's simulated view must show (D3, TC8).

**Goal.** Decide with full information if Sam Lee can receive the update, and own the decision. **Failure:** Dana approves without knowing what Sam will get, approves another version, or approves by mistake. Requirements: CTX-12–14, APP-05, APP-18, APP-19, APP-23, APP-31.

**Facts.** The coordinator "must be able to request that decision, but cannot approve their own exception." [BRIEF]. **Assumptions:** Dana decides from the phone between meetings; she may know Sam was cleared outside the workspace; approving Sam for **this message** does not add Sam to the team. [ASSUMPTION]

**Start.** Version 2 (sentence reworded, Sam present), check up to date, a Pending request from Jordan Blake at 10:42.

## Task analysis

```
0. Decide the Harbor exception correctly
   1. Recognise deal, requester and object
   2. Assess: the issue (always) · Jordan's reason · the content and its version
   3. Decide, with an optional note, and read the confirmation
   If the draft changes after the decision: V1.
```

## Steps

| Step | Error · type · severity | What the prototype does |
|---|---|---|
| 1 Open the request | Confuses the deal · mistake · **High** | The request is an email whose subject starts with the deal: "Project Harbor · Exception request · Sam Lee as recipient", with "From" and "To" |
| 2a Read the issue ("approving adds Sam to the deal") | Overrates the scope · mistake · Medium | "If approved, Sam Lee can receive this message (version 2) only. It doesn't add Sam to the deal team." [PATTERN R2-F13] |
| 2b Read Jordan's note | Approves out of trust · complacency · **High** | The note is labelled "Jordan's reason", apart from the facts; "You're deciding as deal owner." [PATTERN R1-F9, R3-F4] |
| 2c Read the content | Approves without reading · complacency · Medium | A preview "Message (version 2)" inside the request; Dana does not open the draft [PATTERN R1-F6] |
| 3a Approve or decline | Taps the wrong button · slip · **High** | Full labels: `Approve exception for Sam Lee` · `Decline`; "Note (optional)". A wrong decision is corrected by a new one; both stay (U3) [PATTERN R6] |
| 3b Confirmation | Surprised by a second request · Medium | "Approved for version 2 at 10:51. If Jordan edits the message, you'll be asked again." or "Declined at 10:55." [PATTERN R2-F1] |

In the sample the evaluator plays Dana. "Answer as Dana Whitfield" puts the page in the background and shows the request as Dana reads it, under "Simulation" and "Acting as Dana Whitfield (deal owner)", with "In the real tool, Dana Whitfield answers from their own inbox. Here you answer for them." (TC8, OA8).

## Variants

- **V1 New request after an edit.** *"I already approved it"* (complacency, Medium): the request opens on the difference, "Changed since you approved version 2: ‹changes›" [PATTERN R2-F8, R5-F2].
- **V2 Owner away** (out of scope). The request stays Pending; Jordan cannot approve (RR3). A delegate owner needs a firm policy [PATTERN R1-F4]. Listed as a limit.

## Critical moments

| ID | Moment | Pass criterion |
|---|---|---|
| J2-MC1 | Reading the request | Dana says what she approves: version 2 of this message, Sam not added to the team |
| J2-MC2 | New request | Dana names the change before deciding |

## Opportunities

J2-OP-01 deal, type and object in the title · OP-02 scope stated · OP-03 reason apart from facts, decider named · OP-04 preview of the version · OP-05 `Approve exception for [object]` and `Decline`, labelled simulation · OP-06 confirmation with version and time · OP-07 new request opens on the difference. OP-01 to 04 are requirements of the request Jordan sends (J1-OP-14).

**[TO RESEARCH]** What does an owner need to trust a request without opening the message? Are exceptions delegated? Are repeated requests useful or noise? Should an approval be able to add Sam to the team?
