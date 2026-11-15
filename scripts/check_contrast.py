#!/usr/bin/env python3
"""Check the DealDesk design tokens.

1. Reads prototype/css/tokens.css: colour tokens (6-digit hex or var() aliases)
   and the contrast pairs declared as comments
       /* @contrast <kind> <foreground-token> on <background-token> */
   kind: text (4.5:1), large-text, ui, focus, icon (3:1). WCAG 2.2 1.4.3, 1.4.11.
2. Computes the WCAG contrast ratio of every pair. A pair passes only if the
   unrounded ratio reaches its minimum; the report shows ratios truncated to
   two decimals, so a failing 4.497 never reads as 4.50.
3. Checks every @media width in prototype/**/*.css and in <style> blocks of
   prototype/*.html: only min-width is allowed, and its value must equal a
   --bp-* token (custom properties cannot be used inside @media).
4. Writes docs/4-design/contrast.md (no timestamps: the same
   tokens always produce the same file).

Exits 1 if a pair is below its minimum, a token cannot be resolved, or a
media query width does not match a breakpoint token.

Run: python3 -I scripts/check_contrast.py
     python3 -I scripts/check_contrast.py <prototype-dir>
       checks a copy of prototype/ and prints the report instead of writing it
"""
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PROTOTYPE = ROOT / "prototype"
REPORT = ROOT / "docs" / "4-design" / "contrast.md"

MINIMUM = {"text": 4.5, "large-text": 3.0, "ui": 3.0, "focus": 3.0, "icon": 3.0}
KIND_NOTE = {
    "text": "text, WCAG 1.4.3",
    "large-text": "large text, WCAG 1.4.3",
    "ui": "component boundary, WCAG 1.4.11",
    "focus": "focus indicator, WCAG 1.4.11",
    "icon": "state icon, WCAG 1.4.11",
}

DECL = re.compile(r"(--[A-Za-z0-9-]+)\s*:\s*([^;]+);")
PAIR = re.compile(r"@contrast\s+(\S+)\s+(--[A-Za-z0-9-]+)\s+on\s+(--[A-Za-z0-9-]+)")
COMMENT = re.compile(r"/\*.*?\*/", re.S)
HEX6 = re.compile(r"#[0-9A-Fa-f]{6}")
VAR = re.compile(r"var\(\s*(--[A-Za-z0-9-]+)\s*\)")
MEDIA = re.compile(r"@media([^{]*)\{")
WIDTH = re.compile(r"\(\s*((?:min-|max-)?width)\s*:\s*([^)]+?)\s*\)")
STYLE = re.compile(r"<style[^>]*>(.*?)</style>", re.S | re.I)

errors = []


def resolve(name, tokens, seen=()):
    if name not in tokens:
        raise ValueError(f"{name} is not defined")
    if name in seen:
        raise ValueError(f"circular alias: {' -> '.join(seen + (name,))}")
    value = tokens[name]
    alias = VAR.fullmatch(value)
    if alias:
        return resolve(alias.group(1), tokens, seen + (name,))
    if not HEX6.fullmatch(value):
        raise ValueError(f"{name} resolves to {value!r}, not a 6-digit hex colour")
    return value.upper()


def luminance(hex6):
    def channel(c):
        c = int(c, 16) / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (channel(hex6[i:i + 2]) for i in (1, 3, 5))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def check_pairs(css):
    tokens = {m.group(1): m.group(2).strip() for m in DECL.finditer(COMMENT.sub("", css))}
    rows = []
    for m in PAIR.finditer(css):
        kind, fg, bg = m.groups()
        if kind not in MINIMUM:
            errors.append(f"@contrast {kind} {fg} on {bg}: unknown kind {kind!r}")
            continue
        try:
            fg_hex, bg_hex = resolve(fg, tokens), resolve(bg, tokens)
        except ValueError as e:
            errors.append(f"@contrast {kind} {fg} on {bg}: {e}")
            continue
        value = ratio(fg_hex, bg_hex)
        ok = value >= MINIMUM[kind]
        if not ok:
            errors.append(f"{fg} on {bg}: {value:.3f}:1 is below {MINIMUM[kind]}:1 ({kind})")
        rows.append((fg, fg_hex, bg, bg_hex, kind, value, ok))
    if not rows and not errors:
        errors.append("no @contrast pairs declared in tokens.css")
    return tokens, rows


