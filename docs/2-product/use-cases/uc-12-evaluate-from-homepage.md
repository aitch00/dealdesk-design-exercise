# UC-12 — Judge DealDesk from the homepage

**Actor** buyer · **Origin** J3-1 to 4a, J3-V1, J3-OP-01–05, 08 · **Requirements** WEB-01–20, CTX-01–08 · **Rules** D9, UF34–UF50

A light use case: the homepage is content, with no data and no state changes. **Guarantee:** nothing promises security, compliance, legal correctness or infallibility.

## Main flow
1. **Buyer** reads the first screen: "A second look before deal messages leave.", "DealDesk helps boutique transaction-advisory firms check who a deal message is going to and what it promises before it's sent. It asks for a decision only when something needs one.", `Try the sample review` and "No sign-up. Sample data, nothing is sent." Next to it, the Harbor draft as written: "This message looks ready. Two issues block it, and one is a warning."
2. **Buyer** presses `Take a second look`: two Blocking and one Warning appear next to the lines; the button becomes "Show it as written". "What a second look finds" says the same in words.
3. **Buyer** reads "What you fix, and what the deal owner decides". Three cards ("The check finds it", "The coordinator asks", "The deal owner decides") each open a sheet with "What it means", "Who acts" and "What happens next", `Next step` and `Open this state in the sample review` (UF47).
4. **Buyer** reads "Ready means this version", where each state links into the sample (UF48), and "What DealDesk doesn't do".
5. **Buyer** presses `Try the sample review` in "Take the second look yourself" (UC-13).

## Extensions
- The buyer presses the call to action at once: go to 5.
- Narrow screen: title → subtitle → call to action → draft → sections; cards one under the other.

## Acceptance criteria
- The first screen has category, customer, problem and the call to action, on desktop and mobile.
- No "guarantee", "secure", "compliant", "never", "always", "100%" or result figures outside the product replicas (UF40).
