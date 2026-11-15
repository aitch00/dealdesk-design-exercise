# Design system

This file describes how the brand becomes tokens, type, colour, components and accessibility rules in the prototype. The values live in one file, `prototype/css/tokens.css`. This file copies some values to make it easier to read. If the two differ, `tokens.css` is right. Each value in `tokens.css` names its source: the visual identity, a WCAG criterion, a decision, or an assumption that still needs confirming.

## 1. Principles

1. **The state is said in words.** Icon shape and rule style repeat it. Colour is only a second signal, never the only one (INV-9, WCAG 1.4.1).
2. **Severity shows in the mark, not in an alarm.** Blocking, Warning and Note differ by word, icon and rule style. The red is dark and quiet (R5, CL1).
3. **The explanation sits next to the thing it explains.** The reason sits beside the button, the explanation under the sentence, the card under its element on a phone (APP-04, D5).
4. **A corrected draft, one accent.** Neutral paper, dark ink, sepia only for actions, links and focus. Square corners. Depth only for sheets of paper (V13–V18, DP1).
5. **One source, checked.** Values live in one file. A script checks contrast and breakpoints (V11).

## 2. Type

**Families (V15).**

| Token | Typeface | Use |
|---|---|---|
| `--font-sans` | Atkinson Hyperlegible Next | Text and interface |
| `--font-mono` | IBM Plex Mono | Versions and times as data: list times, version labels, the record's data line (V7) |
| `--font-display` | Newsreader | Wordmark, homepage headings, the subject of the draft, italic captions |

Fonts are self-hosted as woff2 latin subsets, with their open font licences (V2). In a sentence, numbers stay in the sans with tabular figures.

**Scale (UG1, RU1).** Whole pixel values in rem. The scale replaced a 1.2 ratio, whose steps rounded differently in each browser and were too close to tell apart.

| Token | Size | Use |
|---|---|---|
| `--text-xs` | 12 px | Small-caps labels, deal names and times in the list |
| `--text-sm` | 14 px | Metadata, state words, section titles of the notes; `--text-data` (mono) |
| `--text-md` | 16 px | Body and interface |
| `--text-lg` | 20 px | Panel headings, wordmark in the app bar |
| `--text-xl` | 24 px | Draft subject, list title |
| `--text-2xl` | 30 px | Homepage section headings on wide screens |
| `--text-display` | 36 px | Homepage headings; the hero title on a phone |
| `--text-hero-md` | 48 px | Hero title from 40rem |
| `--text-hero-lg` | 60 px | Hero title from 65rem |

**Weights (RU2).** Regular 400 for text. Medium 500 for the wordmark, labels and homepage section headings. Semibold 600 for headings and state words. There is no 700: titles and bold text without a weight of their own use 600.

**Leading and measure.** `--leading-body` 1.5, `--leading-heading` 1.25 (assumptions). `--measure` 34em, about 70 characters per line (RU5).

## 3. Colour

### 3.1 Primitives

One ramp of warm greys (CL3). Every grey of the interface is a step of it.

| Token | Value | Use |
|---|---|---|
| `--grey-50` | #F9F8F5 | The Review notes sheet |
| `--grey-100` | #F5F4F1 | Paper |
| `--grey-200` | #EFEDE8 | The page under the sheets, top |
| `--grey-300` | #DDD8CF | The page, bottom; Stone, decorative dividers on white |
| `--grey-400` | #C5BDB1 | Lines on the page (under the bar, over the footer) |
| `--grey-500` | #8E867B | Large text and decoration only |
| `--grey-600` | #5A544D | Graphite: secondary text, control borders |
| `--grey-900` | #221F1B | Ink: text, the bar under the draft |

Other primitives:
- `--sepia` #7A4520: actions, links, focus and the caret of the favicon. Never a state (V13).
- `--white` #FFFFFF: raised surfaces, the draft and the sheets.
- `--highlight` #EFE6D2: the proofreader's highlight on the selected sentence and recipient (UR2, CL4).

### 3.2 State colours (CL1)

Two colours, each with one meaning. They always sit next to a word, an icon shape and a rule style.

