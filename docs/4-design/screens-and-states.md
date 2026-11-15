# Screens and states

This file lists every screen and view of the prototype, says what each one contains, and shows how each state of the draft appears. The last part covers navigation: addresses, starting points, focus order, `Esc` and jumps.

The old IDs stay, so that decisions and requirements still point somewhere: H for the homepage, A1–A4 for the app views, P1 for the exception request, P2 for Simulation, B for the banner, R1–R6 for the regions of the draft review. Since TC1 the app views are one page in three columns; [structure.md](structure.md) explains why.

Examples use the sample data: Dana Whitfield is the deal owner, Jordan Blake the coordinator, Sam Lee the person who is not on the deal team, 10:42 the time of a request. Texts with placeholders such as `{owner}` are in [copy.md](copy.md).

## 1. Inventory

| ID | View | Address | Where it sits now | Use case |
|---|---|---|---|---|
| H | Homepage | `index.html` | Its own page | UC-12 |
| B | Top bar, page footer, jump note | every app view | Top and bottom of the page | UC-13 |
| A1 | Drafts list | `app.html#/drafts` | Left column (first view on a phone) | UC-01 |
| A2 | Draft and Review notes | `app.html#/drafts/harbor` | Centre (the draft) and right column (the notes) | UC-02 to UC-07 |
| P1 | Exception request | inside A2 | A sheet over the draft | UC-06 |
| — | Deal owner view | inside A2 | A sheet in the foreground | UC-08, UC-14 |
| A3 | Final review ("Review before sending") | `app.html#/drafts/harbor/review` | The draft, risen, with the review content | UC-09, UC-10 |
| A4 | Review record | `app.html#/drafts/harbor/record` | Centre (the sent message) and right column (the record) | UC-11 |
| — | Static draft | `app.html#/drafts/<id>` | Centre and right column, read only | UF21 |
| P2 | Simulation | every app view | A modal sheet on a scrim | UC-14 |

All actions on issues happen inside the draft review, next to the content (APP-04).

## 2. H — Homepage

**Purpose.** Tell the buyer (a partner or operations lead) who DealDesk is for, what it does, what it does not do, and how to try it.

**Regions, in order.** 1. Header: wordmark and "Try the sample review". 2. Title, lede and call to action; the whole Project Harbor draft with "Take a second look" (UF45, UF46). 3. What a second look finds. 4. What you fix, and what the deal owner decides: three cards that open sheets (UF47). 5. Ready means this version: before and after an edit (UF48). 6. What DealDesk doesn't do. 7. Take the second look yourself. 8. Footer with the starting points (UF5). The sections are numbered 01–05 and their title stays in view beside the text on a wide screen (UR6).

**Actions.** "Try the sample review" (three times) · "Take a second look" / "Show it as written" · three cards that open a sheet, with "Previous step", "Next step", "Close" · product rows that link to their state in the sample (UF43).

**Wide and narrow.** From `--bp-wide`: title and draft side by side; each section in two columns, title on the left and text on the right at reading measure (UF33). Narrow: title → lede → call to action → summary → draft → button → sections in one column; cards one under another (J3-V1.1, UF47).

**Focus and announcements.** Focus starts at the top of the page; the first element is the skip link. One live region (`role="status"`) reads the result of the second look (UF46). Without JavaScript the draft shows its findings and each card is a link to its state.

**Sheets.** Each sheet has an address: `index.html#decide-blocking`, `#decide-pending`, `#decide-approved`. Opening a card adds a history entry, so the Back key closes the sheet. An address with one of these fragments opens the sheet on arrival.

### Homepage copy

The text below is the approved copy, one string per line. Rows with the class `product-sample` repeat the app's own words (GA13).

**Header**
- Wordmark: "DealDesk"
- Call to action: "Try the sample review"
- Skip link: "Skip to content"

**Beat 0 · First screen**
- Title: "A second look before deal messages leave."
- Lede: "DealDesk helps boutique transaction-advisory firms check who a deal message is going to and what it promises before it's sent. It asks for a decision only when something needs one."
- Call to action: "Try the sample review" · under it: "No sign-up. Sample data, nothing is sent."

**Beat 1 · The draft and the second look** (UF45, UF46)
- Draft caption: "Project Harbor · draft to the client"
- Header labels of the draft: "To" · "Cc" · "Subject"
- Recipients: "Pat Morgan · Alex Rivera" · in copy: "Sam Lee"
- Subject: "Project Harbor — timeline update"
- Body, paragraph 1: "Hi all,"
- Body, paragraph 2: "Thanks for the productive session on Tuesday. The diligence workstreams are on track and we expect the remaining data-room requests to close this week."
- Body, paragraph 3: "Completion is guaranteed by 30 June."
- Body, paragraph 4: "We'll circulate the updated timeline and next steps by Friday."
- Body, sign-off: "Best," · "Jordan"
- Note on Cc: "Blocking · Not on the deal team · Works at Corvane Holdings, the client, but isn't listed on the Project Harbor deal team."
- Note on the timing sentence: "Warning · Sets a timing expectation for the client. It doesn't block sending: confirm the timing yourself before you send."
- Note on the "guaranteed" sentence: "Blocking · Flagged wording · States completion as certain. The firm can't guarantee deal outcomes."
- Summary as written: "This message looks ready. Two issues block it, and one is a warning."
- Summary at the second look: "Two issues block this message, and one is a warning."
- Button: "Take a second look" · pressed: "Show it as written"
- Announcement at the second look: "Second look: Sam Lee isn't on the deal team. The completion sentence states an outcome as certain. The timing sentence needs a check."
- Announcement on the way back: "Showing the message as written."

