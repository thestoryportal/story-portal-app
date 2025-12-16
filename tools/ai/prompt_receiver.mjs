#!/usr/bin/env node

import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const INBOX_FILE = path.join(__dirname, 'inbox', 'latest.md')

const HOST = '127.0.0.1'
const PORT = 8787

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'POST' && req.url === '/prompt') {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const data = JSON.parse(body)

        if (!data.prompt || typeof data.prompt !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Missing or invalid "prompt" field' }))
          return
        }

        const timestamp = new Date().toISOString()
        const content = `# Latest Prompt

Received: ${timestamp}

---

${data.prompt}
`

        fs.writeFileSync(INBOX_FILE, content)

        console.log(`[${timestamp}] Prompt received (${data.prompt.length} chars)`)

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, timestamp }))
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found. Use POST /prompt' }))
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Prompt receiver listening on http://${HOST}:${PORT}`)
  console.log('Send prompts via POST /prompt with JSON body: {"prompt": "..."}')
  console.log(`Inbox file: ${INBOX_FILE}`)
})
