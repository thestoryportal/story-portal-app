# Animation Iteration Pipeline — Skill

**Purpose:** Human-verified visual iteration loop for AAA animation effects
**Location:** `animations/shared/docs/SKILL.md`
**Status:** Requires setup before use

---

## Two-Phase Iteration Strategy

The pipeline uses a **two-phase approach** for effects with temporal envelopes:

| Phase | Goal | Capture Mode | Compare Against | Target |
|-------|------|--------------|-----------------|--------|
| **Phase 1** | Peak Visual Quality | Peak-only (~1.5s) | Sora reference + baselines | SSIM ≥ 0.90 |
| **Phase 2** | Envelope Implementation | Full animation (~3.5s) | Temporal envelope spec | Visual match |

**Why two phases?**
- Sora reference shows constant peak intensity throughout
- Our spec requires build → peak → decay envelope
- Phase 1: Match Sora at constant intensity (apples-to-apples SSIM comparison)
- Phase 2: Add envelope while preserving Phase 1 visual quality

**Critical Rule:** Phase 1 parameters are LOCKED before Phase 2 begins. Phase 2 may only modify envelope-related parameters.

---

## Philosophy

This is NOT a fully autonomous pipeline. It requires **human verification checkpoints** at critical stages. The goal is to combine:
- **Tool precision:** Automated capture, metrics, diff analysis
- **Human judgment:** Visual verification, quality assessment, strategic direction
- **Claude synthesis:** Combining tool output with visual analysis for iteration decisions

**⚠️ Mode Override:** When Animation Iteration Mode is active, its checkpoint rules (pause every 7 iterations, plateau detection) override CLAUDE.md's Standard Mode protocol (stop after every change).

---

## Directory Structure

```
animations/                         # Animation pipeline
├── shared/                         # Shared tooling (all scenarios)
│   ├── capture/                    # Capture tools
│   │   ├── video.mjs               # PRIMARY - Puppeteer CDP screencast
│   │   ├── run.mjs                 # DEPRECATED - burst screenshots
│   │   └── pick_artifact.mjs       # Artifact selector
│   │
│   ├── diff/                       # Analysis tools
│   │   ├── pipeline.mjs            # Main iteration orchestrator
│   │   ├── analyze.mjs             # Frame SSIM analysis (PNG vs PNG)
│   │   ├── video-analyze.mjs       # Video SSIM analysis (APNG vs APNG)
│   │   ├── crop.mjs                # Frame cropping with mask
│   │   ├── extract-baseline.mjs    # Static baseline metric extraction
│   │   ├── extract-baseline-video.mjs  # Animation baseline extraction
│   │   └── run-analysis.mjs        # Standalone analysis runner
│   │
│   ├── rules/                      # Capture guidelines
│   │   ├── ANIMATION_CAPTURE_RULE.md
│   │   └── SCREENSHOT_RULE.md
│   │
│   ├── docs/                       # This documentation
│   │   ├── SKILL.md                # You are here
│   │   ├── sessions/
│   │   │   ├── session-setup.md
│   │   │   └── session-iteration.md
│   │   ├── workflows/
│   │   │   ├── viewport-debug-workflow.md
│   │   │   ├── crop-calibration-workflow.md
│   │   │   └── timing-verification-workflow.md
│   │   ├── references/
│   │   │   ├── troubleshooting.md
│   │   │   ├── electricity-target.md
│   │   │   └── existing-tools.md
│   │   └── analysis/
│   │       └── capture-failure-diagnosis.md
│   │
│   └── iterate.mjs                 # Top-level CLI entry
│
├── electricity-portal/             # Per-scenario directory
│   ├── scenario.json               # Scenario configuration
│   ├── context.md                  # Scenario context
│   ├── references/                 # Reference assets
│   │   ├── 465x465/
│   │   │   ├── sora_reference_frame.png    # Primary static reference (AI-generated)
│   │   │   ├── sora_reference_1.5x.apng    # Primary animation reference (1.5x speed)
│   │   │   ├── with_effect.png             # Legacy static reference
│   │   │   ├── without_effect.png          # Baseline (no effect)
│   │   │   ├── golden_mask_overlay.png     # Reference mask: center (235,232), radii (164,159)
│   │   │   └── golden_mask_capture.png     # Capture mask: center (238.5,235), radii (161.5,160)
│   │   ├── baseline_metrics.json
│   │   └── quality_spec.json
│   └── output/                     # Generated output (.gitignore)
│       └── iterations/
│
├── hamburger/                      # Other scenarios follow same pattern
├── menu-sway/
├── new-topics/
│
└── _archive/                       # Deprecated files (.gitignore)

tools/ai/                           # NON-ANIMATION AI TOOLS (unchanged)
├── inbox/                          # Prompt inbox
├── history/                        # Dev history dataset
└── mcp-server/                     # MCP server
```

