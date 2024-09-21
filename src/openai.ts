import OpenAI from 'openai';
import config from './config';

const client = new OpenAI({ 
  apiKey: config.OPENAI_API_KEY,
  baseURL: config.OPENAI_BASE_URL
});

type MessageRole = 'system' | 'user' | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
}

async function generateResponse(prompt: string, conversationHistory: Message[], model: string): Promise<string> {
  console.log('Generating response for:', prompt);
  console.log('Using model:', model);
  console.log('Conversation history:', JSON.stringify(conversationHistory));

  try {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: config.SYSTEM_INIT_MESSAGE_ROLE as MessageRole, content: config.SYSTEM_INIT_MESSAGE },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user' as const, content: prompt }
    ];

    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
    });

    console.log('Received response from OpenAI API');

    if (response.choices && response.choices.length > 0) {
      const generatedText = response.choices[0].message.content?.trim() || '';
      console.log('Generated text:', generatedText);
      return generatedText;
    } else {
      throw new Error('Unexpected API response structure');
    }
  } catch (error) {
    console.error('Error in generateResponse function:', error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function* generateStreamResponse(prompt: string, conversationHistory: Message[], model: string): AsyncGenerator<string, void, unknown> {
  console.log('Generating stream response for:', prompt);
  console.log('Using model:', model);
  console.log('Conversation history:', JSON.stringify(conversationHistory));

  try {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: config.SYSTEM_INIT_MESSAGE_ROLE as MessageRole, content: config.SYSTEM_INIT_MESSAGE },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user' as const, content: prompt }
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
    throw new Error(`Failed to generate stream response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export { generateResponse, generateStreamResponse };