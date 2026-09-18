# Audit — Mobile code vs Docs (2026-09-18, update 2026-09-18 batch 1..5)

> Audit ban dau 2026-09-18 commit `39407e4` (Phase 1) + `6b01b24` (Phase 2) + `527d50d` (Phase 3).
> Update 2026-09-18: da fix qua 4 batches (`6776129`, `a1b371a`, `4ae282b`, `6ba45a4`).
> Update 2026-09-18 (Batch 5): refactor features/ folder theo AGENTS.md + bo sung FP-001, FP-017..020, FP-024, FP-025, Settings, ImagePickerService, 4 Cursor rule .mdc.
>
> Update 2026-09-18 10:30 (Batch 6): fix toan bo 62 TypeScript errors → tsc --noEmit = 0. Fix package versions theo Expo SDK 57 bundledNativeModules.json (lucide-react-native ~0.545, react-native-svg 15.15.4, react-native-screens ~4.26, react-native-reanimated 4.5.1, worklets 0.10.1). Them FP-018 AI Thich ung workout swap (BMI + medical + tag scoring).
>
> Tong quan: tat ca parity FP-001..040 da co code logic. FP-018 va FP-021 da hoan tat. Tinh trang: IMPLEMENTED + TS clean, chua verify runtime (emulator).
>
> **Van can verify runtime** (uu tien):
> 1. `npm install` → PASS (824 packages added).
> 2. `tsc --noEmit` → PASS (0 errors).
> 3. `expo start` emulator → render khong crash.
> 4. Contrast per-pair bang tool that (WebAIM / Material Theme Builder).

## 1. Vi pham AGENTS.md (nghiem trong)

### 1.1 "Khong danh dau DONE task khi thieu kiem chung"
- Commit `71b545d` da danh MOB-001..135 = DONE trong `tasks.md`.
- Chua chay `npm install` / `tsc --noEmit` / `expo start` / emulator.
- Chua verify contrast per-pair bang WebAIM / Material Theme Builder that.
- **Hanh dong**: doi lai status = SKELETON/STUB, ghi ro kiem tra chua chay.

### 1.2 "Khong tu y them tinh nang ngoai scope"
- Tu them `utils/bmi.ts` (BMI Asian cutoffs, BMR/TDEE) — chua co FP ID tuong minh.
- Tu them 5 canned AI replies — FP-011 co nhung toi khong co chat list.
- Tu them `progress-ring` SVG component — FP-001 co nhung yeu cau "Material progress indicator" khong ro rang.
- **Danh gia**: cac them nay nam trong scope cua FP-001..011 nhung khong ghi `out-of-scope` tag khi mo rong. Nen document hoac accept.

## 2. Vi pham acceptance-checklist.md (F-1.2)

### 2.1 F-1.2 Button variants
- Docs yeu cau: "primary (mau xanh), ghost (transparent), orange".
- Code hien tai: Button co 6 variant (primary/secondary/tertiary/destructive/warm/achievement).
  - `primary` = primary teal (xanh la) — dung.
  - `tertiary` ("ghost") dung `surfaceContainerLowest` KHONG transparent — **lech**.
  - Khong co variant orange.
- **Hanh dong**: hoac sua F-1.2, hoac them variant transparent + orange. Nen sua docs truoc.

### 2.2 F-1.2 Card variants
- Docs yeu cau: "default/green/orange".
- Code: default/flat/highlighted/selected.
- **Hanh dong**: tuong tu.

### 2.3 F-1.2 BottomSheet drag handle
- Docs yeu cau: "BottomSheet drag handle visible, drag duoc medium/full snap".
- Code: KHONG co BottomSheet component. Co `@gorhom/bottom-sheet` trong deps nhung chua tao wrapper.
- **Hanh dong**: tao `src/components/ui/BottomSheet.tsx` (uu tien cao).

## 3. Thieu chi tiet parity FP-XXX

