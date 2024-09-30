import { Env, getConfig } from '../env';
import { TelegramTypes } from '../../types/telegram';
import OpenAIAPI, { Message } from './openai_api';
import { formatCodeBlock, escapeMarkdown, sendChatAction, splitMessage } from '../utils/helpers';
import { translate, SupportedLanguages } from '../utils/i18n';
import { commands, Command } from '../config/commands';
import { RedisClient } from '../utils/redis';
import { ModelAPIInterface } from './model_api_interface';

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
    this.modelAPI = new OpenAIAPI(env);
  }

  public async executeCommand(commandName: string, chatId: number, args: string[]): Promise<void> {
    const command = this.commands.find(cmd => cmd.name === commandName) as Command | undefined;
    if (command) {
      await command.action(chatId, this, args);
    } else {
      console.log(`Unknown command: ${commandName}`);
    }
  }

  async sendMessage(chatId: number, text: string, options: { parse_mode?: 'Markdown' | 'HTML', reply_markup?: string } = {}): Promise<TelegramTypes.SendMessageResult[]> {
    const messages = splitMessage(text);
    const results: TelegramTypes.SendMessageResult[] = [];
  
    for (const message of messages) {
      const url = `${this.apiUrl}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: options.parse_mode || 'Markdown',  // 默认使用 Markdown
          reply_markup: options.reply_markup,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json() as TelegramTypes.SendMessageResult;
      results.push(result);
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
            const context = await this.getContext(userId);
            const messages: Message[] = [
              { role: 'system' as const, content: this.systemMessage },
              ...(context ? [{ role: 'user' as const, content: context }] : []),
              { role: 'user' as const, content: text }
            ];
            const response = await this.modelAPI.generateResponse(messages);
            const formattedResponse = this.formatResponse(response);
            await this.sendMessage(chatId, formattedResponse, { parse_mode: 'Markdown' });
            await this.storeContext(userId, `User: ${text}\nAssistant: ${response}`);
          } catch (error) {
            console.error('Error generating response:', error);
            await this.sendMessage(chatId, translate('error', language), { parse_mode: 'Markdown' });
          }
        }
      } else {
        await this.sendMessage(chatId, translate('unauthorized', language), { parse_mode: 'Markdown' });
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
      await this.sendMessage(chatId, translate('language_changed', newLanguage) + translate(`language_${newLanguage}`, newLanguage), { parse_mode: 'Markdown' });
    } else if (data.startsWith('model_')) {
      const newModel = data.split('_')[1];
      await this.setCurrentModel(userId, newModel);
      const language = await this.getUserLanguage(userId);
      await this.sendMessage(chatId, translate('model_changed', language) + newModel, { parse_mode: 'Markdown' });
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
    await this.sendMessage(parseInt(userId), translate('new_conversation', language), { parse_mode: 'Markdown' });
  }

  async summarizeHistory(userId: string): Promise<string> {
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
    const messages: Message[] = [
      { role: 'system' as const, content: `Summarize the following conversation in ${languageNames[language]}:` },
      { role: 'user' as const, content: context }
    ];
    const summary = await this.modelAPI.generateResponse(messages);
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
}

export default TelegramBot;