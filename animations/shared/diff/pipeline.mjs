#!/usr/bin/env node

/**
 * pipeline.mjs
 *
 * Full iteration pipeline for AAA animation development.
 * Integrates capture, diff analysis, and feedback generation.
 *
 * Usage:
 *   # Run full pipeline with scenario
 *   node animations/diff/pipeline.mjs --scenario electricity-portal
 *
 *   # Analyze existing capture (skip capture step)
 *   node animations/diff/pipeline.mjs --scenario electricity-portal --frames /path/to/frames
 *
 *   # Run with specific iteration number
 *   node animations/diff/pipeline.mjs --scenario electricity-portal --iteration 5
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import { analyzeCapture } from './analyze.mjs';
import { cropFrames } from './crop.mjs';
import { analyzeSSIM as analyzeVideoSSIM, analyzeVMAF, analyzeTemporalConsistency, analyzeFlickerOscillation, compareFlicker, generateSideBySideAPNG } from './video-analyze.mjs';
import { collectIterations, generateViewer, openInBrowser } from './html-viewer.mjs';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../..');

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pipeline Logger - Detailed step-by-step logging with timing
 */
class PipelineLogger {
  constructor() {
    this.steps = [];
    this.currentStep = null;
    this.pipelineStart = null;
    this.indentLevel = 0;
  }

  /**
   * Start the entire pipeline
   */
  startPipeline(scenarioName, iteration) {
    this.pipelineStart = Date.now();
    this.steps = [];

    const border = '═'.repeat(70);
    console.log(`\n${border}`);
    console.log(`  🚀 ITERATION PIPELINE STARTED`);
    console.log(`  Scenario: ${scenarioName}`);
    console.log(`  Iteration: #${iteration}`);
    console.log(`  Started: ${new Date().toISOString()}`);
    console.log(`${border}\n`);
  }

  /**
   * End the entire pipeline
   */
  endPipeline(success, summary = {}) {
    const duration = Date.now() - this.pipelineStart;
    const border = '═'.repeat(70);

    console.log(`\n${border}`);
    console.log(`  ${success ? '✅ PIPELINE COMPLETED' : '❌ PIPELINE FAILED'}`);
    console.log(`  Total Duration: ${this.formatDuration(duration)}`);
    console.log(`  Ended: ${new Date().toISOString()}`);
    console.log(`${border}`);

    // Print step summary
    console.log(`\n${'─'.repeat(70)}`);
    console.log('  STEP SUMMARY');
    console.log('─'.repeat(70));

    for (const step of this.steps) {
      const status = step.success ? '✅' : (step.skipped ? '⏭️' : '❌');
      const duration = step.duration ? this.formatDuration(step.duration) : 'N/A';
      console.log(`  ${status} ${step.name.padEnd(35)} ${duration.padStart(12)}`);
      if (step.error) {
        console.log(`      └─ Error: ${step.error}`);
      }
      if (step.details) {
        for (const detail of step.details) {
          console.log(`      └─ ${detail}`);
        }
      }
    }

    console.log('─'.repeat(70));

    // Print key metrics if available
    if (summary.ssim !== undefined) {
      console.log(`\n  📊 KEY METRICS`);
      console.log(`  Frame SSIM: ${(summary.ssim * 100).toFixed(1)}%`);
      if (summary.videoSsim !== undefined) {
        console.log(`  Video SSIM: ${(summary.videoSsim * 100).toFixed(1)}%`);
      }
      if (summary.vmaf !== undefined && summary.vmaf !== null) {
        console.log(`  VMAF: ${summary.vmaf.toFixed(1)}`);
      }
      if (summary.action) {
        console.log(`  Action: ${summary.action.toUpperCase()}`);
      }
    }

    console.log(`\n${border}\n`);
  }

  /**
   * Start a new step
   */
  startStep(stepNumber, name, description = '') {
    this.currentStep = {
      number: stepNumber,
      name,
      description,
      startTime: Date.now(),
      success: null,
      skipped: false,
      error: null,
      details: [],
      substeps: []
    };

    const prefix = `Step ${stepNumber}`;
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`  📌 ${prefix}: ${name}`);
    if (description) {
      console.log(`     ${description}`);
    }
    console.log(`     Started: ${new Date().toISOString()}`);
    console.log('─'.repeat(70));

