/**
 * llava-analyze.mjs
 *
 * LLaVA vision-language model integration for natural language diff descriptions.
 * Uses Ollama to run LLaVA locally for analyzing animation frames.
 *
 * Usage:
 *   import { analyzeLLaVA, analyzeLLaVASelective } from './llava-analyze.mjs';
 *
 *   // Single image analysis
 *   const desc = await analyzeLLaVA(imagePath, prompt);
 *
 *   // Selective analysis (best + worst frames)
 *   const results = await analyzeLLaVASelective(frames, referenceFrame, options);
 *
 * Prerequisites:
 *   - Install Ollama: https://ollama.ai
 *   - Pull model: ollama pull llava-llama3
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default model - llava-llama3 is recommended for quality
const DEFAULT_MODEL = 'llava-llama3';

// Fallback models in order of preference
const FALLBACK_MODELS = ['llava:13b', 'llava:7b', 'llava'];

// Default prompts for animation analysis
export const PROMPTS = {
  frameAnalysis: `Analyze this animation frame. Describe:
1. The visual elements visible (bolts, particles, glow effects)
2. The brightness and intensity level
3. The color palette and any color variations
4. The overall quality and clarity

Be concise (2-3 sentences).`,

  frameDiff: `Compare these two animation frames. The first is a reference frame showing the target look. The second is a captured frame to evaluate.

Describe:
1. How well does the captured frame match the reference?
2. What differences do you see in brightness, color, or effects?
3. What specific improvements would make them match better?

Be specific and actionable (3-4 sentences).`,

  batchSummary: `You are analyzing animation frames for visual quality. Based on the individual frame analyses provided, write a concise summary that:
1. Identifies which frames match the reference best
2. Notes common issues across frames
3. Suggests specific adjustments to improve overall match

Keep it actionable for a developer tuning animation parameters.`
};

/**
 * Check if Ollama is installed and running
 */
