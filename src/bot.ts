import { Redis } from '@upstash/redis';
import config from './config';
import { generateResponse, generateStreamResponse } from './openai';
import { generateGeminiResponse } from './gemini';
import { generateGroqResponse } from './groq';
import { generateClaudeResponse } from './claude';
import { generateAzureOpenAIResponse } from './azureOpenAI';
import { getConversationHistory, addToConversationHistory, clearConversationHistory } from './redis';
import { generateImage, VALID_SIZES } from './generateImage';
type ValidSize = typeof VALID_SIZES[number];
import { handleImageUpload } from './uploadhandler';
import { getUserLanguage, setUserLanguage, translate, supportedLanguages, getLocalizedCommands } from './localization';
import { sendMessage, editMessage, sendChatAction, answerCallbackQuery, sendPhoto, getFile } from './index';

export interface TelegramMessage {
  chat: {
    id: number;
  };
  from: {
    id: number;
  };
  text?: string;
  photo?: Array<{ file_id: string }>;
  caption?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: {
      id: number;
    };
    message: TelegramMessage;
    data: string;
  };
}

let currentModel = config.OPENAI_API_KEY ? config.DEFAULT_MODEL : null;

const redis = new Redis({
  url: config.UPSTASH_REDIS_REST_URL,
  token: config.UPSTASH_REDIS_REST_TOKEN,
});

export function getMessageFromUpdate(update: TelegramUpdate): TelegramMessage | undefined {
  if (update.callback_query) {
    return update.callback_query.message;
  }
  return update.message || update.edited_message;
}

export async function updateBotCommands(userId: number): Promise<void> {
  const commands = await getLocalizedCommands(userId);
  try {
    // Implement setting bot commands using Telegram API
    console.log(`Updated bot commands for user ${userId}`);
  } catch (error) {
    console.error(`Failed to update bot commands for user ${userId}:`, error);
  }
}

async function handleStart(msg: TelegramMessage): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  try {
    await sendMessage(chatId, translate('welcome', userLang, {model: currentModel as string}), {parse_mode: 'Markdown'});
    console.log('Start message sent successfully');
  } catch (error) {
    console.error('Error sending start message:', error);
  }
}

async function handleNew(msg: TelegramMessage): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  try {
    await clearConversationHistory(userId);
    await sendMessage(chatId, translate('new_conversation', userLang, {model: currentModel as string}), {parse_mode: 'Markdown'});
    console.log('New conversation message sent successfully');
  } catch (error) {
    console.error('Error handling new conversation:', error);
  }
}

async function handleHistory(msg: TelegramMessage): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  try {
    const history = await getConversationHistory(userId);
    console.log('Processed history:', JSON.stringify(history, null, 2));
    if (!Array.isArray(history) || history.length === 0) {
      await sendMessage(chatId, translate('no_history', userLang), {parse_mode: 'Markdown'});
      return;
    }
    const historyText = history.map(m => `${m.role}: ${m.content}`).join('\n\n');
    await sendMessage(chatId, translate('history_intro', userLang) + historyText, {parse_mode: 'Markdown'});
  } catch (error) {
    console.error('Error retrieving conversation history:', error);
    await sendMessage(chatId, translate('error_message', userLang), {parse_mode: 'Markdown'});
  }
}

async function handleHelp(msg: TelegramMessage): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  try {
    const availableModels = [
      ...(config.OPENAI_API_KEY ? config.OPENAI_MODELS : []),
      ...(config.GEMINI_API_KEY ? config.GOOGLE_MODELS : []),
      ...(config.GROQ_API_KEY ? config.GROQ_MODELS : []),
      ...(config.CLAUDE_API_KEY ? config.CLAUDE_MODELS : []),
      ...(config.AZURE_OPENAI_API_KEY ? config.AZURE_OPENAI_MODELS : [])
    ];
    const helpMessage = translate('help_message', userLang, {
      models: availableModels.join(', '),
      current_model: currentModel as string
    });
    await sendMessage(chatId, helpMessage, {parse_mode: 'Markdown'});
    console.log('Help message sent successfully');
  } catch (error) {
    console.error('Error sending help message:', error);
  }
}

async function handleSwitchModel(msg: TelegramMessage): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  const args = msg.text?.split(' ') || [];
  
  const availableModels = [
    ...(config.OPENAI_API_KEY ? config.OPENAI_MODELS : []),
    ...(config.GEMINI_API_KEY ? config.GOOGLE_MODELS : []),
    ...(config.GROQ_API_KEY ? config.GROQ_MODELS : []),
    ...(config.CLAUDE_API_KEY ? config.CLAUDE_MODELS : []),
    ...(config.AZURE_OPENAI_API_KEY ? config.AZURE_OPENAI_MODELS : [])
  ];

  if (args.length < 2) {
    await sendMessage(chatId, translate('forgot_model_name', userLang, {available_models: availableModels.join(', ')}), {parse_mode: 'Markdown'});
    return;
  }

  const modelName = args[1].trim();
  
  if ((config.OPENAI_MODELS.includes(modelName) && config.OPENAI_API_KEY) || 
      (config.GOOGLE_MODELS.includes(modelName) && config.GEMINI_API_KEY) ||
      (config.GROQ_MODELS.includes(modelName) && config.GROQ_API_KEY) ||
      (config.CLAUDE_MODELS.includes(modelName) && config.CLAUDE_API_KEY) ||
      (config.AZURE_OPENAI_MODELS.includes(modelName) && config.AZURE_OPENAI_API_KEY)) {
    currentModel = modelName;
    await clearConversationHistory(userId);
    await sendMessage(chatId, translate('model_switched', userLang, {model: modelName}), {parse_mode: 'Markdown'});
  } else {
    await sendMessage(chatId, translate('invalid_model', userLang, {available_models: availableModels.join(', ')}), {parse_mode: 'Markdown'});
  }
}

