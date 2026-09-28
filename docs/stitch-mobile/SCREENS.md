# Fitmate — Screen specification for Stitch

Đọc cùng DESIGN.md. IDs là nhãn thiết kế, không phải route/task/API đã implement. Những màn nghiệp vụ mục tiêu chưa có BE vẫn cần thiết kế, nhưng ghi capability/contract gate khi bàn giao; không giả API hoặc hành vi đã hoạt động.

Mỗi mục dưới đây phải thành screen/frame hoặc variant có tên, không chỉ một dòng trong báo cáo. Nếu một màn đã làm trong batch đầu thì reuse, không tạo style thứ hai. State chung dùng component library; state thay đổi nội dung/hành động phải có frame riêng.

## A — Đăng nhập, đăng ký, hồ sơ và cài đặt

### A01 — Chào mừng
Logo Fitmate nhỏ, headline “Khỏe hơn mỗi ngày”, đoạn ngắn về tập luyện/dinh dưỡng/PT, một ảnh/illustration nhẹ không chiếm toàn màn. CTA “Đăng nhập” → A02, secondary “Tạo tài khoản” → A03; privacy/terms links → A15. Không hero carousel dài hoặc demo login.

### A02 — Đăng nhập
Back, title, email, password show/hide, “Quên mật khẩu?” → A05, primary “Đăng nhập”, link register. States invalid credentials, unverified email→A04, locked/support→H03, expired session banner. Không role picker ở login để tự cấp quyền; role đọc từ account. Không MFA Admin trong app Member/PT nếu contract không yêu cầu.

### A03 — Đăng ký
Stepper ngắn: tài khoản → hồ sơ. Vai trò “Hội viên”/“Huấn luyện viên”; tên, email, password+confirm, birthday/gender theo validation BE; terms/privacy acceptance liên kết nội dung thật. Không hardcode password min6 từ prototype. Fields role-specific dài chuyển A07/A08 hoặc P02, không ép mọi dữ liệu sức khỏe vào một form registration. Thành công → A04, chưa tự xem PT đã xác minh.

### A04 — Xác minh email
Email được che một phần, hướng dẫn mở email, “Gửi lại email”, cooldown thực từ state, “Đổi email/Quay lại”. Variants link hợp lệ/thành công/hết hạn/lỗi/gửi quá nhiều. Không vẽ input OTP nếu contract dùng email link; link handler thành công → login hoặc next step đúng auth flow.

### A05 — Quên/reset mật khẩu
Hai frames: nhập email + generic sent confirmation không tiết lộ tài khoản tồn tại; đặt mật khẩu mới+confirm từ link, strength/helper theo BE, expired link CTA yêu cầu lại, success CTA login. Không trả password cũ hoặc auto-login giả.

### A06 — Trung tâm tài khoản
Avatar/tên/role, link hồ sơ cá nhân; các hàng nhóm “Lịch hẹn”, “Bạn bè”, “Tin nhắn”, “Thông báo”; nhóm hồ sơ/cài đặt/hỗ trợ; PT thấy “Không gian PT” → P01. Không gian PT không hiện cho Member. Logout ở cuối có confirm. VIP/rewards chỉ mục “Tính năng sắp có” nếu product muốn giữ, không làm CTA nổi chính.

### A07 — Hồ sơ của tôi / sửa hồ sơ
View và edit variants: avatar, display name, bio, goal, phone, birthday, gender, height cm, current weight kèm link lịch sử cân nặng. Weight lấy lần đo/flow cân nặng, không hai nguồn số liệu riêng. CTA “Chỉnh sửa”, “Hồ sơ sức khỏe & lịch tập” → A08. Form có image picker/upload state, validation, unsaved confirm. Owner-only fields được đánh dấu riêng tư; link public preview → F05.

### A08 — Hồ sơ sức khỏe và lịch tập
Sections: bệnh nền/ghi chú tự khai; dị ứng; mục tiêu; ngày tập nhiều lựa chọn; khung giờ thêm/xóa; giải thích dùng để cá nhân hóa, không phải đánh giá y khoa. Có “Chưa cung cấp” khác “Không có”; không tick không bệnh/dị ứng mặc định. Save/validation/conflict, private note. PT vẫn có thể dùng hồ sơ cá nhân này.

### A09 — Cài đặt
Hàng tài khoản/bảo mật, thông báo, timezone/ngôn ngữ nếu supported, privacy, dữ liệu cá nhân, hỗ trợ, about version thật. Light theme là thiết kế đợt này; không nút dark mode hoạt động khi chưa thiết kế/implement. Mỗi setting có destination hoặc giải thích disabled, không decorative toggle không lưu.

