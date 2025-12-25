/**
 * human-review.mjs - High-FPS capture for human review calibration
 *
 * Uses ffmpeg screen recording at 120fps for maximum temporal visibility.
 * Generates an enhanced HTML UI for frame selection and feedback.
 *
 * Key differences from video.mjs:
 * - ffmpeg avfoundation capture instead of CDP screencast
 * - 120fps instead of 30fps
 * - 7 second duration (full envelope)
 * - Visual sync marker at click moment
 * - Browser positioned at fixed screen location (0,0)
 *
 * Usage:
 *   node animations/shared/capture/human-review.mjs --scenario electricity-portal
 */

import fs from "node:fs";
import path from "node:path";
import { spawn, execSync } from "node:child_process";
import puppeteer from "puppeteer";
import sharp from "sharp";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

// Load scenario.json configuration
function loadScenarioConfig(scenarioName) {
  const scenarioPath = path.join(process.cwd(), "animations", scenarioName, "scenario.json");
  if (!fs.existsSync(scenarioPath)) {
    console.warn(`Warning: scenario.json not found at ${scenarioPath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(scenarioPath, "utf-8"));
  } catch (e) {
    console.warn(`Warning: Failed to parse scenario.json: ${e.message}`);
    return null;
  }
}

// Parse CLI args
function parseArgs() {
  const args = process.argv.slice(2);

  let scenarioName = "electricity-portal";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--scenario" && args[i + 1]) {
      scenarioName = args[i + 1];
      break;
    }
  }

  const scenario = loadScenarioConfig(scenarioName);
  const cap = scenario?.capture || {};

  const opts = {
    scenario: scenarioName,
    scenarioConfig: scenario,
    // Human review specific settings
    duration: 7000, // 7 seconds for full envelope visibility
    fps: 120, // High FPS for maximum temporal resolution
    bufferBefore: 2000, // 2s buffer before click
    bufferAfter: 2000, // 2s buffer after animation
    // Viewport from scenario
    viewportWidth: cap.viewport?.width || 1440,
    viewportHeight: cap.viewport?.height || 768,
    // Crop settings (will be converted to screen coords)
    cropX: cap.crop?.x || 482,
    cropY: cap.crop?.y || 39,
    cropWidth: cap.crop?.width || 465,
    cropHeight: cap.crop?.height || 465,
    applyMask: cap.crop?.circularMask !== false,
    // Reference paths
    referenceStatic: scenario?.reference?.withEffect || null,
    referenceAnimation: scenario?.reference?.animation || null,
    goldenMaskPath: scenario?.reference?.mask || null,
  };

  // CLI overrides
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const n = args[i + 1];
    switch (a) {
      case "--scenario":
        i++;
        break;
      case "--duration":
        opts.duration = parseInt(n, 10);
        i++;
        break;
      case "--fps":
        opts.fps = parseInt(n, 10);
        i++;
        break;
    }
  }

  return opts;
}

// Detect Vite dev server
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
    } catch {
      // Continue to next port
    }
  }
  throw new Error("No Vite dev server detected on ports 5173-5185. Start with: pnpm dev");
}

// Click a selector
async function clickSelector(page, selectors) {
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el) {
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

// Get the screen device index for ffmpeg avfoundation
function getScreenDeviceIndex() {
  try {
    const output = execSync('ffmpeg -f avfoundation -list_devices true -i "" 2>&1 || true', {
      encoding: "utf-8",
    });
    // Look for "Capture screen" in the output
    const lines = output.split("\n");
    for (const line of lines) {
      const match = line.match(/\[(\d+)\]\s+Capture screen/i);
      if (match) {
        return match[1];
      }
    }
    // Default to "1" if not found (common on macOS)
    return "1";
  } catch {
    return "1";
  }
}

// Inject visual marker for sync (brief red flash)
async function injectSyncMarker(page, cropX, cropY, cropWidth, cropHeight) {
  await page.evaluate(
    (x, y, w, h) => {
      const marker = document.createElement("div");
      marker.id = "sync-marker";
      marker.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${w}px;
      height: ${h}px;
      background: red;
      z-index: 999999;
      pointer-events: none;
    `;
      document.body.appendChild(marker);

      // Flash for 100ms then remove
      setTimeout(() => {
        marker.remove();
      }, 100);
    },
    cropX,
    cropY,
    cropWidth,
    cropHeight
  );
}

