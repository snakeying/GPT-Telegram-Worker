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

// src/api/telegram.ts
var TelegramBot = class {
  token;
  apiUrl;
  whitelistedUsers;
  openai;
  systemMessage;
  constructor(env) {
    const config = getConfig(env);
    this.token = config.telegramBotToken;
    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    this.whitelistedUsers = config.whitelistedUsers.map(Number);
    this.openai = new openai_api_default(env);
    this.systemMessage = config.systemInitMessage;
  }
  async sendMessage(chatId, text) {
    const url = `${this.apiUrl}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown"
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
      if (userId && this.isUserWhitelisted(userId)) {
        try {
          const response = await this.openai.generateResponse([
            { role: "system", content: this.systemMessage },
            { role: "user", content: text }
          ]);
          await this.sendMessage(chatId, response);
        } catch (error) {
          console.error("Error generating response:", error);
          await this.sendMessage(chatId, "Sorry, I couldn't generate a response. Please try again later.");
        }
      } else {
        await this.sendMessage(chatId, "Sorry, you're not authorized to use this bot.");
      }
    }
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
      return new Response("Internal Server Error", {
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
