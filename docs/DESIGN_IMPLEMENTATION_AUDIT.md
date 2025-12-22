# Design Implementation Audit
**Repository:** story-portal
**Generated:** 2025-12-22
**Audit Version:** 1.0

---

## PHASE 1: FILE INVENTORY

### 1.1 Design-Relevant Files

| File | Size | Contents |
|------|------|----------|
| `src/legacy/styles/base.css` | 6.7KB | CSS - Base styles, backgrounds |
| `src/legacy/styles/wheel.css` | 10.2KB | CSS - Wheel container, panels, transforms |
| `src/legacy/styles/animations.css` | 16.4KB | CSS - Keyframe animations |
| `src/legacy/styles/buttons.css` | 11.8KB | CSS - Button styles |
| `src/legacy/styles/menu.css` | 5.4KB | CSS - Menu components |
| `src/legacy/styles/responsive.css` | 4.1KB | CSS - Media queries |
| `src/legacy/styles/fonts.css` | 125KB | CSS - @font-face declarations (Base64 embedded) |
| `src/legacy/styles/index.css` | 0.3KB | CSS - Import aggregator |
| `src/index.css` | 0.3KB | CSS - Root styles |
| `src/App.css` | 0.1KB | CSS - Empty |
| `src/legacy/effects/shaders.ts` | 8.5KB | GLSL shaders |
| `src/legacy/effects/useElectricityEffect.ts` | 16.8KB | WebGL rendering |
| `src/legacy/effects/boltGenerator.ts` | 8.2KB | Bolt path generation |
| `src/legacy/effects/noiseUtils.ts` | 2.8KB | Simplex noise |
| `src/legacy/hooks/useWheelPhysics.ts` | 11.2KB | Physics values |
| `src/legacy/hooks/useAnimationPhase.ts` | 3.6KB | Animation timing |
| `src/legacy/hooks/useMenuState.ts` | 5.4KB | Menu timing |
| `src/legacy/hooks/useSteamEffect.ts` | 2.3KB | Steam spawning |
| `src/legacy/constants/config.ts` | 7.2KB | Effect configuration |
| `src/legacy/LegacyApp.tsx` | 12.1KB | Main component |
| `src/legacy/components/buttons/NavButtons.tsx` | 10.8KB | Inline styles, SVG |
| `src/legacy/components/menu/HamburgerMenu.tsx` | 12.4KB | SVG, inline styles |
| `src/legacy/components/menu/SmokeEffect.tsx` | 5.1KB | Inline styles |
| `src/legacy/components/menu/MenuPanelItem.tsx` | 4.2KB | Inline styles |
| `src/legacy/views/RecordView.tsx` | 2.8KB | Inline styles |
| `src/legacy/views/StoriesView.tsx` | 2.1KB | Inline styles |
| `index.html` | 6.8KB | SVG filters, gradients |

### 1.2 Asset Files

| File | Type | Purpose |
|------|------|---------|
| `/assets/images/story-portal-button-secondary.webp` | Image | Nav button background |
| `/assets/images/story-portal-app-hamburger-menu-gear.webp` | Image | Hamburger gear icon |
| `/assets/images/wood-panel.webp` | Image | Menu panel texture |
| `/assets/images/story-portal-background.webp` | Image | Main background |
| `/assets/images/ring_shadow.webp` | Image | Portal ring shadow |
| `/assets/images/ring_overlay.webp` | Image | Portal ring overlay |
| `/assets/images/story-portal-button-primary.webp` | Image | Primary button |
| `/assets/images/smoke-puff.webp` | Image | Steam wisps |

---

## PHASE 2: COLOR EXTRACTION

### 2.1 CSS Color Values

#### base.css
| Value | Property | Selector | File:Line |
|-------|----------|----------|-----------|
| `#0a0705` | background | `body` | base.css:1 |
| `#f5deb3` | color | `body` | base.css:2 |
| `transparent` | background | `.wheel-view-wrapper` | base.css:35 |

#### wheel.css
| Value | Property | Selector | File:Line |
|-------|----------|----------|-----------|
| `transparent` | background-color | `.wheel-container` | wheel.css:16 |
| `rgba(0,0,0,0.3)` | background | `.wheel-depth-overlay` | wheel.css:108 |
| `rgba(0,0,0,0.5)` | box-shadow | `.portal-inner-shadow` | wheel.css:133 |
| `rgba(0,0,0,0.25)` | box-shadow | `.portal-inner-shadow` | wheel.css:134 |
| `rgba(0,0,0,0.15)` | box-shadow | `.portal-inner-shadow` | wheel.css:135 |
| `rgba(0,0,0,0.08)` | box-shadow | `.portal-inner-shadow` | wheel.css:136 |
| `rgba(0,0,0,0.4)` | box-shadow | `.wheel-inner-depth` | wheel.css:149 |
| `rgba(0,0,0,0.35)` | box-shadow | `.wheel-inner-depth` | wheel.css:150 |
| `rgba(0,0,0,0.2)` | box-shadow | `.wheel-inner-depth` | wheel.css:151 |
| `#f4e4c8` | color | `.wheel-panel` | wheel.css:192 |
| `rgba(0,0,0,0.1)` | background-color | `.wheel-panel` | wheel.css:193 |
| `rgba(200,160,100,0.12)` | border-bottom | `.wheel-panel` | wheel.css:201 |
| `rgba(200,160,100,0.12)` | border-top | `.wheel-panel` | wheel.css:202 |
| `rgba(30,20,10,0.35)` | box-shadow (inset) | `.wheel-panel` | wheel.css:206 |
| `rgba(139,69,19,0.35)` | box-shadow | `.wheel-panel` | wheel.css:207 |
| `rgba(120,100,80,0.5)` | border-top (highlight) | `.wheel-panel::before` | wheel.css:217 |
| `rgba(255,240,220,0.4)` | text-shadow | `.wheel-panel` | wheel.css:225 |
| `rgba(0,0,0,0.8)` | text-shadow | `.wheel-panel` | wheel.css:226 |

#### buttons.css
| Value | Property | Selector | File:Line |
|-------|----------|----------|-----------|
| `transparent` | background | `.spin-button` | buttons.css:8 |
| `#e8dcc8` | color | `.button-label` | buttons.css:85 |
| `rgba(0, 0, 0, 0.35)` | text-shadow | `.button-label` | buttons.css:91 |
| `rgba(60, 40, 20, 0.2)` | background | `.tooltip-content` | buttons.css:185 |
| `#a88545` | border | `.tooltip-content` | buttons.css:188 |
| `rgba(139, 111, 71, 0.9)` | border-top | `.tooltip-arrow` | buttons.css:207 |
| `#e8dcc8` | color | `.tooltip-text` | buttons.css:212 |

#### menu.css
| Value | Property | Selector | File:Line |
|-------|----------|----------|-----------|
| `rgba(0,0,0,0.7)` | background | `.menu-backdrop` | menu.css:8 |
| `#1a1a1a` | background (gradient start) | rope | menu.css (inline) |
| `#3a3a3a` | background (gradient) | rope | menu.css (inline) |
| `#4a4a4a` | background (gradient mid) | rope | menu.css (inline) |
| `#3a2818` | background-color | `.menu-panel-item` | MenuPanelItem.tsx:85 |

### 2.2 CSS Custom Properties (Variables)

| Variable | Value | File:Line |
|----------|-------|-----------|
| `--wheel-rotation` | dynamic (deg) | wheel.css:52 |

### 2.3 Gradient Definitions

#### wheel.css
```css
/* File: wheel.css:108 */
.wheel-depth-overlay {
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.3) 0%,
    transparent 15%,
    transparent 85%,
    rgba(0,0,0,0.3) 100%
  );
}
```

#### buttons.css - Spin Button Gradient
```css
/* File: buttons.css:185 */
.tooltip-content {
  background: linear-gradient(135deg, rgba(60, 40, 20, 0.2), rgba(40, 30, 15, 0.25));
}
```

#### RecordView.tsx / StoriesView.tsx
```css
/* File: RecordView.tsx:89, StoriesView.tsx:65 */
background: linear-gradient(180deg, #6a5a4a, #2a1a0a);
```

### 2.4 JavaScript/TypeScript Color Values

