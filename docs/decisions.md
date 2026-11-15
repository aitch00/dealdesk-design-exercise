# Decision register

This is the list of every decision I approved during the project, from 9 to 14 November 2026. Each row says what was decided, what was set aside, and why. It is the evidence behind the alternatives and iterations described in the process page: the process page tells the story, and this register holds the detail.

The groups follow the order of the work. A later decision can replace an earlier one; the old row stays, marked "Superseded", so the history is visible. Sources such as `R2-F4` are findings of the [desk research](1-requirements/research.md); IDs such as `APP-26` are [requirements](1-requirements/requirements.md). The prototype cites these IDs in its `data-source="decision:…"` attributes.

Dates come from the commit that introduced each decision.

## D — Product

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| D1 | 2026-11-09 | Product | Every approval covers the version it was given on. Any edit to recipients or text makes it outdated; history stays | Cancelling only the edited part, or keeping approvals with a check of changes | Approving Sam for text A is not approving him for text B (R2-F1, R2-F9). Cost: repeated requests |
| D1b | 2026-11-09 | Product | A decline is not reset by an edit; it stays while its object is present | Resetting declines on every edit too | An objection should not vanish because of an unrelated change (R2-F4) |
| D2 | 2026-11-09 | Product | No "external recipient" warning. Organisation and role are a Note; the sample Warning is on wording | "Alex Rivera's address is outside your firm" | A domain warning does not tell Sam from Alex and feeds habituation (R3-F1, R5-F2) |
| D3 | 2026-11-09 | Product | The owner's answer is simulated in an explicit, labelled panel | An automatic answer after a few seconds | Honest simulation; both Approved and Declined can be tried |
| D4 | 2026-11-09 | Product | The check runs again with "Run check"; no timeout | An automatic check after every edit | Makes the invalidation visible (APP-26). A check expires by an edit, never by time |
| D5 | 2026-11-09 | Product | Unavailable send: `aria-disabled` button, focusable, with the reason written next to it | Native `disabled` with a tooltip | The reason must reach keyboard and screen-reader users (R7, disabled buttons) |
| D6 | 2026-11-09 | Product | One `role="status"` live region for the overall state; no announcements while typing | Announcing every warning | Avoids a "chatty" interface for screen readers (R7, 4.1.3) |
| D7 | 2026-11-09 | Product | Recipients: deterministic check ("Not on the deal team"). Wording: pattern-based check ("Flagged wording"), exception always possible | Presenting both as certain | A block is fair if its reason is reliable; copy is honest about reliability (R5-F4, R3-F10) |
| D8 | 2026-11-09 | Product | When a draft is opened again, show where work stopped and what happened meanwhile | No resume information | The coordinator works with many interruptions (R6-F10) |
| D9 | 2026-11-09 | Product | No numbers on the homepage; authority data go in the process page, with their limits | Quoting regulator statistics on the homepage | The data mix channels and cannot be compared; the brief forbids persuasive figures (R4-F1–F4, WEB-12) |

## U — Use cases

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| U1 | 2026-11-09 | Product | Checks and approvals are tied to the content's fingerprint (`contentHash`), not to the version number | Tying them to the version number | An Undo back to checked content makes it valid again without a new check |
| U2 | 2026-11-09 | Product | An edit while a request waits makes the request outdated | Leaving it waiting | Dana would decide on content that no longer exists |
| U3 | 2026-11-09 | Product | Correcting an owner decision is a new decision that replaces the old; both stay | Undoing the decision | Edits must not hide recorded information (R2-F13) |
| U4 | 2026-11-09 | Product | A check that is already current is not run again | Allowing it | Avoids the idea that repeating a check makes it "better" |
| U5 | 2026-11-09 | Product | Free editing has an explicit mode (`Edit message` → `Save changes`) | Continuous saving | No new version on every key. Risk: mode error, eased by a persistent bar (R6-F2) |
| U6 | 2026-11-09 | Product | The final review always opens; only sending depends on `canSend` | Opening it only when sending is allowed | Seeing why you cannot send is as useful as seeing why you can |
| U7 | 2026-11-09 | Product | The coordinator cannot withdraw a waiting request | Manual withdrawal | Not asked by the brief; an outdated request becomes Outdated anyway |
| U8 | 2026-11-09 | Product | The other 6 drafts in the list are static | All drafts interactive | Keeps the prototype to one complete draft, as the brief asks |

## M — Data model

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| M1 | 2026-11-09 | Data | Store events, compute states | Storing states (Current, Pending…) as fields | One source of truth: no field to forget, so a check cannot look current on other content |
| M2 | 2026-11-09 | Data | `Issue.key` = type + object (`wording:<pattern>`), not the sentence position | Sentence position | Adding a sentence before must not make every issue look new |
| M3 | 2026-11-09 | Data | Issues stored per check, never changed; the outcome is computed | One updated list | "Fixed" needs history: it was there before, now it is not |
| M4 | 2026-11-09 | Data | Undo moves the pointer back to the previous version; the undone version stays as `discarded` | A new version with the same content | "Version 3" for content equal to version 1 confuses |
| M5 | 2026-11-09 | Data | A simulated, deterministic clock | Real time | Screenshots, tests and records can be repeated |
| M6 | 2026-11-09 | Data | Wording rules as a list of patterns in the sample data | Rules in the code | Makes clear they are sample rules (D7) |
| M7 | 2026-11-09 | Data | The session is saved as one object with a schema version | Several separate keys | Restart and a fallback without storage become simple |

## S — State model

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| S1 | 2026-11-09 | State model | The Python model is the executable specification; the prototype must give the same results on `scenarios.json` | A text-only specification | The model is checked before the prototype exists, and the prototype inherits the tests |
| S2 | 2026-11-09 | State model | Bounded exploration: depth 10, finite parameters | Hand-written scenarios only | With a planted error, the scenarios passed and only exploration found it |
| S3 | 2026-11-09 | State model | Every command is tried in every state, also those not offered | Trying only visible actions | Domain rules must hold even if the interface is wrong |
| S4 | 2026-11-09 | State model | Every command carries its actor | An implicit actor | Makes "the coordinator never decides" checkable |
| S5 | 2026-11-09 | State model | Clock, IDs and repeats do not count in a state's identity | Counting everything | Otherwise the state space grows without limit |
| S6 | 2026-11-09 | State model | The seed validator uses the same model | A separate copy of the rules | One implementation of the rules |
| S7 | 2026-11-09 | State model | The Python model also computes the change list, resume message and checklist item; `SaveEdit` accepts recipients (UF22) | Building these only in the prototype, tested by hand | The parity test then covers that text too |
| S8 | 2026-11-09 | State model | Parity traces: 100 random traces of 30 steps, fixed seed, saved in `model/traces.json` | More unsaved traces, or a full export | A deterministic file in the diff; every reachable state is covered |

