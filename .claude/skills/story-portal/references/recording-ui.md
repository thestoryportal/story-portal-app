# Recording UI — Claude Skill

**Purpose:** Guide design and implementation of the audio recording experience  
**References:** `docs/APP_SPECIFICATION.md` §3, `docs/USER_FLOWS.md` §4

---

## Overview

The Recording UI covers the complete recording experience from "tap Record" through "recording stopped." This is a critical path feature — without it, no stories can be captured.

---

## Design Status

**Status:** 🔴 Needs Design

**Current state:** `RecordView.tsx` shows "Recording functionality coming soon..." placeholder

**Design session:** `docs/sessions/session-recording-ui-design.md`

---

## Recording States

| State | Duration | Key Elements | User Actions |
|-------|----------|--------------|--------------|
| **Active** | 0:00 - 5:00 | Waveform, timer, controls | Pause, Stop |
| **Paused** | Variable | "Paused" indicator | Resume, Stop |
| **Time Warning** | 4:30 - 5:00 | Visual pulse, message | Stop (or auto-stop at 5:00) |
| **Stopped** | Brief | Transition indicator | None (auto to Review) |

---

## Technical Constraints

### Audio Format
- WebM (Opus codec) — preferred
- MP4 (AAC) — fallback for Safari
- Quality: 64-128kbps mono
- Max duration: 5 minutes (~2-4MB per story)

### Browser API
```typescript
// Core recording flow
navigator.mediaDevices.getUserMedia({ audio: true })
  → MediaRecorder API
  → Blob (audio/webm or audio/mp4)
  → localForage.setItem(`story_${id}`, blob)
```

### Performance Targets
- Recording start: < 500ms from tap
- Waveform: 60fps visualization
- No audio dropouts

---

## Design Requirements

### Screen Layout
```
┌─────────────────────────────────┐
│         [Prompt Text]           │  ← Reminder of topic
├─────────────────────────────────┤
│                                 │
│     ════════════════════        │  ← Waveform
│     ▓▓▓▓▓▓░░░░░░░░░░░░░        │
│                                 │
│          0:47 / 5:00            │  ← Timer
│                                 │
│       [Pause]    [Stop]         │  ← Controls
│                                 │
└─────────────────────────────────┘
```

### Waveform Design
- Style: [TBD - bars/line/circular]
- Color: Brass/amber to match aesthetic
- Animation: Real-time audio level visualization
- Position: Central focus

### Timer Design
- Format: Current / Max (0:47 / 5:00)
- Typography: [TBD - steampunk numerals?]
- Position: Below or alongside waveform

### Control Buttons
- **Pause:** Pauses recording, preserves audio
- **Stop:** Ends recording, transitions to Review
- **Resume** (paused state): Continues recording
- Style: Brass/gold to match existing buttons

---

## State Behaviors

### Active State
- Waveform animating with audio input
- Timer counting up
- Pause and Stop buttons visible
- Subtle "recording" indicator (pulsing dot?)

### Paused State
- Waveform frozen or dimmed
- "Paused" text indicator
- Timer frozen
- Resume and Stop buttons visible
- Clear that recording can continue

### Time Warning (4:30)
- Visual change: [TBD - color shift? pulse?]
- Text: "30 seconds remaining"
- Tone: Informative, not panic-inducing
- Optional: Subtle audio cue

### Auto-Stop (5:00)
- Recording ends automatically
- Smooth transition to Review screen
- No jarring cutoff

---

## Design Decisions (To Be Filled After Session)

### Layout
```
Screen type: [TBD - full screen / overlay on wheel]
Prompt display: [TBD - position and style]
Environment visibility: [TBD - how much steampunk background]
```

### Waveform
```
Style: [TBD]
Color: [TBD]
Size: [TBD]
Animation: [TBD]
```

### Timer
```
Format: [TBD]
Typography: [TBD]
Position: [TBD]
```

### Controls
```
Button style: [TBD]
Button size: [TBD]
Placement: [TBD]
Spacing: [TBD]
```

### Time Warning
```
Visual treatment: [TBD]
Text: [TBD]
Audio cue: [TBD - yes/no]
```

---

## Persona Considerations

### The Reluctant Storyteller
- **Fear:** "I'm being recorded" feels intimidating
- **Design response:**
  - Warm amber tones, not clinical white/red
  - Timer counts UP (less pressure than countdown)
  - Controls are available but not screaming at them
  - No "RECORDING" in alarming red

### The Connector (Recording Others)
- **Need:** Guide storyteller, see status clearly
- **Design response:**
  - Visual state obvious from across table
  - Controls large enough to explain verbally

---

## Implementation Notes

### Hooks to Create
```typescript
// Core recording hook
useAudioRecorder() {
  state: 'idle' | 'active' | 'paused' | 'stopped'
  duration: number
  audioLevel: number  // for waveform
  start(): void
  pause(): void
  resume(): void
  stop(): Promise<Blob>
}

// Waveform visualization hook
useWaveform(audioLevel: number) {
  // Returns data for waveform rendering
}
```

### Components to Create
- `RecordingView.tsx` — Main recording screen
- `Waveform.tsx` — Audio visualization
- `RecordingTimer.tsx` — Duration display
- `RecordingControls.tsx` — Pause/Stop/Resume buttons

---

## Error Handling

### Microphone Access Denied
- Show error modal (see error-states.md)
- Link to settings

### Recording Interrupted
- Browser tab hidden
- Phone call received
- App backgrounded
- Show recovery modal: Start Over / Cancel

### MediaRecorder Error
- Fallback to generic error modal
- "Recording failed, try again"

---

## Accessibility

- Waveform should not be the only indicator (color blind users)
- Screen reader announces state changes
- Buttons have clear labels
- Timer readable by screen readers

---

## References

- `docs/APP_SPECIFICATION.md` §3 (Audio Recording)
- `docs/USER_FLOWS.md` §4 (Recording Flows)
- `docs/content-voice.md` (UI tone)
- `docs/sessions/session-recording-ui-design.md` (Design session)
