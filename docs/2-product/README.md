# 2 — Product and UX analysis

This folder shows how the product was worked out. It starts with people, tasks and errors. Rules and screens come later, and each one comes from an earlier step.

## The approach

A review tool is easy to discuss as a matter of taste: colours, layout, tone. That discussion rarely ends. These documents move the discussion to what the user does, where the user can go wrong, and what the screen must do about it. A client can disagree with a step, an error or a severity, and the change then flows into the rules and the screens.

The chain has six links. Each link cites the IDs of the one before it:

```
journeys  →  use cases  →  data model  →  state model  →  user flows  →  screens
```

1. **Personas and scenario**: three proto-personas and one fictional deal, from the brief and assumptions, not research.
2. **Journeys**: for each step, what the person believes, which error can happen, how serious it is, and what the interface does.
3. **Use cases**: 37 opportunities grouped into 14 goals.
4. **Product language and review rules**: one word per state, and when a message can be sent.
5. **Data and state model**: events are saved, states are calculated; an executable model checks the rules in every reachable state.
6. **User flows**: where the user sees each state.

Source labels used in every file: **[BRIEF]** from the brief · **[ASSUMPTION]** our hypothesis, not verified · **[PATTERN Rn-Fn]** an established pattern from our research notes (research R, finding F) · **[TO RESEARCH]** needs research with users.

The files describe the prototype as it is now: one page in three columns (drafts list, the draft as an email, "Review notes"), a "Next" mark on the first thing to act on, sheets laid over the page, red where the message must change and green only for "Ready to send". Quoted UI strings are the current ones. Times such as 10:42 are examples of one path. Decisions (D1, UF26, TC4, CL1 …) are in [decisions.md](../decisions.md).

**Reading order:** personas and scenario, then J1; then use cases and flows in any order.

## Files

| File | Content |
|---|---|
| [personas/](personas/) | Jordan Blake (coordinator), Dana Whitfield (deal owner), Chris Okafor (operations lead) |
| [scenario-project-harbor.md](scenario-project-harbor.md) | People, draft and expected issues of the sample deal |
| [journeys/](journeys/README.md) | Error taxonomy, severity scale, J1–J3 |
| [use-cases/](use-cases/README.md) | Actors, invariants, UC-01 to UC-14 |
| [product-language.md](product-language.md) | Fixed state terms and recurring system phrases |
| [review-rules.md](review-rules.md) | RR1–RR7, the send condition, the states-to-send matrix |
| [data-model.md](data-model.md) | Entities, derived values, history rules |
| [state-model.md](state-model.md) | Commands, properties, scenarios, results |
| [flows/](flows/README.md) | F1–F6 |
