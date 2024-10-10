// src/env.ts
var getEnvOrDefault = (env, key, defaultValue) => {
  return env[key] || defaultValue;
};
var getConfig = (env) => {
  const hasOpenAI = !!env.OPENAI_API_KEY;
  const hasGoogle = !!env.GOOGLE_MODEL_KEY;
  const hasGroq = !!env.GROQ_API_KEY;
  const hasClaude = !!env.CLAUDE_API_KEY;
  const hasAzure = !!env.AZURE_API_KEY;
  if (!hasOpenAI && !hasGoogle && !hasGroq && !hasClaude && !hasAzure) {
    throw new Error("At least one model API key must be set (OpenAI, Google, Groq, Claude, or Azure)");
  }
  return {
    openaiApiKey: env.OPENAI_API_KEY,
    openaiBaseUrl: getEnvOrDefault(env, "OPENAI_BASE_URL", "https://api.openai.com/v1"),
    openaiModels: env.OPENAI_MODELS ? env.OPENAI_MODELS.split(",").map((model) => model.trim()) : [],
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    whitelistedUsers: env.WHITELISTED_USERS ? env.WHITELISTED_USERS.split(",").map((id) => id.trim()) : [],
    systemInitMessage: getEnvOrDefault(env, "SYSTEM_INIT_MESSAGE", "You are a helpful assistant."),
    systemInitMessageRole: getEnvOrDefault(env, "SYSTEM_INIT_MESSAGE_ROLE", "system"),
    defaultModel: env.DEFAULT_MODEL,
    upstashRedisRestUrl: env.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: env.UPSTASH_REDIS_REST_TOKEN,
    dallEModel: getEnvOrDefault(env, "DALL_E_MODEL", "dall-e-3"),
    languageTTL: 60 * 60 * 24 * 365,
    contextTTL: 60 * 60 * 24 * 30,
    cloudflareApiToken: env.CLOUDFLARE_API_TOKEN,
    cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
    fluxSteps: parseInt(getEnvOrDefault(env, "FLUX_STEPS", "4")),
    promptOptimization: getEnvOrDefault(env, "PROMPT_OPTIMIZATION", "false") === "true",
    externalApiBase: env.EXTERNAL_API_BASE,
    externalModel: env.EXTERNAL_MODEL,
    externalApiKey: env.EXTERNAL_API_KEY,
    googleModelKey: env.GOOGLE_MODEL_KEY,
    googleModelBaseUrl: getEnvOrDefault(env, "GOOGLE_MODEL_BASEURL", "https://generativelanguage.googleapis.com/v1beta"),
    googleModels: env.GOOGLE_MODELS ? env.GOOGLE_MODELS.split(",").map((model) => model.trim()) : [],
    groqApiKey: env.GROQ_API_KEY,
    groqModels: env.GROQ_MODELS ? env.GROQ_MODELS.split(",").map((model) => model.trim()) : [],
    claudeApiKey: env.CLAUDE_API_KEY,
    claudeModels: env.CLAUDE_MODELS ? env.CLAUDE_MODELS.split(",").map((model) => model.trim()) : [],
    claudeEndpoint: getEnvOrDefault(env, "CLAUDE_ENDPOINT", "https://api.anthropic.com/v1"),
    azureApiKey: env.AZURE_API_KEY,
    azureModels: env.AZURE_MODELS ? env.AZURE_MODELS.split(",").map((model) => model.trim()) : [],
    azureEndpoint: env.AZURE_ENDPOINT
  };
};

