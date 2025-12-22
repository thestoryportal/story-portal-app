# Animation Standards Reference

## Quality Benchmark: AAA Video Game
All animations must meet professional video game quality standards—NOT cartoon effects, NOT simple CSS transitions. Think Uncharted, God of War, or Diablo-level polish.

## Portal Electricity Effect Specification

### Visual Requirements
| Aspect | Specification |
|--------|---------------|
| Color Palette | Warm golden/amber, cream-gold cores |
| Core | Bright white-cream (#FFFEF0) |
| Inner Glow | Soft gold (#FFE4A0) |
| Outer Glow | Amber bloom (#D4A574 → #B8860B) |
| Atmosphere | Diffuse plasma using simplex noise |
| Containment | Perfect circular masking to portal boundary |

### Technical Pipeline
```
┌─────────────────┐
│ 1. Bolt Render  │  Generate lightning geometry
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. Horiz Blur   │  Gaussian blur X-axis
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. Vert Blur    │  Gaussian blur Y-axis
└────────┬────────┘
         ▼
┌─────────────────┐
│ 4. Composite    │  Blend with circular mask
└────────┬────────┘
         ▼
┌─────────────────┐
│ 5. Tone Map     │  ACES filmic HDR
└─────────────────┘
```

### WebGL Implementation Notes
- Use **multiple render targets** (framebuffers)
- Bloom requires **multi-scale** blur (different kernel sizes)
- Circular mask via **discard** in fragment shader or alpha blend
- Preserve wheel visibility (electricity overlays, doesn't obscure)

### Lightning Generation
```javascript
// Branching lightning algorithm
function spawnBolt(startPoint, endPoint, generations = 4) {
  if (generations === 0) return [startPoint, endPoint];
  
  const mid = lerp(startPoint, endPoint, 0.5);
  const offset = perpendicular(startPoint, endPoint) * random(-0.3, 0.3);
  const displaced = add(mid, offset);
  
  return [
    ...spawnBolt(startPoint, displaced, generations - 1),
    ...spawnBolt(displaced, endPoint, generations - 1)
  ];
}
```

### Bloom Shader (Simplified)
```glsl
// Fragment shader for bloom blur pass
uniform sampler2D uTexture;
uniform vec2 uDirection; // (1,0) for H, (0,1) for V
uniform float uBlurSize;

void main() {
  vec4 sum = vec4(0.0);
  vec2 texCoord = gl_FragCoord.xy / uResolution;
  
  // 9-tap Gaussian
  sum += texture2D(uTexture, texCoord - 4.0 * uDirection * uBlurSize) * 0.0162;
  sum += texture2D(uTexture, texCoord - 3.0 * uDirection * uBlurSize) * 0.0540;
  sum += texture2D(uTexture, texCoord - 2.0 * uDirection * uBlurSize) * 0.1216;
  sum += texture2D(uTexture, texCoord - 1.0 * uDirection * uBlurSize) * 0.1945;
  sum += texture2D(uTexture, texCoord) * 0.2270;
  sum += texture2D(uTexture, texCoord + 1.0 * uDirection * uBlurSize) * 0.1945;
  sum += texture2D(uTexture, texCoord + 2.0 * uDirection * uBlurSize) * 0.1216;
  sum += texture2D(uTexture, texCoord + 3.0 * uDirection * uBlurSize) * 0.0540;
  sum += texture2D(uTexture, texCoord + 4.0 * uDirection * uBlurSize) * 0.0162;
  
  gl_FragColor = sum;
}
```

### ACES Filmic Tone Mapping
```glsl
vec3 ACESFilm(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
```

## General Animation Principles

### Performance Targets
| Metric | Target | Hard Limit |
|--------|--------|------------|
| Frame Rate | 60fps | Never below 30fps |
| Frame Time | 16.67ms | 33.33ms max |
| GPU Memory | <100MB | <256MB |
| Draw Calls | <50 | <100 |

### Easing Standards
| Use Case | Easing | CSS |
|----------|--------|-----|
| Enter/appear | ease-out | `cubic-bezier(0, 0, 0.2, 1)` |
| Exit/disappear | ease-in | `cubic-bezier(0.4, 0, 1, 1)` |
| Movement | ease-in-out | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Bounce/spring | spring | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |
| Mechanical | linear | `linear` |

### Duration Guidelines
| Animation Type | Duration |
|----------------|----------|
| Micro-interaction | 100-200ms |
| Standard transition | 200-400ms |
| Page transition | 400-600ms |
| Complex sequence | 800-1500ms |
| Ambient loop | Infinite |

## Hamburger Menu Animation

### Gear Rotation Sequence
```javascript
const MENU_ANIMATION = {
  GEAR_SPIN: {
    duration: 600,
    rotation: 180, // degrees
    easing: 'ease-in-out',
    motionBlur: true
  },
  LINE_TRANSITION: {
    duration: 400,
    effect: 'engraved → extruded',
    stagger: 50 // ms between lines
  },
  PANEL_DEAL: {
    duration: 300,
    stagger: 80,
    transform: 'rotateY(-90deg) → rotateY(0)',
    origin: 'left center'
  }
};
```

### Line States
| State | Visual Treatment |
|-------|-----------------|
| Closed (Hamburger) | 3 horizontal lines, engraved |
| Opening | Lines rotate to X, transition to extruded |
| Open (X) | Single X shape, fully extruded |

## Control Panel Specifications

When creating manual refinement controls:

### Slider Ranges
| Parameter | Min | Max | Default | Step |
|-----------|-----|-----|---------|------|
| Bolt Count | 1 | 20 | 8 | 1 |
| Bolt Width | 0.5 | 5.0 | 2.0 | 0.1 |
| Bloom Intensity | 0 | 3.0 | 1.0 | 0.1 |
| Animation Speed | 0.1 | 3.0 | 1.0 | 0.1 |
| Glow Radius | 5 | 50 | 20 | 1 |

### Control Panel Layout
```
┌────────────────────────────────┐
│ Parameter Name          Value  │
│ ════════════════════════ ───── │
│ Bolt Count              [====] │
│ Bolt Width              [====] │
│ Bloom Intensity         [====] │
│ Core Brightness         [====] │
│ └─ [Reset] [Apply] [Export] ─┘ │
└────────────────────────────────┘
```

## WebGL Capture Configuration

For automated visual testing and iteration pipelines:

### Puppeteer Launch Args (macOS)
```javascript
// ✅ WORKING configuration
const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--enable-webgl',
    '--enable-webgl2', 
    '--ignore-gpu-blocklist',
    '--enable-gpu-rasterization',
    // NO --use-gl flag on macOS
  ]
});

// ❌ BROKEN - Do not use
'--use-gl=egl'        // Breaks WebGL on macOS
'--use-gl=swiftshader' // Software renderer, breaks effects
```

### Canvas Configuration (Required for Capture)
```javascript
// WebGL context MUST have preserveDrawingBuffer
const gl = canvas.getContext('webgl2', { 
  preserveDrawingBuffer: true  // Required for screenshot capture
});

// Three.js equivalent
const renderer = new THREE.WebGLRenderer({ 
  preserveDrawingBuffer: true 
});
```

### Frame Capture Timing
```javascript
// Wait for animation frame before capture
await page.evaluate(() => {
  return new Promise(resolve => requestAnimationFrame(resolve));
});
await page.screenshot({ path: 'frame.png' });
```

## Anti-Patterns

### NEVER DO
1. Use CSS `transition` for complex multi-property animations
2. Animate `width`/`height` (use `transform: scale`)
3. Trigger layout during animation (avoid `offsetWidth` reads)
4. Use `setInterval` for animation (use `requestAnimationFrame`)
5. Apply blur to large elements without GPU acceleration
6. Create cartoon/Flash-style bouncy effects
7. Use 2D Canvas when WebGL is specified
8. Use `--use-gl=egl` in Puppeteer on macOS (breaks WebGL)

### WARNING SIGNS
- Janky/stuttering animation → Check for layout thrashing
- Missing frames → Profile GPU, reduce complexity
- Memory growth → Check for shader/texture leaks
- Inconsistent timing → Use performance.now(), not Date
