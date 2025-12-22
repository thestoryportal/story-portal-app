// debug-webgl-capture-v2.mjs - Triggers electricity effect then captures
import puppeteer from 'puppeteer';
import fs from 'fs';

const URL = 'http://localhost:5173';
const OUTPUT_DIR = './tools/capture-debug-v2';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function diagnoseWithEffect() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test: Trigger electricity effect and capture
  console.log('Test: Triggering electricity effect...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--use-gl=egl',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto(URL, { waitUntil: 'networkidle0' });
  console.log('  Page loaded');

  // Screenshot before clicking
  await page.screenshot({ path: `${OUTPUT_DIR}/01-before-click.png` });
  console.log('  Captured: before-click');

  // Find and click the New Topics button
  const newTopicsBtn = await page.$('.new-topics-btn');
  if (!newTopicsBtn) {
    console.log('  ERROR: New Topics button not found');
    results.tests.push({ name: 'find-button', status: 'failed', error: 'Button not found' });
    await browser.close();
    return;
  }

  console.log('  Clicking New Topics button...');
  await newTopicsBtn.click();

  // Capture burst immediately after click
  console.log('  Capturing burst frames...');
  for (let i = 0; i < 30; i++) {
    await page.screenshot({ path: `${OUTPUT_DIR}/burst_${String(i).padStart(3, '0')}.png` });
    await sleep(100); // 100ms intervals = 10fps for 3 seconds
  }

  // Check if canvas appeared
  const canvasCheck = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { found: false };

    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    return {
      found: true,
      width: canvas.width,
      height: canvas.height,
      visible: canvas.offsetParent !== null,
      style: {
        display: canvas.style.display,
        visibility: canvas.style.visibility,
        opacity: canvas.style.opacity,
      },
      hasContext: !!gl,
      contextAttrs: gl ? gl.getContextAttributes() : null,
    };
  });

  console.log('  Canvas check:', JSON.stringify(canvasCheck, null, 2));
  results.tests.push({ name: 'canvas-after-click', ...canvasCheck });

  // If canvas found, try to extract it
  if (canvasCheck.found && canvasCheck.hasContext) {
    const canvasData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      try {
        return { dataUrl: canvas.toDataURL('image/png') };
      } catch (e) {
        return { error: e.message };
      }
    });

    if (canvasData.dataUrl) {
      const base64 = canvasData.dataUrl.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(`${OUTPUT_DIR}/canvas-extract.png`, base64, 'base64');
      results.tests.push({ name: 'canvas-extract', status: 'success' });
      console.log('  Canvas extracted successfully');
    } else {
      results.tests.push({ name: 'canvas-extract', status: 'failed', error: canvasData.error });
      console.log('  Canvas extract failed:', canvasData.error);
    }
  }

  // Final screenshot
  await page.screenshot({ path: `${OUTPUT_DIR}/99-final.png` });

  await browser.close();

  // Summary
  console.log('\n=== DIAGNOSTIC RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  fs.writeFileSync(`${OUTPUT_DIR}/results.json`, JSON.stringify(results, null, 2));

  console.log(`\nScreenshots saved to: ${OUTPUT_DIR}/`);
  console.log('Check burst_*.png files for electricity animation frames.');
}

diagnoseWithEffect().catch(console.error);
