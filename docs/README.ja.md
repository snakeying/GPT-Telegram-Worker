# 🤖💬 Telegram GPT Worker - 多機能 AI アシスタント

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 プロジェクト概要

Telegram GPT Worker へようこそ！👋 これは TypeScript で開発された高効率な Telegram ボットです。複数の言語と AI モデルをサポートし、Cloudflare Workers 上にデプロイされており、ユーザーに迅速でスケーラブルなサービス体験を提供します。

## 🌟 主な機能

1. 🧠 **複数モデル対応**: OpenAI、Google Gemini、Anthropic Claude、Groq、Azure OpenAI など、複数の AI モデルを統合。
2. 🔗 **OpenAI互換モデルのサポート**：One APIやNew APIなどのAIモデルインターフェース管理および配信システム向けに設計されており、モデルリストの自動取得をサポートします。
3. 💬 **インテリジェントな対話**: コンテキスト記憶機能を備え、自然な会話を実現。
4. 🎨 **画像生成**: テキスト描写から画像を生成。DALL·E と Cloudflare Flux 技術を使用。
5. 🖼️ **画像分析**: ユーザーがアップロードした画像をインテリジェントに分析。OpenAI または Google Gemini モデルを使用可能。
6. 🌍 **多言語サポート**: 内蔵の i18n 機能により、8 言語をサポート。
7. 🔒 **ユーザー権限管理**: ホワイトリスト機能によるアクセス制御でセキュリティを強化。
8. ☁️ **高性能デプロイ**: Cloudflare Workers のエッジコンピューティング能力を活用し、高速レスポンスを実現。
9. 🗄️ **効率的なデータ管理**: Redis を使用してデータのキャッシュと管理を効率化。
10. 🔧 **Flux プロンプト最適化**: オプション機能として、外部 API を通じて Flux モデルの画像生成プロンプトを最適化。

## 📋 システム要件

使用を開始する前に、以下の準備が必要です：

