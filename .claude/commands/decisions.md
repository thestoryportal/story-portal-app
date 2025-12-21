Find architectural decisions and design choices from development history about: $ARGUMENTS

Steps:
1. Run: `node "./tools/ai/history/search-history.js" --decisions "$ARGUMENTS"`
2. For each decision found, assess:
   - What was decided and why
   - What alternatives were considered
   - Whether the reasoning still holds given current context
3. Flag any decisions that may need revisiting based on:
   - Changes in requirements
   - New capabilities or tools available
   - Lessons learned since the decision

Present findings as reference material, not mandates. Past decisions should inform but not constrain current work if circumstances have changed.
