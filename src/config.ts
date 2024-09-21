interface Config {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL: string;
  OPENAI_MODELS: string[];
  DEFAULT_MODEL: string | null;
  AZURE_OPENAI_API_KEY: string;
  AZURE_OPENAI_ENDPOINT: string;
  AZURE_OPENAI_MODELS: string[];
  TELEGRAM_BOT_TOKEN: string;
  WHITELISTED_USERS: number[];
  DALL_E_MODEL: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  SYSTEM_INIT_MESSAGE: string;
  SYSTEM_INIT_MESSAGE_ROLE: string;
  GEMINI_API_KEY: string;
  GOOGLE_MODELS: string[];
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_GATEWAY_ID: string;
  GROQ_API_KEY: string;
  GROQ_MODELS: string[];
  MAX_HISTORY_LENGTH: number;
  CLAUDE_API_KEY: string;
  CLAUDE_MODELS: string[];
  CLAUDE_ENDPOINT: string;
}

const config: Config = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  OPENAI_MODELS: process.env.OPENAI_MODELS ? process.env.OPENAI_MODELS.split(',').map(model => model.trim()) : [],
  DEFAULT_MODEL: process.env.OPENAI_MODELS ? process.env.OPENAI_MODELS.split(',').map(model => model.trim())[0] : null,
  AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || '',
  AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || '',
  AZURE_OPENAI_MODELS: process.env.AZURE_OPENAI_MODELS ? process.env.AZURE_OPENAI_MODELS.split(',').map(model => model.trim()) : [],
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  WHITELISTED_USERS: process.env.WHITELISTED_USERS ? process.env.WHITELISTED_USERS.split(',').map(id => parseInt(id.trim())) : [],
  DALL_E_MODEL: process.env.DALL_E_MODEL || "dall-e-3",
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REST_TOKEN || '',
  SYSTEM_INIT_MESSAGE: process.env.SYSTEM_INIT_MESSAGE || 'You are a helpful assistant.',
  SYSTEM_INIT_MESSAGE_ROLE: process.env.SYSTEM_INIT_MESSAGE_ROLE || 'system',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GOOGLE_MODELS: process.env.GOOGLE_MODELS ? process.env.GOOGLE_MODELS.split(',').map(model => model.trim()) : [],
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '',
  CLOUDFLARE_GATEWAY_ID: process.env.CLOUDFLARE_GATEWAY_ID || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODELS: process.env.GROQ_MODELS ? process.env.GROQ_MODELS.split(',').map(model => model.trim()) : [],
  MAX_HISTORY_LENGTH: parseInt(process.env.MAX_HISTORY_LENGTH || '50'),
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  CLAUDE_MODELS: process.env.CLAUDE_MODELS ? process.env.CLAUDE_MODELS.split(',').map(model => model.trim()) : [],
  CLAUDE_ENDPOINT: process.env.CLAUDE_ENDPOINT || 'https://api.anthropic.com/v1/chat/completions',
};

export default config;