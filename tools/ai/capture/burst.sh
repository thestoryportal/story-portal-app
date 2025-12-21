#!/usr/bin/env bash
set -euo pipefail

COUNT="${1:-10}"
DELAY="${2:-0.2}"
URL="${3:-http://localhost:5173/}"

if ! curl -sSf "$URL" >/dev/null; then
  echo "ERROR: Cannot reach $URL"
  echo "Start Vite with: pnpm dev"
  exit 1
fi

TS_DIR="$(date +"%Y-%m-%d_%H-%M-%S")"
OUT_DIR="docs/screenshots/bursts/${TS_DIR}"
mkdir -p "$OUT_DIR"

echo "Capturing $COUNT screenshots every ${DELAY}s from $URL"
for i in $(seq -w 1 "$COUNT"); do
  OUT="${OUT_DIR}/${i}.png"
  pnpm exec playwright screenshot "$URL" "$OUT" --full-page >/dev/null
  echo "$(date +"%Y-%m-%d_%H-%M-%S") $OUT $URL burst count=$COUNT delay=$DELAY" >> docs/screenshot_timeline.txt
  sleep "$DELAY"
done

echo "Saved burst: $OUT_DIR"
