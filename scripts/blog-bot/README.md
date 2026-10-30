# Hash blog bot

Publishes 2–3 original gaming news posts to hashforgamers.com/blog every day.

1. **Discover**: [Scrapling](https://github.com/d4vinci/Scrapling) reads gaming and startup news feeds
   plus Bing News searches for Hash topics (Indian esports, GTA, Nazara and esports funding, gaming
   cafes, PC hardware). Sources and queries are in [`sources.py`](sources.py).
2. **Pick**: Claude chooses the best 2–3 stories from the last 48 hours, skipping anything already posted.
3. **Write**: Scrapling fetches each article; Claude writes an original 400–650 word post in its own words,
   citing the publisher, with a link back to the source.
4. **Publish**: posts are saved as `content/blog/<date>-<slug>.json` and pushed to `Main`; Vercel deploys.

The bot works in its own clone at `~/.hash-blog-bot/repo`, so it never touches your working copy.

## Setup (once)

Run the installer from a checkout of this repo:

```bash
scripts/blog-bot/install.sh
```

Then add your Anthropic API key to `~/.hash-blog-bot/.env` (`ANTHROPIC_API_KEY=sk-ant-...`).
GitHub access comes from `gh` (run `gh auth login` first if needed).

## Run by hand

```bash
cd ~/.hash-blog-bot/repo/scripts/blog-bot
~/.hash-blog-bot/venv/bin/python bot.py --discover-only   # list today's candidate stories, no AI, no publishing
~/.hash-blog-bot/venv/bin/python bot.py --dry-run         # write posts into the clone, don't publish
~/.hash-blog-bot/venv/bin/python bot.py                   # write and publish (what the schedule runs)
~/.hash-blog-bot/venv/bin/python bot.py --count 2         # publish 2 instead of 3
```

## Schedule

`install.sh` registers `com.hashforgamers.blogbot` with macOS launchd to run daily at 09:30. If the Mac
is asleep or off at that time, it runs on the next wake. To change the time, edit `Hour`/`Minute` in
`com.hashforgamers.blogbot.plist` and re-run `install.sh`.

```bash
launchctl kickstart -k gui/$(id -u)/com.hashforgamers.blogbot   # run now
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.hashforgamers.blogbot.plist   # stop scheduling
```

## Logs

`~/.hash-blog-bot/logs/blog-bot.log` (every run) and `launchd.*.log` (scheduler output).

## Editorial rules (enforced in the prompt)

- Original writing only; facts must come from the fetched source; rumours labelled as such.
- Publisher credited in the text and linked under "Sources".
- No promotional copy about Hash inside articles.

Posts publish without human review. Spot-check the blog regularly, and delete or edit a post by
changing its JSON file in `content/blog/`.
