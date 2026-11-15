# Journeys

These journeys are **task and error analysis**, not stories: what the person must do, where they can go wrong, why, and what the interface does about it. Each ends with opportunities, which become use cases.

| ID | File | Persona | Scope | Size |
|---|---|---|---|---|
| J1 | [j1-jordan-blake-coordinator.md](j1-jordan-blake-coordinator.md) | Jordan Blake | From draft to send | 14 steps, 5 variants, 22 opportunities |
| J2 | [j2-dana-whitfield-deal-owner.md](j2-dana-whitfield-deal-owner.md) | Dana Whitfield | App: deciding the exception (simulated) | 6 steps, 2 variants, 7 opportunities |
| J3 | [j3-chris-okafor-operations-lead.md](j3-chris-okafor-operations-lead.md) | Chris Okafor | Homepage → sample review | 8 steps, 2 variants, 8 opportunities |

Every `CTX`, `WEB` and `APP` requirement of the brief is cited by at least one journey, except format and scope ones (APP-13, 30, 32, 33, 38, WEB-18b), covered later.

**IDs:** `J1-2.1` step, `J1-V2` variant, `J1-MC1` critical moment, `J1-OP-03` opportunity. **Labels:** [BRIEF], [PATTERN Rn-Fn], [ASSUMPTION], [TO RESEARCH]. Emotions or thoughts are never presented as observed; the likely belief at a step is an [ASSUMPTION] unless the brief says it.

## Error taxonomy

The seven labels are **not one published taxonomy**. They are an analytic adaptation that combines Reason, Norman, and Parasuraman and Manzey.

| Type | Definition | Example | Countermeasure |
|---|---|---|---|
| **Mistake** | Wrong judgement in choosing the goal or the means | "Sam is from Corvane, so Sam is on the deal" | Explain the rule where needed, with the data; a generic confirmation does not help |
| **Slip** | An action different from the one intended | Removing Alex instead of Sam | Actions that name the object, undo |
| **Lapse** | A step or intention is forgotten | Not running the check again after an edit | Show the missing step and where to resume |
| **Mode error** | Right for the mode the person believes is active, not the real one (a kind of slip in Norman) | "I asked, so it is approved" | Status always visible, different in words and in structure |
| **Stale state** | *Our definition*: acting on results of an earlier state as if valid | Trusting the check made before the edit | Tie results to the version; show what changed |
| **Alert fatigue** | Weaker response after too many or repeated warnings | Treating a Blocking like a Note | Few warnings, not repeated, clear severity |
| **Automation bias** | Using the automated output instead of one's own check (omissions and commissions) | "It flagged nothing, so it's fine" | State the limits; show recipients and text at the end |
| **Complacency** | Watching the automation less than needed | Not rereading the text because "DealDesk checks it" | Make reading the content part of the final step |

An episode can have more than one label. The type is a mechanism the analyst assumes, not an observed fact.

## Severity scale

Severity refers to the **consequence** of the error if nobody catches it, not to how likely it is. It is an analyst's judgement on an ordinal scale, not a measured probability.

| Level | Definition | Examples |
|---|---|---|
| **High** | Deal information reaches unauthorised people, or the client receives a commitment that nobody authorised | Message sent to Sam without approval; "guaranteed" sent without approval |
| **Medium** | Delay, rework, a needless request to the owner, a decision taken on the wrong version | Asking for an exception for something that could be fixed; approval asked on a version that is then edited |
| **Low** | Friction or brief confusion, with no effect on the message | Not finding the overall status at once |

## The three comprehension questions

Each critical moment in the app journeys is measured against these questions, taken from APP-28:

1. **Who will receive the message** if I send it now?
2. **What has been approved**, and what is still waiting?
3. **Can I send? Why, or why not?**

For J3 (Chris, homepage) the questions are:

1. **Who is DealDesk for**, and which problem does it solve?
2. **What doesn't it do?**
3. **How do I try it?**
