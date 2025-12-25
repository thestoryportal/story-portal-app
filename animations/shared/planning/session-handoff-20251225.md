# Session Handoff — Human Review Pipeline
**Date:** 2025-12-25
**Task:** Phase 5 - Per-Frame Reference Alignment for Human Review UI

---

## FOR NEW SESSION

**Do NOT auto-execute.** Read this document, summarize status, and ask human how to proceed.

---

## Current Status

| Item | Status |
|------|--------|
| APNG Frame Extraction | Code exists, 128 frames extract successfully |
| Bug Fix (hasRefFrames) | Fixed (line 1035 typo) |
| **Per-Frame Timecode Alignment** | **NOT WORKING** — Same ref frame shows for ALL captured frames |
| Human Review Capture | Runs successfully (1321 frames @ 120fps) |
| Phase 5 Commit | Blocked until alignment fixed |

---

## Critical Issue

**Per-frame reference-to-capture alignment by timecode is NOT working.**

- **Expected:** Captured frame at +500ms shows Reference frame 15 (30fps = 33ms/frame)
- **Actual:** All captured frames show the same reference frame

---

## Files to Investigate

| File | Lines | Purpose |
|------|-------|---------|
| `animations/shared/capture/human-review.mjs` | 877-885 | Per-frame ref mapping in HTML generation |
| Same file | 1525-1531 | JavaScript `mapToRefFrame()` function |
| Same file | 1534-1580 | `updateReferenceAlignment()` function |

---

## Required Context Files

Read these before working:

1. `animations/shared/planning/Iterative Animation Pipeline/12-24-2025-file-consolidation.md`
2. `animations/shared/planning/Iterative Animation Pipeline/iterative-pipeline-human-review-diff-analysis-enhancements.md`
3. `animations/electricity-portal/scenario.json` — Calibrated values (DO NOT modify)

---

## Human Directives (Binding)

1. Static reference NEVER used in Human Review UI — animation frames only
2. APNG Frame Extraction is ESSENTIAL
3. **Per-Frame Timecode Alignment is ESSENTIAL** — Each captured frame must show its corresponding reference frame
4. Stopping Points Required — human feedback at each checkpoint
5. Follow the 6-phase master plan in `Iterative Animation Pipeline/`

---

## Functions Already Implemented

**`extractReferenceAPNGFrames(apngPath, outputDir)`** — lines 29-71
- Extracts all frames from reference APNG using ffmpeg
- Returns: `{ framesDir, frameCount, fps, durationMs, framePaths }`

**`mapCapturedToReferenceFrame(capturedTimeMs, alignmentOffsetMs, refInfo)`** — lines 73-96
- Maps captured frame timestamp → reference frame index
- Returns: frame index or null

**JavaScript `mapToRefFrame(capturedTimeMs, offsetMs)`** — lines 1525-1531
- Client-side version of the mapping function
- Used for dynamic alignment updates

---

## Latest Capture Output

```
animations/electricity-portal/human-review/20251225_040652/
```

To view:
```bash
open animations/electricity-portal/human-review/20251225_040652/human_review.html
```

---

## Pending Tasks

1. Fix per-frame reference-to-capture timecode alignment
2. Run QA capture to verify fix
3. Get human approval
4. Commit Phase 5

---

## Resume Command for New Session

```
Read animations/shared/planning/session-handoff-20251225.md and summarize where we left off. Check in with me before proceeding.
```
