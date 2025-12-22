# Review Screen — Claude Skill

**Purpose:** Guide design and implementation of the post-recording review experience  
**References:** `docs/USER_FLOWS.md` §2 (Save Phase)

---

## Overview

The Review Screen appears after recording stops. Users can:
1. Play back their recording
2. Decide to Keep or Re-record
3. Optionally attach a photo
4. Save and return to wheel

---

## Design Status

**Status:** 🔴 Needs Design

**Design session:** `docs/sessions/session-review-screen-design.md`

---

## User Flow

```
Recording Stopped
       ↓
   Review Screen
       ↓
  ┌────┴────┐
  ↓         ↓
Keep    Re-record
  ↓         ↓
Photo   → Recording (previous take preserved)
Prompt
  ↓
 Save
  ↓
Success → Back to Wheel
```

---

## Key Design Decisions

### Re-record Safety Net
- Previous take is **preserved** in memory
- New recording begins fresh
- Previous take deleted **only when new take is saved**
- If user abandons mid-re-record, previous take can be recovered

### No Editing
- Single-take recordings only
- Playback is for review, not manipulation
- No trimming, effects, or post-processing
- Keeps it authentic and spontaneous

### Photo Attachment
- Optional step after "Keep"
- Camera or gallery selection
- One photo per story (MVP)
- Can skip with no penalty

---

## Screen Elements

### Prompt Display
- Show the topic they spoke about
- Helps user remember/evaluate their story
- Styled consistently with contemplation state

### Playback Controls
| Control | Function |
|---------|----------|
| Play/Pause | Toggle playback |
| Progress | Visual indicator of position |
| Time | Current / Total (0:47 / 2:15) |
| Seek | [TBD - optional for MVP] |

### Decision Buttons
| Button | Label | Action |
|--------|-------|--------|
| Primary | "Keep" | Proceed to photo prompt |
| Secondary | "Re-record" | Return to recording |

**Copy note:** "Keep" not "Save" — warmer language per content-voice.md

---

## Design Decisions (To Be Filled After Session)

### Layout
```
Prompt position: [TBD]
Playback controls position: [TBD]
Decision buttons position: [TBD]
Overall layout: [TBD - stacked / side-by-side]
```

### Playback Component
```
Play button style: [TBD]
Progress bar style: [TBD]
Time display format: [TBD]
Seek enabled: [TBD - yes/no]
```

### Decision Buttons
```
Keep button style: [TBD]
Re-record button style: [TBD]
Button placement: [TBD]
Confirmation for re-record: [TBD - yes/no]
```

### Photo Prompt
```
Screen layout: [TBD]
Camera button style: [TBD]
Gallery button style: [TBD]
Skip button style: [TBD]
Photo preview: [TBD - size/position]
```

### Transitions
```
Enter animation: [TBD]
Exit to save: [TBD]
Exit to wheel: [TBD]
```

---

## Photo Prompt Screen

After user taps "Keep":

```
┌─────────────────────────────────┐
│                                 │
│     Add a photo to your story?  │
│                                 │
│   [📷 Camera]   [🖼 Gallery]    │
│                                 │
│            Skip                 │
│                                 │
└─────────────────────────────────┘
```

### Photo Selection Flow
1. User taps Camera or Gallery
2. Native picker opens
3. Photo selected
4. Preview shown with Confirm/Change options
5. Proceed to Save

---

## Save Flow

### Progress State
- Show saving indicator
- Steampunk-styled progress (gears? loading bar?)
- Brief — should be < 1 second for local save

### Success State
- "Story saved" confirmation
- Brief celebration moment (subtle, not over the top)
- Auto-transition to wheel (for next person in group)

### Failure State
- See error-states.md for Save Failed error
- "Retry" and "Try Later" options
- Story preserved in memory

---

## Persona Considerations

### The Reluctant Storyteller
- **Fear:** "That probably sounded terrible"
- **Design response:**
  - Playback is optional (don't force them to listen)
  - "Keep" is the warm, accepting primary action
  - "Re-record" available but not emphasized
  - No ratings, no feedback prompts
  - Neutral presentation, no judgment

### The Connector (Recording Others)
- **Need:** Quick handoff back after storyteller reviews
- **Design response:**
  - Fast flow: Keep → Photo → Save → Wheel
  - Clear "Story saved" before passing phone back
  - Auto-return to wheel (ready for next person)

---

## Implementation Notes

### Components to Create
- `ReviewScreen.tsx` — Main review layout
- `AudioPlayback.tsx` — Play/pause/progress controls
- `PhotoPrompt.tsx` — Camera/gallery/skip options
- `SaveProgress.tsx` — Saving indicator
- `SaveSuccess.tsx` — Confirmation

### Hooks
```typescript
useAudioPlayback(blob: Blob) {
  isPlaying: boolean
  currentTime: number
  duration: number
  play(): void
  pause(): void
  seek(time: number): void
}
```

### Storage
```typescript
// Save to IndexedDB
await localForage.setItem(`story_${id}`, {
  audioBlob: Blob,
  prompt: Prompt,
  timestamp: string,
  duration: number,
  consent: ConsentMetadata,
  photo?: Blob
});
```

---

## Button Copy Reference (from content-voice.md)

| Action | Label | Not |
|--------|-------|-----|
| Save story | "Keep" | "Save", "Submit" |
| Try again | "Re-record" | "Delete", "Discard" |
| Add photo | "Add Photo" | "Attach", "Upload" |
| Skip photo | "Skip" | "No Thanks", "Later" |

---

## Accessibility

- Audio playback controls keyboard accessible
- Progress bar has aria-valuenow/min/max
- Buttons have clear accessible names
- Photo selection uses native pickers (inherently accessible)

---

## References

- `docs/USER_FLOWS.md` §2 (Save Phase)
- `docs/content-voice.md` (Button labels)
- `docs/sessions/session-review-screen-design.md` (Design session)
- `skills/recording-ui.md` (For playback consistency)