| Meaning | Tokens | Where |
|---|---|---|
| **Red: the message must change before it can go** | `--red-600` #9B3138 (rules, icons, underlines) · `--red-100` #F9EBEC (tint) · `--red-700` #7E242A (secondary text on the tint) · `--red-800` #691C21 (text on the tint) | The Blocked verdict as a tinted notice, the card rule, the sentence underline, the border of a flagged chip, the icon in the list |
| **Green: it can go** | `--green-600` #2E664A · `--green-100` #E8F3EB · `--green-700` #22543B · `--green-800` #19432F | Only the "Ready to send" verdict |

Everything else stays in ink and graphite:
- Waiting: a solid ink rule. Sending waits, but there is nothing to change.
- Warning: a dashed graphite rule.
- Check unavailable: ink and graphite.

The carmine (hue 356°) stays far from the sepia of actions (25°). Under a red or green verdict, secondary text takes the notice's own tint, never grey (RU3).

### 3.3 Simulation (CL2)

The simulation is a yellow legal-pad note laid on the desk: `--legal-pad` #FDF3C4, its edge `--legal-pad-edge` #E2CE8D (decorative), and secondary text `--legal-pad-ink` #5F461C, a brown of the same hue. It marks the frame "Simulation · Waiting for…", the band of the deal owner view, the head of the Simulation sheet (SM2) and the jump note. Yellow is never a state. A dashed border is not used for the simulation, because it is the sign of Warning.

### 3.4 Roles

| Role | Token | Value |
|---|---|---|
| Page surface | `--color-surface` | Paper |
| Raised surface | `--color-surface-raised` | White |
| Text, secondary text | `--color-text`, `--color-text-secondary` | Ink, Graphite |
| Action, text on action, focus | `--color-action`, `--color-on-action`, `--color-focus` | Sepia, White, Sepia |
| Control border, divider | `--color-border-control`, `--color-divider` | Graphite, Stone |
| Bar under the draft | `--color-bar`, `--color-on-bar`, `--color-on-bar-secondary`, `--color-focus-on-bar` | Ink, White, Stone, White |
| Scrim behind a foreground view | `--color-scrim` | Ink at 55% |
| Veil under a sheet laid on the draft | `--color-veil` | Ink at 12% |
| Depth on wide screens | `--color-env-top`, `--color-env-bottom`, `--color-surface-notes` | grey-200, grey-300, grey-50 |

## 4. Space, borders, targets, breakpoints, motion

