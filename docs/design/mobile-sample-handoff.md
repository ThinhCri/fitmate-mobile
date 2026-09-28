# Mobile sample handoff

Status: **IMPLEMENTED_UNVERIFIED**  
Notice: Code changes have been statically implemented and reviewed. The user has not run verification commands yet. Do NOT report as production-ready until user-run verification passes.

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

## 3. Verification Commands for User

Per project instructions, no terminal commands or git commits were run. The user should run the following commands to verify:

```bash
# 1. Check TypeScript types
cd mobile
npm run type-check

# 2. Check ESLint
npm run lint

# 3. Start Expo with cleared cache
npx expo start -c
```
