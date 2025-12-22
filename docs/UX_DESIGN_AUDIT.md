# The Story Portal — UX Design Audit

**Generated:** December 22, 2025  
**Status:** Living Document  
**Purpose:** Track design completeness, identify gaps, prioritize UX work for MVP

---

## Executive Summary

The Story Portal has a **strong visual foundation** — the main wheel interface, environment, buttons, and menu system are polished and cohesive. The steampunk aesthetic is well-established through the background, portal ring, brass buttons, patina metal navigation, and wood panel menus.

**Critical gaps** exist in:
1. **Modal Content Window pattern** — all 6 content screens (My Stories, How to Play, Our Story, Our Work, Booking, Privacy) need this
2. **Recording flow** — from "tap Record" to "Story saved" (no design)
3. **Consent flow** — all screens undefined
4. **Topic Reveal Animation** — fire poof lifts topic off wheel, propels toward user (not started)
5. **Post-reveal Contemplation state** — what happens after topic zooms to user (not ideated)

**Key Finding:** The wheel interface is approximately 80% complete with strong visual execution. The content/modal screens are approximately 5% complete — the placeholder style breaks the aesthetic. A unified Modal Content Window pattern is the #1 design priority as it unblocks all content screens.

### Design Completion by Category

| Category | Complete | Partial | Needs Design | Not Started | Deprecated |
|----------|----------|---------|--------------|-------------|------------|
| Core Flow Screens | 2 | 2 | 8 | 2 | 0 |
| Content Modals | 0 | 0 | 6 | 0 | 0 |
| Other Modals | 0 | 1 | 3 | 0 | 0 |
| Navigation Components | 3 | 0 | 1 | 0 | 0 |
| Input Components | 5 | 0 | 2 | 1 | 0 |
| Feedback Components | 0 | 0 | 0 | 5 | 0 |
| Effects/Animations | 3 | 1 | 0 | 1 | 2 |
| **Total** | **13** | **4** | **20** | **9** | **2** |

---

## 1. Screen Inventory

### 1.1 Core Flow Screens

Per USER_FLOWS.md §2 (Core Story Loop):

| Screen | Status | Priority | Implementation | Notes |
|--------|--------|----------|----------------|-------|
| **Idle (Wheel Ready)** | 🟡 Partial | Medium | `LegacyApp.tsx` | Works, but no visual "spin me" affordance |
| **Spinning** | ✅ Complete | — | `useWheelPhysics.ts` | 60fps physics |
| **Landing** | ✅ Complete | — | `useWheelPhysics.ts` | Snap-to-prompt |
| **Prompt Revealed** | 🟡 Partial | Critical | `WheelPanel.tsx` | Works; Pass button not designed; no selected state indicator |
| **Topic Reveal Animation** | ⚫ Not Started | Critical | — | Fire poof lifts topic off wheel, propels toward user |
| **Contemplation** | 🔴 Needs Design | Critical | — | Post-reveal state TBD; hint cycling not designed |
| **Tell Story (No Recording)** | ⚫ Not Started | Low | — | Just prompt display; minimal UI needed |
| **Recording (Idle → Active)** | 🔴 Needs Design | Critical | `RecordView.tsx` | "Coming soon" text only |
| **Recording (Paused)** | 🔴 Needs Design | Critical | — | No design |
| **Recording (Time Warning)** | 🔴 Needs Design | High | — | 30-second warning state |
| **Review** | 🔴 Needs Design | Critical | — | Playback + Keep/Re-record |
| **Photo Prompt** | 🔴 Needs Design | Medium | — | Camera/gallery picker |
| **Saving** | 🔴 Needs Design | Medium | — | Progress indicator |
| **Save Success** | 🔴 Needs Design | Medium | — | Confirmation moment |

### 1.2 Onboarding Screens

Per USER_FLOWS.md §3 (First-Time User Onboarding):

| Screen | Status | Priority | Notes |
|--------|--------|----------|-------|
| **Splash** | ⚫ Not Started | Medium | Logo + tagline, 2s auto-advance |
| **Wheel Intro** | ⚫ Not Started | Medium | "Tap to spin" overlay |

**Design Goal:** Spin within 30 seconds. Show, don't lecture.

### 1.3 Content Screens (All Modal-Based)

Per APP_SPECIFICATION.md §3 (MVP Content Screens):

