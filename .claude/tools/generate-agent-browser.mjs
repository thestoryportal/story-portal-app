#!/usr/bin/env node
/**
 * Agent Browser Generator
 * Generates an HTML browser for viewing agents, skills, and commands
 *
 * Usage: node .claude/tools/generate-agent-browser.mjs
 * Output: /tmp/agent-browser.html
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../..')
const claudeDir = path.join(projectRoot, '.claude')

// Read all files from a directory
function readFiles(dir, pattern = '.md') {
  const result = {}
  if (!fs.existsSync(dir)) return result

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(pattern) && f !== 'ROSTER.md')
  for (const file of files) {
    const name = file.replace(pattern, '')
    const content = fs.readFileSync(path.join(dir, file), 'utf-8')
    result[name] = content
  }
  return result
}

// Build templates object
const templates = {
  agents: {
    'project-agents': readFiles(path.join(claudeDir, 'agents')),
  },
  skills: {
    'project-skills': {},
  },
  commands: {
    'slash-commands': readFiles(path.join(claudeDir, 'commands')),
  },
}

// Read skills (including nested SKILL.md files)
const skillsDir = path.join(claudeDir, 'skills')
if (fs.existsSync(skillsDir)) {
  const items = fs.readdirSync(skillsDir)
  for (const item of items) {
    const itemPath = path.join(skillsDir, item)
    if (fs.statSync(itemPath).isDirectory()) {
      const skillFile = path.join(itemPath, 'SKILL.md')
      if (fs.existsSync(skillFile)) {
        templates.skills['project-skills'][item] = fs.readFileSync(skillFile, 'utf-8')
      }
    } else if (item.endsWith('.md')) {
      templates.skills['project-skills'][item.replace('.md', '')] = fs.readFileSync(
        itemPath,
        'utf-8'
      )
    }
  }
}

// Count totals
const agentCount = Object.values(templates.agents).reduce(
  (sum, dept) => sum + Object.keys(dept).length,
  0
)
const skillCount = Object.values(templates.skills).reduce(
  (sum, dept) => sum + Object.keys(dept).length,
  0
)
const commandCount = Object.values(templates.commands).reduce(
  (sum, dept) => sum + Object.keys(dept).length,
  0
)

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agent & Skill Browser</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; height: 100vh; background: #1a1a2e; color: #eee; }

    .sidebar { width: 280px; background: #16213e; overflow-y: auto; border-right: 1px solid #0f3460; }
    .sidebar h2 { padding: 16px; background: #0f3460; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #e94560; }
    .search { padding: 12px; }
    .search input { width: 100%; padding: 8px 12px; border: 1px solid #0f3460; border-radius: 6px; background: #1a1a2e; color: #fff; font-size: 14px; }
    .search input:focus { outline: none; border-color: #e94560; }

    .section { border-bottom: 1px solid #0f3460; }
    .section-header { padding: 12px 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #1a1a2e; }
    .section-header:hover { background: #0f3460; }
    .section-header .count { font-size: 12px; color: #888; }
    .section-header .arrow { transition: transform 0.2s; }
    .section-header.collapsed .arrow { transform: rotate(-90deg); }
    .section-items { display: none; }
    .section-header:not(.collapsed) + .section-items { display: block; }

    .dept-header { padding: 8px 16px 8px 24px; font-size: 12px; color: #888; text-transform: uppercase; cursor: pointer; display: flex; justify-content: space-between; }
    .dept-header:hover { background: #0f3460; }
    .dept-items { display: none; }
    .dept-header:not(.collapsed) + .dept-items { display: block; }

    .item { padding: 8px 16px 8px 40px; cursor: pointer; font-size: 13px; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item:hover { background: #0f3460; color: #fff; }
    .item.active { background: #e94560; color: #fff; }

    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    .topbar { padding: 12px 20px; background: #16213e; border-bottom: 1px solid #0f3460; display: flex; justify-content: space-between; align-items: center; }
    .topbar h1 { font-size: 16px; color: #e94560; }
    .topbar-actions { display: flex; gap: 12px; align-items: center; }
    .btn { padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .btn-primary { background: #e94560; color: #fff; }
    .btn-primary:hover { background: #ff6b6b; }
    .btn-secondary { background: #0f3460; color: #fff; }
    .btn-secondary:hover { background: #1a4a7a; }

    .content { flex: 1; overflow-y: auto; padding: 24px; }
    .content h1 { color: #e94560; margin-bottom: 16px; }
    .content h2 { color: #ff9f43; margin: 20px 0 12px; border-bottom: 1px solid #0f3460; padding-bottom: 8px; }
    .content h3 { color: #54a0ff; margin: 16px 0 8px; }
    .content p { line-height: 1.6; margin: 8px 0; }
    .content ul, .content ol { margin: 8px 0 8px 24px; }
    .content li { margin: 4px 0; }
    .content code { background: #0f3460; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', Monaco, monospace; font-size: 13px; }
    .content pre { background: #0f3460; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; }
    .content pre code { background: none; padding: 0; }
    .content table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .content th, .content td { padding: 8px 12px; border: 1px solid #0f3460; text-align: left; }
    .content th { background: #0f3460; }
    .content blockquote { border-left: 3px solid #e94560; padding-left: 16px; margin: 12px 0; color: #aaa; }

    .actions { padding: 16px 24px; background: #16213e; border-top: 1px solid #0f3460; display: flex; gap: 12px; }

    .welcome { text-align: center; padding: 60px 40px; }
    .welcome h1 { font-size: 32px; margin-bottom: 16px; }
    .welcome p { color: #888; font-size: 16px; max-width: 500px; margin: 0 auto; }
    .stats { display: flex; justify-content: center; gap: 30px; margin-top: 40px; flex-wrap: wrap; }
    .stat { text-align: center; }
    .stat-num { font-size: 42px; color: #e94560; font-weight: bold; }
    .stat-label { color: #888; margin-top: 8px; }

    .toast { position: fixed; bottom: 20px; right: 20px; background: #0f3460; padding: 12px 20px; border-radius: 8px; display: none; z-index: 200; }
    .toast.visible { display: block; animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .section-header.commands { color: #54a0ff; }
    .section-header.agents { color: #2ecc71; }
    .section-header.skills { color: #f39c12; }

    .generated { font-size: 11px; color: #555; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>Agent Library</h2>
    <div class="search"><input type="text" id="search" placeholder="Search..."></div>
    <div id="nav"></div>
  </div>

  <div class="main">
    <div class="topbar">
      <h1 id="title">Agent & Skill Browser</h1>
      <div class="topbar-actions">
        <button class="btn btn-secondary" onclick="copyContent()">Copy</button>
      </div>
    </div>

    <div id="content" class="content">
      <div class="welcome">
        <h1>Agent & Skill Browser</h1>
        <p>Browse agents, skills, and commands for Story Portal. Select an item from the sidebar to view its contents.</p>
        <div class="stats">
          <div class="stat"><div class="stat-num">${agentCount}</div><div class="stat-label">Agents</div></div>
          <div class="stat"><div class="stat-num">${skillCount}</div><div class="stat-label">Skills</div></div>
          <div class="stat"><div class="stat-num">${commandCount}</div><div class="stat-label">Commands</div></div>
        </div>
        <p class="generated">Generated: ${new Date().toISOString()}</p>
      </div>
    </div>

    <div id="actions" class="actions" style="display: none;">
      <button class="btn btn-primary" onclick="copyContent()">Copy to Clipboard</button>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    const templates = ${JSON.stringify(templates)};

    let currentType = null, currentKey = null, currentItem = null, currentContent = '';

    function buildNav() {
      let html = '';

      // Agents section
      const agentCount = Object.values(templates.agents).reduce((sum, dept) => sum + Object.keys(dept).length, 0);
      html += '<div class="section"><div class="section-header agents" onclick="toggleSection(this)">Agents <span class="count">(' + agentCount + ')</span> <span class="arrow">▼</span></div>';
      html += '<div class="section-items">';
      Object.keys(templates.agents).sort().forEach(cat => {
        const items = Object.keys(templates.agents[cat]).sort();
        html += '<div class="dept-header" onclick="toggleDept(this)">' + cat + ' <span>(' + items.length + ')</span></div>';
        html += '<div class="dept-items">';
        items.forEach(name => {
          html += '<div class="item" data-type="agents" data-key="' + cat + '" data-name="' + name + '" onclick="loadItem(this)">' + name + '</div>';
        });
        html += '</div>';
      });
      html += '</div></div>';

      // Skills section
      const skillCount = Object.values(templates.skills).reduce((sum, dept) => sum + Object.keys(dept).length, 0);
      html += '<div class="section"><div class="section-header skills" onclick="toggleSection(this)">Skills <span class="count">(' + skillCount + ')</span> <span class="arrow">▼</span></div>';
      html += '<div class="section-items">';
      Object.keys(templates.skills).sort().forEach(cat => {
        const items = Object.keys(templates.skills[cat]).sort();
        html += '<div class="dept-header" onclick="toggleDept(this)">' + cat + ' <span>(' + items.length + ')</span></div>';
        html += '<div class="dept-items">';
        items.forEach(name => {
          html += '<div class="item" data-type="skills" data-key="' + cat + '" data-name="' + name + '" onclick="loadItem(this)">' + name + '</div>';
        });
        html += '</div>';
      });
      html += '</div></div>';

      // Commands section
      const cmdCount = Object.values(templates.commands).reduce((sum, dept) => sum + Object.keys(dept).length, 0);
      html += '<div class="section"><div class="section-header commands" onclick="toggleSection(this)">Commands <span class="count">(' + cmdCount + ')</span> <span class="arrow">▼</span></div>';
      html += '<div class="section-items">';
      Object.keys(templates.commands).sort().forEach(cat => {
        const items = Object.keys(templates.commands[cat]).sort();
        html += '<div class="dept-header" onclick="toggleDept(this)">' + cat + ' <span>(' + items.length + ')</span></div>';
        html += '<div class="dept-items">';
        items.forEach(name => {
          html += '<div class="item" data-type="commands" data-key="' + cat + '" data-name="' + name + '" onclick="loadItem(this)">/' + name + '</div>';
        });
        html += '</div>';
      });
      html += '</div></div>';

      document.getElementById('nav').innerHTML = html;
    }

    function toggleSection(el) { el.classList.toggle('collapsed'); }
    function toggleDept(el) { el.classList.toggle('collapsed'); }

    function loadItem(el) {
      document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');

      currentType = el.dataset.type;
      currentKey = el.dataset.key;
      currentItem = el.dataset.name;
      currentContent = templates[currentType][currentKey][currentItem];

      document.getElementById('title').textContent = currentType === 'commands' ? '/' + currentItem : currentItem;
      document.getElementById('content').innerHTML = marked.parse(currentContent);
      document.getElementById('actions').style.display = 'flex';
    }

    function copyContent() {
      navigator.clipboard.writeText(currentContent);
      showToast('Copied to clipboard!');
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('visible');
      setTimeout(() => t.classList.remove('visible'), 2000);
    }

    document.getElementById('search').addEventListener('input', function(e) {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.item').forEach(el => {
        const match = el.dataset.name.toLowerCase().includes(q) || (el.dataset.key && el.dataset.key.toLowerCase().includes(q));
        el.style.display = match ? 'block' : 'none';
      });
      if (q) {
        document.querySelectorAll('.section-header, .dept-header').forEach(h => h.classList.remove('collapsed'));
      }
    });

    buildNav();
  </script>
</body>
</html>`

// Write output
const outputPath = '/tmp/agent-browser.html'
fs.writeFileSync(outputPath, html)
console.log('Generated:', outputPath)
console.log('Agents:', agentCount)
console.log('Skills:', skillCount)
console.log('Commands:', commandCount)
