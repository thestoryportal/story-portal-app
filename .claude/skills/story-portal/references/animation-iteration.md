# Animation Iteration Skill

> **Purpose:** Entry point for animation iteration work
> **Primary Documentation:** `animations/shared/docs/SKILL.md`

---

## Quick Reference

```bash
# Run iteration pipeline
pnpm iterate:electricity

# Or directly
node animations/shared/diff/pipeline.mjs --scenario electricity-portal

# Video capture
node animations/shared/capture/video.mjs --scenario electricity-portal --label test
```

---

## Key Files

| Purpose | Path |
|---------|------|
| **Full skill documentation** | `animations/shared/docs/SKILL.md` |
| **Scenario config** | `animations/electricity-portal/scenario.json` |
| **Primary R3F component** | `src/legacy/components/ElectricityR3F.tsx` |
| **Reference animation** | `animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis.apng` |

---

## Two-Phase Approach

| Phase | Goal | Exit Criteria |
|-------|------|---------------|
| **Phase 1** | Peak Visual Quality | SSIM ≥ 0.90 + human approval |
| **Phase 2** | Envelope Implementation | Envelope matches spec |

**Rule:** Phase 1 parameters are LOCKED before Phase 2.

---

## Checkpoint Rules

- **Iterations 1-6:** Implicit approval
- **Iteration 7, 14, 21...:** MANDATORY human checkpoint
- **Plateau (3 iterations <1% change):** MANDATORY STOP

---

## For Full Documentation

See: `animations/shared/docs/SKILL.md`

*This is a stub. Full details in SKILL.md. Updated 2025-12-24.*
