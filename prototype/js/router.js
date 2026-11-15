// Hash routes of navigation.md. Unknown addresses go to the drafts list
// (decision UF24).

export function parseRoute(hash, staticDraftIds) {
  const path = hash.replace(/^#/, "");
  if (path === "" || path === "/") return { redirect: "#/drafts" };
  if (path === "/start") return { view: "start" }; // from the starting data, wherever the link is (US5)
  if (path === "/drafts") return { view: "drafts" };
  if (path === "/drafts/harbor") return { view: "draft" };
  if (path === "/drafts/harbor/review") return { view: "review" };
  if (path === "/drafts/harbor/record") return { view: "record" };
  let m = path.match(/^\/drafts\/([\w-]+)$/);
  if (m && staticDraftIds.includes(m[1])) return { view: "static", draftId: m[1] };
  m = path.match(/^\/jump\/([\w-]+)$/);
  if (m) return { view: "jump", jumpId: m[1] };
  return { redirect: "#/drafts" };
}
