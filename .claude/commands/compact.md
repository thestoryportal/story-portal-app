Compact this conversation to maintain continuity while freeing context space.

## Preserve (CRITICAL)
1. **Current Task:** What are we actively working on? What's the acceptance criteria?
2. **Active Files:** List all files currently being edited with their purpose
3. **Recent Decisions:** Last 3-5 architectural or design decisions with rationale
4. **Blockers:** Any unresolved issues or questions
5. **Session Learnings:** Key discoveries, formulas, or patterns found this session
6. **Human Preferences:** Any stated preferences about approach, style, or process

## Summarize (Reduce Detail)
1. **Abandoned Paths:** Keep what was tried and why it failed; drop implementation details
2. **Debug Sessions:** Keep root cause and fix; drop stack traces and intermediate attempts
3. **Iterations:** Keep final working state; drop intermediate versions
4. **Explanations:** Keep conclusions; drop verbose reasoning

## Output Format
Create a compact summary block:

```markdown
## 📦 Session Compact — [Timestamp]

### 🎯 Current Focus
[Active task and success criteria]

### 📁 Active Files
| File | Status | Purpose |
|------|--------|---------|
| `path/file.tsx` | Editing | [Why] |

### ✅ Decisions Made
1. [Decision]: [Why]
2. [Decision]: [Why]

### 🧠 Key Learnings
- [Learning 1]
- [Learning 2]

### ⚠️ Open Issues
- [Issue needing resolution]

### 🚫 Abandoned Approaches  
- [Approach] — [Why it didn't work]

### 📋 Next Steps
1. [Immediate next action]
2. [Following action]
```

After outputting the compact, continue from "Next Steps" with full context restored.
