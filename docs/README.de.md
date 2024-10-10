# 🤖💬 Telegram GPT Worker - Multifunktionaler KI-Assistent

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 Projektübersicht

Willkommen beim Telegram GPT Worker! 👋 Dies ist ein effizienter Telegram-Bot, der in TypeScript entwickelt wurde. Er unterstützt mehrere Sprachen und KI-Modelle und wird auf Cloudflare Workers betrieben, um Nutzern schnelle und skalierbare Dienste zu bieten.

## 🌟 Hauptfunktionen

1. 🧠 **Unterstützung mehrerer Modelle**: Integration von OpenAI, Google Gemini, Anthropic Claude, Groq und Azure OpenAI.
2. 💬 **Intelligente Konversation**: Kontextbewusstsein für flüssige Gespräche.
3. 🎨 **Bilderzeugung**: Generierung von Bildern aus Textbeschreibungen mit DALL·E und Cloudflare Flux.
4. 🌍 **Mehrsprachige Unterstützung**: Integrierte i18n-Funktionalität für 8 Sprachen.
5. 🔒 **Nutzerverwaltung**: Zugriffskontrolle durch Whitelist-Funktion.
6. ☁️ **Hochleistungs-Bereitstellung**: Schnelle Antwortzeiten dank Edge Computing mit Cloudflare Workers.
7. 🗄️ **Effizientes Datenmanagement**: Redis für Datenzwischenspeicherung und -verwaltung.
8. 🔧 **Flux Prompt-Optimierung**: Optionale Verbesserung von Bildgenerierungs-Prompts über externe API.

## 📋 Systemanforderungen

Vor der Einrichtung benötigen Sie:

