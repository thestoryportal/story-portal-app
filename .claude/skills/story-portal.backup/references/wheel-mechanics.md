# Wheel Mechanics Reference

## Architecture Overview
The Story Portal wheel is a 3D CSS cylinder displaying story prompts. Users spin to select prompts via touch, trackpad, or button.

## Critical Geometry Insight

**THE PROBLEM:** 3D cylinder radius directly affects panel spacing gaps. When radius grows too large on bigger screens, the arc length between panels exceeds panel width, creating visible gaps.

**THE SOLUTION:** Conservative radius multipliers with strict bounds.

## Formulas

### Radius Calculation
```javascript
const BASE_RADIUS_MULTIPLIER = 0.18; // Conservative!
const MIN_RADIUS = 110; // pixels
const MAX_RADIUS = 160; // pixels - STRICT UPPER BOUND

function calculateRadius(viewportWidth) {
  const raw = viewportWidth * BASE_RADIUS_MULTIPLIER;
  return Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, raw));
}
```

### Panel Spacing
```javascript
const PANEL_COUNT = 20;
const DEGREES_PER_PANEL = 360 / PANEL_COUNT; // 18°

// Arc length between panel centers
function arcLength(radius) {
  return 2 * Math.PI * radius * (DEGREES_PER_PANEL / 360);
}

// Panel width must be >= arc length to prevent gaps
function panelWidth(radius) {
  return Math.ceil(arcLength(radius) * 1.05); // 5% overlap buffer
}
```

### Responsive Panel Height
```javascript
function panelHeight(viewportHeight) {
  const baseHeight = viewportHeight * 0.12;
  return Math.min(120, Math.max(60, baseHeight));
}
```

## Physics Constants

### Spin Mechanics
```javascript
const FRICTION = 0.96;          // Velocity decay per frame
const MIN_VELOCITY = 0.1;       // Stop threshold (deg/frame)
const SNAP_THRESHOLD = 2;       // Start snapping (deg/frame)
const SNAP_SPEED = 0.15;        // Snap interpolation factor
const MAX_VELOCITY = 40;        // Clamp excessive speed
```

### Touch/Mouse Input
```javascript
const TOUCH_SENSITIVITY = 0.5;  // deg per pixel dragged
const SCROLL_SENSITIVITY = 0.3; // deg per scroll delta
const BUTTON_SPIN_VELOCITY = 15 + Math.random() * 10; // Randomized
```

## Snap-to-Prompt Logic
```javascript
function snapToNearest(currentRotation) {
  const normalized = ((currentRotation % 360) + 360) % 360;
  const nearestPanel = Math.round(normalized / DEGREES_PER_PANEL);
  return nearestPanel * DEGREES_PER_PANEL;
}
```

## Viewport Positioning

### Portal Ring Alignment
The wheel viewport must align precisely with the portal ring's inner circle.

```javascript
// These percentages are tuned to ring.png dimensions
const VIEWPORT_INSET = {
  top: '9.6%',
  bottom: '16%',
  left: '10%',
  right: '10%'
};
```

### Wheel Container Sizing
```css
.wheel-container {
  position: absolute;
  top: var(--viewport-top);
  bottom: var(--viewport-bottom);
  left: var(--viewport-left);
  right: var(--viewport-right);
  overflow: hidden;
  border-radius: 50%;
}
```

## Device-Specific Adjustments

### Problem Devices (Prone to Gaps)
| Device | Issue | Fix |
|--------|-------|-----|
| iPad Pro 12.9" | Large viewport inflates radius | Cap at MAX_RADIUS |
| Surface Pro | Wide aspect ratio | Reduce multiplier to 0.16 |
| Galaxy Fold (open) | Unusual aspect | Use height-based calc |

### Safe Devices
- All iPhones (standard aspect ratios)
- Most Android phones
- Laptops in portrait browser windows

## Animation Phases (Prompt Selection)

```javascript
const ANIMATION_PHASES = {
  SPIN_OUT: { duration: 200, scale: 1.0 → 0.8, opacity: 1 → 0 },
  HOLD: { duration: 300, scale: 1.2, glow: true },
  SNAP_BACK: { duration: 400, scale: 1.2 → 1.0, easing: 'spring' },
  SHOW_TEXT: { duration: 300, opacity: 0 → 1, fadeIn: true }
};
```

## Testing Checklist

Before any wheel changes are complete:

- [ ] No gaps visible between panels at any rotation angle
- [ ] Wheel fills portal ring inner circle (no margin gaps)
- [ ] Spin physics feel natural (not too fast/slow)
- [ ] Snap-to-prompt lands precisely on center
- [ ] Touch drag works on mobile
- [ ] Trackpad scroll works on desktop
- [ ] Spin button produces varied results
- [ ] Text readable on all panel sizes
