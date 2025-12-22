#!/usr/bin/env node

/**
 * extract-baseline.mjs
 *
 * Extract baseline metrics from reference images.
 * Run ONCE per effect before starting iteration loop.
 *
 * Usage:
 *   node animations/shared/diff/extract-baseline.mjs \
 *     --with reference_with_effect.png \
 *     --without reference_without_effect.png \
 *     --output animations/electricity-portal/references/
 *
 *   # Without "before" reference (estimates mask from brightness):
 *   node animations/shared/diff/extract-baseline.mjs \
 *     --with reference_with_effect.png \
 *     --output animations/electricity-portal/references/
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Extract baseline metrics from reference images
 */
export async function extractBaseline(options) {
  const {
    refWithEffect,
    refWithoutEffect = null,
    outputDir,
    effectName = 'effect'
  } = options;

  fs.mkdirSync(outputDir, { recursive: true });

  const results = {
    timestamp: new Date().toISOString(),
    effectName,
    references: {
      withEffect: refWithEffect,
      withoutEffect: refWithoutEffect
    },
    metrics: {},
    artifacts: {}
  };

  console.log('Loading reference image...');
  const refWith = await loadImage(refWithEffect);
  results.metrics.dimensions = {
    width: refWith.width,
    height: refWith.height
  };

  // === COLOR ANALYSIS ===
  console.log('Analyzing colors...');
  results.metrics.colors = analyzeColors(refWith);

  // === GENERATE GOLDEN MASK ===
  if (refWithoutEffect && fs.existsSync(refWithoutEffect)) {
    console.log('Generating golden mask from reference pair...');
    const refWithout = await loadImage(refWithoutEffect);

    const mask = generateGoldenMask(refWith, refWithout);

    const maskPath = path.join(outputDir, 'golden_mask.png');
    await saveImage(mask, maskPath);

    results.artifacts.goldenMask = maskPath;
    results.metrics.mask = {
      effectPixels: mask.effectPixelCount,
      totalPixels: mask.width * mask.height,
      coveragePercent: (mask.effectPixelCount / (mask.width * mask.height)) * 100
    };

    // Generate soft mask (feathered edges)
    console.log('Generating soft mask...');
    const softMaskPath = path.join(outputDir, 'golden_mask_soft.png');
    await sharp(maskPath).blur(3).toFile(softMaskPath);
    results.artifacts.goldenMaskSoft = softMaskPath;

    // Analyze effect region
    results.metrics.effectRegion = analyzeEffectRegion(refWith, mask);
  } else {
    console.log('No "without" reference - estimating mask from brightness...');
    const estimatedMask = estimateMaskFromBrightness(refWith);

    const maskPath = path.join(outputDir, 'golden_mask_estimated.png');
    await saveImage(estimatedMask, maskPath);

    results.artifacts.goldenMask = maskPath;
    results.artifacts.maskEstimated = true;
    results.metrics.mask = {
      effectPixels: estimatedMask.effectPixelCount,
      totalPixels: estimatedMask.width * estimatedMask.height,
      coveragePercent: (estimatedMask.effectPixelCount / (estimatedMask.width * estimatedMask.height)) * 100,
      estimated: true
    };

    results.metrics.effectRegion = analyzeEffectRegion(refWith, estimatedMask);
  }

  // === STRUCTURAL ANALYSIS ===
  console.log('Analyzing structure...');
  results.metrics.structure = await analyzeStructure(refWith);

  // === INTENSITY DISTRIBUTION ===
  console.log('Analyzing intensity distribution...');
  results.metrics.intensity = analyzeIntensityDistribution(refWith);

  // === SAVE BASELINE ===
  const metricsPath = path.join(outputDir, 'baseline_metrics.json');
  fs.writeFileSync(metricsPath, JSON.stringify(results, null, 2));
  results.artifacts.metrics = metricsPath;

  // === GENERATE REPORT ===
  console.log('Generating report...');
  const report = generateBaselineReport(results);
  const reportPath = path.join(outputDir, 'baseline_report.md');
  fs.writeFileSync(reportPath, report);
  results.artifacts.report = reportPath;

  // === GENERATE QUALITY SPEC ===
  const specPath = path.join(outputDir, 'quality_spec.json');
  const spec = generateQualitySpec(results);
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
  results.artifacts.qualitySpec = specPath;

  console.log('\n✅ Baseline extraction complete!');
  console.log(`   Metrics: ${metricsPath}`);
  console.log(`   Report:  ${reportPath}`);
  console.log(`   Spec:    ${specPath}`);

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
 * Save raw pixel data as PNG
 */
async function saveImage(image, filepath) {
  await sharp(Buffer.from(image.data), {
    raw: { width: image.width, height: image.height, channels: 4 }
  })
    .png()
    .toFile(filepath);
}

/**
 * Analyze dominant colors in the image
 */
function analyzeColors(image) {
  const { data, width, height } = image;

  const colors = {
    brightest: { r: 0, g: 0, b: 0, hex: '#000000' },
    dominant: [],
    histogram: { r: new Array(256).fill(0), g: new Array(256).fill(0), b: new Array(256).fill(0) }
  };

  let maxBrightness = 0;
  const colorCounts = new Map();
  let totalPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue; // Skip transparent pixels
    totalPixels++;

    // Update histogram
    colors.histogram.r[r]++;
    colors.histogram.g[g]++;
    colors.histogram.b[b]++;

    const brightness = (r + g + b) / 3;

    if (brightness > maxBrightness) {
      maxBrightness = brightness;
      colors.brightest = { r, g, b, hex: rgbToHex(r, g, b) };
    }

    // Quantize for dominant color extraction (32 levels per channel)
    const qr = Math.floor(r / 8) * 8;
    const qg = Math.floor(g / 8) * 8;
    const qb = Math.floor(b / 8) * 8;
    const key = `${qr},${qg},${qb}`;
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  }

  // Extract top dominant colors
  const sorted = [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  colors.dominant = sorted.map(([key, count]) => {
    const [r, g, b] = key.split(',').map(Number);
    return {
      r, g, b,
      hex: rgbToHex(r, g, b),
      count,
      percent: ((count / totalPixels) * 100).toFixed(2)
    };
  });

  // Calculate average color
  let totalR = 0, totalG = 0, totalB = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
  }
  colors.average = {
    r: Math.round(totalR / totalPixels),
    g: Math.round(totalG / totalPixels),
    b: Math.round(totalB / totalPixels),
    hex: rgbToHex(
      Math.round(totalR / totalPixels),
      Math.round(totalG / totalPixels),
      Math.round(totalB / totalPixels)
    )
  };

  return colors;
}

