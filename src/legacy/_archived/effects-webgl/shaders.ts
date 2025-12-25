/**
 * GLSL Shaders for electricity WebGL effects
 *
 * Contains vertex and fragment shaders for bolts, blur, plasma, and compositing.
 */

// === Bolt Shaders ===
export const boltVertexShader = `
  attribute vec2 a_position;
  attribute float a_alpha;
  varying float v_alpha;
  uniform vec2 u_resolution;
  void main() {
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_alpha = a_alpha;
  }
`;

export const boltFragmentShader = `
  precision mediump float;
  varying float v_alpha;
  uniform vec3 u_coreColor;
  uniform vec3 u_midColor;
  uniform vec3 u_outerColor;
  uniform float u_intensity;
  void main() {
    // Gradient from hot cream core to amber outer based on alpha
    float coreFactor = smoothstep(0.3, 0.9, v_alpha);
    vec3 innerMix = mix(u_midColor, u_coreColor, coreFactor);
    vec3 finalColor = mix(u_outerColor, innerMix, v_alpha);

    // Push toward orange - reduce green in bolt output
    finalColor.g *= 0.7;
    finalColor.b *= 0.3;

    gl_FragColor = vec4(finalColor * u_intensity * 1.2, v_alpha * u_intensity);
  }
`;

// === Blur Shaders ===
export const blurVertexShader = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

export const blurFragmentShader = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_texture;
  uniform vec2 u_direction;
  uniform vec2 u_resolution;
  uniform float u_radius;

  void main() {
    vec4 sum = vec4(0.0);
    vec2 texelSize = 1.0 / u_resolution;

    // 9-tap Gaussian blur
    float weights[5];
    weights[0] = 0.227027;
    weights[1] = 0.1945946;
    weights[2] = 0.1216216;
    weights[3] = 0.054054;
    weights[4] = 0.016216;

    sum += texture2D(u_texture, v_texCoord) * weights[0];

    for (int i = 1; i < 5; i++) {
      vec2 offset = u_direction * texelSize * float(i) * u_radius;
      sum += texture2D(u_texture, v_texCoord + offset) * weights[i];
      sum += texture2D(u_texture, v_texCoord - offset) * weights[i];
    }

    gl_FragColor = sum;
  }
`;

// === Volumetric Plasma Shader ===
export const plasmaFragmentShader = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_center;
  uniform float u_intensity;
  uniform float u_density;
  uniform float u_centerBright;
  uniform float u_noiseScale;
  uniform vec3 u_innerColor;
  uniform vec3 u_outerColor;
  uniform float u_portalRadius;

  // Simplex-like noise for swirling plasma
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289v2(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractal noise for richer texture
  float fbm(vec2 p, float time) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * snoise(p * frequency + time * 0.3 * float(i + 1));
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec2 pos = v_texCoord - u_center;
    float dist = length(pos);

    // Portal mask - soft edge
    float portalMask = 1.0 - smoothstep(u_portalRadius * 0.75, u_portalRadius, dist);
    if (portalMask < 0.01) {
      gl_FragColor = vec4(0.0);
      return;
    }

    // Radial density falloff - denser at center
    float radialDensity = 1.0 - smoothstep(0.0, u_portalRadius * 0.9, dist);
    radialDensity = pow(radialDensity, 0.7); // Softer falloff

    // Swirling noise animation
    vec2 noiseCoord = pos * u_noiseScale;
    float swirl = fbm(noiseCoord, u_time) * 0.5 + 0.5;

    // Rotating motion
    float angle = atan(pos.y, pos.x);
    float rotateNoise = snoise(vec2(angle * 2.0 + u_time * 0.5, dist * 3.0)) * 0.3;
    swirl += rotateNoise;
    swirl = clamp(swirl, 0.0, 1.0);

    // Center brightness boost
    float centerGlow = exp(-dist * 5.0) * u_centerBright;

    // Color gradient from inner (bright golden) to outer (deep amber)
    float colorMix = smoothstep(0.0, u_portalRadius * 0.7, dist);
    vec3 plasmaColor = mix(u_innerColor, u_outerColor, colorMix);

    // Push plasma toward orange
    plasmaColor.g *= 0.65;
    plasmaColor.b *= 0.2;

    // Combine all factors - GOOD alpha for warm fill
    float alpha = (radialDensity * u_density + centerGlow) * swirl * portalMask * u_intensity;
    alpha = clamp(alpha * 0.70, 0.0, 0.75); // Good alpha for fill

    // Good color saturation
    vec3 boostedColor = plasmaColor * (1.1 + centerGlow * 0.6);
    gl_FragColor = vec4(boostedColor, alpha);
  }
`;

