# Obsidian MCP Server

A comprehensive Model Context Protocol (MCP) server that integrates your Obsidian vault with OpenAI's API. **Client-agnostic** design works with Windsurf, Claude Desktop, Cursor, VS Code, and any MCP-compatible client.

> **🔌 Related Project**: For enhanced Obsidian integration, see the companion [Obsidian MCP Plugin](https://github.com/sethdavis512/obsidian-mcp-plugin) that provides direct plugin API access.

## Features

- **Full Vault Access**: Read, write, search, and manage your Obsidian notes
- **AI-Powered Operations**: Summarize notes, generate content, extract tasks, and answer questions using OpenAI
- **Flexible Transport**: Supports both stdio (local) and HTTP/SSE (remote) connections
- **Rich Search**: Search by content, tags, paths with intelligent scoring
- **Metadata Support**: Handle YAML frontmatter and inline tags
- **Bulk Operations**: Process multiple notes efficiently
- **Production Ready**: Comprehensive error handling, logging, and configuration

## Quick Start

### 1. Installation

```bash
# Clone or download the project
cd obsidian-mcp
npm install
npm run build
```

### 2. Configuration

Copy the environment template and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
OPENAI_API_KEY=your_openai_api_key_here
OBSIDIAN_VAULT_PATH=/path/to/your/obsidian/vault
```

### 3. Test the Server

```bash
# Test stdio mode
npm run dev

# Test HTTP mode (in another terminal)
node dist/http-server.js
```

### 4. MCP Client Integration

> **📋 Multi-Client Support**: This server works with **any MCP-compatible client**. See [MCP-COMPATIBILITY.md](MCP-COMPATIBILITY.md) for configuration examples for Claude Desktop, Cursor, VS Code, and more.

#### Windsurf Configuration

#### Option A: Local (stdio) Mode

Add to your Windsurf MCP configuration:

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

#### Option B: Remote (HTTP/SSE) Mode

1. Start the HTTP server:
```bash
npm start
```

2. Add to your Windsurf MCP configuration:
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

## Available Tools

### Vault Operations
- `list_notes` - List all notes in the vault
- `read_note` - Read a specific note
- `write_note` - Create or update a note
- `delete_note` - Delete a note
- `search_notes` - Search notes by content, tags, or path
- `vault_stats` - Get vault statistics

### AI-Powered Operations
- `summarize_note` - Generate AI summary of a note
- `summarize_notes` - Generate AI summary of multiple notes
- `generate_content` - Generate new content using AI
- `reformat_note` - Reformat a note using AI
- `extract_tasks` - Extract tasks and to-dos from notes
- `weekly_digest` - Generate a weekly digest of recent notes
- `answer_question` - Answer questions based on vault content
- `generate_tags` - Generate suggested tags for a note

## Example Usage in Windsurf

Once configured, you can use natural language commands in Windsurf:

```
"Summarize all notes tagged #project"
"Create a weekly digest of my recent notes"
"Extract all tasks from my meeting notes"
"Answer: What are the key themes in my research notes?"
"Generate a summary of notes containing 'machine learning'"
```

## Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | Your OpenAI API key |
| `OBSIDIAN_VAULT_PATH` | Yes | - | Absolute path to your Obsidian vault |
| `OPENAI_MODEL` | No | `gpt-4` | OpenAI model to use |
| `OPENAI_MAX_TOKENS` | No | `2000` | Maximum tokens per request |
| `OPENAI_TEMPERATURE` | No | `0.7` | Temperature for AI responses |
| `MCP_SERVER_NAME` | No | `obsidian-mcp-server` | Server name |
| `MCP_SERVER_VERSION` | No | `1.0.0` | Server version |
| `DEBUG` | No | `false` | Enable debug logging |
| `SERVER_HOST` | No | `localhost` | HTTP server host |
| `SERVER_PORT` | No | `3000` | HTTP server port |

### Windsurf MCP Configuration

The server supports both local and remote configurations. See the `config/` directory for complete examples:

- `windsurf-mcp-config.json` - Local stdio configuration
- `windsurf-mcp-config-remote.json` - Remote HTTP/SSE configuration

## Related Projects

- **[Obsidian MCP Plugin](https://github.com/sethdavis512/obsidian-mcp-plugin)** - Direct Obsidian plugin for enhanced integration with plugin API access
- **[Obsidian MCP Server](https://github.com/sethdavis512/obsidian-mcp-server)** - This repository - Universal MCP server for file-based vault access

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MCP Client    │    │   MCP Server    │    │  Obsidian Vault │
│ (Windsurf/Claude│◄──►│                 │◄──►│   (Markdown)    │
│  /Cursor/etc.)  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │   (GPT-4/3.5)   │
                       └─────────────────┘
```

### Core Components

- **ObsidianVault**: File system operations and note management
- **OpenAIClient**: AI-powered content processing
- **ObsidianMCPServer**: MCP protocol implementation
- **ObsidianHTTPServer**: HTTP/SSE transport layer

## Development

### Project Structure

```
obsidian-mcp/
├── src/
│   ├── index.ts           # Main entry point (stdio)
│   ├── http-server.ts     # HTTP server entry point
│   ├── mcp-server.ts      # MCP server implementation
│   ├── vault.ts           # Obsidian vault operations
│   ├── openai-client.ts   # OpenAI integration
│   └── types.ts           # TypeScript definitions
├── config/
│   ├── windsurf-mcp-config.json        # Local config example
│   └── windsurf-mcp-config-remote.json # Remote config example
├── test/
│   └── test.js            # Test script
├── dist/                  # Compiled JavaScript
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Building

```bash
npm run build    # Compile TypeScript
npm run dev      # Run in development mode
npm start        # Run compiled version
npm test         # Run tests
```

### Testing

```bash
# Run the test script
npm test

# Manual testing with curl (HTTP mode)
curl http://localhost:3000/health
curl http://localhost:3000/info
```

## Security Considerations

- **API Keys**: Store OpenAI API keys securely, never commit to version control
- **Vault Access**: The server has full read/write access to your Obsidian vault
- **Network**: HTTP mode exposes the server on the network - use appropriate firewall rules
- **Environment**: Use environment variables for sensitive configuration

## Troubleshooting

### Common Issues

1. **"Vault path does not exist"**
   - Ensure `OBSIDIAN_VAULT_PATH` points to a valid directory
   - Use absolute paths only

2. **"OpenAI API key not found"**
   - Set `OPENAI_API_KEY` in your environment or `.env` file
   - Verify the API key is valid and has sufficient credits

3. **"Cannot connect to MCP server"**
   - Check that the server is running
   - Verify the configuration in Windsurf matches your setup
   - Check file permissions and paths

4. **"Module not found" errors**
   - Run `npm install` to install dependencies
   - Run `npm run build` to compile TypeScript

### Debug Mode

Enable debug logging:

```bash
DEBUG=true npm run dev
```

### Logs

- Stdio mode: Logs go to stderr
- HTTP mode: Logs go to console and can be redirected

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Check the troubleshooting section above
- Review the Windsurf MCP documentation
- Open an issue for bugs or feature requests

---

**Note**: This server provides full access to your Obsidian vault and uses OpenAI's API. Ensure you understand the security implications and costs before deploying in production environments.
