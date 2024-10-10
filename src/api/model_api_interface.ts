export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{type: string, [key: string]: any}>;
  images?: string[];
}

export interface ModelAPIInterface {
  generateResponse(messages: Message[], model?: string): Promise<string>;
  isValidModel(model: string): boolean;
  getDefaultModel(): string;
  getAvailableModels(): string[];
}