---

## Pipeline Phases

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE PIPELINE                                  │
│                                                                           │
│  PHASE 1: VIEWPORT DEBUG (if UI scaling issues)                           │
│  ┌──────────┐                                                             │
│  │ VIEWPORT │  <- Human verifies: "Is entire UI visible?"                 │
│  │  DEBUG   │                                                             │
│  └────┬─────┘                                                             │
│       │                                                                   │
│       v                                                                   │
│  PHASE 2: CROP CALIBRATION                                                │
│  ┌──────────┐    ┌──────────┐                                             │
│  │  CROP    │ -> │  VERIFY  │  <- Human verifies: "Is portal centered?"   │
│  │  SETUP   │    │   CROP   │                                             │
│  └────┬─────┘    └────┬─────┘                                             │
│       │               │                                                   │
│       v               v                                                   │
│  PHASE 3: GOLDEN MASK                                                     │
│  ┌──────────┐    ┌──────────┐                                             │
│  │  CREATE  │ -> │  VERIFY  │  <- Human verifies: "Does mask cover area?" │
│  │   MASK   │    │   MASK   │                                             │
│  └────┬─────┘    └────┬─────┘                                             │
│       │               │                                                   │
│       v               v                                                   │
│  PHASE 4: TIMING VERIFICATION                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                             │
│  │ TRIGGER  │ -> │  TIMING  │ -> │ ANIMATE  │  <- Human verifies effect   │
│  │   TEST   │    │  ADJUST  │    │   GIF    │                             │
│  └──────────┘    └──────────┘    └────┬─────┘                             │
│                                       │                                   │
│                                       v                                   │
│  PHASE 5: ITERATION LOOP                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│  │ CAPTURE  │ -> │ ANALYZE  │ -> │  CLAUDE  │ -> │  ADJUST  │            │
│  │ + GIF    │    │ (tools)  │    │ SYNTHESIS│    │   CODE   │            │
│  └────┬─────┘    └──────────┘    └──────────┘    └────┬─────┘            │
│       ^                                               │                   │
│       └───────────────────────────────────────────────┘                   │
│                          (repeat until success)                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Viewport Debug

**When needed:** If captured screenshots show UI cut off, scaled wrong, or misaligned.

**Workflow:** See `docs/workflows/viewport-debug-workflow.md`

**Purpose:** Ensure the browser viewport captures the full UI correctly before any other calibration.

**Human Checkpoint:**
> "Is the entire UI visible and correctly sized in this capture?"

**DO NOT PROCEED until viewport is verified.**

---

## Phase 2: Crop Calibration

**Purpose:** Establish correct crop region that centers on the effect area.

**Workflow:** See `docs/workflows/crop-calibration-workflow.md`

**Steps:**
1. Capture full viewport screenshot
2. Overlay current crop region
3. **Human reviews:** "Is the effect area centered in the crop box?"
4. If no, adjust coordinates
5. Repeat until human approves
6. Save verified coordinates to scenario config