### A10 — Đổi mật khẩu
Current/new/confirm, requirements từ BE, show/hide, submit state; success giải thích đăng nhập lại nếu session revoked. Không auto xác nhận bằng toast rồi giữ session chết.

### A11 — Quyền thông báo
System permission status, mục đích thông báo lịch hẹn/tin nhắn; CTA bật quyền hoặc mở device settings khi bị từ chối. Preferences theo category chỉ hiện nếu backend hỗ trợ; không hứa mute khi chỉ local toggle. Variants granted/denied/notAsked.

### A12 — Dữ liệu và quyền riêng tư
Export data entry, delete account entry, privacy link. Export states requested/processing/ready/expired/failed nếu capability có; file private, thời hạn theo server, không invent “sẵn sàng ngay”. Entry hủy request chỉ nếu contract cho phép.

### A13 — Yêu cầu xóa tài khoản
Giải thích dữ liệu và giao dịch cần xử lý, confirmation và re-auth nếu required, support link. Pending/blocked/error/success riêng. Không hứa “đăng nhập để khôi phục trong 30 ngày” khi BE không cho đăng nhập PendingDeletion; retention text do operator chốt, không tự bịa.

### A14 — Tính năng sắp có
VIP/rewards info gọn, trạng thái chưa khả dụng, back. Không checkout gói, điểm quy tiền, bank withdrawal form hoặc số dư mẫu trông như thật. Để frame phụ, không chiếm navigation chính.

### A15 — Điều khoản / quyền riêng tư
Readable document layout, title, updated date từ data, sections/links/contact cấu hình. Hai variants terms/privacy; không invent operator email, legal promise hoặc certification badge.

## B — Trang chủ

### B01 — Tổng quan hôm nay
Từ trên xuống: avatar/greeting+name, chuông unread; ngày đang xem; calorie intake/target là block chính và burned exercise là metric tách, macros protein/carbs/fat có g; 4 quick actions “Ghi bữa ăn”, “Quét món ăn”, “Bắt đầu tập”, “Đặt lịch PT”; buổi tập hôm nay; lịch hẹn gần nhất; streak nhỏ + link lịch sử, không reward wallet. Không dùng 3 vòng màu lớn tranh nhau. Có root bottom tabs.

Sample: intake1.450/target2.000kcal, vận độngước tính250kcal; không lấy intake-burned thành lời khuyên y tế. Tap intake→C01; workout→D02; upcoming→E06; avatar→A06. States first-use onboarding hint, không lịch hôm nay, aggregate unavailable, AI scan unavailable vẫn manual.

### B02 — Tiến độ và thói quen
Date range, completed workouts theo ngày, streak, weight trend link D09; labels và ngày rõ. Không bấm cộng streak; streak bắt nguồn workout đã ghi. Empty có CTA bắt đầu workout, chart error khác zero. PT cũng có home cá nhân này.

## C — Dinh dưỡng và phân tích ảnh

### C01 — Nhật ký dinh dưỡng
Date picker, nutrition summary calories/macros, sections Sáng/Trưa/Tối/Bữa phụ, mỗi row tên món/khẩu phần/kcal/source, add per meal. Primary “Thêm món” → C02, scan → C03; segment “Nhật ký / Thực đơn” → C06. Edit row→C02 edit, delete confirmation. Meal planned không tự cộng vào intake.

### C02 — Nhập/chỉnh món thủ công
Tên món, số lượng, đơn vị, calories/protein/carbs/fat cho khẩu phần cơ sở, khẩu phần dùng, bữa/ngày/giờ; preview tổng sau scale rõ. Primary “Lưu vào nhật ký”; edit “Lưu thay đổi”, delete riêng destructive. Validation số/đơn vị, không tự bịa nutrient nếu unknown; giữ input khi lỗi. Nếu search food catalogue không có backend, chỉ form manual, không giả database tra cứu.

### C03 — Chụp/chọn ảnh món ăn
Camera viewfinder khi đã có quyền, hướng dẫn ánh sáng/ảnh toàn món, shutter/gallery, back, permission education. Gallery/camera denied CTA settings/manual C02. Photo preview variant: ảnh, chụp lại/chọn lại, “Phân tích ảnh”. Chưa nhấn phân tích thì không tự upload trong thiết kế. Không API key/model settings trong app.

