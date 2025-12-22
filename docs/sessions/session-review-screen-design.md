# Session: Review Screen Design

**Platform:** Claude.ai (Browser)  
**Type:** UX Design  
**Priority:** Phase 1 — Critical Path  
**Estimated Sessions:** 1  
**Prerequisites:** Modal Content Window Pattern, Recording UI Design

---

## Session Goal

Design the review screen where users decide to keep or re-record their story after recording stops. This includes playback controls and the optional photo attachment step.

---

## Context

### User Flow (from USER_FLOWS.md §2)

```
Recording Stopped
       ↓
   Review Screen
       ↓
  ┌────┴────┐
  ↓         ↓
Keep    Re-record
  ↓         ↓
Photo   → Recording
Prompt    (previous take preserved)
  ↓
Save
  ↓
Success → Back to Wheel
```

### Key Design Decisions

1. **Re-record Safety Net**
   - Previous take is preserved until new take is saved
   - If user abandons mid-re-record, previous take recoverable
   - Protects Reluctant Storyteller from accidental loss

2. **No Editing**
   - Single-take only — no trimming, no effects
   - Playback is for review, not manipulation
   - Keeps it authentic and spontaneous

3. **Photo Attachment**
   - Optional photo to accompany story
   - Camera or gallery selection
   - Appears after "Keep" decision

---

## Reference Materials

Upload to Claude.ai:
1. `docs/USER_FLOWS.md` — §2 Save Phase
2. `docs/content-voice.md` — Button labels, tone
3. Recording UI designs (from previous session)
4. Modal Content Window pattern (from Session 1)

Reference skill:
- `.claude/skills/story-portal/references/review-screen.md`

---

## Session Flow

### Single Session: Complete Review Screen Design

**Questions to explore:**

1. **Layout**
   - Show prompt text? (Reminder of what they talked about)
   - Show duration? (Confirmation of length)
   - How prominent is playback vs decision buttons?

2. **Playback Controls**
   - Play/Pause button
   - Progress indicator (scrubber or just progress bar?)
   - Current time / total time display
   - Can user seek within recording?

3. **Decision Buttons**
   - "Keep" vs "Re-record" — which is primary?
   - Button styling (brass/gold? different colors?)
   - Copy: "Keep" not "Save" (per content-voice.md)
   - Should "Re-record" require confirmation?

4. **Photo Prompt (after Keep)**
   - "Add Photo" option
   - "Skip" option (must feel genuinely optional)
   - Camera vs gallery choice
   - Photo preview if selected

5. **Transition to Save**
   - Progress indicator during save
   - Success confirmation
   - Return to wheel (quick, for next person in group)

**Deliverables:**
- Review screen layout
- Audio playback component design
- Keep/Re-record button design
- Photo prompt screen design
- Save progress and success states
- Transition animations

---

## Prompt to Start Session

Copy and paste this into Claude.ai:

```
I'm designing the review screen for The Story Portal — the screen users see after recording their story, where they decide to keep or re-record.

**Context:**
- User just finished recording (up to 5 minutes)
- They can play it back to review
- Two choices: "Keep" (save it) or "Re-record" (try again)
- After "Keep", optional photo attachment
- Then save to local storage

**Design Constraints:**
- Steampunk aesthetic (brass, patina, wood)
- Single-take only — no editing, just playback for review
- Re-record preserves previous take until new one is saved
- Must work in group settings — quick transition back to wheel

**Key personas:**
- Reluctant Storyteller: "Did that sound okay?" — needs reassurance, not judgment
- Connector: Recording others — needs quick flow for next person

**What I need help with:**
1. Review screen layout — prompt, playback, decision buttons
2. Audio playback controls (play/pause, progress, time)
3. Keep/Re-record button design and placement
4. Photo attachment prompt (optional step)
5. Save confirmation and return to wheel

**Copy note:** Use "Keep" not "Save" — warmer language per our voice guidelines.

Let's start with the overall layout.
```

---

## Success Criteria

Session is complete when we have:
- [ ] Review screen layout
- [ ] Audio playback component design
- [ ] Play/Pause button design
- [ ] Progress indicator design
- [ ] Keep button design
- [ ] Re-record button design
- [ ] Photo prompt screen design
- [ ] Save progress indicator
- [ ] Success confirmation design
- [ ] Transition to wheel animation
- [ ] All designs documented in skill file

---

## Handoff to Implementation

After design is complete:
1. Update skill file: `.claude/skills/story-portal/references/review-screen.md`
2. Create implementation session for Claude CLI
3. Implementation builds:
   - `ReviewScreen` component
   - `AudioPlayback` component
   - `PhotoPrompt` component
   - Save flow with IndexedDB

---

## Persona Considerations

### The Reluctant Storyteller
- **Fear:** "That probably sounded terrible"
- **Need:** Neutral review experience, easy re-record option
- **UI Implication:**
  - Don't emphasize playback (optional to listen)
  - "Keep" as the warm, accepting primary action
  - "Re-record" available but not prominent
  - No ratings, no "How did it go?" prompts

### The Connector (Recording Others)
- **Need:** Quick handoff back to themselves after storyteller reviews
- **UI Implication:**
  - Fast flow from Keep → Photo → Save → Wheel
  - Clear "Story saved" confirmation before handing phone back

---

## Audio Playback Technical Notes

- Format: WebM (Opus) or MP4 (Safari fallback)
- Duration: Up to 5 minutes
- No seeking required, but nice to have
- Playback uses HTML5 Audio API
- Should show waveform from recording? Or simpler progress bar?

---

## Button Copy Reference (from content-voice.md)

| Action | Label | Not |
|--------|-------|-----|
| Save story | "Keep" | "Save", "Submit" |
| Try again | "Re-record" | "Delete", "Discard" |
| Add photo | "Add Photo" | "Attach", "Upload" |
| Skip photo | "Skip" | "No Thanks", "Later" |
