# Documentation

This folder holds the written work behind the DealDesk homepage and sample review. The [design process page](../process/) tells the story in eight steps. These files hold the detail.

## The approach

I started from people, not screens. First I wrote down the users, their tasks and the mistakes they can make: the coordinator who sends, the deal owner who approves, and the operations lead who buys. Each later choice points back to one of these tasks or mistakes, so a client can discuss facts instead of taste. Then I wrote the review rules as a model that a computer can run: what blocks a message, who can approve, and what an edit cancels. A script tests every sequence of actions against these rules. Only then did I design the interface. Because the rules are fixed and tested, the interface could change many times without changing what the product allows. The brand is a living reference: it started from the brief and grew with the project. How each part was checked, and what was not checked, is in [VERIFICATION.md](../prototype/VERIFICATION.md).

## Map

| Folder or file | What it holds |
|---|---|
| [1-requirements/](1-requirements/requirements.md) | The brief split into requirements with IDs, the desk research, and the coverage of each requirement by a screen |
| [2-product/](2-product/README.md) | Personas, journeys, use cases, the data model, the state model, the user flows and the product language |
| [3-brand/](3-brand/README.md) | Company and positioning, personality and voice, messaging, visual identity |
| [4-design/](4-design/README.md) | The interface: structure, screens and states, every visible string, and the design system |
| [5-evaluation/](5-evaluation/usability-review.md) | The usability review, the comprehension test, and the protocol for tests with real people |
| [decisions.md](decisions.md) | Every decision, with the option it replaced and the reason |

## Reading order

1. [Requirements](1-requirements/requirements.md): what the brief asks.
2. [Product](2-product/README.md): who uses it, what they do, and the rules.
3. [Design](4-design/README.md): how the interface shows the rules.
4. [Brand](3-brand/README.md): how it looks and sounds.
5. [Evaluation](5-evaluation/usability-review.md): what the tests found, and what changed.
6. [Decisions](decisions.md): when you want the reason for one choice.

## Generated files

Two files are written by scripts. Do not edit them by hand.

- [4-design/contrast.md](4-design/contrast.md), by `scripts/check_contrast.py`.
- [2-product/state-model-results.md](2-product/state-model-results.md), by `scripts/check_state_model.py`.
