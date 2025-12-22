# Animation System — Claude Skill

**Purpose:** Guide design and implementation of all animations across The Story Portal  
**References:** `docs/APP_SPECIFICATION.md` §6, `docs/UX_DESIGN_AUDIT.md`

---

## Overview

Animations in The Story Portal serve the "ritual over efficiency" principle. They create meaningful moments, not just smooth transitions. The steampunk aesthetic demands weight and mechanical feel.

---

## Design Status

**Status:** 🟡 Partial (some complete, key animations missing)

**Design session:** `docs/sessions/session-animation-system.md`

---

## Animation Inventory

### ✅ Complete

| Animation | Type | Implementation | Notes |
|-----------|------|----------------|-------|
| **Wheel Physics** | Ritual | `useWheelPhysics.ts` | 60fps, momentum, friction, snap-to-prompt |
| **Steam Wisps** | Ambient | `SteamWisps.tsx` | Particle system, CSS animations |
| **Menu Open/Close** | Transition | `useMenuState.ts` | Blur backdrop, panel entrance |
| **Menu Smoke Poof** | Feedback | `SmokeEffect.tsx` | Triggers on open |

### 🟡 In Progress

| Animation | Type | Status | Notes |
|-----------|------|--------|-------|
| **Electricity Effect** | Ritual | WebGL pipeline built | AAA quality iteration in progress |

### ⚫ Not Started

| Animation | Type | Priority | Notes |
|-----------|------|----------|-------|
| **Topic Reveal** | Ritual | Critical | Fire poof lifts topic toward user |
| **Modal Transitions** | Transition | High | Content window open/close |
| **Button Feedback** | Feedback | Medium | Press states, ripples |
| **Recording States** | Transition | High | Active/paused/stopped |
| **Hint Cycling** | Ambient | Medium | Fade in/out of hints |
| **Save Progress** | Feedback | Medium | Saving indicator |

### ⛔ Deprecated

| Animation | Reason |
|-----------|--------|
| **WarpMotionLines** | Incomplete implementation |
| **DisintegrationParticles** | Incomplete implementation |

---

## Animation Categories

### Ambient (Always Running)
- Low CPU impact
- Create atmosphere without demanding attention
- Examples: Steam wisps, subtle gear rotation

### Ritual (Key Moments)
- Mark important transitions
- Substantial, memorable
- Create "pause for meaning"
- Examples: Wheel spin/stop, Topic Reveal, Story saved

### Transition (State Changes)
- Smooth state changes
- Maintain context during change
- Examples: Modal open/close, screen transitions

### Feedback (Micro-interactions)
- Immediate response to user action
- Confirm input was received
- Examples: Button press, toggle change

---

## Topic Reveal Animation (Critical)

### Concept
When wheel stops on a topic, fire poof lifts the topic panel off the wheel and propels it toward the user.

### Sequence
```
1. Wheel lands on topic (existing snap animation)
2. Brief pause (build anticipation)
3. Fire poof ignites behind/around panel
4. Panel lifts off wheel surface
5. Panel zooms toward user (grows larger)
6. Panel settles in contemplation position
7. Fire dissipates, embers fade
```

### Design Questions (TBD)
```
Fire origin point: [TBD - behind panel / portal ring / center]
Fire visual style: [TBD - amber flames / brass sparks / steam burst]
Smoke/ember trail: [TBD - yes/no, style]
Panel trajectory: [TBD - straight zoom / slight arc]
Panel final position: [TBD - center / upper third]
Panel final size: [TBD - % of viewport]
Total duration: [TBD - 600-1000ms suggested]
Sound design: [TBD - whoosh / crackle / mechanical]
```

### Post-Reveal State
```
Prompt display: [TBD]
Wheel visibility: [TBD - dimmed / hidden / visible]
Button entrance: [TBD - fade in / slide in]
```

---

## Timing Standards (To Be Defined)

### Proposed Scale

| Category | Duration | Easing | Use Case |
|----------|----------|--------|----------|
| **Instant** | 100ms | ease-out | Hover states, micro-feedback |
| **Fast** | 150-200ms | ease-out | Button press, toggles |
| **Standard** | 300-400ms | ease-in-out | Modal open/close, screen transitions |
| **Deliberate** | 500-600ms | ease-out | State changes, loading completion |
| **Ritual** | 800-1200ms | custom | Topic Reveal, wheel spin complete |

### Easing Functions
```css
/* Standard ease */
transition-timing-function: ease-in-out;

/* Snappy response */
transition-timing-function: cubic-bezier(0.2, 0, 0, 1);

/* Bounce/spring */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Mechanical/weighted */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Technical Implementation

### CSS Animations
**Best for:**
- Transforms (translate, scale, rotate)
- Opacity fades
- Simple state transitions
- Color changes

```css
.modal-enter {
  animation: modalEnter 300ms ease-out forwards;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### JavaScript + requestAnimationFrame
**Best for:**
- Coordinated multi-element animations
- Physics-based movement
- Complex sequencing
- Interactive animations

```typescript
function animate(timestamp) {
  // Update positions
  // Render
  requestAnimationFrame(animate);
}
```

### Canvas 2D
**Best for:**
- Particle effects
- Custom graphics
- High element counts

```typescript
// Steam wisps, fire particles, embers
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();
```

### WebGL
**Best for:**
- Complex shaders
- High-performance effects
- GPU-intensive visuals

```typescript
// Electricity effect uses WebGL
// Only for effects that truly need it
```

---

## Performance Requirements

### Targets
- 60fps on iPhone X / Samsung Galaxy S9 (2017-2018)
- No jank during wheel spin
- Recording unaffected by animations

### Optimization Strategies
- Use `transform` and `opacity` (GPU-accelerated)
- Avoid `width`, `height`, `top`, `left` animations
- Use `will-change` sparingly and deliberately
- Pause/reduce ambient animations during recording

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

For reduced motion users:
- Disable ambient animations (steam, electricity)
- Replace ritual animations with instant state changes
- Keep essential feedback (button press)

---

## Design Decisions (To Be Filled After Session)

### Topic Reveal
```
Fire style: [TBD]
Fire origin: [TBD]
Trajectory: [TBD]
Duration: [TBD]
Post-reveal layout: [TBD]
```

### Modal Transitions
```
Open animation: [TBD]
Close animation: [TBD]
Duration: [TBD]
Backdrop fade: [TBD]
```

### Button Feedback
```
Press animation: [TBD]
Duration: [TBD]
Scale/color change: [TBD]
```

### Recording States
```
Active indicator: [TBD]
Paused transition: [TBD]
Warning pulse: [TBD]
```

---

## Implementation Notes

### Animation Hook Pattern
```typescript
function useAnimation(config) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const start = useCallback(() => {
    setIsAnimating(true);
    // Run animation
    // Call onComplete when done
  }, []);
  
  return { isAnimating, start };
}
```

### Components to Create/Update
- `TopicReveal.tsx` — Fire poof animation
- Update Modal components with enter/exit animations
- `AnimatedButton.tsx` — Button with press feedback
- Update `RecordingView` with state transitions

---

## References

- `docs/APP_SPECIFICATION.md` §6 (Ritual over efficiency)
- `docs/UX_DESIGN_AUDIT.md` (Animation inventory)
- `docs/sessions/session-animation-system.md` (Design session)
- Existing implementations:
  - `src/legacy/hooks/useWheelPhysics.ts`
  - `src/legacy/components/SteamWisps.tsx`
  - `src/legacy/effects/useElectricityEffect.ts`
