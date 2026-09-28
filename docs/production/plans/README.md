# Kế hoạch tích hợp production
Baseline PROD-2026-09-22-v1. Implementation vẫn TODO cho tới khi thực sự có evidence.
Đọc [screen/data guide](../README.md), [task tracker](../integration-plan.md), [shared rules](../shared-business-rules.md).
Dependencies BE mở theo module contract VERIFIED; chuẩn bị adapter/test được trước khi có provider credentials.

| Task | Plan |
|---|---|
| MOB-800 | [Auth/API foundation](MOB-800.md) |
| MOB-801 | [Profile và PT onboarding](MOB-801.md) |
| MOB-802 | [Booking, payment và revenue](MOB-802.md) |
| MOB-803 | [Workout, weight và dashboard](MOB-803.md) |
| MOB-804 | [Nutrition và media](MOB-804.md) |
| MOB-805 | [Social/chat/notifications](MOB-805.md) |
| MOB-806 | [Settings, support và deletion](MOB-806.md) |
| MOB-807 | [Capability và legacy cleanup](MOB-807.md) |
| MOB-808 | [Android production nghiệm thu](MOB-808.md) |

## Quy tắc tiếp tục
Không redesign ngoài scope, không fake success/mock fallback production. Tất cả fields/flows prototype còn trong inventory hoặc capability deferred rõ.
Mỗi task ghi actual route/DTO/commit/API hash, commands và screenshots sanitized; lưu vào handoff.
Được chia commit theo behavior build được; không tự commit hoặc đổi business rule server.
