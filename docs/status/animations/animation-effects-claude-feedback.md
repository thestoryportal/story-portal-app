# Animation Effects: Claude Feedback & Analysis

**Date:** 2025-12-22
**Session Type:** Document Review & Conflict Analysis
**Status:** Amendments Proposed, Awaiting Approval

---

## Table of Contents

1. [Documents Reviewed](#documents-reviewed)
2. [Comprehensive Overview](#comprehensive-overview)
3. [Identified Conflicts](#identified-conflicts)
4. [Proposed Amendments](#proposed-amendments)

---

## Documents Reviewed

| Document | Location | Purpose |
|----------|----------|---------|
| `session-animation-system.md` | `docs/sessions/` | Design session guide for Claude.ai |
| `animation-standards.md` | `.claude/skills/story-portal/references/` | Technical specs and quality bar |
| `animation-system.md` | `.claude/skills/story-portal/references/` | Animation inventory and design decisions |
| `visual-iteration-pipeline.md` | `.claude/skills/story-portal/references/` | Automated refinement process |
| `aaa-animation-context.md` | `docs/` | Project-specific electricity effect context |
| `iteration-protocol.md` | `.claude/skills/story-portal/references/` | Human-in-the-loop contract |
| `iterate-visual.md` | `.claude/commands/` | CLI command to activate visual iteration mode |

---

## Comprehensive Overview

### 1. Iteration Protocol (`iteration-protocol.md`)

**Core Principle:** Human visual feedback is ground truth.

**The Loop:**
```
RECEIVE REQUEST → IMPLEMENT (minimal scope) → STOP & PRESENT → WAIT → RESPOND TO FEEDBACK → REPEAT
```

**Critical Rules:**

| Rule | Description |
|------|-------------|
| No Autonomous Continuation | Never proceed without human approval |
| Scope Discipline | Only change what was requested |
| Visual Feedback Priority | Believe what human sees, don't argue |
| Stop Means Stop | "Wait", "hold on", "pause" = halt immediately |

**Deep Thinking Protocol:** For non-trivial tasks:
1. State understanding
2. Outline approach
3. Identify risks
4. Get approval
5. Only then implement

---

### 2. Animation Standards (`animation-standards.md`)

**Quality Benchmark:** AAA video game level (Uncharted, God of War, Diablo) — NOT cartoon effects or simple CSS.

**Portal Electricity Effect:**
- **Color Palette:** Golden/amber (NOT white lightning)
  - Core: `#FFFEF0` (cream-white)
  - Inner glow: `#FFE4A0` (soft gold)
  - Outer glow: `#D4A574 → #B8860B` (amber)

**Technical Pipeline:**
```
Bolt Render → Horizontal Blur → Vertical Blur → Composite → ACES Tone Mapping
```

**Performance Targets:**

| Metric | Target | Hard Limit |
|--------|--------|------------|
| Frame Rate | 60fps | Never below 30fps |
| GPU Memory | <100MB | <256MB |
| Draw Calls | <50 | <100 |

**Timing Standards:**

| Type | Duration |
|------|----------|
| Micro-interaction | 100-200ms |
| Standard transition | 200-400ms |
| Complex sequence | 800-1500ms |

**WebGL Capture Critical Note:** On macOS, do NOT use `--use-gl=egl` — it breaks WebGL rendering.

---

### 3. Animation System Skill (`animation-system.md`)

**Philosophy:** "Ritual over efficiency" — animations create meaningful moments, not just smooth transitions.

**Animation Categories:**

| Category | Purpose | Examples |
|----------|---------|----------|
| Ambient | Always running, create atmosphere | Steam wisps |
| Ritual | Mark important moments | Wheel spin, Topic Reveal |
| Transition | Smooth state changes | Modal open/close |
| Feedback | Confirm user input | Button press |

**Current Status:**
- ✅ Complete: Wheel physics, Steam wisps, Menu animations
- 🟡 In Progress: Electricity effect
- ⚫ Not Started: Topic Reveal (critical), Modal transitions, Button feedback

**Topic Reveal Animation (Critical):**
```
Wheel lands → Brief pause → Fire poof ignites → Panel lifts off wheel →
Panel zooms toward user → Settles in contemplation position → Fire dissipates
```

**Technical Implementation Guidance:**
- CSS for transforms, opacity, simple transitions
- JavaScript + RAF for coordinated multi-element/physics
- Canvas 2D for particle effects
- WebGL only when truly needed (electricity)

---

### 4. Visual Iteration Pipeline (`visual-iteration-pipeline.md`)

**Purpose:** Autonomously refine visual effects through measured iteration cycles.

**Pipeline Architecture:**
```
CAPTURE → ANALYZE → EVALUATE → [CONTINUE | CHECKPOINT | COMPLETE]
```

**Score Thresholds:**

| Score | Status | Action |
|-------|--------|--------|
| ≥ 0.95 | EXCELLENT | Complete |
| 0.90-0.94 | GOOD | Polish or accept |
| 0.85-0.89 | PASS | Continue if improving |
| 0.70-0.84 | NEEDS WORK | Significant changes needed |
| < 0.70 | FAIL | May need architectural change |

**Exit Conditions:**
- **COMPLETE:** Score ≥ 0.95
- **CHECKPOINT:** MAX_ITERATIONS (default: 5) reached, score plateau (3 iterations with Δ < 0.01), regression
- **STOP:** Tool failure or human interrupt

**Adjustment Rule:** Change ONE parameter per iteration.

**Known Issues:**
- SSIM is problematic for stochastic effects (electricity) — use best-of-N scoring
- Comparing animation to static reference is conceptually flawed — use multiple reference frames

---

### 5. AAA Animation Context (`aaa-animation-context.md`)

**Project-Specific Context for Electricity Effect:**

**Tech Stack (Decided):**
- Three.js + React Three Fiber for WebGL
- @react-three/postprocessing for bloom/tone mapping
- simplex-noise for procedural lightning

**Color Palette:**

| Element | Hex |
|---------|-----|
| Core | `#FFF5C8` |
| Inner glow | `#FFD27A` |
| Outer bloom | `#FF9A2A` |
| Atmospheric haze | `#A45A10` |

**Animation Parameters:**
- Flicker rate: 50-80ms
- Tendrils: 8-14 radial bolts with 2-4 branches each
- Temporal coherence (no teleporting)

**Known Issues from Previous Attempts:**

| Issue | Solution |
|-------|----------|
| Cartoon appearance | Use WebGL + bloom |
| White bolts | Apply golden palette |
| Black background | Use transparent WebGL |
| Bloom leakage | Stencil buffer clipping |

---

### 6. Session: Animation System Design (`session-animation-system.md`)

**Design Session Guide for Claude.ai:**

**Part 1:** Animation inventory + Topic Reveal design
- Where does fire originate?
- What's the trajectory?
- Post-reveal state layout?

**Part 2:** Timing standards + Implementation guide
- Easing functions
- Technical implementation (CSS vs JS vs Canvas vs WebGL)
- Reduced-motion fallbacks

**Success Criteria includes:** Complete animation inventory, Topic Reveal storyboard, timing standards, micro-interaction specs, performance requirements.

---

### 7. Visual Iteration Command (`iterate-visual.md`)

**Slash Command:** `/iterate-visual`

**Pre-Flight Checklist:**
- Dev server running
- Reference image available
- Capture tools working

**Default Parameters:**

| Parameter | Default |
|-----------|---------|
| MAX_ITERATIONS | 5 |
| TARGET_SCORE | 0.90 |
| BURST_FRAMES | 10 |

---

### Summary: How These Documents Work Together

1. **`iteration-protocol.md`** — The fundamental human-in-the-loop contract
2. **`animation-standards.md`** — Technical specs and quality bar
3. **`animation-system.md`** — Inventory and design decisions
4. **`visual-iteration-pipeline.md`** — Automated refinement process
5. **`aaa-animation-context.md`** — Project-specific electricity effect context
6. **`session-animation-system.md`** — Design session structure for Claude.ai
7. **`iterate-visual.md`** — CLI command to activate visual iteration mode

The overarching message: **Human feedback is ground truth, make minimal scoped changes, checkpoint frequently, aim for AAA quality (not cartoon), and use the visual iteration pipeline for measurable refinement.**

---

## Identified Conflicts

### 1. Autonomy Conflict: Standard vs Visual Iteration Mode

| Document | Directive |
|----------|-----------|
| `iteration-protocol.md` | "After presenting a change, **NEVER** continue to the next change without human approval" |
| `visual-iteration-pipeline.md` | "FOR iteration = 1 to MAX_ITERATIONS" — autonomous looping |

**Tension:** The iteration protocol is emphatic about never continuing without approval, but visual iteration mode explicitly grants autonomous cycling. The documents try to reconcile this by saying visual mode "overrides STANDARD mode," but in practice this creates ambiguity about when I'm allowed to proceed autonomously.

**Recommendation:** Clarify that visual iteration mode is an explicit opt-in that suspends the standard iteration protocol, perhaps with a clearer activation/deactivation boundary.

---

### 2. SSIM Scoring vs Stochastic Effects (Fundamental)

`visual-iteration-pipeline.md` acknowledges:
> "SSIM is problematic for stochastic effects (electricity bolts take random paths, causing SSIM variance even for 'correct' output)"

Yet the entire decision tree depends on SSIM scores:
- Score ≥ 0.95 → COMPLETE
- Score regression → CHECKPOINT

**Problem:** For the electricity effect specifically, two "correct" frames could have wildly different SSIM scores. This could trigger false regressions or plateaus, forcing unnecessary checkpoints and breaking the autonomous loop.

**Recommendation:** The documents suggest "best-of-N scoring" but don't specify implementation details. For electricity work, I may need to rely more on feature detection (bolt count, color presence) than SSIM.

---

### 3. Static Reference Paradox

`visual-iteration-pipeline.md`:
> "Comparing animation frames to static reference is conceptually flawed"

Yet the pipeline is built around exactly this comparison. For animations that are *supposed* to vary frame-to-frame, what does "matching the reference" even mean?

**Recommendation:** Need behavioral metrics (e.g., "bolts flicker 10-15 times per second", "center brightness oscillates between X-Y") rather than structural similarity to a frozen frame.

---

### 4. One Change Per Iteration vs Interdependent Parameters

| Directive | Reality |
|-----------|---------|
| "Change ONE parameter per iteration" | Electricity involves interdependent params: bloom intensity affects perceived color, bolt count affects perceived brightness |

If I increase bolt count, I may need to reduce individual bolt brightness to maintain the same overall luminance. The "one change" rule could force me into a slow zigzag where each change breaks something else.

**Recommendation:** Allow "atomic changes" that adjust related parameters together when they're physically coupled.

---

### 5. Raw WebGL vs Three.js Stack

| Document | Says |
|----------|------|
| `aaa-animation-context.md` | "Deprecated: Raw WebGL without Three.js" |
| Existing code | `src/legacy/effects/useElectricityEffect.ts` uses raw WebGL |

**Conflict:** Should I continue iterating on the existing raw WebGL implementation, or migrate to the "decided" Three.js stack? The animation-context doc was written as planning, but implementation proceeded with raw WebGL.

**Recommendation:** Clarify which approach is canonical. Migration mid-task would be a major scope expansion.

---

### 6. Topic Reveal: All Design Decisions Are TBD

`animation-system.md` lists Topic Reveal as critical but every design question is marked `[TBD]`:
```
Fire origin point: [TBD]
Fire visual style: [TBD]
Panel trajectory: [TBD]
Total duration: [TBD]
```

If I'm asked to implement Topic Reveal, I'd have to make these decisions myself — which conflicts with the iteration protocol's emphasis on not adding unrequested improvements or making assumptions.

**Recommendation:** Complete the design session (`session-animation-system.md`) before implementation, or explicitly grant me decision-making authority for these TBDs.

---

### 7. Capture Pipeline Reliability

The visual iteration pipeline assumes:
```bash
node tools/ai/capture/capture.mjs --burst 10
```

But I don't know the current reliability of this pipeline. If capture fails or produces inconsistent results, the entire autonomous loop breaks down.

**Recommendation:** Verify capture tools work reliably before entering visual iteration mode. The pre-flight checklist exists but failures mid-loop aren't well-handled.

---

### Summary: What Would Help

| Issue | Resolution Needed |
|-------|-------------------|
| Autonomy boundaries | Explicit "you may iterate autonomously until X" |
| SSIM for stochastic effects | Alternative metrics or acceptance of higher variance |
| Reference paradox | Behavioral specs instead of static image comparison |
| Interdependent params | Allow coupled changes as single "atomic" change |
| WebGL vs Three.js | Confirm which implementation to use |
| Topic Reveal TBDs | Design session first, or grant decision authority |

---

## Proposed Amendments

### Amendment 1: Clarify Mode Boundaries in `iteration-protocol.md`

**Location:** After "Critical Rules" section (line ~42)

**Add new section:**

```markdown
## Mode Override: Visual Iteration

The rules above apply to **STANDARD mode** (default). When human explicitly
activates **VISUAL_ITERATION mode** (via `/iterate-visual` or verbal activation),
the following modifications apply:

| Standard Rule | Visual Iteration Override |
|---------------|---------------------------|
| No autonomous continuation | May iterate up to MAX_ITERATIONS autonomously |
| Stop after every change | Stop after iteration cycle completes or threshold met |
| Human approval required | Human approval required only at checkpoints |

**Mode boundaries are explicit:**
- Entry: Human says "enter visual mode" or invokes `/iterate-visual`
- Exit: Human says "stop", "exit visual mode", MAX_ITERATIONS reached, or COMPLETE

**Within visual iteration mode, these rules still apply:**
- Stop immediately if human interrupts
- Checkpoint on regression or plateau
- Never exceed MAX_ITERATIONS without human checkpoint
```

---

### Amendment 2: Add Behavioral Metrics for Stochastic Effects in `visual-iteration-pipeline.md`

**Location:** Replace/expand the "ANALYZE" section (lines 70-80)

**Replace with:**

```markdown
### 2. ANALYZE

```bash
node tools/ai/capture/pipeline.mjs --input ./iteration-N/ --reference ./reference/
```

**Metrics by effect type:**

#### Static Effects (UI, layouts)
| Metric | Tool | Weight |
|--------|------|--------|
| SSIM | ssim.js | 0.7 |
| Pixel diff | pixelmatch | 0.3 |

#### Stochastic Effects (electricity, particles, fire)
SSIM is unreliable for effects with intentional randomness. Use behavioral metrics instead:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Element count | 8-14 bolts | Edge detection + connected components |
| Color presence | 30-50% amber pixels | Histogram in target hue range (25-45°) |
| Center brightness | 180-255 | Sample 50px radius from center |
| Flicker rate | 10-15 changes/sec | Frame-to-frame delta over burst |
| Containment | 0 pixels outside ring | Mask comparison |

**Scoring for stochastic effects:**
```
score = (
  0.25 * element_count_in_range +
  0.25 * color_presence_in_range +
  0.20 * brightness_in_range +
  0.15 * flicker_rate_in_range +
  0.15 * containment_perfect
)
```

Each component is binary (0 or 1) based on whether value falls within target range.
This produces scores of 0.00, 0.15, 0.20, ... 1.00 in discrete steps.

**Decision thresholds for stochastic effects:**
| Score | Status | Action |
|-------|--------|--------|
| 1.00 | EXCELLENT | Complete |
| ≥ 0.85 | GOOD | Accept or polish |
| ≥ 0.70 | PASS | Continue |
| < 0.70 | NEEDS WORK | Continue or checkpoint |
```

---

### Amendment 3: Allow Atomic Coupled Changes in `visual-iteration-pipeline.md`

**Location:** Expand "ADJUST" section (line ~113)

**Replace:**
```markdown
**Adjustment rules:**
- Change ONE parameter per iteration
```

**With:**
```markdown
**Adjustment rules:**
- Change ONE **logical unit** per iteration
- A logical unit may include coupled parameters that are physically interdependent

**Examples of single logical units:**
| Logical Unit | Parameters That May Change Together |
|--------------|-------------------------------------|
| Bolt brightness | `BOLT_OPACITY`, `BOLT_WIDTH` (thinner = dimmer) |
| Overall luminance | `BOLT_COUNT`, `INDIVIDUAL_BRIGHTNESS` (inverse relationship) |
| Color temperature | `CORE_COLOR`, `GLOW_COLOR`, `BLOOM_COLOR` (must stay in palette) |
| Bloom appearance | `BLOOM_INTENSITY`, `BLOOM_RADIUS` (often co-dependent) |

**Anti-pattern:** Changing bolt color AND adding new animation behavior = two logical units.

**Rule of thumb:** If changing A without changing B would create an obviously broken state,
they are one logical unit.
```

---

### Amendment 4: Clarify WebGL Implementation Status in `aaa-animation-context.md`

**Location:** Replace "Technology Stack (Decided)" section (lines 15-29)

**Replace with:**

```markdown
## Technology Stack

### Current Implementation (In Use)
| Approach | Location | Status |
|----------|----------|--------|
| Raw WebGL | `src/legacy/effects/useElectricityEffect.ts` | Active, AAA iteration in progress |

The existing raw WebGL implementation includes:
- Multi-pass rendering (bolt → blur → plasma → composite)
- ACES tone mapping
- Simplex noise for bolt generation
- Circular masking

### Alternative Stack (Considered, Not Adopted)
| Library | Reason Not Used |
|---------|-----------------|
| Three.js + R3F | Added complexity for single effect, existing implementation functional |
| @react-three/postprocessing | Bloom already implemented in raw GLSL |

### Decision
**Continue iterating on raw WebGL implementation.** Migration to Three.js would be a
separate task requiring explicit approval, not part of visual quality iteration.

### If Starting Fresh
If building a new effect from scratch (e.g., Topic Reveal fire), evaluate:
- Simple particle effect → Canvas 2D
- Complex shader effect → Raw WebGL (follow existing pattern)
- Multiple 3D elements → Consider Three.js
```

---

### Amendment 5: Add Decision Authority for TBDs in `animation-system.md`

**Location:** Replace "Design Questions (TBD)" section under Topic Reveal (lines 100-110)

**Replace with:**

```markdown
### Design Decisions

**Status:** Awaiting design session OR Claude may propose defaults for approval.

If implementing before design session is complete, Claude should:
1. Propose a specific value for each TBD
2. Present rationale
3. Wait for human approval before implementing

| Decision | Proposed Default | Rationale |
|----------|------------------|-----------|
| Fire origin | Behind panel, portal ring edge | Matches portal aesthetic |
| Fire visual style | Amber flames + brass sparks | Consistent with electricity palette |
| Smoke/ember trail | Yes, 3-5 embers | Adds weight without clutter |
| Panel trajectory | Slight arc (ease-out) | More organic than straight zoom |
| Panel final position | Upper third, centered | Leaves room for buttons below |
| Panel final size | 60% viewport width | Readable on mobile |
| Total duration | 800ms | Ritual-length per timing standards |
| Sound design | Whoosh + crackle | Deferred to audio implementation |

**Human must approve these defaults before implementation begins.**

### Post-Reveal State (Proposed Defaults)
| Element | Proposed Default |
|---------|------------------|
| Prompt display | Centered card, same style as wheel panel |
| Wheel visibility | Dimmed to 30% opacity, scaled to 60% |
| Button entrance | Fade in 200ms after panel settles |
```

---

### Amendment 6: Add Failure Handling to `iterate-visual.md`

**Location:** After "Iteration Loop" section (line ~40)

**Add:**

```markdown
## Failure Handling

### Capture Failure
```
IF capture returns error OR no frames produced:
  1. Log error details
  2. Attempt ONE retry with 5s delay
  3. If retry fails → STOP, report to human:
     "Capture failed: [error]. Please verify dev server and try again."
```

### Analysis Failure
```
IF analysis tool crashes OR returns invalid scores:
  1. Log error details
  2. Fall back to visual inspection mode:
     - Present captured frames to human
     - Ask: "I couldn't score this automatically. Does this look correct?"
  3. Human decides: continue, adjust, or stop
```

### Mid-Loop Human Interrupt
```
IF human sends any message during iteration:
  1. STOP current iteration immediately
  2. Present current state and scores
  3. Wait for human direction
```

### Inconsistent Scores Across Burst
```
IF score variance across burst frames > 0.15:
  1. Flag as "high variance" in report
  2. Use MEDIAN score (not mean or max)
  3. Note: "Scores varied significantly — effect may be too random or capture timing inconsistent"
```
```

---

### Amendment 7: Add Effect-Specific Thresholds to `animation-standards.md`

**Location:** After "Performance Targets" table (line ~110)

**Add:**

```markdown
### Effect-Specific Quality Thresholds

Different effects have different measurable criteria. Use these instead of generic SSIM:

#### Electricity Effect
| Metric | Target Range | Measurement |
|--------|--------------|-------------|
| Bolt count | 6-12 visible | Manual count or edge detection |
| Amber hue presence | 30-50% of effect area | Pixels in H:25-45° range |
| Core brightness | Peak > 200 RGB | Sample brightest point |
| Bloom radius | 15-30px apparent | Measure glow falloff |
| Containment | 100% inside ring | Zero pixels outside mask |
| Frame-to-frame continuity | No teleporting | Adjacent frames share >60% bolt positions |

#### Steam Wisps
| Metric | Target Range | Measurement |
|--------|--------------|-------------|
| Wisp count | 8-15 visible | Particle count |
| Opacity range | 0.1-0.4 | No fully opaque particles |
| Movement speed | 10-30px/sec | Track particle positions |

#### Topic Reveal Fire (When Implemented)
| Metric | Target Range | Measurement |
|--------|--------------|-------------|
| Flame height | 50-100px | Bounding box |
| Ember count | 3-8 | Particle count |
| Color temperature | Matches electricity palette | Hue comparison |
| Duration | 700-900ms | Timestamp delta |
```

---

### Summary of Proposed Amendments

| Document | Amendment | Resolves |
|----------|-----------|----------|
| `iteration-protocol.md` | Add Mode Override section | Autonomy conflict |
| `visual-iteration-pipeline.md` | Behavioral metrics for stochastic effects | SSIM unreliability |
| `visual-iteration-pipeline.md` | Atomic coupled changes | Interdependent params |
| `visual-iteration-pipeline.md` | Failure handling | Pipeline reliability |
| `aaa-animation-context.md` | Clarify raw WebGL is canonical | Tech stack confusion |
| `animation-system.md` | Proposed defaults for TBDs | Topic Reveal decisions |
| `animation-standards.md` | Effect-specific thresholds | Static reference paradox |

---

## Next Steps

1. **Review amendments** — Human approves, modifies, or rejects each proposed change
2. **Apply approved amendments** — Update the source documents
3. **Test capture pipeline** — Verify `node tools/ai/capture/capture.mjs` works reliably
4. **Resume electricity iteration** — With clearer rules and metrics
5. **Design session for Topic Reveal** — Run `session-animation-system.md` in Claude.ai before implementation

---

*Generated by Claude during document review session, 2025-12-22*
