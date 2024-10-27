# 🤖💬 Telegram GPT Worker - Asistente de IA multifuncional

[English](../README.md) | [简体中文](./README.zh-cn.md) | [繁體中文](./README.zh-hant.md) | [日本語](./README.ja.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

## 📖 Descripción del Proyecto

¡Bienvenido a Telegram GPT Worker! 👋 Este es un bot de Telegram eficiente desarrollado en TypeScript. Compatible con múltiples idiomas y modelos de IA, se implementa en Cloudflare Workers y ofrece a los usuarios una experiencia de servicio rápida y escalable.

## 🌟 Características Principales

1. 🧠 **Soporte Multi-Modelo**: Integración con OpenAI, Google Gemini, Anthropic Claude, Groq y Azure OpenAI.
2. 🔗 **Compatibilidad con modelos de OpenAI**: Diseñado específicamente para sistemas de gestión y distribución de interfaces de modelos de IA como One API y New API, con soporte para la recuperación automática de la lista de modelos.
3. 💬 **Conversaciones Inteligentes**: Capacidad de memoria contextual para diálogos naturales.
4. 🎨 **Generación de Imágenes**: Creación de imágenes a partir de descripciones textuales usando DALL·E y Cloudflare Flux.
5. 🖼️ **Análisis de Imágenes**: Análisis inteligente de imágenes subidas mediante OpenAI o Google Gemini.
6. 🌍 **Multilingüe**: Función i18n integrada, compatible con 8 idiomas.
7. 🔒 **Gestión de Usuarios**: Control de acceso mediante lista blanca.
8. ☁️ **Implementación de Alto Rendimiento**: Respuestas rápidas gracias a Cloudflare Workers.
9. 🗄️ **Gestión Eficiente de Datos**: Almacenamiento en caché mediante Redis.
10. 🔧 **Optimización de Prompts Flux**: API externa opcional para mejorar la generación de imágenes.

## 📋 Requisitos del Sistema

Antes de comenzar, necesitarás:

- Una cuenta de [Cloudflare](https://dash.cloudflare.com/)
- Una cuenta de Telegram y un Token de Bot
- Una base de datos Redis de [Upstash](https://upstash.com/) (con la función [Eviction](https://upstash.com/docs/redis/features/eviction) activada)
- Al menos una clave API de un servicio de IA

## 🚀 Inicio Rápido

1. Clonar el repositorio del proyecto
2. Configurar las variables de entorno necesarias
3. Implementar en Cloudflare Workers
4. Configurar el Webhook de Telegram

Las instrucciones detalladas se proporcionan a continuación.

## 📝 Comandos Disponibles

- `/start` - Iniciar el bot
- `/language` - Cambiar el idioma
- `/switchmodel` - Cambiar el modelo de IA
- `/new` - Iniciar una nueva conversación
- `/history` - Obtener el historial de conversaciones
- `/help` - Obtener ayuda
- `/img` - Generar una imagen (DALL-E)
- `/flux` - Generar una imagen (Cloudflare Flux)

## 📁 Estructura del Proyecto

```
/GPT-Telegram-Worker
│
├── /src
│   ├── /api
│   │   ├── azure.ts               # Interacción con API de Azure
│   │   ├── claude.ts              # Interacción con API de Claude
│   │   ├── flux-cf.ts             # Interfaz de dibujo IA de Cloudflare
│   │   ├── gemini.ts              # Interacción con API de Google Gemini
│   │   ├── groq.ts                # Interacción con API de Groq
│   │   ├── image_generation.ts    # Interfaz de dibujo DALL·E
│   │   ├── model_api_interface.ts # Interfaz común para APIs de modelos
│   │   ├── openai_api.ts          # Interacción con API de OpenAI
│   │   ├── openai_compatible.ts   # Maneja interacciones de API compatibles con OpenAI
│   │   └── telegram.ts            # Lógica del bot de Telegram
│   ├── /config                    # Archivos de configuración
│   │   └── commands.ts            # Comandos del bot de Telegram
│   ├── /utils
│   │   └── helpers.ts             # Funciones auxiliares
│   │   └── i18n.ts                # Funciones multilingües
│   │   └── redis.ts               # Funciones de Redis Upstash
│   │   └── image_analyze.ts       # Funciones de subida de imágenes
│   ├── index.ts                   # Punto de entrada
│   └── env.ts                     # Variables de entorno
├── /types                         # Definiciones de tipos
│   └── telegram.d.ts              # Tipos para API de Telegram
├── wrangler.toml                  # Configuración de Cloudflare Worker
├── tsconfig.json                  # Configuración de TypeScript
├── package.json                   # Dependencias del proyecto
└── README.md                      # Documentación del proyecto
```

## 🚀 Guía Detallada

### Implementación en Cloudflare Workers

#### Uso de Wrangler CLI

1. Instalar Wrangler CLI:

   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. Iniciar sesión en Cloudflare:

   ```bash
   wrangler login
   ```

3. Crear un nuevo proyecto de Workers:

   ```bash
   wrangler init telegram-bot
   ```

4. Copiar el archivo `dist/index.js` al proyecto.

5. Editar el archivo `wrangler.toml`:

   ```toml
   name = "telegram-bot"
   type = "javascript"
   account_id = "tu_id_de_cuenta"
   workers_dev = true
   ```

6. Implementar en Cloudflare Workers:

   ```bash
   wrangler publish
   ```

#### A través del Panel de Control de Cloudflare

1. Iniciar sesión en el [Panel de Control de Cloudflare](https://dash.cloudflare.com/).
2. Seleccionar "Workers & Pages".
3. Hacer clic en "Create application" y elegir "Create Worker".
4. Nombrar el Worker y hacer clic en "Deploy".
5. Copiar y pegar `dist/index.js` en el editor, guardar.
6. Añadir las variables de entorno en "Settings".

### Configuración del Webhook de Telegram

Usar la API de Bot de Telegram para configurar el Webhook, ejemplo de URL:

```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-worker.your-subdomain.workers.dev/webhook
```

```bash
https://api.telegram.org/bot123456789:abcdefghijklmn/setWebhook?url=https://gpt-telegram-worker.abcdefg.workers.dev/webhook
```

### Desarrollo Local

1. Clonar el proyecto:

   ```bash
   git clone https://github.com/snakeying/telegram-bot.git
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Configurar variables de entorno.

4. Compilar TypeScript:

   ```bash
   npm run build
   ```

5. Iniciar el bot:

   ```bash
   npm start
   ```

## 🔧 Variables de Entorno

| Variable | Descripción | Valor Predeterminado | Ejemplo |
|----------|-------------|----------------------|---------|
| OPENAI_API_KEY | Clave API de OpenAI | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_BASE_URL | URL base de API OpenAI | https://api.openai.com/v1 | https://tu-endpoint.es/v1 |
| OPENAI_MODELS | Lista de modelos OpenAI | - | gpt-3.5-turbo,gpt-4 |
| TELEGRAM_BOT_TOKEN | Token del bot de Telegram | - | 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 |
| WHITELISTED_USERS | Lista de IDs de usuarios permitidos | - | 12345678,87654321 |
| SYSTEM_INIT_MESSAGE | Mensaje de inicialización del sistema | You are a helpful assistant. | Eres un asistente útil. |
| SYSTEM_INIT_MESSAGE_ROLE | Rol del mensaje de inicialización | system | system |
| DEFAULT_MODEL | Modelo de IA predeterminado | - | gpt-3.5-turbo |
| UPSTASH_REDIS_REST_URL | URL REST de Redis Upstash | - | https://tu-redis-url.upstash.io |
| UPSTASH_REDIS_REST_TOKEN | Token REST de Redis Upstash | - | tu-token-redis |
| DALL_E_MODEL | Versión del modelo DALL-E | dall-e-3 | dall-e-3 |
| CLOUDFLARE_API_TOKEN | Token API de Cloudflare | - | tu-token-api-cloudflare |
| CLOUDFLARE_ACCOUNT_ID | ID de cuenta de Cloudflare | - | tu-id-cuenta-cloudflare |
| FLUX_STEPS | Número de pasos Flux | 4 | 4-8, máximo 8 |
| PROMPT_OPTIMIZATION | Activar optimización de prompts | false | true |
| EXTERNAL_API_BASE | URL base de API externa | - | https://api-externa.es |
| EXTERNAL_MODEL | Nombre del modelo externo | - | nombre-modelo-externo |
| EXTERNAL_API_KEY | Clave API externa | - | clave-api-externa |
| GOOGLE_MODEL_KEY | Clave API del modelo Google AI | - | tu-clave-api-google |
| GOOGLE_MODEL_BASEURL | URL base de API Google AI | https://generativelanguage.googleapis.com/v1beta | https://tu-endpoint-google.es |
| GOOGLE_MODELS | Lista de modelos Google AI | - | gemini-pro,gemini-pro-vision |
| GROQ_API_KEY | Clave API de Groq | - | tu-clave-api-groq |
| ANTHROPIC_API_KEY | Clave API de Anthropic | - | tu-clave-api-anthropic |
| ANTHROPIC_BASE_URL | URL base de API Anthropic | https://api.anthropic.com | https://tu-endpoint-anthropic.es |
| OPENAI_COMPATIBLE_KEY | Clave API compatible con OpenAI | - | sk-abcdefghijklmnopqrstuvwxyz123456 |
| OPENAI_COMPATIBLE_URL | URL base del API compatible con OpenAI | - | https://your-custom-endpoint.com/v1 |

Nota: Algunas variables requieren configuración manual y no tienen valores predeterminados.

## 🚀 Funcionalidad de Análisis de Imágenes

Permite a los usuarios subir y analizar imágenes:

1. Envía una imagen al bot.
2. Añade una instrucción de análisis, por ejemplo "Analiza esta imagen".
3. El bot utiliza el modelo de IA actual (OpenAI o Google Gemini) para el análisis.
4. El resultado se devuelve como un mensaje de texto.

Nota: Asegúrate de que el modelo de IA elegido admita el análisis de imágenes.

## 🚀 Optimización de Prompts Flux

Cuando PROMPT_OPTIMIZATION está activado (variable de entorno = true), se utiliza una API externa para optimizar la generación de imágenes:

1. El usuario proporciona el prompt inicial.
2. La API externa optimiza el prompt (configurada mediante variables EXTERNAL_*).
3. El prompt optimizado se utiliza para la generación de imágenes Flux.

Esta función mejora la calidad y precisión de las imágenes generadas. Asegúrate de configurar correctamente todas las variables de entorno necesarias.

## ⚠️ Puntos Importantes

1. 🚦 **Cuotas de API**: Ten en cuenta los límites de uso, especialmente para servicios de imágenes.
2. 🔐 **Seguridad de Datos**: Protege cuidadosamente las variables de entorno y las claves API.
3. 🧠 **Conocimiento de Modelos**: Elige el modelo más adecuado para tu caso de uso.
4. 🔄 **Actualizaciones**: Actualiza regularmente el código y las funcionalidades.
5. 🛡️ **Seguridad Primero**: Renueva regularmente las claves API, sigue el principio de mínimo privilegio.
6. 🎨 **Optimización de Prompts Flux**: Configura correctamente todas las variables requeridas si PROMPT_OPTIMIZATION está activado.
7. ⛔ **Aviso importante**: Para evitar posibles conflictos, no se recomienda agregar modelos que ya estén en uso por otras APIs en OpenAI Compatible. Por ejemplo, si ha configurado la API de Gemini y ha seleccionado el modelo gemini-1.5-flash, no debe agregar el mismo modelo en OpenAI Compatible.

## 🔧 Solución de Problemas

- ¿El bot no responde? Verifica la configuración del Webhook y las variables de entorno.
- ¿Limitaciones de API? Verifica tu cuota de uso de API.
- ¿Fallo en el análisis de imagen? Asegúrate de usar un modelo multimodal (ej: GPT-4 o Gemini Pro).

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

Copyright (c) 2024 [snakeying]
