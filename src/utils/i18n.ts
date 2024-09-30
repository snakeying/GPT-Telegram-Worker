export type SupportedLanguages = 'en' | 'zh' | 'es';

export interface Translations {
  welcome: string;
  unauthorized: string;
  error: string;
  current_language: string;
  language_instruction: string;
  language_changed: string;
  invalid_language: string;
  new_conversation: string;
  no_history: string;
  history_summary: string;
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
    new_conversation: "Starting a new conversation. Previous context has been cleared.",
    no_history: "No conversation history found.",
    history_summary: "Here's a summary of your conversation history:",
  },
  zh: {
    welcome: "欢迎使用 GPT Telegram 机器人！",
    unauthorized: "抱歉，您无权使用此机器人。",
    error: "发生错误，请重试。",
    current_language: "您当前的语言是： 简体中文",
    language_instruction: "要更改语言，请使用 /language 后跟 en、zh 或 es。",
    language_changed: "语言已更改为：",
    invalid_language: "无效的语言，请使用 en、zh 或 es。",
    new_conversation: "开始新的对话。之前的上下文已被清除。",
    no_history: "未找到对话历史。",
    history_summary: "以下是您的对话历史摘要：",
  },
  es: {
    welcome: "¡Bienvenido al bot de GPT en Telegram!",
    unauthorized: "Lo siento, no estás autorizado para usar este bot.",
    error: "Ocurrió un error. Por favor, inténtalo de nuevo.",
    current_language: "Tu idioma actual es: Español",
    language_instruction: "Para cambiar el idioma, usa /language seguido de en, zh o es.",
    language_changed: "El idioma ha sido cambiado a: ",
    invalid_language: "Idioma no válido. Usa en, zh o es.",
    new_conversation: "Iniciando una nueva conversación. El contexto anterior ha sido borrado.",
    no_history: "No se encontró historial de conversación.",
    history_summary: "Aquí tienes un resumen de tu historial de conversación:",
  }
};

export function translate(key: TranslationKey, language: SupportedLanguages = 'en'): string {
  return translations[language][key] || translations['en'][key];
}