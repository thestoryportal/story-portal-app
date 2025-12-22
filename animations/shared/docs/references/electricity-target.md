# Electricity Effect — Target Specification

**Purpose:** Visual specification for the electricity portal effect  
**Location:** `animations/shared/docs/references/electricity-target.md`

---

## Visual Target

The electricity effect should appear when the "New Topics" button is clicked. It creates an arc of electrical energy around the portal ring.

### Reference Image

`animations/electricity-portal/references/465x465/with_effect.png`

---

## Visual Characteristics

### Color

| Zone | Color | Hex |
|------|-------|-----|
| Core | Bright white-yellow | #FFFFFF to #FFE080 |
| Inner glow | Amber | #FFB800 |
| Outer glow | Orange-amber | #FF8800 to transparent |
| Background | Dark (app background) | — |

### Intensity Gradient

```
Core (brightest) → Inner Glow → Outer Glow → Fade to background
     100%              70%          30%            0%
```

### Structure

- **Bolt paths:** Jagged, organic electrical arcs
- **Branching:** Occasional secondary branches from main bolts
- **Quantity:** 4-8 visible bolts at any moment
- **Width:** Core ~2-3px, glow extends 8-16px

### Animation

- **Duration:** ~1000-1500ms total
- **Pattern:** Bolts appear, flicker, fade
- **Frame rate:** 30-60fps (smooth)
- **Randomness:** Each frame slightly different (organic feel)

---

## Quality Criteria

### SSIM Thresholds

| Level | SSIM | Meaning |
|-------|------|---------|
| Fail | < 70% | Major issues, not recognizable |
| Pass | ≥ 85% | Acceptable, needs polish |
| Good | ≥ 90% | Target quality |
| Excellent | ≥ 95% | Exceeds expectations |

### Visual Checklist

- [ ] Core is bright white/yellow (not gray or washed out)
- [ ] Glow has amber/orange hue (not pure white or blue)
- [ ] Bolts have jagged, organic paths (not straight lines)
- [ ] Animation is smooth (not choppy)
- [ ] Effect is contained within portal ring area
- [ ] Brightness matches reference intensity

---

## Common Issues

### Too Dim

- Core intensity too low
- Glow radius too small
- Alpha blending reducing brightness

**Adjust:** Increase `CORE_INTENSITY`, `GLOW_INTENSITY` in shaders.ts

### Wrong Color

- Hue shifted toward blue or red
- Saturation too low (grayish)
- Wrong color values in shader

**Adjust:** Check `BOLT_COLOR` values match target hex

### Too Few Bolts

- `BOLT_COUNT` too low
- Bolts fading too quickly
- Timing window missing peak

**Adjust:** Increase bolt count, check animation timing

### Bolts Too Straight

- Segment length too long
- Jitter too low
- Not enough path variation

**Adjust:** Reduce `SEGMENT_LENGTH`, increase `JITTER` in boltGenerator.ts

### Static (No Animation)

- Animation loop not running
- Frame capture too slow
- Effect duration too short

**Adjust:** Check animation speed, capture timing

---

## Code Targets

### Primary Files

| File | Controls |
|------|----------|
| `src/legacy/effects/shaders.ts` | Color, intensity, glow |
| `src/legacy/effects/boltGenerator.ts` | Bolt paths, branching |
| `src/legacy/effects/useElectricityEffect.ts` | Animation, lifecycle |

### Key Parameters

```typescript
// shaders.ts
const CORE_INTENSITY = 1.2;    // Core brightness (0.8-1.5)
const GLOW_INTENSITY = 0.5;    // Outer glow (0.3-0.8)
const BLUR_RADIUS = 8;         // Glow spread (4-16)
const BOLT_COLOR = [1.0, 0.72, 0.0];  // RGB (amber)

// boltGenerator.ts
const BOLT_WIDTH = 2.0;        // Line thickness (1.5-3.0)
const BRANCH_PROBABILITY = 0.2; // Branching (0.1-0.4)
const SEGMENT_LENGTH = 12;     // Path segments (8-20)
const JITTER = 5;              // Randomness (2-8)

// useElectricityEffect.ts
const BOLT_COUNT = 6;          // Simultaneous bolts (4-12)
const ANIMATION_FPS = 60;      // Update rate
const FADE_DURATION = 300;     // Fade out (200-500ms)
```

---

## Iteration Strategy

### Priority Order

1. **Visibility first** — Make sure effect appears in captures
2. **Color second** — Match amber/yellow palette
3. **Intensity third** — Match brightness levels
4. **Structure fourth** — Fine-tune bolt paths
5. **Animation fifth** — Polish timing and smoothness

### One Change Per Iteration

Don't change multiple parameters at once. Isolate each change to understand its impact.

### Small Adjustments

Change by 10-20% increments, not 50%+. Large changes make it hard to converge.

---

## Success Criteria

The effect is complete when:

1. SSIM ≥ 90% (or human approves at lower threshold)
2. Visual checklist passes
3. Animation is smooth in captured GIF
4. Effect triggers reliably
