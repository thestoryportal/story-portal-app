#!/usr/bin/env node

/**
 * search-history.js
 *
 * Search through parsed chat history for relevant context.
 * Requires running parse-chats.js first to generate the index.
 *
 * Usage:
 *   node search-history.js "authentication flow"
 *   node search-history.js --topic react
 *   node search-history.js --after 2024-01-01 "refactor"
 *   node search-history.js --todos
 *   node search-history.js --decisions "state management"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PARSED_DIR = path.join(__dirname, 'parsed');
const INDEX_FILE = path.join(PARSED_DIR, 'index.json');
const DATA_FILE = path.join(PARSED_DIR, 'conversations.json');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function c(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Load parsed data
 */
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(c('red', 'Parsed data not found. Run parse-chats.js first.'));
    console.error(`Expected: ${DATA_FILE}`);
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

/**
 * Search for text across all conversations
 */
function searchText(conversations, query, options = {}) {
  const queryLower = query.toLowerCase();
  const results = [];

  for (const conv of conversations) {
    // Apply date filters
    if (options.after && conv.created && new Date(conv.created) < new Date(options.after)) {
      continue;
    }
    if (options.before && conv.created && new Date(conv.created) > new Date(options.before)) {
      continue;
    }

    // Search through messages
    const matches = [];
    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i];
      if (msg.content.toLowerCase().includes(queryLower)) {
        // Get context (previous and next message)
        const context = {
          message: msg,
          index: i,
          before: i > 0 ? conv.messages[i - 1] : null,
          after: i < conv.messages.length - 1 ? conv.messages[i + 1] : null
        };
        matches.push(context);
      }
    }

    if (matches.length > 0) {
      results.push({
        conversation: conv,
        matches: matches
      });
    }
  }

  // Sort by relevance (number of matches) and recency
  results.sort((a, b) => {
    if (b.matches.length !== a.matches.length) {
      return b.matches.length - a.matches.length;
    }
    return new Date(b.conversation.updated || 0) - new Date(a.conversation.updated || 0);
  });

  return results;
}

/**
 * Search by topic
 */
function searchByTopic(conversations, topic) {
  const topicLower = topic.toLowerCase();
  return conversations.filter(conv =>
    conv.topics.some(t => t.includes(topicLower))
  );
}

/**
 * Find TODO items and action items
 */
function findTodos(conversations) {
  const todoPatterns = [
    /\btodo\b/i,
    /\bfixme\b/i,
    /\bhack\b/i,
    /\bneed to\b/i,
    /\bshould (?:we |I )?(?:add|implement|create|fix|update|refactor)/i,
    /\blet'?s (?:add|implement|create|fix|update)/i,
    /\bremember to\b/i,
    /\bdon'?t forget\b/i,
    /\bnext steps?\b/i,
    /\baction items?\b/i,
    /☐|◯|□/  // Checkbox characters
  ];

  const todos = [];

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      for (const pattern of todoPatterns) {
        if (pattern.test(msg.content)) {
          // Extract the relevant line(s)
          const lines = msg.content.split('\n');
          const relevantLines = lines.filter(line => pattern.test(line));

          if (relevantLines.length > 0) {
            todos.push({
              conversation: conv.title,
              conversationId: conv.id,
              timestamp: msg.timestamp,
              role: msg.role,
              items: relevantLines.slice(0, 5) // Limit to 5 lines per match
            });
            break; // Only match once per message
          }
        }
      }
    }
  }

  // Sort by timestamp, most recent first
  todos.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  return todos;
}

/**
 * Find decision points and architectural choices
 */
