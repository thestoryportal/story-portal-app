#!/usr/bin/env node

/**
 * run-analysis.mjs
 *
 * CLI wrapper for running diff analysis on captured frames.
 *
 * Usage:
 *   node tools/ai/diff/run-analysis.mjs <capture-dir> <reference-image> [options]
 *
 * Examples:
 *   # Analyze a specific capture directory
 *   node tools/ai/diff/run-analysis.mjs \
 *     tools/ai/screenshots/timeline/2025-12-19/20251219_143022__electricity \
 *     tools/ai/references/electricity-portal/mockup_focus.png
 *
 *   # Analyze with mask
 *   node tools/ai/diff/run-analysis.mjs \
 *     tools/ai/screenshots/timeline/2025-12-19/20251219_143022__electricity \
 *     tools/ai/references/electricity-portal/mockup_focus.png \
 *     --mask tools/ai/references/electricity-portal/golden_mask.png
 *
 *   # Analyze latest capture
 *   node tools/ai/diff/run-analysis.mjs --latest \
 *     tools/ai/references/electricity-portal/mockup_focus.png
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { analyzeCapture } from './analyze.mjs';

/**
 * Find the latest capture directory
 */
function findLatestCapture() {
  const timelineRoot = path.resolve('tools/ai/screenshots/timeline');

  if (!fs.existsSync(timelineRoot)) {
    throw new Error(`Timeline directory not found: ${timelineRoot}`);
  }

  // Find most recent day directory
  const dayDirs = fs.readdirSync(timelineRoot)
    .filter(d => fs.statSync(path.join(timelineRoot, d)).isDirectory())
    .sort()
    .reverse();

  if (dayDirs.length === 0) {
    throw new Error('No capture directories found');
  }

  const latestDay = path.join(timelineRoot, dayDirs[0]);

  // Find most recent capture in that day
  const captureDirs = fs.readdirSync(latestDay)
    .filter(d => fs.statSync(path.join(latestDay, d)).isDirectory())
    .sort()
    .reverse();

  if (captureDirs.length === 0) {
    throw new Error(`No captures found in ${latestDay}`);
  }

  return path.join(latestDay, captureDirs[0]);
}

/**
 * Find frames directory within capture
 */
function findFramesDir(captureDir) {
  // Check for focus directory first (cropped frames)
  const focusDir = path.join(captureDir, 'focus');
  if (fs.existsSync(focusDir)) {
    const pngs = fs.readdirSync(focusDir).filter(f => f.endsWith('.png'));
    if (pngs.length > 0) {
      return focusDir;
    }
  }

  // Check for frames directory
  const framesDir = path.join(captureDir, 'frames');
  if (fs.existsSync(framesDir)) {
    const pngs = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));
    if (pngs.length > 0) {
      return framesDir;
    }
  }

  // Check root directory for frame_*.png or numbered *.png
  const rootPngs = fs.readdirSync(captureDir).filter(f =>
    f.match(/frame_\d+\.png/) || f.match(/^\d+\.png$/)
  );
  if (rootPngs.length > 0) {
    return captureDir;
  }

  // Check for video that needs frame extraction
  const videoPath = findVideo(captureDir);
  if (videoPath) {
    console.log('Extracting frames from video...');
    const extractedDir = path.join(captureDir, 'frames');
    extractFramesFromVideo(videoPath, extractedDir);
    return extractedDir;
  }

  throw new Error(`No frames found in ${captureDir}. Expected PNG files or video.`);
}

/**
 * Find video file in capture directory
 */
function findVideo(captureDir) {
  const videoExtensions = ['.webm', '.mp4', '.mov'];

  // Check focus directory
  for (const ext of videoExtensions) {
    const focusVideo = path.join(captureDir, 'focus', `focus${ext}`);
    if (fs.existsSync(focusVideo)) return focusVideo;
  }

  // Check root
  for (const ext of videoExtensions) {
    const rootVideo = path.join(captureDir, `capture${ext}`);
    if (fs.existsSync(rootVideo)) return rootVideo;
  }

  // Check for any video
  const files = fs.readdirSync(captureDir);
  for (const file of files) {
    if (videoExtensions.some(ext => file.endsWith(ext))) {
      return path.join(captureDir, file);
    }
  }

  return null;
}

/**
 * Extract frames from video using ffmpeg
 */
