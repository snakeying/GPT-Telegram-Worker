import { GROQ_API_KEY, SYSTEM_INIT_MESSAGE, SYSTEM_INIT_MESSAGE_ROLE } from './config';

export async function generateGroqResponse(prompt, conversationHistory, model) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: SYSTEM_INIT_MESSAGE_ROLE, content: SYSTEM_INIT_MESSAGE },
          ...conversationHistory,
          { role: 'user', content: prompt }
        ],
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in generateGroqResponse:', error);
    throw new Error(`Failed to generate Groq response: ${error.message}`);
  }
}