#### config.ts - Electricity Colors (RGB 0-1 normalized)
| Value | Context | File:Line |
|-------|---------|-----------|
| `[1.0, 0.72, 0.21]` | coreColor (#ffb836) | config.ts:69 |
| `[1.0, 0.57, 0.0]` | midColor (#ff9100) | config.ts:70 |
| `[0.9, 0.4, 0.0]` | outerColor (deep amber) | config.ts:71 |
| `[1.0, 0.65, 0.15]` | plasmaInner | config.ts:72 |
| `[0.8, 0.35, 0.0]` | plasmaOuter | config.ts:73 |

#### config.ts - Text Effect Colors
| Value | Context | File:Line |
|-------|---------|-----------|
| `#f2dfc0` | faceTopColor | config.ts:153 |
| `#e3bf7d` | faceMidColor | config.ts:154 |
| `#f18741` | faceBottomColor | config.ts:155 |
| `#e8d4b8` | highlightTopColor | config.ts:159 |
| `#d4b892` | highlightMidColor | config.ts:161 |
| `#8b7355` | highlightBottomColor | config.ts:163 |
| `#1a1008` | textShadowColor | config.ts:169 |
| `#523e21` | outerStrokeColor | config.ts:173 |

#### config.ts - Extrusion Base Colors (RGB)
| Value | Context | File:Line |
|-------|---------|-----------|
| `188, 132, 59` | extrudeBaseR/G/B | config.ts:143-145 |
| `17, 4, 0` | extrudeStepR/G/B | config.ts:148-150 |

#### NavButtons.tsx - Text Effect Colors
| Value | Context | File:Line |
|-------|---------|-----------|
| `#f2dfc0` | faceTopColor | NavButtons.tsx:21 |
| `#e3bf7d` | faceMidColor | NavButtons.tsx:22 |
| `#f18741` | faceBottomColor | NavButtons.tsx:23 |
| `#e8d4b8` | highlightTopColor | NavButtons.tsx:26 |
| `#d4b892` | highlightMidColor | NavButtons.tsx:28 |
| `#8b7355` | highlightBottomColor | NavButtons.tsx:31 |
| `#1a1008` | textShadowColor | NavButtons.tsx:37 |
| `#523e21` | outerStrokeColor | NavButtons.tsx:40 |
| `40, 25, 8` | extrudeBaseR/G/B | NavButtons.tsx:15-17 |

#### HamburgerMenu.tsx - SVG Gradient Colors
| Value | Context | File:Line |
|-------|---------|-----------|
| `#4a3520` | warm-gradient start | HamburgerMenu.tsx:166 |
| `#6a4a28` | warm-gradient 15% | HamburgerMenu.tsx:167 |
| `#8a6535` | warm-gradient 30% | HamburgerMenu.tsx:168 |
| `#b8863c` | warm-gradient 50% | HamburgerMenu.tsx:169 |
| `#d4a045` | warm-gradient 70% | HamburgerMenu.tsx:170 |
| `#c89038` | warm-gradient 85% | HamburgerMenu.tsx:171 |
| `#a87030` | warm-gradient end | HamburgerMenu.tsx:172 |
| `#9a7540` | extruded-gradient start | HamburgerMenu.tsx:177 |
| `#c8964a` | extruded-gradient 20% | HamburgerMenu.tsx:178 |
| `#e4b050` | extruded-gradient 50% | HamburgerMenu.tsx:179 |
| `#f0c858` | extruded-gradient 80% | HamburgerMenu.tsx:180 |
| `#d8a048` | extruded-gradient end | HamburgerMenu.tsx:181 |

#### SmokeEffect.tsx - Smoke Colors
| Value | Context | File:Line |
|-------|---------|-----------|
| `rgba(140,120,100,0.95)` | main cloud center | SmokeEffect.tsx:29 |
| `rgba(120,100,80,0.8)` | main cloud 25% | SmokeEffect.tsx:29 |
| `rgba(100,80,60,0.5)` | main cloud 50% | SmokeEffect.tsx:29 |
| `rgba(80,60,40,0.2)` | main cloud 75% | SmokeEffect.tsx:29 |
| `rgba(130,110,90,0.9)` | wisp 1 | SmokeEffect.tsx:47 |
| `rgba(120,100,80,0.9)` | wisp 2 | SmokeEffect.tsx:66 |
| `rgba(150,130,110,0.85)` | wisp 3 | SmokeEffect.tsx:85 |
| `rgba(255,240,200,0.7)` | inner flash | SmokeEffect.tsx:104 |

#### RecordView.tsx / StoriesView.tsx
| Value | Context | File:Line |
|-------|---------|-----------|
| `rgba(0,0,0,0.8)` | container background | RecordView.tsx:30 |
| `#8B6F47` | border | RecordView.tsx:33 |
| `#f5deb3` | text color | RecordView.tsx:38 |
| `rgba(139,69,19,0.3)` | prompt background | RecordView.tsx:50 |
| `#6a5a4a` | button gradient start | RecordView.tsx:89 |
| `#2a1a0a` | button gradient end | RecordView.tsx:89 |

### 2.5 Shader Color Values

#### shaders.ts - Bolt Fragment Shader
```glsl
// File: shaders.ts (boltFragmentShader)
uniform vec3 u_coreColor;  // Set to [1.0, 0.72, 0.21]
uniform vec3 u_midColor;   // Set to [1.0, 0.57, 0.0]
uniform vec3 u_outerColor; // Set to [0.9, 0.4, 0.0]

// Inner core white boost
vec3 innerCore = vec3(1.0, 0.98, 0.9);
```

#### shaders.ts - Plasma Fragment Shader
```glsl
// File: shaders.ts (plasmaFragmentShader)
uniform vec3 u_innerColor; // Set to [1.0, 0.65, 0.15]
uniform vec3 u_outerColor; // Set to [0.8, 0.35, 0.0]
```

#### shaders.ts - Composite Fragment Shader
```glsl
// File: shaders.ts (compositeFragmentShader)
uniform vec3 u_ambientColor; // Set to vec3(1.0, 0.6, 0.1) in useElectricityEffect.ts:493
```

### 2.6 SVG Colors (index.html)

#### Bronze Gradient (id="bronze-gradient")
| Offset | Color | File:Line |
|--------|-------|-----------|
| 0% | `#faf0b0` | index.html:25 |
| 3% | `#f0e498` | index.html:26 |
| 6% | `#e8d888` | index.html:27 |
| 9% | `#f2e090` | index.html:28 |
| 12% | `#dcc878` | index.html:29 |
| 16% | `#d4c068` | index.html:30 |
| 19% | `#e0c870` | index.html:31 |
| 23% | `#cbb458` | index.html:32 |
| 27% | `#c4a850` | index.html:33 |
| 30% | `#d0b058` | index.html:34 |
| 34% | `#bca048` | index.html:35 |
| 38% | `#b49440` | index.html:36 |
| 41% | `#c4a448` | index.html:37 |
| 45% | `#a88830` | index.html:38 |
| 48% | `#b89038` | index.html:39 |
| 52% | `#a08028` | index.html:40 |
| 55% | `#ac8830` | index.html:41 |
| 59% | `#987420` | index.html:42 |
| 62% | `#a47c28` | index.html:43 |
| 66% | `#8c6818` | index.html:44 |
| 69% | `#987020` | index.html:45 |
| 73% | `#846014` | index.html:46 |
| 76% | `#906820` | index.html:47 |
| 80% | `#7a5810` | index.html:48 |
| 83% | `#886018` | index.html:49 |
| 87% | `#704c0c` | index.html:50 |
| 91% | `#7c5410` | index.html:51 |
| 95% | `#684408` | index.html:52 |
| 100% | `#5c3c04` | index.html:53 |

#### Bronze Gradient Pressed (id="bronze-gradient-pressed")
| Offset | Color | File:Line |
|--------|-------|-----------|
| 0% | `#d8c880` | index.html:58 |
| 15% | `#c8b868` | index.html:59 |
| 30% | `#b8a050` | index.html:60 |
| 45% | `#a89040` | index.html:61 |
| 60% | `#988030` | index.html:62 |
| 75% | `#806818` | index.html:63 |
| 100% | `#604808` | index.html:64 |

#### SVG Filter Colors
| Color | Context | File:Line |
|-------|---------|-----------|
| `rgba(30, 15, 5, 0.8)` | carved-text inner shadow | index.html:73 |
| `rgba(50, 30, 15, 0.5)` | carved-text side shadow | index.html:80 |
| `rgba(255, 250, 240, 0.7)` | carved-text highlight | index.html:87 |
| `rgba(15, 8, 0, 0.95)` | bronze-engraved shadow | index.html:114 |
| `rgba(255, 235, 180, 0.8)` | bronze-engraved highlight | index.html:121 |
| `rgba(10, 15, 12, 0.95)` | patina-engraved shadow | index.html:148 |
| `rgba(220, 210, 190, 0.8)` | patina-engraved highlight | index.html:155 |

#### Brass Texture Gradient (id="brass-texture-gradient")
| Offset | Color | File:Line |
|--------|-------|-----------|
| 0% | `#c9a855` | index.html:168 |
| 50% | `#9a7535` | index.html:169 |
| 100% | `#c4a050` | index.html:170 |

#### Brass Texture Gradient Dark (id="brass-texture-gradient-dark")
| Offset | Color | File:Line |
|--------|-------|-----------|
| 0% | `#a08040` | index.html:175 |
| 50% | `#7a5525` | index.html:176 |
| 100% | `#a48545` | index.html:177 |

---

## PHASE 3: TYPOGRAPHY

### 3.1 Font Imports

#### fonts.css - @font-face (Base64 embedded)
```css
/* File: fonts.css:1-20 */
@font-face {
  font-family: 'Carnivalee Freakshow';
  src: url(data:font/woff2;base64,...) format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

```css
/* File: fonts.css:21-40 */
@font-face {
  font-family: 'Molly Sans';
  src: url(data:font/woff2;base64,...) format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

#### index.html - Google Fonts
```html
<!-- File: index.html:7 -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,700,1,0" rel="stylesheet">

<!-- File: index.html:11 -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,200..700,0..1,-50..200" />

<!-- File: index.html:13 -->
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
```

### 3.2 Font Family Declarations

| font-family | Fallback | Selector | File:Line |
|-------------|----------|----------|-----------|
| `'Carnivalee Freakshow'` | `serif` | `.wheel-panel` | wheel.css:185 |
| `'Carnivalee Freakshow'` | `serif` | `.carved-text` | menu.css:inline |
| `'Carnivalee Freakshow'` | `serif` | `.menu-panel-item` | MenuPanelItem.tsx:95 |
| `'Molly Sans'` | `sans-serif` | `.button-label` | buttons.css:86 |
| `'Molly Sans'` | `sans-serif` | NavButton text | NavButtons.tsx:205 |
| `'Material Symbols Outlined'` | none | NavButton icon | NavButtons.tsx:192 |

### 3.3 Font Sizes

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `16px` | Dynamic (fontSize state) | useWheelPhysics.ts:33 |
| `14px` | Min fontSize | useWheelPhysics.ts:319 |
| `28px` | Max fontSize | useWheelPhysics.ts:319 |
| `22px` | NavButton text | NavButtons.tsx:207 |
| `26px` | NavButton icon | NavButtons.tsx:193 |
| `32px` | `.menu-panel-item` | MenuPanelItem.tsx:96 |
| `32px` | RecordView h1 | RecordView.tsx:39 |
| `20px` | RecordView prompt | RecordView.tsx:60 |
| `16px` | RecordView body | RecordView.tsx:73 |
| `18px` | RecordView button | RecordView.tsx:88 |

### 3.4 Font Weights

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `700` | Material Symbols (fontVariationSettings) | NavButtons.tsx:195 |
| `bold` | RecordView prompt | RecordView.tsx:61 |
| `bold` | RecordView button | RecordView.tsx:87 |

### 3.5 Line Heights

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `1.6` | RecordView body text | RecordView.tsx:74 |
| `1.6` | StoriesView body text | StoriesView.tsx:51 |

### 3.6 Letter Spacing

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `1` | NavButton text | NavButtons.tsx:208 |
| `0.5px` | `.button-label` | buttons.css:88 |

### 3.7 Text Transform

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `uppercase` | `.button-label` | buttons.css:89 |

### 3.8 Text Shadows

| Full Value | Selector/Component | File:Line |
|------------|-------------------|-----------|
| `0 1px 0 rgba(255,240,220,0.4), 0 2px 4px rgba(0,0,0,0.8)` | `.wheel-panel` | wheel.css:225-226 |
| `0 1px 2px rgba(0, 0, 0, 0.35)` | `.button-label` | buttons.css:91 |
| `2px 2px 4px #000` | RecordView h1 | RecordView.tsx:42 |

---

## PHASE 4: SPACING & DIMENSIONS

### 4.1 Margin Values

| Value | Property | Selector/Component | File:Line |
|-------|----------|-------------------|-----------|
| `0` | margin | `body` | base.css:3 |
| `0` | margin | RecordView elements | RecordView.tsx:63 |
| `24px` | marginBottom | RecordView h1 | RecordView.tsx:40 |
| `32px` | marginBottom | RecordView prompt | RecordView.tsx:53 |
| `32px` | marginTop | RecordView button | RecordView.tsx:84 |

### 4.2 Padding Values

| Value | Property | Selector/Component | File:Line |
|-------|----------|-------------------|-----------|
| `0` | padding | `body` | base.css:4 |
| `40px` | padding | RecordView wrapper | RecordView.tsx:21 |
| `40px` | padding | RecordView container | RecordView.tsx:31 |
| `20px` | padding | RecordView prompt | RecordView.tsx:51 |
| `16px 32px` | padding | RecordView button | RecordView.tsx:84 |
| `0 12px` | padding | `.menu-panel-item` | MenuPanelItem.tsx:94 |

### 4.3 Gap Values

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `15px` | NavButtons container | NavButtons.tsx:324 |

### 4.4 Width Values

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `100%` | `body` | base.css:5 |
| `100vw` | `.wheel-view-wrapper` | base.css:36 |
| `100%` | `.wheel-content` | base.css:44 |
| `66%` | `.wheel-viewport` | wheel.css:62 |
| `280px` | NavButton | NavButtons.tsx:109 |
| `80px` | HamburgerMenu | HamburgerMenu.tsx:119 |
| `250px` | `.menu-panel-item` | MenuPanelItem.tsx:83 |
| `350px` | SmokeEffect main cloud | SmokeEffect.tsx:25 |
| `600px` | RecordView max-width | RecordView.tsx:29 |
| `800px` | StoriesView max-width | StoriesView.tsx:28 |

### 4.5 Height Values

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `100%` | `body` | base.css:6 |
| `100vh` | `html` | base.css:8 |
| `100vh` | `.wheel-view-wrapper` | base.css:37 |
| `100%` | `.wheel-content` | base.css:45 |
| `66%` | `.wheel-viewport` | wheel.css:63 |
| `56px` | NavButton | NavButtons.tsx:110 |
| `80px` | HamburgerMenu | HamburgerMenu.tsx:120 |
| `80px` | `.menu-panel-item` | MenuPanelItem.tsx:84 |
| `350px` | SmokeEffect main cloud | SmokeEffect.tsx:26 |
| `100vh` | RecordView minHeight | RecordView.tsx:20 |

### 4.6 Position Offsets

| Property | Value | Selector/Component | File:Line |
|----------|-------|-------------------|-----------|
| `right` | `140px` | NavButtons | NavButtons.tsx:318 |
| `top` | `34%` | NavButtons | NavButtons.tsx:319 |
| `right` | `calc(170px)` | HamburgerMenu | HamburgerMenu.tsx:114 |
| `top` | `calc(34% - 195px)` | HamburgerMenu | HamburgerMenu.tsx:115 |
| `left` | `50%` | SmokeEffect | SmokeEffect.tsx:22 |
| `top` | `38%` | SmokeEffect | SmokeEffect.tsx:23 |

### 4.7 Wheel Geometry Values (useWheelPhysics.ts)

| Value | Variable | Purpose | File:Line |
|-------|----------|---------|-----------|
| `110` | cylinderRadius initial | Default radius | useWheelPhysics.ts:31 |
| `130` | min radius | Bounded minimum | useWheelPhysics.ts:309 |
| `320` | max radius | Bounded maximum | useWheelPhysics.ts:309 |
| `0.32` | radius multiplier | `wheelSize * 0.32` | useWheelPhysics.ts:307 |
| `41` | panelHeight initial | Default height | useWheelPhysics.ts:32 |
| `0.34` | panel height ratio | `radius * 0.34` | useWheelPhysics.ts:313 |
| `36` | min panel height | Bounded minimum | useWheelPhysics.ts:314 |
| `110` | max panel height | Bounded maximum | useWheelPhysics.ts:314 |
| `0.42` | font size ratio | `panelHeight * 0.42` | useWheelPhysics.ts:318 |
| `12` | wheelTilt initial | Default tilt degrees | useWheelPhysics.ts:34 |
| `14` | tilt (small screens) | `< 400px width` | useWheelPhysics.ts:323 |
| `17` | tilt (medium) | `400-600px` | useWheelPhysics.ts:323 |
| `20` | tilt (large) | `> 600px` | useWheelPhysics.ts:323 |

---

## PHASE 5: BORDERS & OUTLINES

### 5.1 Border Properties

| Selector/Component | border | File:Line |
|--------------------|--------|-----------|
| `.wheel-panel` | `1px solid rgba(200,160,100,0.12)` (top/bottom) | wheel.css:201-202 |
| `.tooltip-content` | `2px solid #a88545` | buttons.css:188 |
| RecordView container | `3px solid #8B6F47` | RecordView.tsx:33 |
| RecordView prompt | `2px solid #8B6F47` | RecordView.tsx:55 |
| RecordView button | `3px solid #8B6F47` | RecordView.tsx:90 |

### 5.2 Border Radius

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `50%` | `.spin-button` | buttons.css:9 |
| `50%` | SmokeEffect clouds | SmokeEffect.tsx:27 |
| `4px` | `.menu-panel-item` | MenuPanelItem.tsx:86 |
| `2.5px` | rope connectors | MenuPanelItem.tsx:55 |
| `12px` | RecordView container | RecordView.tsx:32 |
| `8px` | RecordView prompt | RecordView.tsx:52 |
| `8px` | RecordView button | RecordView.tsx:86 |

---

## PHASE 6: SHADOWS & EFFECTS

### 6.1 Box Shadows

#### wheel.css - Portal Inner Shadow
```css
/* File: wheel.css:132-137 */
.portal-inner-shadow {
  box-shadow:
    inset 0 0 35px 25px rgba(0,0,0,0.5),
    inset 0 0 70px 40px rgba(0,0,0,0.25),
    inset 0 0 100px 55px rgba(0,0,0,0.15),
    inset 0 0 140px 70px rgba(0,0,0,0.08);
}
```

#### wheel.css - Wheel Inner Depth
```css
/* File: wheel.css:148-152 */
.wheel-inner-depth {
  box-shadow:
    inset 0 0 90px 70px rgba(0,0,0,0.4),
    inset 0 0 60px 45px rgba(0,0,0,0.35),
    inset 0 0 35px 25px rgba(0,0,0,0.2);
}
```

#### wheel.css - Wheel Panel
```css
/* File: wheel.css:205-207 */
.wheel-panel {
  box-shadow:
    inset 0 0 15px rgba(30,20,10,0.35),
    0 2px 8px rgba(139,69,19,0.35);
}
```

#### MenuPanelItem.tsx
```typescript
/* File: MenuPanelItem.tsx:87-89 */
boxShadow: isOpen
  ? '0 15px 40px rgba(0,0,0,0.5), inset 0 0 12px rgba(0,0,0,0.6)'
  : '0 2px 10px rgba(0,0,0,0.3), inset 0 0 12px rgba(0,0,0,0.6)',
```

### 6.2 Drop Shadows (filter)

#### LegacyApp.tsx - Button Shadow Configuration
```typescript
/* File: LegacyApp.tsx:49-57 */
const BUTTON_SHADOW_CONFIG = {
  enabled: true,
  offsetX: -5,
  offsetY: 6,
  blur: 17,
  layers: 4,
  layerMult: 1.5,
  opacity: 0.6,
};

// Generated: drop-shadow(-5px 6px 17px rgba(0,0,0,0.6)) ...
```

#### NavButtons.tsx - Pressed State
```typescript
/* File: NavButtons.tsx:92-93 */
filter: 'drop-shadow(-5px 4px 12px rgba(0,0,0,0.4))',
```

### 6.3 Filter Effects

| Full Value | Selector/Component | File:Line |
|------------|-------------------|-----------|
| `blur(12px)` | SmokeEffect main cloud | SmokeEffect.tsx:33 |
| `blur(8px)` | SmokeEffect wisp 1 | SmokeEffect.tsx:52 |
| `blur(7px)` | SmokeEffect wisp 2 | SmokeEffect.tsx:71 |
| `blur(10px)` | SmokeEffect wisp 3 | SmokeEffect.tsx:90 |
| `blur(6px)` | SmokeEffect inner flash | SmokeEffect.tsx:108 |
| `blur(15px)` | SmokeEffect linger left | SmokeEffect.tsx:127 |
| `blur(14px)` | SmokeEffect linger right | SmokeEffect.tsx:147 |
| `blur(18px)` | SmokeEffect linger up | SmokeEffect.tsx:165 |

### 6.4 Backdrop Filter

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `blur(4px)` | `.menu-backdrop` | menu.css:9 |

### 6.5 Mix Blend Mode

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `hard-light` | textureBlendMode | config.ts:184, NavButtons.tsx:44 |
| `multiply` | SVG filter feBlend | index.html:108, 142 |

### 6.6 Opacity Values

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `0.85` | textureOverlayOpacity | config.ts:183, NavButtons.tsx:43 |
| `0.8` | highlightTopOpacity | config.ts:160, NavButtons.tsx:27 |
| `0.25` | highlightMidOpacity | config.ts:162, NavButtons.tsx:29 |
| `0.25` | highlightBottomOpacity | config.ts:164, NavButtons.tsx:32 |
| `0.12` | glassOpacity | config.ts:76 |

---

## PHASE 7: TRANSFORMS

### 7.1 Transform Declarations

#### wheel.css - 3D Wheel
```css
/* File: wheel.css:52-54 */
.wheel-cylinder {
  transform-style: preserve-3d;
  transform: rotateX(calc(var(--wheel-rotation, 0deg)));
}
```

#### wheel.css - Panel Positioning
```css
/* File: wheel.css:179 */
.wheel-panel {
  transform: rotateX(calc(var(--panel-angle))) translateZ(var(--radius));
}
```

#### LegacyApp.tsx - Wheel Tilt
```typescript
/* File: LegacyApp.tsx:312 */
transform: `rotateX(${wheelTilt}deg)`,
```

#### NavButtons.tsx - Press Effect
```typescript
/* File: NavButtons.tsx:111 */
transform: pressed ? 'translateY(2px)' : 'translateY(0)',
```

#### MenuPanelItem.tsx - Panel Transform
```typescript
/* File: MenuPanelItem.tsx:77-79 */
transform: isOpen
  ? 'translate(-50%, -50%) perspective(1000px) rotateX(0deg)'
  : 'translate(-50%, -50%) perspective(1000px) rotateX(-360deg)',
```

### 7.2 Transform Origin

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `center center` | `.wheel-viewport` | wheel.css:68 |
| `center center` | `.menu-panel-item` | MenuPanelItem.tsx:80 |
| `center center` | HamburgerMenu lines | HamburgerMenu.tsx:283 |

### 7.3 Perspective

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `700px` | `.wheel-viewport` | wheel.css:67 |
| `1000px` | `.menu-panel-item` | MenuPanelItem.tsx:78 |

### 7.4 Transform Style

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `preserve-3d` | `.wheel-cylinder` | wheel.css:53 |
| `preserve-3d` | `.wheel-viewport` | wheel.css:66 |
| `preserve-3d` | LegacyApp wheel wrapper | LegacyApp.tsx:313 |
| `preserve-3d` | `.menu-panel-item` | MenuPanelItem.tsx:81 |

### 7.5 Backface Visibility

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `hidden` | `.wheel-panel` | wheel.css:190 |

---

## PHASE 8: ANIMATIONS & TRANSITIONS

### 8.1 CSS Transitions

#### MenuPanelItem.tsx - Complex Transition
```typescript
/* File: MenuPanelItem.tsx:99-105 */
transition: `
  top 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${dealDelay}s,
  transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${dealDelay}s,
  opacity 0.15s ease ${isOpen ? dealDelay : 0.5 + closeDelay}s,
  visibility 0s linear ${isOpen ? '0s' : 0.7 + closeDelay + 's'},
  box-shadow 0.5s ease ${dealDelay}s
`,
```

#### HamburgerMenu.tsx - Transition Durations
| Context | Duration | File:Line |
|---------|----------|-----------|
| Default | `0.25s` | HamburgerMenu.tsx:73 |
| Spinning | `0.35s` | HamburgerMenu.tsx:75 |
| Collapse/Expand | `0.22s` | HamburgerMenu.tsx:77 |
| X Lifted | `0.15s` | HamburgerMenu.tsx:79 |

### 8.2 CSS Keyframe Animations

#### animations.css

```css
/* File: animations.css - Steam Animations */
@keyframes steamStream {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
  10% { opacity: 0.8; }
  100% { opacity: 0; transform: translate(-50%, calc(-50% - 80px)) scale(1.2); }
}

@keyframes steamStreamDrift {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
  10% { opacity: 0.8; }
  100% { opacity: 0; transform: translate(calc(-50% + 30px), calc(-50% - 70px)) scale(1.1); }
}

@keyframes steamStreamDriftLeft {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
  10% { opacity: 0.8; }
  100% { opacity: 0; transform: translate(calc(-50% - 25px), calc(-50% - 75px)) scale(1.15); }
}
```

```css
/* File: animations.css - Smoke Animations */
@keyframes smokePoof {
  0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; }
  50% { transform: translate(-50%, calc(-50% - 60px)) scale(1.4); opacity: 0.6; }
  100% { transform: translate(-50%, calc(-50% - 100px)) scale(2.0); opacity: 0; }
}

@keyframes smokeWisp1 {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
  15% { opacity: 0.85; }
  100% { transform: translate(calc(-50% - 100px), calc(-50% - 130px)) scale(1.5); opacity: 0; }
}

@keyframes smokeWisp2 {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
  15% { opacity: 0.85; }
  100% { transform: translate(calc(-50% + 90px), calc(-50% - 140px)) scale(1.4); opacity: 0; }
}

@keyframes smokeWisp3 {
  0% { transform: translate(-50%, -50%) scale(0.35); opacity: 0; }
  15% { opacity: 0.8; }
  100% { transform: translate(-50%, calc(-50% - 180px)) scale(1.6); opacity: 0; }
}

@keyframes smokeLingerLeft {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  20% { opacity: 0.5; }
  100% { transform: translate(calc(-50% - 180px), calc(-50% - 200px)) scale(2.2); opacity: 0; }
}

@keyframes smokeLingerRight {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  20% { opacity: 0.5; }
  100% { transform: translate(calc(-50% + 160px), calc(-50% - 180px)) scale(2.0); opacity: 0; }
}

@keyframes smokeLingerUp {
  0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
  20% { opacity: 0.45; }
  100% { transform: translate(-50%, calc(-50% - 280px)) scale(2.5); opacity: 0; }
}
```

```css
/* File: animations.css - Gear Animations */
@keyframes gearSpinClockwise {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(120deg); }
}

@keyframes gearSpinCounterClockwise {
  0% { transform: rotate(120deg); }
  100% { transform: rotate(0deg); }
}
```

```css
/* File: animations.css - Menu Panel Animations */
@keyframes menuPanelPush {
  0%, 100% { transform: translate(-50%, -50%) perspective(1000px) rotateX(0deg); }
  15% { transform: translate(-50%, -50%) perspective(1000px) rotateX(8deg) translateZ(30px); }
  35% { transform: translate(-50%, -50%) perspective(1000px) rotateX(-6deg); }
  55% { transform: translate(-50%, -50%) perspective(1000px) rotateX(4deg); }
  75% { transform: translate(-50%, -50%) perspective(1000px) rotateX(-2deg); }
}

@keyframes menuPanelSway {
  0%, 100% { transform: translate(-50%, -50%) perspective(1000px) rotateX(0deg); }
  20% { transform: translate(-50%, -50%) perspective(1000px) rotateX(-5deg); }
  40% { transform: translate(-50%, -50%) perspective(1000px) rotateX(4deg); }
  60% { transform: translate(-50%, -50%) perspective(1000px) rotateX(-3deg); }
  80% { transform: translate(-50%, -50%) perspective(1000px) rotateX(1.5deg); }
}
```

### 8.3 Animation Durations Used

| Animation | Duration | File:Line |
|-----------|----------|-----------|
| `gearSpinClockwise` | `0.75s` | HamburgerMenu.tsx:141 |
| `gearSpinCounterClockwise` | `0.75s` | HamburgerMenu.tsx:145 |
| `smokePoof` | `1.0s` (main), `0.5s` (flash) | SmokeEffect.tsx:30, 105 |
| `smokeWisp1` | `1.4s` | SmokeEffect.tsx:48 |
| `smokeWisp2` | `1.3s` | SmokeEffect.tsx:67 |
| `smokeWisp3` | `1.5s` | SmokeEffect.tsx:86 |
| `smokeLingerLeft` | `3.0s` | SmokeEffect.tsx:124 |
| `smokeLingerRight` | `3.2s` | SmokeEffect.tsx:143 |
| `smokeLingerUp` | `3.5s` | SmokeEffect.tsx:162 |
| `menuPanelPush` | `2.5s` | MenuPanelItem.tsx:63 |
| `menuPanelSway` | `2.5s` | MenuPanelItem.tsx:65 |

### 8.4 JavaScript Timing Values

#### useAnimationPhase.ts - Phase Durations
| Value | Purpose | File:Line |
|-------|---------|-----------|
| `600` | Warp phase duration (ms) | useAnimationPhase.ts:82 |
| `3000` | Hold phase duration (ms) | useAnimationPhase.ts:87 |
| `3000` | Disintegrate phase duration (ms) | useAnimationPhase.ts:93 |
| `1500` | Reassemble phase duration (ms) | useAnimationPhase.ts:101 |

#### useMenuState.ts - Menu Animation Timing (ms)
| Value | Purpose | File:Line |
|-------|---------|-----------|
| `150` | Phase 1→2 delay | useMenuState.ts:63, 89 |
| `200` | Phase 2→3 delay | useMenuState.ts:67, 88 |
| `200` | Phase 3→4 delay | useMenuState.ts:71 |
| `150` | Phase 4→5 delay | useMenuState.ts:78, 113, 117 |
| `400` | Logo show delay | useMenuState.ts:82 |
| `650` | Smoke delay (open) | useMenuState.ts:92 |
| `1150` | Smoke delay (close) | useMenuState.ts:128 |
| `3500` | Smoke visible duration | useMenuState.ts:96, 132 |

#### useSteamEffect.ts - Steam Timing
| Value | Purpose | File:Line |
|-------|---------|-----------|
| `3800-5800` | Wisp duration range (ms) | useSteamEffect.ts:27 |
| `100` | Initial spawn interval (ms) | useSteamEffect.ts:60 |
| `3000` | Start continuous spawning (ms) | useSteamEffect.ts:73 |
| `120-350` | Random spawn interval (ms) | useSteamEffect.ts:68 |

#### useWheelPhysics.ts - Physics Timing
| Value | Purpose | File:Line |
|-------|---------|-----------|
| `150` | Coast detection threshold (ms) | useWheelPhysics.ts:78-82 |
| `200` | Min time since input for selection (ms) | useWheelPhysics.ts:175 |
| `0.08` | Easing speed (ease toward target) | useWheelPhysics.ts:152 |

### 8.5 Physics Values (useWheelPhysics.ts)

| Value | Variable | Purpose | File:Line |
|-------|----------|---------|-----------|
| `0.985` | spinFrictionRef initial | Friction coefficient | useWheelPhysics.ts:43 |
| `0.982-0.988` | spinFrictionRef range | Random friction | useWheelPhysics.ts:233, 287 |
| `0.5` | test mode friction | Fast stop | useWheelPhysics.ts:97 |
| `1.5` | velocity threshold | Phase transition | useWheelPhysics.ts:89 |
| `2` | min velocity for coast | Coast detection | useWheelPhysics.ts:81 |
| `100` | maxVelocity | Velocity cap | useWheelPhysics.ts:248 |
| `18` | promptInterval | Degrees per prompt | useWheelPhysics.ts:130 |
| `0.5` | input velocity multiplier | startSpin | useWheelPhysics.ts:238 |
| `0.85` | same direction momentum | Velocity blending | useWheelPhysics.ts:242 |
| `0.7` | opposite direction decay | Velocity blending | useWheelPhysics.ts:244 |
| `40-75` | buttonSpin velocity | Random initial | useWheelPhysics.ts:290 |

### 8.6 Electricity Animation Values (config.ts)

| Value | Variable | Purpose | File:Line |
|-------|----------|---------|-----------|
| `2.0-4.0` | boltSpeedMin/Max | Bolt animation speed | config.ts:26-27 |
| `5.0-10.0` | jitterSpeedMin/Max | Jitter animation speed | config.ts:28-29 |
| `0.25` | microFlickerAmount | Per-frame variation | config.ts:30 |
| `0.08` | boltFadeInSpeed | Opacity transition | config.ts:33 |
| `0.05` | boltFadeOutSpeed | Opacity transition | config.ts:34 |
| `0.3-1.2` | boltOnDuration (s) | Visible time | config.ts:35-36 |
| `0.1-0.6` | boltOffDuration (s) | Hidden time | config.ts:37-38 |
| `3.0` | surgeCycleDuration (s) | Full cycle | config.ts:41 |
| `0.4` | surgeBuildPhase | Build portion (0-40%) | config.ts:42 |
| `0.6` | surgePeakPhase | Peak portion (40-60%) | config.ts:43 |
| `2.0` | centerPulseFrequency (Hz) | Pulse rate | config.ts:50 |
| `0.2` | centerPulseAmount | Pulse variation | config.ts:51 |
| `0.03` | time increment | Per frame | useElectricityEffect.ts:192 |

---

## PHASE 9: LAYOUT SYSTEMS

### 9.1 Display Values

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `flex` | RecordView wrapper | RecordView.tsx:16 |
| `flex` | NavButtons container | NavButtons.tsx:322 |
| `flex` | `.menu-panel-item` | MenuPanelItem.tsx:91 |
| `block` | SVG elements | NavButtons.tsx:131 |

### 9.2 Flexbox Properties

#### NavButtons.tsx
```typescript
/* File: NavButtons.tsx:317-325 */
{
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
}
```

#### RecordView.tsx
```typescript
/* File: RecordView.tsx:15-23 */
{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
}
```

#### MenuPanelItem.tsx
```typescript
/* File: MenuPanelItem.tsx:91-93 */
{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
```

### 9.3 Position Values

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `relative` | `.wheel-view-wrapper` | base.css:38 |
| `relative` | NavButton | NavButtons.tsx:106 |
| `absolute` | `.wheel-container` | wheel.css:4 |
| `absolute` | `.wheel-viewport` | wheel.css:60 |
| `absolute` | `.portal-inner-shadow` | wheel.css:126 |
| `absolute` | HamburgerMenu | HamburgerMenu.tsx:112 |
| `absolute` | NavButtons container | NavButtons.tsx:317 |
| `fixed` | `.menu-backdrop` | menu.css:2 |
| `fixed` | `.menu-panel-item` | MenuPanelItem.tsx:74 |
| `fixed` | SmokeEffect elements | SmokeEffect.tsx:21 |

### 9.4 Overflow Behavior

| Property | Value | Selector/Component | File:Line |
|----------|-------|-------------------|-----------|
| `overflow` | `hidden` | `.wheel-viewport` | wheel.css:64 |
| `overflow` | `visible` | HamburgerMenu SVG | HamburgerMenu.tsx:161 |
| `overflow` | `auto` | RecordView wrapper | RecordView.tsx:22 |

### 9.5 Object Fit

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `contain` | HamburgerMenu gear image | HamburgerMenu.tsx:133 |
| `cover` | `.menu-panel-item` background | MenuPanelItem.tsx:84 |

---

## PHASE 10: Z-INDEX & STACKING

### 10.1 Z-Index Values

| Value | Selector/Component | Purpose | File:Line |
|-------|-------------------|---------|-----------|
| `3` | NavButton SVG layer | Above base | NavButtons.tsx:122 |
| `1000` | HamburgerMenu | Top-level control | HamburgerMenu.tsx:122 |
| `1003` | SmokeEffect linger clouds | Below wisps | SmokeEffect.tsx:126, 146, 164 |
| `1004` | SmokeEffect inner flash | Below main | SmokeEffect.tsx:107 |
| `1004-index` | `.menu-panel-item` | Stacked panels | MenuPanelItem.tsx:109 |
| `1005` | SmokeEffect main cloud | Above panels | SmokeEffect.tsx:32 |
| `1006` | SmokeEffect wisps | Top smoke | SmokeEffect.tsx:51, 70, 89 |

---

## PHASE 11: INTERACTION STYLES

### 11.1 Cursor Styles

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `pointer` | NavButton | NavButtons.tsx:105 |
| `pointer` | `.menu-panel-item` | MenuPanelItem.tsx:90 |
| `pointer` | RecordView button | RecordView.tsx:92 |
| `default` | HamburgerMenu (animating) | HamburgerMenu.tsx:116 |

### 11.2 Pointer Events

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `none` | SmokeEffect all elements | SmokeEffect.tsx:31 |
| `none` | HamburgerMenu SVG | HamburgerMenu.tsx:159 |
| `none` | HamburgerMenu gear image | HamburgerMenu.tsx:134 |
| `auto` | `.menu-panel-item` (open) | MenuPanelItem.tsx:108 |
| `none` | `.menu-panel-item` (closed) | MenuPanelItem.tsx:108 |

### 11.3 Touch Action

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `auto` | RecordView wrapper | RecordView.tsx:23 |

### 11.4 User Select

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `none` | NavButton | NavButtons.tsx:107 |
| `none` | HamburgerMenu | HamburgerMenu.tsx:117 |

### 11.5 WebkitTapHighlightColor

| Value | Selector/Component | File:Line |
|-------|-------------------|-----------|
| `transparent` | NavButton | NavButtons.tsx:108 |
| `transparent` | HamburgerMenu | HamburgerMenu.tsx:118 |

---

## PHASE 12: PSEUDO-ELEMENTS

### 12.1 ::before Elements

#### wheel.css - Panel Highlight
```css
/* File: wheel.css:215-225 */
.wheel-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(120,100,80,0.5) 20%,
    rgba(120,100,80,0.5) 80%,
    transparent
  );
}
```

---

## PHASE 13: RESPONSIVE DESIGN

### 13.1 Media Queries

#### responsive.css
```css
/* File: responsive.css - Small Screens */
@media (max-width: 480px) {
  .wheel-viewport {
    width: 80%;
    height: 80%;
  }

  .spin-button {
    width: 90px;
    height: 90px;
  }
}

/* File: responsive.css - Medium Screens */
@media (min-width: 481px) and (max-width: 768px) {
  .wheel-viewport {
    width: 75%;
    height: 75%;
  }
}

/* File: responsive.css - Large Screens */
@media (min-width: 1024px) {
  .wheel-viewport {
    width: 66%;
    height: 66%;
  }
}
```

### 13.2 Viewport Units Used

| Value | Property | Selector/Component | File:Line |
|-------|----------|-------------------|-----------|
| `100vw` | width | `.wheel-view-wrapper` | base.css:36 |
| `100vh` | height | `.wheel-view-wrapper` | base.css:37 |
| `100vh` | height | `html` | base.css:8 |
| `100vh` | minHeight | RecordView wrapper | RecordView.tsx:20 |

### 13.3 Dynamic Sizing (useWheelPhysics.ts)

The wheel dimensions are calculated dynamically based on container width:

```typescript
/* File: useWheelPhysics.ts:303-324 */
const wheelSize = wheelContainerRef.current.offsetWidth;
const calculatedRadius = wheelSize * 0.32;
const boundedRadius = Math.min(Math.max(calculatedRadius, 130), 320);

const calculatedPanelHeight = boundedRadius * 0.34;
const boundedPanelHeight = Math.min(Math.max(calculatedPanelHeight, 36), 110);

const calculatedFontSize = boundedPanelHeight * 0.42;
const boundedFontSize = Math.min(Math.max(calculatedFontSize, 14), 28);

const calculatedTilt = wheelSize < 400 ? 14 : wheelSize < 600 ? 17 : 20;
```

---

## PHASE 14: COMPONENT INVENTORY

### LegacyApp.tsx
- **Path:** src/legacy/LegacyApp.tsx
- **Lines:** 388
- **Purpose:** Main wheel application component
- **Props:** None (root component)
- **State with visual impact:**
  - `view`: Controls which screen renders
  - `showElectricity`: Triggers WebGL effect
  - `showRecordTooltip`: Tooltip visibility
- **Inline Styles:** BUTTON_SHADOW_CONFIG generates filter effects

### NavButtons.tsx
- **Path:** src/legacy/components/buttons/NavButtons.tsx
- **Lines:** 350
- **Purpose:** How to Play and My Stories navigation buttons
- **Props:** `onHowToPlay`, `onMyStories`, `buttonShadowStyle`
- **Inline Styles:** Extensive - button dimensions, transforms, shadows
- **SVG:** Complex extruded text effect with gradients and masks

### HamburgerMenu.tsx
- **Path:** src/legacy/components/menu/HamburgerMenu.tsx
- **Lines:** 383
- **Purpose:** Gear button with animated hamburger/X lines
- **Props:** `isOpen`, `animPhase`, `buttonShadowStyle`, `onToggle`
- **SVG:** Animated lines with multiple gradients and filters
- **State-driven:** Animation phases control transforms and filters

### SmokeEffect.tsx
- **Path:** src/legacy/components/menu/SmokeEffect.tsx
- **Lines:** 171
- **Purpose:** Smoke poof effect when menu opens/closes
- **Props:** `visible`, `animKey`
- **Inline Styles:** All - radial gradients, blur filters, positions

### MenuPanelItem.tsx
- **Path:** src/legacy/components/menu/MenuPanelItem.tsx
- **Lines:** 136
- **Purpose:** Individual menu panel with rope connectors
- **Props:** `id`, `label`, `targetY`, `hasTopRope`, `hasBottomRope`, `isOpen`, etc.
- **Inline Styles:** Transform, transition, box-shadow, background

### RecordView.tsx / StoriesView.tsx / AboutView.tsx
- **Path:** src/legacy/views/
- **Purpose:** Placeholder content screens
- **Inline Styles:** All - steampunk-themed containers, buttons

---

## PHASE 15: WEBGL & SHADERS

### 15.1 Shader Source Code

#### Bolt Vertex Shader
```glsl
// File: shaders.ts (boltVertexShader)
attribute vec2 a_position;
attribute float a_alpha;
uniform vec2 u_resolution;
varying float v_alpha;

void main() {
  vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  v_alpha = a_alpha;
}
```

#### Bolt Fragment Shader
```glsl
// File: shaders.ts (boltFragmentShader)
precision mediump float;
varying float v_alpha;
uniform vec3 u_coreColor;
uniform vec3 u_midColor;
uniform vec3 u_outerColor;
uniform float u_intensity;

void main() {
  float alpha = v_alpha * u_intensity;
  vec3 innerCore = vec3(1.0, 0.98, 0.9);
  float t = clamp(alpha, 0.0, 1.0);

  vec3 color;
  if (t > 0.7) {
    color = mix(u_coreColor, innerCore, (t - 0.7) / 0.3);
  } else if (t > 0.4) {
    color = mix(u_midColor, u_coreColor, (t - 0.4) / 0.3);
  } else {
    color = mix(u_outerColor, u_midColor, t / 0.4);
  }

  gl_FragColor = vec4(color, alpha * 0.95);
}
```

#### Blur Vertex Shader
```glsl
// File: shaders.ts (blurVertexShader)
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0, 1);
  v_texCoord = a_texCoord;
}
```

#### Blur Fragment Shader
```glsl
// File: shaders.ts (blurFragmentShader)
precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_direction;
uniform float u_radius;
varying vec2 v_texCoord;

void main() {
  vec4 sum = vec4(0.0);
  vec2 texelSize = 1.0 / u_resolution;

  float weights[5];
  weights[0] = 0.227027;
  weights[1] = 0.1945946;
  weights[2] = 0.1216216;
  weights[3] = 0.054054;
  weights[4] = 0.016216;

  sum += texture2D(u_texture, v_texCoord) * weights[0];
  for (int i = 1; i < 5; i++) {
    vec2 offset = u_direction * texelSize * float(i) * u_radius;
    sum += texture2D(u_texture, v_texCoord + offset) * weights[i];
    sum += texture2D(u_texture, v_texCoord - offset) * weights[i];
  }

  gl_FragColor = sum;
}
```

#### Plasma Fragment Shader
```glsl
// File: shaders.ts (plasmaFragmentShader)
precision mediump float;
uniform float u_time;
uniform vec2 u_center;
uniform float u_intensity;
uniform float u_density;
uniform float u_centerBright;
uniform float u_noiseScale;
uniform vec3 u_innerColor;
uniform vec3 u_outerColor;
uniform float u_portalRadius;
varying vec2 v_texCoord;

// Simplex noise implementation...

void main() {
  vec2 pos = v_texCoord - u_center;
  float dist = length(pos);

  if (dist > u_portalRadius * 1.1) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float normalizedDist = dist / u_portalRadius;
  float n = fbm(pos * u_noiseScale + vec2(u_time * 0.15, u_time * 0.12));
  float plasma = (n + 1.0) * 0.5;

  vec3 color = mix(u_innerColor, u_outerColor, normalizedDist);
  float centerBoost = (1.0 - normalizedDist) * u_centerBright;
  color += centerBoost * u_innerColor;

  float edgeFade = smoothstep(u_portalRadius * 1.1, u_portalRadius * 0.7, dist);
  float alpha = plasma * u_density * u_intensity * edgeFade;

  gl_FragColor = vec4(color, alpha * 0.6);
}
```

#### Composite Fragment Shader
```glsl
// File: shaders.ts (compositeFragmentShader)
precision mediump float;
uniform sampler2D u_bolts;
uniform sampler2D u_plasma;
uniform sampler2D u_bloomTight;
uniform sampler2D u_bloomMed;
uniform sampler2D u_bloomWide;
uniform float u_intensity;
uniform vec2 u_center;
uniform float u_portalRadius;
uniform float u_bloomTightWeight;
uniform float u_bloomMedWeight;
uniform float u_bloomWideWeight;
uniform float u_exposure;
uniform float u_centerGlow;
uniform float u_centerPulse;
uniform float u_rimBloomBoost;
uniform float u_glassOpacity;
uniform float u_glassReflection;
uniform vec3 u_ambientColor;
varying vec2 v_texCoord;

// ACES tone mapping...

void main() {
  vec2 pos = v_texCoord - u_center;
  float dist = length(pos);
  float normalizedDist = dist / u_portalRadius;

  vec4 bolts = texture2D(u_bolts, v_texCoord);
  vec4 plasma = texture2D(u_plasma, v_texCoord);
  vec4 bloomT = texture2D(u_bloomTight, v_texCoord);
  vec4 bloomM = texture2D(u_bloomMed, v_texCoord);
  vec4 bloomW = texture2D(u_bloomWide, v_texCoord);

  // Rim bloom boost
  float rimFactor = smoothstep(0.5, 0.95, normalizedDist);
  float bloomBoost = 1.0 + rimFactor * (u_rimBloomBoost - 1.0);

  vec4 bloom = (bloomT * u_bloomTightWeight +
                bloomM * u_bloomMedWeight +
                bloomW * u_bloomWideWeight) * bloomBoost;

  // Center glow
  float centerDist = 1.0 - smoothstep(0.0, 0.4, normalizedDist);
  vec4 centerGlow = vec4(u_ambientColor, 1.0) * centerDist * u_centerGlow * u_centerPulse;

  // Glass reflection
  float glassHighlight = pow(1.0 - normalizedDist, 3.0) * u_glassReflection;
  vec4 glass = vec4(1.0, 0.95, 0.85, 1.0) * glassHighlight;

  // Composite
  vec4 combined = plasma + bolts + bloom + centerGlow;
  combined.rgb = combined.rgb * u_exposure;
  combined.rgb = ACESToneMapping(combined.rgb);
  combined += glass * u_glassOpacity;

  // Edge fade
  float edgeFade = smoothstep(u_portalRadius * 1.05, u_portalRadius * 0.85, dist);
  combined.a *= edgeFade * u_intensity;

  gl_FragColor = combined;
}
```

### 15.2 WebGL Configuration

```typescript
// File: useElectricityEffect.ts:68-73
const gl = canvas.getContext('webgl', {
  alpha: true,
  premultipliedAlpha: false,
  antialias: true,
  preserveDrawingBuffer: true,
});
```

```typescript
// File: useElectricityEffect.ts:81-84
const centerX = 200, centerY = 200;
const resolution = 400;
```

### 15.3 Uniform Values Set in JavaScript

| Uniform | Value | File:Line |
|---------|-------|-----------|
| `u_resolution` | `[400, 400]` | useElectricityEffect.ts:277 |
| `u_coreColor` | `[1.0, 0.72, 0.21]` | useElectricityEffect.ts:370 |
| `u_midColor` | `[1.0, 0.57, 0.0]` | useElectricityEffect.ts:371 |
| `u_outerColor` | `[0.9, 0.4, 0.0]` | useElectricityEffect.ts:372 |
| `u_time` | `state.time` | useElectricityEffect.ts:393 |
| `u_center` | `[0.5, 0.5]` | useElectricityEffect.ts:394 |
| `u_density` | `0.5` | useElectricityEffect.ts:396 |
| `u_centerBright` | `0.8 * centerPulse` | useElectricityEffect.ts:397 |
| `u_noiseScale` | `2.2` | useElectricityEffect.ts:398 |
| `u_plasmaInner` | `[1.0, 0.65, 0.15]` | useElectricityEffect.ts:399 |
| `u_plasmaOuter` | `[0.8, 0.35, 0.0]` | useElectricityEffect.ts:400 |
| `u_portalRadius` | `0.47` | useElectricityEffect.ts:401, 483 |
| `u_bloomTightWeight` | `0.5` | useElectricityEffect.ts:484 |
| `u_bloomMedWeight` | `0.32` | useElectricityEffect.ts:485 |
| `u_bloomWideWeight` | `0.18` | useElectricityEffect.ts:486 |
| `u_exposure` | `1.5` | useElectricityEffect.ts:487 |
| `u_centerGlow` | `0.35` | useElectricityEffect.ts:488 |
| `u_rimBloomBoost` | `1.4` | useElectricityEffect.ts:490 |
| `u_glassOpacity` | `0.12` | useElectricityEffect.ts:491 |
| `u_glassReflection` | `0.08` | useElectricityEffect.ts:492 |
| `u_ambientColor` | `[1.0, 0.6, 0.1]` | useElectricityEffect.ts:493 |

### 15.4 Bloom Radius Values

| Pass | Radius | Purpose | File:Line |
|------|--------|---------|-----------|
| Tight | `2.5` | Sharp inner glow | config.ts:60 |
| Medium | `6.0` | Medium spread | config.ts:61 |
| Wide | `12.0` | Atmospheric halo | config.ts:62 |

---

## PHASE 16: CANVAS 2D

None found in codebase. All canvas rendering uses WebGL.

---

## PHASE 17: SVG CONTENT

### 17.1 Inline SVG Elements

#### index.html - SVG Filters and Gradients
```html
<!-- File: index.html:21-180 -->
<svg width="0" height="0" style="position:absolute;visibility:hidden;">
  <defs>
    <!-- Bronze gradient, bronze-gradient-pressed -->
    <!-- carved-text-filter, bronze-engraved-filter, patina-engraved-filter -->
    <!-- brass-texture-gradient, brass-texture-gradient-dark -->
  </defs>
</svg>
```

#### NavButtons.tsx - Button SVG
```typescript
/* File: NavButtons.tsx:125-301 */
<svg viewBox="0 0 280 56" style={{width: '280px', height: '56px'}}>
  <defs>
    {/* metal-texture pattern, face-gradient, bevel-highlight */}
    {/* texture-opacity-gradient, texture-mask, extrude-shadow filter */}
  </defs>
  {/* Button base image */}
  {/* Extruded text layers with Material Icons and Molly Sans */}
</svg>
```

#### HamburgerMenu.tsx - Lines SVG
```typescript
/* File: HamburgerMenu.tsx:151-379 */
<svg viewBox="0 0 80 80">
  <defs>
    {/* hamburger-warm-gradient, hamburger-extruded-gradient */}
    {/* hamburger-engraved-filter, hamburger-extruded-filter */}
    {/* hamburger-shadow-filter */}
  </defs>
  {/* Animated hamburger/X lines */}
</svg>
```

---

## PHASE 18: ASSETS

### 18.1 Image Assets

| File | Purpose |
|------|---------|
| `/assets/images/story-portal-background.webp` | Main background |
| `/assets/images/story-portal-button-primary.webp` | Primary button texture |
| `/assets/images/story-portal-button-secondary.webp` | Nav button texture |
| `/assets/images/story-portal-app-hamburger-menu-gear.webp` | Hamburger gear |
| `/assets/images/wood-panel.webp` | Menu panel texture |
| `/assets/images/ring_shadow.webp` | Portal ring shadow |
| `/assets/images/ring_overlay.webp` | Portal ring overlay |
| `/assets/images/smoke-puff.webp` | Steam wisp sprite |

### 18.2 Font Files

| Font Family | Format | Weights | Location |
|-------------|--------|---------|----------|
| Carnivalee Freakshow | woff2 (Base64) | normal | fonts.css |
| Molly Sans | woff2 (Base64) | normal | fonts.css |
| Material Symbols Outlined | Google CDN | 200-700 | index.html |
| Material Icons | Google CDN | 400 | index.html |

---

## PHASE 19: ACCESSIBILITY VISUALS

### 19.1 Focus Ring Styles

None explicitly defined. Default browser focus styles apply.

### 19.2 Skip Links

None found in codebase.

### 19.3 High Contrast Mode Handling

None found in codebase.

### 19.4 Color Contrast Notes

| Text Color | Background | Component |
|------------|------------|-----------|
| `#f5deb3` (wheat) | `rgba(0,0,0,0.8)` | RecordView |
| `#f4e4c8` | `rgba(0,0,0,0.1)` | Wheel panels |
| `#e8dcc8` | Wood texture | Button labels |

---

## PHASE 20: PATTERNS & SYSTEMS

### 20.1 Color Patterns

#### Golden/Amber Color Family
The electricity and accent colors consistently use golden-amber tones:
- Core: `#ffb836` / `[1.0, 0.72, 0.21]`
- Mid: `#ff9100` / `[1.0, 0.57, 0.0]`
- Deep: `[0.9, 0.4, 0.0]`

#### Text Colors
Wheat/cream tones for text:
- `#f5deb3` - Primary text
- `#f4e4c8` - Panel text
- `#e8dcc8` - Button labels
- `#f2dfc0` - Gradient top

#### Bronze Gradient Family
Multiple bronze gradients share similar stop patterns:
- Light top → Dark bottom
- Mid-tones around 40-60%

### 20.2 Spacing Patterns

| Value | Usage Count | Context |
|-------|-------------|---------|
| `40px` | 4 | Padding (containers) |
| `32px` | 3 | Margin between sections |
| `12px` | 3 | Inline spacing |
| `15px` | 2 | Component gaps |

### 20.3 Typography Patterns

Primary Display:
- `Carnivalee Freakshow` + `serif` fallback
- Used for: wheel panels, menu panels, carved text

Primary UI:
- `Molly Sans` + `sans-serif` fallback
- Used for: buttons, navigation

Icon Font:
- `Material Symbols Outlined`
- Font variation settings: `'FILL' 1, 'wght' 700`

### 20.4 Animation Timing Patterns

| Pattern | Duration | Easing | Usage |
|---------|----------|--------|-------|
| Fast UI | `0.15-0.25s` | `ease-in-out` | Button presses, menu transitions |
| Medium | `0.5-0.75s` | `ease-out` | Gear spin, panel transforms |
| Slow/Atmospheric | `1.0-3.5s` | `ease-out` | Smoke, steam effects |
| Physics | `0.7s` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Menu panel unfold |

### 20.5 Inconsistencies

1. **Border Color Variation:**
   - `#8B6F47` (RecordView)
   - `#a88545` (tooltip)
   - Both represent "bronze border" but differ slightly

2. **Extrusion Base Colors:**
   - config.ts: `188, 132, 59`
   - NavButtons.tsx: `40, 25, 8`
   - Different starting points for same effect

3. **Smoke Colors:**
   - Multiple slight variations of brown/gray smoke
   - `rgba(140,120,100,...)` vs `rgba(130,110,90,...)` etc.

---

## PHASE 21: GAPS & PLACEHOLDERS

### 21.1 TODO/FIXME Comments

None found in design-related files.

### 21.2 Placeholder Content

| Content | Location | File:Line |
|---------|----------|-----------|
| "Recording functionality coming soon..." | RecordView | RecordView.tsx:78 |
| "Your recorded stories will appear here..." | StoriesView | StoriesView.tsx:54 |

### 21.3 Empty or Stub Implementations

| Component | State | File |
|-----------|-------|------|
| RecordView | Placeholder UI only | RecordView.tsx |
| StoriesView | Placeholder UI only | StoriesView.tsx |
| AboutView | Placeholder UI only | AboutView.tsx |
| src/App.css | Empty file | App.css |

### 21.4 Commented-Out Code

None found in design-related files.

---

## AUDIT SUMMARY

### Design System Completeness

| Category | Status | Notes |
|----------|--------|-------|
| Colors | Complete | Well-defined golden/amber palette |
| Typography | Complete | Custom fonts embedded |
| Spacing | Partial | Some ad-hoc values |
| Animations | Complete | Extensive keyframes and physics |
| Responsive | Partial | Basic breakpoints only |
| Accessibility | Incomplete | No focus styles, skip links |
| WebGL Effects | Complete | Full multi-pass rendering |

### Key Design Values Summary

| Design Token | Value |
|--------------|-------|
| Primary Background | `#0a0705` |
| Primary Text | `#f5deb3` |
| Accent Core | `#ffb836` |
| Accent Mid | `#ff9100` |
| Border Bronze | `#8B6F47` |
| Display Font | Carnivalee Freakshow |
| UI Font | Molly Sans |
| Icon Font | Material Symbols Outlined |
| Base Radius | 110px (scales 130-320px) |
| Portal Radius | 0.47 (WebGL normalized) |
| Panel Angle | 18° per prompt |
| Wheel Tilt | 12-20° (responsive) |
| Primary Easing | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
