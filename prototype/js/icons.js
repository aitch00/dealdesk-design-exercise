// State icons: one shape per meaning (state-to-ui.md, decision UF10). The same
// sprite as prototype/design-specimen.html; tests check that the two stay equal.

export const SPRITE = `<svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
    <symbol id="i-octagon" viewBox="0 0 24 24"><path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z"/><path d="M8 12h8"/></symbol>
    <symbol id="i-arrows" viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-13.6 5.7"/><path d="M4 12a8 8 0 0 1 13.6-5.7"/><path d="M17.8 2.5v3.9h-3.9"/><path d="M6.2 21.5v-3.9h3.9"/></symbol>
    <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
    <symbol id="i-cloud-off" viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 10 4 4 0 0 0 7 18z"/><path d="M4 4l16 16"/></symbol>
    <symbol id="i-check-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.2 9.6"/></symbol>
    <symbol id="i-check-struck" viewBox="0 0 24 24"><path d="M4.5 12.5l4.5 4.5L19.5 6.5"/><path d="M3 11.5h18"/></symbol>
    <symbol id="i-clock-struck" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M4 4l16 16"/></symbol>
    <symbol id="i-x-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></symbol>
    <symbol id="i-person" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></symbol>
    <symbol id="i-activity" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9"/></symbol>
    <symbol id="i-send" viewBox="0 0 24 24"><path d="M3.5 11.2L20.5 3.5l-7.7 17-2.3-7z"/></symbol>
    <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
    <symbol id="i-pen" viewBox="0 0 24 24"><path d="M4 20l4.2-1 10.6-10.6-3.2-3.2L5 15.8z"/></symbol>
  </svg>`;

export function installIcons(doc = document) {
  doc.body.insertAdjacentHTML("afterbegin", SPRITE);
}
