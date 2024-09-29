import { Env, getConfig } from '../env';
import { TelegramTypes } from '../../types/telegram';
import OpenAIAPI from './openai_api';

export class TelegramBot {
  private token: string;
  private apiUrl: string;
  private whitelistedUsers: number[];
  private openai: OpenAIAPI;
  private systemMessage: string;

  constructor(env: Env) {
    const config = getConfig(env);
    this.token = config.telegramBotToken;
    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    this.whitelistedUsers = config.whitelistedUsers.map(Number);
    this.openai = new OpenAIAPI(env);
    this.systemMessage = config.systemInitMessage;
  }

  async sendMessage(chatId: number, text: string): Promise<TelegramTypes.SendMessageResult> {
    const url = `${this.apiUrl}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
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

      if (userId && this.isUserWhitelisted(userId)) {
        try {
          const response = await this.openai.generateResponse([
            { role: 'system', content: this.systemMessage },
            { role: 'user', content: text }
          ]);
          await this.sendMessage(chatId, response);
        } catch (error) {
          console.error('Error generating response:', error);
          await this.sendMessage(chatId, "Sorry, I couldn't generate a response. Please try again later.");
        }
      } else {
        await this.sendMessage(chatId, "Sorry, you're not authorized to use this bot.");
      }
    }
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