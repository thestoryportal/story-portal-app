#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:5173/}"

if ! curl -sSf "$URL" >/dev/null; then
  echo "ERROR: Cannot reach $URL"
  echo "Start Vite with: pnpm dev"
  exit 1
fi

TS="$(date +"%Y-%m-%d_%H-%M-%S")"
OUT="docs/screenshots/${TS}.png"

pnpm exec playwright screenshot "$URL" "$OUT" --full-page
echo "$TS $OUT $URL" >> docs/screenshot_timeline.txt
echo "Saved: $OUT"
