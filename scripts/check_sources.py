#!/usr/bin/env python3
"""Check that every visible prototype text cites a source that contains it.

1. In prototype/*.html, every element with data-source="<file>" (or
   "decision:<ID>") must cite an existing file that contains the element's own
   text. The element's own text excludes descendants that carry their own
   data-source and specimen annotations (class "token").
2. In prototype/js/copy.js, every entry written as  text: "...", source: "..."
   is checked the same way.
3. In the other prototype/js/**/*.js files, every string literal that is a
   source ("docs/…", "model/…" or "decision:<ID>", written as a "data-source"
   value or as a constant passed to one) must cite an existing file or a known
   decision. The text of these elements is built at run time, so only the
   source itself is checked.

A file source is valid when the file exists and contains the cited text
anywhere. Both sides are compared after these steps only: HTML entities and
JS \\uXXXX escapes are decoded, a non-breaking space counts as a space, and
runs of whitespace become one space. A leading or trailing "·" of the element
text is a separator added by the markup, not copy, and is dropped.

A "decision:<ID>" source must name a decision of docs/decisions.md: a table
row that starts with "| <ID> |".

Old sources with a line number ("<file>:<line>" or "<file>:<first>-<last>")
are still read: the line range must exist, and the text is searched in the
whole file.

Run: python3 -I scripts/check_sources.py
Exit code 1 lists every failing citation.
"""
import html
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROTOTYPE = ROOT / "prototype"
DECISIONS = ROOT / "docs" / "decisions.md"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "source", "track", "wbr"}
SKIP_CLASSES = {"token"}
# a source written as a JS string literal: a "data-source" value, or a constant passed to one
JS_SOURCE = re.compile(r'"((?:docs|model)/[^"\s]+|decision:[A-Z]+\d+[a-z]?)"')


def js_unescape(text):
    """A JS string literal's escapes (\\uXXXX, \\", \\\\) to text; the rest is already UTF-8."""
    text = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), text)
    return re.sub(r"\\(.)", r"\1", text)


def norm(text):
    """Decode HTML entities and \\uXXXX escapes, count a no-break space as a space,
    and collapse whitespace."""
    text = html.unescape(text)
    text = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), text)
    text = text.replace(" ", " ")
    return re.sub(r"\s+", " ", text).strip()


def own_text(text):
    # a leading or trailing "·" is a separator added by the markup, not copy
    return norm(text).strip("·").strip()


class Collector(HTMLParser):
    """Collects (source, own text, line) for elements carrying data-source."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []      # [tag, record or None, skip]
        self.found = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        skip = bool(SKIP_CLASSES & set((a.get("class") or "").split()))
        rec = None
        if "data-source" in a:
            rec = {"source": a["data-source"], "text": [], "line": self.getpos()[0]}
            self.found.append(rec)
        if tag not in VOID:
            self.stack.append([tag, rec, skip])

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        for _tag, rec, skip in reversed(self.stack):
            if skip:
                return
            if rec is not None:
                rec["text"].append(data)
                return


_files = {}


def file_text(path):
    if path not in _files:
        raw = path.read_text(encoding="utf-8")
        _files[path] = (raw.count("\n") + 1, norm(raw))
    return _files[path]


def check(source, text, decisions):
    """None if the source is valid for the text, else the reason it is not."""
    if source.startswith("decision:"):
        return None if source[9:] in decisions else f"unknown decision {source[9:]}"
    m = re.fullmatch(r"([^:]+)(?::(\d+)(?:-(\d+))?)?", source)
    if not m:
        return "malformed source"
    path = ROOT / m.group(1)
    if not path.is_file():
        return "file not found"
    count, content = file_text(path)
    if m.group(2):
        first, last = int(m.group(2)), int(m.group(3) or m.group(2))
        if not 1 <= first <= last <= count:
            return f"line out of range (file has {count})"
    if text is None or not text:
        return None
    return None if text in content else "text not in file"


def decision_ids():
    if not DECISIONS.is_file():
        return set()
    return set(re.findall(r"^\| ([A-Z]+\d+[a-z]?) \|", DECISIONS.read_text(encoding="utf-8"), re.M))


def main():
    decisions = decision_ids()
    if not decisions:
        print(f"FAIL no decisions found in {DECISIONS.relative_to(ROOT)}")
        return 1
    failures, count = [], 0
    for page in sorted(PROTOTYPE.glob("*.html")):
        c = Collector()
        c.feed(page.read_text(encoding="utf-8"))
        for rec in c.found:
            count += 1
            text = own_text("".join(rec["text"]))
            err = check(rec["source"], text, decisions)
            if err:
                failures.append(f"{page.relative_to(ROOT)}:{rec['line']}  {rec['source']}  {err}: {text!r}")
    copy_js = PROTOTYPE / "js" / "copy.js"
    if copy_js.is_file():
        js = copy_js.read_text(encoding="utf-8")
        for m in re.finditer(r'text:\s*"((?:[^"\\]|\\.)*)",\s*source:\s*"([^"]+)"', js):
            count += 1
            line = js.count("\n", 0, m.start()) + 1
            text = own_text(js_unescape(m.group(1)))
            err = check(m.group(2), text, decisions)
            if err:
                failures.append(f"prototype/js/copy.js:{line}  {m.group(2)}  {err}: {text!r}")
    for script in sorted((PROTOTYPE / "js").rglob("*.js")):
        if script == copy_js:
            continue
        js = script.read_text(encoding="utf-8")
        for m in JS_SOURCE.finditer(js):
            count += 1
            err = check(m.group(1), None, decisions)
            if err:
                line = js.count("\n", 0, m.start()) + 1
                failures.append(f"{script.relative_to(ROOT)}:{line}  {m.group(1)}  {err}")
    for f in failures:
        print("FAIL", f)
    print("PASS" if not failures else "FAIL", f"citations={count} failures={len(failures)}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
