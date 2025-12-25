# Existing Tools Reference

**Purpose:** Document all animation pipeline tools  
**Location:** `animations/shared/docs/references/existing-tools.md`

---

## Capture Tools

### animations/shared/capture/video.mjs (PRIMARY)

**Primary capture tool.** Puppeteer CDP screencast for smooth animation capture.

> **Why Puppeteer?** Puppeteer renders WebGL electricity effects correctly while Playwright does not.
> **Why screencast?** CDP screencast captures at higher framerate than burst screenshots.

```bash
node animations/shared/capture/video.mjs [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--scenario` | Scenario name | `electricity-portal` |
| `--label` | Output label | `video` |
| `--mode` | Trigger mode | `newtopics` |
| `--duration` | Recording duration (ms) | 4000 |
| `--settleMs` | Wait before trigger | 500 |
| `--fps` | Output framerate | 30 |
| `--effectStartMs` | Effect start time | 1200 |
| `--effectEndMs` | Effect end time | 2000 |
| `--no-mask` | Skip circular mask | false |

**Outputs:**
```
animations/electricity-portal/output/screenshots/timeline/YYYY-MM-DD/HHMMSS__label/
├── frames/           # Raw JPEG frames from screencast
├── crops/            # Cropped PNG frames (465×465)
├── masked/           # Trimmed + circular mask applied
└── animation.apng    # Final animated PNG
```

**Key Features:**
- Uses sharp for cropping (preserves exact 465×465 dimensions)
- Applies circular transparency mask
- Trims to effect timing window (1200ms–2000ms)
- Generates APNG at actual capture framerate

---

### animations/shared/capture/run.mjs (DEPRECATED)

> **⚠️ DEPRECATED:** Use `video.mjs` instead. Burst screenshots have been replaced by CDP screencast for smoother animation capture.

Legacy burst screenshot tool. Kept for reference only.

---

### animations/shared/capture/pick_artifact.mjs

Interactive artifact selector.

```bash
node animations/shared/capture/pick_artifact.mjs
```

---

## Analysis Tools

### animations/shared/diff/pipeline.mjs

**Main iteration orchestrator.** Runs capture → analyze → evaluate → feedback loop.

Supports the **two-phase iteration approach**:
- **Phase 1:** Peak-only capture for visual quality matching
- **Phase 2:** Full envelope capture for temporal implementation

```bash
node animations/shared/diff/pipeline.mjs [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--scenario` | Scenario name | Required |
| `--phase` | Iteration phase (1 or 2) | 1 |
| `--iteration` | Iteration number | Auto-increment |
| `--frames` | Use existing frames dir | Capture new |
| `--skip-capture` | Skip capture step | false |

**Phase-Specific Behavior:**

| Phase | settleMs | duration | Purpose |
|-------|----------|----------|---------|
| 1 | 1000 | 1500 | Skip build phase, capture peak only |
| 2 | 0 | 3500 | Capture full envelope (build→peak→decay) |

**Outputs:**
```
animations/electricity-portal/output/iterations/phase1/iter_NNN_YYYYMMDD_HHMMSS/
├── frames/
├── animation.apng
├── meta.json
├── analysis/
│   ├── best_frame.png
│   ├── diff_heatmap.png
│   ├── comparison.png
│   ├── scores.json
│   └── report.md
└── iteration_state.json
```

---

### animations/shared/diff/analyze.mjs

SSIM analysis engine.

```bash
node animations/shared/diff/analyze.mjs [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--frames` | Frames directory | Required |
| `--reference` | Reference image | From scenario |
| `--mask` | Mask image | From scenario |
| `--output` | Output directory | Same as frames |

**Outputs:**
- `best_frame.png` — Frame with highest SSIM
- `diff_heatmap.png` — Red = differences
- `comparison.png` — Side-by-side reference vs best
- `scores.json` — All frame scores
- `report.md` — Human-readable analysis

---

### animations/shared/diff/crop.mjs

Frame cropping with optional circular mask.

```bash
node animations/shared/diff/crop.mjs [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--input` | Input frames directory | Required |
| `--output` | Output directory | `{input}/crops` |
| `--x`, `--y`, `--width`, `--height` | Crop region | From scenario |
| `--circular` | Apply circular mask | From scenario |

