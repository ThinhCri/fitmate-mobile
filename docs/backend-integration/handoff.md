# Backend Integration Status

> Mobile App — Expo/React Native.

- 2026-09-18: Pointer tạo để trỏ về BE docs. Chưa có code integration thực tế.
- 2026-10-02: Backend contract FROZEN-V1 (revision `74b223497f2a075f295644afcf5f9bcad897b66e`). OpenAPI SHA-256: `4637C6AD3A323DF062BA4B4B5C97EF3D7BEB75C475BA44FC1F4B54B8FD827804`.
- 2026-10-02: MOB-800 verified (API client, session manager, contract drift test).
- 2026-10-02: MOB-801 verified (PT services CRUD, availability UTC bounds, certificates upload, trainer marketplace).
- 2026-10-02: MOB-802 verified (Booking lifecycle, hold 5m TTL, payment intent, reschedule requests, cancellation, review, 7 screens wired). 177 unit tests pass, type-check 0 errors.

## Điều kiện

- BE local đang chạy (qua `docker compose up`).
- OpenAPI frozen: `FitmateAI_BE/docs/backend-release/openapi/fitmate-v1.yaml`.
- Contract baseline: `docs/production/contract-baseline.json`.

## Integration tasks progress

- [x] MOB-800: Contract baseline pinning and snapshot verification (commit `d715191`).
- [x] MOB-801: Profile and PT onboarding, services & availability (commit `b7ba20c`).
- [x] MOB-802: Booking, hold, payment, reschedule & review (commit `bac928e`).
- [ ] MOB-803: Workout, weight and dashboard.
- [ ] MOB-804: Nutrition and media.
- [ ] MOB-805: Social, friends, block, chat.
- [ ] MOB-806: Settings, support and deletion.
- [ ] MOB-807: Capability and legacy cleanup.
- [ ] MOB-808: Final Android release verification.