export async function isOllamaAvailable() {
  try {
    await execAsync('which ollama');
    // Check if service is running
    const { stdout } = await execAsync('ollama list 2>/dev/null');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a specific model is available
 */
export async function isModelAvailable(model = DEFAULT_MODEL) {
  try {
    const { stdout } = await execAsync('ollama list');
    return stdout.toLowerCase().includes(model.toLowerCase().split(':')[0]);
  } catch {
    return false;
  }
}

/**
 * Get the best available LLaVA model
 */
export async function getBestAvailableModel() {
  // Check default first
  if (await isModelAvailable(DEFAULT_MODEL)) {
    return DEFAULT_MODEL;
  }

  // Try fallbacks
  for (const model of FALLBACK_MODELS) {
    if (await isModelAvailable(model)) {
      return model;
    }
  }

  return null;
}

/**
 * Start Ollama service if not running
 */
export async function ensureOllamaRunning() {
  const available = await isOllamaAvailable();
  if (available) return true;

  try {
    // Try to start Ollama in background
    exec('ollama serve &');
    // Wait a bit for it to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await isOllamaAvailable();
  } catch {
    return false;
  }
}

/**
 * Analyze a single image with LLaVA
 *
 * @param {string} imagePath - Path to image file
 * @param {string} prompt - Analysis prompt
 * @param {Object} options - Optional settings
 * @returns {Promise<string|null>} Description or null on error
 */
export async function analyzeLLaVA(imagePath, prompt = PROMPTS.frameAnalysis, options = {}) {
  const {
    model = null, // Auto-detect if null
    verbose = false,
    timeout = 60000 // 60 second timeout
  } = options;

  // Check prerequisites
  const ollamaAvailable = await isOllamaAvailable();
  if (!ollamaAvailable) {
    if (verbose) console.warn('LLaVA: Ollama not available');
    return null;
  }

  const useModel = model || await getBestAvailableModel();
  if (!useModel) {
    if (verbose) console.warn('LLaVA: No LLaVA model available');
    return null;
  }

  // Verify image exists
  if (!fs.existsSync(imagePath)) {
    if (verbose) console.warn(`LLaVA: Image not found: ${imagePath}`);
    return null;
  }

  return new Promise((resolve) => {
    const args = ['run', useModel, prompt];

    if (verbose) {
      console.log(`LLaVA: Analyzing ${path.basename(imagePath)} with ${useModel}`);
    }

    const proc = spawn('ollama', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // Send image via stdin (Ollama accepts image paths in prompt)
    // Actually, we need to include the image path in the prompt for Ollama
    const fullPrompt = `${prompt}\n\nImage: ${imagePath}`;
    proc.stdin.write(fullPrompt);
    proc.stdin.end();

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeoutId = setTimeout(() => {
      timedOut = true;
      proc.kill();
      if (verbose) console.warn('LLaVA: Analysis timed out');
      resolve(null);
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timeoutId);
      if (timedOut) return;

      if (code !== 0) {
        if (verbose) console.warn(`LLaVA: Process exited with code ${code}`, stderr);
        resolve(null);
        return;
      }

      resolve(stdout.trim() || null);
    });

    proc.on('error', (err) => {
      clearTimeout(timeoutId);
      if (verbose) console.warn('LLaVA: Process error:', err.message);
      resolve(null);
    });
  });
}

/**
 * Analyze two images for comparison (diff analysis)
 *
 * @param {string} referencePath - Path to reference image
 * @param {string} capturedPath - Path to captured image
 * @param {Object} options - Optional settings
 * @returns {Promise<string|null>} Comparison description or null
 */
export async function analyzeLLaVADiff(referencePath, capturedPath, options = {}) {
  const prompt = options.prompt || PROMPTS.frameDiff;

  // For diff analysis, we describe both images in the prompt
  const fullPrompt = `${prompt}

Reference image: ${referencePath}
Captured image: ${capturedPath}`;

  return analyzeLLaVA(referencePath, fullPrompt, options);
}

/**
 * Selective analysis - analyze only best and worst frames
 * More efficient than comprehensive mode
 *
 * @param {Array<{path: string, score: number}>} frames - Frames with quality scores
 * @param {string} referencePath - Path to reference image
 * @param {Object} options - Optional settings
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeLLaVASelective(frames, referencePath, options = {}) {
  const {
    bestCount = 3,
    worstCount = 3,
    verbose = false
  } = options;

  // Check prerequisites
  const ollamaAvailable = await isOllamaAvailable();
  if (!ollamaAvailable) {
    return { error: 'Ollama not available', available: false };
  }

  const model = await getBestAvailableModel();
  if (!model) {
    return { error: 'No LLaVA model available', available: false };
  }

  // Sort by score (assuming higher is better, like SSIM)
  const sorted = [...frames].sort((a, b) => b.score - a.score);

  const bestFrames = sorted.slice(0, bestCount);
  const worstFrames = sorted.slice(-worstCount);

  const results = {
    model,
    mode: 'selective',
    referencePath,
    bestFrames: [],
    worstFrames: [],
    summary: null
  };

  // Analyze best frames
  if (verbose) console.log(`LLaVA: Analyzing ${bestCount} best frames...`);
  for (const frame of bestFrames) {
    const description = await analyzeLLaVADiff(referencePath, frame.path, { ...options, model });
    results.bestFrames.push({
      path: frame.path,
      score: frame.score,
      description
    });
  }

  // Analyze worst frames
  if (verbose) console.log(`LLaVA: Analyzing ${worstCount} worst frames...`);
  for (const frame of worstFrames) {
    const description = await analyzeLLaVADiff(referencePath, frame.path, { ...options, model });
    results.worstFrames.push({
      path: frame.path,
      score: frame.score,
      description
    });
  }

  // Generate summary
  if (verbose) console.log('LLaVA: Generating summary...');
  const summaryContext = `
Best frames analysis:
${results.bestFrames.map(f => `- Score ${f.score.toFixed(3)}: ${f.description || 'No description'}`).join('\n')}

Worst frames analysis:
${results.worstFrames.map(f => `- Score ${f.score.toFixed(3)}: ${f.description || 'No description'}`).join('\n')}
`;

  results.summary = await analyzeLLaVA(
    referencePath,
    `${PROMPTS.batchSummary}\n\n${summaryContext}`,
    { ...options, model }
  );

  return results;
}

/**
 * Comprehensive analysis - analyze all frames
 * Use sparingly as this is slow (can take 15-30 minutes for 100+ frames)
 *
 * @param {Array<{path: string, score: number}>} frames - All frames with scores
 * @param {string} referencePath - Path to reference image
 * @param {Object} options - Optional settings
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeLLaVAComprehensive(frames, referencePath, options = {}) {
  const { verbose = false, onProgress = null } = options;

  // Check prerequisites
  const ollamaAvailable = await isOllamaAvailable();
  if (!ollamaAvailable) {
    return { error: 'Ollama not available', available: false };
  }

  const model = await getBestAvailableModel();
  if (!model) {
    return { error: 'No LLaVA model available', available: false };
  }

  const results = {
    model,
    mode: 'comprehensive',
    referencePath,
    frameCount: frames.length,
    frames: [],
    summary: null
  };

  // Analyze all frames
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    if (verbose) {
      console.log(`LLaVA: Analyzing frame ${i + 1}/${frames.length}...`);
    }
    if (onProgress) {
      onProgress(i + 1, frames.length);
    }

    const description = await analyzeLLaVADiff(referencePath, frame.path, { ...options, model });
    results.frames.push({
      path: frame.path,
      score: frame.score,
      description
    });
  }

  // Generate summary from all descriptions
  const summaryContext = results.frames
    .map(f => `Frame (score ${f.score.toFixed(3)}): ${f.description || 'No description'}`)
    .join('\n');

  results.summary = await analyzeLLaVA(
    referencePath,
    `${PROMPTS.batchSummary}\n\n${summaryContext}`,
    { ...options, model }
  );

  return results;
}

/**
 * Get installation instructions
 */
export function getInstallInstructions() {
  return `
LLaVA Setup Instructions
========================

1. Install Ollama:
   macOS: brew install ollama
   Linux: curl -fsSL https://ollama.ai/install.sh | sh

2. Pull the LLaVA model (8GB download):
   ollama pull llava-llama3

3. Verify installation:
   ollama run llava-llama3 "describe this image" --image test.png

Alternative models (smaller, faster, lower quality):
   ollama pull llava:7b     # 4.7GB
   ollama pull llava        # Default variant
`;
}

// CLI support
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     process.argv[1]?.endsWith('llava-analyze.mjs');

if (isMainModule) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
llava-analyze.mjs - LLaVA vision-language analysis for animation frames

Usage:
  node llava-analyze.mjs --check
  node llava-analyze.mjs --image <path> [--prompt <text>]
  node llava-analyze.mjs --install

Options:
  --check      Check if LLaVA is available
  --image, -i  Image to analyze
  --prompt, -p Prompt for analysis
  --install    Show installation instructions
  --verbose    Verbose output
  --help, -h   Show this help

Example:
  node llava-analyze.mjs -i frame.png -p "Describe the electricity effect"
`);
    process.exit(0);
  }

  if (args.includes('--install')) {
    console.log(getInstallInstructions());
    process.exit(0);
  }

  if (args.includes('--check')) {
    (async () => {
      const ollamaAvailable = await isOllamaAvailable();
      console.log(`Ollama: ${ollamaAvailable ? 'Available' : 'Not available'}`);

      if (ollamaAvailable) {
        const model = await getBestAvailableModel();
        console.log(`LLaVA model: ${model || 'Not installed'}`);

        if (!model) {
          console.log('\nTo install LLaVA:');
          console.log('  ollama pull llava-llama3');
        }
      } else {
        console.log('\nTo install Ollama:');
        console.log('  macOS: brew install ollama');
        console.log('  Linux: curl -fsSL https://ollama.ai/install.sh | sh');
      }

      process.exit(ollamaAvailable && (await getBestAvailableModel()) ? 0 : 1);
    })();
  } else {
    let imagePath = null;
    let prompt = PROMPTS.frameAnalysis;
    let verbose = args.includes('--verbose') || args.includes('-v');

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--image' || args[i] === '-i') {
        imagePath = args[++i];
      } else if (args[i] === '--prompt' || args[i] === '-p') {
        prompt = args[++i];
      }
    }

    if (!imagePath) {
      console.error('Error: --image is required');
      process.exit(1);
    }

    (async () => {
      const description = await analyzeLLaVA(imagePath, prompt, { verbose });
      if (description) {
        console.log(description);
      } else {
        console.error('Analysis failed. Run with --check to verify setup.');
        process.exit(1);
      }
    })();
  }
}
