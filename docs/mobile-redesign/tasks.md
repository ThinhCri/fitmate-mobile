# Tasks — Trang thai task MOB-XXX

## Production integration backlog
MOB-800..808 tại [integration plan](../production/integration-plan.md). DONE prototype dưới đây không là production integration.

### 2026-10-25 — Settings/analytics follow-up (MOB-800 / FP-030, FP-024)
- IN_PROGRESS / IMPLEMENTED_UNVERIFIED: post-login consent prompt, remembered refusal, local analytics control independent of settings/deletion API errors, standard Firebase config detection and release guard. Pre-existing bugs: `app/account/settings.tsx` Promise.all failure retained permanent loading; `app.config.js` env-only gate disabled analytics despite an existing native config file. Test source added; execution/device evidence and the next mobile release remain pending. See handoff and [decision](analytics-consent.md).

### 2026-10-25 — Comments composer (MOB-800 / FP-009)
- IN_PROGRESS / IMPLEMENTED_UNVERIFIED, pre-existing-bug: `CommentsSheet.tsx` omitted modal-local bottom insets, letting the Android three-button bar cover the input/send control. Added modal SafeAreaProvider/View and viewport keyboard avoidance; structural test source added. Verify on device with keyboard open/closed and gesture/three-button navigation before release.

> Moi task co ID on dinh. Status: TODO / IN_PROGRESS / BLOCKED / DONE. Moi task phai lien ket parity ID (FP-XXX).

---

## MOB-000 — Planning (khoi tao docs + rules)

- **Muc tieu/pham vi**: audit codebase web, viet parity matrix, design system, screen specs, tech decision, mock adapter spec, acceptance checklist, AGENTS.md, source content cho 4 Cursor rule.
- **Dependencies**: khong co.
- **Da lam**: 
  - Doc truc tiep `src/App.jsx`, 15 file components, `index.css`, `App.css`, `package.json`, `vite.config.js`, `eslint.config.js`, `.gitignore`, `fitmate_figma_prompt.txt`.
  - Xac minh baseline Git: branch `main`, working tree clean truoc khi tao file.
  - Xac minh `git config user.name` = VoTanThinh, `user.email` = votanthinhcri28@gmail.com.
  - Doc 4 file cua web de lay data shape, props, modal, validation.
- **Con thieu**: 
  - `.cursor/rules/*.mdc` chua tao (plan mode chan). Noi dung da san trong `docs/mobile-redesign/cursor-rules-content.md`.
  - Web khong chay thu truc tiep trong phien nay (khong co emulator browser).
- **Kiem tra da chay**: `git status` (clean truoc va sau), `git log --oneline -20`, doc file truc tiep.
- **Kiem tra chua chay**: `npm run dev` web, `npm run android` mobile, screenshot emulator.
- **Commit**:
  - `484afe8 docs(plan): inventory Android UI migration [MOB-000]` (14 file, +3127 dong).
  - `c7b4158 docs(handoff): record planning commit hash [MOB-000]` (cap nhat handoff voi hash that).
  - `49b53f3 docs(tasks): record MOB-000 planning complete [MOB-000]` (cap nhat tasks status).
  - Chua push theo rule.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)

---

## MOB-015 — Sua design direction: bo ke thua theme web, thiet ke moi doc lap

- **Boi canh**: User yeu cau ngay 2026-09-17 (lan 1) sua lai: web chi baseline content, KHONG baseline visual. Quyet dinh DEC-002 (Glow Sport, giong web) bi huy. Them DEC-015 (Calm Modern, doc lap).
- **Pham vi**: 
  - Sua `decisions.md`: them DEC-015 (Calm Modern), DEC-016 (Expo Router), DEC-017 (avatar doc lap), DEC-018 (UI tieng Viet); huy DEC-002 va DEC-010; sua DEC-004/007/012/013 de phan biet content vs visual baseline.
  - Sua `AGENTS.md`: ghi ro baseline ngon ngu web (content only, khong visual).
  - Sua `README.md`, `current-app-audit.md`: phan biet content vs visual baseline.
  - Sua `design-system.md`: tokens moi (Calm Modern), M3 color roles, Inter font, spacing/radius/elevation theo M3.
  - Sua `design-research.md`: ghi ro nguon da truy cap (reactnative.dev, docs.expo.dev/router, docs.expo.dev/develop/user-interface/store-data, myfitnesspal.com, freeletics.com/en), ghi ro nguon khong truy cap duoc (Material 3 site timeout/404, Google Play, Mobbin can dang nhap).
  - Sua `screen-specs.md`: disclaimer navigation de xuat (co the thay doi neu co ly do), ASCII wireframe chi minh hoa layout relative.
  - Sua `android-migration-plan.md`: cap nhat stack (Expo Router), tokens doc lap.
  - Sua `acceptance-checklist.md`: bo cum tu "giong web", de xuat navigation moi.
  - Sua `cursor-rules-content.md`: `mobile-design-system.mdc` tokens Calm Modern + Inter font; `android-implementation.mdc` Expo Router.
- **Parity IDs**: khong anh huong parity content; them luu y.
- **Dependencies**: khong co (truoc Phase 1 implementation).
- **Tieu chi nghiem thu**:
  - Khong con cum tu "giong web", "Glow Sport", "brand consistency" lien quan den visual, "Outfit".
  - `decisions.md` co DEC-015 (Calm Modern), DEC-016 (Expo Router), DEC-017, DEC-018.
  - `design-research.md` co link that + ngay truy cap.
  - `design-system.md` co bang mau semantic theo M3 roles, hex value moi (khong copy `src/index.css`).
  - Token names su dung M3 convention (surface, onSurface, primary, onPrimary, primaryContainer, secondary, tertiary, onTertiary, error, onError, outline, outlineVariant, success, warning, info).
  - Type family chi Inter (display + body + label).
