import { GoogleGenerativeAI, GenerativeModel, ChatSession } from "@google/generative-ai";
import config from './config';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// 构造 Cloudflare AI Gateway URL
const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${config.CLOUDFLARE_ACCOUNT_ID}/${config.CLOUDFLARE_GATEWAY_ID}/google-ai-studio`;

function sanitizeMarkdown(text: string): string {
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

interface Message {
  role: string;
  content: string;
}

async function generateGeminiResponse(prompt: string, conversationHistory: Message[], model: string): Promise<string> {
  try {
    const geminiModel: GenerativeModel = genAI.getGenerativeModel(
      { model: model },
      { baseUrl: gatewayUrl }
    );

    const chat: ChatSession = geminiModel.startChat({
      history: [
        {
          role: config.SYSTEM_INIT_MESSAGE_ROLE === 'system' ? 'user' : config.SYSTEM_INIT_MESSAGE_ROLE,
          parts: [{ text: config.SYSTEM_INIT_MESSAGE }],
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
    throw new Error(`Failed to generate Gemini response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export { generateGeminiResponse };