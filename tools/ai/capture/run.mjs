import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { chromium } from "playwright";

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
    video: null,              // auto if null
    burstFrames: 18,
    burstIntervalMs: 60,
    settleMs: 900,
    gif: null,        // auto if null
    gifFps: 20,
    gifWidth: 960,
    viewportWidth: 2560,      // MacBook Pro 13" native width
    viewportHeight: 1600,     // MacBook Pro 13" native height
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const n = args[i+1];
    switch (a) {
      case "--label": opts.label = n; i++; break;
      case "--mode": opts.mode = n; i++; break;
      case "--headless": opts.headless = (n === "1" || n === "true"); i++; break;
      case "--video": opts.video = (n === "1" || n === "true"); i++; break;
      case "--burstFrames": opts.burstFrames = parseInt(n, 10); i++; break;
      case "--burstIntervalMs": opts.burstIntervalMs = parseInt(n, 10); i++; break;
      case "--settleMs": opts.settleMs = parseInt(n, 10); i++; break;
      case "--gif": opts.gif = (n === "1" || n === "true"); i++; break;
      case "--gifFps": opts.gifFps = parseInt(n, 10); i++; break;
      case "--gifWidth": opts.gifWidth = parseInt(n, 10); i++; break;
      case "--viewportWidth": opts.viewportWidth = parseInt(n, 10); i++; break;
      case "--viewportHeight": opts.viewportHeight = parseInt(n, 10); i++; break;
    }
  }
  if (opts.video === null) opts.video = (opts.mode !== "smoke"); // clicks usually benefit from video
  if (opts.gif === null) opts.gif = opts.video; // if we captured video, also make a gif by default
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

async function maybeClickForMode(page, mode) {
  // Prefer testids if you add them later; fall back to existing classnames.
  const selectors = {
    "newtopics": ['[data-testid="btn-new-topics"]', ".new-topics-btn"],
    "menu-open": ['[data-testid="btn-menu"]', ".hamburger-menu-button"],
    "menu-close": ['[data-testid="btn-menu"]', ".hamburger-menu-button"],
    "buttons": [
      '[data-testid="btn-new-topics"]', ".new-topics-btn",
      '[data-testid="btn-menu"]', ".hamburger-menu-button",
      '[data-testid="btn-spin"]', ".spin-wheel-button",
    ],
  };

  const clickOne = async (sel) => {
    const el = await page.$(sel);
    if (!el) return false;
    await el.click({ timeout: 5000, noWaitAfter: true, force: true });
    return true;
  };

  if (mode === "smoke") return;

  if (mode === "newtopics") {
    for (const s of selectors.newtopics) if (await clickOne(s)) return;
    throw new Error("Could not find New Topics button to click (add testid or confirm .new-topics-btn exists).");
  }

  if (mode === "menu-open") {
    for (const s of selectors["menu-open"]) if (await clickOne(s)) return;
    throw new Error("Could not find hamburger/menu button to click.");
  }

  if (mode === "menu-close") {
    // open then close
    let opened = false;
    for (const s of selectors["menu-open"]) { if (await clickOne(s)) { opened = true; break; } }
    if (!opened) throw new Error("Could not open menu (menu button not found).");
    await page.waitForTimeout(650);
    let closed = false;
    for (const s of selectors["menu-open"]) { if (await clickOne(s)) { closed = true; break; } }
    if (!closed) throw new Error("Could not close menu (menu button not found).");
    return;
  }

  if (mode === "buttons") {
    // Best-effort: click whatever exists, don’t fail hard.
    for (const s of selectors.buttons) {
      const el = await page.$(s);
      if (!el) continue;
      await el.click().catch(()=>{});
      await page.waitForTimeout(450);
    }
    return;
  }
}

