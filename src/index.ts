import { Redis } from '@upstash/redis';
import config from './config';
import { handleMessage, getMessageFromUpdate, handleCallbackQuery, updateBotCommands, TelegramUpdate, TelegramMessage } from './bot';

const redis = new Redis({
  url: config.UPSTASH_REDIS_REST_URL,
  token: config.UPSTASH_REDIS_REST_TOKEN,
});

const TELEGRAM_API = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}`;

export async function sendMessage(chatId: number, text: string, options?: any): Promise<any> {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      ...options,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function editMessage(chatId: number, messageId: number, text: string, options?: any): Promise<any> {
  const response = await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: text,
      ...options,
    }),
  });
  return response.json();
}

export async function sendChatAction(chatId: number, action: string): Promise<any> {
  const response = await fetch(`${TELEGRAM_API}/sendChatAction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      action: action,
    }),
  });
  return response.json();
}

export async function answerCallbackQuery(callbackQueryId: string, options?: any): Promise<any> {
  const response = await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      ...options,
    }),
  });
  return response.json();
}

export async function sendPhoto(chatId: number, photo: string, options?: any): Promise<any> {
  const response = await fetch(`${TELEGRAM_API}/sendPhoto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photo,
      ...options,
    }),
  });
  return response.json();
}

export async function getFile(fileId: string): Promise<any> {
  const response = await fetch(`${TELEGRAM_API}/getFile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_id: fileId,
    }),
  });
  return response.json();
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    console.log('Received webhook request:', await request.clone().text());
    try {
      if (request.method === 'POST') {
        const update: TelegramUpdate = await request.json();
        console.log('Processing update:', JSON.stringify(update));
        
        if (update.update_id) {
          const key = `processed:${update.update_id}`;
          const isProcessed = await redis.get(key);
          
          if (!isProcessed) {
            await redis.set(key, 'true', { ex: 86400 });
            
            const message = getMessageFromUpdate(update);
            if (message) {
              console.log('Handling message:', JSON.stringify(message));
              
              // 检查是否是新用户
              const userId = message.from.id;
              const userKey = `user:${userId}`;
              const userExists = await redis.get(userKey);
              
              if (!userExists) {
                console.log(`New user detected: ${userId}`);
                await redis.set(userKey, 'true');
                await updateBotCommands(userId);
              }
              
              await handleMessage(update);
              console.log('Message handled successfully');
            } else {
              console.log('Update does not contain a valid message');
            }
          } else {
            console.log('Duplicate update, skipping');
          }
        } else {
          console.log('Missing update_id, skipping');
        }
      } else {
        console.log('Received non-POST request');
      }
      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error("Error in webhook handler:", error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};