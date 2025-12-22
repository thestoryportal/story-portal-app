// Minimal electricity capture test - NO GPU args
import { chromium } from 'playwright';
import fs from 'fs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function test() {
  const outDir = './tools/capture-electricity-minimal';
  fs.mkdirSync(outDir, { recursive: true });

  // Launch with NO args - this worked in Puppeteer
  const browser = await chromium.launch({
    headless: true,
    args: []
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[ERROR]', msg.text());
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  console.log('Page loaded');

  await page.screenshot({ path: `${outDir}/01-before.png`, fullPage: true });

  await page.click('.new-topics-btn');
  console.log('Clicked New Topics');

  // Rapid capture
  for (let i = 0; i < 30; i++) {
    await page.screenshot({ path: `${outDir}/frame_${String(i).padStart(3, '0')}.png`, fullPage: true });
    await sleep(100);
  }

  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { found: false };
    const gl = canvas.getContext('webgl');
    return {
      found: true,
      hasContext: !!gl,
      width: canvas.width,
      height: canvas.height,
    };
  });
  console.log('Canvas:', canvasInfo);

  await browser.close();
  console.log(`Done. Check ${outDir}/`);
}

test().catch(console.error);
