# Feature Parity Matrix

> Moi muc o day la mot item phai **giu nguyen** trong ban Android. Parity ID `FP-XXX` la khoa chinh de lien ket voi `tasks.md`.

**Cot "Trang thai"**:
- `TODO` — chua lam.
- `IN_PROGRESS` — dang lam.
- `BLOCKED` — dung do blocker da ghi.
- `DONE` — da dat tieu chi trong `acceptance-checklist.md` cho item.

**Cot "Vai tro"**: `M` = member, `P` = PT, `B` = ca hai.

---

## FP-001 — Streak & Calorie Ring (Dashboard top)

- **Man hinh/luong web**: Dashboard phan tren (Dashboard.jsx, netCal/streak)
- **File nguon**: `src/components/Dashboard.jsx` lines 80-89
- **Vai tro & dieu kien**: M (cho ca nguoi moi chua login va PT vi PT cung can nhin)
- **Noi dung**: streak number, calorie ring (consumed/burned), calTarget = 2100 neu skipped, else 2400
- **Hanh dong**: tap streak → +1 + toast; tap calo ring → trang nutrition
- **Nguon du lieu**: state trong `App.jsx` (`streak`, `caloriesConsumed`, `caloriesBurned`, `workoutState`)
- **Vi tri moi**: top of Dashboard, sticky-ish
- **Thay doi trinh bay**: doi ring sang Material progress indicator (xem `design-system.md` Section 11 Progress); hien thi thanh vien/duoi muc theo token success/warning (xem DEC-019 Soft Energy light theme); nhan manh dang ring cho streak de giu signature pattern.
- **Kiem chung**: bang tay thay `streak` qua state dev; visual qua screenshot.
- **Task lien quan**: MOB-101
- **Trang thai**: TODO

## FP-002 — Quick Action Cards (Dashboard)

- **Man hinh/luong web**: Dashboard cac card lon
- **File nguon**: `src/components/Dashboard.jsx` lines 350-500
- **Vai tro & dieu kien**: B
- **Noi dung**: 4 card: Quet Bua An / Lich Luyen Tap / Dat Lich PT / Chuyen Sau
- **Hanh dong**: tap card → navigate sang tab tuong ung
- **Vi tri moi**: dashboard, ngay sau streak card
- **Thay doi trinh bay**: chuyen sang 2x2 grid hoac horizontal carousel
- **Task**: MOB-101

## FP-003 — Drawer Sidebar

- **Luong web**: Dashboard hamburger → side drawer
- **File**: `Dashboard.jsx` lines 119-385
- **Vai tro**: B (mot so item nhu VIP chi danh cho member)
- **Muc**: Profile, Search Friends/PT, Friends list, Chat, Appointments, VIP, Support, Logout
- **Hanh dong**: navigate / open modal / logout
- **Vi tri moi**: side drawer (right-to-left slide-in); hoac dung bottom sheet/destinations
- **Thay doi**: tach VIP vs PT-only; them Settings neu co
- **Task**: MOB-102

## FP-004 — Notifications Modal

- **Luong**: Dashboard bell icon → NotificationsModal
- **File**: `NotificationsModal.jsx`
- **Vai tro**: B
- **Muc**: 3 tab (all/loi moi/system), unread badge, tap → open friend requests hoac mark as read
- **Hanh dong**: accept/reject request inline, mark all read, badge cong dem
- **Du lieu**: notifications array trong usersDb
- **Vi tri moi**: full-screen modal hoac push route
- **Task**: MOB-103

## FP-005 — Friend Requests Modal

- **Luong**: Friends list (drawer) → FriendRequestsModal
- **File**: `FriendRequestsModal.jsx`
- **Vai tro**: B
- **Muc**: Tab Da nhan / Ban be / Da gui; nút accept/reject
- **Hanh dong**: accept → cap nhat DB, them vao Ban be, tao system notification cho ca 2 ben
- **Task**: MOB-104

