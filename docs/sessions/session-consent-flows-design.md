# Session: Consent Flows — UX Design

## Interface: Claude Browser (claude.ai)
**Why:** UX design benefits from extended thinking, artifact iteration for wireframes/flows, and strategic reasoning about user psychology.

---

## Session Goal
Design the complete consent flow UX, including screen layouts, copy, state transitions, and the "handoff moment" where the Connector passes the phone to the Storyteller.

## Pre-Session Setup (Human)
1. Have these reference materials ready:
   - `docs/USER_FLOWS.md` §4 (Recording Flows)
   - `docs/USER_FLOWS.md` §8 (Permissions vs. Consent)
   - `.claude/skills/story-portal/references/consent-flows.md`
2. Consider: Have you seen consent flows you liked in other apps?
3. Think about: What does "consent as ritual" feel like?

---

## Prompt to Start Session

```
I need to design the UX for consent flows in The Story Portal.

Context:
- Mission: "Making empathy contagious"
- Primary persona: The Connector (records others' stories)
- Key moment: Connector hands phone to Storyteller for consent
- Consent must feel like ritual, not legal checkbox

Reference docs I'll share:
- USER_FLOWS.md §4 (Recording Flows) — State machine
- consent-flows.md skill — Draft copy and structure

Two consent paths to design:
1. Self Recording — Simple, minimal friction
2. Recording Others — Full consent (tap + verbal + optional email)

Design needs:
- Screen layouts (wireframe level)
- Copy for each screen
- Transition animations/feel
- The "handoff" UX (Connector → Storyteller)
- Edge cases (cancel, back, skip)

Key question: How do we make consent feel sacred without feeling heavy?

Let's start by mapping the emotional journey of the Storyteller through the consent flow.
```

---

## Key Questions Claude Should Ask

**The Handoff Moment:**
- Does the Connector hand the phone BEFORE or AFTER tapping "Record"?
- Should there be a visual cue that says "hand the phone over now"?
- What if the Storyteller is nervous about holding someone else's phone?

**Consent as Ritual:**
- Should consent feel like a threshold/portal (matching brand)?
- Is there a physical gesture that could accompany the tap?
- How do we make verbal consent feel natural, not scripted?

**Trust Dynamics:**
- The Storyteller is trusting the Connector—how do we honor that?
- Should consent screen show who is recording (Connector's name)?
- What assurance does Storyteller need about where story goes?

**Emotional States:**
- Storyteller may be nervous, excited, vulnerable, tipsy
- How do we design for someone who's never used the app?
- What if they feel pressured? How do we give easy exit?

**Practical Concerns:**
- Festival environment: loud, dark, distracting
- Screen brightness/readability
- Large tap targets for imprecise tapping

---

## Design Exploration Framework

### Emotional Journey Map

```
Connector taps Record
    ↓
"Whose story?" — Connector still holding phone
    ↓
"Someone Else's" selected
    ↓
[HANDOFF MOMENT] — Visual cue to pass phone
    ↓
Storyteller receives phone — sees consent screen
    ↓
Storyteller reads/hears consent — feels informed
    ↓
Storyteller taps "I Consent" — feels agency
    ↓
Email option — feels optional, not forced
    ↓
Recording starts — verbal consent as opening ritual
    ↓
Story flows naturally
```

### Design Principles for This Flow

| Principle | Application |
|-----------|-------------|
| Consent is sacred | Not a checkbox, a threshold |
| Everyone has stories | Storyteller is capable, not needing help |
| Warm, not corporate | Language feels human |
| Ritual over efficiency | Each step has meaning |
| Mobile-first | Works in festival chaos |

---

## Screens to Design

### 1. Whose Story Modal
**When:** Connector taps Record in Contemplation
**Who's holding phone:** Connector

Design considerations:
- Two clear choices, visually distinct
- "My Story" should feel slightly more prominent (common path)
- "Someone Else's Story" should feel inviting, not hidden

### 2. Handoff Screen (New?)
**When:** After "Someone Else's" selected
**Who's holding phone:** Connector, about to hand over

Design considerations:
- Should this be a distinct screen, or part of consent screen?
- Visual cue: "Hand the phone to the storyteller"
- Maybe shows the prompt so Storyteller knows what they're agreeing to tell?

### 3. Consent Screen
**When:** Storyteller receives phone
**Who's holding phone:** Storyteller

Design considerations:
- Must be readable by someone unfamiliar with app
- Consent language prominent but not scary
- Clear "I Consent" button
- Easy exit (X or Cancel)
- Should prompt text be visible?

### 4. Email Capture Screen
**When:** After tap consent
**Who's holding phone:** Storyteller

Design considerations:
- Clearly optional—skip must be obvious
- Explain WHY email helps them
- Keyboard should auto-appear
- Validate or accept any format?

### 5. Verbal Consent Prompt
**When:** First 10 seconds of recording
**Who's holding phone:** Storyteller (or Connector holding for them)

Design considerations:
- Overlay on recording UI
- Script clearly visible
- "I've Said It" button to dismiss
- What if they don't say it? (Honor system)

---

## Expected Outcomes

- [ ] Emotional journey mapped and validated
- [ ] Each screen wireframed (low-fidelity)
- [ ] Copy finalized for each screen
- [ ] Handoff moment designed
- [ ] Transition feel described
- [ ] Edge cases handled (cancel, back, skip)
- [ ] Mobile/festival considerations addressed
- [ ] Ready for implementation session

---

## Wireframe Template

For each screen, define:

```
┌─────────────────────────────────────┐
│ [Screen Name]                       │
├─────────────────────────────────────┤
│                                     │
│  [Visual layout sketch]             │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ Copy:                               │
│ [Exact text for this screen]        │
├─────────────────────────────────────┤
│ Actions:                            │
│ - Primary: [Button label → Next]    │
│ - Secondary: [Link → Where]         │
├─────────────────────────────────────┤
│ States:                             │
│ - Default, Focus, Error, Success    │
├─────────────────────────────────────┤
│ Transitions:                        │
│ - In: [How it appears]              │
│ - Out: [How it exits]               │
└─────────────────────────────────────┘
```

---

## Tips for This Session

1. **Think ritual** — What makes a moment feel significant?
2. **Design for nervousness** — Storyteller may be anxious
3. **Honor the trust** — Connector vouched for this experience
4. **Keep it readable** — Someone new to the app is reading this
5. **Test the handoff** — Physically imagine passing a phone

---

## Files to Reference

| File | Why |
|------|-----|
| `docs/USER_FLOWS.md` §4 | State machine, flow structure |
| `docs/USER_FLOWS.md` §8 | Consent vs permissions distinction |
| `references/consent-flows.md` | Draft copy, technical structure |
| `references/content-voice.md` | Voice/tone guidelines |
| `references/design-system.md` | Visual language |

---

## Success Criteria
Session is complete when:
1. All 5 screens have wireframes
2. Copy is finalized for each
3. Handoff moment is clearly designed
4. Transitions/animations described
5. Edge cases documented
6. Design feels sacred, not bureaucratic
7. Ready for implementation handoff

## Next Session
→ Consent Flows Implementation (Claude CLI)
