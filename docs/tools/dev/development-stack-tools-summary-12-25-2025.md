# Story Portal - Development Stack & Tools Summary

**Generated:** December 25, 2025
**Project:** story-portal v0.0.0

---

## 🏗️ Project Overview

- **Project Name:** story-portal
- **Description:** Interactive storytelling portal with steampunk visual effects (mission: "Make empathy contagious")
- **Package Manager:** pnpm
- **Module Type:** ES Modules (`"type": "module"`)
- **Node.js Version:** Not explicitly specified (no `.nvmrc` or `.node-version` in project root)

---

## ⚡ Vite Configuration

- **Vite Version:** ^7.2.4 (latest major)
- **Config File:** `vite.config.ts`

### Plugins

| Plugin                        | Purpose                              |
| ----------------------------- | ------------------------------------ |
| `@vitejs/plugin-react` v5.1.1 | React Fast Refresh and JSX transform |

### Settings

- **Build Target:** ES2022 (via tsconfig)
- **Test Integration:** Vitest configured directly in vite.config.ts
- **Dev Server:** Default port 5173 (custom script `dev:5173` with strict port)

---

## 🎨 Frontend Framework

- **Framework:** React 19.2.0 (latest)
- **React DOM:** 19.2.0
- **JSX Transform:** React 17+ automatic (`react-jsx`)

### 3D Graphics Stack

| Package                       | Version  | Purpose                       |
| ----------------------------- | -------- | ----------------------------- |
| `three`                       | ^0.182.0 | WebGL 3D engine               |
| `@react-three/fiber`          | ^9.4.2   | React renderer for Three.js   |
| `@react-three/drei`           | ^10.7.7  | Useful helpers for R3F        |
| `@react-three/postprocessing` | ^3.0.4   | Post-processing effects       |
| `three-stdlib`                | ^2.36.1  | Additional Three.js utilities |
| `@types/three`                | ^0.182.0 | TypeScript definitions        |

### Component Structure

```
src/
├── App.tsx                    # Root app component
├── main.tsx                   # Entry point
├── legacy/
│   ├── LegacyApp.tsx          # Main app orchestrator
│   ├── components/            # UI components
│   │   ├── buttons/           # SpinButton, ImageButton, RecordButton, etc.
│   │   ├── menu/              # HamburgerMenu, MenuPanels, SmokeEffect
│   │   ├── SteamWisps.tsx     # Steam particle effects
│   │   ├── WheelPanel.tsx     # Prompt wheel panels
│   │   ├── ElectricityR3F.tsx # WebGL electricity effects
│   │   └── ...
│   ├── views/                 # RecordView, StoriesView, AboutView
│   ├── effects/               # Animation effects (R3F)
│   └── _archived/             # Deprecated code
```

---

## 🎭 Styling Solution

- **Approach:** Vanilla CSS with component-specific stylesheets
- **No CSS Framework:** No Tailwind, styled-components, or CSS-in-JS
- **PostCSS:** Not configured

### CSS Architecture

```
src/
├── index.css                  # Global styles
├── App.css                    # App-level styles
├── legacy/styles/
│   ├── index.css              # Barrel file
│   ├── fonts.css              # Typography
│   ├── base.css               # Reset/base styles
│   ├── wheel.css              # Wheel component
│   ├── buttons.css            # Button styles
│   ├── menu.css               # Menu styles
│   ├── animations.css         # CSS animations
│   └── responsive.css         # Media queries
```

### Design System

- **Theme:** Steampunk aesthetic (brass, bronze gradients)
- **SVG Filters:** Custom carved-text and engraved effects defined in `index.html`
- **Design Reference:** `.claude/skills/story-portal/references/steampunk-design-system.md`

---

## 📦 Key Dependencies

### UI Components

_No external component libraries - custom-built components_

### State Management

_No external state library - React hooks (useState, useReducer)_

### Data Fetching

_No data fetching libraries detected_

### Routing

_No router package - single-page app with internal view state_

### Utilities

| Package      | Purpose                                          |
| ------------ | ------------------------------------------------ |
| `sharp`      | Image processing (screenshots/diff analysis)     |
| `pngjs`      | PNG encoding/decoding                            |
| `pixelmatch` | Pixel-by-pixel image comparison                  |
| `ssim.js`    | Structural similarity index for image comparison |
| `fast-glob`  | Fast file pattern matching                       |

---

## 🧪 Testing Stack

### Unit Testing

- **Framework:** Vitest ^4.0.16
- **Environment:** jsdom ^27.3.0
- **Setup File:** `src/test/setup.ts`
- **Globals:** Enabled (`globals: true`)

### Component Testing

- **@testing-library/react:** ^16.3.1
- **@testing-library/dom:** ^10.4.1
- **@testing-library/jest-dom:** ^6.9.1

### E2E Testing

- **Framework:** Playwright ^1.57.0
- **Config:** `playwright.config.ts`
- **Test Directory:** `./e2e`
- **Browser:** Chromium only
- **Base URL:** `http://localhost:5173`

### Screenshot Testing

- **Puppeteer:** ^24.34.0 (for WebGL capture - better than Playwright for WebGL)

---

## 🔧 Developer Experience

### TypeScript

- **Version:** ~5.9.3
- **Strictness:** Full strict mode enabled
- **Target:** ES2022

