import { Env, getConfig } from '../env';
import { ModelAPIInterface } from './model_api_interface';

interface FluxResponse {
  result: {
    image: string; // base64 encoded image data
  };
  success: boolean;
  errors: string[];
}

interface ExternalAPIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class FluxAPI implements ModelAPIInterface {
  private apiToken: string;
  private accountId: string;
  private steps: number;
  private model: string = '@cf/black-forest-labs/flux-1-schnell';
  private promptOptimization: boolean;
  private externalApiBase?: string;
  private externalModel?: string;
  private externalApiKey?: string;

  constructor(env: Env) {
    const config = getConfig(env);
    this.apiToken = config.cloudflareApiToken;
    this.accountId = config.cloudflareAccountId;
    this.steps = config.fluxSteps;
    this.promptOptimization = config.promptOptimization;
    this.externalApiBase = config.externalApiBase;
    this.externalModel = config.externalModel;
    this.externalApiKey = config.externalApiKey;
  }

  async generateImage(prompt: string, aspectRatio: string): Promise<{ imageData: Uint8Array; optimizedPrompt?: string }> {
    let optimizedPrompt: string | undefined;
    if (this.promptOptimization) {
      optimizedPrompt = await this.optimizePrompt(prompt, aspectRatio);
      prompt = optimizedPrompt;
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`;
    const [width, height] = this.getImageDimensions(aspectRatio);
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

    const responseText = await response.text();
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
      throw new Error('Flux API returned no image');
    }
    
    const binaryString = atob(data.result.image);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return { 
      imageData: bytes,
      optimizedPrompt
    };
  }

  private async optimizePrompt(prompt: string, aspectRatio: string): Promise<string> {
    if (!this.externalApiBase || !this.externalModel || !this.externalApiKey) {
      throw new Error('External API configuration is missing');
    }

    const systemPrompt = "You are a prompt generation bot based on the Flux.1 model. Based on the user's requirements, automatically generate drawing prompts that adhere to the Flux.1 format. While you can refer to the provided templates to learn the structure and patterns of the prompts, you must remain flexible to meet various different needs. The final output should be limited to the prompts only, without any additional explanations or information. You must reply to me entirely in English!\n\n### **Prompt Generation Logic**:\n\n1. **Requirement Analysis**: Extract key information from the user's description, including:\n- Characters: Appearance, actions, expressions, etc.\n- Scene: Environment, lighting, weather, etc.\n- Style: Art style, emotional atmosphere, color scheme, etc.\n- **Aspect Ratio**: If the user provides a specific aspect ratio (e.g., \"3:2\", \"16:9\"), extract this and integrate it into the final prompt.\n- Other elements: Specific objects, background, or effects.\n\n2. **Prompt Structure Guidelines**:\n- **Concise, precise, and detailed**: Prompts should describe the core subject simply and clearly, with enough detail to generate an image that matches the request.\n- **Flexible and varied**: Use the user's description to dynamically create prompts without following rigid templates. Ensure prompts are adapted based on the specific needs of each user, avoiding overly template-based outputs.\n- **Descriptions following Flux.1 style**: Prompts must follow the requirements of Flux.1, aiming to include descriptions of the art style, visual effects, and emotional atmosphere. Use keywords and description patterns that match the Flux.1 model's generation process. If a specific aspect ratio is mentioned, ensure it is included in the prompt description.\n\n3. **Key Points Summary for Flux.1 Prompts**:\n- **Concise and precise subject description**: Clearly identify the subject or scene of the image.\n- **Specific description of style and emotional atmosphere**: Ensure the prompt includes information about the art style, lighting, color scheme, and emotional atmosphere of the image.\n- **Details on dynamics and action**: Prompts may include important details like actions, emotions, or lighting effects in the scene.";

    const response = await fetch(`${this.externalApiBase}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.externalApiKey}`,
      },
      body: JSON.stringify({
        model: this.externalModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Optimize this image generation prompt for aspect ratio ${aspectRatio}: ${prompt}` },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data: ExternalAPIResponse = await response.json();
    return data.choices[0].message.content.trim();
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