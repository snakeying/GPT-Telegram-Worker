import { Env, getConfig } from '../env';
import { ModelAPIInterface } from './model_api_interface';
import { Message } from './openai_api';

interface GeminiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export default class GeminiAPI implements ModelAPIInterface {
  private apiKey: string;
  private baseUrl: string;
  private models: string[];
  private defaultModel: string;

  constructor(env: Env) {
    const config = getConfig(env);
    this.apiKey = config.googleModelKey;
    this.baseUrl = config.googleModelBaseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    this.models = config.googleModels;
    this.defaultModel = this.models[0];
  }

  async generateResponse(messages: Message[], model?: string): Promise<string> {
    const useModel = model || this.defaultModel;
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: useModel,
        messages: messages,
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.statusText}`, errorText);
      throw new Error(`Gemini API error: ${response.statusText}\n${errorText}`);
    }

    const data = await response.json() as GeminiResponse;
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Gemini API did not return any choices');
    }

    let content = data.choices[0].message.content;
    
    content = content.replace(/```\s*(\w*)\s*\n([\s\S]+?)```/g, (_, lang, code) => {
      const trimmedCode = code.trim()
        .replace(/^\n+|\n+$/g, '')
        .replace(/\n{3,}/g, '\n\n');
      return `\n\`\`\`${lang || ''}\n${trimmedCode}\n\`\`\`\n`;
    });

    return content;
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