// Apply circular mask to an image
async function applyCircularMask(inputPath, outputPath, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2;

  // Create circular mask SVG
  const maskSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="white"/>
    </svg>
  `);

  const mask = await sharp(maskSvg).grayscale().raw().toBuffer();

  const inputBuffer = await sharp(inputPath).ensureAlpha().raw().toBuffer();

  // Apply mask: pixels outside circle become black
  const outputBuffer = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const maskValue = mask[i];
    if (maskValue > 128) {
      outputBuffer[i * 4 + 0] = inputBuffer[i * 4 + 0];
      outputBuffer[i * 4 + 1] = inputBuffer[i * 4 + 1];
      outputBuffer[i * 4 + 2] = inputBuffer[i * 4 + 2];
      outputBuffer[i * 4 + 3] = 255;
    } else {
      outputBuffer[i * 4 + 0] = 0;
      outputBuffer[i * 4 + 1] = 0;
      outputBuffer[i * 4 + 2] = 0;
      outputBuffer[i * 4 + 3] = 255;
    }
  }

  await sharp(outputBuffer, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toFile(outputPath);
}

async function main() {
  const opts = parseArgs();
  console.log(`\n========================================`);
  console.log(`  HUMAN REVIEW CAPTURE`);
  console.log(`  Scenario: ${opts.scenario}`);
  console.log(`  Duration: ${opts.duration}ms @ ${opts.fps}fps`);
  console.log(`========================================\n`);

  // Output directory
  const outputDir = path.join(
    process.cwd(),
    `animations/${opts.scenario}/human-review`,
    nowStamp()
  );
  ensureDir(outputDir);
  const framesDir = path.join(outputDir, "frames");
  const cropsDir = path.join(outputDir, "crops");
  const maskedDir = path.join(outputDir, "masked");
  ensureDir(framesDir);
  ensureDir(cropsDir);
  ensureDir(maskedDir);

  console.log(`Output: ${outputDir}`);

  const baseUrl = await detectViteBaseUrl();
  console.log(`Dev server: ${baseUrl}`);

  // Calculate window chrome height (will be queried dynamically)
  // macOS typical: ~80px (title bar + tabs + URL bar)
  const estimatedChromeHeight = 80;

  // Launch browser at fixed position (0, 0)
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--window-position=0,0",
      `--window-size=${opts.viewportWidth},${opts.viewportHeight + estimatedChromeHeight}`,
      "--enable-webgl",
      "--enable-webgl2",
      "--ignore-gpu-blocklist",
      "--enable-gpu-rasterization",
      "--no-sandbox",
      "--force-device-scale-factor=1",
    ],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  // Set viewport
  await page.setViewport({
    width: opts.viewportWidth,
    height: opts.viewportHeight,
    deviceScaleFactor: 1,
  });

  // Navigate
  await page.goto(baseUrl, { waitUntil: "networkidle0" });
  console.log("Page loaded");

  // Re-set viewport to lock dimensions
  await page.setViewport({
    width: opts.viewportWidth,
    height: opts.viewportHeight,
    deviceScaleFactor: 1,
  });

  // Query actual viewport position on screen AND device pixel ratio
  // This accounts for actual chrome height and Retina display scaling
  const windowBounds = await page.evaluate(() => {
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      screenX: window.screenX,
      screenY: window.screenY,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
  });

  // Calculate actual chrome height from outer vs inner dimensions
  const actualChromeHeight = windowBounds.outerHeight - windowBounds.innerHeight;
  const dpr = windowBounds.devicePixelRatio;

  console.log(`Browser chrome height: ${actualChromeHeight}px (estimated: ${estimatedChromeHeight}px)`);
  console.log(`Device pixel ratio: ${dpr}x ${dpr > 1 ? "(Retina display)" : ""}`);

  // Calculate screen coordinates for ffmpeg crop
  // CRITICAL: On Retina displays, ffmpeg captures at native (pixel) resolution
  // JavaScript coordinates are in points, so we must multiply by DPR
  const screenCropX = Math.round((windowBounds.screenX + opts.cropX) * dpr);
  const screenCropY = Math.round((windowBounds.screenY + actualChromeHeight + opts.cropY) * dpr);
  const ffmpegCropWidth = Math.round(opts.cropWidth * dpr);
  const ffmpegCropHeight = Math.round(opts.cropHeight * dpr);

  console.log(`Screen crop (points): (${windowBounds.screenX + opts.cropX}, ${windowBounds.screenY + actualChromeHeight + opts.cropY}) @ ${opts.cropWidth}x${opts.cropHeight}`);
  console.log(`Screen crop (pixels for ffmpeg): (${screenCropX}, ${screenCropY}) @ ${ffmpegCropWidth}x${ffmpegCropHeight}`);

  // Wait for UI
  try {
    await page.waitForSelector(".new-topics-btn, .wheel-container", { timeout: 10000 });
  } catch {
    console.warn("Warning: Main UI elements not found");
  }

  // Wait for any existing animations to complete and page to be fully idle
  console.log("Waiting for page to settle (2s)...");
  await sleep(2000);

  // Prepare ffmpeg command
  const screenDevice = getScreenDeviceIndex();
  const videoPath = path.join(outputDir, "recording.mp4");

  // Calculate total capture duration including buffers
  const totalCaptureDuration = (opts.bufferBefore + opts.duration + opts.bufferAfter) / 1000;

  console.log(`\nStarting ffmpeg screen recording...`);
  console.log(`  Device: ${screenDevice}:none`);
  console.log(`  FPS: ${opts.fps}`);
  console.log(`  Duration: ${totalCaptureDuration}s (${opts.bufferBefore}ms buffer + ${opts.duration}ms + ${opts.bufferAfter}ms buffer)`);
  console.log(`  Will crop with sharp after: ${opts.cropWidth}x${opts.cropHeight} at viewport (${opts.cropX}, ${opts.cropY})`);

  // Start ffmpeg recording - capture full screen, crop later with sharp
  // This avoids coordinate issues and lets us debug what's being captured
  const ffmpegArgs = [
    "-y",
    "-f", "avfoundation",
    "-framerate", String(opts.fps),
    "-capture_cursor", "0",
    "-i", `${screenDevice}:none`,
    "-t", String(totalCaptureDuration),
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "18",
    videoPath,
  ];

  const ffmpegProcess = spawn("ffmpeg", ffmpegArgs, {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let ffmpegOutput = "";
  ffmpegProcess.stderr.on("data", (data) => {
    ffmpegOutput += data.toString();
  });

  // Wait for ffmpeg to fully initialize and start capturing
  // This is critical for accurate timing
  console.log("Waiting for ffmpeg to initialize (1s)...");
  await sleep(1000);

  // Mark the actual recording start time
  const recordingStartTime = Date.now();

  // Wait for buffer before click
  console.log(`\nWaiting ${opts.bufferBefore}ms before click...`);
  await sleep(opts.bufferBefore);

  // Record click time (relative to recording start)
  const clickTimeMs = opts.bufferBefore;
  const clickTimestamp = Date.now();

  // Inject sync marker and click
  console.log("Injecting sync marker and clicking...");
  await injectSyncMarker(page, opts.cropX, opts.cropY, opts.cropWidth, opts.cropHeight);

  await clickSelector(page, ['[data-testid="btn-new-topics"]', ".new-topics-btn"]);

  // Wait for animation duration
  console.log(`Recording animation for ${opts.duration}ms...`);
  await sleep(opts.duration);

  // Wait for buffer after
  console.log(`Waiting ${opts.bufferAfter}ms after animation...`);
  await sleep(opts.bufferAfter);

  // Wait for ffmpeg to finish
  await new Promise((resolve, reject) => {
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}\n${ffmpegOutput}`));
      }
    });
    ffmpegProcess.on("error", reject);
  });

  console.log(`\nRecording complete: ${videoPath}`);

  // Close browser
  await browser.close();

  // Extract frames from video (full screen)
  console.log(`\nExtracting frames at ${opts.fps}fps...`);

  const extractArgs = [
    "-y",
    "-i", videoPath,
    "-vf", `fps=${opts.fps}`,
    path.join(framesDir, "frame_%04d.png"),
  ];

  await new Promise((resolve, reject) => {
    const extractProcess = spawn("ffmpeg", extractArgs, { stdio: "pipe" });
    extractProcess.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Extract failed`))));
    extractProcess.on("error", reject);
  });

  const frameFiles = fs.readdirSync(framesDir).filter((f) => f.endsWith(".png")).sort();
  console.log(`Extracted ${frameFiles.length} frames`);

  // Check the actual dimensions of captured frames
  if (frameFiles.length > 0) {
    const firstFrame = path.join(framesDir, frameFiles[0]);
    const metadata = await sharp(firstFrame).metadata();
    console.log(`Captured frame size: ${metadata.width}x${metadata.height}`);

    // Save a sample frame for debugging
    fs.copyFileSync(firstFrame, path.join(outputDir, "debug_first_frame.png"));
    console.log(`Saved debug frame: debug_first_frame.png`);
  }

  // Calculate frame timestamps
  // Frame N is at time: (N-1) / fps * 1000 ms from recording start
  // Click happened at clickTimeMs from recording start
  const frameData = frameFiles.map((file, index) => {
    const frameTimeFromStart = (index / opts.fps) * 1000;
    const frameTimeFromClick = frameTimeFromStart - clickTimeMs;
    return {
      file,
      index,
      frameTimeFromStart: Math.round(frameTimeFromStart),
      frameTimeFromClick: Math.round(frameTimeFromClick),
    };
  });

  // Crop and apply circular mask to frames
  // Use the screen coordinates we calculated earlier
  console.log(`\nCropping and masking ${frameFiles.length} frames...`);
  console.log(`  Crop region (pixels): (${screenCropX}, ${screenCropY}) @ ${ffmpegCropWidth}x${ffmpegCropHeight}`);

  for (let i = 0; i < frameFiles.length; i++) {
    const srcPath = path.join(framesDir, frameFiles[i]);
    const cropPath = path.join(cropsDir, `frame_${String(i).padStart(4, "0")}.png`);
    const dstPath = path.join(maskedDir, `frame_${String(i).padStart(4, "0")}.png`);

    // Crop from full screen capture to portal region
    await sharp(srcPath)
      .extract({
        left: screenCropX,
        top: screenCropY,
        width: ffmpegCropWidth,
        height: ffmpegCropHeight
      })
      .resize(opts.cropWidth, opts.cropHeight) // Scale down if Retina
      .toFile(cropPath);

    // Apply circular mask
    if (opts.applyMask) {
      await applyCircularMask(cropPath, dstPath, opts.cropWidth, opts.cropHeight);
    } else {
      fs.copyFileSync(cropPath, dstPath);
    }

    if ((i + 1) % 100 === 0 || i === frameFiles.length - 1) {
      console.log(`  Processed ${i + 1}/${frameFiles.length} frames`);
    }
  }

  // Generate thumbnails for UI
  console.log(`\nGenerating thumbnails...`);
  const thumbnailsDir = path.join(outputDir, "thumbnails");
  ensureDir(thumbnailsDir);

  const thumbnails = [];
  for (let i = 0; i < frameFiles.length; i++) {
    const srcPath = path.join(maskedDir, `frame_${String(i).padStart(4, "0")}.png`);
    const thumbPath = path.join(thumbnailsDir, `thumb_${String(i).padStart(4, "0")}.jpg`);

    await sharp(srcPath).resize(140, 140).jpeg({ quality: 75 }).toFile(thumbPath);

    // Also create base64 for HTML embedding
    const thumbBuffer = await sharp(srcPath).resize(140, 140).jpeg({ quality: 70 }).toBuffer();
    thumbnails.push(thumbBuffer.toString("base64"));

    if ((i + 1) % 100 === 0 || i === frameFiles.length - 1) {
      console.log(`  Generated ${i + 1}/${frameFiles.length} thumbnails`);
    }
  }

  // Load reference thumbnail if available
  let referenceThumbnail = "";
  if (opts.referenceStatic && fs.existsSync(opts.referenceStatic)) {
    const refPath = path.join(process.cwd(), opts.referenceStatic);
    if (fs.existsSync(refPath)) {
      const refThumb = await sharp(refPath).resize(140, 140).jpeg({ quality: 70 }).toBuffer();
      referenceThumbnail = refThumb.toString("base64");
      console.log(`Reference loaded: ${path.basename(opts.referenceStatic)}`);
    }
  }

  // Save frame metadata
  const metadata = {
    scenario: opts.scenario,
    capturedAt: new Date().toISOString(),
    captureSettings: {
      fps: opts.fps,
      duration: opts.duration,
      bufferBefore: opts.bufferBefore,
      bufferAfter: opts.bufferAfter,
      totalCaptureMs: totalCaptureDuration * 1000,
    },
    clickTimeMs,
    totalFrames: frameFiles.length,
    frameData,
    crop: {
      x: opts.cropX,
      y: opts.cropY,
      width: opts.cropWidth,
      height: opts.cropHeight,
      screenX: screenCropX,
      screenY: screenCropY,
    },
    paths: {
      video: videoPath,
      frames: framesDir,
      masked: maskedDir,
      thumbnails: thumbnailsDir,
    },
  };

  fs.writeFileSync(path.join(outputDir, "capture_metadata.json"), JSON.stringify(metadata, null, 2));

  // Generate HTML UI (basic version for now - enhanced UI comes in Phase 5)
  console.log(`\nGenerating human review UI...`);
  const htmlPath = path.join(outputDir, "human_review.html");
  const html = generateHumanReviewHTML(opts.scenario, frameData, thumbnails, referenceThumbnail, outputDir, metadata, opts.scenarioConfig);
  fs.writeFileSync(htmlPath, html);

  // Open in browser
  console.log(`\nOpening human review UI...`);
  spawn("open", [htmlPath], { detached: true, stdio: "ignore" }).unref();

  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  HUMAN REVIEW CAPTURE COMPLETE                                    ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Total frames: ${String(frameFiles.length).padEnd(45)}║
║  FPS: ${String(opts.fps).padEnd(55)}║
║  Duration: ${String((frameFiles.length / opts.fps).toFixed(2) + "s").padEnd(50)}║
║  Click time: ${String(clickTimeMs + "ms from recording start").padEnd(48)}║
║                                                                   ║
║  Output: ${outputDir.slice(-50).padEnd(52)}║
║                                                                   ║
║  1. Review frames in the HTML UI                                  ║
║  2. Select best frame and animation range                         ║
║  3. Provide feedback and submit                                   ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);
}

// Generate HTML UI for human review
function generateHumanReviewHTML(scenario, frameData, thumbnails, referenceThumbnail, outputDir, metadata, scenarioConfig) {
  const framesHTML = frameData
    .map((frame, i) => {
      const timeFromClick = frame.frameTimeFromClick;
      const timeLabel =
        timeFromClick >= 0
          ? timeFromClick >= 1000
            ? `+${(timeFromClick / 1000).toFixed(2)}s`
            : `+${timeFromClick}ms`
          : timeFromClick <= -1000
            ? `${(timeFromClick / 1000).toFixed(2)}s`
            : `${timeFromClick}ms`;

      const thumbnail = thumbnails[i];

      // Simple phase: just pre-click vs post-click
      // Animation timing varies between captures, so preset thresholds don't work
      const phase = timeFromClick < 0 ? "pre-click" : "post-click";

      return `
      <div class="frame" data-index="${i}" data-time="${timeFromClick}" data-phase="${phase}">
        <div class="frame-images">
          ${referenceThumbnail ? `
          <div class="img-container">
            <span class="img-label ref">Ref</span>
            <img src="data:image/jpeg;base64,${referenceThumbnail}" alt="Reference">
          </div>
          ` : ""}
          <div class="img-container">
            <span class="img-label cap">Cap</span>
            <img src="data:image/jpeg;base64,${thumbnail}" alt="Frame ${i + 1}">
          </div>
        </div>
        <div class="labels">
          <span class="frame-num">F${String(i + 1).padStart(4, "0")}</span>
          <span class="time">${timeLabel}</span>
          <span class="phase phase-${phase}">${phase}</span>
        </div>
        <div class="controls">
          <label class="best-frame" title="Best Frame (peak quality)">
            <input type="radio" name="bestFrame" value="${i}">
            <span>Best</span>
          </label>
          <label class="in-range" title="Include in animation range">
            <input type="checkbox" name="inRange" value="${i}">
            <span>Range</span>
          </label>
        </div>
      </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Human Review - ${scenario}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e;
      color: #eee;
      padding: 20px;
      padding-bottom: 100px;
    }
    header {
      text-align: center;
      margin-bottom: 10px;
      padding: 15px;
      background: #16213e;
      border-radius: 8px;
    }
    h1 { font-size: 1.4rem; margin-bottom: 8px; color: #e94560; }
    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      font-size: 0.9rem;
      color: #aaa;
    }
    .stats strong { color: #3498db; }

    .quick-input {
      background: #0f3460;
      border-radius: 8px;
      padding: 12px 20px;
      margin-bottom: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 25px;
      flex-wrap: wrap;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .quick-input h3 {
      font-size: 0.9rem;
      color: #e94560;
    }
    .input-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .input-group label {
      font-size: 0.8rem;
      color: #aaa;
    }
    .input-group input[type="number"] {
      width: 70px;
      padding: 6px 10px;
      border: 2px solid #333;
      border-radius: 4px;
      background: #1a1a2e;
      color: #fff;
      font-size: 0.9rem;
      text-align: center;
    }
    .input-group input:focus {
      outline: none;
      border-color: #3498db;
    }
    #applyBtn {
      background: #3498db;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 5px;
      cursor: pointer;
    }
    #applyBtn:hover { background: #2980b9; }

    .phase-filter {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      justify-content: center;
    }
    .phase-filter button {
      padding: 6px 12px;
      border: 1px solid #333;
      border-radius: 4px;
      background: #16213e;
      color: #aaa;
      cursor: pointer;
      font-size: 0.8rem;
    }
    .phase-filter button.active {
      background: #e94560;
      color: white;
      border-color: #e94560;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${referenceThumbnail ? "290px" : "160px"}, 1fr));
      gap: 8px;
    }
    .frame {
      background: #0f0f23;
      border: 2px solid #333;
      border-radius: 5px;
      overflow: hidden;
      transition: border-color 0.2s, transform 0.1s;
    }
    .frame:hover { border-color: #555; transform: scale(1.01); }
    .frame.selected-best { border-color: #e94560; box-shadow: 0 0 8px rgba(233, 69, 96, 0.3); }
    .frame.selected-range { border-color: #3498db; }
    .frame.selected-best.selected-range { border-color: #e94560; }
    .frame.hidden { display: none; }

    .frame-images {
      display: flex;
      gap: 2px;
    }
    .frame-images .img-container {
      flex: 1;
      position: relative;
    }
    .frame-images .img-label {
      position: absolute;
      top: 3px;
      left: 3px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      font-size: 0.55rem;
      padding: 2px 4px;
      border-radius: 2px;
      text-transform: uppercase;
    }
    .frame-images .img-label.ref { background: rgba(39, 174, 96, 0.8); }
    .frame-images .img-label.cap { background: rgba(52, 152, 219, 0.8); }
    .frame-images img {
      width: 100%;
      height: auto;
      display: block;
    }

    .labels {
      display: flex;
      justify-content: space-between;
      padding: 4px 6px;
      background: #16213e;
      font-size: 0.7rem;
    }
    .frame-num { color: #888; }
    .time { color: #3498db; font-weight: 500; }
    .phase {
      padding: 1px 4px;
      border-radius: 2px;
      font-size: 0.6rem;
      text-transform: uppercase;
    }
    .phase-pre-click { background: #555; }
    .phase-post-click { background: #27ae60; }

    .controls {
      display: flex;
      justify-content: space-around;
      padding: 6px;
      background: #0a0a1a;
    }
    .controls label {
      display: flex;
      align-items: center;
      gap: 3px;
      cursor: pointer;
      font-size: 0.7rem;
      padding: 3px 6px;
      border-radius: 3px;
    }
    .controls label:hover { background: #222; }
    .best-frame input:checked + span { color: #e94560; font-weight: bold; }
    .in-range input:checked + span { color: #3498db; font-weight: bold; }

    .submit-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #16213e;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #333;
      z-index: 100;
    }
    .selection-summary {
      font-size: 0.85rem;
      color: #aaa;
    }
    .selection-summary strong { color: #fff; }

    .feedback-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .feedback-section select {
      padding: 8px 12px;
      border: 2px solid #333;
      border-radius: 4px;
      background: #1a1a2e;
      color: #fff;
      font-size: 0.85rem;
    }
    .feedback-section textarea {
      width: 300px;
      height: 36px;
      padding: 8px;
      border: 2px solid #333;
      border-radius: 4px;
      background: #1a1a2e;
      color: #fff;
      font-size: 0.8rem;
      resize: none;
    }
    #submitBtn {
      background: #27ae60;
      color: white;
      border: none;
      padding: 10px 25px;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 5px;
      cursor: pointer;
    }
    #submitBtn:hover { background: #2ecc71; }
    #submitBtn:disabled { background: #555; cursor: not-allowed; }

    .status {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      display: none;
      font-weight: 500;
      z-index: 200;
    }
    .status.error { background: #c0392b; }
  </style>
</head>
<body>
  <header>
    <h1>Human Review: ${scenario}</h1>
    <div class="stats">
      <span>Frames: <strong>${frameData.length}</strong></span>
      <span>FPS: <strong>${metadata.captureSettings.fps}</strong></span>
      <span>Duration: <strong>${(frameData.length / metadata.captureSettings.fps).toFixed(2)}s</strong></span>
      <span>Click at: <strong>${metadata.clickTimeMs}ms</strong></span>
    </div>
  </header>

  <div class="quick-input">
    <h3>Quick Input:</h3>
    <div class="input-group">
      <label for="bestFrameInput">Best #</label>
      <input type="number" id="bestFrameInput" min="1" max="${frameData.length}" placeholder="42">
    </div>
    <div class="input-group">
      <label for="startFrameInput">Start #</label>
      <input type="number" id="startFrameInput" min="1" max="${frameData.length}" placeholder="30">
    </div>
    <div class="input-group">
      <label for="endFrameInput">End #</label>
      <input type="number" id="endFrameInput" min="1" max="${frameData.length}" placeholder="60">
    </div>
    <button id="applyBtn">Apply</button>
  </div>

  <div class="phase-filter">
    <button class="active" data-phase="all">All</button>
    <button data-phase="pre-click">Pre-click</button>
    <button data-phase="post-click">Post-click</button>
  </div>

  <div class="grid">
    ${framesHTML}
  </div>

  <div class="submit-bar">
    <div class="selection-summary">
      Best: <strong id="bestFrameDisplay">None</strong> |
      Range: <strong id="rangeDisplay">0 frames</strong>
      (<span id="rangeTimeDisplay">--</span>)
    </div>
    <div class="feedback-section">
      <select id="decisionSelect">
        <option value="iterate">Iterate</option>
        <option value="approve_baseline">Approve Baseline</option>
      </select>
      <textarea id="feedbackText" placeholder="Feedback for Claude..."></textarea>
      <button id="submitBtn" disabled>Submit</button>
    </div>
  </div>

  <div class="status" id="status"></div>

  <script>
    const outputDir = ${JSON.stringify(outputDir)};
    const scenario = ${JSON.stringify(scenario)};
    const totalFrames = ${frameData.length};
    const fps = ${metadata.captureSettings.fps};
    const clickTimeMs = ${metadata.clickTimeMs};
    const frameData = ${JSON.stringify(frameData)};

    const frames = document.querySelectorAll('.frame');
    const bestRadios = document.querySelectorAll('input[name="bestFrame"]');
    const rangeCheckboxes = document.querySelectorAll('input[name="inRange"]');
    const submitBtn = document.getElementById('submitBtn');
    const bestFrameDisplay = document.getElementById('bestFrameDisplay');
    const rangeDisplay = document.getElementById('rangeDisplay');
    const rangeTimeDisplay = document.getElementById('rangeTimeDisplay');
    const statusEl = document.getElementById('status');
    const phaseButtons = document.querySelectorAll('.phase-filter button');

    // Phase filter
    phaseButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        phaseButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const phase = btn.dataset.phase;
        frames.forEach(frame => {
          if (phase === 'all' || frame.dataset.phase === phase) {
            frame.classList.remove('hidden');
          } else {
            frame.classList.add('hidden');
          }
        });
      });
    });

    function updateDisplay() {
      const bestChecked = document.querySelector('input[name="bestFrame"]:checked');
      if (bestChecked) {
        const idx = parseInt(bestChecked.value);
        const time = frameData[idx].frameTimeFromClick;
        bestFrameDisplay.textContent = \`F\${String(idx + 1).padStart(4, '0')} (\${time >= 0 ? '+' : ''}\${time}ms)\`;
      } else {
        bestFrameDisplay.textContent = 'None';
      }

      const rangeChecked = Array.from(rangeCheckboxes).filter(cb => cb.checked);
      rangeDisplay.textContent = \`\${rangeChecked.length} frames\`;

      if (rangeChecked.length > 0) {
        const indices = rangeChecked.map(cb => parseInt(cb.value)).sort((a, b) => a - b);
        const startTime = frameData[indices[0]].frameTimeFromClick;
        const endTime = frameData[indices[indices.length - 1]].frameTimeFromClick;
        rangeTimeDisplay.textContent = \`\${startTime >= 0 ? '+' : ''}\${startTime}ms to \${endTime >= 0 ? '+' : ''}\${endTime}ms\`;
      } else {
        rangeTimeDisplay.textContent = '--';
      }

      frames.forEach((frame, i) => {
        const bestInput = frame.querySelector('input[name="bestFrame"]');
        const rangeInput = frame.querySelector('input[name="inRange"]');
        frame.classList.toggle('selected-best', bestInput.checked);
        frame.classList.toggle('selected-range', rangeInput.checked);
      });

      submitBtn.disabled = !bestChecked || rangeChecked.length === 0;
    }

    bestRadios.forEach(r => r.addEventListener('change', updateDisplay));
    rangeCheckboxes.forEach(cb => cb.addEventListener('change', updateDisplay));

    // Shift+click for range
    let lastCheckedRange = null;
    rangeCheckboxes.forEach((cb, i) => {
      cb.addEventListener('click', (e) => {
        if (e.shiftKey && lastCheckedRange !== null) {
          const start = Math.min(lastCheckedRange, i);
          const end = Math.max(lastCheckedRange, i);
          for (let j = start; j <= end; j++) {
            rangeCheckboxes[j].checked = true;
          }
          updateDisplay();
        }
        lastCheckedRange = i;
      });
    });

    // Quick input
    const bestFrameInput = document.getElementById('bestFrameInput');
    const startFrameInput = document.getElementById('startFrameInput');
    const endFrameInput = document.getElementById('endFrameInput');
    const applyBtn = document.getElementById('applyBtn');

    applyBtn.addEventListener('click', () => {
      const bestNum = parseInt(bestFrameInput.value);
      const startNum = parseInt(startFrameInput.value);
      const endNum = parseInt(endFrameInput.value);

      bestRadios.forEach(r => r.checked = false);
      rangeCheckboxes.forEach(cb => cb.checked = false);

      if (bestNum >= 1 && bestNum <= totalFrames) {
        bestRadios[bestNum - 1].checked = true;
      }

      if (startNum >= 1 && endNum >= 1 && startNum <= totalFrames && endNum <= totalFrames) {
        const start = Math.min(startNum, endNum) - 1;
        const end = Math.max(startNum, endNum) - 1;
        for (let i = start; i <= end; i++) {
          rangeCheckboxes[i].checked = true;
        }
      }

      updateDisplay();

      if (bestNum >= 1 && bestNum <= totalFrames) {
        frames[bestNum - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      showStatus('Applied selections', false);
    });

    [bestFrameInput, startFrameInput, endFrameInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyBtn.click();
      });
    });

    submitBtn.addEventListener('click', async () => {
      const bestChecked = document.querySelector('input[name="bestFrame"]:checked');
      const rangeChecked = Array.from(rangeCheckboxes).filter(cb => cb.checked);

      if (!bestChecked || rangeChecked.length === 0) {
        showStatus('Select best frame and range', true);
        return;
      }

      const bestIndex = parseInt(bestChecked.value);
      const rangeIndices = rangeChecked.map(cb => parseInt(cb.value)).sort((a, b) => a - b);

      const result = {
        scenario,
        capturedAt: new Date().toISOString(),
        captureMode: 'human-review',
        captureFps: fps,
        totalFrames,

        selections: {
          bestFrame: {
            index: bestIndex,
            frameNumber: bestIndex + 1,
            timestampMs: frameData[bestIndex].frameTimeFromClick
          },
          animationRange: {
            startFrame: rangeIndices[0],
            endFrame: rangeIndices[rangeIndices.length - 1],
            startMs: frameData[rangeIndices[0]].frameTimeFromClick,
            endMs: frameData[rangeIndices[rangeIndices.length - 1]].frameTimeFromClick,
            frameCount: rangeIndices.length
          }
        },

        humanFeedback: {
          decision: document.getElementById('decisionSelect').value,
          feedbackText: document.getElementById('feedbackText').value,
          submittedAt: new Date().toISOString()
        }
      };

      try {
        const json = JSON.stringify(result, null, 2);
        await navigator.clipboard.writeText(json);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'human_review_feedback.json';
        a.click();
        URL.revokeObjectURL(url);

        showStatus('Saved! JSON downloaded and copied to clipboard.', false);
        console.log('Human review result:', result);
      } catch (err) {
        showStatus('Error: ' + err.message, true);
      }
    });

    function showStatus(msg, isError) {
      statusEl.textContent = msg;
      statusEl.className = 'status' + (isError ? ' error' : '');
      statusEl.style.display = 'block';
      setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
    }

    updateDisplay();
  </script>
</body>
</html>`;
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
