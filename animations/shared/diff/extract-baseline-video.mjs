#!/usr/bin/env node

/**
 * extract-baseline-video.mjs
 *
 * Extract baseline metrics from animated reference (APNG).
 * Run ONCE per effect before starting iteration loop.
 *
 * Usage:
 *   node animations/shared/diff/extract-baseline-video.mjs \
 *     --animation reference_animation.apng \
 *     --output animations/electricity-portal/references/
 *
 * Outputs:
 *   - baseline_animation_metrics.json — Temporal and per-frame metrics
 *   - baseline_animation_report.md — Human-readable summary
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';
import os from 'os';

/**
 * Extract baseline metrics from animated reference
 */
export async function extractAnimationBaseline(options) {
  const {
    animationPath,
    outputDir,
    effectName = 'effect'
  } = options;

  fs.mkdirSync(outputDir, { recursive: true });

  const results = {
    timestamp: new Date().toISOString(),
    effectName,
    source: animationPath,
    metrics: {},
    artifacts: {}
  };

  // === EXTRACT FRAMES ===
  console.log('Extracting frames from APNG...');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apng-frames-'));

  try {
    // Use ffmpeg to extract frames
    execSync(
      `ffmpeg -i "${animationPath}" -vsync 0 "${path.join(tempDir, 'frame_%04d.png')}" 2>/dev/null`,
      { stdio: 'pipe' }
    );
  } catch (error) {
    // Try alternative approach for APNG
    try {
      execSync(
        `ffmpeg -f apng -i "${animationPath}" -vsync 0 "${path.join(tempDir, 'frame_%04d.png')}" 2>/dev/null`,
        { stdio: 'pipe' }
      );
    } catch (e) {
      console.error('Failed to extract frames with ffmpeg');
      throw e;
    }
  }

  // Get frame files
  const frameFiles = fs.readdirSync(tempDir)
    .filter(f => f.startsWith('frame_') && f.endsWith('.png'))
    .sort();

  console.log(`Extracted ${frameFiles.length} frames`);

  if (frameFiles.length === 0) {
    throw new Error('No frames extracted from animation');
  }

  // === GET ANIMATION METADATA ===
  console.log('Analyzing animation metadata...');
  let animationInfo = {};
  try {
    const probeOutput = execSync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${animationPath}"`,
      { encoding: 'utf8' }
    );
    animationInfo = JSON.parse(probeOutput);
  } catch (e) {
    console.log('Could not probe animation metadata, using defaults');
  }

  const stream = animationInfo.streams?.[0] || {};
  const format = animationInfo.format || {};

  results.metrics.animation = {
    frameCount: frameFiles.length,
    width: stream.width || null,
    height: stream.height || null,
    duration: parseFloat(format.duration) || null,
    fps: stream.r_frame_rate ? eval(stream.r_frame_rate) : null,
    codec: stream.codec_name || 'apng'
  };

  // Calculate effective FPS if we have duration
  if (results.metrics.animation.duration && frameFiles.length > 1) {
    results.metrics.animation.effectiveFps =
      frameFiles.length / results.metrics.animation.duration;
  }

  // === ANALYZE EACH FRAME ===
  console.log('Analyzing frames...');
  const frameMetrics = [];
  const frameBrightness = [];
  const frameColors = [];

  for (let i = 0; i < frameFiles.length; i++) {
    const framePath = path.join(tempDir, frameFiles[i]);
    const frame = await loadImage(framePath);

    const brightness = calculateAverageBrightness(frame);
    const dominantColor = calculateDominantColor(frame);
    const intensity = calculateIntensity(frame);

    frameMetrics.push({
      frame: i,
      brightness,
      intensity,
      dominantColor
    });

    frameBrightness.push(brightness);
    frameColors.push(dominantColor);

    if ((i + 1) % 10 === 0 || i === frameFiles.length - 1) {
      process.stdout.write(`\r  Analyzed ${i + 1}/${frameFiles.length} frames`);
    }
  }
  console.log('');

  results.metrics.frames = frameMetrics;

  // === TEMPORAL ANALYSIS ===
  console.log('Analyzing temporal patterns...');

  // Brightness statistics
  const brightnessStats = calculateStats(frameBrightness);
  results.metrics.brightness = {
    min: brightnessStats.min,
    max: brightnessStats.max,
    mean: brightnessStats.mean,
    stdDev: brightnessStats.stdDev,
    range: brightnessStats.max - brightnessStats.min,
    peakFrame: frameBrightness.indexOf(brightnessStats.max),
    troughFrame: frameBrightness.indexOf(brightnessStats.min)
  };

  // Frame-to-frame changes (motion energy)
  const frameChanges = [];
  for (let i = 1; i < frameFiles.length; i++) {
    const prevFrame = await loadImage(path.join(tempDir, frameFiles[i - 1]));
    const currFrame = await loadImage(path.join(tempDir, frameFiles[i]));
    const change = calculateFrameDifference(prevFrame, currFrame);
    frameChanges.push(change);
  }

  const changeStats = calculateStats(frameChanges);
  results.metrics.motion = {
    averageChange: changeStats.mean,
    maxChange: changeStats.max,
    minChange: changeStats.min,
    stdDev: changeStats.stdDev,
    totalMotion: frameChanges.reduce((a, b) => a + b, 0),
    highMotionFrames: frameChanges.filter(c => c > changeStats.mean * 1.5).length,
    lowMotionFrames: frameChanges.filter(c => c < changeStats.mean * 0.5).length
  };

  // Flicker analysis (brightness oscillation)
  const brightnessChanges = [];
  for (let i = 1; i < frameBrightness.length; i++) {
    brightnessChanges.push(Math.abs(frameBrightness[i] - frameBrightness[i - 1]));
  }

  const flickerStats = calculateStats(brightnessChanges);
  results.metrics.flicker = {
    averageFlicker: flickerStats.mean,
    maxFlicker: flickerStats.max,
    flickerIntensity: flickerStats.stdDev,
    oscillationCount: countOscillations(frameBrightness)
  };

  // Color stability
  const colorShifts = [];
  for (let i = 1; i < frameColors.length; i++) {
    colorShifts.push(colorDistance(frameColors[i - 1], frameColors[i]));
  }

  const colorStats = calculateStats(colorShifts);
  results.metrics.colorStability = {
    averageShift: colorStats.mean,
    maxShift: colorStats.max,
    colorConsistency: 1 - (colorStats.stdDev / 255) // Normalized 0-1
  };

  // === IDENTIFY KEY FRAMES ===
  console.log('Identifying key frames...');

  // Peak intensity frame
  const peakFrame = frameBrightness.indexOf(Math.max(...frameBrightness));

  // Most representative frame (closest to mean brightness)
  const meanBrightness = brightnessStats.mean;
  let representativeFrame = 0;
  let minDiff = Infinity;
  for (let i = 0; i < frameBrightness.length; i++) {
    const diff = Math.abs(frameBrightness[i] - meanBrightness);
    if (diff < minDiff) {
      minDiff = diff;
      representativeFrame = i;
    }
  }

  // High motion frame
  const highMotionFrame = frameChanges.indexOf(Math.max(...frameChanges)) + 1;

  results.metrics.keyFrames = {
    peak: peakFrame,
    representative: representativeFrame,
    highMotion: highMotionFrame,
    first: 0,
    last: frameFiles.length - 1
  };

  // === SAVE ARTIFACTS ===
  console.log('Saving artifacts...');

  // Save metrics JSON
  const metricsPath = path.join(outputDir, 'baseline_animation_metrics.json');
  fs.writeFileSync(metricsPath, JSON.stringify(results, null, 2));
  results.artifacts.metrics = metricsPath;

  // Generate and save report
  const report = generateAnimationReport(results);
  const reportPath = path.join(outputDir, 'baseline_animation_report.md');
  fs.writeFileSync(reportPath, report);
  results.artifacts.report = reportPath;

  // Save brightness curve as CSV for visualization
  const csvPath = path.join(outputDir, 'brightness_curve.csv');
  const csvContent = 'frame,brightness,motion\n' +
    frameBrightness.map((b, i) =>
      `${i},${b.toFixed(2)},${i > 0 ? frameChanges[i-1].toFixed(2) : 0}`
    ).join('\n');
  fs.writeFileSync(csvPath, csvContent);
  results.artifacts.brightnessCurve = csvPath;

  // Cleanup temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log('\n✅ Animation baseline extraction complete!');
  console.log(`   Metrics: ${metricsPath}`);
  console.log(`   Report:  ${reportPath}`);
  console.log(`   Curve:   ${csvPath}`);

  return results;
}