    this.indentLevel = 1;
  }

  /**
   * End current step with success
   */
  endStepSuccess(details = []) {
    if (!this.currentStep) return;

    this.currentStep.duration = Date.now() - this.currentStep.startTime;
    this.currentStep.success = true;
    this.currentStep.details = details;

    console.log(`  ✅ ${this.currentStep.name} COMPLETED`);
    console.log(`     Duration: ${this.formatDuration(this.currentStep.duration)}`);
    for (const detail of details) {
      console.log(`     • ${detail}`);
    }

    this.steps.push({ ...this.currentStep });
    this.currentStep = null;
    this.indentLevel = 0;
  }

  /**
   * End current step with failure
   */
  endStepFailure(error, details = []) {
    if (!this.currentStep) return;

    this.currentStep.duration = Date.now() - this.currentStep.startTime;
    this.currentStep.success = false;
    this.currentStep.error = error;
    this.currentStep.details = details;

    console.log(`  ❌ ${this.currentStep.name} FAILED`);
    console.log(`     Duration: ${this.formatDuration(this.currentStep.duration)}`);
    console.log(`     Error: ${error}`);
    for (const detail of details) {
      console.log(`     • ${detail}`);
    }

    this.steps.push({ ...this.currentStep });
    this.currentStep = null;
    this.indentLevel = 0;
  }

  /**
   * Mark current step as skipped
   */
  skipStep(reason) {
    if (!this.currentStep) return;

    this.currentStep.duration = Date.now() - this.currentStep.startTime;
    this.currentStep.skipped = true;
    this.currentStep.details = [reason];

    console.log(`  ⏭️  ${this.currentStep.name} SKIPPED`);
    console.log(`     Reason: ${reason}`);

    this.steps.push({ ...this.currentStep });
    this.currentStep = null;
    this.indentLevel = 0;
  }

  /**
   * Log a substep within the current step
   */
  substep(name) {
    const indent = '     ';
    console.log(`${indent}▸ ${name}`);
    if (this.currentStep) {
      this.currentStep.substeps.push({ name, time: Date.now() });
    }
  }

  /**
   * Log progress within a substep
   */
  progress(message) {
    const indent = '       ';
    console.log(`${indent}${message}`);
  }

  /**
   * Log a warning
   */
  warn(message) {
    const indent = '     ';
    console.log(`${indent}⚠️  ${message}`);
  }

  /**
   * Log an info message
   */
  info(message) {
    const indent = '     ';
    console.log(`${indent}ℹ️  ${message}`);
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const mins = Math.floor(ms / 60000);
    const secs = ((ms % 60000) / 1000).toFixed(1);
    return `${mins}m ${secs}s`;
  }

  /**
   * Get full step log as JSON (for saving to file)
   */
  toJSON() {
    return {
      pipelineStart: this.pipelineStart,
      pipelineDuration: Date.now() - this.pipelineStart,
      steps: this.steps
    };
  }
}

