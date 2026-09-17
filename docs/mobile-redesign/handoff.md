# Handoff — Ban giao hien tai

## Muc tieu hien tai

**Chuyen design direction sang light theme Soft Energy** theo yeu cau user ngay 2026-09-17 (lan 2). Bo Calm Modern (dark) cua MOB-015; them DEC-019 Soft Energy (light-only).

## Branch & checkpoint Git

- Branch: `main`.
- Working tree: clean sau commit.
- Commit gan nhat:
  - `527d50d feat(mobile): phase 3 auth + create-post + polish [MOB-119..135]` (3 file, +409 / -1).
  - `6b01b24 feat(mobile): phase 2 critical path screens [MOB-101..118]` (24 file, +2438 / -22).
  - `39407e4 feat(mobile): phase 1 foundation + 5 tab skeleton [MOB-001..005]` (48 file, +2678).
  - `202bc84 docs(handoff): record MOB-016b commit hash [MOB-016b]`
  - `5919d1f docs(design): refine semantic roles + content parity [MOB-016b]`
  - `9056d7f docs(handoff): record MOB-015/MOB-016 commit hashes [MOB-016]`
  - `235792d docs(design): switch default theme to Soft Energy light [MOB-016]`
  - `d08f9fb docs(plan): rework design direction independent from web [MOB-015]`
  - `49b53f3 docs(tasks): record MOB-000 planning complete [MOB-000]`
- Branch ahead of origin/main: 10 commits. Chua push (theo rule).

## Trang thai task (sau audit 2026-09-18)

> **Luu y quan trong**: Tat ca task MOB-001..135 hien tai la **SKELETON/STUB**, KHONG phai DONE that su.
> Code da viet nhung chua chay `npm install` / `tsc --noEmit` / `expo start` / emulator that.
> Audit day du: xem `docs/mobile-redesign/audit-mobile-vs-docs.md`.
>
> Viem pham AGENTS.md "**Khong danh dau DONE task khi thieu kiem chung**" da duoc sua trong commit sau.

- **MOB-000**: DONE that su (planning).
- **MOB-015**: huy (override boi MOB-016).
- **MOB-016**: DONE that su (sua light theme Soft Energy).
- **MOB-016b**: DONE that su (refine semantic roles + content parity checklist).
- **MOB-001..005**: SKELETON (code da viet, chua verify runtime) → can `npm install` + emulator.
- **MOB-101..118**: SKELETON (code da viet, nhieu FP thieu logic parity) → xem audit Section 3.
- **MOB-119..135**: SKELETON (code da viet, nhieu FP thieu logic parity).
- **MOB-200..202**: TODO (Phase 6 pre-scale verification — can chay MOB-001..135 that su truoc).

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
