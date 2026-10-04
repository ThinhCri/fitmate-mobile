import { apiClient, apiUploadFiles } from './client';
import type { AiChatMessageViewModel, AiConversationSummaryViewModel } from '@/features/ai';

interface ThreadWire { id: string; title?: string; last_message_at?: string; message_count?: number }
interface MessageWire { id: string; sender_user_id: string; sender: string; text: string; created_at: string }
const mapMessage = (item: MessageWire): AiChatMessageViewModel => ({ id: item.id, sender: /assistant|ai|bot/i.test(item.sender) ? 'assistant' : 'user', text: item.text, timestamp: new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) });

export const aiService = {
  async listThreads(): Promise<AiConversationSummaryViewModel[]> {
    const result = await apiClient<ThreadWire[]>('/chat/ai/threads');
    return (result || []).map((item) => ({ id: item.id, title: item.title || 'Cuộc trò chuyện AI', lastMessagePreview: `${item.message_count ?? 0} tin nhắn`, lastUpdatedAt: item.last_message_at ? new Date(item.last_message_at).toLocaleString('vi-VN') : 'Chưa có tin nhắn', category: 'general' as const }));
  },
  async createThread(title?: string): Promise<string> { const result = await apiClient<ThreadWire>('/chat/ai/threads', { method: 'POST', body: JSON.stringify({ title }) }); return result.id; },
  async renameThread(threadId: string, title: string): Promise<void> {
    await apiClient<ThreadWire>(`/chat/ai/threads/${encodeURIComponent(threadId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },
  async deleteThread(threadId: string): Promise<void> {
    await apiClient<void>(`/chat/ai/threads/${encodeURIComponent(threadId)}`, { method: 'DELETE' });
  },
  async listMessages(threadId: string): Promise<AiChatMessageViewModel[]> { const result = await apiClient<{ items: MessageWire[] }>(`/chat/ai/threads/${encodeURIComponent(threadId)}/messages?limit=50`); return (result.items || []).map(mapMessage); },
  async sendMessage(threadId: string, text: string, images?: Array<{ uri: string; mimeType?: string | null; fileName?: string | null }>): Promise<AiChatMessageViewModel> {
    const result = images?.length
      ? await apiUploadFiles<MessageWire>('/chat/ai/messages/image', images, { thread_id: threadId, text })
      : await apiClient<MessageWire>('/chat/ai/messages', { method: 'POST', body: JSON.stringify({ thread_id: threadId, text }) });
    return mapMessage(result);
  },
};
