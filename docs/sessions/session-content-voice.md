# Session: Content & Copy Writing

## Interface: Claude Browser (claude.ai)
**Why:** Long-form writing benefits from extended thinking, artifact iteration, and prose focus without code distractions.

---

## Session Goal
Finalize all user-facing copy for The Story Portal including content screens, error messages, facilitation hints, and button labels.

## Pre-Session Setup (Human)
1. Have these reference materials ready:
   - `docs/APP_SPECIFICATION.md` §1 (Vision), §2 (Personas)
   - `docs/USER_FLOWS.md` §9 (Error States)
   - `.claude/skills/story-portal/references/content-voice.md`
2. Know your brand story (origin of The Story Portal)
3. Have photos from previous installations (for Our Work)
4. Decide on contact method for Booking page

---

## Prompt to Start Session

```
I need to finalize all user-facing copy for The Story Portal.

Reference docs I'll share:
- Mission: "Making empathy contagious"
- Target personas: The Connector, The Reluctant Storyteller, The Facilitator
- Voice principles: Warm, inviting, grounded, inclusive, brief

Content needed:
1. How to Play — Orient new users without lecturing
2. Our Story — Origin story and mission (need input from me)
3. Our Work — Gallery captions for physical installations
4. Privacy Policy — Human-readable, not legalese
5. Booking — Lead generation for physical installations
6. Error Messages — All states from USER_FLOWS.md §9
7. Facilitation Hints — Base cues for contemplation state
8. Button Labels — Consistent across app

Voice guidelines:
- Use: story, share, witness, moment, memory, breath
- Avoid: amazing, best, perfect, content, submit, users, engage
- Never: "your audience", "go viral", "followers", "likes"

Let's start with How to Play, then work through each piece. I'll provide specifics about our origin story when we get to Our Story.
```

---

## Key Questions Claude Should Ask

**Brand Story:**
- Where did The Story Portal originate? (Specific moment or event?)
- Who created it and why?
- What's the most powerful story you've witnessed through it?

**Our Work:**
- Which events/installations should we highlight?
- Do you have testimonials or quotes from participants?
- Photos available for each?

**Privacy Policy:**
- Have you consulted a lawyer, or is this a "best effort" draft?
- What jurisdiction matters (US? International?)
- Plans for data beyond MVP (cloud sync, etc.)?

**Booking:**
- What types of events do you want to attract?
- What's your response time commitment?
- Contact form or direct email?

**Tone Calibration:**
- Any existing copy I should match?
- Examples of voices you admire?
- Hard no's (phrases that feel wrong)?

---

## Content Sections to Complete

```
Priority 1: MVP Required
├── How to Play (orient users)
├── Error Messages (all from USER_FLOWS.md §9)
├── Button Labels (consistent vocabulary)
├── Facilitation Hints (contemplation cues)
│
Priority 2: Complete Experience
├── Our Story (brand narrative)
├── Privacy Policy (consent support)
│
Priority 3: Growth
├── Our Work (installations gallery)
├── Booking (lead generation)
```

---

## Expected Outcomes

- [ ] How to Play — Complete, ~150 words
- [ ] Our Story — Complete, ~200 words (pending your input)
- [ ] Our Work — Framework + caption guidance
- [ ] Privacy Policy — Human-readable, covers MVP scope
- [ ] Booking — Contact form/page copy
- [ ] Error Messages — All 5 states from USER_FLOWS.md
- [ ] Facilitation Hints — Base cues + guidance for prompts
- [ ] Button Labels — Inventory with consistent terms
- [ ] All copy reviewed against voice guidelines

---

## Content Templates

**How to Play Structure:**
```
1. The Ritual (spin → tell → listen)
2. The Pass (it's okay to skip once)
3. The Recording (optional capture)
4. The Magic (what happens when people share)
```

**Error Message Structure:**
```
[Headline — What happened]

[Body — Brief explanation, no blame]

[Actions — What they can do]
```

**Privacy Policy Structure:**
```
What we collect
What we don't collect
Where data is stored
How to delete your data
Changes to this policy
```

---

## Testing Copy

Read each piece aloud and check:
```
□ Would The Reluctant Storyteller feel safe?
□ Is it warm, not corporate?
□ Is it brief? (Can you cut words?)
□ Does it avoid forbidden words?
□ Does it work on a small screen?
□ Does it serve the mission?
```

---

## Tips for This Session

1. **Read aloud** — Copy should sound natural when spoken
2. **Short paragraphs** — Mobile screens are small
3. **No walls of text** — Break it up, use white space
4. **Active voice** — "Spin the wheel" not "The wheel can be spun"
5. **Test with personas** — Would The Reluctant Storyteller understand this?

---

## Files to Reference

| File | Why |
|------|-----|
| `docs/APP_SPECIFICATION.md` §1-2 | Vision and personas |
| `docs/USER_FLOWS.md` §9 | Error states requiring copy |
| `references/content-voice.md` | Voice guidelines, drafts |
| `docs/prompts.json` | Facilitation hints for reference |

---

## Deliverable Format

Each content piece should be provided in this format:

```markdown
## [Screen Name]

### Purpose
[One sentence: what this screen accomplishes]

### Copy
[The actual content]

### Notes
[Implementation notes, variants, or edge cases]
```

---

## Success Criteria
Session is complete when:
1. All content screens have final copy
2. All error messages written
3. Facilitation hints finalized
4. Button labels inventoried
5. Copy reviewed against voice guidelines
6. Ready to implement in app

## Next Session
→ Implementation (add copy to React components)
