#!/usr/bin/env node
/**
 * Playwright-based screenshot/video capture pipeline for Story Portal
 * Usage: node tools/capture/capture.mjs --mode smoke|buttons [options]
 */

import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    label: "capture",
    mode: "smoke",
    headless: true,
    video: null, // auto-determined based on mode
    burstFrames: 18,
    burstIntervalMs: 60,
    settleMs: 900,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "--label":
        opts.label = next;
        i++;
        break;
      case "--mode":
        opts.mode = next;
        i++;
        break;
      case "--headless":
        opts.headless = next === "1" || next === "true";
        i++;
        break;
      case "--video":
        opts.video = next === "1" || next === "true";
        i++;
        break;
      case "--burstFrames":
        opts.burstFrames = parseInt(next, 10);
        i++;
        break;
      case "--burstIntervalMs":
        opts.burstIntervalMs = parseInt(next, 10);
        i++;
        break;
      case "--settleMs":
        opts.settleMs = parseInt(next, 10);
        i++;
        break;
    }
  }

  // Auto-determine video if not explicitly set
  if (opts.video === null) {
    opts.video = opts.mode === "buttons";
  }

  return opts;
}

// Detect running Vite dev server
async function detectVitePort() {
  // Check for BASE_URL override
  if (process.env.BASE_URL) {
    console.log(`Using BASE_URL override: ${process.env.BASE_URL}`);
    return process.env.BASE_URL;
  }

  const ports = [];
  for (let p = 5173; p <= 5185; p++) {
    ports.push(p);
  }

  for (const port of ports) {
    const url = `http://localhost:${port}`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (response.ok) {
        const html = await response.text();
        if (html.includes("/@vite/client")) {
          console.log(`Detected Vite dev server at: ${url}`);
          return url;
        }
      }
    } catch {
      // Port not available, continue
    }
  }

  throw new Error(
    "No Vite dev server detected on ports 5173-5185. Start with: pnpm dev"
  );
}

// Create output folder structure
async function createOutputFolder(label) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const timeStr = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .slice(0, 15); // YYYYMMDD_HHMMSS

  const folderName = `${timeStr}__${label}`;
  const outputDir = path.join(
    PROJECT_ROOT,
    "tools/ai/screenshots/timeline",
    dateStr,
    folderName
  );

  await fs.mkdir(path.join(outputDir, "frames"), { recursive: true });
  await fs.mkdir(path.join(outputDir, "video"), { recursive: true });

  return outputDir;
}

// Write metadata
async function writeMeta(outputDir, baseUrl, label, viewport, userAgent) {
  const meta = {
    baseUrl,
    label,
    timestamp: new Date().toISOString(),
    viewport,
    userAgent,
  };
  await fs.writeFile(
    path.join(outputDir, "meta.json"),
    JSON.stringify(meta, null, 2)
  );
}

// Screenshot helper
async function screenshot(page, outputDir, name) {
  const filePath = path.join(outputDir, "frames", `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  Screenshot: ${name}.png`);
  return filePath;
}

// Burst capture helper
async function burstCapture(page, outputDir, prefix, frames, intervalMs) {
  console.log(
    `  Burst capture: ${frames} frames at ${intervalMs}ms intervals`
  );
  for (let i = 0; i < frames; i++) {
    const name = `${prefix}_${String(i).padStart(3, "0")}`;
    await page.screenshot({
      path: path.join(outputDir, "frames", `${name}.png`),
      fullPage: true,
    });
    if (i < frames - 1) {
      await page.waitForTimeout(intervalMs);
    }
  }
}

// Launch browser with fallback
async function launchBrowser(headless, recordVideo, outputDir) {
  const launchOptions = {
    headless,
  };

  // Try Chrome channel first, fallback to default Chromium
  try {
    const browser = await chromium.launch({
      ...launchOptions,
      channel: "chrome",
    });
    console.log("Using Chrome browser");
    return browser;
  } catch {
    console.log("Chrome not available, using bundled Chromium");
    return await chromium.launch(launchOptions);
  }
}

// Create context with optional video
async function createContext(browser, recordVideo, outputDir) {
  const contextOptions = {
    viewport: { width: 1280, height: 720 },
  };

  if (recordVideo) {
    contextOptions.recordVideo = {
      dir: path.join(outputDir, "video"),
      size: { width: 1280, height: 720 },
    };
  }

  return await browser.newContext(contextOptions);
}

