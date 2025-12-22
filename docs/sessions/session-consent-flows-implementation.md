# Session: Consent Flows — Implementation

## Interface: Claude CLI (Claude Code)
**Why:** React component creation, state machine implementation, needs testing in browser.

**Prerequisite:** Complete `session-consent-flows-design.md` first (Browser session for UX design)

---

## Session Goal
Implement the consent flow designs as React components with proper state management, matching the wireframes and copy from the design session.

## Pre-Session Setup (Human)
1. **Design session completed** — Have finalized wireframes and copy
2. Ensure dev server is running (`pnpm dev`)
3. Audio recording should be working (or mockable)
4. Review these reference docs:
   - `docs/USER_FLOWS.md` §4 (Recording Flows)
   - `.claude/skills/story-portal/references/consent-flows.md`
   - **Design session outputs** (wireframes, copy, transitions)
5. Have design artifacts accessible for reference

---

## Prompt to Start Session

```
I need to implement the consent flows for The Story Portal.

Design completed:
- [Reference design session outputs - wireframes, copy, transitions]

Reference docs:
- docs/USER_FLOWS.md §4 (Recording Flows)
- .claude/skills/story-portal/references/consent-flows.md (technical reference)

Current state:
- RecordView.tsx exists but no consent flow
- Recording hook exists (or is in progress)
- No consent UI components
- Design session completed with wireframes and finalized copy

Please implement:
1. WhoseStoryModal ("My Story" vs "Someone Else's Story")
2. HandoffScreen (if designed) — "Hand phone to storyteller"
3. ConsentScreen (consent script + tap)
4. EmailCaptureScreen (optional email)
5. VerbalConsentPrompt (shown during recording start)
6. useConsentFlow hook (state machine)

Match the designs exactly. Start by reviewing the wireframes, then propose your implementation approach.
```

---

## Key Questions Claude Should Ask

**Implementation Details:**
- Are the wireframes in Figma, images, or markdown descriptions?
- Any specific animation libraries preferred, or CSS transitions?
- Should components be in a `consent/` subfolder or flat?

**State Management:**
- Should consent state live in the hook, or use a state machine library?
- How does consent flow integrate with existing RecordView?
- Where should consent metadata be assembled before passing to storage?

**Styling:**
- Are there existing modal/overlay patterns to follow?
- Should we use CSS modules, styled-components, or inline styles?
- Any existing animation patterns to reuse?

**Integration:**
- How does the consent flow receive the selected prompt?
- What triggers the flow? (RecordButton tap, separate button?)
- How do we signal "ready to record" back to parent?

**Testing:**
- Should we add unit tests for the state machine?
- Any E2E tests for the consent flow?

---

## Implementation Approach (Expected)

```
Phase 1: State Machine
├── src/hooks/useConsentFlow.ts
│   ├── States: idle, whoseStory, selfConsent, otherConsent, 
│   │           emailCapture, recording, verbalPrompt
│   ├── Transitions between states
│   └── Consent metadata accumulation
│
Phase 2: Modals/Screens
├── src/components/consent/WhoseStoryModal.tsx
│   └── "My Story" | "Someone Else's Story"
├── src/components/consent/SelfConsentScreen.tsx
│   └── "Ready to tell your story?" + Start button
├── src/components/consent/OtherConsentScreen.tsx
│   └── Consent script + "I Consent" button
├── src/components/consent/EmailCaptureScreen.tsx
│   └── Email input (optional) + Continue/Skip
├── src/components/consent/VerbalConsentPrompt.tsx
│   └── Overlay during recording with script
│
Phase 3: Integration
├── Connect to RecordingUI
├── Pass consent metadata to storage
├── Handle cancel at any point
│
Phase 4: Styling
├── Steampunk aesthetic for modals
├── Large tap targets (mobile-first)
├── Clear, readable text
```

---

## Expected Outcomes

- [ ] `useConsentFlow` hook managing state transitions
- [ ] `WhoseStoryModal` with two clear choices
- [ ] `SelfConsentScreen` with minimal friction
- [ ] `OtherConsentScreen` with full consent script
- [ ] `EmailCaptureScreen` with optional email input
- [ ] `VerbalConsentPrompt` overlay during recording
- [ ] Cancel returns to Contemplation at any point
- [ ] Consent metadata correctly structured
- [ ] Works on mobile (primary use case)
- [ ] Matches steampunk aesthetic

---

## Testing Checklist

```
□ Self path: Tap "My Story" → Quick affirm → Recording starts
□ Other path: Full flow completes correctly
□ Tap consent: Timestamp recorded
□ Email: Valid format required if entered
□ Email: Skip works correctly
□ Verbal prompt: Appears at recording start
□ Verbal prompt: "I've Said It" clears overlay
□ Cancel at consent: Returns to Contemplation
□ Cancel at email: Returns to consent (not Contemplation)
□ Consent metadata: Saved with story correctly
□ Mobile: Large tap targets work
□ Mobile: Text readable on small screens
□ Steampunk: Modals match aesthetic
```

---

## Tips for This Session

1. **State machine first** — Get the flow logic right before styling
2. **Mobile-first** — The Connector hands phone to storyteller
3. **Large text** — Storyteller may be unfamiliar with app
4. **Clear buttons** — "I Consent" should be unmistakable
5. **Test the handoff** — Simulate handing phone to another person

---

## Files to Reference

| File | Why |
|------|-----|
| `docs/USER_FLOWS.md` §4 | Flow diagrams |
| `docs/USER_FLOWS.md` §8 | Consent vs. permissions |
| `references/consent-flows.md` | UI mockups, copy |
| `references/design-system.md` | Steampunk styling |
| `src/storage/types.ts` | ConsentMetadata interface |

---

## Consent Copy Reference

**Whose Story Modal:**
```
My Story
Someone Else's Story
```

**Self Consent:**
```
Ready to tell your story?
Your recording will be saved on this device.
[Start Recording]
```

**Other Consent:**
```
Recording Consent

By tapping "I Consent" and stating your consent aloud, 
you agree to have your story recorded.

Your story will be saved on this device. 
The person recording may share it with you later.

[I Consent]
```

**Verbal Consent Script:**
```
"I consent to having my story recorded by The Story Portal."
```

---

## State Machine Reference

```typescript
type ConsentState = 
  | 'idle'
  | 'whoseStory'
  | 'selfConsent'
  | 'otherConsent'
  | 'emailCapture'
  | 'verbalPrompt'
  | 'recording';

type ConsentAction =
  | { type: 'START_CONSENT' }
  | { type: 'SELECT_SELF' }
  | { type: 'SELECT_OTHER' }
  | { type: 'CONFIRM_SELF' }
  | { type: 'TAP_CONSENT'; timestamp: string }
  | { type: 'SUBMIT_EMAIL'; email?: string }
  | { type: 'SKIP_EMAIL' }
  | { type: 'VERBAL_COMPLETE' }
  | { type: 'CANCEL' };
```

---

## Success Criteria
Session is complete when:
1. All consent screens match wireframes from design session
2. Copy matches finalized text exactly
3. State machine handles all transitions correctly
4. Consent metadata correctly saved with story
5. Cancel behavior works at all steps
6. Animations match design specs
7. Works on mobile (primary use case)

## Previous Session
← Consent Flows Design (Claude Browser)

## Next Session
→ Local Storage or Recording integration (depending on status)