## UF — User flows

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| UF1 | 2026-11-09 | Flows | Four app screens (List, Draft review, Final review, Record) plus the homepage | More screens per step | Fits 3–5 (APP-32); issue actions sit next to the content (APP-04) |
| UF2 | 2026-11-09 | Flows | *(Superseded by TC7.)* Exception request in a panel beside the draft | A modal window | The message stays visible; modals are for short, urgent decisions (R5-F11) |
| UF3 | 2026-11-09 | Flows | *(Superseded by TC1.)* The final review is a separate screen | A panel in the draft | A deliberate step; easier to read on a narrow screen |
| UF4 | 2026-11-09 | Flows | Simulation in a closable column (desktop) or a panel from below (narrow) | Simulation mixed into the interface | Always reachable, never confused with the product |
| UF5 | 2026-11-09 | Flows | Labelled starting points; jumps replay `scenarios.json` to reach a state | Hand-built states | The brief asks for clear starting points (GEN-07); jumps cannot produce wrong states |
| UF6 | 2026-11-09 | Flows | Main view on a narrow screen: state → recipients → text → send | Text first | Follows the order of the three comprehension questions (APP-33) |
| UF7 | 2026-11-09 | Flows | Blocked sentences start with "Blocked": "Blocked · Check current · 2 blocking issues · Can't send yet" (reopened by US8) | Sentences without the label | The same word in list and draft |
| UF8 | 2026-11-09 | Flows | Banner: "Sample review · Project Harbor · Simulated: no email is sent" | A dash instead of the colon | Three of four sources and the specimen use the colon |
| UF9 | 2026-11-09 | Flows | Warning has no icon: word, dashed underline and dashed rule carry it | A new triangle icon | Warning is a severity, not a draft state; an icon would need a new component |
| UF10 | 2026-11-09 | Flows | One shape per meaning: Ready to send and Approved share the tick in a circle | A new shape for Ready to send | Same meaning ("condition met"); the word tells them apart |
| UF11 | 2026-11-09 | Flows | Simulation with no request: "No exception request waiting. Request one from the draft first." | A shorter sentence | It also says what to do |
| UF12 | 2026-11-09 | Flows | The "needs a check" state is not rendered; if it appears, it is a bug | A new sentence for it | No path in the sample data reaches it; no test would check that copy |
| UF13 | 2026-11-09 | Flows | `Running` is the model's name, "Checking…" the interface's; the reason next to send does not change meanwhile | Renaming it in the model | The check is atomic in the model |
| UF14 | 2026-11-09 | Flows | A rule for "Needs a new check · ‹Parts› changed…" and "What changed", from the difference since the last check | A fixed sentence without detail | The placeholder had no rule; a computed sentence says what changed |
| UF15 | 2026-11-09 | Flows | "Checking…" is an 800 ms display delay; the command runs at once | Running the command after the delay | The state shown is always the real one |
| UF16 | 2026-11-09 | Flows | Homepage copy approved; section titles keep contractions, the `h1` does not; the authority sentence stays out | Titles without contractions, or only sourced sentences | Sections are named so in the use cases; quotes alone would leave sections empty |
| UF17 | 2026-11-09 | Flows | "Sam Lee is on the client's side…" is ticked when the coordinator removes Sam or requests an exception | Ticking it when the draft opens | The explanation is always visible; ticking on open would ask for no action |
| UF18 | 2026-11-09 | Flows | Jump steps count only steps with a command; "Last activity" is Harbor's last event time | Counting every item in `scenarios.json` | With the full count, "Jump: ready to send" would land in "needs a new check" |
| UF19 | 2026-11-09 | Flows | *(Interaction superseded by UF36.)* The homepage image is a static HTML copy of Sam's row (`role="img"`) | A PNG screenshot | CSS can crop it, and it does not depend on final screenshots |
| UF20 | 2026-11-09 | Flows | Opening the draft sends `OpenDraft`; the resume message shows only when coming from the list | Recording opens only from the list, or resuming on every return | Resuming is for people coming back from the list (D8) |
| UF21 | 2026-11-09 | Flows | A static draft shows only its subject, "This draft isn't interactive in the sample." and `Back to drafts` | A screen with invented content | Other drafts are static (U8); no data without a source |
| UF22 | 2026-11-09 | Flows | In edit mode, recipients, subject and text are saved as one version; additions only from the sample people | Editing text only, or one command per recipient | Covers adding Sam again without versions while editing (U5) |
| UF23 | 2026-11-09 | Flows | `View sent message` in the record expands in place, with `aria-expanded` | A separate view or panel | Shows the sent version without adding screens (UF1) |
| UF24 | 2026-11-09 | Flows | An unknown app address goes to `#/drafts`, without a message | An error page | A wrong link does not leave an empty page and needs no new text |
| UF25 | 2026-11-09 | Flows | Unsourced copy approved for titles, skip links, resume, names, counts, and the list of out-of-scope requirements | Letting the prototype choose texts while building | Every visible text has a source or an approval before it enters the code |
| UF26 | 2026-11-10 | Flows | Counts grouped by who must act: "blocking", "waiting" or "approved"; Blocked adds "· 1 waiting for Dana Whitfield" | Counting everything unapproved as "blocking" | The state reached in the brief's order had no defined view; the model does not change |
| UF27 | 2026-11-10 | Flows | "Needs a new check" says what became outdated ("· Approval outdated" / "· Request outdated") and what to do next | Showing it only after `Run check`, or offering `Request again` at once | The request is outdated as soon as content changes; a new request needs a current check |
| UF28 | 2026-11-10 | Flows | The final review shows each exception's state in the draft's words; "No exceptions used" only with no requests | A summary of the ready case only | With Sam waiting it said "No exceptions used"; you must know what is approved |
| UF29 | 2026-11-10 | Flows | Severity first, then who acts: "Blocking" … "Remove Sam Lee, or ask Dana Whitfield to approve an exception." The check label follows | Only the check label, or "Blocking" in its place | The brief asks to tell levels apart in language; D7's honesty stays |
| UF30 | 2026-11-10 | Flows | A jump in the brief's order: "Jump: Sam escalated, wording still open", listed right after the start | A new scenario | It was the only state without a jump; an existing scenario passes through it |
| UF31 | 2026-11-10 | Flows | With an edit open, the final review does not open: "Can't send yet: save or cancel your changes first." | Leaving everything active | A mode error: you could send the saved version believing it was the edited one (R6-F2) |
| UF32 | 2026-11-10 | Flows | A "How it fits your team" section with each role's task; coordinators send from their own email [ASSUMPTION] | An email-client integration | The brief asks how review fits a team (WEB-04); an integration would invent a feature |
| UF33 | 2026-11-10 | Flows | Homepage in two columns from the wide breakpoint: title left, text right, in the reading measure | One left-aligned 65ch column, or wider text | At 1280 px a third of the page was empty; no new breakpoint (V5) |
| UF34 | 2026-11-10 | Flows | Subtitle with customer and value: "DealDesk helps boutique transaction-advisory firms check who a deal message is going to…" | The earlier subtitle | On mobile the customer was not in the first screen |
| UF35 | 2026-11-10 | Flows | Title "A second look before deal messages leave." | "A second look before it leaves." or "Review deal messages before they leave." | The first did not say what leaves; the second was clear but generic |
| UF36 | 2026-11-10 | Flows | *(Superseded by UF46 and UF49.)* The first-screen image is one link to the sample, without app buttons | A static image with app buttons | Two buttons did nothing, right next to the title |
| UF37 | 2026-11-10 | Flows | "How review works" shows Sam's row in each step's state (Blocking, Pending, Approved, outdated approval) | Four text-only steps, or an animation | Shows what the product can show; an animation costs more for the same content |
| UF38 | 2026-11-10 | Flows | The first limit says DealDesk cannot stop sending from your own email, and what "Blocked" means | Leaving it implicit | A partner will ask what stops skipping review [ASSUMPTION about the question] |
| UF39 | 2026-11-10 | Flows | "What DealDesk doesn't do" before "How it fits your team"; "review unavailable" closes "How review works" | The previous order | The buyer looks for limits early; on mobile they would sink |
| UF40 | 2026-11-10 | Flows | The checks for forbidden claims and numbers skip product samples, where the "guaranteed" sentence appears marked Blocking | Showing the row without quoting the sentence | A sample sentence flagged Blocking is the opposite of a claim |
| UF41 | 2026-11-10 | Flows | Removed "Who it's for", the "See how review works" link and one redundant line; EDPB reference stays out | Keeping them | They answered no question that other parts did not; EDPB is too close to a compliance claim |
| UF42 | 2026-11-10 | Flows | Two more jumps: "Sam flagged, nothing changed yet" and "Sam approved by the deal owner" | No link on the Approved row | A jump replays the scenario, so it always reaches the row's state |
| UF43 | 2026-11-10 | Flows | Each "How review works" row links to the state it shows, with a visible arrow and a descriptive accessible name | A sheet over the homepage, detail pages, or jumps in the footer only | The sample review is already the level below |
| UF44 | 2026-11-10 | Flows | `Back to homepage` returns to the section you came from, via `?from=`; other values go to the top | Always returning to the top | Normal navigation brings you back; only fixed values, no address from arbitrary text |
| UF45 | 2026-11-10 | Flows | The homepage tells one idea: a message can look ready and not be. Section titles in a row tell the story | A feature statement, or "only the deal owner clears an exception" | The first describes a feature; the second starts from the solution |
| UF46 | 2026-11-10 | Flows | The second look on request: the Harbor draft as written; "Take a second look" shows the marks and goes back | Marks always shown, or marks on scroll | The first loses the moment the draft looks fine; the second starts without a gesture |
| UF47 | 2026-11-10 | Flows | Three cards open sheets for Sam Blocking, Pending, Approved: what it means, who acts, what next, with a link | Explanations inline, or cards side by side | Inline loses the sequence; side by side is too narrow |
| UF48 | 2026-11-10 | Flows | "Ready means this version" shows before and after an edit, with no interaction | A before/after switch | The comparison is the content; a switch shows one state at a time |
| UF49 | 2026-11-10 | Flows | Removed as sections: the first-screen image link, "The problem", "How review works", "How it fits your team" | Keeping them beside the story | They repeated what the story shows; five sections and less text remain |
| UF50 | 2026-11-10 | Flows | `--duration-reveal: 180ms` for the second look and the sheets; none with `prefers-reduced-motion` | No transition | A short transition links the marks to their lines; under 200 ms it does not slow reading |

