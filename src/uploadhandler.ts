import OpenAI from 'openai';
import config from './config';

const client = new OpenAI({ 
  apiKey: config.OPENAI_API_KEY,
  baseURL: config.OPENAI_BASE_URL
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4'];
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png'];

interface FileInfo {
  file_id: string;
  file_path: string;
  file_size: number;
}
type AllowedRole = "system" | "user" | "assistant";
const SYSTEM_ROLE: AllowedRole = (config.SYSTEM_INIT_MESSAGE_ROLE as AllowedRole) || "system";

export async function handleImageUpload(fileInfo: FileInfo, prompt: string, model: string): Promise<string> {
  // Check file size
  if (fileInfo.file_size > MAX_FILE_SIZE) {
    return 'File size exceeds the 10MB limit.';
  }

  // Check if the model is supported
  if (!SUPPORTED_MODELS.includes(model)) {
    return `Unsupported model. This feature only supports: ${SUPPORTED_MODELS.join(', ')}`;
  }

  // Check file extension
  const fileExtension = fileInfo.file_path.split('.').pop()?.toLowerCase();
  if (!fileExtension || !SUPPORTED_EXTENSIONS.includes(fileExtension)) {
    return `Unsupported file type. Supported types are: ${SUPPORTED_EXTENSIONS.join(', ')}`;
  }

  try {
    // Download file
    const response = await fetch(`https://api.telegram.org/file/bot${config.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const fileBuffer = await response.arrayBuffer();
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

    // Send to OpenAI for analysis
    const analysisResponse = await analyzeImage(base64Content, `image/${fileExtension}`, prompt, model);

    return analysisResponse;
  } catch (error) {
    console.error('Error in image processing:', error);
    return `Image processing error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function analyzeImage(base64Content: string, mimeType: string, prompt: string, model: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: SYSTEM_ROLE, content: config.SYSTEM_INIT_MESSAGE },
        { 
          role: "user", 
          content: [
            { type: "text", text: prompt },
            { 
              type: "image_url", 
              image_url: {
                url: `data:${mimeType};base64,${base64Content}`
              }
            }
          ] 
        }
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    if (error instanceof Error) {
      if ('response' in error) {
        return `API Error: ${(error as any).response?.status} - ${(error as any).response?.data?.error?.message}`;
      } else if ('request' in error) {
        return 'No response received from the API. Please try again later.';
      } else {
        return `Error: ${error.message}`;
      }
    }
    return 'An unknown error occurred';
  }
}