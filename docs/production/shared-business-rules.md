> Snapshot từ FitmateAI_BE, PROD-2026-09-22-v1. Nội dung mục tiêu, không phải implementation status. Không sửa độc lập.

# Fitmate — Quy tắc nghiệp vụ production
Baseline PROD-2026-09-22-v1; thay đặc tả cũ bị mâu thuẫn. Xem DEC-051 trong [decisions.md](../../../FitmateAI_BE/docs/backend-release/decisions.md).
Đây là hành vi mục tiêu cần triển khai/kiểm thử, không phải mô tả mọi code đang có.

## 1. Identity, roles và ownership
- ID API là UUID; email là thuộc tính có thể thay đổi, không phải khóa quan hệ hoặc quyền.
- Member quản lý dữ liệu mình; PT có quyền Member và quản lý dịch vụ/lịch/doanh thu riêng.
- verified là trạng thái kiểm định PT, không phải role do client được set.
- Đăng ký PT tạo hồ sơ chờ duyệt; không tự verified hoặc tự cấp Admin. Admin bootstrap qua CLI không password mặc định.
- Public được xem marketplace/public PT fields; health/chat/contact riêng không public.
- Service layer enforce role + ownership; không tin isSelf/isPt/userId do client truyền.
- Token hợp lệ không đủ nếu account locked/pending_deletion/deleted hoặc session đã revoked.
- Register/forgot/resend không tiết lộ email đã tồn tại. Mật khẩu không lưu/log/echo qua DTO.
- Mật khẩu tối thiểu 12 ký tự, tối đa 128 (BE `Fitmate.Domain.Common.PasswordPolicy`, chốt 2026-09-28). Mọi client — mobile, web, admin — phải dùng cùng ngưỡng này; không hardcode số riêng. Áp dụng cho mật khẩu MỚI, không buộc tài khoản cũ đổi.
- Email verification/reset token single-use, có TTL; resend rate limit. Reset/đổi mật khẩu revoke các phiên khác và rotate phiên hiện tại.
- Member/PT chưa verify chỉ có quyền hoàn tất onboarding, verify và logout; không payment/post/chat/upload cho tới verify.
- Admin TOTP MFA trước full session, recovery codes hash dùng một lần; khóa/xóa admin cuối cùng bị chặn.
- Mobile refresh token qua secure storage; web qua HttpOnly Secure cookie với CSRF/Origin protection. Không đưa refresh token vào localStorage.
- Token TTL, lockout, reset TTL được ghi trong config/contract và tests, không nhân bản số khác nhau giữa FE/BE.

## 2. Hồ sơ và dữ liệu cá nhân
Owner fields: name, avatar, bio, goal, phone, birthday, gender, height_cm, timezone; weight hiển thị lấy từ lần đo hợp lệ mới nhất.
Extended: medicalConditions, medicalNotes, allergies, allergySurveyDone, trainingDays/trainingTimes.
PT bổ sung specialties, experienceYears, services, certificates; price hiển thị phải gắn dịch vụ, không dùng một giá hồ sơ mơ hồ để thu tiền.
Null là chưa cung cấp; không biến null thành 0 kg/0 tuổi hoặc tự điền dữ liệu sức khỏe.
Public profile: UUID, tên hiển thị/avatar/bio và PT public fields; không trả email/phone/birthday/medical survey.
Đổi email có verify và chống chiếm account; đổi password/role audit và revoke sessions.
Hồ sồ/cert chỉ được gắn storage object đúng owner/category; không gắn URL bất kỳ của người khác. Storage key phải tự mang scope owner (BE nhúng userId vào key) và server kiểm lại scope khi client submit — không tin key do client tự gửi.

## 3. Booking — ba state machine độc lập
AppointmentStatus: Held, Pending, Confirmed, InProgress, Completed, Cancelled, Expired.
PaymentStatus: Pending, Paid, Failed, PartialRefunded, Refunded.
RefundStatus: Pending, Succeeded, Failed.
Late là attendance flag; reschedule là event. Refund không phải AppointmentStatus.
Client không PATCH status tùy ý; transition đi qua command có guard + audit.

