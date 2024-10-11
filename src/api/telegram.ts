import { Env, getConfig } from '../env';
import { TelegramTypes } from '../../types/telegram';
import OpenAIAPI, { Message } from './openai_api';
import { formatCodeBlock, escapeMarkdown, sendChatAction, splitMessage } from '../utils/helpers';
import { translate, SupportedLanguages, Translations } from '../utils/i18n';
import { commands, Command } from '../config/commands';
import { RedisClient } from '../utils/redis';
import { ModelAPIInterface } from './model_api_interface';
import GeminiAPI from './gemini';
import GroqAPI from './groq';
import ClaudeAPI from './claude';
import AzureAPI from './azure';
import ImageAnalysisAPI from './image_analyze';

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
    this.setMenuButton().catch(console.error);
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
    } else if (config.claudeModels.includes(currentModel)) {
      return new ClaudeAPI(this.env);
    } else if (config.azureModels.includes(currentModel)) {
      return new AzureAPI(this.env);
    }
    
    console.warn(`Unknown model: ${currentModel}. Falling back to OpenAI API.`);
    return new OpenAIAPI(this.env);
  }

  public async executeCommand(commandName: string, chatId: number, args: string[]): Promise<void> {
    const command = this.commands.find(cmd => cmd.name === commandName);
    if (command) {
      await command.action(chatId, this, args);
    } else {
      console.log(`Unknown command: ${commandName}`);
      const language = await this.getUserLanguage(chatId.toString());
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
            parse_mode: options.parse_mode,
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
    } else if (update.message) {
      const chatId = update.message.chat.id;
      const userId = update.message.from?.id?.toString();
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }
      const language = await this.getUserLanguage(userId);

      if (this.isUserWhitelisted(userId)) {
        if ('photo' in update.message && Array.isArray(update.message.photo) && update.message.photo.length > 0) {
          await this.handleImageAnalysis(chatId, update.message as TelegramTypes.Message & { photo: TelegramTypes.PhotoSize[] }, language);
        } else if (update.message.text) {
          if (update.message.text.startsWith('/')) {
            const [commandName, ...args] = update.message.text.slice(1).split(' ');
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
                  { role: 'user' as const, content: update.message.text }
                ];
              } else {
                messages = [
                  { role: 'system' as const, content: this.systemMessage },
                  ...(context ? [{ role: 'user' as const, content: context }] : []),
                  { role: 'user' as const, content: update.message.text }
                ];
              }

              const response = await this.modelAPI.generateResponse(messages, currentModel);
              const formattedResponse = this.formatResponse(response);

              await this.sendMessageWithFallback(chatId, formattedResponse);

              await this.storeContext(userId, `User: ${update.message.text}\nAssistant: ${response}`);
            } catch (error) {
              console.error('Error in handleUpdate:', error);
              // 不向用户发送错误消息，只记录日志
            }
          }
        }
      } else {
        await this.sendMessageWithFallback(chatId, translate('unauthorized', language));
      }
    }
  }

  private async handleCallbackQuery(query: TelegramTypes.CallbackQuery): Promise<void> {
    if (!query.message || !query.data) {
      console.log('Invalid callback query');
      return;
    }

    const chatId = query.message.chat.id;
    const userId = query.from.id.toString();
    const language = await this.getUserLanguage(userId);

    console.log('Handling callback query:', query.data);

    if (query.data.startsWith('lang_')) {
      const newLanguage = query.data.split('_')[1] as SupportedLanguages;
      await this.setUserLanguage(userId, newLanguage);
      await this.sendMessageWithFallback(chatId, translate('language_changed', newLanguage) + translate(`language_${newLanguage}` as keyof Translations, newLanguage));
    } else if (query.data.startsWith('model_')) {
      const newModel = query.data.split('_')[1];
      console.log('Switching to model:', newModel);
      try {
        await this.setCurrentModel(userId, newModel);
        await this.sendMessageWithFallback(chatId, translate('model_changed', language) + newModel);
        await this.clearContext(userId);
      } catch (error) {
        console.error('Error switching model:', error);
        await this.sendMessageWithFallback(chatId, translate('error', language) + ': ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }

    // Answer the callback query to remove the loading state
    try {
      await fetch(`${this.apiUrl}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: query.id })
      });
      console.log('Callback query answered');
    } catch (error) {
      console.error('Error answering callback query:', error);
    }
  }

  private async handleImageAnalysis(chatId: number, message: TelegramTypes.Message & { photo: TelegramTypes.PhotoSize[] }, language: SupportedLanguages): Promise<void> {
    if (!message.photo || message.photo.length === 0) {
      await this.sendMessageWithFallback(chatId, translate('image_analysis_error', language));
      return;
    }

    const fileId = message.photo[message.photo.length - 1].file_id;
    const caption = 'caption' in message ? message.caption || '' : '';

    try {
      await sendChatAction(chatId, 'typing', this.env);

      const fileUrl = await this.getFileUrl(fileId);

      const currentModel = await this.getCurrentModel(chatId.toString());
      const config = getConfig(this.env);

      if (!config.openaiModels.includes(currentModel) && !config.googleModels.includes(currentModel)) {
        await this.sendMessageWithFallback(chatId, translate('image_analysis_not_supported', language));
        return;
      }

      const imageAnalysisAPI = new ImageAnalysisAPI(this.env);
      const analysisResult = await imageAnalysisAPI.analyzeImage(fileUrl, caption, currentModel);

      await this.sendMessageWithFallback(chatId, analysisResult);
    } catch (error) {
      console.error('Error in image analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      await this.sendMessage(chatId, translate('image_analysis_error', language) + ': ' + errorMessage);
    }
  }

  private async getFileUrl(fileId: string): Promise<string> {
    const response = await fetch(`https://api.telegram.org/bot${this.token}/getFile?file_id=${fileId}`);
    const data: { ok: boolean; result: { file_path: string } } = await response.json();
    if (data.ok) {
      return `https://api.telegram.org/file/bot${this.token}/${data.result.file_path}`;
    }
    throw new Error('Failed to get file URL');
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
    this.modelAPI = await this.initializeModelAPI(userId);
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
    this.modelAPI = await this.initializeModelAPI(userId);

    const context = await this.getContext(userId);
    const language = await this.getUserLanguage(userId);
    if (!context) {
      return translate('no_history', language);
    }
    const languageNames = {
      'en': 'English',
      'zh': 'Chinese',
      'es': 'Spanish',
      'zh-TW': 'Traditional Chinese',
      'ja': 'Japanese',
      'de': 'German',
      'fr': 'French',
      'ru': 'Russian'
    };
    const currentModel = await this.getCurrentModel(userId);
    console.log(`Summarizing history with model: ${currentModel}`);

    let messages: Message[];
    if (currentModel.startsWith('gemini-')) {
      messages = [
        { role: 'user', content: `Please summarize the following conversation in ${languageNames[language]}:\n\n${context}` }
      ];
    } else {
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
    const currentModel = await this.getCurrentModel(chatId.toString());
    const messages = this.splitMessage(text, 4000);
    const results: TelegramTypes.SendMessageResult[] = [];

    for (const message of messages) {
      try {
        let result;
        if (currentModel.startsWith('gemini-')) {
          // 对于 Gemini 模型，尝试使用 HTML 格式
          const htmlMessage = this.convertToHtml(message);
          result = await this.sendMessage(chatId, htmlMessage, { parse_mode: 'HTML' });
        } else {
          // 对于其他模型，尝试使用 Markdown
          result = await this.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        }
        results.push(...result);
        console.log(`Successfully sent message part (length: ${message.length})`);
      } catch (error) {
        console.error('Error sending formatted message:', error);
        try {
          // 如果发送失败，尝试发送纯文本
          const plainTextResult = await this.sendMessage(chatId, this.stripFormatting(message));
          results.push(...plainTextResult);
          console.log(`Sent plain text message part (length: ${message.length})`);
        } catch (fallbackError) {
          console.error('Error sending plain text message:', fallbackError);
        }
      }
    }

    return results;
  }

  private convertToHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
  }

  private stripFormatting(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '$1 ($2)')
      .replace(/<[^>]+>/g, '');
  }

  private splitMessage(text: string, maxLength: number = 4000): string[] {
    const messages: string[] = [];
    let currentMessage = '';

    const lines = text.split('\n');
    for (const line of lines) {
      if (currentMessage.length + line.length + 1 > maxLength) {
        if (currentMessage) {
          messages.push(currentMessage.trim());
          currentMessage = '';
        }
        if (line.length > maxLength) {
          const chunks = line.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [];
          messages.push(...chunks);
        } else {
          currentMessage = line;
        }
      } else {
        currentMessage += (currentMessage ? '\n' : '') + line;
      }
    }

    if (currentMessage) {
      messages.push(currentMessage.trim());
    }

    return messages;
  }

  private async setMenuButton(): Promise<void> {
    const url = `${this.apiUrl}/setMyCommands`;
    
    const userLanguages = await this.redis.getAllUserLanguages();
    
    for (const [userId, lang] of Object.entries(userLanguages)) {
      const commands = this.commands.map(cmd => ({
        command: cmd.name,
        description: translate(cmd.description, lang as SupportedLanguages)
      }));

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            commands: commands,
            scope: {
              type: 'chat',
              chat_id: parseInt(userId)
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to set menu button for user ${userId}: ${response.statusText}`);
        }

        console.log(`Menu button set successfully for user ${userId} with language: ${lang}`);
      } catch (error) {
        console.error(`Error setting menu button for user ${userId}:`, error);
      }
    }

    const defaultCommands = this.commands.map(cmd => ({
      command: cmd.name,
      description: translate(cmd.description, 'en')
    }));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commands: defaultCommands
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set default menu button: ${response.statusText}`);
      }

      console.log('Default menu button set successfully');
    } catch (error) {
      console.error('Error setting default menu button:', error);
    }
  }
}

export default TelegramBot;