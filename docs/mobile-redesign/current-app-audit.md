# Current App Audit — Web Frontend Baseline

> Ban web hien tai la **ban doi chieu** trong suot qua trinh migration. Moi task UI phai kiem tra lai voi file audit nay de dam bao khong mat content.

## 1. Baseline Git

| Item | Gia tri |
|---|---|
| Repo | `D:\Ky8\exe201\FitmateAI_FE` |
| Branch hien tai | `main` |
| Trang thai working tree | clean (xac minh bang `git status`) |
| Commit gan day | xem `git log --oneline -20` |
| Phien ban kiem kê | commit gan nhat truoc khi tao docs |

## 2. Tech stack web (xac minh tu code)

| Hang muc | Cong nghe |
|---|---|
| Framework | React 19.2.6 |
| Build tool | Vite 8.x |
| Language | JavaScript (JSX) |
| Icons | lucide-react 1.18.0 |
| Lint | ESLint 10.x (flat config) |
| Entry HTML | `index.html` → `src/main.jsx` → `src/App.jsx` |
| Routing | None (state-based, `screen` trong `App.jsx`) |
| State | React useState/useEffect tich hop localStorage |
| Persistence | `localStorage` keys: `fitmate_users`, `fitmate_current_user`, `fitmate_token`, `fitmate_user_id` |

## 3. Cau truc thu muc

```
FitmateAI_FE/
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
├── .gitignore
├── README.md                       (doc ban dau cua repo)
├── fitmate_figma_prompt.txt        (prompt sinh UI prototype)
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx
    ├── App.jsx                     (component goc, ~65KB)
    ├── App.css                     (cleared)
    ├── index.css                   (tokens, emulator shell)
    ├── assets/                     (hero.png, react.svg, vite.svg)
    └── components/
        ├── Auth.jsx
        ├── Dashboard.jsx
        ├── NutritionVision.jsx
        ├── WorkoutPlanner.jsx
        ├── CompanionAndSocial.jsx
        ├── PtMarketplace.jsx
        ├── UserProfile.jsx
        ├── AdvancedProfile.jsx     (screen 'chuyen-sau')
        ├── ChuyenSau.jsx           (overlay trong UserProfile)
        ├── Messenger.jsx
        ├── Appointments.jsx
        ├── UserSearchModal.jsx
        ├── NotificationsModal.jsx
        ├── FriendRequestsModal.jsx
        ├── PTCertificatesModal.jsx
        └── CreatePostModal.jsx
```

## 4. Thanh phan chinh (App-level)

`App.jsx` la state hub. Mot so luu y:

