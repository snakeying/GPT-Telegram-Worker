import { TelegramBot } from '../api/telegram';
import { translate, SupportedLanguages, TranslationKey } from '../utils/i18n';

export interface Command {
  name: string;
  description: string;
  action: (chatId: number, bot: TelegramBot, args: string[]) => Promise<void>;
}

export const commands: Command[] = [
  {
    name: 'start',
    description: 'Start the bot',
    action: async (chatId: number, bot: TelegramBot) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      await bot.sendMessage(chatId, translate('welcome' as TranslationKey, language));
    },
  },
  {
    name: 'language',
    description: 'Set your preferred language',
    action: async (chatId: number, bot: TelegramBot, args: string[]) => {
      const userId = chatId.toString();
      const currentLanguage = await bot.getUserLanguage(userId);
      if (args.length === 0) {
        await bot.sendMessage(chatId, translate('current_language' as TranslationKey, currentLanguage) + currentLanguage);
        await bot.sendMessage(chatId, translate('language_instruction' as TranslationKey, currentLanguage));
        return;
      }

      const newLanguage = args[0].toLowerCase();
      if (['en', 'zh', 'es'].includes(newLanguage)) {
        await bot.setUserLanguage(userId, newLanguage as SupportedLanguages);
        await bot.sendMessage(chatId, translate('language_changed' as TranslationKey, newLanguage as SupportedLanguages));
      } else {
        await bot.sendMessage(chatId, translate('invalid_language' as TranslationKey, currentLanguage));
      }
    },
  },
  {
    name: 'new',
    description: 'Start a new conversation',
    action: async (chatId: number, bot: TelegramBot) => {
      const userId = chatId.toString();
      await bot.clearContext(userId);
    },
  },
  {
    name: 'history',
    description: 'Summarize conversation history',
    action: async (chatId: number, bot: TelegramBot) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const summary = await bot.summarizeHistory(userId);
      await bot.sendMessage(chatId, summary || translate('no_history' as TranslationKey, language));
    },
  },
  // 可以添加更多命令
];