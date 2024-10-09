import { Env, getConfig } from '../env';
import { TelegramTypes } from '../../types/telegram';
import OpenAIAPI, { Message } from './openai_api';
import { formatCodeBlock, escapeMarkdown, sendChatAction, splitMessage } from '../utils/helpers';
import { translate, SupportedLanguages } from '../utils/i18n';
import { commands, Command } from '../config/commands';
import { RedisClient } from '../utils/redis';
import { ModelAPIInterface } from './model_api_interface';
import GeminiAPI from './gemini';
import GroqAPI from './groq';

export class TelegramBot {
  private token: string;
  private apiUrl: string;
  private whitelistedUsers: string[];
  private systemMessage: string;
  private env: Env;
  private commands: Command[];
  private redis: RedisClient;
  private modelAPI: ModelAPIInterface;

  constructor(env: Env) {
    const config = getConfig(env);
    this.token = config.telegramBotToken;
    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    this.whitelistedUsers = config.whitelistedUsers;
    this.systemMessage = config.systemInitMessage;
    this.env = env;
    this.commands = commands;
    this.redis = new RedisClient(env);
    this.modelAPI = new OpenAIAPI(env); // 初始化为 OpenAIAPI，稍后会根据需要更新
  }

  private async initializeModelAPI(userId: string): Promise<ModelAPIInterface> {
    const currentModel = await this.getCurrentModel(userId);
    console.log(`Initializing API for model: ${currentModel}`);
    
    const config = getConfig(this.env);
    
    if (config.openaiModels.includes(currentModel)) {
      return new OpenAIAPI(this.env);
    } else if (config.googleModels.includes(currentModel)) {
      return new GeminiAPI(this.env);
    } else if (config.groqModels.includes(currentModel)) {
      return new GroqAPI(this.env);
    }
    
    // 如果没有匹配的模型,使用默认的 OpenAI API
    console.warn(`Unknown model: ${currentModel}. Falling back to OpenAI API.`);
    return new OpenAIAPI(this.env);
  }

  public async executeCommand(commandName: string, chatId: number, args: string[]): Promise<void> {
    const command = this.commands.find(cmd => cmd.name === commandName) as Command | undefined;
    if (command) {
      await command.action(chatId, this, args);
    } else {
      console.log(`Unknown command: ${commandName}`);
      const language = await this.getUserLanguage(chatId.toString());
      // 使用 'command_not_found' 作为翻译键
      await this.sendMessage(chatId, translate('command_not_found', language));
    }
  }

