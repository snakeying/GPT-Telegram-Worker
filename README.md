# 🤖 Telegram GPT Worker Bot

## 📖 Project Overview

Welcome to the Telegram GPT Worker project! This is a Telegram bot built using TypeScript that supports multiple languages and AI models. It can be deployed on Cloudflare Workers to provide efficient, scalable services.

## 🌟 Key Features

1. 🧠 **Multi-model Support**: Supports a variety of AI models including OpenAI, Google Gemini, Anthropic Claude, Groq, and Azure OpenAI.
2. 💬 **Intelligent Conversations**: Remembers conversation context for a smooth and natural chat experience.
3. 🎨 **Image Generation**: Generates images based on text prompts, with integrated DALL·E and Cloudflare Flux models.
4. 🌍 **Multilingual Support**: Built-in i18n functionality supporting 8 languages.
5. 🔒 **User Whitelisting**: Restricts access via a whitelist feature to enhance security.
6. ☁️ **Cloudflare Workers Deployment**: Leverages Cloudflare edge computing for fast response times.
7. 🗄️ **Redis Data Storage**: Caches and manages data through Redis.

### Prerequisites

- [Cloudflare](https://dash.cloudflare.com/) account
- Telegram account and Bot Token
- [Upstash](https://upstash.com/) with Redis database and [Eviction](https://upstash.com/docs/redis/features/eviction) enabled
- At least one AI service API key

## 🚀 Quick Start

1. Clone the repository
2. Set up environment variables
3. Deploy to Cloudflare Workers
4. Set up Telegram Webhook

Webhook example:

```bash
https://api.telegram.org/bot<Your-Bot-Token>/setWebhook?url=https://<your-worker-subdomain>.workers.dev/webhook
```

For detailed steps, refer to the tutorial below.

## 📝 Available Commands

- `/start` - Start the bot
- `/language` - Set language
- `/switchmodel` - Switch AI model
- `/new` - Start a new conversation
- `/history` - Get a summary of the conversation history
- `/help` - Get help information
- `/img` - Generate image (DALL·E)
- `/flux` - Generate image (Cloudflare Flux)

## 📁 Project Directory Structure

```plaintext
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Azure API integration
│   │   ├── claude.ts              # Claude API integration
│   │   ├── flux-cf.ts             # Cloudflare AI image generation
│   │   ├── gemini.ts              # Google Gemini API integration
│   │   ├── groq.ts                # Groq API integration
│   │   ├── image_generation.ts    # DALL·E image generation
│   │   ├── model_api_interface.ts # Model API standard interface
│   │   ├── openai_api.ts          # OpenAI API integration
│   │   └── telegram.ts            # Telegram bot logic
│   ├── /config                    # Configuration files
│   │   └── commands.ts            # Bot commands configuration
│   ├── /utils
│   │   ├── helpers.ts             # Utility functions
│   │   ├── i18n.ts                # Multilingual support
│   │   └── redis.ts               # Redis operations
│   ├── index.ts                   # Entry file
│   └── env.ts                     # Environment variable configuration
├── /types                         # Type definitions
│   └── telegram.d.ts              # Telegram API type definitions
├── wrangler.toml                  # Cloudflare Worker configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Project dependencies
└── README.md                      # Project documentation
```

## 🚀 Detailed Usage Guide

### Deploy to Cloudflare Workers

#### Using Wrangler CLI

1. Install the Wrangler CLI:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. Log into your Cloudflare account:

   ```bash
   wrangler login
   ```

3. Create a new Workers project:

   ```bash
   wrangler init telegram-bot
   ```

4. Copy the `dist/index.js` file into the project.

5. Edit `wrangler.toml` to configure the project:

   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "your_account_id"
   workers_dev = true
   ```

6. Deploy to Cloudflare Workers:

   ```bash
   wrangler publish
   ```

#### Using Cloudflare Dashboard

1. Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select "Workers & Pages."
3. Click "Create application" and select "Create Worker."
4. Name the Worker and click "Deploy."
5. Paste `dist/index.js` into the editor and save.
6. Add the necessary environment variables in "Settings."

### Set Up Telegram Webhook

Use the Telegram Bot API to set the Webhook, URL example:

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev
```

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/telegram-bot.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables.

4. Compile TypeScript:

   ```bash
   npm run build
   ```

5. Run the bot:

   ```bash
   npm start
   ```

## 🔧 Environment Variables

| Variable Name           | Description                               | Default Value                         | Example                                          |
|-------------------------|-------------------------------------------|---------------------------------------|--------------------------------------------------|
| OPENAI_API_KEY           | OpenAI API key                            | -                                     | sk-abcdefghijklmnopqrstuvwxyz123456               |
| OPENAI_BASE_URL          | OpenAI API base URL                       | https://api.openai.com/v1             | https://your-custom-endpoint.com/v1              |
| OPENAI_MODELS            | List of available OpenAI models           | -                                     | gpt-3.5-turbo,gpt-4                              |
| TELEGRAM_BOT_TOKEN       | Telegram bot token                        | -                                     | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11        |
| WHITELISTED_USERS        | List of user IDs allowed to use the bot   | -                                     | 12345678,87654321                                |
| SYSTEM_INIT_MESSAGE      | System initialization message             | You are a helpful assistant.          | You are a helpful assistant.                     |
| SYSTEM_INIT_MESSAGE_ROLE | Role for the system init message          | system                                | system                                           |
| DEFAULT_MODEL            | Default AI model to use                   | -                                     | gpt-3.5-turbo                                    |
| UPSTASH_REDIS_REST_URL   | Upstash Redis REST URL                    | -                                     | https://your-redis-url.upstash.io                |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis REST token                  | -                                     | your-redis-token                                 |
| DALL_E_MODEL             | DALL-E model version                      | dall-e-3                              | dall-e-3                                         |
| CLOUDFLARE_API_TOKEN     | Cloudflare API token                      | -                                     | your-cloudflare-api-token                        |
| CLOUDFLARE_ACCOUNT_ID    | Cloudflare account ID                     | -                                     | your-cloudflare-account-id                       |
| FLUX_STEPS               | Number of Flux steps                      | 4                                     | 4                                                |
| PROMPT_OPTIMIZATION      | Enable prompt optimization                | false                                 | true                                             |
| EXTERNAL_API_BASE        | External API base URL                     | -                                     | https://external-api.com                         |
| EXTERNAL_MODEL           | External model name                       | -                                     | external-model-name                              |
| EXTERNAL_API_KEY         | External API key                          | -                                     | external-api-key                                 |
| GOOGLE_MODEL_KEY         | Google AI model API key                   | -                                     | your-google-api-key                              |
| GOOGLE_MODEL_BASEURL     | Google AI model API base URL              | https://generativelanguage.googleapis.com/v1beta | https://your-custom-google-endpoint.com |
| GOOGLE_MODELS            | List of available Google AI models        | -                                     | gemini-pro,gemini-pro-vision                     |
| GROQ_API_KEY             | Groq API key                              | -                                     | your-groq-api-key                                |
| GROQ_MODELS              | List of available Groq models             | -                                     | mixtral-8x7b-32768,llama2-70b-4096               |
| CLAUDE_API_KEY           | Claude API key                            | -                                     | your-claude-api-key                              |
| CLAUDE_MODELS            | List of available Claude models           | -                                     | claude-2,claude-instant-1                        |
| CLAUDE_ENDPOINT          | Claude API endpoint                       | https://api.anthropic.com/v1          | https://your-custom-claude-endpoint.com          |
| AZURE_API_KEY            | Azure OpenAI API key                      | -                                     | your-azure-api-key                               |
| AZURE_MODELS             | List of available Azure OpenAI models     | -                                     | gpt-35-turbo,g

pt-4                               |
| AZURE_ENDPOINT           | Azure OpenAI API endpoint                 | -                                     | https://your-azure-endpoint.openai.azure.com     |

Note: Some variables must be manually configured and have no default values.

## ⚠️ Notes

1. **Use API quotas wisely**: Especially for image generation services to avoid hitting limits.
2. **Keep environment variables and API keys safe**: Ensure sensitive information security.
3. **Understand different AI models**: Choose the model that best fits your use case.
4. **Keep updated**: Regularly update the code and features.
5. **Ensure security**: Rotate API keys regularly and follow the principle of least privilege.

## 🔧 Troubleshooting

- No response? Check your Webhook setup and environment variables.
- API limits? Review your quota usage.

## 📄 License

MIT License

Copyright (c) 2024 [snakeying]