- **Pseudo-routing**: bien `screen` voi gia tri `'dashboard' | 'nutrition' | 'workout' | 'social' | 'messenger' | 'appointments' | 'marketplace' | 'chuyen-sau'`.
- **`selectedProfile`**: overlay profile khi click vao avatar/name bat ky.
- **`isAuthenticated`**: gate Auth screen.
- **localStorage**: persist toan bo user DB trong `fitmate_users`.
- **Cross-user sync**: cu khi thay doi (friend request, message) → cap nhat `usersDb[recipientEmail]` luon → giong mot mini backend in-memory.
- **Mot API call duy nhat** (App.jsx line 342):
  ```js
  fetch(`http://localhost:8080/api/user/profile/${userId}`)
  ```
  Loi khong anh huong flow vi co fallback local.

## 5. Cac module da kiem ke

| Module | File | Vai tro chinh |
|---|---|---|
| **Auth** | `Auth.jsx` | Login + Register (member 2 buoc, PT 1 buoc) + quick login |
| **Dashboard** | `Dashboard.jsx` | Tong quan: streak, calorie ring, 4 quick action card, drawer, withdraw modal, VIP modal, support modal |
| **Nutrition Vision** | `NutritionVision.jsx` | Quet mon gia lap (scan + AI detect) + tab plan thuc don 7 ngay |
| **Workout Planner** | `WorkoutPlanner.jsx` | Lich tap 7 ngay, AI adaptive, drag-drop, swap, timer, medical survey modal |
| **Companion & Social** | `CompanionAndSocial.jsx` | AI Companion chat (5 canned replies, typing indicator) + Social feed (posts, reactions, comments, knowledge reward simulation) |
| **PT Marketplace** | `PtMarketplace.jsx` | 3 PT cung dinh, dat lich modal |
| **Appointments** | `Appointments.jsx` | Lich hen theo thang, thao tac theo role (PT vs Member) |
| **Messenger** | `Messenger.jsx` | Danh sach ban be + chat 1-1, cross-user message |
| **User Profile** | `UserProfile.jsx` | View + Edit profile member/PT, avatar picker, dat lich, ket ban, nhac tin |
| **Advanced Profile / Chuyen Sau** | `AdvancedProfile.jsx` + `ChuyenSau.jsx` | Sua benh nen, di ung, lich tap, khung gio |
| **User Search** | `UserSearchModal.jsx` | Tim theo name/bio/spec, filter category (all/pt/member/mentor) |
| **Notifications** | `NotificationsModal.jsx` | Loc all/loi moi/system, accept/reject friend_request |
| **Friend Requests** | `FriendRequestsModal.jsx` | Tab da nhan / ban be / da gui |
| **PT Certificates** | `PTCertificatesModal.jsx` | CRUD certificates + admin simulate verify |
| **Create Post** | `CreatePostModal.jsx` | Tao post: text + image + link + tag + visibility + knowledge flag |

## 6. Vai tro nguoi dung

- **Hoi vien (member)**: `isPt === false`. Co streak, calorie ring, scan food, follow workout plan, friend request, post.
- **Huấn luyen vien (PT)**: `isPt === true`. Co gia thue, chuyen mon (spec), chung chi, nam kinh nghiem, rating, reviews. Tiep nhan booking. Them cert qua `PTCertificatesModal` co admin simulation.
- **Mentor** (trong `ALL_SYSTEM_USERS`): chi hien thi trong search; profile khong co modal rieng, duoc tao ngam qua `handleOpenProfile`.

## 7. Profile fields (kiem ke tu `App.jsx` + `UserProfile.jsx`)

| Truong | Member | PT | Edit | View other |
|---|---|---|---|---|
| `avatar` | ✓ | ✓ | self | all |
| `name` | ✓ | ✓ | self via Auth | all |
| `bio` / `goal` | ✓ | ✓ | self | all |
| `phone` | ✓ | ✓ | self | all |
| `birthday` | ✓ | ✓ | self | all |
| `gender` | ✓ | ✓ | self | all |
| `height` | ✓ | ✓ | self | all |
| `weight` | ✓ | ✓ | self | all |
| `medicalCondition` | ✓ | hidden | self (ChuyenSau) | member only |
| `allergies` | ✓ | hidden | self (ChuyenSau/Nutrition) | member only |
| `allergySurveyDone` | ✓ | hidden | false by default | flag |
| `trainingDays` | ✓ | ✓ | self (ChuyenSau/UserProfile) | all |
| `trainingTime` (string) | ✓ | ✓ | self | all |
| `trainingTimes` (array) | ✓ | ✓ | self | internal |
| `spec` | ✗ | ✓ (max 4) | self | all |
| `exp` | ✗ | ✓ | self | all |
| `price` | ✗ | ✓ | self | all |
| `isVerified` | ✗ | ✓ | admin only via PTCertificatesModal | all |
| `certificateStatus` | ✗ | `verified`/`pending`/`unverified` | self (request) + admin | all |
| `certificates` | ✗ | array of `{id,name,organization,issueDate,code,type,image}` | self add | all |
| `isPt`, `isSelf`, `isVerified` | flag | flag | system | meta |

## 8. Modal/Overlay da kiem ke

| Modal | Loai | Z-index tuong doi |
|---|---|---|
| Drawer ben Dashboard | Custom panel | 1001 |
| Withdraw / VIP / Support modal | Full-screen overlay | 2000-3000 |
| NotificationsModal | Component con | inherit |
| FriendRequestsModal | Component con | inherit |
| UserSearchModal | Component con | inherit |
| Allergy Survey (Nutrition) | Full-screen | 3000 |
| Replace Meal Confirm (Nutrition) | Full-screen | 2500 |
| Community/Knowledge Rules (CreatePost) | Full-screen | 3500 |
| Swap suggestion (Workout) | Overlay | 1200 |
| Medical survey (Workout) | Full-screen | 3000 |
| AI chat sidebar (Social) | Inline drawer | z=91 |
| Booking (Marketplace/UserProfile) | Full-screen | 1000 / 3000 |
| Day detail (Appointments) | Full-screen | 3000 |
| Avatar picker (UserProfile) | Inline | inherit |
| Fullscreen cert view (PTCertificatesModal) | Overlay | 99999 |

## 9. localStorage schema chi tiet (xac minh tu code)

### `fitmate_users` (full user DB)

```jsonc
{
  "user@fitmate.vn": {
    "email": "user@fitmate.vn",
    "password": "123456",        // mock password
    "profile": { ... Profile schema tren ... },
    "streak": 7,
    "rewardPoints": 250,
    "caloriesConsumed": 1250,
    "caloriesBurned": 0,
    "workoutSummary": null,
    "appointments": [ /* Appointment[] */ ],
    "aiChats": [ /* { id, title, messages: [{id,text,sender}] } */ ],
    "notifications": [ /* Notification[] */ ],
    "friendRequests": [ /* FriendRequest[] */ ],
    "sentRequests": ["..."],
    "friendsList": ["..."],
    "conversations": { "<friendName>": [/* Message[] */] }
  },
  "pt@fitmate.vn": { ... }
}
```

### `fitmate_current_user` (string email)

### `fitmate_token`, `fitmate_user_id` (do Auth.jsx ghi khi goi backend that)

## 10. Trang thai noi dung va chuc nang da kiem chung

| Trang thai | Mo ta |
|---|---|
| **Da doc code (verified by line)** | Toan bo 15 file components + App.jsx + 2 CSS files + package.json/vite.config/eslint |
| **Da xac dinh scripts** | `npm run dev`, `build`, `lint`, `preview` (xac minh tu `package.json`) |
| **Da xac dinh state ownership** | App.jsx la owner; moi component nhan props + callback |
| **Da xac dinh flow** | Login → Dashboard → 5 tab + Profile + Appointments + Messenger + Marketplace + Chuyen Sau |
| **CHUA chay web** | Repo chua co keyst thu cong lan nao trong phien nay. Tuy nhien code doc truc tiep nen co the tao parity matrix chinh xac. |
| **CHUA chay Android** | Phien nay moi o giai doan lap ke hoach. |
| **CHUA screenshot** | Can emulator Android thuc te de screenshot. |

## 11. Loi co san (ghi nhan, KHONG tu sua trong phien nay)

| Loi vi tri | Mo ta |
|---|---|
| `WorkoutPlanner.jsx` | prop `dietState` nhan nhung khong bao gio doc (dead). |
| `ChuyenSau.jsx` | import `HeartPulse` nhung khong dung trong JSX. |
| `WorkoutPlanner.jsx` | import `Activity`, `Sparkles`, `Trophy`, `ArrowRight` nhung khong dung. |
| `Appointments.jsx` | avatar fallback theo ten PT (string match), them PT moi can sua code. |
| `App.jsx` | mot `fetch` toi `http://localhost:8080/api/user/profile/${userId}` (line 342) co the fail neu chay khong co backend — nhung code co try/catch + fallback, nen khong pha v flow. |
| `WorkoutPlanner.jsx` | mealSchedule la dict Vietnamese ("Th 2", "CN") khong consistent — can verify khi migrate (xem `feature-parity-matrix.md`). |

Cac loi tren ghi trong docs `tasks.md` voi tag `pre-existing-bug` neu quyet dinh sua. Mac dinh: KHONG sua trong giai doan UI migration (chi ghi lai).

## 12. Chua xac minh

- Khong co backend that nen khong the kiem tra flow dang nhap that.
- Khong co emulator Android nen khong the screenshot.
- Thong so may anh, chat luong Unsplash CDN — phu thuoc runtime.
- Trang thai cua cac bai post cua seed data co thay doi khong (vi simulation reaction).