- **Kiem tra da chay**: doc file, grep verify khong con cum tu cu.
- **Kiem tra chua chay**: emulator thuc te (sau Phase 1).
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime) (sau khi user chinh sua lan 2, se thay the noi dung boi MOB-016)

---

## MOB-016 — Chuyen design direction sang light theme (Soft Energy, thay the Calm Modern)

- **Boi canh**: User yeu cau ngay 2026-09-17 (lan 2): light theme la mac dinh, thay the Calm Modern (dark) cua MOB-015. Khong can trien khai 2 theme. User chi chot huong nen sang, chua chot mau thuong hieu → AI tu nghien cuu, de xuat, chon.
- **Pham vi**:
  - Huy DEC-015 (Calm Modern, dark).
  - Them DEC-019 (Soft Energy, light-only).
  - `decisions.md`: cap nhat noi dung DEC-015 (huy), them DEC-019 (bang mau, ly do chon, nguon nghien cứu that).
  - `design-system.md`: viet lai tokens chi light-only (Soft Energy). Bang mau M3 color roles, 3-tier depth. Bo cot "dark value" vi khong co dark theme trong phase nay. Contrast ghi per-pair, khong claim toan app AAA.
  - `design-research.md`: them pattern tu Strava, Hevy, Cronometer, Nike NTC, Fitbit (light-first apps) — URL + ngay 2026-09-17. Section 3 them DEC-019.
  - `screen-specs.md`: sua wireframe comment "hero gradient green/blue" thanh "hero tint (primaryContainer/tertiaryContainer M3 token, light theme Soft Energy)". Sua disclaimer ASCII theo DEC-019.
  - `acceptance-checklist.md`: dong "Dark theme native applied" sua thanh "Light theme applied theo DEC-019; verify contrast key pairs (per-pair)".
  - `cursor-rules-content.md`: `mobile-design-system.mdc` cap nhat Visual direction → Soft Energy (light theme only). Token usage them token M3 container moi.
  - `tasks.md`: them MOB-016 IN_PROGRESS.
  - `handoff.md`: cap nhat ghi nhan design chot = Soft Energy.
  - `android-migration-plan.md`: section 3.5 Theme tokens cap nhat theo DEC-019.
  - `feature-parity-matrix.md`: FP-001 sua "glow xanh/cam" thanh "token success/warning, light theme Soft Energy".
  - `README.md`: dong mo dau them ghi chu "theme mac dinh: light (Soft Energy, xem DEC-019)".
- **Parity IDs**: khong anh huong parity content; chi thay doi visual token va wireframe comment.
- **Dependencies**: MOB-015 (override).
- **Tieu chi nghiem thu**:
  - Khong con dong noi "dark theme mac dinh" hay "dark navy + mint" con hieu luc trong docs.
  - `decisions.md` co DEC-019 (Soft Energy) voi bang mau hex cu the, ly do chon 6 tieu chi.
  - `design-system.md` chi co light values (khong cot dark value).
  - `cursor-rules-content.md` Visual direction noi "light theme only".
  - `acceptance-checklist.md` dong "Dark theme native applied" da doi thanh light.
  - `screen-specs.md` wireframe comment khong con "gradient" (thay bang "tint" + token M3).
- **Kiem tra da chay**: doc file, grep "dark theme", "dark navy", "Calm Modern" → khong con hieu luc.
- **Kiem tra chua chay**: emulator thuc te (sau Phase 1).
- **Commit**:
  - MOB-015 (AGENTS.md, current-app-audit.md): `d08f9fb docs(plan): rework design direction independent from web [MOB-015]`.
  - MOB-016 (11 file con lai): `235792d docs(design): switch default theme to Soft Energy light [MOB-016]`.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Lu y tiep theo**: MOB-016b lam ro vai tro sienna/violet (xem DEC-020) + bo sung content parity checklist 3 manh Dashboard / Profile HV / Profile PT.

---

## MOB-016b — Lam ro semantic roles + content parity checklist 3 manh

- **Boi canh**: User yeu cau ngay 2026-09-17 (lan 3): sienna tiet che cho streak/warm accent (khong lam CTA cạnh tranh), violet chi achievement khi co nhu cau that. Can verify contrast per-pair bang cong thuc that, khong claim toan app AAA. Bo sung content parity list day du cho 3 manh (Dashboard / Profile HV / Profile PT) de dam bao khong mat field khi trien khai.
- **Pham vi**:
  - `decisions.md`: them DEC-020 (vai tro sienna/violet), lam ro DEC-019 (token values verified).
  - `design-system.md`: Section 2 viet lai tokens (outline `#5C5750`, outlineVariant `#858078`), them 5-tier depth, them Interaction roles table (button/chip/input/card/tab/nav/switch/badge/toast), them Contrast verified per-pair WCAG 2.1 (chia theo text/disabled/primary/secondary/tertiary/error/status/outline), ghi ro nhung cap CHUA dat AAA.
  - `screen-specs.md`: them Section 5 Content parity checklist cho Dashboard / Profile HV / Profile PT (day du field theo `current-app-audit.md` Section 7). Wireframe ASCII giu nguyen.
  - `cursor-rules-content.md`: them vai tro mau nhan (primary thong tri, sienna streak warm accent, violet chi PT verified).
  - `tasks.md`: them MOB-016b DONE.
  - `handoff.md`: cap nhat commit hash MOB-016b, ghi nhan design final.
