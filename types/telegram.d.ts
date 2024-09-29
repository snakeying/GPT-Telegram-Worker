export namespace TelegramTypes {
  interface Update {
    update_id: number;
    message?: Message;
    edited_message?: Message;
    channel_post?: Message;
    edited_channel_post?: Message;
  }

  interface Message {
    message_id: number;
    from?: User;
    date: number;
    chat: Chat;
    text?: string;
    entities?: MessageEntity[];
  }

  interface User {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  }

  interface Chat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  }

  interface MessageEntity {
    type: string;
    offset: number;
    length: number;
    url?: string;
    user?: User;
  }

  interface SendMessageParams {
    chat_id: number | string;
    text: string;
    parse_mode?: 'Markdown' | 'HTML';
    disable_web_page_preview?: boolean;
    disable_notification?: boolean;
    reply_to_message_id?: number;
  }

  interface SendMessageResult {
    message_id: number;
    from: User;
    chat: Chat;
    date: number;
    text: string;
  }
}