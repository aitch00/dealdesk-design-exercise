# UC-07 — Follow a waiting request

**Actor** coordinator; the owner's decision changes the status · **Origin** J1-V1.2, V1.3, V2.1, V5.1, J1-OP-15, 16, 17, 20 · **Requirements** APP-06, 19, 24 · **Rules** RR4, D1, D1b, D8, INV-3, INV-5

**Goal.** Always know the real state of a request; Pending is never shown as approved.

## Main flow
1. **System** shows Sam's card under the "1 waiting for decision" group: "Pending · Requested from Dana Whitfield at 10:42 · Not approved yet. Sending stays blocked." It has a clock icon and a solid ink rule, not red: the message does not need to change (CL1).
2. **System** shows the verdict "Waiting for decision · Requested from Dana Whitfield at 10:42" and "In this sample, answer as Dana from the Simulation panel."
3. When the decision arrives (UC-08), the system updates card and verdict and announces it once. Approved: "Approved · by Dana Whitfield · 10:51 · for version 2 · Simulated owner response"; with nothing else open, "Ready to send".

## Extensions
- **Declined**: "Declined · by Dana Whitfield · 10:55"; verdict "Blocked · Check up to date · Dana Whitfield declined an exception · Can't send yet"; `Remove Sam Lee` is primary, `Request again` secondary (D1b).
- **Outdated** after an edit: "Approved on version 2 · doesn't cover version 3" with `Request again` (UC-04); a request never decided: "Your request to Dana Whitfield was for version 1."
- The coordinator tries to send: "Can't send yet: waiting for Dana Whitfield's decision on Sam Lee." (D5).
- Coming back later: "Since you left: Dana Whitfield approved Sam Lee (10:51)." (D8).

## Rules
- The card of a recipient off the team always keeps "Not on the deal team" and `Remove Sam Lee` (US4).

## Acceptance criteria
- A Pending card contains "Not approved yet" and the verdict says "Waiting for decision".
- Approved shows who, when and for which version.
