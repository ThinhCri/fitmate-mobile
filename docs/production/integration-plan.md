# Android — task tích hợp production
Baseline PROD-2026-09-22-v1. Mọi task dưới đây TODO; trạng thái prototype cũ không chứng minh integration hoàn thành.
Owner: mobile developer. Dependencies BE là gate endpoint VERIFIED, không nhất thiết phải đợi toàn backend.
Trước code: đọc docs/production/README.md, contract-baseline.json và spec đã freeze ở BE-801.
Mỗi task cần data/error/empty/loading/disabled states, role tests, contract fixtures và cập nhật handoff.

## MOB-800 — Auth/API foundation
- Plan: [Plan triển khai](plans/MOB-800.md).
- Status: TODO
- BE dependencies: BE-801/802.
- Scope: Generated types, API adapter, secure refresh, verified session, UUID routes, remove password/mock auth production.
- Acceptance: 401/logout/locked flow không leak cache, login/verify/reset gọi staging thật.
- Evidence: chưa có; khi hoàn tất ghi commit, commands, environment, API revision, screenshots/test report.

## MOB-801 — Profile và PT onboarding
- Plan: [Plan triển khai](plans/MOB-801.md).
- Status: TODO
- BE dependencies: BE-804/806/816.
- Scope: Giữ toàn bộ profile/extended fields; avatar/cert upload private; dịch vụ/lịch rảnh/reviews.
- Acceptance: Owner/public khác nhau, không mất survey, PT pending không nhận booking.
- Evidence: chưa có; khi hoàn tất ghi commit, commands, environment, API revision, screenshots/test report.

## MOB-802 — Booking, payment và revenue
- Plan: [Plan triển khai](plans/MOB-802.md).
- Status: TODO
- BE dependencies: BE-807/808/809/810/400.
- Scope: Checkout server quote, hold expiry, accept/start/complete/cancel/reschedule, provider return polling; revenue PT server.
- Acceptance: Luồng100k→10k/90k và refund/payout hiển thị đúng; không mark Paid từ deep link.
- Evidence: chưa có; khi hoàn tất ghi commit, commands, environment, API revision, screenshots/test report.

## MOB-803 — Workout, weight và dashboard
- Plan: [Plan triển khai](plans/MOB-803.md).
- Status: TODO
- BE dependencies: BE-811/813.
- Scope: Plan CRUD, session snapshot/per-set, offline queue identity, chart/weight/pagination/streak.
- Acceptance: Plan sửa/xóa vẫn giữ lịch sử, offline retry đúng một session, timer/background không tự complete.
- Evidence: chưa có; khi hoàn tất ghi commit, commands, environment, API revision, screenshots/test report.

## MOB-804 — Nutrition và media
- Plan: [Plan triển khai](plans/MOB-804.md).
- Status: TODO
- BE dependencies: BE-812/816.
- Scope: Manual meal create/edit/delete/schedule/portion, upload, scan conditional/manual fallback.
- Acceptance: AI unavailable không chặn manual; totals khớp logs; signed URL renew có auth.
- Evidence: chưa có; khi hoàn tất ghi commit, commands, environment, API revision, screenshots/test report.

## MOB-805 — Social/chat/notifications
- Plan: [Plan triển khai](plans/MOB-805.md).
- Status: TODO
- BE dependencies: BE-814/815.
- Scope: Friends/search/pending invites/posts/comments/report/block; polling bounded/read marker; push lifecycle.
- Acceptance: Account switch không lộ data/push; block chặn send, history giữ; retries không duplicate.
- Evidence: chưa có; khi hoàn tất ghi commit, commands, environment, API revision, screenshots/test report.

## MOB-806 — Settings, support và deletion
- Plan: [Plan triển khai](plans/MOB-806.md).
- Status: TODO
- BE dependencies: BE-805/819.
- Scope: Preferences/privacy/terms/support tickets, delete/export/logout everywhere; public deletion URL.
- Acceptance: Không fake sent; device/cache revoke; deletion có trạng thái và hỗ trợ nghĩa vụ tài chính.
- Evidence: chưa có; khi hoàn tất ghi commit, commands, environment, API revision, screenshots/test report.

## MOB-807 — Capability và legacy cleanup
- Plan: [Plan triển khai](plans/MOB-807.md).
- Status: TODO
- BE dependencies: BE-817/829.
- Scope: AI/VIP/rewards gates, remove runtime RewardSimulation/demo seeds; keep feature inventory; licensed media attribution.
- Acceptance: Enabled chỉ khi backend verified; UI unavailable trung thực, không bỏ trường âm thầm.
- Evidence: chưa có; khi hoàn tất ghi commit, commands, environment, API revision, screenshots/test report.

## MOB-808 — Android production nghiệm thu
- Plan: [Plan triển khai](plans/MOB-808.md).
- Status: TODO
- BE dependencies: BE-826/827.
- Scope: Release build/typecheck/tests, emulator/device safe-area/keyboard/a11y/offline/deep links; signed AAB/internal testing.
- Acceptance: E2E core BR + no P0/P1, manifest app/BE/spec revisions và operator Play approval.
- Evidence: chưa có; khi hoàn tất ghi commit, commands, environment, API revision, screenshots/test report.

Không commit thay đổi người khác. Commit tiếng Anh <=72 ký tự, không Co-authored-by; hỏi message theo rule được áp dụng.


## Payment contract update — 2026-09-26
Đọc [payOS và chi PT thủ công](payment-manual-settlement.md) trước tích hợp payment/finance. User yêu cầu gọi xác nhận khách + PT và xem hồ sơ sau buổi trước duyệt; chỉ ghi paid khi có chuyển khoản thực tế. Chưa verified runtime, không bật live.
