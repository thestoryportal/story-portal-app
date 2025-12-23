# Animation Iteration Session

**Purpose:** Two-phase visual iteration loop with Claude synthesis
**Prerequisite:** Setup phases 1-5 complete and verified
**Location:** `animations/shared/docs/sessions/session-iteration.md`

---

## Two-Phase Iteration Strategy

The electricity effect uses a **two-phase iteration approach**:

| Phase | Goal | Capture Mode | Compare Against | Target |
|-------|------|--------------|-----------------|--------|
| **Phase 1** | Peak Visual Quality | Peak-only (~1.5s) | Sora reference + all baselines | SSIM ≥ 0.90 |
| **Phase 2** | Envelope Implementation | Full animation (~3.5s) | Temporal envelope spec | Visual match |

**Why two phases?**
- Sora reference shows constant peak intensity throughout
- Our spec requires build → peak → decay envelope
- Phase 1: Iterate SSIM against Sora (apples-to-apples, constant intensity)
- Phase 2: Add envelope while preserving Phase 1 visual quality

**Critical Rule:** Phase 1 parameters are LOCKED before Phase 2 begins. Phase 2 may only modify envelope-related parameters.

---

## Before Starting

### Verify Setup Complete

```bash
cat animations/electricity-portal/scenario.json | jq '.setupStatus'
```

All should be `true`:
- `viewportVerified`
- `cropCalibrated`
- `maskVerified`
- `timingVerified`
- `videoPipelineVerified`
- `referenceAlignmentComplete`

If any are false, complete setup first: `animations/shared/docs/sessions/session-setup.md`

### Reference Files

| File | Purpose |
|------|---------|
| `electricity_animation_effect_static_diff_analysis.png` | Static SSIM target |
| `electricity_animation_effect_diff_analysis.apng` | **Animation SSIM target** |
| `electricity_animation_effect_off_baseline.png` | Baseline (effect off) |
| `electricity_animation_effect_diff_analysis_mask.png` | Mask (319×317 ellipse) |
| `electricity_animation_effect_reference_original.apng` | Original (25MB, archived) |

**Alignment:** 452×463, offset (5, 1) on 465×465 canvas

### Verify Baselines Exist

```bash
ls -la animations/electricity-portal/references/465x465/baseline*.json
```

Required:
- `baseline_metrics.json` — Static reference metrics
- `baseline_animation_metrics.json` — Animation reference metrics

### Verify Dev Server

```bash
curl -s http://localhost:5173 | grep -q "vite" && echo "✓ Ready" || echo "✗ Run: pnpm dev"
```

### Check Current Phase

```bash
cat animations/electricity-portal/scenario.json | jq '.currentPhase'
```

---

## PHASE 1: Peak Visual Quality

### Goal

Match Sora reference at constant peak intensity. All frames captured should be at peak intensity — no build, no decay.

### Capture Settings

For Phase 1, modify capture timing to skip the build phase:
- `settleMs: 1000` — Wait 1s after trigger (skip build)
- `duration: 1500` — Capture ~1.5s of peak intensity

### Step 1.1: Run Pipeline (Phase 1 Mode)

```bash
node animations/shared/diff/pipeline.mjs \
  --scenario electricity-portal \
  --phase 1 \
  --iteration N
```

### Step 1.2: Review Outputs

```
animations/electricity-portal/output/iterations/phase1/iter_00N_YYYYMMDD_HHMMSS/
├── frames/                    # All frames should show peak intensity
├── animation.apng             # Should be constant peak (like Sora)
├── meta.json
├── iteration_state.json
└── analysis/
    ├── best_frame.png
    ├── diff_heatmap.png
    ├── comparison.png
    ├── scores.json            # All frames should have similar SSIM
    └── report.md
```

### Step 1.3: Effect Verification

1. **All frames at peak** — Open animation.apng, verify constant intensity (no build/decay)
2. **WebGL OK** — No shader errors in pipeline output
3. **Effect visible** — SSIM to without_effect < 85%

### Step 1.4: Claude Synthesis (Phase 1 Template)

