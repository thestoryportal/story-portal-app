#!/usr/bin/env node
/**
 * debug_framerate.mjs
 *
 * Runs browser WITHOUT screenshots to measure actual animation framerate
 */

import { chromium } from 'playwright';

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
        console.log(`  Clicked: ${sel}`);
        return true;
      }
    }
  }
  throw new Error('Could not find New Topics button');
}

async function main() {
  const baseUrl = await detectViteBaseUrl();

  console.log('');
  console.log('═'.repeat(50));
  console.log('  FRAMERATE DEBUG TEST (NO SCREENSHOTS)');
  console.log('═'.repeat(50));
  console.log(`  URL: ${baseUrl}`);
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
  page.on('console', msg => {
    if (msg.text().includes('[DEBUG]')) {
      console.log('  BROWSER:', msg.text());
    }
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  console.log('  Page loaded');

  // Wait for page to settle
  console.log('  Waiting 3s for settle...');
  await page.waitForTimeout(3000);

  // Ensure page is focused to prevent RAF throttling
  await page.bringToFront();
  await page.evaluate(() => {
    window.focus();
    document.body.focus();
  });

  // Click and wait for animation WITHOUT taking screenshots
  console.log('');
  console.log('⚡ Clicking New Topics button...');
  console.log('  (No screenshots - just measuring framerate)');
  console.log('');
  await clickNewTopics(page);

  // Wait for animation to complete (3 seconds + buffer)
  console.log('  Waiting 4s for animation to complete...');
  await page.waitForTimeout(4000);

  // Close browser
  await context.close();
  await browser.close();

  console.log('');
  console.log('═'.repeat(50));
  console.log('✅ TEST COMPLETE');
  console.log('═'.repeat(50));
  console.log('  Check console logs above for frame timing');
  console.log('');
}

main().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