## V — Visual design

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| V1 | 2026-11-09 | Visual design | *(Superseded by V15.)* Serif only in homepage titles (Source Serif 4); app and text in sans | Sans only, or serif also in app titles | Brings the paper idea to the homepage without mixing registers in dense views |
| V2 | 2026-11-09 | Visual design | Self-hosted fonts in woff2, with OFL licences | Google Fonts, or system fonts | Repeatable screenshots, no third-party requests, works offline (QLT-01) |
| V3 | 2026-11-09 | Visual design | *(Superseded by CL1.)* Monochrome states: word, icon shape and rule; no state colour | Three colours, or one colour per state | The calmest version; colour never carries meaning. Cost: Blocking and Warning separate without colour |
| V4 | 2026-11-09 | Visual design | *(Superseded by V14.)* Wordmark only; the mark left open | Drawing a tick mark now, or a mark without a tick | A brand tick would be confused with state icons |
| V5 | 2026-11-09 | Visual design | Two breakpoints in rem, `--bp-narrow` and `--bp-wide`, `min-width` only | One breakpoint near 48rem or 65rem | The list and the simulation column stop fitting at different widths; rem follows text size |
| V6 | 2026-11-09 | Visual design | *(Superseded by V15.)* IBM Plex Sans with IBM Plex Mono | Inter with IBM Plex Mono | One superfamily: matching metrics, one licence [ASSUMPTION] |
| V7 | 2026-11-09 | Visual design | Mono only for versions and times as data; in sentences, sans with tabular figures | Mono also inside sentences | Mono in the middle of a sentence breaks reading |
| V8 | 2026-11-09 | Visual design | *(Superseded by V13.)* Blue only for actions, links and focus; teal only on the homepage | Blue or teal also for states | One accent; a blue-green next to states would look like "approved" |
| V9 | 2026-11-09 | Visual design | Solid rule if it blocks sending, dashed for Warning, none if nothing to do | The same rule for all, or none | Severity readable without colour, matching the solid or dashed underline (R5-F3) |
| V10 | 2026-11-09 | Visual design | *(Border superseded by CL2.)* Simulation panel with a double border, the label "Simulation" and its own place | A coloured background, or a dashed border | Colour cannot be the sign; dashes already mean Warning |
| V11 | 2026-11-09 | Visual design | `tokens.css` is the only source of values; a script checks contrast and breakpoints | Values written in the docs, or contrast by hand | One source, like the rules (S6); a value change shows in the diff |
| V12 | 2026-11-09 | Visual design | The inactive `Send (simulated)` keeps text contrast | Low-contrast grey, which WCAG allows for inactive controls | The button stays focusable (D5), so it must stay readable |
| V13 | 2026-11-10 | Visual design | Direction "Proofread draft": neutral paper, warm ink, graphite, one sepia accent `#7A4520` | "Paper, not cream", "Technical memo", a plum option | Blue-black is close to bank navy; no accent mixes actions and states |
| V14 | 2026-11-10 | Visual design | *(Superseded by CL9.)* The proofreader's caret (‸) in sepia before the wordmark and as favicon | Wordmark only (V4), or a half tick | No favicon and no link to the idea; a tick looks like a state |
| V15 | 2026-11-10 | Visual design | Newsreader for wordmark and homepage titles; Atkinson Hyperlegible Next for text; IBM Plex Mono for data | Source Serif 4 + IBM Plex Sans (V1, V6) | Part of the chosen direction; Atkinson is built for legibility |
| V16 | 2026-11-10 | Visual design | Square corners everywhere (`--radius-control` and `--radius-panel` at 0) | Slightly rounded corners | My brand choice: paper, not app chrome. No effect on accessibility |
| V17 | 2026-11-10 | Visual design | One depth, `--shadow-raised`, for the homepage draft and the sheets | No shadow | In the blur test the draft's edges vanished; a sheet on a desk |
| V18 | 2026-11-10 | Visual design | One filled button per group on the homepage: the header call to action becomes secondary | All buttons filled | Three filled buttons cancel out; test T2 decides the rest |

