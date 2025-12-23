/**
 * video.mjs - Video recording for smooth animation capture
 *
 * Uses Puppeteer's screencast to record WebGL animations at high framerate.
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
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

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

// Apply circular transparency mask to an image
async function applyCircularMask(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const size = metadata.width;
  const radius = size / 2;

  // Create SVG circular mask
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/>
    </svg>`
  );

  await image
    .ensureAlpha()
    .composite([{
      input: mask,
      blend: 'dest-in'
    }])
    .png()
    .toFile(outputPath);
}

// CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    scenario: "electricity-portal",
    label: "video",
    mode: "newtopics",
    duration: 4000,      // Recording duration in ms
    settleMs: 500,       // Wait before trigger
    viewportWidth: 1440,
    viewportHeight: 768,
    fps: 30,             // Output framerate for extracted frames
    cropX: 475,
    cropY: 36,
    cropWidth: 465,
    cropHeight: 465,
    // Effect timing - SOURCE OF TRUTH: src/legacy/constants/config.ts → ELECTRICITY_CONFIG
    // Keep these in sync with captureWindowStartMs/captureWindowEndMs in config.ts
    effectStartMs: 975,     // ELECTRICITY_CONFIG.captureWindowStartMs
    effectEndMs: 2138,      // ELECTRICITY_CONFIG.captureWindowEndMs
    applyCircularMask: true, // Apply transparent circular mask
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const n = args[i+1];
    switch (a) {
      case "--scenario": opts.scenario = n; i++; break;
      case "--label": opts.label = n; i++; break;
      case "--mode": opts.mode = n; i++; break;
      case "--duration": opts.duration = parseInt(n, 10); i++; break;
      case "--settleMs": opts.settleMs = parseInt(n, 10); i++; break;
      case "--fps": opts.fps = parseInt(n, 10); i++; break;
      case "--effectStartMs": opts.effectStartMs = parseInt(n, 10); i++; break;
      case "--effectEndMs": opts.effectEndMs = parseInt(n, 10); i++; break;
      case "--no-mask": opts.applyCircularMask = false; break;
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

async function clickSelector(page, selectors) {
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el) {
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

async function main() {
  const opts = parseArgs();
  const baseUrl = await detectViteBaseUrl();

  const outputBase = `animations/${opts.scenario}/output/screenshots/timeline`;
  const timelineRoot = path.join(process.cwd(), outputBase, dateFolder());
  const outDir = path.join(timelineRoot, `${nowStamp()}__${opts.label}`);
  ensureDir(outDir);

  const videoPath = path.join(outDir, "recording.webm");
  const framesDir = path.join(outDir, "frames");
  const cropsDir = path.join(outDir, "crops");
  ensureDir(framesDir);
  ensureDir(cropsDir);

  console.log(`Output: ${outDir}`);

  // Launch browser
  const windowHeight = opts.viewportHeight + 80;
  const browser = await puppeteer.launch({
    headless: false,  // Must be non-headless for screencast
    args: [
      `--window-size=${opts.viewportWidth},${windowHeight}`,
      '--enable-webgl',
      '--enable-webgl2',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--force-device-scale-factor=1',
      '--high-dpi-support=1',
      '--autoplay-policy=no-user-gesture-required',
    ],
    defaultViewport: {
      width: opts.viewportWidth,
      height: opts.viewportHeight,
      deviceScaleFactor: 1,
    }
  });

  const page = await browser.newPage();

  // Navigate and wait
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  console.log('Page loaded');

  // Wait for UI
  try {
    await page.waitForSelector('.new-topics-btn, .wheel-container', { timeout: 10000 });
  } catch {
    console.warn('Warning: Main UI elements not found');
  }

  await sleep(opts.settleMs);

  // Start screencast recording
  const client = await page.target().createCDPSession();

  // Use Page.screencastFrame for recording
  const frames = [];
  let frameCount = 0;

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 90,
    maxWidth: opts.viewportWidth,
    maxHeight: opts.viewportHeight,
    everyNthFrame: 1,
  });

  let recording = true;
  let clickTime = null; // Will be set when we click

  client.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const receiveTime = Date.now();
    // frameTime is ms since click (negative if before click, positive after)
    const frameTime = clickTime ? receiveTime - clickTime : null;
    frames.push({ data, metadata, index: frameCount++, receiveTime, frameTime });
    if (recording) {
      try {
        await client.send('Page.screencastFrameAck', { sessionId });
      } catch (e) {
        // Ignore ack errors when recording has stopped
      }
    }
  });

  console.log('Recording started...');

  // Trigger the animation
  const selectors = {
    "newtopics": ['[data-testid="btn-new-topics"]', ".new-topics-btn"],
  };

  if (opts.mode === "newtopics") {
    clickTime = Date.now(); // Record exact click time
    await clickSelector(page, selectors.newtopics);
  }

  // Record for duration
  await sleep(opts.duration);

  // Stop recording
  recording = false;
  await client.send('Page.stopScreencast');
  console.log(`Recording stopped. Captured ${frames.length} frames`);

  await browser.close();

  // Save frames
  console.log('Saving frames...');
  for (const frame of frames) {
    const frameName = `frame_${String(frame.index).padStart(4, "0")}.jpg`;
    const buffer = Buffer.from(frame.data, 'base64');
    fs.writeFileSync(path.join(framesDir, frameName), buffer);
  }

  // Crop frames directly using sharp (preserves exact 465x465 dimensions)
  console.log('Cropping frames with sharp...');
  const frameFiles = fs.readdirSync(framesDir)
    .filter(f => f.startsWith('frame_') && f.endsWith('.jpg'))
    .sort();

  for (let i = 0; i < frameFiles.length; i++) {
    const srcPath = path.join(framesDir, frameFiles[i]);
    const dstPath = path.join(cropsDir, `frame_${String(i + 1).padStart(3, '0')}.png`);
    await sharp(srcPath)
      .extract({ left: opts.cropX, top: opts.cropY, width: opts.cropWidth, height: opts.cropHeight })
      .png()
      .toFile(dstPath);
  }
  console.log(`Cropped ${frameFiles.length} frames to ${opts.cropWidth}x${opts.cropHeight}`);

  // Get list of cropped frames
  const cropFrames = fs.readdirSync(cropsDir)
    .filter(f => f.startsWith('frame_') && f.endsWith('.png'))
    .sort();

  // Calculate actual FPS for APNG generation
  const actualFps = frames.length / (opts.duration / 1000);
  console.log(`Actual capture rate: ${actualFps.toFixed(2)} fps`);

  // Use TIMESTAMP-BASED trimming (more accurate than index-based)
  // frames[i] has frameTime = ms since click
  // cropFrames[i] corresponds to frames[i] (with 1-based naming)
  const effectFrameIndices = [];
  for (let i = 0; i < frames.length; i++) {
    const ft = frames[i].frameTime;
    if (ft !== null && ft >= opts.effectStartMs && ft <= opts.effectEndMs) {
      effectFrameIndices.push(i);
    }
  }

  // Map to cropped frame filenames (1-based: frames[0] -> frame_001.png)
  const effectFrames = effectFrameIndices.map(i => `frame_${String(i + 1).padStart(3, '0')}.png`);

  // Create masked frames directory
  const maskedDir = path.join(outDir, 'masked');
  ensureDir(maskedDir);

  // Log timing info
  const firstEffectFrame = effectFrameIndices.length > 0 ? frames[effectFrameIndices[0]] : null;
  const lastEffectFrame = effectFrameIndices.length > 0 ? frames[effectFrameIndices[effectFrameIndices.length - 1]] : null;
  console.log(`Effect timing window: ${opts.effectStartMs}ms - ${opts.effectEndMs}ms`);
  console.log(`Timestamp-based trimming: ${effectFrames.length} frames`);
  if (firstEffectFrame && lastEffectFrame) {
    console.log(`  First effect frame: ${firstEffectFrame.frameTime}ms (index ${effectFrameIndices[0]})`);
    console.log(`  Last effect frame: ${lastEffectFrame.frameTime}ms (index ${effectFrameIndices[effectFrameIndices.length - 1]})`);
  }

  if (opts.applyCircularMask) {
    console.log('Applying circular transparency mask...');
    for (let i = 0; i < effectFrames.length; i++) {
      const srcPath = path.join(cropsDir, effectFrames[i]);
      const dstPath = path.join(maskedDir, `frame_${String(i).padStart(3, '0')}.png`);
      await applyCircularMask(srcPath, dstPath);
      if ((i + 1) % 20 === 0 || i === effectFrames.length - 1) {
        console.log(`  Masked ${i + 1}/${effectFrames.length} frames`);
      }
    }
  } else {
    // Just copy trimmed frames without masking
    for (let i = 0; i < effectFrames.length; i++) {
      const srcPath = path.join(cropsDir, effectFrames[i]);
      const dstPath = path.join(maskedDir, `frame_${String(i).padStart(3, '0')}.png`);
      fs.copyFileSync(srcPath, dstPath);
    }
  }

  // Create animated PNG from masked/trimmed frames at actual capture rate
  const ffmpegApng = spawn('ffmpeg', [
    '-y',
    '-framerate', String(actualFps.toFixed(2)),
    '-i', path.join(maskedDir, 'frame_%03d.png'),
    '-plays', '0',
    '-f', 'apng',
    path.join(outDir, 'animation.apng')
  ]);

  await new Promise((resolve, reject) => {
    ffmpegApng.on('close', resolve);
    ffmpegApng.on('error', reject);
  });

  const apngSize = fs.statSync(path.join(outDir, 'animation.apng')).size;
  const apngDuration = effectFrames.length / actualFps;

  // Save frame timing metadata for debugging
  const timingMeta = {
    captureParams: {
      duration: opts.duration,
      effectStartMs: opts.effectStartMs,
      effectEndMs: opts.effectEndMs,
      settleMs: opts.settleMs,
    },
    results: {
      totalFrames: frames.length,
      actualFps: actualFps,
      effectFrameCount: effectFrames.length,
      firstEffectFrameTime: firstEffectFrame?.frameTime ?? null,
      lastEffectFrameTime: lastEffectFrame?.frameTime ?? null,
    },
    frameTimings: frames.map(f => ({
      index: f.index,
      frameTime: f.frameTime,
      inEffectWindow: f.frameTime !== null && f.frameTime >= opts.effectStartMs && f.frameTime <= opts.effectEndMs,
    })),
  };
  fs.writeFileSync(path.join(outDir, 'frame_timing.json'), JSON.stringify(timingMeta, null, 2));

  console.log(`\n✅ VIDEO CAPTURE COMPLETE`);
  console.log(`Total frames captured: ${frames.length}`);
  console.log(`Effect frames used: ${effectFrames.length} (timestamp-based trimming)`);
  console.log(`Circular mask: ${opts.applyCircularMask ? 'applied' : 'not applied'}`);
  console.log(`Output directory: ${outDir}`);
  console.log(`Animated PNG: animation.apng (${(apngSize / 1024 / 1024).toFixed(2)} MB, ${apngDuration.toFixed(2)}s @ ${actualFps.toFixed(2)}fps)`);
  console.log(`Frame timing metadata: frame_timing.json`);
}

main().catch((e) => {
  console.error("❌ VIDEO CAPTURE FAILED:", e?.message || e);
  process.exit(1);
});
