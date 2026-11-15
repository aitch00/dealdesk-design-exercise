# Requirements

The brief, split into short requirements with IDs. Quotes from the brief are kept word for word. Each requirement restates one part of a quote; nothing is added. Other documents cite these IDs: the [coverage matrix](coverage.md), the [decision register](../decisions.md) and the process page.

| Prefix | Topic | Brief sections |
|---|---|---|
| `CTX` | Context | The company and its customer · The problem and desired outcome |
| `WEB` | Website | Website request · What we want to see (Homepage) |
| `APP` | Application | Application request · Fictional information and rules · Decisions to explain · What we want to see (Application) |
| `GEN` | Scope and delivery | Time, scope and priorities · What to submit |
| `QLT` | Quality | What we want to see (Visual and interaction quality) |
| `PRC` | Process document | Process document and suggested checks |
| `EVL` | Evaluation and ethics | How we review and how to handle ambiguity · final notes |

## CTX — Context

### The company

> "DealDesk is a fictional subscription workspace for boutique transaction-advisory firms. It helps teams review deal-related communications before sending. For this exercise, assume the firm pays for the workspace; do not design pricing or a procurement journey."

| ID | Requirement |
|---|---|
| CTX-01 | DealDesk is a subscription workspace for boutique transaction-advisory firms |
| CTX-02 | It helps teams review deal communications **before sending** |
| CTX-03 | The firm pays for the workspace; **no pricing and no procurement journey** |

### The buyer

> "Buyer/customer: the firm's managing partner or operations lead. They want a practical review workflow that reduces avoidable mistakes and makes decisions traceable without slowing every message unnecessarily. The product does not guarantee security, regulatory compliance or legal correctness."

| ID | Requirement |
|---|---|
| CTX-04 | The buyer is the managing partner or the operations lead |
| CTX-05 | They want a practical workflow that **reduces avoidable mistakes** |
| CTX-06 | They want **traceable decisions** |
| CTX-07 | They do not want **every** message slowed down without a reason |
| CTX-08 | The product **does not guarantee** security, regulatory compliance or legal correctness |

### The primary user

> "Primary application user: a deal coordinator preparing outgoing communications across several simultaneous projects. They work quickly, recognize familiar company names and may accidentally assume someone belongs on a particular deal because they work for the same client."

| ID | Requirement |
|---|---|
| CTX-09 | The primary user is the deal coordinator |
| CTX-10 | They work on **several projects at once**, and quickly |
| CTX-11 | Key risk: assuming someone is on the deal **because they work for the same client** |

### The secondary user

> "Secondary user: the deal owner who can approve an exception. The coordinator must be able to request that decision, but cannot approve their own exception. An owner response may be simulated; no separate full owner application is required."

| ID | Requirement |
|---|---|
| CTX-12 | Only the deal owner can approve an exception |
| CTX-13 | The coordinator can **request** an exception, **not approve** it |
| CTX-14 | The owner's answer can be **simulated**; no separate owner app |

### Problem and outcome

> "A message can look ready while including the wrong person or wording that overstates certainty. Generic warnings are easy to dismiss, and a previously reviewed draft can become unsafe after someone edits it."
>
> "Help the coordinator understand the specific issue, act on it and tell whether the current version is ready. Make safe recovery clear without relying on color alone or presenting every notice as equally serious."

| ID | Requirement |
|---|---|
| CTX-15 | Problem: a message can look ready with **the wrong person** or **wording that promises too much** |
| CTX-16 | Problem: **generic warnings** get dismissed |
| CTX-17 | Problem: a reviewed draft can become unsafe **after an edit** |
| CTX-18 | Outcome: the coordinator **understands** the specific issue, **acts** on it and knows if **the current version** is ready |
| CTX-19 | Safe recovery is clear **without relying on colour alone** |
| CTX-20 | Not every notice should look **equally serious** |

## WEB — Website (homepage)

