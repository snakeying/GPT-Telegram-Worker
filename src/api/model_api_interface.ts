import { Message } from './openai_api';

export interface ModelAPIInterface {
  generateResponse(messages: Message[], model?: string): Promise<string>;
  isValidModel(model: string): boolean;
  getDefaultModel(): string;
  getAvailableModels(): string[];
}