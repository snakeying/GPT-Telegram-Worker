# 🤖💬 Telegram GPT Worker - Multifunctional AI Assistant

[English](./README.md) | [简体中文](./docs/README.zh-cn.md) | [繁體中文](./docs/README.zh-hant.md) | [日本語](./docs/README.ja.md) | [Español](./docs/README.es.md) | [Français](./docs/README.fr.md) | [Русский](./docs/README.ru.md) | [Deutsch](./docs/README.de.md)

## 📖 Project Overview

Welcome to Telegram GPT Worker! 👋 This is a highly efficient Telegram bot developed using TypeScript. It supports multiple languages and AI models, deployed on Cloudflare Workers, providing users with a fast and scalable service experience.

## 🌟 Key Features

1. 🧠 **Multi-model Support**: Integrates multiple AI models including OpenAI, Google Gemini, Anthropic Claude, Groq, and Azure OpenAI.
2. 💬 **Intelligent Conversation**: Equipped with context memory capability, ensuring smooth and natural dialogues.
3. 🎨 **Image Generation**: Supports text-to-image generation using DALL·E and Cloudflare Flux technologies.
4. 🌍 **Multilingual Support**: Built-in i18n functionality, supporting 8 languages to meet diverse needs.
5. 🔒 **User Permission Management**: Controls access through whitelist functionality, enhancing security.
6. ☁️ **High-performance Deployment**: Utilizes Cloudflare Workers' edge computing capabilities for rapid response.
7. 🗄️ **Efficient Data Management**: Uses Redis for data caching and management, ensuring efficient processing.
8. 🔧 **Flux Prompt Optimization**: Optional feature that optimizes image generation prompts for the Flux model through an external API.

## 📋 System Requirements

Before getting started, please ensure you have the following:

