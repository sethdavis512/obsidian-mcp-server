#!/usr/bin/env node

import dotenv from 'dotenv';
import { ObsidianHTTPServer } from './http-server.js';
import { ServerConfig } from './types.js';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['OPENAI_API_KEY', 'OBSIDIAN_VAULT_PATH'];
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      console.error('Missing required environment variables:', missing.join(', '));
      console.error('Please check your .env file or environment configuration.');
      process.exit(1);
    }

    // Build server configuration
    const config: ServerConfig = {
      vaultPath: process.env.OBSIDIAN_VAULT_PATH!,
      openai: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: process.env.OPENAI_MODEL || 'gpt-4',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
      },
      serverName: process.env.MCP_SERVER_NAME || 'obsidian-mcp-server',
      serverVersion: process.env.MCP_SERVER_VERSION || '1.0.0',
      debug: process.env.DEBUG === 'true'
    };

    // Create and start the HTTP server
    const server = new ObsidianHTTPServer(config);
    const host = process.env.SERVER_HOST || 'localhost';
    const port = parseInt(process.env.SERVER_PORT || '3000');
    
    await server.start(port, host);

  } catch (error) {
    console.error('Failed to start Obsidian HTTP Server:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
