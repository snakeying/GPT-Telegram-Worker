# 🤖💬 Telegram GPT Worker - 多機能 AI アシスタント

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 プロジェクト概要

Telegram GPT Worker へようこそ！👋 これは TypeScript で開発された高効率な Telegram ボットです。多言語と複数の AI モデルをサポートし、Cloudflare Workers 上にデプロイされており、ユーザーに迅速でスケーラブルなサービス体験を提供します。

## 🌟 主な機能

1. 🧠 **マルチモデルサポート**: OpenAI、Google Gemini、Anthropic Claude、Groq、Azure OpenAI など複数の AI モデルを統合。
2. 💬 **インテリジェントな会話**: コンテキストメモリ機能を備え、自然な対話を実現。
3. 🎨 **画像生成**: テキスト記述から画像を生成。DALL·E と Cloudflare Flux 技術を採用。
4. 🌍 **多言語サポート**: 内蔵 i18n 機能により、8言語をサポート。多様なニーズに対応。
5. 🔒 **ユーザー権限管理**: ホワイトリスト機能によるアクセス制御でセキュリティを強化。
6. ☁️ **高性能デプロイメント**: Cloudflare Workers のエッジコンピューティング能力を活用し、高速レスポンスを実現。
7. 🗄️ **効率的なデータ管理**: Redis を使用してデータのキャッシュと管理を行い、効率的な処理を確保。
8. 🔧 **Flux プロンプト最適化**: オプション機能。外部 API を通じて Flux モデルの画像生成プロンプトを最適化。

## 📋 システム要件

使用を開始する前に、以下の準備が必要です：

