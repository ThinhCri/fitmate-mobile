# Acceptance Checklist — Kich ban & tieu chi nghiem thu

> **PROTOTYPE CHECKLIST:** các case tăng streak bằng tap, mock auth/localDb, demo reward/AI/payment và yêu cầu commit tự động không phải acceptance production. Với MOB-800..808, dùng `../production/integration-plan.md`, kế hoạch task tương ứng và `../design/stitch-react-native-rules.md`. Không đánh DONE/VERIFIED khi user chưa chạy lệnh và UAT/API gate chưa có evidence.

> Moi kich ban lien ket parity ID (FP-XXX) + task ID (MOB-XXX). AI chi set DONE khi tat ca case cua task lien qua PASS.

**Convention trang thai**:
- ✓ PASS
- ✗ FAIL (ghi ly do)
- N/A (khong ap dung task nay)

**Rule**: khong check DONE khi con FAIL; neu co FAIL ma khong sua duoc, set status BLOCKED va ghi ro.

---

## Phase 1 — Foundation (MOB-001..005)

### F-1.1 Mobile project setup (MOB-001)
- [ ] `mobile/` duoc tao voi Expo + TS.
- [ ] `npm run android` mo simulator/dev.
- [ ] Type-check PASS (`tsc --noEmit`).
- [ ] ESLint PASS.
- [ ] Folder structure (theme / features / services) khop docs.
- [ ] Nếu user đã yêu cầu commit: commit đúng scope; nếu chưa, ghi `NOT COMMITTED — awaiting user instruction`.

### F-1.2 Tokens & primitives (MOB-002)
- [ ] Tokens file import thanh cong.
- [ ] Button primary render mau xanh, ghost render transparent, orange render vang cam.
- [ ] Input focus state co border + glow primary.
- [ ] Chip selected state bg primary + dark text.
- [ ] Card variants (default/green/orange) visual chinh xac.
- [ ] Avatar hien thi image; neu khong co URL → initials.
- [ ] BottomSheet drag handle visible, drag duoc medium/full snap.

### F-1.3 Storage (MOB-003)
- [ ] AsyncStorage wrapper get/set/remove/clearAll PASS.
- [ ] Tai khoi dong app, data duoc persist qua session.
- [ ] Logout clearAll nhung giu lai default users.

### F-1.4 Mock services (MOB-004)
- [ ] AuthService.login/login fail case PASS.
- [ ] UserService.search users + filter PASS.
- [ ] WorkoutService.getWeeklyPlan PASS.
- [ ] FriendService.sendRequest cross-user PASS (verify user B sau khi A gui).

### F-1.5 Navigation (MOB-005)
- [ ] Auth gate: chua login → Login; login → Tabs.
- [ ] Tabs switch khong reset.
- [ ] Modal/Drawer back X + Android hardware back PASS.
- [ ] Drawer open/close PASS.

---

## Phase 2 — Critical path (MOB-101..103)

### F-2.1 Dashboard + Streak + Ring (MOB-101)
- Vai tro: ca 2.
- Buoc: launch app → login → tap tab Trang chu.
- Ket qua mong doi:
  - Streak card hien thi "X ngày" voi glow cam neu chua dat target.
  - Ring hien thi consumed/target/%; cap nhat khi them calo tu Nutrition.
  - 2x2 quick actions click → navigate sang tab tuong ung.
- Edges:
  - Streak = 0 → CTA "Bắt đầu streak!".
  - CaloriesConsumed > target → ring full mau cam warning.
- Tap streak card → +1 va toast "Tuyet voi!".

### F-2.2 Drawer (MOB-102)
- [ ] Drawer open tu hamburger icon.
- [ ] Drawer close bang swipe-right hoac close icon.
- [ ] Moi menu item navigate dung screen / mo dung modal.
- [ ] Logout → ve LoginScreen + clear stack.

### F-2.3 NotificationsScreen (MOB-103)
- [ ] Tab segments (all/friend_request/system) loc dung.
- [ ] Unread badge dem chinh xac.
- [ ] Friend_request item có accept/reject → cross-user cap nhat.
- [ ] Mark as read → badge -1.

---

## Phase 3 — Other primary tabs (MOB-111..115)

