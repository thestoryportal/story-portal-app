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
| Search dev history | `/recall <topic>` |
| Find past decisions | `/decisions <topic>` |
| Compact conversation | `/compact` |
| Animation iteration | Read `references/animation-iteration.md` skill |

---

## Critical Directives

### 1. Iteration Protocol
```
LOOP:
  1. Make requested change (ONLY what was requested)
  2. STOP → Present result to human
  3. WAIT for human feedback
  4. IF human reports issue → Fix EXACTLY that issue
  5. IF human says "stop" → HALT immediately
  6. REPEAT until human confirms complete
```

**NEVER** continue autonomously after human says stop.

### 2. Visual Feedback = Ground Truth
- **Priority:** Highest—drop everything else
- **Action:** Fix exactly what's reported
- **Scope:** Do not add unrequested improvements
- **Trust:** Human's eyes override Claude's assumptions

### 3. Tech Stack
| Required | Forbidden |
|----------|-----------|
| React 18+ / TypeScript | Angular, Vue, Svelte |
| Vite | Webpack, Parcel |
| Three.js / React Three Fiber | Babylon, PlayCanvas |
| CSS3 + 3D Transforms | Tailwind, styled-components |
| pnpm | npm, yarn |

**NEVER** introduce dependencies without explicit human approval.

---

## Development Standards

### Code Changes
- Make small, targeted edits; avoid full-file rewrites
- Preserve existing code style and patterns
- Components under 300 lines; extract if larger

### Dependencies
- Use `pnpm add/remove` — never edit `pnpm-lock.yaml` manually

### Before Committing
1. `pnpm lint` — Fix any errors
2. `pnpm format` — Ensure consistent formatting
3. `pnpm shots` — Capture screenshots (if UI changed)

### Commit Format
```
<type>: <short description>
# Types: feat, fix, refactor, style, docs, test, chore
```

---

## Execution Modes

### MODE: STANDARD (Default)
General development, bug fixes, components, refactoring.
- Make change → STOP → WAIT for feedback → Iterate

### MODE: ANIMATION_ITERATION
Visual effects tuning with SSIM-based feedback loop.
- **Activation:** Human says "Enter visual iteration mode" or `/iterate-visual`
- **Details:** Read `references/animation-iteration.md` skill
- **Override:** Checkpoint rules override Standard Mode protocol

### MODE: EXPLORATORY
Ideation, prototyping, research spikes.
- Present multiple options with tradeoffs
- Exit when human selects direction

---

## Skills (Read On-Demand)

**Trigger-based loading** — Read skills when working on relevant domain:

| Domain | Skill to Read |
|--------|---------------|
| Animation/effects work | `references/animation-iteration.md` |
| Design system values | `references/steampunk-design-system.md` |
| Wheel mechanics | `references/wheel-mechanics.md` |
| UX flows/recording | `references/recording-ui.md`, `references/consent-flows.md` |
| Product decisions | `docs/APP_SPECIFICATION.md`, `docs/USER_FLOWS.md` |

**Location:** `.claude/skills/story-portal/references/`

> Do NOT invent colors, fonts, or spacing — always reference `steampunk-design-system.md`

---

## Context Management

### When to Compact
- Conversation exceeds ~50 exchanges
- Responses feel slower or less precise
- Losing track of earlier decisions

### How to Compact
Use `/compact` or suggest proactively:
> "This conversation is getting long. I can compact to preserve key context. Proceed?"

### Preservation Priority
1. **CRITICAL:** Current task, acceptance criteria, active file paths
2. **HIGH:** Recent decisions, discovered values
3. **LOW:** Abandoned approaches (summary only)

### Recovery Commands
```
/recall <topic>     — Search history
/decisions <topic>  — Find past decisions
/compact            — Compress conversation
```

---

## Anti-Patterns (NEVER DO)

1. Continue iterating after "stop"
2. Make improvements beyond request
3. Question human's visual feedback
4. Introduce dependencies without approval
5. Skip planning/approval step
6. Manually edit auto-generated files
7. Commit without linting
8. Guess at lost context—ask or use `/recall`

---

## File Organization

```
story-portal/
├── .claude/commands/        # Slash commands
├── .claude/skills/          # Domain knowledge (read on-demand)
├── animations/              # Visual iteration pipeline
│   ├── shared/              # Capture/diff tooling
│   └── {scenario}/          # Per-effect configs
├── docs/                    # Product specs, flows, sessions
├── src/legacy/              # Main app code
│   ├── components/          # React components
│   ├── effects/             # Animation effects (R3F)
│   └── _archived/           # Deprecated code (pending review)
└── tools/ai/history/        # Dev history dataset
```

---

## Testing Checklist

### Before Commit
- [ ] `pnpm lint` passes
- [ ] Manual browser test
- [ ] `pnpm shots` if UI changed

### For Animation Changes
- [ ] 60fps in DevTools Performance
- [ ] No memory leaks (heap not growing)

---

*For product context, UX flows, and design decisions, reference the docs/ folder and skills.*
