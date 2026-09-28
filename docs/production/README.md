# Android — production integration

## AI handoff update — 2026-09-23
Nhóm AI dự kiến giao `.pt` cho backend; format/runtime/I/O chưa chốt. Android tích hợp qua API BE, không tự nhúng model hoặc chọn inference SDK. MOB-804/807 chuẩn bị input/loading/error/unavailable và thao tác manual độc lập; chỉ hiển thị kết quả thật khi capability được bật. Không dựng DTO từ giả định về file `.pt`; chờ BE-801/817 chốt contract sau bàn giao. Nguồn chuẩn: repo FitmateAI_BE, `docs/backend-release/ai-contract.md` và `ai-handoff-checklist.md`.

Plan từng task: [MOB-800..808](plans/README.md).
Baseline PROD-2026-09-22-v1. Root app chạy: mobile/. Owner client: mobile developer.
Đọc [business requirements](business-requirements.md), [shared rules](shared-business-rules.md), [integration plan](integration-plan.md).
Bản rules là snapshot BE, không sửa độc lập. contract-baseline.json ghi revision/hash cần đối chiếu khi nhận BE mới.
UI hiện tại là prototype; tài liệu này không tuyên bố backend endpoints mới đã implemented.

## Trạng thái contract quan sát ngày 2026-09-28

- OpenAPI BE tồn tại tại `FitmateAI_BE/docs/backend-release/openapi/fitmate-v1.yaml`; revision/hash chính xác nằm trong `contract-baseline.json`.
- BE-801..807, BE-811..816 và BE-819 được backend task ledger ghi VERIFIED. Điều này cho phép bắt đầu adapter theo từng operation đã có trong OpenAPI, không biến toàn bộ mobile thành VERIFIED.
- BE-808..810/BE-400 (payOS và settlement), BE-817 (AI capability), BE-826 (UAT ba repo) và BE-827 (release) còn gate mở.
- Static audit phát hiện một số runtime controller chưa được phản ánh trong OpenAPI. Đọc [mobile API readiness](mobile-api-readiness.md); không tự đoán route/DTO từ controller hoặc requirement.
- Quy tắc triển khai và bảo mật bắt buộc: [Stitch to React Native production rules](../design/stitch-react-native-rules.md).

## Điều kiện bắt đầu tích hợp
BE-801 đã công bố spec/DTO baseline. Chỉ tích hợp operation hiện diện trong OpenAPI và có gate module phù hợp; contract gap được ghi BLOCKED thay vì tự tạo endpoint. Không chờ toàn BE xong để chuẩn bị adapters; không tự gọi production.
Giữ style/navigation riêng của app; không lấy theme admin làm chuẩn. Giữ dữ liệu/flow hiện có; cờ unavailable không biến thành fake success.
Thay email-based route/key bằng UUID: profile/[email], edit-profile/[email], booking/[email], certificates/[email], chat/[email] cần migration routes/deep links; chat destination dùng conversationId.
Không còn User.password trong runtime persisted model. Mock fixtures chỉ build dev explicit, không fallback khi API lỗi.

