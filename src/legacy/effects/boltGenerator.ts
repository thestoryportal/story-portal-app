/**
 * Bolt generation utilities for electricity effects
 *
 * Handles bolt path generation, branching, and flash arcs.
 */

import type { ElectricityBolt, FlashArc } from '../types';
import { ELECTRICITY_CONFIG } from '../constants';
import { createNoise, fractalNoise, type NoiseFunction } from './noiseUtils';

export interface Point {
  x: number;
  y: number;
}

// Maximum radius from center to fit within golden mask
const MAX_RADIUS_TOP = 136;
const MAX_RADIUS_BOTTOM_LEFT = 134;
const MAX_RADIUS_BOTTOM_RIGHT = 131;
const CENTER_X = 201;
const CENTER_Y = 193;

// Clamp a point to stay within the max radius from center
// Different radii for different quadrants
function clampToRadius(x: number, y: number): Point {
  const dx = x - CENTER_X;
  const dy = y - CENTER_Y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  let maxRadius: number;
  if (dy <= 0) {
    maxRadius = MAX_RADIUS_TOP;
  } else if (dx < 0) {
    maxRadius = MAX_RADIUS_BOTTOM_LEFT;
  } else {
    maxRadius = MAX_RADIUS_BOTTOM_RIGHT;
  }

  if (dist > maxRadius) {
    const scale = maxRadius / dist;
    return { x: CENTER_X + dx * scale, y: CENTER_Y + dy * scale };
  }
  return { x, y };
}

export interface Branch {
  startT: number;
  angle: number;
  length: number;
  seed: number;
  thickness: number;
  speed: number;
  subBranches?: SubBranch[];
}

export interface SubBranch {
  startT: number;
  angleOffset: number;
  length: number;
  seed: number;
  thickness: number;
}

export interface BoltWithBranches extends ElectricityBolt {
  branches: Branch[];
  jitterSpeed: number;
}

/**
 * Initialize persistent bolt structure - PURELY RADIAL with dense branching
 */
export function initializeBolts(): BoltWithBranches[] {
  const bolts: BoltWithBranches[] = [];
  const cfg = ELECTRICITY_CONFIG;

  // Main radial bolts from center (denser starburst)
  const numRadialBolts = cfg.numMainBolts;
  for (let i = 0; i < numRadialBolts; i++) {
    const angle = (i / numRadialBolts) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
    const length = MAX_RADIUS_BOTTOM_RIGHT; // Fixed length to reach exactly to golden mask edge
    const seed = Math.random() * 1000;
    const thickness = cfg.boltThicknessMin + Math.random() * (cfg.boltThicknessMax - cfg.boltThicknessMin);
    const speed = cfg.boltSpeedMin + Math.random() * (cfg.boltSpeedMax - cfg.boltSpeedMin);

    // Dense branching for organic look
    const branches: Branch[] = [];
    const numBranches =
      cfg.branchesPerBoltMin + Math.floor(Math.random() * (cfg.branchesPerBoltMax - cfg.branchesPerBoltMin));
    for (let b = 0; b < numBranches; b++) {
      const branchT = 0.08 + (b / numBranches) * 0.78;
      const branchThickness =
        cfg.branchThicknessMin + Math.random() * (cfg.branchThicknessMax - cfg.branchThicknessMin);
      branches.push({
        startT: branchT + (Math.random() - 0.5) * 0.06,
        angle: angle + (Math.random() - 0.5) * 1.4,
        length: 12 + Math.random() * 18, // Tighter branch range (12-30)
        seed: Math.random() * 1000,
        thickness: branchThickness,
        speed: 3.5 + Math.random() * 2.5,
        subBranches:
          Math.random() < cfg.subBranchChance
            ? [
                {
                  startT: 0.25 + Math.random() * 0.45,
                  angleOffset: (Math.random() - 0.5) * 0.9,
                  length: 8 + Math.random() * 22,
                  seed: Math.random() * 1000,
                  thickness: branchThickness * 0.6,
                },
                // Extra sub-branch for density
                ...(Math.random() > 0.4
                  ? [
                      {
                        startT: 0.5 + Math.random() * 0.3,
                        angleOffset: (Math.random() - 0.5) * 0.7,
                        length: 6 + Math.random() * 15,
                        seed: Math.random() * 1000,
                        thickness: branchThickness * 0.45,
                      },
                    ]
                  : []),
              ]
            : [],
      });
    }

    bolts.push({
      type: 'radial',
      angle,
      length,
      seed,
      thickness,
      speed,
      branches,
      noise: createNoise(),
      jitterSpeed: cfg.jitterSpeedMin + Math.random() * (cfg.jitterSpeedMax - cfg.jitterSpeedMin),
      // Per-bolt opacity animation state
      opacity: Math.random() > 0.3 ? 1.0 : 0.0, // Start some visible, some hidden
      targetOpacity: 1.0,
      fadeSpeed: cfg.boltFadeInSpeed + Math.random() * 0.04,
      nextToggleTime: Math.random() * cfg.boltOnDurationMax, // Random initial delay
      isVisible: Math.random() > 0.3,
    });
  }

  return bolts;
}

