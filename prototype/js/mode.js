// The mobile layout (decisions MB1–MB6) is the default on narrow screens.
// app.html?mobile=prima shows the narrow layout as it was before MB1–MB6, for
// the comparison lab used during the work (not in this repository); it keeps
// its own saved session, so the lab could run both side by side.

export const MOBILE_BEFORE = new URLSearchParams(location.search).get("mobile") === "prima";

// True when the mobile layout applies now: a narrow screen, not the lab's "before".
export const m2 = () => !MOBILE_BEFORE && !window.matchMedia("(min-width: 65rem)").matches;
