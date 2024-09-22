import { CLAUDE_API_KEY, CLAUDE_ENDPOINT, SYSTEM_INIT_MESSAGE, SYSTEM_INIT_MESSAGE_ROLE } from './config';

export async function generateClaudeResponse(prompt, conversationHistory, model) {
  try {
    const response = await fetch(CLAUDE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLAUDE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: SYSTEM_INIT_MESSAGE_ROLE, content: SYSTEM_INIT_MESSAGE },
          ...conversationHistory,
          { role: 'user', content: prompt }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.body;
  } catch (error) {
    console.error('Error in generateClaudeResponse:', error);
    throw new Error(`Failed to generate Claude response: ${error.message}`);
  }
}