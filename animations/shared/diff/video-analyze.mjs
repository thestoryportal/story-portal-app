/**
 * video-analyze.mjs
 *
 * Video/APNG diff analysis using FFmpeg SSIM and VMAF.
 * Compares captured animation against reference animation for temporal quality metrics.
 *
 * Features:
 *   - Automatic dimension normalization (resize to match)
 *   - Frame rate normalization
 *   - Optional circular mask application
 *   - Per-frame and aggregate SSIM scoring
 *
 * Usage:
 *   node video-analyze.mjs --captured path/to/captured.apng --reference path/to/reference.apng --output path/to/output
 *
 * Outputs:
 *   - video_scores.json: Per-frame SSIM/VMAF scores
 *   - video_report.md: Human-readable summary
 *   - ssim_log.txt: Raw FFmpeg SSIM output
 */

import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import { fileURLToPath } from 'url';

// Only parse CLI args if run directly (not imported as module)
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     process.argv[1]?.endsWith('video-analyze.mjs');

let args = {};
if (isMainModule) {
  const { values } = parseArgs({
    options: {
      captured: { type: 'string', short: 'c' },
      reference: { type: 'string', short: 'r' },
      output: { type: 'string', short: 'o' },
      vmaf: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h' }
    }
  });
  args = values;
}

if (isMainModule && (args.help || (!args.captured && !args.reference))) {
  console.log(`
Video Diff Analyzer - FFmpeg SSIM/VMAF Analysis

Usage:
  node video-analyze.mjs --captured <path> --reference <path> --output <dir>

Options:
  -c, --captured   Path to captured video/APNG
  -r, --reference  Path to reference video/APNG
  -o, --output     Output directory for results
  --vmaf           Also run VMAF analysis (slower but more accurate)
  -h, --help       Show this help

Example:
  node video-analyze.mjs \\
    --captured animations/output/iter_001/animation.apng \\
    --reference animations/electricity-portal/references/465x465/reference_animation.apng \\
    --output animations/output/iter_001/video_analysis
`);
  process.exit(0);
}

/**
 * Run FFmpeg command and capture output
 */
async function runFFmpeg(args, captureStderr = false) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0 && !captureStderr) {
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
      } else {
        resolve(captureStderr ? stderr : stdout);
      }
    });

    proc.on('error', reject);
  });
}

/**
 * Get video info (duration, frame count, fps, dimensions)
 */
async function getVideoInfo(filepath) {
  const args = [
    '-i', filepath,
    '-f', 'null',
    '-'
  ];

  try {
    const stderr = await runFFmpeg(args, true);

    // Parse frame count from "frame= N"
    const frameMatch = stderr.match(/frame=\s*(\d+)/);
    const frames = frameMatch ? parseInt(frameMatch[1], 10) : 0;

    // Parse duration
    const durationMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    let duration = 0;
    if (durationMatch) {
      duration = parseInt(durationMatch[1]) * 3600 +
                 parseInt(durationMatch[2]) * 60 +
                 parseFloat(durationMatch[3]);
    }

    // Parse fps
    const fpsMatch = stderr.match(/(\d+(?:\.\d+)?)\s*fps/);
    const fps = fpsMatch ? parseFloat(fpsMatch[1]) : 30;

    // Parse dimensions (e.g., "465x465" or "452x463")
    const dimMatch = stderr.match(/(\d+)x(\d+)/);
    const width = dimMatch ? parseInt(dimMatch[1], 10) : 0;
    const height = dimMatch ? parseInt(dimMatch[2], 10) : 0;

    return { frames, duration, fps, width, height };
  } catch (e) {
    console.warn('Could not get video info:', e.message);
    return { frames: 0, duration: 0, fps: 30, width: 0, height: 0 };
  }
}


/**
 * Apply circular mask to video using FFmpeg
 * Creates a masked version where pixels outside the circle are black
 */