- [Cloudflare](https://dash.cloudflare.com/) account
- Telegram account and Bot Token
- [Upstash](https://upstash.com/) Redis database (with [Eviction](https://upstash.com/docs/redis/features/eviction) feature enabled)
- API key for at least one AI service

## 🚀 Quick Start

1. Clone the project repository
2. Configure the necessary environment variables
3. Deploy to Cloudflare Workers
4. Set up the Telegram Webhook

For detailed deployment steps, please refer to the tutorial below.

## 📝 Available Commands

- `/start` - Start the bot
- `/language` - Switch language
- `/switchmodel` - Switch AI model
- `/new` - Start a new conversation
- `/history` - Get conversation history summary
- `/help` - Get help information
- `/img` - Generate image (DALL-E)
- `/flux` - Generate image (Cloudflare Flux)

## 📁 Project Structure

```plaintext
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Azure API interaction
│   │   ├── claude.ts              # Claude API interaction
│   │   ├── flux-cf.ts             # Cloudflare AI image generation interface
│   │   ├── gemini.ts              # Google Gemini API interaction
│   │   ├── groq.ts                # Groq API interaction
│   │   ├── image_generation.ts    # DALL·E image generation interface
│   │   ├── model_api_interface.ts # Model API standard interface
│   │   ├── openai_api.ts          # OpenAI API interaction
│   │   └── telegram.ts            # Telegram bot logic
│   ├── /config                    # Configuration files
│   │   └── commands.ts            # Bot command configuration
│   ├── /utils
│   │   ├── helpers.ts             # Utility functions
│   │   ├── i18n.ts                # Multilingual support
│   │   └── redis.ts               # Redis operations
│   ├── index.ts                   # Entry file
│   └── env.ts                     # Environment variable configuration
├── /types                         # Type definition files
│   └── telegram.d.ts              # Telegram API type definitions
├── wrangler.toml                  # Cloudflare Worker configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Project dependencies
└── README.md                      # Project documentation
```

## 🚀 Detailed Tutorial

### Deploying to Cloudflare Workers

#### Using Wrangler CLI

1. Install Wrangler CLI:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. Log in to your Cloudflare account:

   ```bash
   wrangler login
   ```

3. Create a new Workers project:

   ```bash
   wrangler init telegram-bot
   ```

4. Copy the `dist/index.js` file into your project.

5. Edit the `wrangler.toml` file to configure the project:

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

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select "Workers & Pages".
3. Click "Create application" and choose "Create Worker".
4. Name your Worker and click "Deploy".
5. Copy and paste the contents of `dist/index.js` into the editor, then save the file.
6. Add the necessary environment variables in the "Settings" section.

### Configuring Telegram Webhook

Use the Telegram Bot API to set up the Webhook. URL example:

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev
```

### Local Development

1. Clone the project:

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

5. Start the bot:

   ```bash
   npm start
   ```

## 🔧 Environment Variables

| Variable Name | Description | Default Value | Example |
|---------------|-------------|---------------|---------|
| OPENAI_API_KEY | OpenAI API key | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | OpenAI API base URL | https://api.openai.com/v1 | https://your-custom-endpoint.com/v1 |
| OPENAI_MODELS | List of available OpenAI models | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Telegram bot token | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | List of user IDs allowed to use the bot | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | System initialization message | You are a helpful assistant. | You are a helpful assistant. |
| SYSTEM_INIT_MESSAGE_ROLE | System initialization message role | system | system |
| DEFAULT_MODEL | Default AI model to use | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | Upstash Redis REST URL | - | https://your-redis-url.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis REST token | - | your-redis-token |
| DALL_E_MODEL | DALL-E model version | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Cloudflare API token | - | your-cloudflare-api-token |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare account ID | - | your-cloudflare-account-id |
| FLUX_STEPS | Number of Flux generation steps | 4 | 4-8, maximum steps is 8 |
| PROMPT_OPTIMIZATION | Enable prompt optimization | false | true |
| EXTERNAL_API_BASE | External API base URL | - | https://external-api.com |
| EXTERNAL_MODEL | External model name | - | external-model-name |
| EXTERNAL_API_KEY | External API key | - | external-api-key |
| GOOGLE_MODEL_KEY | Google AI model API key | - | your-google-api-key |
| GOOGLE_MODEL_BASEURL | Google AI model API base URL | https://generativelanguage.googleapis.com/v1beta | https://your-custom-google-endpoint.com |
| GOOGLE_MODELS | List of available Google AI models | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Groq API key | - | your-groq-api-key |
| ANTHROPIC_API_KEY | Anthropic API key | - | your-anthropic-api-key |
| ANTHROPIC_BASE_URL | Anthropic API base URL | https://api.anthropic.com | https://your-custom-anthropic-endpoint.com |

Note: Some variables need to be manually configured and have no default values.

## ⚠️ Important Notes

1. 🚦 **Use API quotas responsibly**: Be especially mindful of usage limits, particularly for image generation services.
2. 🔐 **Protect sensitive information**: Safeguard your environment variables and API keys.
3. 🧠 **Understand model characteristics**: Choose the AI model that best fits your use case.
4. 🔄 **Stay updated**: Regularly update code and features for optimal performance.
5. 🛡️ **Security first**: Update API keys regularly and follow the principle of least privilege.
6. 🎨 **Flux prompt optimization**: When enabling PROMPT_OPTIMIZATION, ensure correct configuration of EXTERNAL_API_BASE, EXTERNAL_MODEL, and EXTERNAL_API_KEY.

## 🚀 Flux Prompt Optimization

When the PROMPT_OPTIMIZATION environment variable is set to true, the Flux image generation feature uses an external API to optimize prompts. This feature works through the following steps:

1. The user provides the original prompt.
2. The system uses the external API configured with EXTERNAL_API_BASE, EXTERNAL_MODEL, and EXTERNAL_API_KEY to optimize the prompt.
3. The optimized prompt is then used by the Flux model to generate the image.

This feature can help generate more precise images that better align with the characteristics of the Flux model. To use this feature, ensure all relevant environment variables are correctly configured.

## 🔧 Troubleshooting

- Bot not responding? Check the Webhook settings and environment variable configuration.
- Encountering API limits? Review your API quota usage.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2024 [snakeying]
