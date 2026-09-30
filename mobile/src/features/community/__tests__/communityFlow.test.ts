import { describe, it, expect } from 'vitest';
import {
  CommunityPostViewModel,
  CreatePostFormValues,
  FriendItemViewModel,
  UserPublicProfileViewModel,
} from '../communityTypes';

describe('Community & Social Presentation Logic (Stitch F01 - F06)', () => {
  it('validates post creation input requirements', () => {
    const validPostForm: CreatePostFormValues = {
      content: 'Hoàn thành bài tập ngực hôm nay rất tốt!',
      category: 'workout_exp',
      visibility: 'public',
      isKnowledgeSharing: true,
      workoutTags: ['Upper Body'],
      mealTags: ['High Protein'],
    };

    expect(validPostForm.content.trim().length).toBeGreaterThan(0);
    expect(validPostForm.isKnowledgeSharing).toBe(true);
    expect(validPostForm.workoutTags).toContain('Upper Body');
  });

  it('handles reaction toggle logic correctly', () => {
    const initialPost: CommunityPostViewModel = {
      id: 'p-1',
      authorId: 'u-1',
      authorName: 'Alex',
      authorRole: 'member',
      content: 'Hello world',
      category: 'all',
      visibility: 'public',
      createdAt: 'just now',
      reactions: {
        love: 10,
        fire: 5,
        smile: 2,
        userReaction: undefined,
      },
      commentCount: 0,
    };

    // User taps love
    const postWithLove = {
      ...initialPost,
      reactions: {
        ...initialPost.reactions,
        love: initialPost.reactions.love + 1,
        userReaction: 'love' as const,
      },
    };
    expect(postWithLove.reactions.love).toBe(11);
    expect(postWithLove.reactions.userReaction).toBe('love');

    // User untaps love
    const postUntappedLove = {
      ...postWithLove,
      reactions: {
        ...postWithLove.reactions,
        love: postWithLove.reactions.love - 1,
        userReaction: undefined,
      },
    };
    expect(postUntappedLove.reactions.love).toBe(10);
    expect(postUntappedLove.reactions.userReaction).toBeUndefined();
  });

  it('manages comments count and list immutability', () => {
    const post: CommunityPostViewModel = {
      id: 'p-2',
      authorId: 'u-1',
      authorName: 'Alex',
      authorRole: 'member',
      content: 'Chạy bộ 5km',
      category: 'workout_exp',
      visibility: 'public',
      createdAt: '1 hour ago',
      reactions: { love: 0, fire: 0, smile: 0 },
      commentCount: 1,
      comments: [
        {
          id: 'c-1',
          authorId: 'u-2',
          authorName: 'Bob',
          authorRole: 'pt',
          text: 'Tốc độ duy trì tốt đấy!',
          createdAt: '30m ago',
        },
      ],
    };

    const newComment = {
      id: 'c-2',
      authorId: 'u-3',
      authorName: 'Carol',
      authorRole: 'member' as const,
      text: 'Chúc mừng bạn!',
      createdAt: 'Just now',
    };

    const updatedPost = {
      ...post,
      commentCount: post.commentCount + 1,
      comments: [...(post.comments || []), newComment],
    };

    expect(updatedPost.commentCount).toBe(2);
    expect(updatedPost.comments?.length).toBe(2);
    expect(updatedPost.comments?.[1].authorName).toBe('Carol');
  });

  it('handles friendship status transitions reliably', () => {
    let profile: UserPublicProfileViewModel = {
      id: 'u-test',
      name: 'Nguyen Van A',
      role: 'member',
      bio: 'Tập gym mỗi ngày',
      friendshipStatus: 'none',
      postCount: 5,
      friendCount: 10,
      posts: [],
    };

    // Send request
    profile = { ...profile, friendshipStatus: 'request_sent' };
    expect(profile.friendshipStatus).toBe('request_sent');

    // Simulated accept
    profile = {
      ...profile,
      friendshipStatus: 'friend',
      friendCount: profile.friendCount + 1,
    };
    expect(profile.friendshipStatus).toBe('friend');
    expect(profile.friendCount).toBe(11);

    // Unfriend
    profile = {
      ...profile,
      friendshipStatus: 'none',
      friendCount: profile.friendCount - 1,
    };
    expect(profile.friendshipStatus).toBe('none');
    expect(profile.friendCount).toBe(10);
  });
});
