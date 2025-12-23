/**
 * benchmark-formats.mjs - Compare JPEG vs PNG capture quality and performance
 *
 * Runs the same capture with different format settings and outputs metrics.
 *
 * Usage:
 *   node animations/shared/capture/benchmark-formats.mjs
 *
 * Prerequisites:
 *   - pnpm dev running on localhost:5173
 */

import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

// Load scenario.json configuration
// SOURCE OF TRUTH: animations/{scenario}/scenario.json
function loadScenarioConfig(scenarioName) {
  const scenarioPath = path.join(process.cwd(), 'animations', scenarioName, 'scenario.json');
  if (!fs.existsSync(scenarioPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(scenarioPath, 'utf-8'));
  } catch {
    return null;
  }
}

async function detectViteBaseUrl() {
  for (let port = 5173; port <= 5185; port++) {
    const url = `http://localhost:${port}`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const html = await res.text();
      if (html.includes("/@vite/client")) return url;
    } catch {}
  }
  throw new Error("No Vite dev server detected. Start with: pnpm dev");
}

// Load config from scenario.json (source of truth)
// Falls back to defaults if scenario.json not found
const scenarioName = process.argv.includes('--scenario')
  ? process.argv[process.argv.indexOf('--scenario') + 1]
  : 'electricity-portal';

const scenario = loadScenarioConfig(scenarioName);
const cap = scenario?.capture || {};

// Test configuration - scenario values with fallback defaults
const CONFIG = {
  duration: cap.duration || 4000,
  settleMs: cap.settleMs || 500,
  viewportWidth: cap.viewport?.width || 1440,
  viewportHeight: cap.viewport?.height || 768,
  triggerSelector: '[data-testid="btn-new-topics"], .new-topics-btn',
  variants: [
    { format: 'jpeg', quality: 90,  label: 'jpeg-q90' },
    { format: 'jpeg', quality: 100, label: 'jpeg-q100' },
    { format: 'png',  quality: 100, label: 'png' },
  ]
};

if (scenario) {
  console.log(`Config loaded from: animations/${scenarioName}/scenario.json`);
}

