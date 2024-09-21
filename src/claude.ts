import config from './config';

interface Message {
  role: string;
  content: string;
}

export async function generateClaudeResponse(prompt: string, conversationHistory: Message[], model: string): Promise<ReadableStream> {
  try {
    const response = await fetch(
      config.CLAUDE_ENDPOINT,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.CLAUDE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: config.SYSTEM_INIT_MESSAGE_ROLE, content: config.SYSTEM_INIT_MESSAGE },
            ...conversationHistory,
            { role: 'user', content: prompt }
          ],
          stream: true
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.body as ReadableStream;
  } catch (error) {
    console.error('Error in generateClaudeResponse:', error);
    throw new Error(`Failed to generate Claude response: ${error instanceof Error ? error.message : String(error)}`);
  }
}