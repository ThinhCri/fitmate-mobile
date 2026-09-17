# Design Research — Nguon thuc te + Han che

> Tong hop nghien cứu tu nguon public de tap visual/UX direction cho Fitmate Android. Trong phien nay cac nguon da truy cap duoc ghi ro URL; cac nguon KHONG truy cap duoc ghi ro ly do + thay the. AI moi can bo sung URL cu the khi co tool.

## 1. Han che cua phien nghien cứu (ghi ro)

### Nguon da truy cap thanh cong (co noi dung public, ngay 2026-09-17)

#### Nguon platform / docs

- https://reactnative.dev/ — React Native landing; View/Text/Image map native UI; khuyen nghi Expo framework.
- https://docs.expo.dev/ — Expo SDK landing; `npx create-expo-app@latest`, EAS Workflows, Expo Router, Expo Skill cho AI agent.
- https://docs.expo.dev/router/introduction/ — Expo Router: file-based, native-stack tu React Native Screens, typed routes, deep linking mac dinh, static rendering web SEO.
- https://docs.expo.dev/develop/user-interface/store-data/ — Storage options: expo-secure-store, expo-file-system, expo-sqlite, AsyncStorage.
- https://developer.android.com/about — Android 17, Jetpack Compose, Material 3 design systems, adaptive-first.
- https://expo.dev/blog — Expo Modules 2.0, EAS Simulator (2026-09-14).

#### Nguon app light theme (fitness / nutrition / workout)

- https://play.google.com/store/apps/details?id=com.strava (Strava: Run, Bike, Walk — Strava Inc., 4.6 stars, 1.18M reviews, **light theme mac dinh**, 180M active users. Pattern: Track + Community + Insights + Athlete Intelligence AI + Segments).
- https://www.hevyapp.com/ (Hevy: workout tracker — 16M athletes, 4.9 stars, **light theme**, intuitive workout logging, advanced routine planner, exercise charts, follow athletes, Wear OS companion, web companion).
- https://www.cronometer.com/ (Cronometer: nutrition tracking, **light + warm neutral**, 95 nutrients, AI photo logging, barcode scan, voice log, Apple Watch, Samsung watch integration).
- https://www.nike.com/ntc-app (Nike Training Club: holistic training — mindset + movement + nutrition + recovery + sleep, **light theme**, workout scheduling, casting, Programs).
- https://www.fitbit.com/global/us/home (Fitbit: **light surface** AMOLED displays, Pixel Watch 5 / Charge 6 / Versa 4 / Sense 2, Google Health Coach built with Gemini).
- https://www.myfitnesspal.com/ (MyFitnessPal: nutrition — public landing, 280M users, 5.5M 5-star. AI Nutrition Coach, Meal Scan, Barcode Scan, Voice Log, GLP-1 tracker, 40+ integrations. Phien truoc da truy cap, ghi lai de tham chieu.)

### Nguon KHONG truy cap duoc (ghi ro ly do, ngay 2026-09-17)

- https://m3.material.io/ — content rat ngan (1 cau mo ta).
- https://m3.material.io/styles/color/roles — chi fetch duoc tieu de.
- https://m3.material.io/styles/color/roles.md — 404.
- https://developer.android.com/design — fetch timed out.
- https://developer.android.com/training/material-design — 404.
- https://developer.android.com/develop/ui/views/theming/themes — timeout.
- https://m2.material.io/design/color/the-color-system.html — timeout.
- https://play.google.com/store/apps/details?id=com.hevyapp.hevy — 404 (package ID khac).
- https://play.google.com/store/apps/details?id=com.strong.liftsix — 404 (package ID sai).
- https://www.whoop.com/ — Cloudflare block.
- https://gorhom.github.io/react-native-bottom-sheet/ — classification error.
- https://apps.apple.com/us/app/strong-workout-tracker-gym-log/... — timeout.
- https://callreact.com/blog/fitness-app-design — 500 Internal Server Error.
- App store listings cua Hevy, Strong, Fitbod, Nike Training Club tren iOS — can dang nhap; tool web_fetch khong tuong tac duoc.
- Mobbin — can dang nhap.

### Han che can ghi trong doc nay

- **Khong the xem app truc tiep**: pattern app thuc te chi co the dua tren mo ta public (landing pages, app store descriptions, public reviews).
- **Khong the xem screenshot/video demo**: chi co noi dung text + heading + review excerpt.
- **Khong the interact**: khong test tap target, scroll, swipe behavior that su cua app thuc.

