# The Story Portal — Project Status Assessment

**Generated:** December 22, 2025
**For:** Product Manager Handoff

---

## Executive Summary

The Story Portal is approximately **25% complete** toward MVP. The core wheel experience (spinning, physics, prompt display) is functional. Critical gaps include audio recording, consent flow, offline support, and content screens. The electricity effects have infrastructure in place but need visual refinement to reach target quality.

---

## 1. Implementation Status by MVP Feature

### MVP — Core Experience

| Feature | Status | Files Involved | Notes/Blockers |
|---------|--------|----------------|----------------|
| **3D Spinning Wheel** | ✅ Complete | `LegacyApp.tsx`, `useWheelPhysics.ts`, `WheelPanel.tsx`, `wheel.css` | Touch, trackpad, button-based spin. 20 prompts displayed. |
| **Wheel Physics** | ✅ Complete | `useWheelPhysics.ts` (220 lines) | Momentum, friction, natural deceleration, snap-to-prompt |
| **Prompt Selection** | ✅ Complete | `useWheelSelection.ts` (179 lines), `prompts.ts` | 143 prompts across 14 categories |
| **Pass & Topic Rules** | 🔴 Not Started | — | Pass logic (1st spin pass allowed, 2nd final) not implemented |
| **New Topics Button** | ✅ Complete | `NewTopicsButton.tsx` | Shuffles prompts; friction mechanism not implemented |
| **Electricity Effects** | 🟡 In Progress | `useElectricityEffect.ts`, `shaders.ts`, `boltGenerator.ts`, `ElectricityCanvas.tsx` | WebGL infrastructure complete. Iterative diff pipeline for AAA visual refinement not finished. |
| **Audio Recording** | 🔴 Not Started | `RecordView.tsx` (placeholder) | Shows "Recording functionality coming soon..." |
| **Recording Waveform/Timer** | 🔴 Not Started | — | — |
| **Max 5min, Pause/Resume** | 🔴 Not Started | — | — |
| **Story Storage (Local)** | 🔴 Not Started | — | `localforage` not installed |
| **Consent Flow** | 🔴 Not Started | — | No consent UI or verbal consent prompt |
| **Offline Support** | 🔴 Not Started | — | `vite-plugin-pwa` not installed; no service worker |

### MVP — Content Screens

| Screen | Status | File | Notes |
|--------|--------|------|-------|
| **How to Play** | 🟡 Placeholder | `AboutView.tsx` | Basic text, not complete |
| **Our Story** | 🔴 Not Started | — | — |
| **Our Work** | 🔴 Not Started | — | — |
| **Privacy Policy** | 🔴 Not Started | — | — |
| **Booking** | 🔴 Not Started | — | — |
| **My Stories** | 🟡 Placeholder | `StoriesView.tsx` | Shell only, no data |

### Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Complete | 5 | ~25% |
| 🟡 Partial/In Progress | 3 | ~15% |
| 🔴 Not Started | 12 | ~60% |

---

## 2. File Inventory

### React Components (`src/legacy/components/`)