// Smoke mode: simple page load and screenshot
async function runSmokeMode(page, outputDir, baseUrl) {
  console.log("Running smoke mode...");

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  console.log("  Waiting for #root...");
  await page.waitForSelector("#root", { timeout: 10000, state: "attached" });

  // Wait for any of the main buttons
  console.log("  Waiting for main UI elements...");
  const buttonSelectors = [
    ".new-topics-btn",
    ".record-btn",
    ".spin-wheel-button",
  ];

  try {
    await Promise.race(
      buttonSelectors.map((sel) =>
        page.waitForSelector(sel, { timeout: 15000 })
      )
    );
  } catch {
    console.log("  Warning: Main buttons not found, continuing anyway...");
  }

  // Give CSS animations time to settle
  await page.waitForTimeout(500);

  await screenshot(page, outputDir, "000_home");
  console.log("Smoke mode complete!");
}

// Buttons mode: capture interaction sequences
async function runButtonsMode(page, outputDir, baseUrl, opts) {
  console.log("Running buttons mode...");

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#root", { timeout: 10000, state: "attached" });

  // Wait for UI to be ready
  const buttonSelectors = [
    ".new-topics-btn",
    ".record-btn",
    ".spin-wheel-button",
  ];
  try {
    await Promise.race(
      buttonSelectors.map((sel) =>
        page.waitForSelector(sel, { timeout: 15000 })
      )
    );
  } catch {
    console.log("  Warning: Main buttons not found, continuing anyway...");
  }

  await page.waitForTimeout(500);

  // Home screenshot
  await screenshot(page, outputDir, "000_home");

  // Button sequences to capture
  const sequences = [
    { name: "spin", selector: ".spin-wheel-button" },
    { name: "new_topics", selector: ".new-topics-btn" },
    { name: "record", selector: ".record-btn" },
    { name: "hamburger", selector: ".hamburger-menu-button" },
  ];

  let seqIndex = 1;
  for (const seq of sequences) {
    const prefix = String(seqIndex).padStart(2, "0");

    // Check if element exists
    const element = await page.$(seq.selector);
    if (!element) {
      console.log(`  Skipping ${seq.name}: selector not found`);
      continue;
    }

    console.log(`\n  Sequence: ${seq.name}`);

    // Before screenshot
    await screenshot(page, outputDir, `${prefix}_${seq.name}_before`);

    // Click and immediately start burst capture
    console.log(`  Clicking ${seq.selector}...`);

    // Use Promise.all to start burst capture right after click
    await element.click();

    // Burst capture
    await burstCapture(
      page,
      outputDir,
      `${prefix}_${seq.name}_burst`,
      opts.burstFrames,
      opts.burstIntervalMs
    );

    // Wait for settle time
    await page.waitForTimeout(opts.settleMs);

    // After screenshot
    await screenshot(page, outputDir, `${prefix}_${seq.name}_after`);

    // Reload page for next sequence to reset state
    if (seqIndex < sequences.length) {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#root", { timeout: 10000, state: "attached" });
      try {
        await Promise.race(
          buttonSelectors.map((sel) =>
            page.waitForSelector(sel, { timeout: 10000 })
          )
        );
      } catch {
        // Continue anyway
      }
      await page.waitForTimeout(500);
    }

    seqIndex++;
  }

  console.log("\nButtons mode complete!");
}

// Main execution
async function main() {
  const opts = parseArgs();
  console.log("Capture options:", opts);

  // Detect Vite server
  const baseUrl = await detectVitePort();

  // Create output folder
  const outputDir = await createOutputFolder(opts.label);
  console.log(`Output folder: ${outputDir}`);

  // Launch browser
  const browser = await launchBrowser(opts.headless, opts.video, outputDir);
  const context = await createContext(browser, opts.video, outputDir);
  const page = await context.newPage();

  // Get user agent for metadata
  const userAgent = await page.evaluate(() => navigator.userAgent);

  // Write metadata
  await writeMeta(
    outputDir,
    baseUrl,
    opts.label,
    { width: 1280, height: 720 },
    userAgent
  );

  try {
    // Run appropriate mode
    if (opts.mode === "smoke") {
      await runSmokeMode(page, outputDir, baseUrl);
    } else if (opts.mode === "buttons") {
      await runButtonsMode(page, outputDir, baseUrl, opts);
    } else {
      throw new Error(`Unknown mode: ${opts.mode}`);
    }
  } finally {
    // Close context to save video
    await context.close();
    await browser.close();
  }

  console.log(`\n========================================`);
  console.log(`Output folder: ${outputDir}`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error("Capture failed:", err.message);
  process.exit(1);
});
