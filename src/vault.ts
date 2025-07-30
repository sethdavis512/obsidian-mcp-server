import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { ObsidianNote, VaultStats, SearchOptions, SearchResult, NoteOperation, BulkOperationResult } from './types.js';

export class ObsidianVault {
  private vaultPath: string;

  constructor(vaultPath: string) {
    this.vaultPath = path.resolve(vaultPath);
  }

  async initialize(): Promise<void> {
    if (!await fs.pathExists(this.vaultPath)) {
      throw new Error(`Vault path does not exist: ${this.vaultPath}`);
    }
    
    const stats = await fs.stat(this.vaultPath);
    if (!stats.isDirectory()) {
      throw new Error(`Vault path is not a directory: ${this.vaultPath}`);
    }
  }

  async getAllNotes(): Promise<ObsidianNote[]> {
    const pattern = path.join(this.vaultPath, '**/*.md');
    const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/.git/**'] });
    
    const notes: ObsidianNote[] = [];
    for (const filePath of files) {
      try {
        const note = await this.readNote(path.relative(this.vaultPath, filePath));
        notes.push(note);
      } catch (error) {
        console.warn(`Failed to read note ${filePath}:`, error);
      }
    }
    
    return notes;
  }

  async readNote(relativePath: string): Promise<ObsidianNote> {
    const fullPath = path.join(this.vaultPath, relativePath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error(`Note not found: ${relativePath}`);
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    const parsed = matter(content);
    const stats = await fs.stat(fullPath);

    return {
      path: relativePath,
      name: path.basename(relativePath, '.md'),
      content: parsed.content,
      frontmatter: parsed.data,
      tags: this.extractTags(parsed.content, parsed.data),
      created: stats.birthtime,
      modified: stats.mtime
    };
  }

  async writeNote(relativePath: string, content: string, frontmatter?: Record<string, any>): Promise<ObsidianNote> {
    const fullPath = path.join(this.vaultPath, relativePath);
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(fullPath));

    let fileContent = content;
    if (frontmatter && Object.keys(frontmatter).length > 0) {
      fileContent = matter.stringify(content, frontmatter);
    }

    await fs.writeFile(fullPath, fileContent, 'utf-8');
    return this.readNote(relativePath);
  }

  async updateNote(relativePath: string, content?: string, frontmatter?: Record<string, any>): Promise<ObsidianNote> {
    const existingNote = await this.readNote(relativePath);
    
    const newContent = content !== undefined ? content : existingNote.content;
    const newFrontmatter = frontmatter !== undefined ? 
      { ...existingNote.frontmatter, ...frontmatter } : 
      existingNote.frontmatter;

    return this.writeNote(relativePath, newContent, newFrontmatter);
  }

  async deleteNote(relativePath: string): Promise<void> {
    const fullPath = path.join(this.vaultPath, relativePath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error(`Note not found: ${relativePath}`);
    }

    await fs.remove(fullPath);
  }

  async searchNotes(options: SearchOptions): Promise<SearchResult[]> {
    const notes = await this.getAllNotes();
    const results: SearchResult[] = [];

    for (const note of notes) {
      let score = 0;
      const matches: string[] = [];

      // Search in content
      if (options.query) {
        const contentMatches = this.findMatches(note.content, options.query);
        score += contentMatches.length * 2;
        matches.push(...contentMatches);

        // Search in title
        const titleMatches = this.findMatches(note.name, options.query);
        score += titleMatches.length * 3;
        matches.push(...titleMatches);
      }

      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        const hasMatchingTags = options.tags.some(tag => 
          note.tags?.includes(tag)
        );
        if (hasMatchingTags) {
          score += 5;
        } else if (options.query) {
          // If tags are specified but don't match, reduce score
          score *= 0.5;
        }
      }

      // Filter by path
      if (options.path && !note.path.includes(options.path)) {
        score *= 0.3;
      }

      if (score > 0) {
        results.push({
          note: options.includeContent ? note : { ...note, content: '' },
          score,
          matches
        });
      }
    }

    // Sort by score and apply limit
    results.sort((a, b) => b.score - a.score);
    
    if (options.limit) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  async getVaultStats(): Promise<VaultStats> {
    const notes = await this.getAllNotes();
    let totalSize = 0;
    let lastModified = new Date(0);

    for (const note of notes) {
      totalSize += note.content.length;
      if (note.modified && note.modified > lastModified) {
        lastModified = note.modified;
      }
    }

    return {
      totalNotes: notes.length,
      totalSize,
      lastModified
    };
  }

  async bulkOperation(operations: NoteOperation[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      errors: []
    };

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'create':
          case 'update':
            await this.writeNote(operation.path, operation.content || '', operation.frontmatter);
            break;
          case 'delete':
            await this.deleteNote(operation.path);
            break;
          case 'read':
            await this.readNote(operation.path);
            break;
        }
        result.processed++;
      } catch (error) {
        result.success = false;
        result.errors.push({
          path: operation.path,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return result;
  }

  private extractTags(content: string, frontmatter: Record<string, any>): string[] {
    const tags = new Set<string>();

    // Extract from frontmatter
    if (frontmatter.tags) {
      const fmTags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags];
      fmTags.forEach(tag => tags.add(String(tag)));
    }

    // Extract inline tags (#tag)
    const inlineTags = content.match(/#[\w-]+/g) || [];
    inlineTags.forEach(tag => tags.add(tag.substring(1)));

    return Array.from(tags);
  }

  private findMatches(text: string, query: string): string[] {
    const matches: string[] = [];
    const words = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();

    for (const word of words) {
      if (textLower.includes(word)) {
        matches.push(word);
      }
    }

    return matches;
  }
}