/**
 * Load image and return raw pixel data
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
    channels: 4
  };
}

/**
 * Calculate average brightness of an image
 */
function calculateAverageBrightness(image) {
  const { data } = image;
  let total = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // Skip transparent
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    total += brightness;
    count++;
  }

  return count > 0 ? total / count : 0;
}

/**
 * Calculate intensity (weighted toward bright pixels)
 */
function calculateIntensity(image) {
  const { data } = image;
  let weightedTotal = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    // Weight brighter pixels more heavily
    weightedTotal += brightness * brightness / 255;
    count++;
  }

  return count > 0 ? Math.sqrt(weightedTotal / count) : 0;
}

/**
 * Calculate dominant color (simple average)
 */
function calculateDominantColor(image) {
  const { data } = image;
  let totalR = 0, totalG = 0, totalB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
    count++;
  }

  if (count === 0) return { r: 0, g: 0, b: 0 };

  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count)
  };
}

/**
 * Calculate difference between two frames (motion energy)
 */
function calculateFrameDifference(frame1, frame2) {
  const { data: data1 } = frame1;
  const { data: data2 } = frame2;

  let totalDiff = 0;
  let count = 0;

  const length = Math.min(data1.length, data2.length);

  for (let i = 0; i < length; i += 4) {
    const dr = Math.abs(data1[i] - data2[i]);
    const dg = Math.abs(data1[i + 1] - data2[i + 1]);
    const db = Math.abs(data1[i + 2] - data2[i + 2]);
    totalDiff += (dr + dg + db) / 3;
    count++;
  }

  return count > 0 ? totalDiff / count : 0;
}

