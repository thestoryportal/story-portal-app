#!/usr/bin/env node

/**
 * pipeline.mjs
 *
 * Full iteration pipeline for AAA animation development.
 * Integrates capture, diff analysis, and feedback generation.
 *
 * Usage:
 *   # Run full pipeline with scenario
 *   node tools/ai/diff/pipeline.mjs --scenario electricity-portal
 *
 *   # Analyze existing capture (skip capture step)
 *   node tools/ai/diff/pipeline.mjs --scenario electricity-portal --frames /path/to/frames
 *
 *   # Run with specific iteration number
 *   node tools/ai/diff/pipeline.mjs --scenario electricity-portal --iteration 5
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import { analyzeCapture } from './analyze.mjs';
import { cropFrames } from './crop.mjs';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../..');

/**
 * Main pipeline orchestrator
 */
export async function runPipeline(options) {
  const {
    scenarioName,
    framesDir = null,
    iteration = 1,
    skipCapture = false,
    outputDir = null
  } = options;

  console.log('\n' + '═'.repeat(60));
  console.log(`  ITERATION PIPELINE: ${scenarioName}`);
  console.log(`  Iteration #${iteration}`);
  console.log('═'.repeat(60) + '\n');

  // Load scenario config
  const scenario = loadScenario(scenarioName);

  // Create output directory for this iteration
  const timestamp = getTimestamp();
  const iterationDir = outputDir || path.join(
    PROJECT_ROOT,
    'tools/ai/iterations',
    scenarioName,
    `iter_${String(iteration).padStart(3, '0')}_${timestamp}`
  );
  fs.mkdirSync(iterationDir, { recursive: true });

  let captureDir = framesDir;
  let focusDir = framesDir; // Will be set to cropped frames

  // Step 1: Capture (if not skipped)
  if (!skipCapture && !framesDir) {
    console.log('📹 Step 1: Capturing animation...');
    captureDir = await runCapture(scenario, iterationDir);
  } else if (framesDir) {
    console.log(`📁 Step 1: Using existing frames from ${framesDir}`);
    captureDir = framesDir;
  } else {
    console.log('⏭️  Step 1: Capture skipped');
  }

  // Step 1.5: Crop to focus region (if crop config exists and frames need cropping)
  const needsCropping = await checkNeedsCropping(captureDir, scenario);
  if (captureDir && scenario.capture?.crop && needsCropping) {
    console.log('\n✂️  Step 1.5: Cropping to focus region...');
    focusDir = path.join(iterationDir, 'focus');
    await runCrop(scenario, captureDir, focusDir);
  } else if (captureDir && scenario.capture?.crop && !needsCropping) {
    console.log('\n✂️  Step 1.5: Frames already focused (smaller than crop region), skipping crop');
    focusDir = captureDir;
  } else {
    focusDir = captureDir;
  }

  // Step 2: Run diff analysis
  console.log('\n🔍 Step 2: Running diff analysis...');
  const analysisDir = path.join(iterationDir, 'analysis');
  const analysisResult = await runAnalysis(scenario, focusDir, analysisDir);

  // Step 3: Check convergence
  console.log('\n📊 Step 3: Checking convergence...');
  const convergence = checkConvergence(scenario, analysisResult, iteration);

  // Step 4: Generate feedback
  console.log('\n📝 Step 4: Generating feedback...');
  const feedback = generateFeedback(scenario, analysisResult, convergence, iteration);

  // Step 5: Save iteration report
  const reportPath = path.join(iterationDir, 'iteration_report.md');
  fs.writeFileSync(reportPath, feedback.markdown);

  // Save machine-readable state
  const statePath = path.join(iterationDir, 'iteration_state.json');
  fs.writeFileSync(statePath, JSON.stringify({
    iteration,
    timestamp,
    scenario: scenarioName,
    scores: analysisResult.scores,
    verdict: analysisResult.verdict,
    convergence,
    nextAction: convergence.action
  }, null, 2));

  // Update latest pointer
  updateLatestPointer(scenarioName, iterationDir);

  // Print summary
  printSummary(analysisResult, convergence, iterationDir);

  return {
    iteration,
    iterationDir,
    analysisResult,
    convergence,
    feedback
  };
}

/**
 * Load scenario configuration
 */
