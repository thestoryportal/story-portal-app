# Timing Verification Workflow

**Purpose:** Ensure capture window catches the effect at peak visibility
**Prerequisite:** Crop calibration complete (Phase 2), Mask verified (Phase 3)
**Location:** `animations/shared/docs/workflows/timing-verification-workflow.md`

---

## Overview

The electricity effect is triggered by clicking "New Topics". The effect:
1. Starts immediately or after a short delay
2. Peaks in intensity
3. Fades out over time

We need to capture during peak intensity using video.mjs.

---

## Timing Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `duration` | Total recording duration (ms) | 3200 |
| `effectStartMs` | When effect starts after trigger | 1200 |
| `effectEndMs` | When effect ends after trigger | 2000 |
| `settleMs` | Wait before trigger | 500 |

**Effect window = effectEndMs - effectStartMs**

Calibrated: 2000 - 1200 = 800ms (peak stable window, 2025-12-24)

---

## Step 1: Visual Trigger Test

Run video capture (non-headless by default) to observe the effect:

```bash
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label timing-test
```

**Human observes:**
- [ ] Does the electricity effect appear?
- [ ] How long after the click does it start?
- [ ] How long does the peak last?
- [ ] How long until it fades completely?

**Record observations:**
```
Effect start delay: ~___ms after click
Peak duration: ~___ms
Total duration: ~___ms
```

---

## Step 2: Capture Video

```bash
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --duration 4000
```

---

## Step 3: Check Output Folders

```bash
# View raw frames (before cropping)
ls animations/electricity-portal/output/screenshots/timeline/LATEST/frames/

# View cropped frames (465×465)
ls animations/electricity-portal/output/screenshots/timeline/LATEST/crops/

# View trimmed + masked frames
ls animations/electricity-portal/output/screenshots/timeline/LATEST/masked/

# View final animation
open animations/electricity-portal/output/screenshots/timeline/LATEST/animation.apng
```

**Questions:**
- Is effect visible in the masked frames?
- Does animation.apng show the effect clearly?
- Is timing correct (effect visible throughout)?

---

## Step 4: Verify Animation

Open `animation.apng` and verify:
- [ ] Effect is visible throughout
- [ ] Animation shows movement (not static)
- [ ] Effect appears at expected intensity

---

## Step 5: Adjust Timing If Needed

### Effect not in captured window

**Try wider timing window:**
```bash
node animations/shared/capture/video.mjs \
  --effectStartMs 500 \
  --effectEndMs 3000
```

### Effect only in early frames

Increase effectStartMs:
```bash
--effectStartMs 1200
```

### Effect only in late frames

Decrease effectStartMs:
```bash
--effectStartMs 600
```

### Need more recording time

Increase duration:
```bash
--duration 5000
```

---

## Step 6: Verify Optimal Timing

After adjustments, run capture again:

```bash
node animations/shared/capture/video.mjs \
  --scenario electricity-portal
```

Verify animation.apng:
- [ ] Effect visible throughout
- [ ] Peak intensity captured
- [ ] Smooth animation

---

## Step 7: Update Scenario Config

Save verified timing parameters in scenario.json:

```json
{
  "capture": {
    "effectTiming": {
      "startMs": 1200,
      "endMs": 2000
    }
  }
}
```

Also update video.mjs defaults if needed.

---

## Step 8: Final Human Verification

Show the human:
1. The animation.apng
2. Comparison to reference (electricity_animation_effect_diff_analysis.apng)
3. Sample frames from masked/ folder

**Human confirms:**
> "Yes, the captured animation shows the electricity effect clearly."

---

## Current Calibrated Values (electricity-portal)

| Parameter | Value |
|-----------|-------|
| effectStartMs | 1200 |
| effectEndMs | 2000 |
| duration | 3200 |
| settleMs | 500 |
| viewport | 1440×768 |
| crop | (482, 39) @ 465×465 |

*Calibrated 2025-12-24*

---

## Common Issues

### Click not triggering effect

Check the selector in video.mjs:
```javascript
const selectors = {
  "newtopics": ['[data-testid="btn-new-topics"]', ".new-topics-btn"],
};
```

Verify selector exists:
```bash
# In browser console
document.querySelector("[data-testid='btn-new-topics']")
```

### Effect visible in browser but not in capture

This usually means timing is off. Try wider effect window.

### Animation too short

Captured frames are trimmed to effectStartMs–effectEndMs. Widen the window if needed.

---

## Setup Complete!

All 4 phases are now verified:
- ✅ Viewport
- ✅ Crop
- ✅ Mask
- ✅ Timing

Proceed to iteration:
> "Setup is verified. Let's begin iterating on the electricity effect."

See: `animations/shared/docs/sessions/session-iteration.md`
