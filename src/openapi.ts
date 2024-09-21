import { Config } from './config';

interface Message {
  role: string;
  content: string;
}

export const chat = async (config: Config, messages: Message[], onProgress: (chunk: string) => void): Promise<string> => {
  const response = await fetch(`${config.OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: config.DEFAULT_MODEL,
      messages: [
        { role: config.SYSTEM_INIT_MESSAGE_ROLE, content: config.SYSTEM_INIT_MESSAGE },
        ...messages,
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.includes('[DONE]')) continue;
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.choices && data.choices[0].delta.content) {
          const content = data.choices[0].delta.content;
          fullResponse += content;
          onProgress(content);
        }
      }
    }
  }

  return fullResponse.trim();
};