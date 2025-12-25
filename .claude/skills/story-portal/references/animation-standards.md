# Animation Standards Reference

> **Primary Documentation:** `animations/shared/docs/SKILL.md`
> **Scenario Details:** `animations/electricity-portal/scenario.json`

---

## Quality Benchmark

AAA video game quality—NOT cartoon effects. Think Uncharted, God of War, Diablo-level polish.

---

## Electricity Effect Color Palette

| Element | Hex | Description |
|---------|-----|-------------|
| Core | `#FFF5C8` | Bright white-cream |
| Inner | `#FFD27A` | Warm gold |
| Outer | `#FF9A2A` | Deep amber |
| Haze | `#A45A10` | Dark amber atmospheric |

---

## Rendering Pipeline

1. **Bolt Render** — Generate lightning geometry (three-stdlib LightningStrike)
2. **Bloom** — Multi-scale Gaussian blur
3. **Composite** — Blend with circular mask
4. **Tone Map** — ACES filmic HDR

---

## Performance Targets

| Metric | Target | Hard Limit |
|--------|--------|------------|
| Frame Rate | 60fps | Never below 30fps |
| GPU Memory | <100MB | <256MB |

---

## WebGL Capture (Puppeteer)

```javascript
// ✅ Working macOS config
await puppeteer.launch({
  headless: 'new',
  args: [
    '--enable-webgl',
    '--enable-webgl2',
    '--ignore-gpu-blocklist',
    '--enable-gpu-rasterization'
    // NO --use-gl flag on macOS
  ]
});
```

---

## For Full Documentation

See: `animations/shared/docs/SKILL.md`

*This is a stub. Full details in SKILL.md. Updated 2025-12-24.*