**All content screens open as modal windows over the main wheel interface.** They share a common modal content window pattern that needs design.

| Screen | Status | Priority | Copy Status | Notes |
|--------|--------|----------|-------------|-------|
| **How to Play** | 🔴 Needs Design | High | Draft in content-voice.md | Instructional content |
| **Our Story** | 🔴 Needs Design | Medium | Skeleton only | Origin, mission, invitation |
| **Our Work** | 🔴 Needs Design | Medium | None | **Photo gallery + captions + overview text** — most complex content screen |
| **Privacy & Terms** | 🔴 Needs Design | Medium | Draft outline | Legal content |
| **Booking** | 🔴 Needs Design | Low | None | Contact/inquiry form |
| **My Stories** | 🔴 Needs Design | High | N/A | Gallery of saved stories; empty + list + detail states |

**Design Dependency:** All six screens require the Modal Content Window pattern to be designed first.

### 1.4 My Stories Modal States

My Stories is a modal content window with multiple internal states:

| State | Status | Priority | Notes |
|--------|--------|----------|-------|
| **Empty State** | 🔴 Needs Design | High | First-time user; CTA to tell a story |
| **List View** | 🔴 Needs Design | High | Story cards: prompt, duration, date, optional thumbnail |
| **Story Detail** | 🔴 Needs Design | High | Full playback, metadata, delete action |

**Design Note:** The current My Stories placeholder (dark semi-transparent card with gold border) breaks the established aesthetic. This modal and all others need the unified steampunk Modal Content Window treatment.

### 1.5 Modal/Overlay Screens

Per USER_FLOWS.md §4 (Recording Flows) and §8 (Permissions vs. Consent):

| Screen | Status | Priority | Notes |
|--------|--------|----------|-------|
| **Whose Story Modal** | 🔴 Placeholder | Critical | "My Story" / "Someone Else's Story" |
| **Self Consent** | 🔴 Placeholder | Critical | Quick affirm, single tap |
| **Other Consent Script** | 🔴 Placeholder | Critical | Full consent language |
| **Email Capture** | 🔴 Placeholder | Critical | Optional, skippable |
| **Verbal Consent Prompt** | 🔴 Placeholder | Critical | Recording overlay |
| **Topic Picker** | 🟡 Partial | Medium | Pack selection, confirmation |
| **Error Modal (Generic)** | 🔴 Placeholder | High | All error states per §9 |
| **Confirm Delete** | 🔴 Placeholder | Medium | Destructive action pattern |
| **Permission Request** | 🔴 Placeholder | High | Mic, camera access |

---

## 2. Component Inventory

### 2.1 Navigation Components

| Component | Status | File | Notes |
|-----------|--------|------|-------|
| **NavButtons** | ✅ Complete | `NavButtons.tsx` | How to Play + My Stories (patina metal + rust frame) |
| **HamburgerMenu (Gear)** | ✅ Complete | `HamburgerMenu.tsx` | Gear icon; X state when open |
| **MenuPanels** | ✅ Complete | `MenuPanels.tsx` | Full wood panel items, blur backdrop, logo badge |
| **BackButton** | 🔴 Placeholder | — | Needed for content screens + modals |

### 2.2 Input Components

**Three distinct button styles exist:**

| Style | Used For | Visual |
|-------|----------|--------|
| **Brass/Gold Metal** | Spin, New Topics, Record | Rounded pill, metallic gold, icon + text |
| **Patina Metal + Rust Frame** | How to Play, My Stories | Verdigris interior, rust frame (matches portal ring) |
| **Full Wood Panel** | Menu items | Stacked wood planks, centered text |

| Component | Status | File | Notes |
|-----------|--------|------|-------|
| **SpinButton** | ✅ Complete | `SpinButton.tsx` | Brass coin with rotation arrows; for non-touch devices |
| **NewTopicsButton** | ✅ Complete | `NewTopicsButton.tsx` | Brass/gold metal style |
| **RecordButton** | ✅ Complete | `RecordButton.tsx` | Brass/gold style; has disabled state (icon with strikethrough) + tooltip when tapped while disabled |
| **NavButtons (How to Play, My Stories)** | ✅ Complete | `NavButtons.tsx` | Patina metal + rust frame style |
| **MenuPanelItems** | ✅ Complete | `MenuPanelItem.tsx` | Full wood panel style |
| **PassButton** | ⚫ Not Started | — | New UX element; needs design from scratch |
| **StopButton** | 🔴 Placeholder | — | Recording control |
| **PauseButton** | 🔴 Placeholder | — | Recording control |
| **TextInput** | 🔴 Placeholder | — | For email capture; steampunk style TBD |