function findDecisions(conversations, topic = null) {
  const decisionPatterns = [
    /\bdecided to\b/i,
    /\bwe(?:'ll| will) (?:go with|use|implement)/i,
    /\blet'?s (?:go with|use)\b/i,
    /\bchose\b/i,
    /\bpicked\b/i,
    /\binstead of\b/i,
    /\brather than\b/i,
    /\bthe (?:best|better) (?:approach|option|solution|way)\b/i,
    /\bfor now,? (?:we|I)(?:'ll)?\b/i,
    /\barchitecture\b/i,
    /\bdesign decision\b/i
  ];

  const decisions = [];

  for (const conv of conversations) {
    // If topic specified, check if conversation is relevant
    if (topic && !conv.topics.includes(topic.toLowerCase())) {
      const hasTopicInContent = conv.messages.some(m =>
        m.content.toLowerCase().includes(topic.toLowerCase())
      );
      if (!hasTopicInContent) continue;
    }

    for (const msg of conv.messages) {
      if (msg.role !== 'assistant') continue; // Decisions usually come from assistant

      for (const pattern of decisionPatterns) {
        if (pattern.test(msg.content)) {
          // Extract paragraph containing the decision
          const paragraphs = msg.content.split(/\n\n+/);
          const relevantParagraphs = paragraphs.filter(p => pattern.test(p));

          if (relevantParagraphs.length > 0) {
            decisions.push({
              conversation: conv.title,
              conversationId: conv.id,
              timestamp: msg.timestamp,
              excerpts: relevantParagraphs.slice(0, 2).map(p => p.substring(0, 500))
            });
            break;
          }
        }
      }
    }
  }

  return decisions;
}

/**
 * Find deprecated/abandoned approaches
 */
function findDeprecated(conversations) {
  const deprecatedPatterns = [
    /\bdeprecated\b/i,
    /\babandoned\b/i,
    /\bno longer (?:use|using|need|needed)\b/i,
    /\bremoved?\b/i,
    /\breplaced? (?:with|by)\b/i,
    /\bdon'?t (?:use|do) this\b/i,
    /\bthis (?:doesn'?t|won'?t) work\b/i,
    /\bbad (?:approach|idea|pattern)\b/i,
    /\banti-?pattern\b/i,
    /\bscrapped?\b/i,
    /\bwon'?t work because\b/i
  ];

  const deprecated = [];

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      for (const pattern of deprecatedPatterns) {
        if (pattern.test(msg.content)) {
          const lines = msg.content.split('\n');
          const relevantLines = lines.filter(line => pattern.test(line));

          if (relevantLines.length > 0) {
            deprecated.push({
              conversation: conv.title,
              conversationId: conv.id,
              timestamp: msg.timestamp,
              role: msg.role,
              items: relevantLines.slice(0, 3).map(l => l.substring(0, 200))
            });
            break;
          }
        }
      }
    }
  }

  return deprecated;
}

/**
 * Format and display search results
 */
function displayResults(results, options = {}) {
  const limit = options.limit || 10;
  const showContext = options.context !== false;

  if (results.length === 0) {
    console.log(c('yellow', 'No results found.'));
    return;
  }

  console.log(c('green', `\nFound ${results.length} conversation(s) with matches:\n`));

  for (let i = 0; i < Math.min(results.length, limit); i++) {
    const result = results[i];
    const conv = result.conversation;

    console.log(c('bright', `━━━ ${conv.title} ━━━`));
    console.log(c('dim', `ID: ${conv.id} | ${conv.messageCount} messages | Updated: ${conv.updated || 'Unknown'}`));
    console.log(c('cyan', `Topics: ${conv.topics.join(', ') || 'None detected'}`));
    console.log();

    // Show first few matches
    const matchLimit = 3;
    for (let j = 0; j < Math.min(result.matches.length, matchLimit); j++) {
      const match = result.matches[j];
      const roleColor = match.message.role === 'user' ? 'blue' : 'magenta';

      console.log(c(roleColor, `[${match.message.role.toUpperCase()}]`));

      // Show excerpt with highlighted match
      const excerpt = match.message.content.substring(0, 300);
      console.log(excerpt + (match.message.content.length > 300 ? '...' : ''));
      console.log();
    }

    if (result.matches.length > matchLimit) {
      console.log(c('dim', `  ... and ${result.matches.length - matchLimit} more matches in this conversation`));
    }

    console.log();
  }

  if (results.length > limit) {
    console.log(c('dim', `Showing ${limit} of ${results.length} results. Use --limit N for more.`));
  }
}

/**
 * Display TODO items
 */
function displayTodos(todos) {
  if (todos.length === 0) {
    console.log(c('green', 'No TODO items found.'));
    return;
  }

  console.log(c('yellow', `\n📋 Found ${todos.length} TODO/action items:\n`));

  for (const todo of todos.slice(0, 20)) {
    console.log(c('bright', `From: ${todo.conversation}`));
    console.log(c('dim', `When: ${todo.timestamp || 'Unknown'} | By: ${todo.role}`));
    for (const item of todo.items) {
      console.log(`  • ${item.trim().substring(0, 100)}`);
    }
    console.log();
  }
}

