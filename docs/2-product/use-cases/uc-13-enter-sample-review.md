# UC-13 — Enter, restart and leave the sample review

**Actor** buyer, evaluator · **Origin** J3-4b, 4d, J3-OP-06 · **Requirements** GEN-07, GEN-14, APP-37 · **Rules** RR7, US5, INV-10

**Guarantee.** No real data is asked for or kept outside the browser. The sample starts from the first state of Project Harbor.

## Main flow
1. **Buyer** presses `Try the sample review`. It opens `app.html#/start`, which always goes back to the seed (US5).
2. **System** creates a sample session from the seed and opens the drafts list (UC-01).
3. **System** shows the top bar: "Sample review · Project Harbor · Simulated: no email is sent", "You're working as Jordan Blake, deal coordinator." (US7), `Back to homepage` and `Restart sample`. On a narrow screen: "Sample review · no email is sent".

## Extensions
- **`Restart sample`**: on the line of the top bar, "Restart the sample? Your changes will be cleared." `Restart` · `Cancel` (CL7). `Restart` puts every entity, the outage switch included, back to the seed. `Esc` cancels.
- **`Back to homepage`**: the session stays in the browser.
- **A jump** (from the homepage "Starting points" or the Simulation sheet) restarts the sample and replays the steps to one state. A note on a yellow slip says "Jumped to: ‹state›. The sample restarted to show this state." and lists the versions made on the way, with "Close" (OA11, CL8).

## Rules
- The top bar is always visible and never covers the focus (WCAG 2.4.11).
- There is one seed, described in the [scenario](../scenario-project-harbor.md).

## Acceptance criteria
- The call to action opens the first state (2 Blocking, 1 Warning) without login.
- After `Restart`, everything is back to the first state, outage included.
