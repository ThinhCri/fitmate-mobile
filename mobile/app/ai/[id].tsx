import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AiChatInteractivePresentation,
  AiChatMessageViewModel,
  AiStructuredSuggestionViewModel,
} from '@/features/ai';
import { isPreviewMode } from '@/repositories/repositoryTypes';

export default function AiChatScreen() {
  const { prompt } = useLocalSearchParams<{ id: string; prompt?: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const isPreview = isPreviewMode();

  const [messages, setMessages] = useState<AiChatMessageViewModel[]>(
    isPreview
      ? [
          {
            id: 'msg-1',
            sender: 'user',
            text:
              prompt ||
              'Gần đây mình tập bài Bench Press hay bị nhói nhẹ ở khớp vai trước, bạn có thể gợi ý điều chỉnh form và bài tập bổ trợ không?',
            timestamp: '09:14',
          },
          {
            id: 'msg-2',
            sender: 'assistant',
            text:
              'Chào bạn, cảm giác nhói khớp vai trước khi đẩy ngực thường xuất phát từ việc khuỷu tay mở quá rộng (flare elbows) hoặc hạ tạ quá nhanh. Dưới đây là phương án điều chỉnh trực tiếp cho giáo án Upper Body A hôm nay:',
            timestamp: '09:15',
            structuredSuggestion: {
              id: 'sug-1',
              title: 'Đề xuất điều chỉnh bài tập từ AI',
              targetPlanName: 'Upper Body A',
              planId: 'plan-upper-a',
              reviewRoute: '/workout/ai-adjust',
              modifications: [
                {
                  exerciseName: 'Barbell Bench Press',
                  badge: 'Kỹ thuật & Form',
                  description:
                    'Mở rộng khoảng cách tay cầm trên thanh đòn thêm 1.5 bàn tay mỗi bên, duy trì cẳng tay vuông góc sàn ở đáy chuyển động.',
                  impact: 'Tối ưu góc kích hoạt sợi cơ ngực, giảm áp lực vai trước',
                },
                {
                  exerciseName: 'Thay đổi bài tập bổ trợ',
                  badge: 'Đổi bài',
                  description:
                    'Thay thế Cable Rope Pushdown bằng Incline Dumbbell Flyes (3 hiệp × 12 lần) để cô lập ngực trên.',
                  impact: 'Giảm tải dây chằng khuỷu tay và khớp vai',
                },
              ],
            },
          },
        ]
      : prompt
      ? [
          {
            id: 'msg-1',
            sender: 'user',
            text: prompt,
            timestamp: 'Vừa xong',
          },
          {
            id: 'msg-2',
            sender: 'assistant',
            text:
              'Tính năng Trợ lý AI chưa được kích hoạt trên hệ thống máy chủ. Vui lòng sử dụng các tính năng bài tập và dinh dưỡng có sẵn.',
            timestamp: 'Vừa xong',
          },
        ]
      : []
  );

  const handleSendMessage = (text: string) => {
    const userMsg: AiChatMessageViewModel = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);

    if (!isPreview) {
      // In production path: do not fake AI results with timer
      const assistantMsg: AiChatMessageViewModel = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text:
          'Tính năng Trợ lý AI chưa được kích hoạt trên hệ thống máy chủ. Vui lòng sử dụng các tính năng bài tập và dinh dưỡng thủ công.',
        timestamp: 'Vừa xong',
      };
      setMessages((prev) => [...prev, assistantMsg]);
      return;
    }

    setIsProcessing(true);
    // Explicit preview mode simulation only
    setTimeout(() => {
      const assistantMsg: AiChatMessageViewModel = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text:
          'Tôi đã ghi nhận câu hỏi của bạn trong môi trường thử nghiệm (Preview). Hãy duy trì uống đủ nước và ngủ đủ 7 tiếng mỗi ngày.',
        timestamp: 'Vừa xong',
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 800);
  };

  const handleReviewSuggestion = (_suggestion: AiStructuredSuggestionViewModel) => {
    router.push('/workout/ai-adjust' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <AiChatInteractivePresentation
        conversationTitle="Tư vấn điều chỉnh bài tập"
        messages={messages}
        isProcessing={isProcessing}
        onBack={() => router.back()}
        onSendMessage={handleSendMessage}
        onReviewSuggestion={handleReviewSuggestion}
      />
    </SafeAreaView>
  );
}