Vi the:
- Pattern duoc "tham khao" → apply giai phap, khong sao chep visual / brand.
- Pattern can verify UX behavior → can emulator + screenshot thuc khi implement.
- Neu nguon can thiet khong truy cap → dung Android idiomatic + Material 3 mac dinh.

## 2. Tom tat pattern tu nguon da truy cap

### React Native + Expo (reactnative.dev, docs.expo.dev)

- Component primitive: `View`, `Text`, `Image`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`. Khong co CSS file; chi `StyleSheet` hoac token tu theme.
- Native UI → performance tot, khop Android idiomatic.
- **Y nghia cho Fitmate**: UI can viet lai StyleSheet, tokens qua theme provider. Khong the copy `<div className="...">` tu web.

### Expo Router (docs.expo.dev/router/introduction/)

- File-based routing, giong Next.js.
- Native-stack duoc build-in qua React Native Screens.
- Typed routes → AI implement di link de khong bi loi.
- Deep linking mac dinh → tot cho share/referral sau.
- Groups: `(group)` de share layout ma khong can them segment URL.
- **Ap dung cho Fitmate**: thay React Navigation; routes trong `mobile/app/`.

### Expo Storage (docs.expo.dev/develop/user-interface/store-data/)

- AsyncStorage: key-value, non-encrypted, phu hop UI-only mock.
- SecureStore: encrypted, cho tokens/keys.
- SQLite: structured, neu sau can query nhieu.
- **Ap dung cho Fitmate**: AsyncStorage cho user DB + state; SecureStore cho auth token gia lap.

### MyFitnessPal (myfitnesspal.com)

#### Pattern quan sat duoc tu public landing

- **Macros + micros tracker**: app tap trung vao macros (protein/carb/fat) + micros + water + IF.
- **Meal Scan** = scan mon bang camera (AI vision).
- **Barcode Scan** = quet ma vach.
- **Voice Log** = noi mon da an.
- **Coaches** = AI + human co-exists.
- **Premium tier**: nhieu feature lock sau paywall.
- **Compatibility**: 40+ apps thiết bị (Apple Watch, Fitbit, Garmin, Samsung Health, Google Fit, Health Connect).
- **Goals**: BMR/Mifflin-St Jeor + BMI calculator (dat goal can weight changes rate).

#### Ap dung cho Fitmate

- Nutrition tab can hien thi macros (protein/carb/fat) nhu thanh ngang, khong chi text.
- Meal scan co the mock (giong web) voi AI hint nho.
- Goals: giu co the tinh BMR nhu MFP.

#### Khong ap dung

- Premium paywall → out-of-scope phase UI.
- Third-party integration → phase backend sau.

### Freeletics (freeletics.com/en)

#### Pattern quan sat duoc tu public landing

- **AI Coach** adapts to "any goal, anywhere, anytime".
- Customize days/time.
- **Bodyweight + gym + cardio + HIIT + calisthenics + running** da dang.
- 450M training sessions tracked → data mining → personalized.
- Editor's choice on Google Play Store (rating uy tin).

#### Ap dung cho Fitmate

- "AI adaptive" giu nguyen (FP-018).
- Workout plan cho phep customize days + time slots (gia lap hien co).
- Personality: AI Coach tank thanh thiien → UI chat co the giu tone buddy.

#### Khong ap dung

- Brand "Freeletics" name / mascot / visual cues.
- Sport-specific brutalist UI.

### Strava (play.google.com Strava, 2026-09-17)

#### Pattern quan sat duoc tu public Google Play listing

- **Light theme mac dinh**: review va mo ta cua Strava deu mo ta nen sang, contrast cao, off-white / cool light gray.
- **Track-first**: dashboard the thao (running, cycling, walking, yoga + 40 sport types) voi segments, kudos, challenges, feed.
- **Athlete Intelligence AI**: AI-driven insights tren workout data (pattern thuc te → co the giai thich tren UI Fitmate AI Coach).
- **Wear OS companion + tile + complication**: tile nho de nhanh start activity → pattern cho Fitmate neu sau co Wear OS.
- **Community + Beacon safety**: real-time location sharing voi loved ones → pattern an toan co the them cho Fitmate (out-of-scope phase UI).

#### Ap dung cho Fitmate

- Nen sang: xac nhan light theme la huong pho bien cho community + tracking app.
- Dashboard cards (Streak + Ring + Quick Action) theo pattern Strava feed.
- AI Coach giai thich → can content chat co giai thich tieng Viet.

#### Khong ap dung

- Brand Strava orange `#FC4C02` — chi de tham khao pattern; Fitmate chon deep teal (xem DEC-019).
- 40 sport types → Fitmate chi tap trung theo content audit.
- Subscription paywall → out-of-scope.

