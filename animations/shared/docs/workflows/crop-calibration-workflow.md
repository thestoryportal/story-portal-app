# Crop Calibration Workflow

**Purpose:** Establish correct crop region that centers on the effect area  
**Prerequisite:** Viewport debug complete (Phase 1)  
**Location:** `animations/shared/docs/workflows/crop-calibration-workflow.md`

---

## Overview

The crop region defines what portion of the viewport is analyzed. For the electricity effect, this should be a square centered on the portal ring.

**Target:** 465×465 pixel crop centered on portal (matches reference dimensions)

---

## Step 1: Capture Full Viewport

```bash
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label crop-calibration \
  --duration 1000
```

Check `frames/` folder in output for raw viewport images.

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

For a 465×465 crop centered on point (centerX, centerY):

```
cropX = centerX - 232.5
cropY = centerY - 232.5
cropWidth = 465
cropHeight = 465
```

**Example (calibrated for 1440×768 viewport):**
Portal center at (707.5, 268.5):
```
cropX = 707.5 - 232.5 = 475
cropY = 268.5 - 232.5 = 36
```

**Current calibrated values:** (475, 36) @ 465×465

---

## Step 4: Update Scenario Config

```bash
# Edit animations/electricity-portal/scenario.json
jq '.capture.crop = {
  "x": 475,
  "y": 36,
  "width": 465,
  "height": 465,
  "circularMask": true
}' animations/electricity-portal/scenario.json > temp.json && mv temp.json animations/electricity-portal/scenario.json
```

---

## Step 5: Capture and Check Crops

```bash
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label crop-verify \
  --duration 2000
```

Check the `crops/` folder in output — portal should be centered in each 465×465 frame.

---

## Step 6: Human Verification

**Checklist:**
- [ ] Is the portal ring centered in the cropped images?
- [ ] Is the entire ring visible?
- [ ] Is there some margin around the ring for glow effects?
- [ ] Is the crop the expected size (465×465)?

**If NOT centered:**
- Adjust cropX to move left (decrease) or right (increase)
- Adjust cropY to move up (decrease) or down (increase)
- Return to Step 4

---

## Step 7: Test Actual Crop

```bash
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label crop-test \
  --duration 2000
```

Open a cropped image from `crops/` folder and verify:

**Checklist:**
- [ ] Portal ring is centered
- [ ] Full ring visible (not cut off)
- [ ] Image is 465×465 pixels
- [ ] Matches the reference image framing

---

## Step 8: Final Verification

Compare cropped capture to reference:

```bash
# View side by side
open animations/electricity-portal/output/screenshots/timeline/LATEST/crops/frame_000.png
open animations/electricity-portal/references/465x465/sora_reference_frame.png
```

**Note:** Primary reference is `sora_reference_frame.png` (AI-generated from Sora/Luma). Both reference and captures should be 465×465 for direct comparison.

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