> "The homepage audience is the advisory-firm partner or operations lead evaluating the workflow. Explain who uses DealDesk, the communication problem it addresses, how review fits into an existing team and its limitations. Include a clear route to try the sample message review."
>
> "Build trust through an understandable process and realistic product content. Avoid legal/security guarantees, invented prevented-loss figures or claims that automated checks are infallible."
>
> "Homepage: make the intended customer, problem, value and next step understandable. Explain the offering through realistic copy and a clear call to action. You may create a simple fictional brand identity. We do not supply or expect you to imitate a client's design system. Do not invent testimonials, client logos, certifications or measured commercial results."
>
> "Deliver one responsive homepage […] Show the homepage on desktop and mobile."

| ID | Requirement |
|---|---|
| WEB-01 | Audience: the partner or operations lead evaluating the workflow |
| WEB-02 | Explain **who** uses DealDesk |
| WEB-03 | Explain **which** communication problem it addresses |
| WEB-04 | Explain **how** review fits into an existing team |
| WEB-05 | Explain **the limits** of the product |
| WEB-06 | Customer, problem, value and next step are understandable |
| WEB-07 | A clear route to **try the sample review** (call to action) |
| WEB-08 | Build trust through an **understandable process** |
| WEB-09 | Use **realistic product content**, not placeholders |
| WEB-10 | Use realistic copy |
| WEB-11 | No legal or security guarantees |
| WEB-12 | No invented prevented-loss figures |
| WEB-13 | No claim that automated checks are infallible |
| WEB-14 | No invented testimonials |
| WEB-15 | No client logos |
| WEB-16 | No certifications |
| WEB-17 | No measured commercial results |
| WEB-18 | A simple fictional brand identity is allowed |
| WEB-18b | No client design system is supplied or to be imitated |
| WEB-19 | The homepage is **responsive** |
| WEB-20 | Show it on **desktop and mobile** |

## APP — Application

### The journey

> "The app audience is the coordinator. Design one connected journey:
> - Open a draft and recognize its project, recipients and review status.
> - Inspect the recipient and wording issues described below, with an explanation close to the relevant content.
> - Correct the draft or request an authorized exception, showing pending versus resolved issues.
> - Inspect the final recipients, wording and current approval/check state.
> - Complete a simulated send when eligible and see a concise outcome/review record."

| ID | Requirement |
|---|---|
| APP-01 | Audience: the coordinator |
| APP-02 | **One** connected journey |
| APP-03 | Open a draft and recognise its **project, recipients and review status** |
| APP-04 | Inspect recipient and wording issues, with the explanation **close to the content** |
| APP-05 | Correct the draft **or** request an authorised exception |
| APP-06 | Show **pending** and **resolved** issues |
| APP-07 | Inspect the final recipients, wording, and approval and check state |
| APP-08 | Simulated send **only when eligible** |
| APP-09 | A concise outcome and **review record** |

### State rules

> "Changing recipients or message text invalidates the previous check. Unresolved blocking issues must prevent the simulated send. Include a state where review is incomplete or unavailable so the user knows what they can do next. You choose how these states and actions are presented; we do not require a particular warning layout or dialog pattern."

| ID | Requirement |
|---|---|
| APP-10 | Changing recipients or text **invalidates** the previous check |
| APP-11 | Unresolved blocking issues **prevent** the send |
| APP-12 | A state where review is **incomplete or unavailable**, which says what to do next |
| APP-13 | Layout and patterns are our choice |

### Sample data and rules

> "The draft concerns Project Harbor:
> - Pat Morgan — Advisor assigned to the deal
> - Alex Rivera — Client representative assigned to the deal
> - Sam Lee — Works for the same client company, but is not listed on this deal's team
>
> All three appear among the recipients. The draft includes: 'Completion is guaranteed by 30 June.' This is fictional sample wording, not a confirmed outcome."
>
> "- An unlisted recipient must be removed or explicitly approved by the deal owner. Working for the same company is not sufficient authorization.
> - The guaranteed-completion statement must be revised or explicitly approved by the owner.
> - The coordinator can request an exception but cannot self-approve it.
> - A pending decision is not approval; edits invalidate the prior check.
> - The final simulation remains blocked while a blocking issue is unresolved or the required review is unavailable."

