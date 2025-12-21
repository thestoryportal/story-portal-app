#!/usr/bin/env bash
set -euo pipefail
URL="${1:-http://localhost:5173/}"
SELECTORS_CSV="${2:-[data-testid=\"btn-hamburger\"],[data-testid=\"menu-item-how-to-play\"]}"
COUNT="${3:-30}"
DELAY_MS="${4:-50}"
BETWEEN_CLICKS_MS="${5:-150}"
node tools/ai/capture_sequence_burst.mjs "$URL" "$SELECTORS_CSV" "$COUNT" "$DELAY_MS" "$BETWEEN_CLICKS_MS"
