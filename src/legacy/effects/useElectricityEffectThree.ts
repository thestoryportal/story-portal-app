/**
 * useElectricityEffectThree - Three.js electricity animation hook
 *
 * Replaces the raw WebGL implementation with Three.js using:
 * - LightningStrike geometry from three-stdlib
 * - EffectComposer with UnrealBloomPass for glow
 * - ShaderMaterial for plasma layer
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LightningStrike, type RayParameters } from 'three-stdlib';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ELECTRICITY_CONFIG } from '../constants';

export interface UseElectricityEffectThreeOptions {
  /** Whether the effect is active */
  enabled: boolean;
  /** Canvas ref to render to */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

/**
 * Three.js electricity rendering with LightningStrike and bloom
 */
export function useElectricityEffectThree({
  enabled,
  canvasRef,
}: UseElectricityEffectThreeOptions): void {
  const animFrameRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current) {
      return;
    }

    console.log('[ElectricityThree] Initializing...');

    const canvas = canvasRef.current;
    const resolution = 400;
    const cfg = ELECTRICITY_CONFIG;

    // Reset clock for deterministic timing
    clockRef.current = new THREE.Clock();
    clockRef.current.start();
    startTimeRef.current = Date.now();

    // === Setup Renderer ===
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(resolution, resolution);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);

    // === Setup Scene ===
    const scene = new THREE.Scene();

    // Use perspective camera (LightningStrike works better with perspective)
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // === Lightning Material - bright amber/orange ===
    const createLightningMaterial = () => new THREE.MeshBasicMaterial({
      color: new THREE.Color(cfg.coreColor[0], cfg.coreColor[1], cfg.coreColor[2]),
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // === Create Lightning Strikes ===
    const lightningStrikes: LightningStrike[] = [];
    const lightningMeshes: THREE.Mesh[] = [];
    const numBolts = cfg.numMainBolts;
    const portalRadius = 1.8; // Radius in world units that fits in view

    console.log(`[ElectricityThree] Creating ${numBolts} lightning bolts...`);

    for (let i = 0; i < numBolts; i++) {
      const angle = (i / numBolts) * Math.PI * 2;

      const rayParams: RayParameters = {
        sourceOffset: new THREE.Vector3(0, 0, 0),
        destOffset: new THREE.Vector3(
          Math.cos(angle) * portalRadius,
          Math.sin(angle) * portalRadius,
          0
        ),
        radius0: 0.04,
        radius1: 0.01,
        minRadius: 0.005,
        maxIterations: 7,
        isEternal: true,
        timeScale: 0.8 + Math.random() * 0.4,
        propagationTimeFactor: 0.1,
        vanishingTimeFactor: 0.9,
        subrayPeriod: 2.0,
        subrayDutyCycle: 0.5,
        maxSubrayRecursion: 2,
        ramification: Math.floor(4 + Math.random() * 4),
        recursionProbability: 0.6,
        roughness: 0.9,
        straightness: 0.65,
      };

      try {
        const strike = new LightningStrike(rayParams);
        const mesh = new THREE.Mesh(strike, createLightningMaterial());
        scene.add(mesh);
        lightningStrikes.push(strike);
        lightningMeshes.push(mesh);
      } catch (err) {
        console.error(`[ElectricityThree] Failed to create bolt ${i}:`, err);
      }
    }

    console.log(`[ElectricityThree] Created ${lightningStrikes.length} bolts`);

    // === Plasma background (simple glowing circle) ===
    const plasmaGeometry = new THREE.CircleGeometry(portalRadius * 1.1, 64);
    const plasmaMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 },
        u_intensity: { value: 1.0 },
        u_innerColor: { value: new THREE.Vector3(...cfg.plasmaInner) },
        u_outerColor: { value: new THREE.Vector3(...cfg.plasmaOuter) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform float u_intensity;
        uniform vec3 u_innerColor;
        uniform vec3 u_outerColor;
        varying vec2 vUv;

        // Simple noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          vec2 centered = vUv - 0.5;
          float dist = length(centered) * 2.0;

          // Radial falloff
          float falloff = 1.0 - smoothstep(0.0, 1.0, dist);
          falloff = pow(falloff, 2.0);

          // Animated noise
          float n = noise(centered * 4.0 + u_time * 0.3);
          n += noise(centered * 8.0 - u_time * 0.2) * 0.5;
          n = n / 1.5;

          // Color gradient
          vec3 color = mix(u_outerColor, u_innerColor, falloff);

          // Combine
          float alpha = falloff * 0.4 * u_intensity * (0.8 + n * 0.4);

          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
    const plasmaMesh = new THREE.Mesh(plasmaGeometry, plasmaMaterial);
    plasmaMesh.position.z = -0.5; // Behind lightning
    scene.add(plasmaMesh);

    // === Setup Post-Processing ===
    const composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(resolution, resolution),
      1.8,  // strength - bright glow
      0.6,  // radius
      0.1   // threshold - low to catch all lightning
    );
    composer.addPass(bloomPass);

    console.log('[ElectricityThree] Post-processing setup complete');

    // === Animation Loop ===
    let renderActive = true;

    const animate = () => {
      if (!renderActive) return;

      const time = clockRef.current.getElapsedTime();
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      const elapsedSec = elapsed / 1000;

      // === SURGE CYCLE ===
      const cyclePosition = (elapsedSec % cfg.surgeCycleDuration) / cfg.surgeCycleDuration;
      let surgeMultiplier: number;
      if (cyclePosition < cfg.surgeBuildPhase) {
        const buildProgress = cyclePosition / cfg.surgeBuildPhase;
        surgeMultiplier = cfg.surgeBaseBrightness + (cfg.surgePeakBrightness - cfg.surgeBaseBrightness) * (buildProgress * buildProgress);
      } else if (cyclePosition < cfg.surgePeakPhase) {
        surgeMultiplier = cfg.surgePeakBrightness;
      } else {
        const calmProgress = (cyclePosition - cfg.surgePeakPhase) / (1.0 - cfg.surgePeakPhase);
        surgeMultiplier = cfg.surgePeakBrightness - (cfg.surgePeakBrightness - cfg.surgeBaseBrightness) * calmProgress;
      }

      // === INTENSITY (fade in/out) ===
      let intensity: number;
      if (elapsed < 200) {
        const buildUp = elapsed / 200;
        intensity = 0.3 + buildUp * buildUp * 0.7;
      } else if (elapsed < 2600) {
        intensity = 1;
      } else if (elapsed < 3000) {
        const fadeProgress = (elapsed - 2600) / 400;
        intensity = 1 - fadeProgress * fadeProgress;
      } else {
        intensity = 0;
      }

      const finalIntensity = intensity * surgeMultiplier;

      // Clear and stop if faded out
      if (intensity <= 0.01 && elapsed > 2000) {
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // === Update Lightning Strikes ===
      lightningStrikes.forEach((strike, idx) => {
        // Update geometry with current time
        strike.update(time);

        // Update material opacity
        const mesh = lightningMeshes[idx];
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = finalIntensity;
      });

      // === Update Plasma ===
      plasmaMaterial.uniforms.u_time.value = time;
      plasmaMaterial.uniforms.u_intensity.value = finalIntensity;

      // === Update Bloom ===
      bloomPass.strength = 1.8 * finalIntensity * (surgeMultiplier / cfg.surgePeakBrightness);

      // === Render ===
      composer.render();

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    console.log('[ElectricityThree] Animation started');

    // === Cleanup ===
    return () => {
      console.log('[ElectricityThree] Cleaning up...');
      renderActive = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }

      // Dispose lightning
      lightningStrikes.forEach((strike) => strike.dispose());
      lightningMeshes.forEach((mesh) => {
        (mesh.material as THREE.Material).dispose();
      });

      // Dispose plasma
      plasmaGeometry.dispose();
      plasmaMaterial.dispose();

      // Dispose composer
      composer.dispose();

      // Dispose renderer
      renderer.dispose();

      startTimeRef.current = null;
    };
  }, [enabled, canvasRef]);
}
