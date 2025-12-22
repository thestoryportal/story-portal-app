#!/usr/bin/env node

/**
 * Chat History MCP Server
 * 
 * An MCP server providing advanced querying capabilities for
 * The Story Portal development chat history dataset.
 * 
 * Features:
 * - Full-text search with context
 * - Semantic search by topic
 * - Timeline queries
 * - Decision/architecture discovery
 * - Code snippet extraction
 * - TODO/action item tracking
 * - Conversation summarization
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data paths
const DATA_DIR = path.join(__dirname, "..", "parsed");
const CONVERSATIONS_FILE = path.join(DATA_DIR, "conversations.json");
const MARKDOWN_DIR = path.join(DATA_DIR, "markdown");

// Cache for loaded data
let conversationsCache = null;

/**
 * Load conversations data
 */
function loadConversations() {
  if (conversationsCache) return conversationsCache;
  
  if (!fs.existsSync(CONVERSATIONS_FILE)) {
    throw new Error(`Conversations file not found: ${CONVERSATIONS_FILE}`);
  }
  
  conversationsCache = JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, "utf-8"));
  return conversationsCache;
}

/**
 * Search for text across all conversations
 */
function searchText(query, options = {}) {
  const conversations = loadConversations();
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
    
    // Filter by topic if specified
    if (options.topic && !conv.topics.includes(options.topic.toLowerCase())) {
      continue;
    }
    
    // Search through messages
    const matches = [];
    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i];
      if (msg.content.toLowerCase().includes(queryLower)) {
        matches.push({
          index: i,
          role: msg.role,
          timestamp: msg.timestamp,
          excerpt: extractExcerpt(msg.content, queryLower, 300),
          fullContent: msg.content
        });
      }
    }
    
    if (matches.length > 0) {
      results.push({
        conversationId: conv.id,
        title: conv.title,
        topics: conv.topics,
        messageCount: conv.messageCount,
        updated: conv.updated,
        matchCount: matches.length,
        matches: matches.slice(0, options.matchLimit || 5)
      });
    }
  }
  
  // Sort by relevance (match count) and recency
  results.sort((a, b) => {
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount;
    }
    return new Date(b.updated || 0) - new Date(a.updated || 0);
  });
  
  return results.slice(0, options.limit || 10);
}

/**
 * Extract excerpt around query match
 */
function extractExcerpt(content, query, maxLength) {
  const lowerContent = content.toLowerCase();
  const index = lowerContent.indexOf(query);
  
  if (index === -1) return content.substring(0, maxLength);
  
  const start = Math.max(0, index - 100);
  const end = Math.min(content.length, index + query.length + 200);
  
  let excerpt = content.substring(start, end);
  if (start > 0) excerpt = "..." + excerpt;
  if (end < content.length) excerpt = excerpt + "...";
  
  return excerpt;
}

/**
 * Get conversations by topic
 */
function getByTopic(topic) {
  const conversations = loadConversations();
  const topicLower = topic.toLowerCase();
  
  return conversations
    .filter(conv => conv.topics.some(t => t.includes(topicLower)))
    .map(conv => ({
      id: conv.id,
      title: conv.title,
      topics: conv.topics,
      messageCount: conv.messageCount,
      updated: conv.updated,
      created: conv.created
    }))
    .sort((a, b) => new Date(b.updated || 0) - new Date(a.updated || 0));
}

/**
 * Get all available topics
 */
function getAllTopics() {
  const conversations = loadConversations();
  const topicCounts = {};
  
  for (const conv of conversations) {
    for (const topic of conv.topics) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  }
  
  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, conversationCount: count }))
    .sort((a, b) => b.conversationCount - a.conversationCount);
}

/**
 * Find decisions and architectural choices
 */
