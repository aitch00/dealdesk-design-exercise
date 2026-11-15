# 4 · Design: the interface specification

This folder describes the interface of the DealDesk sample review as it is now in the prototype (`prototype/`). The prototype is the reference for current behaviour. These files explain it, give the reasons, and hold every visible string.

## Reading order

| # | File | What it is |
|---|---|---|
| 1 | [structure.md](structure.md) | How the app went from separate screens to one page in three columns. It covers the diagnosis, the layered proposal, the comparison of two versions, the narrow-screen layout, and the reasons. Start here to understand the shape of the page. |
| 2 | [screens-and-states.md](screens-and-states.md) | Every screen and view: homepage, list, draft and Review notes, exception request, deal owner view, final review, record, static drafts and Simulation. It shows how each state of the draft appears and covers navigation, focus order, `Esc` and jumps. It also holds the full homepage copy. |
| 3 | [copy.md](copy.md) | The copy inventory: every string of the sample review, view by view, with placeholders such as `{owner}`, the writing rules behind it, and the decision that approved each new text. |
| 4 | [design-system.md](design-system.md) | Tokens, type scale, colour (with the two state colours and the simulation yellow), space, depth, icons and components. It ends with accessibility notes and the contrast results. |

## How the files relate to the prototype

- `prototype/js/copy.js` holds the app strings. `prototype/index.html` holds the homepage strings. Every string there appears word for word in `copy.md` or `screens-and-states.md`.
- `prototype/css/tokens.css` holds every visual value. `design-system.md` explains the tokens and copies some values to make reading easier; `tokens.css` wins if they differ.
- Decision IDs (TC1, MB4, CL1 …) and requirement IDs (APP-04, WCAG 2.4.11 …) are kept, so each rule can be traced to the decision that made it.

## Words used in these files

| Term | Meaning |
|---|---|
| H, A1–A4, P1, P2, B | The earlier IDs of the homepage, the four app views, the exception request, the Simulation controls and the banner |
| R1–R6 | The earlier regions of the draft review: header, state, recipients, message, summary, send area |
| Verdict | The head of the Review notes: the state phrase, the main action, the live region |
| Card | One issue in the Review notes; closed, open or editing |
| Wide / narrow | From `--bp-wide` (65rem) / below it |
| Coordinator, deal owner | Jordan Blake and Dana Whitfield in the sample |