## X — Method

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| X1 | 2026-11-09 | Method | The personas are proto-personas from the brief, not research | — | The brief forbids presenting as research what is not (PRC-11, PRC-12) |
| X2 | 2026-11-09 | Method | Every claim has a source label: [BRIEF] · [PATTERN Rn-Fn] · [ASSUMPTION] · [TO RESEARCH] | — | Keeps given, documented and assumed apart |
| X3 | 2026-11-09 | Method | Journeys as task and error analysis (HTA and adapted SHERPA), with no invented emotions | — | Emotion curves without research are fiction |
| X4 | 2026-11-09 | Method | Desk research on verifiable sources (R1–R7); no user research claimed | — | Honesty about the type of evidence |
| X5 | 2026-11-09 | Method | Working documents in Italian; copy, prototype, README and process document in English | — | Working language against the reviewer's language |
| X6 | 2026-11-09 | Method | The suggested wording sits next to the original, with no forced own judgment first | — | R6-F5 finds that stronger against automation bias but less liked: left as a research question |

## US — Usability review

Fixes after the [simulated usability review](5-evaluation/usability-review.md). US8 reopens four approved wordings (UF7, UF25, UF27, UF28); the old rows stay as history.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| US1 | 2026-11-10 | Usability | An in-page anchor is not an app address: "Skip to draft" and `[n]` markers keep the view | Letting the router send them to `#/drafts` | Skipping the banner left the draft (WCAG 2.4.1) |
| US2 | 2026-11-10 | Usability | One warning before any edit that makes a request outdated: "This change will make your request to Dana Whitfield outdated. You'll need to ask again." | Warning only after an approval | In the brief's order the request expired with no warning |
| US3 | 2026-11-10 | Usability | Leaving the draft with an open edit keeps it; leaving the app asks the browser to confirm | Dropping the text silently, or an inline confirmation | Jordan moves between projects and lost text without noticing (CTX-10) |
| US4 | 2026-11-10 | Usability | A recipient outside the team always shows "Not on the deal team" and `Remove Sam Lee` | Showing only the path already chosen | After the first decision safe recovery was not visible (4 evaluators) |
| US5 | 2026-11-10 | Usability | "From the start" starts from the start: `app.html#/start`; "Each jump restarts the sample." | `app.html#/drafts` as entry, or confirming each jump | After a jump, "Try the sample review" showed Harbor already sent |
| US6 | 2026-11-10 | Usability | "Review unavailable" says where recovery is simulated: "In this sample, switch off Simulate review outage in the Simulation panel, then try again." | The hint only in the panel | `Try again` looked broken |
| US7 | 2026-11-10 | Usability | The draft shows who receives and for whom you act: "To"/"CC" on rows; "You're working as Jordan Blake, deal coordinator." | A list without labels | "Who receives" was unsure or partial in 12 of 21 answers |
| US8 | 2026-11-10 | Usability | Four wordings reopened: "Check up to date", "Jumped to: ‹label›…", "At the last check (version n):", "Exceptions" and "unchanged" | Keeping approved texts | "Check" read as a command; internal IDs showed; counts and titles misled readers |
| US9 | 2026-11-10 | Usability | In Simulation, Dana's action is not a filled button; a note says what else finishes the sample | A filled button | The only filled button was an action the coordinator cannot take |
| US10 | 2026-11-10 | Usability | Consistent keyboard and names: "Edit sentence n" (WCAG 2.5.3); `Esc` closes the editor; visible focus after keyboard actions | Leaving it as it was | Names and keyboard behaviour did not match the visible labels |
| US11 | 2026-11-10 | Usability | Forced colours: no rule where nothing to do, icons in system text colour, inactive send in system grey | Stating the limit only | All rows looked Blocking, icons vanished, blocked send looked active. Emulation only |
| US12 | 2026-11-10 | Usability | While sending is blocked the button says what it does: "Open the final review" | "Review before sending" in every state, or disabling it | Three of three readers read it as a possible send |
| US13 | 2026-11-10 | Usability | The Warning says who confirms: "…It doesn't block sending: confirm the timing yourself before you send." | "You can send this if the timing is confirmed." | Three of three readers: it did not say who confirms |
| US14 | 2026-11-10 | Usability | The reason by the send button also names the waiting decision: "Also waiting for Dana Whitfield's decision on Sam Lee." | The model's reason only | Readers thought fixing the sentence was enough |
| US15 | 2026-11-10 | Usability | Before a new check, count only what is still there and name it: "Still open from the last check (version 2): 1 blocking (Sam Lee) · 1 warning" | US8's prefix | Readers asked which block; a removed person was still counted |
| US16 | 2026-11-12 | Usability | With no suggestion the field is "Wording (edit it to change it)"; unchanged text shows "No change made" | A promised suggestion and a silent refusal, or `disabled` | Applying an unchanged Warning did nothing and said nothing |