function findDecisions(options = {}) {
  const conversations = loadConversations();
  const decisionPatterns = [
    /\bdecided to\b/i,
    /\bwe(?:'ll| will) (?:go with|use|implement)/i,
    /\blet'?s (?:go with|use)\b/i,
    /\bchose\b/i,
    /\binstead of\b/i,
    /\brather than\b/i,
    /\bthe (?:best|better) (?:approach|option|solution|way)\b/i,
    /\barchitecture\b/i,
    /\bdesign decision\b/i,
    /\brecommend(?:ed|ation)?\b/i,
    /\bI'd suggest\b/i
  ];
  
  const decisions = [];
  
  for (const conv of conversations) {
    // Filter by topic if specified
    if (options.topic) {
      const hasTopicInContent = conv.messages.some(m => 
        m.content.toLowerCase().includes(options.topic.toLowerCase())
      );
      if (!conv.topics.includes(options.topic.toLowerCase()) && !hasTopicInContent) {
        continue;
      }
    }
    
    for (const msg of conv.messages) {
      if (msg.role !== "assistant") continue;
      
      for (const pattern of decisionPatterns) {
        if (pattern.test(msg.content)) {
          const paragraphs = msg.content.split(/\n\n+/);
          const relevantParagraphs = paragraphs.filter(p => pattern.test(p));
          
          if (relevantParagraphs.length > 0) {
            decisions.push({
              conversationId: conv.id,
              conversationTitle: conv.title,
              timestamp: msg.timestamp,
              excerpts: relevantParagraphs.slice(0, 2).map(p => p.substring(0, 600))
            });
            break;
          }
        }
      }
    }
  }
  
  return decisions.slice(0, options.limit || 20);
}

/**
 * Find TODO items and action items
 */
function findTodos(options = {}) {
  const conversations = loadConversations();
  const todoPatterns = [
    /\btodo\b/i,
    /\bfixme\b/i,
    /\bneed to\b/i,
    /\bshould (?:we |I )?(?:add|implement|create|fix|update|refactor)/i,
    /\blet'?s (?:add|implement|create|fix|update)/i,
    /\bnext steps?\b/i,
    /\baction items?\b/i,
    /☐|◯|□/
  ];
  
  const todos = [];
  
  for (const conv of conversations) {
    for (const msg of conv.messages) {
      for (const pattern of todoPatterns) {
        if (pattern.test(msg.content)) {
          const lines = msg.content.split("\n");
          const relevantLines = lines.filter(line => pattern.test(line));
          
          if (relevantLines.length > 0) {
            todos.push({
              conversationId: conv.id,
              conversationTitle: conv.title,
              timestamp: msg.timestamp,
              role: msg.role,
              items: relevantLines.slice(0, 5).map(l => l.trim().substring(0, 200))
            });
            break;
          }
        }
      }
    }
  }
  
  // Sort by timestamp, most recent first
  todos.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  
  return todos.slice(0, options.limit || 30);
}

/**
 * Extract code snippets from conversations
 */
function findCodeSnippets(options = {}) {
  const conversations = loadConversations();
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const snippets = [];
  
  for (const conv of conversations) {
    // Filter by language if specified
    if (options.topic && !conv.topics.some(t => t.includes(options.topic.toLowerCase()))) {
      continue;
    }
    
    for (const msg of conv.messages) {
      let match;
      while ((match = codeBlockRegex.exec(msg.content)) !== null) {
        const language = match[1] || "unknown";
        const code = match[2].trim();
        
        // Filter by language if specified
        if (options.language && language.toLowerCase() !== options.language.toLowerCase()) {
          continue;
        }
        
        // Filter by search term if specified
        if (options.search && !code.toLowerCase().includes(options.search.toLowerCase())) {
          continue;
        }
        
        snippets.push({
          conversationId: conv.id,
          conversationTitle: conv.title,
          language,
          code: code.substring(0, 1000),
          timestamp: msg.timestamp,
          role: msg.role
        });
      }
    }
  }
  
  return snippets.slice(0, options.limit || 20);
}

/**
 * Get conversation by ID with full content
 */
function getConversation(id) {
  const conversations = loadConversations();
  const conv = conversations.find(c => c.id === id);
  
  if (!conv) {
    return null;
  }
  
  return {
    id: conv.id,
    title: conv.title,
    created: conv.created,
    updated: conv.updated,
    messageCount: conv.messageCount,
    topics: conv.topics,
    messages: conv.messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp
    }))
  };
}

/**
 * Get conversation summary/overview
 */
