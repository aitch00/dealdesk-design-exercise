// The top bar of a view over the draft in the mobile layout (MB4): the way
// back on the left, the view's name next to it; the main action stays at the
// bottom, fixed. The name repeats the view's heading, so it is hidden from
// screen readers.

import { h } from "../dom.js";
import { t, source } from "../copy.js";
import { m2 } from "../mode.js";

export function m2Top({ key, label, dataKey, onclick, href, titleKey, title }) {
  if (!m2()) return null;
  const back = href
    ? h("a", { class: "btn", href, "data-key": dataKey, "data-source": source(key) }, label ?? t(key))
    : h("button", { class: "btn", type: "button", "data-key": dataKey, "data-source": source(key), onclick }, label ?? t(key));
  return h("div", { class: "m2-top" }, back,
    h("span", { class: "m2-top-title", "aria-hidden": "true", "data-source": source(titleKey) }, title ?? t(titleKey)));
}
