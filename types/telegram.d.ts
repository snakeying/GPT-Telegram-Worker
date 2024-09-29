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

  interface ChatMember {
    user: User;
    status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
    until_date?: number;
    can_be_edited?: boolean;
    can_post_messages?: boolean;
    can_edit_messages?: boolean;
    can_delete_messages?: boolean;
    can_restrict_members?: boolean;
    can_promote_members?: boolean;
    can_change_info?: boolean;
    can_invite_users?: boolean;
    can_pin_messages?: boolean;
    is_member?: boolean;
    can_send_messages?: boolean;
    can_send_media_messages?: boolean;
    can_send_polls?: boolean;
    can_send_other_messages?: boolean;
    can_add_web_page_previews?: boolean;
  }

  interface GetChatMemberResult {
    ok: boolean;
    result: ChatMember;
  }
}