// src/api/openai_api.ts
var OpenAIAPI = class {
  apiKey;
  baseUrl;
  models;
  defaultModel;
  constructor(env) {
    const config = getConfig(env);
    this.apiKey = config.openaiApiKey;
    this.baseUrl = config.openaiBaseUrl;
    this.models = config.openaiModels;
    this.defaultModel = config.defaultModel || this.models[0];
  }
  async generateResponse(messages, model) {
    const url = `${this.baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: model || this.defaultModel,
        messages
      })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
  isValidModel(model) {
    return this.models.includes(model);
  }
  getDefaultModel() {
    return this.defaultModel;
  }
  getAvailableModels() {
    return this.models;
  }
};
var openai_api_default = OpenAIAPI;

// src/utils/helpers.ts
function formatCodeBlock(code, language) {
  return `\`\`\`${language}
${code}
\`\`\``;
}
function splitMessage(text, maxLength = 4096) {
  const messages = [];
  let currentMessage = "";
  const lines = text.split("\n");
  for (const line of lines) {
    if (currentMessage.length + line.length + 1 > maxLength) {
      messages.push(currentMessage.trim());
      currentMessage = "";
    }
    currentMessage += line + "\n";
  }
  if (currentMessage.trim()) {
    messages.push(currentMessage.trim());
  }
  return messages;
}
async function sendChatAction(chatId, action, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendChatAction`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      action
    })
  });
}

// src/utils/i18n.ts
var translations = {
  en: {
    welcome: "\u{1F44B} Hey there! Welcome to your personal AI assistant bot!",
    unauthorized: "\u{1F6AB} Oops! Looks like you don't have access to this bot yet.",
    error: "\u{1F605} Whoops! Something went wrong. Wanna give it another shot?",
    current_language: "\u{1F30D} You're currently chatting in English",
    language_changed: "\u{1F389} Awesome! Your language is now set to: ",
    new_conversation: "\u{1F195} Alright, let's start fresh! I've cleared our previous chat.",
    no_history: "\u{1F914} Hmm... Looks like we haven't chatted before.",
    history_summary: "\u{1F4DC} Here's a quick recap of our previous chats:",
    current_model: "\u{1F916} You're currently using this AI model: ",
    available_models: "\u{1F522} Check out all these cool models we have: ",
    model_changed: "\u{1F504} Model swap successful! We're now using: ",
    help_intro: "\u{1F9ED} Here's what I can do for you:",
    start_description: "\u{1F680} Say hi and let's start chatting",
    language_description: "\u{1F5E3}\uFE0F Want to switch languages? Use this",
    new_description: "\u{1F504} Start a brand new conversation",
    history_description: "\u{1F4DA} Take a look at what we've chatted about",
    switchmodel_description: "\u{1F500} Try a different AI model",
    help_description: "\u2753 See all available commands",
    choose_language: "\u{1F310} Which language would you like to chat in?",
    choose_model: "\u{1F916} Pick an AI model to chat with:",
    language_en: "\u{1F1EC}\u{1F1E7} English",
    language_zh: "\u{1F1E8}\u{1F1F3} Chinese",
    language_es: "\u{1F1EA}\u{1F1F8} Spanish",
    "language_zh-TW": "\u{1F1F9}\u{1F1FC} Chinese (Traditional)",
    // 修改这里
    language_ja: "\u{1F1EF}\u{1F1F5} Japanese",
    language_de: "\u{1F1E9}\u{1F1EA} German",
    language_fr: "\u{1F1EB}\u{1F1F7} French",
    language_ru: "\u{1F1F7}\u{1F1FA} Russian",
    image_prompt_required: "\u{1F5BC}\uFE0F To create an image, tell me what you'd like to see!",
    image_generation_error: "\u{1F61E} Uh-oh, there was a hiccup creating the image. Mind trying again?",
    img_description: "\u{1F3A8} Create amazing images with DALL\xB7E",
    invalid_size: "\u{1F4CF} Oops, that size doesn't work. How about trying one of these: ",
    flux_description: "\u{1F5BC}\uFE0F Create beautiful images using Flux",
    flux_usage: "\u{1F4DD} Here's how to use it: /flux <description> [aspect ratio]. You can choose from these ratios: 1:1 (default), 1:2, 3:2, 3:4, 16:9, 9:16",
    invalid_aspect_ratio: "\u{1F522} That aspect ratio isn't quite right. You can pick from these: ",
    original_prompt: "\u{1F3A8} Original Description",
    prompt_generation_model: "\u{1F4AC} Prompt Generation Model",
    optimized_prompt: "\u{1F310} Enhanced Description",
    image_specs: "\u{1F4D0} Image Details",
    command_not_found: "\u2753 Hmm, I don't know that command. Type /help to see what I can do!"
  },
  zh: {
    welcome: "\u{1F44B} \u563F\uFF0C\u6B22\u8FCE\u4F7F\u7528\u4F60\u7684\u4E13\u5C5E\u52A9\u624B\u673A\u5668\u4EBA\uFF01",
    unauthorized: "\u{1F6AB} \u62B1\u6B49\uFF0C\u60A8\u8FD8\u6CA1\u6709\u6743\u9650\u4F7F\u7528\u8FD9\u4E2A\u673A\u5668\u4EBA\u54E6\u3002",
    error: "\u{1F605} \u54CE\u5440\uFF0C\u51FA\u4E86\u70B9\u5C0F\u95EE\u9898\u3002\u8981\u4E0D\u8981\u518D\u8BD5\u4E00\u6B21\uFF1F",
    current_language: "\u{1F30D} \u60A8\u5F53\u524D\u7684\u8BED\u8A00\u8BBE\u7F6E\u662F\uFF1A\u4E2D\u6587",
    language_changed: "\u{1F389} \u592A\u597D\u4E86\uFF01\u8BED\u8A00\u5DF2\u7ECF\u5207\u6362\u4E3A\uFF1A",
    new_conversation: "\u{1F195} \u597D\u7684\uFF0C\u8BA9\u6211\u4EEC\u5F00\u59CB\u4E00\u6BB5\u5168\u65B0\u7684\u5BF9\u8BDD\u5427\uFF01\u4E4B\u524D\u7684\u804A\u5929\u8BB0\u5F55\u5DF2\u7ECF\u6E05\u9664\u5566\u3002",
    no_history: "\u{1F914} \u55EF...\u770B\u8D77\u6765\u6211\u4EEC\u8FD8\u6CA1\u6709\u804A\u8FC7\u5929\u5462\u3002",
    history_summary: "\u{1F4DC} \u6765\u56DE\u987E\u4E00\u4E0B\u6211\u4EEC\u4E4B\u524D\u804A\u4E86\u4E9B\u4EC0\u4E48\uFF1A",
    current_model: "\u{1F916} \u60A8\u73B0\u5728\u4F7F\u7528\u7684 AI \u6A21\u578B\u662F\uFF1A",
    available_models: "\u{1F522} \u54C7\uFF0C\u6211\u4EEC\u6709\u8FD9\u4E48\u591A\u6A21\u578B\u53EF\u4EE5\u9009\u62E9\uFF1A",
    model_changed: "\u{1F504} \u6362\u6A21\u578B\u6210\u529F\uFF01\u73B0\u5728\u6211\u4EEC\u4F7F\u7528\u7684\u662F\uFF1A",
    help_intro: "\u{1F9ED} \u6765\u770B\u770B\u6211\u90FD\u80FD\u505A\u4E9B\u4EC0\u4E48\u5427\uFF1A",
    start_description: "\u{1F680} \u548C\u6211\u6253\u4E2A\u62DB\u547C\uFF0C\u5F00\u59CB\u804A\u5929",
    language_description: "\u{1F5E3}\uFE0F \u60F3\u6362\u4E2A\u8BED\u8A00\uFF1F\u7528\u8FD9\u4E2A",
    new_description: "\u{1F504} \u5F00\u59CB\u5168\u65B0\u7684\u5BF9\u8BDD",
    history_description: "\u{1F4DA} \u56DE\u987E\u4E00\u4E0B\u6211\u4EEC\u4E4B\u524D\u804A\u4E86\u4EC0\u4E48",
    switchmodel_description: "\u{1F500} \u6362\u4E2A\u6A21\u578B\u6765\u804A\u5929",
    help_description: "\u2753 \u67E5\u770B\u6240\u6709\u53EF\u7528\u7684\u547D\u4EE4",
    choose_language: "\u{1F310} \u4F60\u60F3\u7528\u54EA\u79CD\u8BED\u8A00\u548C\u6211\u804A\u5929\u5462\uFF1F",
    choose_model: "\u{1F916} \u6765\u9009\u62E9\u4E00\u4E2A AI \u6A21\u578B\u5427\uFF1A",
    language_en: "\u{1F1EC}\u{1F1E7} \u82F1\u8BED",
    language_zh: "\u{1F1E8}\u{1F1F3} \u7B80\u4F53\u4E2D\u6587",
    language_es: "\u{1F1EA}\u{1F1F8} \u897F\u73ED\u7259\u8BED",
    "language_zh-TW": "\u{1F1F9}\u{1F1FC} Chinese (Traditional)",
    // 修改这里
    language_ja: "\u{1F1EF}\u{1F1F5} Japanese",
    language_de: "\u{1F1E9}\u{1F1EA} German",
    language_fr: "\u{1F1EB}\u{1F1F7} French",
    language_ru: "\u{1F1F7}\u{1F1FA} Russian",
    image_prompt_required: "\u{1F5BC}\uFE0F To create an image, tell me what you'd like to see!",
    image_generation_error: "\u{1F61E} Uh-oh, there was a hiccup creating the image. Mind trying again?",
    img_description: "\u{1F3A8} Create amazing images with DALL\xB7E",
    invalid_size: "\u{1F4CF} Oops, that size doesn't work. How about trying one of these: ",
    flux_description: "\u{1F5BC}\uFE0F Create beautiful images using Flux",
    flux_usage: "\u{1F4DD} Here's how to use it: /flux <description> [aspect ratio]. You can choose from these ratios: 1:1 (default), 1:2, 3:2, 3:4, 16:9, 9:16",
    invalid_aspect_ratio: "\u{1F522} That aspect ratio isn't quite right. You can pick from these: ",
    original_prompt: "\u{1F3A8} Original Description",
    prompt_generation_model: "\u{1F4AC} Prompt Generation Model",
    optimized_prompt: "\u{1F310} Enhanced Description",
    image_specs: "\u{1F4D0} Image Details",
    command_not_found: "\u2753 Hmm, I don't know that command. Type /help to see what I can do!"
  },
  es: {
    welcome: "\u{1F44B} \xA1Hola! \xA1Bienvenido a tu bot asistente personal con IA!",
    unauthorized: "\u{1F6AB} \xA1Ups! Parece que a\xFAn no tienes acceso a este bot.",
    error: "\u{1F605} \xA1Vaya! Algo sali\xF3 mal. \xBFQuieres intentarlo de nuevo?",
    current_language: "\u{1F30D} Est\xE1s chateando en espa\xF1ol",
    language_changed: "\u{1F389} \xA1Genial! Tu idioma ahora es: ",
    new_conversation: "\u{1F195} \xA1Perfecto, empecemos de cero! He borrado nuestra charla anterior.",
    no_history: "\u{1F914} Mmm... Parece que a\xFAn no hemos charlado.",
    history_summary: "\u{1F4DC} Aqu\xED tienes un resumen de nuestras conversaciones anteriores:",
    current_model: "\u{1F916} Est\xE1s usando este modelo de IA: ",
    available_models: "\u{1F522} Mira todos estos modelos geniales que tenemos: ",
    model_changed: "\u{1F504} \xA1Cambio de modelo exitoso! Ahora estamos usando: ",
    help_intro: "\u{1F9ED} Esto es lo que puedo hacer por ti:",
    start_description: "\u{1F680} Saluda y empecemos a charlar",
    language_description: "\u{1F5E3}\uFE0F \xBFQuieres cambiar de idioma? Usa esto",
    new_description: "\u{1F504} Iniciar una conversaci\xF3n totalmente nueva",
    history_description: "\u{1F4DA} Echa un vistazo a lo que hemos hablado",
    switchmodel_description: "\u{1F500} Prueba un modelo de IA diferente",
    help_description: "\u2753 Ver todos los comandos disponibles",
    choose_language: "\u{1F310} \xBFEn qu\xE9 idioma te gustar\xEDa chatear?",
    choose_model: "\u{1F916} Elige un modelo de IA para charlar:",
    language_en: "\u{1F1EC}\u{1F1E7} Ingl\xE9s",
    language_zh: "\u{1F1E8}\u{1F1F3} Chino",
    language_es: "\u{1F1EA}\u{1F1F8} Espa\xF1ol",
    "language_zh-TW": "\u{1F1F9}\u{1F1FC} Chinese (Traditional)",
    // 修改这里
    language_ja: "\u{1F1EF}\u{1F1F5} Japanese",
    language_de: "\u{1F1E9}\u{1F1EA} German",
    language_fr: "\u{1F1EB}\u{1F1F7} French",
    language_ru: "\u{1F1F7}\u{1F1FA} Russian",
    image_prompt_required: "\u{1F5BC}\uFE0F Para crear una imagen, \xA1dime qu\xE9 te gustar\xEDa ver!",
    image_generation_error: "\u{1F61E} Vaya, hubo un problemilla al crear la imagen. \xBFTe importar\xEDa intentarlo de nuevo?",
    img_description: "\u{1F3A8} Crea im\xE1genes incre\xEDbles con DALL\xB7E",
    invalid_size: "\u{1F4CF} Ups, ese tama\xF1o no funciona. \xBFQu\xE9 tal si pruebas uno de estos?: ",
    flux_description: "\u{1F5BC}\uFE0F Crea hermosas im\xE1genes usando Flux",
    flux_usage: "\u{1F4DD} As\xED es como se usa: /flux <descripci\xF3n> [relaci\xF3n de aspecto]. Puedes elegir entre estas relaciones: 1:1 (predeterminado), 1:2, 3:2, 3:4, 16:9, 9:16",
    invalid_aspect_ratio: "\u{1F522} Esa relaci\xF3n de aspecto no es correcta. Puedes elegir entre estas: ",
    original_prompt: "\u{1F3A8} Descripci\xF3n Original",
    prompt_generation_model: "\u{1F4AC} Modelo de Generaci\xF3n de Prompts",
    optimized_prompt: "\u{1F310} Descripci\xF3n Mejorada",
    image_specs: "\u{1F4D0} Detalles de la Imagen",
    command_not_found: "\u2753 Mmm, no conozco ese comando. \xA1Escribe /help para ver lo que puedo hacer!"
  },
  "zh-TW": {
    welcome: "\u{1F44B} \u563F\uFF0C\u6B61\u8FCE\u4F7F\u7528\u4F60\u7684\u5C08\u5C6C\u52A9\u624B\u6A5F\u5668\u4EBA\uFF01",
    unauthorized: "\u{1F6AB} \u62B1\u6B49\uFF0C\u60A8\u9084\u6C92\u6709\u6B0A\u9650\u4F7F\u7528\u9019\u500B\u6A5F\u5668\u4EBA\u5594\u3002",
    error: "\u{1F605} \u54CE\u5440\uFF0C\u51FA\u4E86\u9EDE\u5C0F\u554F\u984C\u3002\u8981\u4E0D\u8981\u518D\u8A66\u4E00\u6B21\uFF1F",
    current_language: "\u{1F30D} \u60A8\u7576\u524D\u7684\u8A9E\u8A00\u8A2D\u7F6E\u662F\uFF1A\u7E41\u9AD4\u4E2D\u6587",
    language_changed: "\u{1F389} \u592A\u597D\u4E86\uFF01\u8A9E\u8A00\u5DF2\u7D93\u5207\u63DB\u70BA\uFF1A",
    new_conversation: "\u{1F195} \u597D\u7684\uFF0C\u8B93\u6211\u5011\u958B\u59CB\u4E00\u6BB5\u5168\u65B0\u7684\u5C0D\u8A71\u5427\uFF01\u4E4B\u524D\u7684\u804A\u5929\u8A18\u9304\u5DF2\u7D93\u6E05\u9664\u5566\u3002",
    no_history: "\u{1F914} \u55EF...\u770B\u8D77\u4F86\u6211\u5011\u9084\u6C92\u6709\u804A\u904E\u5929\u5462\u3002",
    history_summary: "\u{1F4DC} \u4F86\u56DE\u9867\u4E00\u4E0B\u6211\u5011\u4E4B\u524D\u804A\u4E86\u4E9B\u4EC0\u9EBC\uFF1A",
    current_model: "\u{1F916} \u60A8\u73FE\u5728\u4F7F\u7528\u7684 AI \u6A21\u578B\u662F\uFF1A",
    available_models: "\u{1F522} \u54C7\uFF0C\u6211\u5011\u6709\u9019\u9EBC\u591A\u6A21\u578B\u53EF\u4EE5\u9078\u64C7\uFF1A",
    model_changed: "\u{1F504} \u63DB\u6A21\u578B\u6210\u529F\uFF01\u73FE\u5728\u6211\u5011\u4F7F\u7528\u7684\u662F\uFF1A",
    help_intro: "\u{1F9ED} \u4F86\u770B\u770B\u6211\u90FD\u80FD\u505A\u4E9B\u4EC0\u9EBC\u5427\uFF1A",
    start_description: "\u{1F680} \u548C\u6211\u6253\u500B\u62DB\u547C\uFF0C\u958B\u59CB\u804A\u5929",
    language_description: "\u{1F5E3}\uFE0F \u60F3\u63DB\u500B\u8A9E\u8A00\uFF1F\u7528\u9019\u500B",
    new_description: "\u{1F504} \u958B\u59CB\u5168\u65B0\u7684\u5C0D\u8A71",
    history_description: "\u{1F4DA} \u56DE\u9867\u4E00\u4E0B\u6211\u5011\u4E4B\u524D\u804A\u4E86\u4EC0\u9EBC",
    switchmodel_description: "\u{1F500} \u63DB\u500B\u6A21\u578B\u4F86\u804A\u5929",
    help_description: "\u2753 \u67E5\u770B\u6240\u6709\u53EF\u7528\u7684\u547D\u4EE4",
    choose_language: "\u{1F310} \u4F60\u60F3\u7528\u54EA\u7A2E\u8A9E\u8A00\u548C\u6211\u804A\u5929\u5462\uFF1F",
    choose_model: "\u{1F916} \u4F86\u9078\u64C7\u4E00\u500B AI \u6A21\u578B\u5427\uFF1A",
    language_en: "\u{1F1EC}\u{1F1E7} \u82F1\u8A9E",
    language_zh: "\u{1F1E8}\u{1F1F3} \u7C21\u9AD4\u4E2D\u6587",
    language_es: "\u{1F1EA}\u{1F1F8} \u897F\u73ED\u7259\u8A9E",
    "language_zh-TW": "\u{1F1F9}\u{1F1FC} \u7E41\u9AD4\u4E2D\u6587",
    language_ja: "\u{1F1EF}\u{1F1F5} \u65E5\u8A9E",
    language_de: "\u{1F1E9}\u{1F1EA} \u5FB7\u8A9E",
    language_fr: "\u{1F1EB}\u{1F1F7} \u6CD5\u8A9E",
    language_ru: "\u{1F1F7}\u{1F1FA} \u4FC4\u8A9E",
    image_prompt_required: "\u{1F5BC}\uFE0F \u8981\u5275\u5EFA\u5716\u50CF\uFF0C\u8ACB\u544A\u8A34\u6211\u4F60\u60F3\u770B\u5230\u4EC0\u9EBC\uFF01",
    image_generation_error: "\u{1F61E} \u54CE\u5440\uFF0C\u5275\u5EFA\u5716\u50CF\u6642\u51FA\u4E86\u9EDE\u554F\u984C\u3002\u8981\u4E0D\u8981\u518D\u8A66\u4E00\u6B21\uFF1F",
    img_description: "\u{1F3A8} \u4F7F\u7528 DALL\xB7E \u5275\u5EFA\u9A5A\u4EBA\u7684\u5716\u50CF",
    invalid_size: "\u{1F4CF} \u54CE\u5440\uFF0C\u9019\u500B\u5C3A\u5BF8\u4E0D\u884C\u3002\u4E0D\u5982\u8A66\u8A66\u9019\u4E9B\uFF1A",
    flux_description: "\u{1F5BC}\uFE0F \u4F7F\u7528 Flux \u5275\u5EFA\u7F8E\u9E97\u7684\u5716\u50CF",
    flux_usage: "\u{1F4DD} \u4EE5\u4E0B\u662F\u4F7F\u7528\u65B9\u6CD5\uFF1A/flux <\u63CF\u8FF0> [\u9577\u5BEC\u6BD4]\u3002\u4F60\u53EF\u4EE5\u5F9E\u9019\u4E9B\u6BD4\u4F8B\u4E2D\u9078\u64C7\uFF1A1:1\uFF08\u9ED8\u8A8D\uFF09\u30011:2\u30013:2\u30013:4\u300116:9\u30019:16",
    invalid_aspect_ratio: "\u{1F522} \u9019\u500B\u9577\u5BEC\u6BD4\u4E0D\u592A\u5C0D\u3002\u4F60\u53EF\u4EE5\u5F9E\u9019\u4E9B\u4E2D\u9078\u64C7\uFF1A",
    original_prompt: "\u{1F3A8} \u539F\u59CB\u63CF\u8FF0",
    prompt_generation_model: "\u{1F4AC} \u63D0\u793A\u751F\u6210\u6A21\u578B",
    optimized_prompt: "\u{1F310} \u512A\u5316\u5F8C\u7684\u63CF\u8FF0",
    image_specs: "\u{1F4D0} \u5716\u50CF\u8A73\u60C5",
    command_not_found: "\u2753 \u55EF\uFF0C\u6211\u4E0D\u8A8D\u8B58\u9019\u500B\u547D\u4EE4\u3002\u8F38\u5165 /help \u770B\u770B\u6211\u80FD\u505A\u4EC0\u9EBC\uFF01"
  },
  ja: {
    welcome: "\u{1F44B} \u3053\u3093\u306B\u3061\u306F\uFF01\u3042\u306A\u305F\u5C02\u7528\u306EAI\u30A2\u30B7\u30B9\u30BF\u30F3\u30C8\u30DC\u30C3\u30C8\u3078\u3088\u3046\u3053\u305D\uFF01",
    unauthorized: "\u{1F6AB} \u7533\u3057\u8A33\u3042\u308A\u307E\u305B\u3093\u3002\u307E\u3060\u3053\u306E\u30DC\u30C3\u30C8\u306B\u30A2\u30AF\u30BB\u30B9\u3059\u308B\u6A29\u9650\u304C\u306A\u3044\u3088\u3046\u3067\u3059\u3002",
    error: "\u{1F605} \u304A\u3063\u3068\uFF01\u4F55\u304B\u554F\u984C\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u8A66\u3057\u3066\u307F\u307E\u305B\u3093\u304B\uFF1F",
    current_language: "\u{1F30D} \u73FE\u5728\u306E\u8A00\u8A9E\u8A2D\u5B9A\u306F\u65E5\u672C\u8A9E\u3067\u3059",
    language_changed: "\u{1F389} \u7D20\u6674\u3089\u3057\u3044\uFF01\u8A00\u8A9E\u304C\u6B21\u306E\u3088\u3046\u306B\u8A2D\u5B9A\u3055\u308C\u307E\u3057\u305F\uFF1A",
    new_conversation: "\u{1F195} \u4E86\u89E3\u3057\u307E\u3057\u305F\u3002\u65B0\u3057\u3044\u4F1A\u8A71\u3092\u59CB\u3081\u307E\u3057\u3087\u3046\uFF01\u4EE5\u524D\u306E\u30C1\u30E3\u30C3\u30C8\u5C65\u6B74\u306F\u30AF\u30EA\u30A2\u3055\u308C\u307E\u3057\u305F\u3002",
    no_history: "\u{1F914} \u3046\u30FC\u3093...\u307E\u3060\u4F1A\u8A71\u3092\u3057\u3066\u3044\u306A\u3044\u3088\u3046\u3067\u3059\u306D\u3002",
    history_summary: "\u{1F4DC} \u3053\u308C\u307E\u3067\u306E\u4F1A\u8A71\u306E\u8981\u7D04\u3067\u3059\uFF1A",
    current_model: "\u{1F916} \u73FE\u5728\u4F7F\u7528\u4E2D\u306EAI\u30E2\u30C7\u30EB\u306F\uFF1A",
    available_models: "\u{1F522} \u5229\u7528\u53EF\u80FD\u306A\u30E2\u30C7\u30EB\u306E\u4E00\u89A7\u3067\u3059\uFF1A",
    model_changed: "\u{1F504} \u30E2\u30C7\u30EB\u306E\u5207\u308A\u66FF\u3048\u306B\u6210\u529F\u3057\u307E\u3057\u305F\uFF01\u73FE\u5728\u4F7F\u7528\u4E2D\u306E\u30E2\u30C7\u30EB\u306F\uFF1A",
    help_intro: "\u{1F9ED} \u79C1\u306B\u3067\u304D\u308B\u3053\u3068\u306F\u4EE5\u4E0B\u306E\u901A\u308A\u3067\u3059\uFF1A",
    start_description: "\u{1F680} \u6328\u62F6\u3092\u3057\u3066\u4F1A\u8A71\u3092\u59CB\u3081\u308B",
    language_description: "\u{1F5E3}\uFE0F \u8A00\u8A9E\u3092\u5207\u308A\u66FF\u3048\u305F\u3044\u5834\u5408\u306F\u3053\u3061\u3089",
    new_description: "\u{1F504} \u65B0\u3057\u3044\u4F1A\u8A71\u3092\u59CB\u3081\u308B",
    history_description: "\u{1F4DA} \u3053\u308C\u307E\u3067\u306E\u4F1A\u8A71\u3092\u632F\u308A\u8FD4\u308B",
    switchmodel_description: "\u{1F500} \u5225\u306EAI\u30E2\u30C7\u30EB\u3092\u8A66\u3059",
    help_description: "\u2753 \u5229\u7528\u53EF\u80FD\u306A\u3059\u3079\u3066\u306E\u30B3\u30DE\u30F3\u30C9\u3092\u898B\u308B",
    choose_language: "\u{1F310} \u3069\u306E\u8A00\u8A9E\u3067\u4F1A\u8A71\u3057\u307E\u3059\u304B\uFF1F",
    choose_model: "\u{1F916} \u4F1A\u8A71\u306B\u4F7F\u7528\u3059\u308BAI\u30E2\u30C7\u30EB\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\uFF1A",
    language_en: "\u{1F1EC}\u{1F1E7} \u82F1\u8A9E",
    language_zh: "\u{1F1E8}\u{1F1F3} \u4E2D\u56FD\u8A9E\uFF08\u7C21\u4F53\u5B57\uFF09",
    language_es: "\u{1F1EA}\u{1F1F8} \u30B9\u30DA\u30A4\u30F3\u8A9E",
    "language_zh-TW": "\u{1F1F9}\u{1F1FC} \u4E2D\u56FD\u8A9E\uFF08\u7E41\u4F53\u5B57\uFF09",
    language_ja: "\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8A9E",
    language_de: "\u{1F1E9}\u{1F1EA} \u30C9\u30A4\u30C4\u8A9E",
    language_fr: "\u{1F1EB}\u{1F1F7} \u30D5\u30E9\u30F3\u30B9\u8A9E",
    language_ru: "\u{1F1F7}\u{1F1FA} \u30ED\u30B7\u30A2\u8A9E",
    image_prompt_required: "\u{1F5BC}\uFE0F \u753B\u50CF\u3092\u4F5C\u6210\u3059\u308B\u306B\u306F\u3001\u4F55\u3092\u898B\u305F\u3044\u304B\u6559\u3048\u3066\u304F\u3060\u3055\u3044\uFF01",
    image_generation_error: "\u{1F61E} \u7533\u3057\u8A33\u3042\u308A\u307E\u305B\u3093\u3002\u753B\u50CF\u306E\u4F5C\u6210\u4E2D\u306B\u554F\u984C\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u8A66\u3057\u3066\u307F\u307E\u305B\u3093\u304B\uFF1F",
    img_description: "\u{1F3A8} DALL\xB7E\u3092\u4F7F\u7528\u3057\u3066\u7D20\u6674\u3089\u3057\u3044\u753B\u50CF\u3092\u4F5C\u6210",
    invalid_size: "\u{1F4CF} \u7533\u3057\u8A33\u3042\u308A\u307E\u305B\u3093\u3002\u305D\u306E\u30B5\u30A4\u30BA\u306F\u4F7F\u7528\u3067\u304D\u307E\u305B\u3093\u3002\u6B21\u306E\u3044\u305A\u308C\u304B\u3092\u8A66\u3057\u3066\u307F\u3066\u304F\u3060\u3055\u3044\uFF1A",
    flux_description: "\u{1F5BC}\uFE0F Flux\u3092\u4F7F\u7528\u3057\u3066\u7F8E\u3057\u3044\u753B\u50CF\u3092\u4F5C\u6210",
    flux_usage: "\u{1F4DD} \u4F7F\u7528\u65B9\u6CD5\uFF1A/flux <\u8AAC\u660E> [\u30A2\u30B9\u30DA\u30AF\u30C8\u6BD4]\u3002\u6B21\u306E\u6BD4\u7387\u304B\u3089\u9078\u629E\u3067\u304D\u307E\u3059\uFF1A1:1\uFF08\u30C7\u30D5\u30A9\u30EB\u30C8\uFF09\u30011:2\u30013:2\u30013:4\u300116:9\u30019:16",
    invalid_aspect_ratio: "\u{1F522} \u305D\u306E\u30A2\u30B9\u30DA\u30AF\u30C8\u6BD4\u306F\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002\u6B21\u306E\u4E2D\u304B\u3089\u9078\u3093\u3067\u304F\u3060\u3055\u3044\uFF1A",
    original_prompt: "\u{1F3A8} \u5143\u306E\u8AAC\u660E",
    prompt_generation_model: "\u{1F4AC} \u30D7\u30ED\u30F3\u30D7\u30C8\u751F\u6210\u30E2\u30C7\u30EB",
    optimized_prompt: "\u{1F310} \u6700\u9069\u5316\u3055\u308C\u305F\u8AAC\u660E",
    image_specs: "\u{1F4D0} \u753B\u50CF\u306E\u8A73\u7D30",
    command_not_found: "\u2753 \u3059\u307F\u307E\u305B\u3093\u3001\u305D\u306E\u30B3\u30DE\u30F3\u30C9\u306F\u5206\u304B\u308A\u307E\u305B\u3093\u3002/help \u3068\u5165\u529B\u3057\u3066\u3001\u79C1\u306B\u3067\u304D\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\uFF01"
  },
  de: {
    welcome: "\u{1F44B} Hallo! Willkommen bei deinem pers\xF6nlichen KI-Assistenten-Bot!",
    unauthorized: "\u{1F6AB} Ups! Es scheint, dass du noch keinen Zugang zu diesem Bot hast.",
    error: "\u{1F605} Hoppla! Etwas ist schiefgelaufen. M\xF6chtest du es noch einmal versuchen?",
    current_language: "\u{1F30D} Du chattest gerade auf Deutsch",
    language_changed: "\u{1F389} Gro\xDFartig! Deine Sprache ist jetzt eingestellt auf: ",
    new_conversation: "\u{1F195} Alles klar, lass uns von vorne anfangen! Ich habe unseren vorherigen Chat gel\xF6scht.",
    no_history: "\u{1F914} Hmm... Es sieht so aus, als h\xE4tten wir noch nicht gechattet.",
    history_summary: "\u{1F4DC} Hier ist eine kurze Zusammenfassung unserer vorherigen Chats:",
    current_model: "\u{1F916} Du verwendest gerade dieses KI-Modell: ",
    available_models: "\u{1F522} Schau dir all diese coolen Modelle an, die wir haben: ",
    model_changed: "\u{1F504} Modellwechsel erfolgreich! Wir verwenden jetzt: ",
    help_intro: "\u{1F9ED} Hier ist, was ich f\xFCr dich tun kann:",
    start_description: "\u{1F680} Sag Hallo und lass uns anfangen zu chatten",
    language_description: "\u{1F5E3}\uFE0F M\xF6chtest du die Sprache wechseln? Benutze dies",
    new_description: "\u{1F504} Starte eine komplett neue Unterhaltung",
    history_description: "\u{1F4DA} Sieh dir an, wor\xFCber wir gesprochen haben",
    switchmodel_description: "\u{1F500} Probiere ein anderes KI-Modell aus",
    help_description: "\u2753 Siehe alle verf\xFCgbaren Befehle",
    choose_language: "\u{1F310} In welcher Sprache m\xF6chtest du chatten?",
    choose_model: "\u{1F916} W\xE4hle ein KI-Modell zum Chatten aus:",
    language_en: "\u{1F1EC}\u{1F1E7} Englisch",
    language_zh: "\u{1F1E8}\u{1F1F3} Chinesisch (Vereinfacht)",
    language_es: "\u{1F1EA}\u{1F1F8} Spanisch",
    "language_zh-TW": "\u{1F1F9}\u{1F1FC} Chinesisch (Traditionell)",
    language_ja: "\u{1F1EF}\u{1F1F5} Japanisch",
    language_de: "\u{1F1E9}\u{1F1EA} Deutsch",
    language_fr: "\u{1F1EB}\u{1F1F7} Franz\xF6sisch",
    language_ru: "\u{1F1F7}\u{1F1FA} Russisch",
    image_prompt_required: "\u{1F5BC}\uFE0F Um ein Bild zu erstellen, sag mir, was du sehen m\xF6chtest!",
    image_generation_error: "\u{1F61E} Oh je, bei der Erstellung des Bildes gab es ein Problem. M\xF6chtest du es noch einmal versuchen?",
    img_description: "\u{1F3A8} Erstelle erstaunliche Bilder mit DALL\xB7E",
    invalid_size: "\u{1F4CF} Ups, diese Gr\xF6\xDFe funktioniert nicht. Wie w\xE4re es mit einer von diesen: ",
    flux_description: "\u{1F5BC}\uFE0F Erstelle wundersch\xF6ne Bilder mit Flux",
    flux_usage: "\u{1F4DD} So wird es verwendet: /flux <Beschreibung> [Seitenverh\xE4ltnis]. Du kannst aus diesen Verh\xE4ltnissen w\xE4hlen: 1:1 (Standard), 1:2, 3:2, 3:4, 16:9, 9:16",
    invalid_aspect_ratio: "\u{1F522} Dieses Seitenverh\xE4ltnis stimmt nicht ganz. Du kannst aus diesen w\xE4hlen: ",
    original_prompt: "\u{1F3A8} Originalbeschreibung",
    prompt_generation_model: "\u{1F4AC} Prompt-Generierungsmodell",
    optimized_prompt: "\u{1F310} Verbesserte Beschreibung",
    image_specs: "\u{1F4D0} Bilddetails",
    command_not_found: "\u2753 Hmm, ich kenne diesen Befehl nicht. Gib /help ein, um zu sehen, was ich kann!"
  },
  fr: {
    welcome: "\u{1F44B} Salut ! Bienvenue sur votre assistant IA personnel !",
    unauthorized: "\u{1F6AB} Oups ! Il semble que vous n'ayez pas encore acc\xE8s \xE0 ce bot.",
    error: "\u{1F605} Oups ! Quelque chose s'est mal pass\xE9. Voulez-vous r\xE9essayer ?",
    current_language: "\u{1F30D} Vous chattez actuellement en fran\xE7ais",
    language_changed: "\u{1F389} G\xE9nial ! Votre langue est maintenant d\xE9finie sur : ",
    new_conversation: "\u{1F195} D'accord, commen\xE7ons une nouvelle conversation ! J'ai effac\xE9 notre chat pr\xE9c\xE9dent.",
    no_history: "\u{1F914} Hmm... On dirait qu'on n'a pas encore discut\xE9.",
    history_summary: "\u{1F4DC} Voici un r\xE9sum\xE9 rapide de nos conversations pr\xE9c\xE9dentes :",
    current_model: "\u{1F916} Vous utilisez actuellement ce mod\xE8le d'IA : ",
    available_models: "\u{1F522} Jetez un \u0153il \xE0 tous ces mod\xE8les cool que nous avons : ",
    model_changed: "\u{1F504} Changement de mod\xE8le r\xE9ussi ! Nous utilisons maintenant : ",
    help_intro: "\u{1F9ED} Voici ce que je peux faire pour vous :",
    start_description: "\u{1F680} Dites bonjour et commen\xE7ons \xE0 discuter",
    language_description: "\u{1F5E3}\uFE0F Vous voulez changer de langue ? Utilisez ceci",
    new_description: "\u{1F504} Commencer une toute nouvelle conversation",
    history_description: "\u{1F4DA} Jetez un \u0153il \xE0 ce dont nous avons discut\xE9",
    switchmodel_description: "\u{1F500} Essayez un mod\xE8le d'IA diff\xE9rent",
    help_description: "\u2753 Voir toutes les commandes disponibles",
    choose_language: "\u{1F310} Dans quelle langue voulez-vous discuter ?",
    choose_model: "\u{1F916} Choisissez un mod\xE8le d'IA pour discuter :",
    language_en: "\u{1F1EC}\u{1F1E7} Anglais",
    language_zh: "\u{1F1E8}\u{1F1F3} Chinois (Simplifi\xE9)",
    language_es: "\u{1F1EA}\u{1F1F8} Espagnol",
    "language_zh-TW": "\u{1F1F9}\u{1F1FC} Chinois (Traditionnel)",
    language_ja: "\u{1F1EF}\u{1F1F5} Japonais",
    language_de: "\u{1F1E9}\u{1F1EA} Allemand",
    language_fr: "\u{1F1EB}\u{1F1F7} Fran\xE7ais",
    language_ru: "\u{1F1F7}\u{1F1FA} Russe",
    image_prompt_required: "\u{1F5BC}\uFE0F Pour cr\xE9er une image, dites-moi ce que vous aimeriez voir !",
    image_generation_error: "\u{1F61E} Oh non, il y a eu un probl\xE8me lors de la cr\xE9ation de l'image. Voulez-vous r\xE9essayer ?",
    img_description: "\u{1F3A8} Cr\xE9ez des images incroyables avec DALL\xB7E",
    invalid_size: "\u{1F4CF} Oups, cette taille ne fonctionne pas. Que diriez-vous d'essayer l'une de celles-ci : ",
    flux_description: "\u{1F5BC}\uFE0F Cr\xE9ez de belles images en utilisant Flux",
    flux_usage: "\u{1F4DD} Voici comment l'utiliser : /flux <description> [ratio d'aspect]. Vous pouvez choisir parmi ces ratios : 1:1 (par d\xE9faut), 1:2, 3:2, 3:4, 16:9, 9:16",
    invalid_aspect_ratio: "\u{1F522} Ce ratio d'aspect n'est pas tout \xE0 fait correct. Vous pouvez choisir parmi ceux-ci : ",
    original_prompt: "\u{1F3A8} Description originale",
    prompt_generation_model: "\u{1F4AC} Mod\xE8le de g\xE9n\xE9ration de prompt",
    optimized_prompt: "\u{1F310} Description am\xE9lior\xE9e",
    image_specs: "\u{1F4D0} D\xE9tails de l'image",
    command_not_found: "\u2753 Hmm, je ne connais pas cette commande. Tapez /help pour voir ce que je peux faire !"
  },
  ru: {
    welcome: "\u{1F44B} \u041F\u0440\u0438\u0432\u0435\u0442! \u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 \u0432\u0430\u0448\u0435\u0433\u043E \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0418\u0418-\u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442\u0430!",
    unauthorized: "\u{1F6AB} \u0423\u043F\u0441! \u041F\u043E\u0445\u043E\u0436\u0435, \u0443 \u0432\u0430\u0441 \u0435\u0449\u0435 \u043D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u044D\u0442\u043E\u043C\u0443 \u0431\u043E\u0442\u0443.",
    error: "\u{1F605} \u041E\u0439! \u0427\u0442\u043E-\u0442\u043E \u043F\u043E\u0448\u043B\u043E \u043D\u0435 \u0442\u0430\u043A. \u0425\u043E\u0442\u0438\u0442\u0435 \u043F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0435\u0449\u0435 \u0440\u0430\u0437?",
    current_language: "\u{1F30D} \u0421\u0435\u0439\u0447\u0430\u0441 \u0432\u044B \u043E\u0431\u0449\u0430\u0435\u0442\u0435\u0441\u044C \u043D\u0430 \u0440\u0443\u0441\u0441\u043A\u043E\u043C \u044F\u0437\u044B\u043A\u0435",
    language_changed: "\u{1F389} \u041E\u0442\u043B\u0438\u0447\u043D\u043E! \u0412\u0430\u0448 \u044F\u0437\u044B\u043A \u0442\u0435\u043F\u0435\u0440\u044C \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u043D\u0430: ",
    new_conversation: "\u{1F195} \u0425\u043E\u0440\u043E\u0448\u043E, \u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043D\u0430\u0447\u043D\u0435\u043C \u0441\u043D\u0430\u0447\u0430\u043B\u0430! \u042F \u043E\u0447\u0438\u0441\u0442\u0438\u043B \u043D\u0430\u0448 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0447\u0430\u0442.",
    no_history: "\u{1F914} \u0425\u043C\u043C... \u041F\u043E\u0445\u043E\u0436\u0435, \u043C\u044B \u0435\u0449\u0435 \u043D\u0435 \u043E\u0431\u0449\u0430\u043B\u0438\u0441\u044C.",
    history_summary: "\u{1F4DC} \u0412\u043E\u0442 \u043A\u0440\u0430\u0442\u043A\u043E\u0435 \u0440\u0435\u0437\u044E\u043C\u0435 \u043D\u0430\u0448\u0438\u0445 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0445 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u043E\u0432:",
    current_model: "\u{1F916} \u0421\u0435\u0439\u0447\u0430\u0441 \u0432\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0435 \u044D\u0442\u0443 \u043C\u043E\u0434\u0435\u043B\u044C \u0418\u0418: ",
    available_models: "\u{1F522} \u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0438\u0442\u0435 \u043D\u0430 \u0432\u0441\u0435 \u044D\u0442\u0438 \u043A\u043B\u0430\u0441\u0441\u043D\u044B\u0435 \u043C\u043E\u0434\u0435\u043B\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0443 \u043D\u0430\u0441 \u0435\u0441\u0442\u044C: ",
    model_changed: "\u{1F504} \u041C\u043E\u0434\u0435\u043B\u044C \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0430! \u0422\u0435\u043F\u0435\u0440\u044C \u043C\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C: ",
    help_intro: "\u{1F9ED} \u0412\u043E\u0442 \u0447\u0442\u043E \u044F \u043C\u043E\u0433\u0443 \u0434\u043B\u044F \u0432\u0430\u0441 \u0441\u0434\u0435\u043B\u0430\u0442\u044C:",
    start_description: "\u{1F680} \u041F\u043E\u0437\u0434\u043E\u0440\u043E\u0432\u0430\u0439\u0442\u0435\u0441\u044C, \u0438 \u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043D\u0430\u0447\u043D\u0435\u043C \u043E\u0431\u0449\u0430\u0442\u044C\u0441\u044F",
    language_description: "\u{1F5E3}\uFE0F \u0425\u043E\u0442\u0438\u0442\u0435 \u0441\u043C\u0435\u043D\u0438\u0442\u044C \u044F\u0437\u044B\u043A? \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u044D\u0442\u043E",
    new_description: "\u{1F504} \u041D\u0430\u0447\u0430\u0442\u044C \u0441\u043E\u0432\u0435\u0440\u0448\u0435\u043D\u043D\u043E \u043D\u043E\u0432\u044B\u0439 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440",
    history_description: "\u{1F4DA} \u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C, \u043E \u0447\u0435\u043C \u043C\u044B \u0433\u043E\u0432\u043E\u0440\u0438\u043B\u0438",
    switchmodel_description: "\u{1F500} \u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0434\u0440\u0443\u0433\u0443\u044E \u043C\u043E\u0434\u0435\u043B\u044C \u0418\u0418",
    help_description: "\u2753 \u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u044B",
    choose_language: "\u{1F310} \u041D\u0430 \u043A\u0430\u043A\u043E\u043C \u044F\u0437\u044B\u043A\u0435 \u0432\u044B \u0445\u043E\u0442\u0438\u0442\u0435 \u043E\u0431\u0449\u0430\u0442\u044C\u0441\u044F?",
    choose_model: "\u{1F916} \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043C\u043E\u0434\u0435\u043B\u044C \u0418\u0418 \u0434\u043B\u044F \u043E\u0431\u0449\u0435\u043D\u0438\u044F:",
    language_en: "\u{1F1EC}\u{1F1E7} \u0410\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439",
    language_zh: "\u{1F1E8}\u{1F1F3} \u041A\u0438\u0442\u0430\u0439\u0441\u043A\u0438\u0439 (\u0443\u043F\u0440\u043E\u0449\u0435\u043D\u043D\u044B\u0439)",
    language_es: "\u{1F1EA}\u{1F1F8} \u0418\u0441\u043F\u0430\u043D\u0441\u043A\u0438\u0439",
    "language_zh-TW": "\u{1F1F9}\u{1F1FC} \u041A\u0438\u0442\u0430\u0439\u0441\u043A\u0438\u0439 (\u0442\u0440\u0430\u0434\u0438\u0446\u0438\u043E\u043D\u043D\u044B\u0439)",
    language_ja: "\u{1F1EF}\u{1F1F5} \u042F\u043F\u043E\u043D\u0441\u043A\u0438\u0439",
    language_de: "\u{1F1E9}\u{1F1EA} \u041D\u0435\u043C\u0435\u0446\u043A\u0438\u0439",
    language_fr: "\u{1F1EB}\u{1F1F7} \u0424\u0440\u0430\u043D\u0446\u0443\u0437\u0441\u043A\u0438\u0439",
    language_ru: "\u{1F1F7}\u{1F1FA} \u0420\u0443\u0441\u0441\u043A\u0438\u0439",
    image_prompt_required: "\u{1F5BC}\uFE0F \u0427\u0442\u043E\u0431\u044B \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435, \u0441\u043A\u0430\u0436\u0438\u0442\u0435 \u043C\u043D\u0435, \u0447\u0442\u043E \u0432\u044B \u0445\u043E\u0442\u0438\u0442\u0435 \u0443\u0432\u0438\u0434\u0435\u0442\u044C!",
    image_generation_error: "\u{1F61E} \u041E\u0439, \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0432\u043E\u0437\u043D\u0438\u043A\u043B\u0430 \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0430. \u041D\u0435 \u0445\u043E\u0442\u0438\u0442\u0435 \u043F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0435\u0449\u0435 \u0440\u0430\u0437?",
    img_description: "\u{1F3A8} \u0421\u043E\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u0443\u0434\u0438\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E DALL\xB7E",
    invalid_size: "\u{1F4CF} \u0423\u043F\u0441, \u044D\u0442\u043E\u0442 \u0440\u0430\u0437\u043C\u0435\u0440 \u043D\u0435 \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442. \u041A\u0430\u043A \u043D\u0430\u0441\u0447\u0435\u0442 \u0442\u043E\u0433\u043E, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u043E\u0434\u0438\u043D \u0438\u0437 \u044D\u0442\u0438\u0445: ",
    flux_description: "\u{1F5BC}\uFE0F \u0421\u043E\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043A\u0440\u0430\u0441\u0438\u0432\u044B\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E Flux",
    flux_usage: "\u{1F4DD} \u0412\u043E\u0442 \u043A\u0430\u043A \u044D\u0442\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C: /flux <\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435> [\u0441\u043E\u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u0435 \u0441\u0442\u043E\u0440\u043E\u043D]. \u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u044D\u0442\u0438\u0445 \u0441\u043E\u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u0439: 1:1 (\u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E), 1:2, 3:2, 3:4, 16:9, 9:16",
    invalid_aspect_ratio: "\u{1F522} \u042D\u0442\u043E \u0441\u043E\u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u0435 \u0441\u0442\u043E\u0440\u043E\u043D \u043D\u0435 \u0441\u043E\u0432\u0441\u0435\u043C \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E\u0435. \u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u044D\u0442\u0438\u0445: ",
    original_prompt: "\u{1F3A8} \u0418\u0441\u0445\u043E\u0434\u043D\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
    prompt_generation_model: "\u{1F4AC} \u041C\u043E\u0434\u0435\u043B\u044C \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u043E\u043A",
    optimized_prompt: "\u{1F310} \u0423\u043B\u0443\u0447\u0448\u0435\u043D\u043D\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
    image_specs: "\u{1F4D0} \u0414\u0435\u0442\u0430\u043B\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F",
    command_not_found: "\u2753 \u0425\u043C\u043C, \u044F \u043D\u0435 \u0437\u043D\u0430\u044E \u044D\u0442\u0443 \u043A\u043E\u043C\u0430\u043D\u0434\u0443. \u0412\u0432\u0435\u0434\u0438\u0442\u0435 /help, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C, \u0447\u0442\u043E \u044F \u043C\u043E\u0433\u0443 \u0441\u0434\u0435\u043B\u0430\u0442\u044C!"
  }
};
function translate(key, language = "en") {
  return translations[language]?.[key] || translations["en"][key];
}

// src/api/image_generation.ts
var ImageGenerationAPI = class {
  apiKey;
  baseUrl;
  model;
  constructor(env) {
    const config = getConfig(env);
    this.apiKey = config.openaiApiKey;
    this.baseUrl = config.openaiBaseUrl;
    this.model = config.dallEModel;
  }
  async generateImage(prompt, size) {
    const url = `${this.baseUrl}/images/generations`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        n: 1,
        size
      })
    });
    if (!response.ok) {
      throw new Error(`Image generation API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data[0].url;
  }
  async generateResponse(messages, model) {
    throw new Error("Method not implemented for image generation.");
  }
  isValidModel(model) {
    return model === this.model;
  }
  getDefaultModel() {
    return this.model;
  }
  getAvailableModels() {
    return [this.model];
  }
  getValidSizes() {
    return ["1024x1024", "1024x1792", "1792x1024"];
  }
};

