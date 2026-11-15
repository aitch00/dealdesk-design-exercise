# Structure: from separate screens to one page

This file explains how the sample review got its shape. Until 12 November 2026 the app had separate screens. Now it is one page in three columns: the list of drafts, the draft as an email, and the Review notes. This file gives the diagnosis that led to the change, the layered proposal, the comparison between two versions of the three columns, the narrow-screen layout, and the reasons. What each screen shows today is in [screens-and-states.md](screens-and-states.md).

## 1. The starting point: four screens and three panels

The first specification had the homepage and four app screens (APP-32 asks for three to five key screens or states), plus three panels.

| ID | Screen or panel | Address |
|---|---|---|
| H | Homepage | `index.html` |
| A1 | Drafts list | `app.html#/drafts` |
| A2 | Draft review (the main view) | `app.html#/drafts/harbor` |
| A3 | Review before sending | `app.html#/drafts/harbor/review` |
| A4 | Review record | `app.html#/drafts/harbor/record` |
| B | Sample review banner | every app view |
| P1 | Exception request | a panel in A2 |
| P2 | Simulation controls | a column on the right, or a panel from the bottom |

The path was linear: A1 → A2 ⇄ A3 → A4, plus labelled jumps to a state. Almost all the work happened in A2: 13 actions, 7 draft states, an edit mode, an inline sentence editor and a panel. A2 had six regions: R1 header, R2 overall state, R3 recipients, R4 message, R5 issue summary, R6 send area.

Every visible state comes from `Draft.status`. One idea holds the states together: **who must act**. Blocking means the coordinator acts. Pending means the deal owner acts. Approved means no one acts (UF26, UF29).

## 2. Diagnosis: everything was on the same level

A screenshot of A2 at 1280 px, in the state "Sam escalated, wording still open", showed five problems.

1. **The banner gave the same weight to three different things**: that this is a demo, who you are, and where a jump took you. It put them next to the navigation buttons.
2. **The verdict and its consequence were far apart.** The answer to "can I send?" was in R2, at the top. The button and its reason were in R6, at the bottom, after the whole message. Both were white cards like all the others.
3. **R5 repeated R2.** "1 blocking · 1 waiting for decision · 1 warning" said again what the state phrase said, and did not lead to any issue.
4. **The demo column was the densest part of the page.** P2 mixed another actor (Dana, who decides on the exception) with the demo tools (outage, ticks, jumps). It was open on first visit and taller than the main column.
5. **Issues were not ordered by who must act.** Sam's row, waiting for Dana, looked as important as the blocking sentence, which the coordinator had to fix.

The causes were in the layout, not in the words. The usability review (US1–US15) had already fixed words and conditions. Understanding of the state was already good: 21 correct answers out of 21 to "can it be sent?". The cost was in **finding** the next thing to do and in **telling apart** the product and the demo.

## 3. The layered proposal

The first answer was a hierarchy of five layers. It was a proposal, not a decision.

| Layer | Question it answers | Content | Treatment |
|---|---|---|---|
| L0 · Demo frame | "Where am I, what can I try?" | B, plus the service switch, things to try and jumps of P2 | A thin line at the top, styled apart from the product; the tools in a closed drawer |
| L1 · Verdict | "Can I send? If not, what do I do now?" | R2 + R6 | One bar under the header, with icon, state, reason and one action |
| L2 · To do | "Which things, and whose are they?" | R5, replaced | An index grouped by who must act |
| L3 · The document | "What am I sending, and to whom?" | R1, R3, R4 | Shown as an email (To · CC · Subject · body); explanations stay next to the content (APP-04) |
| L4 · In context | "I am doing one thing" | Sentence editor, Edit message, P1 | Appears only after an action, tied to its starting point, one at a time |
| Dana | "The deal owner decides" | Owner response of P2 | Kept apart from the demo tools |

Every option had to respect the same limits:
- APP-04: the explanation stays near the content. An index helps you find your way; it does not replace the explanations.
- APP-32: three to five key screens or states.
- D5 and D6: a button that does not work yet stays focusable with `aria-disabled`, and there is one live region for the state.
- INV-9 and WCAG 1.4.1: the state is read from shape and word, never from colour alone.

## 4. Three columns in one page

On 12 November reference boards suggested one page with three columns. The boards were indicative. Where they differed from the approved specification, the specification won (for example, the product words "Not on the deal team" and "Request owner exception", and the warning text of US13).

| Layer | Where it went |
|---|---|
| L0 · Demo frame | The top bar, the Simulation sheet, the simulation frame around Dana's answer |
| L1 · Verdict | The head of the Review notes (state and main action) and the bar under the draft (button and reason). They stay apart, but you always see them together |
| L2 · To do | The cards in the Review notes, grouped by who must act |
| L3 · The document | The draft as an email in the centre |
| L4 · In context | The sentence editor in the email, edit mode in place, the exception request and the final review over the draft |

This answered the open questions of the layered proposal. R2 and R6 stay apart but are visible together. R5 becomes the groups of cards. The right column goes to the index, and the demo goes to a drawer (later a modal sheet, SM1). Dana gets her own view in the foreground (TC8). The final review stays open from every state, but over the draft. In edit mode the bar under the draft becomes the mode bar. Elements with no action are quieter.

