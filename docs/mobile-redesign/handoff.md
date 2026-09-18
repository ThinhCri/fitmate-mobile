# Handoff — Ban giao hien tai

## Muc tieu hien tai

**Hoan thanh refactor + features/ + FP-001, FP-017..020, FP-024, FP-025, Settings, ImagePickerService, 4 Cursor rule .mdc** theo yeu cau user ngay 2026-09-18 (sau batch 4 fix, review toan bo docs). Trang thai: IMPLEMENTED (code done), can runtime verification (npm install + tsc + emulator) de set DONE theo AGENTS.md.

## Branch & checkpoint Git

- Branch: `main`.
- Working tree: clean truoc khi refactor Batch 5.
- Commit gan nhat sau Batch 6 (fixes + FP-018):
  - `4b6b374 feat(mobile): FP-018 AI Thich ung workout swap (BMI + medical + tag scoring) [MOB-112]`
  - `e3389f0 fix(mobile): 62 TS errors -> 0 (UI components, AuthContext, services, types) [MOB-115]`
  - `615225b build(mobile): fix lucide/svg/screens versions to actual SDK 57 pins [MOB-101]`

## Trang thai task (sau Batch 5 refactor 2026-09-18)

> **Luu y quan trong**: Tat ca task MOB-001..135 da IMPLEMENTED (code done) sau Batch 5 refactor + features/. KHONG phai DONE that su.
> **Batch 6 (2026-09-18 10:30)**: Da fix toan bo 62 TypeScript errors -> **tsc --noEmit = 0 errors**. Da them package-lock.json (npm install SDK 57 compatible).
> Da them FP-018 (AI Thich ung workout swap).
> Can runtime verification: `cd mobile && npm install`, `npx tsc --noEmit` ✅, `npx expo start` emulator + WebAIM contrast tool.
> Sau verify PASS, moi set DONE theo AGENTS.md rule "khong danh dau DONE khi thieu kiem chung".
> Audit day du (FP-001..040): xem `docs/mobile-redesign/audit-mobile-vs-docs.md` Section 12 (Batch 5) + 13 (Batch 6).

> **Batch 7 (2026-09-18 14:00)** — Sua layout Dinh duong + Exercise model time/reps + sessionEngine deadline-based + WorkoutSessionScreen TTS audio + checkpoint + history idempotent + 13 vitest unit tests.
> - MOB-401 sua layout Nutrition Scan (`flex:1, minWidth` wrap, BottomSheet portion/meal wrap, snap 70%, paddingBottom 32).
> - MOB-402 model `Exercise` them `type:'reps'|'time'`, `reps?`, `durationSec?`, `restSec`, `notes`, `mediaUrl`, `mediaType`, `mediaSource`, `tags`. Plank → `time, durationSec:45`. Push-up co video Pixabay CC0.
> - MOB-403 `sessionEngine.ts` pure state machine: prepare → exercise → rest → finished. Deadline-based, pause luu `prevStatus`, resume giu dung thoi gian, tick chi chuyen state 1 lan.
> - MOB-404 `WorkoutSessionScreen` modal: status badge + timer/reps + controls + AppState pause + hardware back confirm + audio cue expo-speech.
> - MOB-405 `sessionStorage.ts` checkpoint AsyncStorage + `buildSessionSummary` + idempotent `markHistorySaved`.
> - MOB-406 13 vitest PASS (`npm test`).
> - `npx tsc --noEmit` PASS (0 errors).
> - Commits local: `45afadb` MOB-401 → `b1e782d` MOB-402/403/406 → `bb5d18c` MOB-404/405.

### Batch 8 (2026-09-18 19:00) — Safe Area + PT Revenue [MOB-407..412]

