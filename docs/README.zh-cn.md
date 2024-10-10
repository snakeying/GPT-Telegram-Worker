# 🤖💬 Telegram GPT Worker 多功能 AI 助手 

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 项目简介

欢迎来到 Telegram GPT Worker~ 这是一个基于 TypeScript 构建的 Telegram 机器人，支持多种语言和 AI 模型，并通过部署在 Cloudflare Workers 上，提供高效、可扩展的服务体验。

## 🌟 功能特色

1. 🧠 **多模型支持**：支持 OpenAI、Google Gemini、Anthropic Claude、Groq 和 Azure OpenAI 等多个 AI 模型。
2. 💬 **智能对话**：机器人可以记住对话上下文，带来更加自然、流畅的聊天体验。
3. 🎨 **图像生成**：支持通过文字描述生成图像，集成了 DALL·E 和 Cloudflare Flux 模型。
4. 🌍 **多语言支持**：内置 i18n 功能，支持多达 8 种语言。
5. 🔒 **用户白名单**：通过白名单功能控制访问权限，提升安全性。
6. ☁️ **Cloudflare Workers 部署**：利用 Cloudflare 的边缘计算，提供极速响应。
7. 🗄️ **Redis 数据存储**：通过 Redis 进行数据缓存和管理，确保数据高效处理。
8. 🔧 **Flux 提示词优化**：启用后，可通过外部 API 优化 Flux 模型生成图像时的提示词。

### 📋 前置要求

- [Cloudflare](https://dash.cloudflare.com/) 账号
- Telegram 账号和 Bot Token
- [Upstash](https://upstash.com/) 选择 Redis 数据库并开启 [Eviction](https://upstash.com/docs/redis/features/eviction) 功能
- 至少一个 AI 服务的 API 密钥

## 🚀 快速开始

1. 克隆项目仓库。
2. 设置环境变量。
3. 部署至 Cloudflare Workers。
4. 配置 Telegram Webhook。

详细部署步骤请参考下方教程。

## 📝 可用命令

- `/start` - 启动机器人
- `/language` - 切换语言
- `/switchmodel` - 切换 AI 模型
- `/new` - 开始新的对话
- `/history` - 获取对话历史摘要
- `/help` - 获取帮助信息
- `/img` - 生成图像 (DALL-E)
- `/flux` - 生成图像 (Cloudflare Flux)

## 📁 项目结构

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

## 🚀 详细教程

### 部署到 Cloudflare Workers

#### 使用 Wrangler CLI

1. 安装 Wrangler CLI:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. 登录 Cloudflare 账户:

   ```bash
   wrangler login
   ```

3. 创建新 Workers 项目:

   ```bash
   wrangler init telegram-bot
   ```

4. 将 `dist/index.js` 文件复制到项目中。

5. 编辑 `wrangler.toml` 文件，配置项目：

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
2. 选择 “Workers & Pages”。
3. 点击 “Create application” 并选择 “Create Worker”。
4. 为 Worker 命名并点击 “Deploy”。
5. 将 `dist/index.js` 复制粘贴到编辑器中，保存文件。
6. 在 “Settings” 中添加必要的环境变量。

### 配置 Telegram Webhook

使用 Telegram Bot API 设置 Webhook，URL 示例：

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev
```

### 本地开发

1. 克隆项目:

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

5. 启动机器人:

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
| SYSTEM_INIT_MESSAGE | 系统初始化消息 | You are a helpful assistant. | You are a helpful assistant. |
| SYSTEM_INIT_MESSAGE_ROLE | 系统初始化消息角色 | system | system |
| DEFAULT_MODEL | 默认使用的 AI 模型 | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | Upstash Redis REST URL | - | https://your-redis-url.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis REST 令牌 | - | your-redis-token |
| DALL_E_MODEL | DALL-E 模型版本 | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Cloudflare API 令牌 | - | your-cloudflare-api-token |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare 账户 ID | - | your-cloudflare-account-id |
| FLUX_STEPS | Flux 生成步骤数 | 4 | 4-8，最高步数为8 |
| PROMPT_OPTIMIZATION | 启用提示优化 | false | true |
| EXTERNAL_API_BASE | 外部 API 基础 URL | - | https://external-api.com |
| EXTERNAL_MODEL | 外部模型名称 | - | external-model-name |
| EXTERNAL_API_KEY | 外部 API 密钥 | - | external-api-key |
| GOOGLE_MODEL_KEY | Google AI 模型 API 密钥 | - | your-google-api-key |
| GOOGLE_MODEL_BASEURL | Google AI 模型 API 基础 URL | https://generativelanguage.googleapis.com/v1beta | https://your-custom-google-endpoint.com |
| GOOGLE_MODELS | 可用的 Google AI 模型列表 | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Groq API 密钥 | - | your-groq-api-key |
| ANTHROPIC_API_KEY | Anthropic API 密钥 | - | your-anthropic-api-key |
| ANTHROPIC_BASE_URL | Anthropic API 基础 URL | https://api.anthropic.com | https://your-custom-anthropic-endpoint.com |

注意：部分变量需要手动配置，无默认值。

## ⚠️ 注意事项

1. **合理使用 API 配额**：特别是图像生成服务，避免超限。
2. **保管好环境变量和 API 密钥**：确保敏感信息安全。
3. **熟悉不同 AI 模型特性**：选择最适合应用场景的模型。
4. **定期更新**：保持代码与功能的最新状态。
5. **保障安全**：定期更新 API 密钥，遵循最小权限原则。
6. **Flux 提示词优化**：当启用 PROMPT_OPTIMIZATION 时，确保正确配置 EXTERNAL_API_BASE、EXTERNAL_MODEL 和 EXTERNAL_API_KEY。

## 🚀 Flux 提示词优化

当 PROMPT_OPTIMIZATION 环境变量设置为 true 时，Flux 图像生成功能会使用外部 API 来优化提示词。这个功能通过以下步骤工作：

1. 用户提供原始提示词。
2. 系统使用 EXTERNAL_API_BASE、EXTERNAL_MODEL 和 EXTERNAL_API_KEY 配置的外部 API 来优化提示词。
3. 优化后的提示词被用于 Flux 模型生成图像。

这个功能可以帮助生成更精确、更符合 Flux 模型特性的图像。要使用此功能，请确保正确配置了所有相关的环境变量。

## 🔧 故障排除

- 无响应？检查 Webhook 设置和环境变量。
- API 限制？查看配额使用情况。

## 📄 许可证

本项目使用 [MIT 许可](LICENSE)。

Copyright (c) 2024 [snakeying]