## TC — Three-column structure

Decisions after comparing the spec-based version with a proposed direction, tried in a lab prototype.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| TC1 | 2026-11-12 | Structure | One page in three columns: drafts list · the draft as an email · "Review notes"; the final review laid over it | Separate screens | Every region had equal weight; the verdict was split between top and bottom |
| TC2 | 2026-11-12 | Structure | The list is grouped by deal and shows state by icon only; title "Drafts" (words added by OA12) | A table with state words | Drafts of one deal read together |
| TC3 | 2026-11-12 | Structure | "Review notes" has a fixed order: verdict, context, issue cards grouped by who acts, "Resolved" | A count summary apart from the explanations | Counts and explanations said the same thing twice |
| TC4 | 2026-11-12 | Structure | Cards closed, open or editing; one open at a time; the first card to act on opens marked "Next" | Cards always open | With closed cards the next action was hidden |
| TC5 | 2026-11-12 | Structure | Draft and panel point to each other: clicking a flagged chip, sentence or `[n]` opens its card | Selection only | The explanation stays close to the content (APP-04) |
| TC6 | 2026-11-12 | Structure | The sentence editor opens in the email, under the sentence; the card says "Editing in the message." | An editor in the card | You write where you read the message |
| TC7 | 2026-11-12 | Structure | The exception request is a second email over the deal email, with `Cancel` · `Send request` | A panel in place of the notes | It is a message to someone not among the recipients |
| TC8 | 2026-11-12 | Structure | The owner decides in the foreground, on request: "Answer as Dana Whitfield", under a simulation band | An owner card in a panel, or opening it automatically | One person plays two roles; opening it automatically would hide Pending |
| TC9 | 2026-11-12 | Structure | *(Side and mode changed by SM1.)* Simulation is a drawer, closed on entry; a dot shows a waiting request | The right column | The right column now belongs to the notes; the demo must not weigh like the product |
| TC10 | 2026-11-12 | Structure | On a narrow screen the list comes first; the draft opens full width with each card under its element | Two tabs, "Message" and "Review notes" | Tabs would separate explanation from content (APP-04) |
| TC11 | 2026-11-12 | Structure | Focus order: banner → list → Review notes → draft, with "Skip to review notes" and "Skip to draft" | List → draft → panel | Keyboard and screen-reader users learn first if they can send |
| TC12 | 2026-11-12 | Structure | The bar under the draft holds `Edit message`, the reason and the final review; in edit mode it is the mode bar | Mode bar on top | Commands and confirmations of one message in one place |

## OA — Open points of the comprehension test

Fixes for what the [comprehension test on the three-column page](5-evaluation/comprehension-test.md) left open. No new reader has read the fixed screens.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| OA1 | 2026-11-13 | Usability | A removed recipient sits outside the recipient list; accessible name "Removed from CC: Sam Lee" | Keeping it in the list with "Sam Lee removed." | A screen reader counted Sam among the recipients |
| OA2 | 2026-11-13 | Usability | The verdict's live region empties 3 seconds after the announcement | Hiding the visible sentence from screen readers | The sentence was read twice |
| OA3 | 2026-11-13 | Usability | Under `Simulation`: "Demo controls: check outage, jumps, the deal owner's answer." | No explanation until it opens | The button and "Things to try" were unclear |
| OA4 | 2026-11-13 | Usability | The send line names recipients: "Sent (simulated) to Pat Morgan and Alex Rivera at ‹time› · Version n · No real email left the sample." | "No email was sent." | With "Sent", readers answered "nobody" to "who receives" |
| OA5 | 2026-11-13 | Usability | The empty centre says "Select a draft to open it." | Repeating the list note | The note appeared twice |
| OA6 | 2026-11-13 | Usability | "Check" for the automatic check, "review" for a person's final review: "Check unavailable", "Simulate check outage" | Using "review" for everything | Readers did not know if check and review were the same |
| OA7 | 2026-11-13 | Usability | Say which approval and from whom: "Approval for Sam Lee outdated"; "…request again from Dana Whitfield." | UF27's short sentence | "Approval outdated" did not say which; "request again" not from whom |
| OA8 | 2026-11-13 | Usability | "Answer as Dana Whitfield" in a simulation frame: "In the real tool, Dana Whitfield answers from their own inbox. Here you answer for them." | The button alone | Two of three readers did not know who presses it |
| OA9 | 2026-11-13 | Usability | A closed Warning card says the problem: "Warning · Sets a timing expectation for the client · Doesn't block" | "Warning" only | Closed, the card did not say the problem |
| OA10 | 2026-11-13 | Usability | With sending blocked the button says "See why you can't send" | "Open the final review" (US12) | Readers did not see why to open it while blocked |
| OA11 | 2026-11-13 | Usability | After a jump the banner lists the path: "On this path: version 2, Sam Lee removed · …" | Reordering scenarios so numbers match | Each jump replays a different path; the path explains the numbers |
| OA12 | 2026-11-13 | Usability | In the list the state in words sits under the subject ("Blocked · 2 blocking issues", "Ready to send") | A legend, or icons only (TC2) | No reader understood the icons without a legend |

## MB — Mobile