---

### animations/shared/diff/extract-baseline.mjs

Extract baseline metrics from static reference image.

```bash
node animations/shared/diff/extract-baseline.mjs [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--with` | Reference image WITH effect | Required |
| `--without` | Reference image WITHOUT effect | Optional |
| `--output` | Output directory | Required |
| `--name` | Effect name | "effect" |

**Outputs:**
- `baseline_metrics.json` — Color, intensity measurements
- `baseline_report.md` — Human-readable summary
- `quality_spec.json` — Derived quality thresholds
- `golden_mask.png` — Binary scoring mask

---

### animations/shared/diff/extract-baseline-video.mjs

Extract baseline metrics from animated reference (APNG).

```bash
node animations/shared/diff/extract-baseline-video.mjs [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--animation` | Animated reference (APNG) | Required |
| `--output` | Output directory | Required |
| `--name` | Effect name | "effect" |

**Outputs:**
- `baseline_animation_metrics.json` — Temporal and per-frame metrics
- `baseline_animation_report.md` — Human-readable summary
- `brightness_curve.csv` — Frame-by-frame brightness data

---

### animations/shared/diff/run-analysis.mjs

Standalone analysis runner (CLI wrapper).

```bash
node animations/shared/diff/run-analysis.mjs [options]
```

Same options as analyze.mjs.

---

## Top-Level Entry

### animations/shared/iterate.mjs

Top-level CLI entry point. Runs scenarios by name.

```bash
node animations/shared/iterate.mjs <scenario-name>
```

Example:
```bash
node animations/shared/iterate.mjs electricity-portal
```

Equivalent to:
```bash
node animations/shared/diff/pipeline.mjs --scenario electricity-portal
```

---

## Scenario Configuration

### animations/electricity-portal/scenario.json

```json
{
  "name": "electricity-portal",
  "description": "Electricity arc effect inside the portal ring",

  "capture": {
    "viewport": { "width": 1440, "height": 768 },
    "deviceScaleFactor": 1,
    "duration": 3200,
    "fps": 30,
    "captureMode": "video",
    "settleMs": 500,
    "headless": false,
    "mode": "newtopics",
    "crop": {
      "x": 482,
      "y": 39,
      "width": 465,
      "height": 465,
      "circularMask": true,
      "_note": "Centered on portal for 1440x768 viewport, calibrated 2025-12-24"
    },
    "effectTiming": {
      "startMs": 1200,
      "endMs": 2000,
      "_note": "Peak stable window (0.8s duration)"
    }
  },

  "reference": {
    "withEffect": "animations/electricity-portal/references/465x465/electricity_animation_effect_static_diff_analysis.png",
    "withoutEffect": "animations/electricity-portal/references/465x465/electricity_animation_effect_off_baseline.png",
    "animation": "animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis.apng",
    "mask": "animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis_mask.png"
  },

  "thresholds": {
    "ssim": {
      "fail": 0.70,
      "pass": 0.85,
      "good": 0.90,
      "excellent": 0.95
    }
  },

  "convergence": {
    "targetSsim": 0.90,
    "plateauIterations": 3,
    "minImprovement": 0.01
  },

  "setupStatus": {
    "viewportVerified": true,
    "cropCalibrated": true,
    "maskVerified": true,
    "dualMaskCalibrated": true,
    "timingVerified": true,
    "verifiedDate": "2025-12-24",
    "croppingMethod": "sharp-extract",
    "effectTimingMs": "1200-2000",
    "cropCoordinates": "482,39 @ 465x465"
  }
}
```

> **Note:** Full scenario.json includes additional fields for two-phase iteration, parameter categories, and current phase tracking. See `animations/electricity-portal/scenario.json` for complete configuration.

### Two-Phase Configuration Fields

| Field | Description |
|-------|-------------|
| `twoPhaseApproach.phase1` | Peak-only capture settings (settleMs=1000, duration=1500) |
| `twoPhaseApproach.phase2` | Full envelope capture settings (settleMs=0, duration=3500) |
| `parameterCategories.phase1Locked` | Parameters locked after Phase 1 completion |
| `parameterCategories.phase2Tunable` | Parameters allowed to modify in Phase 2 |
| `currentPhase.phase` | Current phase (1 or 2) |
| `currentPhase.status` | Phase status: not_started, in_progress, complete |