## Màn hình → dữ liệu và hành động
| Màn/route hiện tại | Nội dung phải giữ/bổ sung | Nguồn BE / gate |
|---|---|---|
| (auth)/login, register | role selection Member/PT, fields hiện có, validation; verify/resend/forgot/reset; locked/session-expired | BR-01 / BE-802 |
| dashboard | avatar/name, calorie target/intake/burned riêng, macros, streak, upcoming, quick actions; reward/VIP unavailable rõ | BR-10 / BE-813 |
| profile/edit/chuyen-sau | tên/avatar/bio/goal/phone/birthday/gender/height/weight; bệnh/dị ứng/training days/times; owner vs public projection | BR-02 / BE-804 |
| marketplace/PT profile | chuyên môn/kinh nghiệm/dịch vụ/giá/rating/reviews/verification; search/filter/loading/empty | BR-04 / BE-806 |
| certificates + PT tools | cert name/organization/date/code/type/image, trạng thái/lý do; services/availability edit của PT | BR-04 / BE-806 |
| booking/appointments | PT/service/location/timezone/slot/quote; hold countdown server expiry; payment và appointment badges riêng; accept/start/complete/cancel/reschedule theo role | BR-05/06 / BE-807..809 |
| revenue/index, revenue/[bookingId] | PT-only gross/fee10%/share/refund/pending/recognized/payable/paid; filters/chart/history/detail timeline | BR-07 / BE-810 |
| workout | weekly plans/create/edit/delete, exercise type/sets/reps/duration/rest/instructions/media | BR-08 / BE-811 |
| workout-session/history | time/reps/rest player, pause/resume/audio/checkpoint; per-set partial/skipped, snapshot/start version; offline sync status | BR-08 / BE-811 |
| weight/history | value/date/unit/timezone, past measurements, chart and cursor pagination | BR-08 / BE-811 |
| nutrition | manual log/edit/delete; calories/macros/portion/meal assignment/schedule; scan candidate→edit→confirm | BR-09 / BE-812 |
| social/create-post | content/image/link/tags/visibility/knowledge, comments/reactions, delete/report/block; no reward simulation | BR-11 / BE-814 |
| friends/search/chat | UUID search public fields, pending requests/cross-request, existing history after unfriend, unread/read marker | BR-11 / BE-814 |
| notifications | inbox/read, expired/deleted targets, pagination, safe deep link; device lifecycle | BR-12 / BE-815 |
| settings/support | theme preferences/notifications/timezone, password/logout/export/delete, support ticket/contact/privacy | BR-03/15 / BE-805/819 |
| AI Companion/adaptive/scan | chỉ enabled khi BE capability + artifact thật; unavailable có manual fallback | BR-13 / BE-817 |
| vip/withdraw/rewards | giữ product inventory; không ví thật/checkout/đổi điểm khi chưa enable; khác doanh thu PT | BR-17 / BE-829 |
| drawer/tabs/bottom sheet | preserve actions, safe-area, keyboard, Android back, touch target; không bị gesture bar che | Client-only QA |

## API adapter và offline
- Generated wire types tách khỏi UI domain.ts; map exact enum/field và unknown/null, không email-as-id.
- Query cache partition theo account; logout/lock/delete hủy in-flight và clear cache, drafts/queue encrypted hoặc xóa theo consent.
- Không đem offline queue user A gửi bằng token user B. Session client_id tạo một lần và giữ nguyên qua retry.
- Request timeout/cancel; exponential retry chỉ khi an toàn, giữ Idempotency-Key cho retry mutation. 409 reload state + giải thích, không tự ghi đè.
- 401 refresh single-flight một lần; 403/404/429/503 UI phân biệt. Offline không báo đã lưu server; show pending/failed/retry.
- Refresh token secure storage; access token memory; không log token/health/chat/photo. Public env chỉ base URL/capability config không secret.
- Signed media URL hết hạn lấy lại qua authorized endpoint; persist storageKey, không persist ảnh cert public.
- Thanh toán mở provider flow, return/deep-link không tự set Paid; poll BE với timeout và background resume.
- Timer dùng deadline và local checkpoint, backend chỉ giữ snapshot/results; background/pause không tự ghi hoàn thành.
- PT revenue chỉ format số server; mọi demo revenueCalculations không là nguồn tiền production.

## UX acceptance
Loading/empty/error/offline/permission denied/session expired/disabled cho từng màn.
Form tránh double submit, giữ input khi validation lỗi, không silent truncation.
Android gesture và 3-button navigation, bàn phím, font scale, screen-reader labels, permission denied camera/gallery/push.
Push foreground/background/killed, logout đổi account, expired link và token rotation trên thiết bị thật.
Build release loại mock accounts/password/RewardSimulation, không tạo AI result tại client.


## Payment contract update — 2026-09-26
Đọc [payOS và chi PT thủ công](payment-manual-settlement.md) trước tích hợp payment/finance. User yêu cầu gọi xác nhận khách + PT và xem hồ sơ sau buổi trước duyệt; chỉ ghi paid khi có chuyển khoản thực tế. Chưa verified runtime, không bật live.