- [Cloudflare](https://dash.cloudflare.com/) アカウント
- Telegram アカウントと Bot トークン
- [Upstash](https://upstash.com/) Redis データベース（[Eviction](https://upstash.com/docs/redis/features/eviction) 機能を有効にする必要があります）
- 少なくとも1つの AI サービスの API キー

## 🚀 クイックスタート

1. プロジェクトリポジトリをクローン
2. 必要な環境変数を設定
3. Cloudflare Workers にデプロイ
4. Telegram Webhook を設定

詳細な手順は以下のチュートリアルを参照してください。

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

```
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure .ts              # Azure API との対話を処理
│   │   ├── claude.ts              # Claude API との対話を処理
│   │   ├── flux-cf.ts             # Cloudflare AI 描画インターフェースを処理
│   │   ├── gemini.ts              # Google Gemini API との対話を処理
│   │   ├── groq.ts                # Groq API との対話を処理
│   │   ├── image_generation.ts    # DALL·E 描画インターフェースを処理
│   │   ├── model_api_interface.ts # モデル API の標準構造を定義する共通インターフェース
│   │   ├── openai_api.ts          # OpenAI API との対話を処理
│   │   ├── openai_compatible.ts   # OpenAI互換APIのインタラクションを処理します
│   │   └── telegram.ts            # Telegram ボットのロジックを処理
│   ├── /config                    # 設定ファイル
│   │   └── commands.ts            # Telegram ボットのコマンド
│   ├── /utils
│   │   └── helpers.ts             # ユーティリティ関数とツール
│   │   └── i18n.ts                # 多言語機能
│   │   └── redis.ts               # Upstash Redis 関数
│   │   └── image_analyze.ts       # 画像アップロード関数
│   ├── index.ts                   # エントリーポイント、リクエストと応答を処理
│   └── env.ts                     # 環境変数の設定
├── /types                         # 型定義ファイル
│   └── telegram.d.ts              # Telegram API の型定義
├── wrangler.toml                  # Cloudflare Worker 設定ファイル
├── tsconfig.json                  # TypeScript 設定ファイル
├── package.json                   # プロジェクト依存関係ファイル
└── README.md                      # プロジェクト説明ドキュメント
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

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/)にログイン。
2. "Workers & Pages" を選択。
3. "Create application" をクリックし、"Create Worker" を選択。
4. Worker に名前を付け、"Deploy" をクリック。
5. `dist/index.js` をエディタにコピー＆ペーストし、ファイルを保存。
6. "Settings" で必要な環境変数を追加。

### Telegram Webhook の設定

Telegram Bot API を使用して Webhook を設定します。URL の例:

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev/webhook
```

```bash
https://api.telegram.org/bot123456789:abcdefghijklmn/setWebhook?url=https://gpt-telegram-worker.abcdefg.workers.dev/webhook
```

### ローカル開発

1. プロジェクトをクローン:

   ```bash
   git clone https://github.com/snakeying/telegram-bot.git
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
| OPENAI_MODELS | 利用可能な OpenAI モデルリスト | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Telegram ボットトークン | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | ボットの使用を許可するユーザー ID リスト | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | システム初期化メッセージ | You are a helpful assistant. | You are a helpful assistant. |
| SYSTEM_INIT_MESSAGE_ROLE | システム初期化メッセージの役割 | system | system |
| DEFAULT_MODEL | デフォルトで使用する AI モデル | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | Upstash Redis REST URL | - | https://your-redis-url.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis REST トークン | - | your-redis-token |
| DALL_E_MODEL | DALL-E モデルバージョン | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Cloudflare API トークン | - | your-cloudflare-api-token |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare アカウント ID | - | your-cloudflare-account-id |
| FLUX_STEPS | Flux 生成ステップ数 | 4 | 4-8、最大ステップ数は8 |
| PROMPT_OPTIMIZATION | プロンプト最適化の有効化 | false | true |
| EXTERNAL_API_BASE | 外部 API ベース URL | - | https://external-api.com |
| EXTERNAL_MODEL | 外部モデル名 | - | external-model-name |
| EXTERNAL_API_KEY | 外部 API キー | - | external-api-key |
| GOOGLE_MODEL_KEY | Google AI モデル API キー | - | your-google-api-key |
| GOOGLE_MODEL_BASEURL | Google AI モデル API ベース URL | https://generativelanguage.googleapis.com/v1beta | https://your-custom-google-endpoint.com |
| GOOGLE_MODELS | 利用可能な Google AI モデルリスト | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Groq API キー | - | your-groq-api-key |
| ANTHROPIC_API_KEY | Anthropic API キー | - | your-anthropic-api-key |
| ANTHROPIC_BASE_URL | Anthropic API ベース URL | https://api.anthropic.com | https://your-custom-anthropic-endpoint.com |
| OPENAI_COMPATIBLE_KEY | OpenAI互換APIキー | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_COMPATIBLE_URL | OpenAI互換APIベースURL | - | https://your-custom-endpoint.com/v1 |

注意：一部の変数は手動で設定する必要があり、デフォルト値はありません。

## 🚀 画像分析機能

ユーザーが画像をアップロードし、AI による分析結果を得ることができます。使用方法は以下の通りです：

1. ユーザーがボットに画像を送信。
2. 画像のキャプションに分析のプロンプトを追加（例：「この画像を分析してください」）。
3. ボットは現在選択されている AI モデル（OpenAI または Google Gemini）を使用して画像を分析。
4. 分析結果がテキストメッセージとしてユーザーに返送されます。

注意：使用する AI モデルが画像分析機能をサポートしていることを確認してください。現在のモデルがサポートしていない場合、ボットはマルチモーダル対応のモデルに切り替えるよう促します。

## 🚀 Flux プロンプト最適化

PROMPT_OPTIMIZATION 環境変数が true に設定されている場合、Flux 画像生成機能は外部 API を使用してプロンプトを最適化します。この機能は以下の手順で動作します：

1. ユーザーが元のプロンプトを提供。
2. システムは EXTERNAL_API_BASE、EXTERNAL_MODEL、EXTERNAL_API_KEY で設定された外部 API を使用してプロンプトを最適化。
3. 最適化されたプロンプトが Flux モデルで画像生成に使用されます。

この機能は、より正確で Flux モデルの特性に適した画像を生成するのに役立ちます。この機能を使用するには、関連するすべての環境変数が正しく設定されていることを確認してください。

## ⚠️ 注意事項

1. 🚦 **API クォータの適切な利用**: 特に画像生成と分析サービスについて、利用制限に注意してください。
2. 🔐 **機密情報の保護**: 環境変数と API キーを適切に管理してください。
3. 🧠 **モデルの特性を理解**: アプリケーションのシナリオに最適な AI モデルを選択してください。
4. 🔄 **最新の状態を維持**: 最高のパフォーマンスを得るために、定期的にコードと機能を更新してください。
5. 🛡️ **セキュリティ第一**: API キーを定期的に更新し、最小権限の原則に従ってください。
6. 🎨 **Flux プロンプト最適化**: PROMPT_OPTIMIZATION を有効にする場合、EXTERNAL_API_BASE、EXTERNAL_MODEL、EXTERNAL_API_KEY が正しく設定されていることを確認してください。
7. ⛔ **重要なお知らせ**：潜在的な競合を避けるため、OpenAI互換に他のAPIで使用されているモデルを追加しないことをお勧めします。たとえば、Gemini APIを設定してgemini-1.5-flashモデルを選択した場合、同じモデルをOpenAI互換に追加しないでください。

## 🔧 トラブルシューティング

- ボットが応答しない？Webhook 設定と環境変数の構成を確認してください。
- API 制限に遭遇した？API クォータの使用状況を確認してください。
- 画像分析が失敗する？GPT-4o/GPT-4o-mini や Gemini 1.5 Pro/flash などのマルチモーダル対応モデルを使用していることを確認してください。

## 📄 ライセンス

このプロジェクトは [MIT ライセンス](LICENSE)の下で提供されています。

Copyright (c) 2024 [snakeying]
