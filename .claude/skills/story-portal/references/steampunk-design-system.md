# Steampunk Design System — Claude Skill

**Purpose:** Verified visual design reference for The Story Portal  
**Source:** Design Implementation Audit (2025-12-22)  
**Status:** Extracted from codebase — all values verified

---

## Color System

### Core Palette

| Token | Hex | RGB | Usage | Source |
|-------|-----|-----|-------|--------|
| `--background-primary` | `#0a0705` | `10, 7, 5` | Body background | base.css:1 |
| `--text-primary` | `#f5deb3` | `245, 222, 179` | Body text (wheat) | base.css:2 |
| `--text-panel` | `#f4e4c8` | `244, 228, 200` | Wheel panel text | wheel.css:192 |
| `--text-button` | `#e8dcc8` | `232, 220, 200` | Button labels | buttons.css:85 |

### Golden/Amber Accent Colors (Electricity)

| Token | Hex | RGB Normalized | Usage | Source |
|-------|-----|----------------|-------|--------|
| `--accent-core` | `#ffb836` | `1.0, 0.72, 0.21` | Electricity core | config.ts:69 |
| `--accent-mid` | `#ff9100` | `1.0, 0.57, 0.0` | Electricity mid | config.ts:70 |
| `--accent-outer` | — | `0.9, 0.4, 0.0` | Electricity outer | config.ts:71 |
| `--plasma-inner` | — | `1.0, 0.65, 0.15` | Plasma inner | config.ts:72 |
| `--plasma-outer` | — | `0.8, 0.35, 0.0` | Plasma outer | config.ts:73 |
| `--ambient-glow` | — | `1.0, 0.6, 0.1` | Center glow | useElectricityEffect.ts:493 |

### Bronze/Border Colors

| Token | Hex | Usage | Source |
|-------|-----|-------|--------|
| `--border-bronze` | `#8B6F47` | Container borders | RecordView.tsx:33 |
| `--border-bronze-alt` | `#a88545` | Tooltip border | buttons.css:188 |

### Text Effect Gradient Colors

| Token | Hex | Usage | Source |
|-------|-----|-------|--------|
| `--text-face-top` | `#f2dfc0` | Text gradient top | config.ts:153 |
| `--text-face-mid` | `#e3bf7d` | Text gradient mid | config.ts:154 |
| `--text-face-bottom` | `#f18741` | Text gradient bottom | config.ts:155 |
| `--text-highlight-top` | `#e8d4b8` | Highlight top | config.ts:159 |
| `--text-highlight-mid` | `#d4b892` | Highlight mid | config.ts:161 |
| `--text-highlight-bottom` | `#8b7355` | Highlight bottom | config.ts:163 |
| `--text-shadow` | `#1a1008` | Text shadow | config.ts:169 |
| `--text-stroke` | `#523e21` | Outer stroke | config.ts:173 |

### Hamburger Menu Gradient Colors

| Offset | Hex | Source |
|--------|-----|--------|
| 0% | `#4a3520` | HamburgerMenu.tsx:166 |
| 15% | `#6a4a28` | HamburgerMenu.tsx:167 |
| 30% | `#8a6535` | HamburgerMenu.tsx:168 |
| 50% | `#b8863c` | HamburgerMenu.tsx:169 |
| 70% | `#d4a045` | HamburgerMenu.tsx:170 |
| 85% | `#c89038` | HamburgerMenu.tsx:171 |
| 100% | `#a87030` | HamburgerMenu.tsx:172 |

### SVG Bronze Gradient (index.html)

27-stop gradient from `#faf0b0` (0%) to `#5c3c04` (100%)  
See: index.html:25-53

### Smoke/Steam Colors

| Element | Color | Source |
|---------|-------|--------|
| Main cloud center | `rgba(140,120,100,0.95)` | SmokeEffect.tsx:29 |
| Main cloud 25% | `rgba(120,100,80,0.8)` | SmokeEffect.tsx:29 |
| Main cloud 50% | `rgba(100,80,60,0.5)` | SmokeEffect.tsx:29 |
| Main cloud 75% | `rgba(80,60,40,0.2)` | SmokeEffect.tsx:29 |
| Inner flash | `rgba(255,240,200,0.7)` | SmokeEffect.tsx:104 |

### Overlay/Shadow Colors

