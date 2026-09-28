# Mobile sample handoff

Status: **IMPLEMENTED_UNVERIFIED**
Notice: Static review remediations, type checks, lint checks, and unit tests passed cleanly for MOB-800 and MOB-801. Live emulator/backend verification pending runtime deployment.

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

## 4. MOB-801 PT Profile, Services, Availability & Certificates

1. **Wire Contracts & Operations**:
   - `mobile/src/services/api/types.ts`: Wire DTOs `Service`, `ServiceInput`, `ServiceUpdate`, `AvailabilitySlotInput`, `SetAvailabilityRequest`, `PtCertificate`, `UserProfileUpdate`.
   - `mobile/src/services/api/ptService.ts`: Full operations:
     - `getMyServices` (`GET /me/services`), `createService` (`POST /me/services`), `updateService` (`PATCH /me/services/{id}`), `deleteService` (`DELETE /me/services/{id}`). Handles 409 Conflict with friendly copy ("Không thể xóa/sửa dịch vụ vì đang có học viên đặt lịch chờ hoàn thành").
     - `setMyAvailability` (`PUT /me/availability`): Replaces availability array. Handles 204 No Content and 400 validation overlap error.
     - `getMyAvailability` (`GET /trainers/{id}/availability?from=&to=`): Fetches slot schedule for current PT.
     - `getMyCertificates` (`GET /me/certificates`), `submitCertificate` (`POST /me/certificates` multipart/form-data): Binary file upload with 413 Payload Too Large protection (15MB limit).
     - `updateMyProfile` (`PATCH /users/me`): Updates profile fields on server.

2. **Role Guarding**:
   - `mobile/src/components/auth/PtRoleGuard.tsx`: Role guard wrapping all PT routes. Blocks non-PT members with clear explanation and navigates back to dashboard.

3. **Stitch PT Screens**:
   - `mobile/src/features/pt/ProfileServicesPresentation.tsx` & `mobile/app/pt/profile-services.tsx` (p02): Profile header, bento stat cards, bio editor, specialties pills, active services counter, interactive active/pause switch, price/duration view, snapshot safety note, add/edit/delete service modals.
   - `mobile/src/features/pt/SchedulePresentation.tsx` & `mobile/app/pt/schedule.tsx` (p03): Week switcher, GMT+7 timezone badge, day-of-week strip, daily metric banner, day-off exception toggle with warning, booked slots locked for protection, open slots management, add interval modal with validation, replace-all save CTA with warning confirmation.
   - `mobile/src/features/pt/CertificatesPresentation.tsx` & `mobile/app/pt/certificates.tsx` (p04): Fitmate audit standards banner, saved certificate cards with verified server statuses (`approved`, `pending`, `rejected` with `reject_reason`), secure document preview watermark, 2-step certificate upload (`POST /uploads` category='certificates' then `POST /me/certificates`), strictly enforcing image-only (JPEG/PNG/WebP, max 5MB, PDF rejected).

## 5. Verification Evidence

1. **TypeScript Type-Check**:
   - Command: `npm run type-check` (`tsc --noEmit`)
   - Result: Exit code 0 (0 errors).

2. **Linter**:
   - Command: `npm run lint` (`expo lint`)
   - Result: Exit code 0 (0 errors, 44 warnings in existing legacy components).

3. **Unit Tests**:
   - Command: `npm run test` (`vitest run`)
   - Result: 5 test files passed, 81/81 unit tests passed (100%).
     - `src/services/api/__tests__/ptService.test.ts`: 12/12 passed (2-step cert upload, PDF/5MB rejection, include_inactive=true, reactivation, availability UTC bounds, 409 conflict, 204 delete).
     - `src/services/session/__tests__/sessionManager.test.ts`: 8/8 passed (session epoch, single-flight refresh, memory-only token, stale response rejection).
     - `src/services/api/__tests__/authService.test.ts`: 15/15 passed (password policy, PT unverified guarantee, mock exclusion, 401 refresh/retry, Admin MFA HTTP 202 rejection, canonical identity preservation).
     - `src/features/workout/__tests__/sessionEngine.test.ts`: 13/13 passed.
     - `src/features/pt-revenue/__tests__/revenueCalculations.test.ts`: 33/33 passed.

4. **Commits Recorded**:
   - `5755e50 fix(mobile): harden authentication session lifecycle [MOB-800]`
   - `c7863ff fix(mobile): correct authentication routing and states [MOB-800]`
   - `b7b5199 test(mobile): cover stale authentication responses [MOB-800]`
   - `9cb5179 docs(mobile): record final authentication evidence [MOB-800]`
   - `7707ca7 feat(mobile): integrate PT API contracts and client [MOB-801]`
   - `405a675 feat(mobile): implement PT screens and role guarding [MOB-801]`
   - `cf10978 docs(mobile): record MOB-801 evidence and handoff [MOB-801]`
