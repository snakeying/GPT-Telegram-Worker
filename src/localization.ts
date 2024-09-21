import { Redis } from '@upstash/redis';
import config from './config';

const defaultLanguage = 'en';
export const supportedLanguages = ['en', 'zh-cn', 'zh-hant', 'ja', 'es', 'fr', 'ru', 'de'];

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

let translations: Translations = {};

// Load all language files
supportedLanguages.forEach(lang => {
  translations[lang] = require(`../locales/${lang}.json`);
});

const redis = new Redis({
  url: config.UPSTASH_REDIS_REST_URL,
  token: config.UPSTASH_REDIS_REST_TOKEN,
});

export async function getUserLanguage(userId: number): Promise<string> {
  const lang = await redis.get(`user_lang:${userId}`);
  return (lang as string | null) || defaultLanguage;
}

export async function setUserLanguage(userId: number, language: string): Promise<boolean> {
  if (supportedLanguages.includes(language)) {
    await redis.set(`user_lang:${userId}`, language, { ex: 31536000 }); // 1 year TTL
    return true;
  }
  return false;
}

export function translate(key: string, language: string, params: Record<string, string | number> = {}): string {
  let text = translations[language]?.[key] || translations[defaultLanguage][key] || key;
  
  // Replace parameters
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, String(params[param]));
  });
  
  return text;
}

const commandKeys = ['start', 'new', 'history', 'help', 'switchmodel', 'img', 'language'];

export async function getLocalizedCommands(userId: number): Promise<Array<{ command: string; description: string }>> {
  const userLang = await getUserLanguage(userId);
  return commandKeys.map(key => ({
    command: key,
    description: translate(`cmd_${key}`, userLang)
  }));
}