**Human Checkpoints:**
> "Here is the crop region overlaid. Is the portal centered?" (yes/no)
> "Here is the cropped result. Does this match the reference framing?" (yes/no)

**DO NOT PROCEED until crop is verified.**

---

## Phase 3: Golden Mask Setup

**Purpose:** Create mask that defines the scoring region (where effect should appear).

**Important:** Mask dimensions must match CROP dimensions, not viewport dimensions.

**Steps:**
1. Use verified crop settings from Phase 2
2. Generate mask for the cropped region
3. **Human reviews:** "Does the white area cover where the effect should appear?"

**Human Checkpoint:**
> "Here is the generated mask. The WHITE area is where the effect will be scored. Does this correctly cover the effect area?"

**DO NOT PROCEED until mask is verified.**

---

## Phase 4: Timing Verification

**Purpose:** Ensure capture window catches the effect at peak visibility.

**Workflow:** See `docs/workflows/timing-verification-workflow.md`

**Parameters to tune:**
- `settleMs` — Delay before trigger
- `duration` — Recording duration in ms
- `effectStartMs` — When effect starts after trigger
- `effectEndMs` — When effect ends after trigger

**Steps:**
1. Trigger effect in non-headless mode, human observes
2. Record video via CDP screencast
3. Extract and trim frames to effect window
4. **Human reviews:** "Does the animation show the effect?"

**Human Checkpoints:**
> "Watch the browser. Does the effect appear when triggered?"
> "Here is the captured animation. Is the effect visible and animated?"

**DO NOT PROCEED until capture shows effect.**

---

## Phase 5: Iteration Loop (Two-Phase Approach)

The iteration loop is divided into two distinct phases:

### Phase 1: Peak Visual Quality

**Goal:** Match Sora reference at constant peak intensity.

**Capture Settings:**
- `settleMs: 1000` — Skip build phase
- `duration: 1500` — Capture peak window only

```bash
node animations/shared/diff/pipeline.mjs \
  --scenario electricity-portal \
  --phase 1 \
  --iteration N
```

**Exit Criteria:**
- Mean SSIM ≥ 0.90 AND human approval
- **Then:** Lock Phase 1 parameters before Phase 2

### Phase 2: Envelope Implementation

**Prerequisite:** Phase 1 complete with parameters locked.

**Goal:** Add build and decay envelope while preserving Phase 1 visual quality.

**Capture Settings:**
- `settleMs: 0` — Capture from button press
- `duration: 3500` — Full envelope

```bash
node animations/shared/diff/pipeline.mjs \
  --scenario electricity-portal \
  --phase 2 \
  --iteration N
```

**Exit Criteria:**
- Envelope matches temporal spec
- Human approval
- No regression in Phase 1 quality

### 5.1 Capture + GIF

```bash
node animations/shared/diff/pipeline.mjs --scenario electricity-portal --phase 1 --iteration N
```

**Outputs:**
```
animations/electricity-portal/output/iterations/iter_001_YYYYMMDD_HHMMSS/
├── frames/           # Captured frames
├── animation.apng    # Animated preview (APNG format)
├── meta.json         # Capture metadata
├── iteration_state.json  # Iteration tracking
└── analysis/
    ├── best_frame.png    # Frame with highest SSIM
    ├── diff_heatmap.png  # Red=different, Green=matching
    ├── comparison.png    # Side-by-side (reference vs current)
    ├── scores.json       # Frame SSIM metrics
    └── video/
        └── video_scores.json  # Video SSIM metrics (from video-analyze.mjs)
```

### 5.2 Effect Verification (MANDATORY)

**Metrics can mask total failures.** The pipeline enforces verification:

1. **Automated WebGL check (pipeline.mjs)**
   - Pipeline monitors browser console during capture
   - WebGL compile errors → Pipeline fails fast, reports error
   - Shader errors → Pipeline fails fast, reports which shader
   - No capture proceeds if WebGL broken
   - Exit code non-zero on WebGL failure

