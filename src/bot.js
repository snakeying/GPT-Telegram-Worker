import { Redis } from '@upstash/redis';
import { 
  TELEGRAM_BOT_TOKEN, 
  WHITELISTED_USERS, 
  OPENAI_MODELS, 
  GOOGLE_MODELS,
  GROQ_MODELS,
  CLAUDE_MODELS,
  AZURE_OPENAI_MODELS,
  DEFAULT_MODEL,
  OPENAI_API_KEY,
  GEMINI_API_KEY,
  GROQ_API_KEY,
  CLAUDE_API_KEY,
  AZURE_OPENAI_API_KEY,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN
} from './config';
import { generateResponse, generateStreamResponse } from './api';
import { generateGeminiResponse } from './geminiApi';
import { generateGroqResponse } from './groqapi';
import { generateClaudeResponse } from './claude';
import { generateAzureOpenAIResponse } from './azureOpenAI';
import { getConversationHistory, addToConversationHistory, clearConversationHistory } from './redis';
import { generateImage, VALID_SIZES } from './generateImage';
import { handleImageUpload } from './uploadHandler';
import { getUserLanguage, setUserLanguage, translate, supportedLanguages, getLocalizedCommands } from './localization';

let currentModel = OPENAI_API_KEY ? DEFAULT_MODEL : null;

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

function getMessageFromUpdate(update) {
  if (update.callback_query) {
    return update.callback_query.message;
  }
  return update.message || update.edited_message;
}

async function updateBotCommands(userId) {
  const commands = await getLocalizedCommands(userId);
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commands: commands,
        scope: { type: 'chat', chat_id: userId }
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`Updated bot commands for user ${userId}`);
  } catch (error) {
    console.error(`Failed to update bot commands for user ${userId}:`, error);
  }
}

