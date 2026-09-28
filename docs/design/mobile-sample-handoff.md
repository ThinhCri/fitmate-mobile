# Mobile sample handoff

Status: **IMPLEMENTED_TYPECHECK_VERIFIED**  
Notice: Batch 1 static review remediation completed. TypeScript type check passed (0 errors) and unit tests passed (46/46). Visual rendering on physical device/emulator pending user run.

## 1. Inputs & Contract Baseline

- **Stitch export**: `design-reference/stitch-export/` (visual reference).
- **Rules**: `docs/design/stitch-react-native-rules.md`.
- **Mapping**: `docs/design/stitch-to-react-native-map.md`.
- **Wire Contract**: Backend OpenAPI `fitmate-v1.yaml` (`D:\Ky8\exe201\FitmateAI_BE\docs\backend-release\openapi\fitmate-v1.yaml`).
- **Base URL Config**: `mobile/.env.example` defines `EXPO_PUBLIC_API_BASE_URL` (includes `/api/v1`).

## 2. Static Review Remediation (Batch 1)

1. **API Client & Token Storage**:
   - `mobile/src/services/secureStorage.ts`: Restored `getAuthToken()` and `setAuthToken()` using `expo-secure-store`.
   - Access tokens are strictly encrypted in `expo-secure-store` and never stored in `AsyncStorage`.
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

2. **Production Session Architecture**:
   - `mobile/src/services/session/sessionManager.ts`: Memory-only access token, SecureStore refresh token, single-flight refresh (`refreshPromise`), abort controller for request cancellation on logout/switch, fail-closed expiry listeners.
   - `mobile/src/services/secureStorage.ts`: Refresh token and user cached in SecureStore; access token strictly excluded from disk.
   - `mobile/src/services/api/types.ts`: Wire DTOs for `RegisterRequest`, `LoginRequest`, `AuthResponse`, `ForgotPasswordRequest`, `ResetPasswordRequest`, `ProblemDetails`.
   - `mobile/src/services/api/client.ts`: Automatic in-memory Bearer token injection, single-flight 401 refresh with single retry, problem details error extraction.
   - `mobile/src/services/api/authService.ts`: Typed operations for login, register, refresh, logout, forgotPassword, resetPassword with 12–128 char password policy.
   - `mobile/src/services/session/userMapper.ts`: Pure domain mapper ensuring `password: ''`, PT `isVerified: false`, and `certificate_status: 'pending' | 'unverified'`.
   - `mobile/src/services/AuthContext.tsx`: Full production session state, zero `DEMO_USERS`, zero mock success fallbacks.

3. **Stitch Authentication Screens**:
   - `mobile/app/(auth)/welcome.tsx` (a01): Welcome onboarding splash with primary "Đăng nhập" and secondary "Tạo tài khoản mới".
   - `mobile/app/(auth)/login.tsx` (a02): Login screen with email, password toggle, role auto-detection notice, real error banner, links to forgot-password and register. Zero mock shortcuts.
   - `mobile/app/(auth)/register.tsx` (a03): Registration screen with stepper, role choice chips, PT audit notice banner, 12-128 chars password policy with strength meter, and terms consent.
   - `mobile/app/(auth)/verify-email.tsx` (a04): Email verification link state with pulsing mail illustration, instructions, open email client CTA, and honest `CONTRACT_GAP` notice.
   - `mobile/app/(auth)/forgot-password.tsx` (a05): Dual-tab forgot & reset password flow wired to `POST /auth/password/forgot` and `POST /auth/password/reset` with 12-128 char validation.

## 4. Verification Evidence

1. **TypeScript Type-Check**:
   - Command: `npm run type-check` (`tsc --noEmit`)
   - Result: Exit code 0 (0 errors).

2. **Linter**:
   - Command: `npm run lint` (`expo lint`)
   - Result: Exit code 0 (0 errors, 52 warnings).

3. **Unit Tests**:
   - Command: `npm run test` (`vitest run`)
   - Result: 4 test files passed, 60/60 unit tests passed (100%).
     - `src/services/session/__tests__/sessionManager.test.ts`: 5/5 passed (memory-only token, single-flight refresh, fail-closed 401, clearSession abort, account switching).
     - `src/services/api/__tests__/authService.test.ts`: 9/9 passed (12-128 password policy, PT unverified guarantee, mock exclusion, 401 auto-refresh & single retry).
     - `src/features/workout/__tests__/sessionEngine.test.ts`: 13/13 passed.
     - `src/features/pt-revenue/__tests__/revenueCalculations.test.ts`: 33/33 passed.

4. **Commits Recorded**:
   - `2b074b0 fix(mobile): validate API contract inventory [MOB-800]`
   - `41c3189 feat(mobile): integrate production authentication [MOB-800]`
   - `9408a23 feat(mobile): implement authentication screens [MOB-800]`
   - `e8315fe test(mobile): cover session lifecycle [MOB-800]`
