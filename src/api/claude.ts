import { Env, getConfig } from '../env';
import { ModelAPIInterface } from './model_api_interface';
import { Message } from './openai_api';

interface ClaudeResponse {
  content: Array<{
    text: string;
  }>;
}

export class ClaudeAPI implements ModelAPIInterface {
  private apiKey: string;
  private baseUrl: string;
  private models: string[];
  private defaultModel: string;

  constructor(env: Env) {
    const config = getConfig(env);
    this.apiKey = config.claudeApiKey;
    this.baseUrl = config.claudeEndpoint || 'https://api.anthropic.com/v1';
    this.models = config.claudeModels;
    this.defaultModel = this.models[0];
  }

  async generateResponse(messages: Message[], model?: string): Promise<string> {
    const useModel = model || this.defaultModel;
    const url = `${this.baseUrl}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: useModel,
        messages: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error: ${response.statusText}`, errorText);
      throw new Error(`Claude API error: ${response.statusText}\n${errorText}`);
    }

    const data: ClaudeResponse = await response.json();
    if (!data.content || data.content.length === 0) {
      throw new Error('No response generated from Claude API');
    }
    const generatedText = data.content[0].text.trim();
    return generatedText;
  }

  isValidModel(model: string): boolean {
    return this.models.includes(model);
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  getAvailableModels(): string[] {
    return this.models;
  }
}

export default ClaudeAPI;