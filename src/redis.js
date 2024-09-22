import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, MAX_HISTORY_LENGTH } from './config';

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

export async function getConversationHistory(userId) {
  try {
    const key = `user:${userId}:history`;
    const history = await redis.get(key);
    console.log(`Retrieved raw history for user ${userId}:`, history);
    
    if (typeof history === 'string') {
      return JSON.parse(history);
    } else if (Array.isArray(history)) {
      return history;
    } else if (history && typeof history === 'object') {
      return [history];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

export async function addToConversationHistory(userId, message, response) {
  try {
    const key = `user:${userId}:history`;
    const history = await getConversationHistory(userId);
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response });
    
    // Keep only the last MAX_HISTORY_LENGTH messages
    if (history.length > MAX_HISTORY_LENGTH) {
      history.splice(0, history.length - MAX_HISTORY_LENGTH);
    }
    
    const jsonHistory = JSON.stringify(history);
    await redis.set(key, jsonHistory, { ex: 2592000 }); // 30 days TTL
    console.log(`Updated history for user ${userId}:`, jsonHistory);
  } catch (error) {
    console.error('Error adding to conversation history:', error);
  }
}

export async function clearConversationHistory(userId) {
  try {
    const key = `user:${userId}:history`;
    await redis.del(key);
    console.log(`Cleared history for user ${userId}`);
  } catch (error) {
    console.error('Error clearing conversation history:', error);
  }
}