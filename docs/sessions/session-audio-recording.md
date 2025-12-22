# Session: Audio Recording Implementation

## Interface: Claude CLI (Claude Code)
**Why:** Hands-on implementation with file system access, ability to test MediaRecorder API, iterate on code.

---

## Session Goal
Implement complete audio recording functionality including MediaRecorder setup, waveform visualization, timer, pause/resume, and error handling.

## Pre-Session Setup (Human)
1. Ensure dev server is running (`pnpm dev`)
2. Have browser DevTools ready for testing MediaRecorder
3. Review these reference docs:
   - `docs/USER_FLOWS.md` §4 (Recording Flows)
   - `.claude/skills/story-portal/references/audio-recording.md`
4. Test microphone works in browser

---

## Prompt to Start Session

```
I need to implement audio recording for The Story Portal.

Reference docs:
- docs/USER_FLOWS.md §4 (Recording Flows)
- .claude/skills/story-portal/references/audio-recording.md (starter skill)

Current state:
- RecordView.tsx exists as placeholder ("Recording functionality coming soon...")
- No audio recording code exists yet
- localforage is not yet installed

Requirements per spec:
- WebM (Opus) preferred, MP4 fallback for Safari
- 5 minute maximum, warning at 4:30
- Pause/resume support
- Waveform visualization (subtle, warm amber aesthetic)
- Works offline

Please implement:
1. useAudioRecorder hook (MediaRecorder wrapper)
2. useWaveform hook (AnalyserNode visualization)
3. RecordingUI component with timer, waveform, controls
4. Error handling for permission denied, interruption

Start by reading the skill file and USER_FLOWS.md, then propose your implementation approach before coding.
```

---

## Key Questions Claude Should Ask

**Format & Compatibility:**
- Should we support audio-only or prepare for video (Phase 2)?
- What's the minimum iOS version we need to support?

**UX Details:**
- Should waveform show frequency bars or smooth wave?
- How prominent should the timer be?
- What happens if user backgrounds the app mid-recording?

**Integration:**
- Should recording hook handle consent state, or receive it as prop?
- Where does the blob go after recording? (localforage directly, or pass to parent?)

**Edge Cases:**
- Bluetooth headphone disconnection mid-recording?
- Very short recordings (<5 seconds) — allow or warn?
- Re-record: confirm before discarding, or immediate?

---

## Implementation Approach (Expected)

```
Phase 1: Core Recording
├── src/hooks/useAudioRecorder.ts
│   ├── MediaRecorder setup with format detection
│   ├── Start/stop/pause/resume
│   ├── Blob assembly on stop
│   └── Error handling
│
Phase 2: Visualization
├── src/hooks/useWaveform.ts
│   ├── AudioContext + AnalyserNode setup
│   ├── Frequency data extraction
│   └── Animation frame loop
├── src/components/Waveform.tsx
│   └── Canvas rendering (steampunk colors)
│
Phase 3: UI Integration
├── src/components/RecordingUI.tsx
│   ├── Timer display (M:SS format)
│   ├── Waveform component
│   ├── Control buttons (Pause/Resume, Stop)
│   └── Warning state at 4:30
│
Phase 4: Error States
├── Permission denied modal
├── Recording interrupted recovery
└── Browser not supported fallback
```

---

## Expected Outcomes

- [ ] `useAudioRecorder` hook with full recording lifecycle
- [ ] `useWaveform` hook for real-time visualization
- [ ] `Waveform` component matching steampunk aesthetic
- [ ] `RecordingTimer` component with warning state
- [ ] `RecordingUI` component integrating all pieces
- [ ] Error handling for all states in USER_FLOWS.md §9
- [ ] Works in Chrome, Safari, Firefox
- [ ] Tested on mobile (iOS Safari, Android Chrome)

---

## Testing Checklist

```
□ Start recording — mic activates, waveform animates
□ Pause recording — waveform freezes, timer pauses
□ Resume recording — continues from pause point
□ Stop recording — blob is produced
□ 4:30 warning — visual indication appears
□ 5:00 auto-stop — recording ends automatically
□ Permission denied — friendly error shown
□ Tab switch — handles gracefully (pause or warn)
□ Safari iOS — uses MP4 format correctly
□ Blob size — reasonable for duration (~1MB/min)
```

---

## Tips for This Session

1. **Test early** — Get basic recording working before adding waveform
2. **Safari quirks** — Test format detection on real iOS device
3. **Mobile first** — Primary use case is phone at festival
4. **Keep it simple** — No editing, filters, or post-processing
5. **Steampunk colors** — Waveform should use warm amber (#D4A574), not clinical green

---

## Files to Reference

| File | Why |
|------|-----|
| `docs/USER_FLOWS.md` | Recording states and transitions |
| `references/audio-recording.md` | Technical guidance |
| `references/design-system.md` | Color palette for waveform |
| `src/legacy/views/RecordView.tsx` | Current placeholder to replace |

---

## Success Criteria
Session is complete when:
1. Can record audio and produce a playable blob
2. Waveform animates during recording
3. Timer counts up with 4:30 warning
4. Pause/resume works correctly
5. Handles permission denied gracefully
6. Works on Chrome desktop and Safari iOS

## Next Session
→ Local Storage (save recorded stories)
