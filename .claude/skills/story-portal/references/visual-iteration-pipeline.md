# Visual Iteration Pipeline — Skill Reference

## Overview

The animation iteration pipeline enables automated capture, analysis, and comparison of visual effects for quality tuning using a **two-phase approach**.

**Full Documentation:** `animations/shared/docs/SKILL.md`

---

## Two-Phase Iteration Strategy

| Phase | Goal | Capture Mode | Compare Against | Target |
|-------|------|--------------|-----------------|--------|
| **Phase 1** | Peak Visual Quality | Peak-only (~1.5s) | Sora reference + baselines | SSIM ≥ 0.90 |
| **Phase 2** | Envelope Implementation | Full animation (~3.5s) | Temporal envelope spec | Visual match |

**Why two phases?**
- Sora reference shows constant peak intensity throughout
- Our spec requires build → peak → decay envelope
- Phase 1: Match Sora at constant intensity (apples-to-apples SSIM comparison)
- Phase 2: Add envelope while preserving Phase 1 visual quality

**Critical Rule:** Phase 1 parameters are LOCKED before Phase 2 begins.

### Phase 1: Peak Visual Quality
- Capture at peak intensity only (skip build phase)
- All frames should show constant peak intensity
- Both static and animation baselines are fully applicable
- Exit: SSIM ≥ 0.90 AND human approval → Lock parameters

### Phase 2: Envelope Implementation
- Capture full animation (build → peak → decay)
- Only modify envelope-related parameters
- Validate against temporal spec, not Sora SSIM
- Exit: Envelope matches spec AND no Phase 1 regression

---

## Directory Structure

```
animations/
├── shared/                         # Shared tooling
│   ├── capture/
│   │   ├── video.mjs               # PRIMARY - Puppeteer CDP screencast
│   │   ├── run.mjs                 # DEPRECATED - burst screenshots
│   │   └── pick_artifact.mjs       # Artifact selector
│   ├── diff/
│   │   ├── pipeline.mjs            # Main iteration loop
│   │   ├── analyze.mjs             # Frame SSIM analysis
│   │   ├── video-analyze.mjs       # Video SSIM analysis (APNG comparison)
│   │   ├── crop.mjs                # Frame cropping
│   │   ├── extract-baseline.mjs    # Static baseline extraction
│   │   ├── extract-baseline-video.mjs  # Animation baseline extraction
│   │   └── run-analysis.mjs        # Standalone analysis runner
│   ├── rules/                      # Pipeline guidelines
│   ├── docs/                       # Full documentation
│   │   ├── SKILL.md                # Main skill doc
│   │   ├── sessions/               # Session guides
│   │   ├── workflows/              # Per-phase workflows
│   │   ├── references/             # Reference docs
│   │   └── analysis/               # Troubleshooting
│   └── iterate.mjs                 # CLI entry point
│
├── electricity-portal/             # Per-scenario directory
│   ├── scenario.json               # Scenario configuration
│   ├── context.md                  # Scenario context
│   ├── references/                 # Baseline images/metrics
│   │   └── 465x465/                # Reference assets
│   └── output/                     # Generated (gitignored)
│
├── hamburger/                      # Other scenarios
├── menu-sway/
└── new-topics/
```

## Calibrated Values (electricity-portal)

Verified and calibrated on 2025-12-22:

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Viewport** | 1440×768 | deviceScaleFactor: 1 |
| **Crop** | (475, 36) @ 465×465 | Portal center for viewport |
| **Effect Timing** | 975ms–2138ms | ~1.16s duration |
| **Cropping Method** | sharp extract | Preserves exact 465×465 (ffmpeg requires even dims) |

### Mask

| File | Center | Radii (X, Y) |
|------|--------|--------------|
| `electricity_animation_effect_diff_analysis_mask.png` | (232.5, 232.5) | (159.5, 158.5) |

**Spec:** White ellipse on black (binary), 319×317 inner ellipse on 465×465 canvas.

---

## Configuration Architecture

All capture calibration values follow a centralized architecture to prevent drift:

