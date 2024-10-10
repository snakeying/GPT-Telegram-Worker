# 🤖 Telegram GPT Worker 机器人

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 项目简介

欢迎来到 Telegram GPT Worker 项目！这是一个使用 TypeScript 构建的 Telegram 机器人，支持多种语言和 AI 模型，并可部署在 Cloudflare Workers 上，提供高效、可扩展的服务。

## 🌟 功能特色

1. 🧠 **多模型支持**：支持 OpenAI、Google Gemini、Anthropic Claude、Groq 和 Azure OpenAI 等多种 AI 模型。
2. 💬 **智能对话**：记住对话上下文，提供自然流畅的对话体验。
3. 🎨 **图像生成**：支持根据文字描述生成图像，集成 DALL·E 和 Cloudflare Flux 模型。
4. 🌍 **多语言支持**：内置 i18n 功能，支持 8 种语言。
5. 🔒 **用户白名单**：通过白名单功能限制访问，提升安全性。
6. ☁️ **Cloudflare Workers 部署**：利用 Cloudflare 边缘计算，提供快速响应。
7. 🗄️ **Redis 数据存储**：通过 Redis 进行数据缓存与管理。

### 前置要求

- [Cloudflare](https://dash.cloudflare.com/) 账号
- Telegram 账号和 Bot Token
- [Upstash](https://upstash.com/) 请选择 Redis 数据库并开启 [Eviction](https://upstash.com/docs/redis/features/eviction) 功能
- 至少一个 AI 服务的 API 密钥

## 🚀 快速开始

1. 克隆仓库
2. 设置环境变量
3. 部署到 Cloudflare Workers
4. 设置 Telegram Webhook

Webhook 示例：

```bash
https://api.telegram.org/bot<Your-Bot-Token>/setWebhook?url=https://<your-worker-subdomain>.workers.dev/webhook 
```

详细步骤请参考下方教程。

## 📝 可用命令

- `/start` - 启动机器人
- `/language` - 设置语言
- `/switchmodel` - 切换 AI 模型
- `/new` - 开始新对话
- `/history` - 获取对话历史摘要
- `/help` - 获取帮助信息
- `/img` - 生成图像 (DALL-E)
- `/flux` - 生成图像 (Cloudflare Flux)

## 📁 文件目录架构

```plaintext
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Azure API 交互
│   │   ├── claude.ts              # Claude API 交互
│   │   ├── flux-cf.ts             # Cloudflare AI 图像生成接口
│   │   ├── gemini.ts              # Google Gemini API 交互
│   │   ├── groq.ts                # Groq API 交互
│   │   ├── image_generation.ts    # DALL·E 图像生成接口
│   │   ├── model_api_interface.ts # 模型 API 标准接口
│   │   ├── openai_api.ts          # OpenAI API 交互
│   │   └── telegram.ts            # Telegram bot 逻辑
│   ├── /config                    # 配置文件
│   │   └── commands.ts            # bot 命令配置
│   ├── /utils
│   │   ├── helpers.ts             # 工具函数
│   │   ├── i18n.ts                # 多语言支持
│   │   └── redis.ts               # Redis 操作
│   ├── index.ts                   # 入口文件
│   └── env.ts                     # 环境变量配置
├── /types                         # 类型定义文件
│   └── telegram.d.ts              # Telegram API 类型定义
├── wrangler.toml                  # Cloudflare Worker 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json                   # 项目依赖
└── README.md                      # 项目说明
```

## 🚀 详细使用教程

### 部署到 Cloudflare Workers

#### 使用 Wrangler CLI

1. 安装 Wrangler CLI:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. 登录到 Cloudflare 账户:

   ```bash
   wrangler login
   ```

3. 创建新 Workers 项目:

   ```bash
   wrangler init telegram-bot
   ```

4. 复制 `dist/index.js` 文件到项目中。

5. 编辑 `wrangler.toml`，配置项目：

   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "your_account_id"
   workers_dev = true
   ```

6. 部署到 Cloudflare Workers:

   ```bash
   wrangler publish
   ```

#### 使用 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 选择 "Workers & Pages"。
3. 点击 "Create application" 并选择 "Create Worker"。
4. 为 Worker 命名并点击 "Deploy"。
5. 将 `dist/index.js` 粘贴到编辑器中并保存。
6. 在 "Settings" 中添加必要的环境变量。

### 设置 Telegram Webhook

使用 Telegram Bot API 设置 Webhook，URL 示例：

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev
```

### 本地开发

1. 克隆仓库:

   ```bash
   git clone https://github.com/your-username/telegram-bot.git
   ```

2. 安装依赖:

   ```bash
   npm install
   ```

3. 设置环境变量。

4. 编译 TypeScript:

   ```bash
   npm run build
   ```

5. 运行机器人:

   ```bash
   npm start
   ```

## 🔧 环境变量

| 变量名 | 描述 | 默认值 | 示例 |
|--------|------|--------|------|
| OPENAI_API_KEY | OpenAI API 密钥 | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | OpenAI API 基础 URL | https://api.openai.com/v1 | https://your-custom-endpoint.com/v1 |
| OPENAI_MODELS | 可用的 OpenAI 模型列表 | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Telegram 机器人令牌 | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | 允许使用机器人的用户 ID 列表 | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | 系统初始化消息 | You are a helpful assistant. | 您是一个有用的助手。 |
| SYSTEM_INIT_MESSAGE_ROLE | 系统初始化消息角色 | system | system |
| DEFAULT_MODEL | 默认使用的 AI 模型 | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | Upstash Redis REST URL | - | https://your-redis-url.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis REST 令牌 | - | your-redis-token |
| DALL_E_MODEL | DALL-E 模型版本 | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Cloudflare API 令牌 | - | your-cloudflare-api-token |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare 账户 ID | - | your-cloudflare-account-id |
| FLUX_STEPS | Flux 步骤数 | 4 | 4 |
| PROMPT_OPTIMIZATION | 是否启用提示优化 | false | true |
| EXTERNAL_API_BASE | 外部 API 基础 URL | - | https://external-api.com |
| EXTERNAL_MODEL | 外部模型名称 | - | external-model-name |
| EXTERNAL_API_KEY | 外部 API 密钥 | - | external-api-key |
| GOOGLE_MODEL_KEY | Google AI 模型 API 密钥 | - | your-google-api-key |
| GOOGLE_MODEL_BASEURL | Google AI 模型 API 基础 URL | https://generativelanguage.googleapis.com/v1beta | https://your-custom-google-endpoint.com |
| GOOGLE_MODELS | 可用的 Google AI 模型列表 | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Groq API 密钥 | - | your-groq-api-key |
| GROQ_MODELS | 可用的 Groq 模型列表 | - | mixtral-8x7b-32768,llama2-70b-4096 |
| CLAUDE_API_KEY | Claude API 密钥 | - | your-claude-api-key |
| CLAUDE_MODELS | 可用的 Claude 模型列表 | - | claude-2,claude-instant-1 |
| CLAUDE_ENDPOINT | Claude API 端点 | https://api.anthropic.com/v1 | https://your-custom-claude-endpoint.com |
| AZURE_API_KEY | Azure OpenAI API 密钥 | - | your-azure-api-key |
| AZURE_MODELS | 可用的 Azure OpenAI 模型列表 | - | gpt-35-turbo,gpt-4 |
| AZURE_ENDPOINT | Azure OpenAI API 端点 | - | https://your-azure-endpoint.openai.azure.com |

注意：部分变量需要手动配置，无默认值。

## ⚠️ 注意事项

1. **合理使用 API 配额**：特别是图像生成服务，避免超限。
2. **保管好环境变量和 API 密钥**：确保敏感信息安全。
3. **熟悉不同 AI 模型特性**：选择最适合应用场景的模型。
4. **定期更新**：保持代码与功能的最新状态。
5. **保障安全**：定期更新 API 密钥，遵循最小权限原则。

## 🔧 故障排除

- 无响应？检查 Webhook 设置和环境变量。
- API 限制？查看配额使用情况。

## 📄 许可证

MIT License

Copyright (c) 2024 [snakeying]
