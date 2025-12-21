Find approaches, patterns, or implementations that were tried and abandoned.

Steps:
1. Run: `node "./tools/ai/history/search-history.js" --deprecated`
2. For each deprecated item, extract:
   - What was tried
   - Why it was abandoned
   - What replaced it (if applicable)
3. This is valuable context to avoid repeating failed approaches
4. If searching for a specific topic: `node "./tools/ai/history/search-history.js" "$ARGUMENTS"` and look for negative outcomes

Use this to understand what NOT to do and why, preventing repeated mistakes.
