import { Env, getConfig } from '../env';
import { ModelAPIInterface, Message } from './model_api_interface';

interface ImageGenerationResponse {
  data: Array<{ url: string }>;
}

export class ImageGenerationAPI implements ModelAPIInterface {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(env: Env) {
    const config = getConfig(env);
    this.apiKey = config.openaiApiKey;
    this.baseUrl = config.openaiBaseUrl;
    this.model = config.dallEModel;
  }

  async generateImage(prompt: string, size: string): Promise<string> {
    const url = `${this.baseUrl}/images/generations`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        n: 1,
        size: size,
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation API error: ${response.statusText}`);
    }

    const data: ImageGenerationResponse = await response.json();
    return data.data[0].url;
  }

  async generateResponse(messages: Message[], model?: string): Promise<string> {
    throw new Error('Method not implemented for image generation.');
  }

  isValidModel(model: string): boolean {
    return model === this.model;
  }

  getDefaultModel(): string {
    return this.model;
  }

  getAvailableModels(): string[] {
    return [this.model];
  }

  getValidSizes(): string[] {
    return ['1024x1024', '1024x1792', '1792x1024'];
  }
}

export default ImageGenerationAPI;