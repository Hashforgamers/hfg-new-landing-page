"""Hash blog bot: finds trending gaming stories with Scrapling, has Claude write 2-3 original posts,
and publishes them to the website repo (content/blog/*.json), which Vercel deploys.

Run:   ~/.hash-blog-bot/venv/bin/python bot.py [--dry-run] [--count N]
Setup: see README.md in this folder.
"""

from __future__ import annotations

import argparse
import datetime as dt
import email.utils
import json
import logging
import os
import re
import socket
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

import anthropic
from scrapling.fetchers import Fetcher

from sources import BING_NEWS_RSS, FEEDS, RELEVANT, SEARCHES

HOME = Path(os.environ.get("HASH_BLOG_BOT_HOME", Path.home() / ".hash-blog-bot"))
REPO_DIR = HOME / "repo"
REPO_SLUG = "Hashforgamers/hfg-new-landing-page"
BRANCH = "Main"
POSTS_DIR = "content/blog"
MODEL = "claude-sonnet-5-5"
MAX_AGE_HOURS = 48
SITE = "https://www.hashforgamers.com"
# IndexNow tells Bing (and through it ChatGPT Search, Copilot, DuckDuckGo) about new posts at once.
# The same key is served at {SITE}/{INDEXNOW_KEY}.txt from public/.
INDEXNOW_KEY = "1b9447e1c99de8c93fbce8c126f5c18a"
CATEGORIES = ["esports", "gta", "games", "mobile", "industry", "business", "cafes", "hardware"]

log = logging.getLogger("blog-bot")


# ---------------------------------------------------------------- config


def load_env() -> None:
    """Read KEY=value lines from ~/.hash-blog-bot/.env into the environment (API key lives there)."""
    env = HOME / ".env"
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


# ---------------------------------------------------------------- repo


def git(*args: str, cwd: Path = REPO_DIR) -> str:
    return subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()


def sync_repo() -> None:
    """Keep a bot-owned clone in sync with the remote. Nothing else ever edits this clone."""
    if not (REPO_DIR / ".git").exists():
        REPO_DIR.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["gh", "repo", "clone", REPO_SLUG, str(REPO_DIR)], check=True)
    git("fetch", "origin", BRANCH)
    git("checkout", "-B", BRANCH, f"origin/{BRANCH}")
    git("reset", "--hard", f"origin/{BRANCH}")


def existing_posts() -> list[dict]:
    folder = REPO_DIR / POSTS_DIR
    if not folder.exists():
        return []
    posts = []
    for f in folder.glob("*.json"):
        try:
            posts.append(json.loads(f.read_text()))
        except json.JSONDecodeError:
            log.warning("Skipping unreadable post %s", f.name)
    return posts


# ---------------------------------------------------------------- discovery (Scrapling)


def fetch(url: str):
    page = Fetcher.get(url, stealthy_headers=True, timeout=30)
    if page.status != 200:
        raise RuntimeError(f"HTTP {page.status}")
    return page


def unwrap_bing(link: str) -> str:
    query = urllib.parse.parse_qs(urllib.parse.urlparse(link).query)
    return query.get("url", [link])[0]


def parse_date(text: str | None) -> dt.datetime | None:
    if not text:
        return None
    try:
        parsed = email.utils.parsedate_to_datetime(text)
    except (TypeError, ValueError):
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=dt.timezone.utc)


def strip_html(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", text or "")).strip()


def read_feed(url: str, publisher: str | None, category: str | None) -> list[dict]:
    page = fetch(url)
    root = ET.fromstring(page.body)
    items = []
    for item in root.iter("item"):
        link = (item.findtext("link") or "").strip()
        if "bing.com" in link:
            link = unwrap_bing(link)
        source = item.find("{https://www.bing.com/news/search?q=&format=rss}Source")
        items.append(
            {
                "title": strip_html(item.findtext("title") or ""),
                "url": link,
                "publisher": publisher or (source.text if source is not None else urllib.parse.urlparse(link).netloc),
                "published": parse_date(item.findtext("pubDate")),
                "summary": strip_html(item.findtext("description") or "")[:400],
                "category_hint": category,
            }
        )
    return items


def wait_for_network(timeout: int = 600) -> bool:
    # launchd runs us right after the Mac wakes, often before Wi-Fi is back; without this every
    # feed fails with "Could not resolve host" and the day is lost.
    deadline = time.monotonic() + timeout
    while True:
        try:
            socket.getaddrinfo("www.bing.com", 443)
            return True
        except OSError:
            if time.monotonic() > deadline:
                return False
            time.sleep(15)


def discover() -> list[dict]:
    candidates = []
    for publisher, url in FEEDS:
        try:
            items = read_feed(url, publisher, None)
            items = [i for i in items if any(k in (i["title"] + " " + i["summary"]).lower() for k in RELEVANT)]
            candidates += items
            log.info("Feed %-10s %d relevant items", publisher, len(items))
        except Exception as exc:  # one bad source must not stop the run
            log.warning("Feed %s failed: %s", publisher, exc)
    for category, query in SEARCHES:
        try:
            items = read_feed(BING_NEWS_RSS.format(query=urllib.parse.quote_plus(query)), None, category)
            items = [i for i in items if any(k in (i["title"] + " " + i["summary"]).lower() for k in RELEVANT)]
            candidates += items
            log.info("Search %-32s %d items", repr(query), len(items))
        except Exception as exc:
            log.warning("Search %r failed: %s", query, exc)

    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=MAX_AGE_HOURS)
    fresh, seen_urls = [], set()
    for c in candidates:
        if not c["title"] or not c["url"].startswith("http") or c["url"] in seen_urls:
            continue
        if c["published"] and c["published"] < cutoff:
            continue
        seen_urls.add(c["url"])
        fresh.append(c)
    return fresh


