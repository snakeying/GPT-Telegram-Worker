# 🤖💬 Telegram GPT Worker - Asistente de IA multifuncional

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 Introducción al Proyecto

¡Bienvenido a Telegram GPT Worker! 👋 Este es un bot de Telegram eficiente desarrollado en TypeScript. Soporta múltiples idiomas y modelos de IA, y se despliega en Cloudflare Workers, ofreciendo a los usuarios una experiencia de servicio rápida y escalable.

## 🌟 Características Principales

1. 🧠 **Soporte Multi-modelo**: Integra varios modelos de IA como OpenAI, Google Gemini, Anthropic Claude, Groq y Azure OpenAI.
2. 💬 **Conversación Inteligente**: Cuenta con capacidad de memoria contextual para conversaciones fluidas y naturales.
3. 🎨 **Generación de Imágenes**: Soporta la creación de imágenes a partir de descripciones de texto, utilizando tecnologías DALL·E y Cloudflare Flux.
4. 🖼️ **Análisis de Imágenes**: Permite a los usuarios subir imágenes para análisis inteligente, usando modelos de OpenAI o Google Gemini.
5. 🌍 **Soporte Multilingüe**: Función i18n incorporada, compatible con 8 idiomas para satisfacer diversas necesidades.
6. 🔒 **Gestión de Permisos de Usuario**: Control de acceso mediante función de lista blanca para mejorar la seguridad.
7. ☁️ **Despliegue de Alto Rendimiento**: Utiliza la capacidad de computación en el borde de Cloudflare Workers para respuestas rápidas.
8. 🗄️ **Gestión Eficiente de Datos**: Usa Redis para caché y gestión de datos, asegurando un procesamiento eficiente.
9. 🔧 **Optimización de Prompts para Flux**: Función opcional para optimizar los prompts de generación de imágenes del modelo Flux a través de una API externa.

## 📋 Requisitos del Sistema

Antes de comenzar, asegúrese de tener lo siguiente:

