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

We need to capture during peak intensity.

---

## Timing Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `settleMs` | Delay after click before capture starts | 0 |
| `burstFrames` | Number of frames to capture | 60 |
| `burstIntervalMs` | Time between frames | 25 (40 fps) |

**Capture window = burstFrames × burstIntervalMs**

Example: 60 frames × 25ms = 1500ms capture window

---

## Step 1: Visual Trigger Test

Run non-headless to observe the effect:

```bash
node animations/shared/capture/run.mjs \
  --scenario electricity-portal \
  --headless false \
  --burstFrames 5
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

## Step 2: Burst Capture

```bash
node animations/shared/capture/run.mjs \
  --scenario electricity-portal \
  --headless true \
  --burstFrames 60 \
  --burstIntervalMs 25
```

---

## Step 3: Manual Frame Inspection

Check individual frames for effect visibility:

```bash
# View first frame
open animations/electricity-portal/output/screenshots/timeline/LATEST/crops/frame_000.png

# View frame 30 (middle)
open animations/electricity-portal/output/screenshots/timeline/LATEST/crops/frame_030.png

# View last frame
open animations/electricity-portal/output/screenshots/timeline/LATEST/crops/frame_059.png
```

**Questions:**
- Which frame shows the strongest effect?
- Are there frames with no effect visible?
- Is the effect visible throughout or only in some frames?

---

## Step 4: Generate Animation

```bash
# Create GIF for review
ffmpeg -framerate 40 -i 'animations/electricity-portal/output/screenshots/timeline/LATEST/crops/frame_%03d.png' \
  -vf "scale=550:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  animations/electricity-portal/output/screenshots/timeline/LATEST/animation.gif
```

Open the GIF and verify:
- [ ] Effect is visible in the animation
- [ ] Animation shows movement (not static)
- [ ] Effect appears at expected intensity

---

## Step 5: Adjust Timing If Needed

### Effect not captured (all frames static)

**Possible causes:**
1. Capture started before effect triggered
2. Effect already faded before capture started
3. Click didn't actually trigger the effect

**Try:**
```bash
# Reduce settleMs to 0 (capture immediately after click)
node animations/shared/capture/run.mjs \
  --scenario electricity-portal \
  --settleMs 0 \
  --burstFrames 120
```

### Effect only in first few frames

The effect is starting but capture window is too late.

**Try:**
```bash
# Start capture immediately
--settleMs 0
```

### Effect only in last few frames

Capture is starting too early.

**Try:**
```bash
# Add delay before capture
--settleMs 100  # Wait 100ms after click
```

### Effect is choppy/low frame count

Increase frame rate:

```bash
--burstFrames 120 \
--burstIntervalMs 16  # ~60fps
```

### Effect too brief to capture well

Capture faster:

```bash
--burstFrames 60 \
--burstIntervalMs 8  # 125fps
```

---

## Step 6: Verify Optimal Timing

After adjustments, run capture again and verify:

```bash
node animations/shared/capture/run.mjs \
  --scenario electricity-portal \
  --headless true
```

Generate animation and verify:
- [ ] Effect visible throughout animation
- [ ] Peak intensity captured (compare to reference)
- [ ] Smooth animation (enough frames)

---

## Step 7: Update Scenario Config

Save verified timing parameters:

```bash
jq '.capture.settleMs = 0 | .capture.burstFrames = 60 | .capture.burstIntervalMs = 25' \
  animations/electricity-portal/scenario.json > temp.json && mv temp.json animations/electricity-portal/scenario.json
```

---

## Step 8: Final Human Verification

Show the human:
1. The animated GIF
2. Comparison to reference image
3. Best frame from the capture

**Human confirms:**
> "Yes, the captured animation shows the electricity effect clearly."

---

## Common Issues

### Click not triggering effect

Check the selector:
```javascript
{
  "trigger": {
    "type": "click",
    "selector": "[data-testid='btn-new-topics']"
  }
}
```

Verify selector exists:
```bash
# In browser console
document.querySelector("[data-testid='btn-new-topics']")
```

### Effect visible in browser but not in capture

WebGL canvas may not be compositing properly:

```javascript
{
  "capture": {
    "extractWebGL": true,
    "compositeWebGL": true,
    "forceWebGLPreserve": true
  }
}
```

### Timing different in headless vs non-headless

Headless Chrome may run faster/slower:

```javascript
{
  "capture": {
    "headless": "new",  // Try new headless mode
    "slowMo": 50  // Add slight slowdown if needed
  }
}
```

---

## Saving Verified Configuration

```bash
jq '.setupStatus.timingVerified = true' animations/electricity-portal/scenario.json > temp.json && mv temp.json animations/electricity-portal/scenario.json

git add animations/electricity-portal/scenario.json
git commit -m "chore: verify timing for electricity-portal capture"
```

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
