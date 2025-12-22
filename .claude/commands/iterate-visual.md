# Visual Iteration Mode

Activate visual iteration mode for animation effects.

## Activation

When user says "iterate on [effect]" or "visual iteration mode":

1. Read the scenario context:
   - `animations/<scenario>/context.md` — Scenario-specific context
   - `animations/<scenario>/scenario.json` — Scenario configuration

2. Check setup status:
   ```bash
   cat animations/electricity-portal/scenario.json | grep -A5 "setupStatus"
   ```

3. If setup incomplete, run setup first (refer to scenario context.md)

4. If setup complete, begin iteration:
   ```bash
   node animations/shared/diff/pipeline.mjs --scenario electricity-portal
   ```

## Human Checkpoints

NEVER proceed without human verification at each checkpoint:
- Viewport verified?
- Crop calibrated?
- Mask verified?
- Timing verified?
- Each iteration approved?

## Key Paths

| Path | Purpose |
|------|---------|
| `animations/shared/diff/pipeline.mjs` | Main iteration pipeline |
| `animations/shared/capture/run.mjs` | Puppeteer capture |
| `animations/<scenario>/scenario.json` | Scenario configuration |
| `animations/<scenario>/references/` | Baseline images/metrics |
| `animations/<scenario>/output/` | Generated output (gitignored) |

## Available Scenarios

| Scenario | Description |
|----------|-------------|
| `electricity-portal` | Portal electricity effect |
| `hamburger` | Hamburger menu animation |
| `menu-sway` | Menu panel sway effect |
| `new-topics` | New topics button animation |

## Documentation

| Document | Purpose |
|----------|---------|
| `animations/shared/docs/SKILL.md` | Full pipeline skill documentation |
| `animations/shared/docs/sessions/session-setup.md` | 4-phase setup guide |
| `animations/shared/docs/sessions/session-iteration.md` | Iteration loop guide |
| `animations/shared/docs/workflows/` | Per-phase workflow details |
| `animations/shared/docs/references/troubleshooting.md` | Common issues |