### 2.3 Feedback Components

| Component | Status | File | Notes |
|-----------|--------|------|-------|
| **Waveform** | 🔴 Placeholder | — | Recording visualization |
| **Timer** | 🔴 Placeholder | — | Recording duration display |
| **ProgressIndicator** | 🔴 Placeholder | — | Save progress, loading |
| **Toast/Notification** | 🔴 Placeholder | — | Ephemeral feedback |
| **LoadingSpinner** | 🔴 Placeholder | — | Steampunk-styled loader |

### 2.4 Decorative/Effects Components

| Component | Status | File | Notes |
|-----------|--------|------|-------|
| **FlameAnimation** | ⚫ Not Started | — | Selected prompt highlight; critical for Contemplation state |
| **ElectricityCanvas** | 🟡 In Progress | `ElectricityCanvas.tsx` | Triggers on New Topics click; visual refinement needed |
| **SteamWisps** | ✅ Complete | `SteamWisps.tsx` | Ambient particle effect |
| **WarpMotionLines** | ⛔ Deprecated | `WarpMotionLines.tsx` | Not complete; deprecated |
| **DisintegrationParticles** | ⛔ Deprecated | `DisintegrationParticles.tsx` | Not complete; deprecated |

### 2.5 Layout Components

| Component | Status | Notes |
|-----------|--------|-------|
| **ScreenContainer** | 🔴 Placeholder | Consistent padding, safe areas |
| **Card** | 🔴 Placeholder | Story cards, menu items |
| **Modal** | 🔴 Placeholder | Centered overlay pattern |
| **BottomSheet** | ⚫ Not Needed | Consider for mobile interactions |

---

## 3. State Inventory

### 3.1 Global States

| State | Designed? | Affected Screens | Notes |
|-------|-----------|------------------|-------|
| **Loading (App Launch)** | 🔴 No | Splash | Steampunk-styled loader needed |
| **Loading (Async)** | 🔴 No | Save, Topic Switch | Progress indicator |
| **Offline** | 🔴 No | All | Subtle indicator in header? |
| **Error (Generic)** | 🔴 No | All | Modal pattern per §9 |

### 3.2 Wheel States

| State | Designed? | Notes |
|-------|-----------|-------|
| **Idle** | ✅ Yes | Wheel ready to spin |
| **Spinning** | ✅ Yes | Momentum-based rotation |
| **Landing** | ✅ Yes | Deceleration + snap |
| **Prompt Revealed** | 🟡 Partial | Flame works, Pass button TBD |

### 3.3 Contemplation States

| State | Designed? | Notes |
|-------|-----------|-------|
| **Base** | 🟡 Partial | Prompt + flame + Record button |
| **Hint Visible** | 🔴 No | Cycling cues (4-5s fade) |
| **Declaration Risk Hint** | 🔴 No | Prompt-specific hint first |

### 3.4 Recording States

| State | Designed? | Notes |
|-------|-----------|-------|
| **Pre-Recording** | 🔴 No | Ready state before tap |
| **Active** | 🔴 No | Waveform + timer |
| **Paused** | 🔴 No | "Paused" indicator + Resume/Stop |
| **Time Warning (4:30)** | 🔴 No | Visual pulse, "30 seconds remaining" |
| **Stopped** | 🔴 No | Transition to Review |

### 3.5 Gallery States

| State | Designed? | Notes |
|-------|-----------|-------|
| **Empty** | 🔴 No | First-time CTA |
| **Has Stories** | 🔴 No | List/grid layout |
| **Story Playing** | 🔴 No | Audio player UI |
| **Story Deleting** | 🔴 No | Confirmation + removal |

### 3.6 Error States

Per USER_FLOWS.md §9:

| Error | Designed? | Copy Draft? | Notes |
|-------|-----------|-------------|-------|
| **Mic Permission Denied** | 🔴 No | ✅ Yes | Modal with settings link |
| **Storage Full** | 🔴 No | ✅ Yes | Manage Stories CTA |
| **Recording Interrupted** | 🔴 No | ✅ Yes | Start Over / Cancel |
| **Save Failed** | 🔴 No | ✅ Yes | Retry / Try Later |
| **Generic Error** | 🔴 No | ✅ Yes | Fallback pattern |

