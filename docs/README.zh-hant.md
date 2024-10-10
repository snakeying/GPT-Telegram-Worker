# 🤖💬 Telegram GPT Worker - 多功能 AI 助手

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 專案簡介

歡迎使用 Telegram GPT Worker! 👋 這是一個基於 TypeScript 開發的高效 Telegram 機器人。它支援多種語言和 AI 模型，部署在 Cloudflare Workers 上，為用戶提供快速、可擴展的服務體驗。

## 🌟 核心功能

1. 🧠 **多模型支援**：整合 OpenAI、Google Gemini、Anthropic Claude、Groq 和 Azure OpenAI 等多個 AI 模型。
2. 💬 **智慧對話**：具備上下文記憶能力，確保對話流暢自然。
3. 🎨 **圖像生成**：支援文字描述生成圖像，採用 DALL·E 和 Cloudflare Flux 技術。
4. 🌍 **多語言支援**：內建 i18n 功能，支援 8 種語言，滿足多樣化需求。
5. 🔒 **用戶權限管理**：透過白名單功能控制訪問權限，提升安全性。
6. ☁️ **高性能部署**：利用 Cloudflare Workers 的邊緣運算能力，實現快速回應。
7. 🗄️ **高效資料管理**：使用 Redis 進行資料快取和管理，確保高效處理。
8. 🔧 **Flux 提示詞優化**：可選功能，透過外部 API 優化 Flux 模型的圖像生成提示詞。

## 📋 系統需求

在開始使用前，請確保您已準備以下內容：