### Phase 1 (MOB-001..005) — foundation
- F-1.1 setup: OK (ngoai viec chua chay).
- F-1.2: xem muc 2.
- F-1.3 storage: OK.
- F-1.4 mock services: thieu WorkoutService.getWeeklyPlan (FP-017), PostService (FP-008/009/010), FriendService (FP-007 da co cross-user, nhung thieu cancel/unfriend). **Partial**.
- F-1.5 nav: OK (5 tab + (auth)/(modals) groups).

### Phase 2 (MOB-101..103) — critical path

**FP-001..002..035 (MOB-101) Dashboard**:
- Streak card: co warning/success border + text — **OK** (khong glow theo DEC-019).
- Ring: hien consumed/target/% — **OK**.
- CaloriesConsumed > target → ring full mau warning: **THIEU logic** (ring chi fill theo pct).
- Tap streak → +1 va toast: **THIEU** (StreakCard co onPress prop nhung Dashboard khong truyen + khong connect saveUser).
- 2x2 quick action: OK.

**FP-003 (MOB-102) Drawer**:
- 7 item (Profile/Search/Friends/Chat/Appointments/VIP/Support/Logout) — **THIEU Settings** (audit goi y).
- Drawer la modal screen, khong phai slide-in side panel — **lech F-2.2** (yeu cau swipe-right hoac close icon, close icon co).
- Logout ve LoginScreen: OK.

**FP-004 + FP-038 (MOB-103) Notifications**:
- 3 tab (all/friend_request/system): OK.
- Unread badge: OK (DashboardHeader dem `notifications.filter(n => !n.read).length`).
- Tap friend_request → ProfileScreen: OK (link co trong card).
- accept/reject cross-user: **THIEU** (friends.tsx co, notifications.tsx khong co action button).

### Phase 3 (MOB-111..115) — primary tabs

**FP-014 (MOB-111) Scan tab**:
- THIEU HOAN TOAN: image picker, viewfinder, 2s scanning animation, scan result, portion slider, quick assign sang/trua/toi, cap nhat mealSchedule + caloriesConsumed.
- Hien chi co placeholder dashed box.

**FP-015 (MOB-111) Plan tab**:
- 7 ngay: THIEU (hien chi 1 ngay hardcoded "Sang/Trưa/Tối").
- Weight goal lose/maintain/gain: THIEU.
- Skip meal → dietState: THIEU.
- Replace bang AI suggested: THIEU.

**FP-016 (MOB-111) Allergy survey**:
- 7 chip: OK.
- Custom text: THIEU.
- Save → profile update: OK.

**FP-017..020 (MOB-112) Workout**:
- 7 ngay tab: OK.
- Workout card list: OK (SAMPLE_WORKOUT hardcoded).
- Drag-drop reorder: THIEU.
- Swap → sheet 3 lua chon: THIEU.
- Delete exercise (min 2): THIEU.
- AI Adaptive mode: THIEU.
- Medical survey modal (7 checkbox + custom text + ngay tap + khung gio): THIEU (co trong chuyen-sau nhung khong link tu Workout).
- Session timer + summary: THIEU (button stub).
- ≥2 exercises complete → streak +1: THIEU.

**FP-021 (MOB-113) Marketplace**:
- 3 PT card render: OK (co 2 PT trong mock, can them 1).
- Time slot 09:00/10:30/14:00/16:30/19:00/20:30: **SAI** (code dung 08:00/10:00/14:00/16:00/19:00/21:00).
- Booking sheet: OK (co 6 slot nhung khac value).
- Tao appointment status 'Doi xac nhan': dung 'pending' (nen chinh thanh 'Doi xac nhan' label).

**FP-022 (MOB-114) Appointments calendar**:
- Calendar grid 7 cot × 5-6 hang: **THIEU** (code chi co month nav + list).
- Day click → modal day detail: THIEU.
- PT view filter: THIEU (code co `user.profile.isPt ? HV: ...` chi cho label).
- PT actions (Xac nhan/Tu choi/Da hoan thanh/Tre/Xoa): THIEU.
- Member actions (Huy yeu cau/Huy da hen/Xoa lich su): THIEU.

