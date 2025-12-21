import { chromium } from 'playwright';
import { mkdir, appendFile } from 'fs/promises';

const url = process.argv[2] ?? 'http://localhost:5173/';
const selectorsCsv = process.argv[3] ?? '[data-testid="btn-hamburger"],[data-testid="menu-item-how-to-play"]';
const selectors = selectorsCsv.split(',').map(s => s.trim());
const count = Number(process.argv[4] ?? 30);
const delayMs = Number(process.argv[5] ?? 50);
const betweenClicksMs = Number(process.argv[6] ?? 150);

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = `docs/screenshots/bursts/${ts}_sequence`;
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(url, { waitUntil: 'networkidle' });

for (const sel of selectors) {
  await page.waitForSelector(sel, { timeout: 10000 });
  await page.click(sel);
  await page.waitForTimeout(betweenClicksMs);
}

for (let i = 1; i <= count; i++) {
  const name = String(i).padStart(3, '0');
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  await page.waitForTimeout(delayMs);
}

await browser.close();

await appendFile('docs/screenshot_timeline.txt',
  `${new Date().toISOString()} ${outDir} ${url} sequence=${selectors.join('->')} frames=${count} delayMs=${delayMs}\n`
);

console.log(`Saved sequence burst: ${outDir}`);
