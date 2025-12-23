# Capture Failure Diagnosis

**Purpose:** Diagnose why animation captures fail  
**Location:** `animations/shared/docs/analysis/capture-failure-diagnosis.md`

---

## Diagnostic Checklist

When captures don't show the expected effect, work through this checklist:

### 1. Is the effect actually triggering?

```bash
# Run video capture (non-headless by default) and watch
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label trigger-test \
  --duration 3000
```

**Observe:**
- Does clicking "New Topics" produce visible electricity?
- Does the effect appear immediately or after a delay?
- How long does the effect last?

**If effect doesn't trigger:**
- Check selector is correct
- Check effect is enabled in code
- Check for JavaScript errors in console

---

### 2. Is the capture timed correctly?

```bash
# Capture with wider timing window
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --effectStartMs 500 \
  --effectEndMs 3000 \
  --duration 4000
```

**Check `masked/` frames:**
- Is effect visible in any frames?
- If only in early frames: increase effectStartMs
- If only in late frames: decrease effectStartMs
- If never: effect may not be triggering

---

### 3. Is WebGL being captured?

The electricity effect uses WebGL canvas. CDP screenshots may not capture it correctly.

```bash
# Check if WebGL extraction is enabled
cat animations/electricity-portal/scenario.json | jq '.capture.extractWebGL'
```

**If WebGL content missing:**
```javascript
{
  "capture": {
    "extractWebGL": true,
    "compositeWebGL": true
  }
}
```

---

### 4. Is viewport/scaling correct?

```bash
# Capture and check frames/ folder for full viewport
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label viewport-check
```

Check `frames/` folder (raw captures before cropping) to verify full UI is visible.

**Check captured image:**
- Is entire UI visible?
- Is UI the expected size?
- Is layout correct (not mobile)?

**If scaled wrong:**
```javascript
{
  "capture": {
    "deviceScaleFactor": 1,  // Not 2
    "viewport": { "width": 1920, "height": 1080 }
  }
}
```

---

### 5. Is crop region correct?

```bash
# Capture and check crops/ folder
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --label crop-check
```

Check `crops/` folder — portal should be centered in each 465×465 frame.

**Check overlay:**
- Is crop box centered on portal?
- Does crop box cover effect area?
- Is crop box the right size?

---

### 6. Are dimensions matching?

```bash
# Check all image dimensions (all should be 465×465)
file animations/electricity-portal/output/screenshots/timeline/LATEST/crops/frame_000.png
file animations/electricity-portal/references/465x465/electricity_animation_effect_static_diff_analysis.png
file animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis_mask.png
file animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis_mask.png
```

**All analysis images must be comparable:**
- Crop dimensions should be consistent (465×465)
- Reference and mask must match
- Use `electricity_animation_effect_diff_analysis_mask.png` for reference comparisons
- Use `electricity_animation_effect_diff_analysis_mask.png` for captured frame analysis

---

## Common Failure Patterns

### Pattern A: All frames identical, SSIM ~55%

**Cause:** Effect not captured at all.

**Diagnosis:**
1. Effect not triggering (selector wrong, code disabled)
2. Effect triggering after capture window
3. WebGL not being composited

**Solution:**
- Verify trigger in non-headless mode
- Reduce settleMs to 0
- Enable WebGL extraction

---

### Pattern B: Effect in frame 0, gone in others

**Cause:** Effect very brief or capture starts too late.

**Diagnosis:**
1. settleMs too high
2. Effect duration very short

**Solution:**
- Set settleMs to 0
- Capture at higher frame rate

---

### Pattern C: Effect visible but wrong position

**Cause:** Crop region misaligned.

**Diagnosis:**
1. Crop coordinates calculated for different viewport
2. Responsive layout shifted elements

**Solution:**
- Recalibrate crop region
- Lock viewport size

---

### Pattern D: Effect visible but very faint

**Cause:** Effect is rendering but at low intensity.

**Diagnosis:**
1. Effect intensity parameters too low
2. Alpha blending reducing visibility
3. Reference image much brighter

**Solution:**
- This is an iteration issue, not capture issue
- Effect IS being captured, just needs adjustment

---

### Pattern E: Partial effect (cut off)

**Cause:** Crop region too small or mispositioned.

**Diagnosis:**
1. Crop doesn't cover full effect area
2. Effect extends beyond expected bounds

**Solution:**
- Increase crop size
- Recenter crop region

---

## Verification Commands

```bash
# 1. Check dev server
curl -s http://localhost:5173 | head -5

# 2. Check scenario config
cat animations/electricity-portal/scenario.json | jq '.'

# 3. List recent captures
ls -la animations/electricity-portal/output/screenshots/timeline/

# 4. Check frame dimensions
file animations/electricity-portal/output/screenshots/timeline/LATEST/crops/*.png | head -5

# 5. View capture metadata
cat animations/electricity-portal/output/screenshots/timeline/LATEST/meta.json

# 6. Check for errors in capture
cat animations/electricity-portal/output/screenshots/timeline/LATEST/errors.log 2>/dev/null || echo "No error log"
```

---

## When to Escalate

If after working through this checklist the issue persists:

1. **Document the issue:**
   - Exact steps taken
   - All diagnostic outputs
   - Screenshots of what you see

2. **Check if issue is environmental:**
   - Try on different machine
   - Try with different Node version
   - Try with different Chrome version

3. **Examine the capture code:**
   - `animations/shared/capture/video.mjs`
   - Check for recent changes
   - Add console.log statements

4. **Verify calibrated values:**
   - Crop: (475, 36) @ 465×465
   - Effect timing: 975ms–2138ms
   - Viewport: 1440×768