| ID | Requirement |
|---|---|
| APP-14 | The draft is about **Project Harbor**, with Pat Morgan, Alex Rivera and Sam Lee among the recipients |
| APP-15 | The text includes "Completion is guaranteed by 30 June." |
| APP-16 | An unlisted recipient must be **removed** or **approved** by the owner; the same company is not enough |
| APP-17 | The guaranteed sentence must be **revised** or **approved** by the owner |
| APP-18 | The coordinator **cannot** self-approve |
| APP-19 | **Pending is not approval** |
| APP-20 | Sending stays blocked while a blocking issue is unresolved **or** review is unavailable |

### Decisions to explain and the scenario to show

> "Explain how the user recognizes the active project, why each issue matters, what can be fixed directly and what needs someone else's decision. Explain how you distinguish a warning, a blocking issue and pending approval through language and structure as well as visual treatment."
>
> "Walk through this scenario: the coordinator spots that Sam is not on the deal team, resolves or escalates that issue, addresses the guaranteed-completion statement and checks the final message. Then edit a reviewed draft and show what becomes outdated; also show what happens if review is unavailable. Propose how to test whether someone understands who will receive the message, what has been approved and why sending is or is not allowed."

| ID | To explain or show |
|---|---|
| APP-21 | How the user recognises the **active project** |
| APP-22 | **Why** each issue matters |
| APP-23 | What can be fixed **directly** and what needs **someone else's decision** |
| APP-24 | How **warning, blocking and pending** differ in language, structure **and** visual treatment |
| APP-25 | Scenario: spot Sam → resolve or escalate → fix the sentence → check the final message |
| APP-26 | Edit a reviewed draft and show **what becomes outdated** |
| APP-27 | Show what happens when review is **unavailable** |
| APP-28 | Propose a **comprehension test**: who receives, what is approved, why sending is or is not allowed |

### Out of scope and simulation

> "No real email is sent. Email integration, a legal/compliance engine, AI detection, a full audit-log product and a live multi-user backend are outside scope. Simulated owner responses and clearly labeled sample review results are sufficient."
>
> "A backend, real authentication, billing, paid APIs, production security, live integrations and complete secondary-user interfaces are outside scope. Simulated data and interactions are enough."

| ID | Requirement |
|---|---|
| APP-29 | No real email |
| APP-30 | Out of scope: email integration, legal or compliance engine, AI detection, full audit log, multi-user backend, real authentication, billing, paid APIs, production security, live integrations, complete secondary-user interfaces |
| APP-31 | Simulated owner answers; review results **labelled as samples** |

### Format

> "Deliver one responsive homepage and one application journey of approximately 3–5 key screens or states. Show the homepage on desktop and mobile, plus a narrow-screen adaptation of the app's most important view. Related steps can share a screen; we are evaluating the complete task, not a screen count."
>
> "Application: make the current context and next action clear. Connect the core happy path, a meaningful incomplete/error state and an understandable completion or review state. Use the supplied sample content instead of generic placeholders. State which behaviors are simulated. Screenshots alone do not demonstrate the journey."

| ID | Requirement |
|---|---|
| APP-32 | About **3–5** key screens or states; related steps can share a screen |
| APP-33 | A **narrow-screen** version of the most important view |
| APP-34 | The current context and the **next action** are always clear |
| APP-35 | Connect the happy path, an **incomplete or error** state and a **completion or record** state |
| APP-36 | Use the supplied sample content, **not placeholders** |
| APP-37 | State **which behaviours are simulated** |
| APP-38 | Screenshots alone are not enough: the journey must be navigable |

## GEN — Scope and delivery

### Time and priorities

