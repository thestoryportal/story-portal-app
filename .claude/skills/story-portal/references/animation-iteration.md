# Animation Iteration Skill

> **Purpose:** Single entry point for all animation iteration work
> **Use when:** Working on visual effects, running iteration pipeline, tuning animations

---

## Quick Commands

```bash
# Run iteration pipeline
node animations/shared/diff/pipeline.mjs --scenario electricity-portal

# Video capture (non-headless, watch the effect)
node animations/shared/capture/video.mjs --scenario electricity-portal --label test

# Extract baseline metrics (run once before iteration)
node animations/shared/diff/extract-baseline.mjs \
  --with animations/electricity-portal/references/465x465/electricity_animation_effect_static_diff_analysis.png \
  --without animations/electricity-portal/references/465x465/electricity_animation_effect_off_baseline.png \
  --output animations/electricity-portal/references/465x465/

# Extract animation baseline
node animations/shared/diff/extract-baseline-video.mjs \
  --animation animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis.apng \
  --output animations/electricity-portal/references/465x465/
```

---

## Two-Phase Approach

| Phase | Goal | Compare Against | Exit Criteria |
|-------|------|-----------------|---------------|
| **Phase 1** | Peak Visual Quality | Sora reference (SSIM) | SSIM ≥ 0.90 + human approval |
| **Phase 2** | Envelope Implementation | Temporal spec | Envelope matches spec |

**Rule:** Phase 1 parameters are LOCKED before Phase 2 begins.

---

## Checkpoint Rules (Animation Mode)

- **Iterations 1-6:** Implicit approval, continue autonomously
- **Iteration 7, 14, 21...:** MANDATORY human checkpoint
- **Plateau (3 iterations <1% change):** MANDATORY STOP
- **SSIM drop >10%:** Flag and pause

---

## Key Files

| Purpose | Path |
|---------|------|
| **Scenario config** | `animations/electricity-portal/scenario.json` |
| **Reference animation** | `animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis.apng` |
| **Reference static** | `animations/electricity-portal/references/465x465/electricity_animation_effect_static_diff_analysis.png` |
| **Mask** | `animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis_mask.png` |
| **Full documentation** | `animations/shared/docs/SKILL.md` |

---

## Source Code (R3F Stack)

| File | Purpose |
|------|---------|
| `src/legacy/components/ElectricityR3F.tsx` | Main R3F component |
| `src/legacy/effects/useElectricityEffectThree.ts` | Three.js hook |
| `src/legacy/effects/boltGenerator.ts` | Lightning path generation |
| `src/legacy/effects/shaders.ts` | GLSL shaders |
| `src/legacy/constants/config.ts` | `ELECTRICITY_CONFIG` |

---

## Iteration Report Template

```markdown
## Iteration N — [timestamp]

### Metrics
| Metric | Value | Delta | Status |
|--------|-------|-------|--------|
| Mean SSIM | XX.X% | +/-X.X% | ⬆️/⬇️/➡️ |

### Change Made (SINGLE)
- File: [path]
- Parameter: [name]
- Old: [value] → New: [value]
- Rationale: [why]

### Visual Analysis
[Observations from comparison.png and diff_heatmap.png]

### Next Action
[Continue / Checkpoint / Complete]
```

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Effect not visible | Timing or shader error | Check console, widen timing window |
| SSIM always ~50% | Dimension mismatch | Verify all images are 465×465 |
| Crop misaligned | Viewport resize | Re-calibrate with overlay |

**Full troubleshooting:** `animations/shared/docs/references/troubleshooting.md`

---

## Related Skills

| Skill | When to Read |
|-------|--------------|
| `animation-standards.md` | Color palette, quality benchmarks |
| `animation-system.md` | Animation inventory, topic reveal |
| `iteration-protocol.md` | General iteration rules |
| `visual-iteration-pipeline.md` | Pipeline details |

---

*This skill consolidates animation iteration knowledge. For full documentation, see `animations/shared/docs/SKILL.md`.*
