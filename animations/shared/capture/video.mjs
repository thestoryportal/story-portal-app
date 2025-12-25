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

// Apply golden mask from file to an image
// Supports two mask formats:
// 1. Binary: white circle on black (white=keep, black=hide) - use grayscale as alpha
// 2. Alpha: transparent center, opaque edges - invert alpha channel
async function applyGoldenMask(inputPath, outputPath, goldenMaskPath) {
  if (!fs.existsSync(goldenMaskPath)) {
    throw new Error(`Golden mask not found: ${goldenMaskPath}`);
  }

  const imageMeta = await sharp(inputPath).metadata();

  // Determine mask type by sampling alpha at center and corner
  // Binary mask: RGB varies (white center, black edges), alpha constant (255)
  // Alpha mask: RGB constant (black), alpha varies (0 center, >0 edges)
  const { data: maskData, info: maskInfo } = await sharp(goldenMaskPath).raw().toBuffer({ resolveWithObject: true });
  const centerIdx = (232 * maskInfo.width + 232) * maskInfo.channels;
  const cornerIdx = 0;

  const centerAlpha = maskInfo.channels === 4 ? maskData[centerIdx + 3] : 255;
  const cornerAlpha = maskInfo.channels === 4 ? maskData[cornerIdx + 3] : 255;
  const centerGray = (maskData[centerIdx] + maskData[centerIdx + 1] + maskData[centerIdx + 2]) / 3;
  const cornerGray = (maskData[cornerIdx] + maskData[cornerIdx + 1] + maskData[cornerIdx + 2]) / 3;

  // If alpha varies significantly, use alpha mask logic; otherwise use grayscale
  const alphaVaries = Math.abs(centerAlpha - cornerAlpha) > 50;
  const isBinaryMask = !alphaVaries && Math.abs(centerGray - cornerGray) > 100;

  let alphaBuffer;

  if (isBinaryMask) {
    // Binary mask: white=keep (255), black=hide (0)
    alphaBuffer = await sharp(goldenMaskPath)
      .resize(imageMeta.width, imageMeta.height)
      .grayscale()
      .raw()
      .toBuffer();
  } else {
    // Alpha mask: transparent center (alpha=0) = keep, opaque edges (alpha>0) = hide
    alphaBuffer = await sharp(goldenMaskPath)
      .resize(imageMeta.width, imageMeta.height)
      .extractChannel('alpha')
      .negate()
      .raw()
      .toBuffer();
  }

  // Read input as raw RGBA
  const inputBuffer = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer();

  // Combine: set pixels outside mask to BLACK (not transparent)
  // Diff tools expect black background outside mask region
  const outputBuffer = Buffer.alloc(imageMeta.width * imageMeta.height * 4);
  for (let i = 0; i < imageMeta.width * imageMeta.height; i++) {
    const maskValue = alphaBuffer[i];
    if (maskValue > 128) {
      // Inside mask: keep original RGB, full alpha
      outputBuffer[i * 4 + 0] = inputBuffer[i * 4 + 0]; // R
      outputBuffer[i * 4 + 1] = inputBuffer[i * 4 + 1]; // G
      outputBuffer[i * 4 + 2] = inputBuffer[i * 4 + 2]; // B
      outputBuffer[i * 4 + 3] = 255;                     // Full alpha
    } else {
      // Outside mask: black pixel (not transparent)
      outputBuffer[i * 4 + 0] = 0;   // R = 0
      outputBuffer[i * 4 + 1] = 0;   // G = 0
      outputBuffer[i * 4 + 2] = 0;   // B = 0
      outputBuffer[i * 4 + 3] = 255; // Full alpha (opaque black)
    }
  }

  await sharp(outputBuffer, {
    raw: { width: imageMeta.width, height: imageMeta.height, channels: 4 }
  })
    .png()
    .toFile(outputPath);
}