/**
 * Generate golden mask from two reference images
 * Fills interior holes so the entire effect region is covered
 */
function generateGoldenMask(refWith, refWithout) {
  const { width, height, data: dataWith } = refWith;
  const { data: dataWithout } = refWithout;

  // Step 1: Create initial mask from pixel differences
  const initialMask = new Uint8Array(width * height); // 1 byte per pixel
  const threshold = 25;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const dr = Math.abs(dataWith[i] - dataWithout[i]);
      const dg = Math.abs(dataWith[i + 1] - dataWithout[i + 1]);
      const db = Math.abs(dataWith[i + 2] - dataWithout[i + 2]);
      const diff = (dr + dg + db) / 3;
      initialMask[y * width + x] = diff > threshold ? 1 : 0;
    }
  }

  // Step 2: Flood fill from edges to mark exterior (background)
  const exterior = new Uint8Array(width * height);
  const queue = [];

  // Add all edge pixels to queue
  for (let x = 0; x < width; x++) {
    if (initialMask[x] === 0) queue.push([x, 0]);
    if (initialMask[(height - 1) * width + x] === 0) queue.push([x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    if (initialMask[y * width] === 0) queue.push([0, y]);
    if (initialMask[y * width + width - 1] === 0) queue.push([width - 1, y]);
  }

  // Flood fill exterior
  while (queue.length > 0) {
    const [x, y] = queue.pop();
    const idx = y * width + x;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (exterior[idx] === 1) continue; // Already visited
    if (initialMask[idx] === 1) continue; // Part of effect boundary

    exterior[idx] = 1;

    // Add neighbors
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  // Step 3: Create final mask - anything NOT exterior is the effect region
  const mask = new Uint8Array(width * height * 4);
  let effectPixelCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * 4;

      // If not exterior, it's part of the effect (fills holes)
      const isEffect = exterior[idx] === 0;

      if (isEffect) {
        mask[i] = 255;
        mask[i + 1] = 255;
        mask[i + 2] = 255;
        mask[i + 3] = 255;
        effectPixelCount++;
      } else {
        mask[i] = 0;
        mask[i + 1] = 0;
        mask[i + 2] = 0;
        mask[i + 3] = 255;
      }
    }
  }

  return { data: mask, width, height, channels: 4, effectPixelCount };
}

