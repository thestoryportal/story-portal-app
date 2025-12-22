// Quick electricity capture test
import { chromium } from 'playwright';
import fs from 'fs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function test() {
  const outDir = './tools/capture-electricity-test';
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--enable-webgl2',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--force-device-scale-factor=1',
      '--high-dpi-support=1',
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800, deviceScaleFactor: 2 }
  });
  const page = await context.newPage();

  // Log errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[ERROR]', msg.text());
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  console.log('Page loaded');

  // Screenshot before click
  await page.screenshot({ path: `${outDir}/01-before.png`, fullPage: true });
  console.log('Before screenshot captured');

  // Click New Topics to trigger electricity
  await page.click('.new-topics-btn');
  console.log('Clicked New Topics');

  // Capture frames rapidly
  for (let i = 0; i < 30; i++) {
    await page.screenshot({ path: `${outDir}/frame_${String(i).padStart(3, '0')}.png`, fullPage: true });
    await sleep(100);
  }
  console.log('Captured 30 frames');

  // Check if canvas exists
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { found: false };
    return {
      found: true,
      width: canvas.width,
      height: canvas.height,
      visible: canvas.offsetParent !== null,
      style: canvas.style.cssText
    };
  });
  console.log('Canvas info:', canvasInfo);

  await browser.close();
  console.log(`Done. Check ${outDir}/`);
}

test().catch(console.error);
