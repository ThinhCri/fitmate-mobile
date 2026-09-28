# Prompt gửi Stitch

## 1. Gửi kèm DESIGN.md và SCREENS.md, copy nguyên khối

```text
Bạn là product designer và mobile UI designer phụ trách thiết kế đầy đủ ứng dụng Android Fitmate. Đọc toàn bộ DESIGN.md và SCREENS.md đính kèm trước khi tạo màn hình. Nếu không đọc được file, nói rõ file thiếu, không đoán nội dung.

Mục tiêu: giao diện đầy đủ từng luồng, bàn giao để triển khai React Native + Expo + TypeScript + Expo Router. Không làm website Admin, landing page hoặc dashboard desktop thu nhỏ. Tôi muốn giảm tối đa việc thiết kế lại lúc nối backend.

Phong cách: nền trắng sáng, sạch, đơn giản, chuyên nghiệp, dễ đọc và dùng hằng ngày. Bạn tự chọn phối màu đẹp, không bị áp mã hex. Chọn một primary mang cảm giác sức khỏe/tin cậy, neutral sáng và semantic colors. Dùng màu tiết chế; tạo cá tính bằng typography, spacing, hierarchy. Không neon, gradient lớn, glassmorphism, glow, nền tối hay card nào cũng tô màu.

Vai trò: Hội viên dùng dinh dưỡng/tập luyện/cân nặng/cộng đồng/đặt PT. PT có mọi tính năng Hội viên, thêm hồ sơ chuyên môn/dịch vụ/lịch rảnh/chứng chỉ/lịch khách/doanh thu. Không có Admin trong app.

Giữ 5 tabs: Trang chủ / Dinh dưỡng / Tập luyện / Cộng đồng / Huấn luyện viên. Avatar mở trung tâm tài khoản; chuông mở thông báo; Không gian PT nằm trong tài khoản. Không thêm tab cho mọi chức năng hoặc biến tab thành nút cộng.

UI tiếng Việt có dấu, sample data hư cấu nhất quán, không lorem ipsum. Base390dp, variant360dp, safe-area/keyboard/font scaling, vùng chạm48dp. Không vẽ notch/phone bezel thành UI thật. Content dài scroll, không thu nhỏ font để nhét một ảnh.

Nghiệp vụ bắt buộc:
- Scan món trả ước tính; user sửa món/khẩu phần và xác nhận mới lưu. Có manual fallback khi AI unavailable. Không fake confidence%, progress% hoặc kết quả sau timer. Gemini/model riêng không làm đổi UI phổ thông.
- Workout có plan, reps/time, từng hiệp, nghỉ/pause/skip/end early, summary/history/pending sync. Streak không tăng bằng nút bấm.
- payOS checkout bên ngoài app; return hiển thị đang xác minh và chỉ BE xác nhận mới paid. Pending/timeout không tự cho trả lại.
- Booking/payment/refund/settlement là trạng thái riêng. PT được chi thủ công sau Admin xác minh khách/PT/hồ sơ buổi; không auto withdrawal, approved không bằng paid.
- Public profile không lộ health/phone/birthday/cân nặng/ngân hàng/chứng từ private. Không quick-login demo hoặc tự duyệt chứng chỉ.
- VIP/rewards đổi tiền chỉ future/unavailable, không số dư/checkout giả.
- Action phải có destination/callback. API chưa có ghi integration gate, không tự thêm nghiệp vụ.

Làm theo batch để không bỏ sót:
1. Tạo I03 style/component sheet và 5 màn đại diện: B01 Trang chủ, C04 Xác nhận món từ ảnh, D04 Buổi tập đang diễn ra, E02 Hồ sơ PT, P06 Doanh thu PT.
2. Reuse một design system; thêm D04 paused và C04 unavailable để kiểm tra states. Kèm navigation map và inventory toàn bộ IDs theo SCREENS.md, đánh dấu đã/chưa tạo.
3. Sau khi tôi chốt style, làm các batch tiếp theo tôi gửi trong cùng project. Không tự đổi palette/components giữa batch. Không gọi app hoàn tất sau năm màn.

Đầu ra: mỗi frame đặt tên ID — tên màn — state. Token table, reusable components, CTA destinations, loading/empty/error/offline/permission/conflict variants. Không chỉ vẽ happy path.

Ưu tiên export React Native TSX nếu công cụ hỗ trợ: native components/theme tokens, presentation nhận data/status/callbacks, không API keys/fetch/business math trong UI. Nếu chỉ HTML/CSS/Tailwind, ghi rõ web reference cần chuyển RN, không nói dán nguyên chạy native. Không bitmap toàn màn hay absolute-position mọi phần tử. Sample data tách khỏi UI.

Hãy bắt đầu style sheet và năm màn mẫu sau khi đọc docs. Tự quyết chi tiết thẩm mỹ theo brief, không hỏi từng màu/font/radius.
```

## 2. Khi đã ưng style

```text
Tôi chốt hướng thiết kế này. Giữ palette/typography/spacing/components/navigation cho toàn bộ Fitmate. Cập nhật token sheet và DESIGN.md theo style vừa chốt, không đổi nghiệp vụ SCREENS.md. Batch sau thêm màn/variants vào cùng project, không tạo design system mới. Nếu một màn cần layout đặc thù, giữ cùng visual language.
```

Nếu chưa ưng, sửa năm màn mẫu trước; không cần tạo cả bộ rồi mới đổi theme.

## 3. Gửi từng batch trong cùng project