| Usage | Color | Source |
|-------|-------|--------|
| Menu backdrop | `rgba(0,0,0,0.7)` | menu.css:8 |
| Container bg | `rgba(0,0,0,0.8)` | RecordView.tsx:30 |
| Wheel depth | `rgba(0,0,0,0.3)` | wheel.css:108 |
| Panel bg | `rgba(0,0,0,0.1)` | wheel.css:193 |
| Panel border | `rgba(200,160,100,0.12)` | wheel.css:201 |

---

## Typography

### Font Families

| Token | Font | Fallback | Usage | Source |
|-------|------|----------|-------|--------|
| `--font-display` | `Carnivalee Freakshow` | `serif` | Wheel panels, menu, carved text | fonts.css, wheel.css:185 |
| `--font-ui` | `Molly Sans` | `sans-serif` | Buttons, navigation | fonts.css, buttons.css:86 |
| `--font-icon` | `Material Symbols Outlined` | — | Icons | index.html:7 |

### Font Loading

```css
/* fonts.css - Base64 embedded woff2 */
@font-face {
  font-family: 'Carnivalee Freakshow';
  src: url(data:font/woff2;base64,...) format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Molly Sans';
  src: url(data:font/woff2;base64,...) format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

### Icon Font Configuration

```css
/* Material Symbols */
font-variation-settings: 'FILL' 1, 'wght' 700;
```

### Font Sizes

| Size | Usage | Source |
|------|-------|--------|
| `14px` | Min wheel panel font | useWheelPhysics.ts:319 |
| `16px` | Body text, default | useWheelPhysics.ts:33 |
| `18px` | Buttons | RecordView.tsx:88 |
| `20px` | Prompts | RecordView.tsx:60 |
| `22px` | NavButton text | NavButtons.tsx:207 |
| `26px` | NavButton icon | NavButtons.tsx:193 |
| `28px` | Max wheel panel font | useWheelPhysics.ts:319 |
| `32px` | Menu panels, headings | MenuPanelItem.tsx:96, RecordView.tsx:39 |

### Dynamic Font Sizing (Wheel)

```typescript
// useWheelPhysics.ts:318-319
const calculatedFontSize = boundedPanelHeight * 0.42;
const boundedFontSize = Math.min(Math.max(calculatedFontSize, 14), 28);
```

### Font Weights

| Weight | Usage | Source |
|--------|-------|--------|
| `normal` | Default | fonts.css |
| `bold` | Prompts, buttons | RecordView.tsx:61, 87 |
| `700` | Material Symbols | NavButtons.tsx:195 |

### Line Heights

| Value | Usage | Source |
|-------|-------|--------|
| `1.6` | Body text | RecordView.tsx:74, StoriesView.tsx:51 |

### Letter Spacing

| Value | Usage | Source |
|-------|-------|--------|
| `0.5px` | Button labels | buttons.css:88 |
| `1` | NavButton text | NavButtons.tsx:208 |

### Text Transform

| Value | Usage | Source |
|-------|-------|--------|
| `uppercase` | Button labels | buttons.css:89 |

### Text Shadows

| Value | Usage | Source |
|-------|-------|--------|
| `0 1px 0 rgba(255,240,220,0.4), 0 2px 4px rgba(0,0,0,0.8)` | Wheel panels | wheel.css:225-226 |
| `0 1px 2px rgba(0, 0, 0, 0.35)` | Button labels | buttons.css:91 |
| `2px 2px 4px #000` | Headings | RecordView.tsx:42 |

---

## Spacing System

### Verified Spacing Values

| Value | Usage | Source |
|-------|-------|--------|
| `40px` | Container padding | RecordView.tsx:21, 31 |
| `32px` | Section margins | RecordView.tsx:53, 84 |
| `24px` | Element margins | RecordView.tsx:40 |
| `20px` | Inner padding | RecordView.tsx:51 |
| `16px` | Button padding (vertical) | RecordView.tsx:84 |
| `15px` | Component gaps | NavButtons.tsx:324 |
| `12px` | Inline spacing | MenuPanelItem.tsx:94 |

**Note:** Spacing is currently ad-hoc. No formal spacing scale exists.

---

## Component Dimensions

### Fixed Sizes

| Component | Width | Height | Source |
|-----------|-------|--------|--------|
| NavButton | `280px` | `56px` | NavButtons.tsx:109-110 |
| HamburgerMenu | `80px` | `80px` | HamburgerMenu.tsx:119-120 |
| Menu Panel | `250px` | `80px` | MenuPanelItem.tsx:83-84 |
| Smoke Cloud | `350px` | `350px` | SmokeEffect.tsx:25-26 |

