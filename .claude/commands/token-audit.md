# Token Audit

Analyze token usage patterns and identify optimization opportunities.

## Instructions

When this command is invoked, perform the following analysis:

### 1. Context Loading Analysis

Check what's loaded into context:

```bash
# CLAUDE.md size
wc -l .claude/CLAUDE.md 2>/dev/null || wc -l CLAUDE.md 2>/dev/null

# Skills directory size
find .claude/skills -name "*.md" -exec wc -l {} + 2>/dev/null | tail -1

# Commands directory size
find .claude/commands -name "*.md" -exec wc -l {} + 2>/dev/null | tail -1
```

### 2. Session Pattern Analysis

Analyze the current conversation for:

- **Message count**: How many turns in this session?
- **Tool calls**: Which tools were used and how often?
- **File reads**: How many files read? Total lines?
- **Search operations**: Grep/Glob patterns used?
- **Agent spawns**: How many Task tool invocations?

### 3. Model Usage

Note the current model (check system info):

- Opus: $15/$75 per 1M tokens (input/output)
- Sonnet: $3/$15 per 1M tokens
- Haiku: $0.25/$1.25 per 1M tokens

### 4. Identify Optimization Opportunities

Look for these patterns:

| Pattern                       | Issue                               | Recommendation                   |
| ----------------------------- | ----------------------------------- | -------------------------------- |
| Full file reads               | Reading entire large files          | Use `offset`/`limit` params      |
| Grep with `content` mode      | Returns full matching lines         | Use `files_with_matches` first   |
| Repeated file reads           | Same file read multiple times       | Cache knowledge in memory graph  |
| Large Task agent prompts      | Verbose context passed to subagents | Summarize context before passing |
| No `/compact` in long session | Context accumulation                | Recommend compacting             |
| Opus for simple searches      | Expensive model for simple task     | Use Haiku via Task tool          |

### 5. Estimate Session Cost

Provide rough estimates based on:

**Token Estimation (approximate):**

- 1 line of code ≈ 10-15 tokens
- 1 line of prose ≈ 20-25 tokens
- Average tool call overhead ≈ 50-100 tokens
- File read: lines × 12 tokens (average)

**Calculate:**

- Estimated input tokens (context + prompts)
- Estimated output tokens (responses)
- Apply model pricing
- Provide range (low/high estimate)

### 6. Present Report

Format output as:

```markdown
## Token Audit Report

**Session:** [current date/time]
**Model:** [Opus/Sonnet/Haiku]

### Context Size

| Component         | Lines   | Est. Tokens |
| ----------------- | ------- | ----------- |
| CLAUDE.md         | X       | ~Y          |
| Loaded Skills     | X       | ~Y          |
| Conversation      | X turns | ~Y          |
| **Total Context** | —       | **~Z**      |

### Tool Usage

| Tool   | Calls | Notes                     |
| ------ | ----- | ------------------------- |
| Read   | X     | [files read, total lines] |
| Grep   | X     | [modes used]              |
| Bash   | X     | —                         |
| Task   | X     | [agent types]             |
| Memory | X     | —                         |

### Cost Estimate

| Category          | Tokens | Cost   |
| ----------------- | ------ | ------ |
| Input (est.)      | ~X     | $Y     |
| Output (est.)     | ~X     | $Y     |
| **Session Total** | —      | **$Z** |

_Note: Estimates based on heuristics, not actual API counts._

### Optimization Opportunities

1. **[Category]**: [Specific recommendation]
   - Current: [what's happening]
   - Recommended: [what to do]
   - Potential savings: [estimate]

2. ...

### Recommendations

- [ ] [Actionable item 1]
- [ ] [Actionable item 2]
- [ ] [Actionable item 3]
```

## Usage

Run anytime to audit current session:

```
/token-audit
```

Or ask naturally:

```
"How much is this session costing?"
"Audit my token usage"
"Where can I save on tokens?"
```

## Limitations

This audit provides **estimates**, not exact counts:

1. **No API access**: Claude Code doesn't expose actual token counts
2. **Heuristic-based**: Line counts × multipliers = rough estimate
3. **Context invisible**: Can't see exactly what's in context window
4. **Output unknown**: Can't measure output tokens precisely

For exact costs, check your Anthropic dashboard.

## Related Commands

| Command         | Purpose                      |
| --------------- | ---------------------------- |
| `/compact`      | Summarize and reduce context |
| `/status`       | Check session state          |
| `/token-report` | Weekly cost summary (future) |

## Tips for Token Efficiency

### Quick Wins

1. **Use lean Grep modes**

   ```
   output_mode: "files_with_matches"  # NOT "content"
   ```

2. **Limit file reads**

   ```
   limit: 100  # Don't read entire files
   ```

3. **Haiku for exploration**

   ```
   Task tool with model: "haiku"  # For simple searches
   ```

4. **Compact proactively**

   ```
   /compact  # Before context gets too large
   ```

5. **Memory graph for persistence**
   ```
   Store findings in memory graph, not conversation
   ```

### Model Selection Guide

| Task              | Use    | Why                      |
| ----------------- | ------ | ------------------------ |
| Complex reasoning | Opus   | Worth it                 |
| Code generation   | Sonnet | Good balance             |
| File exploration  | Haiku  | 60x cheaper than Opus    |
| Status checks     | Haiku  | Minimal reasoning needed |