def check_breakpoints(tokens, prototype):
    allowed = {}
    for name, value in tokens.items():
        if name.startswith("--bp-"):
            allowed[value.replace(" ", "")] = name
    if not allowed:
        errors.append("no --bp-* breakpoint tokens declared in tokens.css")
    found = []
    tests = prototype / "tests"   # test dependencies (node_modules) are not prototype CSS
    sources = [(p, p.read_text(encoding="utf-8")) for p in sorted(prototype.rglob("*.css"))
               if tests not in p.parents]
    for p in sorted(prototype.glob("*.html")):
        sources.append((p, "\n".join(STYLE.findall(p.read_text(encoding="utf-8")))))
    for path, text in sources:
        for media in MEDIA.finditer(COMMENT.sub("", text)):
            for feature, value in WIDTH.findall(media.group(1)):
                where = f"{path.relative_to(prototype)}: @media{media.group(1).rstrip()}"
                value = value.replace(" ", "")
                if feature != "min-width":
                    errors.append(f"{where}: use min-width only, found {feature}")
                elif value not in allowed:
                    errors.append(f"{where}: {value} is not a --bp-* token value")
                else:
                    found.append((str(path.relative_to(prototype)), value, allowed[value]))
    return allowed, found


def report(rows, allowed, found, ok):
    lines = ["# Contrast", "",
             "> Generated by `python3 -I scripts/check_contrast.py` from `prototype/css/tokens.css`. "
             "Do not edit by hand.", "",
             f"**Outcome: {'PASS' if ok else 'FAIL'}**", "",
             "Ratios are truncated to two decimals; the check uses the unrounded value.", "",
             "## Pairs", "",
             "| Foreground | Background | Use | Ratio | Minimum | Result |",
             "|---|---|---|---|---|---|"]
    for fg, fg_hex, bg, bg_hex, kind, value, passed in rows:
        shown = math.floor(value * 100) / 100
        lines.append(f"| `{fg}` {fg_hex} | `{bg}` {bg_hex} | {KIND_NOTE[kind]} | "
                     f"{shown:.2f}:1 | {MINIMUM[kind]}:1 | {'✅' if passed else '❌'} |")
    lines += ["", "## Breakpoints", "",
              "Media queries must use `min-width` with a `--bp-*` value.", "",
              "| Token | Value | Used in |", "|---|---|---|"]
    for value, name in sorted(allowed.items(), key=lambda kv: kv[1]):
        used = sorted({f for f, v, _ in found if v == value})
        lines.append(f"| `{name}` | {value} | {', '.join(f'`{u}`' for u in used) or '—'} |")
    if errors:
        lines += ["", "## Errors", ""] + [f"- {e}" for e in errors]
    return "\n".join(lines) + "\n"


def main():
    prototype = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_PROTOTYPE
    tokens_path = prototype / "css" / "tokens.css"
    if not tokens_path.is_file():
        print(f"FAIL {tokens_path} not found")
        sys.exit(1)
    tokens, rows = check_pairs(tokens_path.read_text(encoding="utf-8"))
    allowed, found = check_breakpoints(tokens, prototype)
    ok = not errors
    text = report(rows, allowed, found, ok)
    if len(sys.argv) > 1:
        print(text)
    else:
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(text, encoding="utf-8")
    print("PASS" if ok else "FAIL", f"pairs={len(rows)} breakpoints={len(allowed)} media={len(found)}")
    for e in errors:
        print(f"  {e}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