**What a second look finds**
- Title: "What a second look finds"
- "Read as written, the Project Harbor update looks ready. A second look finds three things, and they don't weigh the same:"
- "Blocking · Sam Lee, copied in, works at the client but isn't on the deal team."
- "Blocking · The completion date is stated as certain. The firm can't promise deal outcomes."
- "Warning · The timing of the data-room requests is an expectation. It can go if the timing is confirmed."
- "Sam's name and address are familiar, so nothing in the email looks wrong."
- "Generic warnings look the same every time, so people learn to dismiss them."
- "DealDesk compares each recipient with the deal team and explains each issue next to the line it's about."

**What you fix, and what the deal owner decides** (UF47)
- Title: "What you fix, and what the deal owner decides"
- "The coordinator fixes what they can, like removing Sam or rewording a sentence. An exception goes to the deal owner, and coordinators can't approve their own."
- Card 1: "The check finds it" · row: "Sam Lee · Blocking · Not on the deal team"
- Card 2: "The coordinator asks" · row: "Sam Lee · Pending · Not approved yet. Sending stays blocked."
- Card 3: "The deal owner decides" · row: "Sam Lee · Approved by Dana Whitfield · for version 2"
- Prompt on each card: "What happens here"
- Sheet labels: "What it means" · "Who acts" · "What happens next" · buttons: "Previous step" · "Next step" · "Close" · link: "Open this state in the sample review"
- Sheet 1, title: "The check finds Sam Lee"
- Sheet 1, row: "Sam Lee · Blocking · Not on the deal team"
- Sheet 1, meaning: "Sam Lee works at Corvane Holdings, the client, but isn't listed on the Project Harbor deal team. The message can't be sent with Sam on it."
- Sheet 1, who acts: "The coordinator. They can remove Sam, or ask the deal owner for an exception."
- Sheet 1, next: "If they ask, Sam's row shows Pending until Dana Whitfield decides."
- Sheet 2, title: "The coordinator asks Dana Whitfield"
- Sheet 2, row: "Sam Lee · Pending · Requested from Dana Whitfield · Not approved yet. Sending stays blocked."
- Sheet 2, meaning: "A request isn't an approval. Until Dana decides, sending stays blocked."
- Sheet 2, who acts: "Dana Whitfield, the deal owner. Coordinators can't approve their own exceptions."
- Sheet 2, next: "Dana approves or declines, and DealDesk records the decision with the version it applies to."
- Sheet 3, title: "Dana Whitfield approves Sam"
- Sheet 3, row: "Sam Lee · Approved by Dana Whitfield · for version 2"
- Sheet 3, meaning: "Sam can receive this version of the message."
- Sheet 3, who acts: "No one, as long as the message doesn't change."
- Sheet 3, next: "If anyone edits the message, the approval no longer covers it and Sam is blocked again."
- Roles (UF32): "Coordinators write or paste each draft in DealDesk and send it from their usual email." (assumption: no email integration)
- Roles (UF32): "Deal owners keep their deal's team list up to date and only hear about messages that need a decision." (assumption: who keeps the list is an open question)

**Ready means this version** (UF48)
- Title: "Ready means this version"
- "An approval covers the version the deal owner saw. If the message changes, the check and the approval no longer count."
- Before, a link to `#/jump/approved`: "Sam Lee · Approved by Dana Whitfield · for version 2"
- Between the two rows: "Jordan edits the message."
- After, a link to `#/jump/edited-after-approval`: "Sam Lee · Blocking · Not on the deal team · Approved on version 2 · doesn't cover version 3"
- Link to `#/jump/ready`: "When nothing blocks it, the message can go. A warning doesn't block sending."
- "Partners and operations leads can read the review record of each message: the version, the issues and who decided what." The words "the review record of each message" link to `#/jump/sent`.
- Hidden text added to the name of each row link: "(opens this state in the sample review)"

**What DealDesk doesn't do**
- Title: "What DealDesk doesn't do"
- "It doesn't send email and can't stop anyone sending from their own. 'Blocked' means the current version isn't ready to send."
- "It isn't a legal or compliance engine."
- "Its checks can miss things: it relies on an up-to-date deal team list, and flagged wording is a prompt to review, not a verdict."
- "It can't see a message once it leaves DealDesk: the record covers the version reviewed here."
- Link to `#/jump/review-unavailable`: "If review is unavailable, the draft is saved and sending stays blocked until the check runs."
- "DealDesk supports judgment; it doesn't replace it."

**Take the second look yourself**
- Title: "Take the second look yourself"
- "Project Harbor is a fictional deal with one draft to review. You act as the coordinator; the deal owner's answers are simulated."
- Call to action: "Try the sample review" · under it: "No sign-up. Sample data, nothing is sent."

