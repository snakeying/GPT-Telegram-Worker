# 🤖💬 Telegram GPT Worker - Asistente de IA multifuncional

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 Introducción al proyecto

¡Bienvenido a Telegram GPT Worker! 👋 Este es un eficiente bot de Telegram desarrollado en TypeScript. Compatible con múltiples idiomas y modelos de IA, se despliega en Cloudflare Workers para ofrecer a los usuarios una experiencia de servicio rápida y escalable.

## 🌟 Características principales

1. 🧠 **Soporte para múltiples modelos**: Integra varios modelos de IA como OpenAI, Google Gemini, Anthropic Claude, Groq y Azure OpenAI.
2. 💬 **Conversación inteligente**: Capacidad de memoria contextual para mantener conversaciones fluidas y naturales.
3. 🎨 **Generación de imágenes**: Permite crear imágenes a partir de descripciones de texto, utilizando tecnologías DALL·E y Cloudflare Flux.
4. 🌍 **Soporte multilingüe**: Función i18n incorporada, compatible con 8 idiomas para satisfacer diversas necesidades.
5. 🔒 **Gestión de permisos de usuario**: Control de acceso mediante función de lista blanca para mejorar la seguridad.
6. ☁️ **Despliegue de alto rendimiento**: Utiliza la capacidad de computación en el borde de Cloudflare Workers para una respuesta rápida.
7. 🗄️ **Gestión eficiente de datos**: Utiliza Redis para el almacenamiento en caché y la gestión de datos, garantizando un procesamiento eficiente.
8. 🔧 **Optimización de prompts para Flux**: Función opcional para optimizar los prompts de generación de imágenes del modelo Flux a través de una API externa.

## 📋 Requisitos del sistema

Antes de comenzar, asegúrese de tener lo siguiente:

