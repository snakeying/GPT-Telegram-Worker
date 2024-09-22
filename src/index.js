import { bot, handleMessage, handleStart, getMessageFromUpdate, updateBotCommands } from './bot';
import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from './config';

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'POST') {
      const update = await request.json();
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
  },
  async scheduled(event, env, ctx) {
    // 这里可以添加定时任务的逻辑，如果需要的话
    console.log("This function runs on a schedule!");
  },
};