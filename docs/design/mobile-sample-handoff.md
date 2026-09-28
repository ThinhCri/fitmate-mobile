# Mobile sample handoff

Status: **MOB-800_COMPLETED_AND_VERIFIED**
Notice: MOB-800 Phase A hardening is fully complete. TypeScript type check passed (0 errors), ESLint passed (0 errors), and unit tests passed (66/66). Session lifecycle hardened with epoch generation counters, Admin MFA 202 rejection, and clean routing. Ready for MOB-801 (Phase B).

## 1. Inputs & Contract Baseline

- **Stitch export**: `design-reference/stitch-export/` (visual reference).
- **Rules**: `docs/design/stitch-react-native-rules.md`.
- **Mapping**: `docs/design/stitch-to-react-native-map.md`.
- **Wire Contract**: Backend OpenAPI `fitmate-v1.yaml` (`D:\Ky8\exe201\FitmateAI_BE\docs\backend-release\openapi\fitmate-v1.yaml`).
- **Base URL Config**: `mobile/.env.example` defines `EXPO_PUBLIC_API_BASE_URL` (includes `/api/v1`).

## 2. Static Review Remediation (Batch 1)

1. **API Client & Token Storage**:
   - `mobile/src/services/secureStorage.ts`: Restored `getAuthToken()` and `setAuthToken()` using `expo-secure-store`.
   - Access tokens are strictly in-memory; refresh tokens are encrypted in `expo-secure-store` and never stored in `AsyncStorage`.
   - `mobile/src/services/api/client.ts`: Removed non-existent `getStoredToken` from `storage.ts`. Standardized on `EXPO_PUBLIC_API_BASE_URL`.
   - Stripped trailing slashes to guarantee no duplicate `/api/v1/api/v1` path concatenation.

2. **Wire DTOs & Dedicated Mappers**:
   - `mobile/src/services/api/types.ts`: Defined exact snake_case wire DTOs matching OpenAPI:
     - `PTPublicProfile` (`id`, `full_name`, `avatar_url`, `specialty`, `experience_years`, `price_per_session_vnd`, `rating`, `reviews_count`, `certificate_status`).
     - `PTPublicDetail` (`bio`, `services: Service[]`, `reviews: Review[]`).
     - `AvailabilitySlot` (`id`, `slot_start_utc`, `slot_start_local`, `duration_minutes`, `status`).
     - `ListTrainersResponse` (`items: PTPublicProfile[]`, `nextCursor?: string | null`).
     - No invented fields (`hasMore`, `total`, `certificates`, `availableDays`, `availableTimeSlots` removed).
   - Created dedicated mappers (`mapPTPublicProfileToSummary`, `mapPTPublicDetailToDetail`, `mapAvailabilitySlotToViewModel`) translating wire DTOs to camelCase view models.

3. **Availability Contract**:
   - `mobile/src/services/api/trainersService.ts`: `getTrainerAvailability(id, { from, to })` enforces mandatory `from` and `to` query parameters required by OpenAPI.

4. **Dashboard Production Route**:
   - `mobile/app/(tabs)/dashboard.tsx`: Removed `memberHomeFixture` import from production route.
   - Recorded `CONTRACT_GAP`: Backend lacks an atomic aggregate `/me/dashboard` endpoint in OpenAPI. Production screen displays an honest explanation and routes to functional modules (`/nutrition`, `/marketplace`, `/workout`).
   - Fixed route target to `/(tabs)/workout` (was `/(tabs)/workouts`).
   - Development preview fixture is strictly confined to `sample-preview.tsx`.

5. **Marketplace Route & Pagination**:
   - `mobile/app/(tabs)/marketplace.tsx`: Completely removed mock fallback catch block. Errors now render legitimate error/offline states.
   - Wired cursor-based pagination via `nextCursor` and FlatList `onEndReached`.
   - Documented `CONTRACT_GAP`: OpenAPI `GET /trainers` does not have a search parameter; in-page filtering applies across loaded items.

6. **Trainer Detail**:
   - `mobile/src/features/trainer/TrainerDetailPresentation.tsx` & `mobile/app/(modals)/trainer/[id].tsx`: Strict UUID parameter.
   - Renders actual `services` and `reviews` from `PTPublicDetail`.
   - Booking and chat CTAs are explicitly marked as capability-gated (`disabled`) until MOB-801 integration. Removed mock `console.log`.

7. **Preview Sandbox**:
   - `mobile/app/sample-preview.tsx`: Separated into `SamplePreviewRoute` and `DevSamplePreviewContent` to prevent conditional return before React hooks.

## 3. MOB-800 Production Authentication & Screens

