# Design Tokens Quick Reference

**Purpose:** Rapid lookup during design sessions  
**Source:** Design Implementation Audit (2025-12-22)

---

## Colors — Copy/Paste Ready

### Backgrounds
```
#0a0705          /* Primary background */
rgba(0,0,0,0.8)  /* Container overlay */
rgba(0,0,0,0.7)  /* Menu backdrop */
rgba(0,0,0,0.1)  /* Panel background */
```

### Text
```
#f5deb3  /* Primary text (wheat) */
#f4e4c8  /* Panel text */
#e8dcc8  /* Button labels */
```

### Accents
```
#ffb836  /* Accent core (electricity) */
#ff9100  /* Accent mid */
#8B6F47  /* Border bronze */
#a88545  /* Border bronze alt */
```

### Text Gradients
```
#f2dfc0  /* Face top */
#e3bf7d  /* Face mid */
#f18741  /* Face bottom */
```

### Hamburger Gradient
```
#4a3520 → #6a4a28 → #8a6535 → #b8863c → #d4a045 → #c89038 → #a87030
```

---

## Typography — Copy/Paste Ready

### Font Families
```css
font-family: 'Carnivalee Freakshow', serif;  /* Display */
font-family: 'Molly Sans', sans-serif;       /* UI */
font-family: 'Material Symbols Outlined';    /* Icons */
```

### Font Sizes
```
14px  /* Minimum */
16px  /* Body default */
18px  /* Buttons */
20px  /* Prompts */
22px  /* Nav text */
32px  /* Headings, menus */
```

### Common Text Styles
```css
/* Button label */
font-family: 'Molly Sans', sans-serif;
text-transform: uppercase;
letter-spacing: 0.5px;

/* Body text */
line-height: 1.6;

/* Panel text shadow */
text-shadow: 0 1px 0 rgba(255,240,220,0.4), 0 2px 4px rgba(0,0,0,0.8);
```

---

## Spacing Values

```
40px  /* Container padding */
32px  /* Section margins */
24px  /* Element margins */
20px  /* Inner padding */
16px  /* Button padding V */
15px  /* Component gaps */
12px  /* Inline spacing */
```

---

## Border Radius

```
50%   /* Circular */
12px  /* Large containers */
8px   /* Medium elements */
4px   /* Small elements */
```

---

## Borders

```css
/* Standard */
border: 3px solid #8B6F47;

/* Medium */
border: 2px solid #8B6F47;

/* Subtle panel */
border: 1px solid rgba(200,160,100,0.12);

/* Tooltip */
border: 2px solid #a88545;
```

---

## Shadows — Copy/Paste Ready

### Container (Default)
```css
box-shadow: 0 2px 10px rgba(0,0,0,0.3), inset 0 0 12px rgba(0,0,0,0.6);
```

### Container (Elevated)
```css
box-shadow: 0 15px 40px rgba(0,0,0,0.5), inset 0 0 12px rgba(0,0,0,0.6);
```

### Panel
```css
box-shadow: inset 0 0 15px rgba(30,20,10,0.35), 0 2px 8px rgba(139,69,19,0.35);
```

### Button Drop Shadow
```css
filter: drop-shadow(-5px 6px 17px rgba(0,0,0,0.6));
```

### Backdrop Blur
```css
backdrop-filter: blur(4px);
```

---

## Animation Timing

### Durations
```
0.15s  /* Fast (toggles) */
0.25s  /* Quick UI */
0.5s   /* Medium */
0.75s  /* Gear spin */
1.0s   /* Smoke poof */
2.5s   /* Menu panel */
3.5s   /* Atmospheric */
```

### Easings
```css
/* Primary physics easing */
cubic-bezier(0.25, 0.46, 0.45, 0.94)

/* Standard */
ease-in-out  /* Fast UI */
ease-out     /* Medium/slow */
```

### Phase Durations (ms)
```
600   /* Warp */
3000  /* Hold */
3000  /* Disintegrate */
1500  /* Reassemble */
```

---

## Component Sizes

```
280 × 56px   /* NavButton */
80 × 80px    /* HamburgerMenu */
250 × 80px   /* Menu Panel */
600px        /* RecordView max-width */
800px        /* StoriesView max-width */
```

---

## Z-Index Stack

```
3      /* Button SVG layers */
1000   /* Hamburger menu */
1003   /* Smoke linger */
1004   /* Menu panels (1004-index) */
1005   /* Smoke main */
1006   /* Smoke wisps */
```

---

## Breakpoints

```css
/* Small */
@media (max-width: 480px) { }

/* Medium */
@media (min-width: 481px) and (max-width: 768px) { }

/* Large */
@media (min-width: 1024px) { }
```

---

## Common Patterns

### Steampunk Container
```css
background: rgba(0,0,0,0.8);
border: 3px solid #8B6F47;
border-radius: 12px;
padding: 40px;
box-shadow: 0 2px 10px rgba(0,0,0,0.3), inset 0 0 12px rgba(0,0,0,0.6);
```

### Steampunk Button
```css
background: linear-gradient(180deg, #6a5a4a, #2a1a0a);
border: 3px solid #8B6F47;
border-radius: 8px;
padding: 16px 32px;
font-family: 'Molly Sans', sans-serif;
font-size: 18px;
font-weight: bold;
color: #e8dcc8;
text-transform: uppercase;
cursor: pointer;
```

### Prompt Box
```css
background: rgba(139,69,19,0.3);
border: 2px solid #8B6F47;
border-radius: 8px;
padding: 20px;
font-size: 20px;
font-weight: bold;
color: #f5deb3;
```

---

## Assets Reference

### Images (in /assets/images/)
```
story-portal-background.webp
story-portal-button-primary.webp
story-portal-button-secondary.webp
story-portal-app-hamburger-menu-gear.webp
wood-panel.webp
ring_shadow.webp
ring_overlay.webp
smoke-puff.webp
```

---

*All values extracted from codebase — verified 2025-12-22*
