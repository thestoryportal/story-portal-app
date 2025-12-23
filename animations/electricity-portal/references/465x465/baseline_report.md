# Baseline Analysis Report: electricity

**Generated:** 2025-12-22T23:47:03.566Z

---

## Reference Dimensions
- **Width:** 465px
- **Height:** 465px

---

## Color Profile

### Brightest Point
- **Hex:** #FFFFFF
- **RGB:** (255, 255, 255)

### Average Color
- **Hex:** #533A17

### Dominant Colors (Target Palette)
| Rank | Hex | RGB | Coverage |
|------|-----|-----|----------|
| 1 | #000000 | (0, 0, 0) | 20.08% |
| 2 | #382008 | (56, 32, 8) | 1.61% |
| 3 | #302008 | (48, 32, 8) | 1.53% |
| 4 | #302810 | (48, 40, 16) | 1.28% |
| 5 | #483010 | (72, 48, 16) | 1.10% |
| 6 | #281808 | (40, 24, 8) | 0.95% |

---

## Effect Region (from Golden Mask)



- **Effect Pixels:** 78,862
- **Coverage:** 36.5% of frame

### Bounding Box
- **Position:** (0, 0)
- **Size:** 464 x 460

### Center of Mass
- **Position:** (234, 227)

### Brightness
- **Average in effect region:** 99.3
- **Bright pixel count (>200):** 3,385

---

## Structural Analysis

- **Edge pixel count:** 0
- **Edge density:** 0.000%
- **Note:** Higher edge density indicates more branching/detail in the effect

---

## Intensity Distribution (Radial Zones)

| Zone | Avg Brightness | Pixels |
|------|----------------|--------|
| core | 170 | 6,772 |
| inner | 106 | 35,684 |
| outer | 59 | 66,264 |
| edge | 44 | 61,048 |

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
Brightness: Core (170) > Inner > Outer > Edge
Edge density: Within ±25% of 0.000%
```

### Iteration Checklist
- [ ] Colors match dominant palette (±15%)
- [ ] Brightness gradient: core is brightest
- [ ] Edge density indicates proper detail
- [ ] Effect contained within bounding box
- [ ] SSIM ≥0.85 against reference
