# UC-14 — Simulate outside events

**Actor** evaluator; the deal owner, played by the simulation · **Origin** J1-V1, V2, V4, J3-4c, J1-OP-21, J2-OP-05, J3-OP-07 · **Requirements** APP-25–27, 31, 37 · **Rules** RR3, RR7, D3, SM1–SM10, INV-2, INV-10

**Guarantee.** The simulation is never confused with the product, and the coordinator never approves (INV-2).

## Main flow
1. **Evaluator** presses `Simulation` at the top right. The closed button shows progress, "2/4" (SM9), and a crossed-out cloud while the outage is on (SM6).
2. **System** opens a modal sheet from the right, from the bottom on a narrow screen, over a scrim; `Hide simulation` closes it, as do `Esc` and a click on the scrim (SM1). Its header, on yellow legal-pad paper, says "In the product, other people and services make these things happen. Here you make them happen, to see how DealDesk responds." (SM2).
3. **System** shows four sections, in order (SM7):
   - **"Owner response"**: with a request waiting, "Waiting for Dana Whitfield since 10:42" and "Answer as Dana Whitfield" (UC-08); otherwise "No exception request waiting. Request one from the draft first.";
   - **"Check service"**: the switch "Simulate check outage", with "While on, the next check fails as if the service were down. Your draft is kept.";
   - **"Things to try"**, "n of 4 done": "Sam Lee is on the client's side but not on the deal. What does DealDesk say?" · "Ask the deal owner for an exception, then simulate the answer." · "Edit the message after the check." · "Simulate the check being unavailable." Each reads "Done" or "Not yet" (SM3);
   - **"Jump to a state"**: the current one marked "On screen"; "Each jump restarts the sample and replays the steps up to that state. What you changed is lost." (SM4).

## Extensions
- Switching the outage on: "Check outage simulated. The next check will fail." Off: "Check service available. Run the check again." An unavailable state stays until the check runs again.

## Rules
- The simulated decision is recorded **as Dana Whitfield** (INV-2) and labelled "Simulated owner response" (INV-10).

## Acceptance criteria
- With no request waiting, no decision is possible and the section says why.
- The sheet differs from the product by label, paper and position; Tab stays inside it.
