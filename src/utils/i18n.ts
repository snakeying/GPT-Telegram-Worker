export type SupportedLanguages = 'en' | 'zh' | 'es';

interface Translations {
  welcome: string;
  unauthorized: string;
  error: string;
}

const translations: Record<SupportedLanguages, Translations> = {
  en: {
    welcome: "Welcome to the GPT Telegram Bot! I'm here to assist you with any questions or tasks. Feel free to ask me anything!",
    unauthorized: "Sorry, you're not authorized to use this bot.",
    error: "Sorry, I couldn't generate a response. Please try again later.",
  },
  zh: {
    welcome: "欢迎使用GPT Telegram机器人！我随时为您解答问题或协助完成任务。请随意问我任何问题！",
    unauthorized: "抱歉，您没有权限使用此机器人。",
    error: "抱歉，我无法生成回复。请稍后再试。",
  },
  es: {
    welcome: "¡Bienvenido al Bot de Telegram GPT! Estoy aquí para ayudarte con cualquier pregunta o tarea. ¡Siéntete libre de preguntarme cualquier cosa!",
    unauthorized: "Lo siento, no estás autorizado para usar este bot.",
    error: "Lo siento, no pude generar una respuesta. Por favor, inténtalo de nuevo más tarde.",
  },
};

export function translate(key: keyof Translations, language: SupportedLanguages = 'en'): string {
  return translations[language]?.[key] || translations['en'][key];
}