### Max Widths

| Component | Value | Source |
|-----------|-------|--------|
| RecordView | `600px` | RecordView.tsx:29 |
| StoriesView | `800px` | StoriesView.tsx:28 |

### Wheel Geometry

| Property | Default | Min | Max | Source |
|----------|---------|-----|-----|--------|
| Cylinder radius | `110px` | `130px` | `320px` | useWheelPhysics.ts:31, 309 |
| Panel height | `41px` | `36px` | `110px` | useWheelPhysics.ts:32, 314 |
| Panel angle | `18°` | — | — | useWheelPhysics.ts:130 |
| Wheel tilt | `12°` | `14°` | `20°` | useWheelPhysics.ts:34, 323 |

### Dynamic Sizing Formulas

```typescript
// useWheelPhysics.ts:303-324
const wheelSize = container.offsetWidth;
const radius = Math.min(Math.max(wheelSize * 0.32, 130), 320);
const panelHeight = Math.min(Math.max(radius * 0.34, 36), 110);
const fontSize = Math.min(Math.max(panelHeight * 0.42, 14), 28);
const tilt = wheelSize < 400 ? 14 : wheelSize < 600 ? 17 : 20;
```

---

## Border Radius

| Value | Usage | Source |
|-------|-------|--------|
| `50%` | Circular elements (spin button, smoke) | buttons.css:9, SmokeEffect.tsx:27 |
| `12px` | Large containers | RecordView.tsx:32 |
| `8px` | Medium elements (prompts, buttons) | RecordView.tsx:52, 86 |
| `4px` | Small elements (menu panels) | MenuPanelItem.tsx:86 |
| `2.5px` | Tiny (rope connectors) | MenuPanelItem.tsx:55 |

---

## Borders

| Style | Usage | Source |
|-------|-------|--------|
| `1px solid rgba(200,160,100,0.12)` | Panel top/bottom | wheel.css:201-202 |
| `2px solid #a88545` | Tooltip | buttons.css:188 |
| `2px solid #8B6F47` | Prompt container | RecordView.tsx:55 |
| `3px solid #8B6F47` | Main container, buttons | RecordView.tsx:33, 90 |

---

## Shadows

### Box Shadows

#### Portal Inner Shadow
```css
/* wheel.css:132-137 */
box-shadow:
  inset 0 0 35px 25px rgba(0,0,0,0.5),
  inset 0 0 70px 40px rgba(0,0,0,0.25),
  inset 0 0 100px 55px rgba(0,0,0,0.15),
  inset 0 0 140px 70px rgba(0,0,0,0.08);
```

#### Wheel Inner Depth
```css
/* wheel.css:148-152 */
box-shadow:
  inset 0 0 90px 70px rgba(0,0,0,0.4),
  inset 0 0 60px 45px rgba(0,0,0,0.35),
  inset 0 0 35px 25px rgba(0,0,0,0.2);
```

#### Wheel Panel
```css
/* wheel.css:205-207 */
box-shadow:
  inset 0 0 15px rgba(30,20,10,0.35),
  0 2px 8px rgba(139,69,19,0.35);
```

#### Menu Panel
```typescript
// MenuPanelItem.tsx:87-89
boxShadow: isOpen
  ? '0 15px 40px rgba(0,0,0,0.5), inset 0 0 12px rgba(0,0,0,0.6)'
  : '0 2px 10px rgba(0,0,0,0.3), inset 0 0 12px rgba(0,0,0,0.6)'
```

### Drop Shadows (Filter)

```typescript
// LegacyApp.tsx:49-57
const BUTTON_SHADOW_CONFIG = {
  enabled: true,
  offsetX: -5,
  offsetY: 6,
  blur: 17,
  layers: 4,
  layerMult: 1.5,
  opacity: 0.6,
};
// Generates: drop-shadow(-5px 6px 17px rgba(0,0,0,0.6)) ...

// NavButtons.tsx:92-93 (pressed)
filter: 'drop-shadow(-5px 4px 12px rgba(0,0,0,0.4))'
```

### Blur Filters

