# Responsive Design Reference

## Testing Environment

- **Primary Tool:** Responsively App
- **Devices:** 24+ simultaneous viewports
- **Reference Standard:** iPhone 16 Pro
- **All other devices must match iPhone 16 Pro behavior exactly**

## Device Matrix

### Phones - Small (< 375px width)

| Device    | Width | Height | DPR | Notes            |
| --------- | ----- | ------ | --- | ---------------- |
| iPhone SE | 375   | 667    | 2   | Compact baseline |
| Galaxy S8 | 360   | 740    | 4   | Tall aspect      |

### Phones - Standard (375-414px)

| Device              | Width | Height | DPR   | Notes                 |
| ------------------- | ----- | ------ | ----- | --------------------- |
| iPhone 12/13/14     | 390   | 844    | 3     | Common target         |
| iPhone 12/13/14 Pro | 390   | 844    | 3     | **REFERENCE**         |
| iPhone 16 Pro       | 393   | 852    | 3     | **PRIMARY REFERENCE** |
| iPhone 14 Plus      | 428   | 926    | 3     | Large phone           |
| Pixel 7             | 412   | 915    | 2.625 | Android baseline      |

### Phones - Large (> 414px)

| Device            | Width | Height | DPR | Notes          |
| ----------------- | ----- | ------ | --- | -------------- |
| iPhone 16 Pro Max | 430   | 932    | 3   | Largest iPhone |
| Galaxy S21 Ultra  | 412   | 915    | 3.5 | Large Android  |

### Foldables

| Device        | Width (Folded) | Width (Open) | Notes            |
| ------------- | -------------- | ------------ | ---------------- |
| Galaxy Fold   | 280            | 768          | Test both states |
| Galaxy Z Flip | 412            | 412          | Flip orientation |

### Tablets

| Device         | Width | Height | DPR | Notes           |
| -------------- | ----- | ------ | --- | --------------- |
| iPad Mini      | 768   | 1024   | 2   | Small tablet    |
| iPad Air       | 820   | 1180   | 2   | Standard tablet |
| iPad Pro 11"   | 834   | 1194   | 2   | Pro small       |
| iPad Pro 12.9" | 1024  | 1366   | 2   | **GAP PRONE**   |

### Laptops/Desktops

| Device          | Width | Height | Notes                  |
| --------------- | ----- | ------ | ---------------------- |
| MacBook Air     | 1280  | 800    | Compact laptop         |
| MacBook Pro 14" | 1512  | 982    | Standard laptop        |
| Surface Pro 7   | 912   | 1368   | Portrait tablet/laptop |
| Desktop HD      | 1920  | 1080   | Standard desktop       |

## Breakpoint Strategy

### Current Approach: Media Queries

```css
/* Very small phones */
@media (max-width: 359px) { ... }

/* Small phones */
@media (min-width: 360px) and (max-width: 389px) { ... }

/* Standard phones */
@media (min-width: 390px) and (max-width: 427px) { ... }

/* Large phones */
@media (min-width: 428px) and (max-width: 767px) { ... }

/* Tablets */
@media (min-width: 768px) and (max-width: 1023px) { ... }

/* Small laptops */
@media (min-width: 1024px) and (max-width: 1279px) { ... }

/* Desktops */
@media (min-width: 1280px) { ... }
```

### Alternative: Fluid Scaling

```javascript
// Continuous scale factor
function getScaleFactor(viewportWidth) {
  const minWidth = 320
  const maxWidth = 1920
  const minScale = 0.6
  const maxScale = 1.8

  const t = (viewportWidth - minWidth) / (maxWidth - minWidth)
  return minScale + t * (maxScale - minScale)
}
```

## Component Sizing Rules

### Wheel

| Viewport   | Wheel Size | Panel Height | Font Size |
| ---------- | ---------- | ------------ | --------- |
| < 480px    | 85vmin     | 60px         | 14px      |
| 480-768px  | 75vmin     | 80px         | 16px      |
| 768-1024px | 65vmin     | 90px         | 18px      |
| > 1024px   | 55vmin     | 100px        | 20px      |

### Buttons

| Viewport  | Primary Button             | Secondary Button |
| --------- | -------------------------- | ---------------- |
| < 480px   | 90% width, 48px height     | 45% width, 44px  |
| 480-768px | 80% width, 52px height     | 40% width, 48px  |
| > 768px   | 60% width max, 56px height | 35% width, 52px  |

### Touch Targets

**Minimum:** 44 × 44 pixels (Apple HIG)
**Recommended:** 48 × 48 pixels
**Comfortable:** 56 × 56 pixels

## Testing Protocol

### Pre-Change Baseline

1. Open Responsively App
2. Load current implementation
3. Screenshot all 24+ devices
4. Note any existing issues

### Post-Change Validation

1. Reload in Responsively App
2. Compare against baseline screenshots
3. Check for regressions on each device
4. Document any new issues

### Critical Checkpoints

- [ ] Wheel fills portal ring inner circle (no gaps)
- [ ] Text readable on smallest device (iPhone SE)
- [ ] Buttons reachable with thumb on largest phone
- [ ] No horizontal scroll on any device
- [ ] Spin button hidden on touch devices, visible on desktop
- [ ] Touch drag works on all mobile devices
- [ ] Trackpad scroll works on laptops

## Known Problem Devices

### iPad Pro 12.9"

**Issue:** Large viewport inflates radius → panel gaps
**Fix:** Cap radius at MAX_RADIUS (160px)

### Surface Pro 7

**Issue:** Unusual portrait aspect ratio
**Fix:** Reduce radius multiplier to 0.16

### Galaxy Fold (Open)

**Issue:** Wide aspect when unfolded
**Fix:** Use height-based calculation instead of width

### Nest Hub / Nest Hub Max

**Issue:** Non-standard display dimensions
**Fix:** Specific media query adjustments

## Scroll Prevention

Mobile browsers try to scroll the page when users drag the wheel. Prevent this:

```javascript
// Attach to wheel container
element.addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault()
  },
  { passive: false }
)

// Also needed on document for iOS Safari
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.target.closest('.wheel-container')) {
      e.preventDefault()
    }
  },
  { passive: false }
)
```

## Debug Overlay

For responsive debugging, add viewport info:

```javascript
const DebugOverlay = () => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'rgba(0,0,0,0.8)',
      color: '#0f0',
      padding: '4px 8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
    }}
  >
    {window.innerWidth} × {window.innerHeight} | DPR: {window.devicePixelRatio}
  </div>
)
```