// Load scenario.json configuration
// SOURCE OF TRUTH: animations/{scenario}/scenario.json
// CLI args override scenario values
function loadScenarioConfig(scenarioName) {
  const scenarioPath = path.join(process.cwd(), 'animations', scenarioName, 'scenario.json');
  if (!fs.existsSync(scenarioPath)) {
    console.warn(`Warning: scenario.json not found at ${scenarioPath}, using fallback defaults`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(scenarioPath, 'utf-8'));
  } catch (e) {
    console.warn(`Warning: Failed to parse scenario.json: ${e.message}`);
    return null;
  }
}

// CLI args
function parseArgs() {
  const args = process.argv.slice(2);

  // First pass: get scenario name
  let scenarioName = "electricity-portal";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--scenario" && args[i+1]) {
      scenarioName = args[i+1];
      break;
    }
  }

  // Load scenario.json as source of truth
  const scenario = loadScenarioConfig(scenarioName);
  const cap = scenario?.capture || {};

  // Build options: scenario.json values → fallback defaults → CLI overrides
  const opts = {
    scenario: scenarioName,
    label: "video",
    mode: cap.mode || "newtopics",
    duration: cap.duration || 4000,
    settleMs: cap.settleMs || 500,
    viewportWidth: cap.viewport?.width || 1440,
    viewportHeight: cap.viewport?.height || 768,
    fps: cap.videoFps || cap.fps || 30,
    cropX: cap.crop?.x || 482,
    cropY: cap.crop?.y || 39,
    cropWidth: cap.crop?.width || 465,
    cropHeight: cap.crop?.height || 465,
    // Effect timing from scenario.json (source of truth)
    // Calibrated 2025-12-24: 1200-2000ms is peak-only window
    effectStartMs: cap.effectTiming?.startMs || 1200,
    effectEndMs: cap.effectTiming?.endMs || 2000,
    targetFrameCount: cap.effectTiming?.targetFrameCount || null,
    loopToMatch: cap.effectTiming?.loopToMatch || false,
    applyMask: cap.crop?.circularMask !== false,
    // Golden mask path from scenario.json - use capture mask for live frames
    goldenMaskPath: scenario?.reference?.maskCapture || scenario?.reference?.mask || null,
  };

  // Second pass: apply CLI overrides
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const n = args[i+1];
    switch (a) {
      case "--scenario": i++; break; // Already processed
      case "--label": opts.label = n; i++; break;
      case "--mode": opts.mode = n; i++; break;
      case "--duration": opts.duration = parseInt(n, 10); i++; break;
      case "--settleMs": opts.settleMs = parseInt(n, 10); i++; break;
      case "--fps": opts.fps = parseInt(n, 10); i++; break;
      case "--viewportWidth": opts.viewportWidth = parseInt(n, 10); i++; break;
      case "--viewportHeight": opts.viewportHeight = parseInt(n, 10); i++; break;
      case "--cropX": opts.cropX = parseInt(n, 10); i++; break;
      case "--cropY": opts.cropY = parseInt(n, 10); i++; break;
      case "--cropWidth": opts.cropWidth = parseInt(n, 10); i++; break;
      case "--cropHeight": opts.cropHeight = parseInt(n, 10); i++; break;
      case "--effectStartMs": opts.effectStartMs = parseInt(n, 10); i++; break;
      case "--effectEndMs": opts.effectEndMs = parseInt(n, 10); i++; break;
      case "--no-mask": opts.applyCircularMask = false; break;
    }
  }

  // Log config source for transparency
  if (scenario) {
    console.log(`Config loaded from: animations/${scenarioName}/scenario.json`);
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
        // Use Puppeteer's native click which properly triggers React synthetic events
        await el.click();
        console.log(`Clicked: ${sel}`);
        return true;
      }
    } catch (e) {
      console.log(`Click error for ${sel}: ${e.message}`);
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
  // CRITICAL: Use defaultViewport: null to prevent viewport mismatch on launch
  // Then explicitly set viewport after page creation to lock dimensions
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
    defaultViewport: null,  // Let setViewport handle it to avoid resize flash
  });

  const page = await browser.newPage();

  // Set viewport explicitly before navigation
  await page.setViewport({
    width: opts.viewportWidth,
    height: opts.viewportHeight,
    deviceScaleFactor: 1,
  });

  // Navigate and wait
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  console.log('Page loaded');

  // CRITICAL: Re-set viewport after load to ensure dimensions are locked
  // This prevents the resize-from-bottom-right issue
  await page.setViewport({
    width: opts.viewportWidth,
    height: opts.viewportHeight,
    deviceScaleFactor: 1,
  });
  console.log(`Viewport locked: ${opts.viewportWidth}x${opts.viewportHeight}`);

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
  let maskedDir = path.join(outDir, 'masked');
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

  if (opts.applyMask && opts.goldenMaskPath) {
    console.log(`Applying golden mask: ${opts.goldenMaskPath}`);
    for (let i = 0; i < effectFrames.length; i++) {
      const srcPath = path.join(cropsDir, effectFrames[i]);
      const dstPath = path.join(maskedDir, `frame_${String(i).padStart(3, '0')}.png`);
      await applyGoldenMask(srcPath, dstPath, opts.goldenMaskPath);
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

  // Count masked frames
  let maskedFrameCount = effectFrames.length;

  // If loopToMatch is enabled, duplicate frames to reach target frame count
  if (opts.loopToMatch && opts.targetFrameCount && maskedFrameCount > 0) {
    const targetCount = opts.targetFrameCount;
    console.log(`Looping ${maskedFrameCount} frames to match target ${targetCount} frames...`);

    if (maskedFrameCount < targetCount) {
      // Calculate how many times we need to loop and any remainder
      const fullLoops = Math.floor(targetCount / maskedFrameCount);
      const remainder = targetCount % maskedFrameCount;

      // Create looped frames directory
      const loopedDir = path.join(outDir, 'looped');
      ensureDir(loopedDir);

      let outputIndex = 0;
      // Copy full loops
      for (let loop = 0; loop < fullLoops; loop++) {
        for (let i = 0; i < maskedFrameCount; i++) {
          const srcPath = path.join(maskedDir, `frame_${String(i).padStart(3, '0')}.png`);
          const dstPath = path.join(loopedDir, `frame_${String(outputIndex).padStart(3, '0')}.png`);
          fs.copyFileSync(srcPath, dstPath);
          outputIndex++;
        }
      }
      // Copy remainder frames
      for (let i = 0; i < remainder; i++) {
        const srcPath = path.join(maskedDir, `frame_${String(i).padStart(3, '0')}.png`);
        const dstPath = path.join(loopedDir, `frame_${String(outputIndex).padStart(3, '0')}.png`);
        fs.copyFileSync(srcPath, dstPath);
        outputIndex++;
      }

      console.log(`  Created ${outputIndex} looped frames (${fullLoops} full loops + ${remainder} remainder)`);
      maskedFrameCount = outputIndex;

      // Use looped directory for APNG creation
      maskedDir = loopedDir;
    } else {
      console.log(`  Already have ${maskedFrameCount} frames, no looping needed`);
    }
  }

  // Create animated PNG from masked/trimmed frames at configured fps (not actual capture rate)
  // This ensures consistent playback timing matching the reference
  const outputFps = opts.fps || 30;
  const ffmpegApng = spawn('ffmpeg', [
    '-y',
    '-framerate', String(outputFps),
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
  const apngDuration = maskedFrameCount / outputFps;

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
  if (opts.loopToMatch && opts.targetFrameCount) {
    console.log(`Looped to: ${maskedFrameCount} frames (target: ${opts.targetFrameCount})`);
  }
  console.log(`Golden mask: ${opts.applyMask && opts.goldenMaskPath ? 'applied' : 'not applied'}`);
  console.log(`Output directory: ${outDir}`);
  console.log(`Animated PNG: animation.apng (${(apngSize / 1024 / 1024).toFixed(2)} MB, ${apngDuration.toFixed(2)}s @ ${outputFps}fps)`);
  console.log(`Frame timing metadata: frame_timing.json`);
}

main().catch((e) => {
  console.error("❌ VIDEO CAPTURE FAILED:", e?.message || e);
  process.exit(1);
});
