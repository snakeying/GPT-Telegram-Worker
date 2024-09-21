export interface Env {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL: string;
  OPENAI_MODELS: string;
  DEFAULT_MODEL: string;
  AZURE_OPENAI_API_KEY: string;
  AZURE_OPENAI_ENDPOINT: string;
  AZURE_OPENAI_MODELS: string;
  TELEGRAM_BOT_TOKEN: string;
  WHITELISTED_USERS: string;
  DALL_E_MODEL: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REST_TOKEN: string;
  SYSTEM_INIT_MESSAGE: string;
  SYSTEM_INIT_MESSAGE_ROLE: string;
  GEMINI_API_KEY: string;
  GOOGLE_MODELS: string;
  GEMINI_ENDPOINT: string;
  GROQ_API_KEY: string;
  GROQ_MODELS: string;
  MAX_HISTORY_LENGTH: string;
  CLAUDE_API_KEY: string;
  CLAUDE_MODELS: string;
  CLAUDE_ENDPOINT: string;
}

export const getConfig = (env: Env) => ({
  OPENAI_API_KEY: env.OPENAI_API_KEY || '',
  OPENAI_BASE_URL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  OPENAI_MODELS: (env.OPENAI_MODELS || '').split(',').map(model => model.trim()),
  DEFAULT_MODEL: env.DEFAULT_MODEL || env.OPENAI_MODELS?.split(',')[0]?.trim() || '',
  AZURE_OPENAI_API_KEY: env.AZURE_OPENAI_API_KEY || '',
  AZURE_OPENAI_ENDPOINT: env.AZURE_OPENAI_ENDPOINT || '',
  AZURE_OPENAI_MODELS: (env.AZURE_OPENAI_MODELS || '').split(',').map(model => model.trim()),
  TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN || '',
  WHITELISTED_USERS: (env.WHITELISTED_USERS || '').split(',').map(id => id.trim()),
  DALL_E_MODEL: env.DALL_E_MODEL || 'dall-e-3',
  UPSTASH_REDIS_REST_URL: env.UPSTASH_REDIS_REST_URL || '',
  UPSTASH_REST_TOKEN: env.UPSTASH_REST_TOKEN || '',
  SYSTEM_INIT_MESSAGE: env.SYSTEM_INIT_MESSAGE || 'You are a helpful assistant.',
  SYSTEM_INIT_MESSAGE_ROLE: env.SYSTEM_INIT_MESSAGE_ROLE || 'system',
  GEMINI_API_KEY: env.GEMINI_API_KEY || '',
  GOOGLE_MODELS: (env.GOOGLE_MODELS || '').split(',').map(model => model.trim()),
  GEMINI_ENDPOINT: env.GEMINI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models',
  GROQ_API_KEY: env.GROQ_API_KEY || '',
  GROQ_MODELS: (env.GROQ_MODELS || '').split(',').map(model => model.trim()),
  MAX_HISTORY_LENGTH: parseInt(env.MAX_HISTORY_LENGTH || '50', 10),
  CLAUDE_API_KEY: env.CLAUDE_API_KEY || '',
  CLAUDE_MODELS: (env.CLAUDE_MODELS || '').split(',').map(model => model.trim()),
  CLAUDE_ENDPOINT: env.CLAUDE_ENDPOINT || 'https://api.anthropic.com/v1/chat/completions',
});

export type Config = ReturnType<typeof getConfig>;