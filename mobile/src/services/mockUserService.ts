/**
 * Mock user service — in-memory + AsyncStorage persistence.
 *
 * Pattern giong web App.jsx (usersDb + localStorage). Khi sau co backend that,
 * thay the bang fetch wrapper ma khong can sua component (xem DEC-003).
 *
 * Cross-user sync (DEC-005): moi thay doi (friend request, message, post) phai
 * cap nhat usersDb[recipientEmail] luon de gia lap server in-memory.
 */

import type { User } from '@/types';
import * as storage from './storage';
import { DEFAULT_USERS } from '@/mocks/fixtures';

const KEY_USERS = 'users';
const KEY_CURRENT_USER = 'current_user';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

let usersCache: Record<string, User> | null = null;
let currentEmailCache: string | null = null;

async function ensureCache(): Promise<Record<string, User>> {
  if (usersCache) return usersCache;
  const stored = await storage.get<Record<string, User>>(KEY_USERS);
  usersCache = stored ?? { ...DEFAULT_USERS };
  if (!stored) {
    await storage.set(KEY_USERS, usersCache);
  }
  return usersCache;
}

export async function getAllUsers(): Promise<Record<string, User>> {
  const cache = await ensureCache();
  // Return a deep clone so callers cannot mutate the cache directly.
  return JSON.parse(JSON.stringify(cache)) as Record<string, User>;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const cache = await ensureCache();
  const u = cache[email];
  return u ? (JSON.parse(JSON.stringify(u)) as User) : null;
}

export async function getCurrentUser(): Promise<User | null> {
  if (currentEmailCache) {
    return getUserByEmail(currentEmailCache);
  }
  currentEmailCache = await storage.get<string>(KEY_CURRENT_USER);
  if (!currentEmailCache) return null;
  return getUserByEmail(currentEmailCache);
}

export async function login(email: string, password: string): Promise<User> {
  const cache = await ensureCache();
  const user = cache[email];
  if (!user) throw new AuthError('Email không tồn tại trong hệ thống demo.');
  if (user.password !== password) throw new AuthError('Mật khẩu không đúng.');
  currentEmailCache = email;
  await storage.set(KEY_CURRENT_USER, email);
  return JSON.parse(JSON.stringify(user)) as User;
}

export async function logout(): Promise<void> {
  currentEmailCache = null;
  await storage.remove(KEY_CURRENT_USER);
}

export async function register(input: {
  email: string;
  password: string;
  profile: User['profile'];
}): Promise<User> {
  const cache = await ensureCache();
  if (cache[input.email]) {
    throw new AuthError('Email đã được đăng ký.');
  }
  const newUser: User = {
    email: input.email,
    password: input.password,
    profile: { ...input.profile, isSelf: true },
    streak: 0,
    rewardPoints: 0,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    workoutSummary: null,
    appointments: [],
    aiChats: [],
    notifications: [],
    friendRequests: [],
    sentRequests: [],
    friendsList: [],
    conversations: {},
    posts: [],
    reviews: [],
  };
  cache[input.email] = newUser;
  await storage.set(KEY_USERS, cache);
  currentEmailCache = input.email;
  await storage.set(KEY_CURRENT_USER, input.email);
  return JSON.parse(JSON.stringify(newUser)) as User;
}

/**
 * Persist a mutated user back into the cache. Use after editing profile,
 * adding a post, sending a message, etc.
 */
export async function saveUser(user: User): Promise<void> {
  const cache = await ensureCache();
  cache[user.email] = JSON.parse(JSON.stringify(user)) as User;
  await storage.set(KEY_USERS, cache);
}

/**
 * Cross-user sync helper: mutate another user's record (used by friend request,
 * message, post). Returns the mutated user.
 */
export async function updateOtherUser(email: string, mutator: (u: User) => User): Promise<User | null> {
  const cache = await ensureCache();
  const target = cache[email];
  if (!target) return null;
  const updated = mutator(JSON.parse(JSON.stringify(target)) as User);
  cache[email] = updated;
  await storage.set(KEY_USERS, cache);
  return updated;
}

/** Test helper: reset cache + storage. Do NOT call in production code paths. */
export async function __resetForTests(): Promise<void> {
  usersCache = null;
  currentEmailCache = null;
  await storage.remove(KEY_USERS);
  await storage.remove(KEY_CURRENT_USER);
}
