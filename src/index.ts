import { Env } from './env';
import TelegramBot from './api/telegram';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const bot = new TelegramBot(env);
    const url = new URL(request.url);

    try {
      if (url.pathname === '/webhook') {
        return await bot.handleWebhook(request);
      }

      if (url.pathname === '/' || url.pathname === '') {
        return new Response('Hello! This is your Telegram bot worker.', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      return new Response('Not Found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (error) {
      console.error('Error processing request:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return new Response(`Internal Server Error: ${errorMessage}`, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
};