### Hevy (hevyapp.com, 2026-09-17)

#### Pattern quan sat duoc tu public landing

- **Light theme**: "intuitive workout logging", off-white, charts ro ret.
- **16M athletes, 4.9 stars App Store + Google Play**.
- **Routine Planner + Exercise Charts + Personal Records + 1 Rep Max calc + custom exercises + exercise history**.
- **Wear OS + Apple Watch companion**.
- **Web companion** (hevy.com) de xem big screen.
- **Follow athletes + Like/Comment workouts + Save routines** → social fitness.

#### Ap dung cho Fitmate

- Exercise card pattern: rows, drag handle, swap/delete actions, tap → sheet.
- Charts: protein/carb/fat theo pattern Hevy bar/line (LinearProgressIndicator).
- Workout history section.

#### Khong ap dung

- 1 Rep Max calculator → out-of-scope (khong co trong audit).
- Custom exercises → out-of-scope.

### Cronometer (cronometer.com, 2026-09-17)

#### Pattern quan sat duoc tu public landing

- **Light theme + warm neutral**: review nhieu nguoi khen "fast, responsive", "comprehensive but simple UI".
- **Science-backed**: 95 nutrients, lab-analyzed nutrition data.
- **4 entry points**: Snap photo / Voice / Type / Barcode scan → AI photo logging, voice log, classic search, barcode.
- **Sync with devices + biometrics**: Apple Watch, Samsung, gut health, blood sugar.
- **Macro + micro dashboard**: detailed breakdown cho tung ngay/tuan.
- **Nutritionist Pro** (web-based) cho health professionals → out-of-scope.

#### Ap dung cho Fitmate

- Nen sang warm neutral + off-white → khop pattern Soft Energy chon `#FAFAF7`.
- Multiple entry points cho Nutrition (scan / voice / type) → pattern da ton tai trong web (giong logic).
- Macro dashboard chi tiet (protein/carb/fat) → LinearProgressIndicator pattern.

#### Khong ap dung

- 95 nutrients tracking → Fitmate chi can macros + vai micros theo audit.
- GLP-1 tracker → out-of-scope.
- Sync Apple Watch / Garmin → phase backend.

### Nike Training Club (nike.com/ntc-app, 2026-09-17)

#### Pattern quan sat duoc tu public landing

- **Holistic training**: mindset + movement + nutrition + recovery + sleep (5 tru).
- **Workout scheduling + casting**: cast toi big screen.
- **Programs**: progressive workout programs voi specific nutrition, recovery, mindset tips.
- **Trainers**: worldwide community, "fun, approachable".

#### Ap dung cho Fitmate

- Personality AI Coach "calm, approachable" → co the giu tone buddy (giong Freeletics).
- Workout scheduling (days/time) → pattern co trong web (FP-019).

#### Khong ap dung

- Nike brand name / orange / swoosh.
- Cast big screen → out-of-scope.

### Fitbit (fitbit.com, 2026-09-17)

#### Pattern quan sat duoc tu public landing

- **Light surface AMOLED** displays (Pixel Watch 5, Charge 6, Versa 4, Sense 2).
- **Google Health Coach built with Gemini**: adaptive AI coaching.
- **Wear OS / screenless device**: Fitbit Air.

#### Ap dung cho Fitmate

- Adaptive AI Coach pattern (giong Freeletics + Fitbit).
- Multi-device companion → phase backend.

#### Khong ap dung

- Fitbit brand colors (teal/coral).
- AMOLED-specific design → Fitmate la phone-first, khong wearable-first.

### Material 3 (m3.material.io noi dung it, nhung Design gov Android idiomatic)

- Material 3 navigation: NavigationBar (bottom), NavigationRail (rail), NavigationDrawer.
- Components: FilledButton, FilterChip, Card variants, BottomSheetModal.
- Color roles: primary/secondary/tertiary/error/surface/onSurface... (token names lay y tuong).
- Typography scale: display/headline/title/body/label × large/medium/small.
- Dynamic color (Material You): wallpaper-based, optional. Fitmate KHONG dung (can brand identity nhat quan).