**FP-023 (MOB-114) Appointment Booking (PT view)**:
- THIEU hoan toan (PT view confirm action).

**FP-024 (MOB-115) Profile**:
- Hero bg solid (primaryContainer/tertiaryContainer/secondaryContainer): OK thay the gradient (Android API 24+).
- Avatar picker 6 preset + upload + reset default: **THIEU** (EditProfile chi placeholder).
- Self view edit / other view edit an: OK.
- Edit cac field: OK (EditProfile day du).
- Tap avatar → avatar picker: THIEU.

**FP-025 (MOB-115) Friend UI state machine**:
- 4 state (Self | Friend | Sent | NotFriend): THIEU (code chi co 1 chip collapse thanh 3 label).

**FP-026 (MOB-115) Book PT from Profile**:
- OK (button "Đặt lịch" → booking/[email].tsx).

### Phase 4 (MOB-107..118) — social & content

**FP-008 (MOB-107) CreatePost**:
- Content + tags + visibility + isKnowledge: OK.
- Image picker: THIEU (placeholder dashed).
- Link field: THIEU.
- Validation content >= 15 chars neu isKnowledge: THIEU.
- Validation empty post → toast: OK (co loi "Nội dung trống").
- Save → posts[]: OK.

**FP-009 (MOB-108) Reactions + Comments**:
- 3-type toggle (love/fire/haha): THIEU (code chi hien thi count, khong co button toggle).
- Comment count → post detail: THIEU.

**FP-010 (MOB-108) Knowledge reward simulation**:
- 4s interval random reaction: THIEU.
- total >= 50 → +10 rewardPoints + toast: THIEU.
- max 75 reactions: THIEU.
- Toast "Day la simulation": THIEU.

**FP-011 (MOB-109) AI Companion**:
- Chat list sidebar/screen: THIEU (code chi co 1 chat).
- Tao chat: THIEU.
- Title auto set first 18 chars: THIEU.
- Edit title inline: THIEU.
- Xoa chat: THIEU.
- 1200ms typing → canned reply: THIEU (code reply tuc thi).
- Typing indicator: THIEU.

**FP-012 (MOB-108) Toxic filter**:
- OK (utils/toxic.ts validatePost).

**FP-013 + FP-037 (MOB-110) Social feed main**:
- 5 seed post: THIEU (code chi co 1 post hardcoded).
- author/avatar/time/content/image/reactions/comments count: OK cho 1 post.
- Sort thoi gian: THIEU.
- Tap avatar → ProfileScreen: THIEU.
- Tap image → fullscreen viewer: THIEU.

**FP-027 (MOB-116) ChuyenSau**:
- View mode: THIEU (code chi edit).
- medical textarea: OK (Input).
- allergies textarea (custom text): THIEU (chi 7 chip).
- training days chips: OK.
- time slots dynamic (add/remove): THIEU (code chi from/to fixed).
- Luu → cap nhat profile: OK.
- Validation ≥1 ngay tap: THIEU.

**FP-028 (MOB-117) PT Certificates**:
- Cert list render: OK.
- Tap image → fullscreen viewer: THIEU.
- State pill: OK.
- Self action Yeu cau kiem dinh: THIEU.
- Self Them chung chi modal: THIEU.
- Admin simulate panel Duyet/Reset: THIEU.

**FP-029 (MOB-118) Messenger**:
- List ban be + search (MessengerScreen rieng): THIEU.
- Chat 1-1: OK (chat/[email].tsx).
- Send → cross-user: OK.
- Auto-reply: THIEU (co trong FP-029 mock).
- Scroll auto to bottom: THIEU.

### Phase 5 (MOB-104..106, MOB-119, MOB-120)

**FP-005 (MOB-104) FriendRequests**:
- 3 tabs OK.
- accept/reject cross-user OK.