## FP-006 — User Search

- **Luong**: Search friends/PT
- **File**: `UserSearchModal.jsx`
- **Vai tro**: B
- **Muc**: search theo ten/role/bio/spec, loc theo category (all/pt/member/mentor)
- **Datasource**: `ALL_SYSTEM_USERS` (12 users trong mockProfiles + all usersDb)
- **Hanh dong**: mo profile, send/cancel friend request
- **Task**: MOB-105

## FP-007 — Friend Request state machine (cross-user)

- **Luong**: send → pending → accept/reject → friend/unfriend; cross-db
- **File**: `App.jsx` lines 559-790
- **Vai tro**: B
- **Hanh dong**: cap nhat sentRequests/friendsList/friendRequests/notifications cua ca sender + recipient qua `usersDb`
- **Task**: MOB-106 (can thiet ke mockUserService)

## FP-008 — Post: create + image + link + tag + visibility + knowledge

- **Luong**: CompanionAndSocial → CreatePostModal
- **File**: `CreatePostModal.jsx`
- **Vai tro**: B
- **Truong**: content (textarea), image (file), link (text), tags (array), visibility (public/friends/private), isKnowledge (toggle)
- **Validation**: content khong empty neu khong co image/link; neu isKnowledge → content >= 15 chars
- **Hanh dong**: submit → them vao `posts` voi author = myProfile, comments rong, reactions = {0,0,0}
- **Task**: MOB-107

## FP-009 — Post: reactions (love/fire/haha) + comment

- **Luong**: CompanionAndSocial feed
- **File**: `CompanionAndSocial.jsx`
- **Vai tro**: B
- **Hanh dong**: toggle reaction cap nhat `reactions[type]` + `userReacted[type]`; tap comment → day vao post detail view
- **Task**: MOB-108

## FP-010 — Knowledge post reward simulation

- **Luong**: App.jsx interval moi 4s → tang reaction ngau nhien cho post `author === 'Hùng (Bạn)' && isKnowledge`
- **File**: `App.jsx` lines 1018-1070
- **Vai tro**: M (chi author la ban moi tang reward)
- **Logic**: total >= 50 → `isQuality = true`, `pointsAwarded = 10`, toast; sau do +1 point moi 5 reaction
- **Constraint**: max 75 reactions de khong "viral qua nhieu"
- **Task**: MOB-108, se bao gom canh bao "nay la simulation, khong phai diem that"

## FP-011 — AI Companion chat

- **Luong**: CompanionAndSocial tab "Companion"
- **File**: `CompanionAndSocial.jsx`
- **Vai tro**: B (tan dung)
- **Tinh nang**: danh sach chat (sidebar), tao chat moi, sua title inline, xoa chat, typing indicator ("Buddy dang go..."), 5 canned reply ngau nhien sau 1200ms
- **Task**: MOB-109

## FP-012 — Toxic content filter

- **Luong**: create post/comment → check keyword
- **File**: `CompanionAndSocial.jsx` `cleanContent()` (lines 43-49)
- **Logic**: replace matches bang warning span
- **Task**: MOB-108 (tich hop ngay khi tao feed)

## FP-013 — Social feed

- **Luong**: CompanionAndSocial tab "Cong dong"
- **File**: `CompanionAndSocial.jsx`
- **Vai tro**: B
- **Muc**: post cards voi author/avatar/time/content/image/reactions/comments count
- **Sort**: thoi gian (mac dinh seed)
- **Task**: MOB-110

## FP-014 — Nutrition: scan tab

- **Luong**: NutritionVision tab "Quet Mon"
- **File**: `NutritionVision.jsx`
- **Vai tro**: B (tren thuc te chi member can, nhung PT cung co the xem)
- **Hanh dong**: Chup/Upload → mock scan 2s → hien thi mon (name + calo + protein + carb + fat) → quick assign sang bua sang/trua/toi → cap nhat `mealSchedule` + `caloriesConsumed`
- **Portion slider**: 0.5 → 2.0 step 0.25
- **Task**: MOB-111

