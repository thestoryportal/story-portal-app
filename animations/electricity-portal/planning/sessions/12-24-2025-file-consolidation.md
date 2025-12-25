# Session: Animation Files Consolidation Audit

**Date:** 2025-12-24
**Purpose:** Comprehensive audit of all animation-related files and consolidation plan
**Status:** Plan approved, execution in progress

---

## Preserved Calibration Values

These values were established through iterative calibration and MUST NOT be changed:

### scenario.json (Source of Truth)

```json
{
  "capture": {
    "crop": {
      "x": 482,
      "y": 39,
      "width": 465,
      "height": 465,
      "_note": "Calibrated 2025-12-24: left 1px, down 1px for mask alignment"
    },
    "effectTiming": {
      "startMs": 1200,
      "endMs": 2000,
      "targetFrameCount": 128,
      "_note": "Peak stable window (0.8s). Loop to match reference 128 frames."
    },
    "viewport": { "width": 1440, "height": 768 },
    "deviceScaleFactor": 1,
    "settleMs": 500,
    "duration": 3200
  },
  "reference": {
    "_alignment": {
      "resizeTo": { "width": 452, "height": 463 },
      "offsetOnCanvas": { "x": 5, "y": 1 },
      "canvasSize": 465,
      "calibratedDate": "2025-12-23"
    },
    "_maskSpec": {
      "format": "white ellipse on black (binary)",
      "innerSize": "319x317",
      "center": { "x": 232.5, "y": 232.5 },
      "radii": { "rx": 159.5, "ry": 158.5 }
    }
  },
  "setupStatus": {
    "viewportVerified": true,
    "cropCalibrated": true,
    "maskVerified": true,
    "timingVerified": true,
    "videoPipelineVerified": true,
    "referenceAlignmentComplete": true,
    "verifiedDate": "2025-12-24"
  }
}
```

---

## Markdown Files Audit Summary

**Total files audited:** 25
**Fully current:** 7
**Outdated:** 18
**100% duplicates:** 2

### Files by Category

| Category | Count | Status |
|----------|-------|--------|
| `.claude/skills/` | 5 | 50-70% redundancy, outdated paths |
| `animations/shared/docs/` | 9 | Mixed; workflows outdated |
| `animations/shared/rules/` | 3 | Outdated path references |
| `animations/electricity-portal/` | 3 | Includes duplicate context.md |
| `docs/` | 4 | Mostly obsolete status docs |

### Key Issues Found

1. **Path references** - Still reference `tools/ai/` instead of `animations/`
2. **Calibration values** - Docs have old values (crop 475,36 vs current 482,39)
3. **Timing values** - Docs have 975-2138ms vs current 1200-2000ms
4. **Script references** - Reference deprecated `run.mjs` instead of `video.mjs`

---

## Code Files Audit Summary

**Total files audited:** 50+

### Capture Scripts

| File | Status | Notes |
|------|--------|-------|
| `animations/shared/capture/video.mjs` | **CURRENT** | Puppeteer CDP screencast |
| `animations/shared/capture/run.mjs` | DEPRECATED | Puppeteer burst mode |
| `animations/shared/capture/capture.mjs` | DEPRECATED | Playwright capture |
| `animations/shared/iterate.mjs` | DEPRECATED | Uses run.mjs |

### Diff/Analysis Scripts

| File | Status | Notes |
|------|--------|-------|
| `animations/shared/diff/pipeline.mjs` | **CURRENT** | Iteration orchestrator |
| `animations/shared/diff/video-analyze.mjs` | **CURRENT** | Video SSIM analysis |
| `animations/shared/diff/analyze.mjs` | Current | Static frame analysis |

### Source Code

| File | Status | Notes |
|------|--------|-------|
| `src/legacy/components/ElectricityR3F.tsx` | **PRIMARY** | R3F electricity component |
| `src/legacy/effects/shaders.ts` | Legacy | Raw WebGL, not used by R3F |
| `src/legacy/effects/boltGenerator.ts` | Legacy | Custom bolts, R3F uses LightningStrike |
| `src/legacy/effects/useElectricityEffect.ts` | Legacy | Canvas hook |
| `src/legacy/effects/useElectricityEffectThree.ts` | Legacy | Intermediate attempt |
| `src/legacy/effects/noiseUtils.ts` | Legacy | Simplex noise for custom bolts |

