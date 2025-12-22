Enter Visual Iteration Mode for autonomous visual QA.

## Mode Activation
You are now in VISUAL_ITERATION mode. This overrides STANDARD mode until the task completes or human says "exit visual mode".

## Load Context
Read these skill references before proceeding:
1. `.claude/skills/story-portal/references/visual-iteration-pipeline.md` — Full pipeline spec
2. `.claude/skills/story-portal/references/animation-standards.md` — Quality benchmarks

## Pre-Flight Checklist
Before starting iterations, verify:
- [ ] Dev server running (`pnpm dev`)
- [ ] Reference image available (ask human if not provided)
- [ ] Capture tools working: `node tools/ai/capture/capture.mjs --test`

If any check fails, resolve before proceeding.

## Parameters
Set these for this session (ask human to confirm or adjust):

| Parameter | Default | Description |
|-----------|---------|-------------|
| MAX_ITERATIONS | 5 | Stop and checkpoint after this many |
| TARGET_SCORE | 0.90 | SSIM threshold for "good enough" |
| BURST_FRAMES | 10 | Frames to capture per iteration |

## Iteration Loop
```
FOR iteration = 1 to MAX_ITERATIONS:
  1. CAPTURE: node tools/ai/capture/capture.mjs --burst {BURST_FRAMES}
  2. ANALYZE: Compare against reference, extract scores
  3. EVALUATE: 
     - Score ≥ 0.95 → COMPLETE
     - Score ≥ TARGET and improving → Continue or accept
     - Plateau (3 iterations, Δ < 0.01) → CHECKPOINT
     - Regression → CHECKPOINT
  4. ADJUST: Make ONE targeted code change
  5. LOG: Output iteration report (see format below)
  6. LOOP or EXIT
```

## Iteration Report Format
Output after each iteration:

```markdown
## Iteration [N] — [timestamp]

### Score: [X.XX] (Δ [+/-Y.YY])
Status: [CONTINUE | CHECKPOINT | COMPLETE]

### Change Applied
- File: `path/to/file`
- What: [description]
- Why: [rationale]

### Next Action
[What will be tried next OR why checkpointing]
```

## Exit Conditions
- **COMPLETE:** Score ≥ 0.95, output celebration 🎉
- **CHECKPOINT:** MAX_ITERATIONS reached, plateau, or regression — present summary, wait for human
- **STOP:** Tool failure or human interrupt

## Critical Reminders
- WebGL capture: Do NOT use `--use-gl=egl` (breaks on macOS)
- Change ONE parameter per iteration
- SSIM is noisy for stochastic effects — use best-of-N scoring
- Human can say "stop" or "exit visual mode" at any time

---

Begin by confirming parameters with human and running pre-flight checks.
