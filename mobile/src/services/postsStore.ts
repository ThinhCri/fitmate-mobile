/**
 * Posts store — quan ly posts toan cuc (cross-user), reactions, comments,
 * reward simulation cho knowledge post.
 *
 * Design notes:
 * - Posts la cross-user resource (nhu Feed web). Moi user chi "owns" posts
 *   cua rieng minh (user.posts), nhung moi nguoi co the react/comment.
 * - Posts toan cuc duoc luu rieng de reward sim co the bump reaction
 *   tren post knowledge cua user khac ma khong can reload user object.
 * - Reaction counter = length(reactions[]); simple but consistent.
 */

import type { Post, Reaction } from '@/types';
import { storage } from './storage';
import { DEFAULT_POSTS } from '@/mocks/fixtures';

const STORAGE_KEY = '@fitmate/posts/v1';

let cached: Post[] | null = null;
const subscribers = new Set<() => void>();

async function loadInitial(): Promise<Post[]> {
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Post[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {
    // ignore
  }
  await storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
  return [...DEFAULT_POSTS];
}

export async function getAllPosts(): Promise<Post[]> {
  if (cached) return cached;
  cached = await loadInitial();
  return cached;
}

export function getAllPostsSync(): Post[] {
  return cached ?? DEFAULT_POSTS;
}

async function persist() {
  if (cached) {
    await storage.setItem(STORAGE_KEY, JSON.stringify(cached));
  }
  subscribers.forEach((s) => s());
}

export function subscribe(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function addPost(post: Omit<Post, 'id' | 'timestamp' | 'reactions' | 'comments'>): Promise<Post> {
  const all = await getAllPosts();
  const newPost: Post = {
    ...post,
    id: genId('post'),
    timestamp: new Date().toISOString(),
    reactions: [],
    comments: [],
  };
  cached = [newPost, ...all];
  await persist();
  return newPost;
}

export async function toggleReaction(postId: string, userEmail: string, type: Reaction['type']): Promise<void> {
  const all = await getAllPosts();
  cached = all.map((p) => {
    if (p.id !== postId) return p;
    const idx = p.reactions.findIndex((r) => r.userEmail === userEmail && r.type === type);
    if (idx >= 0) {
      // toggle off (remove)
      return { ...p, reactions: p.reactions.filter((_, i) => i !== idx) };
    }
    // add new reaction; allow only 1 of each type per user (simplification)
    return { ...p, reactions: [...p.reactions, { userEmail, type }] };
  });
  await persist();
}

export async function addComment(postId: string, authorEmail: string, text: string): Promise<void> {
  const all = await getAllPosts();
  cached = all.map((p) => {
    if (p.id !== postId) return p;
    return {
      ...p,
      comments: [
        ...p.comments,
        {
          id: genId('c'),
          authorEmail,
          text,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  });
  await persist();
}

/** Bump random reaction on knowledge post by random user (for reward simulation).
 *  Returns the post that got bumped (or null if none). */
export async function bumpRandomKnowledgeReaction(): Promise<Post | null> {
  const all = await getAllPosts();
  const knowledge = all.filter((p) => p.isKnowledge);
  if (knowledge.length === 0) return null;
  // pick one with the lowest reaction count (variety)
  knowledge.sort((a, b) => a.reactions.length - b.reactions.length);
  const target = knowledge[0];
  const fakeUsers = ['minh@fitmate.vn', 'lananh@fitmate.vn', 'phuong@fitmate.vn', 'khanh@fitmate.vn'];
  const types: Reaction['type'][] = ['heart', 'flame', 'smile'];
  const userEmail = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  // Skip if already reacted with this type
  if (target.reactions.find((r) => r.userEmail === userEmail && r.type === type)) return null;
  // Cap at 75 reactions per post
  if (target.reactions.length >= 75) return null;

  cached = all.map((p) => (p.id === target.id ? { ...p, reactions: [...p.reactions, { userEmail, type }] } : p));
  await persist();
  return { ...target, reactions: [...target.reactions, { userEmail, type }] };
}

/** Reset store (for tests / dev). */
export async function resetPostsStore(): Promise<void> {
  cached = [...DEFAULT_POSTS];
  await storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
  subscribers.forEach((s) => s());
}
