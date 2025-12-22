# Baseline Analysis Report: electricity-portal

**Generated:** 2025-12-19T16:56:18.928Z

---

## Reference Dimensions
- **Width:** 847px
- **Height:** 844px

---

## Color Profile

### Brightest Point
- **Hex:** #FFFEED
- **RGB:** (255, 254, 237)

### Average Color
- **Hex:** #69481C

### Dominant Colors (Target Palette)
| Rank | Hex | RGB | Coverage |
|------|-----|-----|----------|
| 1 | #382008 | (56, 32, 8) | 2.18% |
| 2 | #302008 | (48, 32, 8) | 2.07% |
| 3 | #402808 | (64, 40, 8) | 1.77% |
| 4 | #201000 | (32, 16, 0) | 1.47% |
| 5 | #483010 | (72, 48, 16) | 1.32% |
| 6 | #482808 | (72, 40, 8) | 1.29% |

---

## Effect Region (from Golden Mask)



- **Effect Pixels:** 562,471
- **Coverage:** 78.7% of frame

### Bounding Box
- **Position:** (0, 0)
- **Size:** 846 x 803

### Center of Mass
- **Position:** (419, 384)

### Brightness
- **Average in effect region:** 60.9
- **Bright pixel count (>200):** 9,723

---

## Structural Analysis

- **Edge pixel count:** 5,021
- **Edge density:** 0.702%
- **Note:** Higher edge density indicates more branching/detail in the effect

---

## Intensity Distribution (Radial Zones)

| Zone | Avg Brightness | Pixels |
|------|----------------|--------|
| core | 168 | 22,372 |
| inner | 108 | 117,470 |
| outer | 59 | 218,198 |
| edge | 44 | 201,420 |

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
Brightness: Core (168) > Inner > Outer > Edge
Edge density: Within ±25% of 0.702%
```

### Iteration Checklist
- [ ] Colors match dominant palette (±15%)
- [ ] Brightness gradient: core is brightest
- [ ] Edge density indicates proper detail
- [ ] Effect contained within bounding box
- [ ] SSIM ≥0.85 against reference
