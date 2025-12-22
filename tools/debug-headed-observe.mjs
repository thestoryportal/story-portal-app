// debug-headed-observe.mjs - Opens headed browser to observe electricity effect
import puppeteer from 'puppeteer';

const URL = 'http://localhost:5173';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function observeEffect() {
  console.log('Opening headed browser to observe electricity effect...');
  console.log('Watch the browser window to see if the effect renders.');
  console.log('Press Ctrl+C to exit.\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--use-gl=egl',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--window-size=1400,900'
    ],
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Log console messages from the page
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warn') {
      console.log(`[PAGE ${type.toUpperCase()}]`, msg.text());
    }
  });

  await page.goto(URL, { waitUntil: 'networkidle0' });
  console.log('Page loaded. Waiting 2 seconds...');
  await sleep(2000);

  console.log('Clicking "New Topics" button to trigger electricity effect...');
  await page.click('.new-topics-btn');

  console.log('Effect triggered! Observing for 5 seconds...');
  console.log('>>> LOOK AT THE BROWSER WINDOW - do you see electricity bolts? <<<\n');

  // Keep browser open for observation
  await sleep(5000);

  // Take a screenshot at the end
  await page.screenshot({ path: './tools/capture-debug/headed-final.png' });
  console.log('Screenshot saved to: ./tools/capture-debug/headed-final.png');

  // Keep open a bit longer so user can see
  await sleep(2000);

  await browser.close();
  console.log('Done.');
}

observeEffect().catch(console.error);