async function runCapture(baseUrl, variant, outputDir) {
  const variantDir = path.join(outputDir, variant.label);
  const framesDir = path.join(variantDir, 'frames');
  ensureDir(framesDir);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`VARIANT: ${variant.label} (format=${variant.format}, quality=${variant.quality})`);
  console.log('='.repeat(60));

  const windowHeight = CONFIG.viewportHeight + 80;
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--window-size=${CONFIG.viewportWidth},${windowHeight}`,
      '--enable-webgl',
      '--enable-webgl2',
      '--ignore-gpu-blocklist',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--force-device-scale-factor=1',
    ],
    defaultViewport: {
      width: CONFIG.viewportWidth,
      height: CONFIG.viewportHeight,
      deviceScaleFactor: 1,
    }
  });

  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  try {
    await page.waitForSelector(CONFIG.triggerSelector, { timeout: 10000 });
  } catch {
    console.warn('Warning: Trigger selector not found');
  }

  await sleep(CONFIG.settleMs);

  // Start screencast
  const client = await page.target().createCDPSession();
  const frames = [];
  let frameCount = 0;

  const captureStartTime = Date.now();

  await client.send('Page.startScreencast', {
    format: variant.format,
    quality: variant.quality,
    maxWidth: CONFIG.viewportWidth,
    maxHeight: CONFIG.viewportHeight,
    everyNthFrame: 1,
  });

  let recording = true;
  client.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const receiveTime = Date.now();
    frames.push({
      data,
      metadata,
      index: frameCount++,
      receiveTime,
      relativeTime: receiveTime - captureStartTime,
    });
    if (recording) {
      try {
        await client.send('Page.screencastFrameAck', { sessionId });
      } catch {}
    }
  });

  console.log('Recording started...');

  // Trigger animation
  try {
    await page.click(CONFIG.triggerSelector);
    console.log('Triggered animation');
  } catch (e) {
    console.warn('Click failed:', e.message);
  }

  await sleep(CONFIG.duration);

  recording = false;
  await client.send('Page.stopScreencast');
  const captureEndTime = Date.now();

  await browser.close();

  // Save frames and collect metrics
  console.log('Saving frames...');
  let totalSize = 0;
  const frameSizes = [];
  const frameTimings = [];

  for (const frame of frames) {
    const ext = variant.format === 'png' ? 'png' : 'jpg';
    const frameName = `frame_${String(frame.index).padStart(4, "0")}.${ext}`;
    const buffer = Buffer.from(frame.data, 'base64');
    fs.writeFileSync(path.join(framesDir, frameName), buffer);

    totalSize += buffer.length;
    frameSizes.push(buffer.length);
    frameTimings.push(frame.relativeTime);
  }

  // Calculate timing gaps
  const timingGaps = [];
  for (let i = 1; i < frameTimings.length; i++) {
    timingGaps.push(frameTimings[i] - frameTimings[i - 1]);
  }

  // Calculate metrics
  const metrics = {
    variant: variant.label,
    format: variant.format,
    quality: variant.quality,

    // Frame counts
    frameCount: frames.length,
    expectedFrames: Math.round(CONFIG.duration / 1000 * 30), // Assuming 30fps target
    frameDropRate: 0,

    // FPS
    actualFps: frames.length / (CONFIG.duration / 1000),

    // Timing
    captureWallTime: captureEndTime - captureStartTime,
    avgTimingGap: timingGaps.length > 0 ? timingGaps.reduce((a, b) => a + b, 0) / timingGaps.length : 0,
    maxTimingGap: timingGaps.length > 0 ? Math.max(...timingGaps) : 0,
    minTimingGap: timingGaps.length > 0 ? Math.min(...timingGaps) : 0,

    // Size
    totalSizeBytes: totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    avgFrameSizeKB: (totalSize / frames.length / 1024).toFixed(2),
    minFrameSizeKB: (Math.min(...frameSizes) / 1024).toFixed(2),
    maxFrameSizeKB: (Math.max(...frameSizes) / 1024).toFixed(2),
  };

  // Calculate frame drop rate (gaps > 50ms suggest dropped frames at 30fps)
  const droppedFrameGaps = timingGaps.filter(gap => gap > 50);
  metrics.frameDropRate = ((droppedFrameGaps.length / timingGaps.length) * 100).toFixed(2);

  // Save metrics
  fs.writeFileSync(
    path.join(variantDir, 'metrics.json'),
    JSON.stringify(metrics, null, 2)
  );

  return metrics;
}

function printComparisonTable(results) {
  console.log('\n' + '='.repeat(80));
  console.log('BENCHMARK RESULTS COMPARISON');
  console.log('='.repeat(80));

  const headers = ['Metric', ...results.map(r => r.variant)];
  const rows = [
    ['Frame Count', ...results.map(r => r.frameCount)],
    ['Actual FPS', ...results.map(r => r.actualFps.toFixed(2))],
    ['Frame Drop Rate %', ...results.map(r => r.frameDropRate + '%')],
    ['Avg Timing Gap (ms)', ...results.map(r => r.avgTimingGap.toFixed(1))],
    ['Max Timing Gap (ms)', ...results.map(r => r.maxTimingGap.toFixed(1))],
    ['Total Size (MB)', ...results.map(r => r.totalSizeMB)],
    ['Avg Frame Size (KB)', ...results.map(r => r.avgFrameSizeKB)],
    ['Capture Wall Time (ms)', ...results.map(r => r.captureWallTime)],
  ];

  // Print table
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => String(r[i]).length)) + 2
  );

  const printRow = (row) => {
    console.log(row.map((cell, i) => String(cell).padEnd(colWidths[i])).join('| '));
  };

  printRow(headers);
  console.log(colWidths.map(w => '-'.repeat(w)).join('+-'));
  rows.forEach(printRow);

  // Print pass/fail assessment
  console.log('\n' + '-'.repeat(80));
  console.log('ASSESSMENT (thresholds: frame drop < 5%, max gap < 100ms, fps > 25)');
  console.log('-'.repeat(80));

  for (const r of results) {
    const dropPass = parseFloat(r.frameDropRate) < 5;
    const gapPass = r.maxTimingGap < 100;
    const fpsPass = r.actualFps > 25;
    const allPass = dropPass && gapPass && fpsPass;

    console.log(`${r.variant}:`);
    console.log(`  Frame Drop: ${dropPass ? '✅ PASS' : '❌ FAIL'} (${r.frameDropRate}%)`);
    console.log(`  Max Gap:    ${gapPass ? '✅ PASS' : '❌ FAIL'} (${r.maxTimingGap.toFixed(1)}ms)`);
    console.log(`  FPS:        ${fpsPass ? '✅ PASS' : '❌ FAIL'} (${r.actualFps.toFixed(2)})`);
    console.log(`  Overall:    ${allPass ? '✅ VIABLE' : '❌ NOT VIABLE'}`);
  }
}

async function main() {
  console.log('FORMAT CAPTURE BENCHMARK');
  console.log('========================\n');
  console.log('This test compares JPEG q90, JPEG q100, and PNG capture formats.');
  console.log('Each variant will capture a 4-second animation.\n');

  const baseUrl = await detectViteBaseUrl();
  console.log(`Using dev server: ${baseUrl}`);

  const outputDir = path.join(
    process.cwd(),
    'animations/electricity-portal/output/benchmarks',
    nowStamp()
  );
  ensureDir(outputDir);
  console.log(`Output directory: ${outputDir}`);

  const results = [];

  for (const variant of CONFIG.variants) {
    const metrics = await runCapture(baseUrl, variant, outputDir);
    results.push(metrics);

    // Brief pause between captures
    await sleep(2000);
  }

  // Save combined results
  fs.writeFileSync(
    path.join(outputDir, 'benchmark-results.json'),
    JSON.stringify(results, null, 2)
  );

  printComparisonTable(results);

  console.log(`\nFull results saved to: ${outputDir}/benchmark-results.json`);
}

main().catch((e) => {
  console.error("❌ BENCHMARK FAILED:", e?.message || e);
  process.exit(1);
});