function loadScenario(name) {
  const scenarioPath = path.join(PROJECT_ROOT, 'tools/ai/scenarios', `${name}.json`);

  if (!fs.existsSync(scenarioPath)) {
    throw new Error(`Scenario not found: ${scenarioPath}`);
  }

  const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
  scenario._path = scenarioPath;

  // Resolve relative paths
  if (scenario.reference) {
    for (const key of ['withEffect', 'withoutEffect', 'mask', 'baseline']) {
      if (scenario.reference[key]) {
        scenario.reference[key] = path.join(PROJECT_ROOT, scenario.reference[key]);
      }
    }
  }

  return scenario;
}

/**
 * Run capture using the capture system
 */
async function runCapture(scenario, iterationDir) {
  const captureDir = path.join(iterationDir, 'frames');
  fs.mkdirSync(captureDir, { recursive: true });

  const captureConfig = scenario.capture || {};
  const useVideo = captureConfig.captureMode === 'video';

  // Build capture command arguments
  const headless = captureConfig.headless !== false; // default true
  const viewport = captureConfig.viewport || { width: 2560, height: 1600 };
  const args = [
    'node',
    'tools/ai/capture/run.mjs',
    '--label', scenario.name,
    '--mode', captureConfig.mode || 'smoke',
    '--burstFrames', String(captureConfig.burstFrames || 30),
    '--burstIntervalMs', String(captureConfig.burstIntervalMs || 50),
    '--settleMs', String(captureConfig.settleMs || 1000),
    '--headless', headless ? 'true' : 'false',
    '--video', useVideo ? 'true' : 'false',
    '--gif', 'false',
    '--viewportWidth', String(viewport.width),
    '--viewportHeight', String(viewport.height)
  ];

  console.log(`  Running: ${args.join(' ')}`);
  if (useVideo) {
    console.log(`  Mode: Video capture (will extract frames)`);
  }

  const result = spawnSync(args[0], args.slice(1), {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
    env: { ...process.env }
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.toString() || '';
    const stdout = result.stdout?.toString() || '';
    console.error('  Capture output:', stdout);
    console.error('  Capture errors:', stderr);
    throw new Error(`Capture failed with status ${result.status}`);
  }

  // Parse output to find the capture directory
  const stdout = result.stdout?.toString() || '';
  const outDirMatch = stdout.match(/outDir:\s*(.+)/);

  if (outDirMatch) {
    const actualCaptureDir = outDirMatch[1].trim();
    console.log(`  Captured to: ${actualCaptureDir}`);

    if (useVideo) {
      // Find video file and extract frames
      const videoFile = fs.readdirSync(actualCaptureDir)
        .find(f => f.endsWith('.webm') || f.endsWith('.mp4'));

      if (videoFile) {
        const videoPath = path.join(actualCaptureDir, videoFile);
        console.log(`  Extracting frames from video: ${videoFile}`);

        const fps = captureConfig.videoFps || 30;
        const durationMs = captureConfig.duration || 3000;
        const durationSec = durationMs / 1000;
        const maxFrames = Math.ceil(durationSec * fps);
        // Start capturing right when click happens (at settle time)
        const settleMs = captureConfig.settleMs || 500;
        const startOffset = settleMs / 1000; // Start at click moment

        console.log(`  Start: ${startOffset}s, Duration: ${durationSec}s, FPS: ${fps}, Max frames: ${maxFrames}`);

        const ffmpegResult = spawnSync('ffmpeg', [
          '-ss', String(startOffset),     // Skip to after click
          '-i', videoPath,
          '-t', String(durationSec),      // Limit duration
          '-vf', `fps=${fps}`,
          '-frames:v', String(maxFrames), // Safety limit on frame count
          '-vsync', '0',
          path.join(captureDir, 'frame_%03d.png')
        ], { stdio: 'pipe' });

        if (ffmpegResult.status !== 0) {
          console.error('  ffmpeg error:', ffmpegResult.stderr?.toString());
          throw new Error('Failed to extract frames from video');
        }

        const extractedFrames = fs.readdirSync(captureDir).filter(f => f.endsWith('.png'));
        console.log(`  Extracted ${extractedFrames.length} frames at ${fps}fps`);
      } else {
        console.warn('  ⚠️  No video file found, falling back to screenshots');
      }
    } else {
      // Copy screenshot frames to our iteration directory
      const sourceFrames = fs.readdirSync(actualCaptureDir)
        .filter(f => f.endsWith('.png'));

      for (const frame of sourceFrames) {
        fs.copyFileSync(
          path.join(actualCaptureDir, frame),
          path.join(captureDir, frame)
        );
      }

      console.log(`  Copied ${sourceFrames.length} frames to ${captureDir}`);
    }
  } else {
    console.warn('  ⚠️  Could not parse capture output directory');
  }

  return captureDir;
}

/**
 * Check if frames need cropping (are larger than crop region)
 */
async function checkNeedsCropping(framesDir, scenario) {
  if (!framesDir || !scenario.capture?.crop) return false;

  const cropConfig = scenario.capture.crop;

  // Find first frame to check dimensions
  const frames = fs.existsSync(framesDir)
    ? fs.readdirSync(framesDir).filter(f => f.endsWith('.png'))
    : [];

  if (frames.length === 0) return false;

  // Use sharp to get dimensions of first frame
  const sharp = (await import('sharp')).default;
  const firstFrame = path.join(framesDir, frames[0]);
  const metadata = await sharp(firstFrame).metadata();

  // Need cropping if frame is larger than crop region
  const needsCrop = metadata.width > cropConfig.width || metadata.height > cropConfig.height;

  if (!needsCrop) {
    console.log(`  Frame size ${metadata.width}x${metadata.height} <= crop region ${cropConfig.width}x${cropConfig.height}`);
  }

  return needsCrop;
}

/**
 * Crop frames to focus region
 */
async function runCrop(scenario, inputDir, outputDir) {
  const cropConfig = scenario.capture?.crop;

  if (!cropConfig) {
    console.log('  No crop config, skipping');
    return;
  }

  const cropRegion = {
    x: cropConfig.x,
    y: cropConfig.y,
    width: cropConfig.width,
    height: cropConfig.height,
    circularMask: cropConfig.circularMask || false
  };

  const maskNote = cropRegion.circularMask ? ' with circular mask' : '';
  console.log(`  Cropping to ${cropRegion.width}x${cropRegion.height} at (${cropRegion.x}, ${cropRegion.y})${maskNote}`);

  await cropFrames({
    inputDir,
    outputDir,
    cropRegion
  });
}

/**
 * Run diff analysis
 */
async function runAnalysis(scenario, framesDir, outputDir) {
  const referencePath = scenario.reference.withEffect;
  const maskPath = scenario.reference.mask;

  if (!fs.existsSync(referencePath)) {
    throw new Error(`Reference image not found: ${referencePath}`);
  }

  // Check if frames exist
  const frameFiles = fs.existsSync(framesDir)
    ? fs.readdirSync(framesDir).filter(f => f.endsWith('.png'))
    : [];

  if (frameFiles.length === 0) {
    console.log('  ⚠️  No frames found for analysis');
    return {
      scores: { bestSsim: 0, meanSsim: 0, bestDiffPercent: 100 },
      verdict: { pass: false, quality: 'no-data', message: 'No frames available for analysis' },
      framesAnalyzed: 0
    };
  }

  const result = await analyzeCapture({
    framesDir,
    referencePath,
    maskPath: fs.existsSync(maskPath) ? maskPath : null,
    outputDir,
    thresholds: scenario.thresholds?.ssim || {}
  });

  return result;
}

/**
 * Check convergence criteria
 */
function checkConvergence(scenario, analysisResult, iteration) {
  const { convergence, thresholds } = scenario;
  const ssim = analysisResult.scores?.bestSsim || 0;

  const result = {
    currentSsim: ssim,
    targetSsim: convergence?.targetSsim || 0.90,
    passThreshold: thresholds?.ssim?.pass || 0.85,
    iteration,
    maxIterations: thresholds?.maxIterations || 20,
    reachedTarget: ssim >= (convergence?.targetSsim || 0.90),
    passedThreshold: ssim >= (thresholds?.ssim?.pass || 0.85),
    reachedMaxIterations: iteration >= (thresholds?.maxIterations || 20),
    action: 'continue'
  };

  // Determine action
  if (result.reachedTarget) {
    result.action = 'complete';
    result.reason = `Target SSIM ${(result.targetSsim * 100).toFixed(0)}% reached`;
  } else if (result.passedThreshold) {
    result.action = 'polish';
    result.reason = `Passed ${(result.passThreshold * 100).toFixed(0)}% threshold, continue for quality`;
  } else if (result.reachedMaxIterations) {
    result.action = 'escalate';
    result.reason = `Max iterations (${result.maxIterations}) reached without convergence`;
  } else {
    result.action = 'continue';
    result.reason = `SSIM ${(ssim * 100).toFixed(1)}% below threshold ${(result.passThreshold * 100).toFixed(0)}%`;
  }

  return result;
}

/**
 * Generate feedback for Claude
 */
function generateFeedback(scenario, analysisResult, convergence, iteration) {
  const ssim = analysisResult.scores?.bestSsim || 0;
  const diffPercent = analysisResult.scores?.bestDiffPercent || 100;
  const verdict = analysisResult.verdict || {};

  // Load baseline spec if available
  let baselineSpec = null;
  if (scenario.reference.baseline && fs.existsSync(scenario.reference.baseline)) {
    baselineSpec = JSON.parse(fs.readFileSync(scenario.reference.baseline, 'utf8'));
  }

  const markdown = `# Iteration ${iteration} Report: ${scenario.name}

## Verdict: ${verdict.quality?.toUpperCase() || 'UNKNOWN'}

${verdict.pass ? '✅' : '❌'} ${verdict.message || 'No analysis data'}

---

## Scores

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| SSIM | ${(ssim * 100).toFixed(1)}% | ≥${(convergence.passThreshold * 100).toFixed(0)}% | ${ssim >= convergence.passThreshold ? '✅' : '❌'} |
| Diff % | ${diffPercent.toFixed(1)}% | <15% | ${diffPercent < 15 ? '✅' : '❌'} |

---

## Convergence Status

- **Current SSIM:** ${(ssim * 100).toFixed(1)}%
- **Pass Threshold:** ${(convergence.passThreshold * 100).toFixed(0)}%
- **Target SSIM:** ${(convergence.targetSsim * 100).toFixed(0)}%
- **Iteration:** ${iteration} / ${convergence.maxIterations}
- **Action:** ${convergence.action.toUpperCase()}
- **Reason:** ${convergence.reason}

---

## Visual Specification (Target)

${scenario.visualSpec?.characteristics?.map(c => `- ${c}`).join('\n') || 'No visual spec defined'}

### Target Colors
${scenario.visualSpec?.color ? `
- Primary: ${scenario.visualSpec.color.primary}
- Secondary: ${scenario.visualSpec.color.secondary}
- Glow: ${scenario.visualSpec.color.glow}
` : 'No colors defined'}

---

## Code Targets

Files to modify:
${scenario.codeTargets?.map(f => `- \`${f}\``).join('\n') || 'No code targets defined'}

