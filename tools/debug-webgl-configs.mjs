// debug-webgl-configs.mjs - Test different WebGL configurations
import puppeteer from 'puppeteer';
import fs from 'fs';

const URL = 'http://localhost:5173';
const OUTPUT_DIR = './tools/capture-debug-configs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const configs = [
  {
    name: 'default',
    args: []
  },
  {
    name: 'egl',
    args: ['--use-gl=egl', '--enable-webgl', '--ignore-gpu-blocklist']
  },
  {
    name: 'swiftshader',
    args: ['--use-gl=swiftshader', '--enable-webgl']
  },
  {
    name: 'angle',
    args: ['--use-gl=angle', '--use-angle=default', '--enable-webgl', '--ignore-gpu-blocklist']
  },
  {
    name: 'gpu-enabled',
    args: [
      '--enable-gpu',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--enable-accelerated-2d-canvas',
      '--disable-gpu-sandbox'
    ]
  },
  {
    name: 'force-gpu',
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--enable-unsafe-swiftshader',
      '--disable-software-rasterizer'
    ]
  }
];

async function testConfig(config) {
  console.log(`\nTesting config: ${config.name}`);
  console.log(`  Args: ${config.args.join(' ') || '(none)'}`);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: config.args
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Capture errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(URL, { waitUntil: 'networkidle0' });

    // Check WebGL support
    const webglInfo = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (!gl) return { supported: false };

      return {
        supported: true,
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      };
    });

    console.log(`  WebGL supported: ${webglInfo.supported}`);
    if (webglInfo.supported) {
      console.log(`  Renderer: ${webglInfo.renderer}`);
      console.log(`  Vendor: ${webglInfo.vendor}`);
    }

    // Click new topics and capture
    await page.click('.new-topics-btn');
    await sleep(500); // Wait for effect to start

    // Check if canvas has WebGL content
    const canvasCheck = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { found: false };

      const gl = canvas.getContext('webgl');
      if (!gl) return { found: true, hasContext: false };

      // Read a pixel to see if anything is rendered
      const pixels = new Uint8Array(4);
      gl.readPixels(200, 200, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      return {
        found: true,
        hasContext: true,
        centerPixel: Array.from(pixels),
        hasContent: pixels[0] > 0 || pixels[1] > 0 || pixels[2] > 0 || pixels[3] > 0
      };
    });

    console.log(`  Canvas found: ${canvasCheck.found}`);
    if (canvasCheck.found) {
      console.log(`  Has WebGL context: ${canvasCheck.hasContext}`);
      console.log(`  Has content: ${canvasCheck.hasContent}`);
      if (canvasCheck.centerPixel) {
        console.log(`  Center pixel RGBA: [${canvasCheck.centerPixel.join(', ')}]`);
      }
    }

    // Screenshot
    await page.screenshot({ path: `${OUTPUT_DIR}/${config.name}.png` });
    console.log(`  Screenshot: ${config.name}.png`);

    if (errors.length > 0) {
      console.log(`  Errors: ${errors.join(', ')}`);
    }

    await browser.close();

    return {
      config: config.name,
      webglSupported: webglInfo.supported,
      renderer: webglInfo.renderer,
      canvasHasContent: canvasCheck.hasContent,
      errors
    };

  } catch (err) {
    console.log(`  FAILED: ${err.message}`);
    return { config: config.name, error: err.message };
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Testing WebGL configurations in Puppeteer...\n');

  const results = [];
  for (const config of configs) {
    const result = await testConfig(config);
    results.push(result);
  }

  console.log('\n=== SUMMARY ===');
  results.forEach(r => {
    const status = r.canvasHasContent ? '✅ WORKS' : r.webglSupported ? '⚠️  WebGL OK but no content' : '❌ No WebGL';
    console.log(`${status} - ${r.config}: ${r.renderer || r.error || 'unknown'}`);
  });

  fs.writeFileSync(`${OUTPUT_DIR}/results.json`, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${OUTPUT_DIR}/results.json`);
}

main().catch(console.error);
