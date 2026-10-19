# Fitmate mobile app

Expo SDK 57 / React Native 0.86 Android application. Use Node.js 22 and npm with the checked-in lockfile.

## Local development

```powershell
cd mobile
npm ci
Copy-Item .env.example .env
# Set EXPO_PUBLIC_API_BASE_URL to the reachable local or staging HTTPS API.
npx expo start
```

The Android emulator reaches a host-local API via `10.0.2.2`; a physical phone needs an address it can reach. Expo Go does not provide the native modules required for all Firebase Analytics and in-app purchase flows; use a development/native build for those checks. See `mobile/.env.example` for public client options and build-time file paths. Do not put payOS, SMS, database or Firebase service-account secrets into `EXPO_PUBLIC_*`.

## Local checks

```powershell
npm run type-check
npm run lint
npm test
```

Android release signing and AAB creation are separate operator steps. Keep the upload keystore outside the repository and back it up. CI intentionally performs source checks only and cannot certify device behavior, provider webhooks or Google Play billing.

## Code map

- `app/`: Expo Router screens and navigation
- `src/features/`: product features and API adapters
- `src/theme/`: mobile-specific design tokens
- `assets/`: local images and branding
- `../docs/production/`: backend contract and integration rules
- `../docs/mobile-redesign/`: design decisions, tests and handoff