- [Cloudflare](https://dash.cloudflare.com/) アカウント
- Telegram アカウントと Bot トークン
- [Upstash](https://upstash.com/) Redis データベース（[Eviction](https://upstash.com/docs/redis/features/eviction) 機能を有効化する必要があります）
- 少なくとも1つの AI サービスの API キー

## 🚀 クイックスタート

1. プロジェクトリポジトリをクローン
2. 必要な環境変数を設定
3. Cloudflare Workers にデプロイ
4. Telegram Webhook を設定

詳細な手順については、以下のチュートリアルをご参照ください。

## 📝 利用可能なコマンド

- `/start` - ボットを起動
- `/language` - 言語を切り替え
- `/switchmodel` - AI モデルを切り替え
- `/new` - 新しい会話を開始
- `/history` - 会話履歴のサマリーを取得
- `/help` - ヘルプ情報を取得
- `/img` - 画像を生成 (DALL-E)
- `/flux` - 画像を生成 (Cloudflare Flux)

## 📁 プロジェクト構造

```plaintext
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Azure API 連携
│   │   ├── claude.ts              # Claude API 連携
│   │   ├── flux-cf.ts             # Cloudflare AI 画像生成インターフェース
│   │   ├── gemini.ts              # Google Gemini API 連携
│   │   ├── groq.ts                # Groq API 連携
│   │   ├── image_generation.ts    # DALL·E 画像生成インターフェース
│   │   ├── model_api_interface.ts # モデル API 標準インターフェース
│   │   ├── openai_api.ts          # OpenAI API 連携
│   │   └── telegram.ts            # Telegram bot ロジック
│   ├── /config                    # 設定ファイル
│   │   └── commands.ts            # bot コマンド設定
│   ├── /utils
│   │   ├── helpers.ts             # ユーティリティ関数
│   │   ├── i18n.ts                # 多言語サポート
│   │   └── redis.ts               # Redis 操作
│   ├── index.ts                   # エントリーポイント
│   └── env.ts                     # 環境変数設定
├── /types                         # 型定義ファイル
│   └── telegram.d.ts              # Telegram API 型定義
├── wrangler.toml                  # Cloudflare Worker 設定
├── tsconfig.json                  # TypeScript 設定
├── package.json                   # プロジェクト依存関係
└── README.md                      # プロジェクト説明
```

## 🚀 詳細チュートリアル

### Cloudflare Workers へのデプロイ

#### Wrangler CLI の使用

1. Wrangler CLI をインストール:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. Cloudflare アカウントにログイン:

   ```bash
   wrangler login
   ```

3. 新しい Workers プロジェクトを作成:

   ```bash
   wrangler init telegram-bot
   ```

4. `dist/index.js` ファイルをプロジェクトにコピー。

5. `wrangler.toml` ファイルを編集してプロジェクトを設定:

   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "your_account_id"
   workers_dev = true
   ```

6. Cloudflare Workers にデプロイ:

   ```bash
   wrangler publish
   ```

#### Cloudflare ダッシュボードの使用

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン。
2. "Workers & Pages" を選択。
3. "Create application" をクリックし、"Create Worker" を選択。
4. Worker に名前を付け、"Deploy" をクリック。
5. `dist/index.js` をエディタにコピー＆ペーストし、ファイルを保存。
6. "Settings" で必要な環境変数を追加。

### Telegram Webhook の設定

Telegram Bot API を使用して Webhook を設定。URL 例：

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev
```

### ローカル開発

1. プロジェクトをクローン:

   ```bash
   git clone https://github.com/your-username/telegram-bot.git
   ```

2. 依存関係をインストール:

   ```bash
   npm install
   ```

3. 環境変数を設定。

4. TypeScript をコンパイル:

   ```bash
   npm run build
   ```

5. ボットを起動:

   ```bash
   npm start
   ```

## 🔧 環境変数

| 変数名 | 説明 | デフォルト値 | 例 |
|--------|------|------------|------|
| OPENAI_API_KEY | OpenAI API キー | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | OpenAI API ベース URL | https://api.openai.com/v1 | https://your-custom-endpoint.com/v1 |
| OPENAI_MODELS | 利用可能な OpenAI モデルのリスト | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Telegram ボットトークン | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | ボットの使用を許可されたユーザー ID リスト | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | システム初期化メッセージ | You are a helpful assistant. | You are a helpful assistant. |
| SYSTEM_INIT_MESSAGE_ROLE | システム初期化メッセージの役割 | system | system |
| DEFAULT_MODEL | デフォルトで使用する AI モデル | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | Upstash Redis REST URL | - | https://your-redis-url.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis REST トークン | - | your-redis-token |
| DALL_E_MODEL | DALL-E モデルバージョン | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Cloudflare API トークン | - | your-cloudflare-api-token |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare アカウント ID | - | your-cloudflare-account-id |
| FLUX_STEPS | Flux 生成ステップ数 | 4 | 4-8、最大ステップ数は8 |
| PROMPT_OPTIMIZATION | プロンプト最適化を有効化 | false | true |
| EXTERNAL_API_BASE | 外部 API ベース URL | - | https://external-api.com |
| EXTERNAL_MODEL | 外部モデル名 | - | external-model-name |
| EXTERNAL_API_KEY | 外部 API キー | - | external-api-key |
| GOOGLE_MODEL_KEY | Google AI モデル API キー | - | your-google-api-key |
| GOOGLE_MODEL_BASEURL | Google AI モデル API ベース URL | https://generativelanguage.googleapis.com/v1beta | https://your-custom-google-endpoint.com |
| GOOGLE_MODELS | 利用可能な Google AI モデルのリスト | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Groq API キー | - | your-groq-api-key |
| ANTHROPIC_API_KEY | Anthropic API キー | - | your-anthropic-api-key |
| ANTHROPIC_BASE_URL | Anthropic API ベース URL | https://api.anthropic.com | https://your-custom-anthropic-endpoint.com |

注意：一部の変数は手動で設定する必要があり、デフォルト値はありません。

## ⚠️ 注意事項

1. 🚦 **API クォータの適切な使用**: 特に画像生成サービスでは、使用制限に注意してください。
2. 🔐 **機密情報の保護**: 環境変数と API キーを適切に管理してください。
3. 🧠 **モデルの特性を理解**: アプリケーションのシナリオに最適な AI モデルを選択してください。
4. 🔄 **最新の状態を維持**: 定期的にコードと機能を更新し、最高のパフォーマンスを得てください。
5. 🛡️ **セキュリティ第一**: API キーを定期的に更新し、最小権限の原則に従ってください。
6. 🎨 **Flux プロンプト最適化**: PROMPT_OPTIMIZATION を有効にする場合、EXTERNAL_API_BASE、EXTERNAL_MODEL、EXTERNAL_API_KEY が正しく設定されていることを確認してください。

## 🚀 Flux プロンプト最適化

PROMPT_OPTIMIZATION 環境変数が true に設定されている場合、Flux 画像生成機能はプロンプトを最適化するために外部 API を使用します。この機能は以下の手順で動作します：

1. ユーザーが元のプロンプトを提供します。
2. システムは EXTERNAL_API_BASE、EXTERNAL_MODEL、EXTERNAL_API_KEY で設定された外部 API を使用してプロンプトを最適化します。
3. 最適化されたプロンプトが Flux モデルでの画像生成に使用されます。

この機能は、より正確で Flux モデルの特性に合った画像を生成するのに役立ちます。この機能を使用するには、関連するすべての環境変数が正しく設定されていることを確認してください。

## 🔧 トラブルシューティング

- ボットが応答しない？Webhook 設定と環境変数の設定を確認してください。
- API 制限に遭遇？API クォータの使用状況を確認してください。

## 📄 ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) の下で提供されています。

Copyright (c) 2024 [snakeying]
