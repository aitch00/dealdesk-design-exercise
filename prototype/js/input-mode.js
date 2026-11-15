// Which input the person last used, on <html data-input>: "keyboard" or "pointer".
// Content that takes focus from a script (a heading after a jump, a section after
// an anchor, tabindex="-1") shows the focus ring only after keyboard use (UR3);
// links, buttons and fields keep the browser's :focus-visible as it is.
const NAV_KEYS = new Set(["Tab", "Enter", " ", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"]);
const root = document.documentElement;
document.addEventListener("keydown", (e) => { if (NAV_KEYS.has(e.key)) root.dataset.input = "keyboard"; }, true);
document.addEventListener("pointerdown", () => { root.dataset.input = "pointer"; }, true);