/**
 * Update per-bolt opacity animation (appear/disappear dynamically)
 */
export function updateBoltOpacities(
  bolts: BoltWithBranches[],
  deltaTime: number,
  surgeMultiplier: number
): void {
  const cfg = ELECTRICITY_CONFIG;
  bolts.forEach((bolt) => {
    bolt.nextToggleTime -= deltaTime;

    if (bolt.nextToggleTime <= 0) {
      // Toggle visibility state
      bolt.isVisible = !bolt.isVisible;
      bolt.targetOpacity = bolt.isVisible ? 1.0 : 0.0;

      // Set next toggle time
      if (bolt.isVisible) {
        bolt.nextToggleTime = cfg.boltOnDurationMin + Math.random() * (cfg.boltOnDurationMax - cfg.boltOnDurationMin);
        bolt.fadeSpeed = cfg.boltFadeInSpeed + Math.random() * 0.04;
      } else {
        bolt.nextToggleTime = cfg.boltOffDurationMin + Math.random() * (cfg.boltOffDurationMax - cfg.boltOffDurationMin);
        bolt.fadeSpeed = cfg.boltFadeOutSpeed + Math.random() * 0.03;
      }
    }

    // Smooth opacity transition
    const opacityDiff = bolt.targetOpacity - bolt.opacity;
    bolt.opacity += opacityDiff * bolt.fadeSpeed * surgeMultiplier;
    bolt.opacity = Math.max(0, Math.min(1, bolt.opacity));
  });
}

/**
 * Create a flash arc for quick bright bursts
 */
export function createFlashArc(): FlashArc {
  const angle = Math.random() * Math.PI * 2;
  const length = MAX_RADIUS_BOTTOM_RIGHT; // Fixed length to reach exactly to golden mask edge

  return {
    id: Date.now() + Math.random(),
    angle,
    length,
    thickness: 0.6 + Math.random() * 0.8,
    seed: Math.random() * 1000,
    speed: 5,
    opacity: 1,
    life: 0,
    maxLife: 60 + Math.random() * 100,
    noise: createNoise(),
  };
}

/**
 * Generate animated bolt path using noise (called every frame) - sharp zigzag
 */
export function generateAnimatedPath(
  bolt: BoltWithBranches,
  time: number,
  centerX: number,
  centerY: number
): Point[] {
  const points: Point[] = [];
  const segments = 18; // More segments for jagged look
  const cosA = Math.cos(bolt.angle);
  const sinA = Math.sin(bolt.angle);
  const perpX = -sinA;
  const perpY = cosA;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const baseX = centerX + cosA * bolt.length * t;
    const baseY = centerY + sinA * bolt.length * t;

    // Sharp zigzag displacement
    const noiseVal = fractalNoise(bolt.noise, t * 5 + time * bolt.speed, bolt.seed);
    const jitter = fractalNoise(bolt.noise, t * 10 + time * bolt.jitterSpeed, bolt.seed + 500) * 0.4;
    const taper = Math.sin(t * Math.PI);
    const displacement = (noiseVal + jitter) * bolt.length * 0.25 * taper;

    const finalX = baseX + perpX * displacement;
    const finalY = baseY + perpY * displacement;
    points.push(clampToRadius(finalX, finalY));
  }
  return points;
}

/**
 * Generate branch path
 */
export function generateBranchPath(
  startPoint: Point,
  branch: Branch | { angle: number; length: number; speed: number; seed: number },
  time: number,
  noise: NoiseFunction
): Point[] {
  const points: Point[] = [startPoint];
  const segments = 8;
  const cosB = Math.cos(branch.angle);
  const sinB = Math.sin(branch.angle);
  const perpBX = -sinB;
  const perpBY = cosB;

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const baseX = startPoint.x + cosB * branch.length * t;
    const baseY = startPoint.y + sinB * branch.length * t;
    const noiseVal = fractalNoise(noise, t * 4 + time * branch.speed + branch.seed, branch.seed);
    const taper = Math.sin(t * Math.PI);
    const displacement = noiseVal * branch.length * 0.3 * taper;
    const finalX = baseX + perpBX * displacement;
    const finalY = baseY + perpBY * displacement;
    points.push(clampToRadius(finalX, finalY));
  }
  return points;
}

/**
 * Generate flash bolt path (simple radial)
 */
export function generateFlashPath(
  arc: FlashArc,
  time: number,
  centerX: number,
  centerY: number
): Point[] {
  const points: Point[] = [];
  const segments = 10;
  const cosA = Math.cos(arc.angle);
  const sinA = Math.sin(arc.angle);
  const perpX = -sinA;
  const perpY = cosA;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const baseX = centerX + cosA * arc.length * t;
    const baseY = centerY + sinA * arc.length * t;
    const noiseVal = fractalNoise(arc.noise, t * 6 + time * 5, arc.seed);
    const taper = Math.sin(t * Math.PI);
    const displacement = noiseVal * arc.length * 0.25 * taper;
    const finalX = baseX + perpX * displacement;
    const finalY = baseY + perpY * displacement;
    points.push(clampToRadius(finalX, finalY));
  }
  return points;
}