1. **Stitch Full Inventory Mapping**:
   - `docs/design/stitch-to-react-native-map.md`: Verified all 54 Stitch screens against backend OpenAPI `fitmate-v1.yaml`. Flagged gaps with `CONTRACT_GAP`, `CAPABILITY_GATED`, `LOCAL_UI`, or `CONTRACT_READY`.

2. **Production Session Architecture & Hardening**:
   - `mobile/src/services/session/sessionManager.ts`:
     - Monotonic `generation` epoch counter preventing race conditions across account switches or stale async callbacks.
     - Memory-only access token; SecureStore refresh token and cached user summary.
     - Single-flight refresh (`refreshPromise`) coalesces concurrent 401s into exactly one network call.
     - Active AbortController: logout (`clearSession`) or account switch (`setSession`) increments generation and aborts any pending refresh or request.
     - Old refresh promises safely discarded if generation changed during network await.
   - `mobile/src/services/api/client.ts`:
     - Intercepts requests and validates `generation` matches at completion. Throws `AbortError` if session changed mid-flight.
     - Single 401 retry with single-flight refresh; fails closed on persistent 401.
     - RFC 7807 `ProblemDetails` error extraction prioritizing `detail` over `title`.
   - `mobile/src/services/api/authService.ts`:
     - Intercepts Admin MFA response (`HTTP 202` `mfaRequired` or `mfaSetupRequired`) and throws `AdminMfaNotSupportedError`, directing admins to Web Admin.
     - Enforces 12–128 character password policy on register and resetPassword.
   - `mobile/src/services/session/userMapper.ts`:
     - Maps Wire DTOs and `UserSummary` to domain `User`. Enforces `password: ''`, PT `isVerified: false`, and `certificateStatus: 'pending' | 'unverified'`.
   - `mobile/src/services/AuthContext.tsx`:
     - Fail-closed initialization and login: HTTP 401/403/404 clears session immediately; HTTP 403 sets honest account lock/suspension error.
     - Blocks Admin role on mobile and clears session immediately.
   - `mobile/app/index.tsx`:
     - Replaced unconditional `__DEV__` preview with explicit `EXPO_PUBLIC_ENABLE_SAMPLE_PREVIEW === 'true'`.
     - Directs unauthenticated users cleanly: first time to `/(auth)/welcome`, returning users to `/(auth)/login`.

3. **Stitch Authentication Screens**:
   - `mobile/app/(auth)/welcome.tsx` (a01): Welcome onboarding splash with primary "Đăng nhập" and secondary "Tạo tài khoản mới". Sets `has_seen_welcome = true`.
   - `mobile/app/(auth)/login.tsx` (a02): Login screen with email, password toggle, role auto-detection notice, real error banner, links to forgot-password and register. Zero mock shortcuts.
   - `mobile/app/(auth)/register.tsx` (a03): Registration screen with stepper, role choice chips, PT audit notice banner, 12-128 chars password policy with strength meter, and terms consent.
   - `mobile/app/(auth)/verify-email.tsx` (a04): Email verification link state with masked email, honest availability copy without technical jargon, and external mail app opener.
   - `mobile/app/(auth)/forgot-password.tsx` (a05): Dual-tab forgot & reset password flow wired to `POST /auth/password/forgot` and `POST /auth/password/reset` with 12-128 char validation.

## 4. Verification Evidence

1. **TypeScript Type-Check**:
   - Command: `npm run type-check` (`tsc --noEmit`)
   - Result: Exit code 0 (0 errors).

2. **Linter**:
   - Command: `npm run lint` (`expo lint`)
   - Result: Exit code 0 (0 errors).

3. **Unit Tests**:
   - Command: `npm run test` (`vitest run`)
   - Result: 4 test files passed, 66/66 unit tests passed (100%).
     - `src/services/session/__tests__/sessionManager.test.ts`: 8/8 passed (memory-only token, single-flight refresh, fail-closed 401, clearSession abort, account switching, pending refresh cancellation, stale refresh response rejection, epoch generation preservation).
     - `src/services/api/__tests__/authService.test.ts`: 12/12 passed (12-128 password policy, PT unverified guarantee, mock exclusion, 401 auto-refresh & single retry, Admin MFA HTTP 202 challenge/setup rejection, account-switch in-flight abort).
     - `src/features/workout/__tests__/sessionEngine.test.ts`: 13/13 passed.
     - `src/features/pt-revenue/__tests__/revenueCalculations.test.ts`: 33/33 passed.

4. **Commits Recorded**:
   - `5755e50 fix(mobile): harden authentication session lifecycle [MOB-800]`
   - `c7863ff fix(mobile): correct authentication routing and states [MOB-800]`
   - `b7b5199 test(mobile): cover stale authentication responses [MOB-800]`
   - `docs(mobile): record final authentication evidence [MOB-800]`
