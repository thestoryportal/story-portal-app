/**
 * lpips-analyze.mjs
 *
 * Node.js wrapper for LPIPS perceptual similarity analysis.
 * Calls Python script for GPU-accelerated deep learning comparison.
 *
 * Usage:
 *   import { analyzeLPIPS, analyzeLPIPSBatch } from './lpips-analyze.mjs';
 *
 *   // Single pair
 *   const score = await analyzeLPIPS(capturedPath, referencePath);
 *
 *   // Batch (more efficient - loads model once)
 *   const results = await analyzeLPIPSBatch([
 *     { captured: 'a.png', reference: 'ref.png' },
 *     { captured: 'b.png', reference: 'ref.png' }
 *   ]);
 *
 * Output:
 *   LPIPS score (lower = more similar, 0 = identical)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYTHON_SCRIPT = path.join(__dirname, 'lpips_analyze.py');

/**
 * Check if LPIPS is available (Python + dependencies installed)
 */
export async function isLPIPSAvailable() {
  return new Promise((resolve) => {
    const proc = spawn('python3', ['-c', 'import lpips; import torch']);

    proc.on('close', (code) => {
      resolve(code === 0);
    });

    proc.on('error', () => {
      resolve(false);
    });

    // Timeout after 30 seconds (torch import can be slow)
    setTimeout(() => {
      proc.kill();
      resolve(false);
    }, 30000);
  });
}

/**
 * Analyze LPIPS for a single image pair
 *
 * @param {string} capturedPath - Path to captured image
 * @param {string} referencePath - Path to reference image
 * @param {Object} options - Optional settings
 * @returns {Promise<number|null>} LPIPS score (0-1+) or null on error
 */
export async function analyzeLPIPS(capturedPath, referencePath, options = {}) {
  const { verbose = false, network = 'vgg' } = options;

  return new Promise((resolve, reject) => {
    const args = [
      PYTHON_SCRIPT,
      '--captured', capturedPath,
      '--reference', referencePath,
      '--net', network
    ];

    if (verbose) {
      args.push('--verbose');
    }

    const proc = spawn('python3', args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      if (verbose) {
        process.stderr.write(data);
      }
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        console.warn('LPIPS analysis failed:', stderr);
        resolve(null);
        return;
      }

      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          console.warn('LPIPS error:', result.error);
          resolve(null);
        } else {
          resolve(result.lpips);
        }
      } catch (e) {
        console.warn('Failed to parse LPIPS output:', e.message);
        resolve(null);
      }
    });

    proc.on('error', (err) => {
      console.warn('Failed to spawn LPIPS process:', err.message);
      resolve(null);
    });
  });
}

/**
 * Analyze LPIPS for multiple image pairs (batch mode)
 * More efficient than calling analyzeLPIPS multiple times - loads model once.
 *
 * @param {Array<{captured: string, reference: string}>} pairs - Image pairs to analyze
 * @param {Object} options - Optional settings
 * @returns {Promise<Object>} Results with aggregate stats and per-pair scores
 */
export async function analyzeLPIPSBatch(pairs, options = {}) {
  const { verbose = false, network = 'vgg' } = options;

  return new Promise((resolve, reject) => {
    const args = [
      PYTHON_SCRIPT,
      '--batch',
      '--net', network
    ];

    if (verbose) {
      args.push('--verbose');
    }

    const proc = spawn('python3', args);
    let stdout = '';
    let stderr = '';

    // Send pairs as JSON to stdin
    proc.stdin.write(JSON.stringify(pairs));
    proc.stdin.end();

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      if (verbose) {
        process.stderr.write(data);
      }
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        console.warn('LPIPS batch analysis failed:', stderr);
        resolve({
          error: 'LPIPS analysis failed',
          stderr: stderr.slice(-500)
        });
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        console.warn('Failed to parse LPIPS batch output:', e.message);
        resolve({
          error: 'Failed to parse output',
          stdout: stdout.slice(-500)
        });
      }
    });

    proc.on('error', (err) => {
      console.warn('Failed to spawn LPIPS batch process:', err.message);
      resolve({
        error: err.message
      });
    });
  });
}

/**
 * Analyze LPIPS for animation frames against a reference
 * Convenience wrapper for analyzing multiple captured frames against one reference.
 *
 * @param {string[]} framePaths - Array of captured frame paths
 * @param {string} referencePath - Path to reference image
 * @param {Object} options - Optional settings
 * @returns {Promise<Object>} Results with per-frame scores
 */
export async function analyzeFramesLPIPS(framePaths, referencePath, options = {}) {
  const pairs = framePaths.map(captured => ({
    captured,
    reference: referencePath
  }));

  const result = await analyzeLPIPSBatch(pairs, options);

  if (result.error) {
    return result;
  }

  // Enhance results with frame info
  return {
    ...result,
    frameCount: framePaths.length,
    perFrame: result.results?.map((r, i) => ({
      frame: path.basename(framePaths[i]),
      path: framePaths[i],
      lpips: r.lpips,
      error: r.error
    })) || []
  };
}

// CLI support
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     process.argv[1]?.endsWith('lpips-analyze.mjs');

if (isMainModule) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
lpips-analyze.mjs - Node.js wrapper for LPIPS perceptual similarity

Usage:
  node lpips-analyze.mjs --captured <path> --reference <path>
  node lpips-analyze.mjs --check

Options:
  --captured, -c   Path to captured image
  --reference, -r  Path to reference image
  --check          Check if LPIPS is available
  --verbose, -v    Verbose output
  --help, -h       Show this help

Example:
  node lpips-analyze.mjs -c frame.png -r reference.png
`);
    process.exit(0);
  }

  if (args.includes('--check')) {
    isLPIPSAvailable().then(available => {
      console.log(available ? 'LPIPS is available' : 'LPIPS is NOT available');
      process.exit(available ? 0 : 1);
    });
  } else {
    let captured = null;
    let reference = null;
    let verbose = args.includes('--verbose') || args.includes('-v');

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--captured' || args[i] === '-c') {
        captured = args[++i];
      } else if (args[i] === '--reference' || args[i] === '-r') {
        reference = args[++i];
      }
    }

    if (!captured || !reference) {
      console.error('Error: --captured and --reference are required');
      process.exit(1);
    }

    analyzeLPIPS(captured, reference, { verbose }).then(score => {
      if (score === null) {
        console.error('LPIPS analysis failed');
        process.exit(1);
      } else {
        console.log(JSON.stringify({ lpips: score }, null, 2));
      }
    });
  }
}
