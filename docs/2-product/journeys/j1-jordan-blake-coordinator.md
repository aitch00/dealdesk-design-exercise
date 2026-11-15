# J1 — Jordan Blake, Deal Coordinator: from draft to send

> Task and error analysis. Taxonomy and severity: [README.md](README.md). Rules: [review-rules.md](../review-rules.md). Decisions: [decisions.md](../../decisions.md).

**Goal.** Send the Project Harbor update only to authorised people, with words the firm can stand behind. **Success:** simulated send with `canSend` true, and Jordan can say who received it, what was approved and why sending was allowed. **Failure:** the message leaves, or Jordan believes it can leave, with Sam Lee or "guaranteed" not approved, an outdated check or a Pending decision. Requirements: CTX-09–20, APP-01–37.

**Facts.** Coordinators "may accidentally assume someone belongs on a particular deal because they work for the same client." [BRIEF]. **Assumptions:** Jordan is often interrupted; the team list is reliable, or the recipient check cannot be deterministic (D7); a "Project Harrow" draft exists. [ASSUMPTION]

## Task analysis

```
0. Send the Harbor update to the right people
   1. Open the draft (1.1 pick it · 1.2 read project, recipients, status)
   2. Recipient issue (2.1 understand · 2.2a remove Sam | 2.2b ask Dana → V1)
   3. Wording (3.1 understand · 3.2a reword | 3.2b ask Dana → V1 · 3.3 weigh the Warning)
   4. Check again (4.1 notice it is out of date · 4.2 run it)
   5. Final review (5.1 recipients · 5.2 text · 5.3 approvals)
   6. Send and read the record
   Plan: 1 → 2, 3 in any order → 4 after any edit → 5 → 6. Any later edit → 4 (V3).
```

## Steps

| Step | Error · type · severity | What the prototype does |
|---|---|---|
| 1.1 Pick the draft | Opens Harrow · slip · Medium | The list is grouped by deal, each subject with its status in words; the open draft is titled "Project Harbor" |
| 1.2 Read the status | Reads "checked" as "ready" · mode error · Low | The verdict separates the two: "Blocked · Check up to date · 2 blocking issues · Can't send yet". The bottom bar repeats the reason (D5) [PATTERN R6-F2] |
| 2.1 Why Sam? ("works for Corvane, so on the deal" [BRIEF]) | Treats it as a false positive · mistake · **High** | Sam's card opens first, marked "Next": "Blocking · Not on the deal team · Works at Corvane Holdings, the client, but isn't listed on the Project Harbor deal team." Actions `Remove Sam Lee` · `Request owner exception`; no "Ignore". Pat and Alex show "On deal team" with their role [PATTERN R3-F1, R3-F5] |
| 2.2a Remove Sam | Removes Alex · slip · Medium; thinks it is solved · stale state · Low | `Remove Sam Lee` names Sam; "Sam Lee removed." with `Undo`. Card: "Removed · The next check confirms it" |
| 3.1 Why "guaranteed"? | Keeps it, "the date is true" · mistake; or "only a check" · alert fatigue · **High** | Red underline and a number, linked to "Blocking · Flagged wording · States completion as certain. The firm can't guarantee deal outcomes." It names the certainty, not the date (D7) [PATTERN R5-F9, R5-F4] |
| 3.2a Reword | Accepts without reading · automation bias · Medium | The editor opens in the email under the sentence: "Original" and "Suggested wording (you can edit it)"; `Apply wording`, not "Accept". side by side, not judging the text first, which lowers satisfaction [PATTERN R6-F5] |
| 3.3 The Warning | Treats it as Blocking, or learns to ignore all · alert fatigue · Medium | Dashed grey card: "Warning · Sets a timing expectation for the client · Doesn't block". Only `Edit sentence`; counted apart [PATTERN R5-F3, R5-F11] |
| 4.1 Out of date | Does not check again · lapse · Low (RR5 blocks) | "Needs a new check · Recipients and wording changed since the last check (version 1)", "What changed since the last check", `Run check` marked "Next". No timeout (D4) [PATTERN R6-F7, R2-F1] |
| 4.2 Run the check | Rereads every warning · alert fatigue · Low | "Checking…", then "Ready to send · Check up to date (version 3) · 1 warning unchanged". Fixed issues go to "Resolved" [PATTERN R5-F2] |
| 5.1–5.2 Final review | Scrolls without reading · complacency · **High** | "Going to" with name, address, organisation and role; "Removed in version 2"; "Changed" and "Warning · unchanged" in the text; "Automated checks can miss things. Read the final message before sending." [PATTERN R6-F11] |
| 5.3 Why can I send? | Cannot say · mode error · Low | "Exceptions: No exceptions used"; "You can send" · "Check up to date (version 3), no blocking issues open." [PATTERN R1-F5, R1-F6] |
| 6 Send and record | Thinks a real email left · mistake · Low | `Send (simulated)`; the record names the recipients and says "No real email left the sample." (OA4) |

## Variants

- **V1 Exception for Sam.** *Vague request* (mistake, Medium): a prefilled second email; "Why does Sam Lee need this message?" is required; Jordan has no approve control (RR3). *"I asked, so it's fine"* (mode error, **High**): "Pending · Requested from Dana Whitfield at 10:42 · Not approved yet. Sending stays blocked." with a clock icon [PATTERN R3-F7]. *"Approved, so I can edit"* (stale state): "This change will make Dana Whitfield's approval outdated." before an edit. Asking before rewording costs a second decision, so the form says "1 blocking issue can still be fixed by editing. Fix it first so Dana approves the final version." (SC-7).
- **V2 Dana declines.** *Asks again with a new note* (mistake, Medium): "Can't send yet: Dana Whitfield declined the exception for Sam Lee. Remove Sam Lee to continue."; `Remove Sam Lee` primary, `Request again` secondary (D1b) [PATTERN R2-F4].
- **V3 Edit after approval.** *Still ready* (stale state, **High** without the block): "Approved on version 2 · doesn't cover version 3"; the new request carries "Changed since Dana approved version 2" [PATTERN R2-F1, R2-F9].
- **V4 Check unavailable.** *Trusts the old result* (stale state, **High** without the block): "Check unavailable · Your draft is saved. Sending stays blocked until the check runs." Old issues: "From an earlier check (version 2). May be out of date." No shortcut [PATTERN R6-F7, R3-F10].
- **V5 Interruption.** *Forgets what was missing* (lapse, Low): "Where you left off: waiting for Dana Whitfield since 10:42." or "Since you left: Dana Whitfield approved Sam Lee (10:51)." (D8) [PATTERN R6-F10].

## Critical moments

J1-MC1 opening: Jordan names the project and the 2 reasons sending is blocked. J1-MC2 request sent: Jordan says "not approved yet". J1-MC3 final review: Jordan answers the three questions from that view only. J1-MC4 edit after approval: Jordan says what changed and what to redo.

## Opportunities

J1-OP-01 to OP-22, one per countermeasure above, in step order: list and verdict (01–02), recipients (03–05), wording (06–08), check (09–10), final review, send and record (11–13), request and decisions (14–18), unavailable (19), resume (20), simulation (21), early request warning (22).

**[TO RESEARCH]** Who keeps the team list? Is Pending clear without colour? Does D1 cause too many repeated requests?
