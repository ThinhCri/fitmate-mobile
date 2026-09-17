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
  sets: number;
  reps: number;
  rest: number; // seconds
  calories: number;
  notes?: string;
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
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  day: string; // 'T2'..'CN'
  durationMin: number;
  caloriesBurned: number;
  exercises: number;
}

export interface Appointment {
  id: string;
  date: string; // ISO date
  timeSlot: string;
  ptEmail: string;
  memberEmail: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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
