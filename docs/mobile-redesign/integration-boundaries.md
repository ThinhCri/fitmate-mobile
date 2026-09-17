# Integration Boundaries — Mock adapters & diem tich hop backend

> Muc dich: moi chuc nang UI phai co mock adapter chay duoc offline, sau do khi co backend chi can thay adapter (khong sua UI).

## 1. Tong quan pattern

UI → ServiceInterface → MockAdapter (now) → RealApiAdapter (later)

- UI chi goi ServiceInterface (typed).
- MockAdapter goi fixtures trong `mocks/` + AsyncStorage persistence.
- RealApiAdapter (MOB-400+) dung `fetch` toi base URL env.

## 2. Service interfaces (mo ta)

Moi service la mot module TS rieng (trong `mobile/src/services/`). Tat ca method async, tra Promise.

### 2.1 AuthService

```ts
interface AuthService {
  login(email: string, password: string): Promise<UserSession>;
  registerMember(payload: MemberRegisterPayload): Promise<UserSession>;
  registerPT(payload: PTRegisterPayload): Promise<UserSession>;
  logout(): Promise<void>;
  restoreSession(): Promise<UserSession | null>;
}
```

- Mock implementation:
  - `login`: check `usersDb` in-memory + AsyncStorage, match password (mock = `123456`).
  - Fail → reject voi message tieng Viet.
- Real implementation: POST `/api/auth/login`, `/api/auth/register`, set token vao secure store.
- **Cam ket UI**: chi tien khi `await` resolve. Error → toast.

### 2.2 UserService (profile + self + others)

```ts
interface UserService {
  getMyProfile(): Promise<Profile>;
  updateMyProfile(patch: Partial<Profile>): Promise<Profile>;
  getProfileByName(name: string): Promise<Profile | null>;
  searchUsers(query: string, category: FilterCategory): Promise<Profile[]>;
}
```

- Mock: doc tu `usersDb` + `ALL_SYSTEM_USERS` constant.
- Real: GET `/api/users/search?name=`, `/api/users/:name`.

### 2.3 WorkoutService

```ts
interface WorkoutService {
  getWeeklyPlan(): Promise<WeeklyWorkout>;
  applyAdaptive(prompt: string): Promise<WeeklyWorkout>; // returns plan
  swapExercise(day: string, exId: string): Promise<Exercise>;
  deleteExercise(day: string, exId: string): Promise<WeeklyWorkout>;
  reorderExercise(day: string, exId: string, newIndex: number): Promise<void>;
  saveMedicalSurvey(payload: MedicalSurvey): Promise<Profile>;
  startSession(day: string): Promise<SessionState>;
  completeSession(payload: SessionSummary): Promise<{ streak: number; caloriesBurned: number }>;
}
```

- Mock: tinh toan tren local data + persist progress vao `workoutSessionDb`.
- Real: tuong ung REST.
- AI features: Mock tra ket qua co dinh (3 lua chon deterministic) voi delay 500-1500ms.

### 2.4 NutritionService

```ts
interface NutritionService {
  scanMeal(photoUri: string): Promise<DetectedDish>;
  getMealSchedule(): Promise<WeeklyMealSchedule>;
  replaceMeal(day: string, slot: MealSlot, dish: Dish): Promise<WeeklyMealSchedule>;
  skipMeal(day: string, slot: MealSlot): Promise<{ caloriesConsumed: number }>;
  saveAllergies(payload: AllergyPayload): Promise<Profile>;
}
```

- Mock: random trong `mockFoodDetections` + schedule cung dinh.
- Real: Vision API + recommendation API.

### 2.5 PostService

```ts
interface PostService {
  feed(visibility?: VisibilityScope): Promise<Post[]>;
  create(payload: CreatePostPayload): Promise<Post>;
  react(postId: string, type: 'love' | 'fire' | 'haha'): Promise<Post>;
  comment(postId: string, content: string): Promise<Post>;
}
```

- Mock: local posts array persist.
- Real: REST endpoint.

### 2.6 AIChatService

```ts
interface AIChatService {
  listChats(userId: string): Promise<AIChat[]>;
  createChat(userId: string): Promise<AIChat>;
  sendMessage(chatId: string, text: string): Promise<AIChatMessage>;
  renameChat(chatId: string, title: string): Promise<AIChat>;
  deleteChat(chatId: string): Promise<void>;
}
```

- Mock: local + canned reply.
- Real: AI backend streaming response.

### 2.7 FriendService (CRITICAL cross-user)