### F-3.1 NutritionScreen (MOB-111 + MOB-401 layout)
- [ ] Segmented scan/plan switch PASS.
- [ ] Scan tab: image picker mo dialog → chon → 2s "scanning" → hien thi mon.
- [ ] Image container khong bi tran border qua goc Card (MOB-401).
- [ ] Nut "Chụp ảnh" + "Tải lên" chia deu chieu rong, wrap khi font scale lon (MOB-401).
- [ ] Portion slider scale calo real-time.
- [ ] 7 chip khau phan (0.5x..2x) wrap nhieu dong trong BottomSheet (MOB-401).
- [ ] 3 nut "Sáng/Trưa/Tối" chia deu chieu rong, wrap khi font scale lon (MOB-401).
- [ ] BottomSheet content co padding bottom du (khong bi che boi nav bar).
- [ ] Quick assign sang/trua/toi → cap nhat `mealSchedule` + `caloriesConsumed` (Dashboard se thay doi ring).
- [ ] Plan tab: chon ngay → render 3 bua, ten mon + calo.
- [ ] Skip meal → dietState chuyen thanh 'skipped_breakfast'.
- [ ] Allergy sheet: chon items + custom → luu → profile update.
- [ ] Tren man hinh nho 360dp + tablet 600dp + font scale 1.5x: khong co control nao bi tran/can.

### F-3.2 WorkoutScreen + WorkoutSessionScreen (MOB-112, MOB-402..406)
- [ ] Day ribbon switch → hien thi dung ngay.
- [ ] Workout card list (reps-based): hien "4 hiệp × 12 reps". Plank (time-based) hien "3 hiệp × 0:45" thay vi "1 reps" (MOB-402).
- [ ] Push-up co the hien "Video: Pixabay (CC0)" trong WorkoutSessionScreen notes (MOB-404).
- [ ] "Bắt đầu tập" → push sang `/workout-session` (MOB-404).
- [ ] WorkoutSessionScreen hien thi status badge, ten bai, hiep, timer/reps count.
- [ ] Auto-advance: prepare (5s) → exercise → rest → next set/next exercise → finished (MOB-403).
- [ ] Bài theo time (Plank): auto-complete sau 45s, chuyen sang rest hoặc next bai (MOB-403).
- [ ] Bài theo reps (Push-up): hien so reps, nguoi dung bam "Xong hiệp" de complete (MOB-404).
- [ ] Pause: timer dung, badge "Tạm dừng", "Tiep tuc" khoi phuc dung thoi gian con lai (MOB-403).
- [ ] Skip rest: chuyen ngay sang set/bai tiep theo (MOB-404).
- [ ] Skip exercise: ghi tat ca hiep con lai la `skipped`, chuyen bai tiep (MOB-403).
- [ ] Skip set: ghi `skipped` cho hiep do, advance (MOB-403).
- [ ] Audio cues (expo-speech tieng Viet): "Bắt đầu hiệp" / "Sắp hết" / "Nghỉ" / "Hiệp tiếp theo" / "Hoàn thành" (MOB-404). Neu thiet bi khong co voice `vi-*` → fallback text-only + thong bao UI.
- [ ] Audio toggle: tat → Speech.stop() + khong cue nua.
- [ ] App background → auto-pause; resume → khoi phuc dung status (MOB-404).
- [ ] Hardware back → confirm dialog neu dang tap (MOB-404).
- [ ] Repeat tick() qua deadline: state transition chi 1 lan (verified vitest MOB-406).
- [ ] Restore tu checkpoint: mo session moi khi chua clear → khoi phuc state, hien "Đã khôi phục phiên tập" (MOB-405).
- [ ] Khi FINISHED: ghi 1 record `WorkoutSession` voi `status` ∈ {completed, endedEarly, skipped}; khong ghi trung khi bam "Kết thúc sớm" 2 lan (MOB-405).
- [ ] Calorie uoc luong ghi ro "ước tính" trong toast summary (MOB-405).
- [ ] Cuoi buoi tap (last set last exercise): KHONG chen rest vo nghia → `status = finished` luon (MOB-403).
- [ ] "Kết thúc sớm": confirm → ghi remaining sets la `skipped`, status `endedEarly` (MOB-405).
- [ ] Timer cleanup: roi man hinh hoac finish → raf + Speech.stop() + listeners cleared (MOB-404).
- [ ] AI Thích ứng (FP-018): nhan prompt "nhe" + medical → chi giam reps cho bai `type:'reps'`, KHONG giam `durationSec` (MOB-402).
- [ ] ≥2 exercises complete → streak +1 (F-3.2 goc).

