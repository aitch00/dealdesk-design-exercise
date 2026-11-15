// Labelled jumps to a state (decision UF5). A jump restarts from the seed and
// replays the first commands of a scenario in model/scenarios.json, counting
// only steps that carry a command (decision UF18), so a jump cannot build a
// state the model would not reach.

import { initialState } from "./model.js";
import { replay } from "./scenario-runner.js";

export const JUMPS = {
  flagged: { scenario: "SC-1", commands: 0, route: "#/drafts/harbor" }, // the seed, restarted (UF42)
  "escalated-first": { scenario: "SC-7", commands: 1, route: "#/drafts/harbor" }, // the brief's order (UF30)
  pending: { scenario: "SC-2", commands: 3, route: "#/drafts/harbor" },
  approved: { scenario: "SC-2", commands: 4, route: "#/drafts/harbor" }, // Sam approved by Dana (UF42)
  "edited-after-approval": { scenario: "SC-4", commands: 5, route: "#/drafts/harbor" },
  "review-unavailable": { scenario: "SC-5", commands: 3, route: "#/drafts/harbor" },
  ready: { scenario: "SC-1", commands: 3, route: "#/drafts/harbor/review" },
  sent: { scenario: "SC-1", commands: Infinity, route: "#/drafts/harbor/record" },
};

export const JUMP_ORDER = ["flagged", "escalated-first", "pending", "approved", "edited-after-approval", "review-unavailable", "ready", "sent"];

export async function buildJump(id, seed, scenarios) {
  const jump = JUMPS[id];
  const scenario = scenarios.scenarios.find((sc) => sc.id === jump.scenario);
  const state = await replay(initialState(seed), scenario, scenarios.constants, jump.commands);
  return { state, jump };
}