### C04 — Phân tích và xác nhận món
Variants bắt buộc: analyzing indeterminate/cancel; candidates; no food/unclear; service unavailable/quota/error/retry; không tạo result sau fixed timer.

Result layout: ảnh nhỏ, notice “Kết quả ước tính — hãy kiểm tra trước khi lưu”; danh sách món candidate có tên sửa được, quantity/unit, estimated nutrients; chọn/bỏ candidate; add missing manually; meal/date selector; totals preview. Chỉ confidence khi provider thực có field; không badge “99% chính xác” tự sinh. Primary “Xác nhận và lưu” chỉ sau review. Save success→C01; phân tích xong chưa cộng calories. Gemini/model nhóm AI dùng cùng UI, không phải hai màn khác nhau.

### C05 — Chi tiết món đã ghi
Tên, photo nếu có, portion, macros/calories, date/meal/source “Nhập thủ công”/“AI ước tính, đã chỉnh sửa”; edit/delete. Không biến estimated thành verified dinh dưỡng. Nếu ảnh hết hạn refresh access, không broken thumbnail vĩnh viễn.

### C06 — Thực đơn tuần
Week/date selector, planned breakfast/lunch/dinner/snack cards; slot trống có add. “Đã ăn món này” mở C02 prefill cho confirm, không tự mark consumed. Replace meal→C07, allergy/profile→A08. Phân biệt planned và logged bằng labels, không chỉ tint.

### C07 — Thêm/thay món dự kiến
Sheet hoặc full-screen: món hiện tại, manual replacement, portion, target slot/date; optional AI suggestions capability. Khi AI disabled vẫn nhập tay. Nếu AI available hiển thị lựa chọn và estimate, user chọn rồi mới lưu; không khẳng định tránh dị ứng hoàn toàn.

## D — Tập luyện và cân nặng

### D01 — Kế hoạch tập
Tuần/ngày, training windows, list plan tên/duration/target burn estimate/exercise count; create CTA→D03, item→D02, history→D07, cân nặng→D09. Nhiều plan/ngày; không gắn completed vĩnh viễn vào template. AI adaptive entry→D10 khi capability có.

### D02 — Chi tiết kế hoạch
Tên/ngày/mô tả/thời lượng/mục tiêu calories ước tính; ordered exercises với type reps/time, sets, target reps hoặc seconds, rest giữa hiệp/chuyển bài, instructions/media. Primary sticky “Bắt đầu tập”→D04; edit D03/delete confirm. Delete copy giữ lịch sử buổi đã tập.

### D03 — Tạo/sửa kế hoạch và bài tập
Plan fields + exercise list add/reorder/remove. Exercise editor full screen/sheet: name, reps/time selector, sets, repsPerSet hoặc durationSeconds, restSeconds/restAfterSeconds, notes, media source if supported. Không gộp reps thành giây. Save validation, unsaved back, no-exercises empty. Không mặc định có video nếu không có licensed asset.

### D04 — Buổi tập đang diễn ra
Ẩn bottom tabs. Title plan + bài/hiệp hiện tại, audio toggle, status Chuẩn bị/Đang tập/Nghỉ/Tạm dừng, media/instructions gọn, timer lớn cho time hoặc reps target/input cho reps, progress buổi, next exercise preview khi nghỉ. Controls “Xong hiệp”, “Tạm dừng/Tiếp tục”, “Bỏ qua nghỉ”, overflow skip set/exercise/end early.

Variants reps/time/rest/paused; actual reps per set, partial/skipped không default completed. Không hiển thị tất cả controls active cùng lúc. Audio unavailable text fallback. Exit confirmation; background return/checkpoint restore→D05. Không tự finish nếu quay lại app.

### D05 — Khôi phục / kết thúc sớm
Hai modal variants: pending session name/start/progress với “Tiếp tục”/“Bỏ phiên” confirm; end early summary completed/partial/skipped với confirm. Tránh dùng “Xóa lịch sử” cho bỏ checkpoint. Offline banner giải thích kết quả chờ đồng bộ.

### D06 — Tổng kết buổi tập
Actual duration, completed sets/exercises, partial/skipped, estimated burn có nhãn, per-set actual, completion status; primary “Lưu buổi tập” nếu explicit save flow, hoặc “Về lịch tập” khi đã saved theo engine; không hai lần ghi. States saved/pending sync/sync failed+retry/conflict, tránh show server saved khi chỉ local. Link D08.

### D07 — Lịch sử tập
Date/status filter, list session title/time/duration/status/sync marker, pagination/load more, empty/error. Open→D08; date text không nhầm recorded/created. Deleted plan vẫn có history snapshot.

