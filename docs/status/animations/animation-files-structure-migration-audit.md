# Animation Pipeline Audit Report

**Generated:** 2025-12-22
**Purpose:** Document all animation-related files for migration to consolidated `Animations/` directory

---

## Files Found

### tools/ai/ (Animation Pipeline Core)

#### Capture Scripts (`tools/ai/capture/`)

| File | Description |
|------|-------------|
| `run.mjs` | **Primary capture orchestrator** — Puppeteer-based, supports burst mode, cropping, WebGL |
| `capture.mjs` | Older capture script (possibly deprecated) |
| `click_burst.mjs` | Click-then-burst capture helper |
| `click_video.mjs` | Click-then-video capture |
| `sequence_burst.mjs` | Multi-step sequence burst capture |
| `ffmpeg_capture.mjs` | FFmpeg-based video capture |
| `playwright_interval_capture.mjs` | Playwright-based interval capture |
| `pick_artifact.mjs` | Select artifact from captures |
| `debug_framerate.mjs` | Debug tool for frame rate analysis |
| `burst.sh` | Shell wrapper for burst capture |
| `click_burst.sh` | Shell wrapper for click-burst |
| `click_video.sh` | Shell wrapper for click-video |
| `sequence_burst.sh` | Shell wrapper for sequence burst |
| `screenshot.sh` | Basic screenshot script |
| `video_to_gif.sh` | Convert video to GIF |

#### Diff/Analysis Scripts (`tools/ai/diff/`)

| File | Description |
|------|-------------|
| `pipeline.mjs` | **Main iteration pipeline** — Capture → Analyze → Evaluate → Feedback loop |
| `analyze.mjs` | SSIM analysis, comparison image generation |
| `crop.mjs` | Crop frames to focus region |
| `extract-baseline.mjs` | Extract baseline metrics from reference images |
| `run-analysis.mjs` | Standalone analysis runner |

#### Scenarios (`tools/ai/scenarios/`)

| File | Description |
|------|-------------|
| `electricity-portal.json` | **Primary scenario** — 465×465 reference, 550×550 crop, circular mask |
| `hamburger.json` | Menu open/close scenario |
| `menu-sway.json` | Menu sway animation scenario |
| `new-topics.json` | New topics button scenario |

#### References (`tools/ai/references/`)

| Path | Description |
|------|-------------|
| `electricity-portal/` | Electricity effect reference assets |
| `electricity-portal/465x465/` | Resized reference assets (with_effect.png, without_effect.png, golden_mask.png) |
| `electricity-portal/baseline_metrics.json` | Baseline quality metrics |
| `electricity-portal/baseline_report.md` | Baseline analysis report |
| `electricity-portal/quality_spec.json` | Quality specification |
| `test-baseline/` | Test baseline assets |

#### Other tools/ai Files

| File | Description |
|------|-------------|
| `iterate.mjs` | Top-level iterate command (runs scenarios) |
| `prompt_receiver.mjs` | Receives prompts from inbox |
| `generate_claude_next_prompt.sh` | Generate next prompt script |
| `fix_engraved_icons.py` | Python script for icon fixes |

#### Rules (`tools/ai/rules/`)

| File | Description |
|------|-------------|
| `ANIMATION_CAPTURE_RULE.md` | Animation capture guidelines |
| `SCREENSHOT_RULE.md` | Screenshot guidelines |
| `EDITING_RULES.md` | General editing rules |

#### Data Directories

| Path | Description |
|------|-------------|
| `tools/ai/screenshots/timeline/` | Timestamped capture outputs |
| `tools/ai/iterations/electricity-portal/` | Iteration output directories |
| `tools/ai/inbox/` | Prompt inbox (latest.md) |
| `tools/ai/history/` | Development history dataset |
| `tools/ai/mcp-server/` | MCP server implementation |

---

### docs/sessions/ (Design Sessions)

| File | Animation-Related |
|------|-------------------|
| `session-animation-system.md` | Animation inventory & Topic Reveal design |

---

### .claude/commands/ (Slash Commands)

| File | Description |
|------|-------------|
| `iterate-visual.md` | **Visual iteration mode activation** — References pipeline |
| `apply-latest.md` | Apply latest prompt |
| `compact.md` | Conversation compacting |
| `recall.md`, `decisions.md`, `history.md`, etc. | History search commands |

---

### .claude/skills/story-portal/references/ (Skill References)

| File | Animation-Related |
|------|-------------------|
| `visual-iteration-pipeline.md` | **Primary** — Full pipeline spec, scoring thresholds, exit conditions |
| `animation-standards.md` | AAA quality benchmarks, WebGL specs, performance targets |
| `animation-system.md` | Animation inventory, Topic Reveal design status |
| `iteration-protocol.md` | Multi-step iteration protocol |

