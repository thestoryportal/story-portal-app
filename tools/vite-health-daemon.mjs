#!/usr/bin/env node
/**
 * Vite Health Daemon
 *
 * Monitors Vite dev server and auto-recovers on crash.
 * Run with: node tools/vite-health-daemon.mjs
 *
 * Features:
 * - Polls Vite every 5 seconds
 * - Auto-restarts on 3 consecutive failures
 * - Logs status with timestamps
 * - Clears cache before restart
 */

import { spawn, execSync } from 'child_process'

const CONFIG = {
  port: 5173,
  pollInterval: 5000, // 5 seconds
  failThreshold: 3, // failures before restart
  startupGrace: 10000, // wait after restart
}

let consecutiveFailures = 0
let viteProcess = null
let isRestarting = false

function log(msg, type = 'info') {
  const time = new Date().toLocaleTimeString()
  const prefix =
    {
      info: '○',
      ok: '✓',
      warn: '⚠',
      error: '✗',
      restart: '↻',
    }[type] || '○'
  console.log(`${time} ${prefix} ${msg}`)
}

async function checkVite() {
  try {
    const response = await fetch(`http://localhost:${CONFIG.port}`, {
      signal: AbortSignal.timeout(3000),
    })
    if (response.ok) {
      if (consecutiveFailures > 0) {
        log('Vite recovered', 'ok')
      }
      consecutiveFailures = 0
      return true
    }
  } catch {
    // fetch failed
  }

  consecutiveFailures++
  log(`Vite check failed (${consecutiveFailures}/${CONFIG.failThreshold})`, 'warn')
  return false
}

function killVite() {
  try {
    execSync('pkill -9 -f vite 2>/dev/null; pkill -9 -f esbuild 2>/dev/null', { stdio: 'ignore' })
  } catch {
    // ignore errors
  }
}

function clearCache() {
  try {
    execSync('rm -rf node_modules/.vite node_modules/.cache', { stdio: 'ignore' })
    log('Cleared Vite cache', 'info')
  } catch {
    // ignore errors
  }
}

function startVite() {
  log('Starting Vite...', 'restart')
  viteProcess = spawn('pnpm', ['dev'], {
    stdio: 'inherit',
    detached: false,
  })

  viteProcess.on('exit', (code) => {
    log(`Vite exited with code ${code}`, code === 0 ? 'info' : 'error')
    viteProcess = null
  })
}

async function restartVite() {
  if (isRestarting) return
  isRestarting = true

  log('Auto-recovering Vite...', 'restart')
  killVite()
  clearCache()

  await new Promise((r) => setTimeout(r, 1000))
  startVite()

  // Grace period before checking again
  await new Promise((r) => setTimeout(r, CONFIG.startupGrace))
  consecutiveFailures = 0
  isRestarting = false
}

async function monitor() {
  log(`Vite Health Daemon started (port ${CONFIG.port})`, 'info')
  log(
    `Polling every ${CONFIG.pollInterval / 1000}s, restart after ${CONFIG.failThreshold} failures`,
    'info'
  )
  console.log('─'.repeat(50))

  // Initial check
  const initialOk = await checkVite()
  if (!initialOk) {
    log('Vite not running, starting...', 'warn')
    await restartVite()
  } else {
    log('Vite is healthy', 'ok')
  }

  // Poll loop
  setInterval(async () => {
    if (isRestarting) return

    const ok = await checkVite()
    if (!ok && consecutiveFailures >= CONFIG.failThreshold) {
      await restartVite()
    }
  }, CONFIG.pollInterval)
}

// Handle shutdown
process.on('SIGINT', () => {
  log('Daemon shutting down...', 'info')
  if (viteProcess) {
    viteProcess.kill()
  }
  process.exit(0)
})

monitor()