---

## 4. Design Status Assessment

### 4.1 What's Designed & Implemented ✅

| Element | Quality | Notes |
|---------|---------|-------|
| **Environment/Background** | Exceptional | Gears, pipes, patina, pressure gauge — sets entire aesthetic |
| **Portal Ring** | High | Brass ring with rivets, verdigris patina |
| Wheel mechanics | High | 60fps, natural physics |
| Wheel panels/prompts | High | 3D transform, readable text on wood |
| **SpinButton** | High | Brass coin with rotation arrows; non-touch device trigger |
| **NewTopicsButton** | High | Brass/gold metal style with icon |
| **RecordButton** | High | Brass/gold style; disabled state + tooltip implemented |
| **NavButtons** | High | Patina metal + rust frame style (matches portal ring) |
| **Menu system** | High | Full wood panels, blur backdrop, logo badge, gear close button |
| Steam wisps | High | Ambient atmosphere |

### 4.1.1 Record Button States (Implemented)

| State | Visual | Behavior |
|-------|--------|----------|
| **Disabled** | Icon with strikethrough | Shown before wheel lands; tooltip on tap explains why |
| **Active** | Normal icon | After wheel lands on topic; tappable |
| **Reset** | Returns to disabled | On new spin or New Topics |

### 4.1.2 Established Button Style System

Three distinct button styles are implemented and should be used consistently:

**Style A: Brass/Gold Metal Pill**
- Used for: SpinButton, NewTopicsButton, RecordButton
- Visual: Rounded pill shape, metallic gold/brass, icon + text
- Character: Primary actions, mechanical feel

**Style B: Patina Metal + Rust Frame**
- Used for: NavButtons (How to Play, My Stories)
- Visual: Verdigris/patina interior, rust-colored metal frame — matches portal ring aesthetic
- Character: Navigation, secondary actions

**Style C: Full Wood Panel Stack**
- Used for: Menu items (Our Story, Our Work, Booking, Privacy & Terms)
- Visual: Horizontal wood planks, centered text, no icon
- Character: Menu/list items, content navigation

**Design Rule:** New buttons should use one of these three established styles. Do not introduce new button styles without explicit design justification.

### 4.2 What's Partially Designed 🟡

| Element | What Exists | What's Missing |
|---------|-------------|----------------|
| **Idle State** | Prompts visible, buttons functional | No visual cue that wheel is waiting to be spun |
| **Contemplation** | Prompt display works | Flame animation, hint cycling UI, visual "selected" state |
| **Electricity Effects** | WebGL pipeline, triggers on New Topics | Visual refinement to AAA quality (iterative diff pipeline in progress) |
| **How to Play** | Basic text | Full layout, steampunk styling |

### 4.2.1 Not Started (Critical Elements) ⚫

| Element | Purpose | Priority | Notes |
|---------|---------|----------|--------|
| **Pass Button** | Allow one re-spin on first prompt | Critical | New UX element — needs full design (placement, style, interaction) |
| **Topic Reveal Animation ("Flame")** | Present chosen topic to user after spin | Critical | Poof of fire lifts topic off wheel, propels it forward toward user; post-reveal state TBD |
| **Panel Animations** | Warp/hold/disintegrate sequence | High | Deprecated files need redesign |
| **Modal Content Window Pattern** | Container for all content screens | Critical | My Stories, How to Play, Our Story, Our Work, Booking, Privacy all use this |

### 4.3 What Needs Full Design 🔴

**Critical Path (Blocks MVP):**

1. **Recording UI** — Entire flow from tap to stop
2. **Consent Flow** — All 5 screens (Whose Story, Self, Other, Email, Verbal)
3. **Review Screen** — Playback, Keep/Re-record decision
4. **My Stories Gallery** — Empty, list, and detail views

**High Priority:**

5. **Error Modal Pattern** — Generic pattern for all errors
6. **Pass Button** — Placement on Prompt Revealed state
7. **Hint Cycling UI** — Visual treatment for contemplation cues

**Medium Priority:**

8. **Onboarding** — Splash + first-spin overlay
9. **Content Screens** — How to Play (full), Our Story, Privacy
10. **Photo Attachment** — Camera/gallery picker

### 4.4 What's Not Needed for MVP ⚫