#### tsconfig.app.json (Browser)

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedSideEffectImports": true,
  "erasableSyntaxOnly": true
}
```

#### tsconfig.node.json (Node/Vite)

- **Target:** ES2023
- **Module:** ESNext with bundler resolution

### Linting

- **ESLint:** ^9.39.1 (flat config)
- **Config:** `eslint.config.js`

#### Plugins

| Plugin                        | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `@eslint/js`                  | Core JS rules                          |
| `typescript-eslint`           | TypeScript support                     |
| `eslint-plugin-react-hooks`   | React hooks rules                      |
| `eslint-plugin-react-refresh` | Vite HMR compatibility                 |
| `eslint-config-prettier`      | Disable style rules (Prettier handles) |

#### Ignored Directories

- `dist`
- `puppeteer-mcp-server`
- `servers`
- `story-portal-chat-tools`
- `tools/ai/mcp-server`

### Formatting

- **Prettier:** ^3.7.4
- **Config:** `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Git Hooks

_No Husky or lint-staged configured_

### Editor Config

_No .editorconfig or VSCode settings detected_

---

## 🖥️ Backend/API

_This is a frontend-only application - no backend detected._

---

## 🚀 Build & Deployment

### Build Scripts

```bash
pnpm build  # tsc -b && vite build
```

### CI/CD

_No GitHub Actions workflows in project root_

### Deployment Target

_Not explicitly configured (no vercel.json, netlify.toml, etc.)_

### Environment Management

_No .env.example or environment configuration detected_

---

## 📊 npm Scripts Reference

### Development

| Script       | Command                         | Description              |
| ------------ | ------------------------------- | ------------------------ |
| `dev`        | `vite`                          | Start development server |
| `dev:5173`   | `vite --port 5173 --strictPort` | Strict port dev server   |
| `preview`    | `vite preview`                  | Preview production build |
| `ports:kill` | `bash -lc './sp kill'`          | Kill processes on ports  |

### Build & Quality

| Script         | Command                | Description                         |
| -------------- | ---------------------- | ----------------------------------- |
| `build`        | `tsc -b && vite build` | Type-check and build for production |
| `lint`         | `eslint .`             | Run ESLint on all files             |
| `format`       | `prettier --write .`   | Format all files with Prettier      |
| `format:check` | `prettier --check .`   | Check formatting without changes    |
| `test`         | `vitest`               | Run unit tests with Vitest          |

### Screenshots & Animation Pipeline

| Script                 | Command                                            | Description                        |
| ---------------------- | -------------------------------------------------- | ---------------------------------- |
| `shots`                | `playwright test e2e/screenshots.spec.ts`          | Capture screenshots via Playwright |
| `capture:video`        | `node animations/shared/capture/video.mjs`         | Capture video of animations        |
| `cap:latest`           | `node animations/shared/capture/pick_artifact.mjs` | Pick latest capture artifact       |
| `capture:human-review` | `node animations/shared/capture/human-review.mjs`  | Capture for human review           |

### Diff Analysis Pipeline

| Script                | Command                                                                  | Description                     |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| `diff:analyze`        | `node animations/shared/diff/run-analysis.mjs`                           | Run diff analysis               |
| `diff:latest`         | `node animations/shared/diff/run-analysis.mjs --latest`                  | Analyze latest capture          |
| `diff:baseline`       | `node animations/shared/diff/extract-baseline.mjs`                       | Extract baseline for comparison |
| `diff:pipeline`       | `node animations/shared/diff/pipeline.mjs`                               | Full diff pipeline              |
| `diff:crop`           | `node animations/shared/diff/crop.mjs`                                   | Crop images for comparison      |
| `iterate:electricity` | `node animations/shared/diff/pipeline.mjs --scenario electricity-portal` | Iterate electricity effect      |

### Utilities

| Script           | Command                                               | Description                |
| ---------------- | ----------------------------------------------------- | -------------------------- |
| `assets:catalog` | `node tools/assets_catalog.mjs`                       | Catalog static assets      |
| `prompt:server`  | `node tools/ai/prompt_receiver.mjs`                   | AI prompt server           |
| `setup:timing`   | `node animations/shared/setup/timing-calibration.mjs` | Calibrate animation timing |

---

## ⚠️ Observations & Recommendations

### Current State

- Modern stack with latest versions of React 19, Vite 7, and TypeScript 5.9
- Well-organized modular component architecture
- Comprehensive animation iteration pipeline with SSIM-based comparison
- Strong typing with strict TypeScript configuration

### Potential Improvements

1. **Node Version Lock**
   - Add `.nvmrc` or `.node-version` to ensure consistent Node.js version across environments

2. **Git Hooks**
   - Consider adding Husky + lint-staged for pre-commit linting/formatting

3. **Environment Configuration**
   - Add `.env.example` to document required environment variables (if any)

4. **CI/CD Pipeline**
   - No GitHub Actions in project root - consider adding automated testing

5. **Bundle Analysis**
   - Consider adding `vite-bundle-analyzer` to monitor bundle size

### Security Considerations

- No sensitive credentials detected in configuration files
- Dependencies should be audited regularly (`pnpm audit`)

---

## 📁 Animation Iteration Tools

The project includes a sophisticated animation iteration pipeline:

```
animations/
├── shared/
│   ├── capture/       # Screenshot/video capture tools
│   │   ├── video.mjs
│   │   ├── human-review.mjs
│   │   └── pick_artifact.mjs
│   ├── diff/          # Image comparison and analysis
│   │   ├── pipeline.mjs
│   │   ├── run-analysis.mjs
│   │   └── extract-baseline.mjs
│   └── setup/         # Calibration tools
├── electricity-portal/ # Scenario-specific configs
│   ├── scenario.json
│   ├── references/    # Reference images/videos
│   ├── calibration/   # Timing calibration data
│   └── human-review/  # Human review captures
```

**Key Capabilities:**

- SSIM (Structural Similarity Index) for perceptual comparison
- Pixel-by-pixel diff with pixelmatch
- LPIPS perceptual similarity (Phase 3)
- LLaVA vision-language analysis (Phase 4)
- Video capture for animation review

---

_Generated by Claude Code - `/stack` command_