/**
 * Estimate mask from brightness (when no "without" reference)
 */
function estimateMaskFromBrightness(image, brightnessThreshold = 180) {
  const { data, width, height } = image;
  const mask = new Uint8Array(width * height * 4);
  let effectPixelCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

    if (brightness > brightnessThreshold) {
      mask[i] = 255;
      mask[i + 1] = 255;
      mask[i + 2] = 255;
      mask[i + 3] = 255;
      effectPixelCount++;
    } else {
      mask[i] = 0;
      mask[i + 1] = 0;
      mask[i + 2] = 0;
      mask[i + 3] = 255;
    }
  }

  return { data: mask, width, height, channels: 4, effectPixelCount };
}

/**
 * Analyze the effect region
 */
function analyzeEffectRegion(image, mask) {
  const { data, width, height } = image;

  let totalBrightness = 0;
  let pixelCount = 0;
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let centerSumX = 0, centerSumY = 0;

  const brightPixels = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      if (mask.data[i] < 128) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      totalBrightness += brightness;
      pixelCount++;

      centerSumX += x;
      centerSumY += y;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      if (brightness > 200) {
        brightPixels.push({ x, y, brightness });
      }
    }
  }

  return {
    boundingBox: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    },
    centerOfMass: {
      x: Math.round(centerSumX / pixelCount),
      y: Math.round(centerSumY / pixelCount)
    },
    averageBrightness: totalBrightness / (pixelCount || 1),
    brightPixelCount: brightPixels.length,
    pixelCount
  };
}

/**
 * Analyze structural elements (edge detection)
 */
async function analyzeStructure(image) {
  // Use sharp to detect edges via convolution
  const edgeBuffer = await sharp(Buffer.from(image.data), {
    raw: { width: image.width, height: image.height, channels: 4 }
  })
    .greyscale()
    .convolve({
      width: 3,
      height: 3,
      kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // Laplacian
    })
    .raw()
    .toBuffer();

  let edgePixelCount = 0;
  for (let i = 0; i < edgeBuffer.length; i++) {
    if (edgeBuffer[i] > 50) edgePixelCount++;
  }

  return {
    edgePixelCount,
    edgeDensity: edgePixelCount / (image.width * image.height),
    note: 'Higher edge density indicates more branching/detail in the effect'
  };
}

/**
 * Analyze intensity distribution in radial zones
 */
