// Electricity capture with proper timing
import puppeteer from 'puppeteer';
import fs from 'fs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function test() {
  const outDir = './tools/capture-electricity-timed';
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: []
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[ERROR]', msg.text());
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  console.log('Page loaded');

  await page.screenshot({ path: `${outDir}/01-before.png`, fullPage: true });

  // Click and WAIT for React to mount the canvas
  await page.click('.new-topics-btn');
  console.log('Clicked New Topics');

  await sleep(300); // Wait for React state update + canvas mount + WebGL init

  // Check canvas now
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { found: false };
    const gl = canvas.getContext('webgl');
    return {
      found: true,
      hasContext: !!gl,
      width: canvas.width,
      height: canvas.height
    };
  });
  console.log('Canvas after 300ms wait:', canvasInfo);

  // Now capture frames
  for (let i = 0; i < 30; i++) {
    await page.screenshot({ path: `${outDir}/frame_${String(i).padStart(3, '0')}.png`, fullPage: true });
    await sleep(100);
  }

  await browser.close();
  console.log(`Done. Check ${outDir}/`);
}

test().catch(console.error);