async function applyCircularMask(inputPath, outputDir, maskConfig = {}) {
  const ext = path.extname(inputPath);
  const maskedPath = path.join(outputDir, `masked_${path.basename(inputPath)}`);

  // Default mask config for 465x465 portal
  const {
    centerX = 232.5,
    centerY = 232.5,
    radiusX = 159.5,
    radiusY = 158.5
  } = maskConfig;

  console.log(`  Applying circular mask (center: ${centerX},${centerY}, radius: ${radiusX}x${radiusY})...`);

  // Use FFmpeg geq filter to create circular mask
  // Formula: if pixel is inside ellipse, keep it; otherwise black
  const args = [
    '-y',
    '-i', inputPath,
    '-vf', `geq=r='if(lt(pow((X-${centerX})/${radiusX},2)+pow((Y-${centerY})/${radiusY},2),1),r(X,Y),0)':g='if(lt(pow((X-${centerX})/${radiusX},2)+pow((Y-${centerY})/${radiusY},2),1),g(X,Y),0)':b='if(lt(pow((X-${centerX})/${radiusX},2)+pow((Y-${centerY})/${radiusY},2),1),b(X,Y),0)':a='if(lt(pow((X-${centerX})/${radiusX},2)+pow((Y-${centerY})/${radiusY},2),1),255,0)'`,
    '-f', ext === '.apng' ? 'apng' : 'mp4',
    maskedPath
  ];

  await runFFmpeg(args, true);

  return maskedPath;
}

/**
 * Preprocess videos for SSIM comparison
 * - Optionally applies circular mask
 * - Assumes inputs are already correctly sized (user handles sizing)
 * - Returns paths to preprocessed files
 */
async function preprocessForSSIM(capturedPath, referencePath, outputDir, options = {}) {
  const {
    applyMask = true,
    maskConfig = {
      centerX: 232.5,
      centerY: 232.5,
      radiusX: 159.5,
      radiusY: 158.5
    }
  } = options;

  // Get info for both videos
  const [capturedInfo, referenceInfo] = await Promise.all([
    getVideoInfo(capturedPath),
    getVideoInfo(referencePath)
  ]);

  console.log(`  Reference: ${referenceInfo.width}x${referenceInfo.height}, ${referenceInfo.frames} frames`);
  console.log(`  Captured:  ${capturedInfo.width}x${capturedInfo.height}, ${capturedInfo.frames} frames`);

  let processedCaptured = capturedPath;
  let processedReference = referencePath;

  // Check for dimension mismatch (warn but don't fix - user handles sizing)
  const dimMismatch = capturedInfo.width !== referenceInfo.width ||
                      capturedInfo.height !== referenceInfo.height;

  if (dimMismatch) {
    console.warn(`  ⚠️  Dimension mismatch: reference ${referenceInfo.width}x${referenceInfo.height} vs captured ${capturedInfo.width}x${capturedInfo.height}`);
    console.warn(`      Ensure reference files are correctly sized before running pipeline.`);
  }

  // Apply circular mask if requested
  if (applyMask) {
    console.log(`  Applying mask (center: ${maskConfig.centerX},${maskConfig.centerY}, radius: ${maskConfig.radiusX}x${maskConfig.radiusY})`);
    processedCaptured = await applyCircularMask(processedCaptured, outputDir, maskConfig);
    processedReference = await applyCircularMask(processedReference, outputDir, maskConfig);
  }

  return {
    captured: processedCaptured,
    reference: processedReference,
    width: capturedInfo.width,
    height: capturedInfo.height,
    dimMismatch,
    maskApplied: applyMask
  };
}

/**
 * Normalize video to target fps using FFmpeg
 * Returns path to normalized temp file
 */
async function normalizeToFps(inputPath, targetFps, outputDir) {
  const ext = path.extname(inputPath);
  const normalizedPath = path.join(outputDir, `normalized_captured${ext}`);

  console.log(`  Normalizing to ${targetFps.toFixed(2)} fps...`);

  const args = [
    '-y',
    '-i', inputPath,
    '-filter:v', `fps=${targetFps}`,
    '-f', ext === '.apng' ? 'apng' : 'mp4',
    normalizedPath
  ];

  await runFFmpeg(args, true);

  return normalizedPath;
}

