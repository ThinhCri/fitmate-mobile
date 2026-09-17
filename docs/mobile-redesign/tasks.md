# Tasks — Trang thai task MOB-XXX

> Moi task co ID on dinh. Status: TODO / IN_PROGRESS / BLOCKED / DONE. Moi task phai lien ket parity ID (FP-XXX).

---

## Phase 1 — Foundation

### MOB-001 — Tao skeleton mobile (Expo + TS)
- **Muc tieu/pham vi**: `mobile/` folder, Expo + TS init, ESLint, prettier, tsconfig, basic structure.
- **Dependencies**: khong co.
- **Parity IDs**: (foundation).
- **Deliverables**: `mobile/package.json`, `mobile/app.json`, `mobile/tsconfig.json`, folder structure theo `android-migration-plan.md`.
- **Tieu chi nghiem thu**: xem `acceptance-checklist.md` F-1.1.
- **Cach kiem tra**: `npm run type-check`, `npm run lint`, `npm run android` mo emulator.
- **Trang thai**: TODO
- **Da lam**: —
- **Con thieu**: —
- **Kiem tra da chay**: —
- **Kiem tra chua chay**: —
- **Commit**: —

### MOB-002 — Tokens & base components
- **Muc tieu**: theme provider, Button/Card/Chip/Input/Avatar/BottomSheet/Toast primitives.
- **Dependencies**: MOB-001.
- **Parity IDs**: theme co su dung trong moi module.
- **Tieu chi**: F-1.2.
- **Trang thai**: TODO

### MOB-003 — Storage wrapper
- **Muc tieu**: AsyncStorage adapter + helper.
- **Parity IDs**: helpers cho moi service.
- **Tieu chi**: F-1.3.
- **Trang thai**: TODO

### MOB-004 — Mock services skeleton
- **Muc tieu**: AuthService + UserService + FriendService + ... theo `integration-boundaries.md`.
- **Parity IDs**: (foundation).
- **Tieu chi**: F-1.4.
- **Trang thai**: TODO

### MOB-005 — Navigation root
- **Muc tieu**: AuthStack + MainStack + Tabs + Drawer + Root gate.
- **Parity IDs**: (foundation).
- **Tieu chi**: F-1.5.
- **Trang thai**: TODO

---

## Phase 2 — Critical path (Dashboard shell + streaks)

### MOB-101 — DashboardScreen + Streak + Ring + Quick action
- **Pham vi**: rebuild FP-001, FP-002, FP-035.
- **Dependencies**: MOB-002, MOB-005.
- **Tieu chi**: F-2.1.
- **Trang thai**: TODO

### MOB-102 — Drawer panel
- **Pham vi**: FP-003.
- **Tieu chi**: F-2.2.
- **Trang thai**: TODO

### MOB-103 — NotificationsScreen
- **Pham vi**: FP-004.
- **Tieu chi**: F-2.3.
- **Trang thai**: TODO

---

## Phase 3 — Other primary tabs

### MOB-111 — NutritionScreen (scan + plan + allergy)
- **Pham vi**: FP-014, FP-015, FP-016.
- **Tieu chi**: F-3.1.
- **Trang thai**: TODO

### MOB-112 — WorkoutScreen (plan + session + medical)
- **Pham vi**: FP-017..FP-020.
- **Tieu chi**: F-3.2.
- **Trang thai**: TODO

### MOB-113 — Marketplace + BookingSheet
- **Pham vi**: FP-021.
- **Tieu chi**: F-3.3.
- **Trang thai**: TODO

### MOB-114 — Appointments + Day detail
- **Pham vi**: FP-022, FP-023.
- **Tieu chi**: F-3.4.
- **Trang thai**: TODO

### MOB-115 — Profile + Edit + Friend UI + Book
- **Pham vi**: FP-024..FP-026.
- **Tieu chi**: F-3.5.
- **Trang thai**: TODO

---

## Phase 4 — Social & Content

### MOB-107 — CreatePost
- **Pham vi**: FP-008.
- **Tieu chi**: F-4.1.
- **Trang thai**: TODO

### MOB-108 — Feed + Reactions + Comments + Reward + Toxic
- **Pham vi**: FP-009, FP-010, FP-012.
- **Tieu chi**: F-4.2.
- **Trang thai**: TODO

### MOB-109 — AI Companion
- **Pham vi**: FP-011.
- **Tieu chi**: F-4.3.
- **Trang thai**: TODO

### MOB-110 — Social feed main
- **Pham vi**: FP-013, FP-037.
- **Tieu chi**: F-4.4.
- **Trang thai**: TODO

### MOB-116 — ChuyenSauScreen
- **Pham vi**: FP-027.
- **Tieu chi**: F-4.5.
- **Trang thai**: TODO

### MOB-117 — PTCertificatesScreen
- **Pham vi**: FP-028.
- **Tieu chi**: F-4.6.
- **Trang thai**: TODO

### MOB-118 — Messenger
- **Pham vi**: FP-029.
- **Tieu chi**: F-4.7.
- **Trang thai**: TODO

---

## Phase 5 — Secondary & polish

### MOB-104 — FriendRequestsScreen
- **Pham vi**: FP-005.
- **Tieu chi**: F-5.1.
- **Trang thai**: TODO

### MOB-105 — UserSearchScreen
- **Pham vi**: FP-006.
- **Tieu chi**: F-5.2.
- **Trang thai**: TODO

### MOB-106 — FriendService cross-user
- **Pham vi**: FP-007, FP-039.
- **Tieu chi**: F-5.3.
- **Trang thai**: TODO

### MOB-119 — Auth (login + register)
- **Pham vi**: FP-030.
- **Tieu chi**: F-5.4.
- **Trang thai**: TODO

### MOB-120 — Reward + VIP + Support
- **Pham vi**: FP-031, FP-032, FP-033.
- **Tieu chi**: F-5.5.
- **Trang thai**: TODO

---

## Phase 6 — Pre-scale verification

### MOB-200 — Android UX verification
- **Pham vi**: hardware back, font scale, touch target, scroll, image, dark theme.
- **Tieu chi**: F-6.1.
- **Trang thai**: TODO

### MOB-201 — Parity PASS
- **Pham vi**: moi parity ID.
- **Tieu chi**: F-6.2.
- **Trang thai**: TODO

### MOB-202 — Acceptance PASS
- **Pham vi**: moi case cua `acceptance-checklist.md`.
- **Tieu chi**: F-6.3.
- **Trang thai**: TODO

---

## Phase 7 — Release prep (post-UI)

### MOB-300..303 — Material audit + Privacy + Signing + Play Console
- **Pham vi**: release.
- **Tieu chi**: F-7.1..F-7.4.
- **Trang thai**: TODO (post-UI)

---

## Backlog (out-of-scope)

Cac y tuong ghi ngoai pham vi KHONG tu trien khai:

- Tich hop Health Connect / HealthKit.
- AR motion coach.
- Live 1-1 video call.
- Thanh toan that (Stripe / VietQR).
- Push notification real.
- AI vision that (GPT-4V).
- Codebase dark store (Firebase).

---

## Phan loai cong viec phat sinh

Moi muc khi phat sinh them vao day voi tag phu hop:

1. **Thieu trong pham vi** (vd: "khong luu last login time"): sua theo task lien quan.
2. **Bug co san** (ghi nhan tu audit): khong sua tuy y → ghi decision truoc.
3. **Viec ky thuat** (vd: set up EAS): them task moi voi ID MOB-XXX.
4. **De xuat ngoai pham vi**: ghi vao Backlog tren.
5. **Tich hop backend tuong lai**: them task MOB-4XX.
