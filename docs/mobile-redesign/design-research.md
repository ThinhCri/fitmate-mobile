# Design Research — Tham khao va Material Design

> Muc dich: tap trend thiet ke Android hien hanh de quyet dinh visual direction. Trong phien nay khong the truy cap web (tool search HTTP fail) nen nguon duoc ghi ro nhung chi theo hieu biet da cong bo. AI moi phai verify lai truoc khi dung pattern cu the.

## Han che nguon trong phien nay

- Web search: khong tra ket qua (`web search returned error`).
- Web fetch (Material 3, Expo docs): 404.
- Vi theo **khong the trich dan URL cu the**. Phan nay la tong hop hieu biet chung (publicly known design principles) de huong decision. Khi nao co tool web, AI sau phai verify lai va cap nhat `decisions.md`.

## 1. App cung loai (quan sat chung)

### Hevy (theo hieu biet pho bien)

- **Pattern**: tab-based dashboard; tab "Today / Routines / History / Feed" + bottom nav.
- **Color**: dark theme mac dinh; accent orange/red; clean cards, plenty of whitespace.
- **Di manh**: tap bat dau set ngay trong card; pull-to-refresh.
- **Pattern dung**: REST tab bottom; weight/rep inputs quen thuoc lan can.
- **Ap dung cho Fitmate**: dashboard don gian; quick log trong card.

### Strong (theo hieu biet pho bien)

- **Pattern**: timer/giac tap chat luong cao, history graph.
- **Di manh**: micro-stat per exercise, 1-tap them set.
- **Ap dung**: workout session screen voi big tap targets, swiping tong set.

### Fitbod (theo hieu biet pho bien)

- **Pattern**: AI adaptive plan; muscle heatmap; recovery indicator.
- **Ap dung**: card "AI Thich ung" day chinh la Fitbod-style.

### MyFitnessPal (theo hieu biet pho bien)

- **Pattern**: log food = central action; macro bars; progress ring.
- **Ap dung**: nutrition ring la MFP signature; giu nguyen ring feature.

### Nike Training Club (theo hieu biet pho bien)

- **Pattern**: video-led workouts; coach image + bold call-to-action; bright accent.
- **Ap dung**: cover card style + big photo hero.

## 2. Material Design 3 — Expressive (Android 15+)

Publicly known principles (verify sau):

- **Material You dynamic color**: lay primary color tu wallpaper. Tuy nhien Fitmate muon brand nhat quan → disable dynamic.
- **Expressive color system**: roles (primary, secondary, tertiary, error, surface, surface-variant).
- **Component spec sheets**: NavigationBar / NavigationRail, BottomSheetModal, FilledButton, FilterChip, Card variants.
- **Typography scale**: display/headline/title/body/label, each co large/medium/small.

Ap dung Fitmate:

- Dung `BottomSheet` cho booking + replace meal.
- Dung `FilterChip` cho category (all/pt/member/mentor).
- Dung `NavigationBar` (5 tab bottom).
- Dung `FilledButton` / `TextButton` theo Material 3 spec.

## 3. Quyet dinh nghien cuu nay dan den (xem `decisions.md` de bi ly do)

- Chon **dark theme lam primary** de giu chat voi prototype hien tai (de chuyen nhat quan brand).
- Dung **Material 3 NavigationBar** (khong dung React Navigation bottom-tab-style de giu idiom Android).
- Dung **lucide-react-native** (API giong lucide-react) de khong phai re-design icon.
- Dung **Bottom Sheet** (Moti's `<Sheet>` hoac `@gorhom/bottom-sheet`) cho booking + replace meal + thanh toan-like flow.

## 4. Y tuong cu the ap dung cho Fitmate (ghi de AI sau implement)

### Dashboard
- Top: streak card (gradient glow khi chua hoan thanh, mat sau khi fizz-out).
- Middle: calorie ring (Material progress indicator 32px, khong phai ring-style cu).
- Bottom: 2x2 grid QuickAction cards (bo horizontal scroll neu khong can).
- Persistent FAB? **Bo** — Fitmate khong co FAB trong web, giu consistency.

### Profile
- Header: cover gradient (xanh cho member, blue cho PT verified, vang cho PT pending), avatar tròn crop 100x100dp.
- Section: Thong tin co ban → Muc tieu → Chuyen mon (PT) → Suc khoe (member) → Bai viet.
- Edit: tap icon → in-app edit screen; khong dialog.

### Workout
- Day ribbon chip theo `Material FilterChip` (selected = filled green).
- Exercise card: row, drag handle ben trai, swap/delete ben phai, tap → mo sheet.

### Nutrition
- Tab scan vs plan tren top (Material 3 segmented button).
- Macro bar ngang (Material LinearProgressIndicator) cho protein/carb/fat.

### Marketplace
- Card với cover gradient + verified badge; CTA full-width "Dat lich tap thu mien phi".

### Chat
- List avatar 56dp, ten + last message.
- Chat: bubble border radius 16dp, sender right (xanh nhe), friend left (gray).

## 5. Khoi tao va verify

- AI moi can verify URL cu the (Material 3, Expo docs, app store pages).
- Capture URL da truy cap + ngay truy cap vao muc tuong ung trong file nay.
- Neu nguon khong kha dung, ghi ro trong `handoff.md` de user biet.
