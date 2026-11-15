# Copy inventory

Every string the sample review shows, view by view. The prototype takes its text from `prototype/js/copy.js`, and each entry there names its source. This file is the list of those texts in one place. The homepage copy is in [screens-and-states.md § 2](screens-and-states.md#homepage-copy). How each text is used in each state is in [screens-and-states.md](screens-and-states.md).

## How to read this file

- Text in quotes is the exact string. Words in braces, such as `{owner}` or `{version}`, are filled from the data: names, times, version numbers, counts. `{plural}` adds "s" when the count is not 1.
- In the code the space before "·" is a non-breaking space, so a line never starts with the separator (GA5). Here it is written as a normal space.
- Apostrophes are straight (').
- "Decision" names the decision that approved the text, when there is one. Texts without a decision come from the use cases, the product language or the earlier specification.

## Writing rules behind the copy

1. **The state is said in words.** Icons and colours only repeat it (INV-9).
2. **The first word says who must act.** "Blocking" means the coordinator acts, "Pending" means the deal owner acts, "Approved" means no one acts (UF29). The same words name the groups of cards (UF26).
3. **"Check" is the automatic check; "review" is what a person does** (OA6). So: "Check unavailable", "Run check", but "Review before sending" and "Review notes". "Sample review" and "Review record" keep "review".
4. **A blocked button says what it does.** "See why you can't send", not the name of the view it opens (OA10).
5. **The simulation says that it is a simulation.** Every demo text carries "Simulation", "Simulated" or "sample" (APP-31, APP-37).
6. **One thing is said once.** Where a fact appears in the card heading, it is not repeated in the verdict (UR4, UR7).

## 1. Document titles and skip links

| Where | Text | Decision |
|---|---|---|
| Homepage title | "DealDesk · A second look before deal messages leave" | UF25 |
| List | "Drafts · DealDesk sample" | UF25 |
| Draft | "Project Harbor · Review · DealDesk sample" | |
| Final review | "Project Harbor · Review before sending · DealDesk sample" | UF25 |
| Record | "Project Harbor · Review record · DealDesk sample" | UF25 |
| Static draft | "{subject} · DealDesk sample" | UF25 |
| Skip link, draft view | "Skip to draft" | |
| Skip link, other views | "Skip to content" | UF25 |
| Skip link to the notes | "Skip to review notes" | TC11 |

Rule: "‹page› · DealDesk sample", where ‹page› is the name of the view.

## 2. Top bar, footer and jump note

| Where | Text | Decision |
|---|---|---|
| Sample label (wide: footer; earlier: banner) | "Sample review · Project Harbor · Simulated: no email is sent" | UF8, UG4 |
| Sample label on a phone | "Sample review · no email is sent" | MB12 |
| Name of the phone region with the label | "Sample review" | MB18 |
| Role | "You're working as Jordan Blake, deal coordinator." | US7 |
| Accessible name of the wordmark | "DealDesk homepage" | UG2 |
| Back link (phone menu) | "Back to homepage" | |
| Restart | "Restart sample" | |
| Simulation button | "Simulation" | |
| Hidden text, request waiting | "Pending" | |
| Hidden text, outage on | "Check outage on" | SM6 |
| Counter, shown | "{count}/4" | SM9 |
| Counter, read | "{count} of 4 things tried" | SM9 |
| Phone menu | "Menu" | MB1 |
| Footer: interactive draft | "Only Project Harbor — timeline update is interactive in this sample." | |
| Footer: what Simulation holds | "Demo controls: the deal owner's answer, check outage, things to try, jumps." | OA3, SM7 |
| Jump note, wide | "Jumped to: {label}. The sample restarted to show this state." | US8 |
| Jump note, phone, first line | "Jumped to: {label}." | UR7 |
| Jump note, phone, opened | "The sample restarted to show this state." | UR7 |
| Path after a jump | "On this path: {steps}." | OA11 |
| One step of the path | "version {version}, {summary}" | OA11 |
| Close the note (wide) | "Close" | MB1 |
| Close the note (phone, × button) | "Close the jump note" | MB11 |

Example of the path: "On this path: version 2, Sam Lee removed · version 3, wording changed in paragraph 3." The label of a jump is the starting-point label without "Jump: ".

## 3. Restart

| Where | Text |
|---|---|
| Question | "Restart the sample? Your changes will be cleared." |
| Confirm | "Restart" |
| Cancel | "Cancel" |

## 4. Starting points and jumps

| Label | Address |
|---|---|
| "Homepage" | `index.html` |
| "Sample review from the start" | `app.html#/start` |
| "Jump: Sam flagged, nothing changed yet" | `#/jump/flagged` |
| "Jump: Sam escalated, wording still open" | `#/jump/escalated-first` |
| "Jump: exception request pending" | `#/jump/pending` |
| "Jump: Sam approved by the deal owner" | `#/jump/approved` |
| "Jump: approved, then edited" | `#/jump/edited-after-approval` |
| "Jump: check unavailable" | `#/jump/review-unavailable` |
| "Jump: ready to send" | `#/jump/ready` |
| "Jump: sent" | `#/jump/sent` |

In the Simulation sheet the labels drop "Jump: " and start with a capital letter, for example "Sam flagged, nothing changed yet" (SM4). "Jump: Sam escalated, wording still open" comes right after "Sample review from the start" (UF30).

## 5. Drafts list

| Where | Text | Decision |
|---|---|---|
| Title | "Drafts" | TC2 |
| Centre when no draft is open | "Select a draft to open it." | OA5 |
| Harbor, Blocked | "Blocked · {count} blocking issue{plural}" | UF26 |
| Harbor, added part | "{count} waiting for {owner}" | UF26 |
| Harbor, waiting | "Waiting for {owner} since {time}" | |
| Harbor, other states | "Needs a new check" · "Check unavailable" · "Ready to send" · "Sent (simulated)" | UF25 |
| State names | "Blocked" · "Waiting for decision" | |
| Static drafts | the `staticStatusLabel` of the seed | |

Since GA11, a wide screen opens the Project Harbor draft instead of the empty centre. "Select a draft to open it." stays for an empty centre.

## 6. Static draft

| Where | Text |
|---|---|
| Title | the subject from the seed |
| Text | "This draft isn't interactive in the sample." |
| Action (phone) | "Back to drafts" |
| Notes title | "Review notes" (TC3) |

## 7. The draft: header, fields and bar

| Where | Text | Decision |
|---|---|---|
| Heading | "Project Harbor" | |
| Version | "Version {version}" | |
| Back (phone) | "Back to drafts" | |
| Field labels | "To" · "CC" · "Subject" · "Message" | UF25 |
| Edit the message | "Edit message" | |
| Final review, can send | "Review before sending" | |
| Final review, blocked | "See why you can't send" | OA10 |
| Bar text, can send | "You can send: check up to date (version {version}), no blocking issues open." | |
| Next step mark | "Next" | TC4 |
| Changed paragraph tag | "Changed" | |

## 8. The verdict

### 8.1 State phrases

| State | Text |
|---|---|
| Blocked | "Blocked · Check up to date · {count} blocking issue{plural} · Can't send yet" |
| Blocked, declined | "Blocked · Check up to date · {owner} declined an exception · Can't send yet" |
| Blocked, approval outdated | "Blocked · Check up to date · Approval for {subject} outdated · Can't send yet" |
| Part added before "Can't send yet" | "{count} waiting for {owner}" |
| Needs a new check | "Needs a new check · {parts} changed since the last check (version {version})" |
| Part, approval outdated | "Approval for {subject} outdated" |
| Part, request outdated | "Request for {subject} outdated" |
| Waiting for decision | "Waiting for decision · Requested from {owner} at {time}" |
| Check unavailable | "Check unavailable · Your draft is saved. Sending stays blocked until the check runs." |
| Ready to send, with warnings | "Ready to send · Check up to date (version {version}) · {count} warning{plural} unchanged" |
| Ready to send, no warning | "Ready to send · Check up to date (version {version})" |
| During the check | "Checking…" |

`{parts}` joins, in this order, "Recipients", "Subject" and "Wording" with commas and "and", with only the first letter capital: "Recipients and wording changed since the last check (version 1)".

### 8.2 Under the phrase

| Where | Text | Decision |
|---|---|---|
| Last check | "Checked at {time} · version {version}" | UR8 |
| Changes panel title | "What changed since the last check" | |
| Outdated approval | "{owner}'s approval for {subject} covered version {version}. If it's still flagged after the check, request again from {owner}." | OA7 |
| Outdated request | "Your request to {owner} for {subject} was for version {version}. If it's still flagged after the check, request again from {owner}." | OA7 |
| Old results (phone, under Details) | "From an earlier check (version {version}). May be out of date." | UF27 |
| Outage hint | "In this sample, switch off Simulate check outage in the Simulation panel, then try again." | US6 |
| Waiting hint, earlier | "In this sample, answer as Dana from the Simulation panel." | replaced by the frame (TC8) |
| Edit mode open | "This is the status of the saved version (version {version}). Your changes aren't saved or checked yet." | UF31 |
| Phone: quiet notes | "Details" | MB3 |
| Saved with no difference | "No change made" | US16 |

### 8.3 Actions in the verdict

"Run check" · "Try again" · "Keep editing".

### 8.4 Simulation frame and decisions

| Where | Text | Decision |
|---|---|---|
| Frame, first line | "Simulation" + "Waiting for {owner} since {time}" | TC8 |
| Frame, explanation | "In the real tool, {owner} answers from their own inbox. Here you answer for them." | OA8 |
| Frame, button | "Answer as {owner}" | TC8 |
| After approving | "Approved for version {version} at {time}. If Jordan edits the message, you'll be asked again." | |
| After declining | "Declined at {time}." | UF25 |

### 8.5 Resume messages

| Case | Text |
|---|---|
| Approved since you left | "Since you left: {owner} approved {subject} ({time})." |
| Declined since you left | "Since you left: {owner} declined {subject} ({time})." |
| Waiting | "Where you left off: waiting for {owner} since {time}." |
| Other states | "Where you left off: {reason}" |
| Ready to send | "Where you left off: ready to send." |

`{reason}` is the reason of § 9 without "Can't send yet: ", for example "Where you left off: the message changed. Run the check again."

## 9. Reasons beside the button (DV-6)

The first true case wins. These texts come from the model, with names, times and numbers from the data.

| # | Case | Text |
|---|---|---|
| 1 | Already sent | "Already sent (simulated) at 11:05." |
| 2 | Never checked | "Can't send yet: run the check." |
| 4 | Check unavailable | "Can't send yet: review is unavailable. Your draft is saved." |
| 5 | Check out of date | "Can't send yet: the message changed. Run the check again." |
| 6 | Declined | "Can't send yet: Dana Whitfield declined the exception for Sam Lee. Remove Sam Lee to continue." (for a sentence: "Edit the sentence to continue.") |
| 7a | Approval outdated | "Can't send yet: Dana Whitfield's approval covers version 2 only. Request again." |
| 7b | Request outdated, never decided | "Can't send yet: your request to Dana Whitfield was for version 1. Request again." |
| 8 | Open blocking issues | "Can't send yet: 2 blocking issues need action." |
| 9 | Request waiting | "Can't send yet: waiting for Dana Whitfield's decision on Sam Lee." |
| — | Edit mode open | "Can't send yet: save or cancel your changes first." |
| — | After case 8, with a request waiting | "Also waiting for {owner}'s decision on {subject}." (US14) |

## 10. What changed (DV-7)

One item per difference, in this order: "{name} removed" · "{name} added" · "{name} moved to To" · "{name} moved to CC" · "Subject changed" · "Added '{text}'" · "Removed '{text}'" · "Wording changed in paragraph {number}". The parts of the phrase are "Recipients", "Subject" and "Wording".

## 11. Recipient cards

| Where | Text | Decision |
|---|---|---|
| Person on the team (hidden on the chip) | "{name} · {email} · {org} · {role} · On deal team" | |
| Rule name | "Not on the deal team" | |
| Why | "Works at {org}, the client, but isn't listed on the {deal} deal team." | |
| What to do | "Remove {name}, or ask {owner} to approve an exception." (`{owner}` is "deal owner Dana Whitfield") | US7 |
| Severity word | "Blocking" | UF29 |
| Pending word | "Pending" | UF29 |
| Pending detail | "Requested from {owner} at {time} · Not approved yet. Sending stays blocked." | |
| Approved word | "Approved" | |
| Approved, closed | "by {owner} · for version {version}" | UR5 |
| Approved, open | "by {owner} · {time} · for version {version} · Simulated owner response" | |
| Approval outdated | "Approved on version {old} · doesn't cover version {current}" | |
| Request outdated | "Your request to {owner} was for version {version}." | |
| Declined word | "Declined" | |
| Declined detail | "by {owner} · {time}" and the owner's note in quotes | |
| Removed chip, accessible name | "Removed from {field}: {name}" | OA1 |
| Removed card | "Removed · The next check confirms it" ("Removed" · "The next check confirms it") | UR7 |
| Request not possible yet | "You can request an exception once the check is up to date." | US4 |
| Warning, approval | "This change will make {owner}'s approval outdated." | |
| Warning, request | "This change will make your request to {owner} outdated. You'll need to ask again." | US2 |

**Buttons and accessible names.**

| Button | Accessible name |
|---|---|
| "Remove {name}" | the same |
| "Request owner exception" | "Request owner exception for {name}" |
| "Request again" | "Request again for {name}" |
| "Undo" | "Undo removing {name}" |

## 12. Sentence cards and editor

| Where | Text | Decision |
|---|---|---|
| Severity | "Blocking" · "Warning" | |
| Check label | "Flagged wording" | D7 |
| What to do | "Edit the sentence, or ask {owner} to approve an exception." | UF29 |
| Warning, closed | "Warning · ‹first sentence of the explanation› · Doesn't block" | OA9 |
| Card while editing | "Editing in the message." | TC6 |
| Changed card | "Changed · Wording changed. Run the check again." | |
| Editor, read-only field | "Original" | |
| Editor, field with a suggestion | "Suggested wording (you can edit it)" | |
| Editor, field without a suggestion | "Wording (edit it to change it)" | US16 |
| Editor buttons | "Apply wording" · "Cancel" | |
| Editor, text unchanged | "No change made" | US16 |

The explanations come from the seed: "States completion as certain. The firm can't guarantee deal outcomes." and "Sets a timing expectation for the client. It doesn't block sending: confirm the timing yourself before you send." (US13). Pattern labels: "Guaranteed completion", "Timing expectation".

| Button | Accessible name |
|---|---|
| "Edit sentence" | "Edit sentence {number}" |
| "Request owner exception" | "Request owner exception for flagged sentence {number}" |
| "Request again" | the same |
| "Undo" | "Undo rewording" |

## 13. Edit mode

| Where | Text | Decision |
|---|---|---|
| Confirm first, approval | "Editing will make {owner}'s approval outdated. You'll need to ask again." | UC-04 |
| Confirm first, request | "Editing will make your request to {owner} outdated. You'll need to ask again." | US2 |
| Confirm buttons | "Cancel" · "Continue editing" | |
| Mode bar | "Editing · Changes aren't saved yet" | |
| Mode bar buttons | "Cancel" · "Save changes" | |
| Fields | "Subject" · "Message" | UF25 |
| Add a recipient | "Add recipient" · "Person" · "To" · "CC" · "Add" | UF25 |
| Remove on a chip | "×", named "Remove {name}" | |

## 14. Card groups and Resolved

| Where | Text | Decision |
|---|---|---|
| Group headings | "{count} blocking" · "{count} waiting for decision" · "{count} approved" · "{count} warning{plural}" | TC3 |
| No issue | "No open issues" | UF25 |
| Old check, heading | "Still open from the last check (version {version}, may be out of date):" followed by the parts | UR4 |
| Old check, named blocking | "{count} blocking ({names})" | US15 |
| Old check, nothing left | "Nothing is left open from the last check (version {version}). Run the check to confirm." | US15 |
| Resolved title | "Resolved" | |
| Resolved items | "{name} — removed (version {version})" · "{label} — reworded (version {version})" | |

## 15. Exception request

| Where | Text | Decision |
|---|---|---|
| Phone top bar | "Exception request" | MB4 |
| Subject, recipient | "Project Harbor · Exception request · {name} as recipient" | |
| Subject, sentence | "Project Harbor · Exception request · Wording: '{sentence}'" | UF25 |
| To | "To: {owner} (deal owner)" | |
| Rule | "Not on the deal team" · "Flagged wording" | |
| Scope, recipient | "If approved, {name} can receive this message (version {version}) only. It doesn't add {short} to the deal team." | |
| Scope, sentence | "If approved, this sentence can be sent in version {version} only." | |
| Fix first | "{count} blocking issue{plural} can still be fixed by editing. Fix it first so Dana approves the final version." | J1-OP-22 |
| After an outdated approval | "Changed since Dana approved version {version}" | |
| Quoted message | "Message (version {version})" | UF25 |
| Reason, recipient | "Why does {name} need this message?" | |
| Reason, sentence | "Why does this sentence need to stay?" | UF25 |
| Empty reason | "Add a reason so Dana can decide." | |
| Buttons | "Cancel" · "Send request" | |

## 16. Deal owner view

| Where | Text | Decision |
|---|---|---|
| Phone top bar | "Answer as {owner}" | MB4 |
| Band | "Simulation" · "Acting as Dana Whitfield (deal owner)" · "You're deciding as deal owner." | TC8 |
| Sender field | "From" | TC8 |
| Reason | "Jordan's reason" | |
| Repeated request | "Changed since you approved version {version}: {changes}" | |
| Note field | "Note (optional)" | |
| Buttons | "Cancel" · "Decline" · "Approve exception for {name}" or "Approve exception for this sentence" | UF25 |

## 17. Simulation sheet

| Where | Text | Decision |
|---|---|---|
| Title | "Simulation" | |
| Close | "Hide simulation" | UF25 |
| Purpose | "In the product, other people and services make these things happen. Here you make them happen, to see how DealDesk responds." | SM2 |
| Sections | "Owner response" · "Check service" · "Things to try" · "Jump to a state" | |
| Owner, waiting | "Waiting for {owner} since {time}" and "Answer as {owner}" | SM5 |
| Owner, nothing waiting | "No exception request waiting. Request one from the draft first." | UF11 |
| Switch | "Simulate check outage" | OA6 |
| Switch help | "While on, the next check fails as if the service were down. Your draft is kept." | SM6 |
| Switch on | "Check outage simulated. The next check will fail." | |
| Switch off | "Check service available. Run the check again." | |
| Count beside the title | "{count} of 4 done" | SM3 |
| Count, announced | "Things to try: {count} of 4 done." | UF25 |
| Item state (hidden) | "Done" · "Not yet" | SM3 |
| Item 1 | "Sam Lee is on the client's side but not on the deal. What does DealDesk say?" | |
| Item 2 | "Ask the deal owner for an exception, then simulate the answer." | |
| Item 3 | "Edit the message after the check." | OA6 |
| Item 4 | "Simulate the check being unavailable." | OA6 |
| Note | "Ticked when the sample gets there, by your actions or by a jump. To finish the sample, also fix the guaranteed-completion sentence, review the final message and send." | SM3 |
| Jump note | "Each jump restarts the sample and replays the steps up to that state. What you changed is lost." | SM4 |
| Current jump | "On screen" | SM4 |

## 18. Final review

| Where | Text | Decision |
|---|---|---|
| Title | "Review before sending · Project Harbor" | |
| Phone top bar | "Back to draft" · "Review before sending" | MB4 |
| Old check | "From an earlier check (version {version}). May be out of date." | UF27 |
| Sections | "Going to" · "Message" · "Exceptions" | US8 |
| Recipient groups | "To" · "CC" | |
| Recipient | "{name} · {email} · {org} · {role}" (`{role}` is "Not on the deal team" for a person outside the team) | UF25 |
| Removed | "Removed in version {version}" | |
| Sentence tags | "Changed" · "Warning · unchanged" | US8 |
| Blocking states | "Blocking" · "Pending" · "Approved for version {version}" · "Approved on version {old} · doesn't cover version {current}" · "Declined" | UF28 |
| Approved title | "Approved" | US8 |
| Approved item | "{subject} by {owner}, {time}, for version {version}" | |
| Not approved title | "Not approved" | UF28 |
| Not approved items | "{subject} · Pending: requested from {owner} at {time}" · "{subject} · Approved on version {old} · doesn't cover version {current}" · "{subject} · Your request to {owner} was for version {version}." · "{subject} · Declined by {owner}, {time}" | UF28 |
| None approved | "Nothing approved for version {version}." | UF28 |
| No request | "No exceptions used" | |
| Verdict | "You can send" · "You can't send yet" | |
| Why it can go | "Check up to date (version {version}), no blocking issues open." | UR4 |
| Link in the reason | "Fix this in the draft" | UF25 |
| Limit | "Automated checks can miss things. Read the final message before sending." | |
| Buttons | "Back to draft" · "Send (simulated)" | |

## 19. Review record

| Where | Text | Decision |
|---|---|---|
| Title | "Review record · Project Harbor" | UR7 |
| Sent line | "Sent (simulated) to {names} at {time} · Version {version} · No real email left the sample." | OA4 |
| Names joined | "{first} and {last}" | OA4 |
| Announcement | "Sent (simulated)." | |
| Sections | "To" · "Removed" · "Issues and outcomes" · "Decisions" | |
| Outcome, removed | "{name}: removed (version {version})" | |
| Outcome, reworded | "{label}: reworded (version {version})" | |
| Outcome, warning | "{label}: warning unchanged" | US8 |
| Outcome, exception | "{subject}: approved by {owner} (version {version})" | UF25 |
| Decision, approved | "{subject}: approved by {owner}, {time}, for version {version}" | |
| Decision, declined | "{subject}: declined by {owner}, {time}, for version {version}" | UF25 |
| No decision | "No exceptions used" | |
| Sent message in the centre | "Sent message (version {version})" | UF25 |
| Bar | "Restart sample" | |

## 20. Strings kept in `copy.js` but not shown now

These entries still exist in `copy.js`, but the current page does not show them. They are listed so that every entry has a place here.

| Text | Why it is not shown |
|---|---|
| "Project" · "Subject" · "Status" · "Last activity" | The columns of the old table; the list is grouped by deal (TC2) |
| "Review record" | The record has one title, "Review record · Project Harbor" (UR7) |
| "{name} removed." | The removed card says "Removed · The next check confirms it" (UR7) |
| "View sent message" | The sent message is shown in the centre (TC1) |
| "In this sample, answer as Dana from the Simulation panel." | Replaced by the simulation frame (TC8, OA8) |

## 21. Examples in the design specimen

The design specimen (`prototype/design-specimen.html`) shows the components with the sample data filled in. These are the filled-in texts it shows. Each one is a template of this file with the names, times and versions of Project Harbor.

| Text in the specimen | Template |
|---|---|
| "Approved on version 2 · doesn't cover version 3." | § 11, approval outdated |
| "Your request to Dana Whitfield was for version 1. Request again." | § 9, 7b |
| "Pat Morgan · pat.morgan@haldenward.example · Halden & Ward · Advisor · On deal team" | § 11, person on the team |
| "Sam Lee · sam.lee@corvane.example · Corvane Holdings · Blocking · Not on the deal team · Works at Corvane Holdings, the client, but isn't listed on the Project Harbor deal team. Remove Sam Lee, or ask Dana Whitfield to approve an exception." | § 11, open card |
| "Sam Lee · sam.lee@corvane.example · Corvane Holdings · Pending · Requested from Dana Whitfield at 10:42 · Not approved yet. Sending stays blocked." | § 11, pending detail |
| "Pending · Requested from Dana Whitfield at 10:42 · Not approved yet. Sending stays blocked." | § 11, pending detail |
| "Sam Lee · sam.lee@corvane.example · Corvane Holdings · Approved by Dana Whitfield · 10:51 · for version 2 · Simulated owner response" | § 11, approved |
| "Sam Lee · sam.lee@corvane.example · Corvane Holdings · Blocking · Approved on version 2 · doesn't cover version 3" | § 11, approval outdated |
| "Sam Lee · sam.lee@corvane.example · Corvane Holdings · Blocking · Your request to Dana Whitfield was for version 1." | § 11, request outdated |
| "Sam Lee · sam.lee@corvane.example · Corvane Holdings · Blocking · Declined by Dana Whitfield · 10:55 · 'Sam isn't cleared for Harbor.'" | § 11, declined |
| "Sam Lee removed." | § 20, "{name} removed." |
| "2 blocking · 1 warning" | § 14, counts |
| "Resolved: Sam Lee — removed (version 2) · Guaranteed completion — reworded (version 3)" | § 14, Resolved |