### D08 — Chi tiết buổi đã tập
Snapshot tên kế hoạch/bài tại thời điểm bắt đầu, per-set reps/time thực, skipped/partial, started/ended, duration, source/sync status khi relevant. Không thay session history theo template vừa edit. Không chỉnh thành tích tùy tiện nếu contract chưa có edit.

### D09 — Cân nặng
Chart thời gian với kg + text summary/latest, range tabs; list measurements time/value, “Thêm lần cân” sheet kg/date/time, edit/delete nếu API hỗ trợ. Nhiều lần/ngày, chart last-of-day theo timezone; future validation. Không chart giả khi ít data, không suy diễn chẩn đoán cơ thể.

### D10 — Gợi ý điều chỉnh AI
Goal/context từ profile private, plan hiện tại, request action; analyzing/unavailable/error; proposed changes before/after exercises và lý do ngắn khi có. User chọn và “Áp dụng vào kế hoạch”, không tự overwrite buổi đang chạy. Manual edit fallback D03, cảnh báo phù hợp khi có bệnh nền, không tuyên bố bài an toàn tuyệt đối.

## E — Tìm PT, đặt lịch, thanh toán

### E01 — Danh sách PT
Search name/specialty, filter sheet price/specialty/verified theo data có; cards avatar/name/verified text/experience/specialty/rating+count/giá từ. No rating thì “Chưa có đánh giá”, không 5 sao mặc định. Tap→E02; states loading/no results/reset filter/error. Không thêm maps/distance nếu không có location data.

### E02 — Hồ sơ công khai PT
Avatar/name/verification, bio/specialty/years; dịch vụ price/duration/location type; reviews list/rating/count; availability preview; CTA “Chọn lịch tập”→E03. Message chỉ theo friendship policy: chưa bạn gợi ý kết bạn, không active send tự do. Chứng chỉ chỉ metadata/public projection được phép, không ảnh scan chứa PII. Không phone/bank/health private.

### E03 — Chọn dịch vụ và giờ
Selected PT/service/duration/price, date picker, timezone, available slots, location BE cung cấp; unavailable slots disabled. CTA “Tiếp tục” tạo hold rồi→E04; conflict “Khung giờ vừa được đặt” + reload. Không 6 slot hardcode trông như availability thật.

### E04 — Xác nhận đặt lịch
PT/service/time/location, price breakdown từ server, cancellation policy ngắn/link, remaining hold countdown theo expiresAt server, payOS method, primary “Thanh toán … ₫” mở provider. Back/cancel hold phù hợp. Variants expired→choose again, payments disabled, quote changed/conflict, creating/payment link failed. Không card number/CVV form trong Fitmate; không tự thêm ví/COD.

### E05 — Trở về từ thanh toán
Variants “Đang xác minh thanh toán” + spinner không fake%, paid confirmed + details→E06, failed, canceled, expired, uncertain/pending quá lâu + “Kiểm tra lại”/support. Deeplink không tự thành công. Pending không show “Thanh toán lại” có thể double charge. Provider checkout là màn ngoài ứng dụng, chỉ vẽ transition placeholder có nhãn external.

### E06 — Chi tiết lịch hẹn
Booking status riêng payment badge, PT/member đối tác, service/time/location, paid amount/refunds, timeline dữ liệu thật, support/case link, role actions. Member cancel/reschedule khi allowed→E08; PT accept/start/complete theo server allowed actions→P05; sau completed đủ điều kiện review→E09. Không nút mọi status luôn active. Tài liệu buổi private cho participant, không public feed.

### E07 — Lịch hẹn của tôi
Calendar/list switch, upcoming/history filters, day list, each card counterpart/service/time/booking status/payment status; empty choosePT for Member hoặc manage availability cho PT. Tap E06. PT là người đặt PT khác thì giữ role participant theo booking, không tất cả lịch đều “khách của tôi”.

### E08 — Hủy / đổi lịch / theo dõi hoàn tiền
Cancel reason + policy + refund estimate từ BE + confirm; reschedule available date/slot và before/after summary + conflict. Refund status Pending/Succeeded/Failed tách cancellation; copy “Yêu cầu hoàn tiền đang xử lý” không “Đã hoàn” lúc hủy. Link record cũ/mới/history khi BE cung cấp, không tự bịa timeline. Completed dispute→H03, không auto full refund.

