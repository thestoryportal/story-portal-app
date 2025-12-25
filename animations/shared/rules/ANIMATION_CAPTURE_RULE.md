# Animation Capture Rule

When the task involves animation timing/feel:
- Use video capture (CDP screencast) for smooth animation:
  ```bash
  node animations/shared/capture/video.mjs --scenario electricity-portal --duration 2000
  ```
- For longer captures:
  ```bash
  node animations/shared/capture/video.mjs --scenario electricity-portal --duration 4000
  ```

For full iteration pipeline with analysis:
```bash
node animations/shared/diff/pipeline.mjs --scenario electricity-portal
```

Or use the npm script:
```bash
pnpm iterate:electricity
```

Always report:
- the capture folder path
- what changed visually

*Updated 2025-12-24: Use video.mjs (run.mjs deprecated)*
