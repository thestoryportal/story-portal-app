Find prior debugging sessions and solutions related to: $ARGUMENTS

Steps:
1. Search for error-related discussions:
   ```bash
   node "./tools/ai/history/search-history.js" "$ARGUMENTS error"
   node "./tools/ai/history/search-history.js" "$ARGUMENTS bug"
   node "./tools/ai/history/search-history.js" "$ARGUMENTS fix"
   ```
2. Look for patterns:
   - Similar issues encountered before
   - Root causes identified
   - Solutions that worked
   - Workarounds applied
3. Check if any fixes were temporary/hacky vs. proper solutions
4. Apply learnings to current debugging effort

Past debugging context can accelerate current troubleshooting, but verify solutions still apply to current code state.
