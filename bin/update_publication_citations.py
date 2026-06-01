#!/usr/bin/env python3
"""Update _data/publications.yml citation counts from bib-defined papers."""

from __future__ import annotations

import datetime as dt
import html
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BIB_PATH = ROOT / "_bibliography" / "papers.bib"
DATA_PATH = ROOT / "_data" / "publications.yml"
USER_AGENT = "Mozilla/5.0 (compatible; citation-updater/1.0; +https://github.com/)"


def parse_bibtex(path: Path) -> list[dict[str, str]]:
    text = path.read_text(encoding="utf-8")
    entries: list[dict[str, str]] = []
    pos = 0
    while True:
        match = re.search(r"@(?P<type>\w+)\s*\{\s*(?P<key>[^,\s]+)\s*,", text[pos:])
        if not match:
            break
        body_start = pos + match.end()
        depth = 1
        idx = body_start
        while idx < len(text) and depth:
            if text[idx] == "{":
                depth += 1
            elif text[idx] == "}":
                depth -= 1
            idx += 1
        fields = parse_fields(text[body_start : idx - 1])
        fields["key"] = match.group("key").strip()
        fields["type"] = match.group("type").strip()
        entries.append(fields)
        pos = idx
    return entries


def parse_fields(body: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    idx = 0
    while idx < len(body):
        field = re.match(r"\s*,?\s*([A-Za-z_][A-Za-z0-9_-]*)\s*=", body[idx:])
        if not field:
            idx += 1
            continue
        name = field.group(1).lower()
        idx += field.end()
        while idx < len(body) and body[idx].isspace():
            idx += 1
        if idx >= len(body):
            break
        if body[idx] == "{":
            value, idx = read_braced_value(body, idx)
        elif body[idx] == '"':
            value, idx = read_quoted_value(body, idx)
        else:
            end = idx
            while end < len(body) and body[end] not in ",\n":
                end += 1
            value = body[idx:end].strip()
            idx = end
        fields[name] = re.sub(r"\s+", " ", value).strip()
    return fields


def read_braced_value(text: str, start: int) -> tuple[str, int]:
    depth = 1
    idx = start + 1
    value_start = idx
    while idx < len(text) and depth:
        if text[idx] == "{":
            depth += 1
        elif text[idx] == "}":
            depth -= 1
        idx += 1
    return text[value_start : idx - 1], idx


def read_quoted_value(text: str, start: int) -> tuple[str, int]:
    idx = start + 1
    value: list[str] = []
    while idx < len(text):
        if text[idx] == '"' and text[idx - 1] != "\\":
            return "".join(value), idx + 1
        value.append(text[idx])
        idx += 1
    return "".join(value), idx


def load_existing_counts(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    counts: dict[str, str] = {}
    pattern = r"^\s{2}([A-Za-z0-9_-]+):\n(?:\s{4}.+\n)*?\s{4}citations:\s*\"?([^\"\n]+)\"?"
    for match in re.finditer(pattern, text, re.MULTILINE):
        counts[match.group(1)] = match.group(2).strip()
    return counts


def fetch_google_scholar_citations(query: str) -> int | None:
    url = "https://scholar.google.com/scholar?q=" + urllib.parse.quote_plus(query)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=25) as response:
        page = response.read().decode("utf-8", errors="ignore")
    cited_by = re.search(r"Cited by\s+([0-9,]+)", html.unescape(page))
    if not cited_by:
        return None
    return int(cited_by.group(1).replace(",", ""))


def yaml_quote(value: str | int) -> str:
    escaped = str(value).replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def main() -> int:
    today = dt.date.today().isoformat()
    entries = parse_bibtex(BIB_PATH)
    existing = load_existing_counts(DATA_PATH)
    lines = [f"updated_at: {yaml_quote(today)}", "papers:"]

    for entry in entries:
        key = entry["key"]
        query = entry.get("scholar_query") or entry.get("title")
        fallback = existing.get(key) or entry.get("citations")
        citations: str | int | None = fallback
        source = "existing" if existing.get(key) else "bib"

        if query:
            try:
                fetched = fetch_google_scholar_citations(query)
                if fetched is not None:
                    citations = fetched
                    source = "google_scholar"
                time.sleep(3)
            except Exception as exc:
                print(f"warning: {key}: could not update citation count: {exc}", file=sys.stderr)

        lines.append(f"  {key}:")
        if citations is not None:
            lines.append(f"    citations: {yaml_quote(citations)}")
        lines.append(f"    source: {source}")
        if query:
            lines.append(f"    query: {yaml_quote(query)}")
        lines.append(f"    updated_at: {yaml_quote(today)}")

    DATA_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
