export type SupportedLanguages = 'en' | 'zh' | 'es';

export interface Translations {
  welcome: string;
  unauthorized: string;
  error: string;
  current_language: string;
  language_changed: string;
  new_conversation: string;
  no_history: string;
  history_summary: string;
  current_model: string;
  available_models: string;
  model_changed: string;
  help_intro: string;
  start_description: string;
  language_description: string;
  new_description: string;
  history_description: string;
  switchmodel_description: string;
  help_description: string;
  choose_language: string;
  choose_model: string;
  language_en: string;
  language_zh: string;
  language_es: string;
  image_prompt_required: string;
  image_generation_error: string;
  img_description: string;
  invalid_size: string;
  flux_description: string;
  flux_usage: string;
  invalid_aspect_ratio: string;
  original_prompt: string;
  prompt_generation_model: string;
  optimized_prompt: string;
  image_specs: string;
}

export type TranslationKey = keyof Translations;

type TranslationsMap = Record<SupportedLanguages, Translations>;

const translations: TranslationsMap = {
  en: {
    welcome: "Welcome to the GPT Telegram Bot!",
    unauthorized: "Sorry, you're not authorized to use this bot.",
    error: "An error occurred. Please try again.",
    current_language: "Your current language is: English",
    language_changed: "Language has been changed to: ",
    new_conversation: "Starting a new conversation. Previous context has been cleared.",
    no_history: "No conversation history found.",
    history_summary: "Here's a summary of your conversation history:",
    current_model: "Your current model is: ",
    available_models: "Available models: ",
    model_changed: "Model has been changed to: ",
    help_intro: "Here are the available commands:",
    start_description: "Start the bot",
    language_description: "Set your preferred language",
    new_description: "Start a new conversation",
    history_description: "Summarize conversation history",
    switchmodel_description: "Switch the current model",
    help_description: "Show available commands and their descriptions",
    choose_language: "Please choose your preferred language:",
    choose_model: "Please choose a model:",
    language_en: "English",
    language_zh: "Chinese",
    language_es: "Spanish",
    image_prompt_required: 'Please provide a description for the image you want to generate.',
    image_generation_error: 'Sorry, there was an error generating the image. Please try again later.',
    img_description: 'Generate an image using DALL·E. Format: /img <description> [size]',
    invalid_size: 'Invalid image size. Please use one of the following sizes: ',
    flux_description: 'Generate an image using Flux',
    flux_usage: 'Usage: /flux <description> [aspect ratio]. Valid aspect ratios are: 1:1 (default), 1:2, 3:2, 3:4, 16:9, 9:16',
    invalid_aspect_ratio: 'Invalid aspect ratio. Valid options are: ',
    original_prompt: "🎨 Original Prompt",
    prompt_generation_model: "💬 Prompt Generation Model",
    optimized_prompt: "🌐 Optimized Prompt",
    image_specs: "📐 Image Specifications",
  },
  zh: {
    welcome: "欢迎使用 GPT Telegram 机器人！",
    unauthorized: "抱歉，您无权使用此机器人。",
    error: "发生错误，请重试。",
    current_language: "您当前的语言是：中文",
    language_changed: "语言已更改为：",
    new_conversation: "开始新的对话。之前的上下文已被清除。",
    no_history: "未找到对话历史。",
    history_summary: "以下是您的对话历史摘要：",
    current_model: "您当前使用的模型是：",
    available_models: "可用的模型：",
    model_changed: "模型已更改为：",
    help_intro: "以下是可用的命令：",
    start_description: "启动机器人",
    language_description: "设置您的首选语言",
    new_description: "开始新的对话",
    history_description: "总结对话历史",
    switchmodel_description: "切换当前模型",
    help_description: "显示可用命令及其描述",
    choose_language: "请选择您偏好的语言：",
    choose_model: "请选择一个模型：",
    language_en: "英语",
    language_zh: "中文",
    language_es: "西班牙语",
    image_prompt_required: '请提供您想要生成的图像描述。',
    image_generation_error: '抱歉，生成图像时出错。请稍后再试。',
    img_description: '使用 DALL·E 生成图像。格式：/img <描述> [尺寸]',
    invalid_size: '无效的图片尺寸。请使用以下尺寸之一：',
    flux_description: '使用 Flux 生成图像',
    flux_usage: '用法：/flux <描述> [宽高比]。有效的宽高比有：1:1（默认）, 1:2, 3:2, 3:4, 16:9, 9:16',
    invalid_aspect_ratio: '无效的宽高比。有效选项为：',
    original_prompt: "🎨 原始提示词",
    prompt_generation_model: "💬 提示词生成模型",
    optimized_prompt: "🌐 优化后的提示词",
    image_specs: "📐 图像规格",
  },
  es: {
    welcome: "¡Bienvenido al bot de GPT en Telegram!",
    unauthorized: "Lo siento, no estás autorizado para usar este bot.",
    error: "Ocurrió un error. Por favor, inténtalo de nuevo.",
    current_language: "Tu idioma actual es: Español",
    language_changed: "El idioma ha sido cambiado a: ",
    new_conversation: "Iniciando una nueva conversación. El contexto anterior ha sido borrado.",
    no_history: "No se encontró historial de conversación.",
    history_summary: "Aquí tienes un resumen de tu historial de conversación:",
    current_model: "Tu modelo actual es: ",
    available_models: "Modelos disponibles: ",
    model_changed: "El modelo ha sido cambiado a: ",
    help_intro: "Estos son los comandos disponibles:",
    start_description: "Iniciar el bot",
    language_description: "Establecer tu idioma preferido",
    new_description: "Iniciar una nueva conversación",
    history_description: "Resumir el historial de conversación",
    switchmodel_description: "Cambiar el modelo actual",
    help_description: "Mostrar comandos disponibles y sus descripciones",
    choose_language: "Por favor, elige tu idioma preferido:",
    choose_model: "Por favor, elige un modelo:",
    language_en: "Inglés",
    language_zh: "Chino",
    language_es: "Español",
    image_prompt_required: 'Por favor, proporcione una descripción para la imagen que desea generar.',
    image_generation_error: 'Lo siento, hubo un error al generar la imagen. Por favor, inténtelo de nuevo más tarde.',
    img_description: 'Generar una imagen usando DALL·E. Formato: /img <descripción> [tamaño]',
    invalid_size: 'Tamaño de imagen no válido. Por favor, use uno de los siguientes tamaños: ',
    flux_description: 'Generar una imagen usando Flux',
    flux_usage: 'Uso: /flux <descripción> [relación de aspecto]. Las relaciones de aspecto válidas son: 1:1 (predeterminado), 1:2, 3:2, 3:4, 16:9, 9:16',
    invalid_aspect_ratio: 'Relación de aspecto no válida. Las opciones válidas son: ',
    original_prompt: "🎨 Prompt Original",
    prompt_generation_model: "💬 Modelo de Generación de Prompts",
    optimized_prompt: "🌐 Prompt Optimizado",
    image_specs: "📐 Especificaciones de la Imagen",
  }
};

export function translate(key: TranslationKey, language: SupportedLanguages = 'en'): string {
  return translations[language][key] || translations['en'][key];
}