- MOB-407 fix bottom nav safe area: `useSafeAreaInsets()` cho gesture bar Android. Commit `0db5895`.
- MOB-408 PT revenue model: `BookingForPT`, `RefundEvent`, `RevenueKPI`, `RevenueHistoryItem`, `RevenueChartPoint`, fee calculations, `computeRevenueKPI/Chart/History`, Asia timezone handling. 33 vitest PASS. Commit `76fff41`.
- MOB-409 PT revenue screen overview: KPI + chart + history + filters + search. Commit `164b57d`.
- MOB-410 PT revenue detail: booking details + timeline + revenue breakdown. Commit `164b57d`.
- MOB-411 Menu entry: `BarChart3` icon in drawer, `user.profile.isPt` guard. Commit `50bf653`.
- MOB-412 BarChart SVG component (khong dependency moi). Commit `164b57d`.
- 2 PT demo accounts: `pt@fitmate.vn` (11 bookings) + `ptlong@fitmate.vn` (3 bookings).
- Fixture cases: completed, paid pending, unpaid, discount, cancelled refund, partial refund, multi-refund, cross-month refund, pending/failed refund.
- Chinh sach: phi 10%, ghi nhan theo completedAt, nhieu lan hoan tinh phi con lai, khong double-count.
- `npx tsc --noEmit` PASS (0 errors). `npm test` 46/46 PASS.
- **MOB-001..005**: IMPLEMENTED code done → can `npm install` + emulator.
- **MOB-002b** (BottomSheet): IMPLEMENTED code done.
- **MOB-101..118**: IMPLEMENTED code done cho 5 tabs + Drawer + Notifications + Social + Messenger + Appointments + Nutrition.
- **MOB-119..135**: IMPLEMENTED code done cho Login/Register/Profile/Edit/Certificates/Withdraw/VIP/Support/Search/CreatePost/ChuyenSau.
- **MOB-200..202**: TODO (Phase 6 pre-scale verification — can chay MOB-001..135 that su truoc).

### Cac FP da hoan thanh code (Batch 1..5)

- F-1.2 BottomSheet primitive (Batch 1)
- FP-014 Nutrition scan logic (Batch 1)
- FP-015 Plan 7 ngay + skip (Batch 1)
- FP-022 Appointments calendar grid + day modal + role filter + actions (Batch 1)
- FP-009 Reactions toggle heart/flame/smile (Batch 2)
- FP-010 Reward simulation 4s interval (Batch 2)
- FP-011 AI Companion chat list + 1200ms typing + title edit + delete (Batch 2)
- FP-013, FP-037 5 seed posts + cross-user store (Batch 2)
- FP-008 CreatePost image + link + 15-char knowledge validation (Batch 2)
- FP-029 Messenger list + 1500ms auto-reply (Batch 3)
- FP-006 Search mentor category (Batch 4)
- FP-027 ChuyenSau view/edit + custom text allergy + dynamic time slots (Batch 4)
- FP-028 Certificates fullscreen/self/admin (Batch 4)
- FP-030 Register 2-step validation (Batch 4)
- FP-031 Withdraw voucher 4 + form (Batch 4)
- FP-032 VIP 2 plan (Batch 4)
- FP-033 Support mailto (Batch 4)
- **FP-001** Streak onPress +1 connect Dashboard (Batch 5)
- **FP-017/018/020** Workout + RestTimer + MedicalSurvey + workoutHistory (Batch 5)
- **FP-019** Medical survey component (Batch 5)
- **FP-024** AvatarPicker 6 preset + reset + upload (Batch 5)
- **FP-025** FriendButton 4 state (Batch 5)
- **FP-003 hint** Settings screen (Batch 5)

### Batch 5 refactor theo AGENTS.md
- Tao `mobile/src/features/{social,profile,auth,workout}/` (PostCard, CommentSection, FriendButton, AvatarPicker, StepIndicator, WorkoutItem, RestTimer, MedicalSurvey + index.ts).
- Social screen: xoa inline PostCard + CommentSection, import tu features/.
- Profile modal: xoa inline friend action, thay bang `<FriendButton/>`.
- Drawer them "Cài đặt" → `/settings`.