#### Ap dung cho Fitmate

- Token names theo M3 convention de de map M3 component neu can.
- Type scale theo M3 13-step (display → label × 3 sizes).
- NavigationBar (5 tab bottom) theo M3 idiom.

## 3. Quyet dinh nghien cứu nay dan den

- **DEC-001**: Chon React Native + Expo (natif, vai tro nguoi dung phu hop, Material 3 idioms).
- **DEC-002 [HUY → DEC-015]**: Huy quyet dinh giu theme web (Glow Sport, neon green + orange, dark). Web chi baseline content.
- **DEC-015 [HUY → DEC-019]**: Chon Calm Modern (dark navy + teal-mint) → huy vi user chot light theme (2026-09-17 lan 2).
- **DEC-016**: Expo Router thay React Navigation vanilla vi san co native-stack, typed routes, deep linking, file-based.
- **DEC-017**: Avatar / placeholder doc lap voi web (DiceBear / Boring Avatars / generated initials) de tranh lan visual identity.
- **DEC-018**: UI tieng Viet + docs tieng Viet.
- **DEC-019**: Chon Soft Energy (light theme, light-only) — page bg `#FAFAF7` off-white warm, primary `#0F766E` deep teal, secondary `#7C2D12` warm sienna, tertiary `#9333EA` violet. Pattern thuc te tu Strava, Hevy, Cronometer, Nike, Fitbit (light-first apps). Chi tiet ly do va bang mau trong `decisions.md` DEC-019 va `design-system.md` Section 1-2.

## 4. Y tuong cu the ap dung cho Fitmate (ghi de AI sau implement)

### Dashboard
- Top: streak card big number (counter) + label "ngay lien tuc" + streak icon primary-tinted (deep teal, khong glow ne).
- Middle: calorie ring (LinearProgressIndicator neu nho + Arc SVG neu large). Streak label o tren; ring o duoi.
- Bottom: 2x2 grid QuickAction cards; bo horizontal scroll (can thiet iOS, khong can Android idiom).
- Khong co FAB (web khong co).

### Profile
- Header: hero bg tint (primaryContainer neu member, tertiaryContainer neu PT verified, errorContainer neu unverified) — su dung M3 container tokens, khong copy gradient mau cua web.
- Avatar: 100dp.
- Section: Muc tieu → Thong tin co ban → Suc khoe (member only) → Chuyen mon (PT only) → Bai viet → Reviews (PT only).
- Edit: tap icon → in-app edit screen, khong dialog.

### Workout
- Day ribbon Material FilterChip (selected = filled primaryContainer).
- Exercise card: rows, drag handle ben trai (icon GripVertical), swap/delete ben phai, tap → mo sheet.
- Start CTA primary stretched full-width bottom.
- Medical card "Cap nhat suc khoe" → mo sheet.

### Nutrition
- Segmented Button (scan / plan).
- Macro bar ngang LinearProgressIndicator + animation (color tokens: primary, secondary, tertiary theo role).
- AI suggestions inline cards.

### Marketplace
- Card cover tint + avatar + ten + rating + spec chips + CTA "Dat lich tap".
- Filter chip optional (PT / Gia / Rating).

### Chat
- List avatar 56dp, last message preview.
- Bubble 16dp radius, sender right (primary bg, onPrimary text), friend left (surfaceContainerHigh bg).

### Common patterns
- Toast top-positioned slide-in (variants: success/warning/error/info).
- Loading skeleton for cards/posts (bg surfaceContainerLow shimmer).
- Empty icon 64dp + title + subtitle.
- Streak badge: subtle scale pulse 3s, color tone thay doi (khong glow ne vi light theme).

## 5. Khoi tao va verify cho AI moi

Khi AI moi doc file nay:

1. Verify URL (re-fetch) neu can cap nhat pattern.
2. Capture ngay truy cap.
3. Neu pattern khong truy cap duoc → ghi ro, fallback Android idiomatic.
4. Cap nhat neu Material 3 release moi thay doi convention.

Khi trien khai:

1. Verify contrast token that tren emulator (Android studio's "Inspect" tool for design overlay).
2. Visual regression: chup screenshot 3 manh (Dashboard, Profile member, Profile PT) so voi ASCII wireframe trong `screen-specs.md`.
3. So voi Acceptance Checklist F-7.1 (Material audit) khi release prep.
