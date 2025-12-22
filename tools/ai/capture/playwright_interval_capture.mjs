#!/usr/bin/env node
/**
 * playwright_interval_capture.mjs
 *
 * Takes screenshots at specific intervals after clicking the New Topics button
 * to capture the electricity effect at different stages.
 */

import fs from 'fs';
import path from 'path';
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
      const box = await el.boundingBox();
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.waitForTimeout(50);
        await page.mouse.up();
        return true;
      }
    }
  }
  throw new Error('Could not find New Topics button');
}

async function main() {
  const label = process.argv[2] || 'interval-capture';
  const baseUrl = await detectViteBaseUrl();

  const timelineRoot = path.join(process.cwd(), 'tools/ai/screenshots/timeline', dateFolder());
  const outDir = path.join(timelineRoot, `${nowStamp()}__${label}`);
  fs.mkdirSync(outDir, { recursive: true });

  console.log('');
  console.log('═'.repeat(50));
  console.log('  PLAYWRIGHT INTERVAL CAPTURE');
  console.log('═'.repeat(50));
  console.log(`  Output: ${outDir}`);
  console.log('');

  // Launch browser
  console.log('📱 Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    args: [
      // GPU/WebGL settings (macOS compatible)
      '--enable-webgl',
      '--enable-webgl2',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
      // Stability
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      // Consistent rendering
      '--force-device-scale-factor=1',
      '--high-dpi-support=1',
    ]
  });

  const context = await browser.newContext({
    viewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,  // Retina capture
    }
  });
  const page = await context.newPage();

  // Capture console logs from browser
  const consoleLogs = [];
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(text);
    if (msg.text().includes('[DEBUG]')) {
      console.log('  BROWSER:', msg.text());
    }
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  console.log('  Page loaded');

  // Wait for page to settle
  console.log('  Waiting 3s for settle...');
  await page.waitForTimeout(3000);

  // Take pre-click screenshot
  console.log('📸 Taking pre-click screenshot...');
  await page.screenshot({ path: path.join(outDir, '00_pre_click.png') });

  // Click and immediately start capturing
  console.log('⚡ Clicking New Topics button...');
  const clickTime = Date.now();
  await clickNewTopics(page);

  // Capture at specific intervals: 0, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000ms
  const intervals = [0, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 3500];

  for (const targetMs of intervals) {
    const elapsed = Date.now() - clickTime;
    const waitTime = Math.max(0, targetMs - elapsed);

    if (waitTime > 0) {
      await page.waitForTimeout(waitTime);
    }

    const actualElapsed = Date.now() - clickTime;
    const filename = `${String(targetMs).padStart(4, '0')}ms_actual${actualElapsed}ms.png`;
    await page.screenshot({ path: path.join(outDir, filename) });
    console.log(`  📸 ${targetMs}ms (actual: ${actualElapsed}ms)`);
  }

  // Close browser
  await context.close();
  await browser.close();

  console.log('');
  console.log('═'.repeat(50));
  console.log('✅ CAPTURE COMPLETE');
  console.log('═'.repeat(50));
  console.log(`  Output: ${outDir}`);
  console.log('');
}

main().catch(err => {
  console.error('❌ Capture failed:', err.message);
  process.exit(1);
});
