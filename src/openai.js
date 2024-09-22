import { OpenAI } from 'openai';
import { OPENAI_API_KEY, OPENAI_BASE_URL, SYSTEM_INIT_MESSAGE, SYSTEM_INIT_MESSAGE_ROLE } from './config';

const client = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL
});

export async function generateResponse(prompt, conversationHistory, model) {
  console.log('Generating response for:', prompt);
  console.log('Using model:', model);
  console.log('Conversation history:', JSON.stringify(conversationHistory));

  try {
    const messages = [
      { role: SYSTEM_INIT_MESSAGE_ROLE, content: SYSTEM_INIT_MESSAGE },
      ...conversationHistory,
      { role: 'user', content: prompt }
    ];

    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
    });

    console.log('Received response from OpenAI API');

    if (response.choices && response.choices.length > 0) {
      const generatedText = response.choices[0].message.content.trim();
      console.log('Generated text:', generatedText);
      return generatedText;
    } else {
      throw new Error('Unexpected API response structure');
    }
  } catch (error) {
    console.error('Error in generateResponse function:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

export async function* generateStreamResponse(prompt, conversationHistory, model) {
  console.log('Generating stream response for:', prompt);
  console.log('Using model:', model);
  console.log('Conversation history:', JSON.stringify(conversationHistory));

  try {
    const messages = [
      { role: SYSTEM_INIT_MESSAGE_ROLE, content: SYSTEM_INIT_MESSAGE },
      ...conversationHistory,
      { role: 'user', content: prompt }
    ];

    const stream = await client.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      stream: true,
    });

    console.log('Received stream from OpenAI API');
    
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  } catch (error) {
    console.error('Error in generateStreamResponse function:', error);
    throw new Error(`Failed to generate stream response: ${error.message}`);
  }
}