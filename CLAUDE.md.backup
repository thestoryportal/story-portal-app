# Claude Code Rules for The Story Portal

> **Mission:** "Make empathy contagious" through shared storytelling at Love Burn festival.

---

## Quick Reference

| Need To... | Command/Action |
|------------|----------------|
| Start dev server | `pnpm dev` |
| Lint before commit | `pnpm lint` |
| Format code | `pnpm format` |
| Capture screenshots | `pnpm shots` |
| Update asset catalog | `pnpm assets:catalog` |
| Search dev history | `/recall <topic>` |
| Find past decisions | `/decisions <topic>` |
| Compact long conversation | `/compact` |
| Get geometry values | `python scripts/calculate_wheel_geometry.py <width> <height>` |

---

## Critical Directives

### 1. Iteration Protocol
```
LOOP:
  1. Make requested change (ONLY what was requested)
  2. STOP → Present result to human
  3. WAIT for human feedback
  4. IF human reports issue → Fix EXACTLY that issue
  5. IF human says "stop" or "check in" → HALT immediately
  6. REPEAT until human confirms complete
```

**NEVER** continue autonomously after human says stop.

### 2. Visual Feedback = Ground Truth
When human provides visual feedback:
- **Priority:** Highest—drop everything else
- **Action:** Fix exactly what's reported
- **Scope:** Do not add unrequested improvements
- **Trust:** Human's eyes override Claude's assumptions

### 3. Tech Stack Adherence
| Category | Required | Forbidden |
|----------|----------|-----------|
| Framework | React 18+ / TypeScript | Angular, Vue, Svelte |
| Build | Vite | Webpack, Parcel |
| 3D Graphics | Three.js | Babylon, PlayCanvas |
| Advanced FX | Raw WebGL | 2D Canvas (for 3D effects) |
| Styling | CSS3 + 3D Transforms | Tailwind, styled-components |
| Package Mgr | pnpm | npm, yarn |

**NEVER** introduce new dependencies without explicit human approval.

---

## Development Standards

### Minimal Diffs
- Make small, targeted edits; avoid full-file rewrites unless necessary.
- Keep changes focused on the task at hand.
- When editing, preserve existing code style and patterns.

### Dependency Management
- **ALWAYS** use `pnpm add <package>` to add dependencies.
- **ALWAYS** use `pnpm remove <package>` to remove dependencies.
- **NEVER** manually edit `pnpm-lock.yaml`.

### Code Quality
- **ALWAYS** run `pnpm lint` before committing changes.
- Run `pnpm format` to auto-format code when needed.
- TypeScript strict mode is enabled—no `any` types without justification.
- Components should stay under 300 lines; extract if larger.

### Git Workflow
```bash
# Commit message format
<type>: <short description>

# Types: feat, fix, refactor, style, docs, test, chore
# Examples:
feat: add portal electricity animation
fix: resolve panel gap on iPad Pro
refactor: extract wheel physics into custom hook
```

Before committing:
1. `pnpm lint` — Fix any errors
2. `pnpm format` — Ensure consistent formatting
3. `pnpm shots` — Capture updated screenshots (if UI changed)

### Screenshots & Documentation
- Run `pnpm shots` after UI changes to capture updated screenshots.
- Do **NOT** manually modify files in `docs/screenshots/` — use `pnpm shots` instead.
- Do **NOT** manually edit `docs/timeline.jsonl` — it is auto-generated.

### Asset Management
- Run `pnpm assets:catalog` after adding/removing assets.
- Do **NOT** manually edit `docs/ASSET_CATALOG.md` — it is auto-generated.
- Use Base64 encoding for embedded assets to avoid hosting dependencies.

---

## Skill Integration

The `story-portal` skill provides domain knowledge for this project. When working on Story Portal, reference these skill files as needed:

| File | When to Read |
|------|--------------|
| `references/design-system.md` | Any visual/styling work |
| `references/wheel-mechanics.md` | 3D wheel, panels, radius calculations |
| `references/animation-standards.md` | Animation, WebGL, effects |
| `references/responsive-design.md` | Device testing, breakpoints |
| `references/component-patterns.md` | React architecture, hooks |
| `references/iteration-protocol.md` | Complex multi-step work |

**Skill location:** `.claude/skills/story-portal/` or loaded via Claude.ai Projects.

---

## Execution Modes

