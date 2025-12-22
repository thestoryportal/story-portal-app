# Visual Iteration Pipeline Reference

## Purpose
Autonomously refine visual effects through measured iteration cycles until quality thresholds are met or human checkpoint is needed.

## When to Use
- AAA animation effects (electricity, smoke, particles)
- Responsive layout tuning across device matrix
- Visual regression testing
- Any task with objective, measurable visual criteria

## Prerequisites Checklist
Before entering visual iteration mode:
- [ ] Reference assets available (mockup image, spec document)
- [ ] Dev server running (`pnpm dev`)
- [ ] Capture tools operational (test with `node tools/ai/capture/capture.mjs --test`)
- [ ] Scoring thresholds defined for this effect

## Pipeline Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CAPTURE   │────▶│   ANALYZE   │────▶│  EVALUATE   │
│  (frames)   │     │  (scoring)  │     │ (decision)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
             ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
             │  CONTINUE   │           │ CHECKPOINT  │           │  COMPLETE   │
             │  (adjust)   │           │  (human)    │           │  (done)     │
             └──────┬──────┘           └─────────────┘           └─────────────┘
                    │
                    └─────────────────────▶ Back to CAPTURE
```

## Iteration Cycle

### 1. CAPTURE
```bash
# Single frame
node tools/ai/capture/capture.mjs --output ./iteration-N/

# Burst mode for animations (recommended)
node tools/ai/capture/capture.mjs --burst 10 --duration 2000 --output ./iteration-N/
```

**WebGL Configuration (CRITICAL):**
- Do NOT use `--use-gl=egl` flag (breaks WebGL on macOS)
- Use default Puppeteer GL or `--use-gl=angle`
- Ensure `preserveDrawingBuffer: true` in WebGL context

**Capture settings:**
```javascript
// Working Puppeteer config
{
  headless: 'new',
  args: [
    '--enable-webgl',
    '--enable-webgl2',
    '--ignore-gpu-blocklist',
    // NO --use-gl=egl
  ]
}
```

### 2. ANALYZE
```bash
node tools/ai/capture/pipeline.mjs --input ./iteration-N/ --reference ./reference/
```

**Metrics extracted:**
| Metric | Tool | Purpose |
|--------|------|---------|
| SSIM | ssim.js | Structural similarity to reference |
| Pixel diff | pixelmatch | Localized differences |
| Color histogram | custom | Palette compliance |

**Known limitation:** SSIM is problematic for stochastic effects (electricity, particles). Two "correct" frames may score differently. Use best-of-N scoring for animations.

### 3. EVALUATE

| Score Range | Status | Action |
|-------------|--------|--------|
| ≥ 0.95 | EXCELLENT | Complete - report success |
| 0.90 - 0.94 | GOOD | Polish pass or accept |
| 0.85 - 0.89 | PASS | Continue if improving |
| 0.70 - 0.84 | NEEDS WORK | Continue, significant changes needed |
| < 0.70 | FAIL | Major issues, may need architectural change |

**Decision matrix:**
```
IF score ≥ EXCELLENT (0.95):
  → COMPLETE
  
ELSE IF iteration = MAX_ITERATIONS:
  → CHECKPOINT with human
  
ELSE IF score_delta < 0.01 for 3 iterations:
  → CHECKPOINT (plateau detected)
  
ELSE IF score < previous_best:
  → CHECKPOINT (regression detected)
  
ELSE IF tool_failure:
  → STOP, report error
  
ELSE:
  → CONTINUE to next iteration
```

### 4. ADJUST (if continuing)

Map score deficiencies to specific code changes:

| Deficiency | Likely Cause | Code Location |
|------------|--------------|---------------|
| Low orange intensity | Bolt color too dim | `BOLT_FRAGMENT_SHADER` |
| Missing glow | Bloom not rendering | `bloomPass` settings |
| Too few bolts | Count too low | `BOLT_COUNT` constant |
| Wrong flicker rate | Timing parameter | `FLICKER_INTERVAL` |

**Adjustment rules:**
- Change ONE parameter per iteration
- Document the change and rationale
- Predict expected score impact

### 5. LOG

Each iteration must output:

```markdown
## Iteration [N] — [timestamp]

### Metrics
| Metric | Value | Δ from Previous | Δ from Best |
|--------|-------|-----------------|-------------|
| SSIM   | 0.82  | +0.04           | -0.02       |
| Color  | 0.91  | +0.02           | +0.02       |

### Change Applied
- File: `src/effects/electricity.ts`
- Line: 47
- Change: Increased `GLOW_INTENSITY` from 1.2 to 1.5
- Rationale: Previous frame showed insufficient bloom radius

### Frame Analysis
- Bolts visible: 8 (target: 6-12) ✅
- Orange presence: 34% (target: 30-50%) ✅
- Center glow: 210 (target: 180-255) ✅

### Decision
[CONTINUE | CHECKPOINT | COMPLETE]

### Next Action
[Description of planned change OR reason for checkpoint]
```

## Exit Conditions

### COMPLETE (autonomous)
- Score ≥ 0.95 with passing feature checks
- Output final report and celebrate 🎉

### CHECKPOINT (need human)
- MAX_ITERATIONS reached
- Score plateau (no improvement for 3 iterations)
- Score regression from best
- Subjective quality judgment needed
- Uncertainty about specification interpretation

### STOP (error state)
- Capture tool failure
- Analysis tool failure  
- Human says "stop"

## Thresholds

| Threshold | Default | Adjustable |
|-----------|---------|------------|
| EXCELLENT | 0.95 | Yes, per effect |
| GOOD | 0.90 | Yes |
| PASS | 0.85 | Yes |
| FAIL | 0.70 | Yes |
| MAX_ITERATIONS | 5 | Yes, suggest 5-10 |
| PLATEAU_COUNT | 3 | Rarely change |
| MIN_DELTA | 0.01 | Rarely change |

## Known Issues & Workarounds

### SSIM vs Stochastic Effects
**Problem:** Electricity bolts take random paths, causing SSIM variance even for "correct" output.

**Workaround:** 
- Capture burst of 10+ frames
- Use best-of-N scoring
- Supplement with feature detection (bolt count, color presence)

### Static Reference Paradox
**Problem:** Comparing animation frames to static reference is conceptually flawed.

**Workaround:**
- Use multiple reference frames (peak, mid, calm states)
- Score against best-matching reference
- Validate behavioral characteristics separately

### Color Calibration
**Problem:** Monitor/capture color profiles may differ from reference.

**Workaround:**
- Use relative color ratios, not absolute values
- Validate palette presence, not exact hex matches

## Integration with CLAUDE.md

This pipeline is activated via MODE: VISUAL_ITERATION in CLAUDE.md.

Standard development still uses MODE: STANDARD with human checkpoints. Only enter visual iteration mode when:
1. Human explicitly activates it
2. Task has objective visual criteria
3. Capture tools are verified working
