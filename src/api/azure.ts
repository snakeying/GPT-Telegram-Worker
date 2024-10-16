import { Env, getConfig } from '../env';
import { ModelAPIInterface } from './model_api_interface';
import { Message } from './openai_api';

interface AzureChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

export class AzureAPI implements ModelAPIInterface {
  private apiKey: string;
  private baseUrl: string;
  private models: string[];
  private defaultModel: string;

  constructor(env: Env) {
    const config = getConfig(env);
    this.apiKey = config.azureApiKey;
    this.baseUrl = config.azureEndpoint;
    this.models = config.azureModels;
    this.defaultModel = this.models[0];
  }

  async generateResponse(messages: Message[], model?: string): Promise<string> {
    const useModel = model || this.defaultModel;
    const url = `${this.baseUrl}/openai/deployments/${useModel}/chat/completions?api-version=2024-02-01`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Azure API error: ${response.statusText}`, errorText);
      throw new Error(`Azure API error: ${response.statusText}\n${errorText}`);
    }

    const data: AzureChatCompletionResponse = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Azure API 未生成任何响应');
    }
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

export default AzureAPI;