Claude operates in different modes depending on task type.

### MODE: STANDARD (Default)
**Use for:** General development, bug fixes, new components, refactoring

**Behavior:**
- Make requested change only
- STOP and present result
- WAIT for human feedback
- Iterate per human direction

**Exit:** Human confirms complete

### MODE: VISUAL_ITERATION
**Use for:** AAA animation effects, responsive layout tuning, visual regression

**Activation:** Human says "Enter visual iteration mode" or invokes `/iterate-visual`

**Behavior:**
- Run capture → analyze → compare → adjust loop
- Self-iterate up to MAX_ITERATIONS (default: 5)
- Log each iteration with scores and deltas
- Checkpoint with human at cap or plateau

**Tools:**
- Capture: `node tools/ai/capture/capture.mjs`
- Analysis: `node tools/ai/capture/pipeline.mjs`
- See `references/visual-iteration-pipeline.md` in skill

**Exit conditions:**
| Condition | Action |
|-----------|--------|
| Score ≥ 0.95 (EXCELLENT) | Auto-complete, report success |
| Iterations = MAX with no convergence | Checkpoint with human |
| Score plateau (3 iterations, delta < 0.01) | Checkpoint with human |
| Tool failure | Stop, report error |
| Human interrupt | Stop immediately |

**Output per iteration:**
```
## Iteration N — [timestamp]

### Scores
| Metric | Value | Delta | Status |
|--------|-------|-------|--------|
| SSIM   | 0.82  | +0.04 | ⬆️     |

### Changes Made
- [Specific code change]

### Next Action
[Continue/Checkpoint/Complete]
```

### MODE: EXPLORATORY
**Use for:** Ideation, prototyping, research spikes

**Behavior:**
- More freedom to try approaches
- Present multiple options rather than single solution
- Explicit about tradeoffs and uncertainties

**Exit:** Human selects direction or says stop

---

## Context Management

### Conversation Compacting

Long conversations degrade effectiveness. Proactively manage context.

**Trigger Conditions:**
- Conversation exceeds ~50 exchanges
- Responses feel slower or less precise
- Losing track of earlier decisions
- Human mentions "getting long" or "context"

**Compact Command:**
Use `/compact` or suggest proactively:
> "This conversation is getting long. I can compact our history to preserve key context. Proceed?"

**Preservation Priority:**

| Priority | Content | Rationale |
|----------|---------|-----------|
| CRITICAL | Current task & acceptance criteria | Defines success |
| CRITICAL | Active file paths & states | Prevents re-discovery |
| HIGH | Recent decisions (last 3-5) | Avoids re-litigating |
| HIGH | Discovered formulas/values | Hard-won knowledge |
| MEDIUM | Human's stated preferences | Respect their process |
| LOW | Abandoned approaches (summary only) | Prevent repeats |

**Discard (Summarize Only):**
- Verbose debugging output (keep resolution)
- Superseded code versions
- Lengthy explanations (keep conclusion)
- Repetitive iteration details (keep final state)

**Compact Output Format:**
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

### 🧠 Key Learnings
- [Learning with specific values/formulas]

### ⚠️ Open Issues
- [Unresolved item]

### 🚫 Abandoned Approaches
- [What]: [Why it failed]

### 📋 Next Steps
1. [Immediate action]
```

### Session Handoff

When ending a session that will continue later, output:

```markdown
## 📋 Session Handoff — [Date]

### Status: [Complete/In Progress/Blocked]

### Accomplished
- [What was done]

### Next Steps
1. [What to do next]

### Critical Context
- [Details that would be lost without this note]

