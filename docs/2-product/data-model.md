# Data model

What exists (entities), what is calculated (derived values) and what never changes (history). The starting data of Project Harbor is [`model/seed.json`](../../model/seed.json), the single source for the prototype and the model checks.

## Principles

1. **Events are saved, states are calculated (M1).** A check, a request and a decision are saved facts. "Up to date", "Pending", `Draft.status` and `canSend` are calculated from them, so no state exists in two places.
2. **Content has a fingerprint.** Checks, requests and sends are tied to the `contentHash` of recipients, subject and text, not to the version number (U1).
3. **History is never rewritten.** A correction is a new record.

Modelling decisions M1–M7: [decisions.md](../decisions.md), section M.

## Entities

| Entity | Purpose and main attributes | Rules |
|---|---|---|
| `Organisation`, `Person`, `Deal` | Firm or client; people with `email` on the reserved `.example` domain; a deal with its owner | Working for the client does **not** mean being on the deal (RR1) |
| `TeamMember` | `dealId`, `personId`, `role`: the **source of truth** of the recipient check (D7) | An approved exception does not create a member. Fixed in the sample |
| `Draft` | `currentVersionId`, `interactive`, `lastOpenedAt`; `status` and `canSend` derived | Only the Harbor draft is interactive; the other 6 show a fixed label (U8) |
| `DraftVersion` | `number`, `recipients` (person + To/CC), `subject`, `body` paragraphs, `createdAt`; `contentHash` and `changeSummary` derived at creation | Content is immutable; `discardedAt` is set only by an Undo (M4) |
| `Check` | An **event**: `versionId`, `contentHash`, `startedAt`, `outcome` (`completed` / `failed`) | A failed check has no issues |
| `Issue` | Found by **one** check: `key`, `kind` (recipient / wording), `severity`, person or pattern and `matchedText`; `resolution` derived | Same `key` in two checks = same problem (M2, M3). Recipients are always Blocking. Notes are not issues |
| `WordingPattern` | A sample rule: `match`, `severity`, `label`, `explanation`, `suggestion` | "Guaranteed completion" is Blocking, suggestion "We are working towards completion by 30 June."; "Timing expectation" is a Warning without suggestion (M6) |
| `ExceptionRequest` | An **event**: `issueKey`, `contentHash`, `requestedBy`, `requestedTo`, `requestedAt`, `reason`; `status` derived | Only with an up-to-date check and a Blocking issue; one waiting request per issue |
| `Decision` | `requestId`, `decidedBy`, `outcome`, `note`, `decidedAt`, `supersedesId`, `simulated` | Append only; decider = owner ≠ requester; the last decision counts |
| `SendRecord` | An immutable snapshot: version, time, recipients, removed recipients, issue outcomes, decisions | Only with `canSend` true (INV-1); one per draft |
| `SampleSession` | `clock`, `triedItems`, `simulation`, `data` | Restart resets it to the seed; in memory if storage fails (M7) |

## Derived values

**DV-1 Fingerprint.** SHA-256 of a canonical, compact JSON of sorted recipients, trimmed subject and trimmed paragraphs. Same content, same fingerprint: this makes Undo work.

**DV-2 Check status.** Not run · Unavailable if the last check failed · Current if the last completed check has the current fingerprint · otherwise Outdated. "Checking…" is a display delay; the model's check is atomic (UF13). Unavailable stays until a check succeeds.

**DV-3 Issue outcome.** Declined if the last decision is a decline (D1b, any content) · Approved if approved on the current fingerprint (D1) · otherwise Open. **Fixed** is a difference: a key in an earlier check and absent now. Fixed issues go to "Resolved".

**DV-4 Request status.** Declined · Approved on the current content · Outdated if the fingerprint differs · otherwise Pending. A decline survives an edit; an undecided request on old content is Outdated.

**DV-5 Draft status.** First true row wins.

| # | Condition | Status label |
|---|---|---|
| 1 | Sent | "Sent (simulated)" |
| 2 | Not run | "Needs a check" |
| 3 | Unavailable | "Check unavailable" |
| 4 | Outdated | "Needs a new check" |
| 5 | A Blocking not approved and not waiting | "Blocked" |
| 6 | A Blocking waiting | "Waiting for decision" |
| 7 | Otherwise | "Ready to send" |

**DV-6 `canSend` and reason.** `canSend` = not sent AND check Current AND every Blocking approved (or gone) AND no request Pending. The last condition looks redundant but is a brief rule (RR4) and a **second barrier**: the state model showed it stops the send when an injected error counts a Pending request as approved. The reason (D5) is the first true case:

| # | Code | Text |
|---|---|---|
| 1 | `sent` | "Already sent (simulated) at 11:05." |
| 2 | `not-run` | "Can't send yet: run the check." |
| 3 | `unavailable` | "Can't send yet: review is unavailable. Your draft is saved." |
| 4 | `outdated` | "Can't send yet: the message changed. Run the check again." |
| 5 | `declined` | "Can't send yet: Dana Whitfield declined the exception for Sam Lee. Remove Sam Lee to continue." |
| 6 | `approval-outdated` | "Can't send yet: Dana Whitfield's approval covers version 2 only. Request again." |
| 7 | `request-outdated` | "Can't send yet: your request to Dana Whitfield was for version 1. Request again." |
| 8 | `blocking-open` | "Can't send yet: 2 blocking issues need action." |
| 9 | `pending` | "Can't send yet: waiting for Dana Whitfield's decision on Sam Lee." |

Row 7 came from writing the model: an undecided request can become outdated (SC-7). With one issue open and one waiting, the bar adds "Also waiting for Dana Whitfield's decision on Sam Lee." (US14).

**DV-7 What changed.** Recipients added, removed or moved, subject changed, paragraphs added, removed or changed (equal paragraphs aligned first). The verdict names the parts in order, "Recipients", "Subject", "Wording": "Recipients and wording changed since the last check (version 1)". The panel items: "Sam Lee removed" · "Sam Lee added" · "Sam Lee moved to To" / "moved to CC" · "Subject changed" · "Added '‹paragraph›'" · "Removed '‹paragraph›'" · "Wording changed in paragraph 3" (UF14).

**DV-8 Resume (D8).** "Since you left" lists decisions after `lastOpenedAt`; "Where you left off" gives status and reason. Shown only when opening the draft from the list (UF20).

**DV-9 Notes (D2).** A team member gets "‹name› · ‹email› · ‹organisation› · ‹role› · On deal team"; anyone else gets an issue instead.

**DV-10** "Changed" and "Removed in version n" in the final review compare the first version with the current one.

## History rules

- Seed entities are fixed. Versions, checks, issues, requests and send records are immutable. Decisions are append only; a correction has `supersedesId` (R2-F13).
- **New versions** come only from `Remove [name]`, `Apply wording` or `Save changes`, never while typing. Identical content gives "No change made".
- **Undo** exists for the last remove or rewording, until another action; no time limit (WCAG 2.2.1). The fingerprint returns, so check and approvals become valid again.
- **After the send** no versions, checks or requests.
- **Simulated clock (M5).** It starts at 10:30 and moves a fixed step per event (version +1 min, check +1, request +2, owner decision +9, send +2), so screenshots and tests repeat. Times such as 10:42 are examples of one path.
