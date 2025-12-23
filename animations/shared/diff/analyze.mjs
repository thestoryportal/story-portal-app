/**
 * analyze.mjs
 *
 * Core diff analysis engine for AAA animation iteration.
 * Compares captured frames against reference images using SSIM and pixel diff.
 *
 * Usage:
 *   import { analyzeCapture } from './analyze.mjs';
 *   const report = await analyzeCapture({ framesDir, referencePath, outputDir });
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { ssim } from 'ssim.js';

/**
 * Main analysis entry point
 */
export async function analyzeCapture(options) {
  const {
    framesDir,
    referencePath,
    maskPath = null,
    outputDir,
    thresholds = {}
  } = options;

  const config = {
    ssimPass: thresholds.ssim ?? 0.85,
    ssimGood: thresholds.ssimGood ?? 0.92,
    ssimExcellent: thresholds.ssimExcellent ?? 0.95,
    diffPercentMax: thresholds.diffPercent ?? 15,
    ...thresholds
  };

  console.log('Loading reference image...');
  const reference = await loadImage(referencePath);
  const mask = maskPath ? await loadImage(maskPath) : null;

  // Get all frames (supports frame_001.png or 1.png naming)
  const frameFiles = fs.readdirSync(framesDir)
    .filter(f => f.endsWith('.png'))
    .sort((a, b) => {
      // Extract numbers for proper sorting
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

  if (frameFiles.length === 0) {
    throw new Error(`No PNG frames found in ${framesDir}`);
  }

  console.log(`Analyzing ${frameFiles.length} frames against reference...`);

  // Analyze each frame
  const frameResults = [];

  for (let i = 0; i < frameFiles.length; i++) {
    const frameFile = frameFiles[i];
    const framePath = path.join(framesDir, frameFile);

    process.stdout.write(`\r  Frame ${i + 1}/${frameFiles.length}: ${frameFile}`);

    const frame = await loadImage(framePath);
    const result = await analyzeFrame(frame, reference, mask, frameFile);
    frameResults.push(result);
  }
  console.log('\n');

  // Aggregate results
  const aggregated = aggregateResults(frameResults, config);

  // Generate outputs
  fs.mkdirSync(outputDir, { recursive: true });

  // Save best frame
  const bestFramePath = path.join(framesDir, aggregated.bestFrame.file);
  fs.copyFileSync(bestFramePath, path.join(outputDir, 'best_frame.png'));

  // Generate diff heatmap for best frame
  console.log('Generating diff heatmap...');
  let bestFrame = await loadImage(bestFramePath);
  // Resize best frame to match reference if needed
  if (bestFrame.width !== reference.width || bestFrame.height !== reference.height) {
    bestFrame = await resizeToMatch(bestFrame, reference.width, reference.height);
  }
  await generateDiffHeatmap(
    bestFrame,
    reference,
    mask,
    path.join(outputDir, 'diff_heatmap.png')
  );

  // Generate side-by-side comparison
  console.log('Generating comparison image...');
  await generateComparison(
    bestFramePath,
    referencePath,
    path.join(outputDir, 'comparison.png')
  );

  // Build report
  const report = {
    timestamp: new Date().toISOString(),
    reference: referencePath,
    framesAnalyzed: frameResults.length,

    bestFrame: aggregated.bestFrame,
    worstFrames: aggregated.worstFrames,

    scores: {
      bestSsim: aggregated.bestFrame.ssim,
      meanSsim: aggregated.meanSsim,
      medianSsim: aggregated.medianSsim,
      minSsim: aggregated.minSsim,
      maxSsim: aggregated.maxSsim,

      bestDiffPercent: aggregated.bestFrame.diffPercent,
      meanDiffPercent: aggregated.meanDiffPercent
    },

    verdict: {
      pass: aggregated.bestFrame.ssim >= config.ssimPass,
      quality: getQualityLevel(aggregated.bestFrame.ssim, config),
      message: generateVerdictMessage(aggregated, config)
    },

    thresholds: config,

    perFrameScores: frameResults.map(r => ({
      frame: r.file,
      ssim: Math.round(r.ssim * 10000) / 10000,
      diffPercent: Math.round(r.diffPercent * 100) / 100
    }))
  };

  // Save JSON report
  fs.writeFileSync(
    path.join(outputDir, 'scores.json'),
    JSON.stringify(report, null, 2)
  );

  // Generate markdown report
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(path.join(outputDir, 'report.md'), markdown);

  return report;
}

/**
 * Load an image and return raw pixel data
 */
async function loadImage(filepath) {
  const buffer = await sharp(filepath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: new Uint8Array(buffer.data),
    width: buffer.info.width,
    height: buffer.info.height,
    channels: buffer.info.channels
  };
}

/**
 * Analyze a single frame against reference
 */
async function analyzeFrame(frame, reference, mask, filename) {
  const { width, height } = reference;

  // Ensure frame matches reference dimensions
  let processedFrame = frame;
  if (frame.width !== width || frame.height !== height) {
    processedFrame = await resizeToMatch(frame, width, height);
  }

  // Apply mask if provided
  const [maskedFrame, maskedRef] = mask
    ? [applyMask(processedFrame, mask), applyMask(reference, mask)]
    : [processedFrame, reference];

  // Compute SSIM
  // ssim.js expects ImageData-like objects with matching dimensions
  const ssimResult = ssim(
    { data: maskedFrame.data, width: maskedFrame.width, height: maskedFrame.height },
    { data: maskedRef.data, width: maskedRef.width, height: maskedRef.height }
  );

  // Compute pixel diff
  const diffOutput = new Uint8Array(width * height * 4);
  const diffPixels = pixelmatch(
    maskedFrame.data,
    maskedRef.data,
    diffOutput,
    width,
    height,
    { threshold: 0.1, includeAA: false }
  );

  const totalPixels = mask
    ? countMaskPixels(mask)
    : width * height;

  const diffPercent = (diffPixels / totalPixels) * 100;

  return {
    file: filename,
    ssim: ssimResult.mssim,
    diffPixels,
    diffPercent,
    totalPixels
  };
}

/**
 * Resize image to match target dimensions
 */
async function resizeToMatch(image, width, height) {
  const buffer = await sharp(Buffer.from(image.data), {
    raw: { width: image.width, height: image.height, channels: 4 }
  })
    .resize(width, height)
    .raw()
    .toBuffer();

  return {
    data: new Uint8Array(buffer),
    width,
    height,
    channels: 4
  };
}

/**
 * Get mask value at pixel index
 * Handles multiple mask formats:
 * - Grayscale: red channel > 127 = include
 * - Alpha-based: alpha < 127 = include (transparent area is the region of interest)
 */
function getMaskValue(mask, i) {
  const r = mask.data[i];
  const a = mask.data[i + 3];

  // If red channel has values, use it (grayscale mask)
  if (r > 10) {
    return r > 127;
  }

  // Otherwise use alpha channel (inverted: transparent = include)
  return a < 127;
}

/**
 * Apply mask to image (zero out pixels outside mask)
 */
function applyMask(image, mask) {
  const result = new Uint8Array(image.data.length);

  for (let i = 0; i < image.data.length; i += 4) {
    if (getMaskValue(mask, i)) {
      // Keep pixel
      result[i] = image.data[i];
      result[i + 1] = image.data[i + 1];
      result[i + 2] = image.data[i + 2];
      result[i + 3] = image.data[i + 3];
    }
    // Else leave as zero (black/transparent)
  }

  return {
    data: result,
    width: image.width,
    height: image.height,
    channels: 4
  };
}

/**
 * Count pixels included by mask
 */
function countMaskPixels(mask) {
  let count = 0;
  for (let i = 0; i < mask.data.length; i += 4) {
    if (getMaskValue(mask, i)) count++;
  }
  return count;
}

/**
 * Aggregate per-frame results
 */
function aggregateResults(frameResults, config) {
  const ssimValues = frameResults.map(r => r.ssim);
  const diffValues = frameResults.map(r => r.diffPercent);

  // Sort by SSIM (descending)
  const sorted = [...frameResults].sort((a, b) => b.ssim - a.ssim);

  return {
    bestFrame: sorted[0],
    worstFrames: sorted.slice(-3).reverse(),

    meanSsim: mean(ssimValues),
    medianSsim: median(ssimValues),
    minSsim: Math.min(...ssimValues),
    maxSsim: Math.max(...ssimValues),

    meanDiffPercent: mean(diffValues),

    frameCount: frameResults.length
  };
}

/**
 * Generate diff heatmap visualization
 */
async function generateDiffHeatmap(frame, reference, mask, outputPath) {
  const { width, height } = reference;
  const diffOutput = new Uint8Array(width * height * 4);

  pixelmatch(
    frame.data,
    reference.data,
    diffOutput,
    width,
    height,
    {
      threshold: 0.1,
      diffColor: [255, 0, 0],      // Red for differences
      diffColorAlt: [0, 255, 0],   // Green for anti-aliased
      alpha: 0.5
    }
  );

  // Convert to PNG and save
  await sharp(Buffer.from(diffOutput), {
    raw: { width, height, channels: 4 }
  })
    .png()
    .toFile(outputPath);
}

/**
 * Generate side-by-side comparison image
 */
async function generateComparison(capturePath, referencePath, outputPath) {
  const [capMeta, refMeta] = await Promise.all([
    sharp(capturePath).metadata(),
    sharp(referencePath).metadata()
  ]);

  const width = Math.max(capMeta.width, refMeta.width);
  const height = Math.max(capMeta.height, refMeta.height);
  const gap = 20;
  const labelHeight = 30;

  // Resize both to same dimensions
  const [captureBuffer, referenceBuffer] = await Promise.all([
    sharp(capturePath).resize(width, height, { fit: 'contain', background: { r: 20, g: 20, b: 20, alpha: 1 } }).toBuffer(),
    sharp(referencePath).resize(width, height, { fit: 'contain', background: { r: 20, g: 20, b: 20, alpha: 1 } }).toBuffer()
  ]);

  // Create composite
  await sharp({
    create: {
      width: width * 2 + gap,
      height: height + labelHeight,
      channels: 4,
      background: { r: 20, g: 20, b: 20, alpha: 1 }
    }
  })
    .composite([
      { input: referenceBuffer, left: 0, top: labelHeight },
      { input: captureBuffer, left: width + gap, top: labelHeight }
    ])
    .png()
    .toFile(outputPath);
}

/**
 * Get quality level string
 */
function getQualityLevel(ssim, config) {
  if (ssim >= config.ssimExcellent) return 'excellent';
  if (ssim >= config.ssimGood) return 'good';
  if (ssim >= config.ssimPass) return 'acceptable';
  return 'fail';
}

/**
 * Generate verdict message
 */
function generateVerdictMessage(aggregated, config) {
  const { bestFrame, meanSsim } = aggregated;
  const ssimPercent = (bestFrame.ssim * 100).toFixed(1);

  if (bestFrame.ssim >= config.ssimExcellent) {
    return `Excellent match (SSIM ${ssimPercent}%). Effect closely matches reference.`;
  }

  if (bestFrame.ssim >= config.ssimGood) {
    return `Good match (SSIM ${ssimPercent}%). Minor refinements may improve quality.`;
  }

  if (bestFrame.ssim >= config.ssimPass) {
    return `Acceptable match (SSIM ${ssimPercent}%). Review diff heatmap for improvement areas.`;
  }

  if (bestFrame.ssim >= 0.7) {
    return `Below threshold (SSIM ${ssimPercent}%). Significant differences remain. Check diff_heatmap.png.`;
  }

  return `Poor match (SSIM ${ssimPercent}%). Major revision needed. Verify effect is rendering correctly.`;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
  const { scores, verdict, bestFrame, worstFrames, thresholds } = report;

  return `# Diff Analysis Report

**Generated:** ${report.timestamp}
**Frames Analyzed:** ${report.framesAnalyzed}

---

## Verdict: ${verdict.quality.toUpperCase()}

${verdict.pass ? '✅' : '❌'} ${verdict.message}

---

## Scores Summary

| Metric | Best Frame | Mean | Threshold |
|--------|------------|------|-----------|
| SSIM | ${(scores.bestSsim * 100).toFixed(1)}% | ${(scores.meanSsim * 100).toFixed(1)}% | ≥${(thresholds.ssimPass * 100)}% |
| Diff % | ${scores.bestDiffPercent.toFixed(1)}% | ${scores.meanDiffPercent.toFixed(1)}% | <${thresholds.diffPercentMax}% |

### SSIM Distribution
- **Best:** ${(scores.maxSsim * 100).toFixed(1)}%
- **Median:** ${(scores.medianSsim * 100).toFixed(1)}%
- **Worst:** ${(scores.minSsim * 100).toFixed(1)}%

---

## Best Frame

- **File:** \`${bestFrame.file}\`
- **SSIM:** ${(bestFrame.ssim * 100).toFixed(2)}%
- **Diff Pixels:** ${bestFrame.diffPercent.toFixed(2)}%

---

## Worst Frames (for debugging)

${worstFrames.map((f, i) => `${i + 1}. \`${f.file}\` - SSIM ${(f.ssim * 100).toFixed(1)}%`).join('\n')}

---

## Artifacts

| File | Description |
|------|-------------|
| \`best_frame.png\` | Frame with highest SSIM score |
| \`diff_heatmap.png\` | Visual diff (red = different pixels) |
| \`comparison.png\` | Side-by-side: reference vs capture |
| \`scores.json\` | Full metrics data (machine-readable) |

---

## Per-Frame Scores

| Frame | SSIM | Diff % |
|-------|------|--------|
${report.perFrameScores.slice(0, 20).map(f =>
  `| ${f.frame} | ${(f.ssim * 100).toFixed(1)}% | ${f.diffPercent.toFixed(1)}% |`
).join('\n')}
${report.perFrameScores.length > 20 ? `\n*... and ${report.perFrameScores.length - 20} more frames*` : ''}

---

## Next Steps

${verdict.pass
  ? `### Passed Threshold
- Review \`comparison.png\` for qualitative assessment
- Check \`diff_heatmap.png\` for any remaining issues
- Consider if further polish iterations are needed`
  : `### Below Threshold
1. Open \`diff_heatmap.png\` to identify problem areas
2. Red regions indicate significant differences
3. Focus code changes on the highlighted areas
4. Re-run capture and analysis after changes`}
`;
}

// Utility functions
function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
