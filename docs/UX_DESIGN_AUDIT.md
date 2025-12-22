# UX Design Audit — The Story Portal

**Generated:** December 22, 2025  
**Source:** Design Implementation Audit  
**Status:** Verified from codebase

---

## Executive Summary

The Story Portal has a **mature wheel experience** (~85% complete) with sophisticated 3D transforms, WebGL electricity effects, and polished menu animations. **Critical gaps** exist in recording flow, consent UI, content screens, and accessibility.

### Completion by Area

| Area | Status | Completion |
|------|--------|------------|
| Wheel Experience | ✅ Production-ready | ~85% |
| Navigation & Menu | ✅ Production-ready | ~90% |
| Recording Flow | 🔴 Placeholder only | ~5% |
| Content Screens | 🔴 Placeholder only | ~5% |
| Accessibility | 🔴 Not implemented | ~0% |

---

## Screen Inventory

### Core Flow Screens

| Screen | Status | Notes |
|--------|--------|-------|
| **Wheel (Idle)** | ✅ Complete | 3D perspective, 20 panels, responsive sizing |
| **Wheel (Spinning)** | ✅ Complete | Physics-based, momentum, friction |
| **Prompt Revealed** | ✅ Complete | Panel selection, electricity effect triggers |
| **Contemplation** | 🟡 Partial | Prompt display works; hint cycling not implemented |
| **Recording** | 🔴 Placeholder | "Recording functionality coming soon..." |
| **Review** | 🔴 Not started | — |
| **Photo Attachment** | 🔴 Not started | — |
| **Save Confirmation** | 🔴 Not started | — |

### Content Screens

| Screen | Status | Notes |
|--------|--------|-------|
| **How to Play** | 🔴 Placeholder | Basic text only (AboutView.tsx) |
| **Our Story** | 🔴 Not started | — |
| **Our Work** | 🔴 Not started | — |
| **Privacy Policy** | 🔴 Not started | — |
| **Booking** | 🔴 Not started | — |
| **My Stories (Empty)** | 🔴 Placeholder | "Your recorded stories will appear here..." |
| **My Stories (List)** | 🔴 Not started | — |
| **Story Detail** | 🔴 Not started | — |

### Modals & Overlays

| Screen | Status | Notes |
|--------|--------|-------|
| **Topic Picker** | 🟡 Partial | NewTopicsButton exists; modal picker not designed |
| **Whose Story Modal** | 🔴 Not started | — |
| **Self Consent** | 🔴 Not started | — |
| **Other Consent** | 🔴 Not started | — |
| **Email Capture** | 🔴 Not started | — |
| **Verbal Consent Prompt** | 🔴 Not started | — |
| **Error Modals** | 🔴 Not started | — |
| **Confirm Delete** | 🔴 Not started | — |
| **Pass Button** | 🔴 Not started | — |

---

## Component Inventory

### ✅ Complete Components

| Component | File | Notes |
|-----------|------|-------|
| **SpinButton** | buttons/SpinButton.tsx | Circular, bronze gradient, drop shadow |
| **NavButtons** | buttons/NavButtons.tsx | "How to Play" & "My Stories", extruded text SVG |
| **RecordButton** | buttons/RecordButton.tsx | With tooltip |
| **NewTopicsButton** | buttons/NewTopicsButton.tsx | Shuffles prompts |
| **HamburgerMenu** | menu/HamburgerMenu.tsx | Gear icon, animated lines, SVG filters |
| **MenuPanels** | menu/MenuPanels.tsx | Container with rope physics |
| **MenuPanelItem** | menu/MenuPanelItem.tsx | Individual panel, 3D transforms |
| **MenuBackdrop** | menu/MenuBackdrop.tsx | Blur overlay |
| **SmokeEffect** | menu/SmokeEffect.tsx | Multi-layer smoke poof |
| **MenuLogo** | menu/MenuLogo.tsx | Logo display |
| **WheelPanel** | WheelPanel.tsx | Individual prompt panel |
| **ElectricityCanvas** | ElectricityCanvas.tsx | WebGL wrapper |
| **PortalRing** | PortalRing.tsx | Portal overlay |
| **SteamWisps** | SteamWisps.tsx | Ambient steam particles |
| **AnimatedPanel** | AnimatedPanel.tsx | Warp/hold/disintegrate |
| **ReassembledPanel** | ReassembledPanel.tsx | Side panel post-animation |
| **WarpMotionLines** | WarpMotionLines.tsx | Motion lines during warp |
| **DisintegrationParticles** | DisintegrationParticles.tsx | Particle effect layer |

