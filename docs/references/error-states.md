# Error States — Claude Skill

**Purpose:** Guide design and implementation of error modals and recovery flows  
**References:** `docs/USER_FLOWS.md` §9, `docs/content-voice.md`

---

## Overview

Error states handle what happens when something goes wrong. The design philosophy: errors should feel human, not alarming — especially for the Reluctant Storyteller persona.

---

## Design Status

**Status:** 🔴 Needs Design

**Design session:** `docs/sessions/session-error-states.md`

---

## Error Categories

| Category       | Examples                     | Severity    | Recovery               |
| -------------- | ---------------------------- | ----------- | ---------------------- |
| **Permission** | Mic denied, camera denied    | Blocking    | Open Settings          |
| **Storage**    | IndexedDB full, write failed | Blocking    | Manage Stories / Retry |
| **Recording**  | Interrupted, tab hidden      | Recoverable | Start Over             |
| **Network**    | Offline during sync          | Deferred    | Phase 2                |

---

## Error Modal Pattern

All errors use a consistent modal pattern (based on Modal Content Window):

```
┌─────────────────────────────────┐
│                                 │
│         [Error Icon]            │
│                                 │
│       Error Title Here          │
│                                 │
│   Explanatory message that      │
│   tells them what happened      │
│   and what they can do.         │
│                                 │
│   [Primary Action]  [Secondary] │
│                                 │
└─────────────────────────────────┘
```

---

## Error Specifications

### 1. Microphone Permission Denied

**Trigger:** User denies microphone access when trying to record

**Copy:**

```
Microphone Access Needed

To record your story, please allow microphone access in your browser settings.

[Open Settings]  [Not Now]
```

**Actions:**

- **Open Settings:** Opens system/browser settings
- **Not Now:** Returns to contemplation (can't record)

---

### 2. Storage Full

**Trigger:** IndexedDB quota exceeded when saving story

**Copy:**

```
Storage Full

Your device is out of space. Delete some saved stories to make room.

[Manage Stories]  [Try Later]
```

**Actions:**

- **Manage Stories:** Opens My Stories for deletion
- **Try Later:** Returns to idle, story held in memory (warning: may be lost if app closes)

---

### 3. Recording Interrupted

**Trigger:** Browser tab hidden, phone call, app backgrounded during recording

**Copy:**

```
Recording Interrupted

The recording stopped when you left the app. Would you like to start over?

[Start Over]  [Cancel]
```

**Actions:**

- **Start Over:** Return to recording (previous audio lost)
- **Cancel:** Return to contemplation

---

### 4. Save Failed

**Trigger:** IndexedDB write error (not quota)

**Copy:**

```
Couldn't Save Story

Something went wrong. Your story is still here—try saving again.

[Retry]  [Try Later]
```

**Actions:**

- **Retry:** Attempt save again
- **Try Later:** Returns to idle, story held in memory

---

### 5. Generic Error

**Trigger:** Unknown/unexpected error

**Copy:**

```
Something's Not Working

We're not sure what happened. Try again, and if it keeps happening, restart the app.

[Try Again]
```

**Actions:**

- **Try Again:** Retry the failed action

---

## Design Decisions (To Be Filled After Session)

### Modal Frame

```
Uses Modal Content Window: [TBD]
Size: [TBD]
Position: [TBD - centered]
```

### Error Icon

```
Style: [TBD - broken gear? sad cog?]
Color: [TBD - amber/copper to match aesthetic]
Size: [TBD]
```

### Typography

```
Title: [TBD]
Message: [TBD]
```

### Buttons

```
Primary style: [TBD]
Secondary style: [TBD]
Placement: [TBD - side by side / stacked]
```

### Animation

```
Appear: [TBD]
Dismiss: [TBD]
```

---

## Tone Guidelines

From content-voice.md:

| Do                             | Don't                          |
| ------------------------------ | ------------------------------ |
| "Couldn't save story"          | "ERROR: Storage write failed!" |
| "Something's not working"      | "Error 500"                    |
| "Your story is still here"     | "Data may be lost"             |
| "Try again"                    | "Retry operation"              |
| "We're not sure what happened" | "Unknown error occurred"       |

### Key Principles

- **Never blame the user** — It's "something went wrong", not "you did something wrong"
- **Reassure when possible** — "Your story is still here"
- **Avoid jargon** — No "IndexedDB", "MediaRecorder", "quota exceeded"
- **Keep it warm** — Errors happen, it's okay

---

## Persona Considerations

### The Reluctant Storyteller

- **Fear:** "I broke something" / "My story is lost"
- **Design response:**
  - Warm, non-alarming visual treatment
  - Reassure that nothing is their fault
  - "Your story is still here" when possible
  - Easy path to try again

---

## Implementation Notes

### Components to Create

- `ErrorModal.tsx` — Generic error modal pattern
- Error-specific variations (or props to generic)

### Props

```typescript
interface ErrorModalProps {
  icon?: 'mic' | 'storage' | 'recording' | 'generic'
  title: string
  message: string
  primaryAction: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}
```

### Error Handling Flow

```typescript
try {
  await saveStory(story)
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    showError('storage-full')
  } else {
    showError('save-failed')
  }
}
```

---

## Permission Handling

### Microphone Permission Flow

```
Tap Record
    ↓
Check permission state
    ↓
┌───────┴───────┐
↓               ↓
Granted     Not Granted
↓               ↓
Proceed    Prompt permission
            ↓
      ┌─────┴─────┐
      ↓           ↓
    Granted    Denied
      ↓           ↓
    Proceed    Show Error
```

### Permission API

```typescript
const permission = await navigator.permissions.query({ name: 'microphone' })
// 'granted' | 'denied' | 'prompt'
```

---

## Accessibility

- Error modals trap focus
- Error icon has aria-hidden (decorative)
- Announce error title to screen readers
- Buttons have clear accessible names
- Escape key dismisses (if appropriate)

---

## References

- `docs/USER_FLOWS.md` §9 (Error States & Recovery)
- `docs/content-voice.md` (Error message tone)
- `skills/modal-content-window.md` (Modal pattern)
- `docs/sessions/session-error-states.md` (Design session)
