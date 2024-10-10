import { Env, getConfig } from '../env';
import { ModelAPIInterface, Message } from './model_api_interface';

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenAIAPI implements ModelAPIInterface {
  private apiKey: string;
  private baseUrl: string;
  private models: string[];
  private defaultModel: string;

  constructor(env: Env) {
    const config = getConfig(env);
    this.apiKey = config.openaiApiKey;
    this.baseUrl = config.openaiBaseUrl;
    this.models = config.openaiModels;
    this.defaultModel = config.defaultModel || this.models[0];
  }

  async generateResponse(messages: Message[], model?: string): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: model || this.defaultModel,
        messages: messages.map(msg => ({
          role: msg.role,
          content: Array.isArray(msg.content) ? msg.content : [{ type: 'text', text: msg.content }]
        })),
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as { error: { message: string } };
      throw new Error(`OpenAI API error: ${errorData.error.message}`);
    }

    const data: ChatCompletionResponse = await response.json();
    return data.choices[0].message.content.trim();
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

export default OpenAIAPI;