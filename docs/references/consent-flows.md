# Consent Flows — Claude Skill

**Purpose:** Guide implementation of recording consent UX and data handling  
**References:** `docs/USER_FLOWS.md` §4, §8, `docs/APP_SPECIFICATION.md` §3

---

## Overview

Consent is sacred. Recording someone's story is an act of trust. The consent flow must be clear, unambiguous, and respectful—while not being so heavy that it kills the spontaneous magic of the moment.

### Design Principles

| Principle                                  | Implication                            |
| ------------------------------------------ | -------------------------------------- |
| Consent is captured, not just acknowledged | Verbal consent lives in the audio file |
| Clear and unambiguous                      | No legal jargon, plain language        |
| Respects the moment                        | Quick enough to preserve spontaneity   |
| Supports The Connector                     | Easy to guide someone through          |

---

## Two Consent Paths

Per USER_FLOWS.md §4:

| Path                 | When                            | Flow                                          |
| -------------------- | ------------------------------- | --------------------------------------------- |
| **Self Recording**   | "My Story" selected             | Quick affirm → Record                         |
| **Recording Others** | "Someone Else's Story" selected | Tap consent → Email → Verbal consent → Record |

---

## Self Recording Flow

### UI Sequence

```
[Contemplation Screen]
        ↓
    Tap Record
        ↓
[Modal: "Whose story is this?"]
    [My Story] ← User taps
        ↓
[Brief Affirm Screen]
    "Ready to tell your story?"
    [Start Recording]
        ↓
    Recording begins
```

### Self Consent Screen

**Minimal friction.** User is consenting to record themselves—implicit in the action.

```
┌─────────────────────────────────────┐
│                                     │
│     Ready to tell your story?       │
│                                     │
│  Your recording will be saved       │
│  on this device.                    │
│                                     │
│      [ Start Recording ]            │
│                                     │
│           Cancel                    │
│                                     │
└─────────────────────────────────────┘
```

### Consent Data (Self)

```typescript
const selfConsent: ConsentMetadata = {
  type: 'self',
  verbalConsentInAudio: false, // Not required for self
}
```

---

## Recording Others Flow

### UI Sequence

```
[Contemplation Screen]
        ↓
    Tap Record
        ↓
[Modal: "Whose story is this?"]
    [Someone Else's Story] ← Connector taps
        ↓
[Consent Script Screen]
    Storyteller reads/hears consent language
    [I Consent] ← Storyteller taps
        ↓
[Email Capture Screen]
    Optional email entry
    [Continue] or [Skip]
        ↓
    Recording begins
        ↓
[Verbal Consent Prompt]
    Storyteller states consent into recording
        ↓
    Story continues
```

### Consent Script Screen

**The storyteller (not the Connector) should read this and tap consent.**

```
┌─────────────────────────────────────┐
│                                     │
│        Recording Consent            │
│                                     │
│  By tapping "I Consent" and         │
│  stating your consent aloud,        │
│  you agree to have your story       │
│  recorded.                          │
│                                     │
│  Your story will be saved on this   │
│  device. The person recording may   │
│  share it with you later.           │
│                                     │
│         [ I Consent ]               │
│                                     │
│            Cancel                   │
│                                     │
└─────────────────────────────────────┘
```

### Email Capture Screen

**Optional.** Enables follow-up/sharing in Phase 2.

```
┌─────────────────────────────────────┐
│                                     │
│     Want a copy of your story?      │
│                                     │
│  Enter your email and we'll send    │
│  you a link when sharing is         │
│  available.                         │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ email@example.com           │    │
│  └─────────────────────────────┘    │
│                                     │
│         [ Continue ]                │
│                                     │
│            Skip                     │
│                                     │
└─────────────────────────────────────┘
```

### Verbal Consent Prompt

**Shown while recording is active.** Storyteller states consent into the mic.

```
┌─────────────────────────────────────┐
│                                     │
│       🔴 Recording                  │
│                                     │
│  Please say:                        │
│                                     │
│  "I consent to having my story      │
│   recorded by The Story Portal."    │
│                                     │
│  Then tell your story...            │
│                                     │
│         [ I've Said It ]            │
│                                     │
└─────────────────────────────────────┘
```

After tapping "I've Said It", the prompt clears and normal recording UI appears.

---

## Consent Language

### Verbal Consent Script

> "I consent to having my story recorded by The Story Portal."

**Notes:**

- Short enough to say naturally
- Clear about what's being consented to
- Becomes part of the audio record

### Tap Consent Language

> By tapping "I Consent" and stating your consent aloud, you agree to have your story recorded.
>
> Your story will be saved on this device. The person recording may share it with you later.

### Why Both Tap AND Verbal?

