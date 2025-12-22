# Session: My Stories Content Design

**Platform:** Claude.ai (Browser)  
**Type:** UX Design  
**Priority:** Phase 2 — Core Experience  
**Estimated Sessions:** 1  
**Prerequisites:** Modal Content Window Pattern (Session 1)

---

## Session Goal

Design the My Stories modal content — including empty state, story list, and story detail/playback views.

---

## Context

### My Stories States

| State | Description | When Shown |
|-------|-------------|------------|
| **Empty** | No stories saved yet | First-time user |
| **List View** | Gallery of saved stories | Has 1+ stories |
| **Detail View** | Single story playback | Tapped a story |

### Story Card Data

Each story contains:
- Prompt text
- Duration (formatted as M:SS)
- Timestamp (relative: "2 days ago")
- Optional photo thumbnail
- Storyteller name (if recorded someone else)
- Consent metadata

### Current State
- Placeholder exists with dark card + gold border (breaks aesthetic)
- "Your recorded stories will appear here..." text
- "Back to Wheel" button
- No actual data, list, or playback

---

## Reference Materials

Upload to Claude.ai:
1. `docs/USER_FLOWS.md` — §6 My Stories Gallery
2. Modal Content Window pattern designs
3. Review screen playback design (for consistency)
4. `docs/content-voice.md` — Empty state messaging

Reference skill:
- `.claude/skills/story-portal/references/my-stories.md`

---

## Session Flow

### Single Session: All My Stories States

**Questions to explore:**

1. **Empty State**
   - Warm, inviting message (not "No stories yet")
   - CTA to spin the wheel and tell a story
   - Should show illustration or just text?
   - Copy that encourages without pressure

2. **Story Card Design**
   - How much info to show? (Prompt, duration, date, photo?)
   - Card styling (wood panel? brass frame?)
   - Tap target size for mobile
   - Grid vs list layout?
   - Max number before scrolling?

3. **List View Layout**
   - Header with title + close button
   - Sorting? (Most recent first, default)
   - Search/filter? (Probably not for MVP)
   - Scroll behavior within modal

4. **Story Detail View**
   - Full prompt display
   - Audio playback controls (reuse from Review screen)
   - Photo display (if attached)
   - Metadata (date, duration, storyteller)
   - Delete action

5. **Delete Flow**
   - Confirmation required ("Delete forever?")
   - Copy that's clear but not scary
   - Animation for removal from list

**Deliverables:**
- Empty state design
- Story card component design
- List view layout
- Detail view layout
- Delete confirmation design
- Transitions between states

---

## Prompt to Start Session

Copy and paste this into Claude.ai:

```
I'm designing the My Stories modal for The Story Portal — the gallery where users see their saved story recordings.

**Context:**
- My Stories opens as a modal over the main wheel (using our Modal Content Window pattern)
- Stories have: prompt text, duration, date, optional photo, storyteller name
- Three states: Empty (no stories), List (story cards), Detail (playback + delete)

**Current placeholder:** Dark card with gold border — needs full redesign to match steampunk aesthetic.

**Design needs:**
1. Empty state — warm, inviting, CTA to tell first story
2. Story card — shows key info, tappable to view detail
3. List view — scrollable gallery of cards
4. Detail view — playback controls, full prompt, delete option
5. Delete confirmation — "Delete forever?" with clear choice

**Key persona consideration:**
- Reluctant Storyteller: Don't make them cringe seeing their stories. Neutral, accepting presentation.
- Connector: May have many stories from different people. Need to identify whose story is whose.

**Constraint:** Reuse audio playback design from Review screen for consistency.

Let's start with the story card design — what info to show and how to style it.
```

---

## Success Criteria

Session is complete when we have:
- [ ] Empty state design with CTA
- [ ] Story card component design
- [ ] List view layout (scrollable)
- [ ] Detail view layout with playback
- [ ] Delete confirmation dialog
- [ ] Transitions between list and detail
- [ ] Mobile and desktop responsive rules
- [ ] All designs documented in skill file

---

## Handoff to Implementation

After design is complete:
1. Update skill file: `.claude/skills/story-portal/references/my-stories.md`
2. Create implementation session for Claude CLI
3. Implementation builds:
   - `MyStoriesModal` component
   - `StoryCard` component
   - `StoryDetail` component
   - Integration with localForage storage

---

## Empty State Copy Options

From content-voice.md guidelines — warm, not corporate:

**Option A (Inviting):**
> Your stories live here.
> 
> Spin the wheel to tell your first one.
> [Spin the Wheel]

**Option B (Encouraging):**
> Everyone has stories worth telling.
> 
> Ready to share yours?
> [Start Telling]

**Option C (Simple):**
> No stories yet.
> 
> [Tell Your First Story]

---

## Technical Notes

- Stories stored in IndexedDB via localForage
- Story data includes audio blob, prompt, timestamp, consent metadata
- Playback uses HTML5 Audio API
- Delete removes from IndexedDB permanently (no undo)
- List should handle 50+ stories without performance issues