2. **Visual verification** — Claude opens animation.apng and confirms effect visible
   - If effect absent: STOP, do not report SSIM as valid
   - Report: "Effect not rendering — investigating"

3. **Sanity threshold** — If SSIM drops >10% in one iteration:
   - Flag as potential failure
   - Verify effect still renders before continuing

4. **Baseline comparison** — Compare against `without_effect.png` (no-effect baseline):
   - If SSIM to without_effect is HIGH (>85%), effect is probably missing
   - Report: "Captured frames match no-effect baseline — effect likely broken"

**Note:** Primary reference is now `sora_reference_frame.png` (AI-generated from Sora/Luma).
Legacy reference `with_effect.png` preserved for historical comparison.

### 5.3 Claude Synthesis (KEY STEP)

Claude must follow the **STRICT TEMPLATE** every iteration:

1. **Verify effect renders** — Check animation.apng shows visible effect
2. **Read tool metrics:** scores.json, video/video_scores.json
3. **View images:** animation.apng, comparison.png, diff_heatmap.png
4. **Synthesize:** Combine quantitative metrics with visual assessment
5. **Propose:** ONE specific change with rationale

**Do not abbreviate or skip sections. Full template required every iteration.**

**Claude's Analysis Framework:**
```markdown
## Dual SSIM Metrics
- Frame SSIM: XX.X%  (spatial accuracy — bolt structure)
- Video SSIM: XX.X%  (animation quality — timing, color)
- Temporal: XX.X%    (animation smoothness)
- Diff pixels: XX.X%
- Best frame: frame_XXX.png

## Score Interpretation
| Frame SSIM | Video SSIM | Diagnosis |
|------------|------------|-----------|
| High | High | Effect matches well |
| High | Low | Spatial OK, timing/color off |
| Low | High | Animation OK, spatial structure differs |
| Low | Low | Major differences |

## Visual Analysis
Looking at comparison.png and animation.apng:
- Color: [matches / too dim / too bright / wrong hue]
- Intensity: [matches / core too dim / glow too weak]
- Structure: [bolts visible / too few / wrong shape]
- Animation: [smooth / choppy / static]

## Synthesis
Frame SSIM of XX% indicates [spatial interpretation].
Video SSIM of XX% indicates [animation interpretation].
Visually I observe [additional insight].
The primary issue is: [specific problem]

## Proposed Change
I will adjust [parameter] in [file]:
- Current: X
- Proposed: Y
- Rationale: [why]

**Awaiting human approval before implementing.**
```

### 5.3 Code Adjustment

**Rules:**
1. **STRICT SINGLE CHANGE** — Exactly ONE parameter modified per iteration
   - ✅ Change `bloomTightWeight: 1.2` → `1.4`
   - ✅ Change `orangeTint.g` from `0.5` → `0.42`
   - ❌ Change both `bloomTightWeight` AND `orangeTint` in same iteration
   - ❌ "Color grading pass" touching multiple values
   - **Why:** If something breaks, you must know exactly what caused it
2. **Small adjustments** — 10-20% changes, not 50%+
3. **Document the change** — What parameter, old value, new value, rationale

**Approval Model:**
- **Iterations 1-6:** Implicit approval (propose + implement in single turn)
- **Iteration 7:** MANDATORY PAUSE — Present summary, await direction
- **Iterations 8-13:** Implicit approval (if human said continue)
- **Pattern:** Pause every 7 iterations for human checkpoint

**Code Targets:**
```
Core (primary iteration targets):
  src/legacy/effects/shaders.ts           # GLSL shaders, color, intensity, glow
  src/legacy/effects/boltGenerator.ts     # Bolt paths, branching, structure
  src/legacy/effects/useElectricityEffect.ts  # WebGL orchestration, timing

Supporting (may also need changes):
  src/legacy/effects/noiseUtils.ts        # Simplex noise, fractal functions
  src/legacy/constants/config.ts          # ELECTRICITY_CONFIG parameters
```

