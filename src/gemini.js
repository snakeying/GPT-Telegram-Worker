import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, GEMINI_ENDPOINT, SYSTEM_INIT_MESSAGE, SYSTEM_INIT_MESSAGE_ROLE } from './config';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY, GEMINI_ENDPOINT);

function sanitizeMarkdown(text) {
  const specialChars = ['*', '_', '`', '['];
  let sanitized = text;
  
  specialChars.forEach(char => {
    const regex = new RegExp(`(?<!\\${char})\\${char}(?!\\${char})`, 'g');
    sanitized = sanitized.replace(regex, `\\${char}`);
  });

  sanitized = sanitized
    .replace(/\]/g, '\\]')
    .replace(/\)/g, '\\)')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#');

  return sanitized;
}

export async function generateGeminiResponse(prompt, conversationHistory, model) {
  try {
    const geminiModel = genAI.getGenerativeModel({ model: model });

    const chat = geminiModel.startChat({
      history: [
        {
          role: SYSTEM_INIT_MESSAGE_ROLE === 'system' ? 'user' : SYSTEM_INIT_MESSAGE_ROLE,
          parts: [{ text: SYSTEM_INIT_MESSAGE }],
        },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return sanitizeMarkdown(response.text());
  } catch (error) {
    console.error('Error in generateGeminiResponse:', error);
    throw new Error(`Failed to generate Gemini response: ${error.message}`);
  }
}