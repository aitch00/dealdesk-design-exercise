// Homepage interactions (screens.md § H; decisions UF46, UF47). The page works without
// this script: the draft then shows its findings, and each card is a link to its state.

// ---------------------------------------------------------------- the second look (UF46)
// The draft starts as written; the button under it shows what a second look finds and back.
// The summary line above the draft always says, in words, what is wrong.
const look = document.querySelector(".second-look");
const toggle = document.getElementById("look-toggle");
const status = document.getElementById("look-status");
const announcements = Object.fromEntries(
  [...document.getElementById("look-announcements").content.querySelectorAll("[data-when]")]
    .map((p) => [p.dataset.when, p.textContent.trim()]));

function setLook(state, announce) {
  look.dataset.look = state;
  if (announce) status.textContent = announcements[state];
}
setLook("written", false);
look.querySelector(".look-bar").hidden = false;
toggle.addEventListener("click", () => setLook(look.dataset.look === "second" ? "written" : "second", true));

// ---------------------------------------------------------------- cards → sheets (UF47)
// One sheet at a time. Previous and Next replace the sheet in place; Close, Esc, a click
// outside or Back close it and return focus to the card of the step on screen.
// The address follows the sheet (#decide-pending), so a sheet can be linked to.
const STEPS = ["blocking", "pending", "approved"];
const sheets = Object.fromEntries(STEPS.map((id) => [id, document.getElementById(`sheet-${id}`)]));
const cards = Object.fromEntries(STEPS.map((id) => [id, document.querySelector(`[data-sheet="${id}"]`)]));
let current = null;   // the open sheet
let pushed = false;   // whether opening it added a history entry

function show(id, { push }) {
  const next = sheets[id];
  if (!next) return;
  if (current && current !== next) current.close();
  if (!next.open) next.showModal();
  current = next;
  next.querySelector("h3").focus();
  const url = `#decide-${id}`;
  if (push) { history.pushState({ sheet: id }, "", url); pushed = true; }
  else history.replaceState({ sheet: id }, "", url);
}

// Closing a modal dialog makes the browser move focus back to where it was when that
// dialog opened, which after Previous or Next is another sheet's button. So focus goes
// to the card of the step on screen right after closing, in the same task.
function closeQuietly() {
  if (!current) return;
  const step = current.dataset.step;
  if (current.open) current.close();
  current = null;
  cards[step].focus();
}

function hide() {
  if (!current) return;
  closeQuietly();
  if (pushed) { pushed = false; history.back(); }
  else history.replaceState(null, "", "#decide");
}

for (const id of STEPS) {
  const sheet = sheets[id];
  sheet.addEventListener("cancel", (event) => { event.preventDefault(); hide(); });
  sheet.addEventListener("click", (event) => { if (event.target === sheet) hide(); });
  sheet.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", hide));
  sheet.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => show(b.dataset.go, { push: false })));

  const card = cards[id];
  card.setAttribute("role", "button");
  card.setAttribute("aria-haspopup", "dialog");
  card.addEventListener("click", (event) => { event.preventDefault(); show(id, { push: true }); });
  card.addEventListener("keydown", (event) => {
    if (event.key === " ") { event.preventDefault(); show(id, { push: true }); }
  });
}

function fromAddress() {
  const m = location.hash.match(/^#decide-(\w+)$/);
  return m && sheets[m[1]] ? m[1] : null;
}
addEventListener("popstate", () => {
  const id = fromAddress();
  if (id) show(id, { push: false });
  else { pushed = false; closeQuietly(); }
});
const linked = fromAddress();
if (linked) show(linked, { push: false });
