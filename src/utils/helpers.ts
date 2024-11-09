import { Env } from '../env';

export function formatCodeBlock(code: string, language: string): string {
  // 移除多余的空行和空格，但保留代码缩进
  const trimmedCode = code.trim()
    .replace(/^\n+|\n+$/g, '')  // 移除开头和结尾的空行
    .replace(/\n{3,}/g, '\n\n'); // 将多个空行压缩为最多两个

  // 确保代码块格式正确，并添加额外的换行以隔离代码块
  return `\n\`\`\`${language}\n${trimmedCode}\n\`\`\`\n`;
}

export function formatMarkdown(text: string): string {
  // 先处理代码块，将其临时替换为占位符
  const codeBlocks: string[] = [];
  let processedText = text.replace(/```[\s\S]+?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // 处理其他 Markdown 元素
  processedText = processedText
    .replace(/\*\*\*([^*]+)\*\*\*/g, '*$1*')
    .replace(/\*\*([^*]+)\*\*/g, '*$1*')
    .replace(/\[([^\]]+)\]\s*\(([^)]+)\)/g, '[$1]($2)')
    .replace(/^(\s*)-\s+(.+)$/gm, '$1• $2')
    .replace(/^>\s*(.+)$/gm, '▎ _$1_')
    .replace(/([^\s`])`([^`]+)`([^\s`])/g, '$1 `$2` $3');

  // 还原代码块，并确保它们的格式正确
  processedText = processedText.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => {
    const block = codeBlocks[parseInt(index)];
    return block.replace(/```(\w*)\n?([\s\S]+?)```/g, (_, lang, code) => {
      return formatCodeBlock(code, lang || '');
    });
  });

  return processedText;
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
  // 保存代码块
  const codeBlocks: string[] = [];
  let processedText = text.replace(/```[\s\S]+?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // 处理其他格式
  processedText = processedText
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '$1 ($2)')
    .replace(/^(\s*)-\s+(.+)$/gm, '$1• $2')
    .replace(/^>\s*(.+)$/gm, '▎ $1');

  // 还原代码块，但保持原始格式
  return processedText.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => {
    return codeBlocks[parseInt(index)];
  });
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