| Component | Description |
|-----------|-------------|
| `SteamWisps.tsx` | Steam particle effects around portal |
| `WheelPanel.tsx` | Individual prompt panel on wheel |
| `ElectricityCanvas.tsx` | WebGL canvas wrapper for electricity |
| `PortalRing.tsx` | Portal overlay with shadows |
| `WarpMotionLines.tsx` | Motion lines during warp animation |
| `DisintegrationParticles.tsx` | Particle effect layer |
| `AnimatedPanel.tsx` | Warp/hold/disintegrate panel animation |
| `ReassembledPanel.tsx` | Side panel after animation |
| **buttons/** | |
| `SpinButton.tsx` | Circular spin trigger button |
| `ImageButton.tsx` | Reusable wood panel button |
| `NewTopicsButton.tsx` | Load new prompts button |
| `RecordButton.tsx` | Start recording with tooltip |
| `NavButtons.tsx` | How to Play + My Stories buttons |
| **menu/** | |
| `HamburgerMenu.tsx` | Gear button with SVG animation |
| `MenuBackdrop.tsx` | Blur overlay behind menu |
| `MenuPanelItem.tsx` | Individual menu panel with ropes |
| `MenuPanels.tsx` | Container for all menu items |
| `SmokeEffect.tsx` | Smoke poof on menu toggle |
| `MenuLogo.tsx` | Story Portal logo below menu |

### Custom Hooks (`src/legacy/hooks/`)

| Hook | Purpose |
|------|---------|
| `useWheelPhysics.ts` | Rotation, velocity, friction, easing |
| `useWheelSelection.ts` | Prompt selection, topic loading |
| `useAnimationPhase.ts` | Warp/hold/disintegrate state machine |
| `useMenuState.ts` | Hamburger menu animations |
| `useSteamEffect.ts` | Steam wisp particle spawning |

### WebGL Effects (`src/legacy/effects/`)

| File | Purpose |
|------|---------|
| `useElectricityEffect.ts` | Main WebGL hook with multi-pass rendering |
| `shaders.ts` | All GLSL shaders (bolt, blur, plasma, composite) |
| `boltGenerator.ts` | Bolt initialization, path generation, branching |
| `noiseUtils.ts` | SimplexNoise and fractalNoise functions |

### Screens/Routes

| Route | Component | Status |
|-------|-----------|--------|
| `/` (wheel) | `LegacyApp.tsx` | ✅ Working |
| Record | `RecordView.tsx` | 🟡 Placeholder |
| Stories | `StoriesView.tsx` | 🟡 Placeholder |
| About | `AboutView.tsx` | 🟡 Placeholder |

**Routing:** Simple state-based (`view` state in LegacyApp), not react-router.

---

## 3. Technical Debt & TODOs

### In-Code TODOs

**No TODO/FIXME/HACK comments in source files.** ✅

### Incomplete Implementations

| Location | Issue |
|----------|-------|
| `RecordView.tsx:78` | "Recording functionality coming soon..." placeholder |
| `StoriesView.tsx:54` | "Your recorded stories will appear here..." placeholder |
| `AboutView.tsx` | Minimal content, not full How to Play guide |
| `useElectricityEffect.ts` | Visual quality not at AAA target; refinement pipeline incomplete |

### Architecture Notes

- **All code in `src/legacy/`** — Originally monolithic, now modularized (374 lines in main `LegacyApp.tsx`)
- **No routing library** — State-based view switching
- **Inline styles in views** — Could be CSS modules
- **No state management library** — React hooks only (appropriate for current scope)

---

## 4. Dependencies

### Current (`package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI framework |
| react-dom | ^19.2.0 | React DOM renderer |
| vite | ^7.2.4 | Build tool |
| typescript | ~5.9.3 | Type checking |
| @playwright/test | ^1.57.0 | E2E testing |
| puppeteer | ^24.34.0 | Screenshot capture |
| sharp | ^0.34.5 | Image processing |
| vitest | ^4.0.16 | Unit testing |
| pixelmatch | ^7.1.0 | Image diff (for visual iteration) |
| ssim.js | ^3.5.0 | Structural similarity (for visual iteration) |

### Missing for MVP (per APP_SPECIFICATION.md §4)

| Package | Purpose | Install |
|---------|---------|---------|
| **localforage** | IndexedDB wrapper for story storage | `pnpm add localforage` |
| **vite-plugin-pwa** | PWA/offline support | `pnpm add -D vite-plugin-pwa` |

### Not Yet Needed

- **MediaRecorder API** — Native browser API, no package required
- **Supabase** — Phase 2 (cloud sync)

---

## 5. What Works Today

### Fully Functional (End-to-End)

1. **3D Wheel Spinning**
   - Touch drag, mouse drag, scroll wheel, button click
   - Realistic physics with momentum and friction
   - Snaps to prompt on stop

2. **Prompt Display & Selection**
   - 20 prompts visible on wheel at once
   - Electricity effect triggers on selection (visual quality WIP)
   - Panel warp/disintegrate/reassemble animations

3. **New Topics**
   - Shuffles to random set of 20 prompts
   - Animation feedback

4. **Menu System**
   - Hamburger menu opens/closes with animation
   - Smoke poof effect
   - Menu panels with rope physics

5. **Steam Effects**
   - Ambient steam wisps around portal

6. **Navigation**
   - How to Play and My Stories buttons
   - View switching

### Partially Working

| Feature | What Works | What's Missing |
|---------|------------|----------------|
| Electricity Effects | WebGL pipeline, shaders, bolt generation | AAA visual refinement; iterative diff pipeline |
| Record View | Displays selected prompt, styled UI | Actual recording, waveform, save |
| My Stories | Styled container | Data layer, list of stories |
| How to Play | Basic text | Full instructional content |

### Not Working / Not Started

- Audio recording
- Story playback
- Consent flow
- Pass/accept mechanics
- Topic friction (honor system)
- Offline mode (PWA)
- All content screens (Our Story, Our Work, Privacy, Booking)
- GA4 analytics

---

## 6. Electricity Effects — Detail

### What Exists

| Component | Status | Description |
|-----------|--------|-------------|
| `useElectricityEffect.ts` | ✅ Built | Multi-pass WebGL rendering hook |
| `shaders.ts` | ✅ Built | GLSL shaders: bolt, blur, plasma, composite |
| `boltGenerator.ts` | ✅ Built | Bolt path generation with branching |
| `noiseUtils.ts` | ✅ Built | SimplexNoise for organic variation |
| Visual diff pipeline | 🟡 Partial | `tools/ai/diff/` scripts exist but workflow incomplete |

### What's Missing for AAA Quality

1. **Iterative refinement pipeline** — Automated capture → compare → adjust loop
2. **Reference images** — Target visuals to compare against
3. **Tuning passes** — Bloom intensity, bolt density, color grading, timing
4. **Performance validation** — Confirm 60fps on target devices

### Related Tools (in `tools/ai/diff/`)

- `pipeline.mjs` — Orchestrates capture and analysis
- `run-analysis.mjs` — Runs image comparison
- `crop.mjs` — Crops to region of interest

**Script:** `pnpm iterate:electricity` — Intended for visual iteration but not fully operational.

---

## 7. Recommended Next Steps

### Immediate Priority

| Priority | Task | Rationale |
|----------|------|-----------|
| P0 | **Audio recording** | Core loop blocker |
| P0 | **Consent flow** | Required for any recording |
| P0 | **Add localforage** | Foundation for story storage |

### Short-Term (Complete MVP)

| Priority | Task |
|----------|------|
| P1 | Add PWA support (`vite-plugin-pwa`) |
| P1 | Implement pass/accept mechanics |
| P1 | Complete content screens |
| P2 | Finish electricity visual refinement |
| P2 | Add GA4 event tracking |

### Technical Health

- No critical tech debt
- Codebase is modular and maintainable
- ~5,633 lines of TypeScript across legacy module
- Good separation of concerns (hooks, effects, components, views)

---

## 8. Key Documents

| Document | Path | Purpose |
|----------|------|---------|
| App Specification | `docs/APP_SPECIFICATION.md` | Full product requirements |
| User Flows | `docs/USER_FLOWS.md` | Interaction patterns, state diagrams |
| Prompts Database | `docs/prompts.json` | 142 prompts with metadata |
| Dev Instructions | `CLAUDE.md` | Engineering workflow |

---

*This is a point-in-time snapshot. For live codebase state, consult the developer.*
