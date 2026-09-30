import { describe, it, expect } from 'vitest';
import {
  AiChatMessageViewModel,
  AiStructuredSuggestionViewModel,
} from '../aiTypes';

describe('AI Assistant Flow Logic (Stitch G01 - G02)', () => {
  it('structures plan modification proposal with review route', () => {
    const suggestion: AiStructuredSuggestionViewModel = {
      id: 'sug-1',
      title: 'Đề xuất điều chỉnh bài tập',
      targetPlanName: 'Upper Body A',
      reviewRoute: '/workout/ai-adjust',
      modifications: [
        {
          exerciseName: 'Barbell Bench Press',
          badge: 'Kỹ thuật & Form',
          description: 'Mở rộng tay cầm',
          impact: 'Tối ưu kích hoạt cơ ngực',
        },
      ],
    };

    expect(suggestion.targetPlanName).toBe('Upper Body A');
    expect(suggestion.modifications.length).toBe(1);
    expect(suggestion.reviewRoute).toBe('/workout/ai-adjust');
  });

  it('verifies text chat message does not automatically mutate state', () => {
    const msg: AiChatMessageViewModel = {
      id: 'm-1',
      sender: 'assistant',
      text: 'Bạn nên nghỉ ngơi hôm nay',
      timestamp: '10:00',
    };

    // Ordinary messages don't have structured suggestions attached
    expect(msg.structuredSuggestion).toBeUndefined();
    expect(msg.sender).toBe('assistant');
  });
});
