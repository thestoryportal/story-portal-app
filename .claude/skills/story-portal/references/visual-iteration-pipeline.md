# Visual Iteration Pipeline — Skill Reference

## Overview

The animation iteration pipeline enables automated capture, analysis, and comparison of visual effects for quality tuning.

**Full Documentation:** `animations/shared/docs/SKILL.md`

## Directory Structure

```
animations/
├── shared/                         # Shared tooling
│   ├── capture/
│   │   ├── run.mjs                 # Primary Puppeteer capture
│   │   └── pick_artifact.mjs       # Artifact selector
│   ├── diff/
│   │   ├── pipeline.mjs            # Main iteration loop
│   │   ├── analyze.mjs             # SSIM analysis
│   │   └── crop.mjs                # Frame cropping
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

## 4 Setup Phases (Human Verified)

Before running the iteration loop, complete these setup phases:

| Phase | Purpose | Verification |
|-------|---------|--------------|
| 1. Viewport Debug | Ensure full UI captured | "Is entire UI visible?" |
| 2. Crop Calibration | Center effect region | "Is portal centered?" |
| 3. Golden Mask | Define scoring area | "Does mask cover effect?" |
| 4. Timing Verification | Capture at peak | "Is effect visible?" |

**Full setup guide:** `animations/shared/docs/sessions/session-setup.md`

## Key Commands

```bash
# Run full iteration pipeline
node animations/shared/diff/pipeline.mjs --scenario electricity-portal

# Capture only
node animations/shared/capture/run.mjs --mode smoke --label test

# Analyze existing frames
node animations/shared/diff/run-analysis.mjs --latest

# Pick best artifact from capture
node animations/shared/capture/pick_artifact.mjs
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

## Scoring Thresholds

| Score | Rating | Action |
|-------|--------|--------|
| >= 0.95 | EXCELLENT | Auto-complete |
| 0.85–0.95 | GOOD | Continue if improving |
| 0.70–0.85 | ACCEPTABLE | Needs work |
| < 0.70 | POOR | Major changes needed |

## Exit Conditions

| Condition | Action |
|-----------|--------|
| Score >= 0.95 | Auto-complete, report success |
| MAX_ITERATIONS reached | Checkpoint with human |
| Score plateau (3 iterations, delta < 0.01) | Checkpoint with human |
| Tool failure | Stop, report error |
| Human interrupt | Stop immediately |

## Human Checkpoints

NEVER proceed without human verification:
- Viewport verified?
- Crop calibrated?
- Mask verified?
- Timing verified?
- Each iteration approved?

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
