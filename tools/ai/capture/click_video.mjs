import { chromium } from 'playwright';
import { mkdir, appendFile } from 'fs/promises';

const url = process.argv[2] ?? 'http://localhost:5173/';
const selector = process.argv[3] ?? '[data-testid="btn-spin"]';
const seconds = Number(process.argv[4] ?? 4);

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = `docs/videos/${ts}_clickvideo`;
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: outDir }
});
const page = await context.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector(selector, { timeout: 10000 });
await page.click(selector);
await page.waitForTimeout(seconds * 1000);

await context.close();
await browser.close();

await appendFile('docs/video_timeline.txt',
  `${new Date().toISOString()} ${outDir} ${url} click=${selector} seconds=${seconds}\n`
);

console.log(`Saved video folder: ${outDir}`);