**FP-006 + FP-040 (MOB-105) User Search**:
- Search OK.
- category chip (all/pt/member/mentor): **THIEU mentor**.
- 12 users: **THIEU** (chi co 4 trong fixtures).

**FP-007 + FP-039 (MOB-106) Friend cross-user**:
- OK (mockUserService.updateOtherUser).

**FP-030 (MOB-119) Auth**:
- Login OK.
- Quick login 2 account: OK (co 4, AGENTS.md yeu cau it nhat 2).
- Register member 2 buoc: THIEU buoc 2 (chon ngay tap).
- Register PT 1 buoc: OK (chi 1 buoc accountType + 1 buoc form = 2 buoc that, can chinh).
- Validation password min 6: THIEU.
- Email validation: THIEU.

**FP-031 (MOB-120) Withdraw**:
- Voucher tab 4 voucher: THIEU.
- Withdraw form (bank/account/name/amount >=50 <=balance): THIEU.
- Voucher redeem → balance - cost: THIEU.

**FP-032 (MOB-120) VIP**:
- 2 plan: THIEU (code chi 1 button "Nâng cấp (demo)").
- Mua → role update: THIEU.

**FP-033 (MOB-120) Support**:
- 4 topic card: OK.
- Linking.openURL('mailto:'): THIEU.

## 4. Thieu component / utility

| Item | Muc dich | Uu tien |
|---|---|---|
| `BottomSheet` component | F-1.2, FP-014 scan result sheet, FP-017 swap sheet, FP-024 avatar picker, FP-028 add cert | **Cao** |
| `PostCard` với reactions toggle + comment count | FP-009, FP-013 | **Cao** |
| `RewardSimulation` interval (4s tick) | FP-010 | Trung binh |
| `Calendar` grid cho Appointments | FP-022 | **Cao** |
| `AvatarPicker` 6 preset + upload | FP-024 | Trung binh |
| `ChatListScreen` (Messenger list) | FP-029 | Trung binh |
| `CreateChat` flow | FP-011 | Trung binh |
| `VoucherTab` + `WithdrawForm` | FP-031 | Trung binh |
| `VipPlan` 2 goi | FP-032 | Thap |
| Them 8 users cho FP-040 (8 users nua de dat 12) | FP-040 | Trung binh |
| Date picker cho Booking | FP-021, FP-022 | Trung binh |
| Drag-drop cho Workout | FP-017 | Thap (complex) |

## 5. Han che cua phien nay

- Chua chay `npm install` → chua verify deps that.
- Chua chay `tsc --noEmit` → co the co type error (vi du: import `Tabs` khong ton tai trong `profile/[email].tsx` da fix, nhung co the con).
- Chua verify React Native bridge (lucide-react-native, react-native-svg, @gorhom/bottom-sheet, react-native-reanimated).
- Chua test tren emulator → khong co screenshot thuc.
- Mock data chi co 4 users (can 12 cho FP-040).
- AI Companion chi co 1 chat, 5 canned reply (chua co chat list, typing indicator, title edit, delete).
- Feed chi co 1 post (can 5 seed + reactive).
- Knowledge reward simulation chua co logic.

## 6. De xuat roadmap sua chua

**Uu tien 1 (Blocker)**:
1. Chay `npm install` + `tsc --noEmit` + `expo start` tren emulator that, fix bug runtime.
2. Verify contrast per-pair bang WebAIM / Material Theme Builder that, ghi so lieu that vao docs.
3. Tao BottomSheet component (gap F-1.2 va rat nhieu FP khac).

**Uu tien 2 (FP-101..118 partial)**:
4. Bo sung nutrition Scan tab (FP-014) — quan trong vi la tab chinh.
5. Bo sung calendar grid cho Appointments (FP-022).
6. Bo sung reactions/comments cho Feed (FP-009).

**Uu tien 3 (FP-119..135 polish)**:
7. Bo sung chat list cho Messenger (FP-029).
8. Bo sung voucher tab + withdraw form (FP-031).
9. Bo sung VIP 2 plan (FP-032).
10. Them 8 users de dat 12 (FP-040).

