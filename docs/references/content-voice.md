# Content Voice — Claude Skill

**Purpose:** Guide copywriting for all app content, UI text, and error messages  
**References:** `docs/APP_SPECIFICATION.md` §1, §6, `docs/USER_FLOWS.md`

---

## Overview

The Story Portal's voice is warm, inviting, and grounded. It speaks like a wise friend who believes everyone has stories worth telling—not like an app trying to sound clever.

### Mission

> "Making empathy contagious."

Every word should serve this mission.

---

## Voice Principles

| Principle                      | What It Means                   | Example                                                |
| ------------------------------ | ------------------------------- | ------------------------------------------------------ |
| **Warm, not corporate**        | Speak like a human, not a brand | "Ready to tell your story?" not "Initiate recording"   |
| **Inviting, not demanding**    | Offer, don't command            | "Spin the wheel" not "You must spin"                   |
| **Grounded, not performative** | Calm confidence, no hype        | "Your story matters" not "Share your AMAZING story!"   |
| **Inclusive, not exclusive**   | Everyone belongs                | "Everyone has stories" not "Share your best story"     |
| **Brief, not verbose**         | Say it simply                   | "Take a breath" not "Take a moment to center yourself" |

---

## Word Choices

### Use

| Word    | Why                     |
| ------- | ----------------------- |
| Story   | Core concept, universal |
| Share   | Generous, relational    |
| Witness | Elevates listening      |
| Moment  | Specific, concrete      |
| Memory  | Personal, accessible    |
| Breath  | Calming, grounding      |

### Avoid

| Word            | Why                      | Instead              |
| --------------- | ------------------------ | -------------------- |
| Amazing/awesome | Performative pressure    | (just omit)          |
| Best            | Implies ranking          | (just omit)          |
| Perfect         | Unrealistic standard     | (just omit)          |
| Content         | Corporate/platform speak | Story                |
| Submit          | Transactional            | Share, save          |
| Users           | Dehumanizing             | People, storytellers |
| Engage          | Marketing speak          | Listen, connect      |

### Never Use

| Word/Phrase      | Why                          |
| ---------------- | ---------------------------- |
| "Your audience"  | This isn't performance       |
| "Go viral"       | Antithetical to mission      |
| "Followers"      | Not a social network         |
| "Likes"          | No metrics on stories        |
| "Amazing story!" | Puts pressure on storyteller |

---

## Tone by Context

### Contemplation State

**Tone:** Calm, spacious, permission-giving

```
✓ "Take a breath. There's no rush."
✓ "What moment comes to mind?"
✓ "Trust the first memory that surfaces."

✗ "Think of your BEST story!"
✗ "Make it count!"
✗ "Ready to impress?"
```

### Recording

**Tone:** Supportive, unobtrusive

```
✓ "Recording..."
✓ "30 seconds remaining"
✓ "Your story is saved."

✗ "You're doing great!"
✗ "Keep going!"
✗ "Almost there!"
```

### Errors

**Tone:** Honest, helpful, not alarming

```
✓ "Couldn't save story. Your story is still here—try saving again."
✓ "Microphone access needed. To record, please allow microphone access."

✗ "ERROR: Storage write failed!"
✗ "PERMISSION DENIED"
✗ "Something went wrong. Please try again later."
```

### Success States

**Tone:** Quiet celebration, not fanfare

```
✓ "Story saved."
✓ "Ready for the next storyteller."

✗ "Awesome! Great job!"
✗ "🎉 Story saved! You're amazing!"
✗ "Congratulations on sharing!"
```

---

## Content Screens

### How to Play

**Purpose:** Orient new users without lecturing  
**Tone:** Friendly guide, not instruction manual

**Structure:**