- Video recording (Phase 2)
- Account/login screens (Phase 2)
- Cloud sync UI (Phase 2)
- Sharing flow (Phase 2)
- Community/discovery (Future)
- Accessibility settings panel (Future, though accessibility itself is MVP)

---

## 5. UX Gap Analysis

### 5.1 Missing Core Patterns

| Pattern | Impact | Where Needed | Priority |
|---------|--------|--------------|----------|
| **Modal/Overlay Steampunk Style** | Placeholders break aesthetic | My Stories, Consent, Errors, Topic Picker | Critical |
| **Pass Button** | Can't pass on first spin | Prompt Revealed state | Critical |
| **Loading State** | Users see blank/janky | App launch, saves, topic switch | High |
| **Empty State (Steampunk)** | Confusing first use | My Stories, future features | High |
| **Error Modal** | Errors feel broken | All error conditions per §9 | High |
| **Form Inputs (Steampunk)** | Can't capture email | Email capture screen | High |
| **Audio Player** | Can't play back stories | Story Detail, Review | Critical |

### 5.2 Persona-Specific Gaps

**The Reluctant Storyteller** — "I don't have any good stories."

| Gap | Risk | Mitigation |
|-----|------|------------|
| Recording UI too intimidating | They won't record | Warm, minimal design; encouraging copy |
| Pass button unclear | Anxiety about being "stuck" | Prominent, visible Pass option |
| Error feels like personal failure | Shame, abandonment | Error copy emphasizes "no big deal" |
| Review screen judgmental | Second-guessing story quality | Neutral "Keep" / "Re-record", no ratings |

**The Connector** — "I want to capture others' stories."

| Gap | Risk | Mitigation |
|-----|------|------------|
| "Whose story" choice unclear | Connector records self by mistake | Clear labels, icons |
| Consent handoff confusing | Awkward physical phone pass | "Hand phone to storyteller" instruction |
| Email capture feels mandatory | Storyteller hesitates | Prominent "Skip" option |
| No way to review before handoff | Connector can't preview | Future: quick playback (Phase 2) |

**The Facilitator** — "I need to keep the group moving."

| Gap | Risk | Mitigation |
|-----|------|------------|
| Can't see session progress | Loses track of who's told | Future: session view |
| App feels slow between stories | Momentum dies | Quick return to wheel after save |

### 5.3 Interaction Inconsistencies

| Inconsistency | Current State | Should Be |
|---------------|---------------|-----------|
| **Modal styling** | My Stories uses dark card | Should use brass/patina/wood aesthetic |
| Back navigation | Varies by screen | Consistent back button placement |
| Modal patterns | None defined | Consistent centered overlay with steampunk frame |
| Spacing | Ad-hoc | Defined spacing scale |
| Typography | Mostly consistent | Defined type scale |

**Note:** Button styles are actually well-organized into three categories (see §4.1.2). Main gap is modal/overlay screens which lack steampunk treatment.

### 5.4 Accessibility Gaps

| Gap | WCAG Criteria | Priority |
|-----|---------------|----------|
| Focus states undefined | 2.4.7 Focus Visible | Medium |
| Color contrast unchecked | 1.4.3 Contrast Minimum | Medium |
| Touch targets unclear | 2.5.5 Target Size | High |
| Screen reader labels missing | 4.1.2 Name, Role, Value | Medium |
| Motion may cause issues | 2.3.3 Animation from Interactions | Low |

**Note:** Audio-only stories are inherently accessible to visually impaired users—a strength of the design.

---

## 6. Design Debt Log

| Item | Origin | Impact | Resolution | Effort |
|------|--------|--------|------------|--------|
| Inline styles in view components | Rapid prototyping | Hard to maintain consistency | Extract to CSS modules or design tokens | Medium |
| No spacing system | Ad-hoc development | Inconsistent visual rhythm | Define 4px/8px scale | Low |
| **Modal styling mismatch** | My Stories placeholder | Breaks steampunk aesthetic | Design Modal Content Window pattern | High |
| **No defined type scale** | Ad-hoc | Minor inconsistencies | Document typography system | Low |
| Electricity effects unrefined | Complex WebGL work | Not at target quality | AAA iterative diff pipeline | High |
| **Deprecated panel animations** | WarpMotionLines, DisintegrationParticles incomplete | No panel transitions work | Redesign in Animation System session | High |
| **Topic Reveal Animation missing** | Not started | No "ritual moment" after spin lands | Design fire poof + topic zoom in Animation System session | Critical |
| **Pass button undefined** | New UX element | Can't pass on first spin | Design in Contemplation Refinement session | Critical |
| **Our Work photo gallery** | Not started | Complex content screen needs special treatment | Design within Modal Content Window session | Medium |

