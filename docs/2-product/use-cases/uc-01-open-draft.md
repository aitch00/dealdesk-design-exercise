# UC-01 — Open a draft from the list

**Actor** coordinator · **Origin** J1-1.1, J1-V5.1, J1-OP-01, J1-OP-20 · **Requirements** APP-03, APP-21, APP-34, CTX-10 · **Rules** D8, U8, INV-9

**Goal.** Open the right draft and see at once if anything happened since last time. Opening or closing a draft changes no data.

## Main flow
1. **System** shows the drafts list in the left column, titled "Drafts" and grouped by deal. Each item shows the subject, the status in words under it (for example "Blocked · 2 blocking issues", "Ready to send") and the last activity time (TC2, OA12). With no draft open, the centre says "Select a draft to open it." (OA5).
2. **Coordinator** chooses "Project Harbor — timeline update" in the Project Harbor group.
3. **System** opens the draft in the centre, titled "Project Harbor", and the "Review notes" panel on the right (UC-02).

## Extensions
- **1a.** A request is waiting: "Blocked · 1 blocking issue · 1 waiting for Dana Whitfield", or "Waiting for Dana Whitfield since 10:42" (UF26, D8).
- **3a.** Jordan had worked on the draft before: "Where you left off: waiting for Dana Whitfield since 10:42." or "Where you left off: ready to send."
- **3b.** A decision arrived meanwhile: "Since you left: Dana Whitfield approved Sam Lee (10:51)." Continues with UC-07.
- **3c.** The draft was sent: the record opens (UC-11).
- **3d.** A static draft: "This draft isn't interactive in the sample." The list says "Only Project Harbor — timeline update is interactive in this sample." (U8).

## Rule
The status in the list is the same `Draft.status` as in the draft. There is no second source.

## Acceptance criteria
- The status is written in words, not only shown by the icon.
- A waiting request says who must answer and since when.
