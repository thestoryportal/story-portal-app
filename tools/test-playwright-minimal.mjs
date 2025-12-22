// Minimal Playwright electricity test - NO CSS modifications
import { chromium } from 'playwright';
import fs from 'fs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function test() {
  const outDir = './tools/capture-playwright-minimal';
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({
    headless: false,  // Headed to see what's happening
    args: []
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[${msg.type()}]`, msg.text());
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  console.log('Page loaded');

  await page.screenshot({ path: `${outDir}/01-before.png`, fullPage: true });

  await page.click('.new-topics-btn');
  console.log('Clicked');

  await sleep(300);  // Wait for React

  // Check canvas
  const info = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return { found: false };
    const gl = c.getContext('webgl');
    return { found: true, hasGL: !!gl, w: c.width, h: c.height };
  });
  console.log('Canvas:', info);

  // Capture
  for (let i = 0; i < 20; i++) {
    await page.screenshot({ path: `${outDir}/frame_${String(i).padStart(3, '0')}.png`, fullPage: true });
    await sleep(100);
  }

  await sleep(2000);  // Keep browser open to observe
  await browser.close();
  console.log('Done:', outDir);
}

test().catch(console.error);