// src/api/flux-cf.ts
var FluxAPI = class {
  apiToken;
  accountId;
  steps;
  model = "@cf/black-forest-labs/flux-1-schnell";
  promptOptimization;
  externalApiBase;
  externalModel;
  externalApiKey;
  constructor(env) {
    const config = getConfig(env);
    this.apiToken = config.cloudflareApiToken;
    this.accountId = config.cloudflareAccountId;
    this.steps = config.fluxSteps;
    this.promptOptimization = config.promptOptimization;
    this.externalApiBase = config.externalApiBase;
    this.externalModel = config.externalModel;
    this.externalApiKey = config.externalApiKey;
  }
  async generateImage(prompt, aspectRatio) {
    let optimizedPrompt;
    if (this.promptOptimization) {
      optimizedPrompt = await this.optimizePrompt(prompt, aspectRatio);
      prompt = optimizedPrompt;
    }
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`;
    const [width, height] = this.getImageDimensions(aspectRatio);
    const seed = Math.floor(Math.random() * 1e6);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiToken}`
      },
      body: JSON.stringify({
        prompt,
        num_steps: this.steps,
        seed,
        width,
        height
      })
    });
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing Flux API response:", error);
      throw new Error("Invalid response from Flux API");
    }
    if (!response.ok || !data.success) {
      const errorMessage = data.errors ? data.errors.join(", ") : "Unknown error";
      console.error(`Flux API error: ${errorMessage}`);
      throw new Error(`Flux API error: ${errorMessage}`);
    }
    if (!data.result || !data.result.image) {
      throw new Error("Flux API returned no image");
    }
    const binaryString = atob(data.result.image);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return {
      imageData: bytes,
      optimizedPrompt
    };
  }
  async optimizePrompt(prompt, aspectRatio) {
    if (!this.externalApiBase || !this.externalModel || !this.externalApiKey) {
      throw new Error("External API configuration is missing");
    }
    const systemPrompt = `You are a prompt generation bot based on the Flux.1 model. Based on the user's requirements, automatically generate drawing prompts that adhere to the Flux.1 format. While you can refer to the provided templates to learn the structure and patterns of the prompts, you must remain flexible to meet various different needs. The final output should be limited to the prompts only, without any additional explanations or information. You must reply to me entirely in English!

### **Prompt Generation Logic**:

1. **Requirement Analysis**: Extract key information from the user's description, including:
- Characters: Appearance, actions, expressions, etc.
- Scene: Environment, lighting, weather, etc.
- Style: Art style, emotional atmosphere, color scheme, etc.
- **Aspect Ratio**: If the user provides a specific aspect ratio (e.g., "3:2", "16:9"), extract this and integrate it into the final prompt.
- Other elements: Specific objects, background, or effects.

2. **Prompt Structure Guidelines**:
- **Concise, precise, and detailed**: Prompts should describe the core subject simply and clearly, with enough detail to generate an image that matches the request.
- **Flexible and varied**: Use the user's description to dynamically create prompts without following rigid templates. Ensure prompts are adapted based on the specific needs of each user, avoiding overly template-based outputs.
- **Descriptions following Flux.1 style**: Prompts must follow the requirements of Flux.1, aiming to include descriptions of the art style, visual effects, and emotional atmosphere. Use keywords and description patterns that match the Flux.1 model's generation process. If a specific aspect ratio is mentioned, ensure it is included in the prompt description.

3. **Key Points Summary for Flux.1 Prompts**:
- **Concise and precise subject description**: Clearly identify the subject or scene of the image.
- **Specific description of style and emotional atmosphere**: Ensure the prompt includes information about the art style, lighting, color scheme, and emotional atmosphere of the image.
- **Details on dynamics and action**: Prompts may include important details like actions, emotions, or lighting effects in the scene.`;
    const response = await fetch(`${this.externalApiBase}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.externalApiKey}`
      },
      body: JSON.stringify({
        model: this.externalModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Optimize this image generation prompt for aspect ratio ${aspectRatio}: ${prompt}` }
        ]
      })
    });
    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
  getImageDimensions(aspectRatio) {
    switch (aspectRatio) {
      case "1:1":
        return [1024, 1024];
      case "1:2":
        return [512, 1024];
      case "3:2":
        return [768, 512];
      case "3:4":
        return [768, 1024];
      case "16:9":
        return [1024, 576];
      case "9:16":
        return [576, 1024];
      default:
        return [1024, 1024];
    }
  }
  async generateResponse(messages) {
    throw new Error("Method not implemented for image generation.");
  }
  isValidModel(model) {
    return model === this.model;
  }
  getDefaultModel() {
    return this.model;
  }
  getAvailableModels() {
    return [this.model];
  }
  getValidAspectRatios() {
    return ["1:1", "1:2", "3:2", "3:4", "16:9", "9:16"];
  }
};

// src/config/commands.ts
var commands = [
  {
    name: "start",
    description: "start_description",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const currentModel = await bot.getCurrentModel(userId);
      const welcomeMessage = translate("welcome", language) + "\n" + translate("current_model", language) + currentModel;
      await bot.sendMessageWithFallback(chatId, welcomeMessage);
    }
  },
  {
    name: "language",
    description: "language_description",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      const currentLanguage = await bot.getUserLanguage(userId);
      const keyboard = {
        inline_keyboard: [
          [
            { text: "\u{1F1FA}\u{1F1F8} English", callback_data: "lang_en" },
            { text: "\u{1F1E8}\u{1F1F3} \u7B80\u4F53\u4E2D\u6587", callback_data: "lang_zh" },
            { text: "\u{1F1EA}\u{1F1F8} Espa\xF1ol", callback_data: "lang_es" }
          ],
          [
            { text: "\u{1F1F9}\u{1F1FC} \u7E41\u9AD4\u4E2D\u6587", callback_data: "lang_zh-TW" },
            // 修改这里
            { text: "\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8A9E", callback_data: "lang_ja" },
            { text: "\u{1F1E9}\u{1F1EA} Deutsch", callback_data: "lang_de" }
          ],
          [
            { text: "\u{1F1EB}\u{1F1F7} Fran\xE7ais", callback_data: "lang_fr" },
            { text: "\u{1F1F7}\u{1F1FA} \u0420\u0443\u0441\u0441\u043A\u0438\u0439", callback_data: "lang_ru" }
          ]
        ]
      };
      await bot.sendMessage(chatId, translate("choose_language", currentLanguage), { reply_markup: JSON.stringify(keyboard) });
    }
  },
  {
    name: "switchmodel",
    description: "switchmodel_description",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const config = getConfig(bot["env"]);
      const availableModels = [
        ...config.openaiModels,
        ...config.googleModels,
        ...config.groqModels,
        ...config.claudeModels,
        ...config.azureModels
        // 新增 Azure 模型
      ];
      const keyboard = {
        inline_keyboard: availableModels.map((model) => [{ text: model, callback_data: `model_${model}` }])
      };
      await bot.sendMessage(chatId, translate("choose_model", language), { reply_markup: JSON.stringify(keyboard) });
    }
  },
  {
    name: "new",
    description: "new_description",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      await bot.clearContext(userId);
    }
  },
  {
    name: "history",
    description: "history_description",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const summary = await bot.summarizeHistory(userId);
      await bot.sendMessage(chatId, summary || translate("no_history", language));
    }
  },
  {
    name: "help",
    description: "help_description",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      let helpMessage = translate("help_intro", language) + "\n\n";
      for (const command of commands) {
        const descriptionKey = `${command.name}_description`;
        helpMessage += `/${command.name} - ${translate(descriptionKey, language)}
`;
      }
      await bot.sendMessage(chatId, helpMessage);
    }
  },
  {
    name: "img",
    description: "img_description",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      if (!args.length) {
        await bot.sendMessageWithFallback(chatId, translate("image_prompt_required", language));
        return;
      }
      const validSizes = ["1024x1024", "1024x1792", "1792x1024"];
      const sizeArg = args[args.length - 1].toLowerCase();
      let size;
      let prompt;
      if (validSizes.includes(sizeArg)) {
        size = sizeArg;
        prompt = args.slice(0, -1).join(" ");
      } else {
        size = "1024x1024";
        prompt = args.join(" ");
        if (sizeArg.includes("x") || sizeArg.includes("*")) {
          const sizeOptions = validSizes.map((s) => `\`${s}\``).join(", ");
          await bot.sendMessage(chatId, translate("invalid_size", language) + sizeOptions);
          return;
        }
      }
      try {
        await sendChatAction(chatId, "upload_photo", bot["env"]);
        const imageApi = new ImageGenerationAPI(bot["env"]);
        const imageUrl = await imageApi.generateImage(prompt, size);
        await bot.sendPhoto(chatId, imageUrl, { caption: prompt });
      } catch (error) {
        console.error("Error generating image:", error);
        await bot.sendMessage(chatId, translate("image_generation_error", language));
      }
    }
  },
  {
    name: "flux",
    description: "flux_description",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      if (!args.length) {
        await bot.sendMessage(chatId, translate("flux_usage", language));
        return;
      }
      let aspectRatio = "1:1";
      let prompt;
      const fluxApi = new FluxAPI(bot["env"]);
      const validRatios = fluxApi.getValidAspectRatios();
      if (validRatios.includes(args[args.length - 1])) {
        aspectRatio = args[args.length - 1];
        prompt = args.slice(0, -1).join(" ");
      } else {
        prompt = args.join(" ");
      }
      try {
        await sendChatAction(chatId, "upload_photo", bot["env"]);
        const { imageData, optimizedPrompt } = await fluxApi.generateImage(prompt, aspectRatio);
        const config = getConfig(bot["env"]);
        let caption = `${translate("original_prompt", language)}: ${prompt}
`;
        caption += `${translate("image_specs", language)}: ${aspectRatio}
`;
        if (config.promptOptimization && optimizedPrompt) {
          caption += `${translate("prompt_generation_model", language)}: ${config.externalModel || "Unknown"}
`;
          caption += `${translate("optimized_prompt", language)}: ${optimizedPrompt}
`;
        }
        await bot.sendPhoto(chatId, imageData, { caption });
      } catch (error) {
        console.error(`Error generating Flux image for user ${userId}:`, error);
        if (error instanceof Error) {
          console.error("Error details:", error.message);
        }
        await bot.sendMessage(chatId, translate("image_generation_error", language));
      }
    }
  }
];