Also exists in `.claude/skills/story-portal.backup/references/` (backup copies).

---

### docs/ (Other Animation-Related Files)

| File | Description |
|------|-------------|
| `docs/aaa-animation-context.md` | Animation context document |
| `docs/status/animations/animation-effects-claude-feedback.md` | Electricity effect feedback (23KB) |
| `docs/status/project-status-2025-12-22.md` | References animation status |
| `docs/DESIGN_IMPLEMENTATION_AUDIT.md` | References tools/ai |
| `docs/UX_DESIGN_AUDIT.md` | References animation system |

---

## Reference Graph

### Files that reference `tools/ai/` paths

| File | Paths Referenced |
|------|------------------|
| `CLAUDE.md` | `tools/ai/capture/capture.mjs`, `tools/ai/capture/pipeline.mjs`, `tools/ai/inbox/` |
| `package.json` | `tools/ai/iterate.mjs`, `tools/ai/capture/run.mjs`, `tools/ai/diff/*.mjs` |
| `.claude/commands/iterate-visual.md` | `tools/ai/capture/capture.mjs` |
| `.claude/skills/story-portal/references/visual-iteration-pipeline.md` | `tools/ai/capture/capture.mjs`, `tools/ai/capture/pipeline.mjs` |
| `tools/ai/diff/pipeline.mjs` | `tools/ai/capture/run.mjs`, `tools/ai/scenarios/` |
| `tools/ai/scenarios/electricity-portal.json` | `tools/ai/references/electricity-portal/` |
| Various shell scripts | `tools/ai/capture/`, `tools/ai/diff/` |

### Files referenced by CLAUDE.md

| Reference | Section |
|-----------|---------|
| `node tools/ai/capture/capture.mjs` | MODE: VISUAL_ITERATION |
| `node tools/ai/capture/pipeline.mjs` | MODE: VISUAL_ITERATION (**OUTDATED** — should be `tools/ai/diff/pipeline.mjs`) |
| `tools/ai/inbox/latest.md` | Apply Latest command |
| `references/visual-iteration-pipeline.md` | MODE: VISUAL_ITERATION |
| `references/animation-standards.md` | Core Skills |
| `references/iteration-protocol.md` | Core Skills |
| `references/animation-system.md` | UX Design Skills |

### Cross-references between files

```
CLAUDE.md
  → references/visual-iteration-pipeline.md
  → references/animation-standards.md

.claude/commands/iterate-visual.md
  → .claude/skills/story-portal/references/visual-iteration-pipeline.md
  → .claude/skills/story-portal/references/animation-standards.md
  → tools/ai/capture/capture.mjs

tools/ai/diff/pipeline.mjs
  → tools/ai/capture/run.mjs
  → tools/ai/scenarios/*.json
  → tools/ai/references/*/
  → tools/ai/iterations/*/

tools/ai/scenarios/electricity-portal.json
  → tools/ai/references/electricity-portal/465x465/with_effect.png
  → tools/ai/references/electricity-portal/465x465/without_effect.png
  → tools/ai/references/electricity-portal/465x465/golden_mask.png

docs/sessions/session-animation-system.md
  → .claude/skills/story-portal/references/animation-system.md
  → docs/APP_SPECIFICATION.md
  → docs/USER_FLOWS.md
```

---

## Package.json Scripts

```json
{
  "capture:smoke": "node tools/capture/capture.mjs --mode smoke --label smoke",
  "capture:buttons": "node tools/capture/capture.mjs --mode buttons --label buttons",
  "ai:new-topics": "node tools/ai/iterate.mjs new-topics",
  "ai:hamburger": "node tools/ai/iterate.mjs hamburger",
  "ai:menu-sway": "node tools/ai/iterate.mjs menu-sway",
  "cap:smoke": "node tools/ai/capture/run.mjs --mode smoke --label smoke --video false --gif false",
  "cap:buttons": "node tools/ai/capture/run.mjs --mode buttons --label buttons_hi_fps ...",
  "cap:newtopics": "node tools/ai/capture/run.mjs --mode newtopics --label newtopics --gif true",
  "cap:menu-open": "node tools/ai/capture/run.mjs --mode menu-open --label menu_open --gif true",
  "cap:menu-close": "node tools/ai/capture/run.mjs --mode menu-close --label menu_close --gif true",
  "cap:latest": "node tools/ai/capture/pick_artifact.mjs",
  "diff:analyze": "node tools/ai/diff/run-analysis.mjs",
  "diff:latest": "node tools/ai/diff/run-analysis.mjs --latest",
  "diff:baseline": "node tools/ai/diff/extract-baseline.mjs",
  "diff:pipeline": "node tools/ai/diff/pipeline.mjs",
  "diff:crop": "node tools/ai/diff/crop.mjs",
  "iterate:electricity": "node tools/ai/diff/pipeline.mjs --scenario electricity-portal"
}
```

