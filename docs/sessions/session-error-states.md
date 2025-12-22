# Session: Error States Design

**Platform:** Claude.ai (Browser)  
**Project:** UX Designer (see `UX_DESIGNER_PROJECT.md` for system prompt)  
**Type:** UX Design  
**Priority:** Phase 2 — Core Experience  
**Estimated Sessions:** 1  
**Prerequisites:** Modal Content Window Pattern (Session 1)

---

## Session Goal

Design the error modal pattern and all error state variations. Errors should feel human, not alarming — especially for the Reluctant Storyteller persona.

---

## Context

### Error Categories (from USER_FLOWS.md §9)

| Category | Examples | Severity |
|----------|----------|----------|
| **Permission** | Mic denied, camera denied | Blocking |
| **Storage** | IndexedDB full, write failed | Blocking (for save) |
| **Recording** | Interrupted, browser tab hidden | Recoverable |
| **Network** | Offline during sync (Phase 2) | Deferred |

### Error States to Design

| Error | Trigger | Actions |
|-------|---------|---------|
| **Microphone Permission Denied** | User denies mic access | Open Settings / Not Now |
| **Storage Full** | Device out of space | Manage Stories / Try Later |
| **Recording Interrupted** | User switched apps, call came in | Start Over / Cancel |
| **Save Failed** | IndexedDB write error | Retry / Try Later |
| **Generic Error** | Unknown error | Try Again |

### Error Copy (from content-voice.md)

**Tone:** Honest, helpful, not alarming

```
✓ "Couldn't save story. Your story is still here—try saving again."
✗ "ERROR: Storage write failed!"
```

---

## Reference Materials

Upload to Claude.ai:
1. `docs/USER_FLOWS.md` — §9 Error States & Recovery
2. `docs/content-voice.md` — Error message tone and examples
3. Modal Content Window pattern designs
4. `docs/APP_SPECIFICATION.md`

Reference skill:
- `.claude/skills/story-portal/references/error-states.md`

---

## Session Flow

### Single Session: Error Modal Pattern + All Variations

**Questions to explore:**

1. **Generic Error Modal Pattern**
   - Uses Modal Content Window frame
   - Icon/illustration? (Gear with X? Broken cog?)
   - Title styling
   - Message area
   - Button placement (primary/secondary actions)

2. **Microphone Permission Denied**
   - Copy: Why it's needed, how to fix
   - Actions: Open Settings / Not Now
   - Should we show a visual of where to find settings?

3. **Storage Full**
   - Copy: Explain the situation without panic
   - Actions: Manage Stories (go to My Stories to delete) / Try Later
   - "Try Later" keeps story in memory (warn it may be lost)

4. **Recording Interrupted**
   - Copy: Explain what happened (app was backgrounded)
   - Actions: Start Over / Cancel
   - Should we try to recover partial recording? (Probably not for MVP)

5. **Save Failed**
   - Copy: Reassure that story isn't lost
   - Actions: Retry / Try Later
   - "Try Later" returns to idle, story held in memory

6. **Visual Consistency**
   - Same frame for all errors
   - Icon/color variation by severity?
   - Button styling consistent with rest of app

**Deliverables:**
- Generic error modal pattern
- 5 error variation designs
- Error icon/illustration design
- Button styling within error modals
- Copy for all error states (finalized)

---

## Prompt to Start Session

Copy and paste this into Claude.ai:

```
I'm designing error states for The Story Portal — the modals that appear when something goes wrong (mic permission denied, storage full, recording interrupted, save failed).

**Design philosophy:**
- Errors should feel human, not alarming
- The Reluctant Storyteller is already nervous — errors shouldn't make them feel they "broke" something
- Honest and helpful, not corporate or scary
- Steampunk aesthetic (gears, brass) — maybe a "broken cog" icon?

**Errors to design:**
1. Microphone Permission Denied — "To record, please allow mic access" + Open Settings / Not Now
2. Storage Full — "Device out of space" + Manage Stories / Try Later  
3. Recording Interrupted — "Recording stopped when you left app" + Start Over / Cancel
4. Save Failed — "Couldn't save story" + Retry / Try Later
5. Generic Error — Fallback for unknown errors

**What I need:**
1. Generic error modal pattern (using our Modal Content Window)
2. Icon or illustration for errors (steampunk-styled)
3. Copy for each error (already have drafts, need refinement)
4. Button placement and styling
5. Any severity differentiation (color, icon variation?)

**Copy tone examples:**
✓ "Couldn't save story. Your story is still here—try saving again."
✗ "ERROR: Storage write failed!"

Let's start with the generic error modal pattern, then customize for each error type.
```

---

## Success Criteria

Session is complete when we have:
- [ ] Generic error modal pattern design
- [ ] Error icon/illustration design
- [ ] Microphone Permission Denied design + copy
- [ ] Storage Full design + copy
- [ ] Recording Interrupted design + copy
- [ ] Save Failed design + copy
- [ ] Generic Error design + copy
- [ ] Button styling within error modals
- [ ] All designs documented in skill file

---

## Handoff to Implementation

After design is complete:
1. Update skill file: `.claude/skills/story-portal/references/error-states.md`
2. Implementation in Claude CLI:
   - `ErrorModal` component (generic pattern)
   - Specific error modal variations
   - Error handling in recording flow
   - Permission request and handling

---

## Error Copy Reference (from content-voice.md)

### Microphone Permission Denied
```
Microphone Access Needed

To record your story, please allow microphone access in your browser settings.

[Open Settings]  [Not Now]
```

### Storage Full
```
Storage Full

Your device is out of space. Delete some saved stories to make room.

[Manage Stories]  [Try Later]
```

### Recording Interrupted
```
Recording Interrupted

The recording stopped when you left the app. Would you like to start over?

[Start Over]  [Cancel]
```

### Save Failed
```
Couldn't Save Story

Something went wrong. Your story is still here—try saving again.

[Retry]  [Try Later]
```

### Generic Error
```
Something's Not Working

We're not sure what happened. Try again, and if it keeps happening, restart the app.

[Try Again]
```

---

## Persona Consideration: The Reluctant Storyteller

**Fear:** "I broke something" / "My story is lost" / "I'm bad at this"

**Design implications:**
- Never blame the user
- Always reassure: "Your story is still here"
- Avoid technical jargon (IndexedDB, MediaRecorder)
- Make "try again" feel easy, not intimidating
- Use warm language: "Something's not working" not "Error"