function analyzeIntensityDistribution(image) {
  const { data, width, height } = image;

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2;

  const zones = [
    { name: 'core', minR: 0, maxR: maxRadius * 0.2, totalBrightness: 0, count: 0 },
    { name: 'inner', minR: maxRadius * 0.2, maxR: maxRadius * 0.5, totalBrightness: 0, count: 0 },
    { name: 'outer', minR: maxRadius * 0.5, maxR: maxRadius * 0.8, totalBrightness: 0, count: 0 },
    { name: 'edge', minR: maxRadius * 0.8, maxR: maxRadius, totalBrightness: 0, count: 0 }
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

      const dx = x - centerX;
      const dy = y - centerY;
      const radius = Math.sqrt(dx * dx + dy * dy);

      for (const zone of zones) {
        if (radius >= zone.minR && radius < zone.maxR) {
          zone.totalBrightness += brightness;
          zone.count++;
          break;
        }
      }
    }
  }

  return zones.map(z => ({
    name: z.name,
    averageBrightness: z.count > 0 ? Math.round(z.totalBrightness / z.count) : 0,
    pixelCount: z.count
  }));
}

/**
 * Generate quality specification from baseline
 */
function generateQualitySpec(baseline) {
  const { metrics, effectName } = baseline;

  return {
    effectName,
    version: '1.0',
    generatedAt: baseline.timestamp,

    tierA: {
      color: {
        brightest: metrics.colors.brightest,
        dominant: metrics.colors.dominant.slice(0, 4).map(c => ({
          hex: c.hex,
          tolerance: 15
        })),
        average: metrics.colors.average
      },
      structure: {
        edgeDensity: {
          target: metrics.structure.edgeDensity,
          tolerancePercent: 25
        }
      },
      containment: {
        boundingBox: metrics.effectRegion.boundingBox,
        centerOfMass: metrics.effectRegion.centerOfMass
      }
    },

    tierB: {
      ssim: {
        pass: 0.85,
        good: 0.90,
        excellent: 0.95
      },
      diffPercent: {
        max: 15,
        warning: 10,
        ideal: 5
      }
    },

    intensity: {
      distribution: metrics.intensity,
      requirement: 'core > inner > outer > edge',
      coreMinBrightness: Math.max(150, metrics.intensity[0]?.averageBrightness - 30)
    },

    mask: {
      coveragePercent: metrics.mask.coveragePercent,
      effectPixels: metrics.mask.effectPixels
    }
  };
}

/**
 * Generate markdown report
 */
