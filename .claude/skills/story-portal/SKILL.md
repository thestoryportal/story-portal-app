---
name: story-portal
description: >
  Development skill for The Story Portal, a steampunk-themed storytelling app for Love Burn festival.
  TRIGGERS: "Story Portal", "wheel component", "steampunk UI", "portal animation", "electricity effect",
  "responsive design devices", "AAA animation", "brass button", "teal patina", "Carnivalee font",
  "panel spacing", "3D cylinder", "WebGL effect", "Three.js", "bloom glow".
  USE FOR: 3D wheel geometry calculations, responsive sizing across 24+ devices, AAA video game quality
  animations, steampunk visual effects, React/TypeScript/Vite development, iterative refinement workflows,
  and visual polish work targeting April 2025 festival deployment.
---

# Story Portal Development Skill

## Mission
"Make empathy contagious" through shared storytelling at Love Burn festival.

## Integration with CLAUDE.md
This skill provides **domain knowledge** (design, architecture, patterns). The repo's `CLAUDE.md` provides **operational commands** (scripts, history search, file conventions). Use both together.

Key CLAUDE.md commands:
- `pnpm dev/build/lint/format` — Development workflow
- `pnpm shots` — Capture screenshots after UI changes
- `pnpm assets:catalog` — Update asset catalog
- `/recall`, `/decisions`, `/history`, `/ideate` — Search dev history

## Tech Stack (DO NOT DEVIATE)
| Category | Technology | Notes |
|----------|------------|-------|
| Framework | React 18+ / TypeScript | Component-based architecture |
| Build | Vite | Fast HMR, optimized builds |
| 3D Graphics | Three.js | Wheel, portal effects |
| Advanced FX | Raw WebGL | Custom shaders, electricity |
| Styling | CSS3 + 3D Transforms | No Tailwind |
| Font | Carnivalee Freakshow | WOFF2 format |
| Icons | Google Material Icons | adaptive_audio_mic, orbit, person_play, web_stories |
| Package Mgr | pnpm | Not npm/yarn |
| Testing | Playwright + Responsively App | E2E + visual |

**NEVER** introduce new dependencies without explicit human approval.
**ALWAYS** use `pnpm add <package>` — never manually edit lock files.

## Critical Directives

### 1. ITERATION PROTOCOL (MANDATORY)
```
LOOP:
  1. Make requested change (ONLY what was requested)
  2. STOP → Present result to human
  3. WAIT for human feedback
  4. IF human reports issue → Fix EXACTLY that issue
  5. IF human says "stop" or "check in" → HALT immediately
  6. REPEAT until human confirms complete
```
**VIOLATION:** Continuing autonomously after human says stop.

### 2. VISUAL FEEDBACK = GROUND TRUTH
When human provides visual feedback:
- **Priority:** Highest—drop everything else
- **Action:** Fix exactly what's reported
- **Scope:** Do not add unrequested improvements
- **Trust:** Human's eyes override Claude's assumptions

### 3. DEEP THINKING BEFORE IMPLEMENTATION
For any non-trivial task:
1. State understanding of the task
2. Outline proposed approach
3. Identify potential issues
4. Get human approval BEFORE coding

## Workflows

### Starting a Session
1. Greet and confirm focus area
2. If files uploaded, analyze them first
3. Reference this skill's resources as needed
4. Ask ONE clarifying question if ambiguous (not multiple)

### AAA Animation Effects
1. **Read:** `references/animation-standards.md`
2. **Plan:** Outline approach, get approval
3. **Implement:** Multi-pass WebGL pipeline
4. **Checkpoint:** Show result, wait for feedback
5. **Iterate:** Per human direction only

### Responsive Design
1. **Read:** `references/responsive-design.md`
2. **Reference:** iPhone 16 Pro as baseline
3. **Test:** Responsively App (24+ devices)
4. **Formula:** See `references/wheel-mechanics.md` for geometry

### New UI Components
1. **Read:** `references/design-system.md`
2. **Match:** Existing steampunk aesthetic exactly
3. **Blend:** Text/icons into surfaces (not overlaid)
4. **Validate:** Visual cohesion check

## Reference Files
| File | Load When |
|------|-----------|
| `references/design-system.md` | Any visual/styling work |
| `references/wheel-mechanics.md` | 3D wheel, panels, radius |
| `references/animation-standards.md` | Animation, WebGL, effects |
| `references/responsive-design.md` | Device testing, breakpoints |
| `references/component-patterns.md` | React architecture |
| `references/iteration-protocol.md` | Complex multi-step work, debugging |
| `references/visual-iteration-pipeline.md` | Autonomous visual QA, AAA animations |

## Slash Commands (from CLAUDE.md)

The repo defines these history-search commands in `.claude/commands/`:

| Command | Purpose |
|---------|---------|
| `/apply-latest` | Read `tools/ai/inbox/latest.md` and implement |
| `/recall <topic>` | Search history for discussions |
| `/decisions <topic>` | Find architectural decisions |
| `/history <feature>` | Trace feature evolution |
| `/ideate <concept>` | Pull brainstorming threads |
| `/debug-context <issue>` | Find prior debugging sessions |
| `/deprecated` | Surface abandoned approaches |
| `/todos` | Extract outstanding action items |
| `/browse-history` | Browse conversation index |

**Philosophy:** History is reference material, not binding doctrine. Evaluate past approaches critically—some may be outdated, superseded, or unviable.

## Quality Gates

### Animation
- 60fps on all target devices
- Multi-pass rendering pipeline
- ACES filmic tone mapping
- Volumetric atmosphere (simplex noise)
- Cream→amber gradients for electricity
- **NO** cartoon effects

### Visual
- Text blends with surfaces (engraved/extruded)
- Consistent brass/teal/patina palette
- No seams between wheel and portal ring
- Readability at all device sizes

### Code
- TypeScript strict mode
- No `any` types without justification
- Components under 300 lines
- Meaningful variable names

## Anti-Patterns (NEVER DO)
1. Continue iterating after "stop"
2. Make improvements beyond request
3. Question human's visual feedback
4. Switch Canvas↔WebGL mid-task
5. Use large radius multipliers (>0.18)
6. Introduce dependencies without approval
7. Skip the planning/approval step
