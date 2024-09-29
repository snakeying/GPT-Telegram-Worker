export interface Env {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL: string;
  OPENAI_MODELS: string; // Comma-separated list of available OpenAI models
  TELEGRAM_BOT_TOKEN: string;
  WHITELISTED_USERS: string; // Comma-separated list of allowed Telegram user IDs
  SYSTEM_INIT_MESSAGE: string;
  SYSTEM_INIT_MESSAGE_ROLE: string;
  DEFAULT_MODEL?: string; // Optional default model
}

const getEnvOrDefault = (env: Env, key: keyof Env, defaultValue: string): string => {
  return (env[key] as string) || defaultValue;
};

export const getConfig = (env: Env) => ({
  openaiApiKey: env.OPENAI_API_KEY,
  openaiBaseUrl: getEnvOrDefault(env, 'OPENAI_BASE_URL', 'https://api.openai.com/v1'),
  openaiModels: env.OPENAI_MODELS.split(',').map(model => model.trim()),
  telegramBotToken: env.TELEGRAM_BOT_TOKEN,
  whitelistedUsers: env.WHITELISTED_USERS.split(',').map(id => id.trim()),
  systemInitMessage: getEnvOrDefault(env, 'SYSTEM_INIT_MESSAGE', 'You are a helpful assistant.'),
  systemInitMessageRole: getEnvOrDefault(env, 'SYSTEM_INIT_MESSAGE_ROLE', 'system'),
  defaultModel: env.DEFAULT_MODEL
});