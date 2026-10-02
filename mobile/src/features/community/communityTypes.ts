/**
 * Community & Social Types and View Models (Stitch F01 - F06)
 */

export interface PostCommentViewModel {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'member' | 'pt';
  text: string;
  createdAt: string;
  isOwner?: boolean;
}

export interface CommunityPostViewModel {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'member' | 'pt';
  authorVerified?: boolean;
  content: string;
  mediaUrl?: string;
  category: 'all' | 'friends' | 'workout_exp' | 'nutrition_qa';
  visibility: 'public' | 'friends' | 'private';
  createdAt: string;
  reactions: {
    love: number;
    fire: number;
    smile: number;
    userReaction?: 'love' | 'fire' | 'smile';
  };
  commentCount: number;
  comments?: PostCommentViewModel[];
  workoutTags?: string[];
  mealTags?: string[];
  isKnowledgeSharing?: boolean;
  isOwner?: boolean;
}

export interface CreatePostFormValues {
  content: string;
  mediaUrl?: string;
  category: 'workout_exp' | 'nutrition_qa' | 'all';
  visibility: 'public' | 'friends' | 'private';
  isKnowledgeSharing?: boolean;
  workoutTags: string[];
  mealTags: string[];
}

export type ReportTargetType = 'post' | 'comment' | 'user';
export type ReportReasonType = 'spam' | 'hate' | 'health_misinfo' | 'impersonation' | 'other';

export interface ReportRequest {
  targetId: string;
  targetType: ReportTargetType;
  targetAuthorName: string;
  targetSummary?: string;
  reason: ReportReasonType;
  detail: string;
}

export interface UserPublicProfileViewModel {
  id: string;
  name: string;
  role: 'member' | 'pt';
  bio: string;
  isVerified?: boolean;
  friendshipStatus: 'friend' | 'none' | 'request_sent' | 'request_received';
  postCount: number;
  friendCount: number;
  completedWorkoutsCount?: number;
  posts: CommunityPostViewModel[];
  ptProfileId?: string; // If PT, link to professional profile
}

export interface FriendItemViewModel {
  id: string;
  requestId?: string;
  name: string;
  role: 'member' | 'pt';
  isOnline?: boolean;
  mutualFriendsCount?: number;
  relationship: 'friend' | 'received_request' | 'sent_request' | 'none';
  requestDate?: string;
  headline?: string;
}
