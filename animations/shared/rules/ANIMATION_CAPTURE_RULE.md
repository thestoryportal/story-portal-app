# Animation Capture Rule

When the task involves animation timing/feel:
- Prefer a burst capture after implementation:
  ```bash
  node animations/shared/capture/run.mjs --mode newtopics --burstFrames 12 --burstIntervalMs 150
  ```
- If user requests more frames:
  ```bash
  node animations/shared/capture/run.mjs --mode newtopics --burstFrames 30 --burstIntervalMs 50
  ```

For full iteration pipeline with analysis:
```bash
node animations/shared/diff/pipeline.mjs --scenario electricity-portal
```

Always report:
- the capture folder path
- what changed visually