---

## 7. Prioritized Design Roadmap

### Phase 1: Critical Path (Blocks MVP Recording)

| # | Design Session | Scope | Deliverables | Est. Effort |
|---|----------------|-------|--------------|-------------|
| 1 | **Modal Content Window Pattern** | Steampunk modal design for all 6 content screens | Frame design, backdrop, open/close animation, internal layout, photo gallery pattern | 2 sessions |
| 2 | **Recording UI** | Active, Paused, Warning, Stopped states | Wireframes, state machine, visual design | 2 sessions |
| 3 | **Consent Flow** | All 5 screens + data model | Wireframes (using modal pattern), copy, transitions | 2 sessions |
| 4 | **Review Screen** | Playback, Keep/Re-record | Wireframes, audio player design | 1 session |

**Outcome:** Complete recording flow from "tap Record" to "Story saved" with consistent steampunk styling. All content modals have unified visual treatment.

### Phase 2: Core Experience Completion

| # | Design Session | Scope | Deliverables | Est. Effort |
|---|----------------|-------|--------------|-------------|
| 5 | **My Stories Content** | Empty, list, detail states within modal | Story cards, empty state CTA, playback UI | 1 session |
| 6 | **Contemplation Refinement** | Pass button, hint cycling, post-reveal state | Pass button design, hint animation spec, topic display after reveal | 1 session |
| 7 | **Error States** | Error modals using content window pattern | Generic pattern, 5 error variations | 1 session |
| 8 | **Animation System** | All app animations (topic reveal, panel transitions, feedback) | Animation inventory, timing specs, implementation guide | 2 sessions |

**Outcome:** Users can record, save, and review stories. Pass mechanic works. Errors handled gracefully. Animation system defined.

### Phase 3: First Impressions & Polish

| # | Design Session | Scope | Deliverables | Est. Effort |
|---|----------------|-------|--------------|-------------|
| 9 | **Onboarding** | Splash, Wheel Intro | 30-second flow, minimal UI | 1 session |
| 10 | **How to Play Content** | Instructional layout within modal | Copy integration, possible illustrations | 0.5 session |
| 11 | **Photo Attachment** | Camera/gallery picker | Simple steampunk UI | 0.5 session |
| 12 | **Component System Docs** | Document button styles, spacing, type | Design tokens, component specs | 1 session |

**Outcome:** Polished first-time experience, How to Play complete, design system documented.

### Phase 4: Content & Accessibility

| # | Design Session | Scope | Deliverables | Est. Effort |
|---|----------------|-------|--------------|-------------|
| 13 | **Our Work Content** | Photo gallery + captions + overview within modal | Gallery pattern, lightbox, caption styling | 1 session |
| 14 | **Remaining Content Screens** | Our Story, Privacy & Terms, Booking | Layouts, copy integration, form design | 1 session |
| 15 | **Accessibility Pass** | Focus, contrast, targets, labels | Audit report, fixes | 1 session |
| 16 | **Electricity Refinement** | Visual quality to AAA | Reference images, parameter tuning | Ongoing |

**Outcome:** All MVP content complete, accessibility baseline met.

---

## 8. Design Principles Compliance

Per APP_SPECIFICATION.md §6:

| Principle | Current Status | Gaps |
|-----------|----------------|------|
| **Ritual over efficiency** | 🟡 Partial | Wheel animation substantial; panel transitions deprecated; flame not started |
| **Everyone has stories** | 🟡 Copy not checked | Audit all copy for "amazing/best" language |
| **Spontaneity unlocks authenticity** | ✅ No prompt browsing | Confirm Pass doesn't enable shopping |
| **Audio is intimate** | 🔴 Recording UI not designed | Prioritize warm, conversational feel |
| **Consent is sacred** | 🔴 Consent flow not designed | Must be clear, unambiguous, respectful |
| **Facilitation built into UX** | 🟡 Hints defined | Hint cycling UI needs design |

### Steampunk Aesthetic Compliance

