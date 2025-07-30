export interface ObsidianNote {
  path: string;
  name: string;
  content: string;
  frontmatter?: Record<string, any>;
  tags?: string[];
  created?: Date;
  modified?: Date;
}

export interface VaultStats {
  totalNotes: number;
  totalSize: number;
  lastModified: Date;
}

export interface SearchOptions {
  query: string;
  tags?: string[];
  path?: string;
  limit?: number;
  includeContent?: boolean;
}

export interface SearchResult {
  note: ObsidianNote;
  score: number;
  matches: string[];
}

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ServerConfig {
  vaultPath: string;
  openai: OpenAIConfig;
  serverName: string;
  serverVersion: string;
  debug?: boolean;
}

export interface NoteOperation {
  type: 'create' | 'update' | 'delete' | 'read';
  path: string;
  content?: string;
  frontmatter?: Record<string, any>;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  errors: Array<{
    path: string;
    error: string;
  }>;
}