- **Space:** a 4 px base (assumption): `--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 24 · `--space-6` 32 · `--space-7` 48 · `--space-8` 64 px. A measured check found all paddings and gaps on this scale; the faults were alignment, now fixed (GA1–GA16).
- **Borders:** `--border-hairline` 1 px; `--rule-width` 4 px (the state rule on the left of a card); `--underline-width` 2 px (flagged sentence); `--focus-width` 3 px with `--focus-offset` 2 px.
- **Radii:** `--radius-control` and `--radius-panel` are 0. Corners are square, like paper (V16). The outage switch is square too (SM10).
- **Targets:** `--target-min` 24 px (WCAG 2.5.8); `--control-height` 40 px. On a touch screen, lists of links are 48 px rows (MB16).
- **Breakpoints (V5):** `--bp-narrow` 40rem and `--bp-wide` 65rem. Media queries use `min-width` only (mobile first), and a script checks it. From `--bp-wide` the page has three columns.
- **Motion:** `--duration-spin` 1 s for "Checking…"; `--duration-reveal` 180 ms for the second look and the homepage sheets; sheets come in from below in 280 ms and leave in 200 ms (DP6). With `prefers-reduced-motion: reduce` nothing moves.

## 5. Depth (DP1–DP6, V17)

On a wide screen the app is a desk with sheets of paper, lit from above. Lighter means closer.

| Plane | Surface | Shadow |
|---|---|---|
| 0 · The page, with the list | `--color-env-top` → `--color-env-bottom` | none |
| 1 · Review notes | `--color-surface-notes`, edge `--edge-paper` | `--shadow-notes` |
| 2 · The draft | White, edge `--edge-paper` | `--shadow-draft` |
| 3 · A sheet laid on the draft | White | `--shadow-sheet` |
| The draft risen for the final review | White | `--shadow-lift` |

Rules:
- Each shadow has two parts: a tight contact shadow and a soft cast shadow. There is no glass and no blur.
- Draft, notes and sheets take the height of the window and scroll inside, with their head and bar fixed (DP3).
- A sheet (exception request, deal owner view) has the draft's size and lies 12 px down and right (`--sheet-offset`). The draft shows at the top left, and a veil covers the rest (DP4).
- The final review is the draft rising 4 px (`--sheet-lift`) (DP5).
- On the homepage, `--shadow-raised` is used only for the draft and the sheets.
- On narrow and medium screens there are no planes: draft and notes go from edge to edge, separated by the tone of the page (MB8).

## 6. Icons

Inline SVG on a 24-unit grid, `--icon-size` 24 px (20 px in the list, `--icon-size-sm`), stroke `--icon-stroke` 1.75, round caps, no fill. Icons are `aria-hidden`: the text beside them already says the state. One shape for each meaning.

| Shape | States |
|---|---|
| Octagon with a bar | Blocked · Blocking |
| Circular arrows | Needs a new check |
| Clock | Waiting for decision · Pending |
| Struck cloud | Check unavailable (also on "Simulation" and "Menu" while the outage is on) |
| Check in a circle | Ready to send · Approved (same meaning, "condition met"; the word tells them apart) |
| Struck check (horizontal line) | Approved on an earlier version |
| Struck clock | Request outdated, never decided |
| X in a circle | Declined |
| Paper plane | Sent |
| Activity arc | Checking… (stops with reduced motion) |
| Pen | Edit mode bar (not on a phone, MB10) |
| × | Close the jump note on a phone (MB11) |

Warning has no icon. Its severity is in the word "Warning", the dashed underline and the dashed rule (UF9). The struck check uses a horizontal line, because a diagonal looked like the X of Declined at real size.

## 7. Components

**Top bar.** On a wide screen: the wordmark "DealDesk" (Newsreader, medium, no caret, CL9) leads home, then "Drafts", the role in grey, "Restart sample" as a quiet button, "Simulation" as an outline button with its counter in mono. A line in `--color-divider-page` sits under it (CL5). On a phone: a fixed compact bar on the raised surface with "Back to drafts" or the wordmark, and "Menu".

**Page footer.** A line, then the demo notes on the same left edge as the bar and the list (UG4).

**List item.** State icon at 20 px, centred on the first line; subject 16 px medium in ink; state 14 px grey under it; time 12 px mono grey on the subject's baseline. Deal names are 12 px semibold grey capitals with 0.06em letter spacing. One left edge for title, deal names and icons. The background of a hovered or selected row reaches into the margin (UG3).

**Verdict.** Icon, state phrase (first part as title, `--weight-semibold`), main action, the line "Checked at…", then the context. When the message must change it is a red tinted notice; "Ready to send" is a green one; other states are plain.

**Card.** A title button (icon or `[n]`, title, type), then the body. The left rule says what to do:
- solid red: change this before sending;
- solid ink: waiting;
- dashed graphite: Warning;
- none: Approved, Removed, Changed.

A card from an earlier check keeps its rule and adds a thin dashed border (GA10). The title starts where the explanation starts (GA3). The selected card has a closed ink frame (UR2).

**Chip.** A plain chip for a team member. A flagged chip is a button with the state icon and a red border. Waiting and approved chips are quieter. A removed chip is struck through. Selection is the highlight colour (CL4).

**Flagged sentence and marker.** Underline of `--underline-width`: solid red for Blocking, dashed for Warning, solid ink while waiting, and a dashed outline while editing. The marker `[n]` is a button. The selected sentence has the proofreader's highlight.

**"Next" mark.** A small-caps label in the action colour with an arrow. The action it marks becomes the filled button (UR2). Selection, "Next" and focus look different from each other.

**Buttons.** Primary (sepia, white text), secondary (graphite border), quiet (no border), `aria-disabled` (still focusable, text above the contrast minimum, V12), busy (`aria-busy` with the activity icon). There is no coloured destructive style: the verb says what the button does. In the app there is one filled button per screen. On the homepage the first screen has one filled button, and "Take a second look" is secondary (V18, RU4).

**Bar under the draft.** Ink, white text, light outline buttons, a white primary button and a white focus ring (TC12). The reason is on one line and the buttons sit under it, with the main action on the right (UR4). On a phone it is fixed at the bottom, with 12 px button padding (MB15). Below 352 px, a container query makes the buttons smaller (MB19).

**Sheets over the draft.** `section` elements with `role="dialog"` (A11Y1). They have the email's header and fields and the same dark bar. The deal owner view has the yellow band on top.

**Simulation sheet.** A 384 px white sheet with a yellow head, 24 px margins (16 on a phone), sections separated by a line with 24 px above and below, 12 px between items, section titles 14 px semibold graphite, a square switch track of 48 × 24 px (SM8, SM10).

## 8. Layout

- **Wide (from 65rem):** three columns, list · draft · Review notes. Between 1040 and about 1330 px the list goes from 256 to 208 px and the notes from 400 to 320 px, so the draft keeps room (GA16). Above that they stay fixed. The notes and the draft share one head line (GA1) and the same 24 px inner margin (GA2).
- **Narrow:** one column; the list first; the draft at full width with the notes above and the cards under their elements; fixed top and bottom bars.
- No horizontal scroll at 320 CSS px (WCAG 1.4.10). Long email addresses wrap.

## 9. Accessibility notes

- **Contrast (1.4.3, 1.4.11).** Every text/background pair and every border, rule, icon and focus pair used by the components is declared in `tokens.css`. A script fails below 4.5:1 for text and below 3:1 for the rest, using the unrounded ratio. `--color-divider` and `--grey-500` are decorative only and are left out on purpose.
- **Focus visible (2.4.7).** A sepia ring with a gap of surface between ring and control (C40). It is white on the dark bar. Content that a script focuses shows the ring only after keyboard use (UR3).
- **Focus not covered (2.4.11).** The scroll padding follows the real height of the fixed bars on a phone and of each panel's sticky head and bar on a wide screen (MB14, GA15). The focused skip link sits above the fixed bars (MB17).
- **Targets (2.5.8).** At least 24 × 24 px everywhere, including the phone wordmark, "Details" and the jump note (A11Y3).
- **Names (2.5.3).** Visible labels start the accessible names ("Request owner exception for Sam Lee", "Simulation · 2 of 4 things tried").
- **Structure.** Heading levels have no gaps (A11Y2). On a phone the list is the main landmark when no draft is open (A11Y5). Foreground views are modal: the rest of the page is inert.
- **Announcements (4.1.3).** One `role="status"` in the verdict, which empties after 3 seconds (OA2). `role="alert"` only for a failed check.
- **Forced colours.** Sheets keep a border: 1 px for draft and notes, 2 px for a sheet on the draft. Only the open draft is framed in the list (A11Y4).
- **Checked on 14 November** at 1440 and 390 px with an automated WCAG 2.2 A/AA check: no violations, a visible ring on every keyboard stop, focus kept in sheets, no horizontal scroll at 320 px, no cut text at 200 % text size, no motion with reduced motion.
- **Not checked:** a real screen reader, and Safari and Firefox.

## 10. Contrast results

Generated from `tokens.css`. Outcome: **PASS**, 62 pairs. Ratios are cut to two decimals; the check uses the unrounded value. Minimum: 4.5:1 for text, 3:1 for component boundaries, state icons and focus.

| Foreground | Background | Use | Ratio |
|---|---|---|---|
| `--color-text` #221F1B | `--color-surface` #F5F4F1 | text | 14.91 |
| `--color-text` | `--color-surface-raised` #FFFFFF | text | 16.40 |
| `--color-text-secondary` #5A544D | `--color-surface` | text | 6.79 |
| `--color-text-secondary` | `--color-surface-raised` | text | 7.47 |
| `--color-text` | `--color-highlight` #EFE6D2 | text | 13.22 |
| `--color-action` #7A4520 | `--color-highlight` | text | 6.26 |
| `--color-on-action` #FFFFFF | `--color-action` | text | 7.77 |
| `--color-action` | `--color-surface` | text | 7.07 |
| `--color-action` | `--color-surface-raised` | text | 7.77 |
| `--color-mark` #7A4520 | `--color-surface` / `--color-surface-raised` | boundary | 7.07 / 7.77 |
| `--color-action` | `--color-surface` | boundary | 7.07 |
| `--color-border-control` #5A544D | `--color-surface` / `--color-surface-raised` | boundary | 6.79 / 7.47 |
| `--color-rule-blocks` #9B3138 | `--color-surface` / `--color-surface-raised` | boundary | 6.60 / 7.26 |
| `--color-rule-warning` #5A544D | `--color-surface` / `--color-surface-raised` | boundary | 6.79 / 7.47 |
| `--color-focus` #7A4520 | `--color-surface` / `--color-surface-raised` | focus | 7.07 / 7.77 |
| `--color-state-icon` #221F1B | `--color-surface` / `--color-surface-raised` | icon | 14.91 / 16.40 |
| `--color-on-bar` #FFFFFF | `--color-bar` #221F1B | text | 16.40 |
| `--color-on-bar-secondary` #DDD8CF | `--color-bar` | text | 11.56 |
| `--color-bar` | `--color-on-bar` | text | 16.40 |
| `--color-on-bar-secondary` | `--color-bar` | boundary | 11.56 |
| `--color-focus-on-bar` #FFFFFF | `--color-bar` | focus | 16.40 |
| `--color-rule-blocks` | `--color-highlight` | boundary | 5.85 |
| `--color-rule-waiting` #221F1B | `--color-surface-raised` | boundary | 16.40 |
| `--color-state-blocks` #9B3138 | `--color-surface-raised` | icon | 7.26 |
| `--color-state-blocks` | `--color-surface-notes` #F9F8F5 | icon | 6.84 |
| `--color-state-blocks` | `--color-env-bottom` #DDD8CF | icon | 5.12 |
| `--color-state-blocks` | `--color-state-blocks-tint` #F9EBEC | icon / boundary | 6.27 |
| `--color-state-blocks-text` #691C21 | `--color-state-blocks-tint` | text | 10.13 |
| `--color-text` | `--color-state-blocks-tint` | text | 14.16 |
| `--color-text-secondary` | `--color-state-blocks-tint` | text | 6.44 |
| `--color-state-blocks-secondary` #7E242A | `--color-state-blocks-tint` | text | 8.34 |
| `--color-state-ready-secondary` #22543B | `--color-state-ready-tint` #E8F3EB | text | 7.69 |
| `--color-state-ready` #2E664A | `--color-state-ready-tint` | icon / boundary | 5.92 |
| `--color-state-ready-text` #19432F | `--color-state-ready-tint` | text | 9.78 |
| `--color-text` | `--color-state-ready-tint` | text | 14.41 |
| `--color-text-secondary` | `--color-state-ready-tint` | text | 6.56 |
| `--color-text` | `--color-simulation` #FDF3C4 | text | 14.68 |
| `--color-on-simulation-secondary` #5F461C | `--color-simulation` | text | 7.89 |
| `--color-action` | `--color-simulation` | text | 6.96 |
| `--color-border-control` | `--color-simulation` | boundary | 6.68 |
| `--color-focus` | `--color-simulation` | focus | 6.96 |
| `--color-text` | `--color-env-bottom` | text | 11.56 |
| `--color-text-secondary` | `--color-env-bottom` | text | 5.26 |
| `--color-text` | `--color-surface-notes` | text | 15.44 |
| `--color-text-secondary` | `--color-surface-notes` | text | 7.03 |
| `--color-action` | `--color-surface-notes` | text | 7.32 |
| `--color-border-control` | `--color-surface-notes` | boundary | 7.03 |
| `--color-rule-blocks` | `--color-surface-notes` | boundary | 6.84 |
| `--color-rule-warning` | `--color-surface-notes` | boundary | 7.03 |
| `--color-state-icon` | `--color-env-bottom` / `--color-surface-notes` | icon | 11.56 / 15.44 |
| `--color-focus` | `--color-env-bottom` / `--color-surface-notes` | focus | 5.48 / 7.32 |

The lowest pair is `--color-state-blocks` on the page bottom, 5.12:1, for an icon (minimum 3:1). The lowest text pair is secondary text on the page bottom, 5.26:1 (minimum 4.5:1).

## 11. Limits

- **State colour (CL1).** It still needs testing with people. Will the green verdict read as "approved by someone"? Will the red feel like an alarm after repeated use (R5)?
- **Assumptions.** Spacing base, leading, `--control-height`, `--icon-stroke` and `--white` are still to be confirmed.
- **Not tested:** a real screen reader; browsers other than Chromium.