### F-3.2a sessionEngine unit tests (MOB-406)
- [ ] `npm test` PASS — 13 cases PASS (start, prepare→exercise, reps wait, time auto, last-set-last-exercise, pause/resume, skipRest, skipExercise, endEarly, skipCurrentSet, repeated tick, overallProgress, serialize/restore).

### F-3.3 MarketplaceScreen (MOB-113)
- [ ] 3 PT card render (avatar + rating + exp + spec).
- [ ] Tap CTA "Dat lich" → BookingSheet.
- [ ] Sheet chon date (>= today) + 6 time slot → submit → tao appointment status 'Doi xac nhan'.
- [ ] AppointmentsScreen hien thi lich moi (xem MOB-114).

### F-3.4 AppointmentsScreen (MOB-114)
- [ ] Calendar render thang dung (grid 7 cot, 5-6 hang).
- [ ] Day click → modal → list appointment trong ngay.
- [ ] PT view: filter chi hien appointment co ptName = minh.
- [ ] Member view: tat ca.
- [ ] PT action buttons (Xac nhan / Tu choi / Da hoan thanh / Tre) update status + persistence.
- [ ] Member action buttons (Huy yeu cau / Huy da hen / Xoa lich su) PASS.

### F-3.5 ProfileScreen (MOB-115)
- [ ] Hero gradient xanh cho member, blue cho PT verified, vang cho pending.
- [ ] Avatar tap → avatar picker sheet (6 preset + upload + reset default).
- [ ] Self view: edit icon hien; other view: edit an.
- [ ] Edit sheet/profile screen: edit cac field → luu → profile update + Dashboard/App state update.
- [ ] Friend UI state machine: Self | Friend | Sent | NotFriend → render dung nut.
- [ ] PT: tap "Dat lich" → BookingSheet (nhu MOB-113).
- [ ] Member self: tap "Ho so chuyen sau" → ChuyenSauScreen.

---

## Phase 4 — Social & Content (MOB-107..118)

### F-4.1 CreatePost (MOB-107)
- [ ] Tao post: textarea + image upload + link + tags + visibility + knowledge toggle.
- [ ] Empty post (khong text/image/link) → toast "Vui long them noi dung".
- [ ] Knowledge toggle min 15 chars → submit PASS.
- [ ] Submit → post moi dau feed voi author = myProfile.

### F-4.2 Feed + Reactions + Comments + Reward + Toxic (MOB-108)
- [ ] Feed list 5 seed + post moi.
- [ ] Reaction 3 type toggle: cap nhat counter + userReacted.
- [ ] Tap comment → mo post detail → comment textarea → submit → comment append.
- [ ] Toxic content filter replace matches bang warning span.
- [ ] Reward simulation: 4s interval → random reaction type +1 cho author='Hùng (Bạn)' + isKnowledge.
  - [ ] total >= 50 → isQuality, +10 rewardPoints, toast.
  - [ ] total > 50 → +1 rewardPoints moi 5 reactions (toast).
  - [ ] max 75 reactions.
- [ ] Toast "Day la simulation, khong phai diem that" hien khi bat dau post knowledge.

### F-4.3 AI Companion (MOB-109)
- [ ] Sidebar/drawer hoac chat list screen hien thi cac cuoc chat (theo design moi, xem `screen-specs.md` — co the la drawer hoac screen rieng).
- [ ] Tao chat → greeting + ve chat list.
- [ ] Title auto set = first 18 chars cua message.
- [ ] Edit title inline → save.
- [ ] Xoa chat → confirm dialog.
- [ ] Send message → 1200ms typing → canned reply ngau nhien.
- [ ] Typing indicator "Buddy dang go..." PASS.

### F-4.4 Social feed main (MOB-110)
- [ ] Feed render 5 seed post + post moi.
- [ ] Tap avatar → ProfileScreen.
- [ ] Tap image (neu co) → fullscreen viewer.
- [ ] Tap comment count → mo post detail.

### F-4.5 ChuyenSauScreen (MOB-116)
- [ ] View mode hien thi cac field day du.
- [ ] Edit mode: medical textarea, allergies textarea, training days chips, time slots dynamic (add/remove).
- [ ] Luu → cap nhat profile.medicalCondition / allergies / trainingDays / trainingTimes.
- [ ] Validation: it nhat 1 ngay tap duoc chon.

