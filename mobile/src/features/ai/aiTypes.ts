/**
 * AI Assistant Types and View Models (Stitch G01 - G02)
 */

export interface AiConversationSummaryViewModel {
  id: string;
  title: string;
  lastMessagePreview: string;
  lastUpdatedAt: string;
  category: 'nutrition' | 'workout' | 'general';
}

export interface AiExerciseModification {
  exerciseName: string;
  badge: string;
  description: string;
  impact: string;
}

export interface AiStructuredSuggestionViewModel {
  id: string;
  title: string;
  targetPlanName: string;
  planId?: string;
  modifications: AiExerciseModification[];
  reviewRoute: string;
}

export interface AiChatMessageViewModel {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isProcessing?: boolean;
  isError?: boolean;
  imageUri?: string;
  structuredSuggestion?: AiStructuredSuggestionViewModel;
}
