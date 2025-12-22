# Chat History MCP Server

An MCP (Model Context Protocol) server providing advanced querying capabilities for The Story Portal development chat history dataset.

## Features

- **Full-text search** with context and excerpts
- **Topic-based filtering** for targeted queries
- **Decision discovery** - find architectural choices and recommendations
- **TODO tracking** - find action items and next steps
- **Code snippet extraction** - filter by language or search within code
- **Timeline queries** - view conversations by date range
- **Conversation summaries** - quick overview of any conversation
- **Dataset statistics** - understand your chat history at a glance

## Installation

```bash
cd /path/to/tools/ai/mcp-server
npm install
```

## Configuration

### For Claude CLI (`claude` command)

Add to your Claude CLI configuration (`~/.claude/claude_desktop_config.json` or similar):

```json
{
  "mcpServers": {
    "chat-history": {
      "command": "node",
      "args": ["/path/to/tools/ai/mcp-server/server.js"],
      "env": {}
    }
  }
}
```

### For Claude Desktop App

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or equivalent:

```json
{
  "mcpServers": {
    "chat-history": {
      "command": "node",
      "args": ["/absolute/path/to/tools/ai/mcp-server/server.js"]
    }
  }
}
```

### For Claude Code (VS Code Extension)

Add to your workspace settings or use the MCP configuration panel.

## Available Tools

### `search_chats`
Search through all conversations for specific text, code, or concepts.

**Parameters:**
- `query` (required): Search query
- `topic`: Filter by topic tag
- `after`: Filter by date (ISO format)
- `before`: Filter by date (ISO format)  
- `limit`: Max results (default: 10)

**Example:**
```
Search for "diff stack" in conversations about animation
```

### `get_topics`
List all available topics sorted by frequency.

### `get_by_topic`
Get all conversations with a specific topic.

**Parameters:**
- `topic` (required): Topic name (e.g., "react", "animation", "vite")

### `find_decisions`
Find architectural decisions and design choices.

**Parameters:**
- `topic`: Filter to decisions about a specific topic
- `limit`: Max results (default: 20)

### `find_todos`
Find TODO items, action items, and planned work.

**Parameters:**
- `limit`: Max results (default: 30)

### `find_code_snippets`
Extract code snippets from conversations.

**Parameters:**
- `language`: Filter by language (javascript, python, bash, etc.)
- `search`: Search within code content
- `topic`: Filter by conversation topic
- `limit`: Max results (default: 20)

### `get_conversation`
Get full content of a specific conversation.

**Parameters:**
- `id` (required): Conversation UUID

### `get_conversation_summary`
Get overview of a conversation with stats and opening exchange.

**Parameters:**
- `id` (required): Conversation UUID

### `get_timeline`
Get conversations within a date range.

**Parameters:**
- `after`: Start date (ISO format)
- `before`: End date (ISO format)
- `ascending`: Order oldest first (default: false)
- `limit`: Max results (default: 20)

### `get_stats`
Get overall dataset statistics.

## Usage Examples

Once configured, you can use these tools naturally in Claude:

```
"Search my chat history for discussions about diff stack implementation"

"What architectural decisions have been made about the animation system?"

"Find all TODO items from the last week"

"Show me JavaScript code snippets related to SSIM"

"Get statistics about my chat history"

"What topics have I discussed most frequently?"
```

## Data Requirements

This server expects the following data structure:

```
tools/ai/
├── parsed/
│   ├── conversations.json    # Main data file
│   ├── index.json           # Topic index
│   └── markdown/            # Markdown exports
│       ├── conversation-id-1.md
│       └── conversation-id-2.md
└── mcp-server/
    ├── server.js
    └── package.json
```

Run `parse-chats.js` first to generate the required data files from your raw chat exports.

## Development

```bash
# Run with auto-reload during development
npm run dev

# Run normally
npm start
```

## Troubleshooting

### Server doesn't start
- Ensure Node.js 18+ is installed
- Check that `conversations.json` exists in `../parsed/`
- Run `npm install` if dependencies are missing

### No results found
- Verify data was parsed correctly with `parse-chats.js`
- Check the search query for typos
- Try broader search terms

### MCP connection issues
- Verify the path in your config is absolute
- Restart Claude CLI/Desktop after config changes
- Check server logs for errors
