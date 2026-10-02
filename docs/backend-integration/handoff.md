# Backend Integration Status

> Mobile App — Expo/React Native.

- 2026-09-18: Pointer tạo để trỏ về BE docs. Chưa có code integration thực tế.
- 2026-10-02: Backend contract FROZEN-V1 (revision `74b223497f2a075f295644afcf5f9bcad897b66e`). OpenAPI SHA-256: `4637C6AD3A323DF062BA4B4B5C97EF3D7BEB75C475BA44FC1F4B54B8FD827804`. Integration begins with MOB-800..808 tasks.

## Điều kiện

- BE local đang chạy (qua `docker compose up`).
- OpenAPI frozen: `FitmateAI_BE/docs/backend-release/openapi/fitmate-v1.yaml`.
- Contract baseline: `docs/production/contract-baseline.json`.

## Integration tasks (active)

- MOB-800: Contract baseline pinning and snapshot verification.
- MOB-801: Auth, session, HTTP client integration.
- MOB-802: Profile, account, settings, search.
- MOB-803: Trainer marketplace and PT self-service.
- MOB-804: Booking, hold, payment, reschedule.
- MOB-805: Workout, weight, nutrition.
- MOB-806: Social, friends, block, chat.
- MOB-807: Notifications, support, PT revenue.
- MOB-808: Mock guard, contract drift test, final handoff.
