# Diff Analysis Report

**Generated:** 2025-12-19T15:39:06.996Z
**Frames Analyzed:** 6

---

## Verdict: EXCELLENT

✅ Excellent match (SSIM 100.0%). Effect closely matches reference.

---

## Scores Summary

| Metric | Best Frame | Mean | Threshold |
|--------|------------|------|-----------|
| SSIM | 100.0% | 100.0% | ≥85% |
| Diff % | 0.0% | 0.0% | <15% |

### SSIM Distribution
- **Best:** 100.0%
- **Median:** 100.0%
- **Worst:** 100.0%

---

## Best Frame

- **File:** `2.png`
- **SSIM:** 99.99%
- **Diff Pixels:** 0.00%

---

## Worst Frames (for debugging)

1. `5.png` - SSIM 100.0%
2. `4.png` - SSIM 100.0%
3. `1.png` - SSIM 100.0%

---

## Artifacts

| File | Description |
|------|-------------|
| `best_frame.png` | Frame with highest SSIM score |
| `diff_heatmap.png` | Visual diff (red = different pixels) |
| `comparison.png` | Side-by-side: reference vs capture |
| `scores.json` | Full metrics data (machine-readable) |

---

## Per-Frame Scores

| Frame | SSIM | Diff % |
|-------|------|--------|
| 1.png | 100.0% | 0.0% |
| 2.png | 100.0% | 0.0% |
| 3.png | 100.0% | 0.0% |
| 4.png | 100.0% | 0.0% |
| 5.png | 100.0% | 0.0% |
| 6.png | 100.0% | 0.0% |


---

## Next Steps

### Passed Threshold
- Review `comparison.png` for qualitative assessment
- Check `diff_heatmap.png` for any remaining issues
- Consider if further polish iterations are needed