## FP-015 — Nutrition: plan tab (thuc don 7 ngay)

- **Luong**: NutritionVision tab "AI Thuc Don"
- **File**: `NutritionVision.jsx`
- **Vai tro**: B
- **Muc**: 7 ngay, moi ngay 3 bua (sang/trua/toi) + nutrition summary
- **Hanh dong**: chon ngay → xem thuc don, skip meal, replace bang AI suggested (chon lai ngay va bua)
- **Weight goal**: lose / maintain / gain
- **Task**: MOB-111

## FP-016 — Allergy survey

- **Luong**: NutritionVision → modal "Allergy"
- **File**: `NutritionVision.jsx` lines 693-808
- **Vai tro**: M (member self)
- **Muc**: 7 checkbox (sua lactose, hai san, gluten, dau phong, trung, dau nay, ca) + custom text
- **Hanh dong**: luu → cap nhat `profile.allergies` + `allergySurveyDone = true`
- **Task**: MOB-111

## FP-017 — Workout: weekly plan tab

- **Luong web**: WorkoutPlanner tab days
- **File web**: `WorkoutPlanner.jsx`
- **Vai tro & dieu kien**: B (member, PT)
- **Noi dung**: 7 ngay bam tab; moi ngay co danh sach bai tap (name + sets + rest + calories)
- **Hanh dong web**: drag-drop reorder (min 2 exercises), delete exercise, swap bai (AI suggest 3 lua chon)
- **Vi tri moi**: giu WorkoutScreen (MOB-112); them moi `WorkoutSessionScreen` (MOB-404, modal) la man hinh tap chuyen dung.
- **Thay doi trinh bay**: model bai tap co `type: 'reps' | 'time'` (MOB-402) → Plank hien `45s/hiep` thay vi "1 reps". Co `notes` cho moi bai (text instruction). Push-up co video Pixabay CC0 (ghi `mediaSource`). Khong con checklist thu cong tren WorkoutScreen; nguoi dung bam "Bắt đầu tập" → WorkoutSessionScreen.
- **Kiem chung**: khi mo screen session, status badge + timer/reps + controls hoat dong; auto-advance prepare→exercise→rest→next.
- **Task**: MOB-112, MOB-402, MOB-404
- **Trang thai**: TODO

## FP-018 — Workout: AI Adaptive mode

- **Luong web**: WorkoutPlanner "AI Thich ung"
- **File web**: `WorkoutPlanner.jsx`
- **Vai tro**: B (member, PT)
- **Hanh dong web**: nhap prompt → AI tinh diem bai tap theo tag → thay the set hien tai
- **Bonus web**: BMI + medical condition logic swap/reduce reps
- **Vi tri moi**: giu tren WorkoutScreen (sheet "AI Thích ứng"); tag-based scoring giu nguyen. Reduce chi ap dung bai reps (`type === 'reps'`), KHONG ap cho bai time (MOB-402).
- **Task**: MOB-112, MOB-402
- **Trang thai**: TODO

## FP-019 — Workout: medical survey modal

- **Luong web**: WorkoutPlanner card "Cap nhat suc khoe"
- **File web**: `WorkoutPlanner.jsx` lines 1039-1265
- **Vai tro**: M (member self)
- **Muc**: 7 checkbox (tim mach, cao huyet ap, thoat vi, hen, dau khop, tieu duong, thieu mau) + custom text + ngay tap + khung gio
- **Hanh dong web**: luu → cap nhat `profile.medicalCondition`, `medicalSurveyDone`, `trainingDays`, `trainingTimes`
- **Vi tri moi**: giu nguyen `MedicalSurvey` component (MOB-112).
- **Task**: MOB-112
- **Trang thai**: TODO

