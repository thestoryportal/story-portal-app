/**
 * run.mjs - Puppeteer-based capture pipeline for Story Portal
 *
 * Uses Puppeteer instead of Playwright for better WebGL rendering support.
 */

import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import puppeteer from "puppeteer";

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

// CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    label: "capture",
    mode: "smoke",
    headless: true,
    burstFrames: 30,
    burstIntervalMs: 100,
    settleMs: 500,
    viewportWidth: 1280,
    viewportHeight: 800,
    deviceScaleFactor: 2,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const n = args[i+1];
    switch (a) {
      case "--label": opts.label = n; i++; break;
      case "--mode": opts.mode = n; i++; break;
      case "--headless": opts.headless = (n === "1" || n === "true" || n === undefined); i++; break;
      case "--burstFrames": opts.burstFrames = parseInt(n, 10); i++; break;
      case "--burstIntervalMs": opts.burstIntervalMs = parseInt(n, 10); i++; break;
      case "--settleMs": opts.settleMs = parseInt(n, 10); i++; break;
      case "--viewportWidth": opts.viewportWidth = parseInt(n, 10); i++; break;
      case "--viewportHeight": opts.viewportHeight = parseInt(n, 10); i++; break;
      case "--scale": opts.deviceScaleFactor = parseInt(n, 10); i++; break;
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
        await el.click();
        return true;
      }
    } catch {}
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

async function burstScreenshots(page, outDir, frames, intervalMs) {
  const buffers = [];
  const startTime = Date.now();

  console.log(`Capturing ${frames} frames...`);

  for (let i = 0; i < frames; i++) {
    const buffer = await page.screenshot({ fullPage: true });
    buffers.push({ index: i, buffer, time: Date.now() - startTime });
    await sleep(intervalMs);
  }

  console.log(`Writing ${buffers.length} frames to disk...`);

  for (const { index, buffer } of buffers) {
    const p = path.join(outDir, `frame_${String(index).padStart(3,"0")}.png`);
    fs.writeFileSync(p, buffer);
  }

  // Save timing metadata
  fs.writeFileSync(
    path.join(outDir, "frame_timing.json"),
    JSON.stringify(buffers.map(b => ({ frame: b.index, captureTime: b.time })), null, 2)
  );

  const actualFps = frames / ((buffers[buffers.length-1]?.time || 1) / 1000);
  console.log(`Frames written. Actual capture rate: ${actualFps.toFixed(1)} fps`);
}

async function main() {
  const opts = parseArgs();
  const baseUrl = await detectViteBaseUrl();

  const timelineRoot = path.join(process.cwd(), "tools/ai/screenshots/timeline", dateFolder());
  const outDir = path.join(timelineRoot, `${nowStamp()}__${opts.label}`);
  ensureDir(outDir);

  const meta = {
    ts: new Date().toISOString(),
    baseUrl,
    mode: opts.mode,
    label: opts.label,
    headless: opts.headless,
    burstFrames: opts.burstFrames,
    burstIntervalMs: opts.burstIntervalMs,
    settleMs: opts.settleMs,
    viewport: { width: opts.viewportWidth, height: opts.viewportHeight, scale: opts.deviceScaleFactor },
  };

  // Launch Puppeteer (better WebGL support than Playwright)
  const browser = await puppeteer.launch({
    headless: opts.headless ? 'new' : false,
    args: [
      // Recommended config for macOS WebGL
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

  // Log console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('[PAGE ERROR]', msg.text());
    }
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  console.log('Page loaded');

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
    await sleep(400); // Extra wait for WebGL effect to initialize
  } else {
    await sleep(200);
  }

  // Capture frames
  await burstScreenshots(page, outDir, opts.burstFrames, opts.burstIntervalMs);

  await browser.close();

  meta.outDir = outDir;
  fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

  console.log("✅ CAPTURE COMPLETE");
  console.log("outDir:", outDir);
}

main().catch((e) => {
  console.error("❌ CAPTURE FAILED:", e?.message || e);
  process.exit(1);
});
