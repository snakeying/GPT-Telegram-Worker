import { TelegramBot } from '../api/telegram';
import { translate, TranslationKey } from '../utils/i18n';
import { ImageGenerationAPI } from '../api/image_generation';
import { sendChatAction } from '../utils/helpers';
import { FluxAPI } from '../api/flux-cf';
import { getConfig } from '../env';
import OpenAICompatibleAPI from '../api/openai_compatible';

export interface Command {
  name: string;
  description: TranslationKey; // 修改这里,使用 TranslationKey
  action: (chatId: number, bot: TelegramBot, args: string[]) => Promise<void>;
}

export const commands: Command[] = [
  {
    name: 'start',
    description: 'start_description',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const currentModel = await bot.getCurrentModel(userId);
      const welcomeMessage = translate('welcome', language) + '\n' + 
                           translate('current_model', language) + currentModel;
      await bot.sendMessageWithFallback(chatId, welcomeMessage);
    },
  },
  {
    name: 'language',
    description: 'language_description',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const currentLanguage = await bot.getUserLanguage(userId);
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🇺🇸 English', callback_data: 'lang_en' },
            { text: '🇨🇳 简体中文', callback_data: 'lang_zh' },
            { text: '🇪🇸 Español', callback_data: 'lang_es' }
          ],
          [
            { text: '🇹🇼 繁體中文', callback_data: 'lang_zh-TW' }, // 修改这里
            { text: '🇯🇵 日本語', callback_data: 'lang_ja' },
            { text: '🇩🇪 Deutsch', callback_data: 'lang_de' }
          ],
          [
            { text: '🇫🇷 Français', callback_data: 'lang_fr' },
            { text: '🇷🇺 Русский', callback_data: 'lang_ru' }
          ]
        ]
      };
      await bot.sendMessage(chatId, translate('choose_language', currentLanguage), { reply_markup: JSON.stringify(keyboard) });
    },
  },
  {
    name: 'switchmodel',
    description: 'switchmodel_description',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const config = getConfig(bot['env']);
      try {
        console.log('Executing switchmodel command');
        let availableModels = [
          ...config.openaiModels,
          ...config.googleModels,
          ...config.groqModels,
          ...config.claudeModels,
          ...config.azureModels,
        ];

        if (config.openaiCompatibleUrl) {
          const compatibleApi = new OpenAICompatibleAPI(bot['env']);
          const compatibleModels = await compatibleApi.getModels();
          availableModels = [...availableModels, ...compatibleModels];
        }

        console.log('Available models:', availableModels);
        const keyboard = {
          inline_keyboard: availableModels.map(model => [{text: model, callback_data: `model_${model}`}])
        };
        console.log('Sending message with model selection keyboard');
        await bot.sendMessage(chatId, translate('choose_model', language), { reply_markup: JSON.stringify(keyboard) });
        console.log('Message sent successfully');
      } catch (error) {
        console.error('Error in switchmodel command:', error);
        await bot.sendMessage(chatId, translate('error', language) + ': ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    },
  },
  {
    name: 'new',
    description: 'new_description',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      await bot.clearContext(userId);
    },
  },
  {
    name: 'history',
    description: 'history_description',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const summary = await bot.summarizeHistory(userId);
      await bot.sendMessage(chatId, summary || translate('no_history', language));
    },
  },
  {
    name: 'help',
    description: 'help_description',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      let helpMessage = translate('help_intro', language) + '\n\n';
      
      for (const command of commands) {
        const descriptionKey = `${command.name}_description` as TranslationKey;
        helpMessage += `/${command.name} - ${translate(descriptionKey, language)}\n`;
      }
      
      // 添加图片分析功能的说明
      helpMessage += '\n' + translate('image_analysis_description', language);
      
      await bot.sendMessage(chatId, helpMessage);
    },
  },
  {
    name: 'img',
    description: 'img_description',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
  
      if (!args.length) {
        await bot.sendMessageWithFallback(chatId, translate('image_prompt_required', language));
        return;
      }
  
      const validSizes = ['1024x1024', '1024x1792', '1792x1024'];
      const sizeArg = args[args.length - 1].toLowerCase();
      let size: string;
      let prompt: string;
  
      if (validSizes.includes(sizeArg)) {
        size = sizeArg;
        prompt = args.slice(0, -1).join(' ');
      } else {
        size = '1024x1024'; // Default size
        prompt = args.join(' ');
        
        // Check if the last argument looks like a size specification
        if (sizeArg.includes('x') || sizeArg.includes('*')) {
          const sizeOptions = validSizes.map(s => `\`${s}\``).join(', ');
          await bot.sendMessage(chatId, translate('invalid_size', language) + sizeOptions);
          return;
        }
      }
  
      try {
        await sendChatAction(chatId, 'upload_photo', bot['env']);
        const imageApi = new ImageGenerationAPI(bot['env']);
        const imageUrl = await imageApi.generateImage(prompt, size);
        await bot.sendPhoto(chatId, imageUrl, { caption: prompt });
      } catch (error) {
        console.error('Error generating image:', error);
        await bot.sendMessage(chatId, translate('image_generation_error', language));
      }
    },
  },
  {
    name: 'flux',
    description: 'flux_description',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);

      if (!args.length) {
        await bot.sendMessage(chatId, translate('flux_usage', language));
        return;
      }

      let aspectRatio = '1:1'; // 默认比例
      let prompt: string;

      const fluxApi = new FluxAPI(bot['env']);
      const validRatios = fluxApi.getValidAspectRatios();

      if (validRatios.includes(args[args.length - 1])) {
        aspectRatio = args[args.length - 1];
        prompt = args.slice(0, -1).join(' ');
      } else {
        prompt = args.join(' ');
      }

      try {
        await sendChatAction(chatId, 'upload_photo', bot['env']);

        const { imageData, optimizedPrompt } = await fluxApi.generateImage(prompt, aspectRatio);
        
        const config = getConfig(bot['env']);
        let caption = `${translate('original_prompt', language)}: ${prompt}\n`;
        caption += `${translate('image_specs', language)}: ${aspectRatio}\n`;
        
        if (config.promptOptimization && optimizedPrompt) {
          caption += `${translate('prompt_generation_model', language)}: ${config.externalModel || 'Unknown'}\n`;
          caption += `${translate('optimized_prompt', language)}: ${optimizedPrompt}\n`;
        }

        await bot.sendPhoto(chatId, imageData, { caption: caption });
      } catch (error) {
        console.error(`Error generating Flux image for user ${userId}:`, error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
        await bot.sendMessage(chatId, translate('image_generation_error', language));
      }
    },
  },
];
