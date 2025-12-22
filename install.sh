#!/bin/bash
# Story Portal Product Documentation Setup
# Run from repository root: bash install.sh
# 
# This script:
# 1. Creates all product documentation in docs/
# 2. Adds product context section to CLAUDE.md
# 3. Sets up PM skill structure
# 4. Creates prompts.json for app integration

set -e

echo "🚀 Story Portal Product Documentation Setup"
echo "==========================================="
echo ""

# Verify we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "CLAUDE.md" ]; then
    echo "❌ Error: Run this script from the story-portal-app repository root"
    echo "   Expected to find package.json and CLAUDE.md"
    exit 1
fi

echo "✓ Repository root detected"
echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p docs
mkdir -p .claude/skills/story-portal-pm/product
mkdir -p .claude/skills/story-portal-pm/operations
echo "✓ Directories created"
echo ""

# ============================================================================
# DOCS/APP_SPECIFICATION.md
# ============================================================================
echo "📄 Creating docs/APP_SPECIFICATION.md..."
cat > docs/APP_SPECIFICATION.md << 'SPEC_EOF'
# The Story Portal — App Specification

**Version**: 1.0  
**Last Updated**: December 21, 2024  
**Status**: Living Document

---

## Table of Contents

1. [Vision & Mission](#1-vision--mission)
2. [User Personas](#2-user-personas)
3. [Feature Requirements](#3-feature-requirements)
4. [Technical Requirements](#4-technical-requirements)
5. [Content Requirements](#5-content-requirements)
6. [UX Principles](#6-ux-principles)
7. [Success Metrics](#7-success-metrics)
8. [Constraints & Assumptions](#8-constraints--assumptions)

---

## 1. Vision & Mission

### Mission

**Making empathy contagious.**

### Vision

The Story Portal connects individuals to the vast world of shared human experience. Through the simple ritual of spinning a wheel and responding to an unexpected prompt, storytellers bypass their inner editor and express their truth—raw, unpolished, and profoundly connecting.

### The Portal Metaphor

The Story Portal opens doorways between people. When the wheel spins, it selects not just a topic but a threshold—an invitation to cross from isolation into connection. The storyteller steps through first, offering a piece of their lived experience. Listeners follow, recognizing themselves in another's joy, folly, grief, or wonder.

### Why It Works

Traditional storytelling platforms reward curation—the carefully chosen photo, the edited narrative. The Story Portal inverts this. The spinning wheel removes choice. The spontaneity removes rehearsal. What remains is authenticity, and authenticity is the doorway to empathy.

### Core Values

1. **Spontaneity unlocks truth** — The unexpected prompt bypasses the inner editor
2. **Every story deserves a witness** — Listening with full attention is an act of empathy
3. **Connection across difference** — Shared experience transcends background and belief
4. **Analog soul, digital reach** — The warmth of a campfire story, accessible anywhere

### On the Steampunk Aesthetic

The Story Portal's visual identity—gears, patina, hand-forged metal—isn't decoration. It's philosophy. In an age of frictionless, algorithmic content, The Story Portal is deliberately *mechanical*. The wheel must be spun. The prompt must be accepted. The story must be told aloud, not typed. This intentional friction creates ritual, and ritual creates meaning.

---

## 2. User Personas

### Primary Persona: The Connector

**"I want deeper conversations with the people in my life, but I don't know how to start them."**

- 25-70 years old, socially active but dissatisfied with surface-level interactions
- Brings The Story Portal to group gatherings as a facilitation tool
- Often records others' stories rather than telling their own first
- Frustrated by social media's performative hollowness

**Aha Moment**: When a listener approaches a storyteller afterward saying "I went through something similar"—and realizes they created that connection.

### Secondary Persona: The Reluctant Storyteller

**"I'm not a storyteller. I don't have any good stories."**

- Believes their experiences are "ordinary"
- Deflects: "I'll just watch" / "Skip me"
- With gentle facilitation, tells stories that silence the room
- Often emotional afterward—surprised by their own depth

**What they need**: Low-pressure invitation, normalization ("The wheel is just asking you a question"), permission to be imperfect.

**Aha Moment**: Seeing impact on listeners—tears, laughter, recognition—realizes "I AM a storyteller."

### Secondary Persona: The Facilitator

**"I need a tool to create genuine connection in my group."**

- Team leads, retreat organizers, therapists, coaches
- Uses app as structured activity within larger programs
- Needs tool for genuine connection, not shallow icebreakers

**Aha Moment**: Seeing team members who never connected suddenly in deep conversation after a session.

### Behavior to Redirect: The Declarer

When prompts read as questions, some respond with statements rather than narratives. "What I love about myself" → "My resilience" (declaration) vs. "Let me tell you about the night I almost gave up" (story).

**Design implication**: Facilitation hints guide toward narrative.

---

## 3. Feature Requirements

### MVP — Core Experience

#### The Wheel
- 3D spinning wheel displaying 20 prompts
- Touch, trackpad, and button-based spin controls
- Realistic physics: momentum, friction, natural deceleration
- Snap-to-prompt landing with clear visual highlight
- "New Topics" button to load different prompt sets
- Works offline (prompts stored locally)

#### Pass & Topic Rules
- User may pass on first spin; second spin is final
- New Topics requires friction mechanism (honor system or time-based)

#### Audio Recording
- Record button appears after wheel lands
- Visual feedback during recording (waveform, timer)
- Maximum 5 minutes, pause/resume, re-record option
- Works offline (stores locally)

#### Story Storage (Local)
- IndexedDB via localForage
- Each story: audio blob, prompt, timestamp, duration, storyteller info, consent status, optional photo

#### Consent Flow
- Verbal consent prompt in audio
- Tap-to-confirm before recording
- Email field for approval flow
- Easy deletion at any time

### MVP — Content Screens

| Screen | Purpose |
|--------|---------|
| How to Play | Instructions, facilitation guidance |
| Our Story | Origin, mission, philosophy |
| Our Work | Photos of physical installations |
| Privacy Policy | Data handling, user rights |
| Booking | Physical experience inquiries |

### Phase 2 (Post-MVP)
- User accounts + cloud sync
- Story sharing via link/QR
- Video recording option
- Prompt categories/filtering

### Future Vision
- Community spaces
- Public discovery
- Facilitator/Pro features
- Accessibility (TTS, transcription)

---

## 4. Technical Requirements

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (PWA)                         │
│  React 19 + TypeScript + Vite                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  3D Wheel   │  │   Audio     │  │  Local Storage  │  │
│  │ (CSS 3D +   │  │  Recorder   │  │  (IndexedDB)    │  │
│  │  Canvas)    │  │             │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ (Phase 2: when connected)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Backend (Supabase)                       │
│  Auth │ PostgreSQL │ File Storage │ Edge Functions      │
└─────────────────────────────────────────────────────────┘
```

### Frontend Stack (Current Implementation)

| Category | Technology | Notes |
|----------|------------|-------|
| Framework | React 19.2.0 | Latest stable |
| Build | Vite 7.2.4 | Fast HMR |
| Language | TypeScript 5.9.3 | Strict mode |
| 3D Wheel | CSS 3D Transforms | Sufficient for current needs |
| Portal Effects | Canvas 2D | Electricity animation |
| Testing | Playwright 1.57.0 | E2E + visual regression |
| Package Manager | pnpm | Required |

### To Add for MVP

| Package | Purpose | Install |
|---------|---------|---------|
| localforage | IndexedDB wrapper | `pnpm add localforage` |
| vite-plugin-pwa | PWA/offline | `pnpm add -D vite-plugin-pwa` |

### Audio Recording Architecture

```typescript
// Core recording flow
MediaRecorder API
  → Blob (audio/webm or audio/mp4)
  → localForage.setItem(`story_${id}`, blob)
  → StoriesView reads from localForage
```

**Constraints:**
- Format: WebM (Opus) preferred, MP4 fallback for Safari
- Quality: 64-128kbps mono
- Duration: 5-minute limit (~2-4MB per story)
- No editing: single-take only

### Offline Architecture

1. App shell cached via service worker
2. Prompts cached in IndexedDB on first load
3. Stories saved locally immediately
4. Phase 2: Background sync uploads when online

### Performance Targets

| Metric | Target |
|--------|--------|
| Wheel frame rate | 60fps |
| Audio recording start | < 500ms from tap |
| App load time | < 3 seconds |
| Lighthouse PWA score | > 90 |

---

## 5. Content Requirements

### Prompt Database

**Location**: `docs/prompts.json`

- 142 prompts across 14 categories
- `declaration_risk` field flags prompts needing facilitation hints
- `facilitation_hint` provides narrative coaching

**Categories**: Love & Relationships, Family, Transformation, Fear & Courage, Adventures, Humor, Life & Death, Identity, Work & Achievement, Dreams & Spirituality, Intimacy, Wisdom, Whimsy, Festival

### Declaration Risk Handling

21 prompts flagged as high declaration risk. For these, show facilitation hint:
- "Tell us how you learned this wisdom"
- "When did you discover this about yourself?"
- "Tell us about a time this showed"

### Prompt Design Principles

1. Invite narrative, not declaration
2. Specificity unlocks memory
3. Balance depth and accessibility
4. Prompts are inspirational, not literal

---

## 6. UX Principles

### Design Philosophy

**The Story Portal is not social media.**

| Social Media | Story Portal |
|--------------|--------------|
| Infinite scroll | Intentional, finite experience |
| Likes/followers | Meaningful witnessing |
| Algorithmic feed | Random wheel spin |
| Edited content | Spontaneous single-take |

**Mantra**: Slow down. Be present. Listen.

### Core Principles

1. **Ritual over efficiency** — Wheel animation should feel substantial
2. **Everyone has stories** — Never make users feel they need to be "good"
3. **Spontaneity unlocks authenticity** — No prompt browsing before spin
4. **Audio is intimate** — Recording should feel conversational
5. **Consent is sacred** — Prominent, unambiguous consent flow
6. **Facilitation built into UX** — Hints appear naturally

### The Contemplation State

Between spin and record, show:
1. Prompt prominently displayed
2. Flame animation around selected panel
3. Cycling facilitation cues (fade in/out every 4-5s)

### Steampunk Aesthetic Enforcement

| Use | Avoid |
|-----|-------|
| Brass, amber, aged paper, wood | Cold blues, whites, grays |
| Gears, patina, mechanical feel | Sterile, minimal, flat design |
| Substantial animations | Slick, frictionless transitions |

---

## 7. Success Metrics

### North Star Metric

**Stories Shared Per Active User** — Target: 3+ in first 30 days

### Key Performance Indicators

| Category | Metric | Target |
|----------|--------|--------|
| Activation | First spin rate | >80% |
| Activation | First story rate | >50% |
| Engagement | Stories per user | 3+ in 30 days |
| Engagement | Pass rate | <30% |
| Retention | Day 7 return | >30% |
| Retention | Day 30 return | >20% |

### Analytics: Google Analytics 4

Key events: `wheel_spin`, `prompt_pass`, `recording_start`, `recording_complete`, `story_saved`, `topic_pack_changed`

---

## 8. Constraints & Assumptions

### Resource Constraints
- Solo developer + Claude assistance
- Free tier infrastructure only
- Scope-driven timeline (Love Burn soft target)

### Scope Boundaries (NOT in MVP)
- User accounts, cloud sync
- Video recording
- Social network features
- Custom prompt creation
- Multi-language

### Definition of Done (MVP)

**Core Functionality**
- [ ] Spin wheel, land on prompt
- [ ] Pass once, accept second
- [ ] Contemplation screen with hints
- [ ] Record audio (up to 5 minutes)
- [ ] Optional photo attachment
- [ ] Consent flow
- [ ] Local story storage
- [ ] My Stories gallery
- [ ] Topic pack switching
- [ ] Offline core features

**Content & Polish**
- [ ] All content screens complete
- [ ] Steampunk aesthetic consistent
- [ ] Animations complete
- [ ] Sound design implemented

**Technical**
- [ ] PWA installable
- [ ] Works on 2018+ smartphones
- [ ] GA4 tracking
- [ ] Deployed to app.thestoryportal.org

---

*This is a living document. Update as decisions are made.*
SPEC_EOF
echo "✓ APP_SPECIFICATION.md created"

# ============================================================================
# DOCS/PRODUCT_CONTEXT.md
# ============================================================================
echo "📄 Creating docs/PRODUCT_CONTEXT.md..."
cat > docs/PRODUCT_CONTEXT.md << 'CONTEXT_EOF'
# Story Portal — Product Context (Quick Reference)

> **Full specification**: `docs/APP_SPECIFICATION.md`

---

## Mission

**Making empathy contagious.**

---

## Core Loop

```
Spin wheel → Land on prompt → Contemplate → Record story → Save/Share
```

---

## Primary Persona: The Connector

Someone who brings the app to a group gathering to facilitate deeper conversation.
They often record others' stories rather than their own.

---

## Key UX Rules

1. **One pass allowed** — Can skip first prompt, must accept second
2. **No prompt shopping** — Can't browse prompts before spinning
3. **Audio only** — No typed stories
4. **5-minute max** — Recording duration limit
5. **Facilitation hints** — Show for declaration-risk prompts

---

## Stories vs. Declarations

| ❌ Declaration | ✅ Story |
|----------------|----------|
| "My resilience" | "The night I almost gave up..." |
| "I value honesty" | "There was this time I had to tell a hard truth..." |

---

## Aesthetic

**Steampunk time machine** — mechanical, warm, tactile, analog soul.

| Use | Avoid |
|-----|-------|
| Brass, amber, wood | Cold blues, whites |
| Gears, patina | Sterile, minimal |

---

## What's in MVP

✅ 3D wheel, audio recording, local storage, consent flow, content screens, PWA

## What's NOT in MVP

❌ User accounts, cloud sync, video, social features, custom prompts

---

## Decision Framework

1. Which persona does this serve?
2. Does it preserve spontaneity?
3. Is it MVP, Phase 2, or Future?
4. Would The Reluctant Storyteller feel safe?
CONTEXT_EOF
echo "✓ PRODUCT_CONTEXT.md created"

# ============================================================================
# DOCS/PROMPTS.JSON
# ============================================================================
echo "📄 Creating docs/prompts.json..."
cat > docs/prompts.json << 'PROMPTS_EOF'
{
  "version": "1.0",
  "generated": "2024-12-21",
  "total_prompts": 142,
  "packs": [
    {
      "id": "default",
      "name": "Default",
      "description": "Curated general-audience prompts",
      "is_default": true
    },
    {
      "id": "love-burn-2025",
      "name": "Love Burn 2025",
      "description": "Event-specific prompts for Love Burn festival",
      "is_default": false
    }
  ],
  "categories": [
    { "id": "love-relationships", "name": "Love & Relationships" },
    { "id": "family", "name": "Family" },
    { "id": "transformation", "name": "Transformation & Growth" },
    { "id": "fear-courage", "name": "Fear & Courage" },
    { "id": "adventures", "name": "Adventures & Experiences" },
    { "id": "humor", "name": "Humor & Embarrassment" },
    { "id": "life-death", "name": "Life & Death" },
    { "id": "identity", "name": "Identity & Self" },
    { "id": "work-achievement", "name": "Work & Achievement" },
    { "id": "dreams-spirituality", "name": "Dreams & Spirituality" },
    { "id": "intimacy", "name": "Sex & Intimacy" },
    { "id": "wisdom", "name": "Wisdom & Lessons" },
    { "id": "whimsy", "name": "Whimsy & Tall Tales" },
    { "id": "festival", "name": "Festival & Burn" }
  ],
  "prompts": [
    { "id": 1, "text": "A love story", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 2, "text": "When someone was a friend to me", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 3, "text": "My first time", "category": "intimacy", "declaration_risk": false, "facilitation_hint": "Remember: 'first time' could be any first—not just the obvious one." },
    { "id": 4, "text": "When I fell in love", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 5, "text": "Most tender moment of my life...", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 6, "text": "When I see the world with eyes of love", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 7, "text": "Dreams", "category": "dreams-spirituality", "declaration_risk": true, "facilitation_hint": "Tell us about a specific dream—sleeping or waking—that stayed with you." },
    { "id": 8, "text": "Eye of the Tiger!!", "category": "fear-courage", "declaration_risk": false, "facilitation_hint": null },
    { "id": 9, "text": "A leap of faith", "category": "transformation", "declaration_risk": false, "facilitation_hint": null },
    { "id": 10, "text": "When it all changed for me", "category": "transformation", "declaration_risk": false, "facilitation_hint": null },
    { "id": 11, "text": "Overcoming Fear", "category": "fear-courage", "declaration_risk": false, "facilitation_hint": null },
    { "id": 12, "text": "Ghost Story!", "category": "whimsy", "declaration_risk": false, "facilitation_hint": "This could be supernatural—or a memory that haunts you." },
    { "id": 13, "text": "Near death experience", "category": "life-death", "declaration_risk": false, "facilitation_hint": null },
    { "id": 14, "text": "And then I got caught", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 15, "text": "When I got away with it", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 16, "text": "This one time at the Burn", "category": "festival", "declaration_risk": false, "facilitation_hint": null },
    { "id": 17, "text": "That's gross!", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 18, "text": "Unexpected bodily function", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 19, "text": "I was so embarrassed", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 20, "text": "Drunken stupidity & hilarity", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 21, "text": "Bamboozled!", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 22, "text": "Conception", "category": "intimacy", "declaration_risk": false, "facilitation_hint": "This could be biological—or the birth of any idea or creation." },
    { "id": 23, "text": "My birth story", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 24, "text": "When I was little", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 25, "text": "High school was", "category": "identity", "declaration_risk": false, "facilitation_hint": null },
    { "id": 26, "text": "Something I grew out of", "category": "transformation", "declaration_risk": false, "facilitation_hint": null },
    { "id": 27, "text": "If I knew then what I know now", "category": "wisdom", "declaration_risk": false, "facilitation_hint": null },
    { "id": 28, "text": "The wisdom that lives in me says", "category": "wisdom", "declaration_risk": true, "facilitation_hint": "Tell us how you learned this wisdom—what happened that taught you?" },
    { "id": 29, "text": "What I learned from hard times", "category": "wisdom", "declaration_risk": false, "facilitation_hint": null },
    { "id": 30, "text": "A song that holds a memory for me", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 31, "text": "Breakdown to breakthrough", "category": "transformation", "declaration_risk": false, "facilitation_hint": null },
    { "id": 32, "text": "A funeral", "category": "life-death", "declaration_risk": false, "facilitation_hint": null },
    { "id": 33, "text": "If I could speak to someone who has passed on", "category": "life-death", "declaration_risk": false, "facilitation_hint": null },
    { "id": 34, "text": "You're Fired!", "category": "work-achievement", "declaration_risk": false, "facilitation_hint": null },
    { "id": 35, "text": "Job Interview", "category": "work-achievement", "declaration_risk": false, "facilitation_hint": null },
    { "id": 36, "text": "Epic fail", "category": "work-achievement", "declaration_risk": false, "facilitation_hint": null },
    { "id": 37, "text": "A Tall Tale", "category": "whimsy", "declaration_risk": false, "facilitation_hint": null },
    { "id": 38, "text": "An epic adventure", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 39, "text": "Crazy psychedelic trip", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 40, "text": "Triumph!", "category": "work-achievement", "declaration_risk": false, "facilitation_hint": null },
    { "id": 41, "text": "A trailblazer I met", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 42, "text": "A star encounter", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 43, "text": "Someone who taught me something", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 44, "text": "Someone I admire", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 45, "text": "Something I do really well", "category": "identity", "declaration_risk": true, "facilitation_hint": "Tell us about a time this skill really mattered—what happened?" },
    { "id": 46, "text": "Yeah, I suck at that", "category": "humor", "declaration_risk": true, "facilitation_hint": "Tell us about a time this showed—what happened?" },
    { "id": 47, "text": "My 5 minutes of fame", "category": "work-achievement", "declaration_risk": false, "facilitation_hint": null },
    { "id": 48, "text": "How I got my million dollar idea", "category": "work-achievement", "declaration_risk": false, "facilitation_hint": null },
    { "id": 49, "text": "When I told the truth", "category": "fear-courage", "declaration_risk": false, "facilitation_hint": null },
    { "id": 50, "text": "When time stood still", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 51, "text": "All in the family", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 52, "text": "Mothers", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 53, "text": "Fathers", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 54, "text": "Sisters and brothers", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 55, "text": "My first concert experience", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 56, "text": "My relationship with my body", "category": "identity", "declaration_risk": false, "facilitation_hint": null },
    { "id": 57, "text": "What I love most about myself", "category": "identity", "declaration_risk": true, "facilitation_hint": "When did you discover this about yourself? Tell us that story." },
    { "id": 58, "text": "What makes me different", "category": "identity", "declaration_risk": true, "facilitation_hint": "Tell us about a time you realized this—what happened?" },
    { "id": 59, "text": "Surprise!", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 60, "text": "Close call", "category": "life-death", "declaration_risk": false, "facilitation_hint": null },
    { "id": 61, "text": "When I look in the mirror", "category": "identity", "declaration_risk": true, "facilitation_hint": "Tell us about a specific moment of looking in the mirror—what did you see, what did you feel?" },
    { "id": 62, "text": "Confession opportunity!", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 63, "text": "This one time in the Port-o-Potty", "category": "festival", "declaration_risk": false, "facilitation_hint": null },
    { "id": 64, "text": "Animals!", "category": "adventures", "declaration_risk": false, "facilitation_hint": "Tell us about an encounter with the animal kingdom." },
    { "id": 65, "text": "Nothing is forever, or is it?", "category": "wisdom", "declaration_risk": false, "facilitation_hint": null },
    { "id": 66, "text": "Getting lost", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 67, "text": "A miracle", "category": "dreams-spirituality", "declaration_risk": false, "facilitation_hint": null },
    { "id": 68, "text": "The home I grew up in", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 69, "text": "One of the best days of my life", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 70, "text": "A missed connection", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 71, "text": "Best halloween experience", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 72, "text": "A time I really appreciated women", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 73, "text": "A time I really appreciated men", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 74, "text": "A nickname and how I got it", "category": "identity", "declaration_risk": false, "facilitation_hint": null },
    { "id": 75, "text": "What are you so afraid of?", "category": "fear-courage", "declaration_risk": true, "facilitation_hint": "Tell us about a time you faced this fear—or a time it got the best of you." },
    { "id": 76, "text": "My favorite achievement so far", "category": "work-achievement", "declaration_risk": false, "facilitation_hint": null },
    { "id": 77, "text": "How I got this scar", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 78, "text": "If I were braver than I am now", "category": "fear-courage", "declaration_risk": false, "facilitation_hint": null },
    { "id": 79, "text": "Regrets, I've had a few, but then again", "category": "wisdom", "declaration_risk": false, "facilitation_hint": null },
    { "id": 80, "text": "The story I'm most afraid of telling", "category": "fear-courage", "declaration_risk": false, "facilitation_hint": null },
    { "id": 81, "text": "When I took it to the limit", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 82, "text": "Sweet 16", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 83, "text": "Just in time", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 84, "text": "Closest to paradise I've ever been", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 85, "text": "When trust paid off", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 86, "text": "A blast from the past", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 87, "text": "Danger", "category": "fear-courage", "declaration_risk": false, "facilitation_hint": null },
    { "id": 88, "text": "Remarkable courage", "category": "fear-courage", "declaration_risk": false, "facilitation_hint": null },
    { "id": 89, "text": "What I want to be remembered or known for", "category": "identity", "declaration_risk": true, "facilitation_hint": "Tell us a story that shows this—a moment when you were that person." },
    { "id": 90, "text": "My Sanctuary", "category": "dreams-spirituality", "declaration_risk": true, "facilitation_hint": "Tell us about a time you found refuge there—what happened?" },
    { "id": 91, "text": "What is your \"catch phrase?\"", "category": "identity", "declaration_risk": true, "facilitation_hint": "How did you come to say this? Tell us the story." },
    { "id": 92, "text": "A decision I made", "category": "transformation", "declaration_risk": false, "facilitation_hint": null },
    { "id": 93, "text": "Something I can't live without", "category": "identity", "declaration_risk": true, "facilitation_hint": "Tell us about losing it or almost losing it—what happened?" },
    { "id": 94, "text": "I had an idea", "category": "work-achievement", "declaration_risk": false, "facilitation_hint": null },
    { "id": 95, "text": "That shit was crazy!", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 96, "text": "I had no idea", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 97, "text": "And then, I transcended", "category": "transformation", "declaration_risk": false, "facilitation_hint": null },
    { "id": 98, "text": "The best meal ever!", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 99, "text": "Stickin it to the Man!", "category": "fear-courage", "declaration_risk": false, "facilitation_hint": null },
    { "id": 100, "text": "Harsh reality made silly", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 101, "text": "I was in stitches", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 102, "text": "If I won the lottery", "category": "dreams-spirituality", "declaration_risk": true, "facilitation_hint": "What would change, and why does that matter to you? Tell us the story behind that dream." },
    { "id": 103, "text": "Awakening", "category": "transformation", "declaration_risk": false, "facilitation_hint": null },
    { "id": 104, "text": "What matters to me", "category": "identity", "declaration_risk": true, "facilitation_hint": "Tell us about a time you stood up for what matters—what happened?" },
    { "id": 105, "text": "Deja vu", "category": "dreams-spirituality", "declaration_risk": false, "facilitation_hint": null },
    { "id": 106, "text": "A very weird dream", "category": "dreams-spirituality", "declaration_risk": false, "facilitation_hint": null },
    { "id": 107, "text": "Serendipitous Synchronicity", "category": "dreams-spirituality", "declaration_risk": false, "facilitation_hint": null },
    { "id": 108, "text": "I'll never forget it", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 109, "text": "All about Dad", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 110, "text": "All about Mom", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 111, "text": "Just make that shit up!", "category": "whimsy", "declaration_risk": false, "facilitation_hint": null },
    { "id": 112, "text": "An unexpected meeting", "category": "love-relationships", "declaration_risk": false, "facilitation_hint": null },
    { "id": 113, "text": "Freak of Nature", "category": "whimsy", "declaration_risk": false, "facilitation_hint": null },
    { "id": 114, "text": "If I could have one superpower", "category": "dreams-spirituality", "declaration_risk": true, "facilitation_hint": "Tell us why—what would you do with it? What's the story behind that wish?" },
    { "id": 115, "text": "Outlandish Sex Acts", "category": "intimacy", "declaration_risk": false, "facilitation_hint": null },
    { "id": 116, "text": "Tear Jerker", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 117, "text": "God is", "category": "dreams-spirituality", "declaration_risk": true, "facilitation_hint": "Tell us about a moment that shaped this belief—what happened?" },
    { "id": 118, "text": "Grandma's Cookin'", "category": "family", "declaration_risk": false, "facilitation_hint": null },
    { "id": 119, "text": "My Favorite Pet", "category": "love-relationships", "declaration_risk": true, "facilitation_hint": "Tell us a story about this pet—a specific moment you shared." },
    { "id": 120, "text": "It was so GREAT, and then it was over.", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 121, "text": "It Made No Sense", "category": "whimsy", "declaration_risk": false, "facilitation_hint": null },
    { "id": 122, "text": "My idea of a good time", "category": "adventures", "declaration_risk": true, "facilitation_hint": "Tell us about one of the best times you ever had—what happened?" },
    { "id": 123, "text": "Over my head", "category": "adventures", "declaration_risk": false, "facilitation_hint": null },
    { "id": 124, "text": "Beauty Secrets", "category": "identity", "declaration_risk": true, "facilitation_hint": "Tell us how you learned this—what's the story behind it?" },
    { "id": 125, "text": "My Personal Hell", "category": "fear-courage", "declaration_risk": true, "facilitation_hint": "Tell us about a time you experienced this—what happened?" },
    { "id": 126, "text": "Silence", "category": "dreams-spirituality", "declaration_risk": true, "facilitation_hint": "Tell us about a moment of silence that stayed with you—what happened?" },
    { "id": 127, "text": "My Personal Heaven", "category": "dreams-spirituality", "declaration_risk": true, "facilitation_hint": "Tell us about a time you experienced this—what happened?" },
    { "id": 128, "text": "Letting go", "category": "transformation", "declaration_risk": false, "facilitation_hint": null },
    { "id": 129, "text": "Secret Fetish", "category": "intimacy", "declaration_risk": false, "facilitation_hint": null },
    { "id": 130, "text": "Today is not Yesterday", "category": "transformation", "declaration_risk": true, "facilitation_hint": "Tell us what changed—what's the story of that transformation?" },
    { "id": 131, "text": "What Makes Me Come Alive", "category": "identity", "declaration_risk": true, "facilitation_hint": "Tell us about a moment you felt this—what were you doing, what happened?" },
    { "id": 132, "text": "I was dreaming", "category": "dreams-spirituality", "declaration_risk": false, "facilitation_hint": null },
    { "id": 133, "text": "Anywhere in the World", "category": "adventures", "declaration_risk": true, "facilitation_hint": "Tell us about a place and what happened there—or what you imagine happening there." },
    { "id": 134, "text": "Best Sex Ever", "category": "intimacy", "declaration_risk": false, "facilitation_hint": null },
    { "id": 135, "text": "I Shit My Pants When", "category": "humor", "declaration_risk": false, "facilitation_hint": null },
    { "id": 136, "text": "An Intelligent Contribution", "category": "work-achievement", "declaration_risk": true, "facilitation_hint": "Tell us about a time you contributed something meaningful—what happened?" },
    { "id": 137, "text": "Something that Fascinates Me", "category": "identity", "declaration_risk": true, "facilitation_hint": "How did you discover this fascination? Tell us that story." },
    { "id": 138, "text": "What Turns Me On", "category": "intimacy", "declaration_risk": true, "facilitation_hint": "Tell us about discovering this—what happened?" },
    { "id": 139, "text": "My Fairy Tale", "category": "whimsy", "declaration_risk": false, "facilitation_hint": null },
    { "id": 140, "text": "How Did I Get Here?", "category": "transformation", "declaration_risk": false, "facilitation_hint": null },
    { "id": 141, "text": "Epiphany", "category": "transformation", "declaration_risk": false, "facilitation_hint": null },
    { "id": 142, "text": "What Grinds My Gears", "category": "humor", "declaration_risk": true, "facilitation_hint": "Tell us about a time this happened—what set you off?" }
  ]
}
PROMPTS_EOF
echo "✓ prompts.json created"

# ============================================================================
# DOCS/AUDIO_RECORDING_PLAN.md
# ============================================================================
echo "📄 Creating docs/AUDIO_RECORDING_PLAN.md..."
cat > docs/AUDIO_RECORDING_PLAN.md << 'AUDIO_EOF'
# Audio Recording Implementation Plan

## Overview

Implement audio recording as the core storytelling capture mechanism.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   RecordView.tsx                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Recording  │  │  Waveform   │  │    Controls     │  │
│  │   State     │  │  Visualizer │  │  Start/Stop/    │  │
│  │  Machine    │  │             │  │  Re-record      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 useAudioRecorder Hook                   │
│  - MediaRecorder API wrapper                            │
│  - State: idle → recording → paused → stopped           │
│  - Blob management                                      │
│  - Duration tracking                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  useStoryStorage Hook                   │
│  - localForage wrapper                                  │
│  - Save: audio blob + metadata                          │
│  - Load: for playback in StoriesView                    │
│  - Delete: user-initiated                               │
└─────────────────────────────────────────────────────────┘
```

## Phase 1: Core Recording (Week 1)

### 1.1 Install Dependencies

```bash
pnpm add localforage
```

### 1.2 Create useAudioRecorder Hook

**File**: `src/legacy/hooks/useAudioRecorder.ts`

```typescript
interface RecordingState {
  status: 'idle' | 'recording' | 'paused' | 'stopped';
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}

interface UseAudioRecorderReturn {
  state: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  audioUrl: string | null;
}
```

**Key Implementation Details:**
- Use `navigator.mediaDevices.getUserMedia({ audio: true })`
- Prefer `audio/webm;codecs=opus` with `audio/mp4` fallback for Safari
- Track duration with `setInterval` during recording
- Enforce 5-minute maximum
- Clean up MediaRecorder and streams on unmount

### 1.3 Create useStoryStorage Hook

**File**: `src/legacy/hooks/useStoryStorage.ts`

```typescript
interface Story {
  id: string;
  promptId: number;
  promptText: string;
  audioBlob: Blob;
  duration: number;
  recordedAt: Date;
  storytellerName?: string;
  storytellerEmail?: string;
  consentType: 'self' | 'verbal' | 'verbal_and_tap';
  photoBlob?: Blob;
}

interface UseStoryStorageReturn {
  saveStory: (story: Omit<Story, 'id'>) => Promise<string>;
  getStory: (id: string) => Promise<Story | null>;
  getAllStories: () => Promise<Story[]>;
  deleteStory: (id: string) => Promise<void>;
  storageUsed: number;
}
```

**Storage Schema (localForage):**
- Key: `story_${uuid}`
- Value: Story object with Blob stored directly

### 1.4 Update RecordView

**File**: `src/legacy/views/RecordView.tsx`

```tsx
// States to implement:
// 1. Pre-recording: Show prompt, "Ready to record?" message
// 2. Recording: Waveform, timer, pause/stop buttons
// 3. Review: Playback, re-record option, save button
// 4. Saved: Confirmation, return to wheel
```

**UI Components Needed:**
- `RecordingTimer` - MM:SS display, turns red at 4:30
- `WaveformVisualizer` - Canvas-based audio visualization
- `RecordingControls` - Start, pause, stop, re-record buttons

## Phase 2: Storage & Playback (Week 2)

### 2.1 Update StoriesView

- Load stories from localForage
- Display as list with prompt, date, duration
- Playback with `<audio>` element
- Delete functionality with confirmation

### 2.2 Story Card Component

```tsx
interface StoryCardProps {
  story: Story;
  onPlay: () => void;
  onDelete: () => void;
}
```

## Phase 3: Consent Flow (Week 3)

### 3.1 Self vs. Other Detection

Before recording, ask: "Are you recording your own story or someone else's?"

### 3.2 Consent UI for Others

```
┌─────────────────────────────────────────┐
│  Recording Someone Else's Story         │
│                                         │
│  Please have them:                      │
│  1. State their name                    │
│  2. Say "I consent to this recording"   │
│                                         │
│  Storyteller's name: [____________]     │
│  Email (optional):   [____________]     │
│                                         │
│  [ ] I confirm verbal consent was given │
│                                         │
│  [Start Recording]                      │
└─────────────────────────────────────────┘
```

## Browser Compatibility

| Browser | Format | Notes |
|---------|--------|-------|
| Chrome/Edge | audio/webm;codecs=opus | ✓ Best quality |
| Firefox | audio/webm;codecs=opus | ✓ |
| Safari | audio/mp4 | Fallback required |
| iOS Safari | audio/mp4 | May need user gesture |

## Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| No microphone | "Please allow microphone access" | Show settings link |
| Permission denied | "Microphone permission is required" | Retry button |
| Recording failed | "Something went wrong. Please try again." | Re-record option |
| Storage full | "Device storage is full" | Suggest deleting old stories |

## Testing Checklist

- [ ] Recording starts within 500ms of tap
- [ ] Timer displays correctly
- [ ] Pause/resume works
- [ ] 5-minute limit enforced
- [ ] Re-record clears previous
- [ ] Audio plays back correctly
- [ ] Storage persists across sessions
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers
AUDIO_EOF
echo "✓ AUDIO_RECORDING_PLAN.md created"

# ============================================================================
# APPEND PRODUCT CONTEXT TO CLAUDE.md
# ============================================================================
echo "📄 Updating CLAUDE.md with product context..."

# Check if product context already exists
if grep -q "## Product Context" CLAUDE.md; then
    echo "⚠️  Product Context section already exists in CLAUDE.md - skipping"
else
    cat >> CLAUDE.md << 'CLAUDE_APPEND_EOF'

---

## Product Context

> **Mission:** "Making empathy contagious" through spontaneous, authentic storytelling.

### Core Product Documents

| Document | Location | Purpose |
|----------|----------|---------|
| App Specification | `docs/APP_SPECIFICATION.md` | Complete product spec |
| Product Context | `docs/PRODUCT_CONTEXT.md` | Quick reference for decisions |
| Prompts Database | `docs/prompts.json` | Structured prompt data |
| Audio Plan | `docs/AUDIO_RECORDING_PLAN.md` | Recording implementation |

### Before Making UX Decisions

Reference the product documents. Key principles:

| Principle | Implication for Code |
|-----------|---------------------|
| Spontaneity unlocks truth | No prompt browsing/selection UI |
| Everyone has stories | Never use language like "amazing story" |
| Audio is intimate | No editing, filters, or post-production |
| Ritual over efficiency | Wheel animation must feel substantial |
| Offline-first | Core features work without network |
| Consent is sacred | Prominent, unambiguous consent flow |

### User Personas (Quick Reference)

| Persona | Key Need | Design For |
|---------|----------|------------|
| The Connector | Facilitate group storytelling | Easy to hand phone around |
| The Reluctant Storyteller | Permission to be imperfect | Never feel like performance |
| The Facilitator | Tool for organizations | Professional but warm |

For full personas, see `docs/APP_SPECIFICATION.md#2-user-personas`.

### Feature Scope

| Status | Meaning | Action |
|--------|---------|--------|
| MVP | Must be in first release | Build it |
| Phase 2 | After MVP validation | Document, don't build |
| Future | Long-term vision | Note for later |

Before building a feature, verify its status in `docs/APP_SPECIFICATION.md#3-feature-requirements`.

### Prompts Database

Structured prompt data is in `docs/prompts.json`:

```typescript
import promptsData from '../docs/prompts.json';

// Get prompts with facilitation hints
const riskyPrompts = promptsData.prompts.filter(p => p.declaration_risk);

// Get prompts by category
const familyPrompts = promptsData.prompts.filter(p => p.category === 'family');
```

**Key fields:**
- `declaration_risk`: If true, show `facilitation_hint` in contemplation screen
- `category`: For future filtering/selection features
- `facilitation_hint`: Coaching text to guide toward narrative

### Stories vs. Declarations

| ❌ Declaration | ✅ Story |
|----------------|----------|
| "My resilience" | "The night I almost gave up..." |
| "I value honesty" | "There was this time I had to tell a hard truth..." |

When implementing the contemplation screen, show `facilitation_hint` for prompts where `declaration_risk: true`.

### Aesthetic Enforcement

| ✅ Use | ❌ Avoid |
|--------|---------|
| Brass, amber, aged paper, wood | Cold blues, whites, grays |
| Gears, patina, hand-forged metal | Sterile, minimal, flat design |
| Substantial mechanical animations | Slick, frictionless transitions |
| Warm analog sounds | Digital beeps and notifications |

CLAUDE_APPEND_EOF
    echo "✓ CLAUDE.md updated with Product Context section"
fi

# ============================================================================
# PM SKILL FILES
# ============================================================================
echo "📄 Creating PM skill files..."

cat > .claude/skills/story-portal-pm/SKILL.md << 'PM_SKILL_EOF'
# Story Portal Product Management Skill

## Purpose

Product management guidance for The Story Portal app. Use when:
- Defining new features or user stories
- Making UX decisions (reference personas)
- Prioritizing work (reference MVP scope)
- Evaluating ideas against mission
- Documenting decisions

## Core Documents

| Document | Location |
|----------|----------|
| Full Specification | `docs/APP_SPECIFICATION.md` |
| Quick Reference | `docs/PRODUCT_CONTEXT.md` |
| Prompts Database | `docs/prompts.json` |
| Audio Plan | `docs/AUDIO_RECORDING_PLAN.md` |

## Decision Framework

1. **Mission Alignment**: Does this make empathy more contagious?
2. **Persona Fit**: Which persona does this serve?
3. **Spontaneity**: Does it protect the wheel's randomness?
4. **Scope**: Is it MVP, Phase 2, or Future?
5. **Offline**: Does it work without internet?
6. **Document**: Log decision in `product/decision-log.md`
PM_SKILL_EOF

cat > .claude/skills/story-portal-pm/product/decision-log.md << 'DECISION_LOG_EOF'
# Product Decision Log

Record significant product decisions here for continuity.

## Template

```markdown
## [Date] - [Decision Title]

**Context:** Why was this decision needed?

**Decision:** What we chose

**Rationale:** Why we chose it

**Implications:** What this means for development
```

---

## 2024-12-21 - Technical Stack Confirmation

**Context:** Spec mentioned Three.js but implementation uses CSS 3D transforms.

**Decision:** Keep CSS 3D transforms for wheel; reserve Canvas/WebGL for effects only.

**Rationale:** CSS 3D is sufficient for current wheel needs, simpler to maintain, better performance on low-end devices.

**Implications:** Three.js not needed unless adding complex 3D features in future.
DECISION_LOG_EOF

echo "✓ PM skill files created"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "==========================================="
echo "✅ Installation Complete!"
echo "==========================================="
echo ""
echo "Files created:"
echo "  📄 docs/APP_SPECIFICATION.md"
echo "  📄 docs/PRODUCT_CONTEXT.md"
echo "  📄 docs/prompts.json"
echo "  📄 docs/AUDIO_RECORDING_PLAN.md"
echo "  📄 .claude/skills/story-portal-pm/SKILL.md"
echo "  📄 .claude/skills/story-portal-pm/product/decision-log.md"
echo "  📝 CLAUDE.md (updated with Product Context section)"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git diff"
echo "  2. Commit: git add -A && git commit -m 'docs: add product specification and PM skill'"
echo "  3. Start implementing audio recording per docs/AUDIO_RECORDING_PLAN.md"
echo ""
echo "For Claude.ai PM sessions, see: docs/CLAUDE_AI_SETUP.md"