function getConversationSummary(id) {
  const conv = getConversation(id);
  if (!conv) return null;
  
  // Extract first user message and first substantive assistant response
  const firstUserMsg = conv.messages.find(m => m.role === "user");
  const firstAssistantMsg = conv.messages.find(m => m.role === "assistant" && m.content.length > 100);
  
  // Count message types
  const userMsgCount = conv.messages.filter(m => m.role === "user").length;
  const assistantMsgCount = conv.messages.filter(m => m.role === "assistant").length;
  
  return {
    id: conv.id,
    title: conv.title,
    created: conv.created,
    updated: conv.updated,
    topics: conv.topics,
    stats: {
      totalMessages: conv.messageCount,
      userMessages: userMsgCount,
      assistantMessages: assistantMsgCount
    },
    firstUserMessage: firstUserMsg ? firstUserMsg.content.substring(0, 500) : null,
    firstAssistantResponse: firstAssistantMsg ? firstAssistantMsg.content.substring(0, 500) : null
  };
}

/**
 * Timeline query - get conversations in a date range
 */
function getTimeline(options = {}) {
  const conversations = loadConversations();
  
  let filtered = conversations;
  
  if (options.after) {
    const afterDate = new Date(options.after);
    filtered = filtered.filter(c => new Date(c.created || c.updated) >= afterDate);
  }
  
  if (options.before) {
    const beforeDate = new Date(options.before);
    filtered = filtered.filter(c => new Date(c.created || c.updated) <= beforeDate);
  }
  
  // Sort by date
  filtered.sort((a, b) => {
    const dateA = new Date(a.updated || a.created || 0);
    const dateB = new Date(b.updated || b.created || 0);
    return options.ascending ? dateA - dateB : dateB - dateA;
  });
  
  return filtered.slice(0, options.limit || 20).map(c => ({
    id: c.id,
    title: c.title,
    created: c.created,
    updated: c.updated,
    messageCount: c.messageCount,
    topics: c.topics.slice(0, 10)
  }));
}

/**
 * Get dataset statistics
 */
function getStats() {
  const conversations = loadConversations();
  
  let totalMessages = 0;
  let totalUserMessages = 0;
  let totalAssistantMessages = 0;
  const allTopics = new Set();
  
  for (const conv of conversations) {
    totalMessages += conv.messageCount;
    for (const msg of conv.messages) {
      if (msg.role === "user") totalUserMessages++;
      else if (msg.role === "assistant") totalAssistantMessages++;
    }
    for (const topic of conv.topics) {
      allTopics.add(topic);
    }
  }
  
  // Find date range
  const dates = conversations
    .map(c => new Date(c.created || c.updated))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a - b);
  
  return {
    conversationCount: conversations.length,
    totalMessages,
    userMessages: totalUserMessages,
    assistantMessages: totalAssistantMessages,
    uniqueTopics: allTopics.size,
    topTopics: getAllTopics().slice(0, 15),
    dateRange: {
      earliest: dates[0]?.toISOString() || null,
      latest: dates[dates.length - 1]?.toISOString() || null
    }
  };
}