- Cuenta de [Cloudflare](https://dash.cloudflare.com/)
- Cuenta de Telegram y Token de Bot
- Base de datos Redis de [Upstash](https://upstash.com/) (con la función [Eviction](https://upstash.com/docs/redis/features/eviction) activada)
- Al menos una clave API de un servicio de IA

## 🚀 Inicio rápido

1. Clonar el repositorio del proyecto
2. Configurar las variables de entorno necesarias
3. Desplegar en Cloudflare Workers
4. Configurar el Webhook de Telegram

Para instrucciones detalladas de despliegue, consulte el tutorial a continuación.

## 📝 Comandos disponibles

- `/start` - Iniciar el bot
- `/language` - Cambiar el idioma
- `/switchmodel` - Cambiar el modelo de IA
- `/new` - Iniciar una nueva conversación
- `/history` - Obtener un resumen del historial de conversación
- `/help` - Obtener información de ayuda
- `/img` - Generar una imagen (DALL-E)
- `/flux` - Generar una imagen (Cloudflare Flux)

## 📁 Estructura del proyecto

```plaintext
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Interacción con API de Azure
│   │   ├── claude.ts              # Interacción con API de Claude
│   │   ├── flux-cf.ts             # Interfaz de generación de imágenes de Cloudflare AI
│   │   ├── gemini.ts              # Interacción con API de Google Gemini
│   │   ├── groq.ts                # Interacción con API de Groq
│   │   ├── image_generation.ts    # Interfaz de generación de imágenes DALL·E
│   │   ├── model_api_interface.ts # Interfaz estándar de API del modelo
│   │   ├── openai_api.ts          # Interacción con API de OpenAI
│   │   └── telegram.ts            # Lógica del bot de Telegram
│   ├── /config                    # Archivos de configuración
│   │   └── commands.ts            # Configuración de comandos del bot
│   ├── /utils
│   │   ├── helpers.ts             # Funciones auxiliares
│   │   ├── i18n.ts                # Soporte multilingüe
│   │   └── redis.ts               # Operaciones de Redis
│   ├── index.ts                   # Archivo de entrada
│   └── env.ts                     # Configuración de variables de entorno
├── /types                         # Archivos de definición de tipos
│   └── telegram.d.ts              # Definiciones de tipos para API de Telegram
├── wrangler.toml                  # Configuración de Cloudflare Worker
├── tsconfig.json                  # Configuración de TypeScript
├── package.json                   # Dependencias del proyecto
└── README.md                      # Documentación del proyecto
```

## 🚀 Tutorial detallado

### Despliegue en Cloudflare Workers

#### Usando Wrangler CLI

1. Instalar Wrangler CLI:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. Iniciar sesión en la cuenta de Cloudflare:

   ```bash
   wrangler login
   ```

3. Crear un nuevo proyecto de Workers:

   ```bash
   wrangler init telegram-bot
   ```

4. Copiar el archivo `dist/index.js` al proyecto.

5. Editar el archivo `wrangler.toml` para configurar el proyecto:

   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "tu_id_de_cuenta"
   workers_dev = true
   ```

6. Desplegar en Cloudflare Workers:

   ```bash
   wrangler publish
   ```

#### Usando el Panel de Control de Cloudflare

1. Iniciar sesión en el [Panel de Control de Cloudflare](https://dash.cloudflare.com/).
2. Seleccionar "Workers & Pages".
3. Hacer clic en "Create application" y seleccionar "Create Worker".
4. Nombrar el Worker y hacer clic en "Deploy".
5. Copiar y pegar el contenido de `dist/index.js` en el editor, guardar el archivo.
6. Añadir las variables de entorno necesarias en "Settings".

### Configurar el Webhook de Telegram

Usar la API de Bot de Telegram para configurar el Webhook, ejemplo de URL:

```bash
https://api.telegram.org/bot<TU_TOKEN_DE_BOT>/setWebhook?url=https://tu-worker.tu-subdominio.workers.dev
```

### Desarrollo local

1. Clonar el proyecto:

   ```bash
   git clone https://github.com/tu-usuario/telegram-bot.git
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Configurar las variables de entorno.

4. Compilar TypeScript:

   ```bash
   npm run build
   ```

5. Iniciar el bot:

   ```bash
   npm start
   ```

## 🔧 Variables de entorno

| Nombre de la variable | Descripción | Valor predeterminado | Ejemplo |
|-----------------------|-------------|----------------------|---------|
| OPENAI_API_KEY | Clave API de OpenAI | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | URL base de la API de OpenAI | https://api.openai.com/v1 | https://tu-punto-final-personalizado.com/v1 |
| OPENAI_MODELS | Lista de modelos OpenAI disponibles | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Token del bot de Telegram | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | Lista de IDs de usuarios autorizados | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | Mensaje de inicialización del sistema | You are a helpful assistant. | Eres un asistente útil. |
| SYSTEM_INIT_MESSAGE_ROLE | Rol del mensaje de inicialización del sistema | system | system |
| DEFAULT_MODEL | Modelo de IA predeterminado | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | URL REST de Upstash Redis | - | https://tu-url-redis.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Token REST de Upstash Redis | - | tu-token-redis |
| DALL_E_MODEL | Versión del modelo DALL-E | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Token API de Cloudflare | - | tu-token-api-cloudflare |
| CLOUDFLARE_ACCOUNT_ID | ID de cuenta de Cloudflare | - | tu-id-cuenta-cloudflare |
| FLUX_STEPS | Número de pasos para la generación de Flux | 4 | 4-8, máximo 8 pasos |
| PROMPT_OPTIMIZATION | Activar optimización de prompts | false | true |
| EXTERNAL_API_BASE | URL base de la API externa | - | https://api-externa.com |
| EXTERNAL_MODEL | Nombre del modelo externo | - | nombre-modelo-externo |
| EXTERNAL_API_KEY | Clave API externa | - | clave-api-externa |
| GOOGLE_MODEL_KEY | Clave API del modelo de Google AI | - | tu-clave-api-google |
| GOOGLE_MODEL_BASEURL | URL base de la API del modelo de Google AI | https://generativelanguage.googleapis.com/v1beta | https://tu-punto-final-google-personalizado.com |
| GOOGLE_MODELS | Lista de modelos de Google AI disponibles | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Clave API de Groq | - | tu-clave-api-groq |
| ANTHROPIC_API_KEY | Clave API de Anthropic | - | tu-clave-api-anthropic |
| ANTHROPIC_BASE_URL | URL base de la API de Anthropic | https://api.anthropic.com | https://tu-punto-final-anthropic-personalizado.com |

Nota: Algunas variables requieren configuración manual y no tienen valores predeterminados.

## ⚠️ Consideraciones importantes

1. 🚦 **Uso responsable de cuotas API**: Especialmente para servicios de generación de imágenes, tenga en cuenta los límites de uso.
2. 🔐 **Protección de información sensible**: Guarde de forma segura las variables de entorno y claves API.
3. 🧠 **Conozca las características del modelo**: Elija el modelo de IA más adecuado para su caso de uso.
4. 🔄 **Manténgase actualizado**: Actualice regularmente el código y las funciones para obtener el mejor rendimiento.
5. 🛡️ **Seguridad primero**: Actualice periódicamente las claves API y siga el principio de mínimo privilegio.
6. 🎨 **Optimización de prompts para Flux**: Al activar PROMPT_OPTIMIZATION, asegúrese de configurar correctamente EXTERNAL_API_BASE, EXTERNAL_MODEL y EXTERNAL_API_KEY.

## 🚀 Optimización de prompts para Flux

Cuando la variable de entorno PROMPT_OPTIMIZATION está configurada como true, la función de generación de imágenes de Flux utilizará una API externa para optimizar los prompts. Esta función opera de la siguiente manera:

1. El usuario proporciona el prompt original.
2. El sistema utiliza la API externa configurada con EXTERNAL_API_BASE, EXTERNAL_MODEL y EXTERNAL_API_KEY para optimizar el prompt.
3. El prompt optimizado se utiliza para generar la imagen con el modelo Flux.

Esta función puede ayudar a generar imágenes más precisas y alineadas con las características del modelo Flux. Para utilizar esta función, asegúrese de configurar correctamente todas las variables de entorno relacionadas.

## 🔧 Solución de problemas

- ¿El bot no responde? Verifique la configuración del Webhook y las variables de entorno.
- ¿Encuentra límites de API? Revise el uso de su cuota de API.

## 📄 Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE).

Copyright (c) 2024 [snakeying]