> "You have seven calendar days from confirming Start. Opening the invitation does not start the timer. After submission, a human reviewer assesses your work."
>
> "Aim for 6–8 focused hours, not a week of full-time work. […]"
>
> "Prioritize a coherent, usable core journey over additional features. You choose the layout, navigation, visual direction and interaction patterns. The supplied scenario defines what the product must help people do; it does not prescribe a wireframe or a single correct answer. Explain deliberate omissions and assumptions in your process document."
>
> "You do not need to build a whole product, design every possible exception or recruit research participants."

| ID | Requirement |
|---|---|
| GEN-01 | 7 calendar days from confirming **Start** (opening the invitation does not start the timer) |
| GEN-02 | About **6–8 hours** of work |
| GEN-03 | A **coherent, usable journey** comes before extra features |
| GEN-04 | Layout, navigation, visual direction and patterns are our choice |
| GEN-04b | The scenario says **what** the product must help people do; it does **not** prescribe a wireframe or one correct answer |
| GEN-05 | Deliberate omissions and assumptions are **explained in the process document** |
| GEN-06 | No need to build a whole product, cover every exception or recruit participants |

### What to submit

> "Required — prototype link: include both the homepage and application journey, with clearly labeled starting points. One file or site containing both is fine.
> Required — process journey link: a concise visual presentation or document explaining how you reached the solution.
> Optional — repository link: GitHub, GitLab or another source repository.
> Optional — short recorded walkthrough: a client-style explanation of your decisions. There is no penalty for omitting it.
> Optional — design source link: include it in your notes if the prototype link does not expose the design file.
> Notes: access instructions, prototype limitations, tools used, and what you personally checked. AI tools and agents are welcome; explain how you directed and verified their output."

| ID | Deliverable | Type |
|---|---|---|
| GEN-07 | **Prototype link** with homepage and app, with **labelled** starting points | Required |
| GEN-08 | **Process document link**, concise and visual | Required |
| GEN-09 | **Notes**: access, prototype limits, tools, what I checked personally, how I directed and checked the AI | Required |
| GEN-10 | Repository link (GitHub, GitLab or other) | Optional |
| GEN-11 | Recorded walkthrough, in a client-style; no penalty if missing | Optional |
| GEN-12 | Design file link, in the notes if the prototype does not expose it | Optional |

### Format and access

> "Clickable Figma prototypes, Framer projects and working web prototypes are equally acceptable. Coding is not required. Make links viewable without an access request; if the sample needs a login, provide demo-only credentials. Test access from a signed-out/private window. Do not include personal passwords or real customer information."

| ID | Requirement |
|---|---|
| GEN-13 | Figma, Framer or a web prototype are equal; code is not required |
| GEN-14 | Links open **without an access request** |
| GEN-15 | If a login is needed: **demo-only** credentials |
| GEN-16 | Access tested from a **private or signed-out window** |
| GEN-17 | No personal passwords, no real customer data |

## QLT — Quality: visual, interaction, accessibility

> "Visual and interaction quality: show intentional typography, spacing, hierarchy, readable data and consistent controls. Explain responsive prioritization and accessible contrast, labels, focus and feedback. For a design-only prototype, annotate keyboard behavior and focus order where the tool cannot demonstrate them; identify tool limitations rather than claiming unsupported accessibility."
>
> "Show the homepage on desktop and mobile, plus a narrow-screen adaptation of the app's most important view."

| ID | Requirement |
|---|---|
| QLT-01 | **Intentional** typography |
| QLT-02 | Consistent spacing |
| QLT-03 | Clear hierarchy |
| QLT-04 | Readable data |
| QLT-05 | Consistent controls |
| QLT-06 | Homepage on desktop and mobile |
| QLT-07 | The app's main view on a narrow screen |
| QLT-08 | Explain the **responsive priorities**: what stays, what shrinks, what moves |
| QLT-09 | Accessible contrast |
| QLT-10 | Labels |
| QLT-11 | Focus |
| QLT-12 | Feedback |
| QLT-13 | For design-only prototypes: annotate keyboard behaviour and focus order |
| QLT-14 | State the tool's limits; **do not** claim accessibility that is not supported |

## PRC — Process document

