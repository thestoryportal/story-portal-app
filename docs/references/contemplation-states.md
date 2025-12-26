# Contemplation States — Claude Skill

**Purpose:** Guide design and implementation of the contemplation phase (after wheel lands)  
**References:** `docs/USER_FLOWS.md` §2, `docs/APP_SPECIFICATION.md` §5

---

## Overview

The Contemplation state is where the user considers their prompt before telling their story. Key elements:

1. **Topic Reveal Animation** — Fire poof lifts topic off wheel
2. **Pass Button** — Allow one re-spin (first prompt only)
3. **Hint Cycling** — Facilitation cues that fade in/out
4. **Post-Reveal Layout** — Where everything settles

---

## Design Status

**Status:** 🔴 Needs Design

**Current state:** Prompt visible on wheel after landing, Record button active, no Pass button, no hints, no Topic Reveal animation.

**Design session:** `docs/sessions/session-contemplation-refinement.md`

---

## State Flow

```
Wheel Lands
     ↓
Topic Reveal Animation (fire poof)
     ↓
Contemplation State
├── Prompt displayed prominently
├── Pass button visible (first spin only)
├── Record button active
├── Hints cycling (if declaration_risk or base cues)
     ↓
User Action:
├── Tap Pass → Re-spin wheel (pass consumed)
├── Tap Record → Consent flow
└── Tell story without recording → Pass app to next person
```

---

## Pass Button

### Rules

```
First spin:  Pass button visible → Tap to re-spin
Second spin: No Pass button → Must proceed with prompt
Topic change: Resets pass allowance
```

### Design Considerations

- Must be visible but not encourage overuse
- Different style from Record to indicate "opt-out" action
- Clear disabled/unavailable state for second spin
- Copy: "Pass" or "New Topic" or "Try Another"

### Behavior

- Tap triggers immediate re-spin
- May land on same prompt (by design)
- Pass count tracked in session state

---

## Hint Cycling

### Logic (from USER_FLOWS.md §2)

```javascript
if (prompt.declaration_risk) {
  // Show facilitation_hint FIRST (6-8 seconds)
  // Then cycle base cues (4-5 seconds each)
  // Loop back to facilitation_hint
} else {
  // Cycle base cues only (4-5 seconds each)
}
```

### Base Cues

```
"Take a breath. There's no rush."
"What moment comes to mind?"
"Trust the first memory that surfaces."
```

### Declaration Risk Hints (from prompts.json)

Examples:

- "When did you discover this about yourself? Tell us that story."
- "Tell us about a time this showed — what happened?"
- "How did you learn this wisdom — what happened that taught you?"

### Visual Treatment

- Fade in/out animation
- Position: Below prompt, floating overlay?
- Typography: Secondary to prompt, readable but not dominant
- Timing: 4-5 seconds per hint

---

## Topic Reveal Animation

### Concept

When wheel stops on a topic:

1. Fire poof originates (from behind panel? portal ring?)
2. Topic panel lifts off wheel
3. Topic zooms toward user
4. Settles in contemplation position

### Design Questions (TBD)

```
Fire origin: [TBD]
Fire style: [TBD - amber/orange, brass sparks, smoke]
Trajectory: [TBD - straight / arc]
Duration: [TBD - 600-1000ms?]
Sound: [TBD - whoosh, crackle]
```

### Post-Reveal State (TBD)

```
Prompt position: [TBD - center / top / floating]
Prompt size: [TBD - larger than on wheel]
Wheel visibility: [TBD - dimmed / hidden / visible]
Button positions: [TBD]
```

---

## Design Decisions (To Be Filled After Session)

### Pass Button

```
Style: [TBD - brass / patina / outlined]
Position: [TBD]
Copy: [TBD - "Pass" / "New Topic" / other]
Disabled state: [TBD - hidden / grayed / removed]
Icon: [TBD - refresh arrow?]
```

### Hint Display

```
Position: [TBD]
Typography: [TBD]
Fade duration: [TBD]
Cycle timing: [TBD]
```

### Post-Reveal Layout

```
Prompt position: [TBD]
Prompt styling: [TBD]
Wheel state: [TBD]
Button layout: [TBD]
Overall composition: [TBD]
```

---

## Declaration Risk Prompts

21 prompts flagged as high declaration risk in prompts.json. These tend to invite declarations ("My resilience") rather than narratives ("Let me tell you about the night I almost gave up").

Example prompts with declaration_risk: true:

- "What I love most about myself"
- "Dreams"
- "What are you so afraid of?"
- "God is"
- "My Sanctuary"

For these, show the prompt-specific `facilitation_hint` FIRST to guide toward narrative.

---

## Persona Considerations

### The Reluctant Storyteller

- **Fear:** "I don't have a good story for this"
- **Design response:**
  - Pass is a valid choice, not a failure
  - Copy shouldn't shame them ("Give up?")
  - Hints feel like friendly coaching

### The Declarer

- **Tendency:** Statement responses ("My resilience")
- **Design response:**
  - Declaration-risk hints guide toward narrative
  - "Tell us about a time..." framing

---

## Implementation Notes

### State Management

```typescript
interface ContemplationState {
  prompt: Prompt
  canPass: boolean // true on first spin
  currentHint: string
  hintIndex: number
  isRevealAnimating: boolean
}
```

### Components to Create

- `ContemplationView.tsx` — Main layout
- `PassButton.tsx` — Pass/re-spin button
- `HintCycler.tsx` — Hint display with cycling
- `TopicReveal.tsx` — Animation component (Canvas/CSS)

### Hooks

```typescript
useHintCycler(prompt: Prompt) {
  currentHint: string;
  // Handles timing and cycling logic
}

usePassState() {
  canPass: boolean;
  consumePass(): void;
  resetPass(): void;  // Called on topic pack change
}
```

---

## Accessibility

- Hints are not critical information (decorative coaching)
- Pass button has clear accessible name
- Screen reader announces prompt clearly
- Topic Reveal animation doesn't prevent interaction

---

## References

- `docs/USER_FLOWS.md` §2 (Contemplation state)
- `docs/APP_SPECIFICATION.md` §5 (Declaration Risk Handling)
- `docs/prompts.json` (declaration_risk flags and facilitation_hints)
- `docs/content-voice.md` (Hint tone)
- `docs/sessions/session-contemplation-refinement.md` (Design session)
- `skills/animation-system.md` (Topic Reveal animation)
