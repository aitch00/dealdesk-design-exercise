// P1 · the exception request as a second email over the draft (decision TC7,
// screens.md § P1, UC-06): the same header, fields and bar as the deal's email.
// It is a modal dialog: the rest of the page is inert while it is open, Esc and
// Cancel close it, and focus returns to the button that opened it.

import * as m from "../model.js";
import { h } from "../dom.js";
import { t, source } from "../copy.js";
import { say, changeText } from "../format.js";
import { m2Top } from "./mobile.js";

const SEED = "model/seed.json";

export function renderExceptionMail(ctx, act) {
  const s = ctx.store.state;
  const p1 = ctx.ui.a2.p1;
  const key = p1.issueKey;
  const isRecipient = key.startsWith("recipient:");
  const issue = m.issuesOf(s, m.lastDone(s)).find((i) => i.key === key);
  const name = m.subjectLabel(s, key);
  const owner = m.person(s, m.deal(s).ownerId).name;
  const cur = m.cur(s);
  const version = cur.number;

  const title = isRecipient
    ? say("h2", "p1.title.recipient", { name }, { id: "p1-title", class: "mail-subject", tabindex: "-1", "data-key": "p1-title" })
    : say("h2", "p1.title.wording", { sentence: issue.matchedText }, { id: "p1-title", class: "mail-subject", tabindex: "-1", "data-key": "p1-title" });

  // Other blocking issues that an edit could still fix (J1-OP-22).
  const others = m.blocking(s).filter((i) => i.key !== key && m.resolution(s, i) === "open");
  // A request made again after an approval on an earlier version: what changed since then.
  const earlier = m.requests(s).filter((r) => r.issueKey === key && m.decisionsOf(s, r).some((d) => d.outcome === "approved")
    && m.requestStatus(s, r) === "outdated");
  let changed = null;
  if (earlier.length) {
    const before = m.version(s, earlier.at(-1).versionId);
    const [, items] = m.diffVersions(s, before, cur);
    changed = h("div", {},
      say("p", "p1.changedSince", { version: before.number }, { class: "label-word" }),
      h("ul", { class: "changes" }, items.map((it) => h("li", { "data-source": "docs/4-design/copy.md" }, changeText(it)))));
  }

  const reasonId = "p1-reason";
  const errorId = "p1-error";
  const toText = t("p1.to", { owner });
  return h("div", { class: "overlay-layer" },
    h("section", { // a dialog: allowed on section, not on article (A11Y1)
      class: "mail overlay-mail p1", role: "dialog", "aria-modal": "true", "aria-labelledby": "p1-title", "data-req": "APP-05 APP-18 APP-23",
      onkeydown: (e) => { if (e.key === "Escape") { e.preventDefault(); act.closeP1(); } },
    },
    m2Top({ key: "action.cancel", dataKey: "p1-cancel-top", onclick: act.closeP1, titleKey: "m2.p1Title" }),
    h("header", { class: "mail-head" },
      say("span", "a2.title", {}, { class: "mail-from" }),
      say("span", "a2.version", { version }, { class: "data" })),
    h("div", { class: "mail-fields" },
      h("div", { class: "mail-field" }, say("span", "edit.to", {}, { class: "field-label" }),
        h("ul", { class: "chips" }, h("li", { class: "chip chip-to", "data-source": source("p1.to") }, toText.replace(/^To: /, ""))))),
    title,
    h("div", { class: "mail-body" },
      h("p", {}, isRecipient ? say("strong", "row.notOnTeam") : say("strong", "flag.wording"), "\u00a0· ",
        isRecipient ? say("span", "scope.recipient", { name, version, short: name.split(" ")[0] }) : say("span", "scope.wording", { version })),
      others.length
        ? say("p", "p1.fixFirst", { count: others.length, plural: others.length === 1 ? "" : "s" }, { class: "rule-blocks fix-first" })
        : null,
      changed,
      h("div", { class: "field" },
        h("label", { for: reasonId, "data-source": source(isRecipient ? "p1.reason.recipient" : "p1.reason.wording") },
          isRecipient ? t("p1.reason.recipient", { name }) : t("p1.reason.wording")),
        h("textarea", {
          id: reasonId, required: true, "data-key": "p1-reason",
          "aria-invalid": p1.error ? "true" : null, "aria-describedby": p1.error ? errorId : null,
          oninput: (e) => { p1.reason = e.target.value; },
        }, p1.reason),
        p1.error ? say("p", "p1.error", {}, { id: errorId, class: "field-error" }) : null),
      h("blockquote", { class: "preview quoted" },
        say("p", "preview.title", { version }, { class: "label-word" }),
        h("p", { "data-source": SEED }, cur.subject),
        ...cur.body.map((p) => h("p", { class: "para", "data-source": SEED }, p)))),
    h("div", { class: "mail-bar" },
      h("button", { class: "btn on-dark", type: "button", "data-key": "p1-cancel", "data-source": source("action.cancel"), onclick: act.closeP1 }, t("action.cancel")),
      say("p", "p1.to", { owner }, { class: "reason" }),
      h("button", { class: "btn btn-primary on-dark", type: "button", "data-key": "p1-send", "data-source": source("action.sendRequest"), onclick: act.sendRequest }, t("action.sendRequest")))));
}