| Value | Usage | Source |
|-------|-------|--------|
| `blur(4px)` | Menu backdrop | menu.css:9 |
| `blur(6px)` | Smoke inner flash | SmokeEffect.tsx:108 |
| `blur(7px)` | Smoke wisp 2 | SmokeEffect.tsx:71 |
| `blur(8px)` | Smoke wisp 1 | SmokeEffect.tsx:52 |
| `blur(10px)` | Smoke wisp 3 | SmokeEffect.tsx:90 |
| `blur(12px)` | Smoke main cloud | SmokeEffect.tsx:33 |
| `blur(14px)` | Smoke linger right | SmokeEffect.tsx:147 |
| `blur(15px)` | Smoke linger left | SmokeEffect.tsx:127 |
| `blur(18px)` | Smoke linger up | SmokeEffect.tsx:165 |

---

## Transforms & 3D

### Perspective

| Value | Usage | Source |
|-------|-------|--------|
| `700px` | Wheel viewport | wheel.css:67 |
| `1000px` | Menu panels | MenuPanelItem.tsx:78 |

### Transform Style

| Value | Usage | Source |
|-------|-------|--------|
| `preserve-3d` | Wheel cylinder, viewport, wrapper | wheel.css:53, 66, LegacyApp.tsx:313 |
| `preserve-3d` | Menu panels | MenuPanelItem.tsx:81 |

### Backface Visibility

| Value | Usage | Source |
|-------|-------|--------|
| `hidden` | Wheel panels | wheel.css:190 |

### Common Transforms

```typescript
// Wheel rotation (dynamic)
transform: `rotateX(${wheelTilt}deg)`  // LegacyApp.tsx:312

// Panel positioning
transform: rotateX(calc(var(--panel-angle))) translateZ(var(--radius))  // wheel.css:179

// Button press
transform: pressed ? 'translateY(2px)' : 'translateY(0)'  // NavButtons.tsx:111

// Menu panel
transform: isOpen
  ? 'translate(-50%, -50%) perspective(1000px) rotateX(0deg)'
  : 'translate(-50%, -50%) perspective(1000px) rotateX(-360deg)'
// MenuPanelItem.tsx:77-79
```

---

## Animation System

### Timing Patterns

| Pattern | Duration | Easing | Usage |
|---------|----------|--------|-------|
| Fast UI | `0.15-0.25s` | `ease-in-out` | Button presses, toggles |
| Medium | `0.5-0.75s` | `ease-out` | Gear spin, panel transforms |
| Slow/Atmospheric | `1.0-3.5s` | `ease-out` | Smoke, steam effects |
| Physics | `0.7s` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Menu unfold |

### Primary Easing Function

