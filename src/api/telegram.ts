import { Env, getConfig } from '../env';
import { TelegramTypes } from '../../types/telegram';
import OpenAIAPI from './openai_api';
import { formatCodeBlock, escapeMarkdown, sendChatAction } from '../utils/helpers';
import { translate, SupportedLanguages } from '../utils/i18n';
import { commands, Command } from '../config/commands';

export class TelegramBot {
  private token: string;
  private apiUrl: string;
  private whitelistedUsers: number[];
  private openai: OpenAIAPI;
  private systemMessage: string;
  private env: Env;
  private commands: Command[];

  constructor(env: Env) {
    const config = getConfig(env);
    this.token = config.telegramBotToken;
    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    this.whitelistedUsers = config.whitelistedUsers.map(Number);
    this.openai = new OpenAIAPI(env);
    this.systemMessage = config.systemInitMessage;
    this.env = env;
    this.commands = commands;
  }

  public async executeCommand(commandName: string, chatId: number): Promise<void> {
    const command = this.commands.find(cmd => cmd.name === commandName);
    if (command) {
      await command.action(chatId, this);
    } else {
      console.log(`Unknown command: ${commandName}`);
    }
  }

  async sendMessage(chatId: number, text: string, parseMode: 'Markdown' | 'HTML' = 'Markdown'): Promise<TelegramTypes.SendMessageResult> {
    const url = `${this.apiUrl}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async handleUpdate(update: TelegramTypes.Update): Promise<void> {
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userId = update.message.from?.id;
      const text = update.message.text;
      const language = (update.message.from?.language_code as SupportedLanguages) || 'en';

      if (userId && this.isUserWhitelisted(userId)) {
        if (text.startsWith('/')) {
          const commandName = text.split(' ')[0].substring(1);
          await this.executeCommand(commandName, chatId);
        } else {
          try {
            await sendChatAction(chatId, 'typing', this.env);
            const response = await this.openai.generateResponse([
              { role: 'system', content: this.systemMessage },
              { role: 'user', content: text }
            ]);
            const formattedResponse = this.formatResponse(response);
            await this.sendMessage(chatId, formattedResponse);
          } catch (error) {
            console.error('Error generating response:', error);
            await this.sendMessage(chatId, translate('error', language));
          }
        }
      } else {
        await this.sendMessage(chatId, translate('unauthorized', language));
      }
    }
  }

  private async getChatMember(chatId: number): Promise<TelegramTypes.ChatMember> {
    const url = `${this.apiUrl}/getChatMember`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: chatId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: TelegramTypes.GetChatMemberResult = await response.json();
    if (!result.ok) {
      throw new Error('Failed to get chat member');
    }
    return result.result;
  }

  formatResponse(response: string): string {
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    return response.replace(codeBlockRegex, (match, language, code) => {
      return formatCodeBlock(code.trim(), language || '');
    });
  }

  isUserWhitelisted(userId: number): boolean {
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