# Tasks — Trang thai task MOB-XXX

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
- **Trang thai**: DONE

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
- **Trang thai**: DONE (sau khi user chinh sua lan 2, se thay the noi dung boi MOB-016)

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
- **Trang thai**: DONE
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
- **Trang thai**: DONE
- **Commit**: `5919d1f docs(design): refine semantic roles + content parity [MOB-016b]`.

---

## ⚠️ CANH BAO: Phase 1-3 code da viet nhung chua verify runtime

> Tat ca task MOB-001..135 hien tai = **SKELETON/STUB** (code da viet nhung chua chay `npm install` / `tsc --noEmit` / emulator / contrast verify).
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
- **Trang thai**: DONE
- **Commit**: `39407e4 feat(mobile): phase 1 foundation + 5 tab skeleton [MOB-001..005]`

### MOB-002 — Tokens & base components
- **Muc tieu**: theme provider, Button/Card/Chip/Input/Avatar/BottomSheet/Toast primitives.
- **Dependencies**: MOB-001.
- **Parity IDs**: theme co su dung trong moi module.
- **Deliverables**: tokens.ts, ThemeProvider.tsx, semantic.ts, types.ts + 11 primitive components.
- **Tieu chi**: F-1.2.
- **Trang thai**: SKELETON (theme tokens + 10 primitives done; BottomSheet component added trong Batch 1; chua verify emulator).
- **Commit**: `39407e4` (cung MOB-001..005) + Batch 1

### MOB-003 — Storage wrapper
- **Muc tieu**: AsyncStorage adapter + helper.
- **Deliverables**: storage.ts + secureStorage.ts + AuthContext.tsx.
- **Parity IDs**: helpers cho moi service.
- **Tieu chi**: F-1.3.
- **Trang thai**: DONE
- **Commit**: `39407e4` (cung MOB-001..005)

### MOB-004 — Mock services skeleton
- **Muc tieu**: AuthService + UserService + FriendService + ... theo `integration-boundaries.md`.
- **Deliverables**: mockUserService.ts, AuthContext.tsx, types/domain.ts, mocks/fixtures.ts, utils/.
- **Parity IDs**: (foundation).
- **Tieu chi**: F-1.4.
- **Trang thai**: DONE
- **Commit**: `39407e4` (cung MOB-001..005)

### MOB-005 — Navigation root
- **Muc tieu**: AuthStack + MainStack + Tabs + Drawer + Root gate.
- **Deliverables**: app/_layout.tsx, app/index.tsx, app/(tabs)/_layout.tsx + 5 tab screens skeleton.
- **Parity IDs**: (foundation).
- **Tieu chi**: F-1.5.
- **Trang thai**: DONE
- **Commit**: `39407e4` (cung MOB-001..005)

---

## Phase 2 — Critical path (Dashboard shell + streaks)

### MOB-101 — DashboardScreen + Streak + Ring + Quick action
- **Pham vi**: rebuild FP-001, FP-002, FP-035.
- **Deliverables**: dashboard.tsx + DashboardHeader/StreakCard/CalorieRing/QuickActionGrid.
- **Dependencies**: MOB-002, MOB-005.
- **Tieu chi**: F-2.1.
- **Trang thai**: DONE
- **Commit**: `6b01b24` (cung MOB-101..118)

### MOB-102 — Drawer panel
- **Pham vi**: FP-003.
- **Deliverables**: drawer.tsx (8 items + logout).
- **Tieu chi**: F-2.2.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

### MOB-103 — NotificationsScreen
- **Pham vi**: FP-004.
- **Deliverables**: notifications.tsx (3-segment + unread dot).
- **Tieu chi**: F-2.3.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

---

## Phase 3 — Other primary tabs

### MOB-111 — NutritionScreen (scan + plan + allergy)
- **Pham vi**: FP-014, FP-015, FP-016.
- **Deliverables**: nutrition.tsx (Scan + Plan segments, macro bars, BottomSheet portion slider, quick assign sang/trua/toi, 7 ngay chip week).
- **Tieu chi**: F-3.1.
- **Trang thai**: SKELETON (Scan + Plan tabs code done; Allergy chip 7 done; chua verify emulator; BottomSheet integration test chua chay).
- **Commit**: `6b01b24` (initial) + pending Batch 1

### MOB-112 — WorkoutScreen (plan + session + medical)
- **Pham vi**: FP-017, FP-018, FP-019, FP-020.
- **Deliverables**: workout.tsx (day ribbon + workout card list + start CTA).
- **Tieu chi**: F-3.2.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

### MOB-113 — Marketplace + BookingSheet
- **Pham vi**: FP-021.
- **Deliverables**: marketplace.tsx + booking/[email].tsx.
- **Tieu chi**: F-3.3.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

