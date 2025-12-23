# Session State

> Last updated: 2025-12-23

## Current Focus

**Animation Iteration Pipeline** — Phase 1 (Peak Visual Quality)
- Target: SSIM ≥ 90% against Sora reference
- Status: Pipeline calibrated, ready for iteration

## Recent Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-23 | R3F stack for all effects | Simpler code, better maintainability |
| 2025-12-23 | Archive old WebGL code | Keep for reference in `src/legacy/_archived/` |
| 2025-12-23 | Trigger-based skill loading | Reduce CLAUDE.md size, load domain knowledge on-demand |
| 2025-12-22 | Two-phase iteration approach | Sora shows constant peak; our spec needs envelope |
| 2025-12-22 | Dual mask system | Separate masks for reference and capture alignment |

## Active Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| 3D | Three.js via React Three Fiber |
| Build | Vite |
| Capture | Puppeteer (headless Chrome) |
| Analysis | Sharp + SSIM.js |

## Blockers

None currently.

## Pending Review (Human)

- [x] ~~`animations/output/` folder (1.9GB)~~ — **Deleted**, restructured to per-scenario output
- [x] ~~`animations/_archive/duplicate-docs/` and `backups/`~~ — **Deleted** (redundant)
- [x] `src/legacy/_archived/` WebGL code — **Kept** for reference

## Next Actions

1. Run `/iterate-visual` to begin Phase 1 iteration
2. Or continue with other development work

---

*Update this file when focus changes or significant decisions are made.*
