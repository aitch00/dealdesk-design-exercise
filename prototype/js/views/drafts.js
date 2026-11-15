// The drafts list, the left column of the page (decisions TC1, TC2): one group
// per deal; each draft shows its state icon, its subject without the project
// name, its state in words under the subject (OA12) and its last activity.
// Also the centre of #/drafts and the read-only static draft (UF21).

import { h, icon } from "../dom.js";
import { t, source } from "../copy.js";
import { say, harborStatus, lastActivity } from "../format.js";
import * as m from "../model.js";
import { m2 } from "../mode.js";

const SEED = "model/seed.json";

const STATUS_ICON = {
  Blocked: "i-octagon", NeedsNewCheck: "i-arrows", NeedsCheck: "i-arrows", WaitingForDecision: "i-clock",
  ReviewUnavailable: "i-cloud-off", ReadyToSend: "i-check-circle", Sent: "i-send",
};

// The icon of a static draft follows the words of its label (seed.json).
const staticIcon = (label) => (/^Sent/.test(label) ? "i-send" : /^Ready/.test(label) ? "i-check-circle"
  : /^Waiting/.test(label) ? "i-clock" : "i-arrows");

// "Project Harbor — timeline update" → "Timeline update": the group already names the deal (TC2).
const shortSubject = (subject) => {
  const rest = subject.replace(/^(Project )?\w+ — /, "");
  return rest.charAt(0).toUpperCase() + rest.slice(1);
};

export function renderList({ store, ui, actions, route }) {
  const s = store.state;
  const current = route?.view === "static" ? route.draftId : ["draft", "review", "record"].includes(route?.view) ? "harbor" : null;
  const headTag = m2() && route?.view === "drafts" ? "h2" : "h3";
  const groups = s.deals.map((deal) => {
    const drafts = s.drafts.filter((d) => d.dealId === deal.id);
    if (!drafts.length) return null;
    const items = drafts.map((d) => {
      const subject = d.interactive ? m.cur(s).subject : s.versions.find((v) => v.id === d.currentVersionId).subject;
      const id = d.interactive ? "harbor" : d.id;
      let status;
      let statusSource;
      let iconId;
      if (d.interactive) {
        const st = harborStatus(s);
        status = st.text ?? t(st.key, st.vars);
        statusSource = source(st.key);
        iconId = STATUS_ICON[m.draftStatus(s)];
      } else {
        status = d.staticStatusLabel;
        statusSource = SEED;
        iconId = staticIcon(status);
      }
      return h("li", {}, h("a", {
        class: "list-item", href: d.interactive ? "#/drafts/harbor" : `#/drafts/${d.id}`,
        "aria-current": current === id ? "page" : null, "data-key": `open-${d.id}`,
      },
      icon(iconId),
      h("span", { class: "list-subject" },
        h("span", { "data-source": SEED }, shortSubject(subject)),
        // The state in words, under the subject: the icon alone was not understood (OA12).
        h("span", { class: "visually-hidden" }, "\u00a0· "),
        h("span", { class: "status-word", "data-source": statusSource, "data-key": d.interactive ? "harbor-status" : `status-${d.id}` }, status)),
      h("span", { class: "when", "data-source": SEED }, h("span", { class: "visually-hidden" }, "\u00a0· "), lastActivity(s, d))));
    });
    return h("section", { class: "list-group", "aria-labelledby": `deal-${deal.id}` },
      // One level under the list's title (A11Y2): h2 under the h1 "Drafts" of the
      // narrow list view, h3 under the bar's h2 or a draft's h1 elsewhere.
      h(headTag, { class: "group-head", id: `deal-${deal.id}`, "data-source": SEED }, deal.name),
      h("ul", { class: "plain-list" }, items));
  }).filter(Boolean);

  const titleTag = route?.view === "drafts" ? "h1" : "h2";
  return h("nav", { class: "list", "aria-labelledby": "list-title", "data-req": "APP-03 APP-21 QLT-04" },
    // On a wide screen the title sits beside the wordmark in the bar (CL6); the mobile bar has no wordmark.
    m2() ? say(titleTag, "drafts.title", {}, { id: "list-title", class: "list-title", tabindex: "-1", "data-key": "list-title" }) : null,
    ...groups);
}

// The page footer (UG4): what belongs to the demo, not to the product — the sample
// label, which draft is interactive, what the Simulation button holds (OA3). A rule
// closes the page; the text sits on the same left edge as the bar and the list.
export function renderFooter() {
  return h("div", { class: "app-footer-row", "data-req": "APP-29 APP-31 APP-37" },
    say("p", "banner.text", {}, { class: "footer-sample", "data-key": "footer-sample" }),
    say("p", "drafts.note", {}, { "data-key": "drafts-note" }),
    say("p", "sim.sub", {}, { class: "sim-sub", id: "sim-sub", "data-key": "sim-sub" }));
}

// The centre of #/drafts: no draft open yet.
export function renderDrafts({ ui }) {
  const main = h("div", { class: "empty-centre" }, say("p", "drafts.pick", {}, { class: "meta", "data-key": "drafts-pick" }));
  return { main, notes: null, title: t("title.drafts"), focus: null, skip: "skip.content", listFocus: true, ui };
}

export function renderStaticDraft({ store, route }) {
  const s = store.state;
  const d = s.drafts.find((x) => x.id === route.draftId);
  const subject = s.versions.find((v) => v.id === d.currentVersionId).subject;
  const deal = s.deals.find((x) => x.id === d.dealId).name;
  const heading = h("h1", { tabindex: "-1", class: "mail-subject", "data-source": SEED }, subject);
  const main = h("article", { class: "mail" },
    h("header", { class: "mail-head" },
      h("a", { class: "only-narrow back", href: "#/drafts", "data-key": "back-to-drafts", "data-source": source("nav.backToDrafts") }, t("nav.backToDrafts")),
      h("span", { class: "mail-from", "data-source": SEED }, deal)),
    heading,
    h("div", { class: "mail-body" }, say("p", "static.text")));
  const notes = h("section", { class: "notes", "aria-labelledby": "notes-title" },
    say("h2", "notes.title", {}, { class: "eyebrow", id: "notes-title" }),
    h("div", { class: "state-phrase" }, icon(staticIcon(d.staticStatusLabel)),
      h("p", { class: "phrase", "data-source": SEED }, d.staticStatusLabel)));
  return { main, notes, title: t("title.static", { subject }), focus: heading, skip: "skip.content" };
}
