import { test } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

test('capture home page screenshot', async ({ page }) => {
  const now = new Date()
  const dateFolder = now.toISOString().split('T')[0] // YYYY-MM-DD
  const timestamp = now.toISOString().replace(/[:.]/g, '-')

  const screenshotDir = path.join('docs', 'screenshots', dateFolder)
  fs.mkdirSync(screenshotDir, { recursive: true })

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const screenshotPath = path.join(screenshotDir, `home-${timestamp}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })

  // Append to timeline.jsonl
  const timelineEntry = {
    timestamp: now.toISOString(),
    page: 'home',
    screenshot: screenshotPath,
  }

  fs.appendFileSync(path.join('docs', 'timeline.jsonl'), JSON.stringify(timelineEntry) + '\n')
})
