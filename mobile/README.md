# Fitmate Android (React Native + Expo + TypeScript)

> Ung dung Android chinh cua Fitmate. Giao dien duoc chuyen tu Stitch sang React Native.

## Stack

- Expo SDK 57 (React Native 0.86, React 19.2.3, Expo Router 5).
- TypeScript strict.
- Theme: Soft Energy (light-only) — xem `../docs/mobile-redesign/decisions.md` DEC-019, DEC-020.
- Icons: `lucide-react-native` (xem DEC-001).
- Storage: `@react-native-async-storage/async-storage` + `expo-secure-store` cho tokens.
- Bottom sheet: `@gorhom/bottom-sheet`.
- State: React Context + hooks (phase 1, se danh gia Zustand neu can).

## Setup local (se chay sau khi Phase 1 commit)

```bash
cd mobile
npm install
npx expo start
```

Sau do quet QR bang Expo Go (Android) hoac mo emulator Android.

## Cau truc

```
mobile/
├── app/                  <- Expo Router (file-based routing)
│   ├── _layout.tsx       <- RootStackProvider + ThemeProvider
│   ├── index.tsx         <- Root index (redirect den tabs hoac auth)
│   ├── (auth)/
│   ├── (tabs)/
│   └── (modals)/
├── src/
│   ├── theme/            <- tokens.ts, ThemeProvider.tsx, types.ts
│   ├── components/       <- primitive UI (Button, Card, Chip, Input, ...)
│   ├── features/         <- auth, dashboard, nutrition, workout, ...
│   ├── services/         <- storage wrapper, mock services
│   ├── mocks/            <- fixtures (users, posts, cert)
│   ├── utils/            <- BMI, calorie, time formatter
│   └── navigation/       <- typed route helpers
├── assets/               <- icon, splash (placeholder)
├── app.json
├── package.json
├── tsconfig.json
└── expo-env.d.ts
```

## Phase tracking

- Phase 1 (MOB-001..005): foundation (this commit).
- Phase 2 (MOB-101..118): critical path (Dashboard, Nutrition, Workout, Social, Marketplace).
- Phase 3 (MOB-119..135): remaining screens + edit + advanced.
- Phase 4..6: tests, polish, verify, release.

Chi tiet: `../docs/mobile-redesign/tasks.md`.

## Lien he

- Docs plan: `../docs/mobile-redesign/`
- Visual baseline: `../design-reference/stitch-export/`
- Content migration history: `../docs/mobile-redesign/` va lich su Git
- AGENTS.md (rules): `../AGENTS.md`