---

## Reference Assets

### animations/electricity-portal/references/

```
electricity-portal/
├── 465x465/
│   ├── electricity_animation_effect_static_diff_analysis.png   # Static SSIM reference
│   ├── electricity_animation_effect_diff_analysis.apng         # Animation SSIM reference (aligned)
│   ├── electricity_animation_effect_reference_original.apng    # Original source (archived)
│   ├── electricity_animation_effect_off_baseline.png           # Baseline (no effect)
│   ├── electricity_animation_effect_diff_analysis_mask.png     # Mask (319×317 ellipse)
│   ├── with_effect.png                 # Legacy static reference
│   ├── baseline_metrics.json           # Static baseline (colors, brightness)
│   ├── baseline_animation_metrics.json # Animation baseline (flicker, motion)
│   ├── baseline_report.md              # Static baseline report
│   ├── baseline_animation_report.md    # Animation baseline report
│   ├── brightness_curve.csv            # Frame-by-frame brightness data
│   └── quality_spec.json               # Quality thresholds
└── focus/
    └── electricity-effect-animated reference-video.mp4  # Original Sora source
```

**Mask (calibrated 2025-12-23):**
- **File:** `electricity_animation_effect_diff_analysis_mask.png`
- **Spec:** White ellipse on black, center (232.5, 232.5), radii (159.5, 158.5), 319×317 inner

**Note:** Primary references are AI-generated from Sora/Luma (2025-12-22). Legacy references preserved for comparison.

### Baseline Extraction Workflow

Run these **once** before starting iterations:

```bash
# 1. Extract STATIC baseline
node animations/shared/diff/extract-baseline.mjs \
  --with animations/electricity-portal/references/465x465/electricity_animation_effect_static_diff_analysis.png \
  --without animations/electricity-portal/references/465x465/electricity_animation_effect_off_baseline.png \
  --output animations/electricity-portal/references/465x465/ \
  --name electricity

# 2. Extract ANIMATION baseline
node animations/shared/diff/extract-baseline-video.mjs \
  --animation animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis.apng \
  --output animations/electricity-portal/references/465x465/ \
  --name electricity
```

**Static Baseline Outputs:**
- `baseline_metrics.json` — Color, intensity, structure metrics
- `baseline_report.md` — Human-readable summary
- `quality_spec.json` — Quality thresholds
- `golden_mask.png` — Binary scoring mask

**Animation Baseline Outputs:**
- `baseline_animation_metrics.json` — Temporal and per-frame metrics
- `baseline_animation_report.md` — Human-readable summary
- `brightness_curve.csv` — Frame-by-frame brightness data

---

## Output Directories

### animations/electricity-portal/output/screenshots/timeline/

Capture outputs organized by date and time:

```
timeline/
├── 2025-12-22/
│   ├── 143052__electricity-portal/
│   │   ├── crops/
│   │   ├── meta.json
│   │   └── frame_timing.json
│   └── 145230__electricity-portal/
└── LATEST -> 2025-12-22/145230__electricity-portal
```

### animations/electricity-portal/output/iterations/

Iteration outputs organized by phase:

```
iterations/
├── phase1/                             # Peak Visual Quality
│   ├── iter_001_20251222_143052/
│   ├── iter_002_20251222_145230/
│   └── LATEST.txt
├── phase2/                             # Envelope Implementation
│   ├── iter_001_20251222_160000/
│   └── LATEST.txt
└── PHASE_STATUS.json                   # Current phase and locked params
```

**PHASE_STATUS.json** tracks:
- Current phase (1 or 2)
- Phase 1 completion status and final SSIM
- Locked parameters (after Phase 1 completes)

### animations/electricity-portal/output/calibration/

Calibration artifacts:

```
calibration/
└── electricity-portal/
    ├── viewport_test.png
    ├── crop_overlay.png
    ├── crop_test.png
    └── verified_config.json
```