- Cuenta de [Cloudflare](https://dash.cloudflare.com/)
- Cuenta de Telegram y Token de Bot
- Base de datos Redis de [Upstash](https://upstash.com/) (con la función [Eviction](https://upstash.com/docs/redis/features/eviction) activada)
- Al menos una clave API de un servicio de IA

## 🚀 Inicio Rápido

1. Clone el repositorio del proyecto
2. Configure las variables de entorno necesarias
3. Despliegue en Cloudflare Workers
4. Configure el Webhook de Telegram

Para pasos detallados de despliegue, consulte el tutorial a continuación.

## 📝 Comandos Disponibles

- `/start` - Iniciar el bot
- `/language` - Cambiar idioma
- `/switchmodel` - Cambiar modelo de IA
- `/new` - Iniciar nueva conversación
- `/history` - Obtener resumen del historial de conversación
- `/help` - Obtener información de ayuda
- `/img` - Generar imagen (DALL-E)
- `/flux` - Generar imagen (Cloudflare Flux)

## 📁 Estructura del Proyecto

```
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure .ts              # Maneja interacciones con API de Azure
│   │   ├── claude.ts              # Maneja interacciones con API de Claude
│   │   ├── flux-cf.ts             # Maneja interfaz de dibujo IA de Cloudflare
│   │   ├── gemini.ts              # Maneja interacciones con API de Google Gemini
│   │   ├── groq.ts                # Maneja interacciones con API de Groq
│   │   ├── image_generation.ts    # Maneja interfaz de dibujo de DALL·E
│   │   ├── model_api_interface.ts # Interfaz común, define estructura estándar de API de modelos
│   │   ├── openai_api.ts          # Maneja interacciones con API de OpenAI
│   │   └── telegram.ts            # Maneja lógica del bot de Telegram
│   ├── /config                    # Archivos de configuración
│   │   └── commands.ts            # Comandos del bot de Telegram
│   ├── /utils
│   │   └── helpers.ts             # Funciones y herramientas útiles
│   │   └── i18n.ts                # Funciones multilingües
│   │   └── redis.ts               # Funciones de Upstash Redis
│   │   └── image_analyze.ts       # Funciones de carga de imágenes
│   ├── index.ts                   # Archivo de entrada, maneja solicitudes y respuestas
│   └── env.ts                     # Configura variables de entorno
├── /types                         # Archivos de definición de tipos
│   └── telegram.d.ts              # Definiciones de tipos para API de Telegram
├── wrangler.toml                  # Archivo de configuración de Cloudflare Worker
├── tsconfig.json                  # Archivo de configuración de TypeScript
├── package.json                   # Archivo de dependencias del proyecto
└── README.md                      # Documentación del proyecto
```

## 🚀 Tutorial Detallado

### Despliegue en Cloudflare Workers

#### Usando Wrangler CLI

1. Instale Wrangler CLI:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. Inicie sesión en su cuenta de Cloudflare:

   ```bash
   wrangler login
   ```

3. Cree un nuevo proyecto de Workers:

   ```bash
   wrangler init telegram-bot
   ```

4. Copie el archivo `dist/index.js` al proyecto.

5. Edite el archivo `wrangler.toml` para configurar el proyecto:

   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "su_id_de_cuenta"
   workers_dev = true
   ```

6. Despliegue en Cloudflare Workers:

   ```bash
   wrangler publish
   ```

#### Usando el Panel de Control de Cloudflare

1. Inicie sesión en el [Panel de Control de Cloudflare](https://dash.cloudflare.com/).
2. Seleccione "Workers & Pages".
3. Haga clic en "Create application" y elija "Create Worker".
4. Nombre su Worker y haga clic en "Deploy".
5. Copie y pegue el contenido de `dist/index.js` en el editor, guarde el archivo.
6. En "Settings", añada las variables de entorno necesarias.

### Configuración del Webhook de Telegram

Use la API de Telegram Bot para configurar el Webhook, ejemplo de URL:

```bash
https://api.telegram.org/bot<SU_TOKEN_DE_BOT>/setWebhook?url=https://su-worker.su-subdominio.workers.dev
```

### Desarrollo Local

1. Clone el proyecto:

   ```bash
   git clone https://github.com/su-usuario/telegram-bot.git
   ```

2. Instale dependencias:

   ```bash
   npm install
   ```

3. Configure las variables de entorno.

4. Compile TypeScript:

   ```bash
   npm run build
   ```

5. Inicie el bot:

   ```bash
   npm start
   ```

## 🔧 Variables de Entorno

| Nombre de Variable | Descripción | Valor por Defecto | Ejemplo |
|--------------------|-------------|-------------------|---------|
| OPENAI_API_KEY | Clave API de OpenAI | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | URL base de la API de OpenAI | https://api.openai.com/v1 | https://su-endpoint-personalizado.com/v1 |
| OPENAI_MODELS | Lista de modelos OpenAI disponibles | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Token del bot de Telegram | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | Lista de IDs de usuarios permitidos | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | Mensaje de inicialización del sistema | You are a helpful assistant. | You are a helpful assistant. |
| SYSTEM_INIT_MESSAGE_ROLE | Rol del mensaje de inicialización del sistema | system | system |
| DEFAULT_MODEL | Modelo de IA por defecto | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | URL REST de Upstash Redis | - | https://su-url-redis.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Token REST de Upstash Redis | - | su-token-redis |
| DALL_E_MODEL | Versión del modelo DALL-E | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Token API de Cloudflare | - | su-token-api-cloudflare |
| CLOUDFLARE_ACCOUNT_ID | ID de cuenta de Cloudflare | - | su-id-cuenta-cloudflare |
| FLUX_STEPS | Número de pasos de generación Flux | 4 | 4-8, máximo 8 |
| PROMPT_OPTIMIZATION | Activar optimización de prompts | false | true |
| EXTERNAL_API_BASE | URL base de API externa | - | https://api-externa.com |
| EXTERNAL_MODEL | Nombre del modelo externo | - | nombre-modelo-externo |
| EXTERNAL_API_KEY | Clave API externa | - | clave-api-externa |
| GOOGLE_MODEL_KEY | Clave API del modelo Google AI | - | su-clave-api-google |
| GOOGLE_MODEL_BASEURL | URL base de la API del modelo Google AI | https://generativelanguage.googleapis.com/v1beta | https://su-endpoint-google-personalizado.com |
| GOOGLE_MODELS | Lista de modelos Google AI disponibles | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Clave API de Groq | - | su-clave-api-groq |
| ANTHROPIC_API_KEY | Clave API de Anthropic | - | su-clave-api-anthropic |
| ANTHROPIC_BASE_URL | URL base de la API de Anthropic | https://api.anthropic.com | https://su-endpoint-anthropic-personalizado.com |

Nota: Algunas variables requieren configuración manual y no tienen valores por defecto.

## 🚀 Funcionalidad de Análisis de Imágenes

Permite a los usuarios subir imágenes y obtener análisis de IA. Instrucciones de uso:

1. El usuario envía una imagen al bot.
2. Incluye un prompt de análisis en la descripción de la imagen, por ejemplo, "Por favor, analiza esta imagen".
3. El bot utilizará el modelo de IA seleccionado actualmente (OpenAI o Google Gemini) para analizar la imagen.
4. El resultado del análisis se enviará como un mensaje de texto al usuario.

Nota: Asegúrese de que el modelo de IA que está utilizando soporte análisis de imágenes. Si el modelo actual no lo soporta, el bot le sugerirá cambiar a un modelo compatible con multimodalidad.

## ⚠️ Consideraciones Importantes

1. 🚦 **Uso Razonable de Cuotas de API**: Especialmente para servicios de generación y análisis de imágenes, tenga en cuenta los límites de uso.
2. 🔐 **Protección de Información Sensible**: Guarde cuidadosamente las variables de entorno y claves API.
3. 🧠 **Conozca las Características de los Modelos**: Elija el modelo de IA más adecuado para su escenario de aplicación.
4. 🔄 **Manténgase Actualizado**: Actualice regularmente el código y las funcionalidades para obtener el mejor rendimiento.
5. 🛡️ **La Seguridad es Primordial**: Actualice periódicamente las claves API y siga el principio de mínimo privilegio.
6. 🎨 **Optimización de Prompts para Flux**: Al activar PROMPT_OPTIMIZATION, asegúrese de configurar correctamente EXTERNAL_API_BASE, EXTERNAL_MODEL y EXTERNAL_API_KEY.

## 🚀 Optimización de Prompts para Flux

Cuando la variable de entorno PROMPT_OPTIMIZATION está configurada como true, la función de generación de imágenes de Flux utilizará una API externa para optimizar los prompts. Esta función trabaja de la siguiente manera:

1. El usuario proporciona el prompt original.
2. El sistema utiliza la API externa configurada con EXTERNAL_API_BASE, EXTERNAL_MODEL y EXTERNAL_API_KEY para optimizar el prompt.
3. El prompt optimizado se utiliza para generar la imagen con el modelo Flux.

Esta función puede ayudar a generar imágenes más precisas y más acordes con las características del modelo Flux. Para utilizar esta función, asegúrese de haber configurado correctamente todas las variables de entorno relacionadas.

## 🔧 Solución de Problemas

- ¿El bot no responde? Verifique la configuración del Webhook y las variables de entorno.
- ¿Encuentra límites de API? Revise el uso de su cuota de API.
- ¿Falla el análisis de imágenes? Asegúrese de estar utilizando un modelo compatible con multimodalidad, como GPT-4o/GPT-4o-mini o Gemini 1.5 Pro/flash.

## 📄 Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE).

Copyright (c) 2024 [snakeying]