> "Use roughly 6–8 concise visual sections, combining topics where useful:
> - The customer, primary user, problem and desired business/user outcome.
> - Your assumptions, a short task flow and early exploration.
> - At least one alternative and the trade-off behind your choice.
> - The final hierarchy, interactions and visual decisions, illustrated with the work.
> - Checks of the core task, important exception, responsive layout and accessibility.
> - A concrete iteration or a change you would make after checking the design.
> - Remaining limitations, the next research question and one proposed success metric."
>
> "Walk through the brief's sample scenario from start to finish. Check whether another person could identify the next action and understand the result. A self-review is acceptable; if you test with someone, describe who they were and what you actually observed. Distinguish performed research, your assumptions and future research. Do not fabricate interviews, test findings or impact numbers."

### Sections

The format is about **6–8** concise, visual sections; topics can be combined.

| ID | Section |
|---|---|
| PRC-01 | Customer, primary user, problem, business and user outcome |
| PRC-02 | Assumptions, a short task flow, early exploration |
| PRC-03 | **At least one alternative** and the trade-off behind the choice |
| PRC-04 | Final hierarchy, interactions and visual choices, illustrated |
| PRC-05 | Checks: core task, exception, responsive layout, accessibility |
| PRC-06 | **One concrete iteration** after checking |
| PRC-07 | Limits, the next research question, **one** success metric |

### Validation

| ID | Requirement |
|---|---|
| PRC-08 | Walk through the **sample scenario** from start to finish |
| PRC-09 | Check whether **another person** can find the next action and understand the result |
| PRC-10 | A self-review is allowed; if testing with someone, describe **who** and **what was observed** |
| PRC-11 | Keep apart **performed research**, **assumptions** and **future research** |
| PRC-12 | **Do not invent** interviews, test findings or impact numbers |

## EVL — Evaluation, ambiguity and ethics

### How the work is reviewed

> "We review business judgment, usability and accessibility, visual craft, process and validation, and communication and handoff, each on a 1–5 scale. Strong work connects the customer's goal to a clear experience, handles uncertainty honestly, demonstrates visual care and explains decisions and checks. More screens, code or a video do not automatically earn a better assessment."

| ID | Criterion (1–5 scale) | Where it shows |
|---|---|---|
| EVL-01 | Business judgment | Homepage, positioning, scope choices |
| EVL-02 | Usability and accessibility | App journey, states, focus, contrast |
| EVL-03 | Visual craft | Prototype, visual identity |
| EVL-04 | Process and validation | Process document, checks |
| EVL-05 | Communication and handoff | Notes, process document, repository |

| ID | What matters most |
|---|---|
| EVL-06 | Connect the customer's goal to a clear experience |
| EVL-07 | Handle uncertainty **honestly** |
| EVL-08 | Show **visual care** |
| EVL-09 | **Explain** decisions and checks |
| EVL-10 | More screens, more code or a video do **not** raise the score by themselves |

### Ambiguity

> "Use the supplied information as the fictional starting point. If something remains unspecified, make a reasonable assumption, label it, and explain what you would clarify with a real client. You may ask the recruiting team for clarification; do not contact any real client or assume access to their systems."

| ID | Requirement |
|---|---|
| EVL-11 | If something is not specified: a **reasonable**, **labelled** assumption |
| EVL-12 | Explain what I would clarify with a real client |
| EVL-13 | Clarification can be asked from the recruiting team |
| EVL-14 | Do not contact real clients or assume access to their systems |

The assumptions are marked [ASSUMPTION] in the brand and product documents. The product rules D1–D9 are in the [decision register](../decisions.md#d--product).

### Ethics and content

> "All businesses, people and figures in these briefs are fictional. Use original work and synthetic content. Do not add confidential documents or identifiable client material. Confirm portfolio-sharing permission with the recruiting team before publishing the assignment as a case study."

| ID | Requirement |
|---|---|
| EVL-15 | Original work and synthetic content |
| EVL-16 | No confidential documents or identifiable client material |
| EVL-17 | Ask the recruiting team for permission **before** publishing as a case study |
