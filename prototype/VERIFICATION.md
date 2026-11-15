# Verification

This page says what was checked in the DealDesk prototype, how, and what was not checked. Each result below comes from a run of the checks in this repository. Nothing here claims more than the checks show.

All browser checks run in **Chromium only**, with Playwright 1.63.0 and axe-core 4.10.3, on Linux. The test runner serves the site from the repository root with `python3 -m http.server`, as GitHub Pages does.

## How to run the checks

Run every command from the repository root. You need Python 3 and Node.js. The browser tests need Chromium for Playwright (`npx --prefix prototype/tests playwright install chromium` if it is not installed).

```bash
python3 -I scripts/validate_seed.py
python3 -I scripts/check_state_model.py 8
python3 -I scripts/check_contrast.py
python3 -I scripts/check_sources.py
python3 -I scripts/export_traces.py --check
npm --prefix prototype/tests ci
npm --prefix prototype/tests test
```

Two scripts write a file:

- `check_contrast.py` writes [docs/4-design/contrast.md](../docs/4-design/contrast.md).
- `check_state_model.py` writes [docs/2-product/state-model-results.md](../docs/2-product/state-model-results.md).

## What the automatic checks show

| Check | What it shows | Result |
|---|---|---|
| `validate_seed.py` | The sample data is consistent. The review rules, applied to the sample draft, give exactly the issues the data declares: Sam Lee blocking, one sentence blocking, one warning. Sending is not possible at the start. | Pass |
| `check_state_model.py 8` | The rules model in Python passes 10 scenarios. It then tries every sequence of commands up to 8 steps, also commands that no screen offers, and checks 16 properties in every state. For example: a blocked message is never sent, and nobody approves their own request. | Pass: 28,900 states, 292,436 commands tried (230,790 refused by a rule), 16 of 16 properties hold |
| `export_traces.py --check` | `model/traces.json` is up to date with the Python model. It holds 100 random traces of 30 steps, and they reach every draft status and every reason that blocks sending. | Pass: 3,000 steps, 6 statuses, 9 reasons |
| `check_contrast.py` | Every colour pair declared in `prototype/css/tokens.css` meets WCAG 2.2 contrast (4.5:1 for text, 3:1 for large text, controls, focus and icons). Every media query uses `min-width` with a breakpoint token. | Pass: 62 pairs, 2 breakpoints, 18 media queries |
| `check_sources.py` | Every visible text of the prototype names its source, and the source contains it. A text points to [copy.md](../docs/4-design/copy.md) or [screens-and-states.md](../docs/4-design/screens-and-states.md); a decision points to an ID in [decisions.md](../docs/decisions.md). | Pass: 603 citations, 0 failures |
| Browser tests, all | The 305 Playwright tests below. Every test also fails if the page logs a console error. | 296 passed, 0 failed (about 2 minutes) |
| Model parity | The JavaScript model in the prototype gives the same result as the Python model, step by step, on the 10 scenarios and on the 100 traces. A test with a wrong expected value is reported as a failure, so the check is not empty. | 2 tests pass |
| Flows | The six user flows, end to end, on a wide and a narrow screen: text, ARIA attributes, focus after each action, `Esc`. | 14 tests pass |
| States | Each state of the draft is reached through commands and shows its phrase, icon, line style, actions and accessible names. | 22 + 15 tests pass |
| Accessibility | axe-core with the WCAG 2.2 A and AA rules on 18 views and states, at 1280 and 375 px. A page with a known error is also tested, so the check is not empty. Other tests cover 24 px targets and forced colours (Chromium emulation). | 41 tests pass; 0 violations in 36 axe runs |
| Keyboard and focus | Tab order through the bar, the list, the notes and the draft, with a visible ring on each stop. Focus stays inside a sheet. Tested with key events sent by Playwright. | 4 tests pass, plus focus checks in the flow tests |
| Mobile | The fixed top and bottom bars, the menu, the card order, and no horizontal scroll at 320 px. | 22 tests pass |
| Homepage | The order of the story, the second look, the three sheets, the page without JavaScript and with reduced motion. The homepage contains no guarantees or absolute claims. | 22 + 3 tests pass |
| Usability fixes | Each problem found in the usability review and the comprehension test is reproduced, and the fix is checked. | 41 tests pass |
| Interface rules | Grid and alignment, depth, colour and the UI review rules, measured in the browser. | 19 + 3 + 7 + 10 tests pass |
| Views | The app shell and addresses, the drafts list, the actions on the draft, the final review and the record, the Simulation panel, and the design specimen. | 12 + 6 + 16 + 10 + 19 + 3 tests pass |
| Copy | Every state label on screen is a term of [product-language.md](../docs/2-product/product-language.md). Every visible text node has a source. | 3 tests pass |
| Storage | The sample works when browser storage is blocked, and starts again from the seed when the saved session has an older format. | Pass |

