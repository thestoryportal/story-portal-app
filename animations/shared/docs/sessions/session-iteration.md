# Animation Iteration Session

**Purpose:** Visual iteration loop with Claude synthesis  
**Prerequisite:** Setup phases 1-4 complete and verified  
**Location:** `animations/shared/docs/sessions/session-iteration.md`

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

If any are false, complete setup first: `animations/shared/docs/sessions/session-setup.md`

### Verify Dev Server

```bash
curl -s http://localhost:5173 | grep -q "vite" && echo "✓ Ready" || echo "✗ Run: pnpm dev"
```

---

## Iteration Loop

### Step 1: Run Pipeline

```bash
node animations/shared/diff/pipeline.mjs \
  --scenario electricity-portal \
  --iteration N
```

Replace `N` with the iteration number (start with 1).

### Step 2: Review Outputs

The pipeline generates:

```
animations/electricity-portal/output/iterations/iter_00N_YYYYMMDD_HHMMSS/
├── frames/
│   ├── frame_000.png
│   ├── frame_001.png
│   └── ...
├── animation.gif
├── meta.json
└── analysis/
    ├── best_frame.png
    ├── diff_heatmap.png
    ├── comparison.png
    ├── scores.json
    └── report.md
```

### Step 3: Claude Synthesis

Claude must analyze ALL outputs before proposing changes.

**Required Analysis Framework:**

```markdown
## Tool Metrics

From scores.json:
- SSIM: [value]%
- Best frame: [frame number]
- Pixel diff: [value]%
- Trend: [improving/declining/stable]

## Visual Analysis

**animation.gif:**
- Effect visibility: [visible/faint/absent]
- Animation quality: [smooth/choppy/static]
- Intensity: [matches reference/too dim/too bright]

**comparison.png (Reference vs Capture):**
- Color match: [good/off-hue/desaturated]
- Brightness: [matches/brighter/dimmer]
- Structure: [similar/different bolt patterns]

**diff_heatmap.png:**
- Primary difference areas: [describe locations]
- Intensity of differences: [subtle/moderate/severe]
- Pattern: [uniform/concentrated/scattered]

## Synthesis

The tools report SSIM of XX%, indicating [interpretation].

My visual observation reveals [specific insight the numbers might miss].

The primary issue to address is: [specific problem]

## Proposed Change

**ONE change only:**

File: `src/legacy/effects/[file].ts`
Parameter: [name]
Current value: [X]
Proposed value: [Y]
Rationale: [Why this should help address the issue]

---

**⚠️ AWAITING HUMAN APPROVAL before implementing this change.**
```

### Step 4: Human Approval Gate

**Claude presents analysis. Human responds:**

- **"Approved"** → Claude implements the change
- **"Try different approach"** → Claude proposes alternative
- **"Looks good enough"** → End iteration (success)
- **"Let me see [specific file/output]"** → Claude provides additional detail

### Step 5: Implement Change

After approval:

```bash
# Claude edits the specific file with the approved change
# Then runs next iteration
node animations/shared/diff/pipeline.mjs \
  --scenario electricity-portal \
  --iteration $((N+1))
```

### Step 6: Loop

Return to Step 2 and repeat until convergence.

---

## Convergence Criteria

| Condition | Action |
|-----------|--------|
| SSIM ≥ 95% | **COMPLETE** — Excellent |
| SSIM ≥ 90% AND human says "good" | **COMPLETE** — Acceptable |
| SSIM ≥ 85% AND 3 iterations plateau | **COMPLETE** — Diminishing returns |
| Iterations ≥ 20 | **ESCALATE** — Need different approach |
| 3 iterations with < 0.01 improvement | **ESCALATE** — Stuck |

---

## Parameter Reference

When adjusting code, here are the primary targets:

### shaders.ts

| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| `CORE_INTENSITY` | Core brightness | 0.8 - 1.5 |
| `GLOW_INTENSITY` | Outer glow strength | 0.3 - 0.8 |
| `BLUR_RADIUS` | Glow blur amount | 4 - 16 |
| `BOLT_COLOR` | Bolt RGB | #FFB800 typical |

### boltGenerator.ts

| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| `BOLT_WIDTH` | Line thickness | 1.5 - 3.0 |
| `BRANCH_PROBABILITY` | Branching frequency | 0.1 - 0.4 |
| `SEGMENT_LENGTH` | Path segment length | 8 - 20 |
| `JITTER` | Path randomness | 2 - 8 |

### useElectricityEffect.ts

| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| `BOLT_COUNT` | Number of bolts | 4 - 12 |
| `ANIMATION_SPEED` | Update frequency | 30 - 120 fps |
| `FADE_DURATION` | Effect fade time | 200 - 500 ms |

---

## Iteration Log Template

Keep a log of each iteration:

```markdown
## Iteration N

**Date:** YYYY-MM-DD HH:MM

**SSIM:** XX.X% (Δ from previous: +/-X.X%)

**Change made:**
- File: [path]
- Parameter: [name]
- From: [old value]
- To: [new value]

**Observation:**
[What changed visually]

**Next focus:**
[What to try next]
```

---

## Resuming a Session

If resuming after a break:

```
"I need to continue iterating on the electricity effect.
Last iteration was #N with SSIM of XX%.
Show me the latest comparison and tell me what you'd propose next."
```

Claude should:
1. Read the latest iteration state
2. View the latest outputs
3. Perform synthesis
4. Propose next change
5. Wait for approval