---

## Next Steps

${getNextSteps(convergence, analysisResult, scenario)}

---

## Artifacts

- \`analysis/comparison.png\` - Side-by-side: reference vs current
- \`analysis/diff_heatmap.png\` - Red = pixels that differ
- \`analysis/scores.json\` - Machine-readable metrics
- \`iteration_state.json\` - Iteration state for pipeline

---

## For Claude

### Current Issue
${getIssueDescription(ssim, diffPercent, verdict)}

### Specific Guidance
${getSpecificGuidance(scenario, ssim)}
`;

  return {
    markdown,
    action: convergence.action,
    ssim,
    diffPercent
  };
}

/**
 * Get next steps based on convergence
 */
function getNextSteps(convergence, analysisResult, scenario) {
  switch (convergence.action) {
    case 'complete':
      return `### ✅ TARGET REACHED

The animation meets the quality target. Consider:
1. Final review of all animation states
2. Performance optimization pass
3. Cross-browser testing
4. Commit and move to next effect`;

    case 'polish':
      return `### 🔧 POLISH PHASE

Threshold passed but target not reached. Focus on:
1. Fine-tuning color intensity and glow
2. Adjusting animation timing
3. Smoothing edges and transitions
4. Optimizing for consistency across frames`;

    case 'escalate':
      return `### ⚠️ ESCALATION NEEDED

Max iterations reached. Consider:
1. Re-evaluate the visual specification
2. Check if reference is achievable with current approach
3. Consider alternative implementation techniques
4. Request human review of approach`;

    default:
      return `### 🔄 CONTINUE ITERATION

Focus areas for improvement:
1. Review \`diff_heatmap.png\` to identify problem areas
2. Compare \`comparison.png\` for visual differences
3. Adjust ${scenario.codeTargets?.[0] || 'effect code'}
4. Re-run pipeline to measure improvement`;
  }
}

