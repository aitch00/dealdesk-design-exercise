# Visual identity

> How DealDesk looks. The choices are [ASSUMPTION]: mine, checked against design rules and contrast, not tested with people. The values live only in `prototype/css/tokens.css`; this page explains the choices.

## Concept: "Proofread draft"

The second pass of a proofreader: a neutral sheet, dark ink, and one sepia ink for what you can do. Square corners, like paper. No alarm, no "AI" sparkle.

It comes from the one idea of the homepage: a message can look ready and not be ready. The proofreader is the one who gives the second look.

## Three directions explored

On 10 November I built three throw-away directions on the real homepage and app, with a switch at the top. Only colours, fonts and wordmark changed; the meaning of the states did not.

### Criteria, written before the comparison

| # | Criterion |
|---|---|
| a | Stands apart from the colours common in the category. I based this on a scan of category websites, which is not part of this repository |
| b | Fits the personality (calm, precise, discreet; "the pen, not the highlighter") and the idea of the second look |
| c | Does not interfere with the states: no brand mark that looks like a state mark |
| d | AA contrast on every pair; links easy to recognise |
| e | Works in the dense app view, not only on the homepage (QLT-05) |
| f | Cost: font families, licences, weight |

### The directions

| | 1 · Paper, not cream | 2 · Proofread draft | 3 · Technical memo |
|---|---|---|---|
| Idea | An evolution of the first version: identity from type and from the draft as an object | The proofreader's second pass | Ledger precision: versions and times as a signature |
| Paper | `#F4F4F1`, neutral | `#F5F4F1`, neutral | `#FFFFFF`; panels `#F5F6F7` |
| Ink | `#161B26` | `#221F1B`, warm | `#0E1116` |
| Action | Blue-black `#1F3F75` | Sepia `#7A4520` | Black, underlined links |
| Titles | Source Serif 4 | Newsreader | IBM Plex Sans 600 |
| Text | IBM Plex Sans | Atkinson Hyperlegible Next | IBM Plex Sans |
| Wordmark | "DealDesk" in serif | "DealDesk" in Newsreader with the proofreader's caret (‸) in sepia | "[ dealdesk ]" in mono |

All three pass AA contrast (lowest text contrast 6.78:1); all fonts are OFL.

### Comparison (self-assessment)

| | 1 | 2 | 3 |
|---|---|---|---|
| a · Stands apart | Partly: neutral paper helps, but blue-black is close to the navy of banks | **Yes**: no site in the scan used sepia | Yes among direct competitors |
| b · Personality and idea | Fits, but not distinctive | **Closest to the idea**: the caret is a correction mark, the ink is the pen's | Precise and calm; less human, more "tool" |
| c · States | No interference | The caret is a revision mark: it must never be a state mark | **Risk**: actions and states share the same black |

### Check with Refactoring UI

An 8-point check from *Refactoring UI*, measured on the homepage and the app. **It did not separate the directions**: all three scored 6 of 8. Both failures were in the shared system: three filled buttons in the first screen cancelled each other out, and the draft's edges vanished when blurred.

### The choice

**Direction 2, "Proofread draft"** (V13–V15): the only one that met (a) and (b) together. I added **square corners everywhere** (V16), to recall paper. From the check I applied one raised shadow for the draft and the sheets (V17) and one filled button per group (V18). The check, run again on the real page, passed 8 of 8.

Two conditions came with the choice:

- **The paper stays neutral** and the text stays in a modern sans. The risk of sepia is to look old-fashioned or like a law firm; cream paper would double it.
- **A five-second test** on the first screen: "What kind of product is this?" If more than one person in five answers "law firm" or "publishing", go back to direction 1. This test has not been run ([test protocol](../5-evaluation/test-protocol.md)).

## The current state

The identity kept changing as the app was checked. This is how it stands now.

### Logo

- **Wordmark** "DealDesk" in Newsreader 500, **alone** (CL9). In the app bar it is followed by the section, "DealDesk  Drafts" (CL6); on the homepage it stands alone.
- **The caret (‸) is now only the favicon**: a sepia caret on a square of paper (`prototype/favicon.svg`). It was first placed before the wordmark (V14), but it pushed the logo text 14 px off the left edge that the list, footer and notes share. The wordmark is enough.
- The caret is a brand mark only. It never marks a state and never appears in the app's rows or sentences.
- **Avoid:** shields, locks, eyes, radars, ticks. They suggest guaranteed security, surveillance or approval, which DealDesk does not promise.

### Colour

