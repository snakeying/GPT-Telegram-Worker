import { Env } from '../env';

export function formatCodeBlock(code: string, language: string): string {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}

export function formatMarkdown(text: string): string {
  // 处理代码块前先进行转义
  text = text.replace(/```(\w*)\n([\s\S]+?)```/g, (_, lang, code) => {
    // 在代码块内容中转义 * 和 _ 等字符
    const escapedCode = code
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_');
    return formatCodeBlock(escapedCode.trim(), lang || '');
  });

  // 处理其他 Markdown 元素
  return text
    // 确保代码块前后有换行
    .replace(/([^\n])```/g, '$1\n```')
    .replace(/```([^\n])/g, '```\n$1')
    // 处理行内代码
    .replace(/([^\s`])`([^`]+)`([^\s`])/g, '$1 `$2` $3')
    // 处理加粗和斜体
    .replace(/\*\*\*([^*]+)\*\*\*/g, '*$1*')
    .replace(/\*\*([^*]+)\*\*/g, '*$1*')
    // 处理链接
    .replace(/\[([^\]]+)\]\s*\(([^)]+)\)/g, '[$1]($2)')
    // 处理列表
    .replace(/^(\s*)-\s+(.+)$/gm, '$1• $2')
    // 处理引用
    .replace(/^>\s*(.+)$/gm, '▎ _$1_')
    // 移除多余的转义字符
    .replace(/\\([*_`\[\]()#+-=|{}.!])/g, '$1');
}

export function formatHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/```(\w*)\n([\s\S]+?)```/g, (_, lang, code) => 
      `<pre${lang ? ` language="${lang}"` : ''}>${code.trim()}</pre>`
    )
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
}

export function stripFormatting(text: string): string {
  return text
    // 处理标题
    .replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, content) => {
      const level = hashes.length;
      const indent = ' '.repeat(level - 1);
      return `${indent}◆ ${content.trim()}`;
    })
    // 处理其他格式
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '$1 ($2)')
    .replace(/^(\s*)-\s+(.+)$/gm, '$1• $2')
    .replace(/^>\s*(.+)$/gm, '▎ $1');
}

export function splitMessage(text: string, maxLength: number = 4096): string[] {
  const messages: string[] = [];
  
  // 改进代码块检测，确保代码块完整
  const parts = text.split(/(```[\s\S]*?```)/);
  let currentMessage = '';

  for (const part of parts) {
    if (part.startsWith('```')) {
      if (currentMessage.length + part.length > maxLength) {
        if (currentMessage) {
          messages.push(currentMessage.trim());
          currentMessage = '';
        }
        messages.push(part);
      } else {
        currentMessage += part;
      }
    } else {
      const lines = part.split('\n');
      for (const line of lines) {
        if (currentMessage.length + line.length + 1 > maxLength) {
          if (currentMessage) {
            messages.push(currentMessage.trim());
            currentMessage = '';
          }
          currentMessage = line;
        } else {
          currentMessage += (currentMessage ? '\n' : '') + line;
        }
      }
    }
  }

  if (currentMessage) {
    messages.push(currentMessage.trim());
  }

  return messages;
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
