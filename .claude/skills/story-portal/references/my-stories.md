# My Stories — Claude Skill

**Purpose:** Guide design and implementation of the story gallery modal  
**References:** `docs/USER_FLOWS.md` §6

---

## Overview

My Stories is a modal content window where users view, play, and manage their saved story recordings. It has three states: Empty, List, and Detail.

---

## Design Status

**Status:** 🔴 Needs Design

**Current placeholder:** Dark semi-transparent card with gold border and "Your recorded stories will appear here..." text.

**Design session:** `docs/sessions/session-my-stories-content.md`

---

## States

| State | When Shown | Key Elements |
|-------|------------|--------------|
| **Empty** | No stories saved | Warm message, CTA to tell first story |
| **List** | Has 1+ stories | Story cards, scrollable gallery |
| **Detail** | Tapped a story | Full playback, metadata, delete option |

---

## Story Data Model

```typescript
interface StoryRecord {
  id: string;
  audioBlob: Blob;
  prompt: {
    id: number;
    text: string;
    category: string;
  };
  timestamp: string;      // ISO 8601
  duration: number;       // seconds
  photo?: Blob;
  consent: {
    type: 'self' | 'other';
    tapConsentTimestamp?: string;
    verbalConsentInAudio: boolean;
    storytellerEmail?: string;
    storytellerName?: string;
  };
}
```

---

## Story Card Display

Each card in the list shows:

| Element | Source | Format |
|---------|--------|--------|
| Prompt text | `story.prompt.text` | Truncated if long |
| Duration | `story.duration` | M:SS (2:47) |
| Date | `story.timestamp` | Relative ("2 days ago") |
| Photo thumbnail | `story.photo` | If attached |
| Storyteller | `story.consent.storytellerName` | Or "My Story" |

---

## Design Decisions (To Be Filled After Session)

### Empty State
```
Message: [TBD]
CTA button: [TBD - "Tell Your First Story" / "Spin the Wheel"]
Illustration: [TBD - yes/no]
```

### Story Card
```
Card style: [TBD - wood panel / brass frame / other]
Information shown: [TBD]
Thumbnail size: [TBD]
Tap target: [TBD]
```

### List View
```
Layout: [TBD - grid / list]
Columns: [TBD - 1 on mobile, 2 on desktop?]
Sorting: [TBD - most recent first]
Max visible before scroll: [TBD]
```

### Detail View
```
Layout: [TBD]
Prompt display: [TBD]
Photo display: [TBD - size/position]
Playback controls: [TBD - reuse from Review screen]
Metadata display: [TBD]
Delete button: [TBD - placement/style]
```

### Delete Flow
```
Confirmation message: [TBD]
Confirm button: [TBD]
Cancel button: [TBD]
Animation: [TBD - removal from list]
```

---

## Empty State Copy Options

Per content-voice.md — warm, not corporate:

**Option A (Inviting):**
```
Your stories live here.

Spin the wheel to tell your first one.

[Spin the Wheel]
```

**Option B (Encouraging):**
```
Everyone has stories worth telling.

Ready to share yours?

[Start Telling]
```

**Option C (Simple):**
```
No stories yet.

[Tell Your First Story]
```

---

## Delete Confirmation

```
Delete this story?

This can't be undone.

[Delete]  [Cancel]
```

**Copy note:** Keep it clear but not scary. Avoid "Delete forever?" which sounds dramatic.

---

## Persona Considerations

### The Reluctant Storyteller
- **Fear:** "Do I want to see these again?"
- **Design response:**
  - Neutral presentation — don't emphasize playback
  - Stories just "exist" — no ratings or rankings
  - Delete is available but not prominent
  - No "Listen to your story!" prompts

### The Connector
- **Need:** Find and play others' stories
- **Design response:**
  - Show storyteller name on cards
  - Easy to distinguish "My Story" from others
  - Possibly filter by storyteller? (Phase 2)

---

## Implementation Notes

### Components to Create
- `MyStoriesModal.tsx` — Main container
- `MyStoriesEmpty.tsx` — Empty state
- `MyStoriesList.tsx` — Story card gallery
- `StoryCard.tsx` — Individual story card
- `StoryDetail.tsx` — Full story view
- `DeleteConfirmation.tsx` — Delete dialog

### Data Loading
```typescript
// Load all stories from IndexedDB
const stories = await localForage.keys()
  .filter(key => key.startsWith('story_'))
  .map(key => localForage.getItem(key));
```

### Performance
- List should handle 50+ stories without lag
- Use virtualization if needed for very long lists
- Lazy load audio blobs (don't load all into memory)

---

## Story Detail View Layout

```
┌─────────────────────────────────┐
│  ← Back                         │
├─────────────────────────────────┤
│                                 │
│     [Photo if attached]         │
│                                 │
│     "Prompt text here that      │
│      they spoke about"          │
│                                 │
│     ▶️  ════════════  2:47      │
│     [Playback controls]         │
│                                 │
│     Dec 20, 2024 · My Story     │
│                                 │
├─────────────────────────────────┤
│         🗑 Delete Story          │
└─────────────────────────────────┘
```

---

## Accessibility

- Story cards are tappable buttons with descriptive labels
- Playback controls keyboard accessible
- Delete confirmation is a proper modal with focus trap
- List announces number of stories to screen readers

---

## References

- `docs/USER_FLOWS.md` §6 (My Stories Gallery)
- `docs/content-voice.md` (Empty state messaging)
- `skills/review-screen.md` (Playback controls consistency)
- `skills/modal-content-window.md` (Container pattern)
- `docs/sessions/session-my-stories-content.md` (Design session)
