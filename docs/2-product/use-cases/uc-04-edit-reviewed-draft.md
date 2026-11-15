# UC-04 — Edit a draft that was already checked

**Actor** coordinator (the owner's approval lapses) · **Origin** J1-V3.1, J1-V1.3, J1-OP-09, J1-OP-16 · **Requirements** APP-10, APP-26, CTX-17 · **Rules** RR5, D1, D1b, D4, D6, U5, TC12, INV-4, INV-5

**Goal.** Change a checked message and know what must be done again. Earlier decisions stay in the history.

## Main flow
1. **Coordinator** presses `Edit message` in the bottom bar.
2. **System**, if an approval is valid, shows in the bar: "Editing will make Dana Whitfield's approval outdated. You'll need to ask again." `Continue editing` · `Cancel`.
3. **System** turns the bar into the edit mode: "Editing · Changes aren't saved yet" · `Cancel` · `Save changes`. The verdict says "This is the status of the saved version (version 2). Your changes aren't saved or checked yet." and the reason "Can't send yet: save or cancel your changes first." (UF31).
4. **Coordinator** edits recipients, subject or text and presses `Save changes`.
5. **System** creates a new version. The check and the approval are out of date. "What changed since the last check" lists the changes, for example "Added 'We'll share the call notes after Friday.'"
6. **System** shows "Approved on version 2 · doesn't cover version 3" with `Request again`, and "Dana Whitfield's approval for Sam Lee covered version 2. If it's still flagged after the check, request again from Dana Whitfield." (OA7).

## Extensions
- No valid approval: editing starts at once.
- `Cancel`, or no difference: no new version ("No change made").

## Rules
- The edit mode exists so there is no version at each key (U5). It is visible for all its length to prevent a mode error [PATTERN R6-F2].

## Acceptance criteria
- With Sam approved, `Edit message` warns before editing.
- After saving, the user sees exactly what changed, and sending is blocked with the reason.
