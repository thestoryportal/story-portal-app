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
# Capture full viewport using video.mjs
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label viewport-test \
  --duration 1000
```

> **Note:** Video capture runs at 1440×768 viewport by default. Check output frames for full UI visibility.

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
# Capture video and check crop alignment in output
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label crop-check \
  --duration 2000
```

Check the `crops/` folder to verify portal is centered in the 465×465 crop region.

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
# Capture video with current crop settings
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label crop-verify
```

Check `crops/` folder — portal should be centered in each 465×465 frame.

**Human verifies:**
> "Does this cropped image correctly frame the effect area? Is it centered?"

### Step 2.5: Repeat Until Verified

Continue adjusting until human approves the crop region.

✅ **Phase 2 Complete** when crop is verified.

---

## Phase 3: Golden Mask Setup

**Goal:** Create mask that defines the scoring region.

**Important:** Mask must match CROP dimensions (465×465), not viewport dimensions.

### Mask (electricity-portal)

| File | Center | Radii | Inner Size |
|------|--------|-------|------------|
| `electricity_animation_effect_diff_analysis_mask.png` | (232.5, 232.5) | (159.5, 158.5) | 319×317 |

**Spec:** White ellipse on black (binary).

### Step 3.1: Generate Mask

```bash
node animations/shared/diff/extract-baseline.mjs \
  --reference animations/electricity-portal/references/465x465/electricity_animation_effect_static_diff_analysis.png \
  --output animations/electricity-portal/references/ \
  --generate-mask
```

### Step 3.2: Human Verification

Open `electricity_animation_effect_diff_analysis_mask.png` and verify:

**Checklist:**
- [ ] WHITE area covers where the effect should appear
- [ ] BLACK area covers background/non-effect regions
- [ ] Mask dimensions match crop dimensions (465×465)
- [ ] Ring shape correctly captures the portal effect area

### Step 3.3: Repeat Until Verified

Continue until human confirms:
> "Yes, the mask correctly covers the effect area."

✅ **Phase 3 Complete** when mask is verified.

---

## Phase 4: Timing Verification

**Goal:** Ensure capture catches the effect at peak visibility.

### Step 4.1: Non-Headless Trigger Test

```bash
# Run video capture (opens visible browser by default)
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label timing-test
```

**Human observes the browser:**
- [ ] Does the electricity effect appear when "New Topics" is clicked?
- [ ] How long does the effect last (estimate in ms)?
- [ ] Does the effect start immediately or after a delay?

### Step 4.2: Capture Video

```bash
# Capture full animation
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --duration 4000
```

### Step 4.3: Check Animation Output

The video capture automatically generates `animation.apng` with:
- Frames trimmed to effect window (1200–2000ms)
- Circular transparency mask applied
- Output in `masked/` folder

### Step 4.4: Human Verification

Open the animated GIF and verify:

**Checklist:**
- [ ] Is the electricity effect visible?
- [ ] Is there actual animation (not static)?
- [ ] Is the effect captured at peak intensity?
- [ ] Does it look similar to the reference?

### Step 4.5: Adjust Timing If Needed

**Effect not in captured window:**
```bash
# Adjust effect timing parameters
node animations/shared/capture/video.mjs \
  --effectStartMs 800 \
  --effectEndMs 2500
```

**Need more frames:**
```bash
# Increase recording duration
node animations/shared/capture/video.mjs --duration 5000
```

### Step 4.6: Repeat Until Verified

Continue adjusting until human confirms:
> "Yes, the captured animation shows the effect clearly."

**Current calibrated values (electricity-portal):**
- effectStartMs: 1200
- effectEndMs: 2000
- duration: 4000

✅ **Phase 4 Complete** when timing is verified.

---

## Phase 5: Baseline Extraction

**Goal:** Extract baseline metrics from reference images for iteration comparison.

### Step 5.1: Extract Static Baseline

```bash
node animations/shared/diff/extract-baseline.mjs \
  --with animations/electricity-portal/references/465x465/electricity_animation_effect_static_diff_analysis.png \
  --without animations/electricity-portal/references/465x465/electricity_animation_effect_off_baseline.png \
  --output animations/electricity-portal/references/465x465/ \
  --name electricity
```

**Outputs:**
- `baseline_metrics.json` — Color, intensity, structure metrics
- `baseline_report.md` — Human-readable summary
- `quality_spec.json` — Quality thresholds

### Step 5.2: Extract Animation Baseline

```bash
node animations/shared/diff/extract-baseline-video.mjs \
  --animation animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis.apng \
  --output animations/electricity-portal/references/465x465/ \
  --name electricity
```

**Outputs:**
- `baseline_animation_metrics.json` — Per-frame and temporal metrics
- `baseline_animation_report.md` — Human-readable summary
- `brightness_curve.csv` — Frame-by-frame brightness data

### Step 5.3: Verify Baselines

```bash
ls -la animations/electricity-portal/references/465x465/baseline*.json
```

Both files should exist:
- `baseline_metrics.json`
- `baseline_animation_metrics.json`

✅ **Phase 5 Complete** when both baseline files exist.

---

## Setup Complete

Update the scenario config to reflect setup status:

```bash
jq '.setupStatus = {
  "viewportVerified": true,
  "cropCalibrated": true,
  "maskVerified": true,
  "timingVerified": true,
  "baselinesExtracted": true,
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

## Next: Begin Phase 1 Iteration

Now that setup is complete, proceed to Phase 1 iteration (Peak Visual Quality):

```
"Setup is verified. Let's begin Phase 1 iteration on the electricity effect.
Goal: Match Sora reference at peak intensity."
```

**Reminder:** The iteration uses a two-phase approach:
- **Phase 1:** Peak-only capture, match Sora reference at constant intensity
- **Phase 2:** Full envelope capture, implement build/peak/decay

See: `animations/shared/docs/sessions/session-iteration.md`
