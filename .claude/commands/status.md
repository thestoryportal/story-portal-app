# Session Status

Get oriented quickly at the start of a new session.

## Instructions

When this command is invoked, gather and present the following information:

### 1. Read Session State
```bash
cat docs/SESSION_STATE.md
```

### 2. Check Git Status
```bash
git status --short
git log --oneline -5
```

### 3. Check Active TODOs
If there's a todo list from a previous session, summarize it.

### 4. Present Summary

Format the output as:

```markdown
## 📍 Session Status

### Current Focus
[From SESSION_STATE.md]

### Recent Decisions
[From SESSION_STATE.md]

### Git State
- Branch: [branch]
- Uncommitted: [count] files
- Recent: [last commit message]

### Ready to Continue
[Suggest next action based on current focus]
```

## Usage

Run at the start of any session to quickly orient yourself:
```
/status
```

Or ask Claude to check status naturally:
```
"What's the current project status?"
"Where did we leave off?"
```