### Cursor rules (.mdc)
- Tao 4 file `.cursor/rules/*.mdc`: preserve-content, mobile-design-system, android-implementation, delivery-workflow. (AGENTS.md yeu cau.)

### Con thieu (uu tien)
1. FP-017 drag-drop reorder library (react-native-draggable-flatlist).
2. FP-018 AI adaptive swap (prompt input + swap logic).
3. FP-021 time slot value check (09:00/10:30/14:00/16:30/19:00/20:30).
4. Runtime verify: `npm install` / `tsc --noEmit` / `expo start` emulator / WebAIM contrast per-pair.

## Next concrete step (sau Batch 5)

User se chay:
```bash
cd mobile
npm install
npx tsc --noEmit        # should be 0 errors
npx expo start          # emulator
```
Sau do verify tung FP-001..040 PASS theo `acceptance-checklist.md`. Neu PASS, set trang thai DONE trong `tasks.md`. Neu FAIL, sua code roi commit lai.

## Constraints next AI can respect

- KHONG push/merge/amend/rebase/reset --hard.
- KHONG goi production API.
- KHONG commit secrets.
- KHONG tu y them tinh nang ngoai scope (neu co y tuong, ghi vao tasks.md `out-of-scope`).
- KHONG doi validation/cach tinh dang co neu khong ghi trong decisions.md.
- KHONG copy web CSS/theme/sang mobile.
- Moi commit theo convention `<type>(<scope>): <desc> [MOB-XXX]`.

### Cac FP da hoan thanh code (Batch 1..4)

- F-1.2 BottomSheet primitive (Batch 1)
- FP-014 Nutrition scan logic (Batch 1)
- FP-015 Plan 7 ngay + skip (Batch 1)
- FP-022 Appointments calendar grid + day modal + role filter + actions (Batch 1)
- FP-009 Reactions toggle heart/flame/smile (Batch 2)
- FP-010 Reward simulation 4s interval (Batch 2)
- FP-011 AI Companion chat list + 1200ms typing + title edit + delete (Batch 2)
- FP-013, FP-037 5 seed posts + cross-user store (Batch 2)
- FP-008 CreatePost image + link + 15-char knowledge validation (Batch 2)
- FP-029 Messenger list + 1500ms auto-reply (Batch 3)
- FP-006 Search mentor category (Batch 4)
- FP-027 ChuyenSau view mode + custom text + dynamic time slots (Batch 4)
- FP-028 Cert fullscreen + self + admin (Batch 4)
- FP-030 Auth validation + member 2-step (Batch 4)
- FP-031 Withdraw 4 voucher + form (Batch 4)
- FP-032 VIP 2 plan + purchase (Batch 4)
- FP-033 Support mailto Linking (Batch 4)
- FP-040 12 users (4 PT + 4 member + 4 mentor) (Batch 2)

## Thay doi chua commit trong phien nay

- `docs/mobile-redesign/decisions.md`:
  - Huy DEC-015 (Calm Modern, dark).
  - Them DEC-019 (Soft Energy, light-only) voi bang mau chi tiet, ly do chon 6 tieu chi, nguon nghien cứu that (URL + ngay 2026-09-17).