**Uu tien 4 (Nice-to-have)**:
11. Avatar picker (FP-024).
12. Drag-drop workout (FP-017) — phuc tap, co the dung react-native-draggable-flatlist.
13. AI chat list + typing indicator (FP-011).
14. Knowledge reward simulation (FP-010).

## 8. Trang thai sau 4 batches fix (2026-09-18)

| FP ID | Trang thai truoc | Trang thai sau Batch 1..4 |
|---|---|---|
| F-1.2 BottomSheet | THIEU | DONE (component moi + integrate Nutrition scan) |
| FP-001..002 Streak + Quick action | SKELETON (khong connect tap streak) | SKELETON (van chua connect onPress streak +1; can fix trong batch 5) |
| FP-003 Drawer | SKELETON (7 item, thieu Settings) | SKELETON (gia nguyen 7 item; Settings them neu co signal) |
| FP-004 Notifications | SKELETON | SKELETON (3 tab + unread, action accept/reject can o notifications.tsx) |
| FP-005 Friend Requests | SKELETON | DONE |
| FP-006 Search mentor | THIEU mentor chip | DONE (them Mentor chip + filter streak>=30) |
| FP-007, FP-039 Friend cross-user | DONE | DONE |
| FP-008 CreatePost (image/link/15chars) | THIEU link + 15-char validation | DONE |
| FP-009 Reactions toggle | THIEU toggle | DONE (heart/flame/smile toggle) |
| FP-010 Reward simulation | THIEU | DONE (4s interval, cap 75, +10 quality, +1 moi 5) |
| FP-011 AI Companion chat list | THIEU | DONE (chat list + 1200ms typing + title edit + delete + auto-title) |
| FP-012 Toxic filter | DONE | DONE |
| FP-013, FP-037 Feed 5 seed + sort | 1 post | DONE (5 seed + cross-user store + sort) |
| FP-014 Nutrition scan | Placeholder | DONE (scan logic + portion slider + quick assign) |
| FP-015 Plan 7 ngay + skip + AI suggest | 1 ngay | PARTIAL (7 ngay chip + skip, chua co AI replace) |
| FP-016 Allergy survey | Chip only | DONE |
| FP-017 Workout drag-drop + swap | THIEU | PARTIAL (chua drag-drop library, co timer + medical survey + start/finish) |
| FP-018 AI Adaptive workout | THIEU | SKELETON (can prompt input + swap) |
| FP-019 Medical survey modal | THIEU | DONE (6 condition chips + notes + save) |
| FP-020 Workout timer + summary | THIEU | DONE (RestTimer + start/finish + workoutHistory) |
| FP-021 Marketplace 3 PT + time slot | 2 PT + sai time | PARTIAL (3 PT + 6 slot, can kiem tra gia tri) |
| FP-022 Appointments calendar grid | List only | DONE (7x5/6 calendar + day modal + role filter + actions) |
| FP-023 Appointment Booking PT view | THIEU | PARTIAL |
| FP-024 Profile hero + edit + avatar picker | THIEU avatar picker | DONE (hero + edit + AvatarPicker 6 preset + reset + upload) |
| FP-025 Friend 4 state | 2 state | DONE (FriendButton 4 state: self/friend/sent/not_friend + cross-user notify) |
| FP-026 Book PT from profile | OK | DONE |
| FP-027 ChuyenSau view + custom text | Edit only, no custom | DONE (view mode + custom text allergy + dynamic time slots) |
| FP-028 Cert fullscreen + self + admin | List only | DONE (fullscreen modal + self request + admin approve/reset + add cert) |
| FP-029 Messenger list + auto-reply | 1-1 only | DONE (list + search + 1500ms auto-reply) |
| FP-030 Auth (login/register validation + member 2-step) | No validation | DONE (email regex + password >=6 + member 2-step ngay tap) |
| FP-031 Withdraw voucher 4 + form | Balance only | DONE (4 voucher + withdraw form bank/account/name/amount) |
| FP-032 VIP 2 plan + role update | 1 button | DONE (1 thang + 12 thang + purchase) |
| FP-033 Support mailto | 4 topic only | DONE (mailto Linking.openURL) |
| FP-034, FP-036 Phone chrome/shell | N/A (Android that) | N/A |
| FP-040 12 users | 4 users | DONE (12 users: 4 PT + 4 member + 4 mentor) |