### E09 — Đánh giá PT
Booking/service reference, rating selector accessible, comment, submit/error/success, validation theo BE. Chỉ booking completed và eligibility true; không review bất kỳ PT. Edit chỉ nếu API cho phép. Không reward points cho review.

## P — Không gian PT

### P01 — Tổng quan PT
PT identity/verification status, lịch dạy sắp tới, việc cần làm (certificate pending, profile thiếu, slot), shortcut dịch vụ/lịch rảnh/chứng chỉ/doanh thu. Member main tabs không bị đổi. Earnings summary không ghi “Có thể rút ngay”.

### P02 — Hồ sơ chuyên môn và dịch vụ
Edit specialty/experience/bio; service list create/edit with name/description/duration/integer VND price/location fields theo BE, active/paused state; save validation, no-service empty. Price change không sửa snapshot booking cũ. Không mặc định PT newly registered đã searchable/bookable.

### P03 — Lịch rảnh
Week calendar, availability intervals add/edit/remove, exceptions/day off, timezone, conflict với appointment. Không allow overlapping vô nghĩa hoặc xóa slot đã booked thành hủy lịch. Feedback BE conflict và CTA xem lịch liên quan.

### P04 — Chứng chỉ của tôi
List card name/issuer/issue date/code/type, image private thumbnail, Pending/Approved/Rejected/Revoked + reason; add form/upload preview/progress/error, retry file. Không Admin approve/reset nút. Revoked gợi ý sửa hồ sơ/liên hệ support theo policy; không tự approve lại bằng local state. Upload ownership UI không share public URL.

### P05 — Quản lý buổi với khách
Variant E06 cho PT: counterpart, booking/payment, allowed accept/start/complete/cancel actions với confirm. Ghi hồ sơ buổi sau tập nếu endpoint hỗ trợ: notes/evidence được phép, private notice, upload state; không bắt quay video/thu âm hoặc tự ghi camera. Hoàn thành buổi không tự nhận tiền. CTA support khi tranh chấp, lịch sử theo BE.

### P06 — Doanh thu
Period filter, summary gross/fee10%/PT share/refunds/recognized net; riêng pending review/on hold/approved/paid out. Chart readable, list bookings→P07, sums BE cung cấp, error không0. Text “Khoản chi được quản trị viên xác minh và thực hiện thủ công sau buổi tập”. Không “Rút tiền”, auto transfer, deadline cố định hoặc ngân hàng giả.

### P07 — Chi tiết khoản chi
Booking/reference, gross300.000, phí30.000, PT270.000 sample; refund adjustments; status timeline Chờ xác minh/Tạm giữ/Đã duyệt/Đã chuyển có dates thực; hold reason phù hợp quyền; transfer amount/time/reference được phép khi paid. “Đã duyệt” copy đang chờ chuyển, không success received. Bank/payee details chỉ masked khi có contract; support link, không tự thêm CRUD ngân hàng chưa có BE.

## F — Cộng đồng, bạn bè, tin nhắn

### F01 — Bảng tin
Top title + friends/chat entry; segments “Cộng đồng”/“Trợ lý AI”→G01; feed public/friends filters theo API. Post cards author/avatar/role/time/visibility, text/image/link/tags, love/fire/haha counts, comments, overflow report/block/delete-own. Create→F02, detail→F03, author→F05. Không reward banner hoặc toxic verdict tự bịa.

### F02 — Tạo/sửa bài viết
Text editor, photo add/remove/upload, link, tags, visibility Public/Friends/Private, knowledge flag nếu contract có; preview publish CTA. States uploadfailed/validation/moderation rejected giữ draft; unsaved confirm. Không hứa thưởng tiền khi bài kiến thức được đăng. Edit chỉ owner.

### F03 — Bài viết và bình luận
Post full, paged comments với avatar/time/text/actions theo ownership, comment input keyboard-safe, sending/failed retry; report comment/post →F04. Deleted/private-unavailable variant không leak cached text, navigate back. Không fake share nếu không có link public hợp lệ.

### F04 — Báo cáo / chặn
Report sheet target summary/type, reason selector và detail, submit receipt; block confirm giải thích hạn chế tương tác, không khẳng định xóa lịch sử booking/chat. Report không tự block; actions tách. Success không tuyên bố user kia bị khóa. Block list quản lý trong settings nếu supported.

### F05 — Hồ sơ công khai người dùng
Avatar/name/bio/role, public posts, relationship status; add/cancel request/accept/reject/unfriend/block theo state. Không chiều cao/cân nặng/medical/allergy/phone/birthday private. PT thêm link hồ sơ chuyên môn E02; self preview không có kết bạn chính mình. Message active khi là friend/not blocked.

