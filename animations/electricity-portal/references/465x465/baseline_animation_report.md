# Animation Baseline Report: electricity

**Generated:** 2025-12-22T23:50:40.245Z
**Source:** /Users/robertrhu/Projects/story-portal/animations/electricity-portal/references/465x465/sora_reference_1.5x.apng

---

## Animation Properties

| Property | Value |
|----------|-------|
| Frame Count | 87 |
| Dimensions | 465 × 465 |
| Duration | N/A |
| Effective FPS | N/A |
| Codec | apng |

---

## Brightness Analysis

| Metric | Value |
|--------|-------|
| Mean Brightness | 55.0 |
| Min Brightness | 54.0 (frame 18) |
| Max Brightness | 55.8 (frame 46) |
| Brightness Range | 1.8 |
| Std Deviation | 0.51 |

**Interpretation:** Low dynamic range — effect maintains consistent brightness.

---

## Motion Analysis

| Metric | Value |
|--------|-------|
| Average Frame Change | 4.58 |
| Max Frame Change | 6.67 |
| Min Frame Change | 0.00 |
| High Motion Frames | 0 |
| Low Motion Frames | 4 |
| Total Motion Energy | 394.1 |

**Interpretation:** Low motion — relatively static with subtle changes.

---

## Flicker Analysis

| Metric | Value |
|--------|-------|
| Average Flicker | 0.33 |
| Max Flicker | 1.41 |
| Flicker Intensity | 0.29 |
| Oscillation Count | 39 |

**Interpretation:** Moderate flickering — periodic brightness pulses.

---

## Color Stability

| Metric | Value |
|--------|-------|
| Average Color Shift | 0.89 |
| Max Color Shift | 3.00 |
| Color Consistency | 99.7% |

**Interpretation:** Highly consistent color palette — hue remains stable.

---

## Key Frames

| Frame Type | Frame # | Description |
|------------|---------|-------------|
| Peak | 46 | Brightest frame |
| Representative | 39 | Closest to mean brightness |
| High Motion | 67 | Most change from previous |
| First | 0 | Animation start |
| Last | 86 | Animation end |

---

## Usage in Iteration

### Target Animation Characteristics

```
Brightness range: 54-56 (mean: 55)
Motion energy: 4.6 avg per frame
Flicker rate: 39 oscillations over 87 frames
Color consistency: 100%
```

### Video SSIM Comparison Notes

When comparing captured animation to this reference:
- **High Video SSIM + Low Frame SSIM**: Animation timing matches but spatial details differ
- **Low Video SSIM + High Frame SSIM**: Static frames match but animation differs
- **Both High**: Animation matches well overall
- **Both Low**: Major differences in both spatial and temporal domains

### Flicker Matching

Reference has significant flickering. Captured animation should show similar oscillation patterns.
