import { Env, getConfig } from '../env';
import { ModelAPIInterface } from './model_api_interface';
import { Message } from './openai_api';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
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

    const geminiMessages: GeminiMessage[] = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
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
      console.error(`Gemini API error: ${response.statusText}`, errorText);
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
