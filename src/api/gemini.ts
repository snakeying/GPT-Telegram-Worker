import { Env, getConfig } from '../env';
import { ModelAPIInterface, Message } from './model_api_interface';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiAPI implements ModelAPIInterface {
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
    const url = `${this.baseUrl}/models/${useModel}:generateContent?key=${this.apiKey}`;

    const geminiMessages = await Promise.all(messages.map(async (msg) => {
      const parts = [];
      if (typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      } else if (Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part.type === 'text') {
            parts.push({ text: part.text });
          } else if (part.type === 'image_url') {
            const base64Image = part.image_url.url.split(',')[1]; // 获取 base64 数据
            parts.push({
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image
              }
            });
          }
        }
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: parts
      };
    }));

    const requestBody = {
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.statusText}\n${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
    }
    return data.candidates[0].content.parts[0].text.trim();
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

export default GeminiAPI;
