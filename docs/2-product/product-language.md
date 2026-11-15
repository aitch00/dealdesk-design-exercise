# Product language — the state vocabulary

> State labels are **fixed**: they are the same on the homepage, in the app, in the record and in the process document.
> Status is always said **in words**. Colour and icon support it; they never replace it. Red marks where the message must change before it leaves; green appears only in the "Ready to send" verdict; waiting and Warning use ink and graphite (CL1).

## Severity of an issue
| Term | Meaning | Blocks sending? |
|---|---|---|
| **Blocking** | Must be fixed or approved by the owner. The word marks an issue on which **the coordinator must act** (UF26, UF29) | Yes |
| **Warning** | To check; the coordinator decides | No |
| **Note** | Information, no action | No |

## Outcome of an issue
| Term | Meaning |
|---|---|
| **Open** | Not handled yet |
| **Fixed** | Resolved by an edit of the coordinator |
| **Approved** | Exception approved by the owner for this version |
| **Declined** | Exception declined: a fix is needed |

## Owner decision
| Term | Meaning |
|---|---|
| **Not requested** | No request |
| **Pending** | Request sent, no answer. **It is not an approval.** |
| **Approved** | Approved, for the version shown |
| **Outdated** | Approved on an earlier version: **does not cover the current version** (D1). Shown as "Approved on version 2 · doesn't cover version 3". |
| **Declined** | Declined. Stays valid while the object is present (D1b). |

## Check labels (D7)
| Check | Label | Why |
|---|---|---|
| Recipients | **Not on the deal team** | Deterministic comparison with the team list |
| Wording | **Flagged wording** | Pattern based: it flags, it does not establish |

## Check status
| Term | Meaning |
|---|---|
| **Not run** | No check has run |
| **Checking…** | Check in progress; a display delay, since the model's check is atomic (UF13, UF15) |
| **Current** | Matches the current version |
| **Outdated** | The message changed after the check |
| **Unavailable** | The check cannot run now |

## Overall status of the message
| Term | When |
|---|---|
| **Needs a check** | Check not run (not reachable in the sample: the draft starts checked) |
| **Needs a new check** | Check Outdated |
| **Check unavailable** | Check Unavailable |
| **Blocked** | At least one Blocking issue open. In the status sentence it is the first word, as for the other states (UF7) |
| **Waiting for decision** | At least one decision Pending |
| **Ready to send** | All conditions met |
| **Sent (simulated)** | Simulated send done |

"Check" names the automated check; "review" names what a person does, as in "Review before sending" (OA6).

## Recurring system phrases
| Use | Text |
|---|---|
| Simulation labels | "Simulated: no email is sent" (UF8) · "Simulated owner response" |
| Pending | "Not approved yet. Sending stays blocked." |
| Unavailable | "Your draft is saved. Sending stays blocked until the check runs." |
| Earlier result during Unavailable and Needs a new check (UF27) | "From an earlier check (version 2). May be out of date." |
| Outdated approval (D1) | "Approved on version 2 · doesn't cover version 3" |
| Outdated request never decided (DV-6, 7b) | "Your request to Dana Whitfield was for version 1." with `Request again` |
| Resume (D8) | "Where you left off: waiting for Dana Whitfield since 10:42." |
| Send not available (D5) | "Can't send yet: [missing condition]." All nine reasons: DV-6 in the [data model](data-model.md) |
| Limit of the check | "Automated checks can miss things. Read the final message before sending." |
| Request outdated by an edit, before the check (UF27) | "Dana Whitfield's approval for Sam Lee covered version 2. If it's still flagged after the check, request again from Dana Whitfield." · "Your request to Dana Whitfield for Sam Lee was for version 1. If it's still flagged after the check, request again from Dana Whitfield." |
| Removed recipient, before the check | "Removed · The next check confirms it" |
| Counts (UF26) | "2 blocking issues" · "1 waiting for Dana Whitfield" (list and verdict) · card groups "1 blocking", "1 waiting for decision", "1 approved", "1 warning" |
| What to do on a Blocking (UF29) | "Remove Sam Lee, or ask Dana Whitfield to approve an exception." · "Edit the sentence, or ask Dana Whitfield to approve an exception." |
| Exceptions not approved in the final review (UF28) | "Not approved" · "Nothing approved for version 3." |

## Who must act (UF26, UF29)
Each blocking issue is named with the word of the person who must act. The word is the same in cards, flagged sentences, counts, the final review and the list.

| Word | Who acts | Issue and request outcomes |
|---|---|---|
| **Blocking** | The coordinator: fixes or asks for an exception | Open without a waiting request · Declined · request Outdated (approved or never decided) |
| **Pending** / "waiting for" | The owner | Request Pending |
| **Approved** | Nobody | Approved for the current version |

In explanations the severity word comes **before** the check label (D7): "Blocking · Flagged wording · …", "Blocking · Not on the deal team · …", "Warning · …".