// src/utils/redis.ts
var RedisClient = class {
  url;
  token;
  config;
  constructor(env) {
    this.config = getConfig(env);
    this.url = this.config.upstashRedisRestUrl;
    this.token = this.config.upstashRedisRestToken;
  }
  async get(key) {
    const response = await fetch(`${this.url}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.result;
  }
  async set(key, value, ttl) {
    const url = ttl ? `${this.url}/set/${key}/${value}?EX=${ttl}` : `${this.url}/set/${key}/${value}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  async del(key) {
    const response = await fetch(`${this.url}/del/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  async setLanguage(userId, language) {
    await this.set(`language:${userId}`, language, this.config.languageTTL);
  }
  async appendContext(userId, newContext) {
    const key = `context:${userId}`;
    const existingContext = await this.get(key);
    const updatedContext = existingContext ? `${existingContext}
${newContext}` : newContext;
    await this.set(key, updatedContext, this.config.contextTTL);
  }
  async getAllUserLanguages() {
    const keys = await this.keys("language:*");
    const userLanguages = {};
    for (const key of keys) {
      const userId = key.split(":")[1];
      const language = await this.get(key);
      if (language) {
        userLanguages[userId] = language;
      }
    }
    return userLanguages;
  }
  async keys(pattern) {
    const response = await fetch(`${this.url}/keys/${pattern}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.result;
  }
};

// src/api/gemini.ts
var GeminiAPI = class {
  apiKey;
  baseUrl;
  models;
  defaultModel;
  constructor(env) {
    const config = getConfig(env);
    this.apiKey = config.googleModelKey;
    this.baseUrl = config.googleModelBaseUrl || "https://generativelanguage.googleapis.com/v1beta";
    this.models = config.googleModels;
    this.defaultModel = this.models[0];
  }
  async generateResponse(messages, model) {
    const useModel = model || this.defaultModel;
    const url = `${this.baseUrl}/models/${useModel}:generateContent?key=${this.apiKey}`;
    const geminiMessages = messages.filter((msg) => msg.role !== "system").map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));
    const requestBody = {
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 2048
      }
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.statusText}`, errorText);
      throw new Error(`Gemini API error: ${response.statusText}
${errorText}`);
    }
    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated from Gemini API");
    }
    return data.candidates[0].content.parts[0].text.trim();
  }
  isValidModel(model) {
    return this.models.includes(model);
  }
  getDefaultModel() {
    return this.defaultModel;
  }
  getAvailableModels() {
    return this.models;
  }
};
var gemini_default = GeminiAPI;

// src/api/groq.ts
var GroqAPI = class {
  apiKey;
  baseUrl = "https://api.groq.com/openai/v1";
  models;
  defaultModel;
  constructor(env) {
    const config = getConfig(env);
    this.apiKey = config.groqApiKey;
    this.models = config.groqModels;
    this.defaultModel = this.models[0];
  }
  async generateResponse(messages, model) {
    const useModel = model || this.defaultModel;
    const url = `${this.baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: useModel,
        messages
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error: ${response.statusText}`, errorText);
      throw new Error(`Groq API error: ${response.statusText}
${errorText}`);
    }
    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response generated from Groq API");
    }
    return data.choices[0].message.content.trim();
  }
  isValidModel(model) {
    return this.models.includes(model);
  }
  getDefaultModel() {
    return this.defaultModel;
  }
  getAvailableModels() {
    return this.models;
  }
};
var groq_default = GroqAPI;

// src/api/claude.ts
var ClaudeAPI = class {
  apiKey;
  baseUrl;
  models;
  defaultModel;
  constructor(env) {
    const config = getConfig(env);
    this.apiKey = config.claudeApiKey;
    this.baseUrl = config.claudeEndpoint || "https://api.anthropic.com/v1";
    this.models = config.claudeModels;
    this.defaultModel = this.models[0];
  }
  async generateResponse(messages, model) {
    const useModel = model || this.defaultModel;
    const url = `${this.baseUrl}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: useModel,
        messages: messages.map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content
        })),
        max_tokens: 1e3
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error: ${response.statusText}`, errorText);
      throw new Error(`Claude API error: ${response.statusText}
