#!/bin/bash
# Session initialization hook for Story Portal
# Outputs context info that Claude can use to orient itself

PROJECT_DIR="/Users/robertrhu/Projects/story-portal"
SESSION_STATE="$PROJECT_DIR/docs/SESSION_STATE.md"

# Output session context as JSON for Claude to parse
echo "{"
echo "  \"project\": \"story-portal\","
echo "  \"session_state_exists\": $([ -f "$SESSION_STATE" ] && echo "true" || echo "false"),"

# Get current git state
cd "$PROJECT_DIR" 2>/dev/null
if [ $? -eq 0 ]; then
  BRANCH=$(git branch --show-current 2>/dev/null)
  UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  LAST_COMMIT=$(git log -1 --format="%s" 2>/dev/null)

  echo "  \"git\": {"
  echo "    \"branch\": \"$BRANCH\","
  echo "    \"uncommitted_files\": $UNCOMMITTED,"
  echo "    \"last_commit\": \"$LAST_COMMIT\""
  echo "  },"
fi

# Extract current focus from SESSION_STATE.md if it exists
if [ -f "$SESSION_STATE" ]; then
  FOCUS=$(grep -A1 "## Current Focus" "$SESSION_STATE" 2>/dev/null | tail -1 | sed 's/^[*-] //')
  echo "  \"current_focus\": \"$FOCUS\","
fi

echo "  \"hint\": \"Run /status for full session context\""
echo "}"

exit 0
