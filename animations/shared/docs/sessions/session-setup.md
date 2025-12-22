# Animation Pipeline Setup Session

**Purpose:** Complete 4-phase setup with human verification at each step  
**Prerequisite:** `pnpm dev` running  
**Time:** 15-30 minutes

---

## Before Starting

Verify dev server is running:
```bash
curl -s http://localhost:5173 | grep -q "vite" && echo "✓ Dev server running" || echo "✗ Start with: pnpm dev"
```

---

## Phase 1: Viewport Debug

**Goal:** Ensure captured screenshots show the full UI correctly.

### Step 1.1: Capture Raw Viewport

```bash
# Capture full viewport without any cropping
node animations/shared/capture/run.mjs \
  --mode viewport-test \
  --no-crop \
  --headless true \
  --viewport 1920x1080 \
  --deviceScaleFactor 1
```

### Step 1.2: Human Verification

Open the captured screenshot and verify:

**Checklist:**
- [ ] Is the entire portal ring visible?
- [ ] Is the wheel visible and properly sized?
- [ ] Are the UI buttons visible (New Topics, etc.)?
- [ ] Is anything cut off at the edges?
- [ ] Does the layout match what you see in the browser?

### Step 1.3: If Issues Found

**UI appears too large / cut off:**
```javascript
// Reduce deviceScaleFactor
deviceScaleFactor: 1  // Not 2
```

**UI appears too small:**
```javascript
// Increase viewport dimensions
viewport: { width: 2560, height: 1600 }
```

**Layout is different:**
```javascript
// Check if responsive breakpoint is being hit
// May need larger viewport to avoid mobile layout
```

### Step 1.4: Repeat Until Verified

Re-capture after each change. Continue until human confirms:
> "Yes, the entire UI is visible and correctly sized."

**Update scenario config:**
```bash
# Save verified viewport settings
cat animations/electricity-portal/scenario.json | jq '.capture.viewport = {"width": VERIFIED_WIDTH, "height": VERIFIED_HEIGHT} | .capture.deviceScaleFactor = VERIFIED_SCALE' > temp.json && mv temp.json animations/electricity-portal/scenario.json
```

✅ **Phase 1 Complete** when viewport is verified.

---

## Phase 2: Crop Calibration

**Goal:** Define the crop region that centers on the portal/effect area.

### Step 2.1: Capture with Overlay

```bash
# Capture full frame with crop region overlay
node animations/shared/capture/run.mjs \
  --mode calibration \
  --overlay-crop \
  --scenario electricity-portal
```

This should produce an image showing:
- Full viewport
- Rectangle overlay showing current crop region

### Step 2.2: Human Verification

**Checklist:**
- [ ] Is the portal ring centered in the crop box?
- [ ] Does the crop box capture the full effect area?
- [ ] Is there appropriate margin around the effect?

### Step 2.3: Adjust Crop Region

If the crop box is misaligned:

```bash
# Calculate new crop coordinates
# The portal should be CENTERED in the crop region

# Update scenario config
jq '.crop = {"x": NEW_X, "y": NEW_Y, "width": 550, "height": 550, "circularMask": true}' \
  animations/electricity-portal/scenario.json > temp.json && mv temp.json animations/electricity-portal/scenario.json
```

### Step 2.4: Verify Cropped Output

```bash
# Capture and crop
node animations/shared/capture/run.mjs \
  --mode crop-test \
  --scenario electricity-portal
```

**Human verifies:**
> "Does this cropped image correctly frame the effect area? Is it centered?"

### Step 2.5: Repeat Until Verified

Continue adjusting until human approves the crop region.

✅ **Phase 2 Complete** when crop is verified.

---

## Phase 3: Golden Mask Setup

**Goal:** Create mask that defines the scoring region.

**Important:** Mask must match CROP dimensions (e.g., 550×550), not viewport dimensions.

### Step 3.1: Generate Mask

```bash
node animations/shared/diff/extract-baseline.mjs \
  --reference animations/electricity-portal/references/465x465/with_effect.png \
  --output animations/electricity-portal/references/ \
  --generate-mask
```

### Step 3.2: Human Verification

Open `golden_mask.png` and verify:

**Checklist:**
- [ ] WHITE area covers where the effect should appear
- [ ] BLACK area covers background/non-effect regions
- [ ] Mask dimensions match crop dimensions
- [ ] Ring shape correctly captures the portal effect area

### Step 3.3: If Mask Incorrect

Manually edit or regenerate with different threshold:

```bash
node animations/shared/diff/extract-baseline.mjs \
  --reference animations/electricity-portal/references/465x465/with_effect.png \
  --threshold 0.15 \
  --output animations/electricity-portal/references/
```

### Step 3.4: Repeat Until Verified

Continue until human confirms:
> "Yes, the mask correctly covers the effect area."

✅ **Phase 3 Complete** when mask is verified.

---

## Phase 4: Timing Verification

**Goal:** Ensure capture catches the effect at peak visibility.

### Step 4.1: Non-Headless Trigger Test

```bash
# Run in visible browser mode
node animations/shared/capture/run.mjs \
  --scenario electricity-portal \
  --headless false \
  --burstFrames 5
```

**Human observes the browser:**
- [ ] Does the electricity effect appear when "New Topics" is clicked?
- [ ] How long does the effect last (estimate in ms)?
- [ ] Does the effect start immediately or after a delay?

### Step 4.2: Capture Burst

```bash
# Capture burst for analysis
node animations/shared/capture/run.mjs \
  --scenario electricity-portal \
  --burstFrames 60 \
  --burstIntervalMs 25
```

### Step 4.3: Generate Animation

```bash
# Create GIF from captured frames
ffmpeg -framerate 40 -i 'animations/electricity-portal/output/screenshots/timeline/LATEST/crops/frame_%03d.png' \
  -vf "scale=550:-1:flags=lanczos" \
  animations/electricity-portal/output/screenshots/timeline/LATEST/animation.gif
```

### Step 4.4: Human Verification

Open the animated GIF and verify:

**Checklist:**
- [ ] Is the electricity effect visible?
- [ ] Is there actual animation (not static)?
- [ ] Is the effect captured at peak intensity?
- [ ] Does it look similar to the reference?

### Step 4.5: Adjust Timing If Needed

**Effect not captured / captured too late:**
```javascript
// Reduce settleMs (start capturing sooner after click)
"settleMs": 0  // Try 0, then increase if needed
```

**Effect appears briefly then disappears:**
```javascript
// Increase burstFrames or reduce interval
"burstFrames": 120,
"burstIntervalMs": 16  // ~60fps
```

### Step 4.6: Repeat Until Verified

Continue adjusting until human confirms:
> "Yes, the captured animation shows the effect clearly."

✅ **Phase 4 Complete** when timing is verified.

---

## Setup Complete

Update the scenario config to reflect setup status:

```bash
jq '.setupStatus = {
  "viewportVerified": true,
  "cropCalibrated": true,
  "maskVerified": true,
  "timingVerified": true,
  "verifiedDate": "'"$(date -Iseconds)"'"
}' animations/electricity-portal/scenario.json > temp.json && mv temp.json animations/electricity-portal/scenario.json
```

**Commit the verified configuration:**
```bash
git add animations/electricity-portal/scenario.json
git add animations/electricity-portal/references/
git commit -m "chore: complete animation pipeline setup verification"
```

---

## Next: Begin Iterations

Now that setup is complete, proceed to iteration:

```
"Setup is verified. Let's begin iterating on the electricity effect."
```

See: `animations/shared/docs/sessions/session-iteration.md`