1. The ritual (spin, tell, listen)
2. The pass option (it's okay)
3. Recording (optional capture)
4. The magic (what happens when people share)

**Draft:**

```
# How to Play

## Spin the Wheel
Tap or swipe to spin. The wheel chooses your prompt.

## Tell Your Story
There's no wrong way. Short or long. Funny or serious. Whatever comes to mind.

## You Can Pass (Once)
Not feeling that prompt? Pass on your first spin and try again. The second prompt is yours to embrace.

## Recording is Optional
Most stories are told in the moment and never recorded. If you want to capture one, tap Record.

## Listen
When someone else tells their story, your job is simple: witness it. That's where the magic happens.
```

### Our Story

**Purpose:** Share the origin and mission  
**Tone:** Authentic, passionate but not preachy

**Structure:**

1. Origin moment (where this came from)
2. The insight (why spontaneous stories connect)
3. The mission (making empathy contagious)
4. The invitation (join us)

**Draft skeleton:**

```
# Our Story

[Origin—where The Story Portal came from. A specific moment or realization.]

We discovered something: when you remove the ability to choose your topic, something shifts. The inner editor goes quiet. What comes out is real.

The wheel isn't random—it's an invitation. An invitation to cross from isolation into connection.

Our mission is simple: make empathy contagious.

Every story told is a doorway. Every story witnessed is empathy in action.

Welcome to The Story Portal.
```

### Our Work

**Purpose:** Show physical installations, build credibility  
**Tone:** Documentary, let images speak

```
# Our Work

The Story Portal has traveled to [locations/events].

[Photo gallery with captions]

[Optional: Testimonials or quotes from participants]

Interested in bringing The Story Portal to your event?
[Link to Booking]
```

### Privacy Policy

**Purpose:** Legal requirement, but human-readable  
**Tone:** Clear, honest, no legalese

**Key points to cover:**

- What we collect (audio, optional email, prompts used)
- Where it's stored (locally on device for MVP)
- Who can access it (only you, unless you share)
- How to delete (delete from My Stories)
- Phase 2 changes (will update when cloud features added)

**Draft intro:**

```
# Privacy Policy

Last updated: [Date]

The Story Portal is built on trust. Here's exactly what happens with your data.

## What We Collect

**Stories you record**
Audio recordings are saved on your device. We don't upload them anywhere.

**Prompts you see**
We track which prompts appear (anonymously) to improve the experience.

**Email (optional)**
If you give us your email when someone records your story, we save it to send you a copy later.

## What We Don't Collect

- Your name (unless you tell us)
- Your location
- Your contacts
- Anything about your device

[Continue with standard privacy policy sections...]
```

### Booking

**Purpose:** Generate leads for physical installations  
**Tone:** Inviting, professional

```
# Bring The Story Portal to Your Event

The Story Portal creates genuine connection. We've facilitated storytelling at [types of events].

## What We Offer

- Physical Story Portal installation
- Trained facilitators
- Custom prompt packs for your event

## Get in Touch

[Contact form or email]

Tell us about your event and we'll be in touch within [timeframe].
```

---

## Facilitation Hints

These cycle during Contemplation for declaration-risk prompts.

### Base Cues (All Prompts)

```
"Take a breath. There's no rush."
"What moment comes to mind?"
"Trust the first memory that surfaces."
```

### Prompt-Specific Hints

From `prompts.json`, examples:

| Prompt                          | Hint                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------- |
| "What I love most about myself" | "When did you discover this about yourself? Tell us that story."             |
| "Dreams"                        | "Tell us about a specific dream—sleeping or waking—that stayed with you."    |
| "What are you so afraid of?"    | "Tell us about a time you faced this fear—or a time it got the best of you." |

### Hint Writing Guidelines

| Do                           | Don't                         |
| ---------------------------- | ----------------------------- |
| Guide toward narrative       | Ask for lists or declarations |
| Use "Tell us about..."       | Use "What is your..."         |
| Reference specific moments   | Stay abstract                 |
| Keep it short (one sentence) | Write a paragraph             |

---

## Error Messages

Per USER_FLOWS.md §9, all error states need copy.

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

### Generic Error (Fallback)

```
Something's Not Working

We're not sure what happened. Try again, and if it keeps happening, restart the app.

[Try Again]
```

---

## Button Labels

| Context                    | Label             | Not                    |
| -------------------------- | ----------------- | ---------------------- |
| Start recording            | "Start Recording" | "Record", "Begin"      |
| Stop recording             | "Stop"            | "Finish", "End"        |
| Save story                 | "Keep"            | "Save", "Submit"       |
| Discard/retry              | "Re-record"       | "Delete", "Discard"    |
| Navigate back              | "Back"            | "←", "Return"          |
| Confirm destructive action | "Delete"          | "Remove", "Erase"      |
| Cancel                     | "Cancel"          | "Nevermind", "Go Back" |
| Skip optional step         | "Skip"            | "No Thanks", "Later"   |

---

## Accessibility Text

All interactive elements need accessible labels.

| Element           | aria-label             |
| ----------------- | ---------------------- |
| Spin button       | "Spin the wheel"       |
| Pass button       | "Pass on this prompt"  |
| Record button     | "Start recording"      |
| Menu button       | "Open menu"            |
| My Stories button | "View my stories"      |
| Play story        | "Play story recording" |
| Delete story      | "Delete this story"    |

---

## Writing Checklist

Before finalizing any copy:

- [ ] Does it serve the mission?
- [ ] Would The Reluctant Storyteller feel safe reading this?
- [ ] Is it warm, not corporate?
- [ ] Is it brief? (Can you cut words?)
- [ ] Does it avoid forbidden words?
- [ ] Is the tone right for the context?
- [ ] Does it work on a small screen?

---

## References

- `docs/APP_SPECIFICATION.md` §1 (Vision & Mission)
- `docs/APP_SPECIFICATION.md` §2 (User Personas)
- `docs/APP_SPECIFICATION.md` §6 (UX Principles)
- `docs/USER_FLOWS.md` §9 (Error States)
- `docs/prompts.json` (facilitation hints)
