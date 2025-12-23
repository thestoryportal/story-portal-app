/**
 * ElectricityR3F - React Three Fiber electricity effect
 *
 * Declarative Three.js scene using R3F for the portal electricity animation.
 * Uses LightningStrike geometry with Bloom post-processing.
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { LightningStrike, type RayParameters } from 'three-stdlib';
import * as THREE from 'three';
import { ELECTRICITY_CONFIG } from '../constants';

interface ElectricityR3FProps {
  visible: boolean;
}

interface LightningBoltProps {
  angle: number;
  radius: number;
  startTime: number;
}

// Seeded random for deterministic bolt variation
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Individual lightning bolt component
 */
function LightningBolt({ angle, radius, startTime }: LightningBoltProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cfg = ELECTRICITY_CONFIG;

  // Create LightningStrike geometry with deterministic variation based on angle
  const strike = useMemo(() => {
    const seed = angle * 1000; // Use angle as seed for variation
    const timeScaleRange = cfg.lightningTimeScaleMax - cfg.lightningTimeScaleMin;
    const ramificationRange = cfg.lightningRamificationMax - cfg.lightningRamificationMin;

    const rayParams: RayParameters = {
      sourceOffset: new THREE.Vector3(0, 0, 0),
      destOffset: new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ),
      radius0: cfg.lightningRadius0,
      radius1: cfg.lightningRadius1,
      minRadius: cfg.lightningMinRadius,
      maxIterations: cfg.lightningMaxIterations,
      isEternal: true,
      timeScale: cfg.lightningTimeScaleMin + seededRandom(seed) * timeScaleRange,
      propagationTimeFactor: 0.1,
      vanishingTimeFactor: 0.9,
      subrayPeriod: cfg.lightningSubrayPeriod,
      subrayDutyCycle: cfg.lightningSubrayDutyCycle,
      maxSubrayRecursion: cfg.lightningMaxSubrayRecursion,
      ramification: Math.floor(cfg.lightningRamificationMin + seededRandom(seed + 1) * ramificationRange),
      recursionProbability: cfg.lightningRecursionProbability,
      roughness: cfg.lightningRoughness,
      straightness: cfg.lightningStraightness,
    };
    return new LightningStrike(rayParams);
  }, [angle, radius, cfg]);

  // Animation loop
  useFrame((state) => {
    const elapsed = Date.now() - startTime;
    const time = state.clock.getElapsedTime();

    // Update lightning geometry
    strike.update(time);

    // Calculate intensity (fade in/out over 3 seconds)
    let intensity: number;
    if (elapsed < 200) {
      intensity = 0.3 + (elapsed / 200) ** 2 * 0.7;
    } else if (elapsed < 2600) {
      intensity = 1;
    } else if (elapsed < 3000) {
      intensity = 1 - ((elapsed - 2600) / 400) ** 2;
    } else {
      intensity = 0;
    }

    // Surge cycle
    const elapsedSec = elapsed / 1000;
    const cyclePos = (elapsedSec % cfg.surgeCycleDuration) / cfg.surgeCycleDuration;
    let surge: number;
    if (cyclePos < cfg.surgeBuildPhase) {
      surge = cfg.surgeBaseBrightness + (cfg.surgePeakBrightness - cfg.surgeBaseBrightness) * (cyclePos / cfg.surgeBuildPhase) ** 2;
    } else if (cyclePos < cfg.surgePeakPhase) {
      surge = cfg.surgePeakBrightness;
    } else {
      surge = cfg.surgePeakBrightness - (cfg.surgePeakBrightness - cfg.surgeBaseBrightness) * ((cyclePos - cfg.surgePeakPhase) / (1 - cfg.surgePeakPhase));
    }

    // Update material
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = intensity * surge;
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      strike.dispose();
    };
  }, [strike]);

  return (
    <mesh ref={meshRef} geometry={strike}>
      <meshBasicMaterial
        color={new THREE.Color(cfg.coreColor[0], cfg.coreColor[1], cfg.coreColor[2])}
        transparent
        opacity={1}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * Plasma background glow
 */
function PlasmaBackground({ startTime }: { startTime: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const cfg = ELECTRICITY_CONFIG;

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_intensity: { value: 1.0 },
      u_innerColor: { value: new THREE.Vector3(...cfg.plasmaInner) },
      u_outerColor: { value: new THREE.Vector3(...cfg.plasmaOuter) },
    }),
    [cfg.plasmaInner, cfg.plasmaOuter]
  );

  useFrame((state) => {
    const elapsed = Date.now() - startTime;

    // Intensity calculation
    let intensity: number;
    if (elapsed < 200) {
      intensity = 0.3 + (elapsed / 200) ** 2 * 0.7;
    } else if (elapsed < 2600) {
      intensity = 1;
    } else if (elapsed < 3000) {
      intensity = 1 - ((elapsed - 2600) / 400) ** 2;
    } else {
      intensity = 0;
    }

    // Update uniforms via material ref to avoid immutability issues
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.u_intensity.value = intensity;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.5]}>
      <circleGeometry args={[2, 64]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float u_time;
          uniform float u_intensity;
          uniform vec3 u_innerColor;
          uniform vec3 u_outerColor;
          varying vec2 vUv;

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
            float falloff = 1.0 - smoothstep(0.0, 1.0, dist);
            falloff = pow(falloff, 2.0);

            float n = noise(centered * 4.0 + u_time * 0.3);
            n += noise(centered * 8.0 - u_time * 0.2) * 0.5;
            n = n / 1.5;

            vec3 color = mix(u_outerColor, u_innerColor, falloff);
            float alpha = falloff * 0.4 * u_intensity * (0.8 + n * 0.4);

            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

/**
 * Main electricity scene with all lightning bolts
 */
function ElectricityScene({ startTime }: { startTime: number }) {
  const cfg = ELECTRICITY_CONFIG;
  const numBolts = cfg.numMainBolts;
  const portalRadius = cfg.r3fPortalRadius;

  // Generate bolt angles
  const boltAngles = useMemo(() => {
    return Array.from({ length: numBolts }, (_, i) => (i / numBolts) * Math.PI * 2);
  }, [numBolts]);

  return (
    <>
      {/* Camera */}
      <perspectiveCamera position={[0, 0, 5]} />

      {/* Plasma background */}
      <PlasmaBackground startTime={startTime} />

      {/* Lightning bolts */}
      {boltAngles.map((angle, i) => (
        <LightningBolt key={i} angle={angle} radius={portalRadius} startTime={startTime} />
      ))}

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={cfg.r3fBloomIntensity}
          luminanceThreshold={cfg.r3fBloomLuminanceThreshold}
          luminanceSmoothing={cfg.r3fBloomLuminanceSmoothing}
          radius={cfg.r3fBloomRadius}
        />
      </EffectComposer>
    </>
  );
}

/**
 * Wrapper that tracks visibility changes
 */
function ElectricityWrapper({ startTime }: { startTime: number }) {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ElectricityScene startTime={startTime} />
    </Canvas>
  );
}