**Note:** `tools/capture/capture.mjs` does NOT exist (404) — these scripts may be outdated.

---

## Potential Conflicts / Issues

### 1. CLAUDE.md has outdated path

- **Line 211:** `node tools/ai/capture/pipeline.mjs`
- **Should be:** `node tools/ai/diff/pipeline.mjs`

### 2. Duplicate skill directories

- `.claude/skills/story-portal/` (active)
- `.claude/skills/story-portal.backup/` (backup)

### 3. Multiple capture scripts with overlapping functionality

- `tools/ai/capture/run.mjs` (Puppeteer, primary)
- `tools/ai/capture/capture.mjs` (older?)
- `tools/ai/capture/playwright_interval_capture.mjs` (Playwright)
- `tools/ai/capture/ffmpeg_capture.mjs` (FFmpeg)

### 4. Package.json references non-existent path

- `capture:smoke` and `capture:buttons` reference `tools/capture/capture.mjs`
- This directory doesn't exist — should be `tools/ai/capture/`

### 5. Duplicate shell script wrappers

- Shell scripts (`*.sh`) in `tools/ai/capture/` wrap the `.mjs` scripts
- May be unnecessary if using npm scripts directly

### 6. Large screenshot/iteration directories

- `tools/ai/screenshots/timeline/` contains many timestamped captures
- `tools/ai/iterations/` contains iteration output
- Should be in `.gitignore` and periodically cleaned

---

## Summary: Files for Migration

### Core Pipeline (MUST MIGRATE)

```
tools/ai/diff/
  pipeline.mjs
  analyze.mjs
  crop.mjs
  extract-baseline.mjs
  run-analysis.mjs

tools/ai/capture/
  run.mjs

tools/ai/scenarios/
  *.json

tools/ai/references/
  electricity-portal/
  test-baseline/
```

### Supporting Files (SHOULD MIGRATE)

```
tools/ai/capture/
  capture.mjs
  click_burst.mjs
  sequence_burst.mjs
  pick_artifact.mjs
  (etc.)

tools/ai/
  iterate.mjs

tools/ai/rules/
  *.md
```

### Skill References (UPDATE PATHS AFTER MIGRATION)

```
.claude/skills/story-portal/references/
  visual-iteration-pipeline.md
  animation-standards.md
  animation-system.md
  iteration-protocol.md

.claude/commands/
  iterate-visual.md
```

### Documentation (UPDATE PATHS AFTER MIGRATION)

```
CLAUDE.md (lines 210-211)
package.json (scripts section)
docs/sessions/session-animation-system.md
```

### Data Directories (EXCLUDE FROM GIT, CREATE EMPTY)

```
tools/ai/screenshots/
tools/ai/iterations/
```

---

## Proposed New Structure

```
Animations/
├── capture/
│   ├── run.mjs              # Primary Puppeteer capture
│   ├── pick_artifact.mjs    # Artifact selector
│   └── (deprecated scripts moved to archive/)
├── diff/
│   ├── pipeline.mjs         # Main iteration pipeline
│   ├── analyze.mjs          # SSIM analysis
│   ├── crop.mjs             # Frame cropping
│   └── extract-baseline.mjs # Baseline extraction
├── scenarios/
│   ├── electricity-portal.json
│   ├── hamburger.json
│   ├── menu-sway.json
│   └── new-topics.json
├── references/
│   ├── electricity-portal/
│   │   ├── 465x465/
│   │   │   ├── with_effect.png
│   │   │   ├── without_effect.png
│   │   │   └── golden_mask.png
│   │   ├── baseline_metrics.json
│   │   └── quality_spec.json
│   └── test-baseline/
├── output/                   # .gitignore
│   ├── screenshots/
│   └── iterations/
├── rules/
│   ├── ANIMATION_CAPTURE_RULE.md
│   └── SCREENSHOT_RULE.md
└── iterate.mjs               # Top-level CLI entry point
```

---

## Migration Checklist

- [ ] Create new `Animations/` directory structure
- [ ] Move core pipeline files
- [ ] Move reference assets
- [ ] Update `package.json` scripts
- [ ] Update `CLAUDE.md` paths
- [ ] Update `.claude/commands/iterate-visual.md`
- [ ] Update `.claude/skills/story-portal/references/visual-iteration-pipeline.md`
- [ ] Update `.claude/skills/story-portal/references/animation-standards.md`
- [ ] Add `Animations/output/` to `.gitignore`
- [ ] Archive deprecated scripts
- [ ] Delete backup skill directory after confirming migration
- [ ] Test pipeline end-to-end with new paths