/**
 * Calculate color distance between two colors
 */
function colorDistance(c1, c2) {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Calculate basic statistics for an array
 */
function calculateStats(arr) {
  if (arr.length === 0) return { min: 0, max: 0, mean: 0, stdDev: 0 };

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
  const stdDev = Math.sqrt(variance);

  return { min, max, mean, stdDev };
}

/**
 * Count oscillations in brightness (peaks and troughs)
 */
function countOscillations(values) {
  if (values.length < 3) return 0;

  let oscillations = 0;
  let direction = 0; // 0 = unknown, 1 = rising, -1 = falling

  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const newDirection = diff > 0 ? 1 : diff < 0 ? -1 : 0;

    if (newDirection !== 0 && direction !== 0 && newDirection !== direction) {
      oscillations++;
    }

    if (newDirection !== 0) {
      direction = newDirection;
    }
  }

  return oscillations;
}

/**
 * Generate markdown report
 */
function generateAnimationReport(results) {
  const { metrics, effectName } = results;
  const anim = metrics.animation;
  const bright = metrics.brightness;
  const motion = metrics.motion;
  const flicker = metrics.flicker;
  const color = metrics.colorStability;
  const keyFrames = metrics.keyFrames;

  return `# Animation Baseline Report: ${effectName}

**Generated:** ${results.timestamp}
**Source:** ${results.source}

---

## Animation Properties

| Property | Value |
|----------|-------|
| Frame Count | ${anim.frameCount} |
| Dimensions | ${anim.width || 'N/A'} × ${anim.height || 'N/A'} |
| Duration | ${anim.duration ? anim.duration.toFixed(2) + 's' : 'N/A'} |
| Effective FPS | ${anim.effectiveFps ? anim.effectiveFps.toFixed(1) : 'N/A'} |
| Codec | ${anim.codec} |

---

## Brightness Analysis

| Metric | Value |
|--------|-------|
| Mean Brightness | ${bright.mean.toFixed(1)} |
| Min Brightness | ${bright.min.toFixed(1)} (frame ${bright.troughFrame}) |
| Max Brightness | ${bright.max.toFixed(1)} (frame ${bright.peakFrame}) |
| Brightness Range | ${bright.range.toFixed(1)} |
| Std Deviation | ${bright.stdDev.toFixed(2)} |

**Interpretation:** ${interpretBrightness(bright)}

---

## Motion Analysis

| Metric | Value |
|--------|-------|
| Average Frame Change | ${motion.averageChange.toFixed(2)} |
| Max Frame Change | ${motion.maxChange.toFixed(2)} |
| Min Frame Change | ${motion.minChange.toFixed(2)} |
| High Motion Frames | ${motion.highMotionFrames} |
| Low Motion Frames | ${motion.lowMotionFrames} |
| Total Motion Energy | ${motion.totalMotion.toFixed(1)} |

**Interpretation:** ${interpretMotion(motion, anim.frameCount)}

---

## Flicker Analysis

| Metric | Value |
|--------|-------|
| Average Flicker | ${flicker.averageFlicker.toFixed(2)} |
| Max Flicker | ${flicker.maxFlicker.toFixed(2)} |
| Flicker Intensity | ${flicker.flickerIntensity.toFixed(2)} |
| Oscillation Count | ${flicker.oscillationCount} |

**Interpretation:** ${interpretFlicker(flicker, anim.frameCount)}

---

## Color Stability

| Metric | Value |
|--------|-------|
| Average Color Shift | ${color.averageShift.toFixed(2)} |
| Max Color Shift | ${color.maxShift.toFixed(2)} |
| Color Consistency | ${(color.colorConsistency * 100).toFixed(1)}% |

**Interpretation:** ${interpretColor(color)}

---

## Key Frames

| Frame Type | Frame # | Description |
|------------|---------|-------------|
| Peak | ${keyFrames.peak} | Brightest frame |
| Representative | ${keyFrames.representative} | Closest to mean brightness |
| High Motion | ${keyFrames.highMotion} | Most change from previous |
| First | ${keyFrames.first} | Animation start |
| Last | ${keyFrames.last} | Animation end |

---

## Usage in Iteration

### Target Animation Characteristics

\`\`\`
Brightness range: ${bright.min.toFixed(0)}-${bright.max.toFixed(0)} (mean: ${bright.mean.toFixed(0)})
Motion energy: ${motion.averageChange.toFixed(1)} avg per frame
Flicker rate: ${flicker.oscillationCount} oscillations over ${anim.frameCount} frames
Color consistency: ${(color.colorConsistency * 100).toFixed(0)}%
\`\`\`

### Video SSIM Comparison Notes

When comparing captured animation to this reference:
- **High Video SSIM + Low Frame SSIM**: Animation timing matches but spatial details differ
- **Low Video SSIM + High Frame SSIM**: Static frames match but animation differs
- **Both High**: Animation matches well overall
- **Both Low**: Major differences in both spatial and temporal domains

### Flicker Matching

${flicker.oscillationCount > 10
  ? 'Reference has significant flickering. Captured animation should show similar oscillation patterns.'
  : flicker.oscillationCount > 5
    ? 'Reference has moderate flickering. Some brightness variation expected.'
    : 'Reference has minimal flickering. Animation should be relatively smooth.'}
`;
}

