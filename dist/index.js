// src/env.ts
var getEnvOrDefault = (env, key, defaultValue) => {
  return env[key] || defaultValue;
};
var getConfig = (env) => ({
  openaiApiKey: env.OPENAI_API_KEY,
  openaiBaseUrl: getEnvOrDefault(env, "OPENAI_BASE_URL", "https://api.openai.com/v1"),
  openaiModels: env.OPENAI_MODELS.split(",").map((model) => model.trim()),
  telegramBotToken: env.TELEGRAM_BOT_TOKEN,
  whitelistedUsers: env.WHITELISTED_USERS.split(",").map((id) => id.trim()),
  systemInitMessage: getEnvOrDefault(env, "SYSTEM_INIT_MESSAGE", "You are a helpful assistant."),
  systemInitMessageRole: getEnvOrDefault(env, "SYSTEM_INIT_MESSAGE_ROLE", "system"),
  defaultModel: env.DEFAULT_MODEL,
  upstashRedisRestUrl: env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: env.UPSTASH_REDIS_REST_TOKEN,
  dallEModel: getEnvOrDefault(env, "DALL_E_MODEL", "dall-e-3"),
  // TTL 配置（以秒为单位）
  languageTTL: 60 * 60 * 24 * 365,
  // 1 year
  contextTTL: 60 * 60 * 24 * 30,
  // 30 days
  cloudflareApiToken: env.CLOUDFLARE_API_TOKEN,
  cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
  fluxSteps: parseInt(getEnvOrDefault(env, "FLUX_STEPS", "4")),
  promptOptimization: getEnvOrDefault(env, "PROMPT_OPTIMIZATION", "false") === "true",
  externalApiBase: env.EXTERNAL_API_BASE,
  externalModel: env.EXTERNAL_MODEL,
  externalApiKey: env.EXTERNAL_API_KEY,
  googleModelKey: env.GOOGLE_MODEL_KEY,
  googleModelBaseUrl: getEnvOrDefault(env, "GOOGLE_MODEL_BASEURL", "https://generativelanguage.googleapis.com/v1beta"),
  googleModels: env.GOOGLE_MODELS.split(",").map((model) => model.trim())
});

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
    image_prompt_required: "Please provide a description for the image you want to generate.",
    image_generation_error: "Sorry, there was an error generating the image. Please try again later.",
    img_description: "Generate an image using DALL\xB7E. Format: /img <description> [size]",
    invalid_size: "Invalid image size. Please use one of the following sizes: ",
    flux_description: "Generate an image using Flux",
    flux_usage: "Usage: /flux <description> [aspect ratio]. Valid aspect ratios are: 1:1 (default), 1:2, 3:2, 3:4, 16:9, 9:16",
    invalid_aspect_ratio: "Invalid aspect ratio. Valid options are: ",
    original_prompt: "\u{1F3A8} Original Prompt",
    prompt_generation_model: "\u{1F4AC} Prompt Generation Model",
    optimized_prompt: "\u{1F310} Optimized Prompt",
    image_specs: "\u{1F4D0} Image Specifications",
    command_not_found: "Command not found. Type /help for a list of available commands."
  },
  zh: {
    welcome: "\u6B22\u8FCE\u4F7F\u7528 GPT Telegram \u673A\u5668\u4EBA\uFF01",
    unauthorized: "\u62B1\u6B49\uFF0C\u60A8\u65E0\u6743\u4F7F\u7528\u6B64\u673A\u5668\u4EBA\u3002",
    error: "\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002",
    current_language: "\u60A8\u5F53\u524D\u7684\u8BED\u8A00\u662F\uFF1A\u4E2D\u6587",
    language_changed: "\u8BED\u8A00\u5DF2\u66F4\u6539\u4E3A\uFF1A",
    new_conversation: "\u5F00\u59CB\u65B0\u7684\u5BF9\u8BDD\u3002\u4E4B\u524D\u7684\u4E0A\u4E0B\u6587\u5DF2\u88AB\u6E05\u9664\u3002",
    no_history: "\u672A\u627E\u5230\u5BF9\u8BDD\u5386\u53F2\u3002",
    history_summary: "\u4EE5\u4E0B\u662F\u60A8\u7684\u5BF9\u8BDD\u5386\u53F2\u6458\u8981\uFF1A",
    current_model: "\u60A8\u5F53\u524D\u4F7F\u7528\u7684\u6A21\u578B\u662F\uFF1A",
    available_models: "\u53EF\u7528\u7684\u6A21\u578B\uFF1A",
    model_changed: "\u6A21\u578B\u5DF2\u66F4\u6539\u4E3A\uFF1A",
    help_intro: "\u4EE5\u4E0B\u662F\u53EF\u7528\u7684\u547D\u4EE4\uFF1A",
    start_description: "\u542F\u52A8\u673A\u5668\u4EBA",
    language_description: "\u8BBE\u7F6E\u60A8\u7684\u9996\u9009\u8BED\u8A00",
    new_description: "\u5F00\u59CB\u65B0\u7684\u5BF9\u8BDD",
    history_description: "\u603B\u7ED3\u5BF9\u8BDD\u5386\u53F2",
    switchmodel_description: "\u5207\u6362\u5F53\u524D\u6A21\u578B",
    help_description: "\u663E\u793A\u53EF\u7528\u547D\u4EE4\u53CA\u5176\u63CF\u8FF0",
    choose_language: "\u8BF7\u9009\u62E9\u60A8\u504F\u597D\u7684\u8BED\u8A00\uFF1A",
    choose_model: "\u8BF7\u9009\u62E9\u4E00\u4E2A\u6A21\u578B\uFF1A",
    language_en: "\u82F1\u8BED",
    language_zh: "\u4E2D\u6587",
    language_es: "\u897F\u73ED\u7259\u8BED",
    image_prompt_required: "\u8BF7\u63D0\u4F9B\u60A8\u60F3\u8981\u751F\u6210\u7684\u56FE\u50CF\u63CF\u8FF0\u3002",
    image_generation_error: "\u62B1\u6B49\uFF0C\u751F\u6210\u56FE\u50CF\u65F6\u51FA\u9519\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002",
    img_description: "\u4F7F\u7528 DALL\xB7E \u751F\u6210\u56FE\u50CF\u3002\u683C\u5F0F\uFF1A/img <\u63CF\u8FF0> [\u5C3A\u5BF8]",
    invalid_size: "\u65E0\u6548\u7684\u56FE\u7247\u5C3A\u5BF8\u3002\u8BF7\u4F7F\u7528\u4EE5\u4E0B\u5C3A\u5BF8\u4E4B\u4E00\uFF1A",
    flux_description: "\u4F7F\u7528 Flux \u751F\u6210\u56FE\u50CF",
    flux_usage: "\u7528\u6CD5\uFF1A/flux <\u63CF\u8FF0> [\u5BBD\u9AD8\u6BD4]\u3002\u6709\u6548\u7684\u5BBD\u9AD8\u6BD4\u6709\uFF1A1:1\uFF08\u9ED8\u8BA4\uFF09, 1:2, 3:2, 3:4, 16:9, 9:16",
    invalid_aspect_ratio: "\u65E0\u6548\u7684\u5BBD\u9AD8\u6BD4\u3002\u6709\u6548\u9009\u9879\u4E3A\uFF1A",
    original_prompt: "\u{1F3A8} \u539F\u59CB\u63D0\u793A\u8BCD",
    prompt_generation_model: "\u{1F4AC} \u63D0\u793A\u8BCD\u751F\u6210\u6A21\u578B",
    optimized_prompt: "\u{1F310} \u4F18\u5316\u540E\u7684\u63D0\u793A\u8BCD",
    image_specs: "\u{1F4D0} \u56FE\u50CF\u89C4\u683C",
    command_not_found: "\u672A\u627E\u5230\u8BE5\u547D\u4EE4\u3002\u8F93\u5165 /help \u67E5\u770B\u53EF\u7528\u547D\u4EE4\u5217\u8868\u3002"
  },
  es: {
    welcome: "\xA1Bienvenido al bot de GPT en Telegram!",
    unauthorized: "Lo siento, no est\xE1s autorizado para usar este bot.",
    error: "Ocurri\xF3 un error. Por favor, int\xE9ntalo de nuevo.",
    current_language: "Tu idioma actual es: Espa\xF1ol",
    language_changed: "El idioma ha sido cambiado a: ",
    new_conversation: "Iniciando una nueva conversaci\xF3n. El contexto anterior ha sido borrado.",
    no_history: "No se encontr\xF3 historial de conversaci\xF3n.",
    history_summary: "Aqu\xED tienes un resumen de tu historial de conversaci\xF3n:",
    current_model: "Tu modelo actual es: ",
    available_models: "Modelos disponibles: ",
    model_changed: "El modelo ha sido cambiado a: ",
    help_intro: "Estos son los comandos disponibles:",
    start_description: "Iniciar el bot",
    language_description: "Establecer tu idioma preferido",
    new_description: "Iniciar una nueva conversaci\xF3n",
    history_description: "Resumir el historial de conversaci\xF3n",
    switchmodel_description: "Cambiar el modelo actual",
    help_description: "Mostrar comandos disponibles y sus descripciones",
    choose_language: "Por favor, elige tu idioma preferido:",
    choose_model: "Por favor, elige un modelo:",
    language_en: "Ingl\xE9s",
    language_zh: "Chino",
    language_es: "Espa\xF1ol",
    image_prompt_required: "Por favor, proporcione una descripci\xF3n para la imagen que desea generar.",
    image_generation_error: "Lo siento, hubo un error al generar la imagen. Por favor, int\xE9ntelo de nuevo m\xE1s tarde.",
    img_description: "Generar una imagen usando DALL\xB7E. Formato: /img <descripci\xF3n> [tama\xF1o]",
    invalid_size: "Tama\xF1o de imagen no v\xE1lido. Por favor, use uno de los siguientes tama\xF1os: ",
    flux_description: "Generar una imagen usando Flux",
    flux_usage: "Uso: /flux <descripci\xF3n> [relaci\xF3n de aspecto]. Las relaciones de aspecto v\xE1lidas son: 1:1 (predeterminado), 1:2, 3:2, 3:4, 16:9, 9:16",
    invalid_aspect_ratio: "Relaci\xF3n de aspecto no v\xE1lida. Las opciones v\xE1lidas son: ",
    original_prompt: "\u{1F3A8} Prompt Original",
    prompt_generation_model: "\u{1F4AC} Modelo de Generaci\xF3n de Prompts",
    optimized_prompt: "\u{1F310} Prompt Optimizado",
    image_specs: "\u{1F4D0} Especificaciones de la Imagen",
    command_not_found: "Comando no encontrado. Escribe /help para ver una lista de comandos disponibles."
  }
};
function translate(key, language = "en") {
  return translations[language][key] || translations["en"][key];
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
      console.error("Flux API returned no image");
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
    console.log(`Generating response with Gemini model: ${useModel}`);
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
    console.log("Request body:", JSON.stringify(requestBody, null, 2));
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
    console.log("Gemini API response received");
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated from Gemini API");
    }
    const generatedText = data.candidates[0].content.parts[0].text.trim();
    console.log(`Generated text length: ${generatedText.length}`);
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
var gemini_default = GeminiAPI;