```
┌─────────────────────────────────────────────────────────────────┐
│                        SOURCE OF TRUTH                          │
├─────────────────────────────────────────────────────────────────┤
│  scenario.json                 config.ts                        │
│  ├─ capture.viewport           ├─ ELECTRICITY_CONFIG            │
│  ├─ capture.crop                   ├─ effectDurationMs          │
│  ├─ capture.effectTiming           ├─ captureWindowStartMs      │
│  └─ capture.settleMs               └─ captureWindowEndMs        │
└─────────────────────────────────────────────────────────────────┘
                              ↓ reads
┌─────────────────────────────────────────────────────────────────┐
│                        CAPTURE TOOLS                            │
├─────────────────────────────────────────────────────────────────┤
│  video.mjs          → loads scenario.json, CLI overrides        │
│  pipeline.mjs       → loads scenario.json, passes to tools      │
│  benchmark-formats.mjs → loads scenario.json                    │
└─────────────────────────────────────────────────────────────────┘
```

### Value Inheritance Chain

1. **scenario.json** — Primary source for viewport, crop, timing window
2. **config.ts** — Authoritative source for effect timing (used by app code)
3. **Tools** — Load from scenario.json, fallback to hardcoded defaults
4. **CLI args** — Override any value for ad-hoc testing

### Changing Calibration Values

| To Change | Edit | Notes |
|-----------|------|-------|
| Viewport size | `scenario.json → capture.viewport` | Tools read automatically |
| Crop region | `scenario.json → capture.crop` | x, y, width, height |
| Effect timing | `config.ts → ELECTRICITY_CONFIG` | Update scenario.json to match |
| Capture duration | `scenario.json → capture.duration` | |

**Important:** Effect timing is defined in `config.ts` because the React app uses it. The `scenario.json` mirrors these values for capture tools. Keep them in sync.

---

## 5 Setup Phases (Human Verified)

Before running the iteration loop, complete these setup phases:

| Phase | Purpose | Verification |
|-------|---------|--------------|
| 1. Viewport Debug | Ensure full UI captured | "Is entire UI visible?" |
| 2. Crop Calibration | Center effect region | "Is portal centered?" |
| 3. Golden Mask | Define scoring area | "Does mask cover effect?" |
| 4. Timing Verification | Capture at peak | "Is effect visible?" |
| 5. Baseline Extraction | Extract reference metrics | "Do baseline files exist?" |

**Full setup guide:** `animations/shared/docs/sessions/session-setup.md`

## Key Commands

```bash
# Run Phase 1 iteration (peak-only capture)
node animations/shared/diff/pipeline.mjs --scenario electricity-portal --phase 1 --iteration N

# Run Phase 2 iteration (full envelope capture)
node animations/shared/diff/pipeline.mjs --scenario electricity-portal --phase 2 --iteration N

# Capture only (using video.mjs)
node animations/shared/capture/video.mjs --scenario electricity-portal --label test --duration 2000

# Analyze existing frames
node animations/shared/diff/run-analysis.mjs --latest

# Extract STATIC baseline (before first iteration)
node animations/shared/diff/extract-baseline.mjs \
  --with animations/electricity-portal/references/465x465/electricity_animation_effect_static_diff_analysis.png \
  --without animations/electricity-portal/references/465x465/electricity_animation_effect_off_baseline.png \
  --output animations/electricity-portal/references/465x465/ \
  --name electricity

# Extract ANIMATION baseline (before first iteration)
node animations/shared/diff/extract-baseline-video.mjs \
  --animation animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis.apng \
  --output animations/electricity-portal/references/465x465/ \
  --name electricity

# Check current phase status
cat animations/electricity-portal/scenario.json | jq '.currentPhase'
```

## npm Scripts

| Script | Command |
|--------|---------|
| `pnpm cap:smoke` | Smoke test capture |
| `pnpm cap:buttons` | Button animation capture |
| `pnpm cap:newtopics` | New topics animation |
| `pnpm cap:menu-open` | Menu open animation |
| `pnpm cap:menu-close` | Menu close animation |
| `pnpm diff:pipeline` | Run diff pipeline |
| `pnpm diff:analyze` | Run analysis |
| `pnpm iterate:electricity` | Full electricity iteration |

## Dual Diff Analysis Stack

The pipeline runs two complementary SSIM analyses:

### Frame SSIM (Primary)
- **Tool:** `analyze.mjs`
- **Method:** Compares each captured PNG frame to a reference PNG
- **Output:** Best frame SSIM, mean SSIM, diff heatmap
- **Use:** Spatial accuracy, bolt structure matching

### Video SSIM (Secondary)
- **Tool:** `video-analyze.mjs`
- **Method:** FFmpeg SSIM filter comparing APNG animations
- **Output:** Per-frame SSIM scores, aggregate SSIM, temporal consistency
- **Use:** Animation timing, color matching, overall video quality

