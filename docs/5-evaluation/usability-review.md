# Usability review (simulated)

**This was an expert review simulated by AI agents. No person used the prototype.** Tests with people and with a real screen reader were not done; they are still open. The results below show whether the information is on screen and is clear. They do not show whether a busy person would see it.

- Date: 10 November 2026.
- Object: the sample review (`prototype/app.html`), before the three-column page. The homepage was out of scope.
- Outcome: all ten fixes were applied the same day (decisions US1–US11), and four more after a repeated comprehension test (US12–US15).

## In short

- **Sending was never wrong.** In no state was `Send (simulated)` available when it should not be. To "can it be sent now, and why?" the blind readers answered correctly 21 times out of 21.
- **The serious problems were in what happens after an action:** links that left the draft, a request that became outdated without warning, text lost when leaving edit mode, and Sam's row that, after the first decision, no longer said why or offered removal.
- **The demo confused the reviewer in three places:** the "from the start" entry showed a saved state, the Simulation panel stayed over the view after a jump on a narrow screen, and it was not clear how to leave the "review unavailable" state.
- **The weakest question was "who receives the message".** Never wrong, but unsure or partial in 12 of 21 answers: the recipients had no label, and the screen did not say on whose behalf you act.

## Method

Three separate sessions, run by agents in parallel.

| Session | Method | Problems |
|---|---|---|
| S1 blind | First use without documentation; comprehension test with three new readers | 18 |
| S2 expert | Cognitive walkthrough as Jordan; two independent heuristic evaluations; analysis of the state language | 43 |
| S3 accessibility and demo | Keyboard only, accessibility tree, text at 200%, forced colours, 320 px; the demo layer; entry from the homepage | 24 |

Severity: no 4; nine problems of severity 3 across the sessions, which merged into the first five fixes. The 85 raw problems were grouped, and each group cites its source IDs. Every fix in the backlog rests on a problem reproduced again from zero with a separate script (checks V01–V11; all confirmed).

**The comprehension test.** Three new readers answered four questions in seven states: C1 read screenshots at 1280 px, C2 screenshots at 375 px, C3 only the accessibility tree. Answers were graded against the state model, not against my opinion.

- Q1 Who will receive the message?
- Q2 What has been approved, and by whom?
- Q3 Can it be sent now, and why?
- Q4 What is the next action?

Key: ✓ correct and certain · ~ correct but unsure · ◐ partial · ? "can't tell" · — not applicable. Order in each cell: C1 C2 C3.

## Before the fixes

| State | Q1 who receives | Q2 what is approved | Q3 can it be sent, why | Q4 next action |
|---|---|---|---|---|
| 2 · draft just opened | ~ ✓ ~ | ✓ ~ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 3 · Sam waiting, sentence open | ✓ ◐ ◐ | ✓ ✓ ✓ | ✓ ✓ ✓ | ~ ✓ ~ |
| 4 · request waiting | ✓ ◐ ◐ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 5 · approved, then edited | ◐ ~ ◐ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 6 · review unavailable | ✓ ✓ ~ | ✓ ? ? | ✓ ✓ ✓ | ~ ✓ ~ |
| 7 · ready to send | ✓ ✓ ✓ | ? ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 8 · sent | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | — |

What the grading showed:

- **Q1.** In states 3–5 Sam Lee is still in CC in the current version. Six answers said "Pat and Alex, Sam only if approved": they saw the condition but not that Sam was still in the draft. In state 2 two readers guessed the list was the recipients "because there are addresses": a label was missing.
- **Q2.** In state 7 the title "Approved" above "No exceptions used" led one reader to "can't tell".
- **Q3.** Always right. In state 6 two readers noticed that "2 blocking" did not match what they saw (Sam was already removed).
- **Q4.** Unsure where there were two actions and the screen did not say the order (state 3), and where the way out was not in the product (state 6).
- **Outside the questions.** In 10 answers the readers wrote that the user "has no name": nothing said you act as Jordan Blake, coordinator.

## The fixes