```css
cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

### Animation Durations

| Animation | Duration | Source |
|-----------|----------|--------|
| Gear spin | `0.75s` | HamburgerMenu.tsx:141 |
| Smoke poof (main) | `1.0s` | SmokeEffect.tsx:30 |
| Smoke poof (flash) | `0.5s` | SmokeEffect.tsx:105 |
| Smoke wisp 1 | `1.4s` | SmokeEffect.tsx:48 |
| Smoke wisp 2 | `1.3s` | SmokeEffect.tsx:67 |
| Smoke wisp 3 | `1.5s` | SmokeEffect.tsx:86 |
| Smoke linger left | `3.0s` | SmokeEffect.tsx:124 |
| Smoke linger right | `3.2s` | SmokeEffect.tsx:143 |
| Smoke linger up | `3.5s` | SmokeEffect.tsx:162 |
| Menu panel push/sway | `2.5s` | MenuPanelItem.tsx:63-65 |

### Phase Durations (JavaScript, ms)

| Phase | Duration | Source |
|-------|----------|--------|
| Warp | `600` | useAnimationPhase.ts:82 |
| Hold | `3000` | useAnimationPhase.ts:87 |
| Disintegrate | `3000` | useAnimationPhase.ts:93 |
| Reassemble | `1500` | useAnimationPhase.ts:101 |

### Menu Animation Timing (ms)

| Delay | Purpose | Source |
|-------|---------|--------|
| `150` | Phase 1→2 | useMenuState.ts:63 |
| `200` | Phase 2→3 | useMenuState.ts:67 |
| `200` | Phase 3→4 | useMenuState.ts:71 |
| `150` | Phase 4→5 | useMenuState.ts:78 |
| `400` | Logo show | useMenuState.ts:82 |
| `650` | Smoke (open) | useMenuState.ts:92 |
| `1150` | Smoke (close) | useMenuState.ts:128 |
| `3500` | Smoke visible | useMenuState.ts:96 |

### Steam Effect Timing (ms)

| Value | Purpose | Source |
|-------|---------|--------|
| `3800-5800` | Wisp duration range | useSteamEffect.ts:27 |
| `100` | Initial spawn interval | useSteamEffect.ts:60 |
| `120-350` | Random spawn interval | useSteamEffect.ts:68 |
| `3000` | Start continuous spawning | useSteamEffect.ts:73 |

### Keyframe Animations (animations.css)

```css
@keyframes steamStream { /* 0% → 100%: translate + scale + opacity */ }
@keyframes steamStreamDrift { /* drift right */ }
@keyframes steamStreamDriftLeft { /* drift left */ }
@keyframes smokePoof { /* main cloud expansion */ }
@keyframes smokeWisp1 { /* left wisp */ }
@keyframes smokeWisp2 { /* right wisp */ }
@keyframes smokeWisp3 { /* up wisp */ }
@keyframes smokeLingerLeft { /* slow left drift */ }
@keyframes smokeLingerRight { /* slow right drift */ }
@keyframes smokeLingerUp { /* slow upward drift */ }
@keyframes gearSpinClockwise { /* 0° → 120° */ }
@keyframes gearSpinCounterClockwise { /* 120° → 0° */ }
@keyframes menuPanelPush { /* bounce effect */ }
@keyframes menuPanelSway { /* gentle sway */ }
```

---

## Physics Values

### Wheel Physics (useWheelPhysics.ts)

| Value | Variable | Purpose | Source |
|-------|----------|---------|--------|
| `0.985` | spinFrictionRef | Friction coefficient | :43 |
| `0.982-0.988` | — | Random friction range | :233, 287 |
| `0.5` | — | Test mode friction | :97 |
| `1.5` | — | Velocity threshold | :89 |
| `2` | — | Min velocity for coast | :81 |
| `100` | maxVelocity | Velocity cap | :248 |
| `18` | promptInterval | Degrees per prompt | :130 |
| `0.5` | — | Input velocity multiplier | :238 |
| `0.85` | — | Same direction momentum | :242 |
| `0.7` | — | Opposite direction decay | :244 |
| `40-75` | — | Button spin velocity range | :290 |
| `0.08` | — | Easing speed | :152 |
| `150` | — | Coast detection (ms) | :78 |
| `200` | — | Min time for selection (ms) | :175 |

### Electricity Animation (config.ts)

| Value | Variable | Purpose | Source |
|-------|----------|---------|--------|
| `2.0-4.0` | boltSpeedMin/Max | Bolt animation | :26-27 |
| `5.0-10.0` | jitterSpeedMin/Max | Jitter animation | :28-29 |
| `0.25` | microFlickerAmount | Per-frame variation | :30 |
| `0.08` | boltFadeInSpeed | Fade in | :33 |
| `0.05` | boltFadeOutSpeed | Fade out | :34 |
| `0.3-1.2` | boltOnDuration (s) | Visible time | :35-36 |
| `0.1-0.6` | boltOffDuration (s) | Hidden time | :37-38 |
| `3.0` | surgeCycleDuration (s) | Full cycle | :41 |
| `0.4` | surgeBuildPhase | Build (0-40%) | :42 |
| `0.6` | surgePeakPhase | Peak (40-60%) | :43 |
| `2.0` | centerPulseFrequency (Hz) | Pulse rate | :50 |
| `0.2` | centerPulseAmount | Pulse variation | :51 |

---

## Z-Index Stacking Order

| Z-Index | Component | Purpose | Source |
|---------|-----------|---------|--------|
| `3` | NavButton SVG | Above base | NavButtons.tsx:122 |
| `1000` | HamburgerMenu | Top-level control | HamburgerMenu.tsx:122 |
| `1003` | Smoke linger clouds | Below wisps | SmokeEffect.tsx:126 |
| `1004` | Smoke inner flash | Below main | SmokeEffect.tsx:107 |
| `1004-index` | Menu panels | Stacked panels | MenuPanelItem.tsx:109 |
| `1005` | Smoke main cloud | Above panels | SmokeEffect.tsx:32 |
| `1006` | Smoke wisps | Top smoke | SmokeEffect.tsx:51 |

---

## Responsive Breakpoints

| Breakpoint | Range | Wheel Viewport | Source |
|------------|-------|----------------|--------|
| Small | `≤480px` | `80%` | responsive.css |
| Medium | `481-768px` | `75%` | responsive.css |
| Large | `≥1024px` | `66%` | responsive.css |

### Responsive Wheel Tilt

| Screen Width | Tilt | Source |
|--------------|------|--------|
| `<400px` | `14°` | useWheelPhysics.ts:323 |
| `400-600px` | `17°` | useWheelPhysics.ts:323 |
| `>600px` | `20°` | useWheelPhysics.ts:323 |

---

## WebGL Configuration

### Canvas Setup

```typescript
// useElectricityEffect.ts:68-73
const gl = canvas.getContext('webgl', {
  alpha: true,
  premultipliedAlpha: false,
  antialias: true,
  preserveDrawingBuffer: true,
});
```

### Render Constants

| Value | Purpose | Source |
|-------|---------|--------|
| `400 × 400` | Resolution | useElectricityEffect.ts:81-82 |
| `200, 200` | Center point | useElectricityEffect.ts:81 |
| `0.47` | Portal radius (normalized) | useElectricityEffect.ts:401 |
| `0.03` | Time increment per frame | useElectricityEffect.ts:192 |

### Bloom Configuration

| Pass | Radius | Weight | Source |
|------|--------|--------|--------|
| Tight | `2.5` | `0.5` | config.ts:60, useElectricityEffect.ts:484 |
| Medium | `6.0` | `0.32` | config.ts:61, useElectricityEffect.ts:485 |
| Wide | `12.0` | `0.18` | config.ts:62, useElectricityEffect.ts:486 |

### Composite Uniforms

| Uniform | Value | Source |
|---------|-------|--------|
| u_exposure | `1.5` | useElectricityEffect.ts:487 |
| u_centerGlow | `0.35` | useElectricityEffect.ts:488 |
| u_rimBloomBoost | `1.4` | useElectricityEffect.ts:490 |
| u_glassOpacity | `0.12` | useElectricityEffect.ts:491 |
| u_glassReflection | `0.08` | useElectricityEffect.ts:492 |

---

## Asset Inventory

### Images

| File | Purpose | Source |
|------|---------|--------|
| `story-portal-background.webp` | Main background | /assets/images/ |
| `story-portal-button-primary.webp` | Primary button texture | /assets/images/ |
| `story-portal-button-secondary.webp` | Nav button texture | /assets/images/ |
| `story-portal-app-hamburger-menu-gear.webp` | Hamburger gear icon | /assets/images/ |
| `wood-panel.webp` | Menu panel texture | /assets/images/ |
| `ring_shadow.webp` | Portal ring shadow | /assets/images/ |
| `ring_overlay.webp` | Portal ring overlay | /assets/images/ |
| `smoke-puff.webp` | Steam wisp sprite | /assets/images/ |

### Fonts

| Font | Format | Location |
|------|--------|----------|
| Carnivalee Freakshow | woff2 (Base64) | fonts.css |
| Molly Sans | woff2 (Base64) | fonts.css |
| Material Symbols Outlined | Google CDN | index.html |
| Material Icons | Google CDN | index.html |

---

## Accessibility Status

### Currently Implemented

- None explicitly defined

### Missing (Gaps)

| Element | Status | Note |
|---------|--------|------|
| Focus ring styles | ❌ Not defined | Default browser styles apply |
| Skip links | ❌ Not implemented | — |
| High contrast mode | ❌ Not handled | — |
| Reduced motion | ❌ Not handled | No @media (prefers-reduced-motion) |

### Color Contrast Pairs to Verify

| Text | Background | Component |
|------|------------|-----------|
| `#f5deb3` | `rgba(0,0,0,0.8)` | RecordView |
| `#f4e4c8` | `rgba(0,0,0,0.1)` | Wheel panels |
| `#e8dcc8` | Wood texture | Button labels |

---

## Known Inconsistencies

| Issue | Values | Location |
|-------|--------|----------|
| Border color variation | `#8B6F47` vs `#a88545` | RecordView vs tooltip |
| Extrusion base colors | `188,132,59` vs `40,25,8` | config.ts vs NavButtons.tsx |
| Smoke color variations | Multiple slight variations | SmokeEffect.tsx |

---

## CSS Files Reference

| File | Size | Purpose |
|------|------|---------|
| `base.css` | 6.7KB | Base styles, backgrounds |
| `wheel.css` | 10.2KB | Wheel container, panels, transforms |
| `animations.css` | 16.4KB | Keyframe animations |
| `buttons.css` | 11.8KB | Button styles |
| `menu.css` | 5.4KB | Menu components |
| `responsive.css` | 4.1KB | Media queries |
| `fonts.css` | 125KB | @font-face (Base64) |
| `index.css` | 0.3KB | Import aggregator |

---

*All values verified from Design Implementation Audit (2025-12-22)*
