// debug-webgl-capture-v3.mjs - Debug React state during electricity trigger
import puppeteer from 'puppeteer';
import fs from 'fs';

const URL = 'http://localhost:5173';
const OUTPUT_DIR = './tools/capture-debug-v3';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function diagnoseWithStateCheck() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Starting diagnostic with state monitoring...');

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

  // Inject debug hooks before page load
  await page.evaluateOnNewDocument(() => {
    window.__DEBUG__ = {
      canvasCreated: false,
      canvasVisible: false,
      electricityStartCalled: false,
      electricityEndCalled: false,
      logs: []
    };

    // Intercept canvas creation
    const origCreateElement = document.createElement.bind(document);
    document.createElement = function(tagName, options) {
      const el = origCreateElement(tagName, options);
      if (tagName.toLowerCase() === 'canvas') {
        window.__DEBUG__.canvasCreated = true;
        window.__DEBUG__.logs.push(`Canvas created at ${Date.now()}`);
      }
      return el;
    };
  });

  await page.goto(URL, { waitUntil: 'networkidle0' });
  console.log('  Page loaded');

  // Check initial state
  const initialState = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll('canvas').length,
    debug: window.__DEBUG__
  }));
  console.log('  Initial state:', JSON.stringify(initialState, null, 2));

  // Screenshot before
  await page.screenshot({ path: `${OUTPUT_DIR}/01-before.png` });

  // Click New Topics
  console.log('  Clicking New Topics...');
  await page.click('.new-topics-btn');

  // Monitor for 3 seconds with frequent checks
  const stateHistory = [];
  for (let i = 0; i < 60; i++) {
    const state = await page.evaluate(() => ({
      time: Date.now(),
      canvasCount: document.querySelectorAll('canvas').length,
      canvasInDOM: !!document.querySelector('canvas'),
      debug: window.__DEBUG__
    }));
    stateHistory.push(state);

    // Screenshot at key intervals
    if (i === 0 || i === 5 || i === 10 || i === 20 || i === 40 || i === 59) {
      await page.screenshot({ path: `${OUTPUT_DIR}/frame_${String(i).padStart(3, '0')}.png` });
    }

    await sleep(50); // Check every 50ms
  }

  // Find when canvas appeared/disappeared
  const canvasAppeared = stateHistory.find(s => s.canvasCount > 0);
  const canvasDisappeared = stateHistory.find((s, i) => i > 0 && stateHistory[i-1].canvasCount > 0 && s.canvasCount === 0);

  console.log('\n=== STATE ANALYSIS ===');
  console.log('Canvas appeared:', canvasAppeared ? `at index ${stateHistory.indexOf(canvasAppeared)}` : 'NEVER');
  console.log('Canvas disappeared:', canvasDisappeared ? `at index ${stateHistory.indexOf(canvasDisappeared)}` : 'N/A');
  console.log('Max canvas count:', Math.max(...stateHistory.map(s => s.canvasCount)));

  // Final state
  const finalState = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll('canvas').length,
    debug: window.__DEBUG__,
    // Try to find React fiber for debugging
    reactRoot: !!document.getElementById('root')?._reactRootContainer
  }));
  console.log('Final state:', JSON.stringify(finalState, null, 2));

  // Save full history
  fs.writeFileSync(`${OUTPUT_DIR}/state-history.json`, JSON.stringify({
    initialState,
    stateHistory: stateHistory.slice(0, 10).concat(['... truncated ...'], stateHistory.slice(-5)),
    finalState,
    canvasAppeared: canvasAppeared ? stateHistory.indexOf(canvasAppeared) : null
  }, null, 2));

  await browser.close();
  console.log(`\nResults saved to: ${OUTPUT_DIR}/`);
}

diagnoseWithStateCheck().catch(console.error);
