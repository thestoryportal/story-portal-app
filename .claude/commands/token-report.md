# Token Report

Weekly efficiency summary for cost tracking and optimization.

## Instructions

When invoked, generate a comprehensive weekly cost report:

### 1. Gather Context

Check for any logged session data:

```bash
ls -la docs/token-logs/ 2>/dev/null || echo "No token logs directory"
cat docs/token-logs/weekly-*.json 2>/dev/null || echo "No weekly logs found"
```

Check recent git activity as proxy for work volume:

```bash
git log --oneline --since="7 days ago" | wc -l
git log --oneline --since="7 days ago" --format="%s" | head -10
```

### 2. Estimate Weekly Costs

Based on available data, estimate:

| Metric           | How to Estimate                         |
| ---------------- | --------------------------------------- |
| Sessions         | Count distinct working days / handoffs  |
| Avg session cost | ~$1-3 for light, ~$3-8 for heavy        |
| Total weekly     | Sessions × avg cost                     |
| Model mix        | Note if Haiku/Sonnet used for any tasks |

### 3. Identify Patterns

Look for:

- Highest cost activities (iteration loops, large file reads)
- Optimization wins (Haiku usage, efficient searches)
- Waste patterns (repeated reads, bloated context)

### 4. Generate Report

Format as:

```markdown
## Token Report — Week of [DATE]

### Summary

| Metric               | Value             |
| -------------------- | ----------------- |
| Estimated sessions   | X                 |
| Estimated total cost | $XX - $XX         |
| Primary model        | Opus/Sonnet/Haiku |
| Commits this week    | X                 |

### Activity Breakdown

| Activity          | Est. Sessions | Est. Cost | Notes       |
| ----------------- | ------------- | --------- | ----------- |
| [Feature work]    | X             | $X        | —           |
| [Debugging]       | X             | $X        | —           |
| [Documentation]   | X             | $X        | —           |
| [Iteration loops] | X             | $X        | Token-heavy |

### Cost Drivers

1. **[Biggest driver]**: [Description]
2. **[Second driver]**: [Description]

### Optimization Wins

- [What went well]
- [Efficient patterns used]

### Recommendations for Next Week

1. [ ] [Actionable item]
2. [ ] [Actionable item]

### Trend

| Week      | Est. Cost | Notes          |
| --------- | --------- | -------------- |
| This week | $XX       | —              |
| Last week | $XX       | (if available) |
| Change    | +/-X%     | —              |

---

_Report generated [DATE] by Token Economist_
_Note: Estimates based on heuristics, not actual API data_
```

### 5. Save Report (Optional)

If requested, save to:

```bash
mkdir -p docs/token-logs
# Save as docs/token-logs/weekly-YYYY-MM-DD.md
```

## Usage

Generate weekly report:

```
/token-report
```

Or naturally:

```
"Weekly token report"
"How much did we spend this week?"
"Token efficiency summary"
```

## When to Run

- End of week (Friday)
- Start of new sprint
- After heavy iteration periods
- When reviewing project costs

## Data Sources

Since Claude Code doesn't provide actual token counts, this report uses:

| Source            | What It Tells Us    |
| ----------------- | ------------------- |
| Git commits       | Work volume proxy   |
| Session handoffs  | Session count       |
| File reads/writes | I/O volume          |
| Message count     | Conversation length |
| Model used        | Cost tier           |

## Improving Accuracy

To get better data over time:

1. **Log session summaries** — End each session with brief cost note
2. **Check Anthropic dashboard** — Manual but accurate
3. **Note model switches** — When Haiku/Sonnet used

## Related

| Command        | Purpose                   |
| -------------- | ------------------------- |
| `/token-check` | Quick current status      |
| `/token-audit` | Detailed session analysis |
| `/compact`     | Reduce context            |
