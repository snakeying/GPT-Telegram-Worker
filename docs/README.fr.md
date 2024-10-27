# 🤖💬 Telegram GPT Worker - Assistant IA polyvalent

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 Présentation du Projet

Bienvenue dans Telegram GPT Worker ! 👋 C'est un bot Telegram efficace développé en TypeScript. Il prend en charge plusieurs langues et modèles d'IA, déployé sur Cloudflare Workers pour offrir aux utilisateurs une expérience rapide et évolutive.

## 🌟 Fonctionnalités Principales

1. 🧠 **Support Multi-modèles** : Intègre OpenAI, Google Gemini, Anthropic Claude, Groq et Azure OpenAI.
2. 🔗 **Support des modèles compatibles avec OpenAI** : Conçu spécialement pour les systèmes de gestion et de distribution d'interfaces de modèles d'IA tels que One API et New API, prenant en charge la récupération automatique des listes de modèles.
3. 💬 **Conversation Intelligente** : Capacité de mémoire contextuelle pour des dialogues fluides.
4. 🎨 **Génération d'Images** : Crée des images à partir de descriptions textuelles avec DALL·E et Cloudflare Flux.
5. 🖼️ **Analyse d'Images** : Analyse intelligente des images téléchargées par les utilisateurs via OpenAI ou Google Gemini.
6. 🌍 **Support Multilingue** : Fonctionnalité i18n intégrée, prend en charge 8 langues.
7. 🔒 **Gestion des Droits d'Utilisateur** : Contrôle d'accès via liste blanche pour une sécurité accrue.
8. ☁️ **Déploiement Haute Performance** : Utilise l'edge computing de Cloudflare Workers pour des réponses rapides.
9. 🗄️ **Gestion Efficace des Données** : Utilise Redis pour le cache et la gestion des données.
10. 🔧 **Optimisation des Prompts Flux** : Fonction optionnelle pour optimiser les prompts de génération d'images via une API externe.

## 📋 Prérequis Système

Avant de commencer, assurez-vous d'avoir :

