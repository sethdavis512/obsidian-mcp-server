# Obsidian MCP Server Setup Guide

This guide will walk you through setting up the Obsidian MCP Server for use with Windsurf and other MCP clients.

> **🔌 Enhanced Integration**: For direct Obsidian plugin API access, consider also installing the companion [Obsidian MCP Plugin](https://github.com/sethdavis512/obsidian-mcp-plugin).

## Prerequisites

- Node.js 18+ installed
- An OpenAI API key
- An Obsidian vault (directory with .md files)
- Windsurf IDE

## Step 1: Install Dependencies

```bash
cd obsidian-mcp
npm install
npm run build
```

## Step 2: Configure Environment

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your settings:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OBSIDIAN_VAULT_PATH=/Users/yourusername/Documents/ObsidianVault
DEBUG=true
```

**Important**: Use the absolute path to your Obsidian vault directory.

## Step 3: Test the Server

Run the test suite to verify everything is working:

```bash
npm test
```

You should see output like:
```
🧪 Obsidian MCP Server Test Suite
==================================

1. Checking build files...
✅ Build files found

2. Checking environment configuration...
✅ .env file found

3. Testing MCP server startup (stdio mode)...
✅ Server started successfully

...

✅ All tests passed! The MCP server is ready to use.
```

## Step 4: Configure Windsurf

### Option A: Local (stdio) Mode (Recommended)

1. Open Windsurf settings
2. Navigate to MCP Servers configuration
3. Add the following configuration:

```json
{
  "mcpServers": {
    "obsidian-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/obsidian-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-your-actual-openai-api-key-here",
        "OBSIDIAN_VAULT_PATH": "/Users/yourusername/Documents/ObsidianVault"
      }
    }
  }
}
```

**Replace the paths with your actual paths!**

### Option B: Remote (HTTP/SSE) Mode

1. Start the HTTP server:
```bash
npm run start:http
```

2. Add this configuration to Windsurf:
```json
{
  "mcpServers": {
    "obsidian-mcp-server-remote": {
      "url": "http://localhost:3000/sse"
    }
  }
}
```

## Step 5: Verify Integration

1. Restart Windsurf after adding the MCP configuration
2. Open the Cascade panel
3. You should see the Obsidian MCP server listed as available
4. Try a command like: "List all my notes"

## Example Commands

Once configured, you can use these natural language commands in Windsurf:

- "List all notes in my vault"
- "Read the note called 'Project Ideas'"
- "Search for notes containing 'machine learning'"
- "Summarize all notes tagged #meeting"
- "Create a weekly digest of my recent notes"
- "Extract all tasks from my notes"
- "Answer: What are the main themes in my research notes?"

## Troubleshooting

### Server Won't Start

1. **Check paths**: Ensure all paths in your configuration are absolute and correct
2. **Check API key**: Verify your OpenAI API key is valid and has credits
3. **Check permissions**: Ensure the server has read/write access to your vault
4. **Check logs**: Run with `DEBUG=true` to see detailed logs

### Windsurf Can't Connect

1. **Restart Windsurf** after changing MCP configuration
2. **Check configuration syntax**: Ensure your JSON is valid
3. **Check server status**: For HTTP mode, visit `http://localhost:3000/health`
4. **Check firewall**: Ensure port 3000 is accessible (HTTP mode only)

### Common Error Messages

- **"Vault path does not exist"**: Check your `OBSIDIAN_VAULT_PATH` setting
- **"OpenAI API key not found"**: Set your `OPENAI_API_KEY` environment variable
- **"Module not found"**: Run `npm install` and `npm run build`

## Security Notes

- Your OpenAI API key should be kept secure and never committed to version control
- The server has full read/write access to your Obsidian vault
- In HTTP mode, the server is accessible on your local network

## Advanced Configuration

### Custom OpenAI Settings

Add these to your `.env` file:

```env
OPENAI_MODEL=gpt-3.5-turbo  # Use GPT-3.5 instead of GPT-4
OPENAI_MAX_TOKENS=1500      # Limit response length
OPENAI_TEMPERATURE=0.3      # More focused responses
```

### HTTP Server Settings

```env
SERVER_HOST=0.0.0.0    # Listen on all interfaces
SERVER_PORT=8080       # Use different port
```

## Getting Help

1. Check the main README.md for detailed documentation
2. Run `npm test` to diagnose issues
3. Enable debug mode with `DEBUG=true`
4. Check the Windsurf MCP documentation

## Next Steps

Once everything is working:

1. Explore the available tools and commands
2. Create custom workflows using the AI-powered features
3. Consider setting up automated backups of your vault
4. Experiment with different OpenAI models and settings