**Footer**
- "DealDesk is a fictional product made for a design exercise."
- Title: "Starting points"
- The labels of § 13.2.

## 3. B — Top bar, footer and jump note

**Wide screen (UR1, UG2, CL5, CL6).** One bar across the page, with a line under it:
- The wordmark "DealDesk" is a link to the homepage. Its accessible name is "DealDesk homepage". It keeps the homepage section the user came from (UF44).
- Beside it, after a short line, the section title "Drafts". It is the page heading (`h1`) in the list view and `h2` elsewhere.
- On the right: the role "You're working as Jordan Blake, deal coordinator." in grey, then "Restart sample" (quiet button), then "Simulation" (outline button, last).
- "Simulation" shows "2/4" after a thin line (SM9): how many things to try are done. Screen readers hear "Simulation · 2 of 4 things tried". With a request waiting it shows the clock and hidden text "Pending". With the outage on it shows the struck cloud and hidden text "Check outage on" (SM6).
- "Restart sample" opens a question on the bar line: "Restart the sample? Your changes will be cleared." with "Restart" and "Cancel". `Esc` cancels (US10). The role steps aside while the question is open (CL7).

**Page footer (UG4).** A line closes the page. Under it, on the same left edge as the bar and the list: "Sample review · Project Harbor · Simulated: no email is sent", "Only Project Harbor — timeline update is interactive in this sample." and "Demo controls: the deal owner's answer, check outage, things to try, jumps." The last line describes the Simulation button (`aria-describedby`).

**Jump note.** After a jump, a second row on the yellow legal-pad note (CL2, CL8): "Jumped to: exception request pending. The sample restarted to show this state." Under it, the path in grey: "On this path: version 2, Sam Lee removed · version 3, wording changed in paragraph 3." (OA11). "Close" closes the note. Any change after the jump removes it.

**Narrow screen (MB1, MB7, MB11–MB13, MB18).** A compact bar, fixed at the top:
- On the left, "Back to drafts" inside a draft, or the wordmark (to the homepage) in the list.
- On the right, "Menu". It shows the clock or the struck cloud like Simulation does. Open, it holds the role, "Back to homepage", "Restart sample" and "Simulation".
- Under the bar, scrolling with the page, a region named "Sample review": the line "Sample review · no email is sent" and the jump note. The jump note is one line, "Jumped to: exception request pending.", and opens to show "The sample restarted to show this state." and the path. A × button, named "Close the jump note", closes it.

The bar never covers the focused element: the scroll padding follows the real height of the fixed bars (MB14, WCAG 2.4.11).

## 4. A1 — Drafts list

**Purpose.** Choose the right draft among several deals.

**Content (TC2, OA12, UG3).** One group per deal, with the deal name in small capitals. Each item is a link with: the state icon; the subject without the project name ("Timeline update"); the state in words under the subject, small and grey; the time of the last activity in mono.

**Project Harbor item.** The computed state (DV-5):
- "Blocked · 2 blocking issues", with " · 1 waiting for Dana Whitfield" when a request waits.
- "Waiting for Dana Whitfield since 10:42".
- "Needs a new check", "Check unavailable", "Ready to send", "Sent (simulated)".

While edit mode is open the item shows the state of the saved version. The last activity is the time of the draft's last event (version, Undo, check, request, decision, send).

**Other items.** Their `staticStatusLabel` from the seed and the time their version was created (UF18). Only Project Harbor is interactive.

**Selection.** The item of the open draft has `aria-current="page"`. Selecting Project Harbor counts as opening the draft (UC-01), so the resume message can appear (D8, UF20).

**Wide and narrow.** On a wide screen the list is the left column and `#/drafts` opens the Project Harbor draft (GA11). On a narrow screen the list is the first view and the main landmark (A11Y5), with the title "Drafts" on top. Deal names are one heading level under the list title (A11Y2).

## 5. A2 — Draft and Review notes

**Purpose.** Understand the state and the issues, fix them or ask for an exception, run the check again, go to the final review.

### 5.1 The draft (centre)

The draft is an email:
- **Header (R1):** "Project Harbor" (`h1`), "Version 2". On a narrow screen without the mobile bar, "Back to drafts".
- **To / CC (R3):** one chip per person. A person on the team has a plain chip; screen readers also hear the e-mail, organisation, role and "On deal team". A flagged person has a chip button with the icon of their state and a red border. It opens their card. A removed person stays as a struck-through chip beside the field until the next check. It is outside the list of recipients, with the accessible name "Removed from CC: Sam Lee" (OA1).
- **Subject**, in the display serif.
- **Body (R4):** flagged sentences have an underline (solid red for Blocking, dashed for Warning, solid ink while waiting) and a marker `[1]`, `[2]`. A click or `Enter` on the sentence or the marker opens its card (TC5). Paragraphs changed since the last check carry the tag "Changed".
- **Sentence editor** (TC6): opens under the sentence, which gets a dashed outline. Fields: "Original" (read only) and "Suggested wording (you can edit it)", or "Wording (edit it to change it)" when the pattern has no suggestion (US16). Buttons: "Apply wording", "Cancel". While the text equals the sentence, "Apply wording" has `aria-disabled`; pressing it shows "No change made" under the field.
- **Bar** (R6, TC12): the dark bar at the bottom of the draft (§ 5.9).

