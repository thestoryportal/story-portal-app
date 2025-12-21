#!/usr/bin/env node

/**
 * parse-chats.js
 *
 * Parses ChatGPT export JSON files (nested tree format) into flat, searchable conversations.
 * Outputs both JSON (for programmatic access) and Markdown (for human reading/grep).
 *
 * Usage:
 *   node parse-chats.js                    # Process all JSON files in Chat Datasets/
 *   node parse-chats.js specific-file.json # Process a single file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_DIR = path.join(__dirname, 'datasets');
const OUTPUT_DIR = path.join(__dirname, 'parsed');
const INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');
const MARKDOWN_DIR = path.join(OUTPUT_DIR, 'markdown');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(MARKDOWN_DIR)) fs.mkdirSync(MARKDOWN_DIR, { recursive: true });

/**
 * Flatten the nested mapping structure into a linear conversation
 */
function flattenConversation(mapping) {
  const messages = [];
  const nodes = Object.values(mapping);

  // Find root node
  let current = nodes.find(n => n.parent === null || n.parent === 'client-created-root');
  if (!current) current = nodes.find(n => n.id === 'client-created-root');

  const visited = new Set();

  function traverse(nodeId) {
    if (!nodeId || visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = mapping[nodeId];
    if (!node) return;

    if (node.message && node.message.content) {
      const msg = node.message;
      const role = msg.author?.role;

      // Skip system messages and hidden messages
      if (role === 'system') {
        // Continue to children
      } else if (role === 'user' || role === 'assistant') {
        const content = extractContent(msg.content);
        if (content && content.trim()) {
          messages.push({
            id: msg.id,
            role: role,
            content: content,
            timestamp: msg.create_time ? new Date(msg.create_time * 1000).toISOString() : null,
            metadata: {
              model: msg.metadata?.model_slug || null,
              hasThoughts: msg.content?.content_type === 'thoughts'
            }
          });
        }
      } else if (role === 'tool') {
        // Include tool usage for context but mark it
        const content = extractContent(msg.content);
        if (content && content.trim() && !content.includes('redacted')) {
          messages.push({
            id: msg.id,
            role: 'tool',
            toolName: msg.author?.name || 'unknown',
            content: content.substring(0, 500), // Truncate tool outputs
            timestamp: msg.create_time ? new Date(msg.create_time * 1000).toISOString() : null
          });
        }
      }
    }

    // Traverse children
    if (node.children && node.children.length > 0) {
      // Follow the main conversation path (usually first child, or highest weight)
      for (const childId of node.children) {
        traverse(childId);
      }
    }
  }

  // Start traversal
  if (current) {
    traverse(current.id);
  }

  return messages;
}

/**
 * Extract text content from various content formats
 */
function extractContent(content) {
  if (!content) return '';

  if (content.content_type === 'text' && content.parts) {
    return content.parts.filter(p => typeof p === 'string').join('\n');
  }

  if (content.content_type === 'thoughts' && content.thoughts) {
    // Extract thinking summaries
    return content.thoughts
      .map(t => t.summary || t.content || '')
      .filter(Boolean)
      .join('\n');
  }

  if (typeof content === 'string') {
    return content;
  }

  return '';
}

/**
 * Extract key topics and keywords from a conversation
 */
function extractTopics(messages) {
  const text = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ')
    .toLowerCase();

  // Common development-related keywords to look for
  const keywords = [
    'component', 'api', 'database', 'auth', 'authentication', 'ui', 'ux',
    'bug', 'fix', 'error', 'debug', 'test', 'deploy', 'build', 'config',
    'style', 'css', 'layout', 'responsive', 'mobile', 'animation',
    'state', 'redux', 'context', 'hook', 'effect', 'render',
    'route', 'navigation', 'page', 'modal', 'form', 'input',
    'story', 'narrative', 'portal', 'chapter', 'scene', 'character',
    'player', 'game', 'interactive', 'choice', 'branch',
    'todo', 'feature', 'implement', 'refactor', 'optimize',
    'vite', 'react', 'typescript', 'javascript', 'html', 'node'
  ];

  const found = keywords.filter(kw => text.includes(kw));
  return [...new Set(found)];
}

/**
 * Convert conversation to readable Markdown
 */
function toMarkdown(conversation, messages) {
  let md = `# ${conversation.title}\n\n`;
  md += `**Created:** ${conversation.create_time ? new Date(conversation.create_time * 1000).toISOString() : 'Unknown'}\n`;
  md += `**Updated:** ${conversation.update_time ? new Date(conversation.update_time * 1000).toISOString() : 'Unknown'}\n`;
  md += `**Messages:** ${messages.length}\n\n`;
  md += `---\n\n`;

  for (const msg of messages) {
    const role = msg.role.toUpperCase();
    const timestamp = msg.timestamp ? ` (${msg.timestamp})` : '';

    if (msg.role === 'tool') {
      md += `### 🔧 TOOL: ${msg.toolName}${timestamp}\n\n`;
      md += `\`\`\`\n${msg.content}\n\`\`\`\n\n`;
    } else {
      const icon = msg.role === 'user' ? '👤' : '🤖';
      md += `### ${icon} ${role}${timestamp}\n\n`;
      md += `${msg.content}\n\n`;
    }

    md += `---\n\n`;
  }

  return md;
}

/**
 * Process a single JSON file
 */
function processFile(filepath) {
  console.log(`Processing: ${filepath}`);

  const raw = fs.readFileSync(filepath, 'utf-8');
  const data = JSON.parse(raw);

  const conversations = data.conversations || [data];
  const results = [];

  for (const conv of conversations) {
    if (!conv.mapping) {
      console.log(`  Skipping conversation without mapping: ${conv.title || 'Untitled'}`);
      continue;
    }

    const messages = flattenConversation(conv.mapping);

    if (messages.length === 0) {
      console.log(`  Skipping empty conversation: ${conv.title || 'Untitled'}`);
      continue;
    }

    const topics = extractTopics(messages);

    const parsed = {
      id: conv.id || conv.conversation_id || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: conv.title || 'Untitled Conversation',
      created: conv.create_time ? new Date(conv.create_time * 1000).toISOString() : null,
      updated: conv.update_time ? new Date(conv.update_time * 1000).toISOString() : null,
      messageCount: messages.length,
      topics: topics,
      messages: messages,
      sourceFile: path.basename(filepath)
    };

    results.push(parsed);

    // Write individual markdown file
    const safeName = parsed.title
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .substring(0, 50)
      .toLowerCase();
    const mdPath = path.join(MARKDOWN_DIR, `${safeName}-${parsed.id.substring(0, 8)}.md`);
    fs.writeFileSync(mdPath, toMarkdown(conv, messages));

    console.log(`  ✓ ${parsed.title} (${messages.length} messages, topics: ${topics.slice(0, 5).join(', ')})`);
  }

  return results;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  let filesToProcess = [];

  if (args.length > 0) {
    // Process specific file(s)
    filesToProcess = args.map(f => {
      if (path.isAbsolute(f)) return f;
      if (fs.existsSync(f)) return f;
      return path.join(DATASET_DIR, f);
    });
  } else {
    // Process all JSON files in dataset directory
    if (!fs.existsSync(DATASET_DIR)) {
      console.error(`Dataset directory not found: ${DATASET_DIR}`);
      console.error(`Create it and add your JSON chat exports.`);
      process.exit(1);
    }

    filesToProcess = fs.readdirSync(DATASET_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(DATASET_DIR, f));
  }

  if (filesToProcess.length === 0) {
    console.log('No JSON files found to process.');
    process.exit(0);
  }

  console.log(`\nParsing ${filesToProcess.length} file(s)...\n`);

  const allConversations = [];

  for (const file of filesToProcess) {
    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      continue;
    }

    try {
      const results = processFile(file);
      allConversations.push(...results);
    } catch (err) {
      console.error(`Error processing ${file}: ${err.message}`);
    }
  }

  // Build master index
  const index = {
    generated: new Date().toISOString(),
    totalConversations: allConversations.length,
    totalMessages: allConversations.reduce((sum, c) => sum + c.messageCount, 0),
    conversations: allConversations.map(c => ({
      id: c.id,
      title: c.title,
      created: c.created,
      updated: c.updated,
      messageCount: c.messageCount,
      topics: c.topics,
      sourceFile: c.sourceFile
    }))
  };

  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));

  // Write full parsed data
  const fullDataPath = path.join(OUTPUT_DIR, 'conversations.json');
  fs.writeFileSync(fullDataPath, JSON.stringify(allConversations, null, 2));

  console.log(`\n✓ Parsed ${allConversations.length} conversations`);
  console.log(`✓ Index written to: ${INDEX_FILE}`);
  console.log(`✓ Full data written to: ${fullDataPath}`);
  console.log(`✓ Markdown files written to: ${MARKDOWN_DIR}/`);
}

main();
