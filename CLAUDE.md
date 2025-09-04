# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run build` - Compile TypeScript to JavaScript in dist/
- `npm run dev` - Run the MCP server in development mode (stdio transport)
- `npm run dev:http` - Run the HTTP server in development mode
- `npm start` - Run the compiled MCP server (stdio transport)
- `npm run start:http` - Run the compiled HTTP server
- `npm test` - Run the comprehensive test suite

### Testing
- The test script validates build files, dependencies, configuration, and server startup
- Tests both stdio and HTTP transport modes
- Checks for proper environment variable configuration

## Architecture Overview

### Core Components
- **ObsidianMCPServer** (`src/mcp-server.ts`): Main MCP protocol implementation with 14 tools for vault and AI operations
- **ObsidianHTTPServer** (`src/http-server.ts`): HTTP/SSE transport wrapper for remote MCP access
- **ObsidianVault** (`src/vault.ts`): File system operations, note CRUD, search functionality
- **OpenAIClient** (`src/openai-client.ts`): AI-powered content processing and generation

### Transport Modes
1. **Stdio Transport** (`src/index.ts`): Local MCP client communication via stdin/stdout
2. **HTTP/SSE Transport** (`src/http-index.ts`): Remote MCP client communication via Server-Sent Events

### Key Features
The server provides 14 MCP tools divided into two categories:

**Vault Operations:**
- `list_notes`, `read_note`, `write_note`, `delete_note`, `search_notes`, `vault_stats`

**AI-Powered Operations:** 
- `summarize_note`, `summarize_notes`, `generate_content`, `reformat_note`, `extract_tasks`, `weekly_digest`, `answer_question`, `generate_tags`

### Configuration
- Environment variables defined in `.env` (copy from `.env.example`)
- Required: `OPENAI_API_KEY`, `OBSIDIAN_VAULT_PATH`
- Optional: Model settings, debug flags, server host/port
- MCP client configurations in `config/` directory for Windsurf integration

### TypeScript Configuration
- ES2022 target with ESNext modules
- Strict type checking enabled
- Source maps and declarations generated
- ES module interop for compatibility with MCP SDK

### Dependencies
- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **openai**: AI content processing
- **fs-extra**: Enhanced file system operations
- **gray-matter**: YAML frontmatter parsing
- **glob**: File pattern matching
- **express**: HTTP server framework (for HTTP transport mode)

### Error Handling
- Comprehensive error handling with McpError types
- Graceful shutdown handlers for SIGINT/SIGTERM
- Validation for vault path existence and environment variables
- Debug logging available via DEBUG environment variable

### File Structure
- `src/`: TypeScript source files
- `dist/`: Compiled JavaScript output
- `config/`: MCP client configuration examples
- `test/`: Test suite and validation scripts

Note: This is a production-ready MCP server designed for integration with any MCP-compatible client (Windsurf, Claude Desktop, Cursor, VS Code, etc.).