### Files to Review on Resume
- `path/to/file.tsx` — [Why]
```

### Recovery Protocol

If critical context is lost:
1. Use `/recall <topic>` to search history
2. Ask human: "I may have lost context about X. Can you clarify?"
3. Re-read relevant files rather than guessing
4. Check `docs/timeline.jsonl` for recent changes

---

## Development History Dataset

Historical development conversations (ChatGPT and Claude) are stored in:
`./tools/ai/history/datasets/`

### Purpose
This dataset is **reference material for continuity**—not binding doctrine. Use it to:
- Recall what was discussed about specific features
- Understand why certain decisions were made
- Find prior debugging sessions for similar issues
- Surface abandoned approaches (and why they failed)
- Pull ideation threads as creative fuel

### Philosophy
Evaluate past approaches critically. Some may be:
- **Outdated** — requirements or tools have changed
- **Superseded** — replaced by better solutions
- **Unviable** — attempted and proven not to work

When referencing history, note whether the context still applies. Past decisions should inform, not constrain.

### Setup
Before first use, parse the raw dataset:
```bash
node "./tools/ai/history/parse-chats.js"
```
This generates searchable files in `./tools/ai/history/parsed/`.

Re-run after adding new chat exports.

### Available Commands

| Command | Purpose |
|---------|---------|
| `/recall <topic>` | Search history for discussions about a topic |
| `/todos` | Extract outstanding TODO/action items |
| `/decisions <topic>` | Find architectural decisions and design choices |
| `/deprecated` | Surface abandoned approaches and why they failed |
| `/debug-context <issue>` | Find prior debugging sessions for similar issues |
| `/history <feature>` | Trace the evolution of a feature over time |
| `/ideate <concept>` | Pull brainstorming threads as creative fuel |
| `/browse-history [topic]` | Browse the conversation index |
| `/apply-latest` | Read and implement from `tools/ai/inbox/latest.md` |
| `/compact` | Compact conversation to preserve context |

### Direct Search
```bash
# Text search
node "./tools/ai/history/search-history.js" "authentication flow"

# Topic search
node "./tools/ai/history/search-history.js" --topic react

# Find TODOs
node "./tools/ai/history/search-history.js" --todos

# Find decisions
node "./tools/ai/history/search-history.js" --decisions "state"

# Date-filtered search
node "./tools/ai/history/search-history.js" --after 2024-06-01 "refactor"

# JSON output (for piping)
node "./tools/ai/history/search-history.js" --json "query"
```

### Adding New Conversations
1. Export conversations from ChatGPT/Claude
2. Place JSON files in `./tools/ai/history/datasets/`
3. Run `node "./tools/ai/history/parse-chats.js"` to rebuild the index

---

## Testing Requirements

### Before Any PR/Commit
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm format:check` shows no issues
- [ ] Manual test in browser (dev server)
- [ ] Check Responsively App for 3+ device sizes

### For UI Changes
- [ ] Test on iPhone 16 Pro (reference device)
- [ ] Test on iPad Pro 12.9" (known problem device)
- [ ] Test on desktop Chrome
- [ ] Run `pnpm shots` to capture screenshots
- [ ] Verify no panel gaps in wheel at any rotation

### For Animation Changes
- [ ] Verify 60fps in Chrome DevTools Performance tab
- [ ] Test on lower-powered device if possible
- [ ] Check for memory leaks (no growing heap)

---

## Available Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check formatting without changes |
| `pnpm test` | Run unit tests |
| `pnpm shots` | Capture screenshots (requires dev server running) |
| `pnpm assets:catalog` | Generate asset catalog |
| `pnpm prompt:server` | Start prompt inbox server on 127.0.0.1:8787 |

---

## File Organization

```
story-portal-app/
├── .claude/
│   ├── commands/           # Slash commands
│   └── skills/             # Custom skills
│       └── story-portal/   # Domain knowledge
├── docs/
│   ├── screenshots/        # Auto-generated (pnpm shots)
│   ├── ASSET_CATALOG.md    # Auto-generated (pnpm assets:catalog)
│   └── timeline.jsonl      # Auto-generated
├── public/
│   └── assets/             # Static assets (images, fonts)
├── src/
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Helper functions
│   └── types/              # TypeScript interfaces
├── tools/
│   └── ai/
│       ├── history/        # Dev history dataset
│       └── inbox/          # Prompt inbox
├── e2e/                    # Playwright tests
├── CLAUDE.md               # This file
└── package.json
```

---

## Anti-Patterns (NEVER DO)

1. **Continue iterating after "stop"** — Halt immediately
2. **Make improvements beyond request** — Stay in scope
3. **Question human's visual feedback** — Their eyes are ground truth
4. **Switch Canvas↔WebGL mid-task** — Stick with specified approach
5. **Use large radius multipliers (>0.18)** — Causes panel gaps
6. **Introduce dependencies without approval** — Ask first
7. **Skip the planning/approval step** — Think before coding
8. **Manually edit auto-generated files** — Use the scripts
9. **Commit without linting** — Always `pnpm lint` first
10. **Guess at lost context** — Ask or use `/recall`