### 🔴 Missing Components

| Component | Priority | Notes |
|-----------|----------|-------|
| **PassButton** | Critical | First-spin pass option |
| **RecordingUI** | Critical | Waveform, timer, controls |
| **StopButton** | Critical | Recording control |
| **PauseButton** | Critical | Recording control |
| **ConsentModal** | Critical | Self/other selection |
| **ConsentScreen** | Critical | Full consent flow |
| **EmailInput** | Critical | Consent email capture |
| **VerbalConsentOverlay** | Critical | Recording overlay prompt |
| **StoryCard** | High | Gallery list item |
| **StoryDetailView** | High | Playback, delete |
| **AudioPlayer** | High | Playback controls |
| **Waveform** | High | Recording visualization |
| **Timer** | High | Recording duration |
| **ProgressIndicator** | Medium | Save progress |
| **Toast/Notification** | Medium | Ephemeral feedback |
| **LoadingSpinner** | Medium | Async operations |
| **ErrorModal** | Medium | Error pattern |
| **ConfirmModal** | Medium | Destructive actions |
| **BackButton** | Medium | Content screen navigation |
| **TextInput** | Medium | Email, names |

---

## Visual Design Status

### ✅ Implemented Correctly

| Element | Status | Source |
|---------|--------|--------|
| Background color | ✅ `#0a0705` | base.css |
| Text colors | ✅ Wheat/cream palette | wheel.css, buttons.css |
| Display font | ✅ Carnivalee Freakshow | fonts.css |
| UI font | ✅ Molly Sans | fonts.css |
| Bronze gradients | ✅ 27-stop gradient | index.html |
| Button shadows | ✅ Multi-layer drop shadows | LegacyApp.tsx |
| 3D perspective | ✅ 700px wheel, 1000px menu | wheel.css, MenuPanelItem.tsx |
| Electricity effect | ✅ Multi-pass WebGL | useElectricityEffect.ts |
| Smoke effects | ✅ Layered blur clouds | SmokeEffect.tsx |
| Steam wisps | ✅ Animated particles | useSteamEffect.ts |

### 🟡 Partially Implemented

| Element | Status | Issue |
|---------|--------|-------|
| Spacing system | 🟡 Ad-hoc | No formal scale; values vary |
| Border colors | 🟡 Inconsistent | `#8B6F47` vs `#a88545` |
| Container patterns | 🟡 Partial | RecordView/StoriesView have pattern; not systematized |

### 🔴 Not Implemented

| Element | Status | Notes |
|---------|--------|-------|
| Focus states | 🔴 Missing | Default browser only |
| Reduced motion | 🔴 Missing | No @media query |
| Loading states | 🔴 Missing | No steampunk loader |
| Empty states | 🔴 Missing | Placeholder text only |
| Error states | 🔴 Missing | No pattern defined |

---

## Animation Status

### ✅ Implemented Animations

| Animation | Duration | Status |
|-----------|----------|--------|
| Wheel spin physics | Dynamic | ✅ Complete |
| Panel snap-to-prompt | Dynamic | ✅ Complete |
| Gear spin | 0.75s | ✅ Complete |
| Hamburger→X morph | 0.15-0.35s | ✅ Complete |
| Menu panel unfold | 0.7s | ✅ Complete |
| Menu panel push/sway | 2.5s | ✅ Complete |
| Smoke poof | 1.0s | ✅ Complete |
| Smoke wisps | 1.3-1.5s | ✅ Complete |
| Smoke linger | 3.0-3.5s | ✅ Complete |
| Steam streams | 3.8-5.8s | ✅ Complete |
| Electricity WebGL | Continuous | ✅ Complete |
| Panel warp | 600ms | ✅ Complete |
| Panel hold | 3000ms | ✅ Complete |
| Panel disintegrate | 3000ms | ✅ Complete |
| Panel reassemble | 1500ms | ✅ Complete |

### 🔴 Missing Animations

| Animation | Priority | Notes |
|-----------|----------|-------|
| Recording waveform | Critical | Visual feedback |
| Hint cycling | Critical | Fade in/out cues |
| Button press feedback | Medium | Beyond translateY(2px) |
| Loading spinner | Medium | Steampunk style |
| Success confirmation | Medium | Story saved feedback |
| Error shake | Low | Error feedback |

