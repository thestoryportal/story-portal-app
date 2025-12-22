// Capture at peak electricity intensity
import { chromium } from 'playwright';
import fs from 'fs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function test() {
  const outDir = './tools/capture-electricity-peak';
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    args: []
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  console.log('Page loaded');

  await page.click('.new-topics-btn');
  console.log('Clicked - waiting 500ms for peak intensity');

  // Wait for peak intensity (effect ramps up 0-200ms, full at 200-2600ms)
  await sleep(500);

  // Rapid capture at peak
  for (let i = 0; i < 25; i++) {
    await page.screenshot({ path: `${outDir}/frame_${String(i).padStart(3, '0')}.png`, fullPage: true });
    await sleep(80);
  }

  console.log('Captured 25 frames');
  await browser.close();
  console.log('Done:', outDir);
}

test().catch(console.error);