/**
 * Run SSIM analysis between two videos
 * Now includes automatic preprocessing (dimension normalization + mask)
 */
async function analyzeSSIM(capturedPath, referencePath, outputDir, options = {}) {
  const {
    preprocess = true,
    applyMask = true,
    maskConfig = {
      centerX: 232.5,
      centerY: 232.5,
      radiusX: 159.5,
      radiusY: 158.5
    }
  } = options;

  console.log('Running SSIM analysis...');

  let analyzeCaptured = capturedPath;
  let analyzeReference = referencePath;
  let preprocessInfo = null;

  // Preprocess videos if needed (dimension normalization + mask)
  if (preprocess) {
    console.log('  Preprocessing videos...');
    preprocessInfo = await preprocessForSSIM(capturedPath, referencePath, outputDir, {
      applyMask,
      maskConfig
    });
    analyzeCaptured = preprocessInfo.captured;
    analyzeReference = preprocessInfo.reference;
    console.log(`  Preprocessing complete. Dim normalized: ${preprocessInfo.dimNormalized}, Mask applied: ${preprocessInfo.maskApplied}`);
  }

  const ssimLogPath = path.join(outputDir, 'ssim_log.txt');

  // FFmpeg SSIM filter outputs per-frame scores to a log file
  const args = [
    '-i', analyzeReference,
    '-i', analyzeCaptured,
    '-lavfi', `ssim=stats_file=${ssimLogPath}`,
    '-f', 'null',
    '-'
  ];

  let stderr;
  try {
    stderr = await runFFmpeg(args, true);
  } catch (e) {
    console.error('  SSIM analysis failed:', e.message);
    return {
      aggregate: 0,
      perFrame: [],
      min: 0,
      max: 0,
      mean: 0,
      error: e.message,
      preprocessInfo
    };
  }

  // Parse aggregate SSIM from stderr
  // Format: "SSIM Y:0.970234 U:0.982341 V:0.976234 All:0.976123 (16.203)"
  const ssimMatch = stderr.match(/SSIM.*All:(\d+\.\d+)/);
  const aggregateSSIM = ssimMatch ? parseFloat(ssimMatch[1]) : 0;

  // Parse per-frame scores from log file
  const perFrameScores = [];
  if (fs.existsSync(ssimLogPath)) {
    const logContent = fs.readFileSync(ssimLogPath, 'utf-8');
    const lines = logContent.trim().split('\n');

    for (const line of lines) {
      // Format: n:1 Y:0.970234 U:0.982341 V:0.976234 All:0.976123
      const match = line.match(/n:(\d+).*All:(\d+\.\d+)/);
      if (match) {
        perFrameScores.push({
          frame: parseInt(match[1], 10),
          ssim: parseFloat(match[2])
        });
      }
    }
  }

  return {
    aggregate: aggregateSSIM,
    perFrame: perFrameScores,
    min: perFrameScores.length > 0 ? Math.min(...perFrameScores.map(f => f.ssim)) : 0,
    max: perFrameScores.length > 0 ? Math.max(...perFrameScores.map(f => f.ssim)) : 0,
    mean: perFrameScores.length > 0
      ? perFrameScores.reduce((sum, f) => sum + f.ssim, 0) / perFrameScores.length
      : 0,
    preprocessInfo
  };
}

/**
 * Run VMAF analysis (optional, slower but more perceptually accurate)
 */
