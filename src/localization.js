import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from './config';

import enJson from '../locales/en.json';
import zhCnJson from '../locales/zh-cn.json';
import zhHantJson from '../locales/zh-hant.json';
import jaJson from '../locales/ja.json';
import esJson from '../locales/es.json';
import frJson from '../locales/fr.json';
import ruJson from '../locales/ru.json';
import deJson from '../locales/de.json';

const defaultLanguage = 'en';
export const supportedLanguages = ['en', 'zh-cn', 'zh-hant', 'ja', 'es', 'fr', 'ru', 'de'];

const translations = {
  en: enJson,
  'zh-cn': zhCnJson,
  'zh-hant': zhHantJson,
  ja: jaJson,
  es: esJson,
  fr: frJson,
  ru: ruJson,
  de: deJson
};

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

export async function getUserLanguage(userId) {
  const lang = await redis.get(`user_lang:${userId}`);
  return lang || defaultLanguage;
}

export async function setUserLanguage(userId, language) {
  if (supportedLanguages.includes(language)) {
    await redis.set(`user_lang:${userId}`, language, { ex: 31536000 }); // 1 year TTL
    return true;
  }
  return false;
}

export function translate(key, language, params = {}) {
  let text = translations[language]?.[key] || translations[defaultLanguage][key] || key;
  
  // Replace parameters
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  
  return text;
}

const commandKeys = ['start', 'new', 'history', 'help', 'switchmodel', 'img', 'language'];

export async function getLocalizedCommands(userId) {
  const userLang = await getUserLanguage(userId);
  return commandKeys.map(key => ({
    command: key,
    description: translate(`cmd_${key}`, userLang)
  }));
}