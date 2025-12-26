# Modal Content Window — Claude Skill

**Purpose:** Guide design and implementation of the steampunk modal pattern used by all content screens  
**References:** `docs/APP_SPECIFICATION.md` §6, `docs/UX_DESIGN_AUDIT.md`

---

## Overview

The Modal Content Window is the unified container pattern for all content screens in The Story Portal:

- My Stories
- How to Play
- Our Story
- Our Work (with photo gallery)
- Booking (with form)
- Privacy & Terms

This pattern must match the established steampunk aesthetic while accommodating various content types.

---

## Design Status

**Status:** 🔴 Needs Design

**Current placeholder:** My Stories uses dark semi-transparent card with gold border — breaks aesthetic.

**Design session:** `docs/sessions/session-modal-content-window.md`

---

## Design Requirements

### Visual Style

Must align with existing UI elements:

| Existing Element | Visual Treatment                           | Reference For               |
| ---------------- | ------------------------------------------ | --------------------------- |
| Portal Ring      | Verdigris patina, brass rivets, rust frame | Frame style option          |
| NavButtons       | Patina interior, rust frame                | Frame style option          |
| Menu Panels      | Wood planks, stacked                       | Interior content cards?     |
| Brass Buttons    | Gold/brass metallic                        | Action buttons within modal |

### Functional Requirements

| Requirement           | Notes                       |
| --------------------- | --------------------------- |
| Mobile-first          | Primary use case            |
| Responsive            | Works on desktop too        |
| Scrollable content    | Privacy & Terms, long text  |
| Photo gallery support | Our Work screen             |
| Form inputs           | Booking, email capture      |
| Close/dismiss         | X button and/or tap outside |

---

## Content-Specific Needs

| Screen              | Special Requirements                                       |
| ------------------- | ---------------------------------------------------------- |
| **My Stories**      | Story cards, empty state, playback controls, delete action |
| **How to Play**     | Instructional layout, possibly illustrations               |
| **Our Story**       | Long-form text, mission statement                          |
| **Our Work**        | Photo gallery with captions + overview text                |
| **Booking**         | Form with text inputs, submit button                       |
| **Privacy & Terms** | Dense legal text, scrollable                               |

---

## Design Decisions (To Be Filled After Session)

### Frame Design

```
Style: [TBD]
Color palette: [TBD]
Border treatment: [TBD]
Corner style: [TBD]
```

### Backdrop

```
Treatment: [TBD - blur/darken/other]
Blur intensity: [TBD]
Tap outside to close: [TBD - yes/no]
```

### Header

```
Title position: [TBD]
Title typography: [TBD]
Close button style: [TBD]
Close button position: [TBD]
Fixed during scroll: [TBD - yes/no]
```

### Content Area

```
Padding: [TBD]
Max width: [TBD]
Scroll behavior: [TBD]
Typography scale: [TBD]
```

### Animations

```
Open animation: [TBD]
Close animation: [TBD]
Duration: [TBD]
Easing: [TBD]
```

---

## Photo Gallery Pattern (Our Work)

**Status:** 🔴 Needs Design

### Requirements

- Display multiple photos of installations
- Captions for each photo
- Overview text accompanying gallery
- Mobile-friendly interaction (swipe? tap to enlarge?)

### Design Decisions (TBD)

```
Layout: [TBD - grid/carousel/list]
Thumbnail size: [TBD]
Lightbox behavior: [TBD]
Caption styling: [TBD]
Navigation controls: [TBD]
```

---

## Form Input Styling (Booking, Email Capture)

**Status:** 🔴 Needs Design

### Requirements

- Text input fields
- Email validation
- Submit button
- Steampunk-appropriate styling

### Design Decisions (TBD)

```
Input field style: [TBD]
Border treatment: [TBD]
Focus state: [TBD]
Validation error state: [TBD]
Submit button style: [TBD]
```

---

## Implementation Notes

### Component Structure (Proposed)

```
<ModalContentWindow>
  <ModalHeader title="My Stories" onClose={...} />
  <ModalContent>
    {children}
  </ModalContent>
</ModalContentWindow>
```

### Props

```typescript
interface ModalContentWindowProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  showBackdrop?: boolean // default true
  closeOnBackdropClick?: boolean // default true
}
```

### Files to Create

- `src/components/modal/ModalContentWindow.tsx`
- `src/components/modal/ModalHeader.tsx`
- `src/components/modal/ModalContent.tsx`
- `src/components/modal/modal.css`

---

## Accessibility Considerations

- Focus trap within modal
- Escape key closes modal
- aria-modal="true"
- aria-labelledby for title
- Return focus to trigger element on close

---

## References

- `docs/APP_SPECIFICATION.md` §6 (Steampunk Aesthetic)
- `docs/UX_DESIGN_AUDIT.md` (Current status)
- `docs/sessions/session-modal-content-window.md` (Design session)
