# Troubleshooting Guide

**Purpose:** Common issues and solutions for animation pipeline  
**Location:** `animations/shared/docs/references/troubleshooting.md`

---

## Capture Issues

### WebGL/Shader compile error (CRITICAL)

**Symptoms:**
- Pipeline fails fast with WebGL error
- Console shows shader compile error
- Effect completely invisible

**Cause:** GLSL syntax error (e.g., duplicate variable declaration)

**Solution:**
1. Pipeline now auto-detects WebGL errors and fails fast
2. Check the error message for which shader failed
3. Common issues:
   - Duplicate variable names (e.g., `float luminance` declared twice)
   - Missing semicolons
   - Type mismatches
4. Fix the shader code, then retry pipeline

### Effect not visible in captured frames

**Symptoms:**
- All frames look identical
- No electricity visible
- SSIM very low (~50%)

**Possible causes:**

1. **Shader broken** — Check console for WebGL errors
   ```bash
   # Pipeline should catch this automatically now
   # If not, check browser console manually
   ```

2. **Timing issue** — Capture window misses the effect
   ```bash
   # Adjust effect timing window
   node animations/shared/capture/video.mjs --effectStartMs 500 --effectEndMs 3000
   ```

3. **WebGL not compositing** — Canvas not included in screenshot
   ```javascript
   // Enable WebGL extraction
   "extractWebGL": true,
   "compositeWebGL": true
   ```

4. **Click not triggering** — Wrong selector
   ```bash
   # Verify selector in browser console
   document.querySelector("[data-testid='btn-new-topics']")
   ```

5. **Effect disabled in code** — Check for debug flags

---

### UI cut off or scaled wrong

**Symptoms:**
- Only 1/4 of UI visible
- UI tiny in center
- Wrong layout

**Solution:**
```javascript
{
  "capture": {
    "viewport": { "width": 1920, "height": 1080 },
    "deviceScaleFactor": 1  // NOT 2
  }
}
```

See: `animations/shared/docs/workflows/viewport-debug-workflow.md`

---

### Crop region misaligned

**Symptoms:**
- Portal not centered in cropped output
- Part of portal cut off
- Crop captures wrong area

**Solution:**
1. Recalculate crop coordinates
2. Use overlay mode to verify
3. See: `animations/shared/docs/workflows/crop-calibration-workflow.md`

---

### Blank or white frames

**Possible causes:**

1. **Page not loaded** — Add wait time
   ```javascript
   "waitForSelector": "[data-testid='wheel']",
   "settleMs": 2000
   ```

2. **Navigation error** — Check dev server is running
   ```bash
   curl http://localhost:5173
   ```

3. **Screenshot failed** — Check Chrome/Puppeteer logs

---

## Analysis Issues

### SSIM always ~50%

**Symptoms:**
- Every frame has same SSIM
- Score doesn't change between iterations

**Possible causes:**

1. **Dimension mismatch** — Crop size ≠ reference size
   ```bash
   # Check dimensions (all should be 465×465)
   file animations/electricity-portal/output/*/crops/frame_000.png
   file animations/electricity-portal/references/465x465/sora_reference_frame.png
   file animations/electricity-portal/references/465x465/golden_mask_overlay.png
   ```

2. **Wrong reference** — Comparing to wrong image

3. **Mask wrong size** — Mask dimensions must match (465×465)

4. **Wrong mask for context** — Use `golden_mask_overlay.png` for reference, `golden_mask_capture.png` for captured frames

---

### SSIM very high but visually wrong

**Possible causes:**

1. **Mask too restrictive** — Mask may exclude the effect area
2. **Comparing to wrong baseline** — Check reference image
3. **Effect too subtle** — SSIM less sensitive to subtle differences

---

### Analysis tools error out

**Common errors:**

1. **"Cannot find module"** — Missing dependency
   ```bash
   pnpm install
   ```

2. **"ENOENT: no such file"** — Path wrong
   ```bash
   # Check file exists
   ls -la animations/electricity-portal/references/
   ```

3. **"Invalid image"** — Corrupted PNG
   ```bash
   # Verify image
   file path/to/image.png
   ```

---

## Pipeline Issues

### Pipeline hangs

**Possible causes:**

1. **Waiting for dev server** — Start dev server first
   ```bash
   pnpm dev
   ```

2. **Browser not closing** — Kill zombie processes
   ```bash
   pkill -f chromium
   pkill -f puppeteer
   ```

3. **Infinite loop** — Check convergence settings

---

### Iteration state corrupted

**Symptoms:**
- Wrong iteration number
- State doesn't match reality

**Solution:**
```bash
# Reset iteration counter
rm animations/electricity-portal/output/iterations/LATEST.txt

# Start fresh
node animations/shared/diff/pipeline.mjs --scenario electricity-portal --iteration 1
```

---

### Output not appearing

**Check paths:**
```bash
# Find latest output
ls -la animations/electricity-portal/output/screenshots/timeline/
ls -la animations/electricity-portal/output/iterations/
```

**Check permissions:**
```bash
# Ensure directories exist and are writable
mkdir -p animations/electricity-portal/output/{screenshots,iterations,calibration}
chmod 755 animations/electricity-portal/output/*
```

---

## Environment Issues

### Chrome/Puppeteer problems

**Install issues:**
```bash
# Reinstall puppeteer
pnpm remove puppeteer
pnpm add puppeteer

# Or use system Chrome
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/path/to/chrome
```

**Sandbox issues (Linux):**
```bash
# Disable sandbox (not for production)
--no-sandbox --disable-setuid-sandbox
```

---

### Node version issues

**Symptoms:**
- Syntax errors
- ESM import errors

**Solution:**
```bash
# Check Node version (need 18+)
node --version

# Use nvm to switch
nvm use 18
```

---

### Sharp/image processing issues

**Install issues:**
```bash
# Rebuild sharp
pnpm rebuild sharp
```

**Platform issues:**
```bash
# Force platform-specific install
pnpm add sharp --force
```

---

## Debug Mode

### Enable verbose logging

```bash
DEBUG=* node animations/shared/diff/pipeline.mjs --scenario electricity-portal
```

### Run with visible browser

```bash
# video.mjs runs non-headless by default
node animations/shared/capture/video.mjs --scenario electricity-portal
```

### Quick capture test

```bash
# Short duration capture for debugging
node animations/shared/capture/video.mjs \
  --scenario electricity-portal \
  --duration 2000 \
  --label debug
```

### Inspect intermediate outputs

```bash
# Check all outputs
ls -la animations/electricity-portal/output/screenshots/timeline/LATEST/
cat animations/electricity-portal/output/screenshots/timeline/LATEST/meta.json
```

---

## Getting Help

If issues persist:

1. Check the full tool output for error messages
2. Verify all prerequisites (dev server, Node version, dependencies)
3. Try with verbose logging enabled
4. Check if the issue is consistent or intermittent
5. Document exact steps to reproduce

**Key diagnostic info:**
- Node version: `node --version`
- Platform: `uname -a`
- Error message (full text)
- Steps to reproduce
- Expected vs actual behavior
