# 🤖💬 Telegram GPT Worker 多功能 AI 助手 

## 📖 項目簡介

歡迎來到 Telegram GPT Worker~ 這是一個基於 TypeScript 構建的 Telegram 機器人，支持多種語言和 AI 模型，並通過部署在 Cloudflare Workers 上，提供高效、可擴展的服務體驗。

## 🌟 功能特色

1. 🧠 **多模型支持**：支持 OpenAI、Google Gemini、Anthropic Claude、Groq 和 Azure OpenAI 等多個 AI 模型。
2. 💬 **智能對話**：機器人可以記住對話上下文，帶來更加自然、流暢的聊天體驗。
3. 🎨 **圖像生成**：支持通過文字描述生成圖像，集成了 DALL·E 和 Cloudflare Flux 模型。
4. 🌍 **多語言支持**：內置 i18n 功能，支持多達 8 種語言。
5. 🔒 **用戶白名單**：通過白名單功能控制訪問權限，提升安全性。
6. ☁️ **Cloudflare Workers 部署**：利用 Cloudflare 的邊緣計算，提供極速響應。
7. 🗄️ **Redis 數據存儲**：通過 Redis 進行數據緩存和管理，確保數據高效處理。
8. 🔧 **Flux 提示詞優化**：啟用後，可通過外部 API 優化 Flux 模型生成圖像時的提示詞。

### 📋 前置要求

