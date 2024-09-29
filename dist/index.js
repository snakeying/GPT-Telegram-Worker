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
  defaultModel: env.DEFAULT_MODEL
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
    welcome: "Welcome to the GPT Telegram Bot! I'm here to assist you with any questions or tasks. Feel free to ask me anything!",
    unauthorized: "Sorry, you're not authorized to use this bot.",
    error: "Sorry, I couldn't generate a response. Please try again later."
  },
  zh: {
    welcome: "\u6B22\u8FCE\u4F7F\u7528GPT Telegram\u673A\u5668\u4EBA\uFF01\u6211\u968F\u65F6\u4E3A\u60A8\u89E3\u7B54\u95EE\u9898\u6216\u534F\u52A9\u5B8C\u6210\u4EFB\u52A1\u3002\u8BF7\u968F\u610F\u95EE\u6211\u4EFB\u4F55\u95EE\u9898\uFF01",
    unauthorized: "\u62B1\u6B49\uFF0C\u60A8\u6CA1\u6709\u6743\u9650\u4F7F\u7528\u6B64\u673A\u5668\u4EBA\u3002",
    error: "\u62B1\u6B49\uFF0C\u6211\u65E0\u6CD5\u751F\u6210\u56DE\u590D\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002"
  },
  es: {
    welcome: "\xA1Bienvenido al Bot de Telegram GPT! Estoy aqu\xED para ayudarte con cualquier pregunta o tarea. \xA1Si\xE9ntete libre de preguntarme cualquier cosa!",
    unauthorized: "Lo siento, no est\xE1s autorizado para usar este bot.",
    error: "Lo siento, no pude generar una respuesta. Por favor, int\xE9ntalo de nuevo m\xE1s tarde."
  }
};
function translate(key, language = "en") {
  return translations[language]?.[key] || translations["en"][key];
}

// src/config/commands.ts
var commands = [
  {
    name: "start",
    description: "Start the bot",
    action: async (chatId, bot) => {
      const language = "en";
      await bot.sendMessage(chatId, translate("welcome", language));
    }
  }
  // Add more commands here as needed
];

// src/api/telegram.ts
var TelegramBot = class {
  token;
  apiUrl;
  whitelistedUsers;
  openai;
  systemMessage;
  env;
  commands;
  constructor(env) {
    const config = getConfig(env);
    this.token = config.telegramBotToken;
    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    this.whitelistedUsers = config.whitelistedUsers.map(Number);
    this.openai = new openai_api_default(env);
    this.systemMessage = config.systemInitMessage;
    this.env = env;
    this.commands = commands;
  }
  async executeCommand(commandName, chatId) {
    const command = this.commands.find((cmd) => cmd.name === commandName);
    if (command) {
      await command.action(chatId, this);
    } else {
      console.log(`Unknown command: ${commandName}`);
    }
  }
  async sendMessage(chatId, text, parseMode = "Markdown") {
    const url = `${this.apiUrl}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
  async handleUpdate(update) {
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userId = update.message.from?.id;
      const text = update.message.text;
      const language = update.message.from?.language_code || "en";
      if (userId && this.isUserWhitelisted(userId)) {
        if (text.startsWith("/")) {
          const commandName = text.split(" ")[0].substring(1);
          await this.executeCommand(commandName, chatId);
        } else {
          try {
            await sendChatAction(chatId, "typing", this.env);
            const response = await this.openai.generateResponse([
              { role: "system", content: this.systemMessage },
              { role: "user", content: text }
            ]);
            const formattedResponse = this.formatResponse(response);
            await this.sendMessage(chatId, formattedResponse);
          } catch (error) {
            console.error("Error generating response:", error);
            await this.sendMessage(chatId, translate("error", language));
          }
        }
      } else {
        await this.sendMessage(chatId, translate("unauthorized", language));
      }
    }
  }
  async getChatMember(chatId) {
    const url = `${this.apiUrl}/getChatMember`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: chatId
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (!result.ok) {
      throw new Error("Failed to get chat member");
    }
    return result.result;
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
