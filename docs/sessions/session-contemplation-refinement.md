# Session: Contemplation Refinement Design

**Platform:** Claude.ai (Browser)  
**Type:** UX Design  
**Priority:** Phase 2 — Core Experience  
**Estimated Sessions:** 1  
**Prerequisites:** Animation System session (or can run in parallel)

---

## Session Goal

Design the contemplation state refinements:
1. **Pass Button** — New UX element allowing one re-spin on first prompt
2. **Hint Cycling** — Facilitation cues that fade in/out during contemplation
3. **Post-Reveal State** — What the screen looks like after the Topic Reveal Animation

---

## Context

### Current State

After the wheel stops:
- Prompt is visible on the wheel (landed position)
- Record button becomes active
- No Pass button exists
- No facilitation hints cycling
- Topic Reveal Animation not implemented (fire poof concept)

### Pass Button Rules (from USER_FLOWS.md §2)

```
First spin:  Pass button visible → Tap to re-spin
Second spin: No Pass button → Must proceed with prompt
```

- User gets ONE pass per session
- Re-spin may land on same prompt (by design — low probability)
- Topic pack change resets pass allowance

### Hint Cycling Logic (from USER_FLOWS.md §2)

```
If declaration_risk prompt:
  1. Show facilitation_hint FIRST (6-8 seconds)
  2. Then cycle base cues (4-5 seconds each)
  3. Loop back to facilitation_hint
  
If NOT declaration_risk prompt:
  - Cycle base cues only (4-5 seconds each)
```

**Base Cues:**
- "Take a breath. There's no rush."
- "What moment comes to mind?"
- "Trust the first memory that surfaces."

**Declaration Risk Hints** (prompt-specific, from prompts.json):
- "When did you discover this about yourself? Tell us that story."
- "Tell us about a time this showed — what happened?"

---

## Reference Materials

Upload to Claude.ai:
1. `docs/USER_FLOWS.md` — §2 Contemplation State
2. `docs/prompts.json` — Declaration risk flags and facilitation hints
3. `docs/content-voice.md` — Tone for hints
4. `docs/APP_SPECIFICATION.md` — §5 Declaration Risk Handling
5. Screenshots of current wheel/prompt display

Reference skill:
- `.claude/skills/story-portal/references/contemplation-states.md`

---

## Session Flow

### Single Session: Pass Button + Hints + Post-Reveal State

**Questions to explore:**

1. **Pass Button Design**
   - Button style: Brass/gold (like Record)? Different to indicate "opt-out"?
   - Placement: Near Record button? Elsewhere?
   - Copy: "Pass" or "New Topic" or "Spin Again"?
   - Visual treatment when disabled (second spin)
   - Animation when tapped

2. **Hint Cycling UI**
   - Where do hints appear? (Below prompt? Floating?)
   - Fade in/out animation
   - Typography and styling
   - How to not distract from the prompt itself
   - Timing: 4-5 seconds per hint

3. **Post-Reveal State**
   - After Topic Reveal Animation (fire poof lifts prompt toward user)
   - Where does the prompt settle?
   - Does it become a header? A floating card?
   - What happens to the wheel behind it?
   - Where do Record/Pass buttons appear relative to prompt?

4. **Visual Hierarchy**
   - Prompt is primary focus
   - Hints are secondary (supportive, not commanding)
   - Buttons are tertiary (available but not pushy)

**Deliverables:**
- Pass button design and placement
- Hint display area design
- Hint cycling animation spec
- Post-reveal screen layout
- State diagram for contemplation phase

---

## Prompt to Start Session

Copy and paste this into Claude.ai:

```
I'm designing the contemplation state refinements for The Story Portal — what users see after the wheel lands on their topic.

**Three elements to design:**

1. **Pass Button** — Users can pass ONCE on their first spin and re-spin. Second spin has no pass option.
   - Where should this button go?
   - How should it look? (Different from Record to indicate "opt-out"?)
   - What happens visually when they can't pass (second spin)?

2. **Hint Cycling** — Facilitation cues fade in/out to guide storytelling:
   - Base cues: "Take a breath. There's no rush." / "What moment comes to mind?"
   - Some prompts have declaration-risk hints shown first: "When did you discover this?"
   - 4-5 second cycle, gentle fade transitions

3. **Post-Reveal State** — After the Topic Reveal Animation (fire poof lifts prompt off wheel, zooms toward user):
   - Where does the prompt settle?
   - What's the screen layout for contemplation?
   - What happens to the wheel behind?

**Key constraint:** The Reluctant Storyteller should feel invited, not pressured. Hints should feel like gentle coaching, not instructions. Pass should feel like a valid choice, not giving up.

Let's start with the Pass button — what style and where does it go?
```

---

## Success Criteria

Session is complete when we have:
- [ ] Pass button design (style, placement, states)
- [ ] Pass button disabled state (second spin)
- [ ] Hint display area design
- [ ] Hint cycling animation specification
- [ ] Post-reveal screen layout
- [ ] Prompt display styling in contemplation
- [ ] Button placement (Record, Pass) in contemplation
- [ ] State diagram for contemplation phase
- [ ] All designs documented in skill file

---

## Handoff to Implementation

After design is complete:
1. Update skill file: `.claude/skills/story-portal/references/contemplation-states.md`
2. Implementation in Claude CLI:
   - `PassButton` component
   - `HintCycler` component
   - `ContemplationView` layout
   - Integration with pass logic in `useWheelSelection`

---

## Persona Considerations

### The Reluctant Storyteller
- **Fear:** "I don't have a good story for this prompt"
- **Need:** Permission to pass without shame, gentle coaching via hints
- **UI Implication:**
  - Pass button is a VALID choice, not a failure
  - Copy shouldn't say "Give up?" — just "Pass" or neutral
  - Hints should feel like a warm friend, not a therapist

### The Declarer
- **Tendency:** Respond with statements ("My resilience") rather than narratives
- **Need:** Prompting to tell a story, not make a declaration
- **UI Implication:**
  - Declaration-risk prompts show specific facilitation hints FIRST
  - Hints guide toward "Tell us about a time..." narrative framing

---

## Button Style Decision

The Pass button needs to be visually distinct from Record:

**Option A:** Same brass/gold style but with different icon (arrow indicating re-spin)
**Option B:** Patina/rust style (like NavButtons) — secondary action
**Option C:** Outlined/ghost version of brass style — less prominent

Consider: Pass should feel available but not encourage excessive use.
