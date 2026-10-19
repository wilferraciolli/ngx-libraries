import type { ChatMessageType } from '../constants/chat-message-type.constant';

export interface ChatMessage {
  id: string;
  clientId: string;
  clientName: string;
  roomName: string;
  messageType: ChatMessageType;
  message: string;
  replyToSender?: boolean;
  timestamp: string;
}