### F-4.6 PTCertificatesScreen (MOB-117)
- [ ] Cert list render image + name + org + date + code + type.
- [ ] Tap image → fullscreen viewer.
- [ ] State pills (verified/pending/unverified) hien thi dung.
- [ ] Self: "Yeu cau kiem dinh" button (visible neu unverified).
- [ ] Self: "Them chung chi" → modal form → save → list update.
- [ ] Self: Admin simulate panel (Duyệt/Reset) → update status.

### F-4.7 MessengerScreen (MOB-118)
- [ ] List ban be + search.
- [ ] Tap friend → ChatScreen.
- [ ] Send message → cross-user localDb update.
- [ ] Nhan tin → scrape last message of self + tin nhan friend (mock).
- [ ] Scroll auto to bottom sau send.

---

## Phase 5 — Secondary & polish (MOB-104..106, MOB-119, MOB-120)

### F-5.1 FriendRequestsScreen (MOB-104)
- [ ] 3 tabs (Đã nhận / Bạn bè / Đã gửi) PASS.
- [ ] Accept/reject/call swap cross-user (xem MOB-103).

### F-5.2 UserSearchScreen (MOB-105)
- [ ] Search input + category chip (all/pt/member/mentor).
- [ ] Tap profile → ProfileScreen.
- [ ] Friend UI render dung theo state.

### F-5.3 FriendService (MOB-106)
- [ ] send/cancel/accept/reject/unfriend PASS.
- [ ] Cross-user verify: A login → A send → switch B → thay inbox → B accept → switch A → friendList update.

### F-5.4 AuthScreen (MOB-119)
- [ ] Login: email + password → AuthService.login → MainTabs.
- [ ] Login fail → toast tieng Viet.
- [ ] Quick login HV/PT → fill form.
- [ ] Register member buoc 1 + buoc 2 PASS.
- [ ] Register PT 1 buoc PASS.
- [ ] Form validation (>= 6 chars, match password) PASS.
- [ ] Logout ve LoginScreen.

### F-5.5 Reward / VIP / Support (MOB-120)
- [ ] Withdraw sheet: voucher tab render 4 voucher; tab withdraw form (bank/account/name/amount >=50 <=balance).
- [ ] Voucher redeem → balance - cost + toast.
- [ ] VIP sheet 2 plan → upgrade → role update.
- [ ] Support sheet → Linking.openURL('mailto:...') (verify platform).

---

## Phase 6 — Pre-scale verification (MOB-200..202)

### F-6.1 Android verification (MOB-200)
- [ ] Hardware back hoat dong tren moi screen.
- [ ] Font scaling 1.5x khong vu.
- [ ] Touch target >= 48dp tren moi button.
- [ ] Status bar / nav bar khong che content.
- [ ] Keyboard hien thi khi focus input.
- [ ] Scroll list dai khong jitter.
- [ ] Image load placeholder + error fallback.
- [ ] Light theme applied theo DEC-019 (Soft Energy, light-only).
- [ ] Verify contrast key pairs bang tool (per-pair), khong claim app-wide AAA.
- [ ] Tablet rotation neu can (basic responsiveness).

### F-6.2 Parity PASS (MOB-201)
- [ ] Moi parity ID trong `feature-parity-matrix.md` da PASS rieng.
- [ ] Tong hop: render "All parity" checklist PASS.

### F-6.3 Acceptance PASS (MOB-202)
- [ ] Moi case trong file nay PASS.
- [ ] Quick manual run xem toan bo flow 30p khong gap crash.

---

## Phase 7 — Release prep (MOB-300..303)

### F-7.1 Material 3 audit (MOB-300)
- [ ] Components match Material 3 spec thoi diem release.

### F-7.2 Privacy & Data safety (MOB-301)
- [ ] Privacy policy URL ready.
- [ ] Data Safety form: noi ro UI-only phase, khong thu thap data.

### F-7.3 Release build (MOB-302)
- [ ] EAS build profile "production" PASS.
- [ ] AAB signed chinh xac.

### F-7.4 Play Console (MOB-303)
- [ ] Icon, screenshots, feature graphic.
- [ ] Short + full description.
- [ ] Content rating + target API.

Khong tu dang ky Play Console trong giai doan UI.

---

## Test command contract

- Type-check: `cd mobile && npm run type-check` → 0 errors.
- Lint: `cd mobile && npm run lint` → 0 errors.
- Android dev: `cd mobile && npm run android` → render trên emulator/device.

## Han che

- Chua test tren iOS (giai doan nay chi Android).
- Chua test tren thiết bị production thật (chỉ emulator / dev).
- E2E testing tool chua chon (Detox / Maestro neu can).