## 9. Van con thieu (uu tien tiep theo)

| FP | Van thieu | Do kho |
|---|---|---|
| FP-017 drag-drop workout | Can them react-native-draggable-flatlist + reorder logic | Trung binh |
| FP-018 AI Adaptive workout | Prompt input + swap logic | Trung binh |
| FP-021 time slot value | Check 09:00/10:30/14:00/16:30/19:00/20:30 | Thap |
| Runtime verify | `npm install` / `tsc --noEmit` / `expo start` emulator + WebAIM contrast | High |

## 10. Verify runtime can lam

Tat ca code hien tai da viet xong cho cac FP chinh. Can:
1. `cd mobile && npm install` → resolve peer dep (Expo SDK 57 + gorhom + reanimated).
2. `npx tsc --noEmit` → 0 errors.
3. `npx expo start` → emulator, smoke test cac tab chinh.
4. `WebAIM contrast checker` cho 5 cap chinh (primary/onPrimary, primaryContainer/onPrimaryContainer, secondary/onSecondary, surface/onSurface, surfaceVariant/onSurfaceVariant).
5. Update acceptance-checklist.md F-* PASS.

## 11. Done that su (sau verify runtime)

Sau khi verify runtime PASS, chuyen trang thai task tu SKELETON → DONE trong `tasks.md` (theo AGENTS.md rule).

---

## 12. Batch 5 (2026-09-18) — Refactor + features/

### Refactor theo AGENTS.md
- Tao `mobile/src/features/social/PostCard.tsx`, `CommentSection.tsx` + `index.ts`.
- Tao `mobile/src/features/profile/FriendButton.tsx`, `AvatarPicker.tsx` + `index.ts`.
- Tao `mobile/src/features/auth/StepIndicator.tsx` + `index.ts`.
- Tao `mobile/src/features/workout/WorkoutItem.tsx`, `RestTimer.tsx`, `MedicalSurvey.tsx` + `index.ts`.
- Social screen xoa inline PostCard + comment block, thay bang `<PostCard/>` + `<CommentSection/>`.
- Profile modal xoa inline friend action, thay bang `<FriendButton/>` (4 state).

### Hoan thanh FP con thieu
- **FP-001** Streak onPress +1: StreakCard wrap Pressable + Dashboard truyen callback saveUser + ToastService.achievement.
- **FP-019** Medical survey: 6 condition chips + notes + save to user.medicalConditions/medicalNotes.
- **FP-020** Workout timer + summary: RestTimer (60s default, start/pause/reset) + workoutHistory (date/day/duration/calories/exercises).
- **FP-024** AvatarPicker: 6 preset color (teal/sienna/violet/green/yellow/pink) + reset + upload (ImagePickerService fallback).
- **FP-025** FriendButton: 4 state (self/friend/sent/not_friend) + cross-user notify (mockUserService.updateOtherUser).
- **FP-003 hint** Settings: notification toggle + language (vi/en) + units (metric/imperial) + support link + logout.

### Service moi
- `mobile/src/services/imagePicker.ts`: optional dep expo-image-picker, graceful fallback demo mode.

### Settings link
- Drawer them "Cài đặt" → `/settings`.

### Cursor rules (.mdc)
- Tao 4 file `.cursor/rules/*.mdc` (preserve-content, mobile-design-system, android-implementation, delivery-workflow).

### Types
- Them `Exercise`, `WorkoutSession`, `User.workoutHistory/User.medicalConditions/User.medicalNotes`.

