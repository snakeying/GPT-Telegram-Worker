# 🤖💬 Telegram GPT Worker - Multifunktionaler KI-Assistent

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 Projektübersicht

Willkommen beim Telegram GPT Worker! 👋 Dies ist ein effizienter, in TypeScript entwickelter Telegram-Bot. Er unterstützt mehrere Sprachen und KI-Modelle, läuft auf Cloudflare Workers und bietet Nutzern ein schnelles, skalierbares Serviceerlebnis.

## 🌟 Kernfunktionen

1. 🧠 **Mehrere Modelle**: Integration von OpenAI, Google Gemini, Anthropic Claude, Groq und Azure OpenAI.
2. 🔗 **Unterstützung für OpenAI-kompatible Modelle**: Speziell für die Verwaltung und Verteilung von AI-Modellschnittstellen wie One API und New API entwickelt, unterstützt das automatische Abrufen von Modelllisten.
3. 💬 **Intelligente Gespräche**: Kontextbewusstsein für natürliche Konversationen.
4. 🎨 **Bilderzeugung**: Textbasierte Bilderstellung mit DALL·E und Cloudflare Flux.
5. 🖼️ **Bildanalyse**: Intelligente Analyse hochgeladener Bilder mittels OpenAI oder Google Gemini.
6. 🌍 **Mehrsprachigkeit**: Integrierte i18n-Funktion mit 8 Sprachen.
7. 🔒 **Nutzerverwaltung**: Zugriffskontrolle durch Whitelist-Funktion.
8. ☁️ **Hochleistungs-Deployment**: Schnelle Antwortzeiten dank Cloudflare Workers.
9. 🗄️ **Effizientes Datenmanagement**: Redis-Caching für optimale Leistung.
10. 🔧 **Flux-Prompt-Optimierung**: Optionale API zur Verbesserung der Bildgenerierung.

## 📋 Systemanforderungen

Vor der Einrichtung benötigen Sie:

