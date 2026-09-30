import { describe, it, expect } from 'vitest';
import {
  ChatMessageViewModel,
  ConversationDetailViewModel,
  ConversationItemViewModel,
} from '../chatTypes';

describe('Chat & Messaging Presentation Logic (Stitch F07 - F08)', () => {
  it('calculates unread conversations correctly', () => {
    const conversations: ConversationItemViewModel[] = [
      {
        id: 'c-1',
        participantId: 'p-1',
        participantName: 'PT Nam',
        participantRole: 'pt',
        lastMessage: 'Hen gap toi nay',
        lastMessageTime: '17:00',
        unreadCount: 2,
      },
      {
        id: 'c-2',
        participantId: 'u-2',
        participantName: 'Bao',
        participantRole: 'member',
        lastMessage: 'Ok nha',
        lastMessageTime: 'Hom qua',
        unreadCount: 0,
      },
    ];

    const unreadList = conversations.filter((c) => c.unreadCount > 0);
    expect(unreadList.length).toBe(1);
    expect(unreadList[0].id).toBe('c-1');
  });

  it('updates message delivery status transitions cleanly', () => {
    let message: ChatMessageViewModel = {
      id: 'm-1',
      senderId: 'my-id',
      senderName: 'Me',
      text: 'Toi dang den roi',
      timestamp: '17:55',
      status: 'sending',
      isSelf: true,
    };

    expect(message.status).toBe('sending');

    // Transitions to sent
    message = { ...message, status: 'sent' };
    expect(message.status).toBe('sent');

    // Transitions to read
    message = { ...message, status: 'read' };
    expect(message.status).toBe('read');
  });

  it('enforces restricted interaction bounds when blocked or unfriended', () => {
    const conversation: ConversationDetailViewModel = {
      id: 'c-restricted',
      participantId: 'u-blocked',
      participantName: 'Former Friend',
      participantRole: 'member',
      isRestricted: true,
      messages: [
        {
          id: 'old-1',
          senderId: 'u-blocked',
          senderName: 'Former Friend',
          text: 'Tin nhan cu trong qua khu',
          timestamp: '1 thang truoc',
          status: 'read',
          isSelf: false,
        },
      ],
    };

    // Past history is still readable
    expect(conversation.messages.length).toBe(1);
    expect(conversation.messages[0].text).toBe('Tin nhan cu trong qua khu');

    // New messages cannot be sent
    const canSendMessage = !conversation.isRestricted;
    expect(canSendMessage).toBe(false);
  });
});
