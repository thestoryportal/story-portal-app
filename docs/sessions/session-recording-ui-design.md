# Session: Recording UI Design

**Platform:** Claude.ai (Browser)  
**Project:** UX Designer (see `UX_DESIGNER_PROJECT.md` for system prompt)  
**Type:** UX Design  
**Priority:** Phase 1 — Critical Path  
**Estimated Sessions:** 2  
**Prerequisites:** Modal Content Window Pattern (Session 1)

---

## Session Goal

Design the complete recording experience from "tap Record" through "recording stopped." This includes all recording states, visual feedback, and controls.

---

## Context

### Current State
- Record button exists (brass/gold style) with disabled state + tooltip
- `RecordView.tsx` shows "Recording functionality coming soon..." placeholder
- No waveform, timer, or recording controls designed
- No pause/resume or time warning states

### User Flow (from USER_FLOWS.md §4)

```
Tap Record → Whose Story Modal → Consent → Recording Starts
                                              ↓
                                         [Active]
                                         ↓     ↓
                                    [Paused] [Time Warning at 4:30]
                                              ↓
                                         [Stopped at 5:00 or tap]
                                              ↓
                                         Review Screen
```

### Recording States to Design

| State | Duration | Key Elements |
|-------|----------|--------------|
| **Pre-Recording** | Brief | Consent complete, about to start |
| **Active** | 0:00 - 5:00 | Waveform, timer, Pause/Stop buttons |
| **Paused** | Variable | "Paused" indicator, Resume/Stop buttons |
| **Time Warning** | 4:30 - 5:00 | Visual pulse, "30 seconds remaining" |
| **Stopped** | Brief | Recording complete, transition to Review |

### Design Constraints
- Maximum 5 minutes recording
- Must feel intimate, not intimidating (Reluctant Storyteller persona)
- Works in group setting (phone passed around)
- Primary use: mobile devices
- Must match steampunk aesthetic

---

## Reference Materials

Upload to Claude.ai:
1. `docs/APP_SPECIFICATION.md` — §3 Audio Recording, §6 UX Principles
2. `docs/USER_FLOWS.md` — §4 Recording Flows
3. `docs/UX_DESIGN_AUDIT.md`
4. `.claude/skills/story-portal/references/content-voice.md` — Tone guidelines
5. Screenshots of current Record button states

Reference skill:
- `.claude/skills/story-portal/references/recording-ui.md`

---

## Session Flow

### Part 1: Recording States & Layout (Session 1)

**Questions to explore:**

1. **Screen Layout**
   - Where does the prompt display during recording?
   - Full screen recording view or overlay on wheel?
   - How much of steampunk environment visible?

2. **Waveform Design**
   - Style: bars, line, circular?
   - Color: brass/amber to match aesthetic?
   - Size and position

3. **Timer Design**
   - Format: M:SS counting up? Countdown from 5:00?
   - Visual treatment (steampunk numerals?)
   - Position relative to waveform

4. **Control Buttons**
   - Pause button style
   - Stop button style
   - Size and placement (thumb-reachable on mobile)

**Deliverables:**
- Recording screen layout
- Waveform component design
- Timer component design
- Button designs for Pause/Resume/Stop

### Part 2: States & Transitions (Session 2)

**Questions to explore:**

1. **Active State**
   - What visual cues show "recording in progress"?
   - Should there be a pulsing indicator?
   - How prominent is the waveform animation?

2. **Paused State**
   - Clear "Paused" indicator
   - Waveform frozen or hidden?
   - Resume button prominence

3. **Time Warning (4:30)**
   - How urgent should this feel? (Don't panic the Reluctant Storyteller)
   - Visual treatment: color change? pulse? text warning?
   - Audio cue? (subtle tone?)

4. **Stopped/Complete State**
   - Transition animation to Review screen
   - Brief "Recording complete" confirmation?
   - Preserve calm/celebratory tone (not "DONE!")

5. **Interruption Recovery**
   - What if user switches apps?
   - Error state if recording fails

**Deliverables:**
- State machine diagram with transitions
- Time warning visual treatment
- Paused state design
- Transition animations
- Error/interruption handling

---

## Prompt to Start Session

Copy and paste this into Claude.ai:

```
I'm designing the recording UI for The Story Portal, a steampunk-themed storytelling app where people record audio stories after spinning a wheel to get a prompt.

**Context:**
- Users record stories up to 5 minutes long
- Primary persona (Reluctant Storyteller) believes they have no good stories — UI must feel inviting, not intimidating
- Recording happens in group settings with phone passed between people
- Steampunk aesthetic: brass, patina, wood — warm and mechanical, not clinical

**Recording States I need to design:**
1. Active — waveform, timer, pause/stop controls
2. Paused — clear indicator, resume option
3. Time Warning (4:30) — gentle "30 seconds remaining" 
4. Stopped — transition to review

**What I need help with today:**
1. Recording screen layout — where does everything go?
2. Waveform design that fits steampunk aesthetic
3. Timer design
4. Control button design (pause, stop, resume)

**Key constraint:** The Reluctant Storyteller should feel SAFE recording, not watched or judged. The UI should feel like a warm invitation, not a production studio.

Let's start with the overall layout and work from there.
```

---

## Success Criteria

Session is complete when we have:
- [ ] Recording screen layout (mobile-first)
- [ ] Waveform component design (steampunk-styled)
- [ ] Timer component design
- [ ] Pause/Resume/Stop button designs
- [ ] Active state visual treatment
- [ ] Paused state design
- [ ] Time warning (4:30) treatment
- [ ] Stopped state and transition to Review
- [ ] Interruption/error state handling
- [ ] All designs documented in skill file

---

## Handoff to Implementation

After design is complete:
1. Update skill file: `.claude/skills/story-portal/references/recording-ui.md`
2. Create implementation session for Claude CLI: `session-recording-implementation.md`
3. Implementation builds:
   - `useAudioRecorder` hook
   - `RecordingView` component
   - Waveform visualization
   - Timer component

---

## Persona Considerations

### The Reluctant Storyteller
- **Fear:** "What if I mess up? What if my story is boring?"
- **Need:** Permission to be imperfect, easy re-record option
- **UI Implication:** 
  - Don't show "recording" in alarming red
  - Avoid countdown pressure (count up instead?)
  - Warm, amber tones over clinical white
  - Subtle time warning, not panic-inducing

### The Connector
- **Need:** Guide someone else through recording
- **UI Implication:**
  - Controls clear enough to explain verbally
  - Visual state obvious from across table

---

## Technical Notes

- WebM (Opus) format preferred, MP4 fallback for Safari
- 64-128kbps mono audio
- MediaRecorder API — recording can't be edited, single take only
- Recording saved locally (IndexedDB) — no upload during record
