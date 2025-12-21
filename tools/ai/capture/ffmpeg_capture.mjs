#!/usr/bin/env node
/**
 * ffmpeg_capture.mjs
 *
 * Uses ffmpeg native screen recording to capture WebGL animations
 * without blocking the browser's render loop.
 *
 * Usage:
 *   node tools/ai/capture/ffmpeg_capture.mjs --label electricity-test --duration 4
 */

import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { chromium } from 'playwright';

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function dateFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    label: 'ffmpeg-capture',
    duration: 4,        // Total recording duration in seconds
    settleMs: 2000,     // Time to wait before clicking
    fps: 30,            // Recording framerate
    mode: 'newtopics',  // Click mode
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const n = args[i + 1];
    switch (a) {
      case '--label': opts.label = n; i++; break;
      case '--duration': opts.duration = parseFloat(n); i++; break;
      case '--settleMs': opts.settleMs = parseInt(n, 10); i++; break;
      case '--fps': opts.fps = parseInt(n, 10); i++; break;
      case '--mode': opts.mode = n; i++; break;
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
      if (html.includes('/@vite/client')) return url;
    } catch {}
  }
  throw new Error('No Vite dev server detected on ports 5173-5185. Start Vite first.');
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function clickNewTopics(page) {
  const selectors = [
    '[data-testid="btn-new-topics"]',
    '.new-topics-btn',
    'button:has-text("New Topics")',
    '.image-button:has-text("New Topics")'
  ];

  for (const sel of selectors) {
    const el = await page.$(sel);
    if (el) {
      // Use dispatchEvent for mousedown since the button triggers on onMouseDown
      const box = await el.boundingBox();
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.waitForTimeout(100);
        await page.mouse.up();
        console.log(`  Clicked (mousedown): ${sel}`);
        return true;
      }
    }
  }
  throw new Error('Could not find New Topics button');
}

async function main() {
  const opts = parseArgs();
  const baseUrl = await detectViteBaseUrl();

  const timelineRoot = path.join(process.cwd(), 'tools/ai/screenshots/timeline', dateFolder());
  const outDir = path.join(timelineRoot, `${nowStamp()}__${opts.label}`);
  ensureDir(outDir);

  const videoPath = path.join(outDir, 'screen_capture.mp4');
  const framesDir = path.join(outDir, 'frames');
  ensureDir(framesDir);

  console.log('');
  console.log('═'.repeat(50));
  console.log('  FFMPEG SCREEN CAPTURE');
  console.log('═'.repeat(50));
  console.log(`  Output: ${outDir}`);
  console.log(`  Duration: ${opts.duration}s @ ${opts.fps}fps`);
  console.log('');

  // Launch browser (non-headless so we can screen capture it)
  console.log('📱 Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--use-gl=egl',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--start-maximized',
    ]
  });

  // Use full screen viewport (1920x1080 for standard HD, or null for no constraint)
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  console.log('  Page loaded');

  // Disable non-essential effects
  await page.addStyleTag({
    content: `
      .steam-wisp, .steam-particle, [class*="steam"] {
        display: none !important;
      }
      .effect-controls, .control-panel {
        display: none !important;
      }
    `
  });

  // Wait for settle
  console.log(`  Waiting ${opts.settleMs}ms for settle...`);
  await page.waitForTimeout(opts.settleMs);

  // Start ffmpeg screen recording
  console.log('');
  console.log('📹 Starting ffmpeg screen capture...');
  console.log('  (Recording full screen - will crop later)');

  const ffmpegArgs = [
    '-y',
    '-f', 'avfoundation',
    '-framerate', String(opts.fps),
    '-i', '4',  // Screen capture device
    '-t', String(opts.duration),
    '-c:v', 'libx264',
    '-preset', 'ultrafast',  // Fast encoding to reduce CPU load
    '-crf', '18',            // High quality
    '-pix_fmt', 'yuv420p',
    videoPath
  ];

  const ffmpegProc = spawn('ffmpeg', ffmpegArgs, {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Give ffmpeg more time to stabilize recording
  console.log('  Waiting 1.5s for recording to stabilize...');
  await new Promise(r => setTimeout(r, 1500));

  // Click to trigger electricity effect
  console.log('⚡ Clicking New Topics to trigger electricity...');
  console.log('  WATCH THE BROWSER - you should see electricity arcs NOW');
  await clickNewTopics(page);

  // Wait for animation to complete
  const animWait = (opts.duration - 0.5) * 1000;
  console.log(`  Waiting ${animWait}ms for animation...`);
  await page.waitForTimeout(animWait);

  // Wait for ffmpeg to finish
  console.log('');
  console.log('⏳ Waiting for ffmpeg to finish...');

  await new Promise((resolve, reject) => {
    ffmpegProc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
    ffmpegProc.on('error', reject);
  });

  console.log('  Recording complete');

  // Close browser
  await context.close();
  await browser.close();

  // Extract frames from video
  console.log('');
  console.log('🎞️  Extracting frames...');

  const extractResult = spawnSync('ffmpeg', [
    '-i', videoPath,
    '-vf', `fps=${opts.fps}`,
    path.join(framesDir, 'frame_%03d.png')
  ], { stdio: 'pipe' });

  if (extractResult.status !== 0) {
    console.error('  Frame extraction failed:', extractResult.stderr?.toString());
  } else {
    const frameCount = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).length;
    console.log(`  Extracted ${frameCount} frames`);
  }

  // Save metadata
  const meta = {
    timestamp: new Date().toISOString(),
    label: opts.label,
    duration: opts.duration,
    fps: opts.fps,
    settleMs: opts.settleMs,
    mode: opts.mode,
    videoPath,
    framesDir,
    outDir
  };
  fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 2));

  console.log('');
  console.log('═'.repeat(50));
  console.log('✅ CAPTURE COMPLETE');
  console.log('═'.repeat(50));
  console.log(`  Video: ${videoPath}`);
  console.log(`  Frames: ${framesDir}`);
  console.log('');
}

main().catch(err => {
  console.error('❌ Capture failed:', err.message);
  process.exit(1);
});
