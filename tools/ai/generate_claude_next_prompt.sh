#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

# Pick latest capture folder if not provided
LATEST="${1:-$(ls -td tools/ai/screenshots/timeline/*/* | head -n 1)}"

OUT="tools/ai/inbox/claude_next_prompt.md"

# Pick a small set of representative frames so you don't attach hundreds
# (adjust patterns to match your filenames)
IMAGES=()
for f in \
  "$LATEST"/*_000*.png \
  "$LATEST"/*_008*.png \
  "$LATEST"/*_016*.png \
  "$LATEST"/*.gif \
  "$LATEST"/*.mp4
do
  [[ -f "$f" ]] && IMAGES+=("$f")
done

# If nothing matched, fall back to "first 6 pngs"
if [[ ${#IMAGES[@]} -eq 0 ]]; then
  while IFS= read -r f; do IMAGES+=("$f"); done < <(ls -1 "$LATEST"/*.png 2>/dev/null | head -n 6 || true)
fi

PROMPT=$(cat <<'EOF'
You are helping me iterate UI animations for The Story Portal.

Context:
- Screenshots/videos are in the attachments.
- Claude is the coding agent. Your job is to write the NEXT prompt to Claude.

Rules:
- Only comment on animation(s) relevant to the capture label/mode. Do NOT request “burst captures” for unrelated UI.
- Be specific: what to change, where in code, and what visual outcome we want.
- Output MUST be a single, ready-to-paste Claude prompt.

Now:
1) Infer what animation or UI state is being captured.
2) Compare to the intended behavior described in my workflow spec (assume steampunk portal UI; electricity on NEW TOPICS press; menu open/close smoke burst; etc.).
3) Write the next Claude prompt with concrete implementation instructions.
EOF
)

# Run Codex non-interactively with image attachments and save output
codex exec --cd . "${IMAGES[@]/#/--image }" "$PROMPT" > "$OUT"

echo "Wrote: $OUT"
echo "Latest capture folder: $LATEST"
