import { AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, SYSTEM_INIT_MESSAGE, SYSTEM_INIT_MESSAGE_ROLE } from './config';

export async function generateAzureOpenAIResponse(prompt, conversationHistory, model) {
  try {
    const response = await fetch(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${model}/chat/completions?api-version=2023-06-01`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_API_KEY
        },
        body: JSON.stringify({
          messages: [
            { role: SYSTEM_INIT_MESSAGE_ROLE, content: SYSTEM_INIT_MESSAGE },
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

    return response.body;
  } catch (error) {
    console.error('Error in generateAzureOpenAIResponse:', error);
    throw new Error(`Failed to generate Azure OpenAI response: ${error.message}`);
  }
}