- Ein [Cloudflare](https://dash.cloudflare.com/)-Konto
- Ein Telegram-Konto und Bot-Token
- Eine [Upstash](https://upstash.com/) Redis-Datenbank (mit aktivierter [Eviction](https://upstash.com/docs/redis/features/eviction)-Funktion)
- Mindestens einen API-Schlüssel eines KI-Dienstes

## 🚀 Schnellstart

1. Projekt-Repository klonen
2. Erforderliche Umgebungsvariablen konfigurieren
3. Auf Cloudflare Workers deployen
4. Telegram Webhook einrichten

Detaillierte Anleitungen finden Sie weiter unten.

## 📝 Verfügbare Befehle

- `/start` - Bot starten
- `/language` - Sprache wechseln
- `/switchmodel` - KI-Modell wechseln
- `/new` - Neues Gespräch beginnen
- `/history` - Gesprächsverlauf anzeigen
- `/help` - Hilfe anzeigen
- `/img` - Bild generieren (DALL-E)
- `/flux` - Bild generieren (Cloudflare Flux)

## 📁 Projektstruktur

```
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
│   │   ├── model_api_interface.ts # Gemeinsame Schnittstelle für Modell-APIs
│   │   ├── openai_api.ts          # OpenAI API-Interaktion
│   │   ├── openai_compatible.ts   # Verwaltet OpenAI-kompatible API-Interaktionen
│   │   └── telegram.ts            # Telegram Bot-Logik
│   ├── /config                    # Konfigurationsdateien
│   │   └── commands.ts            # Telegram Bot-Befehle
│   ├── /utils
│   │   └── helpers.ts             # Hilfsfunktionen
│   │   └── i18n.ts                # Mehrsprachigkeitsfunktionen
│   │   └── redis.ts               # Upstash Redis-Funktionen
│   │   └── image_analyze.ts       # Bildupload-Funktionen
│   ├── index.ts                   # Einstiegspunkt
│   └── env.ts                     # Umgebungsvariablen
├── /types                         # Typdefinitionen
│   └── telegram.d.ts              # Telegram API Typen
├── wrangler.toml                  # Cloudflare Worker Konfiguration
├── tsconfig.json                  # TypeScript Konfiguration
├── package.json                   # Projektabhängigkeiten
└── README.md                      # Projektdokumentation
```

## 🚀 Ausführliche Anleitung

### Deployment auf Cloudflare Workers

#### Verwendung der Wrangler CLI

1. Wrangler CLI installieren:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. Bei Cloudflare anmelden:

   ```bash
   wrangler login
   ```

3. Neues Workers-Projekt erstellen:

   ```bash
   wrangler init telegram-bot
   ```

4. `dist/index.js` in das Projekt kopieren.

5. `wrangler.toml` bearbeiten:

   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "ihre_account_id"
   workers_dev = true
   ```

6. Auf Cloudflare Workers deployen:

   ```bash
   wrangler publish
   ```

#### Über das Cloudflare Dashboard

1. Im [Cloudflare Dashboard](https://dash.cloudflare.com/) anmelden.
2. "Workers & Pages" auswählen.
3. "Create application" klicken und "Create Worker" wählen.
4. Worker benennen und "Deploy" klicken.
5. `dist/index.js` in den Editor kopieren und speichern.
6. Umgebungsvariablen unter "Settings" hinzufügen.

### Telegram Webhook konfigurieren

Webhook-URL mit der Telegram Bot API einrichten:

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev/webhook
```

```bash
https://api.telegram.org/bot123456789:abcdefghijklmn/setWebhook?url=https://gpt-telegram-worker.abcdefg.workers.dev/webhook
```

### Lokale Entwicklung

1. Repository klonen:

   ```bash
   git clone https://github.com/snakeying/telegram-bot.git
   ```

2. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

3. Umgebungsvariablen einrichten.

4. TypeScript kompilieren:

   ```bash
   npm run build
   ```

5. Bot starten:

   ```bash
   npm start
   ```

## 🔧 Umgebungsvariablen

| Variable | Beschreibung | Standardwert | Beispiel |
|----------|--------------|--------------|----------|
| OPENAI_API_KEY | OpenAI API-Schlüssel | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | OpenAI API Basis-URL | https://api.openai.com/v1 | https://ihre-custom-endpoint.de/v1 |
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
| CLOUDFLARE_ACCOUNT_ID | Cloudflare Account-ID | - | ihre-cloudflare-account-id |
| FLUX_STEPS | Flux Generierungsschritte | 4 | 4-8, maximal 8 |
| PROMPT_OPTIMIZATION | Prompt-Optimierung aktivieren | false | true |
| EXTERNAL_API_BASE | Externe API Basis-URL | - | https://externe-api.de |
| EXTERNAL_MODEL | Externes Modell | - | externes-modell-name |
| EXTERNAL_API_KEY | Externer API-Schlüssel | - | externer-api-schlüssel |
| GOOGLE_MODEL_KEY | Google AI Modell API-Schlüssel | - | ihr-google-api-schlüssel |
| GOOGLE_MODEL_BASEURL | Google AI Modell API Basis-URL | https://generativelanguage.googleapis.com/v1beta | https://ihre-google-endpoint.de |
| GOOGLE_MODELS | Verfügbare Google AI-Modelle | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Groq API-Schlüssel | - | ihr-groq-api-schlüssel |
| ANTHROPIC_API_KEY | Anthropic API-Schlüssel | - | ihr-anthropic-api-schlüssel |
| ANTHROPIC_BASE_URL | Anthropic API Basis-URL | https://api.anthropic.com | https://ihre-anthropic-endpoint.de |
| OPENAI_COMPATIBLE_KEY | OpenAI-kompatibler API-Schlüssel | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_COMPATIBLE_URL | OpenAI-kompatible API-Basis-URL | - | https://your-custom-endpoint.com/v1 |

Hinweis: Einige Variablen müssen manuell konfiguriert werden und haben keine Standardwerte.

## 🚀 Bildanalysefunktion

Ermöglicht Nutzern das Hochladen und Analysieren von Bildern:

1. Senden Sie ein Bild an den Bot.
2. Fügen Sie einen Analysehinweis hinzu, z.B. "Bitte analysieren Sie dieses Bild".
3. Der Bot verwendet das aktuelle KI-Modell (OpenAI oder Google Gemini) zur Analyse.
4. Das Ergebnis wird als Textnachricht zurückgesendet.

Hinweis: Stellen Sie sicher, dass das gewählte KI-Modell Bildanalyse unterstützt.

## 🚀 Flux Prompt-Optimierung

Bei aktivierter PROMPT_OPTIMIZATION (Umgebungsvariable = true) wird eine externe API zur Optimierung der Bildgenerierung genutzt:

1. Nutzer gibt ursprünglichen Prompt ein.
2. Externe API optimiert den Prompt (konfiguriert über EXTERNAL_* Variablen).
3. Optimierter Prompt wird für die Flux-Bildgenerierung verwendet.

Diese Funktion verbessert die Bildqualität und Genauigkeit. Stellen Sie die korrekten Umgebungsvariablen sicher.

## ⚠️ Wichtige Hinweise

1. 🚦 **API-Kontingente beachten**: Besonders bei Bild-Diensten auf Nutzungslimits achten.
2. 🔐 **Datensicherheit**: Umgebungsvariablen und API-Schlüssel sorgfältig schützen.
3. 🧠 **Modellkenntnisse**: Wählen Sie das passende Modell für Ihren Anwendungsfall.
4. 🔄 **Aktualisierungen**: Regelmäßig Code und Funktionen aktualisieren.
5. 🛡️ **Sicherheit**: API-Schlüssel regelmäßig erneuern, Prinzip der geringsten Rechte befolgen.
6. 🎨 **Flux Prompt-Optimierung**: Bei aktiviertem PROMPT_OPTIMIZATION alle erforderlichen Variablen konfigurieren.
7. ⛔ **Wichtiger Hinweis**: Um potenzielle Konflikte zu vermeiden, wird empfohlen, keine Modelle in OpenAI Compatible hinzuzufügen, die bereits in anderen APIs verwendet werden. Wenn Sie z.B. die Gemini API konfiguriert und das Modell gemini-1.5-flash ausgewählt haben, sollten Sie dasselbe Modell nicht in OpenAI Compatible hinzufügen.

## 🔧 Fehlerbehebung

- Bot reagiert nicht? Webhook-Einstellungen und Umgebungsvariablen prüfen.
- API-Limitierungen? API-Kontingent überprüfen.
- Bildanalyse fehlgeschlagen? Multimodales Modell (z.B. GPT-4 oder Gemini Pro) verwenden.

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

Copyright (c) 2024 [snakeying]