### Interpreting Dual Scores

| Frame SSIM | Video SSIM | Diagnosis |
|------------|------------|-----------|
| High | High | Effect matches well |
| High | Low | Spatial OK, timing/color off |
| Low | High | Good animation, spatial structure differs |
| Low | Low | Major differences, needs work |

## Baseline Metrics

Before starting iterations, extract baseline metrics from reference images:

### Static Baseline (baseline_metrics.json)
Extracted from `electricity_animation_effect_static_diff_analysis.png`:
- Core brightness
- Effect coverage %
- Color palette (brightest hex values)
- Intensity distribution

### Animation Baseline (baseline_animation_metrics.json)
Extracted from `electricity_animation_effect_diff_analysis.apng`:
- Frame count, FPS
- Brightness range (min/max/mean)
- Flicker oscillation count
- Motion energy (frame-to-frame change)
- Color consistency %
- Key frames (peak, representative)

### Using Baselines in Iteration
The pipeline loads both baseline files and includes their targets in the iteration feedback, enabling comparison against reference characteristics.

**Note:** Both baselines are fully applicable in Phase 1 (constant intensity vs constant intensity). In Phase 2, baselines are used for Phase 1 preservation checks only.

## Parameter Categories

### Phase 1 Locked (DO NOT modify after Phase 1)
| File | Parameters |
|------|------------|
| `shaders.ts` | orangeTint, u_intensity, bloom weights, exposure, tonemapping |
| `boltGenerator.ts` | BOLT_WIDTH, BRANCH_PROBABILITY, SEGMENT_LENGTH, JITTER |
| `config.ts` | plasmaDensity, bloom weights, toneMapExposure, centerGlowStrength |

### Phase 2 Tunable (envelope only)
| File | Parameters |
|------|------------|
| `useElectricityEffect.ts` | intensityEnvelope, envelopeTiming, fadeIn/fadeOut |
| `boltGenerator.ts` | spawnRateMultiplier, intensityMultiplier (over time) |
| `config.ts` | buildDurationMs, peakDurationMs, decayDurationMs, envelopeCurve |

## Scoring Thresholds

| Score | Rating | Action |
|-------|--------|--------|
| >= 0.95 | EXCELLENT | Auto-complete |
| 0.85–0.95 | GOOD | Continue if improving |
| 0.70–0.85 | ACCEPTABLE | Needs work |
| < 0.70 | POOR | Major changes needed |

## Exit Conditions

### Phase 1 Exit
| Condition | Action |
|-----------|--------|
| Mean SSIM >= 0.95 | Excellent — may complete early |
| Mean SSIM >= 0.90 AND human approves | **PHASE 1 COMPLETE** → Lock parameters |
| Plateau (3 iterations <1% change) | Stop, human decides |
| Tool failure | Stop, report error |
| Human interrupt | Stop immediately |

### Phase 2 Exit
| Condition | Action |
|-----------|--------|
| Envelope matches spec | **PHASE 2 COMPLETE** |
| Phase 1 regression detected | STOP — investigate |
| Human approves | Complete |

### Phase Transition
| Condition | Action |
|-----------|--------|
| Phase 1 → Phase 2 | **MANDATORY:** Lock Phase 1 parameters |

## Human Checkpoints

**Setup Phase:**
- Viewport verified?
- Crop calibrated?
- Mask verified?
- Timing verified?
- Baselines extracted?

**Phase 1:**
- All frames at peak intensity?
- SSIM improving?
- Ready to lock parameters?

**Phase 2:**
- Envelope matches spec?
- Phase 1 quality preserved?

## Related Documentation

| Document | Location |
|----------|----------|
| Full Skill Documentation | `animations/shared/docs/SKILL.md` |
| Setup Session Guide | `animations/shared/docs/sessions/session-setup.md` |
| Iteration Session Guide | `animations/shared/docs/sessions/session-iteration.md` |
| Viewport Debug Workflow | `animations/shared/docs/workflows/viewport-debug-workflow.md` |
| Crop Calibration Workflow | `animations/shared/docs/workflows/crop-calibration-workflow.md` |
| Timing Verification Workflow | `animations/shared/docs/workflows/timing-verification-workflow.md` |
| Troubleshooting | `animations/shared/docs/references/troubleshooting.md` |
| Capture Failure Diagnosis | `animations/shared/docs/analysis/capture-failure-diagnosis.md` |