async function analyzeVMAF(capturedPath, referencePath, outputDir) {
  console.log('Running VMAF analysis...');

  const vmafLogPath = path.join(outputDir, 'vmaf_log.json');

  const args = [
    '-i', referencePath,
    '-i', capturedPath,
    '-lavfi', `libvmaf=log_path=${vmafLogPath}:log_fmt=json`,
    '-f', 'null',
    '-'
  ];

  try {
    await runFFmpeg(args, true);

    if (fs.existsSync(vmafLogPath)) {
      const vmafData = JSON.parse(fs.readFileSync(vmafLogPath, 'utf-8'));

      const perFrameScores = vmafData.frames?.map((f, i) => ({
        frame: i,
        vmaf: f.metrics?.vmaf || 0
      })) || [];

      return {
        aggregate: vmafData.pooled_metrics?.vmaf?.mean || 0,
        perFrame: perFrameScores,
        min: vmafData.pooled_metrics?.vmaf?.min || 0,
        max: vmafData.pooled_metrics?.vmaf?.max || 0,
        mean: vmafData.pooled_metrics?.vmaf?.mean || 0
      };
    }
  } catch (e) {
    console.warn('VMAF analysis failed:', e.message);
  }

  return null;
}

/**
 * Analyze temporal consistency (frame-to-frame variation)
 */
function analyzeTemporalConsistency(ssimScores) {
  if (ssimScores.length < 2) return null;

  const deltas = [];
  for (let i = 1; i < ssimScores.length; i++) {
    deltas.push(Math.abs(ssimScores[i].ssim - ssimScores[i - 1].ssim));
  }

  const meanDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const maxDelta = Math.max(...deltas);

  // Find frames with largest quality drops
  const qualityDrops = [];
  for (let i = 1; i < ssimScores.length; i++) {
    const drop = ssimScores[i - 1].ssim - ssimScores[i].ssim;
    if (drop > 0.02) { // 2% drop threshold
      qualityDrops.push({
        frame: ssimScores[i].frame,
        drop: drop
      });
    }
  }

  return {
    meanFrameDelta: meanDelta,
    maxFrameDelta: maxDelta,
    consistency: 1 - (meanDelta * 10), // Higher = more consistent
    qualityDrops: qualityDrops.slice(0, 5) // Top 5 drops
  };
}

/**
 * Generate verdict based on scores
 */
function generateVerdict(ssim, vmaf = null) {
  const thresholds = {
    excellent: 0.95,
    good: 0.90,
    pass: 0.85,
    fail: 0.70
  };

  let quality, message, pass;

  if (ssim.aggregate >= thresholds.excellent) {
    quality = 'excellent';
    message = `Excellent temporal match (SSIM ${(ssim.aggregate * 100).toFixed(1)}%). Animation closely matches reference.`;
    pass = true;
  } else if (ssim.aggregate >= thresholds.good) {
    quality = 'good';
    message = `Good temporal match (SSIM ${(ssim.aggregate * 100).toFixed(1)}%). Minor animation timing differences.`;
    pass = true;
  } else if (ssim.aggregate >= thresholds.pass) {
    quality = 'acceptable';
    message = `Acceptable match (SSIM ${(ssim.aggregate * 100).toFixed(1)}%). Review frame-by-frame for improvement areas.`;
    pass = true;
  } else if (ssim.aggregate >= thresholds.fail) {
    quality = 'below_threshold';
    message = `Below threshold (SSIM ${(ssim.aggregate * 100).toFixed(1)}%). Significant animation differences remain.`;
    pass = false;
  } else {
    quality = 'fail';
    message = `Poor match (SSIM ${(ssim.aggregate * 100).toFixed(1)}%). Major animation revision needed.`;
    pass = false;
  }

  return { quality, message, pass, ssimScore: ssim.aggregate, vmafScore: vmaf?.aggregate };
}

/**
 * Generate markdown report
 */
