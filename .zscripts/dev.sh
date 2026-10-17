#!/usr/bin/env bash
# Dev server launcher with the reaper workaround: nohup + disown so the
# sandbox's process reaper does not tear down the dev server between
# tool invocations. Adapted from the workspace's .zscripts/dev.sh pattern.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_DIR/dev.log"
PID_FILE="$SCRIPT_DIR/dev.pid"

cd "$PROJECT_DIR"

# The database is Postgres (Neon) — ALWAYS force the project .env's
# DATABASE_URL. The surrounding environment may export its own DATABASE_URL
# (e.g. a platform sqlite default) which would otherwise win Prisma's and
# Next's env precedence and silently point the app at the wrong database.
export DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d '"')"
echo "[dev.sh] DATABASE_URL host: $(echo "$DATABASE_URL" | sed -E 's#^postgresql[^:]*://[^@]*@([^/]*)/.*#\1#')"

echo "[dev.sh] bun install..."
bun install

echo "[dev.sh] prisma generate + db push..."
bunx prisma generate
bunx prisma db push --accept-data-loss

# H3D_PORT overrides the default (e.g. H3D_PORT=3212 to avoid the console
# on :3000 in shared environments).
H3D_PORT="${H3D_PORT:-3000}"
echo "[dev.sh] starting next dev on :$H3D_PORT (nohup, reaper workaround)..."
nohup bunx next dev -p "$H3D_PORT" >> dev.log 2>&1 &
DEV_PID=$!
disown "$DEV_PID" 2>/dev/null || true
echo "$DEV_PID" > "$PID_FILE"

# Wait until the server answers.
for i in $(seq 1 90); do
  if curl -sf --max-time 3 "http://localhost:$H3D_PORT" > /dev/null 2>&1; then
    echo "[dev.sh] dev server ready (PID $DEV_PID) on http://localhost:$H3D_PORT"
    exit 0
  fi
  sleep 1
done

echo "[dev.sh] ERROR: dev server did not become ready in 90s" >&2
tail -50 "$LOG_FILE" >&2 || true
exit 1