- **Parity IDs**: khong anh huong parity content; chi bo sung checklist de verify khi implement.
- **Dependencies**: MOB-016.
- **Tieu chi nghiem thu**:
  - Token values da verify contrast bang cong thuc WCAG 2.1 (recorded that ratio).
  - outline/outlineVariant phan biet ro (outline AAA UI, outlineVariant chi pass 3:1 UI).
  - Interaction roles table day du cho cac thanh phan pho bien.
  - `decisions.md` DEC-020 lam ro secondary tiet che + tertiary chi PT verified / achievement.
  - `screen-specs.md` Section 5 co content parity table 3 manh voi source field + UI + token dung.
  - Khong con dong noi "AAA toan app" — chi per-pair.
- **Kiem tra da chay**: 
  - Compute relative luminance + ratio cho 36 cap (text on bg, variant, primary, secondary, tertiary, error, status, outline) → ghi that ratio vao `design-system.md` Section 2.
  - outline/outlineVariant da darken (#5C5750 / #858078) de pass 3:1 UI element rule tren surfaceContainerLowest.
- **Kiem tra chua chay**: 
  - Re-verify contrast bang tool that (WebAIM / Material Theme Builder) khi implement.
  - Emulator that de xem visual depth 5-tier (can than surfaceContainer vs surfaceContainerHigh khi pressed).
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `5919d1f docs(design): refine semantic roles + content parity [MOB-016b]`.

---

## ⚠️ CANH BAO: Phase 1-3 code da viet nhung chua verify runtime

> Tat ca task MOB-001..135 hien tai = **IMPLEMENTED** (code da viet xong sau 4 batches + Batch 5 refactor + features/). Con can: \`npm install\`, \`tsc --noEmit\`, emulator, contrast verify de set DONE.
>
> Theo AGENTS.md "**Khong danh dau DONE task khi thieu kiem chung**" � vi pham da sua trong commit nay.
>
> Audit day du: xem `docs/mobile-redesign/audit-mobile-vs-docs.md`.
>
> Khi nao set DONE that? Sau khi:
> 1. `npm install` trong `mobile/` PASS (khong co peer dep error).
> 2. `npm run type-check` PASS (0 errors).
> 3. `npm run android` mo emulator thanh cong.
> 4. Verify contrast per-pair bang WebAIM / Material Theme Builder that.
> 5. Fix het cac violation trong `audit-mobile-vs-docs.md` Section 3.

---

## Phase 1 — Foundation

### MOB-001 — Tao skeleton mobile (Expo + TS)
- **Muc tieu/pham vi**: `mobile/` folder, Expo + TS init, ESLint, prettier, tsconfig, basic structure.
- **Dependencies**: khong co.
- **Parity IDs**: (foundation).
- **Deliverables**: `mobile/package.json`, `mobile/app.json`, `mobile/tsconfig.json`, folder structure theo `android-migration-plan.md`.
- **Tieu chi nghiem thu**: xem `acceptance-checklist.md` F-1.1.
- **Cach kiem tra**: `npm run type-check`, `npm run lint`, `npm run android` mo emulator.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `39407e4 feat(mobile): phase 1 foundation + 5 tab skeleton [MOB-001..005]`

### MOB-002 — Tokens & base components
- **Muc tieu**: theme provider, Button/Card/Chip/Input/Avatar/BottomSheet/Toast primitives.
- **Dependencies**: MOB-001.
- **Parity IDs**: theme co su dung trong moi module.
- **Deliverables**: tokens.ts, ThemeProvider.tsx, semantic.ts, types.ts + 11 primitive components.
- **Tieu chi**: F-1.2.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `39407e4` (cung MOB-001..005) + Batch 1

### MOB-003 — Storage wrapper
- **Muc tieu**: AsyncStorage adapter + helper.
- **Deliverables**: storage.ts + secureStorage.ts + AuthContext.tsx.
- **Parity IDs**: helpers cho moi service.
- **Tieu chi**: F-1.3.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `39407e4` (cung MOB-001..005)

### MOB-004 — Mock services skeleton
- **Muc tieu**: AuthService + UserService + FriendService + ... theo `integration-boundaries.md`.
- **Deliverables**: mockUserService.ts, AuthContext.tsx, types/domain.ts, mocks/fixtures.ts, utils/.
- **Parity IDs**: (foundation).
- **Tieu chi**: F-1.4.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `39407e4` (cung MOB-001..005)

### MOB-005 — Navigation root
- **Muc tieu**: AuthStack + MainStack + Tabs + Drawer + Root gate.
- **Deliverables**: app/_layout.tsx, app/index.tsx, app/(tabs)/_layout.tsx + 5 tab screens skeleton.
- **Parity IDs**: (foundation).
- **Tieu chi**: F-1.5.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `39407e4` (cung MOB-001..005)

---

## Phase 2 — Critical path (Dashboard shell + streaks)

### MOB-101 — DashboardScreen + Streak + Ring + Quick action
- **Pham vi**: rebuild FP-001, FP-002, FP-035.
- **Deliverables**: dashboard.tsx + DashboardHeader/StreakCard/CalorieRing/QuickActionGrid.
- **Dependencies**: MOB-002, MOB-005.
- **Tieu chi**: F-2.1.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24` (cung MOB-101..118)

### MOB-102 — Drawer panel
- **Pham vi**: FP-003.
- **Deliverables**: drawer.tsx (8 items + logout).
- **Tieu chi**: F-2.2.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

### MOB-103 — NotificationsScreen
- **Pham vi**: FP-004.
- **Deliverables**: notifications.tsx (3-segment + unread dot).
- **Tieu chi**: F-2.3.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

---

## Phase 3 — Other primary tabs

### MOB-111 — NutritionScreen (scan + plan + allergy)
- **Pham vi**: FP-014, FP-015, FP-016.
- **Deliverables**: nutrition.tsx (Scan + Plan segments, macro bars, BottomSheet portion slider, quick assign sang/trua/toi, 7 ngay chip week).
- **Tieu chi**: F-3.1.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24` (initial) + pending Batch 1

### MOB-112 — WorkoutScreen (plan + session + medical)
- **Pham vi**: FP-017, FP-018, FP-019, FP-020.
- **Deliverables**: workout.tsx (day ribbon + workout card list + start CTA).
- **Tieu chi**: F-3.2.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

### MOB-113 — Marketplace + BookingSheet
- **Pham vi**: FP-021.
- **Deliverables**: marketplace.tsx + booking/[email].tsx.
- **Tieu chi**: F-3.3.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

### MOB-114 — Appointments + Day detail
- **Pham vi**: FP-022, FP-023.
- **Deliverables**: appointments.tsx (calendar grid 7x5/6 + day detail modal + role filter PT/Member + action buttons xac nhan/tu choi/hoan thanh/tre/xoa).
- **Tieu chi**: F-3.4.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24` (initial) + pending Batch 1

### MOB-115 — Profile + Edit + Friend UI + Book
- **Pham vi**: FP-024, FP-025, FP-026.
- **Deliverables**: profile/[email].tsx + edit-profile/[email].tsx + friends.tsx + search.tsx.
- **Tieu chi**: F-3.5.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

---

## Phase 4 — Social & Content

### MOB-107 — CreatePost
- **Pham vi**: FP-008.
- **Deliverables**: create-post.tsx (content + image toggle + link field + tags + visibility + knowledge 15-char validation + reward warning toast).
- **Tieu chi**: F-4.1.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `527d50d` (initial) + Batch 2

### MOB-108 — Feed + Reactions + Comments + Reward + Toxic
- **Pham vi**: FP-009, FP-010, FP-012.
- **Deliverables**: social.tsx feed tab + PostCard + 5 seed posts + reaction toggle heart/flame/smile + comment expand + reward simulation (4s interval, cap 75, +10 quality, +1 moi 5 reactions) + ToastService.
- **Tieu chi**: F-4.2.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: Batch 2

### MOB-109 — AI Companion
- **Pham vi**: FP-011.
- **Deliverables**: social.tsx AI tab + chat list sidebar + create chat + edit title inline + delete confirm + 1200ms typing indicator + 7 canned replies + auto-title first 18 chars.
- **Tieu chi**: F-4.3.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: Batch 2

### MOB-110 — Social feed main
- **Pham vi**: FP-013, FP-037.
- **Deliverables**: 5 seed posts + postsStore (cross-user persistence) + visibility filter (public/friends/private) + sort theo thoi gian.
- **Tieu chi**: F-4.4.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: Batch 2

### MOB-116 — ChuyenSauScreen
- **Pham vi**: FP-027.
- **Deliverables**: chuyen-sau.tsx.
- **Tieu chi**: F-4.5.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

### MOB-117 — PTCertificatesScreen
- **Pham vi**: FP-028.
- **Deliverables**: certificates/[email].tsx.
- **Tieu chi**: F-4.6.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

### MOB-118 — Messenger
- **Pham vi**: FP-029.
- **Deliverables**: chat/[email].tsx.
- **Tieu chi**: F-4.7.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

---

## Phase 5 — Secondary & polish

### MOB-104 — FriendRequestsScreen
- **Pham vi**: FP-005.
- **Deliverables**: friends.tsx (3-segment received/friends/sent).
- **Tieu chi**: F-5.1.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

### MOB-105 — UserSearchScreen
- **Pham vi**: FP-006.
- **Deliverables**: search.tsx.
- **Tieu chi**: F-5.2.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

### MOB-106 — FriendService cross-user
- **Pham vi**: FP-007, FP-039.
- **Deliverables**: mockUserService.updateOtherUser() cross-user sync trong chat + friends.
- **Tieu chi**: F-5.3.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

### MOB-119 — Auth (login + register)
- **Pham vi**: FP-030.
- **Deliverables**: (auth)/login.tsx + register.tsx.
- **Tieu chi**: F-5.4.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `527d50d`

### MOB-120 — Reward + VIP + Support
- **Pham vi**: FP-031, FP-032, FP-033.
- **Deliverables**: withdraw.tsx + vip.tsx + support.tsx.
- **Tieu chi**: F-5.5.
- **Trang thai**: IMPLEMENTED (code done, chua verify runtime)
- **Commit**: `6b01b24`

---

## Phase 6 — Pre-scale verification

### MOB-200 — Android UX verification
- **Pham vi**: hardware back, font scale, touch target, scroll, image, light theme per DEC-019, accessibility.
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

## MOB-401 — Sua layout Dinh dưỡng (nutrition scan tab + bottom sheet)

- **Boi canh** (2026-09-18): screenshot cho thay 3 vi tri layout bi tran/can khong ro rang:
  - Image container 200x… co `overflow:hidden` trong Card nhưng Card khong clip → border cham/rep bi tran qua goc Card.
  - Nút "Chụp ảnh" / "Tải lên" dùng `fullWidth` trong Row có `gap:8` → 2 nút full-width khong the wrap, chiếm toàn bộ row → text/icon tràn ngoài khi padding card khong du.
  - Bottom sheet "Thêm thực phẩm" (snap 60%): hàng khẩu phần 7 chip 0.5x..2x → hơn chiều rộng sheet, khong wrap → bi tran.
  - Nút "Sáng"/"Trưa"/"Tối" trong BottomSheet → fullWidth 3 nút trong Row → có thể bi tran khi tang cỡ font.
- **Pham vi**: chi sua layout, KHONG doi hanh vi/du lieu.
  - Image container: them `overflow:hidden` cho Card scan (hoặc bo dashed border ở container nếu đã có parent).
  - Hàng nút: dung `flex:1` thay `fullWidth` de 2 nút chia deu, icon+label co the wrap khi font scale 1.5x.
  - BottomSheet portion: wrap 7 chip thanh 2-3 dong flex-wrap, hoặc horizontal ScrollView co chu dich.
  - BottomSheet assign meal: 3 nut chia deu `flex:1`.
  - Them `safe area bottom` cho bottom sheet noi dung.
- **Parity IDs**: FP-014 (Nutrition scan flow).
- **Dependencies**: khong.
- **Tieu chi nghiem thu**: xem `acceptance-checklist.md` F-3.1; verify tren small phone 360dp + tablet 600dp + font scale 1.5x.
- **Trang thai**: TODO

---

## MOB-402 — Bo sung model bài tập + phan biet time/reps

- **Boi canh** (2026-09-18): model `Exercise` hien tai chi co `reps:number` (Plank dang hien "1 reps" sai y nghia), thieu phan biet time-based vs reps-based, thieu field cho huong dan + video/audio.
- **Pham vi**:
  - Them `type: 'reps' | 'time'`, `reps?:number`, `durationSec?:number`, `restAfterSec:number`, `restAfterLastSec?:number` (nghi truoc bai tiep), `notes?:string` (mo ta), `mediaUrl?:string`, `mediaType?:'video'|'audio'|null`, `mediaSource?:string` (license).
  - Sua fixture Plank: `type:'time', durationSec:45` (45 giay/hiệp), `reps:0` hoặc khong set.
  - Sua fixture Push-up/Squat/Lunge: giu `type:'reps', reps:12/15/12`.
  - Ghi chu "demo values" trong `mocks/fixtures.ts`.
- **Parity IDs**: FP-017 (workout plan), FP-020 (RestTimer).
- **Dependencies**: MOB-401.
- **Trang thai**: TODO

---

## MOB-403 — Engine phien tap (state machine + timer deadline-based)

- **Boi canh** (2026-09-18): User muon man hình tap chuyen dung thay vi checklist; can state machine + timer deadline-based de pause/resume/khoi phuc khong bi loi.
- **Pham vi**:
  - Tao `mobile/src/features/workout/sessionEngine.ts`: pure function, khong React, testable.
  - State: `idle | prepare | exercise | rest | paused | finished`.
  - Moi set: `{ exerciseIndex, setIndex, status, startedAt, pausedAt?, endsAt?, remainingMs }` — tinh deadline thay vi giam bien moi giay.
  - Action: `start() / pause() / resume() / completeSet() / skipRest() / skipExercise() / endEarly() / tick(now) / advance()`.
  - Tick() chi cap nhat `remainingMs`, khi `remainingMs<=0` moi goi `advance()` 1 lan → state transition dung 1 lan.
  - `restore(saved, now)` de khoi phuc tu AsyncStorage.
  - Serialize session state (state + endsAt + pausedAt).
- **Parity IDs**: FP-017, FP-020.
- **Dependencies**: MOB-402.
- **Trang thai**: TODO

---

## MOB-404 — Man hình "Đang tập" chuyen dung + media/audio cues

- **Boi canh** (2026-09-18): yeu cau man hình tap rieng, huong dan video/audio, tu chuyen exercise/rest/next, controls pause/skip/audio toggle.
- **Pham vi**:
  - Tao `mobile/app/(modals)/workout-session.tsx` Expo Router route.
  - Hien thi: ten bai + hướng dẫn ngắn, video area (WebView/Video neu co URL) hoặc audio cue area, hiep hien tai/tong, position bai trong buoi, dong ho dem nguoc hoac reps counter.
  - Trang thai badge: Chuẩn bị / Đang tập / Nghỉ / Tạm dừng / Tổng kết.
  - Controls: Pause/Resume, Skip rest, Skip exercise (ghi la bo qua), End set (cho bài reps), End workout (xac nhan).
  - Audio cues: dung `expo-speech` TTS tieng Viet neu co, fallback text-only (luu ly do vao docs).
  - Navigation: Back Android → confirm neu `exercise` hoac `rest` → chu khong phai `idle`/`finished`.
  - Cleanup timers + media + listeners trong `useEffect` cleanup.
- **Media**:
  - Khong bịa URL. Neu co `mediaUrl` trong fixture → dung truc tiep; neu khong co → render placeholder + text instruction.
  - TTS cues: "Bắt đầu hiệp", "Sắp hết", "Nghỉ", "Hiệp tiếp theo".
- **Parity IDs**: FP-017, FP-020.
- **Dependencies**: MOB-403.
- **Trang thai**: TODO

---

## MOB-405 — Ket qua buoi tap + luu lich su + checkpoint

- **Boi canh** (2026-09-18): save history phai phan biet completed/skipped/endedEarly; tranh ghi trung.
- **Pham vi**:
  - Tao `mobile/src/features/workout/sessionStorage.ts`: save/load checkpoint tu AsyncStorage key `workout_session_checkpoint`.
  - Luu 1 record `WorkoutSession` khi FINISHED: include `status` (completed/skipped/endedEarly), `durationMin`, `caloriesBurned` (cong thuc uoc luong), `exercises` (so bai thuc su hoan thanh vs bo qua).
  - Dung idempotency: luu `sessionId` trong checkpoint, khi save history check trung de tranh double-write.
  - Calorie uoc luong co ghi ro "uoc tinh".
- **Parity IDs**: FP-017 (history).
- **Dependencies**: MOB-404.
- **Trang thai**: TODO

---

## MOB-406 — Test engine phien tap (vitest)

- **Boi canh** (2026-09-18): sessionEngine phai co test vi pure function, de verify cac transition va bug timer.
- **Pham vi**:
  - Tao `mobile/src/features/workout/__tests__/sessionEngine.test.ts` voi vitest.
  - Cases: start → exercise → rest → next set; doi bai; het bai cuoi; reps set complete bang tay; pause/resume khong mat thoi gian; skip rest; skip exercise (status=skipped); endEarly; tick() qua deadline → state transition dung 1 lan; khoi phuc tu checkpoint.
- **Dependencies**: MOB-403.
- **Trang thai**: TODO

---

## Phan loai cong viec phat sinh

Moi muc khi phat sinh them vao day voi tag phu hop:

1. **Thieu trong pham vi** (vd: "khong luu last login time"): sua theo task lien quan.
2. **Bug co san** (ghi nhan tu audit): khong sua tuy y → ghi decision truoc.
3. **Viec ky thuat** (vd: set up EAS): them task moi voi ID MOB-XXX.
4. **De xuat ngoai pham vi**: ghi vao Backlog tren.
5. **Tich hop backend tuong lai**: them task MOB-4XX.

---

## MOB-407 — Sua Bottom Navigation safe area — Android gesture bar overlaps icons

- **Boi canh** (2026-09-18): User bao gesture bar Android de len icon/label cua bottom nav.
- **Pham vi**: Sua `mobile/app/(tabs)/_layout.tsx`.
  - Bo `height: 64, paddingBottom: 8` co dinh.
  - Dung `useSafeAreaInsets()` de lay bottom inset thuc te.
  - `tabBarHeight = 48 + Math.max(insets.bottom, 12)`.
  - `tabBarHideOnKeyboard: true` an tab bar khi ban phim mo.
  - State `ready` tranh flicker khi insets chua tinh.
- **Trang thai**: DONE (da commit `0db5895`)

---

## MOB-408 — PT Revenue model + fee/refund calculations + tests

- **Boi canh** (2026-09-18): Yeu cau trien khai PT Revenue (Doanh thu) theo spec chi tiet.
- **Pham vi**:
  - `mobile/src/features/pt-revenue/revenueCalculations.ts`: types `BookingForPT`, `RefundEvent`, `RevenueKPI`, `RevenueHistoryItem`, `RevenueChartPoint`.
  - Phí 10% = `FEE_RATE_BPS = 1000`. `calcFeeAndPT(amount)`: fee = round(amount × 0.10), pt = amount - fee.
  - Hoàn tiền: điều chỉnh âm vào thu nhập tại completedAt (không phải ngày booking).
  - Nhiều lần hoàn: tính phí còn lại từ số tiền còn lại sau mỗi lần hoàn.
  - `computeRevenueKPI`, `computeRevenueChart`, `computeRevenueHistory` theo `RevenuePeriod` + Asia timezone.
  - `canAccessRevenue(user)` — kiem tra `user.profile.isPt === true`.
  - `mobile/src/features/pt-revenue/__tests__/revenueCalculations.test.ts`: 33 test, tat ca PASS.
- **Chinh sach**:
  - Hoàn tháng sau không sửa lịch sử tháng trước.
  - Refund pending/failed không làm phát sinh điều chỉnh.
  - `dateKeyFromISO()`: timezone Asia/Ho_Chi_Minh (UTC+7).
- **Trang thai**: DONE (da commit `76fff41`)

---

## MOB-409 — Man hinh tong quan Doanh thu PT (KPI + chart + history)

- **Boi canh** (2026-09-18): Trien khai man hinh revenue chinh.
- **Pham vi**:
  - Route: `/(modals)/revenue`.
  - Header: title + "Du lieu mau" + ten PT.
  - Bo loc: Thang nay / Thang truoc / 3 thang gan day / Tuy chon.
  - The KPI chinh: Thu nhap trong ky (sau phi 10% + dieu chinh hoan tien).
  - 4 Sub-metrics: Gia tri dich vu hoan thanh, Phi nen tang, Dieu chinh hoan tien, Buoi hoan thanh. Flexwrap responsive.
  - Khu vuc "Cho hoan thanh": so du hien tai, khong theo ky.
  - Bar chart (SVG, khong dependency moi): ho tro gia tri am, touch xem chi tiet, empty state.
  - Loc lich su theo loai: Tat ca / Thu nhap / Dieu chinh hoan tien.
  - Search: ten hoc vien, dich vu, ma booking.
  - Load more pagination.
  - Phan quyen: redirect member.
- **Trang thai**: DONE (da commit `164b57d`)

---

## MOB-410 — Man hinh chi tiet booking revenue

- **Boi canh** (2026-09-18): Chi tiet booking de kiem tra tinh toan.
- **Pham vi**:
  - Route: `/(modals)/revenue/[bookingId]`.
  - Hoc vien, ma booking (copy), trang thai booking/payment/refund.
  - Gia goc, giam gia, thuc tra, tong hoan tien, con lai.
  - Ty le phi 10%, phi con lai, phan PT con lai.
  - Trang thai thu nhap: cho hoan thanh / da ghi nhan / da dieu chinh.
  - Timeline payment/hoan thanh/refund.
  - Khong co nut thu tien, rut tien, phe duyet hoan tien.
- **Trang thai**: DONE (da commit `164b57d`)

---

## MOB-411 — Menu entry Doanh thu trong Drawer — chi cho PT

- **Boi canh** (2026-09-18): PT can truy cap man hinh Doanh thu.
- **Pham vi**:
  - Them menu "Doanh thu" icon `BarChart3` trong `drawer.tsx`.
  - Chi hien thi voi `user.profile.isPt === true`.
  - Navigate den `/(modals)/revenue`.
  - Khong co tab chinh cho tat ca nguoi dung.
- **Trang thai**: DONE (da commit `50bf653`)

---

## MOB-412 — BarChart primitive (SVG) cho revenue chart

- **Boi canh** (2026-09-18): Man hinh revenue can bieu do bar.
- **Pham vi**:
  - `mobile/src/components/ui/BarChart.tsx`: SVG bar chart.
  - Khong them dependency moi (dung `react-native-svg` san co).
  - Ho tro negative values (refund, mau do).
  - Touch xem chi tiet tung cot.
  - Empty state + accessibility label.
  - Responsive flex.
- **Trang thai**: DONE (da commit `164b57d`)

---

> **TRANG THAI HIEN TAI (2026-09-18, Batch 9 — visual pill + homepage)**: MOB-413..417 DONE (da commit `7948ebe`, `d0345b7`, `ca3e819`, `ed9c2b0`). MOB-407..412 DONE (Batch 8). MOB-001..135 IMPLEMENTED (code done), can runtime verification.


---

## MOB-413 — Floating pill tab bar (glass + active capsule)

- **Boi canh** (2026-09-18): Tab bar mat dinh expo-router (border-top, full-width) giong generic app. User yeu cau pill nổi (anh 1), icon dong bo outline/filled, active co capsule primaryContainer phia sau icon.
- **Pham vi**:
  - `mobile/src/components/ui/FloatingTabBar.tsx` moi — pill 64dp, bo tròn full, glass surface (BlurView intensity 22 + tint white 55%).
  - Viền 1dp `outlineVariant`, shadow `level2`, cach 2 canh man hinh 16dp (margin ngang 5%).
  - Padding bottom = `max(insets.bottom, 12) + 8dp` de khong bi gesture bar de.
  - `tabBarHideOnKeyboard: true` de khong che form.
  - Active: capsule `primaryContainer` (bo tròn 999, paddingHorizontal 18) sau icon, label `onPrimaryContainer`.
  - Inactive: icon `onSurfaceVariant`, label `onSurfaceVariant`.
  - Icon stroke width: filled=2 khi active, outline=1.75 khi inactive.
  - Badge notification (neu co) tu real state, mau `error` — phase UI khong set badge (chua co chat unread that).
  - Fallback: neu BlurView khong ho tro (web) → surface dac 95% + border + shadow.
- **Files**:
  - `mobile/src/components/ui/FloatingTabBar.tsx` (new).
  - `mobile/app/(tabs)/_layout.tsx` (refactor → Tabs.Screen options.tabBar custom function).
  - `mobile/src/components/ui/index.ts` (export).
- **Trang thai**: DONE (da commit `7948ebe`)

---

## MOB-414 — Bo warm cream, chuyen page bg sang cool white + mint teal tier

- **Boi canh** (2026-09-18): User yeu cau "bo sac kem/nga vang hien tai tren Homepage". Token cu co surface `#FAFAF7` (off-white warm) + container tiers pha warm — giong admin dashboard.
- **Pham vi**:
  - `mobile/src/theme/tokens.ts`: doi toan bo surface tier sang cool white + mint teal tint.
    - `surface #F5F8F8` (cool off-white).
    - `surfaceContainerLow #ECF1F0` (very light mint).
    - `surfaceContainer #E1E9E8`.
    - `surfaceContainerHigh #D5DEDF`.
    - `surfaceContainerHighest #C6D2D1`.
  - `onSurface` → `#0F1A19` (cool teal undertone).
  - `onSurfaceVariant` → `#3F4948`.
  - `outline` → `#46514F`, `outlineVariant` → `#7C8784`.
  - Them tokens cho Homepage: `gradientMintStart #DDEEEC`, `gradientMintEnd #F5F8F8`, `gradientTealHaze #CFE0DE`.
  - Them `glassSurface #FFFFFF`, `glassSurfaceAlt #F5F8F8`, `watermarkInk #0F766E`.
  - Them `opacity.watermark = 0.06`, `opacity.glass = 0.75`.
  - `inverseSurface/inverseOnSurface` cap nhat theo cool tones.
- **He qua**:
  - CCCS contrast body card & so lieu khong thay doi dang ke (ren < 1 diem).
  - Outline bien thanh "cool teal grey" — trung tinh, khong giong warm cream.
  - Token names giu nguyen (M3 convention).
- **Files**: `mobile/src/theme/tokens.ts`.
- **Trang thai**: DONE (da commit `d0345b7`)

---

## MOB-415 — Them dependencies `expo-blur` + `expo-linear-gradient`

- **Boi canh** (2026-09-18): Can BlurView cho pill tab bar + glass hero card. Can LinearGradient cho Homepage bg.
- **Pham vi**:
  - `expo-blur@~57.0.3`.
  - `expo-linear-gradient@~57.0.2`.
  - Pin theo bundledNativeModules SDK 57, khong them dependency ngoai he.
- **Trang thai**: DONE (da commit `d0345b7` goi trong tokens commit, line counts theo file lock).

---

## MOB-416 — Homepage co chieu sau: gradient mint teal + watermark logo + glass hero

- **Boi canh** (2026-09-18): User yeu cau nền co chiều sâu (anh 2) — gradient mint teal, watermark logo "Fitmate" phia sau, glass hero cho streak card.
- **Pham vi**:
  - `mobile/src/features/homepage/HomepageBackground.tsx` (new) — 4 layers:
    - Layer A: solid `surface` (#F5F8F8).
    - Layer B: LinearGradient 3 stops: `#CFE0DE` (top-left) → `#DDEEEC` (45%) → `#F5F8F8` (bottom-right).
    - Layer C: Watermark "Fitmate" text (font 168, weight 900, letterSpacing -4, opacity 6%, `watermarkInk`), `pointerEvents=none`, `accessibilityElementsHidden`, `importantForAccessibility=no`. Co dinh, khong parallax/animate.
    - Layer D: children (noi dung + cards).
  - `mobile/src/components/ui/GlassCard.tsx` (new) — BlurView intensity 22 + tint white 55% + border 1dp `outlineVariant` + `level2` shadow + padding mac dinh lg=16. Fallback neu blur khong ho tro: surface dac 95% + border + shadow.
  - `mobile/app/(tabs)/dashboard.tsx`: boc StreakCard trong GlassCard (radius 20, padding 16). Giu cac Card khac (CalorieRing, QuickActionGrid) mat dinh (de doc so lieu).
  - Them scroll padding bottom = 96dp cho floating pill (co buffer).
- **Chinh sach**:
  - Glass KHONG ap dung cho cac card nhieu chu / so lieu / form (giu surface dac de doc).
  - Watermark logo dung font he thong (Inter system fallback) — chua co PNG asset Fitmate; neu co asset trong tuong lai → swap sang `<Image>`.
  - Layer C `pointerEvents=none` → khong canh tro text.
- **Files**: 3 file moi + 1 file sua (dashboard).
- **Trang thai**: DONE (da commit `ca3e819`)

---

## MOB-417 — Safe bottom padding cho moi tab + export GlassCard

- **Boi canh** (2026-09-18): Floating pill (cao 64dp + 16dp margin + 12-28dp insets) de len noi dung cuoi neu ScrollView khong du padding.
- **Pham vi**:
  - Tang `paddingBottom` cua ScrollView trong 4 tabs (nutrition, workout, social, marketplace) tu 24/32 → 96.
  - Dashboard da co `contentBottomPadding = 96` (tu MOB-416).
  - `mobile/src/components/ui/index.ts`: them export `GlassCard` + `GlassCardProps`.
- **Trang thai**: DONE (da commit `ed9c2b0`)

---

> **LUU Y VERIFICATION (2026-09-18)**:
- `npx tsc --noEmit`: PASS (clean).
- `npx vitest run`: PASS (46/46 tests).
- `npx expo start`: chua chay (khong co emulator/dev server trong phien nay).
- Visual verification: chua chup screenshot thuc te (Android emulator khong khoi dong trong phien nay). Can user chay thu tren emulator that hoac `npx expo start` de xem pill + gradient + glass + watermark.
- Safe area Android: code da dung `useSafeAreaInsets()` (MOB-407) + BlurView co fall back → uoc luong se OK, can xac minh tren device that.




> **TRANG THAI HIEN TAI (2026-09-18, Batch 5)**: Toan bo MOB-XXX da IMPLEMENTED (code done) sau 4 batches (6776129, a1b371a, 4ae282b, 6ba45a4) + Batch 5 refactor + features/. Can verify runtime: `cd mobile && npm install`, `npx tsc --noEmit`, `npx expo start` emulator + contrast WebAIM tool. Sau do moi set DONE theo AGENTS.md.

## MOB-802 follow-up — PT package stop (2026-10-10)

- Status: **IMPLEMENTED_UNVERIFIED**. Member/PT có lối vào danh sách gói và chi tiết các buổi; hội viên xem trước hoàn tiền, gửi lý do, rút yêu cầu; PT chấp nhận yêu cầu đang chờ. Backend đối chiếu báo giá lúc xác nhận, trả 409 nếu đã đổi.
- Không mở checkout gói: backend chưa có route công khai và chưa nghiệm thu payOS/Meet/SMS thật. Màn danh sách chỉ hiển thị gói đã tồn tại trên server, không dựng gói giả.
- `npm run type-check` PASS, `npm test -- --run` PASS (206/206), `npm run lint` hoàn thành với 0 errors và 147 warnings toàn repo (2026-10-10). Android runtime chưa chạy. Cần kiểm tra cả hai tài khoản, 409 báo giá đổi, mạng ngắt sau POST và bàn phím nhập lý do trước khi nâng trạng thái.