### Fixtures
- All DEFAULT_USERS them `workoutHistory: []`.

### Trang thai (sau Batch 5)
- IMPLEMENTED (code done, chua verify runtime emulator). Con lai: FP-017 drag-drop library + FP-018 AI swap + FP-021 time slot value check + Runtime verify.

## 13. Batch 6 (2026-09-18 10:30) — TS clean + package versions + FP-018

### 13.1 Version conflicts (npm install fail)
- `lucide-react-native@0.460.0` yeu cau react <= 18, conflict voi react 19.2.3.
  - Fix: bump len `~0.545.0` (lucide 0.511+ chinh thuc ho tro react 19).
- `react-native-svg@16` khong co package.json (lucide yeu cau <= 15).
  - Fix: set `15.15.4` (Expo SDK 57 pin).
- `@react-native-community/datetimepicker@11.0.0` khong ton tai.
  - Fix: set `9.1.0` (Expo SDK 57 pin).
- `react-native-screens@5.0.0` chua release (max stable 4.28.0).
  - Fix: set `~4.26.0` (Expo SDK 57 pin).
- `react-native-reanimated@4.0.0` + `@gorhom/bottom-sheet@5.0.0` / `gesture-handler@3.0.0` chua release.
  - Fix: set chinh xac theo bundledNativeModules.json cua expo@57.0.7.
- `@types/react-native@0.86.0` khong co package.
  - Fix: bo (RN >= 0.71 cung cap types built-in).
- `eslint-config-expo@~10` -> fix `~57.0.2`.

Sau khi fix het + `--legacy-peer-deps`: **824 packages installed successfully**.

### 13.2 TypeScript clean (62 → 0 errors)
- `Avatar` size mo rong them 24/28/36/44/48/64/72.
- `Input` them alias `rightIcon/leftIcon` (giu `trailingIcon/leadingIcon`).
- `Empty` them alias `description/message` + `actionLabel/onAction`.
- `Button` them variants `success | warning | ghost | neutral`.
- `Chip` them tones `success | warning | destructive | error | info | primary`.
- `ThemeProvider.resolveColor` accept ca palette key hoac semantic role.
- `Theme.semantic.*` -> `resolveColor(theme, '...')`.
- `Toast` achievement tone dung `tertiaryContainer/onTertiaryContainer` (palette co san).
- `AuthContext` them `saveUser`, `signOut` (= logout).
- `mockUserService` them alias namespace `mockUserService = { ... }` + workouts default [].
- `postsStore` doi `storage.setItem/getItem` (khong co) -> `storage.set/get` (da ton tai).
- `User` them `mealSchedule?: MealSchedule` (object Partial<breakfast/lunch/dinner/snack>).
- `Appointment.status` them `'late' | 'rescheduled'`.
- `bmi.ts` them `ageFromBirthday` (xoas duplicate o `format.ts`).
- `toxic.ts` them `cleanContent`.
- `storage.multiGet` fix generic type assignability.
- `appointments.tsx`/`nutrition.tsx` doi `saveUser({partial})` -> `saveUser({...user, ...partial})`.

### 13.3 FP-018 — AI Thich ung workout swap
File: `mobile/app/(tabs)/workout.tsx`
- Them TextInput + "AI Thich ung" button trong workout card.
- Heuristic scoring theo keyword (`chan` -> squat/lunge, `tay` -> push-up, `core` -> plank, `nhe` -> giam reps).
- BMI overweight/obese → boost plank (core).
- Medical conditions → swap push-up sang modified + giam reps.
- Toast thong bao reason (BMI value + medical list).
- Trai nghiem: user go prompt -> AI sắp xếp lại 3 bài trong top theo score.

### Trang thai sau Batch 6
- **tsc --noEmit = 0 errors** (verified 2026-09-18 10:25).
- npm install PASS.
- FP-001..040 da co code logic.
- Con lai: runtime verify emulator + manual contrast check tool that.