Decisions for narrow screens (under `--bp-wide`), tried in a lab and then moved into the prototype. They complete TC10.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| MB1 | 2026-11-13 | Mobile | A compact fixed top bar: "Back to drafts" left, "Menu" right (label moved by MB18) | The banner as it was, not fixed | The banner filled the first screen; going back was inside the email |
| MB2 | 2026-11-13 | Mobile | The draft bar is fixed at the bottom: reason, "Edit message" and the main action (see MB19) | The bar at the end of the email | The action was 1,500–2,000 px away from the verdict |
| MB3 | 2026-11-13 | Mobile | Compact verdict: explaining notes go under "Details"; "What changed" and Dana's frame stay visible | The whole verdict collapsible | It pushed the email off screen; what leads to action must stay visible |
| MB4 | 2026-11-13 | Mobile | Sheets over the draft have a top bar ("Cancel" or "Back to draft") and the main action fixed at the bottom | Actions only at the end | "Send request", "Approve" and "Send" came after the whole quoted message |
| MB5 | 2026-11-13 | Mobile | Simulation only in the menu; the drawer reaches two thirds of the screen | The button also under the list | It appeared twice and the drawer covered the page |
| MB6 | 2026-11-13 | Mobile | In an open card, the person's details come after the actions | Today's order | Explanation and actions must fit the first screen |
| MB7 | 2026-11-14 | Mobile | In the list, the mobile bar starts with the "DealDesk" wordmark, linking to the homepage | An empty left side | The list did not say which product you were in |
| MB8 | 2026-11-14 | Mobile | Notes and draft edge to edge, no rules above and below, text on one 16 px edge | Rules on every sheet, 12 px margins | One line per separation; one text edge |
| MB9 | 2026-11-14 | Mobile | On sheets over the draft, buttons are stacked, full width, main action at the bottom | Buttons in a zig-zag | A predictable order, main action near the thumb |
| MB10 | 2026-11-14 | Mobile | No pencil in the mobile edit bar; edit fields on the 16 px edge | A pencil on its own row; fields indented 24 px | "Editing" already says it in words |
| MB11 | 2026-11-14 | Mobile | The jump note closes with a × icon button, 40 × 40 px, named "Close the jump note" | "Close" as text, or icons for all buttons | × is the only icon clear without words; frees 30 px |
| MB12 | 2026-11-14 | Mobile | Narrow sample label: "Sample review · no email is sent", one line down to 320 px | The full label on two lines | Every fixed line costs space on every screen |
| MB13 | 2026-11-14 | Mobile | The jump note sits under the fixed bar and scrolls with the page | The note inside the fixed bar | Needed on arrival only; 41 fixed px less |
| MB14 | 2026-11-14 | Mobile | Scroll padding follows the real height of the fixed bars, measured by script | Fixed values (96 and 128 px) | At 320 × 568 focused controls ended under a bar (WCAG 2.4.11) |
| MB15 | 2026-11-14 | Mobile | Draft bar buttons have 12 px padding: two fit on one row at 360 px | 16 px, two rows at 360 px | 48 px less fixed bar on the most common Android width |
| MB16 | 2026-11-14 | Mobile | On touch screens, link lists are 48 px rows (jumps, "Starting points") | 24–32 px rows | Rows for a finger, not a pointer; only with `pointer: coarse` |
| MB17 | 2026-11-14 | Mobile | The focused skip link sits above the fixed bars | Under the top bar | Keyboard users on phones or tablets could not see it |
| MB18 | 2026-11-14 | Mobile | The sample label is the first line under the fixed bar and scrolls, with the jump note | The label in the fixed bar (MB1) | Needed on arrival only; fixed bar 90 → 65 px |
| MB19 | 2026-11-14 | Mobile | "Next" is read, not shown, in the draft bar; "Edit message" left, main action right, one row | "Next" visible, main action on its own row (MB2) | The filled button already says it; fixed bars drop to 26–30% at 320 px |
| MB20 | 2026-11-14 | Mobile | The mobile edit bar has only "Cancel" and "Save changes", one row; the reason stays written | The `aria-disabled` button also on mobile (UF31) | A full row for an action you cannot take; 175 → 127 px |

## UR — UI review

Clean-up after checking each state at 1440 and 375 px against the brief. No rule, state or model text changes.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| UR1 | 2026-11-13 | UI review | One top bar on wide screens: wordmark, sample label, role, two buttons; the jump note on a second line | The banner with wrapping texts | After a jump it had four text blocks on two lines, and no brand |
| UR2 | 2026-11-13 | UI review | "Next", selection and focus look different: "Next" is a small-caps label; selection is a highlight or ink frame; focus the only sepia ring | A double ring around "Next" | Three signals looked the same; keyboard users lost the focus |
| UR3 | 2026-11-13 | UI review | Content focused by a script shows the ring only after keyboard use | No ring, or the ring always | On load a focused title looked like a field |
| UR4 | 2026-11-13 | UI review | Say a thing once: "From an earlier check" only in the card header on wide screens; "You can send" once | Leaving the repetitions | The same phrase twice in one panel; the bar wrapped midway |
| UR5 | 2026-11-13 | UI review | A closed approved card says who and for which version: "Approved by Dana Whitfield · for version 2" | "Approved" only | The brief asks to see the current approval state |
| UR6 | 2026-11-13 | UI review | Homepage brand pass: white hero, numbered sections 01–05, limits in a box, final call on an ink band | Leaving the page flat, or a new palette | The page was correct but flat; only approved colours and fonts used |
| UR7 | 2026-11-13 | UI review | Three repetitions removed: one record title; "Removed · The next check confirms it"; a one-line jump note on mobile | Keeping them | The same name twice in a row; the note took three lines |
| UR8 | 2026-11-14 | UI review | The verdict says when the last check ran: "Checked at 10:28 · version 1"; "Run check" only when outdated | "Run check" always visible, or an automatic check (D4) | Shows a fresh review without a useless action |

## UG — Grid, spacing and type

First review of the app with the *Refactoring UI* rules, starting from the top bar and the drafts list.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| UG1 | 2026-11-13 | Grid | Type scale in whole pixels: 12 · 14 · 16 · 20 · 24 · 30 · 36; mono data at 14 | A 1.2 ratio scale with fractional steps | Fractional steps round differently and are too close; `em` compounds |
| UG2 | 2026-11-13 | Grid | The wordmark links to the homepage; "Restart sample" tertiary; "Simulation" last, outlined | "Back to homepage" next to the logo; Simulation under the list | Actions on top, demo information at the bottom; a left drawer kept notes visible |
| UG3 | 2026-11-13 | Grid | The list on one left edge; deal names in small grey capitals; subject 16 px, state 14 px, time 12 px mono | Icons 13 px off the deal names | Three left edges read as disorder; hierarchy by weight and colour |
| UG4 | 2026-11-13 | Grid | A page footer for the demo: sample label, interactive-draft note, Simulation description | Demo notes spread between bar and list | The page body should look like the finished product; the demo goes in one place |

## DP — Depth