function interpretBrightness(bright) {
  if (bright.range > 50) {
    return 'High dynamic range — effect varies significantly in intensity over time.';
  } else if (bright.range > 20) {
    return 'Moderate dynamic range — some brightness variation expected.';
  } else {
    return 'Low dynamic range — effect maintains consistent brightness.';
  }
}

function interpretMotion(motion, frameCount) {
  const motionRatio = motion.highMotionFrames / frameCount;
  if (motionRatio > 0.3) {
    return 'High motion animation — significant frame-to-frame changes throughout.';
  } else if (motionRatio > 0.1) {
    return 'Moderate motion — periodic bursts of activity.';
  } else {
    return 'Low motion — relatively static with subtle changes.';
  }
}

function interpretFlicker(flicker, frameCount) {
  const flickerRate = flicker.oscillationCount / frameCount;
  if (flickerRate > 0.5) {
    return 'Rapid flickering — high-frequency brightness oscillation (characteristic of electricity).';
  } else if (flickerRate > 0.2) {
    return 'Moderate flickering — periodic brightness pulses.';
  } else {
    return 'Minimal flickering — smooth brightness transitions.';
  }
}

function interpretColor(color) {
  if (color.colorConsistency > 0.95) {
    return 'Highly consistent color palette — hue remains stable.';
  } else if (color.colorConsistency > 0.85) {
    return 'Mostly consistent — minor color variations.';
  } else {
    return 'Variable color palette — noticeable hue shifts during animation.';
  }
}

// === CLI ===
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
extract-baseline-video.mjs - Extract baseline metrics from animated reference (APNG)

Usage:
  node animations/shared/diff/extract-baseline-video.mjs \\
    --animation <apng-file> \\
    --output <dir>

Options:
  --animation <path>   Animated reference file (APNG) (required)
  --output <dir>       Output directory for baseline artifacts (required)
  --name <string>      Effect name (default: "effect")
  --help, -h           Show this help

Examples:
  node animations/shared/diff/extract-baseline-video.mjs \\
    --animation animations/electricity-portal/references/465x465/electricity_animation_effect_diff_analysis.apng \\
    --output animations/electricity-portal/references/465x465/ \\
    --name electricity
`);
    process.exit(0);
  }

  const options = {
    animationPath: null,
    outputDir: null,
    effectName: 'effect'
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--animation':
        options.animationPath = path.resolve(args[++i]);
        break;
      case '--output':
        options.outputDir = path.resolve(args[++i]);
        break;
      case '--name':
        options.effectName = args[++i];
        break;
    }
  }

  if (!options.animationPath) {
    console.error('Error: --animation <apng-file> is required');
    process.exit(1);
  }

  if (!options.outputDir) {
    console.error('Error: --output <dir> is required');
    process.exit(1);
  }

  if (!fs.existsSync(options.animationPath)) {
    console.error(`Error: File not found: ${options.animationPath}`);
    process.exit(1);
  }

  try {
    await extractAnimationBaseline(options);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