```markdown
## Phase 1 — Iteration N — [timestamp]

### SSIM Metrics (All frames should be similar)
| Metric | Value | Delta | Status |
|--------|-------|-------|--------|
| Mean SSIM | XX.X% | +/-X.X% | ⬆️/⬇️/➡️ |
| Best Frame | XX.X% | +/-X.X% | ⬆️/⬇️/➡️ |
| Std Dev | X.X% | — | [low=good, high=inconsistent] |

### Effect Verification
- [ ] All frames show peak intensity (no build/decay visible)
- [ ] No WebGL errors in pipeline output
- [ ] SSIM to without_effect < 85%

### Visual Analysis
- **comparison.png:** [color match, brightness, bolt structure vs Sora]
- **diff_heatmap.png:** [primary difference areas, intensity, pattern]

### Baseline Comparison (Fully Applicable in Phase 1)
**Static (baseline_metrics.json):**
- Core brightness: [target] — Current: [observed]
- Effect coverage: [target]% — Current: [observed]%
- Color palette: [matches/diverges]

**Animation (baseline_animation_metrics.json):**
- Flicker character: [target] — Current: [observed]
- Motion energy: [target] — Current: [observed]
- Color consistency: [target]% — Current: [observed]%

### Synthesis
Mean SSIM of XX% indicates [interpretation].
Visual observation: [specific insight].
Primary issue: [specific problem to address]

### Change Made (SINGLE — Phase 1 parameters only)
- File: [path]
- Parameter: [name]
- Old: [value] → New: [value]
- Rationale: [why]

### Next Action
[Continue / Plateau detected / Checkpoint at iter 7 / Phase 1 Complete]
```

### Step 1.5: Approval Model

**Implicit approval (iterations 1-6, 8-13, etc.):**
- Claude proposes and implements in single turn
- Continuing = approval
- Human can interrupt with "stop"

**Mandatory pause (iteration 7, 14, 21...):**
- Present cumulative summary
- Await explicit direction

### Step 1.6: Phase 1 Exit Criteria

| Condition | Action |
|-----------|--------|
| Mean SSIM ≥ 90% | Eligible for Phase 1 completion |
| Human approves | **PHASE 1 COMPLETE** |
| Plateau (3 iter <1% change) | Stop, human decides |

### Step 1.7: Lock Parameters

**Before proceeding to Phase 2, explicitly document locked parameters:**

```markdown
## Phase 1 Completion Report

**Final SSIM:** XX.X%
**Completion Date:** YYYY-MM-DD

### Locked Parameters (DO NOT MODIFY IN PHASE 2)

**shaders.ts:**
- orangeTint: vec3(X.X, X.X, X.X)
- u_intensity: X.X
- u_bloomTightWeight: X.X
- u_bloomMedWeight: X.X
- u_exposure: X.X

**boltGenerator.ts:**
- BOLT_WIDTH: X.X
- BRANCH_PROBABILITY: X.X
- SEGMENT_LENGTH: X
- JITTER: X.X

**config.ts:**
- plasmaDensity: X.X
- bloomTightWeight: X.X
- toneMapExposure: X.X
- centerGlowStrength: X.X
```

Update scenario.json:
```bash
# Mark Phase 1 complete and record locked parameters
cat animations/electricity-portal/scenario.json | jq '.currentPhase = {
  "phase": 2,
  "status": "ready",
  "phase1CompletedDate": "'"$(date -Iseconds)"'",
  "phase1FinalSsim": 0.XX
}' > temp.json && mv temp.json animations/electricity-portal/scenario.json
```

---

## PHASE 2: Envelope Implementation

### Prerequisite

Phase 1 must be complete with:
- Mean SSIM ≥ 0.90
- Human approval
- Parameters locked and documented

### Goal

Add build and decay envelope while preserving Phase 1 visual quality at peak.

### Capture Settings

For Phase 2, capture the full animation:
- `settleMs: 0` — Capture from button press
- `duration: 3500` — Full envelope (~3.5s)

### Temporal Envelope Spec

| Phase | Duration | Behavior | Curve |
|-------|----------|----------|-------|
| **Build** | 800-1200ms | Bolts energize from inner rim inward to center | ease-in |
| **Peak** | 1000-1500ms | Full intensity, sustained with natural flicker | sustained |
| **Decay** | 500-800ms | Intensity decreases, bolts fade out | ease-out |

**Total:** 2500-3500ms

### Phase 2 Tunable Parameters (ONLY these may be modified)

| File | Parameters |
|------|------------|
| `useElectricityEffect.ts` | intensityEnvelope, envelopeTiming, fadeInDuration, fadeOutDuration |
| `boltGenerator.ts` | spawnRateMultiplier (over time), intensityMultiplier (over time) |
| `config.ts` | buildDurationMs, peakDurationMs, decayDurationMs, envelopeCurve |

**CONSTRAINT:** Phase 1 locked parameters MUST NOT be modified.

### Step 2.1: Run Pipeline (Phase 2 Mode)

```bash
node animations/shared/diff/pipeline.mjs \
  --scenario electricity-portal \
  --phase 2 \
  --iteration N
```

### Step 2.2: Review Outputs

The animation.apng should now show the full envelope: build → peak → decay.

### Step 2.3: Claude Synthesis (Phase 2 Template)