| Element | Status | Notes |
|---------|--------|-------|
| **Environment/Background** | ✅ Exceptional | Gears, pipes, rivets, patina, pressure gauge — sets bar for rest of app |
| Brass/amber/copper palette | ✅ Defined | Consistently applied on portal, buttons |
| **Portal ring** | ✅ Exceptional | Brass with verdigris patina, rivets |
| Gears/mechanical feel | ✅ Strong | Background gears; gear menu button |
| Patina/aged texture | ✅ Present | Verdigris on portal, pipes |
| **Wood panels** | ✅ Essential | Menu items, nav buttons — core brand element |
| **Brass/gold buttons** | ✅ Complete | Spin, New Topics, Record — distinct metal style |
| **No cold blues/whites/grays** | ⚠️ Issue | My Stories placeholder uses dark gray + gold border — breaks aesthetic |
| Substantial animations | 🟡 Partial | Wheel yes; flame, panel transitions not started |
| **No slick/minimal feel** | ⚠️ At Risk | Modal/overlay screens could go wrong if not styled to match |

---

## 9. Recommended Next Steps

### Immediate (This Week)

1. **Design Recording UI** — Start with wireframes of recording states
2. **Design Consent Flow** — Follow consent-flows.md skill spec
3. **Define Button Component** — Consistent pattern for all actions

### Near-Term (Before Implementation Sprint)

4. **Design Review Screen** — Complete recording flow
5. **Design My Stories Gallery** — Enable story review loop
6. **Create Error Modal Pattern** — Unblock error handling

### Pre-Launch

7. Complete onboarding design
8. Complete all content screens
9. Accessibility audit and fixes
10. Electricity effect visual polish

---

## 10. Design Session Templates

### Modal Content Window Design Session

**Goal:** Define the steampunk visual treatment for the modal content window pattern used by all content screens: My Stories, How to Play, Our Story, Our Work, Booking, and Privacy & Terms.

**Inputs:**
- Screenshots of current main UI (portal, buttons, menu)
- My Stories placeholder as anti-pattern
- APP_SPECIFICATION.md §6 (steampunk aesthetic enforcement)

**Outputs:**
- Modal content window frame design (brass/patina/wood treatment)
- Backdrop treatment (blur, darken, or other)
- Animation for open/close
- Internal layout grid for content
- Typography hierarchy within modals
- Scroll behavior for long content
- Close/back button design
- Text input field steampunk style (for Booking form, email capture)

**Content-Specific Considerations:**
| Screen | Special Requirements |
|--------|---------------------|
| My Stories | Story cards, empty state, playback controls |
| How to Play | Instructional layout, possibly illustrations |
| Our Story | Long-form text, mission statement |
| Our Work | **Photo gallery with captions** + overview text |
| Booking | Contact/inquiry form with inputs |
| Privacy & Terms | Legal text, scrollable |

**Key Questions:**
- Should modal frame use patina metal (like NavButtons), wood (like menu), or a new treatment?
- How much backdrop blur/darken is needed without losing the environment?
- Should modals animate in from center, slide up, or fade?
- How do we handle the Our Work photo gallery? Carousel? Grid? Lightbox?
- What's the close/dismiss pattern (X button? tap outside? swipe down?)
- Should modal have a header bar for title + close, or integrate differently?

### Recording UI Design Session

**Goal:** Design the complete recording experience from tap to stop.

**Inputs:**
- USER_FLOWS.md §4 (Recording Flows)
- consent-flows.md (consent screen specs)
- content-voice.md (button labels, messages)

**Outputs:**
- State machine diagram
- Wireframes for all states (Pre-record, Active, Paused, Warning, Stopped)
- Visual design mockups
- Waveform component spec
- Timer component spec

**Key Questions:**
- How do we show recording is active without being anxiety-inducing?
- How prominent should Pause be vs Stop?
- How do we handle the 4:30 warning gracefully?
- What animation eases the transition from recording to review?

### Consent Flow Design Session

**Goal:** Design the complete consent experience per consent-flows.md.

**Inputs:**
- consent-flows.md (wireframes, copy, data model)
- USER_FLOWS.md §4.2 (Recording Others Flow)
- content-voice.md (consent language, tone)

**Outputs:**
- Wireframes for all 5 screens
- Final copy for consent script
- Visual design mockups
- Transition specifications
- Mobile handoff guidance for Connector persona