- Un compte [Cloudflare](https://dash.cloudflare.com/)
- Un compte Telegram et un Token de Bot
- Une base de données [Upstash](https://upstash.com/) Redis (avec la fonction [Eviction](https://upstash.com/docs/redis/features/eviction) activée)
- Au moins une clé API d'un service IA

## 🚀 Démarrage Rapide

1. Clonez le dépôt du projet
2. Configurez les variables d'environnement nécessaires
3. Déployez sur Cloudflare Workers
4. Configurez le Webhook Telegram

Pour des instructions détaillées, consultez le tutoriel ci-dessous.

## 📝 Commandes Disponibles

- `/start` - Démarrer le bot
- `/language` - Changer de langue
- `/switchmodel` - Changer de modèle IA
- `/new` - Commencer une nouvelle conversation
- `/history` - Obtenir un résumé de l'historique des conversations
- `/help` - Obtenir de l'aide
- `/img` - Générer une image (DALL-E)
- `/flux` - Générer une image (Cloudflare Flux)

## 📁 Structure du Projet

```
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Gère les interactions avec l'API Azure
│   │   ├── claude.ts              # Gère les interactions avec l'API Claude
│   │   ├── flux-cf.ts             # Gère l'interface de dessin IA Cloudflare
│   │   ├── gemini.ts              # Gère les interactions avec l'API Google Gemini
│   │   ├── groq.ts                # Gère les interactions avec l'API Groq
│   │   ├── image_generation.ts    # Gère l'interface de dessin DALL·E
│   │   ├── model_api_interface.ts # Interface générique définissant la structure standard de l'API du modèle
│   │   ├── openai_api.ts          # Gère les interactions avec l'API OpenAI
│   │   ├── openai_compatible.ts   # Gère les interactions d'API compatibles avec OpenAI
│   │   └── telegram.ts            # Gère la logique du bot Telegram
│   ├── /config                    # Fichiers de configuration
│   │   └── commands.ts            # Commandes du bot Telegram
│   ├── /utils
│   │   └── helpers.ts             # Fonctions et outils utilitaires
│   │   └── i18n.ts                # Fonctions multilingues
│   │   └── redis.ts               # Fonctions Upstash Redis
│   │   └── image_analyze.ts       # Fonctions d'upload d'images
│   ├── index.ts                   # Fichier d'entrée, gère les requêtes et réponses
│   └── env.ts                     # Configure les variables d'environnement
├── /types                         # Fichiers de définition de types
│   └── telegram.d.ts              # Définitions de types pour l'API Telegram
├── wrangler.toml                  # Fichier de configuration Cloudflare Worker
├── tsconfig.json                  # Fichier de configuration TypeScript
├── package.json                   # Fichier des dépendances du projet
└── README.md                      # Documentation du projet
```

## 🚀 Tutoriel Détaillé

### Déploiement sur Cloudflare Workers

#### Utilisation de Wrangler CLI

1. Installez Wrangler CLI :

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. Connectez-vous à votre compte Cloudflare :

   ```bash
   wrangler login
   ```

3. Créez un nouveau projet Workers :

   ```bash
   wrangler init telegram-bot
   ```

4. Copiez le fichier `dist/index.js` dans votre projet.

5. Éditez le fichier `wrangler.toml` pour configurer votre projet :

   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "votre_account_id"
   workers_dev = true
   ```

6. Déployez sur Cloudflare Workers :

   ```bash
   wrangler publish
   ```

#### Utilisation du Dashboard Cloudflare

1. Connectez-vous au [Dashboard Cloudflare](https://dash.cloudflare.com/).
2. Sélectionnez "Workers & Pages".
3. Cliquez sur "Create application" puis choisissez "Create Worker".
4. Nommez votre Worker et cliquez sur "Deploy".
5. Copiez-collez le contenu de `dist/index.js` dans l'éditeur, sauvegardez.
6. Ajoutez les variables d'environnement nécessaires dans "Settings".

### Configuration du Webhook Telegram

Utilisez l'API Telegram Bot pour configurer le Webhook, exemple d'URL :

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev/webhook
```

```bash
https://api.telegram.org/bot123456789:abcdefghijklmn/setWebhook?url=https://gpt-telegram-worker.abcdefg.workers.dev/webhook
```

### Développement Local

1. Clonez le projet :

   ```bash
   git clone https://github.com/snakeying/telegram-bot.git
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

3. Configurez les variables d'environnement.

4. Compilez le TypeScript :

   ```bash
   npm run build
   ```

5. Lancez le bot :

   ```bash
   npm start
   ```

## 🔧 Variables d'Environnement

| Nom de la Variable | Description | Valeur par Défaut | Exemple |
|--------------------|-------------|-------------------|---------|
| OPENAI_API_KEY | Clé API OpenAI | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | URL de base de l'API OpenAI | https://api.openai.com/v1 | https://votre-endpoint-personnalise.com/v1 |
| OPENAI_MODELS | Liste des modèles OpenAI disponibles | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Token du bot Telegram | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | Liste des ID utilisateurs autorisés | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | Message d'initialisation du système | You are a helpful assistant. | Vous êtes un assistant utile. |
| SYSTEM_INIT_MESSAGE_ROLE | Rôle du message d'initialisation du système | system | system |
| DEFAULT_MODEL | Modèle IA utilisé par défaut | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | URL REST Upstash Redis | - | https://votre-url-redis.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Token REST Upstash Redis | - | votre-token-redis |
| DALL_E_MODEL | Version du modèle DALL-E | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Token API Cloudflare | - | votre-token-api-cloudflare |
| CLOUDFLARE_ACCOUNT_ID | ID de compte Cloudflare | - | votre-id-compte-cloudflare |
| FLUX_STEPS | Nombre d'étapes de génération Flux | 4 | 4-8, maximum 8 |
| PROMPT_OPTIMIZATION | Activer l'optimisation des prompts | false | true |
| EXTERNAL_API_BASE | URL de base de l'API externe | - | https://api-externe.com |
| EXTERNAL_MODEL | Nom du modèle externe | - | nom-modele-externe |
| EXTERNAL_API_KEY | Clé API externe | - | cle-api-externe |
| GOOGLE_MODEL_KEY | Clé API du modèle Google AI | - | votre-cle-api-google |
| GOOGLE_MODEL_BASEURL | URL de base de l'API du modèle Google AI | https://generativelanguage.googleapis.com/v1beta | https://votre-endpoint-google-personnalise.com |
| GOOGLE_MODELS | Liste des modèles Google AI disponibles | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Clé API Groq | - | votre-cle-api-groq |
| ANTHROPIC_API_KEY | Clé API Anthropic | - | votre-cle-api-anthropic |
| ANTHROPIC_BASE_URL | URL de base de l'API Anthropic | https://api.anthropic.com | https://votre-endpoint-anthropic-personnalise.com |
| OPENAI_COMPATIBLE_KEY | Clé API compatible avec OpenAI | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_COMPATIBLE_URL | URL de base de l'API compatible avec OpenAI | - | https://your-custom-endpoint.com/v1 |

Note : Certaines variables nécessitent une configuration manuelle et n'ont pas de valeur par défaut.

## 🚀 Fonctionnalité d'Analyse d'Images

Permet aux utilisateurs de télécharger des images et d'obtenir une analyse IA. Voici comment l'utiliser :

1. L'utilisateur envoie une image au bot.
2. Il ajoute un prompt d'analyse dans la légende, par exemple "Analysez cette image".
3. Le bot utilise le modèle IA actuellement sélectionné (OpenAI ou Google Gemini) pour analyser l'image.
4. Le résultat de l'analyse est renvoyé à l'utilisateur sous forme de message texte.

Note : Assurez-vous que le modèle IA que vous utilisez prend en charge l'analyse d'images. Si le modèle actuel ne le supporte pas, le bot vous invitera à passer à un modèle multimodal.

## 🚀 Optimisation des Prompts Flux

Lorsque la variable d'environnement PROMPT_OPTIMIZATION est définie sur true, la fonctionnalité de génération d'images Flux utilise une API externe pour optimiser les prompts. Cette fonctionnalité fonctionne comme suit :

1. L'utilisateur fournit le prompt original.
2. Le système utilise l'API externe configurée avec EXTERNAL_API_BASE, EXTERNAL_MODEL et EXTERNAL_API_KEY pour optimiser le prompt.
3. Le prompt optimisé est utilisé par le modèle Flux pour générer l'image.

Cette fonctionnalité peut aider à générer des images plus précises et mieux adaptées aux spécificités du modèle Flux. Pour l'utiliser, assurez-vous d'avoir correctement configuré toutes les variables d'environnement associées.

## ⚠️ Points d'Attention

1. 🚦 **Utilisation Raisonnable des Quotas API** : Soyez particulièrement attentif aux limites d'utilisation, surtout pour les services de génération et d'analyse d'images.
2. 🔐 **Protection des Informations Sensibles** : Gardez vos variables d'environnement et clés API en sécurité.
3. 🧠 **Compréhension des Spécificités des Modèles** : Choisissez le modèle IA le plus adapté à votre scénario d'utilisation.
4. 🔄 **Mises à Jour Régulières** : Actualisez régulièrement le code et les fonctionnalités pour des performances optimales.
5. 🛡️ **Priorité à la Sécurité** : Mettez à jour régulièrement vos clés API et suivez le principe du moindre privilège.
6. 🎨 **Optimisation des Prompts Flux** : Lors de l'activation de PROMPT_OPTIMIZATION, assurez-vous de configurer correctement EXTERNAL_API_BASE, EXTERNAL_MODEL et EXTERNAL_API_KEY.
7. ⛔ **Avis important** : Afin d'éviter d'éventuels conflits, il est déconseillé d'ajouter dans OpenAI Compatible des modèles déjà utilisés par d'autres API. Par exemple, si vous avez configuré l'API Gemini et sélectionné le modèle gemini-1.5-flash, vous ne devriez pas ajouter ce même modèle dans OpenAI Compatible.

## 🔧 Dépannage

- Le bot ne répond pas ? Vérifiez la configuration du Webhook et des variables d'environnement.
- Vous rencontrez des limites API ? Vérifiez votre utilisation des quotas API.
- L'analyse d'image échoue ? Assurez-vous d'utiliser un modèle multimodal comme GPT-4o/GPT-4o-mini ou Gemini 1.5 Pro/flash.

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

Copyright (c) 2024 [snakeying]
