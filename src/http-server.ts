import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import cors from 'cors';
import { ObsidianVault } from './vault.js';
import { OpenAIClient } from './openai-client.js';
import { ServerConfig } from './types.js';

export class ObsidianHTTPServer {
  private app: express.Application;
  private server: Server;
  private vault: ObsidianVault;
  private openai: OpenAIClient;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.vault = new ObsidianVault(config.vaultPath);
    this.openai = new OpenAIClient(config.openai);
    this.app = express();
    
    this.server = new Server(
      {
        name: config.serverName,
        version: config.serverVersion,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        server: this.config.serverName,
        version: this.config.serverVersion,
        timestamp: new Date().toISOString()
      });
    });

    // Basic info endpoint
    this.app.get('/info', async (req, res) => {
      try {
        const stats = await this.vault.getVaultStats();
        res.json({
          server: this.config.serverName,
          version: this.config.serverVersion,
          vaultPath: this.config.vaultPath,
          vaultStats: stats
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get vault info',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }

  private setupRoutes(): void {
    // SSE endpoint for MCP
    this.app.get('/sse', async (req, res) => {
      const transport = new SSEServerTransport('/sse', res);
      await this.server.connect(transport);
    });

    // Alternative: WebSocket endpoint (if needed)
    // this.app.ws('/ws', async (ws, req) => {
    //   const transport = new WebSocketServerTransport(ws);
    //   await this.server.connect(transport);
    // });
  }

  async start(port: number = 3000, host: string = 'localhost'): Promise<void> {
    await this.vault.initialize();
    
    return new Promise((resolve, reject) => {
      const httpServer = this.app.listen(port, host, () => {
        if (this.config.debug) {
          console.error(`Obsidian MCP HTTP Server started on http://${host}:${port}`);
          console.error(`SSE endpoint: http://${host}:${port}/sse`);
          console.error(`Health check: http://${host}:${port}/health`);
        }
        resolve();
      });

      httpServer.on('error', (error) => {
        reject(error);
      });

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        if (this.config.debug) {
          console.error('Received SIGINT, shutting down HTTP server...');
        }
        httpServer.close(() => {
          process.exit(0);
        });
      });

      process.on('SIGTERM', () => {
        if (this.config.debug) {
          console.error('Received SIGTERM, shutting down HTTP server...');
        }
        httpServer.close(() => {
          process.exit(0);
        });
      });
    });
  }
}
