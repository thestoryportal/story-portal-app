/**
 * run.mjs - Puppeteer-based capture pipeline for Story Portal
 *
 * Uses Puppeteer instead of Playwright for better WebGL rendering support.
 */

import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import puppeteer from "puppeteer";
import sharp from "sharp";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function dateFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

// Load scenario config from JSON file
function loadScenario(scenarioName) {
  const scenarioPath = path.join(process.cwd(), "Animations", scenarioName, "scenario.json");
  if (!fs.existsSync(scenarioPath)) {
    throw new Error(`Scenario file not found: ${scenarioPath}`);
  }
  return JSON.parse(fs.readFileSync(scenarioPath, "utf-8"));
}

// CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    scenario: null,   // Load config from scenario file
    label: "capture",
    mode: "smoke",
    headless: true,
    burstFrames: 30,
    burstIntervalMs: 100,
    settleMs: 500,
    viewportWidth: 1280,
    viewportHeight: 800,
    deviceScaleFactor: 2,
    // Crop options (portal-focused capture)
    crop: false,
    cropX: null,      // Auto-calculate if null
    cropY: null,      // Auto-calculate if null
    cropWidth: 500,   // Width of crop region
    cropHeight: 500,  // Height of crop region
    circularMask: false,
    keepFull: false,  // Keep full-page screenshots in addition to crops
  };

  // First pass: check for --scenario to load base config
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--scenario" && args[i+1]) {
      opts.scenario = args[i+1];
      const scenario = loadScenario(opts.scenario);
      const cap = scenario.capture || {};

      // Apply scenario config as defaults
      if (cap.mode) opts.mode = cap.mode;
      if (cap.headless !== undefined) opts.headless = cap.headless;
      if (cap.burstFrames) opts.burstFrames = cap.burstFrames;
      if (cap.burstIntervalMs) opts.burstIntervalMs = cap.burstIntervalMs;
      if (cap.settleMs) opts.settleMs = cap.settleMs;
      if (cap.viewport?.width) opts.viewportWidth = cap.viewport.width;
      if (cap.viewport?.height) opts.viewportHeight = cap.viewport.height;

      // Apply crop config from scenario
      if (cap.crop) {
        opts.crop = true;
        opts.cropX = cap.crop.x;
        opts.cropY = cap.crop.y;
        opts.cropWidth = cap.crop.width;
        opts.cropHeight = cap.crop.height || cap.crop.width;
        opts.circularMask = cap.crop.circularMask || false;
      }

      // Use scenario name as label default
      opts.label = opts.scenario;
      break;
    }
  }

  // Second pass: CLI args override scenario config
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const n = args[i+1];
    switch (a) {
      case "--scenario": i++; break; // Already handled
      case "--label": opts.label = n; i++; break;
      case "--mode": opts.mode = n; i++; break;
      case "--headless": opts.headless = (n === "1" || n === "true" || n === undefined); i++; break;
      case "--burstFrames": opts.burstFrames = parseInt(n, 10); i++; break;
      case "--burstIntervalMs": opts.burstIntervalMs = parseInt(n, 10); i++; break;
      case "--settleMs": opts.settleMs = parseInt(n, 10); i++; break;
      case "--viewportWidth": opts.viewportWidth = parseInt(n, 10); i++; break;
      case "--viewportHeight": opts.viewportHeight = parseInt(n, 10); i++; break;
      case "--scale": opts.deviceScaleFactor = parseInt(n, 10); i++; break;
      case "--crop": opts.crop = true; break;
      case "--no-crop": opts.crop = false; break;
      case "--cropX": opts.cropX = parseInt(n, 10); i++; break;
      case "--cropY": opts.cropY = parseInt(n, 10); i++; break;
      case "--cropWidth": opts.cropWidth = parseInt(n, 10); i++; break;
      case "--cropHeight": opts.cropHeight = parseInt(n, 10); i++; break;
      case "--cropSize": opts.cropWidth = opts.cropHeight = parseInt(n, 10); i++; break;
      case "--circularMask": opts.circularMask = true; break;
      case "--keepFull": opts.keepFull = true; break;
    }
  }
  return opts;
}