- [Cloudflare](https://dash.cloudflare.com/) 賬號
- Telegram 賬號和 Bot Token
- [Upstash](https://upstash.com/) 選擇 Redis 數據庫並開啟 [Eviction](https://upstash.com/docs/redis/features/eviction) 功能
- 至少一個 AI 服務的 API 密鑰

## 🚀 快速開始

1. 克隆項目倉庫。
2. 設置環境變量。
3. 部署至 Cloudflare Workers。
4. 配置 Telegram Webhook。

詳細部署步驟請參考下方教程。

## 📝 可用命令

- `/start` - 啟動機器人
- `/language` - 切換語言
- `/switchmodel` - 切換 AI 模型
- `/new` - 開始新的對話
- `/history` - 獲取對話歷史摘要
- `/help` - 獲取幫助信息
- `/img` - 生成圖像 (DALL-E)
- `/flux` - 生成圖像 (Cloudflare Flux)

## 📁 項目結構

```plaintext
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Azure API 交互
│   │   ├── claude.ts              # Claude API 交互
│   │   ├── flux-cf.ts             # Cloudflare AI 圖像生成接口
│   │   ├── gemini.ts              # Google Gemini API 交互
│   │   ├── groq.ts                # Groq API 交互
│   │   ├── image_generation.ts    # DALL·E 圖像生成接口
│   │   ├── model_api_interface.ts # 模型 API 標準接口
│   │   ├── openai_api.ts          # OpenAI API 交互
│   │   └── telegram.ts            # Telegram bot 邏輯
│   ├── /config                    # 配置文件
│   │   └── commands.ts            # bot 命令配置
│   ├── /utils
│   │   ├── helpers.ts             # 工具函數
│   │   ├── i18n.ts                # 多語言支持
│   │   └── redis.ts               # Redis 操作
│   ├── index.ts                   # 入口文件
│   └── env.ts                     # 環境變量配置
├── /types                         # 類型定義文件
│   └── telegram.d.ts              # Telegram API 類型定義
├── wrangler.toml                  # Cloudflare Worker 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json                   # 項目依賴
└── README.md                      # 項目說明
```

## 🚀 詳細教程

### 部署到 Cloudflare Workers

#### 使用 Wrangler CLI

1. 安裝 Wrangler CLI:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. 登錄 Cloudflare 賬戶:

   ```bash
   wrangler login
   ```

3. 創建新 Workers 項目:

   ```bash
   wrangler init telegram-bot
   ```

4. 將 `dist/index.js` 文件複製到項目中。

5. 編輯 `wrangler.toml` 文件，配置項目：

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

1. 登錄 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 選擇 “Workers & Pages”。
3. 點擊 “Create application” 並選擇 “Create Worker”。
4. 為 Worker 命名並點擊 “Deploy”。
5. 將 `dist/index.js` 複製粘貼到編輯器中，保存文件。
6. 在 “Settings” 中添加必要的環境變量。

### 配置 Telegram Webhook

使用 Telegram Bot API 設置 Webhook，URL 示例：

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev
```

### 本地開發

1. 克隆項目:

   ```bash
   git clone https://github.com/your-username/telegram-bot.git
   ```

2. 安裝依賴:

   ```bash
   npm install
   ```

3. 設置環境變量。

4. 編譯 TypeScript:

   ```bash
   npm run build
   ```

5. 啟動機器人:

   ```bash
   npm start
   ```

## 🔧 環境變量

| 變量名 | 描述 | 默認值 | 示例 |
|--------|------|--------|------|
| OPENAI_API_KEY | OpenAI API 密鑰 | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | OpenAI API 基礎 URL | https://api.openai.com/v1 | https://your-custom-endpoint.com/v1 |
| OPENAI_MODELS | 可用的 OpenAI 模型列表 | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Telegram 機器人令牌 | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | 允許使用機器人的用戶 ID 列表 | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | 系統初始化消息 | You are a helpful assistant. | 您是一個有用的助手。 |
| SYSTEM_INIT_MESSAGE_ROLE | 系統初始化消息角色 | system | system |
| DEFAULT_MODEL | 默認使用的 AI 模型 | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | Upstash Redis REST URL | - | https://your-redis-url.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis REST 令牌 | - | your-redis-token |
| DALL_E_MODEL | DALL-E 模型版本 | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Cloudflare API 令牌 | - | your-cloudflare-api-token |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare 賬戶 ID | - | your-cloudflare-account-id |
| FLUX_STEPS | Flux 生成步驟數 | 4 | 4 |
| PROMPT_OPTIMIZATION | 啟用提示優化 | false | true |
| EXTERNAL_API_BASE | 外部 API 基礎 URL | - | https://external-api.com |
| EXTERNAL_MODEL | 外部模型名稱 | - | external-model-name |
| EXTERNAL_API_KEY | 外部 API 密鑰 | - | external-api-key |
| GOOGLE_MODEL_KEY | Google AI 模型 API 密鑰 | - | your-google-api-key |
| GOOGLE_MODEL_BASEURL | Google AI 模型 API 基礎 URL | https://generativelanguage.googleapis.com/v1beta | https://your-custom-google-endpoint.com |
| GOOGLE_MODELS | 可用的 Google AI 模型列表 | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Groq API 密鑰 | - | your-groq-api-key |
| ANTHROPIC_API_KEY | Anthropic API 密鑰 | - | your-anthropic-api-key |
| ANTHROPIC_BASE_URL | Anthropic API 基礎 URL | https://api.anthropic.com | https://your-custom-anthropic-endpoint.com |

注意：部分變量需要手動配置，無默認值。

## ⚠️ 注意事項

1. **合理使用 API 配額**：特別是圖像生成服務，避免超限。
2. **保管好環境變量和 API 密鑰**：確保敏感信息安全。
3. **熟悉不同 AI 模型特性**：選擇最適合應用場景的模型。
4. **定期更新**：保持代碼與功能的最新狀態。
5. **保障安全**：定期更新 API 密鑰，遵循最小權限原則。
6. **Flux 提示詞優化**：當啟用 PROMPT_OPTIMIZATION 時，確保正確配置 EXTERNAL_API_BASE、EXTERNAL_MODEL 和 EXTERNAL_API_KEY。

## 🚀 Flux 提示詞優化

當 PROMPT_OPTIMIZATION 環境變量設置為 true 時，Flux 圖像生成功能會使用外部 API 來優化提示詞。這個功能通過以下步驟工作：

1. 用戶提供原始提示詞。
2. 系統使用 EXTERNAL_API_BASE、EXTERNAL_MODEL 和 EXTERNAL_API_KEY 配置的外部 API 來優化提示詞。
3. 優化後的提示詞被用於 Flux 模型生成圖像。

這個功能可以幫助生成更精確、更符合 Flux 模型特性的圖像。要使用此功能，請確保正確配置了所有相關的環境變量。

## 🔧 故障排除

- 無響應？檢查 Webhook 設置和環境變量。
- API 限制？查看配額使用情況。

## 📄 许可证

本項目使用 [MIT 許可](LICENSE)。

Copyright (c) 2024 [snakeying]
