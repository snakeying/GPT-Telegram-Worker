# 🤖 Telegram GPT 机器人

## 📖 项目简介

嘿，欢迎来到我的 Telegram 机器人项目！这是一个用 TypeScript 打造的 Telegram 机器人，支持多种语言和多个 AI 模型。我把它设计成可以部署在 Cloudflare Workers 上，这样就能提供高效、可扩展的服务。

## 🌟 功能特色

1. 🧠 **多模型支持**：支持各种 AI 模型，包括 OpenAI、Google Gemini、Anthropic Claude、Groq 和 Azure OpenAI。
2. 💬 **智能对话**：bot 能记住上下文，让对话更自然流畅。
3. 🎨 **图像生成**：根据文字描述创建图像，支持DALL·E 和 Cloudflare Flux 模型。
4. 🌍 **多语言支持**：内置 i18n 功能，支持8种语言。
5. 🔒 **用户白名单**：可以设置只允许特定用户使用，安全性更高。
6. ☁️ **Cloudflare Workers 部署**：利用 Cloudflare 的边缘计算能力，让服务响应更快。
7. 🗄️ **Redis 数据存储**：使用 Redis 进行高效的数据管理和缓存。

## 🚀 快速开始

1. 克隆仓库
2. 设置环境变量
3. 部署到 Cloudflare Workers
4. 设置 Telegram Webhook

设置 Webhook 示例：
```
https://api.telegram.org/bot<Your-Bot-Token>/setWebhook?url=https://<your-worker-subdomain>.workers.dev/webhook 
```

详细步骤请参考下方的详细使用教程。

## 📝 可用命令

- `/start` - 开始使用机器人
- `/language` - 设置语言
- `/switchmodel` - 切换 AI 模型
- `/new` - 开始新对话
- `/history` - 获取对话历史摘要
- `/help` - 获取帮助信息
- `/img` - 生成图像 (DALL-E)
- `/flux` - 生成图像 (Cloudflare Flux)

## 📁 文件目录架构

```
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # 处理 Azure API 交互
│   │   ├── claude.ts              # 处理 Claude API 交互
│   │   ├── flux-cf.ts             # 处理 Cloudflare AI 绘画接口
│   │   ├── gemini.ts              # 处理 Google Gemini API 交互
│   │   ├── groq.ts                # 处理 Groq API 交互
│   │   ├── image_generation.ts    # 处理 DALL·E 绘画接口
│   │   ├── model_api_interface.ts # 通用接口，定义模型 API 标准结构
│   │   ├── openai_api.ts          # 处理 OpenAI API 交互
│   │   └── telegram.ts            # 处理 Telegram bot 的逻辑
│   ├── /config                    # 配置文件
│   │   └── commands.ts            # Telegram bot 命令
│   ├── /utils
│   │   ├── helpers.ts             # 实用函数和工具
│   │   ├── i18n.ts                # 多语言函数
│   │   └── redis.ts               # Upstash Redis 函数
│   ├── index.ts                   # 入口文件，处理请求与响应
│   └── env.ts                     # 配置环境变量
├── /types                         # 类型定义文件
│   └── telegram.d.ts              # Telegram API 的类型定义
├── wrangler.toml                  # Cloudflare Worker 配置文件
├── tsconfig.json                  # TypeScript 配置文件
├── package.json                   # 项目依赖文件
└── README.md                      # 项目说明文档
```

## 🚀 详细使用教程

### 部署到 Cloudflare Workers

#### 使用 Wrangler CLI

1. 安装 Wrangler CLI:
   ```
   npm install -g @cloudflare/wrangler
   ```

2. 登录到您的 Cloudflare 账户:
   ```
   wrangler login
   ```

3. 创建一个新的 Workers 项目:
   ```
   wrangler init telegram-bot
   ```

4. 将 `dist/index.js` 文件复制到新创建的项目中。

5. 编辑 `wrangler.toml` 文件，配置您的项目:
   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "your_account_id"
   workers_dev = true
   ```

6. 部署到 Cloudflare Workers:
   ```
   wrangler publish
   ```

#### 使用 Cloudflare Dashboard

1. 登录到 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 在左侧菜单中选择 "Workers & Pages"。
3. 点击 "Create application"。
4. 选择 "Create Worker"。
5. 为您的 Worker 命名，然后点击 "Deploy"。
6. 在编辑器中，将 `dist/index.js` 的内容粘贴到代码区域。
7. 点击 "Save and deploy" 来部署您的 Worker。
8. 在 "Settings" 标签页中，添加必要的环境变量。

### 设置 Telegram Webhook

别忘了设置 Telegram Webhook！使用 Telegram Bot API 设置 Webhook URL 为您的 Cloudflare Worker URL。例如：

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev
```

### 本地开发

1. 克隆仓库:
   ```
   git clone https://github.com/your-username/telegram-bot.git
   ```

2. 安装依赖:
   ```
   npm install
   ```

3. 设置环境变量（见下方表格）

4. 编译 TypeScript:
   ```
   npm run build
   ```

5. 运行机器人:
   ```
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

注意：标记为 "-" 的默认值表示该环境变量没有默认值，需要手动设置。

## ⚠️ 注意事项

1. 📊 **合理使用 API 配额**：特别是在使用图像生成功能时，要注意 DALL-E 和其他 AI 服务的使用限制。

2. 🔑 **妥善保管环境变量和 API 密钥**：确保所有敏感信息都安全存储，尤其是在 Cloudflare Workers 环境中。

3. 🤖 **了解不同 AI 模型的特性**：OpenAI、Google Gemini、Claude、Groq 和 Azure 各有不同的特性和限制，选择时要考虑到这些差异。

4. 🔄 **定期更新**：随着功能的增加，记得定期进行代码更新。

5. 💻 **优化 Worker 性能**：使用异步操作，避免长时间运行的同步代码。

6. 🔐 **确保安全使用**：定期更新 API 密钥，使用最小权限原则。

## 🔧 故障排除

- 如果机器人无响应，请检查 Webhook 设置和环境变量。
- 如果遇到 API 限制，请检查您的 API 使用情况和配额。

## 📄 许可证

MIT License

Copyright (c) [2024] [snakeying]