Two rounds in a depth lab. They apply on wide screens (65rem and up); narrow screens stay as they are.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| DP1 | 2026-11-13 | Depth | Paper metaphor: draft, notes and anything on them are sheets with square corners and a thin edge | Soft-cornered modules, or a stack of sheets under the draft | Follows the brand (V13–V16) and says "document" |
| DP2 | 2026-11-13 | Depth | Three planes without glass, lighter when closer: page with list, notes sheet, white draft; two-part shadows, one light | Glass and blur, or a flat page | Depth from lightness, shadow and overlap, not effects |
| DP3 | 2026-11-13 | Depth | One height for all: draft, notes and sheets fill the window and scroll inside; bars stay fixed | Height by content, a fixed pixel height | Components no longer jumped; the main action is always in view |
| DP4 | 2026-11-13 | Depth | A sheet over the draft has the draft's size, laid 12 px down-right; the rest gets a veil | A narrower centred sheet with a dark scrim | The request "arrives on" the draft; sent, you return to it |
| DP5 | 2026-11-13 | Depth | The final review is the draft rising: same place, 4 px up, a larger shadow | A new sheet over the draft | It is the same object; the message would appear twice |
| DP6 | 2026-11-13 | Depth | Motion with a meaning: in from below once; up when sent, down when cancelled; none with reduced motion | No animation, or one fade for all | The direction says what happened to the sheet |

## CL — Colour and app header

After a colour lab with four options on the real app. They reverse V3 and the border of V10.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| CL1 | 2026-11-13 | Colour | Two state colours, one meaning each: carmine where the message must change, forest green only in "Ready to send". Colour is a second signal | Monochrome (V3), colour in notes only, or colour everywhere with ochre | Colour is seen before reading; ochre clashed with sepia |
| CL2 | 2026-11-13 | Colour | The simulation is a yellow legal-pad note (`--legal-pad`); secondary text on it is brown, never grey | A double border (V10), grey background, no sign | One colour for one thing: a note on the desk, not the product |
| CL3 | 2026-11-13 | Colour | One warm grey ramp, 50–900, in HSL; Paper, Stone, Graphite and Ink are steps of it | Nine hex values chosen one by one | Every grey comes from a scale |
| CL4 | 2026-11-13 | Colour | Selection is the proofreader's highlight, also on the recipient | Recipient in negative ink (UR2) | The black block looked like another problem |
| CL5 | 2026-11-13 | Colour | A line under the top bar, the same above the footer | No line under the bar | The page has a start and an end |
| CL6 | 2026-11-13 | Colour | "DealDesk  Drafts" in the bar: the list title next to the wordmark is the page title | The title at the top of the list | The bar says where you are; the list gains a row |
| CL7 | 2026-11-13 | Colour | The Restart question sits on the bar's line, centred with its buttons | Aligned to the top next to the role | It was misaligned beside another sentence |
| CL8 | 2026-11-13 | Colour | The jump note belongs to the demo: on the yellow note, closed with "Close" | Removing it, or grey in the bar | It tells the reviewer the sample restarted and explains the versions (OA11) |
| CL9 | 2026-11-13 | Colour | The wordmark without the caret; the caret stays as favicon | The caret before the wordmark (V14) | It pushed the logo 14 px off the shared left edge |

## GA — Grid and alignment

After a measured audit of six states at 1440 and 390 px. Spacing was on the scale; the faults were alignment.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| GA1 | 2026-11-13 | Grid | One header row for the page: "Review notes" becomes a band as tall as the draft header | First lines at 87, 103 and 105 px | Sheet edges aligned, but texts did not |
| GA2 | 2026-11-13 | Grid | The same inner margin in both sheets: notes from 16 to 24 px | Different margins per sheet | Both titles sit the same way in their sheets |
| GA3 | 2026-11-13 | Grid | In a card the title starts where its text starts (icon gap 8 → 12 px) | The title 4 px left of its text | A card had two text edges |
| GA4 | 2026-11-13 | Grid | In the request, the "Fix it first" note and the quoted message share one indent | 12 and 16 px indents | Two indented blocks with different indents |
| GA5 | 2026-11-13 | Grid | The "·" separator never starts a line: a non-breaking space before it | A normal space, or a fix in one place in code | A separator at line start reads as a bullet |
| GA6 | 2026-11-13 | Grid | The edit mode bar is the draft bar, without a 4 px frame; the sheet does not scroll on entry | The frame; automatic scrolling | One bar, one edge; what you edit stays in view |
| GA7 | 2026-11-13 | Grid | A card without a rule keeps its text where cards with a rule do | Text 3 px further left | Cards in a group share a text edge |
| GA8 | 2026-11-13 | Grid | Homepage on its grid: bullets hang outside; "Starting points" in the title column, links in the text column | Indented list; links off the grid | Two vertical lines govern the page |
| GA9 | 2026-11-13 | Grid | On the homepage the "Pending" row has an ink rule, as in the app | A red rule | Same state, same look |
| GA10 | 2026-11-13 | Grid | Before a new check, an open problem keeps its rule; a dashed edge and group title say "may be out of date" | Rule removed, card grey | After fixing one of two problems, the other looked fixed too |
| GA11 | 2026-11-13 | Grid | On wide screens the sample opens on Project Harbor's draft | An empty centre with "Select a draft to open it." | A page with nothing to do at first sight |
| GA12 | 2026-11-13 | Grid | The homepage opens with the app's bar: full width, wordmark 24 px from the edge, 56 px tall | A white header inside the centre column | Homepage and sample start the same way |
| GA13 | 2026-11-13 | Grid | Homepage texts are the sample's texts, for example "Works at Corvane Holdings, the client, but isn't listed on the Project Harbor deal team" | Different words for the same thing | Who opens the sample must find the same sentences |
| GA14 | 2026-11-13 | Grid | The homepage hero is the app's desk, with the sample draft laid on it as a sheet | A white band (UR6), or an ink bar | It shows at once the product's look: sheets on a desk |
| GA15 | 2026-11-14 | Grid | On wide screens each scrolling panel has scroll padding from its own measured bars | Fixed values, none in the notes | At 1040 × 768 focused items ended under a bar (WCAG 2.4.11) |
| GA16 | 2026-11-14 | Grid | List and notes shrink first between 1040 and about 1330 px (`clamp` between scale values) | Fixed maximum widths | At 1040 px the draft was the narrowest column |

## A11Y — Accessibility

