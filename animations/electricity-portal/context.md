# AAA Video Game Quality Animations - Development Context

> **Purpose**: Persistent context document for electricity/portal animation development.
> **Last Updated**: 2025-12-23
> **Status**: Iteration Pipeline Ready

---

## Project Goal

Create a professional-grade **golden/amber plasma electricity effect** for the Story Portal wheel that matches AAA game visual quality.

---

## Technology Stack (Decided)

| Library | Purpose | Install |
|---------|---------|---------|
| `three` | Core WebGL rendering | `pnpm add three` |
| `@react-three/fiber` | React integration | `pnpm add @react-three/fiber` |
| `@react-three/drei` | Utilities | `pnpm add @react-three/drei` |
| `@react-three/postprocessing` | Bloom, tone mapping | `pnpm add @react-three/postprocessing` |
| `simplex-noise` | Procedural lightning | `pnpm add simplex-noise` |

**Deprecated Approaches:**
- Canvas 2D (insufficient glow/bloom quality)
- Raw WebGL without Three.js (unnecessary complexity)

---

## Visual Specification

### Color Palette (NOT white lightning)

| Element | Color | Hex | RGB |
|---------|-------|-----|-----|
| Core (white-hot) | Cream/pale gold | `#FFF5C8` | 255, 245, 200 |
| Inner glow | Warm gold | `#FFD27A` | 255, 210, 122 |
| Outer bloom | Deep amber | `#FF9A2A` | 255, 154, 42 |
| Atmospheric haze | Dark amber | `#A45A10` | 164, 90, 16 |

### Structural Requirements

- **Tendrils**: 8-14 radial lightning bolts from center
- **Branching**: 2-4 secondary branches per tendril
- **Containment**: Circular mask at portal ring boundary
- **Layering**: Transparent overlay (wheel visible behind)

### Animation Parameters

- **Flicker rate**: 50-80ms per frame
- **Temporal coherence**: Smooth evolution, no teleporting
- **Behavior**: Tendrils grow/shrink organically

### Rendering Stack

- ACES filmic tone mapping
- Multi-layer bloom (tight core + diffuse outer)
- Additive blending for glow accumulation
- Stencil-based circular masking

---

## Architecture

```
src/components/effects/
├── ElectricityPortal/
│   ├── index.tsx              # Main component export
│   ├── LightningRenderer.tsx  # Three.js lightning geometry
│   ├── TendrilGenerator.ts    # Simplex-noise path generation
│   ├── shaders/
│   │   ├── lightning.vert     # Vertex shader
│   │   └── lightning.frag     # Fragment shader (color gradient)
│   └── constants.ts           # Color palette, timing values
```

---

## Acceptance Criteria

- [ ] Golden/amber color palette (no white bolts)
- [ ] 8-14 animated radial tendrils with branches
- [ ] Proper bloom glow effect (not flat/cartoon)
- [ ] Temporal coherence in animation
- [ ] Circular masking (no bloom leakage)
- [ ] Transparent background (wheel visible)
- [ ] Diffused plasma atmosphere
- [ ] 60fps on modern devices

---

## Known Issues from Previous Attempts

| Issue | Root Cause | Solution |
|-------|------------|----------|
| Cartoon appearance | Canvas 2D limitations | Use WebGL + bloom |
| White bolts | Wrong color values | Apply palette above |
| Black background | Canvas fill | Use transparent WebGL |
| Missing plasma | No atmospheric layer | Add diffuse haze layer |
| Bloom leakage | No masking | Stencil buffer clipping |

---

## Open Decisions

1. **Integration**: Overlay vs replace existing wheel renderer?
2. **Performance**: Target devices and frame rate budget?
3. **Activation**: Always on vs triggered on spin?
4. **Fallback**: Graceful degradation strategy?

---

## Reference Assets

### Reference Files

| File | Purpose |
|------|---------|
| `electricity_animation_effect_static_diff_analysis.png` | Static SSIM reference (465×465) |
| `electricity_animation_effect_reference_original.apng` | Original animation source (25MB, archived) |
| `electricity_animation_effect_diff_analysis.apng` | Aligned animation for SSIM comparison |
| `electricity_animation_effect_off_baseline.png` | Baseline (effect off) for mask generation |
| `electricity_animation_effect_diff_analysis_mask.png` | Mask (319×317 ellipse) |

**Source:** AI-generated using Sora/Luma from visual specification prompt (2025-12-22).

**Mask Spec:** White ellipse on black, center (232.5, 232.5), radii (159.5, 158.5)

### Sora Alignment (Calibrated 2025-12-23)

The Sora reference frames are resized to fit within the mask:

| Parameter | Value |
|-----------|-------|
| Resize | 452×463 |
| Offset X | 5px |
| Offset Y | 1px |
| Canvas | 465×465 |
| Output | `electricity_animation_effect_diff_analysis.apng` |

**Alignment Script:** (archived)

### Legacy References (Preserved)

| File | Purpose |
|------|---------|
| `with_effect.png` | Original hand-crafted static reference |
| `reference_animation.apng` | Original animation reference |

### Generation Context

The Sora reference was generated using this visual specification:
- Golden/amber plasma electricity effect inside steampunk portal ring
- 8-14 jagged radial lightning tendrils
- Bright white-gold cores (#FFF5C8) fading to amber (#FFD27A) to deep amber (#FF9A2A)
- Multi-layer bloom with tight core + diffuse outer glow
- Pulsing/flickering animation at 50-80ms per frame
- Effect contained within 465×465 circular portal area

---

## Dataset References

- Primary conversation: `game-quality-animations-libraries-6940c2fc.md` (200 messages)
- Search terms: "electricity", "animation", "game quality", "bloom"
- Dataset location: `tools/ai/history/datasets/`

---

## Quick Start (Next Session)

```bash
# Install dependencies
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing simplex-noise

# Reference this file
cat docs/aaa-animation-context.md
```

---

*This document serves as persistent context for AI-assisted development sessions.*
