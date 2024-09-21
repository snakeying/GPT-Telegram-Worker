import config from './config';

interface Message {
  role: string;
  content: string;
}

export async function generateGroqResponse(prompt: string, conversationHistory: Message[], model: string): Promise<string> {
  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: config.SYSTEM_INIT_MESSAGE_ROLE, content: config.SYSTEM_INIT_MESSAGE },
            ...conversationHistory,
            { role: 'user', content: prompt }
          ],
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in generateGroqResponse:', error);
    throw new Error(`Failed to generate Groq response: ${error instanceof Error ? error.message : String(error)}`);
  }
}