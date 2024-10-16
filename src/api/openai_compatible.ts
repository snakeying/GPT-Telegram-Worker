import { Env, getConfig } from '../env';
import { ModelAPIInterface } from './model_api_interface';
import { Message } from './openai_api';

interface OpenAICompatibleResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenAICompatibleAPI implements ModelAPIInterface {
  private apiKey: string;
  private baseUrl: string;
  private models: string[] = [];
  private defaultModel: string = '';

  constructor(env: Env) {
    const config = getConfig(env);
    this.apiKey = config.openaiCompatibleKey || '';
    this.baseUrl = config.openaiCompatibleUrl || '';
    // 在构造函数中立即开始获取可用模型
    this.fetchModels().catch(error => console.error('Failed to fetch models:', error));
  }

  async generateResponse(messages: Message[], model?: string): Promise<string> {
    if (!this.apiKey || !this.baseUrl) {
      throw new Error('OpenAI Compatible API is not configured');
    }

    if (this.models.length === 0) {
      await this.fetchModels();
    }

    const useModel = model || this.defaultModel;
    if (!useModel) {
      throw new Error('No model specified and no default model available');
    }

    const url = `${this.baseUrl}/v1/chat/completions`;
    console.log(`OpenAI Compatible API request URL: ${url}`);

    const requestBody = {
      model: useModel,
      messages: messages,
    };
    console.log('OpenAI Compatible API request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI Compatible API error: ${response.statusText}`, errorText);
      throw new Error(`OpenAI Compatible API error: ${response.statusText}\n${errorText}`);
    }

    const data: OpenAICompatibleResponse = await response.json();
    console.log('OpenAI Compatible API response:', JSON.stringify(data, null, 2));

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated from OpenAI Compatible API');
    }

    return data.choices[0].message.content.trim();
  }

  async fetchModels(): Promise<void> {
    const url = `${this.baseUrl}/v1/models`;
    console.log(`Fetching models from: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch models: ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch models: ${response.statusText}\n${errorText}`);
    }

    const data: { data: Array<{ id: string }> } = await response.json();
    console.log('Available models:', JSON.stringify(data, null, 2));

    this.models = data.data.map(model => model.id);
    this.defaultModel = this.models[0] || '';
  }

  async getModels(): Promise<string[]> {
    if (this.models.length === 0) {
      await this.fetchModels();
    }
    return this.models;
  }

  isValidModel(model: string): boolean {
    return this.models.includes(model);
  }

  getDefaultModel(): string {
    // 如果还没有获取到模型，返回一个默认值
    return this.defaultModel || 'default_model';
  }

  getAvailableModels(): string[] {
    return this.models;
  }

  async analyzeImage(imageUrl: string, prompt: string, model: string): Promise<string> {
    if (!this.apiKey || !this.baseUrl) {
      throw new Error('OpenAI Compatible API is not configured');
    }

    const url = `${this.baseUrl}/v1/chat/completions`;
    console.log(`Analyzing image with OpenAI Compatible API. Model: ${model}, URL: ${imageUrl}`);
    
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
      const errorText = await response.text();
      console.error(`OpenAI Compatible API error: ${response.statusText}`, errorText);
      throw new Error(`OpenAI Compatible image analysis API error: ${response.statusText}\n${errorText}`);
    }

    const data = await response.json() as OpenAICompatibleResponse;
    console.log('OpenAI Compatible API response:', JSON.stringify(data, null, 2));

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated from OpenAI Compatible API');
    }

    const content = data.choices[0].message?.content;
    if (!content) {
      throw new Error('No content in OpenAI Compatible API response');
    }

    return content.trim();
  }
}

export default OpenAICompatibleAPI;
