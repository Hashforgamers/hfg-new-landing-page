#!/bin/bash
# One-time setup for the Hash blog bot on this Mac. Safe to re-run.
set -euo pipefail

BOT_HOME="$HOME/.hash-blog-bot"
REPO="Hashforgamers/hfg-new-landing-page"
PY="${PYTHON:-/opt/homebrew/bin/python3.11}"

mkdir -p "$BOT_HOME/logs"

# 1. Bot-owned clone of the website repo (never your working copy).
if [ ! -d "$BOT_HOME/repo/.git" ]; then
  gh repo clone "$REPO" "$BOT_HOME/repo"
fi
git -C "$BOT_HOME/repo" fetch origin Main && git -C "$BOT_HOME/repo" reset --hard origin/Main

# 2. Python environment (Python 3.10+). Packages one at a time: scrapling[fetchers] can stall pip.
[ -x "$BOT_HOME/venv/bin/python" ] || "$PY" -m venv "$BOT_HOME/venv"
"$BOT_HOME/venv/bin/pip" install -q --upgrade pip
grep -vE '^\s*(#|$)' "$BOT_HOME/repo/scripts/blog-bot/requirements.txt" | while read -r pkg; do
  "$BOT_HOME/venv/bin/pip" install -q "$pkg"
done

# 3. API key file (you fill it in).
if [ ! -f "$BOT_HOME/.env" ]; then
  printf '# OpenAI API key for the blog bot\nOPENAI_API_KEY=\n' > "$BOT_HOME/.env"
  chmod 600 "$BOT_HOME/.env"
  echo "Add your key to $BOT_HOME/.env"
fi

# 4. Daily schedule.
PLIST="$HOME/Library/LaunchAgents/com.hashforgamers.blogbot.plist"
sed "s#__HOME__#$HOME#g" "$BOT_HOME/repo/scripts/blog-bot/com.hashforgamers.blogbot.plist" > "$PLIST"
launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Scheduled daily at 09:30. Logs: $BOT_HOME/logs/"
