# 🤖💬 Telegram GPT Worker - Assistant IA polyvalent

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 Présentation du projet

Bienvenue sur Telegram GPT Worker ! 👋 Il s'agit d'un bot Telegram efficace développé en TypeScript. Il prend en charge plusieurs langues et modèles d'IA, et est déployé sur Cloudflare Workers pour offrir aux utilisateurs une expérience rapide et évolutive.

## 🌟 Fonctionnalités principales

1. 🧠 **Support multi-modèles** : Intégration de plusieurs modèles d'IA, dont OpenAI, Google Gemini, Anthropic Claude, Groq et Azure OpenAI.
2. 💬 **Conversation intelligente** : Capacité de mémorisation du contexte pour des échanges fluides et naturels.
3. 🎨 **Génération d'images** : Création d'images à partir de descriptions textuelles, utilisant les technologies DALL·E et Cloudflare Flux.
4. 🌍 **Support multilingue** : Fonctionnalité i18n intégrée, compatible avec 8 langues pour répondre à des besoins variés.
5. 🔒 **Gestion des droits utilisateurs** : Contrôle d'accès via une liste blanche pour renforcer la sécurité.
6. ☁️ **Déploiement haute performance** : Utilisation des capacités de calcul en périphérie de Cloudflare Workers pour une réactivité optimale.
7. 🗄️ **Gestion efficace des données** : Utilisation de Redis pour le cache et la gestion des données, garantissant un traitement efficace.
8. 🔧 **Optimisation des prompts Flux** : Fonction optionnelle d'optimisation des prompts pour la génération d'images avec le modèle Flux via une API externe.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- Un compte [Cloudflare](https://dash.cloudflare.com/)
- Un compte Telegram et un jeton de bot
- Une base de données Redis [Upstash](https://upstash.com/) (avec la fonction [Éviction](https://upstash.com/docs/redis/features/eviction) activée)
- Au moins une clé API pour un service d'IA

## 🚀 Démarrage rapide

1. Clonez le dépôt du projet
2. Configurez les variables d'environnement nécessaires
3. Déployez sur Cloudflare Workers
4. Configurez le Webhook Telegram

Pour des instructions détaillées, consultez le tutoriel ci-dessous.

## 📝 Commandes disponibles

- `/start` - Démarrer le bot
- `/language` - Changer de langue
- `/switchmodel` - Changer de modèle d'IA
- `/new` - Commencer une nouvelle conversation
- `/history` - Obtenir un résumé de l'historique des conversations
- `/help` - Obtenir de l'aide
- `/img` - Générer une image (DALL-E)
- `/flux` - Générer une image (Cloudflare Flux)

## 📁 Structure du projet

```plaintext
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Interaction avec l'API Azure
│   │   ├── claude.ts              # Interaction avec l'API Claude
│   │   ├── flux-cf.ts             # Interface de génération d'images Cloudflare AI
│   │   ├── gemini.ts              # Interaction avec l'API Google Gemini
│   │   ├── groq.ts                # Interaction avec l'API Groq
│   │   ├── image_generation.ts    # Interface de génération d'images DALL·E
│   │   ├── model_api_interface.ts # Interface standard pour les API de modèles
│   │   ├── openai_api.ts          # Interaction avec l'API OpenAI
│   │   └── telegram.ts            # Logique du bot Telegram
│   ├── /config                    # Fichiers de configuration
│   │   └── commands.ts            # Configuration des commandes du bot
│   ├── /utils
│   │   ├── helpers.ts             # Fonctions utilitaires
│   │   ├── i18n.ts                # Support multilingue
│   │   └── redis.ts               # Opérations Redis
│   ├── index.ts                   # Point d'entrée
│   └── env.ts                     # Configuration des variables d'environnement
├── /types                         # Fichiers de définition de types
│   └── telegram.d.ts              # Définitions de types pour l'API Telegram
├── wrangler.toml                  # Configuration Cloudflare Worker
├── tsconfig.json                  # Configuration TypeScript
├── package.json                   # Dépendances du projet
└── README.md                      # Documentation du projet
```

## 🚀 Tutoriel détaillé

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
   account_id = "votre_id_de_compte"
   workers_dev = true
   ```

6. Déployez sur Cloudflare Workers :

   ```bash
   wrangler publish
   ```

#### Utilisation du tableau de bord Cloudflare

1. Connectez-vous au [tableau de bord Cloudflare](https://dash.cloudflare.com/).
2. Sélectionnez "Workers & Pages".
3. Cliquez sur "Create application" puis choisissez "Create Worker".
4. Nommez votre Worker et cliquez sur "Deploy".
5. Copiez-collez le contenu de `dist/index.js` dans l'éditeur et sauvegardez.
6. Ajoutez les variables d'environnement nécessaires dans "Settings".

### Configuration du Webhook Telegram

Utilisez l'API Telegram Bot pour configurer le Webhook, exemple d'URL :

```bash
https://api.telegram.org/bot<VOTRE_TOKEN_BOT>/setWebhook?url=https://votre-worker.votre-sous-domaine.workers.dev
```

### Développement local

1. Clonez le projet :

   ```bash
   git clone https://github.com/votre-nom-utilisateur/telegram-bot.git
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

## 🔧 Variables d'environnement

| Nom de la variable | Description | Valeur par défaut | Exemple |
|--------------------|-------------|-------------------|---------|
| OPENAI_API_KEY | Clé API OpenAI | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | URL de base de l'API OpenAI | https://api.openai.com/v1 | https://votre-endpoint-personnalise.com/v1 |
| OPENAI_MODELS | Liste des modèles OpenAI disponibles | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Jeton du bot Telegram | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | Liste des ID utilisateurs autorisés | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | Message d'initialisation du système | You are a helpful assistant. | Vous êtes un assistant utile. |
| SYSTEM_INIT_MESSAGE_ROLE | Rôle du message d'initialisation du système | system | system |
| DEFAULT_MODEL | Modèle IA utilisé par défaut | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | URL REST Redis Upstash | - | https://votre-url-redis.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Jeton REST Redis Upstash | - | votre-jeton-redis |
| DALL_E_MODEL | Version du modèle DALL-E | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Jeton API Cloudflare | - | votre-jeton-api-cloudflare |
| CLOUDFLARE_ACCOUNT_ID | ID du compte Cloudflare | - | votre-id-compte-cloudflare |
| FLUX_STEPS | Nombre d'étapes pour la génération Flux | 4 | 4-8, maximum 8 |
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

Note : Certaines variables nécessitent une configuration manuelle, sans valeur par défaut.

## ⚠️ Points d'attention

1. 🚦 **Utilisation raisonnable des quotas API** : Soyez particulièrement attentif aux limites d'utilisation, notamment pour les services de génération d'images.
2. 🔐 **Protection des informations sensibles** : Gardez vos variables d'environnement et clés API en lieu sûr.
3. 🧠 **Compréhension des spécificités des modèles** : Choisissez le modèle d'IA le plus adapté à votre cas d'utilisation.
4. 🔄 **Mise à jour régulière** : Actualisez régulièrement le code et les fonctionnalités pour des performances optimales.
5. 🛡️ **Priorité à la sécurité** : Renouvelez périodiquement vos clés API et appliquez le principe du moindre privilège.
6. 🎨 **Optimisation des prompts Flux** : Assurez-vous de configurer correctement EXTERNAL_API_BASE, EXTERNAL_MODEL et EXTERNAL_API_KEY si PROMPT_OPTIMIZATION est activé.

## 🚀 Optimisation des prompts Flux

Lorsque la variable d'environnement PROMPT_OPTIMIZATION est définie sur true, la fonction de génération d'images Flux utilise une API externe pour optimiser les prompts. Cette fonctionnalité fonctionne comme suit :

1. L'utilisateur fournit le prompt initial.
2. Le système utilise l'API externe configurée avec EXTERNAL_API_BASE, EXTERNAL_MODEL et EXTERNAL_API_KEY pour optimiser le prompt.
3. Le prompt optimisé est ensuite utilisé par le modèle Flux pour générer l'image.

Cette fonctionnalité permet de générer des images plus précises et mieux adaptées aux spécificités du modèle Flux. Pour l'utiliser, assurez-vous d'avoir correctement configuré toutes les variables d'environnement associées.

## 🔧 Dépannage

- Le bot ne répond pas ? Vérifiez la configuration du Webhook et des variables d'environnement.
- Vous rencontrez des limitations d'API ? Examinez votre utilisation des quotas API.

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

Copyright (c) 2024 [snakeying]