${errorText}`);
    }
    const data = await response.json();
    if (!data.content || data.content.length === 0) {
      throw new Error("No response generated from Claude API");
    }
    const generatedText = data.content[0].text.trim();
    return generatedText;
  }
  isValidModel(model) {
    return this.models.includes(model);
  }
  getDefaultModel() {
    return this.defaultModel;
  }
  getAvailableModels() {
    return this.models;
  }
};
var claude_default = ClaudeAPI;

// src/api/azure.ts
var AzureAPI = class {
  apiKey;
  baseUrl;
  models;
  defaultModel;
  constructor(env) {
    const config = getConfig(env);
    this.apiKey = config.azureApiKey;
    this.baseUrl = config.azureEndpoint;
    this.models = config.azureModels;
    this.defaultModel = this.models[0];
  }
  async generateResponse(messages, model) {
    const useModel = model || this.defaultModel;
    const url = `${this.baseUrl}/openai/deployments/${useModel}/chat/completions?api-version=2024-02-01`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey
      },
      body: JSON.stringify({
        messages
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Azure API error: ${response.statusText}`, errorText);
      throw new Error(`Azure API error: ${response.statusText}
${errorText}`);
    }
    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Azure API \u672A\u751F\u6210\u4EFB\u4F55\u54CD\u5E94");
    }
    return data.choices[0].message.content.trim();
  }
  isValidModel(model) {
    return this.models.includes(model);
  }
  getDefaultModel() {
    return this.defaultModel;
  }
  getAvailableModels() {
    return this.models;
  }
};
var azure_default = AzureAPI;

