export type SupportedLanguages = 'en' | 'zh' | 'es';

export interface Translations {
  welcome: string;
  unauthorized: string;
  error: string;
  current_language: string;
  language_instruction: string;
  language_changed: string;
  invalid_language: string;
}

export type TranslationKey = keyof Translations;

type TranslationsMap = Record<SupportedLanguages, Translations>;

const translations: TranslationsMap = {
  en: {
    welcome: "Welcome to the GPT Telegram Bot!",
    unauthorized: "Sorry, you're not authorized to use this bot.",
    error: "An error occurred. Please try again.",
    current_language: "Your current language is: English",
    language_instruction: "To change the language, use /language followed by en, zh, or es.",
    language_changed: "Language has been changed to: ",
    invalid_language: "Invalid language. Please use en, zh, or es.",
  },
  zh: {
    welcome: "欢迎使用 GPT Telegram 机器人！",
    unauthorized: "抱歉，您无权使用此机器人。",
    error: "发生错误，请重试。",
    current_language: "您当前的语言是： 简体中文",
    language_instruction: "要更改语言，请使用 /language 后跟 en、zh 或 es。",
    language_changed: "语言已更改为：",
    invalid_language: "无效的语言，请使用 en、zh 或 es。",
  },
  es: {
    welcome: "¡Bienvenido al bot de GPT en Telegram!",
    unauthorized: "Lo siento, no estás autorizado para usar este bot.",
    error: "Ocurrió un error. Por favor, inténtalo de nuevo.",
    current_language: "Tu idioma actual es: Español",
    language_instruction: "Para cambiar el idioma, usa /language seguido de en, zh o es.",
    language_changed: "El idioma ha sido cambiado a: ",
    invalid_language: "Idioma no válido. Usa en, zh o es.",
  }
};

export function translate(key: TranslationKey, language: SupportedLanguages = 'en'): string {
  return translations[language][key] || translations['en'][key];
}