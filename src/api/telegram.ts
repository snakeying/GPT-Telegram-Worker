import { Env, getConfig } from '../env';
import { TelegramTypes } from '../../types/telegram';
import { Message, ModelAPIInterface } from './model_api_interface';
import { formatCodeBlock, escapeMarkdown, sendChatAction, splitMessage } from '../utils/helpers';
import { translate, SupportedLanguages, Translations } from '../utils/i18n';
import { commands, Command } from '../config/commands';
import { RedisClient } from '../utils/redis';
import OpenAIAPI from './openai_api';
import GeminiAPI from './gemini';
import GroqAPI from './groq';
import ClaudeAPI from './claude';
import AzureAPI from './azure';
import { analyzeImage } from '../utils/image_analyze';

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
    } else if (config.azureModels.includes(currentModel)) { // 新增 Azure 模型检查
      return new AzureAPI(this.env);
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
    } else if (update.message) {
      const chatId = update.message.chat.id;
      const userId = update.message.from?.id?.toString();
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }
      const language = await this.getUserLanguage(userId);

      if (this.isUserWhitelisted(userId)) {
        if (update.message.photo && update.message.photo.length > 0 && update.message.caption) {
          // 处理图片上传和分析
          await this.handleImageAnalysis(chatId, userId, update.message);
        } else if (update.message.text) {
          const text = update.message.text;
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

              const response = await this.modelAPI.generateResponse(messages, currentModel);
              const formattedResponse = this.formatResponse(response);

              await this.sendMessageWithFallback(chatId, formattedResponse);

              await this.storeContext(userId, `User: ${text}\nAssistant: ${response}`);
            } catch (error) {
              console.error('Error in handleUpdate:', error);
              const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
              await this.sendMessage(chatId, translate('error', language) + ': ' + errorMessage);
            }
          }
        }
      } else {
        await this.sendMessageWithFallback(chatId, translate('unauthorized', language));
      }
    }
  }

  async handleImageAnalysis(chatId: number, userId: string, message: TelegramTypes.Message): Promise<void> {
    if (!message.photo || message.photo.length === 0 || !message.caption) {
      return;
    }

    const fileId = message.photo[message.photo.length - 1].file_id;
    const caption = message.caption;
    const language = await this.getUserLanguage(userId);

    try {
      await sendChatAction(chatId, 'typing', this.env);

      // 获取图片URL
      const fileUrl = await this.getFileUrl(fileId);

      // 获取当前模型
      const currentModel = await this.getCurrentModel(userId);

      // 分析图片
      const analysis = await analyzeImage(fileUrl, caption, this.env, currentModel);

      // 发送分析结果
      await this.sendMessageWithFallback(chatId, analysis);
    } catch (error) {
      console.error('Error in handleImageAnalysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      if (errorMessage.includes('does not support image analysis')) {
        await this.sendMessage(chatId, translate('model_not_support_multimodal', language));
      } else {
        await this.sendMessage(chatId, translate('image_analysis_error', language) + ': ' + errorMessage);
      }
    }
  }

  async getFileUrl(fileId: string): Promise<string> {
    const getFileUrl = `https://api.telegram.org/bot${this.token}/getFile?file_id=${fileId}`;
    const response = await fetch(getFileUrl);
    const data = await response.json() as { ok: boolean; result: { file_path: string } };
    if (data.ok) {
      return `https://api.telegram.org/file/bot${this.token}/${data.result.file_path}`;
    }
    throw new Error('Failed to get file URL');
  }

  async handleCallbackQuery(callbackQuery: TelegramTypes.CallbackQuery): Promise<void> {
    const chatId = callbackQuery.message?.chat.id;
    const userId = callbackQuery.from.id.toString();
    const data = callbackQuery.data;

    if (!chatId || !data) return;

    if (data.startsWith('lang_')) {
      const newLanguage = data.split('_')[1] as SupportedLanguages;
      await this.setUserLanguage(userId, newLanguage);
      await this.sendMessageWithFallback(chatId, translate('language_changed', newLanguage) + translate(`language_${newLanguage}` as keyof Translations, newLanguage));
      
      // 重新设置菜单按钮
      await this.setMenuButton();
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
      'es': 'Spanish',
      'zh-TW': 'Traditional Chinese', // 修改这里
      'ja': 'Japanese',
      'de': 'German',
      'fr': 'French',
      'ru': 'Russian'
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
        const result = await this.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        results.push(...result);
      } catch (error) {
        console.error('Error sending message with Markdown, falling back to plain text:', error);
        const plainTextResult = await this.sendMessage(chatId, message);
        results.push(...plainTextResult);
      }
    }

    return results;
  }

  // 添加新方法来设置菜单按钮
  private async setMenuButton(): Promise<void> {
    const url = `${this.apiUrl}/setMyCommands`;
    
    // 获取所有用户的语言设置
    const userLanguages = await this.redis.getAllUserLanguages();
    
    // 为每个用户设置自定义命令
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

    // 设置默认命令（英语）
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