/**
 * Get issue description
 */
function getIssueDescription(ssim, diffPercent, verdict) {
  if (ssim >= 0.95) {
    return 'Minor differences remain. Focus on subtle details.';
  } else if (ssim >= 0.85) {
    return 'Good progress. Address remaining visual differences highlighted in heatmap.';
  } else if (ssim >= 0.70) {
    return 'Significant differences remain. Review comparison image for major discrepancies.';
  } else {
    return 'Major revision needed. The current implementation differs substantially from reference.';
  }
}

/**
 * Get specific guidance
 */
function getSpecificGuidance(scenario, ssim) {
  const guidance = [];

  if (ssim < 0.70) {
    guidance.push('- Verify the effect is rendering at all');
    guidance.push('- Check color values match the target palette');
    guidance.push('- Ensure glow/bloom effects are active');
  }

  if (ssim < 0.85) {
    guidance.push('- Increase glow intensity and spread');
    guidance.push('- Adjust color saturation and brightness');
    guidance.push('- Add more electricity branches if sparse');
  }

  if (ssim < 0.95) {
    guidance.push('- Fine-tune animation timing');
    guidance.push('- Adjust edge softness and anti-aliasing');
    guidance.push('- Match flickering frequency to reference');
  }

  if (scenario.visualSpec?.characteristics) {
    guidance.push('');
    guidance.push('Target characteristics:');
    scenario.visualSpec.characteristics.forEach(c => {
      guidance.push(`- ${c}`);
    });
  }

  return guidance.join('\n');
}

