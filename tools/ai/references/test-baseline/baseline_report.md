# Baseline Analysis Report: test-effect

**Generated:** 2025-12-19T15:38:25.295Z

---

## Reference Dimensions
- **Width:** 1280px
- **Height:** 840px

---

## Color Profile

### Brightest Point
- **Hex:** #FFFFFF
- **RGB:** (255, 255, 255)

### Average Color
- **Hex:** #E5E5E4

### Dominant Colors (Target Palette)
| Rank | Hex | RGB | Coverage |
|------|-----|-----|----------|
| 1 | #F8F8F8 | (248, 248, 248) | 87.56% |
| 2 | #000000 | (0, 0, 0) | 0.97% |
| 3 | #080800 | (8, 8, 0) | 0.90% |
| 4 | #203040 | (32, 48, 64) | 0.86% |
| 5 | #100800 | (16, 8, 0) | 0.84% |
| 6 | #080000 | (8, 0, 0) | 0.65% |

---

## Effect Region (from Golden Mask)

⚠️ *Mask estimated from brightness (no "without" reference provided)*


- **Effect Pixels:** 946,265
- **Coverage:** 88.0% of frame

### Bounding Box
- **Position:** (0, 0)
- **Size:** 1279 x 839

### Center of Mass
- **Position:** (639, 421)

### Brightness
- **Average in effect region:** 254.8
- **Bright pixel count (>200):** 944,954

---

## Structural Analysis

- **Edge pixel count:** 0
- **Edge density:** 0.000%
- **Note:** Higher edge density indicates more branching/detail in the effect

---

## Intensity Distribution (Radial Zones)

| Zone | Avg Brightness | Pixels |
|------|----------------|--------|
| core | 25 | 22,129 |
| inner | 93 | 116,364 |
| outer | 242 | 216,132 |
| edge | 249 | 199,476 |

**Expected Pattern:** Core > Inner > Outer > Edge

---

## Generated Artifacts

| File | Description |
|------|-------------|
| `golden_mask.png` | Binary mask of effect region |
| `golden_mask_soft.png` | Feathered mask for softer scoring |
| `baseline_metrics.json` | Machine-readable metrics |
| `quality_spec.json` | Quality thresholds for iteration |

---

## Usage in Iteration

### Target Metrics for Claude

```
SSIM target: ≥0.85 (within masked region)
Color delta: Dominant colors within 15% of baseline
Brightness: Core (25) > Inner > Outer > Edge
Edge density: Within ±25% of 0.000%
```

### Iteration Checklist
- [ ] Colors match dominant palette (±15%)
- [ ] Brightness gradient: core is brightest
- [ ] Edge density indicates proper detail
- [ ] Effect contained within bounding box
- [ ] SSIM ≥0.85 against reference