| Consent Type | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| Tap          | Immediate, documented, timestamped                   |
| Verbal       | In-audio record, harder to dispute, feels ceremonial |

The verbal consent also serves as a **ritual**—it marks the transition from "chatting" to "storytelling."

---

## Consent Data Model

```typescript
interface ConsentMetadata {
  type: 'self' | 'other'
  tapConsentTimestamp?: string // ISO 8601, when "I Consent" was tapped
  verbalConsentInAudio: boolean // Always true for 'other'
  storytellerEmail?: string // Optional
  storytellerName?: string // Optional, for gallery display
}
```

### Storage

Consent metadata is stored with the story record:

```typescript
interface StoryRecord {
  id: string
  audioBlob: Blob
  prompt: Prompt
  timestamp: string
  duration: number
  consent: ConsentMetadata // ← Required
  photo?: Blob
}
```

---

## Privacy Policy Implications

The consent flow promises specific things. Privacy Policy must match:

| Promise in Consent         | Privacy Policy Must State                  |
| -------------------------- | ------------------------------------------ |
| "Saved on this device"     | Stories stored locally, not uploaded (MVP) |
| "May share with you later" | Phase 2 sharing feature planned            |
| Email collected            | Used only for story sharing, not marketing |

---

## Facilitator Guidance

The Connector often guides someone through this flow. The UI should support this:

### Tips for The Connector

- Hand the phone to the storyteller for the consent tap
- Read the consent language aloud if they prefer
- Reassure: "You can say whatever you want. There's no wrong way to do this."
- After verbal consent: "Whenever you're ready, just start talking."

### UI Support

- Large, readable text (storyteller may be unfamiliar with app)
- Clear button labels
- Minimal clutter during consent flow

---

## Edge Cases

### Storyteller Refuses Consent

- Cancel button returns to Contemplation
- No recording, no data captured
- The Connector can still tell the story without recording

### Storyteller Skips Email

- Perfectly fine—email is optional
- Story is still saved with consent
- Phase 2 sharing would require manual export

### Storyteller Forgets Verbal Consent

- Recording continues anyway
- Not ideal, but the tap consent is the legal minimum
- Connector can remind them or re-record

### Cancel Mid-Flow

At any point before recording starts:

- Cancel returns to Contemplation
- No data captured
- Clean slate

---

## Accessibility Considerations

- Large tap targets (48px minimum)
- High contrast text
- Screen reader labels for all buttons
- Verbal consent is inherently accessible

---

## Testing Checklist

- [ ] Self recording: Quick affirm → Recording starts
- [ ] Recording others: Full flow (consent → email → verbal → record)
- [ ] Cancel at consent screen returns to Contemplation
- [ ] Cancel at email screen returns to consent (not Contemplation)
- [ ] Skip email works correctly
- [ ] Verbal consent prompt appears during recording
- [ ] "I've Said It" clears prompt and shows normal recording UI
- [ ] Consent metadata saved with story
- [ ] Tap consent timestamp is accurate
- [ ] Email validation (if entered, must be valid format)
- [ ] Works on mobile (primary use case)

---

## Files to Create/Modify

| File                                             | Purpose                              |
| ------------------------------------------------ | ------------------------------------ |
| `src/components/consent/WhoseStoryModal.tsx`     | "My Story" / "Someone Else's" choice |
| `src/components/consent/SelfConsentScreen.tsx`   | Quick affirm for self recording      |
| `src/components/consent/OtherConsentScreen.tsx`  | Full consent flow                    |
| `src/components/consent/EmailCaptureScreen.tsx`  | Optional email entry                 |
| `src/components/consent/VerbalConsentPrompt.tsx` | In-recording prompt                  |
| `src/hooks/useConsentFlow.ts`                    | State machine for consent flow       |

---

## Component Hierarchy

```
<RecordingFlow>
  ├── <WhoseStoryModal />
  │     ├── "My Story" → <SelfConsentScreen />
  │     └── "Someone Else's" → <OtherConsentFlow />
  │
  ├── <SelfConsentScreen />
  │     └── "Start Recording" → <RecordingUI />
  │
  └── <OtherConsentFlow>
        ├── <OtherConsentScreen />
        │     └── "I Consent" → <EmailCaptureScreen />
        ├── <EmailCaptureScreen />
        │     └── "Continue" / "Skip" → <RecordingUI />
        └── <VerbalConsentPrompt /> (overlay during recording)
</RecordingFlow>
```

---

## References

- `docs/USER_FLOWS.md` §4 (Recording Flows)
- `docs/USER_FLOWS.md` §8 (Permissions vs. Consent)
- `docs/APP_SPECIFICATION.md` §3 (Consent Flow)
- `docs/APP_SPECIFICATION.md` §6 (Consent is sacred)