| Chuyển | Actor/trigger | Guard và kết quả |
|---|---|---|
| none → Held | Member hoặc PT đặt PT khác | Dịch vụ active, PT verified, không self-book; atomic giữ interval; TTL 5 phút |
| Held → Pending | Verified payment settlement | Payment đúng merchant/amount/currency/booking; hold còn hợp lệ; không cần app còn mở |
| Held → Expired | Worker | TTL hết, chưa settlement hợp lệ; giải phóng slot |
| Pending → Confirmed | PT của booking accept | Đã Paid, slot vẫn thuộc booking, chưa hết acceptance deadline |
| Pending → Expired | Worker | PT chưa accept trước min(paid_at + 24h, slot_start); yêu cầu refund toàn bộ |
| Confirmed → InProgress | PT explicit start | Paid; không trước slot_start - 5 phút; không auto-start chỉ vì đồng hồ |
| InProgress → Completed | PT explicit complete | Sau slot_end; không dispute đang mở; client retry không nhân revenue |
| Held/Pending/Confirmed/InProgress → Cancelled | Participant hoặc Admin | Chưa Completed; lý do; tạo refund nếu đã Paid; audit |

- Chỉ bán slot bắt đầu ít nhất 30 phút sau thời điểm tạo hold; 30 phút/24 giờ là mặc định sản phẩm mới, cấu hình versioned và công bố trước checkout.
- IPN và expiry cùng lúc serialize bằng transaction/lock; verify payment đến muộn không chiếm slot đã cấp cho người khác. Ghi tiền đã nhận và tạo case refund/đối soát, không báo booking confirmed.
- Browser return chỉ là UX hint; client poll payment/booking. /bookings/confirm nếu giữ để tương thích phải idempotent, không tin client nói Paid.
- Không giữ DB transaction trong lúc gọi payment provider. Outbox/provider attempt có recovery sau crash.
- Chống overlap khoảng [start,end), không chỉ unique start time. Hold/booking cùng PT phải có DB-backed concurrency guard.
- Đổi lịch: participant tạo request; bên còn lại accept. Giữ slot cũ tới khi atomically chiếm slot mới; thất bại không mất slot cũ.
- Baseline giữ cùng booking ID, append event old/new/actor/reason; không clone payment/doanh thu. previous_booking_id chỉ cho dữ liệu thay thế legacy.
- Nếu thay service/giá: không sửa snapshot đã trả tiền; hủy/refund và đặt mới.
- Quá giờ không tự Complete, không tự phạt no-show. Participant mở support/dispute; admin xử lý có chứng cứ/audit.

## 4. Money, refunds, earnings và settlement PT
- Tiền integer VND; tính server bằng checked integer/decimal; reject overflow/ngoài range.
- Snapshot: listed, discount, actual_paid, fee_bps=1000, fee, PT_share, policy_version.
- Payment amount phải bằng server quote (listed - discount), không lấy amount/fee client làm chuẩn.
- Fee = round-half-up(actual_paid * 1000 / 10000); PT_share = actual_paid - fee.
- Ví dụ 100.000đ → fee 10.000đ, PT 90.000đ. GMV không phải doanh thu nền tảng.
- Ghi nhận doanh thu khi Paid + Completed. Paid chưa Completed là chờ ghi nhận. Sau refund, đọc ledger để điều chỉnh chứ không biến doanh thu về 0 bằng enum check.
- Chưa thanh toán: hủy không refund. Đã Paid trước Completed: refund toàn bộ, không phí phạt.
- Completed: refund theo admin review/dispute, có reason và financial idempotency.
- Refund Pending không được báo đã hoàn. Chỉ provider/reconciliation xác nhận mới Succeeded.
- Tổng refund successful + reserved pending không vượt actual_paid; transaction chống hai refund đồng thời.
- Phân bổ lũy kế: fee_refunded = round-half-up(original_fee * cumulative_refund / actual_paid); PT_refunded = cumulative_refund - fee_refunded. Mỗi lần ghi delta, full refund đảo đúng toàn bộ. actual_paid=0 không chia.
- Giữ original recognition và adjustment ở kỳ phát sinh; không rewrite báo cáo kỳ trước.
- Mặc định đề xuất Fitmate chịu provider fee riêng; không trừ âm thầm vào 90% PT. Chi phí này tách khỏi gross platform fee.
- PT revenue chỉ owner: gross, fee, share, refunds, pending recognition, recognized net, available payable, processing payout, paid out.
- Payout != refund != reward withdrawal. Không hiển thị available payable như đã chuyển khoản.
- Settlement baseline: admin lập batch thủ công hàng tuần cho phần completed đủ 7 ngày, không tranh chấp; có statement, account verification, reference chuyển tiền và xác nhận độc lập.
- Trước khi chi, kiểm tra refund/dispute pending; một ledger item không vào hai payout. Refund sau payout tạo debit/negative payable kỳ tới, không sửa lịch sử payout.
- Merchant capability, điều khoản/PT banking và quy trình chi cần operator duyệt trước thu tiền thật (OPS-03).
- Phí 10% read-only ở admin; thay policy tương lai cần version/audit, không đổi snapshot cũ.

