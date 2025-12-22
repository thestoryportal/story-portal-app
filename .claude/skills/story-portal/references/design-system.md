# Story Portal Design System

## Design Philosophy: "Brass Alchemy"
Transform digital interfaces into tactile steampunk machinery. Every element should feel like it could exist in a Victorian inventor's workshop—weathered brass, oxidized patina, mechanical precision.

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Brass Gold | `#C9A227` | Primary accents, highlights |
| Aged Brass | `#8B7355` | Secondary brass tones |
| Deep Bronze | `#5C4033` | Shadows, depth |
| Teal Patina | `#2A6B6B` | Oxidized copper accents |
| Patina Light | `#3D8B8B` | Hover states, highlights |
| Patina Dark | `#1D4E4E` | Pressed states |

### Neutrals
| Name | Hex | Usage |
|------|-----|-------|
| Machine Black | `#1A1A1A` | Backgrounds, text |
| Industrial Gray | `#2D2D2D` | Secondary backgrounds |
| Steam White | `#F5F0E6` | Text on dark, highlights |
| Warm White | `#FFF8E7` | Cream accents |

### Animation Colors (Electricity)
| Name | Hex | Usage |
|------|-----|-------|
| Core White | `#FFFEF0` | Lightning core |
| Inner Glow | `#FFE4A0` | First glow layer |
| Outer Glow | `#D4A574` | Bloom extension |
| Amber Edge | `#B8860B` | Fading edges |

## Typography

### Primary Font
- **Family:** Carnivalee Freakshow
- **Format:** WOFF2
- **Usage:** All UI text, prompts, buttons
- **Fallback:** Georgia, serif

### Size Scale (Base: 16px)
| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 12px | 1.4 | Metadata, captions |
| sm | 14px | 1.4 | Secondary text |
| base | 16px | 1.5 | Body text |
| lg | 20px | 1.4 | Subheadings |
| xl | 24px | 1.3 | Headings |
| 2xl | 32px | 1.2 | Section titles |
| 3xl | 48px | 1.1 | Hero text |

### Prompt Text Sizing (Responsive)
```
Mobile (< 480px):    14-16px
Tablet (480-1024px): 16-20px
Desktop (> 1024px):  18-24px
```

## Spacing System
Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight spacing |
| space-2 | 8px | Related elements |
| space-3 | 12px | Component padding |
| space-4 | 16px | Section spacing |
| space-6 | 24px | Large gaps |
| space-8 | 32px | Section breaks |
| space-12 | 48px | Major divisions |

## Shadows & Depth

### Engraved Effect (Inset Text)
```css
text-shadow: 
  1px 1px 1px rgba(0,0,0,0.8),
  -1px -1px 1px rgba(255,255,255,0.1);
```

### Extruded Effect (Raised Text)
```css
text-shadow:
  0 1px 0 rgba(255,255,255,0.3),
  0 2px 0 rgba(0,0,0,0.2),
  0 3px 3px rgba(0,0,0,0.4);
```

### Button Shadow (Brass)
```css
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.2),
  inset 0 -2px 0 rgba(0,0,0,0.3),
  0 2px 4px rgba(0,0,0,0.4);
```

### Portal Ring Inner Shadow
```css
box-shadow:
  inset 0 0 60px rgba(0,0,0,0.8),
  inset 0 0 120px rgba(0,0,0,0.4);
```

## Button Variants

### Brass Button (Primary)
- Background: Linear gradient `#C9A227` → `#8B7355`
- Border: 2px solid `#5C4033`
- Text: Engraved effect
- Hover: Lighten 10%
- Active: Darken 10%, inset shadow

### Teal Patina Button (Secondary)
- Background: Linear gradient `#3D8B8B` → `#1D4E4E`
- Border: 2px solid `#2A6B6B`
- Text: Engraved effect
- Texture: Subtle noise overlay

### Spin Button (Accent)
- Circular, brass construction
- Mechanical gear aesthetic
- Pulse animation on idle
- Rotation animation on press

## Textures

### Background (background.jpg)
- Industrial pipes and machinery
- Weathered patina finish
- Dark, moody lighting
- Resolution: 1920x1080 minimum

### Portal Ring (ring.png)
- Decorative brass frame with bolts
- Transparent center
- Inner shadow creates depth
- Aspect ratio: 1:1

### Wood Panel (wood-panel.png)
- Warm oak grain
- Slight distressing
- Used for prompt cards
- Tileable texture

## Icons
Using Google Material Icons with custom styling:

| Icon | Name | Usage |
|------|------|-------|
| 🎤 | adaptive_audio_mic | Record button |
| 🌀 | orbit | New Topics button |
| 👤 | person_play | My Stories |
| 📖 | web_stories | About |

Icon treatment: Apply brass gradient via CSS `background-clip: text`

## Animation Timing

### Easing Functions
```css
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
--ease-in-out-sine: cubic-bezier(0.37, 0, 0.63, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Standard Durations
| Type | Duration | Easing |
|------|----------|--------|
| Micro (hover) | 150ms | ease-out |
| Standard | 300ms | ease-out-expo |
| Emphasis | 500ms | ease-spring |
| Complex | 800ms+ | custom |

## Visual Cohesion Rules

1. **Text must blend with surfaces** — Never appear "floating" or overlaid
2. **Gradients match materials** — Brass text on brass surfaces, etc.
3. **Consistent weathering** — All elements show appropriate age/wear
4. **Unified lighting** — Single light source (top-left) across all elements
5. **No flat colors** — Everything has gradient, texture, or shadow
