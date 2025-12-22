#!/usr/bin/env node

/**
 * crop.mjs
 *
 * Crop captured frames to focus region for accurate diff analysis.
 *
 * Usage:
 *   # Crop using scenario config
 *   node animations/shared/diff/crop.mjs --scenario electricity-portal --input /path/to/frames --output /path/to/focus
 *
 *   # Crop using explicit region
 *   node animations/shared/diff/crop.mjs --input /path/to/frames --output /path/to/focus --crop 227:248:826:824
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../..');

/**
 * Create circular mask buffer for given size
 */
function createCircularMask(size) {
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  const maskData = Buffer.alloc(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      maskData[y * size + x] = dist <= radius ? 255 : 0;
    }
  }
  return maskData;
}

/**
 * Apply circular mask to image buffer
 */
async function applyCircularMask(inputPath, outputPath, size) {
  const maskData = createCircularMask(size);

  const input = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = input;

  // Apply mask to alpha channel
  for (let i = 0; i < size * size; i++) {
    data[i * 4 + 3] = maskData[i];
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .png()
    .toFile(outputPath);
}

/**
 * Crop all frames in a directory to focus region
 */
export async function cropFrames(options) {
  const {
    inputDir,
    outputDir,
    cropRegion, // { x, y, width, height, circularMask }
    scenarioName = null
  } = options;

  // Load crop region from scenario if not provided
  let region = cropRegion;
  if (!region && scenarioName) {
    region = loadCropFromScenario(scenarioName);
  }

  if (!region) {
    throw new Error('Crop region required. Provide --crop x:y:w:h or --scenario with crop config.');
  }

  fs.mkdirSync(outputDir, { recursive: true });

  // Find all PNG frames
  const frameFiles = fs.readdirSync(inputDir)
    .filter(f => f.endsWith('.png'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

  if (frameFiles.length === 0) {
    throw new Error(`No PNG frames found in ${inputDir}`);
  }

  const maskNote = region.circularMask ? ' with circular mask' : '';
  console.log(`Cropping ${frameFiles.length} frames to ${region.width}x${region.height}${maskNote}...`);

  const results = [];
  const tempDir = region.circularMask ? path.join(outputDir, '.temp') : null;

  if (tempDir) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  for (let i = 0; i < frameFiles.length; i++) {
    const frameFile = frameFiles[i];
    const inputPath = path.join(inputDir, frameFile);
    const outputPath = path.join(outputDir, frameFile);
    const tempPath = tempDir ? path.join(tempDir, frameFile) : outputPath;

    process.stdout.write(`\r  Frame ${i + 1}/${frameFiles.length}: ${frameFile}`);

    try {
      // Step 1: Crop
      await sharp(inputPath)
        .extract({
          left: region.x,
          top: region.y,
          width: region.width,
          height: region.height
        })
        .toFile(tempPath);

      // Step 2: Apply circular mask if requested
      if (region.circularMask) {
        await applyCircularMask(tempPath, outputPath, region.width);
      }

      results.push({ file: frameFile, success: true });
    } catch (error) {
      results.push({ file: frameFile, success: false, error: error.message });
    }
  }

  // Clean up temp directory
  if (tempDir && fs.existsSync(tempDir)) {
    const tempFiles = fs.readdirSync(tempDir);
    for (const f of tempFiles) {
      fs.unlinkSync(path.join(tempDir, f));
    }
    fs.rmdirSync(tempDir);
  }

  console.log('\n');

  const successful = results.filter(r => r.success).length;
  console.log(`✅ Cropped ${successful}/${frameFiles.length} frames`);

  return {
    inputDir,
    outputDir,
    cropRegion: region,
    frameCount: frameFiles.length,
    successful,
    results
  };
}

/**
 * Load crop region from scenario config
 */
function loadCropFromScenario(scenarioName) {
  const scenarioPath = path.join(PROJECT_ROOT, 'Animations', scenarioName, 'scenario.json');

  if (!fs.existsSync(scenarioPath)) {
    throw new Error(`Scenario not found: ${scenarioPath}`);
  }

  const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));

  if (scenario.capture?.crop) {
    return scenario.capture.crop;
  }

  // Fall back to baseline dimensions if available
  if (scenario.reference?.baseline) {
    const baselinePath = path.join(PROJECT_ROOT, scenario.reference.baseline.replace(/^tools\//, 'tools/'));
    if (fs.existsSync(baselinePath)) {
      const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
      // Use dimensions from baseline but need crop position from scenario
      console.warn('⚠️  No crop region in scenario, using baseline dimensions but position unknown');
    }
  }

  return null;
}

/**
 * Calculate crop region from DOM element bounds (for programmatic use)
 */
export function calculateCropRegion(elementBounds, viewportSize, targetSize) {
  // Center the crop on the element
  const centerX = elementBounds.x + elementBounds.width / 2;
  const centerY = elementBounds.y + elementBounds.height / 2;

  // Calculate crop position (centered on element)
  let x = Math.round(centerX - targetSize.width / 2);
  let y = Math.round(centerY - targetSize.height / 2);

  // Clamp to viewport
  x = Math.max(0, Math.min(x, viewportSize.width - targetSize.width));
  y = Math.max(0, Math.min(y, viewportSize.height - targetSize.height));

  return {
    x,
    y,
    width: targetSize.width,
    height: targetSize.height
  };
}

/**
 * Parse crop string "x:y:w:h" to region object
 */
function parseCropString(cropStr) {
  const parts = cropStr.split(':').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    throw new Error(`Invalid crop format: ${cropStr}. Expected x:y:width:height`);
  }
  return {
    x: parts[0],
    y: parts[1],
    width: parts[2],
    height: parts[3]
  };
}

// === CLI ===
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
crop.mjs - Crop captured frames to focus region

Usage:
  node animations/shared/diff/crop.mjs --input <dir> --output <dir> [options]

Options:
  --input <dir>        Input directory with PNG frames (required)
  --output <dir>       Output directory for cropped frames (required)
  --crop <x:y:w:h>     Crop region (e.g., 227:248:826:824)
  --scenario <name>    Load crop region from scenario config
  --help, -h           Show this help

Examples:
  # Crop using explicit region
  node animations/shared/diff/crop.mjs \\
    --input /tmp/capture/frames \\
    --output /tmp/capture/focus \\
    --crop 227:248:826:824

  # Crop using scenario config
  node animations/shared/diff/crop.mjs \\
    --input /tmp/capture/frames \\
    --output /tmp/capture/focus \\
    --scenario electricity-portal
`);
    process.exit(0);
  }

  const options = {
    inputDir: null,
    outputDir: null,
    cropRegion: null,
    scenarioName: null
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.inputDir = path.resolve(args[++i]);
        break;
      case '--output':
        options.outputDir = path.resolve(args[++i]);
        break;
      case '--crop':
        options.cropRegion = parseCropString(args[++i]);
        break;
      case '--scenario':
        options.scenarioName = args[++i];
        break;
    }
  }

  if (!options.inputDir) {
    console.error('Error: --input <dir> is required');
    process.exit(1);
  }

  if (!options.outputDir) {
    console.error('Error: --output <dir> is required');
    process.exit(1);
  }

  if (!fs.existsSync(options.inputDir)) {
    console.error(`Error: Input directory not found: ${options.inputDir}`);
    process.exit(1);
  }

  try {
    await cropFrames(options);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Only run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
