# Viewport Debug Workflow

**Purpose:** Diagnose and fix UI scaling/visibility issues in captures  
**When to use:** Before crop calibration, if captures show cut-off or incorrectly scaled UI

---

## Symptoms

| Symptom | Likely Cause |
|---------|--------------|
| UI appears cut off (only 1/4 visible) | `deviceScaleFactor` too high |
| UI tiny in center of frame | Viewport too large for app |
| Layout looks wrong (mobile?) | Viewport hitting responsive breakpoint |
| Elements missing | Viewport too small |

---

## Diagnostic Workflow

### Step 1: Capture Raw Viewport

```bash
# Capture without any cropping or processing
node animations/shared/capture/run.mjs \
  --mode raw-viewport \
  --no-crop \
  --headless true \
  --viewport 1920x1080 \
  --deviceScaleFactor 1
```

### Step 2: Compare to Browser

Open the same URL in your browser at the same viewport size.
Compare to the captured image.

**Questions:**
- Does the capture match what you see in the browser?
- Is the full UI visible in both?
- Is the sizing the same?

### Step 3: Identify Issue

**If UI is cut off / zoomed in:**
```
Problem: deviceScaleFactor is scaling the UI larger than the viewport
Solution: Set deviceScaleFactor to 1
```

**If UI is tiny:**
```
Problem: Viewport is much larger than app's max-width
Solution: Use viewport matching app's design (typically 1920×1080 or smaller)
```

**If layout is mobile/tablet:**
```
Problem: Viewport is triggering responsive breakpoint
Solution: Increase viewport width above breakpoint (check CSS)
```

---

## Common Fixes

### Fix 1: Reset deviceScaleFactor

The most common issue. High DPI settings cause the UI to render larger.

```javascript
// In scenario config or capture command
{
  "capture": {
    "viewport": { "width": 1920, "height": 1080 },
    "deviceScaleFactor": 1  // NOT 2
  }
}
```

### Fix 2: Match App's Native Viewport

Check what viewport the app is designed for:

```bash
# Look for max-width or viewport meta
grep -r "max-width\|viewport" src/
```

Use that viewport in captures.

### Fix 3: Force Desktop Layout

If app has responsive breakpoints:

```javascript
{
  "capture": {
    "viewport": { "width": 1920, "height": 1080 }  // Wide enough for desktop
  }
}
```

---

## Verification

After applying fix, capture again and verify:

```bash
node animations/shared/capture/run.mjs \
  --mode viewport-verify \
  --no-crop \
  --scenario electricity-portal
```

**Human must confirm:**
> "Is the entire UI visible and correctly sized?" (yes/no)

Only proceed to crop calibration after viewport is verified.

---

## Troubleshooting

### Capture shows blank or partial content

The page may not be fully loaded. Increase wait time:

```javascript
{
  "capture": {
    "waitForSelector": "[data-testid='wheel']",
    "settleMs": 2000  // Wait for animations
  }
}
```

### WebGL content not appearing

WebGL canvas may need special handling:

```javascript
{
  "capture": {
    "extractWebGL": true,
    "compositeWebGL": true
  }
}
```

### Different results headless vs non-headless

Some Chrome flags affect rendering. Try:

```bash
node animations/shared/capture/run.mjs \
  --headless false \
  --scenario electricity-portal
```

If non-headless works but headless doesn't, check the Chrome flags in run.mjs.