## 5. The comparison lab

The three columns had a second version for the list, the cards, the request to Dana, the bottom bar and the final review. A lab page compared two versions on the real model and the approved copy: the **brief version**, which followed the approved specification, and the **chosen direction**. The lab is not part of this repository.

| Theme | Chosen direction | Brief version |
|---|---|---|
| List | Grouped by deal; state icon, subject without the project name, time | "Drafts" with subject, project, state and time |
| Cards | Three levels: closed, open, editing. The first card the coordinator must act on is open | Always open |
| After an action | The next card opens with the focus. With no card left, the next action takes the focus and the mark "Next" | The card stays as it is |
| Click on an element of the email | Opens its card | Selects its card |
| Sentence editor | In the email, under the sentence, started from the card | In the card |
| Request to Dana | A second email over the deal's email, with the same header, body and dark bar | A panel in place of the Review notes |
| Dana's decision | In the foreground, opened with "Answer as Dana Whitfield" | A Simulation card at the bottom of the Review notes |
| Widths | List 260 px · email · Review notes 400 px | 260 · email · 340 |

**Why the final review stays a view of its own.** At step 4 the brief asks to inspect the final recipients, wording and current approval and check state. It also asks to test whether people understand who receives the message, what is approved and why it can or cannot be sent (APP-07, APP-25, APP-28). UC-09 puts these three answers in one view. UF3 makes it a deliberate step before an action that cannot be undone. U6 and US12 make it open even when sending is blocked. Compared with the email in the centre, it adds a reading without markers, full recipient details with the removed ones, the summary of exceptions (who, when, for which version) and the line about automated checks.

**Risks against the brief.** The explanations now sit in another column (APP-04): a click on the element opens its card, the first blocking card is already open, and on a phone the cards go under their element. Cards can be closed (APP-34): the next one opens after each action. The tester plays Dana (APP-18, APP-31, APP-37): only in a foreground view with the band "Simulation · Acting as Dana Whitfield", and only on request, so Pending stays visible (APP-19).

The direction became decisions TC1–TC12: one page in three columns with the same addresses (TC1); a list grouped by deal (TC2); Review notes in a fixed order (TC3); cards in three levels with a "Next" step (TC4); draft and notes that point to each other (TC5); the sentence editor in the email (TC6); the exception request as a second email (TC7); the deal owner's decision in the foreground, only on request (TC8); Simulation closed on entry (TC9, later SM1); the narrow layout (TC10); notes before the draft in the focus order (TC11); one bar under the draft (TC12).

A comprehension test on the new page (with AI readers) left twelve observations open. They became OA1–OA12: for example, "check" for the automatic check and "review" for the human review (OA6), "See why you can't send" when sending is blocked (OA10), and the state in words under each list item (OA12).

## 6. Narrow screens

TC10 kept the structure on a phone: the list first, the draft at full width, each card under its element. Two tabs ("Message" / "Review notes") were rejected, because they separate the explanation from the content.

A check at 375 px found six problems. The banner took the first screen. "Back to drafts" was inside the email. The action was 1,500–2,000 px below the verdict. Views over the draft had their actions only at the end. "Simulation" appeared twice. The open card pushed the message far down.

The answer was MB1–MB6, tried in a lab with two phones side by side and then made the default below `--bp-wide`: a fixed compact top bar with "Back to drafts" and "Menu" (MB1); a fixed bottom bar for the draft (MB2); a compact verdict with "Details" (MB3); views over the draft with a top bar and the main action fixed at the bottom (MB4); Simulation only in the menu (MB5); the person's details after the actions in a card (MB6).

Later refinements (MB7–MB20) made the fixed bars smaller: a one-line sample label, the label and the jump note scrolling under the bar, "Next" read but not shown in the bottom bar, and scroll padding that follows the real bar heights.

## 7. Later layers on the same structure

On 13 and 14 November more decisions changed the look, not the structure or the rules: distinct "Next", selection and focus (UR); a whole-pixel type scale and Simulation as the last button of the top bar (UG); three planes of paper on wide screens (DP); two state colours and a yellow note for the simulation (CL); measured alignment, and the wide screen opening on the Project Harbor draft (GA11); an accessibility pass (A11Y); a check of the visual rules (RU); Simulation as a modal sheet (SM). They are described in [design-system.md](design-system.md) and [screens-and-states.md](screens-and-states.md).

## 8. Why this structure

- **The verdict and the next action come first.** The Review notes are first in the document, so keyboard and screen reader users meet the verdict before the draft (TC11).
- **The draft looks like what it is.** An email with To, CC, Subject and body is the object the coordinator sends. The exception request looks like an email too, because it is a message to someone who is not a recipient (TC7).
- **Explanations stay next to the content.** Each flagged element has one card, and each card names its element. On a phone the card is under the element (APP-04).
- **The issues are sorted by who must act.** The counts became the headings of the card groups, so there is one place for each fact (TC3).
- **The demo does not weigh as much as the product.** Demo controls are in one modal sheet, demo notes are on yellow paper, and the deal owner's role is a separate foreground view (TC8, CL2, SM1).
- **The rules did not change.** Addresses, states and conditions are the same as in the earlier specification. Their place changed, and a few words became clearer after the comprehension test (OA).
