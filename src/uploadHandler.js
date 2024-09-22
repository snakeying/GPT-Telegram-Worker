import { OpenAI } from 'openai';
import { OPENAI_API_KEY, OPENAI_BASE_URL, SYSTEM_INIT_MESSAGE, SYSTEM_INIT_MESSAGE_ROLE } from './config';

const client = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4'];
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png'];

export async function handleImageUpload(fileInfo, prompt, model) {
  // Check file size
  if (fileInfo.file_size > MAX_FILE_SIZE) {
    return 'File size exceeds the 10MB limit.';
  }

  // Check if the model is supported
  if (!SUPPORTED_MODELS.includes(model)) {
    return `Unsupported model. This feature only supports: ${SUPPORTED_MODELS.join(', ')}`;
  }

  // Check file extension
  const fileExtension = fileInfo.file_path.split('.').pop().toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(fileExtension)) {
    return `Unsupported file type. Supported types are: ${SUPPORTED_EXTENSIONS.join(', ')}`;
  }

  try {
    // Download file
    const response = await fetch(`https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`);
    const fileBuffer = await response.arrayBuffer();

    // Convert file to base64
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

    // Send to OpenAI for analysis
    const analysisResponse = await analyzeImage(base64Content, `image/${fileExtension}`, prompt, model);

    return analysisResponse;
  } catch (error) {
    console.error('Error in image processing:', error);
    return `Image processing error: ${error.message}`;
  }
}

async function analyzeImage(base64Content, mimeType, prompt, model) {
  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: SYSTEM_INIT_MESSAGE_ROLE, content: SYSTEM_INIT_MESSAGE },
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

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    if (error.response) {
      return `API Error: ${error.response.status} - ${error.response.data.error.message}`;
    } else if (error.request) {
      return 'No response received from the API. Please try again later.';
    } else {
      return `Error: ${error.message}`;
    }
  }
}