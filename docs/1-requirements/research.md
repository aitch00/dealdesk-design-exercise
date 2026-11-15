# Desk research R1–R7

**This is desk research, not user research.** It was done on 9 November 2026, on public sources: standards, official product documentation and published studies. No interviews and no tests with people are part of it. Product behaviours come from the documentation; they were not tried in the products.

**How to cite.** A document cites a finding, for example `R2-F4`, not a whole study. Each "What it means here" line is my interpretation for DealDesk, not a result of the source. Software documentation pages often have no date; they may have changed after the research date.

| ID | Topic | Used for |
|---|---|---|
| R1 | Maker–checker: who requests and who approves | Product rules, journeys |
| R2 | Approvals after an edit | Rule D1 |
| R3 | Recipient warnings in email products | Rule D2 |
| R4 | Wrong recipient as a cause of incidents | Homepage, rule D9 |
| R5 | Alert fatigue and warning design | Severity levels, design |
| R6 | Human error, automation bias, HTA and SHERPA | Journeys |
| R7 | WCAG 2.2 for states and errors | Design, prototype |

## Summary

### What the research confirmed

| My choice | Evidence |
|---|---|
| The coordinator requests and only the owner approves; the rule is on the **person**, not only on the role | R1-F3, R1-F8, R1-F2 |
| The record says who, when, what and on which version | R1-F5, R1-F6, R2-F13 |
| "Same company" is not "on the team", and email products do not check it | R3-F1; no native check against a project team was found (R3) |
| Specific messages, close to the content, never colour alone | R5-F9, R5-F10, R5-F13, R7 (1.4.1, 1.3.1) |
| Blocking, Warning and Note differ also in **behaviour** | R5-F3, R5-F11 |
| An outdated check must be shown as outdated | R6-F7, R2-F9 |
| Dismissing a warning does not resolve it | R3-F7 ("dismissing is NOT approving") |
| The product must state its limits | R3-F10, R6-F4, R5-F7 |
| The final review shows specific content, not a generic "Are you sure?" | R6-F11 |

### What the research changed