After a check at 1440 and 390 px with axe-core (WCAG 2.2 A/AA), 24 px targets, keyboard path, focus trapping, reflow at 320 px, text at 200%, forced colours and reduced motion. No A/AA violations were found before these fixes.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| A11Y1 | 2026-11-14 | Accessibility | Foreground sheets are `section` with `role="dialog"` | `article`, which does not allow that role | A role a screen reader could ignore |
| A11Y2 | 2026-11-14 | Accessibility | Project names sit one level under the list title: `h2` on mobile, `h3` elsewhere | Always `h3` | The heading structure has no gaps |
| A11Y3 | 2026-11-14 | Accessibility | Every target is at least 24 px, including the mobile wordmark, "Details" and lone links | 20–21 px | WCAG 2.5.8 |
| A11Y4 | 2026-11-14 | Accessibility | Under forced colours, sheets keep a border: 1 px for draft and notes, 2 px for a sheet on the draft | Shadows only, or a border on every row | Depth shown by shadow must also show by border |
| A11Y5 | 2026-11-14 | Accessibility | On a narrow screen with no draft open, the list is the main landmark | No main landmark in the list view | Landmark users find the content |

## RU — Refactoring UI check

A general check with *Refactoring UI* on computed browser values: app in nine states at 1440 and 390 px, and the homepage.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| RU1 | 2026-11-14 | UI review | The hero title follows the scale: 36 · 48 · 60 px for phone, from 40rem, from 65rem | A fluid `clamp()` (40.58 px on a phone) | Fractional values round differently |
| RU2 | 2026-11-14 | UI review | Two weights for emphasis, no 700: titles and bold use 600 | The browser's default 700 | A weight nobody chose |
| RU3 | 2026-11-14 | UI review | No grey on a tint: secondary text on red or green takes the tint's dark shade; ink on the yellow note | Graphite on the tint | Grey on colour looks dirty |
| RU4 | 2026-11-14 | UI review | One filled button in the homepage's first screen: "Take a second look" is secondary | Two filled buttons side by side | The main action is to try the sample; the draft is a demonstration |
| RU5 | 2026-11-14 | UI review | The reading measure is 34em, about 70 characters per line | 65ch, which gave 79 with Atkinson's wide zero | 45–75 characters per line |
| RU6 | 2026-11-14 | UI review | The backdrop behind homepage sheets is the ink scrim | Pure black at 45% | One colour, one source |

## SM — The Simulation panel

After a control-by-control check at 1440 and 390 px. The drawer opened on the opposite side of its button, was not modal, used disabled checkboxes, and hid an active outage.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| SM1 | 2026-11-14 | Simulation | Simulation is a modal sheet on a scrim: from the right on wide screens, from below on narrow | A non-modal drawer on the left (TC9, UG2) | The button is on the right; the scrim says it is a demo remote |
| SM2 | 2026-11-14 | Simulation | White sheet, only the header on the legal pad, with "In the product, other people and services make these things happen…" | The whole panel yellow (CL2) | Yellow everywhere lowered control contrast and said nothing more |
| SM3 | 2026-11-14 | Simulation | "Things to try" is a report, not a form: a mark, "Done" / "Not yet", "n of 4 done" | Disabled checkboxes | An unusable control is a false signal; a jump also ticks items |
| SM4 | 2026-11-14 | Simulation | Jumps are a menu of states without "Jump:"; the current one is marked "On screen" | Underlined links all starting "Jump:" | Eight rows with the same word do not scan |
| SM5 | 2026-11-14 | Simulation | With a request waiting, the owner section says since when: "Waiting for Dana Whitfield since 10:34" | The button alone | The button did not say what to answer |
| SM6 | 2026-11-14 | Simulation | An active outage shows with the sheet closed: a crossed cloud, name "Simulation · Check outage on" | Only an announcement when it changes | A hidden switch left on is an error waiting |
| SM7 | 2026-11-14 | Simulation | Sections follow purpose: Owner response, Check service, Things to try, Jump to a state | The old order | The footer line describes the sheet in the same order |
| SM8 | 2026-11-14 | Simulation | 384 px sheet, 24 px margins, ruled sections with 24 px around, 12 px inside | 16 px everywhere | More space around a group than inside it |
| SM9 | 2026-11-14 | Simulation | The Simulation button counts "Things to try": "2/4"; read as "Simulation · 2 of 4 things tried" | No count, or also on Menu | With a modal sheet progress is not visible while working |
| SM10 | 2026-11-14 | Simulation | The outage switch has square corners, track and knob | A rounded track and round knob | Rounded and square together clash (V16) |

## VA — Viewport audit

An automated audit pressed every control in every state at 13 window sizes, from 320 × 568 and phones held sideways (568 × 320) to 1920 × 1080: 5,861 actions. It found no page errors, no horizontal scroll and no control without a visible response. It found the six problems below, plus the restart question that did not show on a phone. Each one has a test in `prototype/tests/viewport-audit.spec.mjs` or `restart-record.spec.mjs`.

| ID | Date | Phase | Decision | Instead of | Why |
|---|---|---|---|---|---|
| VA0 | 2026-11-15 | Mobile | "Restart sample" in the record's bar opens the menu on a phone, where the question is | The question in a closed menu | On a phone the button gave no feedback and threw an error |
| VA1 | 2026-11-15 | Accessibility | On a short phone, when the draft's title is hidden after opening, focus goes to the status at the top | Focus on a title under the bottom bar or off-screen | The focus must be visible (WCAG 2.4.11) |
| VA2 | 2026-11-15 | Simulation | The Simulation sheet keeps its scroll when it is drawn again | The sheet back at the top after the outage switch | The switch moved out of view on short phones |
| VA3 | 2026-11-15 | Grid | While editing, the bar holds "Cancel" and "Save changes" on every width, as on a phone (MB20) | "See why you can't send" on wide screens | At 1040 × 600 it wrapped the bar to 200 px and covered the new field |
| VA4 | 2026-11-15 | Mobile | On a phone held sideways, the bar of a view over the draft scrolls with it | A fixed bar | It left a third of 320 px to read the message |
| VA5 | 2026-11-15 | Accessibility | With a view over the draft open, "Skip to content" goes into that view | A skip link to the page behind it | The target was inert, so focus fell to the page |
| VA6 | 2026-11-15 | Accessibility | On a phone's drafts list, "Skip to content" goes to the list | A skip link to the hidden draft | The target was not shown |
| VA7 | 2026-11-15 | Product | When an exception has to wait for a new check, the card offers "Run check" under its note | Only the note "You can request an exception once the check is up to date." | After removing Sam Lee, the sentence card named an exception but showed no way to it (found on a phone) |
