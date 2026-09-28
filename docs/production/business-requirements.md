> Snapshot từ FitmateAI_BE, PROD-2026-09-22-v1. Không sửa độc lập; cập nhật nguồn BE rồi đồng bộ.

# Fitmate — Yêu cầu sản phẩm production
Baseline: PROD-2026-09-22-v1. Đây là đặc tả mục tiêu, KHÔNG phải tuyên bố chức năng đã chạy.
Nguồn trạng thái: [tasks.md](integration-plan.md). Quy tắc chi tiết: [domain-rules.md](shared-business-rules.md).
Contract hiện có: [OpenAPI](../../../FitmateAI_BE/docs/backend-release/openapi/fitmate-v1.yaml); phần thiếu phải qua BE-801 trước khi FE gọi.

## 1. Mục tiêu và ranh giới
Fitmate giúp hội viên ghi tập luyện/dinh dưỡng, theo dõi tiến độ, kết nối cộng đồng và đặt PT.
Android phục vụ Member và PT; web chỉ phục vụ Admin. PT có mọi khả năng Member trên dữ liệu riêng.
BE sở hữu quyền, trạng thái, giá, phí, doanh thu và dữ liệu bền vững. FE sở hữu cách trình bày, tương tác, timer và cache.
Không lấy mock, màu sắc, email trong prototype hoặc nút đã vẽ làm bằng chứng API đã tồn tại.
Giữ đầy đủ thông tin nghiệp vụ đang có ở prototype; chuyển dữ liệu mock sang DTO qua adapter, không âm thầm bỏ trường.

## 2. Phạm vi phát hành
- Core bắt buộc: BR-01..BR-12 và BR-14..BR-16 dưới đây.
- BR-13 AI: chuẩn bị contract/adapter ngay; chỉ bật scan/adaptive/chat AI khi có artifact thật và nghiệm thu.
- Rewards đổi tiền/VIP bán gói là capability tương lai: giữ trong backlog BR-17, không fake thành giao dịch thật hoặc xóa khỏi inventory.
- Nếu phát hành trước AI/VIP/rewards: quyết định release scope được ghi trong release manifest; màn liên quan nêu chưa khả dụng, không giả kết quả.
- Không tự triển khai iOS, đa payment provider, admin tùy ý đổi 10%, realtime, marketplace template.

## 3. Business requirements và nghiệm thu
| ID | Người dùng và nhu cầu | Kết quả phải đạt | Backend task |
|---|---|---|---|
| BR-01 | Tài khoản an toàn | Đăng ký, xác minh email, đăng nhập, refresh/logout, quên/reset/đổi mật khẩu, thu hồi phiên; admin MFA | BE-802, BE-803 |
| BR-02 | Hồ sơ đầy đủ, riêng tư | UUID identity; tên/avatar/bio/phone/birthday/gender/height/goal; weight đồng bộ từ log; survey bệnh/dị ứng/training preferences không mất | BE-804 |
| BR-03 | Quyền kiểm soát dữ liệu | Yêu cầu xóa trong app và trang public; xuất dữ liệu riêng; retention và consent rõ | BE-805 |
| BR-04 | PT được kiểm định | Hồ sơ chuyên môn, kinh nghiệm, dịch vụ/giá, cert và trạng thái duyệt; marketplace chỉ PT đủ điều kiện | BE-806 |
| BR-05 | Đặt PT tin cậy | Xem slot, hold, thanh toán, PT accept, bắt đầu/hoàn thành, hủy/đổi lịch; không double booking | BE-807 |
| BR-06 | Tiền chính xác | payOS là checkout mới theo capability; VNPay chỉ giữ lịch sử. Webhook/query phải được xác minh, refund/đối soát đúng; không ghi nhận tiền từ redirect phía FE | BE-808, BE-809, BE-400 |
| BR-07 | Doanh thu PT trên app | Gross, phí 10%, phần PT, hoàn tiền, chờ ghi nhận/đã ghi nhận/chưa chi/đã chi; biểu đồ và chi tiết | BE-810 |
| BR-08 | Tập và theo dõi cân nặng | CRUD plan, time/reps, hướng dẫn có nguồn, session snapshot/per-set/offline sync, weight history | BE-811 |
| BR-09 | Dinh dưỡng hữu ích | Log/sửa/xóa bữa, khẩu phần/macros, lịch ăn; confirm kết quả AI trước ghi nhật ký | BE-812 |
| BR-10 | Trang chủ có dữ liệu thật | Calories ăn/tập tách riêng, mục tiêu/macros, streak, lịch sắp tới; không tăng điểm/streak bằng nút demo | BE-813 |
| BR-11 | Cộng đồng và trò chuyện | Visibility, post/comment/reaction/report, friend/block, private chat/read marker đúng | BE-814 |
| BR-12 | Thông báo đáng tin | In-app và push thật, đúng người, không trùng, không lộ dữ liệu khi đổi tài khoản | BE-815 |
| BR-13 | AI tích hợp sau | Phiên bản/schema/auth/timeouts/giới hạn tài nguyên; unavailable có cấu trúc; không fake | BE-817 |
| BR-14 | Admin vận hành | 7 module hiện có, truy vấn server, audit, xử lý tranh chấp; không truy cập mặc định health/chat thô | BE-818 |
| BR-15 | Hỗ trợ và cấu hình | Support ticket, thông tin hệ thống công khai an toàn, capabilities, ngôn ngữ/timezone/preferences | BE-819 |
| BR-16 | Chạy bền vững | Upload private, test PostgreSQL, CI/CD, tải, observability, restore và release gates | BE-816, BE-820..BE-828 |
| BR-17 | VIP/rewards minh bạch | Giữ inventory; không quy đổi điểm demo thành tiền, không bán gói khi chưa có contract/billing | BE-829 |

## 4. Luồng nghiệm thu xuyên ba repo
1. Member đăng ký → xác minh → cập nhật hồ sơ → ghi cân nặng/bữa ăn/buổi tập → dashboard đọc đúng.
2. PT đăng ký → gửi cert → admin duyệt → tạo dịch vụ/lịch → Member thấy PT.
3. Member giữ slot → payment verified → Pending → PT accept → Confirmed → start → complete → revenue PT/admin khớp.
4. Hủy sau Paid trước Completed → Cancelled + refund Pending → provider xác nhận → refund Succeeded; tổng tiền điều chỉnh đúng.
5. Hai request cùng slot: chỉ một thành công; callback lặp/đảo thứ tự không nhân doanh thu.
6. Friend request → accept → chat/read → block: chặn gửi mới nhưng lịch sử và booking riêng vẫn truy cập được.
7. Logout/đổi account trên một máy: cache/draft/token và push không lọt sang account khác.
8. Admin khóa user → phiên đã cấp cũng bị chặn; reset password/deletion không để refresh token sống sót.
9. App offline lưu session và sync lại một lần; plan bị sửa/xóa không làm sai snapshot.
10. Restore DB/media/key ring vào môi trường tách biệt và chạy lại smoke có bằng chứng.

## 5. Những lựa chọn mới trong baseline
Các giá trị vận hành mới ở domain-rules là mặc định thiết kế do lần rà soát này đề xuất trong phạm vi user yêu cầu hoàn thiện nghiệp vụ, chưa phải policy đã công bố.
Không cần hỏi lại developer cho từng file. Operator phải duyệt điều khoản khách hàng, retention pháp lý, merchant/payout, ngân sách và release manifest trước phát hành.
Nội dung sức khỏe là tự khai/ước tính, không hứa chẩn đoán hay tăng cơ tại vùng cơ chỉ từ một hình minh họa.

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
