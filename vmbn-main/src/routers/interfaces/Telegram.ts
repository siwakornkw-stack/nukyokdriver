export interface RequestContent {
    chat_id: string;
    text: string;
    parse_mode: string;
    disable_notification: boolean;
    disable_web_page_preview: boolean;
    reply_to_message_id?: number | null;
}