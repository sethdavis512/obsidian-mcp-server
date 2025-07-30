import OpenAI from 'openai';
import { OpenAIConfig, ObsidianNote } from './types.js';

export class OpenAIClient {
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = {
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7,
      ...config
    };
    
    this.client = new OpenAI({
      apiKey: this.config.apiKey
    });
  }

  async summarizeNote(note: ObsidianNote): Promise<string> {
    const prompt = `Please provide a concise summary of the following note:

Title: ${note.name}
${note.frontmatter ? `Metadata: ${JSON.stringify(note.frontmatter, null, 2)}` : ''}
${note.tags?.length ? `Tags: ${note.tags.join(', ')}` : ''}

Content:
${note.content}

Summary:`;

    const response = await this.client.chat.completions.create({
      model: this.config.model!,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature
    });

    return response.choices[0]?.message?.content || 'Unable to generate summary';
  }

  async summarizeMultipleNotes(notes: ObsidianNote[], context?: string): Promise<string> {
    const noteSummaries = notes.map(note => 
      `**${note.name}** (${note.tags?.join(', ') || 'no tags'}): ${note.content.substring(0, 200)}...`
    ).join('\n\n');

    const prompt = `Please provide a comprehensive summary of the following notes${context ? ` in the context of: ${context}` : ''}:

${noteSummaries}

Please provide an organized summary that identifies key themes, important information, and connections between the notes:`;

    const response = await this.client.chat.completions.create({
      model: this.config.model!,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.maxTokens! * 2,
      temperature: this.config.temperature
    });

    return response.choices[0]?.message?.content || 'Unable to generate summary';
  }

  async generateContent(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context ? 
      `Context: ${context}\n\nRequest: ${prompt}` : 
      prompt;

    const response = await this.client.chat.completions.create({
      model: this.config.model!,
      messages: [{ role: 'user', content: fullPrompt }],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature
    });

    return response.choices[0]?.message?.content || 'Unable to generate content';
  }

  async reformatNote(note: ObsidianNote, instructions: string): Promise<string> {
    const prompt = `Please reformat the following note according to these instructions: ${instructions}

Original Note:
Title: ${note.name}
${note.frontmatter ? `Metadata: ${JSON.stringify(note.frontmatter, null, 2)}` : ''}

Content:
${note.content}

Reformatted content:`;

    const response = await this.client.chat.completions.create({
      model: this.config.model!,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature
    });

    return response.choices[0]?.message?.content || 'Unable to reformat content';
  }

  async extractTasks(notes: ObsidianNote[]): Promise<string> {
    const noteContents = notes.map(note => 
      `**${note.name}**:\n${note.content}`
    ).join('\n\n---\n\n');

    const prompt = `Please extract all tasks, to-dos, and action items from the following notes and organize them into a comprehensive task list:

${noteContents}

Please format the output as a markdown task list with priorities and due dates where mentioned:`;

    const response = await this.client.chat.completions.create({
      model: this.config.model!,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.maxTokens,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content || 'Unable to extract tasks';
  }

  async generateWeeklyDigest(notes: ObsidianNote[]): Promise<string> {
    const recentNotes = notes
      .filter(note => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return note.modified && note.modified > weekAgo;
      })
      .sort((a, b) => (b.modified?.getTime() || 0) - (a.modified?.getTime() || 0));

    const noteContents = recentNotes.slice(0, 20).map(note => 
      `**${note.name}** (${note.modified?.toLocaleDateString()}): ${note.content.substring(0, 300)}...`
    ).join('\n\n');

    const prompt = `Please create a weekly digest from the following recent notes. Identify key themes, important developments, and actionable insights:

${noteContents}

Weekly Digest:`;

    const response = await this.client.chat.completions.create({
      model: this.config.model!,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.maxTokens! * 2,
      temperature: 0.5
    });

    return response.choices[0]?.message?.content || 'Unable to generate weekly digest';
  }

  async answerQuestion(question: string, notes: ObsidianNote[]): Promise<string> {
    const relevantContent = notes.map(note => 
      `**${note.name}**: ${note.content}`
    ).join('\n\n---\n\n');

    const prompt = `Based on the following notes from my Obsidian vault, please answer this question: ${question}

Notes:
${relevantContent}

Answer:`;

    const response = await this.client.chat.completions.create({
      model: this.config.model!,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.maxTokens,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content || 'Unable to answer question';
  }

  async generateTags(note: ObsidianNote): Promise<string[]> {
    const prompt = `Based on the content and context of this note, suggest 3-5 relevant tags:

Title: ${note.name}
Content: ${note.content.substring(0, 1000)}

Please respond with only the tags, separated by commas, without the # symbol:`;

    const response = await this.client.chat.completions.create({
      model: this.config.model!,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content || '';
    return content.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }
}