### Batch A/B — Tài khoản và Home
```text
Tiếp tục theo DESIGN.md đã chốt và SCREENS.md. Tạo A01–A15, B01–B02; reuse B01 đã có. Có login/register/email verification/reset, owner profile/health, account hub/settings, password/notification/privacy/export/deletion và future features. Không Admin/quick-login/private health public. Email verification theo link, không tự đổi SMS OTP. Thêm invalid/expired/locked/loading/error và keyboard-open form360dp. Nối CTA, báo coverage IDs; không nhân đôi màn đã có.
```

### Batch C — Dinh dưỡng
```text
Tạo C01–C07 theo SCREENS.md, reuse C04. Đủ manual entry và camera→preview→analyzing→candidate edit→confirm→nhật ký. Có permission denied/no food/AI unavailable/quota/error/save failed giữ input. Planned meal khác logged meal; portion/nutrients/source rõ. Không tự lưu khi scan xong, không bịa confidence. Nối Home entries và states, giữ style đã chốt.
```

### Batch D — Tập luyện
```text
Tạo D01–D10, reuse D04. Plan CRUD, reps/time editor, per-set actual, rest/pause/skip/partial/end early, restore checkpoint, summary pending sync, history snapshot, weight chart/log, adaptive AI review/unavailable. Player full screen và controls tùy phase; không dồn mọi nút active cùng lúc. Không quy reps sang giây/tự cộng streak. Nối luồng và báo IDs/states thiếu.
```

### Batch E — PT, booking, payment
```text
Tạo E01–E09, reuse E02. Search/filter PT, services/slots/hold countdown, checkout summary, external payOS transition, return verifying/success/failed/expired/uncertain, appointments/detail/cancel/reschedule/refund tracking/review. Booking/payment/refund badges tách riêng. Không card/CVV form hoặc redirect=paid. Có slot conflict/payment pending mất mạng/payments disabled. Không auto refund. Nối CTA và báo coverage.
```

### Batch P — Không gian PT
```text
Tạo P01–P07, reuse P06. PT giữ 5 tabs cá nhân; công việc trong Không gian PT. Hồ sơ chuyên môn/services/availability/certificates/status, appointment allowed actions, hồ sơ buổi private, revenue detail/timeline pending_review/on_hold/approved/paid. Không Admin buttons/auto withdrawal, không approved=received, không hứa ngày trả cố định. Không bắt quay video buổi tập. Hold/dispute có support link, tiền mẫu nhất quán.
```

### Batch F/G — Cộng đồng và AI chat
```text
Tạo F01–F08, G01–G02. Feed/create/detail/comments/report/block/public profile/friends/search/conversations/chat. Không public health; unfriend/block vẫn đọc history nhưng composer bị giới hạn, không lộ ai block ai. Chỉ text chat nếu chưa có media/call contract, không fake online/typing. AI chat riêng friend chat, có unavailable/processing/error, chỉ apply structured suggestion sau review. Không reward tiền. Thêm sending/failed retry và private/deleted target variants, nối CTA.
```

### Batch H/I — Hỗ trợ và states
```text
Tạo H01–H04, hoàn thiện I01–I03. Notifications/read/expired target; support list/create/thread/reply/private attachments/linked booking case. Không invent hotline/email/SLA. State library loading/empty/error/offline/permission/forbidden/session expired/conflict/unsaved/uncertain. Kiểm tra360dp/keyboard/font scaling. Áp dụng components vào màn thật, không chỉ vẽ bảng samples. Giữ style và báo coverage.
```

## 4. Kiểm kê và export cuối

```text
Rà toàn bộ theo SCREENS.md. Lập bảng từng ID A01–A15, B01–B02, C01–C07, D01–D10, E01–E09, P01–P07, F01–F08, G01–G02, H01–H04, I01–I03: frame, variants, CTA destination, phần thiếu. Một ID nhiều variants không thay thế IDs khác.

Sửa màn thiếu/dead ends/style drift/tiếng Việt không dấu/privacy leak/trạng thái tiền lẫn/overflow/keyboard che CTA. Kiểm tra 7 hành trình cuối SCREENS.md. Không thêm tính năng ngoài scope.

Export code/assets cùng: DESIGN.md/token table; source/license assets; inventory IDs/states; component map và props/data/callbacks; navigation map; integration gates và giới hạn output native RN hay HTML reference. Nếu không xuất được loại code/file nào thì nói rõ. Không production-ready chỉ vì render đẹp, không secrets/fake API/auto payment, không fixtures hardcode trong component tái sử dụng.
```

## 5. Cho Antigravity sau khi có export — không gửi phần này cho Stitch

```text
Tích hợp thiết kế Stitch Fitmate vào mobile/ của FitmateAI_FE. Đọc AGENTS.md, docs production và docs/stitch-mobile. Dùng screen IDs/component/token map. HTML/Tailwind cần chuyển RN/Expo, không WebView toàn app hoặc DOM API trong native.

Backend contract/business rules thật ưu tiên hơn mock design. Tách presentation/data/state, giữ permissions/private health/manual settlement/AI confirm. Kiểm kê trước thay đổi; không xóa code hàng loạt hoặc tự đổi dependencies. Mapping mỗi screen→route→API→states và ghi integration gate nếu API thiếu, không fake success.

Không tự install/build/typecheck/lint/test/server/Docker/migration/commit/push. Chỉ code/docs/test source và commands cho tôi chạy. Không Gemini key trong client. Cập nhật docs/review-handoff/ với files/symbols/requirements và phần chưa kiểm chứng để reviewer kiểm tra.
```