### 5.2 The Review notes (right column)

The order never changes (TC3):
1. **Verdict.** The state icon, the state phrase with its first part as the title, the main action, and the only `role="status"` region. The region reads each new phrase once and empties after 3 seconds (OA2). Under the phrase: "Checked at 10:28 · version 1" (UR8).
2. **Context**, only when needed: "What changed since the last check" with its items; lines on outdated requests; the resume message; the simulation frame; hints; in edit mode the note on the saved version.
3. **Cards**, in groups by who must act, with the counts as group headings.
4. **"Resolved"**: "Sam Lee — removed (version 2)" · "Guaranteed completion — reworded (version 3)".

The notes are first in the document, before the draft (TC11).

### 5.3 State phrase by `Draft.status`

One rendering per state. The icon shape changes with the meaning ([design-system.md § 6](design-system.md#6-icons)).

| `Draft.status` | State phrase | Icon | Main action | Reason in the bar |
|---|---|---|---|---|
| Blocked (start) | "Blocked · Check up to date · 2 blocking issues · Can't send yet" | Octagon | — (actions are on the cards) | "Can't send yet: 2 blocking issues need action." |
| Blocked, request waiting | "Blocked · Check up to date · 1 blocking issue · 1 waiting for Dana Whitfield · Can't send yet" | Octagon | — | "Can't send yet: 1 blocking issue needs action." + "Also waiting for Dana Whitfield's decision on Sam Lee." |
| Blocked, declined | "Blocked · Check up to date · Dana Whitfield declined an exception · Can't send yet" | Octagon | — | "Can't send yet: Dana Whitfield declined the exception for Sam Lee. Remove Sam Lee to continue." |
| Blocked, approval outdated | "Blocked · Check up to date · Approval for Sam Lee outdated · Can't send yet" | Octagon | — | "Can't send yet: Dana Whitfield's approval covers version 2 only. Request again." |
| Needs a new check | "Needs a new check · Recipients changed since the last check (version 1)" | Circular arrows | "Run check" | "Can't send yet: the message changed. Run the check again." |
| Needs a new check, approval outdated | "Needs a new check · Wording changed since the last check (version 2) · Approval for Sam Lee outdated" | Circular arrows | "Run check" | as above |
| Needs a new check, request outdated | "Needs a new check · Wording changed since the last check (version 1) · Request for Sam Lee outdated" | Circular arrows | "Run check" | as above |
| Waiting for decision | "Waiting for decision · Requested from Dana Whitfield at 10:42" | Clock | — | "Can't send yet: waiting for Dana Whitfield's decision on Sam Lee." |
| Check unavailable | "Check unavailable · Your draft is saved. Sending stays blocked until the check runs." | Struck cloud | "Try again" · "Keep editing" | "Can't send yet: review is unavailable. Your draft is saved." |
| Ready to send | "Ready to send · Check up to date (version 3) · 1 warning unchanged" | Check in a circle | — (the button is in the bar) | No reason: "You can send: check up to date (version 3), no blocking issues open." |
| Checking… (800 ms) | "Checking…" | Activity spinner | "Run check" busy (`aria-busy`) | unchanged (UF13) |
| Sent | — (the record opens) | — | — | — |
| Edit mode open (any state) | unchanged: it describes the saved version | unchanged | none | "Can't send yet: save or cancel your changes first." |

**Parts of the phrase.** "· ‹m› waiting for Dana Whitfield" goes before "Can't send yet" in every Blocked phrase when m > 0 (UF26). "· Approval for ‹subject› outdated" or "· Request for ‹subject› outdated" goes at the end of the Needs a new check phrase when the new version made a request outdated. With several outdated requests there is one part, with the subjects joined by "and"; "Approval" wins if one was approved (UF27, OA7). `NeedsCheck` cannot be reached in the prototype; if it appeared, the prototype reports an error (UF12).

**Context under the phrase.**
- Needs a new check: "What changed since the last check" and one item per difference ("Sam Lee removed", "Wording changed in paragraph 3"). For each outdated request: "Dana Whitfield's approval for Sam Lee covered version 2. If it's still flagged after the check, request again from Dana Whitfield." or "Your request to Dana Whitfield for Sam Lee was for version 1. If it's still flagged after the check, request again from Dana Whitfield." "Request again" is not offered before the check.
- Check unavailable: "In this sample, switch off Simulate check outage in the Simulation panel, then try again." When the check just requested fails, a `role="alert"` reads the phrase and the status region stays empty (US6, UC-05 AC-6).
- Waiting for decision: the simulation frame (§ 5.12).
- After a simulated decision, until the next action: "Simulation · Approved for version 2 at 10:43. If Jordan edits the message, you'll be asked again." or "Simulation · Declined at 10:55.".
- On a wide screen "From an earlier check" is said once, in the card heading (UR4). On a narrow screen the verdict says "From an earlier check (version 2). May be out of date." under "Details" (MB3).

### 5.4 Counts (UF26)

One rule for the list, the phrase, the card groups and the final review. Each blocking issue of the last completed check is in **one** group:

| Group | Condition | Who acts | Heading |
|---|---|---|---|
| blocking | open with no pending request, or declined | the coordinator | "2 blocking" |
| waiting | latest request pending | the deal owner | "1 waiting for decision" |
| approved | approved | no one | "1 approved" |

Warnings are counted apart: "1 warning". An empty group does not appear. With no issues: "No open issues". The number in the phrase, the headings and the bar reason never differ for the same thing.

### 5.5 Recipient cards

A card is **closed** (icon, title, type), **open** (explanation, person's details, actions, notes) or **editing**. Only one card is open (TC4). The title button opens and closes the card (`aria-expanded`). On a narrow screen the details come after the actions (MB6).

| Variant | Type when closed | Open text | Actions | Icon |
|---|---|---|---|---|
| Blocking, open | "Blocking · Not on the deal team" | "Blocking · Not on the deal team · Works at Corvane Holdings, the client, but isn't listed on the Project Harbor deal team. Remove Sam Lee, or ask deal owner Dana Whitfield to approve an exception." | "Remove Sam Lee" · "Request owner exception" | Octagon |
| Pending | "Pending · Not on the deal team" | "Pending · Not on the deal team · Requested from Dana Whitfield at 10:34 · Not approved yet. Sending stays blocked." | "Remove Sam Lee" (US4) | Clock |
| Approved | "Approved by Dana Whitfield · for version 2" (UR5) | "Approved by Dana Whitfield · 10:51 · for version 2 · Simulated owner response" | — | Check in a circle |
| Approval outdated | "Blocking · Not on the deal team" | "Blocking · Not on the deal team · Approved on version 2 · doesn't cover version 3" | "Remove Sam Lee" · "Request again" | Struck check |
| Request outdated, never decided | "Blocking · Not on the deal team" | "Blocking · Not on the deal team · Your request to Dana Whitfield was for version 1." | "Remove Sam Lee" · "Request again" | Struck clock |
| Declined | "Blocking · Declined" | "Blocking · Not on the deal team · Declined by Dana Whitfield · 10:55 · 'Sam isn't cleared for Harbor.'" | "Remove Sam Lee" (primary) · "Request again" | X in a circle |
| Removed, until the check | "Removed · The next check confirms it" (UR7) | — | "Undo" | none |

Accessible names: "Remove Sam Lee", "Request owner exception for Sam Lee", "Request again for Sam Lee", "Undo removing Sam Lee". The open card shows "CC · sam.lee@corvane.example · Corvane Holdings". The address matters: the same domain as Alex Rivera is the signal that leads to the mistake.

**Notes on the cards.** When the check is not up to date, "You can request an exception once the check is up to date." replaces the request button (US4). When an action would make a valid approval outdated: "This change will make Dana Whitfield's approval outdated." When it would make a pending request outdated: "This change will make your request to Dana Whitfield outdated. You'll need to ask again." (US2).

### 5.6 Sentence cards

| Variant | Type when closed | Open text | Actions |
|---|---|---|---|
| Blocking, open | "Blocking · Flagged wording" | "Blocking · Flagged wording · States completion as certain. The firm can't guarantee deal outcomes. Edit the sentence, or ask Dana Whitfield to approve an exception." | "Edit sentence" (primary) · "Request owner exception" |
| Warning | "Warning · Sets a timing expectation for the client · Doesn't block" (OA9) | "Warning · Sets a timing expectation for the client. It doesn't block sending: confirm the timing yourself before you send." | "Edit sentence" (optional) |
| Editor open | as before | "Editing in the message." | (in the email) "Apply wording" · "Cancel" |
| Changed, until the check | "Changed · Wording changed. Run the check again." | — | "Undo" (named "Undo rewording") |
| Pending, approved, declined, outdated | like the recipient cards, without the person's name | | Declined: "Edit sentence" (primary) |
| Fixed | moves to "Resolved" | | — |

The card title is the pattern label ("Guaranteed completion", "Timing expectation") with its marker `[n]`. Accessible names: "Edit sentence 2", "Request owner exception for flagged sentence 2". Each marker points to its explanation with `aria-describedby`. Blocking and Warning use the same order: severity word, check label (Blocking only), why it matters, what you can do (UF29).

### 5.7 The next step (TC4)

- Entering the draft, or after a successful action, the first card of the "blocking" group that the content still contains opens and is selected. Recipients come first, then sentences in reading order. It carries the label "Next", tied to the title with `aria-describedby`. After an action the focus goes to its title. Closing the card removes the label.
- With no card for the coordinator, "Next" goes beside the next action: "Run check" (Needs a new check), "Review before sending" (Ready to send), "Answer as Dana Whitfield" (Waiting for decision). That action becomes the filled button (UR2).
- When a check must come first (Check unavailable, or the open card has an outdated request or approval), the card stays open without "Next", and "Next" goes on "Run check" or "Try again". With Check unavailable the card actions are not filled buttons.
- With the final review open, nothing behind it is marked.
- On a phone "Next" is read but not shown in the bottom bar (MB19).

### 5.8 Before a new check

When the check is not up to date, the groups give way to one heading (US15, UR4): "Still open from the last check (version 2, may be out of date): 1 blocking (Sam Lee) · 1 warning". If nothing is left: "Nothing is left open from the last check (version 2). Run the check to confirm." Cards follow the draft order. A card from the earlier check keeps its rule colour, with a thin dashed border (GA10).

### 5.9 The bar under the draft

| Situation | Left | Middle | Right |
|---|---|---|---|
| Sending blocked | "Edit message" | the reason, plus "Also waiting for…" when needed (US14) | "See why you can't send", active (OA10) |
| Ready to send | "Edit message" | "You can send: check up to date (version 3), no blocking issues open." | "Review before sending", primary |
| Confirm before editing | "Cancel" | "Editing will make Dana Whitfield's approval outdated. You'll need to ask again." or "Editing will make your request to Dana Whitfield outdated. You'll need to ask again." | "Continue editing" |
| Edit mode | pen icon | "Editing · Changes aren't saved yet" · "Can't send yet: save or cancel your changes first." | "Cancel" · "Save changes" · "See why you can't send" with `aria-disabled` (on a phone only Cancel and Save, MB20) |

The reason is tied to the button with `aria-describedby`. The bar stays in view while the draft scrolls (DP3). On a phone it is fixed at the bottom (MB2).

### 5.10 Edit mode

"Edit message" asks for confirmation first when a valid approval or a pending request exists (UC-04, US2). In edit mode the chips get a × ("Remove Sam Lee"), "Add recipient" opens "Person" (people of the seed not on the message), "To" / "CC" and "Add"; subject and body become fields "Subject" and "Message". "Save changes" makes one new version (UF22). The verdict keeps describing the saved version and adds "This is the status of the saved version (version 2). Your changes aren't saved or checked yet." Cards stay, without actions (UF31). Pressing the disabled final review button moves focus to the mode bar. Leaving the draft with unsaved changes keeps them; coming back reopens the mode (US3). A jump, `#/start` or Restart discard them.

### 5.11 Resume messages (D8)

Shown only when the draft is opened from the list (UF20):
- "Since you left: Dana Whitfield approved Sam Lee (10:51)." or "Since you left: Dana Whitfield declined Sam Lee (10:55)."
- "Where you left off: waiting for Dana Whitfield since 10:42."
- "Where you left off: the message changed. Run the check again." (the bar reason without "Can't send yet: ")
- "Where you left off: ready to send."

### 5.12 The simulation frame in the verdict

With a request waiting, a yellow legal-pad frame (CL2, OA8): "Simulation · Waiting for Dana Whitfield since 10:42." · "In the real tool, Dana Whitfield answers from their own inbox. Here you answer for them." · the button "Answer as Dana Whitfield". It opens the deal owner view (§ 7).

## 6. P1 — Exception request

A second email laid on the draft, 12 px down and right, with a veil over the rest (TC7, DP4). It is a modal dialog.
- Header "Project Harbor" · "Version 2"; field To: "Dana Whitfield (deal owner)".
- Subject: "Project Harbor · Exception request · Sam Lee as recipient", or "Project Harbor · Exception request · Wording: 'Completion is guaranteed by 30 June.'".
- Body: the rule and the scope: "Not on the deal team · If approved, Sam Lee can receive this message (version 2) only. It doesn't add Sam to the deal team." or "Flagged wording · If approved, this sentence can be sent in version 3 only."
- When another blocking issue can still be fixed: "1 blocking issue can still be fixed by editing. Fix it first so Dana approves the final version." (J1-OP-22).
- After an outdated approval: "Changed since Dana approved version 2" and the list of changes.
- Required field "Why does Sam Lee need this message?" or "Why does this sentence need to stay?". Empty: "Add a reason so Dana can decide."
- The quoted message: "Message (version 2)", subject and paragraphs.
- Bar: "Cancel" · "To: Dana Whitfield (deal owner)" · "Send request".

Focus goes to the title, stays in the sheet, and returns to the opening button after `Cancel`, `Esc` or sending. Sent, the sheet leaves upwards; cancelled, downwards (DP6). The draft then shows Pending: a request is not an approval (APP-19).

## 7. Deal owner view

Opened only with "Answer as Dana Whitfield", from the verdict or the Simulation sheet (TC8). A modal sheet over the draft:
- The band "Simulation · Acting as Dana Whitfield (deal owner) · You're deciding as deal owner." on yellow.
- "From" Jordan Blake, "To" Dana Whitfield; the request title as subject.
- "Jordan's reason · ‹reason›", the scope, for a repeated request "Changed since you approved version 2: ‹changes›", the quoted message, and "Note (optional)".
- Bar: "Cancel" · "Decline" · "Approve exception for Sam Lee" (primary in Dana's view), or "Approve exception for this sentence".

After the decision the view closes and the result shows in the verdict and the card.

## 8. A3 — Final review

The draft rises 4 px with a larger shadow, and its content becomes the review (DP5). The notes stay readable; the list steps back. It opens from the bar button in every state (UC-09, US12). It is a modal dialog with the address `#/drafts/harbor/review`.
- Title: "Review before sending · Project Harbor". With an old check: "From an earlier check (version 2). May be out of date."
- **Going to:** under "To" and "CC", "Pat Morgan · pat.morgan@haldenward.example · Halden & Ward · Advisor". A flagged person ends with "Not on the deal team · ‹state›", where the state is "Blocking", "Pending", "Approved for version 2", "Approved on version 2 · doesn't cover version 3" or "Declined". Removed people: "Removed in version 2 · Sam Lee".
- **Message:** subject and paragraphs, read only, with "Changed", "Warning · unchanged", or the state of a blocking sentence.
- **Exceptions:** under "Approved", "Sam Lee by Dana Whitfield, 10:51, for version 2". Under "Not approved": "Sam Lee · Pending: requested from Dana Whitfield at 10:42", "Sam Lee · Approved on version 2 · doesn't cover version 3", "Sam Lee · Your request to Dana Whitfield was for version 1.", "Sam Lee · Declined by Dana Whitfield, 10:55". With none approved but some not approved: "Nothing approved for version 3." With no request: "No exceptions used" (UF28).
- "Automated checks can miss things. Read the final message before sending."
- **Bar:** "Back to draft" · "You can send" with "Check up to date (version 3), no blocking issues open." or "You can't send yet" with the reason and the link "Fix this in the draft" · "Send (simulated)".

When sending is not possible, "Send (simulated)" has `aria-disabled="true"`, stays focusable, and pressing it announces the reason and sends nothing (D5, UC-10). A decision that arrives while the view is open is announced once. "Back to draft", `Esc` and "Fix this in the draft" go back to `#/drafts/harbor`.

## 9. A4 — Review record

After sending, the centre shows the sent message read only: "Project Harbor" · "Sent message (version 3)", To and CC chips, subject and body. Its bar: send icon · "Sent (simulated) to Pat Morgan and Alex Rivera at 11:05 · Version 3 · No real email left the sample." (OA4) · "Restart sample".

The right column becomes the record: the title "Review record · Project Harbor" with the same sent line, then "To" (Pat Morgan, Alex Rivera), "Removed" ("Sam Lee · Removed in version 2"), "Issues and outcomes" ("Sam Lee: removed (version 2)", "Guaranteed completion: reworded (version 3)", "Timing expectation: warning unchanged", or "Sam Lee: approved by Dana Whitfield (version 2)") and "Decisions" ("Sam Lee: approved by Dana Whitfield, 10:51, for version 2", or "No exceptions used"). Focus goes to the title; "Sent (simulated)." is announced once.

## 10. Static drafts

The other drafts open read only: the subject as `h1`, the deal name, "This draft isn't interactive in the sample." The notes show "Review notes" and the seed state with its icon. On a phone, "Back to drafts".

## 11. P2 — Simulation

A modal sheet on a scrim (SM1): from the right under the top bar button on wide and medium screens, from the bottom (two thirds of the screen) on a phone, where it opens from the menu (MB5). The page under it is inert. `Esc` or a click on the scrim closes it; focus goes to its title on opening and back to the button on closing. It is closed on entry.

- **Head on yellow** (SM2): "Simulation", "Hide simulation", and "In the product, other people and services make these things happen. Here you make them happen, to see how DealDesk responds."
- **Owner response:** "Waiting for Dana Whitfield since 10:34" and "Answer as Dana Whitfield" (SM5), or "No exception request waiting. Request one from the draft first."
- **Check service:** the switch "Simulate check outage" (`role="switch"`) and "While on, the next check fails as if the service were down. Your draft is kept." Changes announce "Check outage simulated. The next check will fail." or "Check service available. Run the check again."
- **Things to try** with "2 of 4 done": four items, each with a mark (empty circle or ticked circle) and hidden "Done" / "Not yet" (SM3). Then the note "Ticked when the sample gets there, by your actions or by a jump. To finish the sample, also fix the guaranteed-completion sentence, review the final message and send."
- **Jump to a state:** "Each jump restarts the sample and replays the steps up to that state. What you changed is lost." Then the labels of § 13.2 without "Jump:" and with a capital letter (SM4). The state reached by the last jump is marked "On screen" (`aria-current`) until anything changes.

## 12. Narrow screen

Below `--bp-wide` (TC10, MB1–MB20):
- `#/drafts` shows only the list. A draft opens at full width, with the Review notes (verdict and context) above the email, and each card under its element: recipient cards under To/CC, sentence cards under their paragraph. "Resolved" comes after.
- The top bar is fixed (§ 3). The draft bar is fixed at the bottom: reason on one line, "Edit message" on the left, the main action on the right.
- Draft and notes go from edge to edge, without shadow.
- Views over the draft take the whole screen: a top bar with "Cancel" or "Back to draft" and the view's name ("Exception request", "Answer as Dana Whitfield", "Review before sending"), and the buttons one under another at full width, the main action at the bottom (MB4, MB9).

## 13. Navigation

### 13.1 Addresses

Two pages, the app views with hash routing.

| Address | View | Notes |
|---|---|---|
| `index.html` | Homepage | |
| `app.html` | → `#/drafts` | |
| `app.html#/drafts` | List | Keeps the saved session. Wide screen: opens `#/drafts/harbor` (GA11). Narrow: the list alone |
| `app.html#/start` | Back to the starting data, then `#/drafts` | Removes the jump note (US5) |
| `app.html#/drafts/harbor` | The draft | If the draft is sent, goes to the record |
| `app.html#/drafts/harbor/review` | Final review over the draft | |
| `app.html#/drafts/harbor/record` | Record | Only after sending; otherwise goes to the draft |
| `app.html#/jump/<id>` | A jump | Replays a scenario and opens its view |
| `app.html#/drafts/<other draft>` | Static draft | |
| any other `#/…` address | → `#/drafts` | No message (UF24). An in-page anchor does not change the view (US1) |

### 13.2 Starting points (UF5, GEN-07)

Listed in the homepage footer, in the Simulation sheet (without "Homepage") and in the repository README.

| Label | Address | Built from |
|---|---|---|
| "Homepage" | `index.html` | — |
| "Sample review from the start" | `app.html#/start` | the seed |
| "Jump: Sam flagged, nothing changed yet" | `app.html#/jump/flagged` | the seed, session cleared → draft |
| "Jump: Sam escalated, wording still open" | `app.html#/jump/escalated-first` | SC-7, step 1 → draft (the brief's order, UF30) |
| "Jump: exception request pending" | `app.html#/jump/pending` | SC-2, steps 1–3 → draft |
| "Jump: Sam approved by the deal owner" | `app.html#/jump/approved` | SC-2, steps 1–4 → draft |
| "Jump: approved, then edited" | `app.html#/jump/edited-after-approval` | SC-4, steps 1–5 → draft |
| "Jump: check unavailable" | `app.html#/jump/review-unavailable` | SC-5, steps 1–3 → draft |
| "Jump: ready to send" | `app.html#/jump/ready` | SC-1, steps 1–3 → final review |
| "Jump: sent" | `app.html#/jump/sent` | SC-1, all steps → record |

A jump replays the commands of `model/scenarios.json` on the seed, so the state comes from the same checked rules, not from hand-made data. Only steps with a command count (UF18). A jump closes the Simulation sheet and moves focus to the heading of the view it opens.

### 13.3 From the homepage to a state and back (UF42–UF44)

Product rows, sentence links and "Open this state in the sample review" lead to the jump of the state they show. The link carries its section: `app.html?from=ready#/jump/approved`. The wordmark (and "Back to homepage" in the phone menu) returns to `index.html#decide`, `#ready` or `#limits`, or to `index.html` without a known value. The query stays during navigation, because redirects only change the hash.

### 13.4 Transitions and focus

| From | Action | To | Focus after |
|---|---|---|---|
| Homepage | "Try the sample review" | `#/start` | the list title (narrow) or the draft heading (wide) |
| List | open Project Harbor | draft | `h1` "Project Harbor", or the resume message |
| Draft | "Review before sending" / "See why you can't send" | final review | its title |
| Final review | "Back to draft" | draft | the bar button |
| Final review | "Send (simulated)" with `canSend` | record | "Review record · Project Harbor" |
| Any | "Back to drafts" | list | list title |
| Any | "Restart sample" → "Restart" | list | list title |
| Any | a jump | its view | its heading |
| After a successful action | — | — | the next card's title, or the action marked "Next" |

Each view change sets the document title ("Project Harbor · Review · DealDesk sample") and moves focus. Content focused by a script shows the focus ring only after keyboard use (UR3, US10).

### 13.5 Focus order (TC11)

Document order equals visual order on a narrow screen: skip links → top bar → list → Review notes → draft. On a wide screen the notes are on the right but come before the draft, so the verdict and the next action are met first. In the draft: chips, markers `[n]`, "Edit message", the bar button. In the notes: the verdict action, the cards, "Resolved". Skip links: "Skip to review notes", and "Skip to draft" in the draft or "Skip to content" in the other views (both go to `#main`).

### 13.6 Keyboard and `Esc`

| Key | Effect |
|---|---|
| `Tab` / `Shift+Tab` | the order above; inside a foreground view, focus stays in it |
| `Enter` / `Space` | buttons and links; on a chip, sentence or marker, opens its card (TC5) |
| `Esc` | closes the exception request, the deal owner view, the final review, the sentence editor (like "Cancel", from any of its controls), the Restart question, the Simulation sheet and the phone menu (which returns focus to "Menu") |

No single-key shortcuts: they conflict with screen readers. Hovering a flagged element highlights its card, and the other way round.

### 13.7 Persistence

The session is saved in the browser (UC-13). A reload keeps the trial; "Restart sample", `#/start` and every jump reset it (US5). Leaving with unsaved edits asks for the browser's confirmation (US3).

### 13.8 Live regions

One `role="status"` in the verdict (D6). `role="alert"` only for a check that just failed. The final review and the record have their own status line for changes while open. The homepage has one for the second look. Nothing is announced while typing.
