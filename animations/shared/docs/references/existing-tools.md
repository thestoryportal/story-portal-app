# Existing Tools Reference

**Purpose:** Document all animation pipeline tools  
**Location:** `animations/shared/docs/references/existing-tools.md`

---

## Capture Tools

### animations/shared/capture/run.mjs

**Primary capture tool.** Puppeteer-based with CDP screenshot API and WebGL extraction.

```bash
node animations/shared/capture/run.mjs [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--scenario` | Scenario name (loads from scenarios/) | Required |
| `--mode` | Capture mode | `burst` |
| `--headless` | Run headless | `true` |
| `--viewport` | Viewport size | From scenario |
| `--deviceScaleFactor` | DPI scale | From scenario |
| `--burstFrames` | Number of frames | 60 |
| `--burstIntervalMs` | Frame interval | 25 |
| `--settleMs` | Delay after trigger | 0 |
| `--no-crop` | Skip cropping | false |
| `--overlay-crop` | Show crop region | false |

**Outputs:**
```
animations/electricity-portal/output/screenshots/timeline/YYYY-MM-DD/HHMMSS__scenario-name/
├── crops/
│   ├── frame_000.png
│   ├── frame_001.png
│   └── ...
├── meta.json
└── frame_timing.json
```

---

### animations/shared/capture/click_burst.mjs

Click an element then capture burst of frames.

```bash
node animations/shared/capture/click_burst.mjs --selector "[data-testid='btn']" --frames 60
```

---

### animations/shared/capture/sequence_burst.mjs

Multi-step sequence with bursts at each step.

```bash
node animations/shared/capture/sequence_burst.mjs --config sequence.json
```

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

```bash
node animations/shared/diff/pipeline.mjs [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--scenario` | Scenario name | Required |
| `--iteration` | Iteration number | Auto-increment |
| `--frames` | Use existing frames dir | Capture new |
| `--skip-capture` | Skip capture step | false |

**Outputs:**
```
animations/electricity-portal/output/iterations/scenario-name/iter_NNN_YYYYMMDD_HHMMSS/
├── frames/
├── animation.gif
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

Extract baseline metrics from reference image.

```bash
node animations/shared/diff/extract-baseline.mjs [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--reference` | Reference image path | Required |
| `--output` | Output directory | Same as reference |
| `--generate-mask` | Generate golden mask | false |
| `--threshold` | Mask threshold | 0.1 |

**Outputs:**
- `baseline_metrics.json` — Color, intensity measurements
- `baseline_report.md` — Human-readable summary
- `quality_spec.json` — Derived quality thresholds
- `golden_mask.png` — Binary scoring mask (if --generate-mask)

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
  "description": "Portal electricity effect iteration",
  
  "capture": {
    "viewport": { "width": 1920, "height": 1080 },
    "deviceScaleFactor": 1,
    "burstFrames": 60,
    "burstIntervalMs": 25,
    "settleMs": 0
  },
  
  "crop": {
    "x": 685,
    "y": 265,
    "width": 550,
    "height": 550,
    "circularMask": true
  },
  
  "trigger": {
    "type": "click",
    "selector": "[data-testid='btn-new-topics']"
  },
  
  "references": {
    "withEffect": "animations/electricity-portal/references/465x465/with_effect.png",
    "withoutEffect": "animations/electricity-portal/references/465x465/without_effect.png",
    "mask": "animations/electricity-portal/references/465x465/golden_mask.png"
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
    "maxIterations": 20,
    "plateauIterations": 3,
    "minImprovement": 0.01
  },
  
  "codeTargets": [
    "src/legacy/effects/shaders.ts",
    "src/legacy/effects/boltGenerator.ts",
    "src/legacy/effects/useElectricityEffect.ts"
  ],
  
  "setupStatus": {
    "viewportVerified": false,
    "cropCalibrated": false,
    "maskVerified": false,
    "timingVerified": false
  }
}
```

---

## Reference Assets

### animations/electricity-portal/references/

```
electricity-portal/
├── 465x465/
│   ├── with_effect.png      # Target reference (effect at peak)
│   ├── without_effect.png   # Baseline (no effect)
│   └── golden_mask.png      # Scoring mask
├── baseline_metrics.json    # Extracted metrics
├── baseline_report.md       # Human-readable
└── quality_spec.json        # Thresholds
```

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

Iteration outputs per scenario:

```
iterations/
├── electricity-portal/
│   ├── iter_001_20251222_143052/
│   ├── iter_002_20251222_145230/
│   └── LATEST.txt
└── hamburger/
    └── ...
```

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
