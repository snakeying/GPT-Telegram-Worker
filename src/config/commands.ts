import { TelegramBot } from '../api/telegram';
import { translate, SupportedLanguages } from '../utils/i18n';

export interface Command {
  name: string;
  description: string;
  action: (chatId: number, bot: TelegramBot) => Promise<void>;
}

export const commands: Command[] = [
  {
    name: 'start',
    description: 'Start the bot',
    action: async (chatId: number, bot: TelegramBot) => {
      const language = 'en'; // You might want to get the user's language here
      await bot.sendMessage(chatId, translate('welcome', language));
    },
  },
  // Add more commands here as needed
];