function generateReport(results) {
  const { ssim, vmaf, temporal, verdict, captured, reference, videoInfo } = results;

  let report = `# Video Diff Analysis Report

**Generated:** ${new Date().toISOString()}
**Reference:** \`${path.basename(reference)}\`
**Captured:** \`${path.basename(captured)}\`
${videoInfo?.normalized ? `**Frame Rate Normalized:** ${videoInfo.captured?.fps?.toFixed(2)} fps → ${videoInfo.normalizedTo?.toFixed(2)} fps` : ''}

---

## Verdict: ${verdict.quality.toUpperCase()}

${verdict.pass ? '✅' : '❌'} ${verdict.message}

---

## SSIM Scores (Structural Similarity)

| Metric | Value |
|--------|-------|
| **Aggregate** | ${(ssim.aggregate * 100).toFixed(2)}% |
| Mean | ${(ssim.mean * 100).toFixed(2)}% |
| Min | ${(ssim.min * 100).toFixed(2)}% |
| Max | ${(ssim.max * 100).toFixed(2)}% |
| Frames Analyzed | ${ssim.perFrame.length} |

`;

  if (vmaf) {
    report += `
## VMAF Scores (Perceptual Quality)

| Metric | Value |
|--------|-------|
| **Aggregate** | ${vmaf.aggregate.toFixed(2)} |
| Mean | ${vmaf.mean.toFixed(2)} |
| Min | ${vmaf.min.toFixed(2)} |
| Max | ${vmaf.max.toFixed(2)} |

`;
  }

  if (temporal) {
    report += `
## Temporal Consistency

| Metric | Value |
|--------|-------|
| Consistency Score | ${(temporal.consistency * 100).toFixed(1)}% |
| Mean Frame Delta | ${(temporal.meanFrameDelta * 100).toFixed(3)}% |
| Max Frame Delta | ${(temporal.maxFrameDelta * 100).toFixed(3)}% |

`;

    if (temporal.qualityDrops.length > 0) {
      report += `
### Quality Drops (>2%)

| Frame | Drop |
|-------|------|
${temporal.qualityDrops.map(d => `| ${d.frame} | ${(d.drop * 100).toFixed(2)}% |`).join('\n')}

`;
    }
  }

  // Find worst frames
  const worstFrames = [...ssim.perFrame].sort((a, b) => a.ssim - b.ssim).slice(0, 5);

  report += `
## Worst Frames (for debugging)

| Frame | SSIM |
|-------|------|
${worstFrames.map(f => `| ${f.frame} | ${(f.ssim * 100).toFixed(2)}% |`).join('\n')}

---

## Interpretation

### SSIM Thresholds
- **≥95%**: Excellent - Animation closely matches reference
- **≥90%**: Good - Minor timing/intensity differences
- **≥85%**: Acceptable - Noticeable but acceptable differences
- **<85%**: Below threshold - Significant revision needed

### For Claude

${verdict.pass ? `
Animation quality is ${verdict.quality}. Focus on:
1. Review worst frames listed above
2. Check temporal consistency for animation smoothness
3. Fine-tune timing if frame deltas are high
` : `
Animation needs improvement. Focus on:
1. Worst frames indicate problem areas
2. High frame deltas suggest animation timing issues
3. Low min SSIM indicates frames that need attention
4. Compare per-frame scores to identify patterns
`}

---

## Artifacts

| File | Description |
|------|-------------|
| \`video_scores.json\` | Full per-frame metrics (machine-readable) |
| \`ssim_log.txt\` | Raw FFmpeg SSIM output |
${vmaf ? '| `vmaf_log.json` | Raw FFmpeg VMAF output |' : ''}
`;

  return report;
}

/**
 * Main analysis function
 */