- Ein [Cloudflare](https://dash.cloudflare.com/)-Konto
- Ein Telegram-Konto und Bot-Token
- Eine [Upstash](https://upstash.com/) Redis-Datenbank (mit aktivierter [Eviction](https://upstash.com/docs/redis/features/eviction)-Funktion)
- Mindestens einen API-Schlüssel für einen KI-Dienst

## 🚀 Schnellstart

1. Klonen Sie das Repository
2. Konfigurieren Sie die erforderlichen Umgebungsvariablen
3. Stellen Sie den Bot auf Cloudflare Workers bereit
4. Richten Sie den Telegram Webhook ein

Detaillierte Anweisungen finden Sie in der Anleitung unten.

## 📝 Verfügbare Befehle

- `/start` - Bot starten
- `/language` - Sprache ändern
- `/switchmodel` - KI-Modell wechseln
- `/new` - Neue Konversation beginnen
- `/history` - Gesprächsverlauf abrufen
- `/help` - Hilfe anzeigen
- `/img` - Bild generieren (DALL-E)
- `/flux` - Bild generieren (Cloudflare Flux)

## 📁 Projektstruktur

```plaintext
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Azure API-Interaktion
│   │   ├── claude.ts              # Claude API-Interaktion
│   │   ├── flux-cf.ts             # Cloudflare AI Bildgenerierung
│   │   ├── gemini.ts              # Google Gemini API-Interaktion
│   │   ├── groq.ts                # Groq API-Interaktion
│   │   ├── image_generation.ts    # DALL·E Bildgenerierung
│   │   ├── model_api_interface.ts # Modell-API-Schnittstelle
│   │   ├── openai_api.ts          # OpenAI API-Interaktion
│   │   └── telegram.ts            # Telegram Bot-Logik
│   ├── /config                    # Konfigurationsdateien
│   │   └── commands.ts            # Bot-Befehlskonfiguration
│   ├── /utils
│   │   ├── helpers.ts             # Hilfsfunktionen
│   │   ├── i18n.ts                # Mehrsprachige Unterstützung
│   │   └── redis.ts               # Redis-Operationen
│   ├── index.ts                   # Einstiegspunkt
│   └── env.ts                     # Umgebungsvariablen
├── /types                         # Typdefinitionen
│   └── telegram.d.ts              # Telegram API-Typen
├── wrangler.toml                  # Cloudflare Worker-Konfiguration
├── tsconfig.json                  # TypeScript-Konfiguration
├── package.json                   # Projektabhängigkeiten
└── README.md                      # Projektdokumentation
```

## 🚀 Ausführliche Anleitung

### Bereitstellung auf Cloudflare Workers

#### Verwendung der Wrangler CLI

1. Installieren Sie die Wrangler CLI:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. Melden Sie sich bei Ihrem Cloudflare-Konto an:

   ```bash
   wrangler login
   ```

3. Erstellen Sie ein neues Workers-Projekt:

   ```bash
   wrangler init telegram-bot
   ```

4. Kopieren Sie die Datei `dist/index.js` in Ihr Projekt.

5. Bearbeiten Sie die `wrangler.toml`-Datei:

   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "ihre_account_id"
   workers_dev = true
   ```

6. Stellen Sie den Bot bereit:

   ```bash
   wrangler publish
   ```

#### Verwendung des Cloudflare Dashboards

1. Melden Sie sich beim [Cloudflare Dashboard](https://dash.cloudflare.com/) an.
2. Wählen Sie "Workers & Pages".
3. Klicken Sie auf "Create application" und wählen Sie "Create Worker".
4. Benennen Sie Ihren Worker und klicken Sie auf "Deploy".
5. Fügen Sie den Inhalt von `dist/index.js` in den Editor ein und speichern Sie.
6. Fügen Sie unter "Settings" die erforderlichen Umgebungsvariablen hinzu.

### Konfiguration des Telegram Webhooks

Verwenden Sie die Telegram Bot API, um den Webhook einzurichten. Beispiel-URL:

```bash
https://api.telegram.org/bot<IHR_BOT_TOKEN>/setWebhook?url=https://ihr-worker.ihre-subdomain.workers.dev
```

### Lokale Entwicklung

1. Klonen Sie das Projekt:

   ```bash
   git clone https://github.com/ihr-benutzername/telegram-bot.git
   ```

2. Installieren Sie die Abhängigkeiten:

   ```bash
   npm install
   ```

3. Konfigurieren Sie die Umgebungsvariablen.

4. Kompilieren Sie TypeScript:

   ```bash
   npm run build
   ```

5. Starten Sie den Bot:

   ```bash
   npm start
   ```

## 🔧 Umgebungsvariablen

| Variable | Beschreibung | Standardwert | Beispiel |
|----------|--------------|--------------|----------|
| OPENAI_API_KEY | OpenAI API-Schlüssel | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | OpenAI API Basis-URL | https://api.openai.com/v1 | https://ihr-custom-endpunkt.de/v1 |
| OPENAI_MODELS | Verfügbare OpenAI-Modelle | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Telegram Bot-Token | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | Erlaubte Benutzer-IDs | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | System-Initialisierungsnachricht | You are a helpful assistant. | Sie sind ein hilfreicher Assistent. |
| SYSTEM_INIT_MESSAGE_ROLE | Rolle der Initialisierungsnachricht | system | system |
| DEFAULT_MODEL | Standard-KI-Modell | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | Upstash Redis REST-URL | - | https://ihre-redis-url.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis REST-Token | - | ihr-redis-token |
| DALL_E_MODEL | DALL-E Modellversion | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Cloudflare API-Token | - | ihr-cloudflare-api-token |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare Konto-ID | - | ihre-cloudflare-konto-id |
| FLUX_STEPS | Anzahl der Flux-Generierungsschritte | 4 | 4-8, maximale Schritte: 8 |
| PROMPT_OPTIMIZATION | Prompt-Optimierung aktivieren | false | true |
| EXTERNAL_API_BASE | Externe API Basis-URL | - | https://externe-api.de |
| EXTERNAL_MODEL | Externer Modellname | - | externer-modellname |
| EXTERNAL_API_KEY | Externer API-Schlüssel | - | externer-api-schlüssel |
| GOOGLE_MODEL_KEY | Google AI Modell API-Schlüssel | - | ihr-google-api-schlüssel |
| GOOGLE_MODEL_BASEURL | Google AI Modell API Basis-URL | https://generativelanguage.googleapis.com/v1beta | https://ihr-custom-google-endpunkt.de |
| GOOGLE_MODELS | Verfügbare Google AI-Modelle | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Groq API-Schlüssel | - | ihr-groq-api-schlüssel |
| ANTHROPIC_API_KEY | Anthropic API-Schlüssel | - | ihr-anthropic-api-schlüssel |
| ANTHROPIC_BASE_URL | Anthropic API Basis-URL | https://api.anthropic.com | https://ihr-custom-anthropic-endpunkt.de |

Hinweis: Einige Variablen erfordern manuelle Konfiguration und haben keine Standardwerte.

## ⚠️ Wichtige Hinweise

1. 🚦 **API-Kontingente beachten**: Besonders bei Bildgenerierungsdiensten auf Nutzungsbeschränkungen achten.
2. 🔐 **Sensible Daten schützen**: Umgebungsvariablen und API-Schlüssel sicher verwahren.
3. 🧠 **Modellspezifika verstehen**: Wählen Sie das am besten geeignete KI-Modell für Ihren Anwendungsfall.
4. 🔄 **Aktuell bleiben**: Regelmäßige Updates für optimale Leistung durchführen.
5. 🛡️ **Sicherheit priorisieren**: API-Schlüssel regelmäßig erneuern und das Prinzip der geringsten Berechtigung befolgen.
6. 🎨 **Flux Prompt-Optimierung**: Bei Aktivierung von PROMPT_OPTIMIZATION korrekte Konfiguration von EXTERNAL_API_BASE, EXTERNAL_MODEL und EXTERNAL_API_KEY sicherstellen.

## 🚀 Flux Prompt-Optimierung

Wenn die Umgebungsvariable PROMPT_OPTIMIZATION auf true gesetzt ist, nutzt die Flux-Bildgenerierungsfunktion eine externe API zur Optimierung der Prompts. Dies funktioniert wie folgt:

1. Der Benutzer gibt einen ursprünglichen Prompt ein.
2. Das System verwendet die externe API (konfiguriert durch EXTERNAL_API_BASE, EXTERNAL_MODEL und EXTERNAL_API_KEY) zur Optimierung des Prompts.
3. Der optimierte Prompt wird für die Bilderzeugung mit dem Flux-Modell verwendet.

Diese Funktion kann genauere und besser auf das Flux-Modell abgestimmte Bilder erzeugen. Stellen Sie sicher, dass alle relevanten Umgebungsvariablen korrekt konfiguriert sind, um diese Funktion zu nutzen.

## 🔧 Fehlerbehebung

- Bot reagiert nicht? Überprüfen Sie die Webhook-Einstellungen und Umgebungsvariablen.
- API-Limits erreicht? Kontrollieren Sie Ihre API-Kontingentnutzung.

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

Copyright (c) 2024 [snakeying]
