import { Env, getConfig } from '../env';
import { ModelAPIInterface } from './model_api_interface';
import { Message } from './openai_api';

interface ImageAnalysisResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class ImageAnalysisAPI implements ModelAPIInterface {
  private apiKey: string;
  private baseUrl: string;
  private models: string[];

  constructor(env: Env) {
    const config = getConfig(env);
    this.apiKey = config.openaiApiKey;
    this.baseUrl = config.openaiBaseUrl;
    this.models = config.openaiModels;
  }

  async analyzeImage(imageUrl: string, prompt: string, model: string): Promise<string> {
    if (!this.isValidModel(model)) {
      throw new Error(`Invalid model for image analysis: ${model}`);
    }

    const url = `${this.baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      throw new Error(`Image analysis API error: ${response.statusText}`);
    }

    const data: ImageAnalysisResponse = await response.json();
    return data.choices[0].message.content.trim();
  }

  async generateResponse(messages: Message[], model?: string): Promise<string> {
    throw new Error('Method not implemented for image analysis.');
  }

  isValidModel(model: string): boolean {
    return this.models.includes(model);
  }

  getDefaultModel(): string {
    return this.models[0];
  }

  getAvailableModels(): string[] {
    return this.models;
  }
}

export default ImageAnalysisAPI;