async function main() {
  const capturedPath = args.captured;
  const referencePath = args.reference;
  const outputDir = args.output || path.dirname(capturedPath);

  console.log('Video Diff Analyzer');
  console.log('==================');
  console.log(`Reference: ${referencePath}`);
  console.log(`Captured:  ${capturedPath}`);
  console.log(`Output:    ${outputDir}`);
  console.log('');

  // Validate inputs
  if (!fs.existsSync(capturedPath)) {
    console.error(`Captured file not found: ${capturedPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(referencePath)) {
    console.error(`Reference file not found: ${referencePath}`);
    process.exit(1);
  }

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Get video info
  console.log('Analyzing video properties...');
  const [capturedInfo, referenceInfo] = await Promise.all([
    getVideoInfo(capturedPath),
    getVideoInfo(referencePath)
  ]);

  console.log(`  Reference: ${referenceInfo.frames} frames, ${referenceInfo.fps.toFixed(2)} fps, ${referenceInfo.duration.toFixed(2)}s`);
  console.log(`  Captured:  ${capturedInfo.frames} frames, ${capturedInfo.fps.toFixed(2)} fps, ${capturedInfo.duration.toFixed(2)}s`);

  // Normalize frame rates if they differ significantly (>10% difference)
  let analyzePath = capturedPath;
  const fpsDiff = Math.abs(capturedInfo.fps - referenceInfo.fps) / referenceInfo.fps;
  if (fpsDiff > 0.1) {
    console.log(`  Frame rate mismatch: ${(fpsDiff * 100).toFixed(1)}% difference`);
    analyzePath = await normalizeToFps(capturedPath, referenceInfo.fps, outputDir);

    // Get updated info for normalized video
    const normalizedInfo = await getVideoInfo(analyzePath);
    console.log(`  Normalized: ${normalizedInfo.frames} frames, ${normalizedInfo.fps.toFixed(2)} fps`);
  }
  console.log('');

  // Run SSIM analysis (using normalized video if applicable)
  const ssim = await analyzeSSIM(analyzePath, referencePath, outputDir);
  console.log(`  SSIM aggregate: ${(ssim.aggregate * 100).toFixed(2)}%`);
  console.log(`  SSIM range: ${(ssim.min * 100).toFixed(2)}% - ${(ssim.max * 100).toFixed(2)}%`);
  console.log('');

  // Run VMAF analysis (optional)
  let vmaf = null;
  if (args.vmaf) {
    vmaf = await analyzeVMAF(capturedPath, referencePath, outputDir);
    if (vmaf) {
      console.log(`  VMAF aggregate: ${vmaf.aggregate.toFixed(2)}`);
      console.log('');
    }
  }

  // Analyze temporal consistency
  const temporal = analyzeTemporalConsistency(ssim.perFrame);
  if (temporal) {
    console.log(`  Temporal consistency: ${(temporal.consistency * 100).toFixed(1)}%`);
    console.log('');
  }

  // Generate verdict
  const verdict = generateVerdict(ssim, vmaf);

  // Build results object
  const results = {
    timestamp: new Date().toISOString(),
    captured: capturedPath,
    reference: referencePath,
    videoInfo: {
      captured: capturedInfo,
      reference: referenceInfo,
      normalized: fpsDiff > 0.1,
      normalizedTo: fpsDiff > 0.1 ? referenceInfo.fps : null
    },
    ssim,
    vmaf,
    temporal,
    verdict
  };

  // Save JSON results
  fs.writeFileSync(
    path.join(outputDir, 'video_scores.json'),
    JSON.stringify(results, null, 2)
  );

  // Generate and save markdown report
  const report = generateReport(results);
  fs.writeFileSync(path.join(outputDir, 'video_report.md'), report);

  // Print summary
  console.log('---');
  console.log(`Verdict: ${verdict.quality.toUpperCase()}`);
  console.log(verdict.message);
  console.log('');
  console.log(`Results saved to: ${outputDir}`);

  // Exit with appropriate code
  process.exit(verdict.pass ? 0 : 1);
}

// Run only if executed directly
if (isMainModule) {
  main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

/**
 * Generate side-by-side APNG comparison
 * Creates a single APNG with reference on left, captured on right
 */
async function generateSideBySideAPNG(referencePath, capturedPath, outputPath, options = {}) {
  const {
    gap = 20,
    labelHeight = 40,
    backgroundColor = 'black'
  } = options;

  console.log('Generating side-by-side animation comparison...');

  const tempDir = path.join(path.dirname(outputPath), 'sidebyside_temp');
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Get info for both
    const [refInfo, capInfo] = await Promise.all([
      getVideoInfo(referencePath),
      getVideoInfo(capturedPath)
    ]);

    const width = Math.max(refInfo.width, capInfo.width);
    const height = Math.max(refInfo.height, capInfo.height);
    const totalWidth = width * 2 + gap;
    const totalHeight = height + labelHeight;

    // Extract frames from both APNGs
    const refFramesDir = path.join(tempDir, 'ref');
    const capFramesDir = path.join(tempDir, 'cap');
    const outFramesDir = path.join(tempDir, 'out');
    fs.mkdirSync(refFramesDir, { recursive: true });
    fs.mkdirSync(capFramesDir, { recursive: true });
    fs.mkdirSync(outFramesDir, { recursive: true });

    // Extract reference frames
    await runFFmpeg([
      '-y', '-i', referencePath,
      '-vsync', '0',
      path.join(refFramesDir, 'frame_%04d.png')
    ], true);

    // Extract captured frames
    await runFFmpeg([
      '-y', '-i', capturedPath,
      '-vsync', '0',
      path.join(capFramesDir, 'frame_%04d.png')
    ], true);

    // Get frame lists
    const refFrames = fs.readdirSync(refFramesDir).filter(f => f.endsWith('.png')).sort();
    const capFrames = fs.readdirSync(capFramesDir).filter(f => f.endsWith('.png')).sort();

    // Use the shorter frame count (they should match after normalization, but be safe)
    const frameCount = Math.min(refFrames.length, capFrames.length);
    console.log(`  Creating ${frameCount} side-by-side frames...`);

    // Create side-by-side frames using FFmpeg (simpler hstack approach)
    for (let i = 0; i < frameCount; i++) {
      const refFrame = path.join(refFramesDir, refFrames[i]);
      const capFrame = path.join(capFramesDir, capFrames[i < capFrames.length ? i : capFrames.length - 1]);
      const outFrame = path.join(outFramesDir, `frame_${String(i).padStart(4, '0')}.png`);

      // Use simpler hstack filter
      const result = await runFFmpeg([
        '-y',
        '-i', refFrame,
        '-i', capFrame,
        '-filter_complex', `[0:v][1:v]hstack=inputs=2`,
        '-frames:v', '1',
        '-update', '1',
        outFrame
      ], true);

      // Check if frame was created
      if (i === 0 && !fs.existsSync(outFrame)) {
        console.error(`  First frame not created. FFmpeg output:`, result.slice(-500));
      }

      if ((i + 1) % 20 === 0) {
        console.log(`    Processed ${i + 1}/${frameCount} frames...`);
      }
    }

    // Get fps from reference
    const fps = refInfo.fps || 30;

    // Verify frames were created
    const outFrames = fs.readdirSync(outFramesDir).filter(f => f.endsWith('.png'));
    console.log(`  Output frames ready: ${outFrames.length}`);

    if (outFrames.length === 0) {
      throw new Error('No output frames were created');
    }

    // Compile frames into APNG
    console.log(`  Compiling to APNG at ${fps.toFixed(1)} fps...`);
    const ffmpegOutput = await runFFmpeg([
      '-y',
      '-framerate', String(fps),
      '-start_number', '0',
      '-i', path.join(outFramesDir, 'frame_%04d.png'),
      '-plays', '0',
      '-f', 'apng',
      outputPath
    ], true);

    // Check if output was created
    if (!fs.existsSync(outputPath)) {
      console.error('  FFmpeg did not create output file!');
      console.error('  FFmpeg output (last 1000 chars):', ffmpegOutput.slice(-1000));
      console.error('  Frame dir contents:', fs.readdirSync(outFramesDir).slice(0, 5));
      throw new Error('FFmpeg failed to create side-by-side APNG');
    }

    console.log(`  Created: ${outputPath}`);

    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    return outputPath;
  } catch (error) {
    console.error('  Failed to generate side-by-side APNG:', error.message);
    // Cleanup on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    throw error;
  }
}

// Export for use as module
export { analyzeSSIM, analyzeVMAF, analyzeTemporalConsistency, generateVerdict, generateSideBySideAPNG };