function extractFramesFromVideo(videoPath, outputDir, options = {}) {
  const { crop = null, fps = 0 } = options;

  fs.mkdirSync(outputDir, { recursive: true });

  let filterArg = '';
  if (crop) {
    filterArg = `-vf "crop=${crop}"`;
  }
  if (fps > 0) {
    filterArg = filterArg ? `${filterArg.slice(0, -1)},fps=${fps}"` : `-vf "fps=${fps}"`;
  }

  const cmd = `ffmpeg -i "${videoPath}" ${filterArg} -vsync 0 "${path.join(outputDir, 'frame_%03d.png')}"`;

  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Failed to extract frames: ${error.message}`);
  }

  const extracted = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
  console.log(`  Extracted ${extracted.length} frames`);

  return outputDir;
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const options = {
    captureDir: null,
    referencePath: null,
    maskPath: null,
    outputDir: null,
    threshold: 0.85,
    crop: null,
    latest: false
  };

  let positionalIndex = 0;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--latest':
        options.latest = true;
        break;
      case '--mask':
        options.maskPath = path.resolve(args[++i]);
        break;
      case '--output':
        options.outputDir = path.resolve(args[++i]);
        break;
      case '--threshold':
        options.threshold = parseFloat(args[++i]);
        break;
      case '--crop':
        options.crop = args[++i]; // Format: "w:h:x:y"
        break;
      default:
        if (!arg.startsWith('-')) {
          if (positionalIndex === 0) {
            options.captureDir = path.resolve(arg);
          } else if (positionalIndex === 1) {
            options.referencePath = path.resolve(arg);
          }
          positionalIndex++;
        }
    }
  }

  return options;
}

function showHelp() {
  console.log(`
run-analysis.mjs - Analyze captured frames against reference image

Usage:
  node tools/ai/diff/run-analysis.mjs <capture-dir> <reference> [options]
  node tools/ai/diff/run-analysis.mjs --latest <reference> [options]

Arguments:
  capture-dir    Directory containing captured frames or video
  reference      Reference image to compare against

Options:
  --latest           Use the most recent capture directory
  --mask <path>      ROI mask image (white = analyze, black = ignore)
  --output <dir>     Output directory (default: <capture-dir>/analysis)
  --threshold <n>    SSIM pass threshold (default: 0.85)
  --crop <w:h:x:y>   Crop region for frame extraction from video
  --help, -h         Show this help

Examples:
  # Analyze specific capture
  node tools/ai/diff/run-analysis.mjs \\
    tools/ai/screenshots/timeline/2025-12-19/20251219_143022__electricity \\
    tools/ai/references/electricity-portal/mockup_focus.png

  # Analyze latest capture with mask
  node tools/ai/diff/run-analysis.mjs --latest \\
    tools/ai/references/electricity-portal/mockup_focus.png \\
    --mask tools/ai/references/electricity-portal/golden_mask.png

  # Analyze with custom threshold
  node tools/ai/diff/run-analysis.mjs \\
    ./my-capture \\
    ./reference.png \\
    --threshold 0.90
`);
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();

  // Resolve capture directory
  let captureDir;
  if (options.latest) {
    console.log('Finding latest capture...');
    captureDir = findLatestCapture();
    console.log(`  Found: ${captureDir}`);
  } else if (options.captureDir) {
    captureDir = options.captureDir;
  } else {
    console.error('Error: Capture directory required (or use --latest)');
    showHelp();
    process.exit(1);
  }

  if (!fs.existsSync(captureDir)) {
    console.error(`Error: Capture directory not found: ${captureDir}`);
    process.exit(1);
  }

  // Validate reference
  if (!options.referencePath) {
    console.error('Error: Reference image required');
    showHelp();
    process.exit(1);
  }

  if (!fs.existsSync(options.referencePath)) {
    console.error(`Error: Reference image not found: ${options.referencePath}`);
    process.exit(1);
  }

  // Validate mask if provided
  if (options.maskPath && !fs.existsSync(options.maskPath)) {
    console.error(`Error: Mask image not found: ${options.maskPath}`);
    process.exit(1);
  }

  // Find frames
  console.log('Locating frames...');
  let framesDir;
  try {
    framesDir = findFramesDir(captureDir);
    const frameCount = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).length;
    console.log(`  Found ${frameCount} frames in ${framesDir}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  // Set output directory
  const outputDir = options.outputDir || path.join(captureDir, 'analysis');

  console.log('\n--- Running Analysis ---\n');

  try {
    const report = await analyzeCapture({
      framesDir,
      referencePath: options.referencePath,
      maskPath: options.maskPath,
      outputDir,
      thresholds: {
        ssim: options.threshold
      }
    });

    // Print summary
    console.log('\n' + '═'.repeat(50));
    console.log(`VERDICT: ${report.verdict.quality.toUpperCase()}`);
    console.log('═'.repeat(50));
    console.log(report.verdict.message);
    console.log('─'.repeat(50));
    console.log(`Best Frame SSIM: ${(report.scores.bestSsim * 100).toFixed(1)}%`);
    console.log(`Mean SSIM:       ${(report.scores.meanSsim * 100).toFixed(1)}%`);
    console.log(`Diff Percent:    ${report.scores.bestDiffPercent.toFixed(1)}%`);
    console.log('─'.repeat(50));
    console.log(`\nFull report: ${path.join(outputDir, 'report.md')}`);
    console.log(`Artifacts:   ${outputDir}`);

    // Exit with appropriate code
    process.exit(report.verdict.pass ? 0 : 1);

  } catch (error) {
    console.error('\nAnalysis failed:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