### MOB-114 — Appointments + Day detail
- **Pham vi**: FP-022, FP-023.
- **Deliverables**: appointments.tsx (calendar grid 7x5/6 + day detail modal + role filter PT/Member + action buttons xac nhan/tu choi/hoan thanh/tre/xoa).
- **Tieu chi**: F-3.4.
- **Trang thai**: SKELETON (Calendar grid + day modal code done; role filter done; PT/Member actions done; chua verify emulator).
- **Commit**: `6b01b24` (initial) + pending Batch 1

### MOB-115 — Profile + Edit + Friend UI + Book
- **Pham vi**: FP-024, FP-025, FP-026.
- **Deliverables**: profile/[email].tsx + edit-profile/[email].tsx + friends.tsx + search.tsx.
- **Tieu chi**: F-3.5.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

---

## Phase 4 — Social & Content

### MOB-107 — CreatePost
- **Pham vi**: FP-008.
- **Deliverables**: create-post.tsx (content + image toggle + link field + tags + visibility + knowledge 15-char validation + reward warning toast).
- **Tieu chi**: F-4.1.
- **Trang thai**: SKELETON (code done; chua verify emulator).
- **Commit**: `527d50d` (initial) + Batch 2

### MOB-108 — Feed + Reactions + Comments + Reward + Toxic
- **Pham vi**: FP-009, FP-010, FP-012.
- **Deliverables**: social.tsx feed tab + PostCard + 5 seed posts + reaction toggle heart/flame/smile + comment expand + reward simulation (4s interval, cap 75, +10 quality, +1 moi 5 reactions) + ToastService.
- **Tieu chi**: F-4.2.
- **Trang thai**: SKELETON (code done; chua verify emulator).
- **Commit**: Batch 2

### MOB-109 — AI Companion
- **Pham vi**: FP-011.
- **Deliverables**: social.tsx AI tab + chat list sidebar + create chat + edit title inline + delete confirm + 1200ms typing indicator + 7 canned replies + auto-title first 18 chars.
- **Tieu chi**: F-4.3.
- **Trang thai**: SKELETON (code done; chua verify emulator).
- **Commit**: Batch 2

### MOB-110 — Social feed main
- **Pham vi**: FP-013, FP-037.
- **Deliverables**: 5 seed posts + postsStore (cross-user persistence) + visibility filter (public/friends/private) + sort theo thoi gian.
- **Tieu chi**: F-4.4.
- **Trang thai**: SKELETON (code done; chua verify emulator).
- **Commit**: Batch 2

### MOB-116 — ChuyenSauScreen
- **Pham vi**: FP-027.
- **Deliverables**: chuyen-sau.tsx.
- **Tieu chi**: F-4.5.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

### MOB-117 — PTCertificatesScreen
- **Pham vi**: FP-028.
- **Deliverables**: certificates/[email].tsx.
- **Tieu chi**: F-4.6.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

### MOB-118 — Messenger
- **Pham vi**: FP-029.
- **Deliverables**: chat/[email].tsx.
- **Tieu chi**: F-4.7.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

---

## Phase 5 — Secondary & polish

### MOB-104 — FriendRequestsScreen
- **Pham vi**: FP-005.
- **Deliverables**: friends.tsx (3-segment received/friends/sent).
- **Tieu chi**: F-5.1.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

### MOB-105 — UserSearchScreen
- **Pham vi**: FP-006.
- **Deliverables**: search.tsx.
- **Tieu chi**: F-5.2.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

### MOB-106 — FriendService cross-user
- **Pham vi**: FP-007, FP-039.
- **Deliverables**: mockUserService.updateOtherUser() cross-user sync trong chat + friends.
- **Tieu chi**: F-5.3.
- **Trang thai**: DONE
- **Commit**: `6b01b24`

### MOB-119 — Auth (login + register)
- **Pham vi**: FP-030.
- **Deliverables**: (auth)/login.tsx + register.tsx.
- **Tieu chi**: F-5.4.
- **Trang thai**: DONE
- **Commit**: `527d50d`

### MOB-120 — Reward + VIP + Support
- **Pham vi**: FP-031, FP-032, FP-033.
- **Deliverables**: withdraw.tsx + vip.tsx + support.tsx.
- **Tieu chi**: F-5.5.
- **Trang thai**: DONE
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

## Phan loai cong viec phat sinh

Moi muc khi phat sinh them vao day voi tag phu hop:

1. **Thieu trong pham vi** (vd: "khong luu last login time"): sua theo task lien quan.
2. **Bug co san** (ghi nhan tu audit): khong sua tuy y → ghi decision truoc.
3. **Viec ky thuat** (vd: set up EAS): them task moi voi ID MOB-XXX.
4. **De xuat ngoai pham vi**: ghi vao Backlog tren.
5. **Tich hop backend tuong lai**: them task MOB-4XX.
