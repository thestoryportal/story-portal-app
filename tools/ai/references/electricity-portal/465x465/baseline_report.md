# Baseline Analysis Report: electricity-portal

**Generated:** 2025-12-19T17:13:00.826Z

---

## Reference Dimensions
- **Width:** 465px
- **Height:** 465px

---

## Color Profile

### Brightest Point
- **Hex:** #FEFFEE
- **RGB:** (254, 255, 238)

### Average Color
- **Hex:** #68481C

### Dominant Colors (Target Palette)
| Rank | Hex | RGB | Coverage |
|------|-----|-----|----------|
| 1 | #382008 | (56, 32, 8) | 2.33% |
| 2 | #302008 | (48, 32, 8) | 2.15% |
| 3 | #402808 | (64, 40, 8) | 1.81% |
| 4 | #201000 | (32, 16, 0) | 1.49% |
| 5 | #482808 | (72, 40, 8) | 1.43% |
| 6 | #483010 | (72, 48, 16) | 1.43% |

---

## Effect Region (from Golden Mask)



- **Effect Pixels:** 79,615
- **Coverage:** 36.8% of frame

### Bounding Box
- **Position:** (0, 0)
- **Size:** 464 x 464

### Center of Mass
- **Position:** (230, 228)

### Brightness
- **Average in effect region:** 97.0
- **Bright pixel count (>200):** 2,899

---

## Structural Analysis

- **Edge pixel count:** 1,536
- **Edge density:** 0.710%
- **Note:** Higher edge density indicates more branching/detail in the effect

---

## Intensity Distribution (Radial Zones)

| Zone | Avg Brightness | Pixels |
|------|----------------|--------|
| core | 168 | 6,772 |
| inner | 108 | 35,684 |
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
Brightness: Core (168) > Inner > Outer > Edge
Edge density: Within ±25% of 0.710%
```

### Iteration Checklist
- [ ] Colors match dominant palette (±15%)
- [ ] Brightness gradient: core is brightest
- [ ] Edge density indicates proper detail
- [ ] Effect contained within bounding box
- [ ] SSIM ≥0.85 against reference
