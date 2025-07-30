# MCP Client Compatibility Guide

The Obsidian MCP Server is **completely client-agnostic** and works with any MCP-compatible client. This document provides configuration examples for popular MCP clients.

> **🔌 Enhanced Integration**: For direct Obsidian plugin API access and enhanced features, see the companion [Obsidian MCP Plugin](https://github.com/sethdavis512/obsidian-mcp-plugin).

## 🔄 Universal MCP Protocol

This server implements the official **Model Context Protocol (MCP)** specification, ensuring compatibility with:

- **Windsurf** (Codeium's IDE)
- **Claude Desktop** (Anthropic)
- **Cursor** (Anysphere)
- **VS Code** (with MCP extensions)
- **Any custom MCP client**

## 🚀 Transport Methods

The server supports both standard MCP transport protocols:

### 1. stdio (Standard Input/Output)
- **Best for**: Local integrations, IDE plugins
- **Usage**: Direct process communication
- **Security**: Local only, no network exposure

### 2. HTTP/SSE (Server-Sent Events)
- **Best for**: Remote access, web applications, multiple clients
- **Usage**: Network-accessible endpoint
- **Security**: Configurable host/port binding

## 📋 Client Configuration Examples

### Windsurf

**Local (stdio) Mode:**
```json
{
  "mcpServers": {
    "obsidian-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/obsidian-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here",
        "OBSIDIAN_VAULT_PATH": "/path/to/your/obsidian/vault"
      }
    }
  }
}
```

**Remote (HTTP/SSE) Mode:**
```json
{
  "mcpServers": {
    "obsidian-mcp-server-remote": {
      "url": "http://localhost:3000/sse",
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here",
        "OBSIDIAN_VAULT_PATH": "/path/to/your/obsidian/vault"
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/absolute/path/to/obsidian-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here",
        "OBSIDIAN_VAULT_PATH": "/path/to/your/obsidian/vault"
      }
    }
  }
}
```

### Cursor

Add to your Cursor settings:

```json
{
  "mcp": {
    "servers": {
      "obsidian-mcp-server": {
        "command": "node",
        "args": ["/absolute/path/to/obsidian-mcp/dist/index.js"],
        "env": {
          "OPENAI_API_KEY": "your_openai_api_key_here",
          "OBSIDIAN_VAULT_PATH": "/path/to/your/obsidian/vault"
        }
      }
    }
  }
}
```

### VS Code (with MCP Extension)

Configuration varies by extension, but typically:

```json
{
  "mcp.servers": [
    {
      "name": "obsidian-mcp-server",
      "command": "node",
      "args": ["/absolute/path/to/obsidian-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here",
        "OBSIDIAN_VAULT_PATH": "/path/to/your/obsidian/vault"
      }
    }
  ]
}
```

### Custom MCP Client

For HTTP/SSE integration:

```javascript
// Connect to the SSE endpoint
const eventSource = new EventSource('http://localhost:3000/sse');

// Send MCP requests via POST to the same endpoint
fetch('http://localhost:3000/sse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  })
});
```

## 🔧 Multi-Client Setup

You can connect multiple clients to the same server instance:

### Option 1: Multiple stdio Instances
Each client runs its own server process:
```bash
# Each client starts its own instance
node dist/index.js  # Client 1
node dist/index.js  # Client 2
```

### Option 2: Shared HTTP Server
One server, multiple client connections:
```bash
# Start the HTTP server once
npm run start:http

# Multiple clients connect to http://localhost:3000/sse
```

## 🛠 Standard MCP Tools

All 13 tools are implemented according to MCP specification:

| Tool | Description | Input Schema |
|------|-------------|--------------|
| `list_notes` | List all notes in vault | `{ limit?: number }` |
| `read_note` | Read specific note | `{ path: string }` |
| `write_note` | Create/update note | `{ path: string, content: string, frontmatter?: object }` |
| `delete_note` | Delete note | `{ path: string }` |
| `search_notes` | Search vault | `{ query?: string, tags?: string[], path?: string, limit?: number }` |
| `vault_stats` | Get vault statistics | `{}` |
| `summarize_note` | AI summary of note | `{ path: string }` |
| `summarize_notes` | AI summary of multiple notes | `{ paths?: string[], query?: string, tags?: string[] }` |
| `generate_content` | AI content generation | `{ prompt: string, context?: string }` |
| `reformat_note` | AI note reformatting | `{ path: string, instructions: string }` |
| `extract_tasks` | Extract tasks from notes | `{ paths?: string[], query?: string, tags?: string[] }` |
| `weekly_digest` | Generate weekly digest | `{}` |
| `answer_question` | Answer based on vault | `{ question: string, query?: string, tags?: string[] }` |

## 🔍 Tool Discovery

All MCP clients can discover available tools:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

Response includes full schema for each tool, enabling auto-completion and validation in supporting clients.

## 🌐 Network Configuration

For remote access, configure the HTTP server:

```env
SERVER_HOST=0.0.0.0    # Listen on all interfaces
SERVER_PORT=8080       # Custom port
```

**Security Note**: When binding to `0.0.0.0`, the server becomes accessible from other machines on your network. Use appropriate firewall rules and consider authentication for production deployments.

## 🔧 Testing Client Compatibility

### Manual Testing with curl

```bash
# Test server health
curl http://localhost:3000/health

# Test MCP endpoint
curl -N -H "Accept: text/event-stream" http://localhost:3000/sse
```

### MCP Inspector

Use the official MCP Inspector for debugging:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## 📝 Adding New Clients

To add support for a new MCP client:

1. **Identify the client's MCP configuration format**
2. **Create appropriate configuration** (stdio or HTTP/SSE)
3. **Set required environment variables**
4. **Test tool discovery and execution**
5. **Document the configuration** (contribute back to this guide!)

## 🤝 Contributing Client Configurations

If you successfully configure this server with a new MCP client, please contribute the configuration example by:

1. Adding the configuration to this document
2. Testing thoroughly
3. Submitting a pull request

This helps the entire MCP community benefit from broader compatibility!

---

**Note**: This server is designed to be a universal bridge between Obsidian vaults and the MCP ecosystem. If you encounter compatibility issues with any MCP client, please open an issue with details about the client and error messages.