// === Composite Shader ===
export const compositeFragmentShader = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_bolts;
  uniform sampler2D u_plasma;
  uniform sampler2D u_bloomTight;
  uniform sampler2D u_bloomMed;
  uniform sampler2D u_bloomWide;
  uniform float u_intensity;
  uniform vec2 u_center;
  uniform float u_portalRadius;
  uniform float u_bloomTightWeight;
  uniform float u_bloomMedWeight;
  uniform float u_bloomWideWeight;
  uniform float u_exposure;
  uniform float u_centerGlow;
  uniform float u_centerPulse;
  uniform float u_rimBloomBoost;
  uniform float u_glassOpacity;
  uniform float u_glassReflection;
  uniform vec3 u_ambientColor;

  // ACES Filmic Tone Mapping
  vec3 ACESFilm(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  void main() {
    vec2 pos = v_texCoord - u_center;
    float dist = length(pos);

    // Circular mask with soft edge - EXTENDED to fill portal
    float portalMask = 1.0 - smoothstep(u_portalRadius * 0.88, u_portalRadius * 1.02, dist);

    // Rim factor for bloom boost near edge (light contained by metal edge)
    float rimFactor = smoothstep(u_portalRadius * 0.55, u_portalRadius * 0.85, dist);
    float rimBoost = 1.0 + rimFactor * (u_rimBloomBoost - 1.0);

    // Get all layers
    vec4 plasmaColor = texture2D(u_plasma, v_texCoord);
    vec4 boltColor = texture2D(u_bolts, v_texCoord);
    vec4 bloomTight = texture2D(u_bloomTight, v_texCoord);
    vec4 bloomMed = texture2D(u_bloomMed, v_texCoord);
    vec4 bloomWide = texture2D(u_bloomWide, v_texCoord);

    // Multi-scale bloom composite with rim boost
    vec4 totalBloom = (bloomTight * u_bloomTightWeight +
                      bloomMed * u_bloomMedWeight +
                      bloomWide * u_bloomWideWeight) * rimBoost;

    // NO base fill - let bolts stand out against dark background
    // (Removed baseFill to match reference's dark areas between bolts)

    // Layer compositing - reduced multipliers to preserve color saturation
    vec3 hdrColor = vec3(0.0);
    hdrColor += plasmaColor.rgb * plasmaColor.a * 0.7; // Plasma fill
    hdrColor += boltColor.rgb * 1.6; // Bolts (reduced from 2.5)
    hdrColor += totalBloom.rgb * 0.9; // Bloom (reduced from 1.5)

    // Warm center ambient glow with 2Hz pulse
    float centerFactor = (1.0 - smoothstep(0.0, 0.42, dist)) * u_centerGlow * u_intensity * u_centerPulse;
    hdrColor += u_ambientColor * centerFactor;

    // ORANGE COLOR GRADING - apply BEFORE exposure to preserve saturation
    // Golden-amber tint matching Sora reference
    vec3 orangeTint = vec3(1.0, 0.40, 0.05); // Strong orange
    hdrColor = hdrColor * orangeTint; // Direct multiply for strong effect

    // Reduce green channel aggressively
    hdrColor.g *= 0.55;
    hdrColor.b *= 0.15;

    // Now apply exposure (after color grading)
    hdrColor *= u_exposure;

    // ACES tone mapping for filmic look
    vec3 toneMapped = ACESFilm(hdrColor);

    // POST-TONEMAP: Force deep orange by computing luminance and remapping to orange
    float finalLum = dot(toneMapped, vec3(0.299, 0.587, 0.114));
    vec3 deepOrange = vec3(1.0, 0.45, 0.05) * finalLum * 1.8; // Orange based on brightness
    toneMapped = mix(toneMapped, deepOrange, 0.6); // Strong blend toward orange

    // === GLASS REFLECTION LAYER ===
    // Subtle semi-transparent glass overlay - appears inside the porthole
    float glassGradient = smoothstep(0.0, u_portalRadius * 0.7, dist);

    // Glass reflection highlight (curved surface catch light)
    vec2 reflectDir = normalize(pos);
    float reflectionAngle = dot(reflectDir, vec2(0.3, -0.5)); // Light from upper-left
    float reflection = pow(max(0.0, reflectionAngle), 3.0) * u_glassReflection;

    // Glass tint - very subtle blue-white
    vec3 glassColor = vec3(0.95, 0.97, 1.0);

    // Apply glass layer over lightning
    toneMapped = mix(toneMapped, toneMapped + glassColor * reflection, portalMask * u_glassOpacity);

    // Minimal desaturation through glass - preserve orange
    float luminance = dot(toneMapped, vec3(0.299, 0.587, 0.114));
    toneMapped = mix(toneMapped, vec3(luminance) * vec3(1.0, 0.95, 0.85), u_glassOpacity * 0.05);

    // Calculate alpha from all layers
    float alpha = max(plasmaColor.a, max(boltColor.a, totalBloom.a * 0.85));
    alpha = max(alpha, centerFactor * 0.7);
    alpha *= portalMask * u_intensity;

    // Glass adds slight alpha coverage
    alpha = max(alpha, portalMask * u_glassOpacity * 0.3);

    gl_FragColor = vec4(toneMapped, alpha);
  }
`;