### F06 — Tìm người và bạn bè
Search public name/ID theo contract, role filter Member/PT không mentor giả; tabs Bạn bè/Đã nhận/Đã gửi. Rows name/avatar/role và action đúng state. Cross-request conflict hướng accept request đã có; no results/error/paged. UUID trong data, không dùng email làm identity route.

### F07 — Hộp thư
Conversation list avatar/name/last-message preview/time/unread count, search nếu supported, empty findfriends, loading/error. Chat riêng không đồng nhất AI chat. Tap→F08.

### F08 — Cuộc trò chuyện
Header name/profile, messages with time/read state server có, composer keyboard-safe, sending/sent/failed retry same message. Unfriend/block variant history vẫn đọc, composer disabled với thông báo trung tính không tiết lộ ai block ai. Không voice/video/attachment controls khi API chỉ text. Không fabricate online/typing/read receipts nếu không có data.

## G — Trợ lý AI

### G01 — Danh sách hội thoại AI
Title “Trợ lý Fitmate”, short scope hỗ trợ tập/dinh dưỡng, conversations list/new; capability unavailable thông báo+manual navigation. Không avatar giả người tư vấn thật hoặc thông tin provider key. Không tự hiện model Gemini đã active khi adapter chưa có.

### G02 — Chat AI
Assistant/user bubbles, input/send/stop nếu supported, request processing/retry/error, example prompts dựa feature thật; nhận diện nội dung AI, không medical diagnosis. Proposed meal/workout chỉ có apply CTA khi có structured result+review screen; text chat không tự thay nhật ký/kế hoạch. Quota limit state có retry later, không giả trả lời offline. Delete thread confirmation nếu contract hỗ trợ.

## H — Thông báo và hỗ trợ

### H01 — Thông báo
List grouped date, all/unread filter, type icon/avatar, text/time/unread dot; tap mark read và navigate target allowed. Expired/deleted/private target friendly fallback, không crash/deeplink tùy ý. Friend invitation mở F06, không stale action approve trực tiếp khi state đổi. Không mark-all-read nếu endpoint chưa có.

### H02 — Danh sách yêu cầu hỗ trợ
Open/resolved filter, title/category/status/lastupdate, create→H03, detail→H04, page/loading/empty/error. Contact channel chỉ configured, không email/hotline tự invent.

### H03 — Tạo yêu cầu / phản ánh buổi tập
Category/subject/message, booking/payment reference prefilled khi đi từ E06/P07, attachments nếu supported, privacy notice không đưa mật khẩu/TOTP. Submit states + receipt, không hứa SLA. Booking dispute case dùng category/link BE thực; gửi support không tự cancel/refund/hold nếu BE chưa làm guard.

### H04 — Chi tiết yêu cầu hỗ trợ
Ticket reference/status, original text và replies customer/admin, timestamp, private attachments, reply composer, closed variant read-only/reopen chỉ nếu supported. Error reply giữ input, không fake admin chat online, không xóa thread lúc refetch.

## I — State library và kiểm kê

I01: skeleton, empty first-use, no search results, inline retry, fullscreen unavailable, offline cached banner, forbidden/session expired, not found.

I02: form focused/invalid/submitting, destructive confirm, unsaved confirm, success toast, timeout uncertain, conflict reload, permission denied, media loading/broken/retry.

I03: component sheet với tokens/type/buttons/input/chips/badges/cards/nav/chart và sample dài/ngắn; keyboard-open form 360dp, large-font variant.

## Hành trình phải nối được trong prototype

1. A01→A03→A04→A07/A08→B01; A02→B01; A05→A02.
2. B01→C03→C04(edit/confirm)→C01→C05; AI unavailable→C02→C01.
3. D01→D03→D02→D04→D05/D06→D07→D08; weight D09; adaptive D10→D03 review.
4. E01→E02→E03→E04→external payOS→E05→E06→E07/E08/E09.
5. A06→P01→P02/P03/P04/P05/P06→P07; P05 complete không tự P07 paid.
6. F01→F02/F03→F04; F05→F06→F07→F08; G01→G02.
7. H01→valid target hoặc unavailable; E06/P07→H03→H04; A09→A10/A11/A12/A13/A15.

Mỗi frame xuất tên `{ID} — {Vietnamese title} — {state}`; bảng coverage ID/frame/CTA destination/state missing. Không tuyên bố hoàn tất nếu chỉ có 5 root screens.
