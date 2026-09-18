# Decisions — Quyet dinh quan trong & ly do

> Moi quyet dinh lon phai ghi o day. Them moi o cuoi, **khong sua cu neu khong co ly do**; neu thay the, ghi ro quyet dinh cu bi thay the.

---

## DEC-001 — Chon React Native + Expo + TypeScript (khong phai Capacitor)

**Ngay**: 2026-09-17.

**Boi canh**:
- Frontend web: React 19 + Vite + JSX.
- Goal: app Android native, future-ready cho Google Play.
- Khong yeu cau iOS trong giai doan nay.

**Lua chon**:
- (A) React Native + Expo + TypeScript.
- (B) Capacitor (WebView wrapper).

**Ly do chon A**:
- React Native cung cap native UI that → Material 3, ripple, hardware back, system dark mode, system font scaling, edge-to-edge — Capacitor khong co.
- React 19 share component model (props, hooks, state) → giam learning curve.
- Expo cung local dev / emulator / EAS Build / OTA — cong cu tot cho 1 nguoi + AI.
- Lucide-react-native co san (API giong lucide-react) → khong re-design icon.
- Migration nhin lau: native de mo rong (camera that, push that, background task).

**Ly do KHONG chon B**:
- WebView wrapper → giong "web tren dien thoai", khong phai native UX.
- Material/ripple/font scaling khong that, chi CSS.
- Brand Fitmate can redesign anyway (xem DEC-015) → khong can pin vao theme cua web.

**He qua**:
- UI phai viet lai (RN khong hieu `<div>` / CSS file).
- DOM API (`window.open`, FileReader, `URL.createObjectURL`) phai thay.
- localStorage → AsyncStorage.
- Approx effort Phase 1 (skeleton + tokens + storage + mock services + nav): theo MOB-001..005.

**Quyet dinh bi thay the**: (khong co — lan dau chon).

---

## DEC-002 — [HUY] Bo, thay the boi DEC-015

**Ly do huy**:
- Quyet dinh nay dua tren gia dinh web la nguon chuẩn visual ("giong web", "brand consistency"). Sau khi user sua yeu cau, web cung dang can redesign.
- Noi dung giu (quy uoc dynamic color khong dung) van con y nghia → ghi trong DEC-015.

**Da sua**: xem DEC-015.

---

## DEC-003 — Mock adapter pattern cho service, de sau swap backend

**Ngay**: 2026-09-17.

**Boi canh**: Phase UI khong co backend that.

**Lua chon**: Service interface → MockAdapter (now) + RealApiAdapter (later).

**Ly do**:
- UI chi goi interface → sua Mock = khong anh huong UI.
- On dinh demo (khong network dependency).
- Giam "code smell" khi sau viet API that.

**He qua**:
- Phai viet interface theo domain (Auth/User/Workout/...).
- Phai persist qua AsyncStorage wrapper.
- Test service don le kiem chung hon.

---

## DEC-004 — Folder mobile rieng `mobile/`, web **chi baseline content (khong baseline visual)**

**Ngay**: 2026-09-17, **sua 2026-09-17 (lan 2)**.

**Boi canh**: Trong workspace chi co repo frontend web.

**Lua chon**: Tao `mobile/` o root, khong sua `src/`.

**Ly do**:
- Web la nguon chuẩn cho **content, fields, validation, business logic, role behavior** (kiem ke trong `current-app-audit.md`).
- Web KHONG phai nguon chuẩn cho **theme, layout, navigation, components, copy visual** (user yeu cau 2026-09-17).
- Decoupling → khi sau tach repo rieng khong phai tach visual theo.

**He qua**:
- Fixtures (default users, posts, certificates) co the copy logic nhung khong copy CSS class names / theme tokens.
- Design system, screen specs, components, icons → viet moi, khong tham chieu style web.

**Sua lan 2**:
- Bo cum tu "giu web lam baseline reference" vi tu nguy hiem → sua thanh "web chi baseline content, khong baseline visual" theo yeu cau user.

---

