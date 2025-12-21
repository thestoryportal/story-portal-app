#!/usr/bin/env bash
set -euo pipefail
URL="${1:-http://localhost:5173/}"
SELECTOR="${2:-[data-testid=\"btn-spin\"]}"
SECONDS="${3:-4}"
node tools/ai/capture_click_video.mjs "$URL" "$SELECTOR" "$SECONDS"
