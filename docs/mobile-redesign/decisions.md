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
2. **Doc tot so lieu + form dai**: onSurface `#1A1A1F` dat 16.6:1 tren page bg → text ro ret, khong chói khi doc profile/coach intake forms.
3. **Phan cap ro**: 3 tier depth (page bg `#FAFAF7` → card `#FFFFFF` → container `#F4F2ED`/`#EEEBE4`) tao information hierarchy ro ret.
4. **Mau nhan tiet che**: primary teal chi dung cho CTA chinh (Bắt đầu, Lưu, Đặt lịch). Streak/achievement dung secondary sienna hoac tertiary violet → tranh canh tranh visual weight.
5. **Khong trang phang**: warm tone + multi-tier container + 1dp outlineVariant border tao depth ma khong shadow nang.
6. **Khong dashboard quan tri**: giu warm + boi mau nhan teal/sienna/violet → tap the thao/suc khoe (Cronometer, Nike, Strava deu theo huong nay).

**Bang mau chi tiet (M3 color roles, light-only)**:

| Token | Hex | Vai tro |
|---|---|---|
| `surface` (page bg) | `#FAFAF7` | Page background (off-white warm) |
| `surfaceContainerLowest` | `#FFFFFF` | Cards, sheets, modal |
| `surfaceContainerLow` | `#F4F2ED` | Subtle card variant |
| `surfaceContainer` | `#EEEBE4` | Sub-card / selected bg |
| `surfaceContainerHigh` | `#E5E2DA` | Strong hover bg |
| `surfaceContainerHighest` | `#DAD6CC` | Outline tint |
| `onSurface` | `#1A1A1F` | Body text |
| `onSurfaceVariant` | `#45474C` | Secondary text |
| `onSurfaceDisabled` | `#8E939B` | Disabled hint |
| `outline` | `#7A7570` | Hairline |
| `outlineVariant` | `#D7D2CB` | Subtle border |
| `primary` | `#0F766E` | Brand CTA (deep teal) |
| `onPrimary` | `#FFFFFF` | Text on primary |
| `primaryContainer` | `#D5EFEB` | Filled chip / CTA ghost |
| `onPrimaryContainer` | `#0A3D38` | Text in primary container |
| `secondary` | `#7C2D12` | Streak / warm alt CTA |
| `onSecondary` | `#FFFFFF` | Text on secondary |
| `tertiary` | `#9333EA` | Achievement / gamification |
| `onTertiary` | `#FFFFFF` | Text on tertiary |
| `tertiaryContainer` | `#F3E8FF` | Achievement bg |
| `error` | `#B91C1C` | Destructive |
| `onError` | `#FFFFFF` | Text on error |
| `errorContainer` | `#FEE2E2` | Error bg |
| `success` | `#15803D` | Success toast |
| `warning` | `#B45309` | Warning callout |
| `info` | `#1D4ED8` | Info pill |

**Luu y quan trong ve contrast**: cac so contrast (AAA) ghi trong `design-system.md` chi la **minh hoa** tu cung cap M3 color roles. Phai verify bang tool (WebAIM contrast checker / Material Theme Builder) khi implement. KHONG tuyen bo "toan app AAA" — chi ghi theo tung cap verify duoc.

**He qua**:
- File `mobile/src/theme/tokens.ts` chi khai bao light theme, KHONG co dark mode toggle.
- Token names van theo M3 convention de co the them dark variant sau neu user yeu cau (mapping M3 Token Studio).
- Inter font giu (DEC-015 nguyen nhan typography); spacing/radius/elevation M3 idiomatic.
- Web tokens trong `src/index.css` giu nguyen, khong lien ket (xem DEC-004).

**Quyet dinh bi thay the**: DEC-015 (Calm Modern, dark).
