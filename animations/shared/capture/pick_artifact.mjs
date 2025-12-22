import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function newestDir(base) {
  const dirs = fs.readdirSync(base)
    .map(name => ({ name, p: path.join(base, name) }))
    .filter(x => fs.statSync(x.p).isDirectory())
    .sort((a,b) => fs.statSync(b.p).mtimeMs - fs.statSync(a.p).mtimeMs);
  if (!dirs.length) throw new Error(`No capture dirs under: ${base}`);
  return dirs[0].p;
}

function newestTimelineRoot() {
  const root = path.resolve("animations/output/screenshots/timeline");
  const dayDirs = fs.readdirSync(root)
    .map(name => ({ name, p: path.join(root, name) }))
    .filter(x => fs.existsSync(x.p) && fs.statSync(x.p).isDirectory())
    .sort((a,b) => fs.statSync(b.p).mtimeMs - fs.statSync(a.p).mtimeMs);
  if (!dayDirs.length) throw new Error(`No day dirs under: ${root}`);
  return newestDir(dayDirs[0].p);
}

function hasCmd(cmd) {
  try { execSync(`command -v ${cmd}`, { stdio: "ignore" }); return true; }
  catch { return false; }
}

function findGifInDir(dir) {
  const files = fs.readdirSync(dir);
  const gifs = files.filter(f => f.toLowerCase().endsWith(".gif"));
  if (!gifs.length) return null;
  gifs.sort((a,b) => fs.statSync(path.join(dir,b)).mtimeMs - fs.statSync(path.join(dir,a)).mtimeMs);
  return path.join(dir, gifs[0]);
}

function makeGifFromVideo(videoPath, outGifPath) {
  if (!hasCmd("ffmpeg")) return { ok:false, reason:"ffmpeg not found" };

  const palette = outGifPath.replace(/\.gif$/i, ".palette.png");
  // Good default: decent quality, not gigantic
  const fps = 18;
  const scaleW = 900;

  // 2-pass palette method = much better quality than naive gif conversion
  execSync(
    `ffmpeg -y -i "${videoPath}" -vf "fps=${fps},scale=${scaleW}:-1:flags=lanczos:force_original_aspect_ratio=decrease,palettegen" "${palette}"`,
    { stdio: "ignore" }
  );
  execSync(
    `ffmpeg -y -i "${videoPath}" -i "${palette}" -filter_complex "fps=${fps},scale=${scaleW}:-1:flags=lanczos:force_original_aspect_ratio=decrease[x];[x][1:v]paletteuse=dither=sierra2_4a" -loop 0 "${outGifPath}"`,
    { stdio: "ignore" }
  );

  try { fs.unlinkSync(palette); } catch {}
  return { ok:true };
}

const captureDir = process.argv[2] ? path.resolve(process.argv[2]) : newestTimelineRoot();
const metaPath = path.join(captureDir, "meta.json");
if (!fs.existsSync(metaPath)) throw new Error(`meta.json not found in ${captureDir}`);

const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

// 1) If meta.gifPath exists AND file exists, use it
if (meta.gifPath && fs.existsSync(meta.gifPath)) {
  console.log(JSON.stringify({ captureDir, best: meta.gifPath, metaPath }, null, 2));
  process.exit(0);
}

// 2) If any gif exists in folder, prefer newest
const existingGif = findGifInDir(captureDir);
if (existingGif) {
  meta.gifPath = existingGif;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
  console.log(JSON.stringify({ captureDir, best: existingGif, metaPath }, null, 2));
  process.exit(0);
}

// 3) Otherwise, try to create capture.gif from video if available
const video = meta.videoPath && fs.existsSync(meta.videoPath) ? meta.videoPath : null;
if (video) {
  const outGif = path.join(captureDir, "capture.gif");
  const res = makeGifFromVideo(video, outGif);

  if (res.ok && fs.existsSync(outGif)) {
    meta.gifPath = outGif;
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
    console.log(JSON.stringify({ captureDir, best: outGif, metaPath }, null, 2));
    process.exit(0);
  }
}

// 4) Fallbacks: video -> first burst frame -> null
const best =
  (meta.videoPath && fs.existsSync(meta.videoPath) ? meta.videoPath : null) ||
  (meta.burstFrames && meta.burstFrames.find(f => fs.existsSync(f))) ||
  null;

console.log(JSON.stringify({ captureDir, best, metaPath }, null, 2));
