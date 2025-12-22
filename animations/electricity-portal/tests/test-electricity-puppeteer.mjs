// Electricity capture with Puppeteer (known to work)
import puppeteer from 'puppeteer';
import fs from 'fs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function test() {
  const outDir = './tools/capture-electricity-puppeteer';
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: []  // No GPU args - this worked earlier
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[ERROR]', msg.text());
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  console.log('Page loaded');

  await page.screenshot({ path: `${outDir}/01-before.png`, fullPage: true });

  await page.click('.new-topics-btn');
  console.log('Clicked New Topics');

  // Rapid capture
  for (let i = 0; i < 30; i++) {
    await page.screenshot({ path: `${outDir}/frame_${String(i).padStart(3, '0')}.png`, fullPage: true });

    // Check for canvas during capture
    if (i === 5) {
      const canvasInfo = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { found: false };
        return { found: true, width: canvas.width, height: canvas.height };
      });
      console.log('Canvas at frame 5:', canvasInfo);
    }

    await sleep(100);
  }

  await browser.close();
  console.log(`Done. Check ${outDir}/`);
}

test().catch(console.error);