## 5. Workout và cân nặng
- Plan owner-only CRUD, nhiều plan/ngày được phép. Delete plan không cascade session.
- Session giữ snapshot phiên bản đã bắt đầu; offline client snapshot phải validate và đánh dấu source, không pretend server-verified.
- Exercise reps yêu cầu target_reps >0; time yêu cầu target_duration_sec >0. Không quy reps thành giây.
- rest_sec giữa hiệp, rest_after_sec chuyển bài. Timer/pause/audio là FE.
- Mỗi set: index duy nhất, completed/partial/skipped, actual_reps hoặc actual_duration_sec đúng loại. Unknown là null, không tự đổi thành 0.
- Extra sets explicit; completedSets derive từ sets. Session completion theo ngày/timezone, không cờ completed vĩnh viễn trên plan.
- client_id body unique(owner,client_id) bền vững, cộng Idempotency-Key header theo contract. Retry same payload trả record cũ; khác payload 409; soft-delete không cho retry hồi sinh bản ghi.
- Media phải có license/source/attribution và trường cơ chính/phụ có review. Không scrape asset app khác hoặc hứa hiệu quả y tế.
- Weight decimal kg (range 20..400 là giới hạn sản phẩm); recorded_at do client hoặc server now, created_at do server; reject future >5 phút, cho phép backfill lịch sử.
- Nhiều lần đo/ngày; chart lấy lần cuối theo timezone. List cursor default50/max100; stable recorded_at,id.
- Calories burned là ước tính; không dùng làm tín dụng tiền hoặc reward thật.

## 6. Dinh dưỡng và dashboard
- Manual meal luôn dùng được; date/time/meal slot, food name, serving quantity/unit, calories/protein/carbs/fat và source rõ.
- Khẩu phần scale các nutrient cùng base quantity; retry update không nhân đôi.
- Scan trả candidate/estimate/confidence khi provider có; user chỉnh và confirm mới ghi nhật ký.
- Không dùng ảnh AI chưa confirm để cộng calories; allergy profile là dữ liệu tự khai, không đảm bảo món an toàn.
- Meal schedule và logged meals là hai khái niệm; xóa/sửa meal cập nhật aggregate.
- Dashboard phân biệt target/intake/exercise expenditure; công thức không tự coi intake - exercise là chẩn đoán.
- Streak: ngày local có >=1 completed workout; nhiều session cùng ngày chỉ 1; retry không tăng; historical backfill recompute theo ngày, không tăng qua click.
- RewardPoints prototype chưa có giá trị tiền; cấm dùng RewardSimulation trong production.