These became the product rules D1–D9 in the [decision register](../decisions.md#d--product).

- **D1.** Every approval belongs to the version it was given on. An edit to recipients or text makes it "Approved on version 2 · doesn't cover version 3". (R2-F1, R2-F5, R2-F9, and the comparison of variants in R2: an edit outside the approved part can still change its context.)
- **D1b.** A decline stays while its object is still there. (R2-F4)
- **D2.** No "external recipient" warning: a domain warning does not tell Sam from Alex, and it repeats on every client email. (R3-F1, R3-F2, R5-F2, R5-F3, R5-F12)
- **D5.** The blocked send button stays focusable, with the reason written next to it. (R7, disabled buttons)
- **D6.** One status live region; no announcements while typing. (R7, 4.1.3)
- **D7.** The recipient check is deterministic; the wording check is pattern-based and can be wrong. (R5-F4, R3-F10)
- **D8.** When a draft is opened again, say where the work stopped. (R6-F10)
- **D9.** No numbers on the homepage: the authority data mix channels and cannot be compared. (R4-F1–F4)

### Notes for the process page

- **Alternative not chosen:** removing only the approvals of the changed part (R2-F2), against removing them per version (D1). Fewer repeated requests against the risk of a changed context.
- **Published guidance:** the EDPB Guidelines 01/2021 (§123) list a check by another person and addressing from an up-to-date database among the measures against misdirected mail. It can be cited as an outside reference, **not** as proof that DealDesk works. It stays off the homepage because it is too close to a compliance claim (decision UF41).
- **Limit of any block:** a block changes behaviour but can stop legitimate actions (R5-F4). A metric to pair with any block: justified blocks against unnecessary blocks.

## R1 — Maker–checker

**Question.** Which principles justify keeping the person who requests an exception apart from the person who approves it?

| ID | Finding | Source |
|---|---|---|
| R1-F1 | Separation of duties means naming the duties to separate and setting permissions to match | [NIST SP 800-53 r5, AC-5, 2020](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf) |
| R1-F2 | The four-eyes principle is a set of checks: segregation of duties, cross-checking, dual control, double signatures | [Basel Committee, Core Principles, principle 26, 2024](https://www.bis.org/committees/bcbs/basel-framework/standard/bcp?allChapters=true) |
| R1-F3 | One person prepares, another validates; the author cannot authorise even with checker rights: "The same user who initiated the request cannot authorize the transaction" | [Oracle, Transaction Authorization](https://docs.oracle.com/cd/F35490_01/html/Loan_Servicing_User_Guide/Transaction_Authorization.htm) |
| R1-F4 | Where separation is not practical, management chooses other controls | [COSO, Internal Control, 2013](https://www.coso.org/_files/ugd/3059fc_1df7d5dd38074006bce8fdf621a942cf.pdf) |
| R1-F5 | An audit record must show the event, when, where, the outcome and who | [NIST SP 800-53 r5, AU-3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf) |
| R1-F6 | A review records the reviewer, the state, the time and the commit it covers | [GitHub, pull request reviews API](https://docs.github.com/en/rest/pulls/reviews) |
| R1-F7 | An approval can be dismissed as stale when the reviewed content changes | [GitHub, protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) |
| R1-F8 | "By default, the creator of a merge request (author) cannot approve it"; these rules are settings | [GitLab, approval settings](https://docs.gitlab.com/user/project/merge_requests/approvals/settings/) |
| R1-F9 | Review anxiety is linked to "rubber stamping" and skimming | [Lee and Hicks, 2024](https://doi.org/10.1007/s10664-024-10550-9) |
| R1-F10 | Adding people without clear duties can spread responsibility instead of making it stronger | [OECD, 2020](https://www.oecd.org/en/publications/policy-framework-on-sound-public-governance_c03e01b3-en/full-report/component-6.html) |

**What it means here.** Keep "Request" and "Approve" apart, check the person and not only the role, and tie each decision to the version it covers. A recorded approval proves the action, not the quality of the check.

**Not found.** No single definition that makes maker–checker, four-eyes and segregation of duties the same. No universal rule that **any** edit must cancel an approval. No error-reduction rates, so no numbers are proposed.

## R2 — Approvals after an edit

**Question.** How do existing products treat an approval when the approved content changes later?

| ID | Finding | Source |
|---|---|---|
| R2-F1 | GitHub can dismiss approvals when the diff changes, or keep them and ask for approval of the latest changes | [GitHub, protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) |
| R2-F2 | GitLab can remove only the approvals of the Code Owners of changed files | [GitLab, approval settings](https://docs.gitlab.com/user/project/merge_requests/approvals/settings/) |
| R2-F3 | GitHub separates "viewed" from the version that was actually reviewed | [GitHub, reviewing changes](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request) |
| R2-F4 | Azure Repos can reset approvals only, and keep reject or wait votes | [Microsoft, branch policies](https://learn.microsoft.com/en-us/azure/devops/repos/git/branch-policies?view=azure-devops) |
| R2-F5 | Google Drive resets approvals during an open review, but keeps final approvals | [Google, approvals in Drive](https://support.google.com/drive/answer/9387535?hl=en) |
| R2-F6 | SharePoint Server can keep the old version published while changes wait for approval | [Microsoft, SharePoint Server versioning](https://learn.microsoft.com/en-us/sharepoint/governance/versioning-content-approval-and-check-out-planning) |
| R2-F7 | Veeva QualityDocs can ask for a change approval before a new draft exists | [Veeva, change control, 2025](https://quality.veevavault.help/en/gr/15349/) |
| R2-F8 | Acrobat lets the certifier say which changes are allowed after certification | [Adobe, certify PDFs](https://helpx.adobe.com/acrobat/desktop/e-sign-documents/manage-digital-signatures/certify-pdfs.html) |
| R2-F9 | AEM Forms has a state for "signature valid, document changed later" (`ValidAndModified`) | [Adobe AEM 6.2 Forms Workbench Help, 2018](https://helpx.adobe.com/pdf/aem-forms/6-2/WorkbenchHelp.pdf#page=738) |
| R2-F10 | Workfront separates changes already approved from changes that need a new cycle | [Adobe Workfront, 2026](https://experienceleague.adobe.com/en/docs/workfront/using/review-and-approve-work/document-reviews-and-approvals/manage-asset-review-and-approval/doc-approvals-and-proofing) |
| R2-F11 | eIDAS: later changes to signed data must be detectable | [Regulation (EU) 910/2014, art. 26](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32014R0910) |
| R2-F12 | 21 CFR 11.70: signatures stay linked to their records | [FDA, 21 CFR 11.70](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11/subpart-B/section-11.70) |
| R2-F13 | 21 CFR Part 11 separates the audit trail from what makes a signature understandable: name, date, time, meaning | [FDA, 21 CFR 11.10](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11/subpart-B/section-11.10), [11.50](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11/subpart-B/section-11.50) |

**Variants compared** (my interpretation, not a study): cancel all approvals on any edit (simple, more repeated work), or only those of the changed part (fewer requests, but an edit elsewhere can change the context), or keep old decisions and ask for a check of the latest changes.

**What it means here.** Keep the approval recorded on the old version apart from whether it still applies to the current message.

## R3 — Recipient warnings

**Question.** How do products flag a possibly wrong recipient before sending, and can they tell a deal team member from a colleague at the same client?

| ID | Finding | Source |
|---|---|---|
| R3-F1 | Gmail warns about external recipients but skips known contacts | [Google, external recipient warnings, 2026](https://knowledge.workspace.google.com/admin/gmail/advanced/control-gmail-external-recipient-warnings) |
| R3-F2 | Outlook separates an information MailTip from a real restriction on a recipient | [Microsoft, MailTips](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/mailtips/mailtips) |
| R3-F3 | Apple Mail can mark in red the addresses outside set domains | [Apple, Mail composing settings](https://support.apple.com/en-gb/guide/mail/cpmlprefcomp/mac) |
| R3-F4 | Purview policy tips can go with a block the sender can override, with a recorded reason | [Microsoft Purview, policy tips](https://learn.microsoft.com/en-us/purview/dlp-use-notifications-and-policy-tips) |
| R3-F5 | Purview can show a pop-up before sending, based on specific recipients or groups | [Microsoft Purview, oversharing pop-ups, 2026](https://learn.microsoft.com/en-us/purview/dlp-osp-get-started) |
| R3-F6 | Gmail DLP separates "the sender goes on" from "an admin reviews" | [Google, DLP for Gmail, 2026](https://knowledge.workspace.google.com/admin/security/prevent-data-leaks-in-email-and-attachments-gmail-dlp) |
| R3-F7 | SafeSend asks to confirm recipients even if the banner is hidden: "dismissing is NOT approving" | [VIPRE, SafeSend Cloud guide, 2026](https://vipre.helpjuice.com/safesend-cloud-end-user-guide) |
| R3-F8 | Check Point suggests a corrected recipient; the sender can ignore it | [Check Point, misdirected email prevention, 2026](https://sc1.checkpoint.com/documents/Harmony_Email_and_Collaboration/Email_Security/Admin_Guide/Topics/dlp-policy-1/configuring-misdirected-email-prevention.html) |
| R3-F9 | Proofpoint warnings name the suspect recipient and explain the anomaly | [Proofpoint, M&A brief, 2024](https://www.proofpoint.com/sites/default/files/solution-briefs/pfpt-au-sb-preventing-email-data-loss-merger-and-acquisition-events.pdf) |
| R3-F10 | Tessian's specification admits false positives and missed cases | [Tessian, product specification](https://www.tessian.com/wp-content/uploads/2023/11/2022-10-Tessian-Specifications-Exhibit.docx-1.pdf) |
| R3-F11 | Repeated security warnings get less attention | [Anderson et al., 2016](https://www.jmis-web.org/articles/1304) |

**What it means here.** A domain is not an authorisation. Familiarity can hide a warning for someone who is known but not on this deal.

**Not found.** No documented native check that "every recipient is on this project's team". No independent study on the "same client, not on the team" case, so no effectiveness rates are given.

## R4 — Wrong recipient as a cause of incidents

**Question.** What do public, official sources say about messages sent to the wrong person as a cause of data incidents?

| ID | Finding | Source |
|---|---|---|
| R4-F1 | The ICO defines "email sent to the wrong recipient" and also reports a total that includes post and fax | [ICO, incident types](https://ico.org.uk/action-weve-taken/complaints-and-concerns-data-sets/data-security-incident-trends/glossary-of-terms/incident-types/); [ICO annual report 2024–25](https://ico.org.uk/media2/1wyfliqp/annual-report-2025-ico-v4-1-complete.pdf) |
| R4-F2 | The Irish DPC counts email and post to the wrong recipient separately for 2023 | [DPC annual report 2023](https://www.dataprotection.ie/sites/default/files/uploads/2024-08/DPC-EN-AR-2023-Final-AC.pdf) |
| R4-F3 | The DPC 2024 report confirms the problem, but its figures need care when read together | [DPC annual report 2024](https://www.dataprotection.ie/sites/default/files/uploads/2025-06/DPC_Annual_Report_EN_Low_Res.pdf) |
| R4-F4 | For 2025 the DPC names misdirected correspondence as the source of almost half of reported breaches | [DPC press release, 30 June 2026](https://dataprotection.ie/en/data-protection-commission-publishes-2025-annual-report) |
| R4-F5 | An ICO summary for solicitors and barristers separates misdirected email from post or fax | [ICO, legal sector 2015/16](https://ico.org.uk/media/1432992/infographic-legal-sector-data-breaches-and-complaints.pdf) |
| R4-F6 | Verizon DBIR 2024 reports misdelivery among errors and in professional services | [Verizon DBIR 2024](https://www.verizon.com/business/resources/T850/reports/2024-dbir-data-breach-investigations-report.pdf) |
| R4-F7 | Verizon DBIR 2022 names misdelivery as a main type in finance and insurance | [Verizon DBIR 2022](https://www.verizon.com/business/en-gb/resources/reports/dbir/2022/financial-services-data-breaches) |
| R4-F8 | A DPC case: an address thought to be a bank's sent financial documents to a restaurant | [DPC case study, 2021](https://dataprotection.ie/en/dpc-guidance/case-studies/disclosure-unauthorised-disclosure/financial-information-erroneously-ccd-restaurant-applicable-law-data-protection-acts-1988-and-2003) |

**What it means here.** The problem is real and recurring. The data do not show how likely one email is to go wrong, and they cannot show that a product reduces incidents. The categories mix channels and are not comparable across countries or years. This is why the homepage has no numbers (D9).

**Not checked.** Some figures that circulate in commercial articles were not verified against the primary data and are not used.

## R5 — Alert fatigue and warning design

**Question.** What does research say about alert fatigue and good warnings, for a product with **Blocking** (stops sending), **Warning** (asks for a check, allows sending) and **Note** (information only)?

| ID | Finding | Source |
|---|---|---|
| R5-F1 | A high override rate does not always mean wrong behaviour | [Van der Sijs et al., 2006](https://doi.org/10.1197/jamia.M1809) |
| R5-F2 | Repeated and dense alerts are linked to lower acceptance | [Ancker et al., 2017](https://doi.org/10.1186/s12911-017-0430-8) |
| R5-F3 | Alerts tiered by severity are linked to better compliance than uniform alerts | [Paterno et al., 2009](https://doi.org/10.1197/jamia.M2808) |
| R5-F4 | A nearly hard-stop alert changed behaviour and also caused harm (delays) | [Strom et al., 2010](https://doi.org/10.1001/archinternmed.2010.324) |
| R5-F5 | Warnings that vary in look resist habituation better than static ones | [Anderson et al., 2016](https://doi.org/10.1080/07421222.2016.1243947) |
| R5-F6 | Over time people follow security warnings less; varying the look helps | [Vance et al., 2018](https://doi.org/10.25300/MISQ/2018/14124) |
| R5-F7 | Better SSL warning design does not remove risky behaviour | [Sunshine et al., 2009](https://www.usenix.org/conference/usenixsecurity09/technical-sessions/presentation/crying-wolf-empirical-study-ssl-warning) |
| R5-F8 | Changing user decisions does not prove better final outcomes | [Holbrook et al., 2025](https://doi.org/10.1093/jamia/ocaf139) |
| R5-F9 | Error messages should say what went wrong and how to fix it | [GOV.UK Design System, error message](https://design-system.service.gov.uk/components/error-message/) |
| R5-F10 | Put the message close to the element that needs attention | [Nielsen Norman Group, 2023](https://www.nngroup.com/articles/error-message-guidelines/) |
| R5-F11 | Make warnings look different from errors; keep modals for important, actionable decisions | [Nielsen Norman Group, scoring rubric, 2023](https://www.nngroup.com/articles/error-messages-scoring-rubric/) |
| R5-F12 | Use few banners; put task information in context | [GOV.UK Design System, notification banner](https://design-system.service.gov.uk/components/notification-banner/) |
| R5-F13 | Make the type and urgency of an alert clear without colour or icon alone | [U.S. Web Design System, alert](https://designsystem.digital.gov/components/alert/) |

**What it means here.** Make the three levels differ in behaviour, not only in label or colour. Keep Blocking for reasons that are reliable. Do not repeat the same warning when nothing changed. Measure wrong sends avoided **and** legitimate sends blocked.

**Not found.** No direct test of Blocking / Warning / Note before sending a message: the studies are about prescriptions, browsers and software. No universal number of tolerable alerts.

## R6 — Human error and automation bias

**Question.** Which definitions separate the error types, and which methods can guide the analysis of a review before sending?

**Definitions used** (paraphrased): **mistake**, a wrong plan or judgment; **slip**, a different action than intended; **lapse**, a memory failure ([Reason, 1990](https://doi.org/10.1017/CBO9781139062367)); **mode error**, an action right for the mode you think is on but wrong for the real one ([Norman, 1981](https://doi.org/10.1037/0033-295X.88.1.1)); **acting on outdated information**, my working definition, based on NASA's rule on stale data; **alert fatigue**; **automation bias** and **complacency** ([Parasuraman and Manzey, 2010](https://doi.org/10.1177/0018720810376055)).

| ID | Finding | Source |
|---|---|---|
| R6-F1 | GEMS separates skill-based slips and lapses from rule- or knowledge-based mistakes | [Reason, 1990](https://doi.org/10.1017/CBO9781139062367) |
| R6-F2 | Making the mode perceivable can reduce mode errors in text editing | [Sellen, Kurtenbach and Buxton, 1992](https://doi.org/10.1207/s15327051hci0702_1) |
| R6-F3 | Automation bias causes omissions and commissions; accountability for accuracy can reduce them | [Skitka, Mosier and Burdick, 2000](https://doi.org/10.1006/ijhc.1999.0349) |
| R6-F4 | Practice and instructions alone do not remove complacency and automation bias | [Parasuraman and Manzey, 2010](https://doi.org/10.1177/0018720810376055) |
| R6-F5 | Asking for an own judgment first can reduce reliance on wrong AI advice, but people like it less | [Buçinca, Malaya and Gajos, 2021](https://doi.org/10.1145/3449287) |
| R6-F6 | Repeated alerts and complex work are linked to lower alert acceptance | [Ancker et al., 2017](https://doi.org/10.1186/s12911-017-0430-8) |
| R6-F7 | Interfaces must show when displayed data are no longer current | [NASA-STD-3001 vol. 2, V2 10020](https://www.nasa.gov/reference/10-0-crew-interfaces-vol-2/) |
| R6-F8 | HTA describes a hierarchy of sub-goals that other analyses can build on | [Stanton, 2006](https://doi.org/10.1016/j.apergo.2005.06.003) |
| R6-F9 | SHERPA has evidence of validity in some fields; this does not prove it for messaging | [Harris et al., 2005](https://doi.org/10.1016/j.ast.2005.04.002) |
| R6-F10 | A clear signal at the end of an interruption can help people resume the task | [Dodhia and Dismukes, 2009](https://doi.org/10.1002/acp.1441) |
| R6-F11 | A generic confirmation can catch a slip but not a wrong intention | [Norman, The Design of Everyday Things, 2013](https://else.fcim.utm.md/pluginfile.php/49887/mod_resource/content/1/The%20Design%20of%20Everyday%20Things.pdf) |

**What it means here.** The journeys use HTA with an adapted SHERPA table, without invented emotions (decision X3). The mode error is kept as its own label, though Norman counts it as a slip. One episode can have several labels. Severity ratings are the analyst's judgment, not measured probabilities.

**Not found.** No source that presents these labels as one complete taxonomy. Their combination is my adaptation.

## R7 — WCAG 2.2 for states and errors

**Question.** Which WCAG 2.2 criteria apply to an app that shows a message's state, warnings on recipients and sentences, and a send button that may be unavailable?

**Criteria that apply.** Perceivable: 1.1.1, 1.3.1, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 1.4.13. Operable: 2.1.1, 2.1.2, 2.2.1, 2.4.3, 2.4.6, 2.4.7, 2.4.11, 2.5.3, 2.5.8. Understandable: 3.2.2, 3.3.1, 3.3.2, 3.3.3, 3.3.4, 3.3.6 (AAA). Robust: 4.1.2, 4.1.3. Details: [WCAG 2.2 Understanding](https://www.w3.org/WAI/WCAG22/Understanding/).

**Status messages.** A status message must reach assistive technology without taking focus (4.1.3, AA). `role="status"` is polite; `role="alert"` is for urgent information. Set up the live region before the change, announce a complete unit, and avoid duplicate announcements and a live region per sentence while typing ([Understanding 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22)). Warnings stay as content linked to their element (`aria-describedby`, [ARIA1](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA1)).

**Disabled buttons.** WCAG does not forbid disabled buttons. `disabled` usually removes the button from the Tab order; `aria-disabled="true"` keeps it focusable, but the app must block the action itself. A tooltip on a disabled button must not be the only explanation. Recommendation: a persistent reason next to the button, linked with `aria-describedby` ([APG, disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)). The contrast criteria do not cover inactive components, but keeping them readable is good design.

**Confirmation.** 3.3.4 does not require a confirmation for every send; only 3.3.6 (AAA) extends it to all submissions.

**Not found.** No normative link between the product's states and specific ARIA roles. No proof that the app conforms: this is a selection of criteria, not an audit.
