# List Available Agents & Skills

Scan and display all available agents, custom roles, and skills in this project.

## Instructions

### 1. Read Agent Roster (Source of Truth)

```bash
cat .claude/agents/ROSTER.md
```

The roster file is the authoritative source for all custom agents.

### 2. Scan Custom Agent Templates

```bash
ls -la .claude/agents/*.md
```

For each agent file (excluding ROSTER.md), extract:

- Agent name (from `# Title`)
- Department (from frontmatter)
- Classification (Hybrid/Autonomous)
- Mission (from Role Definition section)
- Commands (if any)

### 3. List Built-in Task Tool Agents

These are the `subagent_type` values available via the Task tool:

| Agent Type          | Model Options     | Best For                                          |
| ------------------- | ----------------- | ------------------------------------------------- |
| `general-purpose`   | haiku/sonnet/opus | Research, code search, multi-file operations      |
| `Explore`           | haiku/sonnet/opus | Finding files, searching code, codebase questions |
| `Plan`              | sonnet/opus       | Implementation planning, architecture design      |
| `claude-code-guide` | haiku/sonnet      | Claude Code/SDK/API documentation questions       |

### 4. Scan Project Skills

```bash
find .claude/skills -name "*.md" -type f
```

For each skill file, extract:

- Name (from YAML frontmatter `name:`)
- Description (from frontmatter `description:`)
- Triggers (from frontmatter, if present)

### 5. Scan Commands

```bash
ls .claude/commands/*.md
```

List all available slash commands.

### 6. Output Format

```markdown
## Agent & Skill Browser

**Last Updated:** [current date]
**Source:** `.claude/agents/ROSTER.md`

---

## Custom Agents (Project-Specific)

| Agent  | Department | Classification | Mission         |
| ------ | ---------- | -------------- | --------------- |
| [Name] | [Dept]     | [Hybrid/Auto]  | [Brief mission] |

### [Agent Name]

- **File:** `.claude/agents/[file].md`
- **Classification:** [Hybrid/Autonomous]
- **Commands:** [list or "None"]
- **Config:** [list or "None"]

---

## Built-in Agents (Task Tool)

| subagent_type     | Best For                 | Recommended Model |
| ----------------- | ------------------------ | ----------------- |
| general-purpose   | Complex multi-step tasks | sonnet/opus       |
| Explore           | Codebase exploration     | haiku             |
| Plan              | Implementation planning  | sonnet/opus       |
| claude-code-guide | Claude Code questions    | haiku             |

---

## Skills

| Skill  | Location | Description   |
| ------ | -------- | ------------- |
| [name] | [path]   | [description] |

---

## Commands

| Command | Purpose                   |
| ------- | ------------------------- |
| /[name] | [brief purpose from file] |

---

_Run `/list-agents` anytime to refresh this view_
```

## Auto-Update Protocol

When modifying agents:

1. **Update the agent file** in `.claude/agents/`
2. **Update ROSTER.md** with any changes
3. **Run `/list-agents`** to verify changes appear

The ROSTER.md file is the source of truth. Keep it synchronized.

## Maintenance Hook

After creating or modifying any agent:

```
CHECKLIST:
[ ] Agent template created/updated in .claude/agents/
[ ] ROSTER.md updated with new/changed agent
[ ] Memory graph updated (mcp__memory__add_observations)
[ ] /list-agents run to verify visibility
```

## Execute

1. Read `.claude/agents/ROSTER.md`
2. Glob `.claude/agents/*.md` and parse each
3. Glob `.claude/skills/**/*.md` and parse frontmatter
4. Glob `.claude/commands/*.md` and extract purpose
5. Present formatted output