## FP-020 — Workout: session timer + summary

- **Luong web**: WorkoutPlanner → start workout
- **File web**: `WorkoutPlanner.jsx`
- **Vai tro**: B
- **Hanh dong web**: timer moi giay; mark exercise complete → cap nhat `activeExercises`; stop → summary (time, calories, exercises[]) → callback `onWorkoutComplete` → App.jsx `handleWorkoutComplete` cap nhat streak neu >= 2 exercises
- **Vi tri moi**: thay bang `WorkoutSessionScreen` (MOB-404) + `sessionEngine` (MOB-403) deadline-based:
  - State machine: prepare → exercise → rest → next → finished.
  - Timer deadline-based (khong giam bien moi giay), pause luu `prevStatus`, resume giu dung thoi gian con lai, tick chi chuyen state 1 lan khi deadline het.
  - Bài theo reps: user bam "Xong hiệp". Bài theo time: auto-complete sau `durationSec`.
  - Cuoi buoi tap: KHONG chen rest vo nghia; bai cuoi cung → finished.
- **Audio cues** (MOB-404): expo-speech tieng Viet; fallback text-only neu thiet bi khong co voice `vi-*`.
- **Background** (MOB-403 + MOB-404): AppState listener auto-pause; restore tu checkpoint AsyncStorage.
- **History** (MOB-405, buildSessionSummary): ghi 1 record `WorkoutSession` khi FINISHED voi `status` ∈ {completed, endedEarly, skipped}; idempotent qua `markHistorySaved`.
- **Task**: MOB-403, MOB-404, MOB-405
- **Trang thai**: TODO

## FP-021 — PT Marketplace

- **Luong**: bottom nav tab "Cho PT"
- **File**: `PtMarketplace.jsx`
- **Vai tro**: M (member dat lich)
- **Muc**: 3 PT (Mai Xuan Tu, Nguyen Minh Khang, Pham Tan) voi avatar/rating/exp/price/spec/isVerified
- **Hanh dong**: tap info → mo profile; tap "Dat lich tap thu mien phi" → modal booking → chon date + time slot (09:00/10:30/14:00/16:30/19:00/20:30) → tao appointment voi status 'Doi xac nhan'
- **Task**: MOB-113

## FP-022 — Appointments calendar

- **Luong**: bottom nav / drawer → Appointments
- **File**: `Appointments.jsx`
- **Vai tro**: B
- **Muc**: lich thang, day cell click → modal chua cac appointment trong ngay
- **Hanh dong (PT)**: xac nhan / tu choi / da hoan thanh / tre / xoa
- **Hanh dong (Member)**: huy yeu cau (pending) / huy da hen / xoa lich su
- **Filter role**: line 55-60 — neu `isPt`, chi hien appointment co `ptName` = minh
- **Task**: MOB-114

## FP-023 — Appointment Booking (PT view)

- **Luong**: PT nhan notification appointment → xac nhan → cap nhat status
- **Cross-ref**: FP-022
- **Task**: MOB-114

## FP-024 — Profile (self + other)

- **Luong**: tap avatar/user → UserProfile overlay
- **File**: `UserProfile.jsx`
- **Vai tro**: B; member va PT co cac field khac nhau (xem audit)
- **Muc view**: avatar, ten, role, bio, height/weight/phone/birthday/gender, medical/allergies (member), training days/times, spec/exp/price/certificates (PT), posts list, mockReviews (PT only)
- **Muc edit**: bio, height/weight/phone/birthday/gender, training days, training times (hour+minute+AM/PM), spec (PT), exp (PT), price (PT)
- **Avatar picker**: 6 preset + upload file + reset default
- **Task**: MOB-115

## FP-025 — Friend UI state in Profile

- **Luong**: xem profile nguoi khac → them nut ban be
- **File**: `UserProfile.jsx` lines 1055-1128
- **State**: self | friend | sent | not-friend
- **Task**: MOB-115 (consume FP-007 service)