/**
 * Update latest pointer
 */
function updateLatestPointer(scenarioName, iterationDir) {
  const latestDir = path.join(PROJECT_ROOT, 'tools/ai/iterations', scenarioName);
  fs.mkdirSync(latestDir, { recursive: true });

  const latestPath = path.join(latestDir, 'LATEST.txt');
  fs.writeFileSync(latestPath, iterationDir + '\n');
}

/**
 * Print summary
 */
function printSummary(analysisResult, convergence, iterationDir) {
  const ssim = analysisResult.scores?.bestSsim || 0;

  console.log('\n' + '═'.repeat(60));
  console.log('  ITERATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  SSIM:      ${(ssim * 100).toFixed(1)}%`);
  console.log(`  Threshold: ${(convergence.passThreshold * 100).toFixed(0)}%`);
  console.log(`  Target:    ${(convergence.targetSsim * 100).toFixed(0)}%`);
  console.log('─'.repeat(60));
  console.log(`  Action:    ${convergence.action.toUpperCase()}`);
  console.log(`  Reason:    ${convergence.reason}`);
  console.log('─'.repeat(60));
  console.log(`  Output:    ${iterationDir}`);
  console.log('═'.repeat(60) + '\n');
}

/**
 * Get timestamp
 */
function getTimestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

// === CLI ===
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
pipeline.mjs - Full iteration pipeline for AAA animation development

Usage:
  node tools/ai/diff/pipeline.mjs --scenario <name> [options]

Options:
  --scenario <name>    Scenario name (required)
  --frames <dir>       Use existing frames (skip capture)
  --iteration <n>      Iteration number (default: 1)
  --output <dir>       Output directory
  --help, -h           Show this help

Examples:
  # Run full pipeline
  node tools/ai/diff/pipeline.mjs --scenario electricity-portal

  # Analyze existing frames
  node tools/ai/diff/pipeline.mjs --scenario electricity-portal \\
    --frames /tmp/electricity-real-test

  # Run iteration 5
  node tools/ai/diff/pipeline.mjs --scenario electricity-portal --iteration 5
`);
    process.exit(0);
  }

  const options = {
    scenarioName: null,
    framesDir: null,
    iteration: 1,
    outputDir: null
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--scenario':
        options.scenarioName = args[++i];
        break;
      case '--frames':
        options.framesDir = path.resolve(args[++i]);
        break;
      case '--iteration':
        options.iteration = parseInt(args[++i], 10);
        break;
      case '--output':
        options.outputDir = path.resolve(args[++i]);
        break;
    }
  }

  if (!options.scenarioName) {
    console.error('Error: --scenario <name> is required');
    process.exit(1);
  }

  try {
    const result = await runPipeline(options);
    process.exit(result.convergence.action === 'complete' ? 0 : 1);
  } catch (error) {
    console.error('Pipeline error:', error.message);
    if (process.env.DEBUG) console.error(error.stack);
    process.exit(1);
  }
}

main();