## 7. Social, friend và chat
- Post public/friends/private kiểm tra ở mọi list/detail/media; report không tự block/lock.
- Report targets Post/Comment/User/Certificate; PT là User. Chỉ được report target được phép thấy.
- Friend request UUID recipient; một pending pair kể cả ngược chiều. Cross-request 409 và offer accept.
- Friendship canonical pair + CHECK/UNIQUE; unfriend xóa relation, không xóa chat/booking.
- Block directed; chặn friend/send/comment/reaction/direct interaction cả hai chiều, ẩn feed/profile tương tác; không lộ ai block ai.
- Booking/payment lịch sử vẫn participant-access, thông báo giao dịch vẫn hoạt động.
- Chat chỉ friend không blocked được send; sau unfriend/block vẫn xem history của mình.
- Message client_message_id do client giữ ổn định; duplicate khác payload 409. Kiểm tra scope có sender để hai người không chiếm key nhau.
- Read marker theo per-conversation monotonic sequence (mục tiêu); timestamp-only không đủ khi hai tin cùng timestamp. UUID chỉ là tie-breaker trong cursor, không thời gian.
- GET không mark read; marker không lùi giữa thiết bị; unread không đếm tin của mình.
- Transaction check lại không tự chứng minh race-safe: implement shared lock/serialization phù hợp cho send/block và accept/block, test PostgreSQL thật.
- Admin chỉ đọc evidence người báo cáo cung cấp qua case được audit; không có API đọc tùy ý mọi private chat/health.
- Polling có giới hạn ở release đầu; websocket không bắt buộc.

## 8. Notifications
- In-app notification và push delivery là hai tài nguyên khác nhau; push disabled không phá inbox.
- Friend request created → recipient; accepted → sender. Rejected/unfriend/block không notify target; moderation warning gửi user liên quan.
- Domain mutation, notification/outbox phải atomic và unique dedup. Không gọi provider trong transaction.
- Token mã hóa giải mã được; hash để lookup, không dùng hash làm destination.
- Một active token/provider/installation không đồng thời thuộc nhiều user; đăng ký lại/refresh/logout phải atomic và revoke đúng session/installation.
- Kiểm tra owner, active, block, validity và expiry ngay trước gửi.
- TTL 24 giờ tính từ source event, retry không gia hạn; sweep 30 phút theo batch, không là điều kiện duy nhất chặn expired send.
- Disabled → skipped có audit, không backlog vô hạn; enabled nhưng thiếu cấu hình → lỗi rõ; deferred có expiry.
- Không claim exactly-once push; dedup nội bộ/per-device và provider outcomes.
- Lock-screen payload tối thiểu, không health/chat/payment details. Deep link vẫn re-authorize.

## 9. Storage và privacy
- Upload category/owner/entity gắn metadata; server-generated key; kiểm magic bytes, MIME, size, path traversal, quota; strip metadata ảnh nhạy cảm.
- Avatar public opt-in; certificate file private dù approved, chỉ public metadata/trạng thái. Thay quy tắc cũ public cert để tránh lộ số/PII.
- Post media theo visibility; meal/cert/health private; chỉ cấp signed URL sau authorization. TTL tối đa 15 phút.
- Local persistent volume cho dev. Production cần durable media + backup/restore đã chứng minh; không dùng ephemeral container disk.
- Chưa hỗ trợ video/audio upload thì reject rõ, không quảng cáo hỗ trợ chỉ vì DTO có URL.
- Account deletion: revoke sessions/devices ngay, ngừng public profile; xử lý xóa/anonymize có job retry/audit.
- Mục tiêu xóa dữ liệu cá nhân không còn cần thiết trong 30 ngày; operator duyệt retention tài chính/pháp lý trước release, không hard-delete giao dịch cần lưu.
- Backup có expiry và quy trình tái áp dụng deletion sau restore; không hứa xóa khỏi mọi backup tức thì.
- Email không phải blacklist vĩnh viễn theo mặc định; reuse/retention phải theo policy được công bố và chống lạm dụng tối thiểu.
- Không log nội dung chat, ảnh sức khỏe, tokens, payload payment thô; audit allowlist metadata.

