Extract outstanding TODO items and action items from development history.

Steps:
1. Run: `node "./tools/ai/history/search-history.js" --todos`
2. Review the items found and categorize them:
   - Still relevant and actionable
   - Likely completed (cross-reference with current codebase)
   - Outdated or no longer applicable
3. If a specific topic was mentioned, filter: `node "./tools/ai/history/search-history.js" --todos | grep -i "$ARGUMENTS"`
4. Present a prioritized list of what's still outstanding

Note: These are extracted from historical conversations and may include items that have since been addressed. Cross-reference with current code state.
