# UX Design Audit — Claude Skill

**Purpose:** Track design status across all UX elements and guide design work  
**References:** `docs/APP_SPECIFICATION.md` §6, `docs/USER_FLOWS.md`

---

## Overview

This skill helps maintain awareness of what's designed vs needs design, ensuring UX work is prioritized correctly and nothing falls through the cracks.

### Why This Matters

| Risk | Consequence | This Skill Prevents |
|------|-------------|---------------------|
| Placeholder UI ships | Poor user experience | Design status tracking |
| Inconsistent patterns | Confusing interface | Component inventory |
| Missing states | Broken edge cases | State inventory |
| Persona blindspots | Reluctant Storyteller feels unsafe | Gap analysis |

---

## Design Status Definitions

| Status | Icon | Meaning | Action Required |
|--------|------|---------|-----------------|
| Complete | ✅ | Final design, implemented or ready | None |
| Partial | 🟡 | Core exists, details missing | Refinement |
| Concept | 🟠 | Direction known, not designed | Design session |
| Placeholder | 🔴 | Structure only, no design | Full design |
| Not Started | ⚫ | Doesn't exist | Create from scratch |

---

## Screen Inventory

### Core Flow Screens

| Screen | Status | Priority | Notes |
|--------|--------|----------|-------|
| Splash/Onboarding | ⚫ | High | 30-second-to-spin goal |
| Wheel (Idle) | ✅ | — | Reference implementation |
| Wheel (Spinning) | ✅ | — | Physics complete |
| Prompt Revealed | 🟡 | High | Pass button placement, animation |
| Contemplation | 🟡 | Critical | Hint cycling UI, Record button |
| Recording | 🔴 | Critical | Full design needed |
| Review | 🔴 | Critical | Playback, Keep/Re-record |
| Photo Attachment | 🔴 | Medium | Camera/gallery picker |
| Save Confirmation | 🔴 | Medium | Success state |

### Content Screens

| Screen | Status | Priority | Notes |
|--------|--------|----------|-------|
| How to Play | 🔴 | High | Copy exists, needs layout |
| Our Story | ⚫ | Medium | Needs copy + design |
| Our Work | ⚫ | Low | Gallery layout |
| Privacy Policy | ⚫ | Medium | Needs copy + design |
| Booking | ⚫ | Low | Contact form |
| My Stories (Empty) | 🔴 | High | First-time state |
| My Stories (List) | 🔴 | High | Card layout |
| Story Detail | 🔴 | High | Playback, delete |

### Modal/Overlay Screens

| Screen | Status | Priority | Notes |
|--------|--------|----------|-------|
| Whose Story Modal | 🔴 | Critical | Self vs Other choice |
| Self Consent | 🔴 | Critical | Quick affirm |
| Other Consent | 🔴 | Critical | Full consent flow |
| Email Capture | 🔴 | Critical | Optional email |
| Verbal Consent Prompt | 🔴 | Critical | Recording overlay |
| Topic Picker | 🟡 | Medium | Pack selection |
| Error Modal | 🔴 | High | All error states |
| Confirm Delete | 🔴 | Medium | Destructive action |

---

## Component Inventory

### Navigation Components

| Component | Status | Notes |
|-----------|--------|-------|
| NavButtons | ✅ | How to Play + My Stories |
| HamburgerMenu | ✅ | Gear icon + animation |
| MenuPanels | ✅ | Rope physics |
| BackButton | 🔴 | Needed for content screens |

### Input Components

| Component | Status | Notes |
|-----------|--------|-------|
| SpinButton | ✅ | Circular trigger |
| PassButton | 🔴 | Single button, prominent |
| RecordButton | 🟡 | Exists, needs states |
| StopButton | 🔴 | Recording control |
| PauseButton | 🔴 | Recording control |
| TextInput | 🔴 | For email capture |
| Checkbox | 🔴 | If needed for consent |

### Feedback Components

| Component | Status | Notes |
|-----------|--------|-------|
| Waveform | 🔴 | Recording visualization |
| Timer | 🔴 | Recording duration |
| ProgressIndicator | 🔴 | Save progress |
| Toast/Notification | 🔴 | Ephemeral feedback |
| LoadingSpinner | 🔴 | Async operations |

### Decorative Components

| Component | Status | Notes |
|-----------|--------|-------|
| FlameAnimation | ✅ | Selected prompt |
| ElectricityCanvas | 🟡 | Effects in progress |
| SteamWisps | ✅ | Ambient effect |
| GearAccent | 🔴 | Steampunk decoration |

---

## State Inventory

### Global States

| State | Designed? | Affected Screens | Notes |
|-------|-----------|------------------|-------|
| Loading | 🔴 | All | Need steampunk loader |
| Offline | 🔴 | All | Subtle indicator? |
| Error | 🔴 | All | Modal pattern |

