export interface Env {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL: string;
  OPENAI_MODELS: string; // Comma-separated list of available OpenAI models
  TELEGRAM_BOT_TOKEN: string;
  WHITELISTED_USERS: string; // Comma-separated list of allowed Telegram user IDs
  SYSTEM_INIT_MESSAGE: string;
  SYSTEM_INIT_MESSAGE_ROLE: string;
  DEFAULT_MODEL?: string; // Optional default model
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  DALL_E_MODEL?: string;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  FLUX_STEPS: string;
  PROMPT_OPTIMIZATION?: string;
  EXTERNAL_API_BASE?: string;
  EXTERNAL_MODEL?: string;
  EXTERNAL_API_KEY?: string;
  GOOGLE_MODEL_KEY: string;
  GOOGLE_MODEL_BASEURL?: string;
  GOOGLE_MODELS: string;
  GROQ_API_KEY: string;
  GROQ_MODELS: string;
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
  defaultModel: env.DEFAULT_MODEL,
  upstashRedisRestUrl: env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: env.UPSTASH_REDIS_REST_TOKEN,
  dallEModel: getEnvOrDefault(env, 'DALL_E_MODEL', 'dall-e-3'),
  // TTL 配置（以秒为单位）
  languageTTL: 60 * 60 * 24 * 365, // 1 year
  contextTTL: 60 * 60 * 24 * 30, // 30 days
  cloudflareApiToken: env.CLOUDFLARE_API_TOKEN,
  cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
  fluxSteps: parseInt(getEnvOrDefault(env, 'FLUX_STEPS', '4')),
  promptOptimization: getEnvOrDefault(env, 'PROMPT_OPTIMIZATION', 'false') === 'true',
  externalApiBase: env.EXTERNAL_API_BASE,
  externalModel: env.EXTERNAL_MODEL,
  externalApiKey: env.EXTERNAL_API_KEY,
  googleModelKey: env.GOOGLE_MODEL_KEY,
  googleModelBaseUrl: getEnvOrDefault(env, 'GOOGLE_MODEL_BASEURL', 'https://generativelanguage.googleapis.com/v1beta'),
  googleModels: env.GOOGLE_MODELS.split(',').map(model => model.trim()),
  groqApiKey: env.GROQ_API_KEY,
  groqModels: env.GROQ_MODELS.split(',').map(model => model.trim()),
});