def article_text(url: str, limit: int = 12000) -> str:
    """Pull the readable paragraphs of an article with Scrapling's selectors."""
    try:
        page = fetch(url)
    except Exception as exc:
        log.warning("Could not fetch %s: %s", url, exc)
        return ""
    for selector in ("article p", "main p", "p"):
        paragraphs = [re.sub(r"\s+", " ", p.get_all_text(separator=" ", strip=True)) for p in page.css(selector)]
        paragraphs = [p for p in paragraphs if len(p) > 60]
        if len(paragraphs) >= 3:
            return "\n\n".join(paragraphs)[:limit]
    return ""


# ---------------------------------------------------------------- writing (Claude)

SYSTEM = """You write the daily news blog for Hash For Gamers (hashforgamers.com), India's tournament-first
gaming app for players and gaming cafe owners. Readers are Indian gamers, esports fans and cafe owners.

Voice: clear, confident, gamer-native, never hype for its own sake. Short paragraphs. Indian context
where it fits (rupees, Indian teams and events).

Rules that are not negotiable:
- Write entirely in your own words. Never copy a sentence or a distinctive phrase from the source.
- Only state facts that appear in the source material provided. Do not invent numbers, dates, quotes,
  names or outcomes. If something is a rumour or unconfirmed, say so.
- Attribute key facts to the publisher ("according to Inc42").
- No promotional copy about Hash inside the article; the page adds its own call to action.
- 400-650 words. Start with a one-paragraph summary of what happened and why it matters, then 2-4
  short sections with h2 headings, and a closing paragraph on what to watch next."""

PICK_SCHEMA = {
    "type": "object",
    "properties": {
        "picks": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"index": {"type": "integer"}, "category": {"type": "string", "enum": CATEGORIES}, "reason": {"type": "string"}},
                "required": ["index", "category", "reason"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["picks"],
    "additionalProperties": False,
}

POST_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string", "description": "Headline, max 80 characters, no clickbait"},
        "slug": {"type": "string", "description": "lowercase-words-with-hyphens, max 70 characters"},
        "description": {"type": "string", "description": "One-sentence summary for search results, 140-160 characters"},
        "tags": {"type": "array", "items": {"type": "string"}, "description": "3-6 search keywords"},
        "body": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {"type": "string", "enum": ["p", "h2", "ul"]},
                    "text": {"type": "string", "description": "For p and h2; empty string for ul"},
                    "items": {"type": "array", "items": {"type": "string"}, "description": "For ul; empty for p and h2"},
                },
                "required": ["type", "text", "items"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["title", "slug", "description", "tags", "body"],
    "additionalProperties": False,
}


def ask_json(client: anthropic.Anthropic, system: str, prompt: str, schema: dict, max_tokens: int = 16000) -> dict:
    response = client.beta.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        output_config={"effort": "high", "format": {"type": "json_schema", "schema": schema}},
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason == "refusal":
        raise RuntimeError("Claude declined this request")
    if response.stop_reason == "max_tokens":
        raise RuntimeError("Response was cut off (max_tokens)")
    text = next(block.text for block in response.content if block.type == "text")
    return json.loads(text)


def pick_stories(client, candidates: list[dict], posted_titles: list[str], count: int) -> list[dict]:
    listing = "\n".join(
        f"[{i}] {c['title']} | {c['publisher']} | {c['published'].isoformat() if c['published'] else 'unknown date'}"
        f" | hint: {c['category_hint'] or '-'} | {c['summary'][:200]}"
        for i, c in enumerate(candidates)
    )
    recent = "\n".join(f"- {t}" for t in posted_titles[:40]) or "- (none yet)"
    prompt = f"""Pick the {count} best stories for today's Hash blog from the candidates below.

Priorities, in order: Indian esports (BGMI, Valorant, Free Fire, teams, tournaments); GTA and Rockstar;
esports and gaming business in India (Nazara Technologies, funding rounds, acquisitions); gaming cafes;
PC and console hardware prices in India; big game releases, updates and console news (PlayStation,
Xbox, Nintendo, PC); mobile gaming; major global gaming industry news.

Rules: each pick must be a different topic; skip anything already covered in the recent posts; skip
pure deals/coupons, listicles, rumours with no source and anything older than two days; prefer stories
with a clear Indian angle. Choose a category for each.

Recent posts (do not repeat):
{recent}

Candidates:
{listing}"""
    picks = ask_json(client, "You are the news editor for an Indian gaming website.", prompt, PICK_SCHEMA, 4000)["picks"]
    chosen = []
    for p in picks:
        if 0 <= p["index"] < len(candidates):
            chosen.append({**candidates[p["index"]], "category": p["category"]})
    return chosen[:count]