## 10. AI và release capabilities
- AI không quyết định role/giá/thanh toán, không trả fake success; unavailable là lỗi có cấu trúc và UI phục hồi.
- AI team bàn giao artifact/version/license/checksum/schema/resources; adapter sandboxed, timeout/quota/cancellation, health và metrics riêng.
- Không lấy lời khuyên rule-based prototype gắn nhãn AI thật. Không chuyển health data cho provider ngoài phạm vi consent.
- Capability contract công bố phần enabled/disabled; cờ không thay authorization.
- VIP/digital purchases/reward redemption cần business và billing riêng; không tái dùng VNPay PT tùy tiện.

## 11. Operator decisions trước release
Xem [operator-actions.md](../../../FitmateAI_BE/docs/backend-release/operator-actions.md). Các mặc định TTL/acceptance/payout/retention ở đây là baseline thiết kế, phải đồng bộ điều khoản và cấu hình trước phục vụ khách thật.
Không tự mua tài nguyên, phát hành, migrate production hoặc rewrite lịch sử Git.

## Payment và chi PT — cập nhật 2026-09-26
Provider checkout mới là payOS; chưa bật live và chưa chạy build/test/migration. BE vẫn giữ VNPay để xử lý lịch sử. Xem docs/backend-release/runbooks/payos-manual-settlement.md trong repo BE.
- Mobile gửi POST /api/v1/payments với hold_id (UUID), method=payos và Idempotency-Key. Payment trả snake_case: appointment_id, amount_vnd, refunded_so_far_vnd, redirect_url, provider_txn_ref, created_at, completed_at; method lowercase, status PascalCase. Mở redirect_url, quay lại thì đọc GET /api/v1/me/payments/{id}; không xác nhận paid từ return/cancel query.
- Tôn trọng paymentsEnabled; PT automatic payout luôn false. Lịch Completed khác đã được duyệt chi và đã chuyển khoản.
- PT revenue/history thêm paidOutVnd và settlementStatus (pending_review/on_hold/approved/paid). Không gọi approved là đã nhận tiền. pendingPayoutVnd là chênh lệch chưa chi, không phải số tự rút; có thể âm khi hoàn tiền sau payout.
- Admin: gọi khách và PT sau buổi, xem session record và xác minh người nhận tiền, kiểm tra tranh chấp; POST /admin/finance/manual-settlements/{appointmentId}/approve với customerConfirmedAt, trainerConfirmedAt, sessionEvidenceReference, payeeEvidenceReference, noOpenDisputeConfirmed=true. Các field của manual finance dùng camelCase, UTC Z.
- Có tranh chấp/thiếu chứng cứ: POST .../{appointmentId}/hold với reason. Sau chuyển khoản thật từ app ngân hàng, POST .../{appointmentId}/record-transfer với bankReference, evidenceReference, transferredAt. Một transfer/một buổi; không có API tự gửi tiền. Không dùng POST /admin/finance/settlements cũ.
- Admin có GET /admin/finance/manual-settlements?page=1&pageSize=25; chưa có record thì chọn từ booking Completed để review. Hoàn tiền payOS qua POST/GET /admin/finance/manual-refunds rồi POST .../{refundId}/record-transfer; không dùng refund success giả hay hủy link để hoàn tiền.
- Mọi đường dẫn admin trên có prefix /api/v1, Admin auth và Idempotency-Key cho mutation. 409 phải tải lại trạng thái; retry ghi chứng từ không chuyển tiền lần hai.
- Record buổi là hồ sơ private, không mặc định phải video/audio. Không gửi raw sức khỏe/ngân hàng vào log; API lưu evidence reference. Private storage ownership và Admin MFA cần gate nghiệm thu BE-816/803 trước production.
- Chưa code UI trong thay đổi BE này; cập nhật adapter/types và UAT sau khi BE contract được kiểm chứng. Không fallback mock khi thanh toán lỗi.
- Bổ sung MFA tài chính: mọi mutation manual-settlements/manual-refunds gửi X-Finance-Totp (6 chữ số hiện tại). Admin phải bật MFA; BE gọi verifier trước thay đổi dữ liệu. Không lưu/log mã này. Request đã xử lý cùng Idempotency-Key trả lại receipt, không chuyển tiền lần nữa.