---

## Parameter Categories

### Phase 1 Locked (DO NOT modify after Phase 1 completion)

| File | Parameters |
|------|------------|
| `shaders.ts` | orangeTint (vec3), u_intensity, u_bloomTightWeight, u_bloomMedWeight, u_bloomWideWeight, u_exposure, ACES coefficients |
| `boltGenerator.ts` | BOLT_WIDTH, BRANCH_PROBABILITY, SEGMENT_LENGTH, JITTER, MAX_BRANCHES, path algorithms |
| `config.ts` | plasmaDensity, bloomTightWeight, bloomMedWeight, bloomWideWeight, toneMapExposure, centerGlowStrength |

### Phase 2 Tunable (envelope parameters only)

| File | Parameters |
|------|------------|
| `useElectricityEffect.ts` | intensityEnvelope, envelopeTiming, fadeInDuration, fadeOutDuration |
| `boltGenerator.ts` | spawnRateMultiplier (over time), intensityMultiplier (over time) |
| `config.ts` | buildDurationMs, peakDurationMs, decayDurationMs, envelopeCurve |

**⚠️ Phase 2 CONSTRAINT:** Phase 1 locked parameters MUST NOT be modified.

---

## Convergence Criteria

### Phase 1 Exit Conditions

| Condition | Action |
|-----------|--------|
| Mean SSIM >= 0.95 | **EXCELLENT** — May complete early |
| Mean SSIM >= 0.90 AND human approves | **PHASE 1 COMPLETE** → Lock parameters |
| Plateau (3 iterations <1% change) | STOP — Human decides |
| Iteration 7, 14, 21... | **MANDATORY PAUSE** — Human checkpoint |

### Phase 2 Exit Conditions

| Condition | Action |
|-----------|--------|
| Envelope matches temporal spec | **ELIGIBLE FOR COMPLETION** |
| Human approves | **PHASE 2 COMPLETE** |
| Phase 1 quality regression detected | **STOP** — Investigate locked parameters |

### Phase Transition

| Transition | Requirement |
|------------|-------------|
| Phase 1 → Phase 2 | **MANDATORY:** Lock Phase 1 parameters and document |

**No absolute iteration cap.** Human decides when to stop at each 7-iteration checkpoint.

**Plateau Detection (STRICT):**
| Condition | Action |
|-----------|--------|
| 3 iterations with \|net change\| < 1% | **MANDATORY ESCALATION** |

- Trigger: 3 consecutive iterations where SSIM oscillates within 1% band
- Action: STOP immediately, regardless of iteration count
- Present: "Plateau detected — stuck in X-Y% range"
- Options: Try different approach, accept current quality, or force continue

**Human Override:** At any point, human can declare "good enough" or "keep going" regardless of metrics.

---

## Human Checkpoint Summary

### Setup Phases

| Phase | Checkpoint | Question |
|-------|------------|----------|
| 1 | Viewport | "Is the entire UI visible and correctly sized?" |
| 2 | Crop overlay | "Is effect area centered in the crop box?" |
| 2 | Crop verify | "Does cropped image correctly frame the effect?" |
| 3 | Mask preview | "Does mask cover where effect should appear?" |
| 4 | Trigger test | "Does effect appear when triggered?" |
| 4 | Animation | "Is effect visible in captured animation?" |

### Iteration Phase 1 (Peak Quality)

| Checkpoint | Question |
|------------|----------|
| Effect verification | "Are all frames showing peak intensity (no build/decay)?" |
| SSIM progress | "Is SSIM improving?" |
| Phase 1 completion | "Ready to lock parameters and proceed to Phase 2?" |

### Iteration Phase 2 (Envelope)