**Key Questions:**
- How do we make "hand phone to storyteller" moment clear?
- How do we make Skip feel genuinely optional (not sneaky)?
- How does verbal consent prompt integrate with recording UI?
- What happens if storyteller cancels mid-consent?

### Animation System Design Session

**Goal:** Define all animations across the app, establish timing/easing standards, create implementation guide.

**Inputs:**
- APP_SPECIFICATION.md §6 (ritual over efficiency, substantial animations)
- Current wheel/menu animations as reference
- Deprecated animation files (WarpMotionLines, DisintegrationParticles) for context

**Outputs:**
- Animation inventory (every animated element)
- Timing and easing standards
- **Topic Reveal Animation spec** — fire poof lifts topic off wheel, propels toward user
- Post-reveal state design (what happens after topic zooms to user?)
- Recording state transition animations
- Micro-interaction specs (button presses, feedback)
- Implementation priority order

**Key Questions:**
- Topic Reveal: How does the fire poof originate? From behind the panel? From the portal ring?
- Topic Reveal: How far does the topic travel toward user? Does it settle in a specific position?
- Topic Reveal: What's the post-reveal state? Does the topic stay large? Shrink to a header?
- What replaces the deprecated warp/disintegrate sequence?
- How do we maintain "ritual over efficiency" without slowing users down?
- Which animations are CSS vs Canvas vs WebGL?
- How do animations degrade on lower-powered devices?

---

## Appendix A: Screen Status Quick Reference

```
✅ Complete    🟡 Partial    🔴 Needs Design    ⚫ Not Started    ⛔ Deprecated

CORE FLOW
├── Idle 🟡 (works, no "spin me" affordance)
├── Spinning ✅
├── Landing ✅
├── Prompt Revealed 🟡 (Pass button ⚫)
├── Topic Reveal Animation ⚫ (fire poof + zoom)
├── Contemplation 🔴 (post-reveal state TBD, hints ⚫)
├── Tell Story ⚫ (minimal need)
├── Whose Story Modal 🔴
├── Self Consent 🔴
├── Other Consent 🔴
├── Email Capture 🔴
├── Verbal Consent 🔴
├── Recording 🔴
├── Review 🔴
├── Photo Prompt 🔴
├── Saving 🔴
└── Save Success 🔴

ONBOARDING
├── Splash ⚫
└── Wheel Intro ⚫

CONTENT MODALS (all need Modal Content Window pattern)
├── My Stories 🔴 (empty, list, detail states)
├── How to Play 🔴
├── Our Story 🔴
├── Our Work 🔴 (photo gallery + captions)
├── Privacy & Terms 🔴
└── Booking 🔴

OTHER MODALS
├── Topic Picker 🟡
├── Error Modal 🔴
├── Confirm Delete 🔴
└── Permission Request 🔴

UI COMPONENTS
├── SpinButton ✅ (brass coin)
├── NewTopicsButton ✅ (brass/gold)
├── RecordButton ✅ (brass/gold + disabled state)
├── NavButtons ✅ (patina + rust frame)
├── MenuPanels ✅ (full wood)
├── PassButton ⚫ (new element)
├── BackButton 🔴
└── TextInput 🔴

EFFECTS/ANIMATIONS
├── Wheel Physics ✅
├── Steam Wisps ✅
├── Menu (blur + logo) ✅
├── Electricity (New Topics) 🟡 (AAA pipeline in progress)
├── Topic Reveal (fire poof) ⚫
├── WarpMotionLines ⛔
└── DisintegrationParticles ⛔
```

---

## Appendix B: Persona Safety Checklist

Before finalizing any design, verify against all three personas:

### The Reluctant Storyteller
- [ ] Does this feel safe and low-pressure?
- [ ] Is there an easy exit that doesn't feel like failure?
- [ ] Does the copy avoid "amazing/best/great" language?
- [ ] Would someone who "doesn't have stories" feel invited?

### The Connector
- [ ] Is it clear when to hand the phone to someone else?
- [ ] Can they guide a first-time storyteller easily?
- [ ] Is consent capture obvious and trustworthy?
- [ ] Can they get back to the wheel quickly for the next person?

### The Facilitator
- [ ] Does the flow maintain group energy?
- [ ] Is transition between stories fast enough?
- [ ] Are there any blocking states that could derail a session?

---

*This is a living document. Update after each design session.*