async function handleImageGeneration(msg: TelegramMessage): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);

  if (!config.OPENAI_API_KEY) {
    await sendMessage(chatId, translate('no_api_key', userLang));
    return;
  }

  const args = msg.text?.split(' ') || [];
  args.shift(); // Remove "/img" command

  let size: ValidSize = '1024x1024';
  let prompt: string;

  // Check if the last argument is possibly a size
  const possibleSize = args[args.length - 1];
  if (possibleSize && possibleSize.includes('x')) {
    if (VALID_SIZES.includes(possibleSize as ValidSize)) {
      size = possibleSize as ValidSize;
      args.pop(); // Remove size from the argument list
    } else {
      // If size is invalid, send error message and return
      await sendMessage(chatId, translate('invalid_size', userLang, {size: possibleSize, valid_sizes: VALID_SIZES.join(', ')}));
      return;
    }
  }

  prompt = args.join(' ');

  if (prompt.trim() === '') {
    // If no description is provided, suggest using /help command
    await sendMessage(chatId, translate('no_image_description', userLang) + ' ' + translate('use_help_command', userLang));
    return;
  }

  try {
    console.log(`Processing image generation request. Chat ID: ${chatId}, Prompt: "${prompt}", Size: ${size}`);
    await sendChatAction(chatId, 'upload_photo');
    
    const requestId = `img_req:${userId}:${Date.now()}`;
    
    const existingImageUrl = await redis.get(requestId);
    
    if (existingImageUrl) {
      console.log(`Using existing image URL: ${existingImageUrl}`);
      await sendPhoto(chatId, existingImageUrl as string, { caption: prompt });
      return;
    }
    
    console.log(`Generating image with prompt: "${prompt}" and size: ${size}`);
    const imageUrl = await generateImage(prompt, size);
    console.log(`Image URL generated: ${imageUrl}`);
    
    if (imageUrl) {
      await redis.set(requestId, imageUrl, { ex: 86400 }); // Expires after 1 day
      
      console.log(`Sending image. URL: ${imageUrl}`);
      await sendPhoto(chatId, imageUrl, { caption: prompt });
      console.log('Photo sent successfully');
    } else {
      throw new Error('Failed to get image URL');
    }
  } catch (error) {
    console.error('Error in image generation or sending:', error);
    let errorMessage = translate('error_message', userLang);
    if (error instanceof Error) {
      if ('response' in error) {
        console.error('API error response:', (error as any).response?.data);
        errorMessage += ` API Error: ${(error as any).response?.data?.error?.message}`;
      } else if ('request' in error) {
        console.error('No response received from API');
        errorMessage += ' No response received from API.';
      } else {
        errorMessage += ` ${error.message}`;
      }
    }
    await sendMessage(chatId, errorMessage);
  }
}

