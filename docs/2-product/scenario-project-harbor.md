# Scenario — Project Harbor

> Fictional content of the exercise. **[BRIEF]** = from the brief · **[ASSUMPTION]** = invented by us.

## Organisations
| Name | Role |
|---|---|
| Halden & Ward Advisory [ASSUMPTION] | Advisory firm that uses DealDesk |
| Corvane Holdings [ASSUMPTION] | Client company of the deal |

## People on the deal
| Person | Organisation | Relation to Project Harbor | Expected result |
|---|---|---|---|
| Pat Morgan | Halden & Ward | Advisor assigned to the deal [BRIEF] | Valid recipient; Note with organisation, role and "On deal team" |
| Alex Rivera | Corvane Holdings | Assigned client representative [BRIEF] | Valid recipient; the same Note, role "Client representative" (D2) |
| Sam Lee | Corvane Holdings | Same client, **not on the deal team** [BRIEF] | **Blocking** |

**Users at the firm:** Jordan Blake, the coordinator who prepares the message, and Dana Whitfield, the deal owner who decides exceptions [ASSUMPTION].

## The draft
**Subject** [ASSUMPTION]: Project Harbor — timeline update

**Body** (the highlighted sentence is [BRIEF], the rest [ASSUMPTION]):

> Hi all,
>
> Thanks for the productive session on Tuesday. The diligence workstreams are on track and we expect the remaining data-room requests to close this week.
>
> **Completion is guaranteed by 30 June.**
>
> We'll circulate the updated timeline and next steps by Friday.
>
> Best,
> Jordan

**First recipients**: Pat Morgan, Alex Rivera, Sam Lee [BRIEF].

## Expected issues
| # | Issue | Type of check | Severity | Possible resolutions |
|---|---|---|---|---|
| 1 | Sam Lee: **Not on the deal team** of Project Harbor | Recipients, deterministic (D7) | Blocking [BRIEF] | Remove Sam · Ask Dana for an exception |
| 2 | "Completion is guaranteed by 30 June.": **Flagged wording**, states a date as certain | Wording, pattern based (D7) | Blocking [BRIEF] | Reword · Ask Dana for an exception |
| 3 | "we expect the remaining data-room requests to close this week": **Flagged wording**, a timing expectation | Wording, pattern based (D7) | Warning [ASSUMPTION] (D2) | No action if the timing is confirmed · Reword |

Pat and Alex show a **Note**: information, not a warning (D2).

> Why case 3 exists: it shows **different severity within the same category**. "guaranteed" is a commitment: Blocking. "we expect" is an expectation: Warning [PATTERN R5-F3].

## Suggested rewording (example)
"We are working towards completion by 30 June."

> The sentence is an example, not a confirmed outcome [BRIEF].