| # | Fix | Decision |
|---|---|---|
| 1 | Links inside the draft stay in the draft ("Skip to draft", the `[n]` markers) | US1 |
| 2 | The same warning before any edit that makes a request outdated | US2 |
| 3 | Leaving the draft with an open edit keeps it | US3 |
| 4 | A recipient row outside the team always says why and always offers removal | US4 |
| 5 | "From the start" starts from the start (`app.html#/start`); "Each jump restarts the sample." | US5 |
| 6 | "Review unavailable" says where the recovery is simulated | US6 |
| 7 | The draft says who receives and on whose behalf you act: "To" and "CC" on each row, "You're working as Jordan Blake, deal coordinator." | US7 |
| 8 | Four approved wordings reopened, for example "Check current" became "Check up to date" | US8 |
| 9 | In the Simulation panel, Dana's action no longer weighs more than Jordan's | US9 |
| 10 | Keyboard and accessible names agree ("Edit sentence n", `Esc`, a visible focus ring) | US10 |
| — | Forced colours | US11 |

Not done, on purpose: an `Undo` after saving, a reason in "Request again", more detail in the record. These are new features, and the brief asks for a concise record.

## After the fixes: the test repeated

Three new readers, the same eight states, captured with the same script from the fixed prototype.

| State | Q1 who receives | Q2 what is approved | Q3 can it be sent, why | Q4 next action |
|---|---|---|---|---|
| 2 · draft just opened | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ~ ✓ ~ |
| 3 · Sam waiting, sentence open | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ~ ~ ~ |
| 4 · request waiting | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 5 · approved, then edited | ~ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 6 · review unavailable | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 7 · ready to send | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ |
| 8 · sent | ✓ ✓ ✓ | ✓ ✓ ✓ | ✓ ✓ ✓ | — |

| Question | Correct and certain, before | Correct and certain, after |
|---|---|---|
| Q1 | 9 of 21 | 20 of 21 |
| Q2 | 17 of 21 | 21 of 21 |
| Q3 | 21 of 21 | 21 of 21 |
| Q4 | 14 of 18 | 13 of 18 |

Rule for Q1: an answer is correct and certain if it says who is in To, who is in CC and Sam Lee's state, as the model gives them. Saying that it is not known if Sam will *finally* receive the message is not counted as doubt: it is open in the model too.

- **Q1 and Q2 improved.** All readers told To from CC, and all named Jordan Blake as the user.
- **Q4 did not improve.** Where there were two actions (states 2 and 3), readers said they did not know which came first. State 6 was now certain for all. A difference of one answer is within the variation between readers.
- **This is not a controlled comparison:** different readers, a rewritten instruction, three readers per condition. It shows a direction, not a measure.

## What the new readers still raised

Three readers out of three raised four points, and I fixed them:

| Point | Decision | Change |
|---|---|---|
| "Review before sending" looked active next to "Can't send yet" | US12 | While sending is blocked, the button says what it does (now "See why you can't send", OA10) |
| The Warning did not say who confirms | US13 | "Sets a timing expectation for the client. It doesn't block sending: confirm the timing yourself before you send." |
| With one issue open and one waiting, the reason at the bottom named only one | US14 | "Also waiting for Dana Whitfield's decision on Sam Lee." |
| "At the last check (version 2): 1 blocking" did not say which | US15 | "Still open from the last check (version 2): 1 blocking (Sam Lee) · 1 warning" |

These four were not read again by new readers. The order of the two actions in state 3 stayed open, and led to the "Next" label on the three-column page ([comprehension test](comprehension-test.md)).

## Still not tested

- **People.** No usability or comprehension test with users. The protocol is ready ([test protocol](test-protocol.md)).
- **Real screen readers, voice control, Safari, Firefox, touch devices.** Announcements were inferred from the DOM and Chromium's accessibility tree.
- **Isolation of the blind session.** The rule "do not read the documentation" was an instruction to the agent, not a technical block.
- Forced colours were checked only in Chromium's emulation.
