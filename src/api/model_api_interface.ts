import { Message } from './openai_api';

export interface ModelAPIInterface {
  generateResponse(messages: any[], model?: string): Promise<string>;
  isValidModel(model: string): boolean;
  getDefaultModel(): string;
  getAvailableModels(): string[];
}
