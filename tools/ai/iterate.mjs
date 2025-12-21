import fs from "fs";
import path from "path";
import fg from "fast-glob";
import sharp from "sharp";
import { spawnSync } from "child_process";

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}/${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function openInVSCode(pathsToOpen) {
  // Uses VS Code CLI "code" if available
  spawnSync("code", ["-r", ...pathsToOpen], { stdio: "ignore" });
}

async function makeReviewSheet(runDir) {
  // Take first 12 png frames (or any burst frames you output)
  const imgs = await fg(["**/*.png"], { cwd: runDir, absolute: true });
  const frames = imgs
    .filter((p) => !p.endsWith("review.png"))
    .slice(0, 12);

  if (frames.length === 0) return null;

  const tileW = 320;
  const tileH = 180;
  const cols = 4;
  const rows = Math.ceil(frames.length / cols);

  const tiles = await Promise.all(
    frames.map(async (fp, i) => {
      const buf = await sharp(fp).resize(tileW, tileH, { fit: "cover" }).toBuffer();
      const x = (i % cols) * tileW;
      const y = Math.floor(i / cols) * tileH;
      return { input: buf, left: x, top: y };
    })
  );

  const outPath = path.join(runDir, "review.png");
  await sharp({
    create: {
      width: cols * tileW,
      height: rows * tileH,
      channels: 3,
      background: { r: 10, g: 10, b: 10 }
    }
  })
    .composite(tiles)
    .png()
    .toFile(outPath);

  return outPath;
}

function writeBundle(runDir, scenarioName, baseUrl) {
  const bundle = `# Story Portal Capture Bundle

## Scenario
- name: ${scenarioName}
- baseUrl: ${baseUrl}

## What we are iterating
- (fill this in: electricity / hamburger menu / rope sway / etc.)

## How to reproduce
- This capture was automated via scenario: tools/ai/scenarios/${scenarioName}.json

## Outputs
- review.png: quick visual summary
- other frames/videos in this folder

## Notes
- (add any notes)
`;
  fs.writeFileSync(path.join(runDir, "bundle.md"), bundle, "utf8");
}

function updateLatestPointer(runDir) {
  const latest = path.resolve("tools/ai/screenshots/LATEST.txt");
  fs.mkdirSync(path.dirname(latest), { recursive: true });
  fs.writeFileSync(latest, runDir + "\n", "utf8");
}

function readArgs() {
  const args = process.argv.slice(2);
  const scenario = args[0];
  if (!scenario) die("Usage: node tools/ai/iterate.mjs <scenarioName>");
  return { scenario };
}

async function main() {
  const { scenario } = readArgs();

  // Let your capture script auto-detect Vite port (you already built that)
  // We’ll call it and let it create the run folder (or we pass label/mode).
  const stamp = nowStamp();
  const today = stamp.split("/")[0];
  const leaf = stamp.split("/")[1];

  const runDir = path.resolve(
    `tools/ai/screenshots/timeline/${today}/${leaf}__${scenario}`
  );
  fs.mkdirSync(runDir, { recursive: true });

  // Run your existing capture command, pointed at this runDir + scenario.
  // Adjust these args to match your capture script.
  const res = spawnSync(
    "pnpm",
    [
      "capture",
      "--",
      "--mode",
      "buttons",
      "--label",
      scenario,
      "--scenario",
      `tools/ai/scenarios/${scenario}.json`,
      "--outDir",
      runDir
    ],
    { stdio: "inherit", env: { ...process.env, CAPTURE_OK: "1" } }
  );

  if (res.status !== 0) die("❌ capture failed");

  // Best-effort: read base url from your capture script output or store it
  const baseUrl = process.env.BASE_URL || "auto-detected";

  const review = await makeReviewSheet(runDir);
  writeBundle(runDir, scenario, baseUrl);
  updateLatestPointer(runDir);

  // Ensure latest.md exists
  const inbox = path.resolve("tools/ai/inbox/latest.md");
  if (!fs.existsSync(inbox)) {
    fs.mkdirSync(path.dirname(inbox), { recursive: true });
    fs.writeFileSync(
      inbox,
      `# NEXT PROMPT FOR CLAUDE\n\n- Goal:\n- What’s wrong:\n- Changes:\n- How to test:\n- What to capture next:\n`,
      "utf8"
    );
  }

  // Open the right things so you don’t browse/select
  const toOpen = [path.join(runDir, "bundle.md"), inbox];
  if (review) toOpen.unshift(review);
  openInVSCode(toOpen);

  console.log(`✅ Iteration ready: ${runDir}`);
}

main().catch((e) => die(String(e)));
