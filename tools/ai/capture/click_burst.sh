#!/usr/bin/env bash
set -euo pipefail
URL="${1:-http://localhost:5173/}"
SELECTOR="${2:-[data-testid=\"btn-spin\"]}"
COUNT="${3:-20}"
DELAY_MS="${4:-80}"
node tools/ai/capture_click_burst.mjs "$URL" "$SELECTOR" "$COUNT" "$DELAY_MS"