## DEC-005 — Persistence can thiet de demo cross-user (local multi-user)

**Ngay**: 2026-09-17.

**Boi canh**: Web hien tai sync A↔B qua localStorage in-memory. Mobile can cung hanh vi.

**Lua chon**: `mobile/src/services/localDb.ts` giu nhieu user account, cross-user service cap nhat nhieu account khi demo.

**Ly do**:
- Pattern cross-user (A gui loi moi → B nhan) la chuc nang can kiem tra tren UI.
- Tren 1 device, chi co the demo bang nhieu account trong cung local DB.
- Tap lai logic da co trong `App.jsx` nhung API/luu tru doc lap voi web.

**He qua**:
- Phan biet ranh: localDb chi de demo UI. Sau co backend that, service swap backend → localDb chi con o `mocks/`.
- Cross-user demo se duoc ghi trong acceptance checklist (MOB-106).

---

## DEC-006 — Knowledge reward simulation TRONG app, co canh bao "demo only"

**Ngay**: 2026-09-17.

**Boi canh**: Web co interval moi 4s gia lap reaction cho post knowledge.

**Lua chon**: Giu nguyen hanh vi + them marker "Day la simulation, khong phai diem that".

**Ly do**:
- Day la 1 part cua "FITMATE_FEATURE" → phai giu de parity.
- User can biet day khong phai diem that de tranh hieu lam.

**He qua**:
- Co canh bao noi trong post knowledge badge.
- Co toast ro rang khi diem tang.

---

## DEC-007 — Bo emulator shell (FP-034, FP-036) khi migrate

**Ngay**: 2026-09-17, **sua 2026-09-17 (lan 2)**.

**Boi canh**: Web co phone-emulator 380x780px, notch, home indicator chi de demo desktop.

**Lua chon**: Bo tat ca tren Android that.

**Ly do**:
- Android that co native status bar, nav bar, edge-to-edge.
- Notch tu thiet bi, khong can gia.
- Home indicator chi cho iPhone X+.
- Shell do chi nen vai tron (design-cue) → khong lien quan den nghiep vu.

**He qua**:
- File `src/index.css` duoc giu nguyen (web baseline) → khong sua.
- Android app khong co shell wrapper.

**Sua lan 2**: giai thich ro shell chi la cosmetic → khong can "baseline" ve visual.

---

## DEC-008 — Khong goi production API / dich vu tra phi trong phase nay

**Ngay**: 2026-09-17.

**Boi canh**: User muon tap truoc, integration sau.

**Lua chon**: Tat ca POST/GET su dung mock. Link `http://localhost:8080/api/...` se bi bo (fallback local).

**Ly do**:
- Khong yeu cau backend.
- Tranh leak data development ra production.
- Tranh dot nhien goi dich vu tra phi (vision AI, ...) trong demo.

**He qua**:
- Service interface co 2 adapter, mock luon kich hoat.

---

## DEC-009 — Chung chi: admin simulate chi de demo UI

**Ngay**: 2026-09-17.

**Boi canh**: PT co nut admin "Duyet / Reset" de test flow cert.

**Lua chon**: Giu nguyen + ghi ro "Demo only".

**Ly do**:
- UI can verify toan bo flow verified/pending/unverified.
- Production se co admin tool that; demo phase khong can.

**He qua**:
- Admin panel chi hien khi `isSelf === true` → an toan.

---

## DEC-010 — [HUY] Thay the boi DEC-016 (Expo Router thay cho React Navigation)