async function sendTelegramMessage(chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    ...options
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

async function editTelegramMessage(chatId, messageId, text, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    ...options
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

async function sendTelegramPhoto(chatId, photo, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
  const body = {
    chat_id: chatId,
    photo: photo,
    ...options
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

async function sendChatAction(chatId, action) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`;
  const body = {
    chat_id: chatId,
    action: action
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

async function handleStart(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  try {
    await sendTelegramMessage(chatId, translate('welcome', userLang, {model: currentModel}), {parse_mode: 'Markdown'});
    console.log('Start message sent successfully');
  } catch (error) {
    console.error('Error sending start message:', error);
  }
}

async function handleNew(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  try {
    await clearConversationHistory(userId);
    await sendTelegramMessage(chatId, translate('new_conversation', userLang, {model: currentModel}), {parse_mode: 'Markdown'});
    console.log('New conversation message sent successfully');
  } catch (error) {
    console.error('Error handling new conversation:', error);
  }
}

async function handleHistory(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  try {
    const history = await getConversationHistory(userId);
    console.log('Processed history:', JSON.stringify(history, null, 2));
    if (history.length === 0) {
      await sendTelegramMessage(chatId, translate('no_history', userLang), {parse_mode: 'Markdown'});
      return;
    }
    const historyText = history.map(m => `${m.role}: ${m.content}`).join('\n\n');
    await sendTelegramMessage(chatId, translate('history_intro', userLang) + historyText, {parse_mode: 'Markdown'});
  } catch (error) {
    console.error('Error retrieving conversation history:', error);
    await sendTelegramMessage(chatId, translate('error_message', userLang), {parse_mode: 'Markdown'});
  }
}

async function handleHelp(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  try {
    const availableModels = [
      ...(OPENAI_API_KEY ? OPENAI_MODELS : []),
      ...(GEMINI_API_KEY ? GOOGLE_MODELS : []),
      ...(GROQ_API_KEY ? GROQ_MODELS : []),
      ...(CLAUDE_API_KEY ? CLAUDE_MODELS : []),
      ...(AZURE_OPENAI_API_KEY ? AZURE_OPENAI_MODELS : [])
    ];
    const helpMessage = translate('help_message', userLang, {
      models: availableModels.join(', '),
      current_model: currentModel
    });
    await sendTelegramMessage(chatId, helpMessage, {parse_mode: 'Markdown'});
    console.log('Help message sent successfully');
  } catch (error) {
    console.error('Error sending help message:', error);
  }
}

async function handleSwitchModel(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  const args = msg.text.split(' ');
  
  const availableModels = [
    ...(OPENAI_API_KEY ? OPENAI_MODELS : []),
    ...(GEMINI_API_KEY ? GOOGLE_MODELS : []),
    ...(GROQ_API_KEY ? GROQ_MODELS : []),
    ...(CLAUDE_API_KEY ? CLAUDE_MODELS : []),
    ...(AZURE_OPENAI_API_KEY ? AZURE_OPENAI_MODELS : [])
  ];

  if (args.length < 2) {
    await sendTelegramMessage(chatId, translate('forgot_model_name', userLang, {available_models: availableModels.join(', ')}), {parse_mode: 'Markdown'});
    return;
  }

  const modelName = args[1].trim();
  
  if ((OPENAI_MODELS.includes(modelName) && OPENAI_API_KEY) || 
      (GOOGLE_MODELS.includes(modelName) && GEMINI_API_KEY) ||
      (GROQ_MODELS.includes(modelName) && GROQ_API_KEY) ||
      (CLAUDE_MODELS.includes(modelName) && CLAUDE_API_KEY) ||
      (AZURE_OPENAI_MODELS.includes(modelName) && AZURE_OPENAI_API_KEY)) {
    currentModel = modelName;
    await clearConversationHistory(userId);
    await sendTelegramMessage(chatId, translate('model_switched', userLang, {model: modelName}), {parse_mode: 'Markdown'});
  } else {
    await sendTelegramMessage(chatId, translate('invalid_model', userLang, {available_models: availableModels.join(', ')}), {parse_mode: 'Markdown'});
  }
}

async function handleImageGeneration(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);

  if (!OPENAI_API_KEY) {
    await sendTelegramMessage(chatId, translate('no_api_key', userLang));
    return;
  }

  const args = msg.text.split(' ');
  args.shift(); // Remove "/img" command

  let size = '1024x1024';
  let prompt;

  // Check if the last argument is possibly a size
  const possibleSize = args[args.length - 1];
  if (possibleSize && possibleSize.includes('x')) {
    const [width, height] = possibleSize.split('x').map(Number);
    if (VALID_SIZES.includes(`${width}x${height}`)) {
      size = `${width}x${height}`;
      args.pop(); // Remove size from the argument list
    } else {
      // If size is invalid, send error message and return
      await sendTelegramMessage(chatId, translate('invalid_size', userLang, {size: possibleSize, valid_sizes: VALID_SIZES.join(', ')}));
      return;
    }
  }

  prompt = args.join(' ');

  if (prompt.trim() === '') {
    // If no description is provided, suggest using /help command
    await sendTelegramMessage(chatId, translate('no_image_description', userLang) + ' ' + translate('use_help_command', userLang));
    return;
  }

  try {
    console.log(`Processing image generation request. Chat ID: ${chatId}, Prompt: "${prompt}", Size: ${size}`);
    await sendChatAction(chatId, 'upload_photo');
    
    const requestId = `img_req:${userId}:${Date.now()}`;
    
    const existingImageUrl = await redis.get(requestId);
    
    if (existingImageUrl) {
      console.log(`Using existing image URL: ${existingImageUrl}`);
      await sendTelegramPhoto(chatId, existingImageUrl, { caption: prompt });
      return;
    }
    
    console.log(`Generating image with prompt: "${prompt}" and size: ${size}`);
    const imageUrl = await generateImage(prompt, size);
    console.log(`Image URL generated: ${imageUrl}`);
    
    if (imageUrl) {
      await redis.set(requestId, imageUrl, { ex: 86400 }); // Expires after 1 day
      
      console.log(`Sending image. URL: ${imageUrl}`);
      await sendTelegramPhoto(chatId, imageUrl, { caption: prompt });
      console.log('Photo sent successfully');
    } else {
      throw new Error('Failed to get image URL');
    }
  } catch (error) {
    console.error('Error in image generation or sending:', error);
    let errorMessage = translate('error_message', userLang);
    if (error.response) {
      console.error('API error response:', error.response.data);
      errorMessage += ` API Error: ${error.response.data.error.message}`;
    } else if (error.request) {
      console.error('No response received from API');
      errorMessage += ' No response received from API.';
    } else {
      errorMessage += ` ${error.message}`;
    }
    await sendTelegramMessage(chatId, errorMessage);
  }
}

async function handleStreamMessage(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);
  
  await sendChatAction(chatId, 'typing');
  const conversationHistory = await getConversationHistory(userId);

  if (GROQ_MODELS.includes(currentModel) && GROQ_API_KEY) {
    try {
      const response = await generateGroqResponse(msg.text, conversationHistory, currentModel);
      await sendTelegramMessage(chatId, response, {parse_mode: 'Markdown'});
      await addToConversationHistory(userId, msg.text, response);
    } catch (error) {
      console.error('Error in Groq processing:', error);
      await sendTelegramMessage(chatId, translate('error_message', userLang), {parse_mode: 'Markdown'});
    }
    return;
  }

  if (GOOGLE_MODELS.includes(currentModel) && GEMINI_API_KEY) {
    try {
      const response = await generateGeminiResponse(msg.text, conversationHistory, currentModel);
      await sendTelegramMessage(chatId, response, {parse_mode: 'Markdown'});
      await addToConversationHistory(userId, msg.text, response);
    } catch (error) {
      console.error('Error in Gemini processing:', error);
      await sendTelegramMessage(chatId, translate('error_message', userLang), {parse_mode: 'Markdown'});
    }
    return;
  }

  let stream;
  if (OPENAI_API_KEY && OPENAI_MODELS.includes(currentModel)) {
    stream = generateStreamResponse(msg.text, conversationHistory, currentModel);
  } else if (CLAUDE_API_KEY && CLAUDE_MODELS.includes(currentModel)) {
    stream = generateClaudeResponse(msg.text, conversationHistory, currentModel);
  } else if (AZURE_OPENAI_API_KEY && AZURE_OPENAI_MODELS.includes(currentModel)) {
    stream = generateAzureOpenAIResponse(msg.text, conversationHistory, currentModel);
  } else {
    await sendTelegramMessage(chatId, translate('no_api_key', userLang));
    return;
  }

  let fullResponse = '';
  let messageSent = false;
  let messageId;

  try {
    for await (const chunk of stream) {
      fullResponse += chunk;

      if (fullResponse.length > 0 && !messageSent) {
        const sentMsg = await sendTelegramMessage(chatId, fullResponse, {parse_mode: 'Markdown'});
        messageId = sentMsg.result.message_id;
        messageSent = true;
      } else if (messageSent && fullResponse.length % 20 === 0) {
        try {
          await editTelegramMessage(chatId, messageId, fullResponse, {
            parse_mode: 'Markdown'
          });
        } catch (error) {
          console.error('Error editing message:', error);
          await editTelegramMessage(chatId, messageId, fullResponse);
        }
      }
    }

    if (messageSent) {
      await editTelegramMessage(chatId, messageId, fullResponse, {
        parse_mode: 'Markdown'
      });
    }

    await addToConversationHistory(userId, msg.text, fullResponse);
  } catch (error) {
    console.error('Error in stream processing:', error);
    await sendTelegramMessage(chatId, translate('error_message', userLang), {parse_mode: 'Markdown'});
  }
}

async function handleImageAnalysis(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userLang = await getUserLanguage(userId);

  if (!OPENAI_API_KEY) {
    await sendTelegramMessage(chatId, translate('no_api_key', userLang));
    return;
  }

  // Check if a photo is attached
  const photo = msg.photo && msg.photo[msg.photo.length - 1];
  if (!photo) {
    await sendTelegramMessage(chatId, translate('no_image', userLang));
    return;
  }

  // Get the prompt from the caption or use a default prompt
  let prompt = msg.caption || "Analyze this image";

  await sendTelegramMessage(chatId, translate('processing_image', userLang));

  try {
    const fileInfo = await getFile(photo.file_id);
    const result = await handleImageUpload(fileInfo, prompt, currentModel);
    await sendTelegramMessage(chatId, result, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in image analysis:', error);
    await sendTelegramMessage(chatId, translate('error_message', userLang));
  }
}

async function getFile(fileId) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_id: fileId }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.result;
}

async function handleLanguageChange(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const currentLang = await getUserLanguage(userId);
  
  const keyboard = supportedLanguages.map(lang => [{text: translate(lang, currentLang), callback_data: `lang_${lang}`}]);
  
  await sendTelegramMessage(chatId, translate('choose_language', currentLang), {
    reply_markup: JSON.stringify({
      inline_keyboard: keyboard
    })
  });
}

export async function handleMessage(update) {
  const msg = getMessageFromUpdate(update);
  if (!msg) {
    console.log('Update does not contain a valid message');
    return;
  }

  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    if (!WHITELISTED_USERS.includes(userId)) {
      await sendTelegramMessage(chatId, 'Sorry, you are not authorized to use this bot.', {parse_mode: 'Markdown'});
      return;
    }

    const userLang = await getUserLanguage(userId);

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
      await sendTelegramMessage(chatId, translate('unsupported_message', userLang), {parse_mode: 'Markdown'});
    }
  } catch (error) {
    console.error('Error in handleMessage:', error);
    await sendTelegramMessage(chatId, translate('error_message', userLang), {parse_mode: 'Markdown'});
  }
}

export async function handleCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const userId = callbackQuery.from.id;
  
  if (action.startsWith('lang_')) {
    const newLang = action.split('_')[1];
    if (await setUserLanguage(userId, newLang)) {
      const userLang = await getUserLanguage(userId);
      await updateBotCommands(userId);
      await answerCallbackQuery(callbackQuery.id, {text: translate('language_set', userLang)});
      await sendTelegramMessage(msg.chat.id, translate('language_changed', userLang));
    }
  }
}

async function answerCallbackQuery(callbackQueryId, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
  const body = {
    callback_query_id: callbackQueryId,
    ...options
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export { 
  handleMessage, 
  handleStart, 
  getMessageFromUpdate, 
  handleCallbackQuery,
  updateBotCommands
};