- `docs/mobile-redesign/design-system.md`: viet lai Section 1 (1 huong Soft Energy, light-only), Section 2 (bang mau M3 roles light-only, contrast per-pair), Section 3 (typography Inter), Section 4-12 (spacing/radius/elevation/icon/avatar/components/motion giu, doi shadow opacity cho light), Section 13 (canh bao contrast per-pair).
- `docs/mobile-redesign/design-research.md`: them Section 2 "Light theme patterns" tu Strava/Hevy/Cronometer/Nike/Fitbit; Section 3 them DEC-019; Section 4 y tuong cap nhat mau.
- `docs/mobile-redesign/screen-specs.md`: wireframe comment sua "gradient green/blue" thanh "tint (primaryContainer/tertiaryContainer M3 token, light theme Soft Energy)"; disclaimer ASCII cap nhat DEC-019.
- `docs/mobile-redesign/acceptance-checklist.md`: dong "Dark theme native applied" sua thanh "Light theme applied theo DEC-019; verify contrast key pairs (per-pair, khong claim app-wide AAA)".
- `docs/mobile-redesign/cursor-rules-content.md`: `mobile-design-system.mdc` Visual direction → Soft Energy light-only; token usage them M3 container tokens; button primary → deep teal; component rules them backdrop dim 35% cho light.
- `docs/mobile-redesign/tasks.md`: them MOB-016 IN_PROGRESS; MOB-015 status DONE nhung noi dung bi override.
- `docs/mobile-redesign/android-migration-plan.md`: section 3.5 Theme tokens cap nhat theo DEC-019 (Soft Energy, light-only, khong build dark theme phase nay).
- `docs/mobile-redesign/feature-parity-matrix.md`: FP-001 sua tham chieu sang DEC-019 Soft Energy.
- `docs/mobile-redesign/README.md`: dong mo dau them ghi chu "Theme mac dinh: light (Soft Energy, DEC-019)".

## Phan thieu / blockers

- **Khong the truy cap truc tiep app that**: Hevy/Strong/Fitbod Google Play 404 (package ID sai/khac), Mobbin can dang nhap, Apple App Store timeout. Pattern light-first app chi lay tu public landing + Google Play listing descriptions.
- **Material 3 docs timeout/404**: `m3.material.io` timeout, `developer.android.com/design` timeout, `/styles/color/roles` chi tieu de. Phai dung general Material 3 convention + Android idiomatic.
- **Web khong chay thu**: khong co emulator Android, khong co browser de screenshot.
- **Chua tao project mobile** (dung dung theo rule planning).

## Nguon nghien cứu da truy cap thanh cong (2026-09-17)

### Platform / docs
- https://reactnative.dev/
- https://docs.expo.dev/
- https://docs.expo.dev/router/introduction/
- https://docs.expo.dev/develop/user-interface/store-data/
- https://developer.android.com/about
- https://expo.dev/blog

### App light theme (fitness / nutrition / workout)
- https://play.google.com/store/apps/details?id=com.strava
- https://www.hevyapp.com/
- https://www.cronometer.com/
- https://www.nike.com/ntc-app
- https://www.fitbit.com/global/us/home
- https://www.myfitnesspal.com/ (phien truoc)

### Nguon KHONG truy cap duoc (ghi ro ly do)
- https://m3.material.io/, /styles/color/roles — timeout/chỉ tiêu đề
- https://developer.android.com/design, /training/material-design, /develop/ui/views/theming/themes — timeout/404
- https://m2.material.io/design/color/the-color-system.html — timeout
- https://play.google.com/store/apps/details?id=com.strong.liftsix — 404
- https://play.google.com/store/apps/details?id=com.hevyapp.hevy — 404
- https://www.whoop.com/ — Cloudflare block
- https://apps.apple.com/us/app/strong-workout-tracker-gym-log/... — timeout
- https://callreact.com/blog/fitness-app-design — 500
- Mobbin — can dang nhap

## Kiem tra da chay trong phien nay

- `git status`: da commit 4 commit (MOB-015 → MOB-016 → MOB-016b → MOB-001..135).
- Grep verify: khong con dong noi "dark theme mac dinh" / "dark navy" / "Calm Modern" con hieu luc trong docs da sua.
- Verify bang mau Soft Energy hex codes (Section 2 design-system.md) tham chieu Material 3 color roles.
- Audit mobile code vs docs: 30+ vi pham parity chi tiet ghi trong `docs/mobile-redesign/audit-mobile-vs-docs.md`.

## Kiem tra chua chay (uu tien fix ngay)

