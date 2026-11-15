# Test protocol for real people

**This protocol has NOT been run.** No person has used the prototype yet. The tests so far used AI readers ([usability review](usability-review.md), [comprehension test](comprehension-test.md)). This page is the plan for the first tests with people. The pass levels are proposals, written before any result, so that the results cannot move them.

## Common rules

- **No explanation before the test.** Give the link and the task, nothing more.
- **Thresholds are fixed in advance**, as written here.
- **Note what the person says and does**, not what we think they meant.
- **Say who they were.** With proxies (see below), the test shows that a careful reader understands the page, not that it convinces a buyer. Write the results that way.
- Record the screen and voice only with consent. Use the sample data only; no real client content.

## Part 1 · The sample review: who receives, what is approved, can it be sent

This answers the brief's request to "propose how to test whether someone understands who will receive the message, what has been approved and why sending is or is not allowed" (APP-28).

**People.** 5–8 people who send emails to clients at work. Not designers, and nobody who knows the project.

**Task.** Open the sample review and "prepare this message for sending". Then show eight fixed states, one at a time. Each state has a starting point in the prototype, so every person sees exactly the same screen.

| # | State | Starting point (after `/prototype/`) |
|---|---|---|
| 1 | Drafts list, nothing open | `app.html#/start` (narrow screen) |
| 2 | Draft just opened: Sam flagged, nothing changed yet | `app.html#/jump/flagged` |
| 3 | Sam escalated, sentence still open | `app.html#/jump/escalated-first` |
| 4 | Exception request pending | `app.html#/jump/pending` |
| 5 | Approved, then edited | `app.html#/jump/edited-after-approval` |
| 6 | Check not available | `app.html#/jump/review-unavailable` |
| 7 | Ready to send | `app.html#/jump/ready` |
| 8 | Sent | `app.html#/jump/sent` |

**Four questions in each state:**

1. Who will receive this message?
2. What has been approved, and by whom?
3. Can it be sent now, and why?
4. What is the next action, and who takes it?

For each answer, ask the person how sure they are (certain, unsure, can't tell).

**Grading against the model.** The answer key is the state model of the prototype, not my opinion. Each answer is graded as:

| Grade | Meaning |
|---|---|
| Correct and certain | Matches the model, and the person is sure |
| Correct but unsure | Matches the model, but the person is not sure |
| Partial | Part of the answer is missing |
| Wrong | Does not match the model |

**A correct answer that the person is unsure of counts as a problem.** For question 1, the answer must say who is in To, who is in CC and Sam Lee's state. Saying that it is not known if Sam will *finally* receive the message is not a doubt: it is open in the model too. State 1 is not counted (no message is open); question 4 is not counted in state 8 (nothing left to do).

**Proposed pass level:** questions 1–3 correct and certain in **at least 90%** of answers.

Question 4 has no pass level yet. It was the weakest question with the AI readers; the results will show where the order of actions is still unclear.

**Watch also:** where the person hesitates, the words they use for the states, whether they find the reason next to the blocked send button, and whether they confuse the simulation (the yellow notes) with the product.

## Part 2 · The homepage: five seconds and a retelling

**People.** 3–5 people per version. Profile: someone who decides processes or tools in a professional-services firm (advisory, legal, accounting). Acceptable proxy: someone who writes emails to clients at work. Excluded: designers and people who know the project.

| # | Task | What to ask | Pass level |
|---|---|---|---|
| T1 | **Five seconds**, on the first screen (desktop and mobile, different people) | After 5 s: "What is it? Who is it for?" | Category **and** customer said in their own words by at least 4 of 5 |
| T2 | First click | "You want to understand what it does. What do you press?" | No threshold. Count how many press "Take a second look" without being told. This decides if the summary line above the sample draft must work alone, and if "Take a second look" can stay a secondary button (V18, RU4) |
| T3 | **Retelling**, after scrolling the page | "Tell me in one sentence, as you would tell a colleague" | The sentence has the idea "it looks ready, but it isn't" or "it checks who it's going to and what it promises before it leaves", from at least 4 of 5. Grid: 2 points for the difference between looking ready and being ready; 1 for the function only; 0 for neither |
| T4 | Comprehension, without going back | (a) Name two things DealDesk does not do. (b) Who can approve an exception? (c) What happens if the draft changes after approval? (d) Why does "pending" not allow sending? | (a) two correct limits; (b) "the deal owner", not the coordinator; (c) the approval no longer covers the new version; (d) pending is not an approval |
| T5 | To the partners | "In one sentence, how would you describe it to your partners?" | It says what it checks **and** when it asks you to stop |
| T6 | Highlighter, on the printed page | Green: clear and believable. Red: unclear, doubtful or exaggerated | Every sentence marked red by 2 people or more is rewritten |

**Brand check, with T1.** Also ask: "What kind of product is this?" If more than one person in five answers "law firm" or "publishing", the sepia direction goes back to direction 1 ([visual identity](../3-brand/visual-identity.md)). The same five seconds can show if the hero title, at weight 400, is read at all; if not, it moves to 500.

**Static against interactive.** Half the people see the homepage without JavaScript (the sample draft already marked, the cards as plain links); half see the interactive version. Same tasks T3 and T4. With 5 people per version the result shows a direction and proves nothing, and must be written that way. It is the only way to know if the interactions help understanding or only decorate it.

## Part 3 · Also still to do

- A **real screen reader** (VoiceOver or NVDA) on the brief's scenario.
- **Safari, Firefox** and a real phone. Only Chromium was used so far.
- The published link opened from a **private window**.

## What a result would change

The protocol is built so that each result has a decision attached: T2 decides the weight of "Take a second look"; T1 decides the brand direction and the title weight; questions 1–3 decide whether the state language holds; T6 decides which homepage sentences are rewritten. Until it runs, those decisions stay open.
