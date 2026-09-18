# Fitmate Backend Integration (Mobile App)

> Phía Mobile App — Expo/React Native. BE đặt ở repo `FitmateAI_BE`.

## Nguồn chuẩn cho việc tích hợp BE

- **Backend tài liệu**: xem repo `FitmateAI_BE/docs/backend-release/`.
  - OpenAPI: `openapi/fitmate-v1.yaml`.
  - Android integration guide: `android-integration-guide.md`.
  - Domain rules: `domain-rules.md`.
  - Authorization matrix: `authorization-matrix.md`.
- **API base URL**: cấu hình qua `mobile/.env` (`EXPO_PUBLIC_API_BASE_URL`).

## Trạng thái tích hợp

- 2026-09-18: Tạo branch `backend-release/mobile-integration-guide`. OpenAPI có sẵn; chưa có code integration.
- Việc integrate thuộc task riêng: `INT-MOB-001..005` (xem `docs/backend-release/android-integration-guide.md` §16).
- Hiện tại mobile vẫn dùng mock in-memory (`mobile/src/services/mockUserService.ts`).

## Quy tắc khi integrate

- Không đổi UI/nghiệp vụ mobile (xem `mobile/AGENTS.md` + `docs/mobile-redesign/decisions.md` DEC-003, DEC-004).
- Chỉ thay implementation ở service layer; giữ nguyên API component.
- Mapping types: xem `mobile/src/types/domain.ts` ↔ OpenAPI schemas.
- Lưu token: `expo-secure-store` (đã có trong stack).
- Auto refresh khi 401.
- AI unavailable: trả UX fallback, không dùng fake result.

## Cấu trúc

- `mobile/src/services/apiClient.ts` — HTTP client (TODO).
- `mobile/src/services/secureStorage.ts` — secure token (đã có).
- `mobile/src/services/AuthContext.tsx` — auth provider (mock hiện tại; sẽ swap).
- `mobile/.env.example` — placeholder base URL.
