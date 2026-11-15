# J3 — Chris Okafor, Operations Lead: from homepage to sample review

> Task and error analysis. Taxonomy and severity: [README.md](README.md). Decision D9: [decisions.md](../../decisions.md).

Chris does not work on a message; Chris judges the product. Here an "error" is a **wrong judgement about the product**, caused by the homepage. Severity is the consequence for the firm.

**Goal.** Decide if the workflow suits the firm and is worth proposing to the partners. **Failure:** Chris leaves because of a claim that is not credible, or keeps a wrong idea ("it guarantees compliance", "the coordinator approves alone"). Out of scope: pricing, procurement [BRIEF]. Requirements: CTX-01–08, WEB-01–20, APP-37, GEN-07.

**Facts.** The homepage explains who uses DealDesk, the problem, how review fits the team and its limits, with a route to the sample; no guarantees, invented figures, testimonials, logos or certifications [BRIEF]. **Assumptions:** Chris reads carefully, looks for limits first, sometimes on a phone. [ASSUMPTION]

## Task analysis

```
0. Decide if DealDesk is worth proposing
   1. Who is it for, which problem · 2. How it works, who decides
   3. What it doesn't do, are the claims credible · 4. Try the sample review
   Plan: 1 → 2 and 3 in any order → 4. The way to 4 is visible from 1.
```

## Steps

| Step | Error · type · severity | What the homepage does |
|---|---|---|
| 1 First screen ("another email client" [ASSUMPTION]) | Wrong category · mistake · Medium | "A second look before deal messages leave." and "DealDesk helps boutique transaction-advisory firms check who a deal message is going to and what it promises before it's sent. It asks for a decision only when something needs one." Next to it, the Harbor draft as written: "This message looks ready. Two issues block it, and one is a warning." `Take a second look` adds the marks |
| 2 Roles ("the coordinator can force it") | Misses the role control · mistake · Medium | "What you fix, and what the deal owner decides": "The coordinator fixes what they can, like removing Sam or rewording a sentence. An exception goes to the deal owner, and coordinators can't approve their own." Three cards open sheets: what the state means, who acts, what comes next. "Ready means this version" explains D1 [PATTERN R1-F2, R1-F3] |
| 3a Limits ("errors will disappear") | Too much trust · automation bias (organisational) · **High** | "What DealDesk doesn't do", same level as the other sections: it doesn't send email; it isn't a legal or compliance engine; "Its checks can miss things: it relies on an up-to-date deal team list, and flagged wording is a prompt to review, not a verdict."; it can't see a message after it leaves [PATTERN R3-F10, R6-F4] |
| 3b Claims ("all vendors exaggerate") | Rejects it for one overclaim · a design failure · Medium | Only allowed claims, each shown in the sample; no figures (D9); no testimonials, logos or certifications |
| 4a Find the trial | Thinks a sign-up is needed · Low | `Try the sample review`, twice, with "No sign-up. Sample data, nothing is sent."; in the sample, `Back to homepage` and `Restart sample` |
| 4b Enter the sample | Thinks the send is real · Low | Top bar "Sample review · Project Harbor · Simulated: no email is sent" (RR7) |
| 4c Walk the scenario | Sees only the happy path · lapse · Medium | "Things to try" in the Simulation sheet, four items marked "Done" or "Not yet"; the closed button shows "0/4" (SM3, SM9) [ASSUMPTION] |

## Variants

- **V1 Phone.** *Never reaches the limits* (lapse, Medium): a fixed order, title → subtitle → call to action → draft → sections, cards one under the other (UF36, UF39).
- **V2 Leaving because of a claim.** Prevented upstream: each claim is checked against the allowed list before publishing. A quality check on the copy, not an interaction.

## Critical moments

J3-MC1 first screen: in 10 seconds Chris names category and customer. J3-MC2 limits: Chris names two limits without going back. J3-MC3 after the sample: Chris explains why a waiting exception does not allow sending.

## Opportunities

J3-OP-01 first screen with category, customer, problem, call to action and the Sam case · OP-02 roles section · OP-03 limits with the same weight · OP-04 allowed claims only · OP-05 repeated call to action, "No sign-up" · OP-06 simulation banner with home and restart · OP-07 "Things to try" · OP-08 fixed mobile order.

**[TO RESEARCH]** Does stating limits raise trust? Is "Things to try" used?