// src/api/telegram.ts
var TelegramBot = class {
  token;
  apiUrl;
  whitelistedUsers;
  systemMessage;
  env;
  commands;
  redis;
  modelAPI;
  constructor(env) {
    const config = getConfig(env);
    this.token = config.telegramBotToken;
    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    this.whitelistedUsers = config.whitelistedUsers;
    this.systemMessage = config.systemInitMessage;
    this.env = env;
    this.commands = commands;
    this.redis = new RedisClient(env);
    this.modelAPI = new openai_api_default(env);
    this.setMenuButton().catch(console.error);
  }
  async initializeModelAPI(userId) {
    const currentModel = await this.getCurrentModel(userId);
    console.log(`Initializing API for model: ${currentModel}`);
    const config = getConfig(this.env);
    if (config.openaiModels.includes(currentModel)) {
      return new openai_api_default(this.env);
    } else if (config.googleModels.includes(currentModel)) {
      return new gemini_default(this.env);
    } else if (config.groqModels.includes(currentModel)) {
      return new groq_default(this.env);
    } else if (config.claudeModels.includes(currentModel)) {
      return new claude_default(this.env);
    } else if (config.azureModels.includes(currentModel)) {
      return new azure_default(this.env);
    }
    console.warn(`Unknown model: ${currentModel}. Falling back to OpenAI API.`);
    return new openai_api_default(this.env);
  }
  async executeCommand(commandName, chatId, args) {
    const command = this.commands.find((cmd) => cmd.name === commandName);
    if (command) {
      await command.action(chatId, this, args);
    } else {
      console.log(`Unknown command: ${commandName}`);
      const language = await this.getUserLanguage(chatId.toString());
      await this.sendMessage(chatId, translate("command_not_found", language));
    }
  }
  async sendMessage(chatId, text, options = {}) {
    const messages = splitMessage(text);
    const results = [];
    for (const message of messages) {
      const url = `${this.apiUrl}/sendMessage`;
      console.log(`Sending message part (length: ${message.length})`);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: options.parse_mode,
            // 只有在明确指定时才使用 parse_mode
            reply_markup: options.reply_markup
          })
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Telegram API error: ${response.statusText}`, errorText);
          throw new Error(`Telegram API error: ${response.statusText}
${errorText}`);
        }
        const result = await response.json();
        results.push(result);
      } catch (error) {
        console.error("Error sending message part:", error);
        throw error;
      }
    }
    return results;
  }
  async handleUpdate(update) {
    if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
    } else if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userId = update.message.from?.id?.toString();
      if (!userId) {
        console.error("User ID is undefined");
        return;
      }
      const text = update.message.text;
      const language = await this.getUserLanguage(userId);
      if (this.isUserWhitelisted(userId)) {
        if (text.startsWith("/")) {
          const [commandName, ...args] = text.slice(1).split(" ");
          await this.executeCommand(commandName, chatId, args);
        } else {
          try {
            await sendChatAction(chatId, "typing", this.env);
            this.modelAPI = await this.initializeModelAPI(userId);
            const context = await this.getContext(userId);
            const currentModel = await this.getCurrentModel(userId);
            let messages = [];
            if (currentModel.startsWith("gemini-")) {
              messages = [
                ...context ? [{ role: "user", content: context }] : [],
                { role: "user", content: text }
              ];
            } else {
              messages = [
                { role: "system", content: this.systemMessage },
                ...context ? [{ role: "user", content: context }] : [],
                { role: "user", content: text }
              ];
            }
            const response = await this.modelAPI.generateResponse(messages, currentModel);
            const formattedResponse = this.formatResponse(response);
            await this.sendMessageWithFallback(chatId, formattedResponse);
            await this.storeContext(userId, `User: ${text}
Assistant: ${response}`);
          } catch (error) {
            console.error("Error in handleUpdate:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            await this.sendMessage(chatId, translate("error", language) + ": " + errorMessage);
          }
        }
      } else {
        await this.sendMessageWithFallback(chatId, translate("unauthorized", language));
      }
    }
  }
  async handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message?.chat.id;
    const userId = callbackQuery.from.id.toString();
    const data = callbackQuery.data;
    if (!chatId || !data)
      return;
    if (data.startsWith("lang_")) {
      const newLanguage = data.split("_")[1];
      await this.setUserLanguage(userId, newLanguage);
      await this.sendMessageWithFallback(chatId, translate("language_changed", newLanguage) + translate(`language_${newLanguage}`, newLanguage));
      await this.setMenuButton();
    } else if (data.startsWith("model_")) {
      const newModel = data.split("_")[1];
      await this.setCurrentModel(userId, newModel);
      const language = await this.getUserLanguage(userId);
      await this.sendMessageWithFallback(chatId, translate("model_changed", language) + newModel);
      await this.clearContext(userId);
    }
    await fetch(`${this.apiUrl}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQuery.id })
    });
  }
  async getUserLanguage(userId) {
    const language = await this.redis.get(`language:${userId}`);
    return language || "en";
  }
  async setUserLanguage(userId, language) {
    await this.redis.setLanguage(userId, language);
  }
  async getCurrentModel(userId) {
    const model = await this.redis.get(`model:${userId}`);
    return model || this.modelAPI.getDefaultModel();
  }
  async setCurrentModel(userId, model) {
    await this.redis.set(`model:${userId}`, model);
    console.log(`Switching to model: ${model}`);
    this.modelAPI = await this.initializeModelAPI(userId);
  }
  getAvailableModels() {
    return this.modelAPI.getAvailableModels();
  }
  isValidModel(model) {
    return this.modelAPI.isValidModel(model);
  }
  async storeContext(userId, context) {
    await this.redis.appendContext(userId, context);
  }
  async getContext(userId) {
    return await this.redis.get(`context:${userId}`);
  }
  async clearContext(userId) {
    await this.redis.del(`context:${userId}`);
    const language = await this.getUserLanguage(userId);
    await this.sendMessageWithFallback(parseInt(userId), translate("new_conversation", language));
  }
  async summarizeHistory(userId) {
    this.modelAPI = await this.initializeModelAPI(userId);
    const context = await this.getContext(userId);
    const language = await this.getUserLanguage(userId);
    if (!context) {
      return translate("no_history", language);
    }
    const languageNames = {
      "en": "English",
      "zh": "Chinese",
      "es": "Spanish",
      "zh-TW": "Traditional Chinese",
      // 修改这里
      "ja": "Japanese",
      "de": "German",
      "fr": "French",
      "ru": "Russian"
    };
    const currentModel = await this.getCurrentModel(userId);
    console.log(`Summarizing history with model: ${currentModel}`);
    let messages;
    if (currentModel.startsWith("gemini-")) {
      messages = [
        { role: "user", content: `Please summarize the following conversation in ${languageNames[language]}:

${context}` }
      ];
    } else {
      messages = [
        { role: "system", content: `Summarize the following conversation in ${languageNames[language]}:` },
        { role: "user", content: context }
      ];
    }
    const summary = await this.modelAPI.generateResponse(messages, currentModel);
    return `${translate("history_summary", language)}

${summary}`;
  }
  formatResponse(response) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    return response.replace(codeBlockRegex, (match, language, code) => {
      return formatCodeBlock(code.trim(), language || "");
    });
  }
  isUserWhitelisted(userId) {
    return this.whitelistedUsers.includes(userId);
  }
  async handleWebhook(request) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    try {
      const update = await request.json();
      await this.handleUpdate(update);
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
  async sendPhoto(chatId, photo, options = {}) {
    const url = `${this.apiUrl}/sendPhoto`;
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    if (typeof photo === "string") {
      formData.append("photo", photo);
    } else {
      const blob = new Blob([photo], { type: "image/png" });
      formData.append("photo", blob, "image.png");
    }
    if (options.caption) {
      formData.append("caption", options.caption);
    }
    const response = await fetch(url, {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  async setWebhook(url) {
    const setWebhookUrl = `${this.apiUrl}/setWebhook`;
    const response = await fetch(setWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });
    if (!response.ok) {
      throw new Error(`Failed to set webhook: ${response.statusText}`);
    }
    const result = await response.json();
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }
  }
  async sendMessageWithFallback(chatId, text) {
    const messages = splitMessage(text);
    const results = [];
    for (const message of messages) {
      try {
        const result = await this.sendMessage(chatId, message, { parse_mode: "Markdown" });
        results.push(...result);
      } catch (error) {
        console.error("Error sending message with Markdown, falling back to plain text:", error);
        const plainTextResult = await this.sendMessage(chatId, message);
        results.push(...plainTextResult);
      }
    }
    return results;
  }
  // 添加新方法来设置菜单按钮
  async setMenuButton() {
    const url = `${this.apiUrl}/setMyCommands`;
    const userLanguages = await this.redis.getAllUserLanguages();
    for (const [userId, lang] of Object.entries(userLanguages)) {
      const commands2 = this.commands.map((cmd) => ({
        command: cmd.name,
        description: translate(cmd.description, lang)
      }));
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            commands: commands2,
            scope: {
              type: "chat",
              chat_id: parseInt(userId)
            }
          })
        });
        if (!response.ok) {
          throw new Error(`Failed to set menu button for user ${userId}: ${response.statusText}`);
        }
        console.log(`Menu button set successfully for user ${userId} with language: ${lang}`);
      } catch (error) {
        console.error(`Error setting menu button for user ${userId}:`, error);
      }
    }
    const defaultCommands = this.commands.map((cmd) => ({
      command: cmd.name,
      description: translate(cmd.description, "en")
    }));
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          commands: defaultCommands
        })
      });
      if (!response.ok) {
        throw new Error(`Failed to set default menu button: ${response.statusText}`);
      }
      console.log("Default menu button set successfully");
    } catch (error) {
      console.error("Error setting default menu button:", error);
    }
  }
};
var telegram_default = TelegramBot;

// src/index.ts
var src_default = {
  async fetch(request, env, ctx) {
    const bot = new telegram_default(env);
    const url = new URL(request.url);
    try {
      if (url.pathname === "/webhook") {
        return await bot.handleWebhook(request);
      }
      if (url.pathname === "/" || url.pathname === "") {
        return new Response("Hello! This is your Telegram bot worker.", {
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      }
      return new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" }
      });
    } catch (error) {
      console.error("Error processing request:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      return new Response(`Internal Server Error: ${errorMessage}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