The rules model was also run once to depth 10 after the last model change: 172,919 states, and all properties held. This was not run again for this page, because it takes much longer.

## Viewport audit

An automated audit pressed every control in every state of the sample review, on the homepage, the process page and the entry page, at 13 window sizes: 320 × 568, 375 × 667, 390 × 844, 412 × 915, 568 × 320 and 844 × 390 (phones held sideways), 768 × 1024, 1024 × 768, 1040 × 600, 1280 × 600, 1280 × 800, 1440 × 900 and 1920 × 1080. It made 5,861 actions and checked that each one changed something visible, raised no error, and left nothing hidden under a fixed bar or outside the window. It found seven problems, all fixed and covered by tests (decisions VA0–VA6; VA7 came from a test by hand in `docs/decisions.md`). The audit script was run once and is not part of the suite.

## What was checked by hand

- I tested every version of the prototype myself on a desktop screen and with the keyboard only.
- I tested it less on a phone. Most phone checks are the automatic tests at 375 and 320 px, and screenshots at 390 px.
- I looked at screenshots of every starting state at 1440 and 390 px after the main rounds of changes.
- During the work, scripted audits measured spacing, alignment, text sizes and target sizes in many states. The rules they found are now part of the browser tests.

## What was simulated

- **Comprehension tests used AI readers, not people.** New AI agents, who had not seen the prototype or the documents, answered four questions on eight states: who receives the message, what is approved, can it be sent, and what is the next action. Their answers were compared with the model. Three readers per round show a direction, not a measure. See the [usability review](../docs/5-evaluation/usability-review.md) and the [comprehension test](../docs/5-evaluation/comprehension-test.md).
- **The usability review was also done by AI agents**: a first use without documents, a cognitive walkthrough, two heuristic reviews and a language review.
- **The product itself is simulated.** The checks are fixed sample rules. The deal owner's answer comes from the Simulation panel. The check outage is a switch. No email is sent. The clock moves a fixed number of minutes for each event, so the same steps always show the same times.

## What was not checked

- **People.** No other person has used the prototype. The [test protocol](../docs/5-evaluation/test-protocol.md) for tests with real people is ready and has not been run.
- **Real screen readers.** No test with VoiceOver, NVDA or JAWS. Live regions, descriptions and focus moves were checked as attributes and as DOM focus, not as what a screen reader says.
- **Safari and Firefox.** Only Chromium was tested. No test on real phones or tablets.
- **Text-only zoom to 200 % (WCAG 1.4.4).** Not tested in the browser tests. Reflow was tested by changing the window width only.
- **Forced colours in a real system.** Only the Chromium emulation was tested, not Windows high-contrast mode.

## Known limits of the prototype

- Only the Project Harbor draft is interactive. The other drafts in the list are static.
- "Checking…" is a fixed delay of 800 ms. The check itself is instant.
- The prototype must be served over HTTP. Opening `index.html` from the file system does not work, because the page uses Web Crypto and loads data from `../model/`.