```ts
interface FriendService {
  sendRequest(toUserName: string): Promise<void>;
  cancelSent(toUserName: string): Promise<void>;
  accept(fromUserName: string): Promise<void>;
  reject(fromUserName: string): Promise<void>;
  unfriend(friendName: string): Promise<void>;
  listRequests(): Promise<FriendRequest[]>;
  listFriends(): Promise<string[]>;
  listSent(): Promise<string[]>;
}
```

- Mock: cap nhat 2 chieu trong `usersDb` (in-memory + AsyncStorage).
- Real: server-side authority; chi tam update local UI tam thoi.
- **Luu y**: Anh huong nhieu parity ID (FP-007, FP-039).

### 2.8 NotificationService

```ts
interface NotificationService {
  list(filter?: NotificationFilter): Promise<Notification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}
```

- Mock: local array persist.
- Real: FCM push + REST fallback.

### 2.9 AppointmentService

```ts
interface AppointmentService {
  listInMonth(month: number, year: number): Promise<Appointment[]>;
  create(payload: CreateAppointmentPayload): Promise<Appointment>;
  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
  cancel(id: string): Promise<void>;
}
```

### 2.10 CertService

```ts
interface CertService {
  list(ownerName: string): Promise<Certificate[]>;
  add(payload: NewCertPayload): Promise<Certificate[]>;
  requestVerification(): Promise<{ status: 'pending' }>;
  // Admin simulate (chi de test tren UI):
  approve(): Promise<{ status: 'verified' }>;
  reset(): Promise<{ status: 'unverified' }>;
}
```

- Mock: luu local + persist verification status.
- Real: backend will handle approval.

### 2.11 RewardService

```ts
interface RewardService {
  getBalance(): Promise<number>;
  redeem(payload: RedeemPayload): Promise<{ balance: number; voucher?: string }>;
  withdraw(payload: WithdrawPayload): Promise<{ balance: number }>;
}
```

### 2.12 VipService

```ts
interface VipService {
  upgrade(plan: '1mo' | '12mo'): Promise<{ role: string }>;
}
```

### 2.13 SupportService

```ts
interface SupportService {
  openEmail(): Promise<void>; // Linking.openURL('mailto:...')
}
```

## 3. Cross-user behavior (can thiet ke ky)

Trong web, `App.jsx` cross-user sync qua `usersDb[recipientEmail]`. Trong mobile, khi chi co local data:

- Dung `localDb` chua nhieu user account (giong web) de demo cross-user.
- Khi dang nhap user A → thay doi → service cap nhat ca A va B trong localDb.
- Khi dang nhap user B → nhan thay doi cua A.
- Thiet ke service lang nghe `dbChange$` event de cross-screen realtime.

## 4. Data flow rong

```
UI Component
   ↓ dispatch/action
ContextStore (auth, theme, ...)
   ↓ useEffect → fetch
ServiceInterface
   ↓ proxy to
MockAdapter | RealApiAdapter
   ↓
Mock Fixtures | Backend API
```

## 5. Persistence layer (MobileAbstractStorage)

```ts
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clearAll(): Promise<void>;
}
```

- Mock (now): AsyncStorage.
- Real: bo qua (data tren server).

## 6. Cau hoi can xac minh voi backend tuong lai

- Auth: flow OAuth? token TTL? refresh?
- AI Vision: provider? format? rate limit?
- Chat realtime: websocket / FCM / polling?
- Cert verification: API nao? review process?
- Image storage: upload truc tiep hay qua API?
- Friends: real-time cap nhat hay polling?

## 7. Khoang cach hien tai (giua UI va backend)

| Chuc nang | UI xong | Mock xong | Real backend |
|---|---|---|---|
| Auth (mock users) | TODO | TODO | later |
| Workout plan (deterministic) | TODO | TODO | later |
| AI swap / adaptive | TODO (mock) | TODO | later |
| Nutrition scan | TODO (mock) | TODO | later |
| AI chat | TODO (mock) | TODO | later |
| Posts / reactions / comments | TODO | TODO | later |
| Friend request flow | TODO | TODO (cross-user via localDb) | later |
| Appointments | TODO | TODO | later |
| Cert approval | TODO (admin simulate) | TODO | later |
| Reward / Withdraw / VIP | TODO (UI demo) | TODO | later |
| Push notification | chua lam | chua lam | later |

## 8. Chua tich hop backend

Moi notif/chat push, moi AI scan/chat real, moi transaction thanh toan → KHONG lam trong giai doan UI.
