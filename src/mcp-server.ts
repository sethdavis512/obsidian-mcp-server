import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { ObsidianVault } from './vault.js';
import { OpenAIClient } from './openai-client.js';
import { ServerConfig, SearchOptions } from './types.js';

export class ObsidianMCPServer {
  private server: Server;
  private vault: ObsidianVault;
  private openai: OpenAIClient;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.vault = new ObsidianVault(config.vaultPath);
    this.openai = new OpenAIClient(config.openai);
    
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

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_notes',
            description: 'List all notes in the Obsidian vault',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of notes to return'
                }
              }
            }
          },
          {
            name: 'read_note',
            description: 'Read a specific note by path',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Relative path to the note (e.g., "folder/note.md")'
                }
              },
              required: ['path']
            }
          },
          {
            name: 'write_note',
            description: 'Create or update a note',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Relative path for the note'
                },
                content: {
                  type: 'string',
                  description: 'Content of the note'
                },
                frontmatter: {
                  type: 'object',
                  description: 'YAML frontmatter metadata'
                }
              },
              required: ['path', 'content']
            }
          },
          {
            name: 'delete_note',
            description: 'Delete a note',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Relative path to the note to delete'
                }
              },
              required: ['path']
            }
          },
          {
            name: 'search_notes',
            description: 'Search notes by content, tags, or path',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by tags'
                },
                path: {
                  type: 'string',
                  description: 'Filter by path pattern'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results'
                },
                includeContent: {
                  type: 'boolean',
                  description: 'Include full content in results'
                }
              }
            }
          },
          {
            name: 'vault_stats',
            description: 'Get statistics about the vault',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'summarize_note',
            description: 'Generate an AI summary of a specific note',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the note to summarize'
                }
              },
              required: ['path']
            }
          },
          {
            name: 'summarize_notes',
            description: 'Generate an AI summary of multiple notes',
            inputSchema: {
              type: 'object',
              properties: {
                paths: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Paths to notes to summarize'
                },
                query: {
                  type: 'string',
                  description: 'Search query to find notes'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by tags'
                },
                context: {
                  type: 'string',
                  description: 'Additional context for the summary'
                }
              }
            }
          },
          {
            name: 'generate_content',
            description: 'Generate content using AI',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Content generation prompt'
                },
                context: {
                  type: 'string',
                  description: 'Additional context'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'reformat_note',
            description: 'Reformat a note using AI',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the note to reformat'
                },
                instructions: {
                  type: 'string',
                  description: 'Reformatting instructions'
                }
              },
              required: ['path', 'instructions']
            }
          },
          {
            name: 'extract_tasks',
            description: 'Extract tasks and to-dos from notes',
            inputSchema: {
              type: 'object',
              properties: {
                paths: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Specific note paths'
                },
                query: {
                  type: 'string',
                  description: 'Search query to find notes'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by tags'
                }
              }
            }
          },
          {
            name: 'weekly_digest',
            description: 'Generate a weekly digest of recent notes',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'answer_question',
            description: 'Answer a question based on vault content',
            inputSchema: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description: 'Question to answer'
                },
                query: {
                  type: 'string',
                  description: 'Search query to find relevant notes'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by tags'
                }
              },
              required: ['question']
            }
          },
          {
            name: 'generate_tags',
            description: 'Generate suggested tags for a note using AI',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the note'
                }
              },
              required: ['path']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_notes':
            return await this.handleListNotes(args);
          case 'read_note':
            return await this.handleReadNote(args);
          case 'write_note':
            return await this.handleWriteNote(args);
          case 'delete_note':
            return await this.handleDeleteNote(args);
          case 'search_notes':
            return await this.handleSearchNotes(args);
          case 'vault_stats':
            return await this.handleVaultStats(args);
          case 'summarize_note':
            return await this.handleSummarizeNote(args);
          case 'summarize_notes':
            return await this.handleSummarizeNotes(args);
          case 'generate_content':
            return await this.handleGenerateContent(args);
          case 'reformat_note':
            return await this.handleReformatNote(args);
          case 'extract_tasks':
            return await this.handleExtractTasks(args);
          case 'weekly_digest':
            return await this.handleWeeklyDigest(args);
          case 'answer_question':
            return await this.handleAnswerQuestion(args);
          case 'generate_tags':
            return await this.handleGenerateTags(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${message}`);
      }
    });
  }

  private async handleListNotes(args: any) {
    const notes = await this.vault.getAllNotes();
    const limit = args.limit || notes.length;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(notes.slice(0, limit).map(note => ({
            path: note.path,
            name: note.name,
            tags: note.tags,
            modified: note.modified
          })), null, 2)
        }
      ]
    };
  }

  private async handleReadNote(args: any) {
    const note = await this.vault.readNote(args.path);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(note, null, 2)
        }
      ]
    };
  }

  private async handleWriteNote(args: any) {
    const note = await this.vault.writeNote(args.path, args.content, args.frontmatter);
    
    return {
      content: [
        {
          type: 'text',
          text: `Note created/updated: ${note.path}`
        }
      ]
    };
  }

  private async handleDeleteNote(args: any) {
    await this.vault.deleteNote(args.path);
    
    return {
      content: [
        {
          type: 'text',
          text: `Note deleted: ${args.path}`
        }
      ]
    };
  }

  private async handleSearchNotes(args: any) {
    const searchOptions: SearchOptions = {
      query: args.query || '',
      tags: args.tags,
      path: args.path,
      limit: args.limit,
      includeContent: args.includeContent !== false
    };
    
    const results = await this.vault.searchNotes(searchOptions);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  private async handleVaultStats(args: any) {
    const stats = await this.vault.getVaultStats();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2)
        }
      ]
    };
  }

  private async handleSummarizeNote(args: any) {
    const note = await this.vault.readNote(args.path);
    const summary = await this.openai.summarizeNote(note);
    
    return {
      content: [
        {
          type: 'text',
          text: summary
        }
      ]
    };
  }

  private async handleSummarizeNotes(args: any) {
    let notes;
    
    if (args.paths) {
      notes = await Promise.all(args.paths.map((path: string) => this.vault.readNote(path)));
    } else {
      const searchOptions: SearchOptions = {
        query: args.query || '',
        tags: args.tags,
        includeContent: true
      };
      const results = await this.vault.searchNotes(searchOptions);
      notes = results.map(r => r.note);
    }
    
    const summary = await this.openai.summarizeMultipleNotes(notes, args.context);
    
    return {
      content: [
        {
          type: 'text',
          text: summary
        }
      ]
    };
  }

  private async handleGenerateContent(args: any) {
    const content = await this.openai.generateContent(args.prompt, args.context);
    
    return {
      content: [
        {
          type: 'text',
          text: content
        }
      ]
    };
  }

  private async handleReformatNote(args: any) {
    const note = await this.vault.readNote(args.path);
    const reformatted = await this.openai.reformatNote(note, args.instructions);
    
    return {
      content: [
        {
          type: 'text',
          text: reformatted
        }
      ]
    };
  }

  private async handleExtractTasks(args: any) {
    let notes;
    
    if (args.paths) {
      notes = await Promise.all(args.paths.map((path: string) => this.vault.readNote(path)));
    } else {
      const searchOptions: SearchOptions = {
        query: args.query || '',
        tags: args.tags,
        includeContent: true
      };
      const results = await this.vault.searchNotes(searchOptions);
      notes = results.map(r => r.note);
    }
    
    const tasks = await this.openai.extractTasks(notes);
    
    return {
      content: [
        {
          type: 'text',
          text: tasks
        }
      ]
    };
  }

  private async handleWeeklyDigest(args: any) {
    const notes = await this.vault.getAllNotes();
    const digest = await this.openai.generateWeeklyDigest(notes);
    
    return {
      content: [
        {
          type: 'text',
          text: digest
        }
      ]
    };
  }

  private async handleAnswerQuestion(args: any) {
    let notes;
    
    if (args.query || args.tags) {
      const searchOptions: SearchOptions = {
        query: args.query || '',
        tags: args.tags,
        includeContent: true,
        limit: 10
      };
      const results = await this.vault.searchNotes(searchOptions);
      notes = results.map(r => r.note);
    } else {
      // Use all notes if no search criteria provided
      notes = await this.vault.getAllNotes();
    }
    
    const answer = await this.openai.answerQuestion(args.question, notes);
    
    return {
      content: [
        {
          type: 'text',
          text: answer
        }
      ]
    };
  }

  private async handleGenerateTags(args: any) {
    const note = await this.vault.readNote(args.path);
    const tags = await this.openai.generateTags(note);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tags, null, 2)
        }
      ]
    };
  }

  async start(): Promise<void> {
    await this.vault.initialize();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    if (this.config.debug) {
      console.error('Obsidian MCP Server started successfully');
    }
  }
}
