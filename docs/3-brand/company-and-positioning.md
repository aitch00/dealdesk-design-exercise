# Company and positioning

> Everything is fictional. What comes from the brief is marked [BRIEF]; what I invented is marked [ASSUMPTION].

## The company

| Item | Content |
|---|---|
| Name | **DealDesk** [BRIEF] |
| Category | Review workspace for deal communications [BRIEF] |
| Customers | Boutique transaction-advisory firms [BRIEF] |
| Model | Subscription paid by the firm [BRIEF]; pricing and procurement are out of the exercise [BRIEF] |
| Base | London [ASSUMPTION] |
| Size | A small team, about 15 people [ASSUMPTION] |
| Founded | 2023 [ASSUMPTION] |

### What it does

DealDesk helps advisory teams **review a deal message before it leaves**: who receives it, what it promises, and whether the current version was checked [BRIEF].

### Short history [ASSUMPTION]

DealDesk starts from a simple observation. In small firms, mistakes in deal messages rarely come from a lack of skill. They come from speed: people handle several deals at once, with names and companies that look alike. Instead of one more compliance system, DealDesk offers a focused review step that speaks up only when there is something to look at.

### Modules

DealDesk is one workspace made of modules. The module names are my proposal [ASSUMPTION]; the functions come from the brief.

| Module | What it does | In the prototype |
|---|---|---|
| **Recipient check** | Compares the recipients with the deal team | Yes: the Sam Lee case |
| **Wording check** | Flags sentences that present as certain what is not | Yes: "Completion is guaranteed by 30 June." |
| **Owner decisions** | The coordinator requests an exception; the deal owner decides | Yes, with a simulated answer |
| **Review record** | A summary of what was sent, to whom, and who approved what | Yes, a short version |

**Out of scope [BRIEF]:** email integration, a legal or compliance engine, AI detection, a full audit-log product, a multi-user backend.

## Positioning

### Target

Boutique transaction-advisory firms. The managing partner or the operations lead decides; the deal coordinator uses the product every day; the deal owner approves or declines exceptions [BRIEF].

### Problem

A message can **look ready and not be ready** [BRIEF]:

- it includes the wrong person, often someone who works for the right client but is not on the deal;
- it uses words that present as certain what is not;
- it was checked, but someone edited it afterwards.

Generic warnings do not work, because people close them without reading [BRIEF].

### Category

Pre-send review for deal communications. It is **not** email, **not** compliance, **not** security.

### How it differs

The current alternatives are my assumption; they were not researched with firms.

| Current alternative [ASSUMPTION] | Limit | DealDesk |
|---|---|---|
| Checking again from memory | It relies on familiarity, which is the cause of the mistake | Compares with the recorded deal team |
| Asking a colleague "can you have a look?" | Not recorded, and it does not say what was approved | A specific request, a decision recorded per version |
| Generic warnings in the email client | All the same, so people ignore them | Specific warnings, next to the content, with different weight |
| Large compliance tools | Heavy; they slow every message | Slows down only when needed |

### What it is not

- It does not guarantee security, compliance or legal correctness [BRIEF].
- It does not replace people's judgment.
- It does not catch everything: the checks can miss things.

### Positioning statement

> **For** boutique transaction-advisory firms **that** send sensitive messages on several deals at once, **DealDesk is** a pre-send review workspace **that** checks who receives a message and what it promises, and records who decided each exception. **Unlike** generic warnings or heavy compliance tools, **it flags specific problems next to the content and speaks up only when there is something to decide.**

## Mission, vision and values

**Mission.** Help advisory teams send the right message to the right people, with decisions that can be traced.

**Vision.** A review so specific and so proportionate that nobody feels the need to get around it.

**Brand promise.** "We help you see what needs a second look, and we're honest about what we can't see."

| Value | What it means | How it shows in the product |
|---|---|---|
| **Precision** | Say exactly what, where and why | "Sam Lee is not on the Project Harbor deal team", not "Recipient issue" |
| **Honesty about limits** | Do not promise what the checks cannot guarantee | Every result is shown as the outcome of a check, never as a certainty |
| **Proportion** | Not every problem weighs the same | Blocking, Warning and Note have different words and structure |
| **Traceability** | Every decision has an author, a time and a version | The record says who approved what, on which version |
| **Respect for time** | Every warning must lead to an action | Buttons with specific verbs; no warning for its own sake |
