# Session: Consent Flow Design

**Platform:** Claude.ai (Browser)  
**Type:** UX Design  
**Priority:** Phase 1 — Critical Path  
**Estimated Sessions:** 2  
**Prerequisites:** Modal Content Window Pattern (Session 1)

---

## Session Goal

Design the complete consent flow for recording stories — both self-recording and recording others. This is critical for trust and legal compliance.

---

## Context

### Why Consent Matters

From APP_SPECIFICATION.md §6:
> "Consent is sacred — Prominent, unambiguous consent flow"

Recording someone's story is an act of trust. The consent flow must be:
- Clear and unambiguous (no legal jargon)
- Quick enough to preserve spontaneity
- Captured in multiple ways (tap + verbal in audio)

### Two Consent Paths

| Path | When | Complexity |
|------|------|------------|
| **Self Recording** | "My Story" selected | Quick affirm → Record |
| **Recording Others** | "Someone Else's Story" | Tap consent → Email → Verbal consent → Record |

### Screens to Design

1. **Whose Story Modal** — "My Story" / "Someone Else's Story" choice
2. **Self Consent Screen** — Quick affirm before recording self
3. **Other Consent Script** — Full consent language for storyteller to read/agree
4. **Email Capture** — Optional email for follow-up (Phase 2 sharing)
5. **Verbal Consent Prompt** — Overlay during recording prompting verbal consent

---

## Reference Materials

Upload to Claude.ai:
1. `docs/USER_FLOWS.md` — §4 Recording Flows, §8 Permissions vs Consent
2. `docs/consent-flows.md` — Existing skill with wireframes and copy
3. `docs/content-voice.md` — Tone and voice guidelines
4. `docs/APP_SPECIFICATION.md` — §3 Consent Flow requirements
5. Modal Content Window pattern designs (from Session 1)

Reference skill:
- `.claude/skills/story-portal/references/consent-flows.md`

---

## Session Flow

### Part 1: Flow Architecture & Key Screens (Session 1)

**Questions to explore:**

1. **Whose Story Modal**
   - Two clear options: "My Story" / "Someone Else's Story"
   - Icons or just text?
   - Should this be a modal or inline choice?

2. **Self Consent Screen**
   - How minimal can this be while still being consent?
   - Copy: "Ready to tell your story?" + "Start Recording" button
   - Skip straight to recording or brief pause?

3. **Physical Handoff Moment**
   - When recording others, the Connector hands phone to Storyteller
   - How do we make this clear in the UI?
   - "Hand the phone to the storyteller" instruction?

4. **Other Consent Script Screen**
   - Full consent language (see consent-flows.md for draft)
   - Storyteller reads and taps "I Consent"
   - Should storyteller's name be captured here?

**Deliverables:**
- Whose Story Modal design
- Self Consent screen design
- Other Consent screen design
- Physical handoff guidance

### Part 2: Email Capture & Verbal Consent (Session 2)

**Questions to explore:**

1. **Email Capture Screen**
   - Optional email for future story sharing (Phase 2)
   - Must feel genuinely optional — prominent "Skip" option
   - Copy that explains why we're asking
   - Text input styling (steampunk)

2. **Verbal Consent Prompt**
   - Overlay that appears during recording
   - Storyteller states: "I consent to having my story recorded by The Story Portal"
   - "I've Said It" button to dismiss
   - Should recording show countdown or wait for button tap?

3. **Edge Cases**
   - What if storyteller cancels mid-consent?
   - What if storyteller forgets verbal consent?
   - What if storyteller wants to re-read consent?

4. **Consent Data Storage**
   - What metadata is captured?
   - Timestamp of tap consent
   - Flag for verbal consent in audio
   - Optional email, name

**Deliverables:**
- Email Capture screen design
- Verbal Consent Prompt overlay design
- Cancel/back flow for each screen
- Consent metadata specification

---

## Prompt to Start Session

Copy and paste this into Claude.ai:

```
I'm designing the consent flow for The Story Portal, a storytelling app where people record audio stories. We need consent for two scenarios:

1. **Self Recording** — User records their own story (quick affirm)
2. **Recording Others** — User (Connector) records someone else's story (full consent)

**Why it matters:**
- "Consent is sacred" — core UX principle
- Must capture both tap consent AND verbal consent in the audio
- The Connector persona facilitates recording others' stories in group settings

**Screens I need to design:**
1. "Whose Story?" choice modal
2. Self consent (minimal)
3. Other consent script (storyteller reads and agrees)
4. Email capture (optional, for future sharing)
5. Verbal consent prompt (overlay during recording)

**Constraints:**
- Steampunk aesthetic (will use Modal Content Window pattern)
- Must be clear enough for first-time users in group settings
- Must not feel like a legal interrogation
- Physical phone handoff happens — Connector gives phone to Storyteller

**Key persona:** The Connector wants to capture others' stories. They need to guide storytellers (who may be unfamiliar with the app) through the consent process smoothly.

Let's start by mapping the flow and designing the "Whose Story?" choice screen.
```

---

## Success Criteria

Session is complete when we have:
- [ ] Whose Story Modal design
- [ ] Self Consent screen design
- [ ] Other Consent Script screen design
- [ ] Email Capture screen design
- [ ] Verbal Consent Prompt overlay design
- [ ] Physical handoff moment guidance
- [ ] Cancel/back flows for each screen
- [ ] Consent copy finalized
- [ ] Consent metadata schema documented
- [ ] All designs documented in skill file

---

## Handoff to Implementation

After design is complete:
1. Update skill file: `.claude/skills/story-portal/references/consent-flows.md`
2. Create implementation session for Claude CLI: `session-consent-flows-implementation.md`
3. Implementation builds:
   - `WhoseStoryModal` component
   - `SelfConsentScreen` component
   - `OtherConsentFlow` component (multi-step)
   - `VerbalConsentPrompt` overlay
   - `useConsentFlow` hook (state machine)

---

## Consent Language (Draft from consent-flows.md)

### Tap Consent (Other's Story):
> By tapping "I Consent" and stating your consent aloud, you agree to have your story recorded.
> 
> Your story will be saved on this device. The person recording may share it with you later.

### Verbal Consent Script:
> "I consent to having my story recorded by The Story Portal."

### Email Capture Copy:
> Want a copy of your story?
> 
> Enter your email and we'll send you a link when sharing is available.

---

## Privacy Policy Alignment

The consent flow promises specific things. Ensure Privacy Policy matches:

| Promise in Consent | Privacy Policy Must State |
|--------------------|---------------------------|
| "Saved on this device" | Stories stored locally, not uploaded (MVP) |
| "May share with you later" | Phase 2 sharing feature planned |
| Email collected | Used only for story sharing, not marketing |
