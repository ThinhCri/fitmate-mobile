# Audit — Mobile code vs Docs (2026-09-18)

> Audit sau khi commit `39407e4` (Phase 1) + `6b01b24` (Phase 2) + `527d50d` (Phase 3).
> Muc dich: liet ke cac vi pham AGENTS.md va thieu chi tiet parity voi FP-XXX matrix.
>
> **Nhanh**: code structure + tokens + content schema ban dau OK, nhung rat nhieu logic/feature parity chua co. Voi 1 so FP (009, 010, 011, 014..020, 022, 024, 025, 027, 028, 029, 031..033, 040), code hien tai chi la PLACEHOLDER/STUB, khong phai implementation that.

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

## 7. Status task hien tai (sau audit)

**TODO that su** (chua code):
- F-1.2 BottomSheet
- F-3.1 Nutrition scan logic (FP-014)
- F-3.2 Workout drag-drop/timer (FP-017/020)
- F-3.4 Calendar grid (FP-022)
- F-3.5 Avatar picker (FP-024), Friend 4-state (FP-025)
- F-4.1 CreatePost image + link + knowledge validation (FP-008)
- F-4.2 Feed reactions/comments/reward simulation (FP-009/010)
- F-4.3 AI Companion chat list + typing + title edit (FP-011)
- F-4.4 Feed 5 seed (FP-013/037)
- F-4.5 ChuyenSau view mode + custom text (FP-027)
- F-4.6 Cert fullscreen + self/admin actions (FP-028)
- F-4.7 Messenger list + auto-reply (FP-029)
- F-5.2 Search mentor category (FP-006/040)
- F-5.4 Register member 2 buoc + validation (FP-030)
- F-5.5 Withdraw/VIP/Support polish (FP-031/032/033)

**SKELETON** (co code nhung chua day du):
- F-2.1 Dashboard streak tap +1 + toast (FP-001)
- F-3.1 Plan 7 ngay (FP-015)
- F-3.3 Marketplace 3 PT + dung time slot (FP-021)
- F-3.4 Appointments PT/Member actions (FP-022/023)
- F-4.6 Cert list render (FP-028 partial)

**DONE that su** (code + parity):
- F-1.1 Project setup (chua chay nhung code OK)
- F-1.3 Storage
- F-1.5 Navigation (5 tab + auth + modal groups)
- F-2.2 Drawer 7 item + logout (co the them Settings)
- F-2.3 Notifications 3 tab + unread
- F-3.5 Profile hero + edit field + tabs (FP-024/025/026 partial)
- F-5.1 Friends accept/reject cross-user (FP-005/007/039)
- F-5.3 Cross-user updateOtherUser
- F-5.4 Login (FP-030 partial)