async function detectViteBaseUrl() {
  if (process.env.BASE_URL) return process.env.BASE_URL;

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
  throw new Error("No Vite dev server detected on ports 5173-5185. Start Vite first.");
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

async function clickSelector(page, selectors) {
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        // Dispatch mousedown event directly via JavaScript
        const clicked = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            const event = new MouseEvent('mousedown', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            element.dispatchEvent(event);
            return true;
          }
          return false;
        }, sel);

        if (clicked) {
          console.log(`Clicked: ${sel}`);
          return true;
        }
      }
    } catch (e) {
      console.log(`Click error: ${e.message}`);
    }
  }
  return false;
}

async function maybeClickForMode(page, mode) {
  const selectors = {
    "newtopics": ['[data-testid="btn-new-topics"]', ".new-topics-btn"],
    "menu-open": ['[data-testid="btn-menu"]', ".hamburger-menu-button"],
    "menu-close": ['[data-testid="btn-menu"]', ".hamburger-menu-button"],
  };

  if (mode === "smoke") return;

  if (mode === "newtopics" || mode === "electricity") {
    if (!await clickSelector(page, selectors.newtopics)) {
      throw new Error("Could not find New Topics button");
    }
    return;
  }

  if (mode === "menu-open") {
    if (!await clickSelector(page, selectors["menu-open"])) {
      throw new Error("Could not find menu button");
    }
    return;
  }

  if (mode === "menu-close") {
    if (!await clickSelector(page, selectors["menu-open"])) {
      throw new Error("Could not find menu button");
    }
    await sleep(650);
    await clickSelector(page, selectors["menu-open"]);
    return;
  }
}

