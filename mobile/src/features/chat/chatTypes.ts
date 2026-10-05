/**
 * Chat & Messaging Types and View Models (Stitch F07 - F08)
 */

export interface ConversationItemViewModel {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: 'member' | 'pt';
  participantAvatar?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  sessionInfo?: string;
  isRestricted?: boolean;
}

export type MessageDeliveryStatus = 'sending' | 'sent' | 'read' | 'failed';

export interface ChatMessageReactionViewModel {
  reaction: '❤️' | '👍' | '😂' | '😮' | '😢';
  count: number;
  reactedByViewer: boolean;
}

export interface ChatMessageViewModel {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrls?: string[];
  reactions?: ChatMessageReactionViewModel[];
  timestamp: string;
  status: MessageDeliveryStatus;
  isSelf: boolean;
}

export interface ChatImageInput {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
}

export interface ConversationDetailViewModel {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: 'member' | 'pt';
  participantAvatar?: string;
  isOnline?: boolean;
  isRestricted?: boolean;
  messages: ChatMessageViewModel[];
}
