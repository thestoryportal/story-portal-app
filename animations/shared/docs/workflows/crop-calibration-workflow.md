# Crop Calibration Workflow

**Purpose:** Establish correct crop region that centers on the effect area  
**Prerequisite:** Viewport debug complete (Phase 1)  
**Location:** `animations/shared/docs/workflows/crop-calibration-workflow.md`

---

## Overview

The crop region defines what portion of the viewport is analyzed. For the electricity effect, this should be a square centered on the portal ring.

**Target:** 550×550 pixel crop centered on portal

---

## Step 1: Capture Full Viewport

```bash
node animations/shared/capture/run.mjs \
  --mode calibration \
  --no-crop \
  --scenario electricity-portal
```

Note the output directory (printed to console).

---

## Step 2: Identify Portal Center

Open the full viewport image. Find the portal ring center.

**Method A: Image editor**
1. Open in any image editor
2. Use guides or rulers to find center of portal ring
3. Note the X, Y coordinates of the center

**Method B: Manual inspection**
1. Look at the image
2. Estimate center position
3. We'll refine with overlay

---

## Step 3: Calculate Crop Region

For a 550×550 crop centered on point (centerX, centerY):

```
cropX = centerX - 275
cropY = centerY - 275
cropWidth = 550
cropHeight = 550
```

**Example:**
If portal center is at (960, 540) in a 1920×1080 viewport:
```
cropX = 960 - 275 = 685
cropY = 540 - 275 = 265
```

---

## Step 4: Update Scenario Config

```bash
# Edit animations/electricity-portal/scenario.json
jq '.crop = {
  "x": 685,
  "y": 265,
  "width": 550,
  "height": 550,
  "circularMask": true
}' animations/electricity-portal/scenario.json > temp.json && mv temp.json animations/electricity-portal/scenario.json
```

---

## Step 5: Capture with Overlay

```bash
node animations/shared/capture/run.mjs \
  --mode calibration \
  --overlay-crop \
  --scenario electricity-portal
```

This should produce an image showing:
- Full viewport
- Red/yellow rectangle showing the crop region

---

## Step 6: Human Verification

**Checklist:**
- [ ] Is the portal ring centered in the crop box?
- [ ] Is the entire ring visible within the box?
- [ ] Is there some margin around the ring for glow effects?
- [ ] Is the crop box the expected size (550×550)?

**If NOT centered:**
- Adjust cropX to move left (decrease) or right (increase)
- Adjust cropY to move up (decrease) or down (increase)
- Return to Step 4

---

## Step 7: Test Actual Crop

```bash
node animations/shared/capture/run.mjs \
  --mode crop-test \
  --scenario electricity-portal
```

Open the cropped output and verify:

**Checklist:**
- [ ] Portal ring is centered
- [ ] Full ring visible (not cut off)
- [ ] Image is 550×550 pixels
- [ ] Matches the reference image framing

---

## Step 8: Final Verification

Compare cropped capture to reference:

```bash
# View side by side
open animations/electricity-portal/output/screenshots/timeline/LATEST/crops/frame_000.png
open animations/electricity-portal/references/465x465/with_effect.png
```

**Note:** Reference is 465×465, captures are 550×550. They should show the same area but at different sizes. The analysis tools will handle resizing.

---

## Common Issues

### Portal appears off-center in overlay

The calculated center may be wrong. Try:
1. Open full viewport in image editor
2. Measure actual portal center precisely
3. Recalculate crop coordinates

### Crop region is correct size but wrong position

Check for coordinate system issues:
- Y increases downward (top = 0)
- X increases rightward (left = 0)

### Crop extends beyond viewport

```
cropX + cropWidth > viewportWidth
cropY + cropHeight > viewportHeight
```

Either:
- Reduce crop size
- Increase viewport size
- Recenter the portal in the viewport

### Different results at different viewports

The app may be responsive. Lock the viewport size:

```javascript
{
  "capture": {
    "viewport": { "width": 1920, "height": 1080 },
    "lockViewport": true
  }
}
```

---

## Saving Verified Configuration

Once human approves the crop:

```bash
# Mark as verified
jq '.setupStatus.cropCalibrated = true' animations/electricity-portal/scenario.json > temp.json && mv temp.json animations/electricity-portal/scenario.json

# Commit
git add animations/electricity-portal/scenario.json
git commit -m "chore: verify crop calibration for electricity-portal"
```

---

## Next Phase

Proceed to Phase 3: Golden Mask Setup

See: `animations/shared/docs/sessions/session-setup.md` (Phase 3 section)