function generateBaselineReport(baseline) {
  const { metrics, artifacts, effectName } = baseline;

  return `# Baseline Analysis Report: ${effectName}

**Generated:** ${baseline.timestamp}

---

## Reference Dimensions
- **Width:** ${metrics.dimensions.width}px
- **Height:** ${metrics.dimensions.height}px

---

## Color Profile

### Brightest Point
- **Hex:** ${metrics.colors.brightest.hex}
- **RGB:** (${metrics.colors.brightest.r}, ${metrics.colors.brightest.g}, ${metrics.colors.brightest.b})

### Average Color
- **Hex:** ${metrics.colors.average.hex}

### Dominant Colors (Target Palette)
| Rank | Hex | RGB | Coverage |
|------|-----|-----|----------|
${metrics.colors.dominant.slice(0, 6).map((c, i) =>
  `| ${i + 1} | ${c.hex} | (${c.r}, ${c.g}, ${c.b}) | ${c.percent}% |`
).join('\n')}

---

## Effect Region (from Golden Mask)

${metrics.mask.estimated ? '⚠️ *Mask estimated from brightness (no "without" reference provided)*\n' : ''}

- **Effect Pixels:** ${metrics.mask.effectPixels.toLocaleString()}
- **Coverage:** ${metrics.mask.coveragePercent.toFixed(1)}% of frame

### Bounding Box
- **Position:** (${metrics.effectRegion.boundingBox.x}, ${metrics.effectRegion.boundingBox.y})
- **Size:** ${metrics.effectRegion.boundingBox.width} x ${metrics.effectRegion.boundingBox.height}

### Center of Mass
- **Position:** (${metrics.effectRegion.centerOfMass.x}, ${metrics.effectRegion.centerOfMass.y})

### Brightness
- **Average in effect region:** ${metrics.effectRegion.averageBrightness.toFixed(1)}
- **Bright pixel count (>200):** ${metrics.effectRegion.brightPixelCount.toLocaleString()}

---

## Structural Analysis

- **Edge pixel count:** ${metrics.structure.edgePixelCount.toLocaleString()}
- **Edge density:** ${(metrics.structure.edgeDensity * 100).toFixed(3)}%
- **Note:** ${metrics.structure.note}

---

## Intensity Distribution (Radial Zones)

| Zone | Avg Brightness | Pixels |
|------|----------------|--------|
${metrics.intensity.map(z =>
  `| ${z.name} | ${z.averageBrightness} | ${z.pixelCount.toLocaleString()} |`
).join('\n')}

**Expected Pattern:** Core > Inner > Outer > Edge

---

## Generated Artifacts

| File | Description |
|------|-------------|
| \`golden_mask.png\` | Binary mask of effect region |
| \`golden_mask_soft.png\` | Feathered mask for softer scoring |
| \`baseline_metrics.json\` | Machine-readable metrics |
| \`quality_spec.json\` | Quality thresholds for iteration |

---

## Usage in Iteration

### Target Metrics for Claude

\`\`\`
SSIM target: ≥0.85 (within masked region)
Color delta: Dominant colors within 15% of baseline
Brightness: Core (${metrics.intensity[0]?.averageBrightness || 'N/A'}) > Inner > Outer > Edge
Edge density: Within ±25% of ${(metrics.structure.edgeDensity * 100).toFixed(3)}%
\`\`\`

### Iteration Checklist
- [ ] Colors match dominant palette (±15%)
- [ ] Brightness gradient: core is brightest
- [ ] Edge density indicates proper detail
- [ ] Effect contained within bounding box
- [ ] SSIM ≥0.85 against reference
`;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// === CLI ===
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
extract-baseline.mjs - Extract baseline metrics from reference images

Usage:
  node animations/shared/diff/extract-baseline.mjs --with <image> [--without <image>] --output <dir>

Options:
  --with <path>      Reference image WITH the effect (required)
  --without <path>   Reference image WITHOUT the effect (optional)
  --output <dir>     Output directory for baseline artifacts (required)
  --name <string>    Effect name (default: "effect")
  --help, -h         Show this help

Examples:
  # With both reference images (recommended):
  node animations/shared/diff/extract-baseline.mjs \\
    --with mockup_with_electricity.png \\
    --without mockup_without_electricity.png \\
    --output animations/electricity-portal/references/

  # With only the target image (estimates mask):
  node animations/shared/diff/extract-baseline.mjs \\
    --with mockup_with_electricity.png \\
    --output animations/electricity-portal/references/
`);
    process.exit(0);
  }

  const options = {
    refWithEffect: null,
    refWithoutEffect: null,
    outputDir: null,
    effectName: 'effect'
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--with':
        options.refWithEffect = path.resolve(args[++i]);
        break;
      case '--without':
        options.refWithoutEffect = path.resolve(args[++i]);
        break;
      case '--output':
        options.outputDir = path.resolve(args[++i]);
        break;
      case '--name':
        options.effectName = args[++i];
        break;
    }
  }

  if (!options.refWithEffect) {
    console.error('Error: --with <image> is required');
    process.exit(1);
  }

  if (!options.outputDir) {
    console.error('Error: --output <dir> is required');
    process.exit(1);
  }

  if (!fs.existsSync(options.refWithEffect)) {
    console.error(`Error: File not found: ${options.refWithEffect}`);
    process.exit(1);
  }

  if (options.refWithoutEffect && !fs.existsSync(options.refWithoutEffect)) {
    console.error(`Error: File not found: ${options.refWithoutEffect}`);
    process.exit(1);
  }

  try {
    await extractBaseline(options);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
