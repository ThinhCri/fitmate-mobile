/**
 * Default user fixtures — khop voi web frontend (App.jsx + ALL_SYSTEM_USERS).
 *
 * Mock auth chi chap nhan:
 *   user@fitmate.vn  / 123456  (Hoi vien)
 *   pt@fitmate.vn    / 123456  (PT)
 *
 * KHONG commit secrets that. Mock password chi de demo local.
 */

import type { User, Post, Appointment, Notification, FriendRequest, Review, ChatMessage, AiChat } from '@/types';

const DEMO_PASSWORD = '123456';

export const DEFAULT_USERS: Record<string, User> = {
  'user@fitmate.vn': {
    email: 'user@fitmate.vn',
    password: DEMO_PASSWORD,
    profile: {
      avatar: null,
      name: 'Hùng',
      bio: 'Muốn đạt body 6 múi trong 6 tháng',
      goal: 'Tăng cơ, giảm mỡ',
      phone: '0912345678',
      birthday: '2003-05-15',
      gender: 'Nam',
      height: 175,
      weight: 70,
      medicalCondition: '',
      allergies: ['Sữa & Lactose', 'Hải sản'],
      allergySurveyDone: true,
      trainingDays: ['T2', 'T4', 'T6'],
      trainingTime: '18:00 - 20:00',
      trainingTimes: ['18:00', '19:00', '20:00'],
      spec: [],
      exp: 0,
      price: 0,
      isVerified: false,
      certificateStatus: 'unverified',
      certificates: [],
      isPt: false,
      isSelf: true,
    },
    streak: 7,
    rewardPoints: 250,
    caloriesConsumed: 1250,
    caloriesBurned: 320,
    workoutSummary: null,
    appointments: [],
    aiChats: [
      {
        id: 'chat-default',
        title: 'Buddy — AI Companion',
        messages: [],
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        type: 'system',
        message: 'Chào mừng bạn đến với Fitmate!',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: false,
      },
      {
        id: 'notif-2',
        type: 'friend_request',
        message: 'Lan Anh đã gửi lời mời kết bạn',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        fromEmail: 'lananh@fitmate.vn',
      },
    ],
    friendRequests: [
      {
        id: 'fr-1',
        fromEmail: 'lananh@fitmate.vn',
        toEmail: 'user@fitmate.vn',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'pending',
      },
    ],
    sentRequests: [],
    friendsList: ['pt@fitmate.vn', 'minh@fitmate.vn'],
    conversations: {},
    posts: [],
    reviews: [],
  },

  'pt@fitmate.vn': {
    email: 'pt@fitmate.vn',
    password: DEMO_PASSWORD,
    profile: {
      avatar: null,
      name: 'Mai Xuân Tú',
      bio: 'HLV Calisthenics & Strength với 3 năm kinh nghiệm',
      goal: 'Giúp học viên đạt thể lực bền vững',
      phone: '0987654321',
      birthday: '1998-09-20',
      gender: 'Nam',
      height: 180,
      weight: 78,
      medicalCondition: '',
      allergies: [],
      allergySurveyDone: false,
      trainingDays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      trainingTime: '08:00 - 21:00',
      trainingTimes: ['08:00', '10:00', '14:00', '16:00', '19:00', '21:00'],
      spec: ['Calisthenics', 'Giảm cân', 'Strength', 'Sức bền'],
      exp: 3,
      price: 300000,
      isVerified: true,
      certificateStatus: 'verified',
      certificates: [
        {
          id: 'cert-1',
          name: 'ACE Personal Trainer',
          organization: 'ACE',
          issueDate: '2023-06-15',
          code: 'ACE-12345',
          type: 'Personal Training',
          image: null,
        },
      ],
      isPt: true,
      isSelf: true,
    },
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
    friendsList: ['user@fitmate.vn'],
    conversations: {},
    posts: [],
    reviews: [
      {
        id: 'review-1',
        fromEmail: 'user@fitmate.vn',
        ptEmail: 'pt@fitmate.vn',
        rating: 5,
        text: 'HLV nhiệt tình, chương trình tập phù hợp.',
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ],
  },

  // Demo: 2nd PT (chua verify) de test mau verified vs unverified.
  'ptlong@fitmate.vn': {
    email: 'ptlong@fitmate.vn',
    password: DEMO_PASSWORD,
    profile: {
      avatar: null,
      name: 'Trần Minh Long',
      bio: 'HLV Yoga & Mobility với 5 năm kinh nghiệm',
      goal: 'Giúp học viên cải thiện linh hoạt và sức khỏe tinh thần',
      phone: '0933445566',
      birthday: '1995-11-08',
      gender: 'Nam',
      height: 172,
      weight: 65,
      medicalCondition: '',
      allergies: [],
      allergySurveyDone: false,
      trainingDays: ['T3', 'T5', 'T7', 'CN'],
      trainingTime: '06:00 - 11:00',
      trainingTimes: ['06:00', '07:30', '09:00', '10:30'],
      spec: ['Yoga', 'Mobility', 'Phục hồi'],
      exp: 5,
      price: 250000,
      isVerified: false,
      certificateStatus: 'pending',
      certificates: [
        {
          id: 'cert-2',
          name: 'Yoga Alliance RYT-200',
          organization: 'Yoga Alliance',
          issueDate: '2021-03-20',
          code: 'YA-99887',
          type: 'Yoga',
          image: null,
        },
      ],
      isPt: true,
      isSelf: false,
    },
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
  },

  // Demo: HV thu 3 (Lan Anh) — gui friend request cho user.
  'lananh@fitmate.vn': {
    email: 'lananh@fitmate.vn',
    password: DEMO_PASSWORD,
    profile: {
      avatar: null,
      name: 'Lan Anh',
      bio: 'Mới bắt đầu tập gym, muốn giảm 5kg trong 3 tháng',
      goal: 'Giảm cân, tăng sức bền',
      phone: '0900111222',
      birthday: '2001-02-14',
      gender: 'Nữ',
      height: 162,
      weight: 60,
      medicalCondition: '',
      allergies: ['Đậu phộng'],
      allergySurveyDone: true,
      trainingDays: ['T2', 'T3', 'T5', 'T6'],
      trainingTime: '17:00 - 19:00',
      trainingTimes: ['17:00', '18:00', '19:00'],
      spec: [],
      exp: 0,
      price: 0,
      isVerified: false,
      certificateStatus: 'unverified',
      certificates: [],
      isPt: false,
      isSelf: false,
    },
    streak: 3,
    rewardPoints: 50,
    caloriesConsumed: 980,
    caloriesBurned: 180,
    workoutSummary: null,
    appointments: [],
    aiChats: [],
    notifications: [],
    friendRequests: [],
    sentRequests: ['user@fitmate.vn'],
    friendsList: [],
    conversations: {},
    posts: [],
    reviews: [],
  },

  // Demo: HV thu 4 (Minh) — da ket ban voi user.
  'minh@fitmate.vn': {
    email: 'minh@fitmate.vn',
    password: DEMO_PASSWORD,
    profile: {
      avatar: null,
      name: 'Minh',
      bio: 'Tập gym 2 năm, đang theo chương trình hypertrophy',
      goal: 'Tăng cơ, duy trì body fat',
      phone: '0944555666',
      birthday: '1999-07-22',
      gender: 'Nam',
      height: 178,
      weight: 75,
      medicalCondition: '',
      allergies: [],
      allergySurveyDone: true,
      trainingDays: ['T2', 'T3', 'T4', 'T5', 'T6'],
      trainingTime: '19:00 - 21:00',
      trainingTimes: ['19:00', '20:00', '21:00'],
      spec: [],
      exp: 0,
      price: 0,
      isVerified: false,
      certificateStatus: 'unverified',
      certificates: [],
      isPt: false,
      isSelf: false,
    },
    streak: 14,
    rewardPoints: 480,
    caloriesConsumed: 2100,
    caloriesBurned: 450,
    workoutSummary: null,
    appointments: [],
    aiChats: [],
    notifications: [],
    friendRequests: [],
    sentRequests: [],
    friendsList: ['user@fitmate.vn'],
    conversations: {},
    posts: [],
    reviews: [],
  },
};

export const DEFAULT_POSTS: Post[] = [
  {
    id: 'post-1',
    authorEmail: 'pt@fitmate.vn',
    content: 'Mẹo tập Calisthenics cho người mới: bắt đầu với 3 hiệp push-up mỗi ngày, tăng dần reps.',
    image: null,
    link: null,
    tags: ['calisthenics', 'beginner'],
    visibility: 'public',
    isKnowledge: true,
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    reactions: [
      { userEmail: 'user@fitmate.vn', type: 'heart' },
      { userEmail: 'user@fitmate.vn', type: 'flame' },
    ],
    comments: [],
  },
];

/** Sample appointments — empty by default; user can create via BookingSheet. */
export const DEFAULT_APPOINTMENTS: Appointment[] = [];

/** Sample notifications — empty; real ones arrive from system. */
export const DEFAULT_NOTIFICATIONS: Notification[] = [];

/** Sample friend requests — empty by default. */
export const DEFAULT_FRIEND_REQUESTS: FriendRequest[] = [];

/** Sample reviews seeded for PT dashboard demo. */
export const DEFAULT_REVIEWS: Review[] = DEFAULT_USERS['pt@fitmate.vn'].reviews;

/** Seed a single demo chat between default users so cross-user message works. */
export const DEFAULT_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'pt@fitmate.vn': [
    {
      id: 'msg-1',
      text: 'Chào bạn, mình sẵn sàng hỗ trợ bạn tập luyện nhé!',
      sender: 'friend',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
  ],
};

/** Sample AI chat seed message. */
export const DEFAULT_AI_CHATS: AiChat[] = DEFAULT_USERS['user@fitmate.vn'].aiChats;
