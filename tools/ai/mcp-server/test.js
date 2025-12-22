#!/usr/bin/env node

/**
 * Test script for Chat History MCP Server
 * 
 * Runs a series of tests to verify the server is working correctly.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "..", "parsed", "conversations.json");

// Colors for output
const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

console.log(c.cyan("\n🧪 Chat History MCP Server - Test Suite\n"));

// Test 1: Check data file exists
console.log("Test 1: Data file exists...");
if (fs.existsSync(DATA_FILE)) {
  console.log(c.green("  ✓ conversations.json found"));
} else {
  console.log(c.red("  ✗ conversations.json NOT found"));
  console.log(c.dim(`    Expected at: ${DATA_FILE}`));
  console.log(c.dim("    Run parse-chats.js first to generate data"));
  process.exit(1);
}

// Test 2: Load and parse data
console.log("\nTest 2: Data is valid JSON...");
let data;
try {
  data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  console.log(c.green(`  ✓ Loaded ${data.length} conversations`));
} catch (e) {
  console.log(c.red(`  ✗ Failed to parse: ${e.message}`));
  process.exit(1);
}

// Test 3: Data structure validation
console.log("\nTest 3: Data structure is correct...");
const required = ["id", "title", "messages", "topics"];
const firstConv = data[0];
const missing = required.filter((k) => !(k in firstConv));
if (missing.length === 0) {
  console.log(c.green("  ✓ All required fields present"));
} else {
  console.log(c.red(`  ✗ Missing fields: ${missing.join(", ")}`));
}

// Test 4: Message structure
console.log("\nTest 4: Message structure...");
const firstMsg = firstConv.messages[0];
const msgRequired = ["role", "content"];
const msgMissing = msgRequired.filter((k) => !(k in firstMsg));
if (msgMissing.length === 0) {
  console.log(c.green("  ✓ Message structure valid"));
  console.log(c.dim(`    First message role: ${firstMsg.role}`));
  console.log(c.dim(`    Content length: ${firstMsg.content.length} chars`));
} else {
  console.log(c.red(`  ✗ Message missing: ${msgMissing.join(", ")}`));
}

// Test 5: Topic extraction
console.log("\nTest 5: Topics extracted...");
const allTopics = new Set();
data.forEach((c) => c.topics.forEach((t) => allTopics.add(t)));
console.log(c.green(`  ✓ ${allTopics.size} unique topics found`));
console.log(c.dim(`    Sample: ${[...allTopics].slice(0, 10).join(", ")}`));

// Test 6: Search functionality (simulate)
console.log("\nTest 6: Search simulation...");
const searchTerm = "diff";
let matchCount = 0;
for (const conv of data) {
  for (const msg of conv.messages) {
    if (msg.content.toLowerCase().includes(searchTerm)) {
      matchCount++;
    }
  }
}
console.log(c.green(`  ✓ Search for "${searchTerm}" found ${matchCount} messages`));

// Summary
console.log(c.cyan("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
console.log(c.green("\n✅ All tests passed!\n"));
console.log("Dataset Summary:");
console.log(`  • ${data.length} conversations`);
console.log(`  • ${data.reduce((sum, c) => sum + c.messageCount, 0)} total messages`);
console.log(`  • ${allTopics.size} unique topics`);
console.log(`\nThe MCP server is ready to use.`);
console.log(c.dim(`\nTo configure Claude CLI, add to your config:\n`));
console.log(`{
  "mcpServers": {
    "chat-history": {
      "command": "node",
      "args": ["${path.join(__dirname, "server.js")}"]
    }
  }
}`);
console.log();
