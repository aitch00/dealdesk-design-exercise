# Comprehension test on the three-column page

The same test as in the [usability review](usability-review.md), repeated after the sample review became one page in three columns (decisions TC1–TC12): drafts list · the draft as an email · the "Review notes" panel. The goal was to see if the new structure still makes the message's state clear and, above all, if it helps people find the next action.

> **Limit.** The readers were new AI agents, not people. They had not seen the prototype, the specification or the code. The test shows a direction, not a measure: three readers per round, an instruction rewritten each round, no controlled comparison.

Dates: 12 November 2026 (rounds 1–3); the open points were fixed on 13 November (OA1–OA12).

## Method

- **States.** The same eight states as before, each captured as a screenshot at 1280 and 375 px, the visible text and the accessibility tree: 1 drafts list · 2 draft just opened · 3 Sam waiting, sentence open · 4 request waiting · 5 approved, then edited · 6 review unavailable · 7 ready to send · 8 sent.
- **Readers.** C1 read the screenshots at 1280 px, C2 the screenshots at 375 px, C3 only the accessibility trees at 1280 px, with no images, like a screen reader user.
- **Questions.** Q1 who will receive the message · Q2 what has been approved, and by whom · Q3 can it be sent, and why · Q4 what is the next action, and who takes it. For each answer: a quote from the screen and a confidence (certain, unsure, can't tell).
- **Key.** Answers were compared with the state model.
- **Score.** ✓ correct and certain · ~ correct but unsure · ✗ wrong · — no object. State 1 (no draft open) is not counted; Q4 does not count state 8 (nothing left to do). Q1 counts as correct if the reader says who is in To, who is in CC and Sam Lee's state.

## Round 1

| State | Q1 who receives | Q2 what is approved | Q3 can it be sent, why | Q4 next action |
|---|---|---|---|---|
| 2 · draft just opened | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ~ ~ ~ |
| 3 · Sam waiting, sentence open | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ~ ~ ✓ |
| 4 · request waiting | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 5 · approved, then edited | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 6 · review unavailable | ✓ ✓ ~ | ✓ ~ ✓ | ✓ ✓ ✓ | ~ ~ ✓ |
| 7 · ready to send | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ~ ✓ |
| 8 · sent | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | — |

What came out, and what changed:

- **Q1–Q3 held.** The state was as clear as in the earlier structure. To and CC read like an email.
- **Q4: with two actions together, the order was missing** (states 2, 3, 6). In state 2 the open card did not say it was the first step. In state 3 the coordinator's action and the deal owner's ("Answer as Dana Whitfield") looked equal. → The card that opens by itself now carries the label "Next" (TC4).
- **"Changed" was wrong.** In state 5 the signature was also marked "Changed", because the comparison went by paragraph position. → Only paragraphs changed or added in the comparison between versions are marked.
- **On a narrow screen the sheets over the draft were cut** (state 7, C2: "the send button is not visible"). → At 375 px the final review and the other sheets sit in the page flow.
- **Screen reader: words ran together.** In the list the time was read joined to the state, and "Changed" to the sentence. → Hidden " · " separators.

## Round 2, after the fixes

New readers, the same questions.

| State | Q1 who receives | Q2 what is approved | Q3 can it be sent, why | Q4 next action |
|---|---|---|---|---|
| 2 · draft just opened | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 3 · Sam waiting, sentence open | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ~ ~ |
| 4 · request waiting | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ~ ✓ |
| 5 · approved, then edited | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ~ ~ ~ |
| 6 · review unavailable | ✓ ✓ ~ | ✓ ✓ ~ | ✓ ✓ ✓ | ~ ~ ~ |
| 7 · ready to send | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 8 · sent | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | — |

| Question | Round 1 | Round 2 |
|---|---|---|
| Q1 | 20 of 21 | 20 of 21 |
| Q2 | 20 of 21 | 20 of 21 |
| Q3 | 21 of 21 | 21 of 21 |
| Q4 | 10 of 18 | 9 of 18 |

What it says:

- **"Next" works where the next action is a card:** state 2 went from 0 to 3 certain answers, state 7 from 2 to 3. In state 3 all three readers put the coordinator's action first; two were still unsure who presses "Answer as Dana Whitfield".
- **But it creates a conflict when a check must run first** (states 5 and 6, from 3 and 1 down to 0). The open card carried "Next" ("Remove Sam Lee", "Edit sentence"), while the verdict offered `Run check` or `Try again` as the main action. All three readers saw two competing calls. → When a check must run first (review unavailable, or an outdated request or approval), "Next" goes on `Run check` / `Try again`; the card stays open without the label. With the final review open, no "Next" label stays behind it.
- **The Q4 total did not improve** (10 → 9): the gain in states 2 and 7 was cancelled by the new conflict in states 5 and 6. Differences of one answer are within the variation between readers.

## Round 3, states 5 and 6 only

After the fix on the check, one new reader answered the same questions on states 5 and 6 (screenshots at 1280 px and accessibility trees).

| State | Q1 who receives | Q2 what is approved | Q3 can it be sent, why | Q4 next action |
|---|---|---|---|---|
| 5 · approved, then edited | ✓ | ~ | ✓ | ✓ |
| 6 · review unavailable | ✓ | ~ | ✓ | ~ |

- **State 5 solved.** The reader named `Run check` as the next action, with certainty, and knew Jordan does it. They were unsure only about the step after: "request again" did not say from whom.
- **State 6 still unsure, for a different reason.** "Next" was on `Try again`, but in the open card `Edit sentence` was also a filled button, and the two looked equal. → With review unavailable, the card's actions are not filled buttons; `Try again` is the only one. **This last fix was not read again by a new reader.**
- **Q2 unsure in both states, with correct answers.** In state 5 "Approval outdated" did not say which approval until you read the card. In state 6 the screen did not say there were no approvals; it simply showed none.

## Open points, and how they were resolved

Raised by the readers and fixed on 13 November (decisions OA1–OA12). **No new reader has read the fixed screens yet.**

| Observation | States | Resolution |
|---|---|---|
| The list's state icons have no legend; a tick can mean "approved" or "ready" | 1 | The state in words under each subject, chosen from three options (OA12) |
| "Answer as Dana Whitfield" mixes two roles: who presses it? | 3, 4 | The button sits in a simulation frame with "In the real tool, Dana Whitfield answers from their own inbox. Here you answer for them." (OA8) |
| Removed Sam stays in the CC row and is read inside CC | 6 | The chip stays visible but outside the list, read as "Removed from CC: Sam Lee" (OA1) |
| The state sentence is read twice in the accessibility tree | 2–7 | The live region empties 3 seconds after the announcement (OA2). To check with a real screen reader |
| Version numbers change between states | 4–8 | After a jump the note lists the versions made on the path: "On this path: version 2, Sam Lee removed · …" (OA11) |
| "Sent" and "No email was sent" together: to "who will receive?" the literal answer is "nobody" | 8 | "Sent (simulated) to Pat Morgan and Alex Rivera at ‹time› · Version 3 · No real email left the sample." (OA4) |
| "Things to try" and the `Simulation` button are not explained before opening | 3–6 | Under the button: "Demo controls: check outage, jumps, the deal owner's answer." (OA3) |
| The closed "Timing expectation" warning does not say the problem | 7 | The closed card says "Warning · Sets a timing expectation for the client · Doesn't block" (OA9) |
| "Approval outdated" does not say which approval; "request again" does not say from whom | 5 | "Approval for Sam Lee outdated"; "… request again from Dana Whitfield." (OA7) |
| "Check" and "review" used together | 5, 6 | "Check" for the automatic check ("Check unavailable", "Simulate check outage"), "review" for a person's final review (OA6) |
| `Open the final review` is active when sending is not possible | 5, 6 | With sending blocked the button says "See why you can't send" (OA10) |
| In the centre of the empty list view the note repeats the list's | 1 | The centre says "Select a draft to open it." (OA5) |