| Checkpoint | Question |
|------------|----------|
| Envelope check | "Does build/peak/decay match the temporal spec?" |
| Phase 1 preservation | "Is peak quality preserved (no regression)?" |
| Phase 2 completion | "Is the full animation acceptable?" |

---

## Quick Reference Commands

```bash
# Run Phase 1 pipeline iteration (peak-only capture)
node animations/shared/diff/pipeline.mjs \
  --scenario electricity-portal \
  --phase 1 \
  --iteration N

# Run Phase 2 pipeline iteration (full envelope capture)
node animations/shared/diff/pipeline.mjs \
  --scenario electricity-portal \
  --phase 2 \
  --iteration N

# Capture video (primary method)
node animations/shared/capture/video.mjs --scenario electricity-portal

# Analyze existing frames
node animations/shared/diff/analyze.mjs --frames /path/to/frames

# Extract STATIC baseline from reference image
node animations/shared/diff/extract-baseline.mjs \
  --with animations/electricity-portal/references/465x465/sora_reference_frame.png \
  --without animations/electricity-portal/references/465x465/without_effect.png \
  --output animations/electricity-portal/references/465x465/ \
  --name electricity

# Extract ANIMATION baseline from reference APNG
node animations/shared/diff/extract-baseline-video.mjs \
  --animation animations/electricity-portal/references/465x465/sora_reference_1.5x.apng \
  --output animations/electricity-portal/references/465x465/ \
  --name electricity

# Check current phase status
cat animations/electricity-portal/scenario.json | jq '.currentPhase'
```

## Baseline Extraction (Required Before Iteration)

Before starting iterations, extract baseline metrics from both static and animated references:

### Static Baseline
Extracts color profile, intensity distribution, effect region from static reference PNG.

**Outputs:**
- `baseline_metrics.json` — Color, intensity, structure metrics
- `baseline_report.md` — Human-readable summary
- `quality_spec.json` — Quality thresholds
- `golden_mask.png` — Binary scoring mask

### Animation Baseline
Extracts temporal characteristics from animated reference APNG.

**Outputs:**
- `baseline_animation_metrics.json` — Per-frame and temporal metrics
- `baseline_animation_report.md` — Human-readable summary
- `brightness_curve.csv` — Frame-by-frame brightness data

### Metrics Used in Iteration

| Baseline | Metrics | Purpose |
|----------|---------|---------|
| Static | Core brightness, color palette, effect coverage | Frame SSIM comparison |
| Animation | Flicker rate, motion energy, color consistency | Video SSIM comparison |

---

## Related Documentation

| File | Purpose |
|------|---------|
| `docs/workflows/viewport-debug-workflow.md` | Phase 1 details |
| `docs/workflows/crop-calibration-workflow.md` | Phase 2 details |
| `docs/workflows/timing-verification-workflow.md` | Phase 4 details |
| `docs/sessions/session-setup.md` | Complete setup walkthrough |
| `docs/sessions/session-iteration.md` | Iteration loop guide |
| `docs/references/existing-tools.md` | Tool documentation |
| `docs/references/troubleshooting.md` | Common issues |

---

## Session Entry Points

### First Time Setup
```
"I need to set up the animation iteration pipeline.
Start with setup Phase 1: Viewport Debug."
```

### Begin Phase 1 (Peak Quality)
```
"Setup is verified. Let's begin Phase 1 iteration on the electricity effect.
Goal: Match Sora reference at peak intensity."
```

### Resuming Phase 1
```
"Continue Phase 1 iteration on electricity effect.
Last iteration was #N with SSIM XX%."
```

### Begin Phase 2 (Envelope)
```
"Phase 1 is complete with SSIM XX%.
Parameters are locked. Let's begin Phase 2: envelope implementation.
Goal: Add build/peak/decay while preserving Phase 1 quality."
```

### Resuming Phase 2
```
"Continue Phase 2 envelope iteration.
Last Phase 2 iteration was #N.
Show me the current build/peak/decay behavior."
```
