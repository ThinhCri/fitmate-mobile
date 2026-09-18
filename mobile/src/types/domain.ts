/**
 * Domain types — schema khop voi web frontend (App.jsx + UserProfile.jsx).
 *
 * Day la baseline content duoc di cua web (xem DEC-004, current-app-audit.md
 * Section 7). KHONG sua schema khi code Android; chi them field moi neu
 * `decisions.md` chap nhan.
 */

export type Gender = 'Nam' | 'Nữ' | 'Khác';
export type CertificateStatus = 'verified' | 'pending' | 'unverified';

export interface Exercise {
  id: string;
  name: string;
  /**
   * Discriminator for how progress is measured.
   *  - 'time'  : user holds/works for `durationSec`. Reps is not meaningful.
   *  - 'reps'  : user performs `reps` repetitions per set.
   * Phase UI does NOT auto-convert reps→time or vice-versa. Each value is
   * rendered according to its own kind.
   */
  type: 'reps' | 'time';
  sets: number;
  /** Required when type === 'reps'. Otherwise undefined. */
  reps?: number;
  /** Required when type === 'time'. Otherwise undefined. */
  durationSec?: number;
  /** Rest between sets within the same exercise. */
  restSec: number;
  /** Optional transition rest before the next exercise. */
  restAfterSec?: number;
  calories: number;
  /** Short on-screen instructions for the exercise. */
  notes?: string;
  /** Optional media URL — may be a video file or audio file. */
  mediaUrl?: string;
  /** Media kind when mediaUrl is set. */
  mediaType?: 'video' | 'audio';
  /** License / source attribution for media (recorded in docs). */
  mediaSource?: string;
  /** Tags used by FP-018 AI adaptive scoring. */
  tags?: string[];
}

export interface Certificate {
  id: string;
  name: string;
  organization: string;
  issueDate: string; // ISO date
  code: string;
  type: string;
  image: string | null;
}

export interface Profile {
  avatar: string | null;
  name: string;
  bio: string;
  goal: string;
  phone: string;
  birthday: string; // ISO date
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  medicalCondition: string;
  allergies: string[];
  allergySurveyDone: boolean;
  trainingDays: string[]; // 'T2'..'CN'
  trainingTime: string; // '18:00 - 20:00'
  trainingTimes: string[]; // array of slot strings
  // PT-only
  spec: string[];
  exp: number; // years
  price: number; // VND per session
  isVerified: boolean;
  certificateStatus: CertificateStatus;
  certificates: Certificate[];
  // Meta
  isPt: boolean;
  isSelf: boolean;
}

export interface User {
  email: string;
  password: string; // mock-only; never store real password
  profile: Profile;
  // Dashboard state
  streak: number;
  rewardPoints: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  workoutSummary: string | null;
  // Domain objects
  appointments: Appointment[];
  aiChats: AiChat[];
  notifications: Notification[];
  friendRequests: FriendRequest[];
  sentRequests: string[];
  friendsList: string[];
  conversations: Record<string, ChatMessage[]>;
  posts: Post[];
  reviews: Review[];
  // FP-018 workout tracking
  workoutHistory: WorkoutSession[];
  // FP-019 medical survey
  medicalConditions?: string[];
  medicalNotes?: string;
  // Nutrition / Scan
  mealSchedule?: MealSchedule;
}

/**
 * One recorded workout session.
 *
 * `status` distinguishes:
 *  - 'completed'  : user finished all planned sets.
 *  - 'endedEarly' : user stopped before the end (confirmed exit).
 *  - 'skipped'    : session was abandoned without completing (rare; reserved
 *                    for future "skip workout" UX). Current UI only emits
 *                    'completed' and 'endedEarly' via MOB-405.
 *
 * `completedSets` is the number of sets actually finished. When status is
 * 'completed' it equals total planned sets.
 */
export interface WorkoutSession {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  day: string; // 'T2'..'CN'
  durationMin: number;
  caloriesBurned: number; // estimated (ghi ro "uoc tinh")
  exercises: number;
  status: 'completed' | 'endedEarly' | 'skipped';
  completedSets?: number;
  plannedSets?: number;
}

export interface Appointment {
  id: string;
  date: string; // ISO date
  timeSlot: string;
  ptEmail: string;
  memberEmail: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'late' | 'rescheduled';
  notes: string;
}

export interface AiChat {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'friend';
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'friend_request' | 'system' | 'reminder';
  message: string;
  timestamp: string;
  read: boolean;
  fromEmail?: string;
}

export interface FriendRequest {
  id: string;
  fromEmail: string;
  toEmail: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Post {
  id: string;
  authorEmail: string;
  content: string;
  image: string | null;
  link: string | null;
  tags: string[];
  visibility: 'public' | 'friends' | 'private';
  isKnowledge: boolean;
  timestamp: string;
  reactions: Reaction[];
  comments: Comment[];
}

export interface MealScheduleEntry {
  date: string; // ISO date
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
}

/** Map meal → most-recent dish name. Used by Nutrition Scan quick-assign. */
export type MealSchedule = Partial<{
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
}>;

export interface Reaction {
  userEmail: string;
  type: 'heart' | 'flame' | 'smile';
}

export interface Comment {
  id: string;
  authorEmail: string;
  text: string;
  timestamp: string;
}

export interface Review {
  id: string;
  fromEmail: string;
  ptEmail: string;
  rating: number; // 1..5
  text: string;
  timestamp: string;
}

/** Convenience: extract from a User record. */
export function isPt(user: User): boolean {
  return user.profile.isPt;
}

export function isSelfOf(viewer: User | null, target: User): boolean {
  if (!viewer) return false;
  return viewer.email === target.email;
}
