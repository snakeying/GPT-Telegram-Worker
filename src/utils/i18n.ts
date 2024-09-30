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
  current_model: string;
  available_models: string;
  model_changed: string;
  invalid_model: string;
  help_intro: string;
  start_description: string;
  language_description: string;
  new_description: string;
  history_description: string;
  switchmodel_description: string;
  help_description: string;
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
    current_model: "Your current model is: ",
    available_models: "Available models: ",
    model_changed: "Model has been changed to: ",
    invalid_model: "Invalid model. Please choose from the available models.",
    help_intro: "Here are the available commands:",
    start_description: "Start the bot",
    language_description: "Set your preferred language",
    new_description: "Start a new conversation",
    history_description: "Summarize conversation history",
    switchmodel_description: "Switch the current model",
    help_description: "Show available commands and their descriptions",
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
    current_model: "您当前使用的模型是：",
    available_models: "可用的模型：",
    model_changed: "模型已更改为：",
    invalid_model: "无效的模型。请从可用模型中选择。",
    help_intro: "以下是可用的命令：",
    start_description: "启动机器人",
    language_description: "设置您的首选语言",
    new_description: "开始新的对话",
    history_description: "总结对话历史",
    switchmodel_description: "切换当前模型",
    help_description: "显示可用命令及其描述",
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
    current_model: "Tu modelo actual es: ",
    available_models: "Modelos disponibles: ",
    model_changed: "El modelo ha sido cambiado a: ",
    invalid_model: "Modelo no válido. Por favor, elige entre los modelos disponibles.",
    help_intro: "Estos son los comandos disponibles:",
    start_description: "Iniciar el bot",
    language_description: "Establecer tu idioma preferido",
    new_description: "Iniciar una nueva conversación",
    history_description: "Resumir el historial de conversación",
    switchmodel_description: "Cambiar el modelo actual",
    help_description: "Mostrar comandos disponibles y sus descripciones",
  }
};

export function translate(key: TranslationKey, language: SupportedLanguages = 'en'): string {
  return translations[language][key] || translations['en'][key];
}