---

## Accessibility Audit

### Current Status: 🔴 Critical Gaps

| Requirement | Status | Notes |
|-------------|--------|-------|
| Focus ring styles | 🔴 Not defined | Default browser only |
| Skip links | 🔴 Not implemented | — |
| High contrast mode | 🔴 Not handled | — |
| Reduced motion | 🔴 Not handled | Heavy animations |
| ARIA labels | 🟡 Partial | Some buttons have aria-label |
| Touch targets | 🟡 Partial | Most buttons adequate |
| Color contrast | ⚠️ Unverified | Needs testing |

### Required Actions

1. Define focus ring style (bronze/gold outline)
2. Add `@media (prefers-reduced-motion)` 
3. Verify color contrast for all text/background pairs
4. Add skip link to main content
5. Complete ARIA labeling

---

## Responsive Design Status

### Implemented Breakpoints

| Breakpoint | Range | Status |
|------------|-------|--------|
| Small | ≤480px | ✅ Wheel scales |
| Medium | 481-768px | ✅ Wheel scales |
| Large | ≥1024px | ✅ Wheel scales |

### Dynamic Sizing

| Element | Responsive | Notes |
|---------|------------|-------|
| Wheel radius | ✅ 130-320px | Based on container |
| Panel height | ✅ 36-110px | Based on radius |
| Font size | ✅ 14-28px | Based on panel |
| Wheel tilt | ✅ 14-20° | Based on width |
| Spin button | 🟡 Fixed 90px | Only one breakpoint |
| NavButtons | 🔴 Fixed 280px | Not responsive |
| Menu panels | 🔴 Fixed 250px | Not responsive |

---

## Priority Roadmap

### 🔴 Critical (Blocks MVP)

1. **Recording UI** — Core flow, currently placeholder
2. **Consent Flow** — Required for recording others
3. **Pass Button** — First-spin pass option
4. **Contemplation Hints** — Cycling facilitation cues

### 🟠 High (Core Experience)

5. **My Stories Gallery** — View saved stories
6. **Story Playback** — Audio player, controls
7. **Error States** — Error modal pattern
8. **How to Play** — Full instructional content

### 🟡 Medium (Good Experience)

9. **Accessibility Pass** — Focus, contrast, ARIA
10. **Empty States** — First-time patterns
11. **Loading States** — Steampunk spinner
12. **Other Content Screens** — Our Story, Privacy, etc.

### 🟢 Low (Polish)

13. **Button Hover States** — Enhanced feedback
14. **Responsive Nav** — Scale NavButtons
15. **Advanced Animations** — Additional polish

---

## Design Sessions Needed

| Session | Priority | Scope |
|---------|----------|-------|
| **Recording UI Design** | Critical | Full recording experience |
| **Consent Flow Design** | Critical | Self/other consent screens |
| **Contemplation Refinement** | Critical | Hint cycling, pass button |
| **My Stories Design** | High | Gallery, detail, playback |
| **Error States Pattern** | High | Modal design, copy |
| **Accessibility Audit** | High | Focus, contrast, ARIA |
| **Content Screens** | Medium | How to Play, Our Story, etc. |
| **Loading/Empty States** | Medium | Steampunk patterns |

---

## Files Reference

### CSS Files (src/legacy/styles/)

| File | Size | Purpose |
|------|------|---------|
| base.css | 6.7KB | Base styles |
| wheel.css | 10.2KB | Wheel, panels |
| animations.css | 16.4KB | Keyframes |
| buttons.css | 11.8KB | Button styles |
| menu.css | 5.4KB | Menu components |
| responsive.css | 4.1KB | Breakpoints |
| fonts.css | 125KB | Embedded fonts |

### Key Components (src/legacy/components/)

| Folder | Components |
|--------|------------|
| buttons/ | SpinButton, NavButtons, RecordButton, NewTopicsButton, ImageButton |
| menu/ | HamburgerMenu, MenuPanels, MenuPanelItem, MenuBackdrop, SmokeEffect, MenuLogo |
| (root) | WheelPanel, ElectricityCanvas, PortalRing, SteamWisps, AnimatedPanel, etc. |

### Views (src/legacy/views/)

| File | Status |
|------|--------|
| RecordView.tsx | Placeholder |
| StoriesView.tsx | Placeholder |
| AboutView.tsx | Placeholder |

---

*This audit reflects verified codebase state as of December 22, 2025*
