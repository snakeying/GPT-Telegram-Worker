import { Env } from '../env';

export function formatCodeBlock(code: string, language: string): string {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}

export function splitMessage(text: string, maxLength: number = 4096): string[] {
  const messages: string[] = [];
  let currentMessage = '';

  const lines = text.split('\n');

  for (const line of lines) {
    if (currentMessage.length + line.length + 1 > maxLength) {
      messages.push(currentMessage.trim());
      currentMessage = '';
    }
    currentMessage += line + '\n';
  }

  if (currentMessage.trim()) {
    messages.push(currentMessage.trim());
  }

  return messages;
}

export function escapeMarkdown(text: string): string {
  const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
  return specialChars.reduce((acc, char) => acc.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`), text);
}

export async function sendChatAction(chatId: number, action: string, env: Env): Promise<void> {
  const token = env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendChatAction`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      action: action,
    }),
  });
}