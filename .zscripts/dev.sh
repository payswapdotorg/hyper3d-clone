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

# Always pin the database URL — a parent-directory .env must not win.
export DATABASE_URL="file:../db/dev.db"

echo "[dev.sh] bun install..."
bun install

echo "[dev.sh] prisma generate + db push..."
bunx prisma generate
bunx prisma db push --accept-data-loss

echo "[dev.sh] starting next dev on :3000 (nohup, reaper workaround)..."
nohup bun run dev > /dev/null 2>&1 &
DEV_PID=$!
disown "$DEV_PID" 2>/dev/null || true
echo "$DEV_PID" > "$PID_FILE"

# Wait until the server answers.
for i in $(seq 1 90); do
  if curl -sf --max-time 3 http://localhost:3000 > /dev/null 2>&1; then
    echo "[dev.sh] dev server ready (PID $DEV_PID) on http://localhost:3000"
    exit 0
  fi
  sleep 1
done

echo "[dev.sh] ERROR: dev server did not become ready in 90s" >&2
tail -50 "$LOG_FILE" >&2 || true
exit 1
