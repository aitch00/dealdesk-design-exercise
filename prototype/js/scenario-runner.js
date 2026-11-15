// Runs the steps of model/scenarios.json against model.js. Used by tests.html
// to check the scenarios, and by the app's "Jump to a state" links, so a jump
// lands only in a state the parity tests have verified (decision UF5).
// Parameter resolution mirrors resolve() and with_paragraph() in
// scripts/check_state_model.py.

import { apply, cur, requests, Rejected, projection } from "./model.js";

// The extra paragraph goes before the sign-off; if present, it is removed.
export function withParagraph(state, text) {
  const body = [...cur(state).body];
  const at = body.indexOf(text);
  if (at >= 0) body.splice(at, 1);
  else body.splice(body.length - 1, 0, text);
  return body;
}

export function resolveParams(state, params, constants) {
  const out = {};
  for (const [k, v] of Object.entries(params ?? {})) {
    if (typeof v === "string" && v.startsWith("$")) {
      out[k] = v === "$latest" ? requests(state).at(-1).id : constants[v.slice(1)];
    } else {
      out[k] = v;
    }
  }
  if ("appendParagraph" in out) return { body: withParagraph(state, out.appendParagraph) };
  return out;
}

// Runs one scenario step: resolves its parameters and applies its command.
// Returns { state, rejected, message }; a rejected command leaves the state unchanged.
export async function runStep(state, step, constants) {
  const params = resolveParams(state, step.params, constants);
  try {
    return { state: await apply(state, step.cmd, step.actor, params), rejected: false, message: null };
  } catch (e) {
    if (!(e instanceof Rejected)) throw e;
    return { state, rejected: true, message: e.message };
  }
}

// Replays the first `commands` command steps of a scenario (steps without a
// command are assertions and are not counted, decision UF18). Throws if a
// command the scenario expects to succeed is rejected.
export async function replay(state, scenario, constants, commands = Infinity) {
  let s = state;
  let done = 0;
  for (const step of scenario.steps) {
    if (done >= commands) break;
    if (!step.cmd) continue;
    const r = await runStep(s, step, constants);
    if (r.rejected !== Boolean(step.rejected)) {
      throw new Error(`${scenario.id}: ${step.cmd} ${r.rejected ? `rejected: ${r.message}` : "should be rejected"}`);
    }
    s = r.state;
    done += 1;
  }
  return s;
}

export { projection };