### Screen-Specific States

| Screen | State | Designed? | Notes |
|--------|-------|-----------|-------|
| My Stories | Empty | 🔴 | First story CTA |
| My Stories | Has Stories | 🔴 | List/grid layout |
| Recording | Idle | 🔴 | Before start |
| Recording | Active | 🔴 | Waveform + timer |
| Recording | Paused | 🔴 | Paused indicator |
| Recording | Warning | 🔴 | 4:30 state |
| Contemplation | Base | 🟡 | Prompt + flame |
| Contemplation | Hint Visible | 🔴 | Cycling cues |

---

## UX Gap Analysis

### Missing Patterns

| Gap | Impact | Priority |
|-----|--------|----------|
| No loading state | Janky async transitions | High |
| No empty states | Confusing first-time experience | High |
| No error pattern | Errors feel broken | High |
| No confirmation pattern | Destructive actions risky | Medium |

### Accessibility Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| Focus states undefined | Keyboard nav broken | Medium |
| Color contrast unchecked | May fail WCAG | Medium |
| Screen reader labels | Inaccessible | Medium |
| Touch target sizes | Hard to tap | High |

### Persona Blindspots

| Persona | Potential Issue | Mitigation |
|---------|-----------------|------------|
| Reluctant Storyteller | Recording UI intimidating? | Warm, minimal design |
| Reluctant Storyteller | Error feels like failure? | Encouraging error copy |
| Connector | Handoff confusing? | Clear "hand phone over" moment |
| Facilitator | Can't track group progress? | Future: session view |

---

## Design Principles Checklist

From APP_SPECIFICATION.md §6:

| Principle | Current Status | Notes |
|-----------|----------------|-------|
| Ritual over efficiency | ✅ | Wheel animation substantial |
| Everyone has stories | 🟡 | Check copy for "amazing/best" |
| Spontaneity unlocks authenticity | ✅ | No prompt browsing |
| Audio is intimate | 🔴 | Recording UI not designed |
| Consent is sacred | 🔴 | Consent flow not designed |
| Facilitation built into UX | 🟡 | Hints defined, UI not |

### Steampunk Aesthetic Checklist

| Element | Status | Notes |
|---------|--------|-------|
| Brass/amber palette | ✅ | Defined |
| Gears/mechanical feel | 🟡 | Wheel yes, other screens? |
| Patina/aged texture | 🟡 | Some elements |
| Wood/leather | 🟡 | Buttons yes, backgrounds? |
| No cold blues/whites | ✅ | Enforced |
| Substantial animations | ✅ | Wheel, menu |

---

## Design Debt Log

| Item | Why It Exists | Impact | Resolution |
|------|---------------|--------|------------|
| Inline styles in views | Rapid prototyping | Hard to maintain | Extract to CSS/design tokens |
| Inconsistent spacing | No spacing system | Visual inconsistency | Define spacing scale |
| Mixed button styles | Ad-hoc creation | Confusing affordances | Button component system |

---

## Prioritized Design Roadmap

### Critical (Blocks MVP)

1. **Recording UI** — Core flow, currently placeholder
2. **Consent Flow** — Required for recording others
3. **Contemplation Refinement** — Hint cycling, Pass button

### High (Core Experience)

4. **My Stories Gallery** — Users need to see saved stories
5. **Error States** — All error modals
6. **How to Play** — User orientation

### Medium (Good Experience)

7. **Onboarding/Splash** — First impression
8. **Empty States** — First-time user experience
9. **Loading States** — Polish async transitions
10. **Photo Attachment** — Optional feature

### Low (Polish)

11. **Content Screens** — Our Story, Our Work, Privacy
12. **Booking Page** — Lead generation
13. **Accessibility Pass** — Focus states, contrast

---

## Design Sessions Needed

Based on audit, these design sessions should be conducted:

| Session | Priority | Scope | Interface |
|---------|----------|-------|-----------|
| Recording UI Design | Critical | Full recording experience | Browser |
| Consent Flow Design | Critical | All consent screens | Browser |
| Contemplation Refinement | Critical | Hint cycling, Pass button | Browser |
| My Stories Design | High | Gallery, detail, playback | Browser |
| Error States Design | High | Error modal pattern | Browser |
| Onboarding Design | Medium | Splash, first-spin | Browser |
| Empty States Design | Medium | All empty state patterns | Browser |
| Component System | Medium | Buttons, inputs, feedback | Browser |

---

## Updating This Document

After each design session:
1. Update relevant inventory status
2. Move completed items from roadmap
3. Add any newly discovered gaps
4. Note decisions made

This document should always reflect current design reality.

---

## References

- `docs/APP_SPECIFICATION.md` §6 (UX Principles)
- `docs/USER_FLOWS.md` (All screens and states)
- `references/design-system.md` (Visual standards)