- `npm install` trong `mobile/` — chua chay, can verify peer dep khong loi (Expo SDK 57 + RN 0.86 + gorhom).
- `npm run type-check` — chua chay, co the co type error vi lucide-react-native / @gorhom/bottom-shell import.
- `npm run android` — chua mo emulator, khong co screenshot that.
- Contrast per-pair bang tool that (WebAIM contrast checker / Material Theme Builder) — chi tinh tay trong docs, chua verify tool that.
- `BottomSheet` component (F-1.2, nhieu FP) — chua tao du co dep.
- Nutrition Scan tab (FP-014) — placeholder, chua co viewfinder/scan/portion slider.
- Calendar grid Appointments (FP-022) — chi list, chua co 7x5 grid.
- Feed 5 seed + reactions toggle + comments (FP-009/013/037) — chi 1 post static.
- AI Companion chat list (FP-011) — chi 1 chat, khong co typing 1200ms / title edit / delete.
- Withdraw 4 voucher (FP-031) — chi balance display.
- VIP 2 plan (FP-032) — chi 1 button.
- Search 12 users mentor category (FP-006/040) — chi 4 users, thieu mentor chip.
- 8 users them de dat 12 (FP-040).

## Quyet dinh thay the (de AI moi khong bi loi)

| Quyet dinh cu | Thay the boi | Ly do |
|---|---|---|
| DEC-002 (Glow Sport, giong web) | DEC-015 [HUY → DEC-019] | Web chi baseline content; visual moi doc lap web |
| DEC-015 (Calm Modern, dark) | DEC-019 (Soft Energy, light) | User chot light theme (2026-09-17 lan 2) |
| DEC-010 (React Navigation vanilla) | DEC-016 (Expo Router) | File-based + native-stack built-in + typed routes |
| DEC-004 (chi baseline content) | DEC-004 (gia nguyen) | OK |
| DEC-007 emulator shell | DEC-007 (gia nguyen) | OK |
| DEC-012 web tokens baseline | DEC-012 (sua lan 2) | Bo nguy hiem, tokens doc lap |
| DEC-013 web baseline | DEC-013 (sua lan 2) | Phan biet content vs visual |
| (chua co) | DEC-017 (avatar doc lap) | Tranh copy Unsplash tu web |
| (chua co) | DEC-018 (UI tieng Viet) | Parity content cho user Viet |
| (chua co) | DEC-019 (Soft Energy, light-only) | User chot light theme |

## Rang buoc quan trong (can nho)

- KHONG sua web (`src/`).
- KHONG push.
- KHONG goi production API / dich vu tra phi.
- KHONG bo content / field / modal.
- KHONG copy token / CSS / component style tu web sang mobile.
- KHONG build dark theme trong phase nay.
- KHONG claim "toan app AAA" — chi ghi theo tung cap verify duoc.
- PHAN BIET ro: UI xong | Mock xong | Real backend | Production release.

## Nhung phan dang mock (chua tich hop backend)

- Toan bo auth, AI vision, AI chat, friend cross-user, payment, push.
- Tat ca API thanh local mock voi AsyncStorage persistence.

## Task tiep theo khi user yeu cau "Trien khai theo ke hoach"

1. Tao branch `feat/mobile-init` tu `main` (optional - co the lam truc tiep).
2. Tao 4 file `.mdc` tu `cursor-rules-content.md` (de Cursor IDE tu load).
3. MOB-001: `cd mobile && npx create-expo-app@latest . --template blank-typescript`.
4. MOB-002: tokens.ts (Soft Energy, light-only), theme provider, primitives.
5. MOB-003: storage wrapper.
6. MOB-004: mock service skeleton.
7. MOB-005: Expo Router navigation root.
8. Sau phase 1, tien hanh phase 2 (Dashboard shell + streaks).
9. **QUAN TRONG**: verify contrast key pairs bang tool that truoc khi set Phase 1 DONE.

## AI moi can lam gi khi tiep tuc