## FP-026 — Book PT from Profile

- **Luong**: Profile PT (not self) → button "Dat lich"
- **File**: `UserProfile.jsx`
- **Hanh dong**: modal booking → tao appointment voi date (min today) + 6 time slot
- **Task**: MOB-115

## FP-027 — Advanced profile (Chuyen Sau)

- **Luong**: Profile → "Cap nhat chuyen sau" → ChuyenSau/AdvancedProfile
- **File**: `ChuyenSau.jsx` (overlay trong UserProfile), `AdvancedProfile.jsx` (standalone screen)
- **Vai tro**: M self
- **Muc edit**: medicalCondition, allergies, trainingDays, trainingTimes (array)
- **Luu y**: 2 file co data shape khac nhe — `ChuyenSau` luu array, `AdvancedProfile` luu single string. Khi migrate gop thanh 1.
- **Task**: MOB-116

## FP-028 — PT Certificates modal

- **Luong**: Profile PT → "Chung chi" → PTCertificatesModal
- **File**: `PTCertificatesModal.jsx`
- **Vai tro**: P (self + admin simulate)
- **Muc**: list certificates (id/name/organization/issueDate/code/type/image), tap image → fullscreen
- **State**: unverified/pending/verified
- **Hanh dong self**: request verification, add cert
- **Hanh dong admin (simulate)**: approve / reset (test button)
- **Task**: MOB-117

## FP-029 — Messenger

- **Luong**: bottom nav / drawer → Messenger
- **File**: `Messenger.jsx`
- **Vai tro**: B
- **Muc**: danh sach ban be (co search) → tap → chat view → gui tin
- **Hanh dong**: send → them vao conversations[friendName]; cross-user qua `handleSendMessageCrossUser`
- **Optimistic**: 1 friend tu dong reply khi user gui (co 1 friend auto-reply logic trong seed)
- **Task**: MOB-118

## FP-030 — Auth (Login + Register)

- **Luong**: app start → Auth
- **File**: `Auth.jsx`
- **Vai tro**: —
- **Login**: email + password (min 6) → POST `/api/auth/login` (fallback usersDb)
- **Register member**: 2 buoc (form co ban + chon ngay tap)
- **Register PT**: 1 buoc (form day du)
- **Quick login**: user@fitmate.vn / pt@fitmate.vn voi password 123456
- **Luu y**: tat ca POST den `http://localhost:8080` se fail trong demo — phai fallback `usersDb`
- **Task**: MOB-119

## FP-031 — Withdraw modal (Reward points)

- **Luong**: Dashboard reward badge → Withdraw modal
- **File**: `Dashboard.jsx` lines 807-1070
- **Vai tro**: B (member + PT)
- **Muc**: voucher tab (4 voucher cung dinh) + withdraw tab (bank/account/name/amount)
- **Validation**: amount >= 50, amount <= rewardPoints
- **Hanh dong**: voucher "Doi ngay" → tru rewardPoints; withdraw submit → clear form + toast
- **Task**: MOB-120

## FP-032 — VIP modal

- **Luong**: drawer → VIP → VIP modal
- **File**: `Dashboard.jsx` lines 1075-1182
- **Vai tro**: M (member)
- **Muc**: 2 goi (1 thang, 12 thang)
- **Hanh dong**: mua → goi `onUpdateProfile({ role: 'VIP Hoi vien' })`
- **Task**: MOB-120

## FP-033 — Support modal

- **Luong**: drawer → Support
- **File**: `Dashboard.jsx` lines 1188-1303
- **Vai tro**: B
- **Hanh dong**: hien thi email, mo `mailto:` link (web API `window.open`)
- **Task**: MOB-120
- **Vi tri moi**: dung Linking.openURL('mailto:...') cua RN

## FP-034 — Status bar & phone chrome simulator

