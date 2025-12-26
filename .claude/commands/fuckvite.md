# Fuck Vite

Nuclear option for when Vite won't cooperate.

## Instructions

Run Laquisha's Vite recovery protocol:

1. Kill all Vite, esbuild, and Chromium processes
2. Clear Vite cache and general cache
3. Restart dev server

```bash
pnpm vite:nuke
```

Or if you just want to clear without restarting:

```bash
pnpm vite:fix
```

## What This Fixes

- Zombie Vite processes hogging ports
- Stale esbuild workers
- Puppeteer/Chromium processes from capture pipeline
- Corrupted Vite cache
- Port conflicts (5173, 5174, 5175)

## Output

Confirm Vite is running on http://localhost:5173
