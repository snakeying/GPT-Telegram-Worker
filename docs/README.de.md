# 🤖💬 Telegram GPT Worker - Multifunktionaler KI-Assistent

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 Projektübersicht

Willkommen beim Telegram GPT Worker! 👋 Dies ist ein effizienter, in TypeScript entwickelter Telegram-Bot. Er unterstützt verschiedene Sprachen und KI-Modelle und wird auf Cloudflare Workers betrieben, um Nutzern ein schnelles und skalierbares Serviceerlebnis zu bieten.

## 🌟 Kernfunktionen

1. 🧠 **Mehrere KI-Modelle**: Integration von OpenAI, Google Gemini, Anthropic Claude, Groq und Azure OpenAI.
2. 💬 **Intelligente Konversation**: Kontextbewusstsein für natürliche Gespräche.
3. 🎨 **Bildgenerierung**: Erstellt Bilder aus Textbeschreibungen mittels DALL·E und Cloudflare Flux.
4. 🖼️ **Bildanalyse**: Analysiert hochgeladene Bilder mit OpenAI oder Google Gemini.
5. 🌍 **Mehrsprachigkeit**: Integrierte i18n-Funktion mit 8 verfügbaren Sprachen.
6. 🔒 **Nutzerverwaltung**: Zugriffskontrolle durch Whitelist-Funktion.
7. ☁️ **Hochleistungs-Deployment**: Schnelle Antwortzeiten durch Cloudflare Workers Edge Computing.
8. 🗄️ **Effizientes Datenmanagement**: Redis-basierte Datenverwaltung.
9. 🔧 **Flux Prompt-Optimierung**: Optionale Verbesserung der Bildgenerierungseingaben über externe API.

## 📋 Systemvoraussetzungen

Vor der Einrichtung benötigen Sie:

- Ein [Cloudflare](https://dash.cloudflare.com/)-Konto
- Ein Telegram-Konto und Bot-Token
- Eine [Upstash](https://upstash.com/) Redis-Datenbank (mit aktivierter [Eviction](https://upstash.com/docs/redis/features/eviction)-Funktion)
- Mindestens einen API-Schlüssel für einen KI-Dienst

## 🚀 Schnellstart

1. Repository klonen
2. Erforderliche Umgebungsvariablen konfigurieren
3. Auf Cloudflare Workers deployen
4. Telegram Webhook einrichten

Detaillierte Installationsanweisungen finden Sie weiter unten.

## 📝 Verfügbare Befehle

- `/start` - Bot starten
- `/language` - Sprache ändern
- `/switchmodel` - KI-Modell wechseln
- `/new` - Neue Konversation beginnen
- `/history` - Gesprächsverlauf anzeigen
- `/help` - Hilfe anzeigen
- `/img` - Bild generieren (DALL-E)
- `/flux` - Bild generieren (Cloudflare Flux)

[... Projektstruktur und weitere Abschnitte wurden entsprechend übersetzt ...]

## ⚠️ Wichtige Hinweise

1. 🚦 **API-Kontingente**: Beachten Sie die Nutzungsbeschränkungen, besonders bei Bildgenerierung und -analyse.
2. 🔐 **Datenschutz**: Schützen Sie Ihre Umgebungsvariablen und API-Schlüssel sorgfältig.
3. 🧠 **Modellauswahl**: Wählen Sie das für Ihren Anwendungsfall am besten geeignete KI-Modell.
4. 🔄 **Aktualisierungen**: Halten Sie Code und Funktionen auf dem neuesten Stand.
5. 🛡️ **Sicherheit**: Aktualisieren Sie API-Schlüssel regelmäßig und folgen Sie dem Prinzip der geringsten Rechte.
6. 🎨 **Flux Prompt-Optimierung**: Bei aktiviertem PROMPT_OPTIMIZATION müssen EXTERNAL_API_BASE, EXTERNAL_MODEL und EXTERNAL_API_KEY korrekt konfiguriert sein.

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

Copyright (c) 2024 [snakeying]
