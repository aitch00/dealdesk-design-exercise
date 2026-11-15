# Personality and voice

> All of this is [ASSUMPTION]: a character I gave the brand from the brief and the personas, not something tested with users.

## Personality

**Archetype.** The practical sage, in an operational form. It does not teach and does not judge: it notices, explains and lets people decide.

**Metaphor.** The careful senior colleague. The one who passes by the desk and says: "Sam isn't on Harbor. Will you remove him or ask Dana?" They do not raise their voice, do not lecture and do not take the credit.

| It is | It is not |
|---|---|
| Calm | Alarmist |
| Direct | Blunt or bureaucratic |
| Precise | Pedantic |
| Discreet | Intrusive |
| Reliable | Infallible, and it does not say so of itself |
| Professional | Cold or "corporate" |

**If DealDesk were an object**, it would be a fountain pen with its cap, not a neon highlighter.

## Tone of voice

The voice stays the same; the tone changes with the situation.

**The voice in three words:** calm · precise · honest.

In short: professional but human, serious without being cold, clear more than technical. Cautious about promises; assertive about facts.

### Principles

1. **First the fact, then the reason, then the action.**
2. **Proper names, not categories.** Write "Sam Lee", not "this recipient".
3. **The problem belongs to the message, not to the person.** "This draft includes…", not "You added…".
4. **We practise what we check.** Our copy never promises more than it can keep.
5. **No drama, no celebration.** A problem is not an emergency; a send is not a milestone.

### Tone by context

These examples set the tone. Some product strings changed later in the prototype (for example, "check" now names the automatic check and "review" the person's review, decision OA6); the prototype has the exact wording.

| Context | Tone | Example |
|---|---|---|
| Homepage | Confident, sober, concrete | "A second look before deal messages leave." |
| Explaining the process | Clear, short | "The coordinator prepares. The deal owner decides exceptions." |
| Blocking problem | Firm, with a way out | "Sam Lee is not on the Project Harbor deal team. Remove them, or ask the deal owner to approve an exception." |
| Warning | Light, informative | "This sets a timing expectation for the client. It doesn't block sending: confirm the timing yourself before you send." (US13) |
| Note | Neutral, structural | "Corvane Holdings · Client representative · On deal team" |
| Waiting | Neutral, explicit | "Waiting for Dana Whitfield. This isn't an approval yet, so sending stays blocked." |
| Outdated check | Factual | "The recipients changed after the last check. Run the check again before sending." |
| Error or unavailable | Honest, with an alternative | "Review is unavailable right now. Your draft is saved. Sending stays blocked until review runs." |
| Success | Sober | "Sent (simulated) to Pat Morgan and Alex Rivera at 11:05." |
| Product limits | Open, no apology | "Automated checks can miss things. Your team's judgment still decides." |

## Writing style

The mechanical rules. The words for product states (Blocking, Pending, Outdated…) are defined in the product language, not here.

### Language

- British English, because the fictional company is in London [ASSUMPTION]: "recognise", "organisation".
- Contractions are allowed in the product ("isn't", "can't"). Avoid them in the homepage title (`h1`); section titles can use them, for example "What DealDesk doesn't do" (UF16).

### Capitals

- **Sentence case** everywhere: titles, buttons, labels. "Request owner exception", not "Request Owner Exception".
- Capitals only for proper names (Project Harbor, Corvane Holdings) and for state names defined in the product language (Blocking, Pending).

### Length

| Element | Rough limit |
|---|---|
| Homepage title | ≤ 8 words |
| Button | 1–4 words, verb first |
| State label | 1–3 words |
| Issue message | ≤ 2 sentences, ≤ 25 words in total |
| Homepage paragraph | ≤ 3 sentences |

### Buttons and actions

- Verb and object: "Remove Sam Lee", "Run check", "Request owner exception", "Send (simulated)".
- Never "OK", "Submit", "Continue" or "Yes" alone.
- A destructive or irreversible action says what it does: "Remove Sam Lee", not "Delete".

### Numbers, dates, times

- Dates: "30 June", "9 Nov 2026". Never only in numbers.
- Times: 24-hour format, "10:42".
- Counts in digits in the product: "2 issues need action". (The homepage writes counts in words, UF46.)
- Message versions: "Version 2"; "v2" only where space is short.

### Names

- People: first and last name the first time in a view, then the first name ("Sam Lee" → "Sam").
- Project: always "Project Harbor" in full in headings.

### Punctuation

- No exclamation marks.
- No emoji in the product.
- A full stop at the end of full sentences; none in buttons and labels.

### Words to use and to avoid

| Use | Avoid |
|---|---|
| check, review | scan, detect, AI-powered |
| reduce avoidable mistakes | prevent, eliminate, bulletproof |
| deal team | authorised users |
| exception, owner decision | override, bypass |
| sample, simulated | live, real (in the prototype) |
| helps you see | ensures, guarantees, secures |
| traceable | compliant, audit-ready |

### Accessible writing

- The state is always said **in words**, never only with colour or an icon.
- Links say where they go, never "Click here".
- Field labels are visible: a placeholder is not a label.