### Package.json Scripts (Before Consolidation)

```json
{
  "capture:smoke": "node animations/shared/capture/capture.mjs",      // ⚠️ DEPRECATED
  "capture:buttons": "node animations/shared/capture/capture.mjs",    // ⚠️ DEPRECATED
  "cap:smoke": "node animations/shared/capture/run.mjs",              // ⚠️ DEPRECATED
  "cap:buttons": "node animations/shared/capture/run.mjs",            // ⚠️ DEPRECATED
  "cap:newtopics": "node animations/shared/capture/run.mjs",          // ⚠️ DEPRECATED
  "iterate:electricity": "node animations/shared/diff/pipeline.mjs"   // ✅ CURRENT
}
```

---

## Consolidation Plan Executed

### Phase 1: Archive Deprecated Files

Created directories:
- `animations/_archived/capture-deprecated/`
- `src/legacy/_archived/effects-webgl/`

Moved deprecated capture scripts and legacy effects code.

### Phase 2: Update Package.json

Removed deprecated scripts, kept `iterate:electricity`.

### Phase 3: Delete Duplicates

Deleted `docs/aaa-animation-context.md` (100% duplicate of `animations/electricity-portal/context.md`)

### Phase 4: Delete Outdated Status Docs

Removed obsolete documentation files.

### Phase 5: Update Effects Exports

Updated `src/legacy/effects/index.ts` to only export current components.

### Phase 6: Initial Verification

Ran `pnpm lint` - passed.

---

## Additional Phases (Executed Later)

### Phase 7: Fix Outdated Calibration Values

Updated crop coordinates from (475, 36) to (482, 39) in:
- `animations/shared/docs/workflows/crop-calibration-workflow.md`
- `animations/shared/docs/workflows/timing-verification-workflow.md`
- `animations/shared/docs/references/existing-tools.md`
- `.claude/skills/story-portal/references/visual-iteration-pipeline.md`

### Phase 8: Fix Outdated Timing Values

Updated timing from 975-2138ms to 1200-2000ms in:
- `animations/shared/docs/references/existing-tools.md`
- `animations/shared/docs/workflows/timing-verification-workflow.md`

### Phase 9: Fix Deprecated Script References

Replaced `run.mjs` with `video.mjs` in:
- `animations/shared/rules/SCREENSHOT_RULE.md`
- `animations/shared/rules/ANIMATION_CAPTURE_RULE.md`

### Phase 10: Fix Path References

Updated `animations/electricity-portal/context.md` to reference correct paths.

### Phase 11: Consolidate Redundant Skill Files

Converted to stubs referencing `animations/shared/docs/SKILL.md`:
- `.claude/skills/story-portal/references/animation-iteration.md`
- `.claude/skills/story-portal/references/animation-standards.md`
- `.claude/skills/story-portal/references/visual-iteration-pipeline.md` (updated calibration values)

### Phase 12: Final Verification

Ran `pnpm lint` - passed.

---

## Background Context

### Core Capture Challenge

The app's electricity effect has a lifecycle (build-up → peak → fade-out) while the Sora reference APNG shows constant peak intensity. The two-phase approach in scenario.json addresses this:

- **Phase 1:** Match Sora reference at constant peak intensity (1200-2000ms window)
- **Phase 2:** Add temporal envelope (build/decay) while preserving Phase 1 visual quality

### Technology Stack

- **Capture:** Puppeteer CDP screencast (`video.mjs`)
- **Analysis:** SSIM comparison with Sharp and FFmpeg
- **Effects:** React Three Fiber with three-stdlib LightningStrike
- **Frame matching:** Loop captured frames to match reference 128 frames at 30fps

---

## Files to Never Modify Without Re-Calibration

1. `animations/electricity-portal/scenario.json` - All calibrated values
2. Reference images in `animations/electricity-portal/references/465x465/`
3. Mask specification parameters

---

*Session summary preserved for future reference.*