- [Cloudflare](https://dash.cloudflare.com/) 帳號
- Telegram 帳號和 Bot Token
- [Upstash](https://upstash.com/) Redis 資料庫（需開啟 [Eviction](https://upstash.com/docs/redis/features/eviction) 功能）
- 至少一個 AI 服務的 API 金鑰

## 🚀 快速上手

1. 複製專案儲存庫
2. 設定必要的環境變數
3. 部署至 Cloudflare Workers
4. 設定 Telegram Webhook

詳細的部署步驟請參考下方教學。

## 📝 可用指令

- `/start` - 啟動機器人
- `/language` - 切換語言
- `/switchmodel` - 切換 AI 模型
- `/new` - 開始新的對話
- `/history` - 獲取對話歷史摘要
- `/help` - 獲取幫助資訊
- `/img` - 生成圖像 (DALL-E)
- `/flux` - 生成圖像 (Cloudflare Flux)

## 📁 專案結構

```plaintext
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Azure API 互動
│   │   ├── claude.ts              # Claude API 互動
│   │   ├── flux-cf.ts             # Cloudflare AI 圖像生成介面
│   │   ├── gemini.ts              # Google Gemini API 互動
│   │   ├── groq.ts                # Groq API 互動
│   │   ├── image_generation.ts    # DALL·E 圖像生成介面
│   │   ├── model_api_interface.ts # 模型 API 標準介面
│   │   ├── openai_api.ts          # OpenAI API 互動
│   │   └── telegram.ts            # Telegram bot 邏輯
│   ├── /config                    # 設定檔案
│   │   └── commands.ts            # bot 指令設定
│   ├── /utils
│   │   ├── helpers.ts             # 工具函數
│   │   ├── i18n.ts                # 多語言支援
│   │   └── redis.ts               # Redis 操作
│   ├── index.ts                   # 入口檔案
│   └── env.ts                     # 環境變數設定
├── /types                         # 類型定義檔案
│   └── telegram.d.ts              # Telegram API 類型定義
├── wrangler.toml                  # Cloudflare Worker 設定
├── tsconfig.json                  # TypeScript 設定
├── package.json                   # 專案依賴
└── README.md                      # 專案說明
```

## 🚀 詳細教學

### 部署到 Cloudflare Workers

#### 使用 Wrangler CLI

1. 安裝 Wrangler CLI：

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. 登入 Cloudflare 帳戶：

   ```bash
   wrangler login
   ```

3. 建立新 Workers 專案：

   ```bash
   wrangler init telegram-bot
   ```

4. 將 `dist/index.js` 檔案複製到專案中。

5. 編輯 `wrangler.toml` 檔案，設定專案：

   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "your_account_id"
   workers_dev = true
   ```

6. 部署到 Cloudflare Workers：

   ```bash
   wrangler publish
   ```

#### 使用 Cloudflare Dashboard

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 選擇 "Workers & Pages"。
3. 點擊 "Create application" 並選擇 "Create Worker"。
4. 為 Worker 命名並點擊 "Deploy"。
5. 將 `dist/index.js` 複製貼上到編輯器中，儲存檔案。
6. 在 "Settings" 中新增必要的環境變數。

### 設定 Telegram Webhook

使用 Telegram Bot API 設定 Webhook，URL 範例：

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev
```

### 本地開發

1. 複製專案：

   ```bash
   git clone https://github.com/your-username/telegram-bot.git
   ```

2. 安裝依賴：

   ```bash
   npm install
   ```

3. 設定環境變數。

4. 編譯 TypeScript：

   ```bash
   npm run build
   ```

5. 啟動機器人：

   ```bash
   npm start
   ```

## 🔧 環境變數

| 變數名 | 描述 | 預設值 | 範例 |
|--------|------|--------|------|
| OPENAI_API_KEY | OpenAI API 金鑰 | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | OpenAI API 基礎 URL | https://api.openai.com/v1 | https://your-custom-endpoint.com/v1 |
| OPENAI_MODELS | 可用的 OpenAI 模型列表 | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Telegram 機器人令牌 | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | 允許使用機器人的用戶 ID 列表 | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | 系統初始化訊息 | You are a helpful assistant. | You are a helpful assistant. |
| SYSTEM_INIT_MESSAGE_ROLE | 系統初始化訊息角色 | system | system |
| DEFAULT_MODEL | 預設使用的 AI 模型 | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | Upstash Redis REST URL | - | https://your-redis-url.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis REST 令牌 | - | your-redis-token |
| DALL_E_MODEL | DALL-E 模型版本 | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Cloudflare API 令牌 | - | your-cloudflare-api-token |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare 帳戶 ID | - | your-cloudflare-account-id |
| FLUX_STEPS | Flux 生成步驟數 | 4 | 4-8，最高步數為8 |
| PROMPT_OPTIMIZATION | 啟用提示優化 | false | true |
| EXTERNAL_API_BASE | 外部 API 基礎 URL | - | https://external-api.com |
| EXTERNAL_MODEL | 外部模型名稱 | - | external-model-name |
| EXTERNAL_API_KEY | 外部 API 金鑰 | - | external-api-key |
| GOOGLE_MODEL_KEY | Google AI 模型 API 金鑰 | - | your-google-api-key |
| GOOGLE_MODEL_BASEURL | Google AI 模型 API 基礎 URL | https://generativelanguage.googleapis.com/v1beta | https://your-custom-google-endpoint.com |
| GOOGLE_MODELS | 可用的 Google AI 模型列表 | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Groq API 金鑰 | - | your-groq-api-key |
| ANTHROPIC_API_KEY | Anthropic API 金鑰 | - | your-anthropic-api-key |
| ANTHROPIC_BASE_URL | Anthropic API 基礎 URL | https://api.anthropic.com | https://your-custom-anthropic-endpoint.com |

注意：部分變數需要手動設定，無預設值。

## ⚠️ 注意事項

1. 🚦 **合理使用 API 配額**：特別是圖像生成服務，請注意使用限制。
2. 🔐 **保護敏感資訊**：妥善保管環境變數和 API 金鑰。
3. 🧠 **了解模型特性**：選擇最適合您應用場景的 AI 模型。
4. 🔄 **保持更新**：定期更新程式碼和功能以獲得最佳性能。
5. 🛡️ **安全第一**：定期更新 API 金鑰，遵循最小權限原則。
6. 🎨 **Flux 提示詞優化**：啟用 PROMPT_OPTIMIZATION 時，請確保正確設定 EXTERNAL_API_BASE、EXTERNAL_MODEL 和 EXTERNAL_API_KEY。

## 🚀 Flux 提示詞優化

當 PROMPT_OPTIMIZATION 環境變數設定為 true 時，Flux 圖像生成功能會使用外部 API 來優化提示詞。這個功能透過以下步驟運作：

1. 用戶提供原始提示詞。
2. 系統使用 EXTERNAL_API_BASE、EXTERNAL_MODEL 和 EXTERNAL_API_KEY 設定的外部 API 來優化提示詞。
3. 優化後的提示詞被用於 Flux 模型生成圖像。

這個功能可以幫助生成更精確、更符合 Flux 模型特性的圖像。要使用此功能，請確保正確設定了所有相關的環境變數。

## 🔧 故障排除

- 機器人無回應？檢查 Webhook 設定和環境變數配置。
- 遇到 API 限制？查看您的 API 配額使用情況。

## 📄 授權條款

本專案使用 [MIT 授權](LICENSE)。

Copyright (c) 2024 [snakeying]
