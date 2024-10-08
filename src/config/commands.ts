import { TelegramBot } from '../api/telegram';
import { translate, TranslationKey } from '../utils/i18n';
import { ImageGenerationAPI } from '../api/image_generation';
import { sendChatAction } from '../utils/helpers';
import { FluxAPI } from '../api/flux-cf';

export interface Command {
  name: string;
  description: string;
  action: (chatId: number, bot: TelegramBot, args: string[]) => Promise<void>;
}

export const commands: Command[] = [
  {
    name: 'start',
    description: 'Start the bot',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const currentModel = await bot.getCurrentModel(userId);
      const welcomeMessage = translate('welcome', language) + '\n' + 
                             translate('current_model', language) + currentModel;
      await bot.sendMessage(chatId, welcomeMessage);
    },
  },
  {
    name: 'language',
    description: 'Set your preferred language',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const currentLanguage = await bot.getUserLanguage(userId);
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🇺🇸 English', callback_data: 'lang_en' },
            { text: '🇨🇳 中文', callback_data: 'lang_zh' },
            { text: '🇪🇸 Español', callback_data: 'lang_es' }
          ]
        ]
      };
      await bot.sendMessage(chatId, translate('choose_language', currentLanguage), { reply_markup: JSON.stringify(keyboard) });
    },
  },
  {
    name: 'switchmodel',
    description: 'Switch the current model',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const availableModels = bot.getAvailableModels();
      const keyboard = {
        inline_keyboard: availableModels.map(model => [{text: model, callback_data: `model_${model}`}])
      };
      await bot.sendMessage(chatId, translate('choose_model', language), { reply_markup: JSON.stringify(keyboard) });
    },
  },
  {
    name: 'new',
    description: 'Start a new conversation',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      await bot.clearContext(userId);
    },
  },
  {
    name: 'history',
    description: 'Summarize conversation history',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const summary = await bot.summarizeHistory(userId);
      await bot.sendMessage(chatId, summary || translate('no_history', language));
    },
  },
  {
    name: 'help',
    description: 'Show available commands and their descriptions',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      let helpMessage = translate('help_intro', language) + '\n\n';
      
      for (const command of commands) {
        const descriptionKey = `${command.name}_description` as TranslationKey;
        helpMessage += `/${command.name} - ${translate(descriptionKey, language)}\n`;
      }
      
      await bot.sendMessage(chatId, helpMessage);
    },
  },
  {
    name: 'img',
    description: 'Generate an image using DALL·E',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
  
      if (!args.length) {
        await bot.sendMessage(chatId, translate('image_prompt_required', language));
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
    description: 'Generate an image using Flux',
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
        console.log(`Starting Flux image generation for user ${userId}`);
        await sendChatAction(chatId, 'upload_photo', bot['env']);

        console.log(`Calling Flux API with prompt: ${prompt} and aspect ratio: ${aspectRatio}`);
        const imageData = await fluxApi.generateImage(prompt, aspectRatio);
        console.log(`Received image data from Flux API (length: ${imageData.length})`);
        
        // Send photo using Uint8Array data
        await bot.sendPhoto(chatId, imageData, { caption: `${prompt} (${aspectRatio})` });
        console.log(`Successfully sent Flux image to user ${userId}`);
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