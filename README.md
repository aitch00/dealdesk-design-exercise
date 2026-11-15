# DealDesk: reviewing a sensitive deal message

A design exercise. **DealDesk** is a fictional review workspace for boutique transaction-advisory firms: a deal coordinator checks who a deal message is going to and what it promises before it is sent, and exceptions go to the deal owner.

All companies, people and data are fictional. No real email is sent.

## Links

| What | Link |
|---|---|
| Start here | https://aitch00.github.io/dealdesk-design-exercise/ |
| Homepage (for the partner or operations lead) | https://aitch00.github.io/dealdesk-design-exercise/prototype/index.html |
| Sample review (for the coordinator) | https://aitch00.github.io/dealdesk-design-exercise/prototype/app.html#/start |
| Design process | https://aitch00.github.io/dealdesk-design-exercise/process/ |

### Starting points in the sample review

Each link restarts the sample and opens one state of the brief's scenario. The same list is in the homepage footer and in the Simulation panel.

| State | Address (after `/prototype/`) |
|---|---|
| From the start | `app.html#/start` |
| Sam flagged, nothing changed yet | `app.html#/jump/flagged` |
| Sam escalated, wording still open | `app.html#/jump/escalated-first` |
| Exception request pending | `app.html#/jump/pending` |
| Sam approved by the deal owner | `app.html#/jump/approved` |
| Approved, then edited | `app.html#/jump/edited-after-approval` |
| Check unavailable | `app.html#/jump/review-unavailable` |
| Ready to send | `app.html#/jump/ready` |
| Sent | `app.html#/jump/sent` |

## What is simulated

- The deal owner's answer: "Answer as Dana Whitfield" in the sample, on a yellow note.
- The check outage: a switch in the Simulation panel.
- The checks: fixed sample rules, not a real recipient or wording engine.
- The send: no email leaves the sample.

Only the Project Harbor draft is interactive. The other drafts in the list show work across several deals.

## Limits

- Tested in Chromium at desktop and phone widths. Not tested in Safari, Firefox or with a real screen reader.
- Comprehension tests used AI readers, not people. No other person has used the prototype yet.
- The personas and the brand are based on the brief and on assumptions, not on user research.

## Run it locally

The prototype is plain HTML, CSS and JavaScript, with no build step. It must be served over HTTP from the repository root, because it reads `model/*.json` and uses Web Crypto.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Repository

```
index.html          entry page with the three starting points
prototype/          homepage (index.html), sample review (app.html), design specimen, model parity page (tests.html)
prototype/tests/    browser tests (Playwright and axe-core); not loaded by the pages
process/            the design process page, with its images, and a Markdown version (process.md)
model/              sample data and scenarios shared by the prototype and the checks
docs/               requirements, product, brand, design, evaluation and the decision register
scripts/            Python checks: sample data, rules model, contrast, text sources, model traces
```

The map of the documentation is in [docs/README.md](docs/README.md).

## Run the checks

From the repository root. You need Python 3, Node.js and Chromium for Playwright.

```bash
python3 -I scripts/validate_seed.py
python3 -I scripts/check_state_model.py 8
python3 -I scripts/check_contrast.py
python3 -I scripts/check_sources.py
python3 -I scripts/export_traces.py --check
npm --prefix prototype/tests ci
npm --prefix prototype/tests test
```

What each check shows, the latest results, and what was not checked: [prototype/VERIFICATION.md](prototype/VERIFICATION.md).

## Tools

Designed and built with Claude (Anthropic) through Claude Code, used as a sparring partner and to build. Each step started from a plan I approved. How the output was checked is described in the process page, section 8.
