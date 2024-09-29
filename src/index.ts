import { Env } from './env';
import TelegramBot from './api/telegram';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const bot = new TelegramBot(env);
    const url = new URL(request.url);

    console.log(`Received request for path: ${url.pathname}`);

    try {
      // Handle Telegram webhook
      if (url.pathname === '/webhook') {
        console.log('Processing webhook request');
        return await bot.handleWebhook(request);
      }

      // Handle root path
      if (url.pathname === '/' || url.pathname === '') {
        console.log('Serving root path');
        return new Response('Hello! This is your Telegram bot worker.', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      // Handle all other requests
      console.log('Path not found');
      return new Response('Not Found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response('Internal Server Error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
};