| Role | Name | Value | Use |
|---|---|---|---|
| Dark base | Ink | `#221F1B` | Text, wordmark, state icons and rules |
| Light base | Paper | `#F5F4F1` | Backgrounds; neutral, not cream |
| Neutral | Graphite | `#5A544D` | Secondary text, the dashed Warning rule |
| Accent | Sepia | `#7A4520` | Actions, links, focus, the favicon; never a state |
| Surface | White | `#FFFFFF` | The draft, panels |
| Greys | Warm ramp 50–900 | `#F9F8F5` … `#221F1B` | Every grey is a step of one ramp; Paper, Stone, Graphite and Ink are steps of it (CL3) |
| State: must change | Carmine | `#9B3138` (tint `#F9EBEC`, text `#691C21`) | Only where the message must change before it leaves |
| State: can go | Forest green | `#2E664A` (tint `#E8F3EB`, text `#19432F`) | Only in the "Ready to send" verdict |
| Simulation | Legal pad | `#FDF3C4` (edge `#E2CE8D`, text `#5F461C`) | What belongs to the demo, never the product |

**Two state colours, one meaning each (CL1).** At first the states were monochrome (V3), which forced people to read every row to find a problem. Now red means "the message must change before it leaves": the verdict, card rules, the sentence underline, the recipient's border, the list icon. Green appears only in the "Ready to send" verdict. Waiting, Warning and "check unavailable" stay in ink and graphite. Colour is always a second signal: the word, the icon shape and the solid or dashed rule stay (V9). Carmine (hue 356°) is far from sepia (25°): sepia is never a state, red is never an action. Secondary text on a red or green tint takes a shade of that tint, never grey (RU3).

**The simulation is a yellow legal-pad note (CL2).** Everything that belongs to the demo, not the product, sits on a yellow note laid on the desk: the "Simulation · Waiting for…" box, the band over the deal owner's view, the header of the Simulation sheet (SM2) and the note after a jump. It replaced a double border (V10), which was the heaviest frame on the screen around the least important content. Secondary text on the yellow is a brown of the same hue, never grey.

All declared pairs pass AA contrast; a script checks them.

### Type

| Use | Family | Weights |
|---|---|---|
| Wordmark, homepage titles, editorial captions (italic) | Newsreader | 400, 500, 400 italic |
| Text and interface | Atkinson Hyperlegible Next | 400, 500, 600 |
| Data: versions, times | IBM Plex Mono | 400 |

All OFL, self-hosted, with the licences in `prototype/fonts/` (V2, V15). Emphasis uses two weights only; there is no 700 (RU2).

**Type scale in whole pixels (UG1):** 12 · 14 · 16 · 20 · 24 · 30 · 36. It replaced a 1.2 ratio scale whose fractional steps rounded differently across browsers. Mono data are one step under the sans beside them (14). The homepage hero title follows the scale too: 36 px on a phone, 48 from 40rem, 60 from 65rem (RU1). The reading measure is 34em, about 70 characters per line (RU5).

**A known effect to watch:** Atkinson Hyperlegible Next draws a slashed zero ("30" looks like "3Ø"). It helps tell 0 from O in data, but it gives the draft a technical tone. To check in the test with people.

### Shape and depth: sheets on a desk

- **Square corners everywhere** (V16): buttons, fields, rows, panels, sheets, the focus ring, the outage switch (SM10).
- **Paper metaphor (DP1).** The draft, the review notes and anything laid on them are sheets of paper with square corners and a thin edge.
- **Three planes, no glass (DP2).** The page with the drafts list; the Review notes on their own sheet, one tone under white, with a small shadow; the white draft in front, with the largest shadow. Shadows have two parts (contact and cast) and one light from above. No glass, no blur.
- **One height for all (DP3).** The draft and the notes fill the window height; each scrolls inside, with its header and action bar fixed.
- **Sheets laid on the draft (DP4).** An exception request or the deal owner's view is a sheet of the draft's size, laid 12 px down and right; the rest gets a light veil.
- **The final review is the draft rising (DP5):** same place, 4 px higher, a larger shadow.
- **Motion with a meaning (DP6).** A sheet comes in from below once; it leaves upwards when sent and downwards when cancelled. No motion with `prefers-reduced-motion`.
- The homepage hero is the app's desk, with the sample draft laid on it (GA14). Under forced colours every sheet keeps a visible edge (A11Y4). Narrow screens keep a flat layout (MB).

### Images and icons

- Show **the real product with the real sample content** (Project Harbor), not generic mock-ups.
- Icons are linear, with an even stroke. Each state has an icon of a different **shape**. Warning has no icon: its word and dashed rule carry it (UF9).

### What to avoid

- Loud gradients, glassmorphism, neon, dark backgrounds with bright accents.
- Orange, mid blue, navy, plum, teal, lime and cream: common in the category, according to the scan.
- Dominant red or an "alarm" look.
- Decoration that competes with the content.
