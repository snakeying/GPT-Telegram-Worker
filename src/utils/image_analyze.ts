import { Env, getConfig } from '../env';
import { ModelAPIInterface, Message } from '../api/model_api_interface';
import OpenAIAPI from '../api/openai_api';
import GeminiAPI from '../api/gemini';

export async function analyzeImage(imageUrl: string, prompt: string, env: Env, currentModel: string): Promise<string> {
  const config = getConfig(env);
  let api: ModelAPIInterface;

  if (config.openaiModels.includes(currentModel)) {
    api = new OpenAIAPI(env);
    return await analyzeWithOpenAI(api as OpenAIAPI, imageUrl, prompt, currentModel);
  } else if (config.googleModels.includes(currentModel)) {
    api = new GeminiAPI(env);
    return await analyzeWithGemini(api as GeminiAPI, imageUrl, prompt, currentModel);
  } else {
    throw new Error(`Current model ${currentModel} does not support image analysis`);
  }
}

async function analyzeWithOpenAI(api: OpenAIAPI, imageUrl: string, prompt: string, model: string): Promise<string> {
  const base64Image = await fetchImageAsBase64(imageUrl);
  const messages: Message[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`
          }
        }
      ]
    }
  ];

  return await api.generateResponse(messages, model);
}

async function analyzeWithGemini(api: GeminiAPI, imageUrl: string, prompt: string, model: string): Promise<string> {
  const base64Image = await fetchImageAsBase64(imageUrl);
  const messages: Message[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`
          }
        }
      ]
    }
  ];

  return await api.generateResponse(messages, model);
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
}