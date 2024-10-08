import { Env, getConfig } from '../env';
import { ModelAPIInterface } from './model_api_interface';

interface FluxResponse {
  result: {
    image: string; // base64 encoded image data
  };
  success: boolean;
  errors: string[];
}

export class FluxAPI implements ModelAPIInterface {
  private apiToken: string;
  private accountId: string;
  private steps: number;
  private model: string = '@cf/black-forest-labs/flux-1-schnell';

  constructor(env: Env) {
    const config = getConfig(env);
    this.apiToken = config.cloudflareApiToken;
    this.accountId = config.cloudflareAccountId;
    this.steps = config.fluxSteps;
  }

  async generateImage(prompt: string, aspectRatio: string): Promise<Uint8Array> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`;
    console.log(`Sending request to Flux API: ${url}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Steps: ${this.steps}`);
    console.log(`Aspect Ratio: ${aspectRatio}`);

    const [width, height] = this.getImageDimensions(aspectRatio);

    // Add a random seed to ensure different images for the same prompt
    const seed = Math.floor(Math.random() * 1000000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        num_steps: this.steps,
        seed: seed,
        width: width,
        height: height,
      }),
    });

    console.log(`Flux API response status: ${response.status}`);
    const responseText = await response.text();
    console.log(`Flux API response body: ${responseText.substring(0, 100)}...`); // Log only the first 100 characters

    let data: FluxResponse;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error('Error parsing Flux API response:', error);
      throw new Error('Invalid response from Flux API');
    }

    if (!response.ok || !data.success) {
      const errorMessage = data.errors ? data.errors.join(', ') : 'Unknown error';
      console.error(`Flux API error: ${errorMessage}`);
      throw new Error(`Flux API error: ${errorMessage}`);
    }

    if (!data.result || !data.result.image) {
      console.error('Flux API returned no image');
      throw new Error('Flux API returned no image');
    }

    console.log(`Generated image data received (length: ${data.result.image.length})`);
    
    // Convert base64 to Uint8Array
    const binaryString = atob(data.result.image);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private getImageDimensions(aspectRatio: string): [number, number] {
    switch (aspectRatio) {
      case '1:1': return [1024, 1024];
      case '1:2': return [512, 1024];
      case '3:2': return [768, 512];
      case '3:4': return [768, 1024];
      case '16:9': return [1024, 576];
      case '9:16': return [576, 1024];
      default: return [1024, 1024]; // Default to 1:1 if invalid ratio is provided
    }
  }

  async generateResponse(messages: { role: string; content: string; }[]): Promise<string> {
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

  getValidAspectRatios(): string[] {
    return ['1:1', '1:2', '3:2', '3:4', '16:9', '9:16'];
  }
}

export default FluxAPI;