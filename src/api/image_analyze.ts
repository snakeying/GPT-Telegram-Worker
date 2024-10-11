import { Env, getConfig } from '../env';
import { ModelAPIInterface } from './model_api_interface';
import { Message } from './openai_api';

interface OpenAIImageAnalysisResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface GeminiImageAnalysisResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

type ImageAnalysisResponse = OpenAIImageAnalysisResponse | GeminiImageAnalysisResponse;

export class ImageAnalysisAPI implements ModelAPIInterface {
  private openaiApiKey: string;
  private openaiBaseUrl: string;
  private openaiModels: string[];
  private googleApiKey: string;
  private googleBaseUrl: string;
  private googleModels: string[];

  constructor(env: Env) {
    const config = getConfig(env);
    this.openaiApiKey = config.openaiApiKey;
    this.openaiBaseUrl = config.openaiBaseUrl;
    this.openaiModels = config.openaiModels;
    this.googleApiKey = config.googleModelKey;
    this.googleBaseUrl = config.googleModelBaseUrl;
    this.googleModels = config.googleModels;
  }

  async analyzeImage(imageUrl: string, prompt: string, model: string): Promise<string> {
    if (this.openaiModels.includes(model)) {
      return this.analyzeImageWithOpenAI(imageUrl, prompt, model);
    } else if (this.googleModels.includes(model)) {
      return this.analyzeImageWithGemini(imageUrl, prompt, model);
    } else {
      throw new Error(`Invalid model for image analysis: ${model}`);
    }
  }

  private async analyzeImageWithOpenAI(imageUrl: string, prompt: string, model: string): Promise<string> {
    const url = `${this.openaiBaseUrl}/chat/completions`;
    console.log(`Analyzing image with OpenAI. Model: ${model}, URL: ${imageUrl}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
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
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.statusText}`, errorText);
      throw new Error(`OpenAI image analysis API error: ${response.statusText}\n${errorText}`);
    }

    const data = await response.json() as OpenAIImageAnalysisResponse;
    console.log('OpenAI API response:', JSON.stringify(data, null, 2));

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated from OpenAI API');
    }

    const content = data.choices[0].message?.content;
    if (!content) {
      throw new Error('No content in OpenAI API response');
    }

    return content.trim();
  }

  private async analyzeImageWithGemini(imageUrl: string, prompt: string, model: string): Promise<string> {
    const url = `${this.googleBaseUrl}/models/${model}:generateContent?key=${this.googleApiKey}`;
    console.log(`Analyzing image with Gemini. Model: ${model}, URL: ${imageUrl}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: await this.getBase64Image(imageUrl) } }
          ]
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.statusText}`, errorText);
      throw new Error(`Gemini image analysis API error: ${response.statusText}\n${errorText}`);
    }

    const data = await response.json() as GeminiImageAnalysisResponse;
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    if (!content) {
      throw new Error('No content in Gemini API response');
    }

    return content.trim();
  }

  private async getBase64Image(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64;
  }

  async generateResponse(messages: Message[], model?: string): Promise<string> {
    throw new Error('Method not implemented for image analysis.');
  }

  isValidModel(model: string): boolean {
    return this.openaiModels.includes(model) || this.googleModels.includes(model);
  }

  getDefaultModel(): string {
    return this.openaiModels[0] || this.googleModels[0];
  }

  getAvailableModels(): string[] {
    return [...this.openaiModels, ...this.googleModels];
  }
}

export default ImageAnalysisAPI;