// Global logger instance
const logger = new PipelineLogger();

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

  // Start pipeline logging
  logger.startPipeline(scenarioName, iteration);

  let pipelineSuccess = true;
  let scenario, iterationDir, captureDir, focusDir, analysisResult, convergence, feedback;

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 0: Load Configuration
    // ─────────────────────────────────────────────────────────────────────────
    logger.startStep('0', 'Load Configuration', 'Loading scenario.json and baseline metrics');
    try {
      scenario = loadScenario(scenarioName);
      logger.substep(`Loaded scenario: ${scenario._path}`);
      logger.substep(`Reference image: ${scenario.reference.withEffect ? '✓' : '✗'}`);
      logger.substep(`Mask image: ${scenario.reference.mask ? '✓' : '✗'}`);
      logger.substep(`Baseline metrics: ${scenario._baselineMetrics ? '✓' : '✗'}`);
      logger.substep(`Animation baseline: ${scenario._animationBaseline ? '✓' : '✗'}`);
      logger.endStepSuccess([
        `Scenario: ${scenarioName}`,
        `Thresholds: pass=${scenario.thresholds?.ssim?.pass || 0.85}, target=${scenario.convergence?.targetSsim || 0.90}`
      ]);
    } catch (error) {
      logger.endStepFailure(error.message);
      throw error;
    }

    // Create output directory for this iteration
    const timestamp = getTimestamp();
    iterationDir = outputDir || path.join(
      PROJECT_ROOT,
      'animations',
      scenarioName,
      'output/iterations',
      `iter_${String(iteration).padStart(3, '0')}_${timestamp}`
    );
    fs.mkdirSync(iterationDir, { recursive: true });
    logger.info(`Output directory: ${iterationDir}`);

    captureDir = framesDir;
    focusDir = framesDir;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Capture Animation
    // ─────────────────────────────────────────────────────────────────────────
    logger.startStep('1', 'Capture Animation', 'Recording effect frames via Puppeteer');
    try {
      if (!skipCapture && !framesDir) {
        const captureMode = scenario.capture?.captureMode || 'screenshot';
        logger.substep(`Capture mode: ${captureMode}`);
        logger.substep(`Duration: ${scenario.capture?.duration || 4000}ms`);
        logger.substep(`Effect timing: ${scenario.capture?.effectTiming?.startMs || 0}-${scenario.capture?.effectTiming?.endMs || 2000}ms`);

        captureDir = await runCapture(scenario, iterationDir);

        const frameCount = fs.readdirSync(captureDir).filter(f => f.endsWith('.png')).length;
        logger.endStepSuccess([
          `Captured ${frameCount} frames`,
          `Output: ${captureDir}`
        ]);
      } else if (framesDir) {
        logger.skipStep(`Using existing frames from ${framesDir}`);
        captureDir = framesDir;
      } else {
        logger.skipStep('Capture disabled');
      }
    } catch (error) {
      logger.endStepFailure(error.message);
      throw error;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1.5: Crop to Focus Region
    // ─────────────────────────────────────────────────────────────────────────
    logger.startStep('1.5', 'Crop to Focus Region', 'Extracting effect region from full frames');
    try {
      const needsCropping = await checkNeedsCropping(captureDir, scenario);

      if (captureDir && scenario.capture?.crop && needsCropping) {
        const crop = scenario.capture.crop;
        logger.substep(`Crop region: ${crop.width}x${crop.height} at (${crop.x}, ${crop.y})`);
        logger.substep(`Circular mask: ${crop.circularMask ? 'yes' : 'no'}`);

        focusDir = path.join(iterationDir, 'focus');
        await runCrop(scenario, captureDir, focusDir);

        const croppedCount = fs.readdirSync(focusDir).filter(f => f.endsWith('.png')).length;
        logger.endStepSuccess([
          `Cropped ${croppedCount} frames`,
          `Output: ${focusDir}`
        ]);
      } else if (captureDir && scenario.capture?.crop && !needsCropping) {
        logger.skipStep('Frames already at target size');
        focusDir = captureDir;
      } else {
        logger.skipStep('No crop configuration');
        focusDir = captureDir;
      }
    } catch (error) {
      logger.endStepFailure(error.message);
      throw error;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Frame Diff Analysis
    // ─────────────────────────────────────────────────────────────────────────
    logger.startStep('2', 'Frame Diff Analysis', 'Computing SSIM scores against reference');
    try {
      const analysisDir = path.join(iterationDir, 'analysis');
      logger.substep(`Reference: ${path.basename(scenario.reference.withEffect)}`);
      logger.substep(`Mask: ${scenario.reference.mask ? path.basename(scenario.reference.mask) : 'none'}`);

      analysisResult = await runAnalysis(scenario, focusDir, analysisDir);

      const ssim = analysisResult.scores?.bestSsim || 0;
      const meanSsim = analysisResult.scores?.meanSsim || 0;
      const diffPercent = analysisResult.scores?.bestDiffPercent || 100;

      logger.endStepSuccess([
        `Best SSIM: ${(ssim * 100).toFixed(1)}%`,
        `Mean SSIM: ${(meanSsim * 100).toFixed(1)}%`,
        `Diff: ${diffPercent.toFixed(1)}%`,
        `Frames analyzed: ${analysisResult.framesAnalyzed || 0}`
      ]);
    } catch (error) {
      logger.endStepFailure(error.message);
      throw error;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2.5: Video Diff Analysis
    // ─────────────────────────────────────────────────────────────────────────
    logger.startStep('2.5', 'Video Diff Analysis', 'Comparing APNG animations');
    try {
      const capturedApng = findCapturedApng(captureDir);
      const referenceApng = scenario.reference?.animation;

      if (capturedApng && referenceApng && fs.existsSync(referenceApng)) {
        logger.substep(`Captured: ${path.basename(capturedApng)}`);
        logger.substep(`Reference: ${path.basename(referenceApng)}`);

        const videoAnalysisDir = path.join(iterationDir, 'analysis', 'video');
        fs.mkdirSync(videoAnalysisDir, { recursive: true });

        const videoAnalysis = await runVideoAnalysis(capturedApng, referenceApng, videoAnalysisDir);

        if (videoAnalysis) {
          analysisResult.videoSsim = videoAnalysis.aggregate || null;
          analysisResult.vmaf = videoAnalysis.vmaf?.aggregate || null;
          analysisResult.temporalConsistency = videoAnalysis.temporal?.consistency || null;
          analysisResult.flicker = videoAnalysis.flicker || null;

          const successDetails = [
            `Video SSIM: ${((videoAnalysis.aggregate || 0) * 100).toFixed(1)}%`,
            `Temporal consistency: ${((videoAnalysis.temporal?.consistency || 0) * 100).toFixed(1)}%`
          ];
          if (videoAnalysis.vmaf) {
            successDetails.push(`VMAF: ${videoAnalysis.vmaf.aggregate?.toFixed(1) || 'N/A'}`);
          }
          if (videoAnalysis.flicker) {
            successDetails.push(`Flicker: ${videoAnalysis.flicker.oscillationCount} oscillations`);
          }
          logger.endStepSuccess(successDetails);
        } else {
          logger.endStepSuccess(['Video analysis returned no results']);
        }
      } else {
        logger.skipStep(capturedApng ? 'Reference APNG not found' : 'Captured APNG not found');
      }
    } catch (error) {
      logger.warn(`Video analysis failed: ${error.message}`);
      logger.endStepSuccess(['Video analysis skipped due to error']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2.6: Open APNG for Review
    // ─────────────────────────────────────────────────────────────────────────
    logger.startStep('2.6', 'Open APNG for Review', 'Opening animation in Chrome');
    try {
      const capturedApng = findCapturedApng(captureDir);
      if (capturedApng) {
        openApngInChrome(capturedApng);
        logger.endStepSuccess([`Opened: ${capturedApng}`]);
      } else {
        logger.skipStep('No APNG available');
      }
    } catch (error) {
      logger.warn(`Could not open APNG: ${error.message}`);
      logger.endStepSuccess(['APNG open skipped']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: Check Convergence
    // ─────────────────────────────────────────────────────────────────────────
    logger.startStep('3', 'Check Convergence', 'Evaluating iteration progress');
    try {
      convergence = checkConvergence(scenario, analysisResult, iteration);

      logger.substep(`Current SSIM: ${(convergence.currentSsim * 100).toFixed(1)}%`);
      logger.substep(`Pass threshold: ${(convergence.passThreshold * 100).toFixed(0)}%`);
      logger.substep(`Target SSIM: ${(convergence.targetSsim * 100).toFixed(0)}%`);
      logger.substep(`Action: ${convergence.action.toUpperCase()}`);

      logger.endStepSuccess([
        `Action: ${convergence.action.toUpperCase()}`,
        `Reason: ${convergence.reason}`
      ]);
    } catch (error) {
      logger.endStepFailure(error.message);
      throw error;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: Generate Feedback
    // ─────────────────────────────────────────────────────────────────────────
    logger.startStep('4', 'Generate Feedback', 'Creating iteration report');
    try {
      feedback = generateFeedback(scenario, analysisResult, convergence, iteration);
      logger.endStepSuccess([
        `Report generated`,
        `Action: ${feedback.action}`,
        `SSIM: ${(feedback.ssim * 100).toFixed(1)}%`
      ]);
    } catch (error) {
      logger.endStepFailure(error.message);
      throw error;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5: Save Results
    // ─────────────────────────────────────────────────────────────────────────
    logger.startStep('5', 'Save Results', 'Writing reports and state files');
    try {
      // Save iteration report
      const reportPath = path.join(iterationDir, 'iteration_report.md');
      fs.writeFileSync(reportPath, feedback.markdown);
      logger.substep(`Saved: iteration_report.md`);

      // Save machine-readable state
      const statePath = path.join(iterationDir, 'iteration_state.json');
      fs.writeFileSync(statePath, JSON.stringify({
        iteration,
        timestamp,
        scenario: scenarioName,
        scores: {
          ...analysisResult.scores,
          videoSsim: analysisResult.videoSsim || null,
          vmaf: analysisResult.vmaf || null,
          temporalConsistency: analysisResult.temporalConsistency || null,
          flicker: analysisResult.flicker || null
        },
        verdict: analysisResult.verdict,
        convergence,
        nextAction: convergence.action,
        baselineTargets: {
          static: scenario._baselineMetrics ? {
            brightnessCore: scenario._baselineMetrics.metrics?.intensity?.[0]?.averageBrightness,
            brightestHex: scenario._baselineMetrics.metrics?.colors?.brightest?.hex,
            effectCoverage: scenario._baselineMetrics.metrics?.mask?.coveragePercent
          } : null,
          animation: scenario._animationBaseline ? {
            frameCount: scenario._animationBaseline.metrics?.animation?.frameCount,
            flickerOscillations: scenario._animationBaseline.metrics?.flicker?.oscillationCount,
            motionEnergy: scenario._animationBaseline.metrics?.motion?.averageChange,
            colorConsistency: scenario._animationBaseline.metrics?.colorStability?.colorConsistency
          } : null
        },
        pipelineLog: logger.toJSON()
      }, null, 2));
      logger.substep(`Saved: iteration_state.json`);

      // Update latest pointer
      updateLatestPointer(scenarioName, iterationDir);
      logger.substep(`Updated: LATEST.txt`);

      logger.endStepSuccess([
        `Output directory: ${iterationDir}`,
        `Reports saved successfully`
      ]);
    } catch (error) {
      logger.endStepFailure(error.message);
      throw error;
    }

  } catch (error) {
    pipelineSuccess = false;
    console.error(`\n❌ Pipeline error: ${error.message}`);
    if (process.env.DEBUG) console.error(error.stack);
  }

  // End pipeline with summary
  logger.endPipeline(pipelineSuccess, {
    ssim: analysisResult?.scores?.bestSsim,
    videoSsim: analysisResult?.videoSsim,
    vmaf: analysisResult?.vmaf,
    action: convergence?.action
  });

  // Generate and open HTML viewer with all iterations
  try {
    const outputDir = path.join(PROJECT_ROOT, 'animations', scenario.name, 'output');
    const iterations = collectIterations(outputDir, scenario.name, scenario);

    if (iterations.length > 0) {
      const htmlPath = await generateViewer(outputDir, iterations, scenario.name, scenario);
      await openInBrowser(htmlPath);
    }
  } catch (viewerError) {
    console.warn(`Could not open HTML viewer: ${viewerError.message}`);
  }

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
  const scenarioPath = path.join(PROJECT_ROOT, 'animations', name, 'scenario.json');

  if (!fs.existsSync(scenarioPath)) {
    throw new Error(`Scenario not found: ${scenarioPath}`);
  }

  const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
  scenario._path = scenarioPath;

  // Resolve relative paths
  if (scenario.reference) {
    for (const key of ['withEffect', 'withoutEffect', 'mask', 'baseline', 'baselineMetrics', 'animationBaseline', 'animation']) {
      if (scenario.reference[key]) {
        scenario.reference[key] = path.join(PROJECT_ROOT, scenario.reference[key]);
      }
    }
  }

  // Load baseline metrics if available
  scenario._baselineMetrics = null;
  scenario._animationBaseline = null;

  if (scenario.reference.baselineMetrics && fs.existsSync(scenario.reference.baselineMetrics)) {
    try {
      scenario._baselineMetrics = JSON.parse(fs.readFileSync(scenario.reference.baselineMetrics, 'utf8'));
    } catch (e) {
      console.warn('Could not load baseline metrics:', e.message);
    }
  }

  if (scenario.reference.animationBaseline && fs.existsSync(scenario.reference.animationBaseline)) {
    try {
      scenario._animationBaseline = JSON.parse(fs.readFileSync(scenario.reference.animationBaseline, 'utf8'));
    } catch (e) {
      console.warn('Could not load animation baseline:', e.message);
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

  if (useVideo) {
    // Use video.mjs for video capture mode (Puppeteer screencast)
    return runVideoCapture(scenario, captureDir, captureConfig);
  } else {
    // Use run.mjs for screenshot burst mode
    return runScreenshotCapture(scenario, captureDir, captureConfig);
  }
}

/**
 * Run video capture using video.mjs (Puppeteer screencast)
 */
async function runVideoCapture(scenario, captureDir, captureConfig) {
  const viewport = captureConfig.viewport || { width: 1440, height: 768 };
  const cropConfig = captureConfig.crop || {};
  const effectTiming = captureConfig.effectTiming || {};

  const args = [
    'node',
    'animations/shared/capture/video.mjs',
    '--scenario', scenario.name,
    '--label', `iter-${scenario.name}`,
    '--mode', captureConfig.mode || 'newtopics',
    '--duration', String(captureConfig.duration || 4000),
    '--settleMs', String(captureConfig.settleMs || 500),
    '--fps', String(captureConfig.videoFps || 30),
    '--effectStartMs', String(effectTiming.startMs || 1200),
    '--effectEndMs', String(effectTiming.endMs || 2000),
  ];

  // Add crop args if specified
  if (cropConfig.x !== undefined) {
    args.push('--cropX', String(cropConfig.x));
    args.push('--cropY', String(cropConfig.y));
    args.push('--cropWidth', String(cropConfig.width));
    args.push('--cropHeight', String(cropConfig.height));
  }

  if (!cropConfig.circularMask) {
    args.push('--no-mask');
  }

  logger.substep(`Launching Puppeteer video capture...`);
  logger.progress(`Command: node animations/shared/capture/video.mjs`);
  logger.progress(`Viewport: ${viewport.width}x${viewport.height}`);
  logger.progress(`Crop: ${cropConfig.width}x${cropConfig.height} at (${cropConfig.x}, ${cropConfig.y})`);

  const captureStartTime = Date.now();
  const result = spawnSync(args[0], args.slice(1), {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
    env: { ...process.env }
  });
  const captureElapsed = Date.now() - captureStartTime;

  const stdout = result.stdout?.toString() || '';
  const stderr = result.stderr?.toString() || '';

  logger.progress(`Puppeteer capture completed in ${logger.formatDuration(captureElapsed)}`);

  if (result.status !== 0) {
    logger.warn(`Capture stdout: ${stdout.slice(0, 500)}`);
    logger.warn(`Capture stderr: ${stderr.slice(0, 500)}`);
    throw new Error(`Video capture failed with status ${result.status}`);
  }

  // Parse output to find the capture directory
  const outDirMatch = stdout.match(/Output directory:\s*(.+)/);
  if (!outDirMatch) {
    logger.warn(`Could not parse output directory from: ${stdout.slice(0, 300)}`);
    throw new Error('Could not parse video capture output directory');
  }

  const videoCaptureDir = outDirMatch[1].trim();
  logger.progress(`Video capture output: ${videoCaptureDir}`);

  const maskedDir = path.join(videoCaptureDir, 'masked');

  // Copy masked frames to our iteration frames directory
  if (fs.existsSync(maskedDir)) {
    const maskedFrames = fs.readdirSync(maskedDir)
      .filter(f => f.endsWith('.png'))
      .sort();

    logger.substep(`Copying ${maskedFrames.length} masked frames...`);

    for (const frame of maskedFrames) {
      fs.copyFileSync(
        path.join(maskedDir, frame),
        path.join(captureDir, frame)
      );
    }

    logger.progress(`Copied to: ${captureDir}`);

    // Also copy animation.apng if it exists
    const apngSource = path.join(videoCaptureDir, 'animation.apng');
    if (fs.existsSync(apngSource)) {
      const iterationDir = path.dirname(captureDir);
      const apngDest = path.join(iterationDir, 'animation.apng');
      fs.copyFileSync(apngSource, apngDest);
      logger.progress(`Copied animation.apng`);
    }
  } else {
    // Fallback to crops directory
    const cropsDir = path.join(videoCaptureDir, 'crops');
    if (fs.existsSync(cropsDir)) {
      const cropFrames = fs.readdirSync(cropsDir)
        .filter(f => f.endsWith('.png'))
        .sort();

      logger.substep(`Copying ${cropFrames.length} cropped frames (fallback)...`);

      for (const frame of cropFrames) {
        fs.copyFileSync(
          path.join(cropsDir, frame),
          path.join(captureDir, frame)
        );
      }

      logger.progress(`Copied to: ${captureDir}`);

      // Also copy animation.apng if it exists
      const apngSource = path.join(videoCaptureDir, 'animation.apng');
      if (fs.existsSync(apngSource)) {
        const iterationDir = path.dirname(captureDir);
        const apngDest = path.join(iterationDir, 'animation.apng');
        fs.copyFileSync(apngSource, apngDest);
        logger.progress(`Copied animation.apng`);
      }
    } else {
      throw new Error(`No frames found in ${videoCaptureDir}`);
    }
  }

  return captureDir;
}

/**
 * Run screenshot burst capture using run.mjs
 */
async function runScreenshotCapture(scenario, captureDir, captureConfig) {
  const headless = captureConfig.headless !== false;
  const viewport = captureConfig.viewport || { width: 2560, height: 1600 };
  const cropConfig = captureConfig.crop || null;

  const args = [
    'node',
    'animations/shared/capture/run.mjs',
    '--scenario', scenario.name,
    '--label', scenario.name,
    '--mode', captureConfig.mode || 'smoke',
    '--burstFrames', String(captureConfig.burstFrames || 30),
    '--burstIntervalMs', String(captureConfig.burstIntervalMs || 50),
    '--settleMs', String(captureConfig.settleMs || 1000),
    '--headless', headless ? 'true' : 'false',
    '--viewportWidth', String(viewport.width),
    '--viewportHeight', String(viewport.height)
  ];

  // Add crop arguments if configured
  if (cropConfig) {
    args.push('--crop');
    args.push('--cropX', String(cropConfig.x));
    args.push('--cropY', String(cropConfig.y));
    args.push('--cropWidth', String(cropConfig.width));
    args.push('--cropHeight', String(cropConfig.height));
    if (cropConfig.circularMask) {
      args.push('--circularMask');
    }
  }

  logger.substep(`Launching screenshot burst capture...`);
  logger.progress(`Command: node animations/shared/capture/run.mjs`);
  logger.progress(`Headless: ${headless}`);
  logger.progress(`Viewport: ${viewport.width}x${viewport.height}`);
  logger.progress(`Burst: ${captureConfig.burstFrames || 30} frames @ ${captureConfig.burstIntervalMs || 50}ms interval`);

  const captureStartTime = Date.now();
  const result = spawnSync(args[0], args.slice(1), {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
    env: { ...process.env }
  });
  const captureElapsed = Date.now() - captureStartTime;

  logger.progress(`Screenshot capture completed in ${logger.formatDuration(captureElapsed)}`);

  if (result.status !== 0) {
    const stderr = result.stderr?.toString() || '';
    const stdout = result.stdout?.toString() || '';
    logger.warn(`Capture stdout: ${stdout.slice(0, 500)}`);
    logger.warn(`Capture stderr: ${stderr.slice(0, 500)}`);
    throw new Error(`Screenshot capture failed with status ${result.status}`);
  }

  // Parse output to find the capture directory
  const stdout = result.stdout?.toString() || '';
  const outDirMatch = stdout.match(/outDir:\s*(.+)/);
  const cropsMatch = stdout.match(/crops:\s*(.+)/);

  if (outDirMatch) {
    const actualCaptureDir = outDirMatch[1].trim();
    const cropsDir = cropsMatch ? cropsMatch[1].trim() : null;
    const sourceDir = cropsDir && fs.existsSync(cropsDir) ? cropsDir : actualCaptureDir;

    logger.progress(`Captured to: ${actualCaptureDir}`);
    if (cropsDir) logger.progress(`Using crops from: ${cropsDir}`);

    // Copy frames to our iteration directory
    const sourceFrames = fs.readdirSync(sourceDir)
      .filter(f => f.endsWith('.png'));

    logger.substep(`Copying ${sourceFrames.length} frames...`);

    for (const frame of sourceFrames) {
      fs.copyFileSync(
        path.join(sourceDir, frame),
        path.join(captureDir, frame)
      );
    }

    logger.progress(`Copied to: ${captureDir}`);
  } else {
    logger.warn('Could not parse capture output directory');
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

  // Use preloaded baseline metrics
  const baselineMetrics = scenario._baselineMetrics;
  const animationBaseline = scenario._animationBaseline;

  const markdown = `# Iteration ${iteration} Report: ${scenario.name}

## Verdict: ${verdict.quality?.toUpperCase() || 'UNKNOWN'}

${verdict.pass ? '✅' : '❌'} ${verdict.message || 'No analysis data'}

---

## Scores

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Frame SSIM | ${(ssim * 100).toFixed(1)}% | ≥${(convergence.passThreshold * 100).toFixed(0)}% | ${ssim >= convergence.passThreshold ? '✅' : '❌'} |
| Video SSIM | ${analysisResult.videoSsim ? (analysisResult.videoSsim * 100).toFixed(1) + '%' : 'N/A'} | ≥${(convergence.passThreshold * 100).toFixed(0)}% | ${analysisResult.videoSsim >= convergence.passThreshold ? '✅' : '❌'} |
| VMAF | ${analysisResult.vmaf ? analysisResult.vmaf.toFixed(1) : 'N/A'} | ≥80 | ${analysisResult.vmaf >= 80 ? '✅' : '❌'} |
| Temporal | ${analysisResult.temporalConsistency ? (analysisResult.temporalConsistency * 100).toFixed(1) + '%' : 'N/A'} | ≥90% | ${analysisResult.temporalConsistency >= 0.9 ? '✅' : '⚠️'} |
| Flicker | ${analysisResult.flicker ? analysisResult.flicker.oscillationCount + ' osc' : 'N/A'} | Match ref | ${analysisResult.flicker ? '📊' : '—'} |
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

## Baseline Metrics (Reference Targets)

### Static Reference
${baselineMetrics ? `
| Zone | Target Brightness |
|------|-------------------|
${baselineMetrics.metrics?.intensity?.map(z => `| ${z.name} | ${z.averageBrightness} |`).join('\n') || '| N/A | N/A |'}

- **Brightest point:** ${baselineMetrics.metrics?.colors?.brightest?.hex || 'N/A'}
- **Average color:** ${baselineMetrics.metrics?.colors?.average?.hex || 'N/A'}
- **Effect coverage:** ${baselineMetrics.metrics?.mask?.coveragePercent?.toFixed(1) || 'N/A'}%
` : 'No static baseline metrics available'}

### Animation Reference
${animationBaseline ? `
| Metric | Target Value |
|--------|--------------|
| Frame count | ${animationBaseline.metrics?.animation?.frameCount || 'N/A'} |
| Brightness range | ${animationBaseline.metrics?.brightness?.min?.toFixed(0) || 'N/A'}-${animationBaseline.metrics?.brightness?.max?.toFixed(0) || 'N/A'} |
| Motion energy | ${animationBaseline.metrics?.motion?.averageChange?.toFixed(1) || 'N/A'} avg/frame |
| Flicker oscillations | ${animationBaseline.metrics?.flicker?.oscillationCount || 'N/A'} |
| Color consistency | ${((animationBaseline.metrics?.colorStability?.colorConsistency || 0) * 100).toFixed(0)}% |

**Interpretation:**
- Brightness std dev: ${animationBaseline.metrics?.brightness?.stdDev?.toFixed(2) || 'N/A'} (lower = more consistent)
- Max flicker: ${animationBaseline.metrics?.flicker?.maxFlicker?.toFixed(2) || 'N/A'} (brightness change between frames)
- Peak frame: ${animationBaseline.metrics?.keyFrames?.peak || 'N/A'} (brightest moment)
` : 'No animation baseline metrics available'}

---

## Code Targets

Files to modify:
${formatCodeTargets(scenario.codeTargets)}

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
 * Format code targets from scenario.json
 * Handles both array format and object format with core/supporting
 */
function formatCodeTargets(codeTargets) {
  if (!codeTargets) return 'No code targets defined';

  // Handle array format (legacy)
  if (Array.isArray(codeTargets)) {
    return codeTargets.map(f => `- \`${f}\``).join('\n');
  }

  // Handle object format with core/supporting
  const lines = [];
  if (codeTargets.core?.length) {
    lines.push('**Core:**');
    codeTargets.core.forEach(f => lines.push(`- \`${f}\``));
  }
  if (codeTargets.supporting?.length) {
    lines.push('**Supporting:**');
    codeTargets.supporting.forEach(f => lines.push(`- \`${f}\``));
  }
  return lines.length ? lines.join('\n') : 'No code targets defined';
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
  const latestDir = path.join(PROJECT_ROOT, 'animations', scenarioName, 'output/iterations');
  fs.mkdirSync(latestDir, { recursive: true });

  const latestPath = path.join(latestDir, 'LATEST.txt');
  fs.writeFileSync(latestPath, iterationDir + '\n');
}

/**
 * Get timestamp
 */
function getTimestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/**
 * Find captured APNG from video capture output
 */
function findCapturedApng(captureDir) {
  if (!captureDir) return null;

  // Check parent directory for animation.apng (video.mjs output structure)
  const parentDir = path.dirname(captureDir);

  // Try common locations
  const candidates = [
    path.join(parentDir, 'animation.apng'),
    path.join(captureDir, 'animation.apng'),
    path.join(captureDir, '..', 'animation.apng'),
  ];

  // Also search for any APNG in parent's timeline directory
  const timelineMatch = parentDir.match(/screenshots\/timeline\/\d{4}-\d{2}-\d{2}\/(\d{8}_\d{6}__[^/]+)/);
  if (timelineMatch) {
    const timelineDir = parentDir.includes(timelineMatch[1])
      ? parentDir
      : path.join(parentDir, '..', timelineMatch[1]);
    candidates.push(path.join(timelineDir, 'animation.apng'));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Search more broadly in recent capture directories
  const screenshotsDir = path.join(PROJECT_ROOT, 'animations/electricity-portal/output/screenshots/timeline');
  if (fs.existsSync(screenshotsDir)) {
    const today = new Date().toISOString().split('T')[0];
    const todayDir = path.join(screenshotsDir, today);

    if (fs.existsSync(todayDir)) {
      const captures = fs.readdirSync(todayDir)
        .filter(d => d.includes('iter-'))
        .sort()
        .reverse();

      for (const capture of captures.slice(0, 3)) { // Check 3 most recent
        const apngPath = path.join(todayDir, capture, 'animation.apng');
        if (fs.existsSync(apngPath)) {
          return apngPath;
        }
      }
    }
  }

  return null;
}

/**
 * Run video SSIM analysis between captured and reference APNGs
 */
async function runVideoAnalysis(capturedPath, referencePath, outputDir) {
  console.log(`  Captured: ${path.basename(capturedPath)}`);
  console.log(`  Reference: ${path.basename(referencePath)}`);

  try {
    const ssim = await analyzeVideoSSIM(capturedPath, referencePath, outputDir);

    // Parse per-frame scores for temporal analysis
    const temporal = analyzeTemporalConsistency(ssim.perFrame);

    // Run VMAF analysis (perceptually accurate, slower)
    let vmaf = null;
    try {
      console.log(`  Running VMAF analysis...`);
      vmaf = await analyzeVMAF(capturedPath, referencePath, outputDir);
      if (vmaf) {
        console.log(`  VMAF aggregate: ${vmaf.aggregate?.toFixed(2) || 'N/A'}`);
      }
    } catch (vmafError) {
      console.warn(`  VMAF analysis failed: ${vmafError.message}`);
    }

    // Analyze flicker oscillation
    let flicker = null;
    try {
      flicker = analyzeFlickerOscillation(ssim.perFrame);
      if (flicker) {
        console.log(`  Flicker: ${flicker.oscillationCount} oscillations, rate ${(flicker.flickerRate * 100).toFixed(1)}%`);
      }
    } catch (flickerError) {
      console.warn(`  Flicker analysis failed: ${flickerError.message}`);
    }

    // Generate side-by-side comparison APNG
    let sideBySidePath = null;
    try {
      sideBySidePath = path.join(outputDir, 'animation_comparison.apng');
      await generateSideBySideAPNG(referencePath, capturedPath, sideBySidePath);
    } catch (sbsError) {
      console.warn(`  Side-by-side generation failed: ${sbsError.message}`);
    }

    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      captured: capturedPath,
      reference: referencePath,
      sideBySide: sideBySidePath,
      ssim: {
        aggregate: ssim.aggregate,
        min: ssim.min,
        max: ssim.max,
        mean: ssim.mean,
        perFrame: ssim.perFrame
      },
      vmaf: vmaf ? {
        aggregate: vmaf.aggregate,
        min: vmaf.min,
        max: vmaf.max,
        mean: vmaf.mean,
        perFrame: vmaf.perFrame
      } : null,
      flicker,
      temporal
    };

    fs.writeFileSync(
      path.join(outputDir, 'video_scores.json'),
      JSON.stringify(results, null, 2)
    );

    return { ...ssim, vmaf, flicker, temporal, sideBySidePath };
  } catch (error) {
    console.warn(`  Video analysis failed: ${error.message}`);
    return null;
  }
}

/**
 * Open APNG in Chrome for human review
 */
function openApngInChrome(apngPath) {
  try {
    execSync(`open -a "Google Chrome" "${apngPath}"`, { stdio: 'inherit' });
    console.log(`  Opened: ${apngPath}`);
  } catch (error) {
    console.warn(`  Could not open APNG: ${error.message}`);
  }
}

// === CLI ===
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
pipeline.mjs - Full iteration pipeline for AAA animation development

Usage:
  node animations/diff/pipeline.mjs --scenario <name> [options]

Options:
  --scenario <name>    Scenario name (required)
  --frames <dir>       Use existing frames (skip capture)
  --iteration <n>      Iteration number (default: 1)
  --output <dir>       Output directory
  --help, -h           Show this help

Examples:
  # Run full pipeline
  node animations/diff/pipeline.mjs --scenario electricity-portal

  # Analyze existing frames
  node animations/diff/pipeline.mjs --scenario electricity-portal \\
    --frames /tmp/electricity-real-test

  # Run iteration 5
  node animations/diff/pipeline.mjs --scenario electricity-portal --iteration 5
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
