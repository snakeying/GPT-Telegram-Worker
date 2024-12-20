import { Env, getConfig } from '../env';

interface RedisResponse {
  result: string | null;
}

export class RedisClient {
  private url: string;
  private token: string;
  private config: ReturnType<typeof getConfig>;

  constructor(env: Env) {
    this.config = getConfig(env);
    this.url = this.config.upstashRedisRestUrl;
    this.token = this.config.upstashRedisRestToken;
  }

  async get(key: string): Promise<string | null> {
    const response = await fetch(`${this.url}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as RedisResponse;
    return data.result;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const url = ttl
      ? `${this.url}/set/${key}/${value}?EX=${ttl}`
      : `${this.url}/set/${key}/${value}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async del(key: string): Promise<void> {
    const response = await fetch(`${this.url}/del/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async setLanguage(userId: string, language: string): Promise<void> {
    await this.set(`language:${userId}`, language, this.config.languageTTL);
  }

  async appendContext(userId: string, newContext: string): Promise<void> {
    const key = `context:${userId}`;
    const existingContext = await this.get(key);
    const updatedContext = existingContext
      ? `${existingContext}\n${newContext}`
      : newContext;
    await this.set(key, updatedContext, this.config.contextTTL);
  }

  async getAllUserLanguages(): Promise<Record<string, string>> {
    const keys = await this.keys('language:*');
    const userLanguages: Record<string, string> = {};

    for (const key of keys) {
      const userId = key.split(':')[1];
      const language = await this.get(key);
      if (language) {
        userLanguages[userId] = language;
      }
    }

    return userLanguages;
  }

  async keys(pattern: string): Promise<string[]> {
    const response = await fetch(`${this.url}/keys/${pattern}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { result: string[] };
    return data.result;
  }
}