// Create circular mask for cropped images
async function applyCircularMask(buffer, width, height) {
  const radius = Math.min(width, height) / 2;
  const cx = width / 2;
  const cy = height / 2;

  // Create SVG circle mask
  const mask = Buffer.from(
    `<svg width="${width}" height="${height}">
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="white"/>
    </svg>`
  );

  return sharp(buffer)
    .composite([{
      input: mask,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();
}

async function burstScreenshots(page, outDir, frames, intervalMs, cropOpts = null, scaleFactor = 1) {
  const buffers = [];
  const startTime = Date.now();

  console.log(`Capturing ${frames} frames...`);

  // Get CDP session for direct screenshot API
  const client = await page.target().createCDPSession();

  for (let i = 0; i < frames; i++) {
    // Capture page screenshot
    const { data: pageData } = await client.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 90,
      fromSurface: true,
      captureBeyondViewport: false,
    });
    let buffer = Buffer.from(pageData, 'base64');

    // Try to extract WebGL canvas content and composite it
    const canvasData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      // Get canvas position relative to viewport
      const rect = canvas.getBoundingClientRect();

      // Get canvas content as data URL
      try {
        const dataUrl = canvas.toDataURL('image/png');
        return {
          dataUrl,
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    // Debug canvas extraction
    if (i === 0) {
      if (!canvasData) {
        console.log('Canvas extraction: no canvas found');
      } else if (canvasData.error) {
        console.log(`Canvas extraction error: ${canvasData.error}`);
      } else {
        console.log(`Canvas extracted: ${canvasData.width}x${canvasData.height} at (${canvasData.x}, ${canvasData.y})`);
        console.log(`Canvas dataUrl length: ${canvasData.dataUrl?.length || 0}`);
      }
    }

    // If we got canvas data, composite it onto the page screenshot
    if (canvasData && canvasData.dataUrl && !canvasData.error) {
      try {
        const canvasBuffer = Buffer.from(canvasData.dataUrl.split(',')[1], 'base64');

        // Save the raw canvas content for debugging (first frame only)
        if (i === 0) {
          const debugPath = path.join(outDir, 'debug_canvas.png');
          fs.writeFileSync(debugPath, canvasBuffer);
          console.log(`Saved canvas debug to: ${debugPath}`);
        }

        // Process canvas: make near-white pixels transparent
        // The bloom effect creates white halos that should be transparent
        const { data: rawData, info } = await sharp(canvasBuffer)
          .resize(canvasData.width, canvasData.height)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });

        // Make white/light-grey background transparent, keep colored electricity
        for (let px = 0; px < rawData.length; px += 4) {
          const r = rawData[px];
          const g = rawData[px + 1];
          const b = rawData[px + 2];

          // Check if this is a "grey" pixel (R, G, B all similar)
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const range = max - min;

          // If low color range (grey/white) and bright, make transparent
          if (range < 30 && min > 200) {
            // Near-white/light-grey: fully transparent
            rawData[px + 3] = 0;
          } else if (range < 40 && min > 180) {
            // Medium grey: partially transparent
            const opacity = Math.round((200 - min) / 20 * 255);
            rawData[px + 3] = Math.max(0, Math.min(255, opacity));
          }
          // Colored pixels (electricity) stay opaque
        }

        const processedCanvas = await sharp(rawData, {
          raw: { width: info.width, height: info.height, channels: 4 }
        }).png().toBuffer();

        // Debug: save processed canvas (first frame only)
        if (i === 0) {
          const processedPath = path.join(outDir, 'debug_processed.png');
          fs.writeFileSync(processedPath, processedCanvas);
          console.log(`Saved processed canvas to: ${processedPath}`);
        }

        buffer = await sharp(buffer)
          .composite([{
            input: processedCanvas,
            left: canvasData.x,
            top: canvasData.y,
            blend: 'over',
          }])
          .toBuffer();
        if (i === 0) {
          console.log(`Composited WebGL canvas at (${canvasData.x}, ${canvasData.y}) ${canvasData.width}x${canvasData.height}`);
        }
      } catch (e) {
        if (i === 0) console.log(`Canvas composite failed: ${e.message}`);
      }
    }

    buffers.push({ index: i, buffer, time: Date.now() - startTime, usedCDP: true });
    await sleep(intervalMs);
  }

  console.log(`Writing ${buffers.length} frames to disk...`);

  // Calculate crop region if needed
  let cropRegion = null;
  if (cropOpts?.crop && buffers.length > 0) {
    const meta = await sharp(buffers[0].buffer).metadata();

    // Determine scale factor based on actual image size vs expected viewport
    // CDP screenshots are at viewport size, Puppeteer screenshots are scaled
    const usedCDP = buffers[0].usedCDP;
    const effectiveScale = usedCDP ? 1 : scaleFactor;

    // Scale crop dimensions by effective scale factor
    const width = Math.round(cropOpts.cropWidth * effectiveScale);
    const height = Math.round(cropOpts.cropHeight * effectiveScale);
    const x = cropOpts.cropX != null
      ? Math.round(cropOpts.cropX * effectiveScale)
      : Math.floor((meta.width - width) / 2);
    const y = cropOpts.cropY != null
      ? Math.round(cropOpts.cropY * effectiveScale)
      : Math.floor((meta.height - height) / 2);

    // Ensure crop region is within image bounds
    const clampedWidth = Math.min(width, meta.width - x);
    const clampedHeight = Math.min(height, meta.height - y);
    cropRegion = {
      left: Math.max(0, Math.min(x, meta.width - 1)),
      top: Math.max(0, Math.min(y, meta.height - 1)),
      width: Math.max(1, clampedWidth),
      height: Math.max(1, clampedHeight)
    };

    console.log(`Screenshot size: ${meta.width}x${meta.height}, effective scale: ${effectiveScale}`);
    console.log(`Cropping to portal region: ${cropRegion.width}x${cropRegion.height} at (${cropRegion.left}, ${cropRegion.top})`);
    if (cropOpts.circularMask) {
      console.log(`Applying circular mask`);
    }
  }

  // Create crops subdirectory if cropping
  const cropsDir = cropRegion ? path.join(outDir, 'crops') : null;
  if (cropsDir) ensureDir(cropsDir);

  for (const { index, buffer } of buffers) {
    const frameName = `frame_${String(index).padStart(3,"0")}.png`;

    if (cropRegion) {
      // Crop the image
      let croppedBuffer = await sharp(buffer)
        .extract(cropRegion)
        .toBuffer();

      // Apply circular mask if requested
      if (cropOpts?.circularMask) {
        croppedBuffer = await applyCircularMask(croppedBuffer, cropRegion.width, cropRegion.height);
      }

      fs.writeFileSync(path.join(cropsDir, frameName), croppedBuffer);

      // Optionally save full version too
      if (cropOpts?.keepFull) {
        ensureDir(path.join(outDir, 'full'));
        fs.writeFileSync(path.join(outDir, 'full', frameName), buffer);
      }
    } else {
      // No cropping - save full frame
      fs.writeFileSync(path.join(outDir, frameName), buffer);
    }
  }

  // Save timing metadata
  fs.writeFileSync(
    path.join(outDir, "frame_timing.json"),
    JSON.stringify(buffers.map(b => ({ frame: b.index, captureTime: b.time })), null, 2)
  );

  const actualFps = frames / ((buffers[buffers.length-1]?.time || 1) / 1000);
  console.log(`Frames written. Actual capture rate: ${actualFps.toFixed(1)} fps`);

  return { cropRegion };
}

async function main() {
  const opts = parseArgs();
  const baseUrl = await detectViteBaseUrl();

  // Use per-scenario output directory (scenario required for structured output)
  if (!opts.scenario) {
    console.warn('Warning: No --scenario specified. Output will go to electricity-portal by default.');
    opts.scenario = 'electricity-portal';
  }
  const outputBase = `animations/${opts.scenario}/output/screenshots/timeline`;
  const timelineRoot = path.join(process.cwd(), outputBase, dateFolder());
  const outDir = path.join(timelineRoot, `${nowStamp()}__${opts.label}`);
  ensureDir(outDir);

  const meta = {
    ts: new Date().toISOString(),
    baseUrl,
    scenario: opts.scenario,
    mode: opts.mode,
    label: opts.label,
    headless: opts.headless,
    burstFrames: opts.burstFrames,
    burstIntervalMs: opts.burstIntervalMs,
    settleMs: opts.settleMs,
    viewport: { width: opts.viewportWidth, height: opts.viewportHeight, scale: opts.deviceScaleFactor },
  };

  // Launch Puppeteer (better WebGL support than Playwright)
  // Account for browser chrome (title bar ~80px on macOS)
  const windowHeight = opts.viewportHeight + 80;

  const browser = await puppeteer.launch({
    headless: opts.headless ? 'new' : false,
    args: [
      // Window size must account for browser chrome to get correct viewport
      `--window-size=${opts.viewportWidth},${windowHeight}`,
      // WebGL config for macOS
      '--enable-webgl',
      '--enable-webgl2',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--force-device-scale-factor=1',
      '--high-dpi-support=1',
    ],
    defaultViewport: {
      width: opts.viewportWidth,
      height: opts.viewportHeight,
      deviceScaleFactor: opts.deviceScaleFactor,
    }
  });

  const page = await browser.newPage();

  // Log console messages
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[PAGE ${type.toUpperCase()}]`, msg.text());
    }
  });

  // Log page errors
  page.on('pageerror', err => {
    console.log('[PAGE EXCEPTION]', err.message);
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  console.log('Page loaded');

  // Ensure page is considered "visible" for requestAnimationFrame
  await page.evaluate(() => {
    // Override visibility to ensure animations run
    Object.defineProperty(document, 'hidden', { value: false, writable: true });
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
  });

  // Wait for UI to be ready
  try {
    await page.waitForSelector('.new-topics-btn, .wheel-container', { timeout: 10000 });
  } catch {
    console.warn('Warning: Main UI elements not found, continuing anyway...');
  }

  // Wait for layout to stabilize
  await sleep(opts.settleMs);

  // Click for mode
  await maybeClickForMode(page, opts.mode);

  // Wait for React to mount canvas/effects after click
  if (opts.mode === 'newtopics' || opts.mode === 'electricity') {
    console.log('Waiting for electricity effect...');
    // Wait for effect to initialize and start animating
    await sleep(800);
  } else {
    await sleep(200);
  }

  // Capture frames (with optional cropping)
  const cropOpts = {
    crop: opts.crop,
    cropX: opts.cropX,
    cropY: opts.cropY,
    cropWidth: opts.cropWidth,
    cropHeight: opts.cropHeight,
    circularMask: opts.circularMask,
    keepFull: opts.keepFull,
  };
  const { cropRegion } = await burstScreenshots(page, outDir, opts.burstFrames, opts.burstIntervalMs, cropOpts, opts.deviceScaleFactor);

  await browser.close();

  meta.outDir = outDir;
  meta.crop = cropRegion;
  fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

  console.log("✅ CAPTURE COMPLETE");
  console.log("outDir:", outDir);
  if (cropRegion) {
    console.log("crops:", path.join(outDir, 'crops'));
  }
}

main().catch((e) => {
  console.error("❌ CAPTURE FAILED:", e?.message || e);
  process.exit(1);
});
