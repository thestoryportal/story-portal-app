# Session: UX Design Audit

## Interface: Claude Browser (claude.ai)
**Why:** Strategic assessment benefits from extended thinking, artifact creation for inventory documents, and space for holistic UX reasoning.

---

## Session Goal
Establish a comprehensive inventory of all UX elements, assess their current design status, identify gaps, and create a prioritized roadmap for remaining design work.

## Pre-Session Setup (Human)
1. Have these reference materials ready:
   - `docs/APP_SPECIFICATION.md` (feature requirements, UX principles)
   - `docs/USER_FLOWS.md` (all screens and states)
   - Project status assessment (implementation status)
   - Screenshots of current app state (if available)
2. Access to running app for reference (`pnpm dev`)
3. Be ready to share what feels "done" vs "placeholder"

---

## Prompt to Start Session

```
I need to conduct a UX Design Audit for The Story Portal.

Context:
- Steampunk-themed storytelling app for Love Burn festival (April 2025)
- Mission: "Making empathy contagious"
- Some UI is implemented, some is placeholder
- Need to understand what design work remains before implementation

Reference docs I'll share:
- APP_SPECIFICATION.md (feature requirements, UX principles)
- USER_FLOWS.md (all screens and states)
- Current implementation status

Please help me create a UX_DESIGN_AUDIT.md that covers:

1. **Screen Inventory** — Every screen/view in the app
2. **Component Inventory** — Reusable UI elements
3. **State Inventory** — All UI states (loading, error, empty, etc.)
4. **Design Status Assessment** — What's designed vs needs design
5. **UX Gap Analysis** — Missing patterns, inconsistencies, accessibility
6. **Design Debt** — Shortcuts taken that need revisiting
7. **Prioritized Design Roadmap** — What to design first

Let's start by inventorying all screens from USER_FLOWS.md, then assess each one's design status.
```

---

## Key Questions Claude Should Ask

**Current State:**
- Which screens have final visual design vs placeholder?
- Are there mockups, sketches, or reference images for unbuilt screens?
- What design tools are you using (Figma, code-only, etc.)?

**Design System:**
- Is there a documented color palette, typography, spacing system?
- Are steampunk visual elements (gears, brass, patina) codified?
- Component library exists, or ad-hoc per screen?

**Personas in Design:**
- How does current UI serve The Reluctant Storyteller's need for safety?
- Is the "phone handoff" UX (Connector → Storyteller) considered?
- Mobile-first design verified?

**Constraints:**
- Any screens that MUST ship vs nice-to-have polish?
- Performance constraints affecting design choices (animations, effects)?
- Accessibility requirements defined?

**Process:**
- Who approves design decisions?
- How are designs handed off to implementation (specs, code, verbal)?

---

## Inventory Framework

### Screen Inventory Template

| Screen | Flow | Design Status | Priority | Notes |
|--------|------|---------------|----------|-------|
| Wheel (Idle) | Core | ✅ Complete | — | Reference implementation |
| Contemplation | Core | 🟡 Partial | High | Hint cycling UI undefined |
| Recording | Core | 🔴 Placeholder | Critical | Full redesign needed |
| ... | ... | ... | ... | ... |

### Component Inventory Template

| Component | Used In | Design Status | Notes |
|-----------|---------|---------------|-------|
| SpinButton | Wheel | ✅ Complete | — |
| NavButtons | Wheel | ✅ Complete | — |
| RecordButton | Contemplation | 🟡 Partial | Needs states |
| ... | ... | ... | ... |

### State Inventory Template

| State Type | Screens Affected | Designed? | Notes |
|------------|------------------|-----------|-------|
| Loading | All | 🔴 No | Need loading pattern |
| Empty | My Stories | 🔴 No | First-time state |
| Error | Recording, Save | 🔴 No | Error modal design |
| ... | ... | ... | ... |

---

## Expected Document Structure

```markdown
# UX Design Audit — The Story Portal

## Executive Summary
[Overall assessment: X% designed, key gaps, timeline risk]

## 1. Screen Inventory
### Core Flow Screens
### Content Screens
### Modal/Overlay Screens

## 2. Component Inventory
### Navigation Components
### Input Components
### Feedback Components
### Decorative Components

## 3. State Inventory
### Global States
### Screen-Specific States

## 4. Design Status Assessment
### Fully Designed (Ready for Implementation)
### Partially Designed (Needs Refinement)
### Not Designed (Needs Full Design)

## 5. UX Gap Analysis
### Missing Patterns
### Inconsistencies
### Accessibility Gaps
### Persona Blindspots

## 6. Design Debt
### Shortcuts Taken
### Technical Constraints Affecting UX
### Deferred Decisions

## 7. Prioritized Design Roadmap
### Critical (Blocks MVP)
### High (Needed for Good Experience)
### Medium (Polish)
### Low (Future)

## Appendix: Design Sessions Needed
[List of specific design sessions to conduct]
```

---

## Expected Outcomes

- [ ] Complete screen inventory with status
- [ ] Complete component inventory with status
- [ ] All UI states identified and assessed
- [ ] Clear list of what's designed vs needs design
- [ ] UX gaps documented with severity
- [ ] Design debt acknowledged
- [ ] Prioritized roadmap for design work
- [ ] List of specific design sessions to conduct next

---

## Assessment Criteria

**Design Status Levels:**

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ Complete | Final design, ready to build/built | None |
| 🟡 Partial | Core design exists, details missing | Refinement session |
| 🟠 Concept | Direction known, not designed | Design session |
| 🔴 Placeholder | No design, just structure | Full design session |
| ⚫ Not Started | Doesn't exist yet | Design from scratch |

**Priority Levels:**

| Priority | Meaning | Timeline |
|----------|---------|----------|
| Critical | Blocks MVP launch | Design immediately |
| High | Core experience quality | Design before implementation |
| Medium | Good experience | Design during implementation |
| Low | Polish/delight | Post-MVP |

---

## Tips for This Session

1. **Be honest** — Mark things as placeholder even if they look okay
2. **Check all states** — Empty, loading, error, success for every screen
3. **Think personas** — Would Reluctant Storyteller feel safe at each step?
4. **Mobile first** — Primary use case is phone at festival
5. **Note dependencies** — Some designs depend on others being done first

---

## Files to Reference

| File | Why |
|------|-----|
| `docs/APP_SPECIFICATION.md` | UX principles, aesthetic requirements |
| `docs/USER_FLOWS.md` | All screens, states, transitions |
| `docs/PRODUCT_CONTEXT.md` | Quick reference for decisions |
| Project status assessment | What's implemented vs not |

---

## Success Criteria
Session is complete when:
1. Every screen from USER_FLOWS.md is inventoried
2. Every component has design status
3. All UI states are identified
4. Gaps are documented and prioritized
5. Clear roadmap exists for design work
6. Specific design sessions are defined
7. Document exported to `docs/UX_DESIGN_AUDIT.md`

## Next Sessions
→ Individual UX design sessions based on roadmap priorities
