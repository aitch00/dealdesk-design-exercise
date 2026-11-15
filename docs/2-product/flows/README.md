# User flows

The [state model](../state-model.md) says *what* can happen. The flows say *where* the user sees it and *how* they get there. Each flow follows scenarios of the state model, so each step names the command and the resulting state.

| ID | File | Actor | Scenario |
|---|---|---|---|
| F1 | [f1-homepage-to-sample.md](f1-homepage-to-sample.md) | Buyer | seed on entry |
| F2 | [f2-fix-and-send.md](f2-fix-and-send.md) | Coordinator | SC-1, Undo SC-6 |
| F3 | [f3-exception.md](f3-exception.md) | Coordinator, simulated owner | SC-2, SC-3, SC-7 |
| F4 | [f4-edit-after-review.md](f4-edit-after-review.md) | Coordinator, simulated owner | SC-4 |
| F5 | [f5-review-unavailable.md](f5-review-unavailable.md) | Coordinator, evaluator | SC-5 |
| F6 | [f6-resume-after-interruption.md](f6-resume-after-interruption.md) | Coordinator, simulated owner | SC-2, then D8 |

## Places

| Place | What it is |
|---|---|
| Homepage | `index.html` |
| Top bar | "Sample review", the role line, `Simulation`, `Back to homepage`, `Restart sample` |
| List | Left column, drafts grouped by deal (TC2, OA12) |
| Draft | Centre column, the message as an email; a bottom bar with `Edit message`, the reason and the final review button (TC12) |
| Review notes | Right column, first in focus order: verdict, cards grouped by who must act, "Resolved" (TC3, TC11). The first card to act on is open and marked "Next" (TC4) |
| Request | A second email laid over the draft (TC7) |
| Dana's view | The request in the foreground, as Dana reads it (TC8) |
| Simulation | A modal sheet from the right, from the bottom on a narrow screen (SM1) |
| Final review | A view laid over the page (TC1) |
| Record | `#/drafts/harbor/record` |

On a narrow screen the list comes first, the draft opens full width with the verdict on top and each card under the element it explains (TC10). Red marks what must change before the message leaves; green is only for "Ready to send"; the simulation uses yellow legal-pad paper (CL1, CL2).

**Learned while writing the flows.** The edit mode must stay visible all along (highest mode-error risk). The simulation must be reachable from the list, or F6 cannot be tried. The final review always opens; the block sits on `Send (simulated)`. A check failure uses `role="alert"`, the only exception to the single `status` region.

Decisions UF1–UF50: [decisions.md](../../decisions.md), section UF.