/**
 * Electricity effect component using React Three Fiber
 *
 * Uses a stable key/startTime pair that only updates when transitioning to visible.
 * The Canvas persists for the full effect duration without flickering.
 */
export function ElectricityR3F({ visible }: ElectricityR3FProps) {
  // State for canvas instance (key + startTime captured together)
  const [instance, setInstance] = useState<{ key: number; startTime: number } | null>(null);
  const wasVisibleRef = useRef(false);

  // Handle visibility transitions with deferred state update
  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      // Becoming visible - capture startTime NOW, defer state update
      const now = Date.now();
      const timer = setTimeout(() => {
        setInstance({ key: now, startTime: now });
      }, 0);
      wasVisibleRef.current = visible;
      return () => clearTimeout(timer);
    } else if (!visible && wasVisibleRef.current) {
      // Becoming hidden - clear instance
      const timer = setTimeout(() => {
        setInstance(null);
      }, 0);
      wasVisibleRef.current = visible;
      return () => clearTimeout(timer);
    }
    wasVisibleRef.current = visible;
    return undefined;
  }, [visible]);

  // Don't render until we have an instance
  if (!visible || !instance) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(min(100%, 100vh - 40px) * 0.78)',
        height: 'calc(min(100%, 100vh - 40px) * 0.78)',
        borderRadius: '50%',
        overflow: 'hidden',
        zIndex: 27,
        pointerEvents: 'none',
      }}
    >
      <ElectricityWrapper key={instance.key} startTime={instance.startTime} />
    </div>
  );
}
