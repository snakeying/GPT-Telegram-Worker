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
  CLAUDE_API_KEY: string;
  CLAUDE_MODELS: string;
  CLAUDE_ENDPOINT?: string;
  AZURE_API_KEY: string;       // Azure API 密钥
  AZURE_MODELS: string;        // 逗号分隔的 Azure 模型列表
  AZURE_ENDPOINT: string;      // Azure API 端点
  OPENAI_COMPATIBLE_KEY?: string;
  OPENAI_COMPATIBLE_URL?: string;
  OPENAI_COMPATIBLE_MODELS?: string;
}

const getEnvOrDefault = (env: Env, key: keyof Env, defaultValue: string): string => {
  return (env[key] as string) || defaultValue;
};

export const getConfig = (env: Env) => {
  // 检查是否至少有一个模型的 API 密钥被设置
  const hasOpenAI = !!env.OPENAI_API_KEY;
  const hasGoogle = !!env.GOOGLE_MODEL_KEY;
  const hasGroq = !!env.GROQ_API_KEY;
  const hasClaude = !!env.CLAUDE_API_KEY;
  const hasAzure = !!env.AZURE_API_KEY;
  const hasOpenAICompatible = !!env.OPENAI_COMPATIBLE_KEY && !!env.OPENAI_COMPATIBLE_URL;

  if (!hasOpenAI && !hasGoogle && !hasGroq && !hasClaude && !hasAzure && !hasOpenAICompatible) {
    throw new Error('At least one model API key must be set (OpenAI, Google, Groq, Claude, Azure, or OpenAI Compatible)');
  }

  return {
    openaiApiKey: env.OPENAI_API_KEY,
    openaiBaseUrl: getEnvOrDefault(env, 'OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    openaiModels: env.OPENAI_MODELS ? env.OPENAI_MODELS.split(',').map(model => model.trim()) : [],
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    whitelistedUsers: env.WHITELISTED_USERS ? env.WHITELISTED_USERS.split(',').map(id => id.trim()) : [],
    systemInitMessage: getEnvOrDefault(env, 'SYSTEM_INIT_MESSAGE', 'You are a helpful assistant.'),
    systemInitMessageRole: getEnvOrDefault(env, 'SYSTEM_INIT_MESSAGE_ROLE', 'system'),
    defaultModel: env.DEFAULT_MODEL,
    upstashRedisRestUrl: env.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: env.UPSTASH_REDIS_REST_TOKEN,
    dallEModel: getEnvOrDefault(env, 'DALL_E_MODEL', 'dall-e-3'),
    languageTTL: 60 * 60 * 24 * 365,
    contextTTL: 60 * 60 * 24 * 30,
    cloudflareApiToken: env.CLOUDFLARE_API_TOKEN,
    cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
    fluxSteps: parseInt(getEnvOrDefault(env, 'FLUX_STEPS', '4')),
    promptOptimization: getEnvOrDefault(env, 'PROMPT_OPTIMIZATION', 'false') === 'true',
    externalApiBase: env.EXTERNAL_API_BASE,
    externalModel: env.EXTERNAL_MODEL,
    externalApiKey: env.EXTERNAL_API_KEY,
    googleModelKey: env.GOOGLE_MODEL_KEY,
    googleModelBaseUrl: getEnvOrDefault(env, 'GOOGLE_MODEL_BASEURL', 'https://generativelanguage.googleapis.com/v1beta'),
    googleModels: env.GOOGLE_MODELS ? env.GOOGLE_MODELS.split(',').map(model => model.trim()) : [],
    groqApiKey: env.GROQ_API_KEY,
    groqModels: env.GROQ_MODELS ? env.GROQ_MODELS.split(',').map(model => model.trim()) : [],
    claudeApiKey: env.CLAUDE_API_KEY,
    claudeModels: env.CLAUDE_MODELS ? env.CLAUDE_MODELS.split(',').map(model => model.trim()) : [],
    claudeEndpoint: getEnvOrDefault(env, 'CLAUDE_ENDPOINT', 'https://api.anthropic.com/v1'),
    azureApiKey: env.AZURE_API_KEY,
    azureModels: env.AZURE_MODELS ? env.AZURE_MODELS.split(',').map(model => model.trim()) : [],
    azureEndpoint: env.AZURE_ENDPOINT,
    openaiCompatibleKey: env.OPENAI_COMPATIBLE_KEY,
    openaiCompatibleUrl: env.OPENAI_COMPATIBLE_URL,
    openaiCompatibleModels: env.OPENAI_COMPATIBLE_MODELS ? env.OPENAI_COMPATIBLE_MODELS.split(',').map(model => model.trim()) : [],
  };
};
