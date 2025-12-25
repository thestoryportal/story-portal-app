# Visual Iteration Mode

Activate visual iteration mode for animation effects using the **two-phase approach**.

## Two-Phase Strategy Overview

| Phase | Goal | Capture | Compare Against |
|-------|------|---------|-----------------|
| **Phase 1** | Peak Visual Quality | Peak-only (~1.5s) | Sora reference + baselines |
| **Phase 2** | Envelope Implementation | Full animation (~3.5s) | Temporal envelope spec |

**Why two phases?**
- Sora reference shows constant peak intensity
- Our spec requires build → peak → decay envelope
- Phase 1: Match Sora at constant intensity (apples-to-apples SSIM)
- Phase 2: Add envelope while preserving Phase 1 quality

---

## Activation

When user says "iterate on [effect]" or "visual iteration mode":

### Step 1: Ingest Core Documentation (MANDATORY)

**Read these files before doing anything else:**

1. **`.claude/skills/story-portal/references/animation-iteration.md`** — Unified animation skill
   - Quick commands
   - Two-phase approach overview
   - Checkpoint rules
   - Key file paths and source code references

2. **animations/<scenario>/scenario.json** — Scenario configuration
   - `twoPhaseApproach` — Phase settings
   - `parameterCategories` — Locked vs tunable parameters
   - `currentPhase` — Which phase we're in

### Step 2: Check Setup Status

```bash
cat animations/electricity-portal/scenario.json | jq '.setupStatus'
```

All must be `true`: viewportVerified, cropCalibrated, maskVerified, timingVerified, baselinesExtracted

### Step 3: Verify Baseline Metrics Exist

```bash
ls -la animations/electricity-portal/references/465x465/baseline*.json
```

Required:
- `baseline_metrics.json` — Static reference metrics
- `baseline_animation_metrics.json` — Animation reference metrics

If missing, extract baselines:
```bash
# Static baseline
node animations/shared/diff/extract-baseline.mjs \
  --with animations/electricity-portal/references/465x465/electricity_animation_effect_static_diff_analysis.png \
  --without animations/electricity-portal/references/465x465/electricity_animation_effect_off_baseline.png \
  --output animations/electricity-portal/references/465x465/ \
  --name electricity

# Animation baseline
node animations/shared/diff/extract-baseline-video.mjs \
  --animation animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis.apng \
  --output animations/electricity-portal/references/465x465/ \
  --name electricity
```

### Step 4: Check Current Phase

```bash
cat animations/electricity-portal/scenario.json | jq '.currentPhase'
```

---

## Phase 1: Peak Visual Quality

### Goal
Match Sora reference at constant peak intensity. All captured frames should be at peak — no build, no decay.

### Capture Settings
- `settleMs: 1000` — Skip build phase
- `duration: 1500` — Capture peak window only

### Run Pipeline
```bash
node animations/shared/diff/pipeline.mjs \
  --scenario electricity-portal \
  --phase 1 \
  --iteration N
```

### Phase 1 Checklist
- [ ] Read `animation-iteration.md` skill
- [ ] Verify all frames show peak intensity (no build/decay)
- [ ] Use Phase 1 output template from skill
- [ ] Only modify Phase 1 parameters

### Phase 1 Exit Criteria
- Mean SSIM ≥ 90%
- Human approval
- **Then:** Lock Phase 1 parameters before Phase 2

---

## Phase 2: Envelope Implementation

### Prerequisite
Phase 1 must be complete with parameters locked.

### Goal
Add build and decay envelope while preserving Phase 1 visual quality.

### Capture Settings
- `settleMs: 0` — Capture from button press
- `duration: 3500` — Full envelope

### Run Pipeline
```bash
node animations/shared/diff/pipeline.mjs \
  --scenario electricity-portal \
  --phase 2 \
  --iteration N
```

### Temporal Envelope Spec
| Phase | Duration | Behavior |
|-------|----------|----------|
| Build | 800-1200ms | Bolts energize from rim inward, ease-in |
| Peak | 1000-1500ms | Full intensity, sustained flicker |
| Decay | 500-800ms | Fade out, ease-out |

### Phase 2 Checklist
- [ ] Phase 1 complete and parameters locked
- [ ] Only modify Phase 2 tunable parameters
- [ ] Verify peak frames still match Phase 1 quality
- [ ] Use Phase 2 synthesis template

### Phase 2 Exit Criteria
- Envelope matches temporal spec
- Human approval
- No regression in Phase 1 quality

---

## Human Checkpoints

**Both Phases:**
- Iterations 1-6: Implicit approval
- Iteration 7, 14, 21...: **MANDATORY PAUSE**
- Plateau (3 iter <1% change): **MANDATORY STOP**
- Human interrupt: Stop immediately

**Phase Transition:**
- Phase 1 → Phase 2: **MANDATORY LOCK** of Phase 1 parameters

---

## Calibrated Values (electricity-portal)

Verified 2025-12-22:

| Parameter | Value |
|-----------|-------|
| **Viewport** | 1440×768 @ 1x scale |
| **Crop** | (482, 39) @ 465×465 |
| **Effect Timing** | 1200–2000ms |
| **Cropping** | sharp extract (not ffmpeg) |

### Mask
| File | Center | Radii |
|------|--------|-------|
| `electricity_animation_effect_diff_analysis_mask.png` | (232.5, 232.5) | (159.5, 158.5) |

---

## Key Paths

| Path | Purpose |
|------|---------|
| `animations/shared/diff/pipeline.mjs` | Main iteration pipeline |
| `animations/shared/diff/analyze.mjs` | Frame SSIM analysis |
| `animations/shared/diff/extract-baseline.mjs` | Static baseline extraction |
| `animations/shared/diff/extract-baseline-video.mjs` | Animation baseline extraction |
| `animations/<scenario>/scenario.json` | Scenario + phase configuration |

## Parameter Categories

### Phase 1 Locked (after Phase 1 completion)
- `shaders.ts`: orangeTint, u_intensity, bloom weights, exposure
- `boltGenerator.ts`: BOLT_WIDTH, BRANCH_PROBABILITY, SEGMENT_LENGTH, JITTER
- `config.ts`: plasmaDensity, bloom weights, toneMapExposure

### Phase 2 Tunable (envelope only)
- `useElectricityEffect.ts`: intensityEnvelope, envelopeTiming
- `boltGenerator.ts`: spawnRateMultiplier, intensityMultiplier (over time)
- `config.ts`: buildDurationMs, peakDurationMs, decayDurationMs

---

## Documentation

| Document | Purpose |
|----------|---------|
| `.claude/skills/story-portal/references/animation-iteration.md` | **Primary** — Unified animation skill |
| `animations/shared/docs/references/troubleshooting.md` | Common issues and fixes |
| `animations/shared/docs/SKILL.md` | Full pipeline documentation |