  async sendMessage(chatId: number, text: string, options: { parse_mode?: 'Markdown' | 'HTML', reply_markup?: string } = {}): Promise<TelegramTypes.SendMessageResult[]> {
    const messages = splitMessage(text);
    const results: TelegramTypes.SendMessageResult[] = [];

    for (const message of messages) {
      const url = `${this.apiUrl}/sendMessage`;
      console.log(`Sending message part (length: ${message.length})`);
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: options.parse_mode, // 只有在明确指定时才使用 parse_mode
            reply_markup: options.reply_markup,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Telegram API error: ${response.statusText}`, errorText);
          throw new Error(`Telegram API error: ${response.statusText}\n${errorText}`);
        }

        const result = await response.json() as TelegramTypes.SendMessageResult;
        results.push(result);
      } catch (error) {
        console.error('Error sending message part:', error);
        throw error;
      }
    }

    return results;
  }

  async handleUpdate(update: TelegramTypes.Update): Promise<void> {
    if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
    } else if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userId = update.message.from?.id?.toString();
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }
      const text = update.message.text;
      const language = await this.getUserLanguage(userId);

      if (this.isUserWhitelisted(userId)) {
        if (text.startsWith('/')) {
          const [commandName, ...args] = text.slice(1).split(' ');
          await this.executeCommand(commandName, chatId, args);
        } else {
          try {
            await sendChatAction(chatId, 'typing', this.env);
            this.modelAPI = await this.initializeModelAPI(userId);
            const context = await this.getContext(userId);
            const currentModel = await this.getCurrentModel(userId);

            let messages: Message[] = [];
            if (currentModel.startsWith('gemini-')) {
              messages = [
                ...(context ? [{ role: 'user' as const, content: context }] : []),
                { role: 'user' as const, content: text }
              ];
            } else {
              messages = [
                { role: 'system' as const, content: this.systemMessage },
                ...(context ? [{ role: 'user' as const, content: context }] : []),
                { role: 'user' as const, content: text }
              ];
            }

            console.log(`Current modelAPI type: ${this.modelAPI.constructor.name}`);
            console.log(`Generating response with model: ${currentModel}`);
            const response = await this.modelAPI.generateResponse(messages, currentModel);
            console.log(`Generated response length: ${response.length}`);
            const formattedResponse = this.formatResponse(response);

            console.log(`Formatted response length: ${formattedResponse.length}`);
            // 使用 sendMessageWithFallback 方法发送模型生成的响应
            await this.sendMessageWithFallback(chatId, formattedResponse);

            await this.storeContext(userId, `User: ${text}\nAssistant: ${response}`);
          } catch (error) {
            console.error('Error in handleUpdate:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            // 错误消息使用普通的 sendMessage 方法
            await this.sendMessage(chatId, translate('error', language) + ': ' + errorMessage);
          }
        }
      } else {
        // 未授权消息使用 sendMessageWithFallback 方法
        await this.sendMessageWithFallback(chatId, translate('unauthorized', language));
      }
    }
  }

  async handleCallbackQuery(callbackQuery: TelegramTypes.CallbackQuery): Promise<void> {
    const chatId = callbackQuery.message?.chat.id;
    const userId = callbackQuery.from.id.toString();
    const data = callbackQuery.data;

    if (!chatId || !data) return;

    if (data.startsWith('lang_')) {
      const newLanguage = data.split('_')[1] as SupportedLanguages;
      await this.setUserLanguage(userId, newLanguage);
      await this.sendMessageWithFallback(chatId, translate('language_changed', newLanguage) + translate(`language_${newLanguage}`, newLanguage));
    } else if (data.startsWith('model_')) {
      const newModel = data.split('_')[1];
      await this.setCurrentModel(userId, newModel);
      const language = await this.getUserLanguage(userId);
      await this.sendMessageWithFallback(chatId, translate('model_changed', language) + newModel);
      await this.clearContext(userId);
    }

    // Answer the callback query to remove the loading state
    await fetch(`${this.apiUrl}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQuery.id })
    });
  }

  async getUserLanguage(userId: string): Promise<SupportedLanguages> {
    const language = await this.redis.get(`language:${userId}`);
    return (language as SupportedLanguages) || 'en';
  }

  async setUserLanguage(userId: string, language: SupportedLanguages): Promise<void> {
    await this.redis.setLanguage(userId, language);
  }

  async getCurrentModel(userId: string): Promise<string> {
    const model = await this.redis.get(`model:${userId}`);
    return model || this.modelAPI.getDefaultModel();
  }

  async setCurrentModel(userId: string, model: string): Promise<void> {
    await this.redis.set(`model:${userId}`, model);
    console.log(`Switching to model: ${model}`);
    // 在这里重新初始化 modelAPI，使用用户ID
    this.modelAPI = await this.initializeModelAPI(userId);
    console.log(`Current modelAPI type: ${this.modelAPI.constructor.name}`);
  }

  getAvailableModels(): string[] {
    return this.modelAPI.getAvailableModels();
  }

  isValidModel(model: string): boolean {
    return this.modelAPI.isValidModel(model);
  }

  async storeContext(userId: string, context: string): Promise<void> {
    await this.redis.appendContext(userId, context);
  }

  async getContext(userId: string): Promise<string | null> {
    return await this.redis.get(`context:${userId}`);
  }

  async clearContext(userId: string): Promise<void> {
    await this.redis.del(`context:${userId}`);
    const language = await this.getUserLanguage(userId);
    await this.sendMessageWithFallback(parseInt(userId), translate('new_conversation', language));
  }

  async summarizeHistory(userId: string): Promise<string> {
    // 确保使用最新的模型
    this.modelAPI = await this.initializeModelAPI(userId);

    const context = await this.getContext(userId);
    const language = await this.getUserLanguage(userId);
    if (!context) {
      return translate('no_history', language);
    }
    const languageNames = {
      'en': 'English',
      'zh': 'Chinese',
      'es': 'Spanish'
    };
    const currentModel = await this.getCurrentModel(userId);
    console.log(`Summarizing history with model: ${currentModel}`);

    let messages: Message[];
    if (currentModel.startsWith('gemini-')) {
      // 为 Gemini API 创建特定的消息格式
      messages = [
        { role: 'user', content: `Please summarize the following conversation in ${languageNames[language]}:\n\n${context}` }
      ];
    } else {
      // 为 OpenAI API 保持原有的消息格式
      messages = [
        { role: 'system', content: `Summarize the following conversation in ${languageNames[language]}:` },
        { role: 'user', content: context }
      ];
    }

    const summary = await this.modelAPI.generateResponse(messages, currentModel);
    return `${translate('history_summary', language)}\n\n${summary}`;
  }

  formatResponse(response: string): string {
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    return response.replace(codeBlockRegex, (match, language, code) => {
      return formatCodeBlock(code.trim(), language || '');
    });
  }

  isUserWhitelisted(userId: string): boolean {
    return this.whitelistedUsers.includes(userId);
  }

  async handleWebhook(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const update: TelegramTypes.Update = await request.json();
      await this.handleUpdate(update);
      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  async sendPhoto(chatId: number, photo: string | Uint8Array, options: { caption?: string } = {}): Promise<void> {
    const url = `${this.apiUrl}/sendPhoto`;
    const formData = new FormData();
    formData.append('chat_id', chatId.toString());

    if (typeof photo === 'string') {
      formData.append('photo', photo);
    } else {
      const blob = new Blob([photo], { type: 'image/png' });
      formData.append('photo', blob, 'image.png');
    }

    if (options.caption) {
      formData.append('caption', options.caption);
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async setWebhook(url: string): Promise<void> {
    const setWebhookUrl = `${this.apiUrl}/setWebhook`;
    const response = await fetch(setWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set webhook: ${response.statusText}`);
    }

    const result: { ok: boolean; description?: string } = await response.json();
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }
  }

  async sendMessageWithFallback(chatId: number, text: string): Promise<TelegramTypes.SendMessageResult[]> {
    const messages = splitMessage(text);
    const results: TelegramTypes.SendMessageResult[] = [];

    for (const message of messages) {
      try {
        // 首先尝试使用 Markdown
        const result = await this.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        results.push(...result);  // 使用展开运算符来添加结果
      } catch (error) {
        console.error('Error sending message with Markdown, falling back to plain text:', error);
        // 如果 Markdown 失败，退回到纯文本
        const plainTextResult = await this.sendMessage(chatId, message);
        results.push(...plainTextResult);  // 使用展开运算符来添加结果
      }
    }

    return results;
  }
}

export default TelegramBot;