```markdown
## Phase 2 — Iteration N — [timestamp]

### Envelope Check (vs Spec)
| Phase | Spec | Observed | Match? |
|-------|------|----------|--------|
| Build | 800-1200ms, rim→center, ease-in | [observed behavior and timing] | ✅/❌ |
| Peak | 1000-1500ms, sustained flicker | [observed behavior and timing] | ✅/❌ |
| Decay | 500-800ms, fade out, ease-out | [observed behavior and timing] | ✅/❌ |
| Total | 2500-3500ms | [observed total] | ✅/❌ |

### Visual Verification
- [ ] Build shows bolts energizing from rim inward (not instant-on)
- [ ] Peak matches Phase 1 locked appearance
- [ ] Decay shows natural fade (not abrupt cutoff)
- [ ] Transitions feel smooth, not jarring

### Phase 1 Preservation Check
- [ ] Peak frames still match Sora reference quality
- [ ] No regression in color, bloom, or bolt structure
- [ ] Peak intensity unchanged from Phase 1

### Synthesis
Build phase: [assessment vs spec]
Peak phase: [assessment — should match Phase 1]
Decay phase: [assessment vs spec]
Primary issue: [what needs adjustment]

### Change Made (SINGLE — Phase 2 parameters only)
- File: [path]
- Parameter: [name]
- Old: [value] → New: [value]
- Rationale: [why]

⚠️ Confirm this parameter is in Phase 2 tunable list, NOT Phase 1 locked list.

### Next Action
[Continue / Envelope matches spec / Need adjustment]
```

### Step 2.4: Phase 2 Exit Criteria

| Condition | Action |
|-----------|--------|
| Envelope matches spec | Eligible for completion |
| Human approves | **PHASE 2 COMPLETE** |
| Phase 1 regression detected | STOP, investigate |

---

## Parameter Reference

### Phase 1 Parameters (Locked After Phase 1)

**shaders.ts (GLSL):**
| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| `u_intensity` | Core brightness | 0.8 - 1.5 |
| `orangeTint` vec3 | Color grading RGB | (1.0, 0.4-0.6, 0.0-0.1) |
| `u_bloomTightWeight` | Tight bloom | 0.8 - 1.5 |
| `u_exposure` | HDR exposure | 1.5 - 3.0 |

**boltGenerator.ts:**
| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| `BOLT_WIDTH` | Line thickness | 1.5 - 3.0 |
| `BRANCH_PROBABILITY` | Branching frequency | 0.1 - 0.4 |
| `SEGMENT_LENGTH` | Path segment length | 8 - 20 |
| `JITTER` | Path randomness | 2 - 8 |

**config.ts (ELECTRICITY_CONFIG):**
| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| `plasmaDensity` | Volumetric fill | 0.3 - 0.7 |
| `bloomTightWeight` | Tight glow weight | 0.8 - 1.5 |
| `toneMapExposure` | HDR exposure | 1.5 - 3.0 |
| `centerGlowStrength` | Center brightness | 0.4 - 0.8 |

### Phase 2 Parameters (Envelope Tuning)

| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| `buildDurationMs` | Build phase length | 800 - 1200 |
| `peakDurationMs` | Peak phase length | 1000 - 1500 |
| `decayDurationMs` | Decay phase length | 500 - 800 |
| `envelopeCurve` | Easing function | ease-in, ease-out, linear |
| `intensityEnvelope` | Intensity over time | 0.0 → 1.0 → 0.0 curve |
| `spawnRateMultiplier` | Bolt spawn rate over time | 0.0 → 1.0 → 0.0 |

---

## Convergence Criteria

### Phase 1
| Condition | Action |
|-----------|--------|
| Mean SSIM ≥ 95% | **EXCELLENT** — May complete early |
| Mean SSIM ≥ 90% AND human approves | **COMPLETE** — Proceed to Phase 2 |
| Plateau (3 iterations <1% change) | **STOP** — Human decides |

### Phase 2
| Condition | Action |
|-----------|--------|
| Envelope matches spec | **COMPLETE** |
| Phase 1 quality regressed | **STOP** — Investigate |

---

## Resuming a Session

### Resuming Phase 1

```
"I need to continue Phase 1 iteration on the electricity effect.
Last iteration was #N with SSIM of XX%.
Show me the latest comparison and propose the next change."
```

### Resuming Phase 2

```
"I need to continue Phase 2 envelope implementation.
Phase 1 completed with SSIM XX%.
Last Phase 2 iteration was #N.
Show me the current envelope behavior and propose the next change."
```

### Starting Phase 2 (After Phase 1 Complete)

```
"Phase 1 is complete with SSIM of XX%.
Parameters are locked. Let's begin Phase 2: envelope implementation.
Capture the full animation and show me the current build/peak/decay behavior."
```