1. Doc `AGENTS.md` truoc — dac biet section "Baseline ngon ngu".
2. Doc `docs/mobile-redesign/handoff.md` (file nay).
3. Doc `docs/mobile-redesign/tasks.md` → lay task dang IN_PROGRESS.
4. Doc `docs/mobile-redesign/decisions.md` → dac biet DEC-019 (Soft Energy), DEC-016 (Expo Router), DEC-017 (avatar), DEC-018 (UI tieng Viet).
5. Doc parity ID lien quan trong `feature-parity-matrix.md`.
6. Doc `docs/mobile-redesign/design-system.md` → tokens moi (Soft Energy, light-only, M3 color roles).
7. Doc `docs/mobile-redesign/design-research.md` → nguon that + gioi han.
8. So voi code that qua `git status` + `git log` + doc file lien quan.
9. Tien hanh task theo quy trinh trong rule `delivery-workflow.mdc`.

Moi thong tin trong docs tren day dua tren code that da doc truc tiep va nguon public da ghi ro URL. Tru cac muc ro rang "chua xac minh" trong `current-app-audit.md` va `design-research.md`.


## Batch 9 (2026-09-18 20:00) � Visual pill + Homepage depth [MOB-413..417]

User yeu cau chinh visual theo 2 anh tham khao: (1) floating pill tab bar, (2) homepage co chieu sau. Trang thai: IMPLEMENTED code done, can runtime verification.

### Files added/changed
- mobile/src/components/ui/FloatingTabBar.tsx (new) � pill glass + active capsule.
- mobile/src/components/ui/GlassCard.tsx (new) � BlurView primitive.
- mobile/src/features/homepage/HomepageBackground.tsx (new) � 4 layers (solid + gradient + watermark + content).
- mobile/src/theme/tokens.ts � bo warm cream, them gradient/glass/watermark tokens (DEC-023).
- mobile/app/(tabs)/_layout.tsx � Tabs.Screen options.tabBar custom function.
- mobile/app/(tabs)/dashboard.tsx � boc trong HomepageBackground + GlassCard cho StreakCard.
- 4 tab khac: ScrollView paddingBottom 24/32 ? 96 (cho pill + inset).
- mobile/package.json � them expo-blur@~57.0.3, expo-linear-gradient@~57.0.2.

### Decisions them
- DEC-023: bo warm cream, cool white + mint teal tier.
- DEC-024: floating pill bottom navigation (glass + active capsule).
- DEC-025: Homepage co chieu sau (gradient + watermark + glass hero).

### Verification
- 
px tsc --noEmit: 0 errors.
- 
px vitest run: 46/46 PASS.
- 
px expo start: chua chay (can emulator).
- Visual screenshots: chua chup (can emulator that).

### Commits local
- 7948ebe feat(mobile): floating pill tab bar + cool tokens [MOB-413]
- d0345b7 feat(mobile): cool white + mint teal tokens (DEC-023) [MOB-414] (gom package.json lock)
- ca3e819 feat(mobile): homepage background � gradient + watermark + glass hero [MOB-416]
- ed9c2b0 fix(mobile): export GlassCard + safe bottom padding for floating pill [MOB-417]

### Chinh sach
- Glass KHONG ap dung cho cac card nhieu chu/so lieu (de doc).
- Watermark opacity 6%, pointerEvents=none, accessibility hidden.
- BlurView fallback: surface dac 95% + border + shadow.
- Logo Fitmate chua co asset PNG ? dung text-style 'Fitmate'. Khi co asset ? swap sang Image (giu tokens + pattern).

### Con thieu (uu tien tiep theo)
1. Runtime verification: 
pm install, 
px expo start tren emulator that + chup screenshot de xem pill + gradient + glass + watermark that.
2. Verify contrast ratios (design-system.md) sau khi doi token cool � cap nhat bang so lieu that theo WebAIM tool.
3. Logo Fitmate PNG asset neu co ? swap text-style sang Image.
4. Test safe area: gesture navigation (Pixel), 3-button nav (Galaxy), font scaling, man hinh nho (360x640).
5. Neu BlurView tren Android that hien khong on (lag, nhap nhay) ? fallback surface dac van giu dep.
