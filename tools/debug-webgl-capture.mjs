// Save as: tools/debug-webgl-capture.mjs
import puppeteer from 'puppeteer';
import fs from 'fs';

const URL = 'http://localhost:5173'; // Your dev server
const OUTPUT_DIR = './tools/capture-debug';

// Helper for waiting (waitForTimeout removed in newer Puppeteer)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function diagnoseCapture() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Basic page capture (no WebGL)
  console.log('Test 1: Basic page capture...');
  const browser1 = await puppeteer.launch({ headless: 'new' });
  const page1 = await browser1.newPage();
  await page1.goto(URL, { waitUntil: 'networkidle0' });
  await page1.screenshot({ path: `${OUTPUT_DIR}/test1-basic.png` });
  results.tests.push({ name: 'basic-capture', status: 'complete' });
  await browser1.close();

  // Test 2: With WebGL flags
  console.log('Test 2: With WebGL flags...');
  const browser2 = await puppeteer.launch({
    headless: 'new',
    args: [
      '--use-gl=egl',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ]
  });
  const page2 = await browser2.newPage();
  await page2.goto(URL, { waitUntil: 'networkidle0' });
  await sleep(2000); // Let animation run
  await page2.screenshot({ path: `${OUTPUT_DIR}/test2-webgl-flags.png` });
  results.tests.push({ name: 'webgl-flags', status: 'complete' });
  await browser2.close();

  // Test 3: Headed mode (visible browser)
  console.log('Test 3: Headed mode...');
  const browser3 = await puppeteer.launch({
    headless: false,
    args: ['--use-gl=egl', '--enable-webgl']
  });
  const page3 = await browser3.newPage();
  await page3.goto(URL, { waitUntil: 'networkidle0' });
  await sleep(2000);
  await page3.screenshot({ path: `${OUTPUT_DIR}/test3-headed.png` });
  results.tests.push({ name: 'headed-mode', status: 'complete' });
  await browser3.close();

  // Test 4: Canvas-specific capture
  console.log('Test 4: Canvas extraction...');
  const browser4 = await puppeteer.launch({
    headless: 'new',
    args: ['--use-gl=egl', '--enable-webgl']
  });
  const page4 = await browser4.newPage();
  await page4.goto(URL, { waitUntil: 'networkidle0' });
  await sleep(2000);

  // Try to extract canvas directly
  const canvasData = await page4.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas found' };
    try {
      return {
        dataUrl: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
        contextType: canvas.getContext('webgl2') ? 'webgl2' :
                     canvas.getContext('webgl') ? 'webgl' : 'unknown'
      };
    } catch (e) {
      return { error: e.message };
    }
  });

  if (canvasData.dataUrl) {
    const base64 = canvasData.dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(`${OUTPUT_DIR}/test4-canvas-extract.png`, base64, 'base64');
    results.tests.push({
      name: 'canvas-extract',
      status: 'complete',
      canvasSize: `${canvasData.width}x${canvasData.height}`,
      contextType: canvasData.contextType
    });
  } else {
    results.tests.push({
      name: 'canvas-extract',
      status: 'failed',
      error: canvasData.error
    });
  }
  await browser4.close();

  // Test 5: Check preserveDrawingBuffer
  console.log('Test 5: Check WebGL config...');
  const browser5 = await puppeteer.launch({ headless: 'new', args: ['--use-gl=egl'] });
  const page5 = await browser5.newPage();
  await page5.goto(URL, { waitUntil: 'networkidle0' });

  const webglConfig = await page5.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas' };

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No WebGL context' };

    return {
      preserveDrawingBuffer: gl.getContextAttributes()?.preserveDrawingBuffer,
      antialias: gl.getContextAttributes()?.antialias,
      alpha: gl.getContextAttributes()?.alpha,
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
    };
  });

  results.tests.push({ name: 'webgl-config', ...webglConfig });
  await browser5.close();

  // Summary
  console.log('\n=== DIAGNOSTIC RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  fs.writeFileSync(`${OUTPUT_DIR}/diagnostic-results.json`, JSON.stringify(results, null, 2));

  console.log(`\nScreenshots saved to: ${OUTPUT_DIR}/`);
  console.log('Review the images to identify which capture method works.');
}

diagnoseCapture().catch(console.error);