// Create MCP Server
const server = new Server(
  {
    name: "chat-history-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_chats",
        description: "Search through all chat conversations for specific text, code, or concepts. Returns matching conversations with excerpts showing context around matches.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query - can be keywords, phrases, code snippets, or concepts"
            },
            topic: {
              type: "string",
              description: "Optional: filter results to conversations tagged with this topic"
            },
            after: {
              type: "string",
              description: "Optional: only include conversations after this date (ISO format)"
            },
            before: {
              type: "string",
              description: "Optional: only include conversations before this date (ISO format)"
            },
            limit: {
              type: "number",
              description: "Maximum number of conversations to return (default: 10)"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_topics",
        description: "Get all available topics/tags in the chat history, sorted by frequency. Use this to discover what subjects have been discussed.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_by_topic",
        description: "Get all conversations related to a specific topic. Topics include: react, vite, animation, portal, css, typescript, etc.",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Topic to filter by (e.g., 'react', 'animation', 'diff')"
            }
          },
          required: ["topic"]
        }
      },
      {
        name: "find_decisions",
        description: "Find architectural decisions, design choices, and recommendations made in conversations. Great for understanding why certain approaches were taken.",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Optional: filter to decisions about a specific topic"
            },
            limit: {
              type: "number",
              description: "Maximum number of decisions to return (default: 20)"
            }
          }
        }
      },
      {
        name: "find_todos",
        description: "Find TODO items, action items, and 'next steps' mentioned in conversations. Useful for tracking what was planned but may not have been completed.",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of items to return (default: 30)"
            }
          }
        }
      },
      {
        name: "find_code_snippets",
        description: "Extract code snippets from conversations. Can filter by programming language or search within code.",
        inputSchema: {
          type: "object",
          properties: {
            language: {
              type: "string",
              description: "Optional: filter by language (javascript, python, bash, css, html, etc.)"
            },
            search: {
              type: "string",
              description: "Optional: search for specific text within code snippets"
            },
            topic: {
              type: "string",
              description: "Optional: filter to conversations with this topic"
            },
            limit: {
              type: "number",
              description: "Maximum number of snippets to return (default: 20)"
            }
          }
        }
      },
      {
        name: "get_conversation",
        description: "Get the full content of a specific conversation by its ID. Use this when you need to dive deep into a particular conversation.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The conversation ID (UUID format)"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "get_conversation_summary",
        description: "Get a summary/overview of a specific conversation including stats and the opening exchange.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The conversation ID (UUID format)"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "get_timeline",
        description: "Get conversations within a date range, ordered chronologically. Useful for understanding project progression over time.",
        inputSchema: {
          type: "object",
          properties: {
            after: {
              type: "string",
              description: "Start date (ISO format, e.g., '2024-12-01')"
            },
            before: {
              type: "string",
              description: "End date (ISO format)"
            },
            ascending: {
              type: "boolean",
              description: "If true, order oldest first; if false (default), newest first"
            },
            limit: {
              type: "number",
              description: "Maximum number of conversations (default: 20)"
            }
          }
        }
      },
      {
        name: "get_stats",
        description: "Get overall statistics about the chat history dataset including conversation count, message counts, top topics, and date range.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result;
    
    switch (name) {
      case "search_chats":
        result = searchText(args.query, {
          topic: args.topic,
          after: args.after,
          before: args.before,
          limit: args.limit
        });
        break;
        
      case "get_topics":
        result = getAllTopics();
        break;
        
      case "get_by_topic":
        result = getByTopic(args.topic);
        break;
        
      case "find_decisions":
        result = findDecisions({
          topic: args.topic,
          limit: args.limit
        });
        break;
        
      case "find_todos":
        result = findTodos({ limit: args.limit });
        break;
        
      case "find_code_snippets":
        result = findCodeSnippets({
          language: args.language,
          search: args.search,
          topic: args.topic,
          limit: args.limit
        });
        break;
        
      case "get_conversation":
        result = getConversation(args.id);
        if (!result) {
          return {
            content: [{ type: "text", text: `Conversation not found: ${args.id}` }],
            isError: true
          };
        }
        break;
        
      case "get_conversation_summary":
        result = getConversationSummary(args.id);
        if (!result) {
          return {
            content: [{ type: "text", text: `Conversation not found: ${args.id}` }],
            isError: true
          };
        }
        break;
        
      case "get_timeline":
        result = getTimeline({
          after: args.after,
          before: args.before,
          ascending: args.ascending,
          limit: args.limit
        });
        break;
        
      case "get_stats":
        result = getStats();
        break;
        
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true
        };
    }
    
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
    
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

// Define resources (markdown files)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = [];
  
  if (fs.existsSync(MARKDOWN_DIR)) {
    const files = fs.readdirSync(MARKDOWN_DIR);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const convId = file.replace(".md", "");
        resources.push({
          uri: `chat://${convId}`,
          name: file,
          description: `Markdown export of conversation`,
          mimeType: "text/markdown"
        });
      }
    }
  }
  
  return { resources: resources.slice(0, 100) }; // Limit to 100
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  if (uri.startsWith("chat://")) {
    const convId = uri.replace("chat://", "");
    const mdPath = path.join(MARKDOWN_DIR, `${convId}.md`);
    
    // Try to find matching file
    if (fs.existsSync(mdPath)) {
      const content = fs.readFileSync(mdPath, "utf-8");
      return {
        contents: [{
          uri,
          mimeType: "text/markdown",
          text: content
        }]
      };
    }
    
    // Try finding by partial match
    const files = fs.readdirSync(MARKDOWN_DIR);
    const match = files.find(f => f.includes(convId));
    if (match) {
      const content = fs.readFileSync(path.join(MARKDOWN_DIR, match), "utf-8");
      return {
        contents: [{
          uri,
          mimeType: "text/markdown",
          text: content
        }]
      };
    }
  }
  
  throw new Error(`Resource not found: ${uri}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Chat History MCP Server running on stdio");
}

main().catch(console.error);