**Ly do huy**:
- Quyet dinh goc dua tren React Navigation vanilla + gorhom bottom-sheet.
- Sau nghiên cưu Expo docs (https://docs.expo.dev/router/introduction/, ngay 2026-09-17), Expo Router cung:
  - File-based routing giong Next.js → giam code boilerplate.
  - Native-stack duoc build-in (tren React Native Screens) → khong can React Navigation native-stack rieng.
  - Typed routes (auto).
  - Deep linking mac dinh.
- Expo Router yeu cau Expo Go; project da la Expo → khong conflict.

**Da sua**: xem DEC-016.

---

## DEC-011 — Phase 1 (Foundation) truoc phase 2 (critical path) truoc phase 3+

**Ngay**: 2026-09-17.

**Boi canh**: nhieu task dependency.

**Lua chon**: Lam theo phase (MOB-001 → MOB-101 → ...).

**Ly do**:
- Tranh base khong on dinh → phai sua nhieu.
- Token + nav + service truoc → UI build nhanh.

**He qua**:
- Phai verify Phase 1 tren emulator truoc khi MOB-101.

---

## DEC-012 — [SUA LAN 2] Web emulator shell: KHONG sua, va tokens web KHONG su dung cho mobile

**Ly do sua**:
- Quyet dinh cu nguy hiem vi ngam dinh "tokens web" la baseline. Tokens web (CSS var `--accent-green`...) chi ap dung cho `src/index.css`, khong import sang mobile.
- Mobile tokens (file `theme/tokens.ts`) phai duoc thiet ke doc lap voi web.

**Noi dung sua**:
- File `src/index.css` duoc giu nguyen → luu y CHI cho web development, khong phai baseline design cho mobile.
- Mobile tokens → xem DEC-015.

---

## DEC-013 — [SUA LAN 2] Khi gap conflict content web ↔ mobile, **web chi baseline content** (KHONG baseline visual)

**Ngay sua**: 2026-09-17.

**Ly do sua**:
- Quyet dinh cu viet "web la baseline" → co the hiểu nham thanh baseline visual.
- Sau yeu cau user, phan biet ro:
  - Baseline content: fields, validation, business logic, role behavior.
  - Khong baseline: theme, layout, navigation, components.

**Noi dung sua**:
- Neu gap content conflict → giu theo web audit + ghi trong `decisions.md`.
- Neu gap visual → mobile tu quyet theo DEC-015, **khong tham chieu web**.

---

## DEC-014 — Acceptance criteria PASS truoc khi set DONE

**Ngay**: 2026-09-17.

**Boi canh**: nhieu parity ID, de quen case.

**Lua chon**: Moi task phai check `acceptance-checklist.md` de set DONE.

**Ly do**:
- Tranh UI "dep nhung sai" → parity giam.
- Co bang chung cu the (line, behavior, ...).

**He qua**:
- Phase 6 (MOB-200..202) la verification tong the truoc release.

---

## DEC-015 — [HUY] Bo, thay the boi DEC-019

**Ngay huy**: 2026-09-17 (lan 2, sau DEC-019).

**Ly do huy**:
- Quyet dinh chon "Calm Modern" (dark navy + teal-mint) dua tren gia dinh dark theme tot cho data-heavy app.
- User quyet dinh ngay 2026-09-17 (lan 2): light theme la mac dinh, khong can 2 theme. Vi the DEC-015 khong con hieu luc.
- Ly do "contrast AAA toan app" trong DEC-015 chi dung tren 3 cap token, khong phai verify app-wide → can sua thanh per-pair khi implement.

**Da sua**: xem DEC-019.

---

## DEC-016 — Expo Router (file-based) thay cho React Navigation

**Ngay**: 2026-09-17. **Thay the DEC-010**.

**Boi canh**:
- Project da la Expo (DEC-001).
- React Navigation vanilla + gorhom bottom-sheet chi phu hop project lon, tuy nhien Expo Router cung:
  - Native-stack duoc build-in.
  - File-based routing (giong Next.js).
  - Typed routes mac dinh.
  - Deep linking mien phi.
- Pattern common nhat 2026 cho Expo SDK 51+ la Expo Router, khong con React Navigation thuan.

**Lua chon**: Expo Router.

**Ly do**:
- Giam boilerplate nhieu so voi custom RootNavigator + tab stack.
- Native-stack su dung React Native Screens native primitives → performance tot.
- Typed routes giup AI implement di link dung.
- Deep linking cho phong truong hop share / referral sau.
- Bottom sheet: van dung `@gorhom/bottom-sheet` ben trong Expo Router (compat).
- Toast: react-native-toast-message OK.

**He qua**:
- Folder structure: `mobile/app/` (routes), `mobile/src/` (UI / services / mocks).
- Moi route la 1 file trong `app/` (theo Expo Router convention).
- Native-stack ben trong `app/_layout.tsx`.
- Stack ben trong nhom `(tabs)/` cho bottom nav.

**Quyet dinh bi thay the**: DEC-010 (React Navigation vanilla).

---

## DEC-017 — Nguon khi tai su dung placeholder/demo data

**Ngay**: 2026-09-17 (them moi theo yeu cau user 2026-09-17).

**Boi canh**: Web co nhieu avatar URL tu Unsplash (placeholder), post image cung tu Unsplash.

**Lua chon**: 
- **Khong** su dung lai avatar URL y het cua web (tranh "version web" lan sang).
- Dung avatar library placeholder (DiceBear, Boring Avatars API hoac generated initials) neu can.
- Post image: tao scheme color/gradient theo category (community, knowledge, achievement) thay vi anh stock.

**Ly do**:
- Tranh nham lan visual identity voi web.
- Dam bao placeholder viet cho mobile, khong copy nguyen.

**He qua**:
- Mobile co 1 placeholder library rieng (xem `mocks/avatars.ts` khi implement).
- Hinh anh se duoc generate/sketch theo chu de cua post, khong copy Unsplash URL cu.

---

## DEC-018 — Ngon ngu trong UI

**Ngay**: 2026-09-17.

**Boi canh**: Web UI hien tai tieng Viet (một số comment từ user cu, vi du "Hùng (Bạn)" trong App.jsx). User noi chuyen tieng Viet.

**Lua chon**: 
- UI chinh: **tieng Viet** (giong web) → giu parity content.
- Code, comment, docs: **tieng Viet** chinh, tieu diem ky thuat co the tieng Anh khi can.
- Khi co gia tri placeholder → `Demo` / `Mau` (vi du: ten "Nguoi dung A", "PT A", ...). Tranh danh thuc.

**Ly do**:
- Giu parity content cho user Viet.
- Tranh placeholder gia su that user.

**He qua**:
- Token name viet API → tieng Anh (chuẩn ky thuat).
- Hien thi trong UI → tieng Viet.

---

## DEC-019 — Huong thiet ke "Soft Energy" (light theme, light-only)

**Ngay**: 2026-09-17. **Thay the DEC-015**.

**Boi canh**:
- User yeu cau ngay 2026-09-17 (lan 2): light theme la mac dinh. Khong can 2 theme (khong so sanh sang/toi).
- User chi chot huong nen sang; chua chot mau thuong hieu → AI tu nghien cuu, de xuat, chon.
- Phai dam bao: sang, gon, than thien va co ca tinh fitness; doc tot so lieu + form dai; phan cap ro bg/surface/content; mau nhan tiet che; khong trang phang toan bo; khong giong dashboard quan tri.

**Nguon nghien cứu da truy cap thanh cong (2026-09-17)**:
- https://play.google.com/store/apps/details?id=com.strava (Strava: Run, Bike, Walk — Strava Inc., 4.6 stars, 1.18M reviews, light theme mac dinh, 180M active users).
- https://www.hevyapp.com/ (Hevy: workout tracker — 16M athletes, 4.9 stars, light theme, intuitive workout logging).
- https://www.cronometer.com/ (Cronometer: nutrition tracking, science-backed, 95 nutrients, light neutral + warm tone, AI photo logging + barcode scan + voice log).
- https://www.nike.com/ntc-app (Nike Training Club: holistic training — mindset + movement + nutrition + recovery + sleep, light theme, workout scheduling).
- https://www.fitbit.com/global/us/home (Fitbit: light surface, AMOLED displays).
- https://developer.android.com/about (Android 17, Jetpack Compose, Material 3 design systems).
- https://expo.dev/blog (Expo Modules 2.0, EAS Simulator, 2026-09-14).

**Nguon KHONG truy cap duoc (ghi ro ly do)**:
- https://m3.material.io/ — timeout.
- https://m3.material.io/styles/color/roles — chi tieu de.
- https://developer.android.com/design — timeout.
- https://developer.android.com/training/material-design — 404.
- https://developer.android.com/develop/ui/views/theming/themes — timeout.
- https://m2.material.io/design/color/the-color-system.html — timeout.
- https://play.google.com/store/apps/details?id=com.strong.liftsix — 404.
- https://play.google.com/store/apps/details?id=com.hevyapp.hevy — 404.
- https://www.whoop.com/ — Cloudflare block.
- https://apps.apple.com/us/app/strong-workout-tracker-gym-log/... — timeout.
- https://callreact.com/blog/fitness-app-design — 500.
- Mobbin — can dang nhap.

**Han che phien nay**: khong the interact app that; pattern chi dua tren public listing + landing. Can verify contrast/visual bang emulator khi implement.

**3 bang mau da xet**:

| Huong | Nen chinh | Primary | Nhan | Rating |
|---|---|---|---|---|
| A — Warm Fitness (Cronometer + Nike) | `#FAF8F4` warm cream | `#E76F2C` warm orange | `#3B7A57` forest green + `#7C3AED` violet | OK — de generic cron, doi tuong it phan biet member/PT |
| B — Cool Clean (Strava + Hevy) | `#FFFFFF` pure white | `#FC4C02` Strava orange (signature) | `#1B5E9C` cool blue + `#0F766E` teal | TRUNG BINH — pure white giong dashboard quan tri (user yeu cau tranh) |
| C — Soft Energy (Notion + Cronometer neutral + warm) | `#FAFAF7` off-white warm | `#0F766E` deep teal | `#7C2D12` warm sienna + `#9333EA` violet | TOT — phan cap 3 tier, ca tinh fitness, doc tot form, khong generic |

**Lua chon**: C — Soft Energy.

**Ly do (theo tieu chi user)**:
1. **Sang, gon, than thien, ca tinh fitness**: off-white warm `#FAFAF7` mem hon pure white (user yeu cau khong trang phang); deep teal `#0F766E` gợi suc khoe/can bang (Cronometer-style tinh te), khong generic enterprise dashboard.
2. **Doc tot so lieu + form dai**: `onSurface #1A1A1F` dat 16.58:1 tren page bg (verified WCAG 2.1) → text ro ret, khong chói khi doc profile/coach intake forms.
3. **Phan cap ro**: 5 tier depth (`surface` → `surfaceContainerLowest` → `surfaceContainerLow` → `surfaceContainer` → `surfaceContainerHigh` → `surfaceContainerHighest`) cho the de xep information hierarchy + selected/pressed/hover states.
4. **Mau nhan tiet che, primary thong tri**: primary teal duy nhat dung cho CTA chinh (Bắt đầu, Lưu, Đặt lịch) + focus ring + selected. Sienna/violet tiet che, khong canh tranh visual weight voi primary (xem DEC-020).
5. **Khong trang phang**: warm tone + multi-tier container + 1dp outlineVariant border tao depth ma khong shadow nang.
6. **Khong dashboard quan tri**: giu warm + boi mau nhan teal/sienna/violet → tap the thao/suc khoe (Cronometer, Nike, Strava deu theo huong nay).

**Bang mau chi tiet (M3 color roles, light-only)** — token values da verify:

| Token | Hex | Vai tro | Contrast verify |
|---|---|---|---|
| `surface` (page bg) | `#FAFAF7` | Page background (off-white warm) | — |
| `surfaceContainerLowest` | `#FFFFFF` | Cards, sheets, modal body | — |
| `surfaceContainerLow` | `#F4F2ED` | Subtle card variant, list item hover | — |
| `surfaceContainer` | `#EEEBE4` | Selected bg | — |
| `surfaceContainerHigh` | `#E5E2DA` | Strong hover bg, pressed bg | — |
| `surfaceContainerHighest` | `#DAD6CC` | Divider emphasis | — |
| `onSurface` | `#1A1A1F` | Body text | AAA (16.58:1 tren surface) |
| `onSurfaceVariant` | `#45474C` | Secondary text | AAA (8.89:1) |
| `onSurfaceDisabled` | `#8E939B` | Disabled / hint | CHI AA-large/UI (2.95:1) — chi dung cho placeholder + caption, KHONG button label |
| `outline` | `#5C5750` | Hairline / focus ring | AAA UI (7.16:1 tren card) |
| `outlineVariant` | `#858078` | Card border subtle 1dp | AA-large/UI (3.75-3.92:1) |
| `primary` | `#0F766E` | Brand CTA (deep teal) | AA text (5.47:1 vs white) |
| `onPrimary` | `#FFFFFF` | Text on primary | — |
| `primaryContainer` | `#D5EFEB` | Selected chip, focus ring inner | — |
| `onPrimaryContainer` | `#0A3D38` | Text in primary container | AAA (10.00:1) |
| `secondary` | `#7C2D12` | Streak warm accent (tiết chế) | AAA vs white (9.37:1) |
| `onSecondary` | `#FFFFFF` | Text on secondary | — |
| `secondaryContainer` | `#FFE7D6` | Streak badge bg | — |
| `onSecondaryContainer` | `#3A1606` | Text in secondary container | AAA (13.61:1) |
| `tertiary` | `#9333EA` | Achievement / gamification (CHỉ khi cần) | AA (5.38:1) |
| `onTertiary` | `#FFFFFF` | Text on tertiary | — |
| `tertiaryContainer` | `#F3E8FF` | Achievement bg | — |
| `onTertiaryContainer` | `#4A1A75` | Text in tertiary container | AAA (10.50:1) |
| `error` | `#B91C1C` | Destructive | AA (6.47:1) |
| `onError` | `#FFFFFF` | Text on error | — |
| `errorContainer` | `#FEE2E2` | Error bg | — |
| `onErrorContainer` | `#5A0F0F` | Text in error container | AAA (11.39:1) |
| `success` | `#15803D` | Success toast border + text | AA (5.02:1 vs card) |
| `warning` | `#B45309` | Warning callout | AA (5.02:1 vs card) |
| `info` | `#1D4ED8` | Info pill | AA (6.70:1 vs card) |

**Luu y quan trong ve contrast**: cac so contrast tren trong bang la **verified bang cong thuc WCAG 2.1 relative luminance** trong planning phase. So lieu that se verify lai khi implement (WebAIM contrast checker / Material Theme Builder / Android Studio accessibility inspector). KHONG tuyen bo "toan app AAA" — chi ghi theo tung cap verify duoc (xem `design-system.md` Section 2 de biet day du per-pair).

**He qua**:
- File `mobile/src/theme/tokens.ts` chi khai bao light theme, KHONG co dark mode toggle.
- Token names van theo M3 convention de co the them dark variant sau neu user yeu cau (mapping M3 Token Studio).
- Inter font giu (DEC-015 nguyen nhan typography); spacing/radius/elevation M3 idiomatic.
- Vai tro mau nhan sienna/violet → xem DEC-020.
- Web tokens trong `src/index.css` giu nguyen, khong lien ket (xem DEC-004).

**Quyet dinh bi thay the**: DEC-015 (Calm Modern, dark).

---

## DEC-020 — Vai tro mau nhan secondary (sienna) va tertiary (violet)

**Ngay**: 2026-09-17. **Lam ro DEC-019**.

**Boi canh**:
- User yeu cau ngay 2026-09-17 (lan 3): primary teal giu vai tro CTA chinh va selected. Sienna dung tiet che cho streak/diem nhan am. Violet chi cho achievement khi co nhu cau thuc te.
- Trong phase UI, cac pattern can biet ro: secondary co phai CTA cạnh tranh voi primary khong? tertiary co xuat hien mac dinh khong?

**Quyet dinh**:

### Secondary sienna `#7C2D12`

- **Vai tro chinh**: streak warm accent (FP-005 streak badge, "ngay tap lien tuc", achievement warm hint).
- **Vai tro phu**: macro bar Carb/Fat (warm color vs Protein primary).
- **KHONG dung**:
  - Lam CTA cạnh tranh voi primary (neu co secondary button filled → su dung `secondaryContainer` bg thay, khong phai `secondary` filled).
  - Lam link color (link dung `primary`).
  - Lam nav indicator (nav indicator dung `primaryContainer`).
- **Pattern hợp lệ**:
  - Icon streak badge: `secondary` icon tren `secondaryContainer` bg.
  - Macro bar carb: `secondary` fill tren track `surfaceContainerHigh`.
  - Spec chip PT: `secondaryContainer` bg + `onSecondaryContainer` text.

### Tertiary violet `#9333EA`

- **Vai tro chinh**: achievement / gamification (FP-005 unlock, medal, level up, badge earn, VIP tier neu co).
- **Vai tro phu**: PT verified hero tint (Profile PT verified → `tertiaryContainer` bg hero).
- **CHI xuat hien khi**:
  - User vua unlock achievement.
  - Profile PT da verify (verified badge + hero).
  - VIP tier neu phase sau co gamification.
  - Medal/badge earn tren SocialScreen.
- **KHONG dung**:
  - Mac dinh tren moi man (chi xuat hien o vi tri co nhu cau that).
  - Lam nav indicator, link, button default.
  - Phase UI hien tai khong co gamification → tertiary CHI xuat hien tren PT verified hero + verify badge. KHONG xuat hien o cho khac.
- **Pattern hợp lệ**:
  - Profile PT verified hero: `tertiaryContainer` bg top 25% screen.
  - PT role chip: `tertiaryContainer` bg + `onTertiaryContainer` text.
  - Verify badge icon: `tertiary` icon tren `tertiaryContainer` bg.

### Vai tro mau nhan khong dung

- **Khong co "quaternary"** trong phase UI. Neu can mau thu 4 → khai bao token moi trong `design-system.md` voi ly do cu the.
- **Khong co neutral-on-neutral** accent. Neu can phan biet noi bat content → su dung `onSurface` vs `onSurfaceVariant`.
- **Khong hardcode hex inline**. Token names moi can ghi trong `design-system.md` truoc.

**Ly do**:
- Primary thong tri → giam cognitive load, giong pattern light-first app thuc te (Strava, Hevy, Cronometer deu chi 1 brand color).
- Sienna/violet tiet che → khong canh tranh visual weight voi CTA chinh → nguoi dung tap primary de hanh dong quan trong.
- PT verified mau rieng → phan biet role nhanh (HV vs PT verified vs PT pending vs PT unverified).

**He qua**:
- Token names M3 (`secondary`, `tertiary`) giu nguyen nhu spec — chi lam ro usage constraint.
- `design-system.md` Section 2 ghi ro "Su dung secondary sienna" va "Su dung tertiary violet" voi pattern cho phep.
- `screen-specs.md` Section 5.1-5.3 content parity checklist chi ra token dung cho moi block.
- Neu phase sau them gamification → DEC-020 cap nhat de cho phep tertiary xuat hien o vi tri cu the (streak unlock, badge earn, level up).
- Neu phase sau them dark theme → token values secondary/tertiary se khai bao rieng cho dark variant.

---

## DEC-021 — Bottom navigation safe area: dung `useSafeAreaInsets()`, khong hardcode

**Ngay**: 2026-09-18. **Ap dung tu MOB-407**.

**Boi canh**:
- Android gesture bar 3 nut de len icon/label cua bottom tab → kho doc va cham nham.
- Web khong co van de nay.

**Quyet dinh**:
- Su dung `useSafeAreaInsets()` tu `react-native-safe-area-context`.
- `tabBarHeight = 48 + Math.max(insets.bottom, 12)`.
- `paddingBottom = insets.bottom` de icon/label nam tren gesture bar.
- `tabBarHideOnKeyboard: true` de khong bi de khi nhap text.
- Nen tab bar co the mo rong xuong vung he thong (cho dep), nhung phan tuong tac phai nam tren vung do.
- State `ready` de tranh flicker khi insets chua kip tinh lan dau.

**Ly do**:
- Padding co dinh (8dp, 16dp) se sai tren moi thiet bi (Pixel 7, Samsung Galaxy, Pixel 3a deu khac).
- Hardcode 48dp cho gesture bar se che len status bar tren thiet bi khong co gesture bar.

**He qua**:
- `app/(tabs)/_layout.tsx` da sua.
- Khi tich hop backend/sau, screen khac cu co fixed paddingBottom cua bottom CTA can kiem tra lai voi new tab bar height.

---

## DEC-022 — Doanh thu PT: phí 10% tren so tien THUC TRA (sau giam gia), ghi nhan khi completed

**Ngay**: 2026-09-18. **Ap dung tu MOB-408**. **Thay the moi chi dan truoc do** ve phi/hoan tien neu co.

**Boi canh**:
- User yeu cau ro chinh sach fee/revenue de trien khai Doanh thu PT.
- Cu can tich hop backend that (sau phase nay) thi backend la nguon tham quyen.

**Quyet dinh**:

### Phi nen tang
- `FEE_RATE_BPS = 1000` (= 10%).
- `calcFeeAndPT(amount)`:
  - `fee = Math.round(amount * 0.10)` (lam tron 0.5 len).
  - `ptShare = amount - fee` (de tong luon khop).
- Vi du: 500k → fee 50k → PT 450k.

### Giam gia
- Phi tinh tren so tien THUC TRA sau giam gia hop le.
- Vi du: 500k giam 50k → thuc tra 450k → fee 45k → PT 405k.
- Khong tinh giam gia lan nua neu model da luu so tien cuoi cung.
- Khong tu xay he thong voucher moi neu app chua co.

### Thoi diem ghi nhan
- Booking chua thanh toan → khong tinh.
- Da thanh toan nhung chua hoan thanh → chi vao "Cho hoan thanh".
- Da thanh toan VA da hoan thanh → ghi nhan phan PT tai `completedAt`, 1 lan cho moi booking.
- Trang thai completed phai den tu luong hien co hoac du lieu demo ro rang, KHONG tu danh dau vi het gio.

### Huy va hoan tien
- Booking chua thanh toan bi huy → khong phat sinh.
- Da thanh toan bi huy truoc hoan thanh → hoan toan bo, PT 0.
- Sau hoan thanh: hoan 1 phan → giam phi + phan PT tuong ung; hoan toan bo → phi va phan PT con lai = 0.
- Refund pending/failed → KHONG ghi nhan dieu chinh thanh cong.
- `refundAdjustment` duoc ghi TAI THOI DIEM refund succeeded, KHONG sua lich su thang truoc.
- Thu nhap ky hien tai co the am (khi nhieu refund).
- Man hinh doanh thu KHONG tu tao hoac duyet hoan tien, KHONG hien thi thong tin ngan hang, KHONG co nut thu tien/rut tien.

### Lam tron & chong trung
- Tien dung so nguyen VND. Lam tron 0.5 len.
- Luu `feeRateBps` snapshot tai booking de khong tinh lai tu config hien tai.
- Nhieu lan hoan: tinh phi con lai tu so tien thuc tra con lai.
- Khong cong trung booking khi retry payment.
- Tong hoan thanh cong khong vuot so tien da thanh toan.

### Phan quyen
- `canAccessRevenue(user) = user.profile.isPt === true`.
- Client check chi la UI/UX. Khi tich hop backend, backend van la nguon tham quyen ve quyen + so lieu.

**He qua**:
- `src/features/pt-revenue/revenueCalculations.ts` chua toan bo cong thuc.
- `__tests__/revenueCalculations.test.ts` 33 test PASS.
- `app/(modals)/revenue/` la UI; `drawer.tsx` chi hien thi menu cho PT.
- Backend sau nay KHONG nen override client logic — client chi hien thi so lieu backend cung cap, KHONG tu tinh tien.