- **Luong**: Dashboard top
- **File**: `index.css` lines 90-130
- **Vai tro**: —
- **Noi dung**: gio (HH:mm), tin hieu, wifi, pin 88%
- **Vi tri moi**: KHONG can trong Android that (dung system status bar). Bo phan nay khi migrate.
- **Task**: doc ghi chu — KHONG can rebuild tren Android that

## FP-035 — Bottom navigation (5 tab)

- **Luong**: persistent bottom bar
- **File**: `App.jsx` lines 1571-1629
- **Muc**: Trang chu / Quet mon / Lich tap / Cong dong / Cho PT
- **Vi tri moi**: giu 5 tab, doi icon neu muon (lucide-react da co san, RN se convert qua lucide-react-native neu can)
- **Task**: MOB-101 (cung Dashboard shell)

## FP-036 — Phone emulator shell

- **Luong**: desktop frame 380x780px
- **File**: `index.css` lines 50-80
- **Muc**: border, notch, home indicator — chi de demo desktop
- **Vi tri moi**: KHONG can trong Android that
- **Task**: doc ghi chu

## FP-037 — Post seed data

- **Luong**: feed mac dinh
- **File**: `App.jsx` lines 1079-1185 (5 posts seed)
- **Vai tro**: B
- **Muc**: 5 post co author khac nhau, co isKnowledge, diem thuong gia lap
- **Task**: MOB-110

## FP-038 — Notification seed data

- **Luong**: notifications array default
- **File**: `App.jsx` lines 91-119
- **Vai tro**: B
- **Muc**: 2 friend_request + 1 streak + (PT) 1 appointment
- **Task**: MOB-103

## FP-039 — Friend requests cross-user flow

- **Luong**: A gui → B nhan → B accept/reject → ca hai cap nhat
- **File**: `App.jsx` lines 559-790
- **Task**: MOB-106

## FP-040 — User mock profiles (12 system users)

- **Luong**: search results
- **File**: `UserSearchModal.jsx` `ALL_SYSTEM_USERS`
- **Muc**: 12 users (4 PT, 4 member, 4 mentor)
- **Task**: MOB-105

---

## Summary tally (theo task)

- MOB-101 (Dashboard + Nav + Streak ring): FP-001, FP-002, FP-035
- MOB-102 (Drawer): FP-003
- MOB-103 (Notifications): FP-004, FP-038
- MOB-104 (Friend Requests): FP-005
- MOB-105 (User Search): FP-006, FP-040
- MOB-106 (Friend Service): FP-007, FP-039
- MOB-107 (Create Post): FP-008
- MOB-108 (Feed + Reactions + Comments + Reward + Toxic): FP-009, FP-010, FP-012
- MOB-109 (AI Companion): FP-011
- MOB-110 (Social Feed): FP-013, FP-037
- MOB-111 (Nutrition): FP-014, FP-015, FP-016
- MOB-112 (Workout): FP-017, FP-018, FP-019, FP-020
- MOB-401 (Nutrition layout): FP-014 (wrap/overflow)
- MOB-402 (Exercise model time/reps): FP-017, FP-020
- MOB-403 (sessionEngine): FP-017, FP-020
- MOB-404 (WorkoutSessionScreen + audio): FP-017, FP-020
- MOB-405 (sessionStorage + history): FP-020
- MOB-406 (vitest sessionEngine): FP-020
- MOB-113 (PT Marketplace): FP-021
- MOB-114 (Appointments): FP-022, FP-023
- MOB-115 (Profile + Friends + Book PT): FP-024, FP-025, FP-026
- MOB-116 (Chuyen Sau): FP-027
- MOB-117 (PT Certificates): FP-028
- MOB-118 (Messenger): FP-029
- MOB-119 (Auth): FP-030
- MOB-120 (Reward/VIP/Support): FP-031, FP-032, FP-033

VA: FP-034, FP-036 la shell chi danh cho web → KHONG migrate.
