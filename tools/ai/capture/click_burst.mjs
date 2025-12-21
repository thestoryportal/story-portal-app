import { chromium } from 'playwright';
import { mkdir, appendFile } from 'fs/promises';

const url = process.argv[2] ?? 'http://localhost:5173/';
const selector = process.argv[3] ?? '[data-testid="btn-spin"]';
const count = Number(process.argv[4] ?? 20);
const delayMs = Number(process.argv[5] ?? 80);

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = `docs/screenshots/bursts/${ts}_click_${selector.replace(/[^a-z0-9]+/gi,'_')}`;
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector(selector, { timeout: 10000 });
await page.click(selector);

for (let i = 1; i <= count; i++) {
  const name = String(i).padStart(3, '0');
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  await page.waitForTimeout(delayMs);
}

await browser.close();
await appendFile('docs/screenshot_timeline.txt',
  `${new Date().toISOString()} ${outDir} ${url} click=${selector} frames=${count} delayMs=${delayMs}\n`
);

console.log(`Saved click-burst: ${outDir}`);