async function handleStreamMessage(msg: TelegramMessage): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  
  await sendChatAction(chatId, 'typing');
  const conversationHistory = await getConversationHistory(userId);

  if (config.GROQ_MODELS.includes(currentModel as string) && config.GROQ_API_KEY) {
    try {
      const response = await generateGroqResponse(msg.text || '', conversationHistory, currentModel as string);
      await sendMessage(chatId, response, {parse_mode: 'Markdown'});
      await addToConversationHistory(userId, msg.text || '', response);
    } catch (error) {
      console.error('Error in Groq processing:', error);
      await sendMessage(chatId, translate('error_message', userLang), {parse_mode: 'Markdown'});
    }
    return;
  }

  if (config.GOOGLE_MODELS.includes(currentModel as string) && config.GEMINI_API_KEY) {
    try {
      const response = await generateGeminiResponse(msg.text || '', conversationHistory, currentModel as string);
      await sendMessage(chatId, response, {parse_mode: 'Markdown'});
      await addToConversationHistory(userId, msg.text || '', response);
    } catch (error) {
      console.error('Error in Gemini processing:', error);
      await sendMessage(chatId, translate('error_message', userLang), {parse_mode: 'Markdown'});
    }
    return;
  }

  let stream: AsyncIterable<string>;
  if (config.OPENAI_API_KEY && config.OPENAI_MODELS.includes(currentModel as string)) {
    stream = await generateStreamResponse(msg.text || '', conversationHistory, currentModel as string);
  } else if (config.CLAUDE_API_KEY && config.CLAUDE_MODELS.includes(currentModel as string)) {
    stream = await generateClaudeResponse(msg.text || '', conversationHistory, currentModel as string);
  } else if (config.AZURE_OPENAI_API_KEY && config.AZURE_OPENAI_MODELS.includes(currentModel as string)) {
    stream = await generateAzureOpenAIResponse(msg.text || '', conversationHistory, currentModel as string);
  } else {
    await sendMessage(chatId, translate('no_api_key', userLang));
    return;
  }

  let fullResponse = '';
  let messageSent = false;
  let messageId: number | undefined;

  try {
    for await (const chunk of stream) {
      fullResponse += chunk;

      if (fullResponse.length > 0 && !messageSent) {
        const sentMsg = await sendMessage(chatId, fullResponse, {parse_mode: 'Markdown'});
        messageId = sentMsg.message_id;
        messageSent = true;
      } else if (messageSent && fullResponse.length % 20 === 0 && messageId !== undefined) {
        try {
          await editMessage(chatId, messageId, fullResponse, {parse_mode: 'Markdown'});
        } catch (error) {
          console.error('Error editing message:', error);
          await editMessage(chatId, messageId, fullResponse);
        }
      }
    }

    if (messageSent && messageId !== undefined) {
      await editMessage(chatId, messageId, fullResponse, {parse_mode: 'Markdown'});
    }

    await addToConversationHistory(userId, msg.text || '', fullResponse);
  } catch (error) {
    console.error('Error in stream processing:', error);
    await sendMessage(chatId, translate('error_message', userLang), {parse_mode: 'Markdown'});
  }
}

async function handleImageAnalysis(msg: TelegramMessage): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);

  if (!config.OPENAI_API_KEY) {
    await sendMessage(chatId, translate('no_api_key', userLang));
    return;
  }

  // Check if a photo is attached
  const photo = msg.photo && msg.photo[msg.photo.length - 1];
  if (!photo) {
    await sendMessage(chatId, translate('no_image', userLang));
    return;
  }

  // Get the prompt from the caption or ask for one
  let prompt = msg.caption;
  if (!prompt) {
    await sendMessage(chatId, translate('provide_image_description', userLang));
    return;
  }

  await sendMessage(chatId, translate('processing_image', userLang));

  try {
    const fileInfo = await getFile(photo.file_id);
    if (!fileInfo || !fileInfo.file_path) {
      throw new Error('Failed to get file information');
    }
    const result = await handleImageUpload(fileInfo, prompt, currentModel as string);
    await sendMessage(chatId, result, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in image analysis:', error);
    await sendMessage(chatId, translate('error_message', userLang));
  }
}

async function handleLanguageChange(msg: TelegramMessage): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const currentLang = await getUserLanguage(userId);
  
  const keyboard = supportedLanguages.map(lang => [{text: translate(lang, currentLang), callback_data: `lang_${lang}`}]);
  
  await sendMessage(chatId, translate('choose_language', currentLang), {
    reply_markup: JSON.stringify({
      inline_keyboard: keyboard
    })
  });
}

export async function handleMessage(update: TelegramUpdate): Promise<void> {
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }

  const msg = getMessageFromUpdate(update);
  if (!msg) {
    console.log('Update does not contain a valid message');
    return;
  }

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);

  try {
    if (!config.WHITELISTED_USERS.includes(userId)) {
      await sendMessage(chatId, 'Sorry, you are not authorized to use this bot.', {parse_mode: 'Markdown'});
      return;
    }

    if (msg.photo) {
      await handleImageAnalysis(msg);
    } else if (msg.text) {
      if (msg.text === '/start') {
        await handleStart(msg);
      } else if (msg.text === '/new') {
        await handleNew(msg);
      } else if (msg.text === '/history') {
        await handleHistory(msg);
      } else if (msg.text === '/help') {
        await handleHelp(msg);
      } else if (msg.text.startsWith('/switchmodel')) {
        await handleSwitchModel(msg);
      } else if (msg.text.startsWith('/img')) {
        await handleImageGeneration(msg);
      } else if (msg.text === '/language') {
        await handleLanguageChange(msg);
      } else {
        await handleStreamMessage(msg);
      }
    } else {
      console.log('Received unsupported message type');
      await sendMessage(chatId, translate('unsupported_message', userLang), {parse_mode: 'Markdown'});
    }
  } catch (error) {
    console.error('Error in handleMessage:', error);
    await sendMessage(chatId, translate('error_message', userLang), {parse_mode: 'Markdown'});
  }
}

async function handleCallbackQuery(callbackQuery: NonNullable<TelegramUpdate['callback_query']>): Promise<void> {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const userId = callbackQuery.from.id;
  
  if (action.startsWith('lang_')) {
    const newLang = action.split('_')[1];
    if (await setUserLanguage(userId, newLang)) {
      const userLang = await getUserLanguage(userId);
      await updateBotCommands(userId);
      await answerCallbackQuery(callbackQuery.id, {text: translate('language_set', userLang)});
      await sendMessage(msg.chat.id, translate('language_changed', userLang));
    }
  }
}

export { handleCallbackQuery };