// src/config/commands.ts
var commands = [
  {
    name: "start",
    description: "Start the bot",
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
    description: "Set your preferred language",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      const currentLanguage = await bot.getUserLanguage(userId);
      const keyboard = {
        inline_keyboard: [
          [
            { text: "\u{1F1FA}\u{1F1F8} English", callback_data: "lang_en" },
            { text: "\u{1F1E8}\u{1F1F3} \u4E2D\u6587", callback_data: "lang_zh" },
            { text: "\u{1F1EA}\u{1F1F8} Espa\xF1ol", callback_data: "lang_es" }
          ]
        ]
      };
      await bot.sendMessage(chatId, translate("choose_language", currentLanguage), { reply_markup: JSON.stringify(keyboard) });
    }
  },
  {
    name: "switchmodel",
    description: "Switch the current model",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const availableModels = [
        ...bot.getAvailableModels(),
        ...new gemini_default(bot["env"]).getAvailableModels()
      ];
      const keyboard = {
        inline_keyboard: availableModels.map((model) => [{ text: model, callback_data: `model_${model}` }])
      };
      await bot.sendMessage(chatId, translate("choose_model", language), { reply_markup: JSON.stringify(keyboard) });
    }
  },
  {
    name: "new",
    description: "Start a new conversation",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      await bot.clearContext(userId);
    }
  },
  {
    name: "history",
    description: "Summarize conversation history",
    action: async (chatId, bot, args) => {
      const userId = chatId.toString();
      const language = await bot.getUserLanguage(userId);
      const summary = await bot.summarizeHistory(userId);
      await bot.sendMessage(chatId, summary || translate("no_history", language));
    }
  },
  {
    name: "help",
    description: "Show available commands and their descriptions",
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
    description: "Generate an image using DALL\xB7E",
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
    description: "Generate an image using Flux",
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
};

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
  }
  async initializeModelAPI(userId) {
    const currentModel = await this.getCurrentModel(userId);
    console.log(`Initializing API for model: ${currentModel}`);
    if (currentModel.startsWith("gemini-")) {
      return new gemini_default(this.env);
    }
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
            console.log(`Current modelAPI type: ${this.modelAPI.constructor.name}`);
            console.log(`Generating response with model: ${currentModel}`);
            const response = await this.modelAPI.generateResponse(messages, currentModel);
            console.log(`Generated response length: ${response.length}`);
            const formattedResponse = this.formatResponse(response);
            console.log(`Formatted response length: ${formattedResponse.length}`);
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
    console.log(`Current modelAPI type: ${this.modelAPI.constructor.name}`);
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
      "es": "Spanish"
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
};
var telegram_default = TelegramBot;

// src/index.ts
var src_default = {
  async fetch(request, env, ctx) {
    const bot = new telegram_default(env);
    const url = new URL(request.url);
    console.log(`Received request for path: ${url.pathname}`);
    try {
      if (url.pathname === "/webhook") {
        console.log("Processing webhook request");
        return await bot.handleWebhook(request);
      }
      if (url.pathname === "/" || url.pathname === "") {
        console.log("Serving root path");
        return new Response("Hello! This is your Telegram bot worker.", {
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      }
      console.log("Path not found");
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
