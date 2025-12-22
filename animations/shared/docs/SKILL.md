# Animation Iteration Pipeline — Skill

**Purpose:** Human-verified visual iteration loop for AAA animation effects
**Location:** `animations/shared/docs/SKILL.md`
**Status:** Requires setup before use

---

## Philosophy

This is NOT a fully autonomous pipeline. It requires **human verification checkpoints** at critical stages. The goal is to combine:
- **Tool precision:** Automated capture, metrics, diff analysis
- **Human judgment:** Visual verification, quality assessment, strategic direction
- **Claude synthesis:** Combining tool output with visual analysis for iteration decisions

---

## Directory Structure

```
animations/                         # Animation pipeline
├── shared/                         # Shared tooling (all scenarios)
│   ├── capture/                    # Capture tools
│   │   ├── run.mjs                 # PRIMARY - Puppeteer + CDP + WebGL
│   │   ├── capture.mjs             # Alternative capture
│   │   ├── click_burst.mjs         # Click-then-burst helper
│   │   ├── sequence_burst.mjs      # Multi-step sequence
│   │   └── pick_artifact.mjs       # Artifact selector
│   │
│   ├── diff/                       # Analysis tools
│   │   ├── pipeline.mjs            # Main iteration orchestrator
│   │   ├── analyze.mjs             # SSIM analysis engine
│   │   ├── crop.mjs                # Frame cropping with mask
│   │   ├── extract-baseline.mjs    # Baseline metric extraction
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
│   │   │   ├── with_effect.png
│   │   │   ├── without_effect.png
│   │   │   └── golden_mask.png
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
- `settleMs` — Delay after trigger before capture starts
- `burstFrames` — Number of frames to capture
- `burstIntervalMs` — Time between frames

**Steps:**
1. Trigger effect in non-headless mode, human observes
2. Capture burst of frames
3. Generate animated GIF from frames
4. **Human reviews:** "Does the animation show the effect?"

**Human Checkpoints:**
> "Watch the browser. Does the effect appear when triggered?"
> "Here is the captured animation. Is the effect visible and animated?"

**DO NOT PROCEED until capture shows effect.**

---

## Phase 5: Iteration Loop

### 5.1 Capture + GIF

```bash
node animations/shared/diff/pipeline.mjs --scenario electricity-portal --iteration N
```

**Outputs:**
```
animations/electricity-portal/output/iterations/iter_001_YYYYMMDD_HHMMSS/
├── frames/           # Captured frames
├── animation.gif     # Animated preview
├── meta.json         # Capture metadata
└── analysis/
    ├── best_frame.png
    ├── diff_heatmap.png
    ├── comparison.png
    ├── scores.json
    └── report.md
```

### 5.2 Claude Synthesis (KEY STEP)

Claude must:
1. **Read tool metrics:** scores.json, report.md
2. **View images:** animation.gif, comparison.png, diff_heatmap.png
3. **Synthesize:** Combine quantitative metrics with visual assessment
4. **Propose:** ONE specific change with rationale
5. **Wait:** Get human approval before implementing

**Claude's Analysis Framework:**
```markdown
## Tool Metrics
- SSIM: XX.X%
- Diff pixels: XX.X%
- Best frame: frame_XXX.png

## Visual Analysis
Looking at comparison.png and animation.gif:
- Color: [matches / too dim / too bright / wrong hue]
- Intensity: [matches / core too dim / glow too weak]
- Structure: [bolts visible / too few / wrong shape]
- Animation: [smooth / choppy / static]

## Synthesis
The tool reports SSIM of XX%, which indicates [interpretation].
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
1. **ONE change per iteration** — Isolate cause and effect
2. **Small adjustments** — 10-20% changes, not 50%+
3. **Document the change** — What, where, why
4. **Wait for approval** — Human must confirm before proceeding

**Code Targets:**
```
src/legacy/effects/shaders.ts        # Color, intensity, glow
src/legacy/effects/boltGenerator.ts  # Bolt structure, branching
src/legacy/effects/useElectricityEffect.ts  # Animation timing
```

---

## Convergence Criteria

| Condition | Action |
|-----------|--------|
| SSIM >= 95% | **COMPLETE** — Target exceeded |
| SSIM >= 90% AND human approves | **COMPLETE** — Acceptable quality |
| SSIM >= 85% AND plateau | **COMPLETE** — Diminishing returns |
| Iterations >= 20 | **ESCALATE** — Need different approach |
| 3 iterations with < 0.01 improvement | **ESCALATE** — Stuck |

**Human Override:** At any point, human can declare "good enough" or "keep going" regardless of metrics.

---

## Human Checkpoint Summary

| Phase | Checkpoint | Question |
|-------|------------|----------|
| 1 | Viewport | "Is the entire UI visible and correctly sized?" |
| 2 | Crop overlay | "Is effect area centered in the crop box?" |
| 2 | Crop verify | "Does cropped image correctly frame the effect?" |
| 3 | Mask preview | "Does mask cover where effect should appear?" |
| 4 | Trigger test | "Does effect appear when triggered?" |
| 4 | Animation | "Is effect visible in captured animation?" |
| 5 | Synthesis | "Does Claude's analysis make sense?" |
| 5 | Adjustment | "Is proposed change reasonable?" |
| Exit | Complete | "Is quality acceptable?" |

---

## Quick Reference Commands

```bash
# Run full pipeline iteration
node animations/shared/diff/pipeline.mjs --scenario electricity-portal --iteration 1

# Capture only (for debugging)
node animations/shared/capture/run.mjs --scenario electricity-portal

# Analyze existing frames
node animations/shared/diff/analyze.mjs --frames /path/to/frames

# Extract baseline from reference
node animations/shared/diff/extract-baseline.mjs --reference animations/electricity-portal/references/465x465/with_effect.png
```

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
Start with Phase 1: Viewport Debug."
```

### After Setup Complete
```
"Setup is verified. Let's begin iterating on the electricity effect."
```

### Resuming
```
"Continue iterating on electricity effect. Last iteration was #N with SSIM XX%."
```