/**
 * Display decisions
 */
function displayDecisions(decisions) {
  if (decisions.length === 0) {
    console.log(c('yellow', 'No decision points found.'));
    return;
  }

  console.log(c('cyan', `\n🎯 Found ${decisions.length} decision points:\n`));

  for (const decision of decisions.slice(0, 15)) {
    console.log(c('bright', `━━━ ${decision.conversation} ━━━`));
    console.log(c('dim', `When: ${decision.timestamp || 'Unknown'}`));
    for (const excerpt of decision.excerpts) {
      console.log(excerpt);
    }
    console.log();
  }
}

/**
 * Output results as JSON for piping to other tools
 */
function outputJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    query: null,
    mode: 'search',
    topic: null,
    after: null,
    before: null,
    limit: 10,
    json: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--topic' || arg === '-t') {
      options.mode = 'topic';
      options.topic = args[++i];
    } else if (arg === '--todos') {
      options.mode = 'todos';
    } else if (arg === '--decisions') {
      options.mode = 'decisions';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.topic = args[++i];
      }
    } else if (arg === '--deprecated') {
      options.mode = 'deprecated';
    } else if (arg === '--after') {
      options.after = args[++i];
    } else if (arg === '--before') {
      options.before = args[++i];
    } else if (arg === '--limit' || arg === '-n') {
      options.limit = parseInt(args[++i], 10);
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      options.query = arg;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${c('bright', 'search-history.js')} - Search through parsed chat history

${c('cyan', 'Usage:')}
  node search-history.js [options] "search query"

${c('cyan', 'Options:')}
  --topic, -t <topic>    Search by topic tag
  --todos                Find TODO items and action items
  --decisions [topic]    Find decision points (optionally filtered by topic)
  --deprecated           Find deprecated/abandoned approaches
  --after <date>         Only include conversations after this date
  --before <date>        Only include conversations before this date
  --limit, -n <num>      Maximum results to show (default: 10)
  --json                 Output results as JSON
  --help, -h             Show this help

${c('cyan', 'Examples:')}
  node search-history.js "authentication"
  node search-history.js --topic react
  node search-history.js --todos
  node search-history.js --decisions "state management"
  node search-history.js --after 2024-06-01 "refactor"
`);
}

/**
 * Main execution
 */
function main() {
  const options = parseArgs();
  const conversations = loadData();

  console.log(c('dim', `Loaded ${conversations.length} conversations\n`));

  let results;

  switch (options.mode) {
    case 'topic':
      results = searchByTopic(conversations, options.topic);
      if (options.json) {
        outputJson(results);
      } else {
        console.log(c('cyan', `Conversations tagged with "${options.topic}":\n`));
        for (const conv of results.slice(0, options.limit)) {
          console.log(`• ${c('bright', conv.title)}`);
          console.log(`  ${c('dim', `${conv.messageCount} messages | ${conv.updated || 'Unknown'}`)}`);
        }
      }
      break;

    case 'todos':
      results = findTodos(conversations);
      if (options.json) {
        outputJson(results);
      } else {
        displayTodos(results);
      }
      break;

    case 'decisions':
      results = findDecisions(conversations, options.topic);
      if (options.json) {
        outputJson(results);
      } else {
        displayDecisions(results);
      }
      break;

    case 'deprecated':
      results = findDeprecated(conversations);
      if (options.json) {
        outputJson(results);
      } else {
        console.log(c('red', `\n⚠️  Found ${results.length} deprecated/abandoned items:\n`));
        for (const item of results.slice(0, 15)) {
          console.log(c('bright', `From: ${item.conversation}`));
          for (const line of item.items) {
            console.log(`  ✗ ${line}`);
          }
          console.log();
        }
      }
      break;

    default:
      if (!options.query) {
        showHelp();
        process.exit(1);
      }
      results = searchText(conversations, options.query, {
        after: options.after,
        before: options.before
      });
      if (options.json) {
        outputJson(results.map(r => ({
          conversation: {
            id: r.conversation.id,
            title: r.conversation.title,
            topics: r.conversation.topics
          },
          matchCount: r.matches.length,
          excerpts: r.matches.slice(0, 5).map(m => ({
            role: m.message.role,
            content: m.message.content.substring(0, 500)
          }))
        })));
      } else {
        displayResults(results, { limit: options.limit });
      }
  }
}

main();