def write_post(client, story: dict) -> dict | None:
    text = article_text(story["url"])
    if len(text) < 800:
        log.warning("Skipping %r: not enough source text to write from", story["title"])
        return None
    prompt = f"""Write today's post about this story.

Headline: {story['title']}
Publisher: {story['publisher']}
URL: {story['url']}
Published: {story['published'].isoformat() if story['published'] else 'unknown'}
Category: {story['category']}

Source article text:
\"\"\"
{text}
\"\"\""""
    post = ask_json(client, SYSTEM, prompt, POST_SCHEMA)
    now = dt.datetime.now(dt.timezone.utc)
    slug = re.sub(r"[^a-z0-9-]+", "-", post["slug"].lower()).strip("-")[:70] or "post"
    body = [
        {k: v for k, v in b.items() if (k == "items" and b["type"] == "ul") or (k == "text" and b["type"] != "ul") or k == "type"}
        for b in post["body"]
    ]
    return {
        "slug": f"{now:%Y-%m-%d}-{slug}",
        "title": post["title"].strip(),
        "description": post["description"].strip(),
        "date": now.isoformat(timespec="seconds"),
        "category": story["category"],
        "tags": post["tags"][:6],
        "body": body,
        "sources": [{"title": story["title"], "url": story["url"], "publisher": story["publisher"]}],
        "generated": {"by": "blog-bot", "model": MODEL},
    }


# ---------------------------------------------------------------- main


def ping_indexnow(urls: list[str], wait: int = 900) -> None:
    # Vercel deploys a minute or two after the push; ping only once the first new page is live.
    deadline = time.monotonic() + wait
    while True:
        try:
            if urllib.request.urlopen(urls[0], timeout=20).status == 200:
                break
        except OSError:
            pass
        if time.monotonic() > deadline:
            log.warning("IndexNow skipped: %s not live after %ds", urls[0], wait)
            return
        time.sleep(20)
    body = json.dumps({"host": "www.hashforgamers.com", "key": INDEXNOW_KEY,
                       "keyLocation": f"{SITE}/{INDEXNOW_KEY}.txt", "urlList": urls}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body,
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        log.info("IndexNow: HTTP %s for %d URLs", urllib.request.urlopen(req, timeout=30).status, len(urls))
    except OSError as e:  # a failed ping must never fail the run; search engines still find the sitemap
        log.warning("IndexNow failed: %s", e)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="write posts locally but do not commit or push")
    parser.add_argument("--count", type=int, default=3, help="posts to publish (default 3)")
    parser.add_argument("--discover-only", action="store_true", help="only list candidate stories")
    args = parser.parse_args()

    HOME.mkdir(parents=True, exist_ok=True)
    (HOME / "logs").mkdir(exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[logging.StreamHandler(), logging.FileHandler(HOME / "logs" / "blog-bot.log")],
    )
    load_env()

    if not wait_for_network():
        log.error("No network after 10 minutes; nothing to publish")
        return 1
    candidates = discover()
    log.info("%d fresh candidate stories", len(candidates))
    if args.discover_only:
        for c in candidates:
            print(f"- [{c['category_hint'] or 'feed'}] {c['title']} ({c['publisher']}) {c['url']}")
        return 0
    if not candidates:
        log.error("No candidates found; nothing to publish")
        return 1

    sync_repo()
    posts = existing_posts()
    used_urls = {s["url"] for p in posts for s in p.get("sources", [])}
    candidates = [c for c in candidates if c["url"] not in used_urls]
    posted_titles = [p["title"] for p in sorted(posts, key=lambda p: p.get("date", ""), reverse=True)]

    client = anthropic.Anthropic()
    picks = pick_stories(client, candidates[:120], posted_titles, args.count + 2)  # spares in case one can't be read
    written = []
    for story in picks:
        if len(written) >= args.count:
            break
        try:
            post = write_post(client, story)
        except Exception as exc:
            log.warning("Writing %r failed: %s", story["title"], exc)
            continue
        if post:
            path = REPO_DIR / POSTS_DIR / f"{post['slug']}.json"
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(post, ensure_ascii=False, indent=2) + "\n")
            written.append(post)
            log.info("Wrote %s", path.name)

    if not written:
        log.error("No posts written")
        return 1
    if args.dry_run:
        log.info("Dry run: %d posts left uncommitted in %s", len(written), REPO_DIR / POSTS_DIR)
        return 0

    git("add", POSTS_DIR)
    titles = "; ".join(p["title"] for p in written)
    git("commit", "-m", f"Blog: {len(written)} new post(s)\n\n{titles}")
    git("push", "origin", BRANCH)
    log.info("Published %d posts: %s", len(written), titles)
    ping_indexnow([f"{SITE}/blog/{p['slug']}" for p in written] + [f"{SITE}/blog"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
