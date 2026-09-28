# Mobile API readiness — contract versus runtime

Observed: 2026-09-28  
Backend HEAD: `12b9bcab53d24aceb70e7934a406c51a0658f21d`  
OpenAPI SHA-256 (LF normalized): `E294D297B5A010DC5CAEF690B99EBA33EA402B55053BE3BE2A370129C7BB8BF9`

This is a static integration gate, not runtime evidence. The OpenAPI currently contains 93 path entries and is the only allowed source for generated mobile wire types. Controller discovery does not authorize the mobile app to invent DTOs or call undocumented operations.

## Readiness rule

- `CONTRACT_READY`: operation exists in OpenAPI and its owning BE task is eligible for integration.
- `CONTRACT_GAP`: runtime controller appears to exist, but OpenAPI does not describe the operation. Mobile may design the unavailable/loading UI but must not implement a guessed request.
- `BACKEND_GAP`: product requires the flow but neither the observed OpenAPI nor controller audit proved it exists.
- `GATED`: contract exists, but provider/UAT/operator/release evidence is still open.

## Known contract gaps found by static comparison

| Capability | Runtime evidence observed | OpenAPI status | Mobile action |
|---|---|---|---|
| Dashboard aggregate | `DashboardController`, `GET /api/v1/me/dashboard` | Missing | `CONTRACT_GAP`; do not compose fake totals from unrelated endpoints. |
| User preferences | `UserPreferencesController`, GET/PUT `/api/v1/users/me/preferences` | Missing | `CONTRACT_GAP`; retain settings UI unavailable until schema is added. |
| Account deletion/export/status/cancel | `AccountDeletionController` routes | Missing | `CONTRACT_GAP`; never promise deletion/export completion from guessed DTOs. |
| User support tickets | `SupportTicketsController` list/detail/reply/close | Missing | `CONTRACT_GAP`; do not post free-form data to an invented route. |
| Upload | `UploadsController`, `POST /api/v1/uploads` | Missing | `CONTRACT_GAP`; do not submit arbitrary storage keys/URLs. |
| Trainer reviews | `TrainerReviewsController`, GET/POST `/api/v1/trainers/{id}/reviews` | Missing | `CONTRACT_GAP`; do not show fabricated ratings/reviews. |
| Booking hold/detail/start | `BookingsController` exposes hold lookup, booking detail and start | Missing or mismatched | `CONTRACT_GAP`; do not infer body/status transition. |
| Booking confirm | Runtime exposes ID routes; OpenAPI currently has `/bookings/confirm` | Route mismatch | `CONTRACT_GAP`; backend must reconcile one canonical operation. |
| Workout plan delete and other CRUD detail | Runtime includes additional plan operations | Incomplete | `CONTRACT_GAP`; generate only documented operations. |
| Meal delete | Runtime exposes DELETE | Not observed as an OpenAPI operation | `CONTRACT_GAP`. |
| Verify/resend email | Required by BR-01 | Not observed in current OpenAPI/controller audit | `BACKEND_GAP`; onboarding must not fake verified status. |

This list is intentionally conservative and not exhaustive. Before each MOB task, compare its required operations against the exact OpenAPI revision and update this table.

## Operations with additional release gates

- Payment create/query exists in the contract, but payOS/manual finance changes remain under BE-808..810 and BE-400 re-verification. Mobile must respect `/system/capabilities` and keep live checkout disabled until evidence/operator approval exists.
- AI routes/capability shape exists, but real inference readiness is separately gated by BE-817 and the artifact handoff. No Gemini/model key belongs in mobile.
- Push registration/inbox contract exists, but device/provider credentials and end-to-end delivery remain environment/operator concerns.
- Production/staging execution remains subject to BE-826 UAT and BE-827 release gates.

## Client requirements

1. Generate or map wire types only from the pinned OpenAPI.
2. Keep wire DTOs separate from UI view models.
3. Record operationId and OpenAPI hash in each feature handoff.
4. Treat undocumented operations as unavailable; do not silently call controllers by reading their source.
5. When backend reconciles a gap, update OpenAPI first, refresh `contract-baseline.json`, then implement the mobile caller and contract tests.
