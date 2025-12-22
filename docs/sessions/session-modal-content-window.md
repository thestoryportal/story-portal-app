# Session: Modal Content Window Pattern Design

**Platform:** Claude.ai (Browser)  
**Type:** UX Design  
**Priority:** Phase 1 — Critical Path  
**Estimated Sessions:** 2  
**Prerequisites:** None (foundational pattern)

---

## Session Goal

Design the steampunk-styled modal content window pattern that will be used by all 6 content screens: My Stories, How to Play, Our Story, Our Work, Booking, and Privacy & Terms.

This is the **#1 design priority** because it unblocks all content screen work.

---

## Context

### Current State
- Main wheel interface has strong steampunk aesthetic (brass, patina, wood, gears)
- My Stories placeholder uses dark semi-transparent card with gold border — **breaks the aesthetic**
- No unified modal pattern exists
- Menu system (wood panels, blur backdrop) provides partial reference

### Design Requirements
Per APP_SPECIFICATION.md §6 (Steampunk Aesthetic Enforcement):
- Use brass, amber, aged paper, wood — avoid cold blues, whites, grays
- Gears, patina, mechanical feel — avoid sterile, minimal, flat design
- Substantial animations — avoid slick, frictionless transitions

### Screens That Will Use This Pattern

| Screen | Content Type | Special Needs |
|--------|--------------|---------------|
| My Stories | Gallery + detail | Story cards, playback controls, empty state |
| How to Play | Instructional | Text hierarchy, possible illustrations |
| Our Story | Narrative | Long-form text, mission statement |
| Our Work | Gallery | **Photo gallery + captions + overview text** |
| Booking | Form | Text inputs, submit button |
| Privacy & Terms | Legal | Dense text, scrolling |

---

## Reference Materials

Upload to Claude.ai:
1. `docs/APP_SPECIFICATION.md` — §6 UX Principles
2. `docs/UX_DESIGN_AUDIT.md` — Current status
3. Screenshots of current UI (wheel, menu, My Stories placeholder)

Reference skill:
- `.claude/skills/story-portal/references/modal-content-window.md`

---

## Session Flow

### Part 1: Frame Design (Session 1)

**Questions to explore:**

1. **Frame Style** — Should the modal use:
   - Patina metal + rust frame (like NavButtons/portal ring)?
   - Wood panels (like menu)?
   - Brass/copper with rivets?
   - A new treatment that complements existing elements?

2. **Backdrop Treatment**
   - Blur intensity (reference: menu uses blur)
   - Darken amount
   - Should environment still be partially visible?

3. **Modal Shape & Size**
   - Full screen? Centered card? Bottom sheet?
   - Responsive behavior (mobile vs desktop)
   - Maximum content width

4. **Close/Dismiss Pattern**
   - X button style and placement
   - Tap outside to close?
   - Swipe down gesture (mobile)?
   - Back button integration

**Deliverables:**
- Frame design concept (description or sketch)
- Backdrop specification
- Close button design
- Size/positioning rules

### Part 2: Internal Layout & Components (Session 2)

**Questions to explore:**

1. **Header Treatment**
   - Title styling (typography, placement)
   - Should header be fixed during scroll?
   - Icon integration (if any)

2. **Content Area**
   - Padding/margins
   - Typography hierarchy
   - Scroll behavior (internal scroll vs page scroll)
   - Maximum readable width for text

3. **Photo Gallery Pattern** (for Our Work)
   - Grid vs carousel vs list
   - Thumbnail size
   - Lightbox behavior
   - Caption styling

4. **Form Inputs** (for Booking, Email Capture)
   - Text field steampunk styling
   - Button styling within modals
   - Validation state appearance

5. **Animation**
   - Open animation (fade, scale, slide?)
   - Close animation
   - Content load animation

**Deliverables:**
- Internal layout grid
- Typography scale for modal content
- Photo gallery pattern
- Form input styling
- Animation specifications

---

## Prompt to Start Session

Copy and paste this into Claude.ai:

```
I'm designing the modal content window pattern for The Story Portal, a steampunk-themed storytelling app.

**Context:**
- The main wheel interface has a strong steampunk aesthetic: brass portal ring with verdigris patina, wood panel menus, brass/gold action buttons
- We need a unified modal pattern for 6 content screens: My Stories, How to Play, Our Story, Our Work (with photo gallery), Booking (with form), and Privacy & Terms
- Current placeholder (My Stories) uses a dark card with gold border that breaks the aesthetic

**Design Constraints:**
- Must feel steampunk: brass, patina, wood, gears — no cold blues/whites/grays
- Must work on mobile (primary) and desktop
- Must handle various content types: text, galleries, forms, scrollable content
- Should feel substantial (ritual over efficiency) but not slow

**What I need help with today:**
1. Frame design direction — what visual treatment for the modal container?
2. Backdrop treatment — blur, darken, or other?
3. Close/dismiss pattern
4. Size and positioning rules

I've uploaded screenshots of the current UI and the spec documents. Let's start by exploring frame design options that would complement the existing portal ring and button styles.
```

---

## Success Criteria

Session is complete when we have:
- [ ] Frame design that matches steampunk aesthetic
- [ ] Backdrop treatment specified
- [ ] Close button design
- [ ] Internal layout grid
- [ ] Typography hierarchy for modal content
- [ ] Photo gallery pattern (for Our Work)
- [ ] Form input styling (for Booking)
- [ ] Open/close animation specs
- [ ] Mobile and desktop responsive rules
- [ ] Documentation ready for implementation

---

## Handoff to Implementation

After design is complete:
1. Document decisions in skill file: `.claude/skills/story-portal/references/modal-content-window.md`
2. Create implementation session for Claude CLI
3. Implementation builds reusable `<ModalContentWindow>` component

---

## Notes

- The menu system provides a reference for blur backdrop
- NavButtons (patina + rust frame) may inform the modal frame style
- Consider how modal interacts with the wheel — should wheel be visible behind?
- Our Work photo gallery is the most complex content type — design this pattern explicitly