async function burstScreenshots(page, outDir, frames, intervalMs) {
  // Buffer screenshots in memory to eliminate I/O lag during animation
  const buffers = [];
  const startTime = Date.now();

  console.log(`Capturing ${frames} frames (buffered in memory)...`);

  // Try to find portal element for focused capture (much faster than full page)
  const portalElement = await page.$('.wheel-container, .portal-container, [data-capture="portal"]');

  if (portalElement) {
    console.log('Using focused element capture (faster)');
  } else {
    console.log('Using full page capture (slower)');
  }

  for (let i = 0; i < frames; i++) {
    let buffer;
    if (portalElement) {
      // Capture just the portal element - much faster
      buffer = await portalElement.screenshot();
    } else {
      // Fallback to full page
      buffer = await page.screenshot({ fullPage: true });
    }
    buffers.push({ index: i, buffer, time: Date.now() - startTime });
    await page.waitForTimeout(intervalMs);
  }

  console.log(`Writing ${buffers.length} frames to disk...`);

  // Write all frames to disk after capture completes
  for (const { index, buffer } of buffers) {
    const p = path.join(outDir, `frame_${String(index).padStart(3,"0")}.png`);
    fs.writeFileSync(p, buffer);
  }

  // Save timing metadata
  const timingPath = path.join(outDir, "frame_timing.json");
  fs.writeFileSync(timingPath, JSON.stringify(buffers.map(b => ({
    frame: b.index,
    captureTime: b.time
  })), null, 2));

  console.log(`Frames written. Actual capture rate: ${(frames / ((buffers[buffers.length-1]?.time || 1) / 1000)).toFixed(1)} fps`);
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
    video: opts.video,
    burstFrames: opts.burstFrames,
    burstIntervalMs: opts.burstIntervalMs,
    settleMs: opts.settleMs,
  };

  const browser = await chromium.launch({
    headless: opts.headless,
    args: [
      '--use-gl=egl',           // Enable GPU/WebGL in headless
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--start-maximized',
    ]
  });
  const contextOptions = {
    viewport: null,  // Use browser's natural maximized size
  };
  if (opts.video) {
    contextOptions.recordVideo = { dir: outDir };
  }
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  await page.goto(baseUrl, { waitUntil: "networkidle" });

  // AGGRESSIVE: Hide everything except portal wheel and electricity effect
  // This dramatically reduces rendering load during capture
  await page.addStyleTag({
    content: `
      /* Disable all transitions */
      * { transition: none !important; }

      /* Hide background - just show solid color */
      body {
        background: #1a1a1a !important;
        background-image: none !important;
      }
      .wheel-view-wrapper {
        background: #1a1a1a !important;
        background-image: none !important;
      }

      /* Hide all steam effects */
      .steam-wisp, .steam-particle, [class*="steam"], [style*="steam"] {
        display: none !important;
        visibility: hidden !important;
      }

      /* Hide effect controls, buttons, sidebar elements */
      .effect-controls, [class*="effect-control"], .control-panel,
      .image-button, .sidebar-buttons, .hamburger-menu-button,
      .how-to-play-btn, .my-stories-btn, .record-btn,
      [class*="btn"]:not(.new-topics-btn) {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* Keep New Topics button visible for click but minimal */
      .new-topics-btn {
        opacity: 0.01 !important;
      }

      /* Disable all CSS animations except electricity */
      .pipe-shine, .gauge-needle, .pressure-meter, .rust-particle,
      [class*="shine"], [class*="glow"]:not([class*="electric"]) {
        animation: none !important;
      }

      /* Hide decorative pipes and edges outside portal */
      .decorative-pipes, .edge-decoration, .corner-element {
        display: none !important;
      }
    `
  });

  // Stop steam and non-essential animations via JavaScript
  await page.evaluate(() => {
    // Remove steam elements completely
    document.querySelectorAll('[class*="steam"]').forEach(el => el.remove());

    // Pause any CSS animations on non-portal elements
    document.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el);
      if (style.animationName && style.animationName !== 'none' &&
          !el.classList.contains('wheel-cylinder') &&
          !el.closest('canvas')) {
        el.style.animationPlayState = 'paused';
      }
    });
  });

  // Wait for layout to fully stabilize
  await page.waitForTimeout(opts.settleMs);

  await maybeClickForMode(page, opts.mode);
  // Start capturing immediately after click
  await burstScreenshots(page, outDir, opts.burstFrames, opts.burstIntervalMs);

  // finalize video
  let videoPath = null;
  if (opts.video && page.video()) {
    await page.waitForTimeout(600);
    await page.close();
    videoPath = await page.video().path();
  }

  await context.close();
  await browser.close();

  meta.outDir = outDir;
  meta.videoPath = videoPath;

  let gifPath = null;
  if (opts.gif && videoPath) {
    gifPath = path.join(outDir, "capture.gif");
    const r = spawnSync("bash", ["tools/ai/video_to_gif.sh", videoPath, gifPath, String(opts.gifFps), String(opts.gifWidth)], {
      stdio: "inherit",
    });
    if (r.status !== 0) {
      console.warn("⚠️ GIF conversion failed (ffmpeg missing or error). Keeping video only.");
      gifPath = null;
    }
  }
  meta.gifPath = gifPath;

  fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

  console.log("✅ CAPTURE COMPLETE");
  console.log("outDir:", outDir);
  if (videoPath) console.log("video:", videoPath);
}

main().catch((e) => {
  console.error("❌ CAPTURE FAILED:", e?.message || e);
  process.exit(1);
});
