import { Env, getConfig } from '../env';
import { ModelAPIInterface } from './model_api_interface';
import { Message } from './openai_api';

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqAPI implements ModelAPIInterface {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  private models: string[];
  private defaultModel: string;

  constructor(env: Env) {
    const config = getConfig(env);
    this.apiKey = config.groqApiKey;
    this.models = config.groqModels;
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error: ${response.statusText}`, errorText);
      throw new Error(`Groq API error: ${response.statusText}\n${errorText}`);
    }

    const data: GroqResponse = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated from Groq API');
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
export default GroqAPI;
