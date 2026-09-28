# Fitmate — Mobile Design System Brief

## Product and intent

Thiết kế Android app Fitmate cho Hội viên và Huấn luyện viên cá nhân (PT). Sản phẩm giúp theo dõi tập luyện, dinh dưỡng, cân nặng, kết nối cộng đồng và đặt buổi tập với PT. PT dùng mọi tính năng Hội viên, cộng khu vực quản lý dịch vụ/lịch/chứng chỉ/doanh thu. Không thiết kế Admin trong app này.

Visual intent: **trắng sáng, sạch, điềm tĩnh, chuyên nghiệp, thân thiện, dễ thao tác mỗi ngày**. Không biến thành dashboard doanh nghiệp, game fitness hoặc landing page quảng cáo. Nội dung và hành động quan trọng phải nổi bật hơn trang trí.

Stitch được chủ động chọn phối màu. Không bắt buộc hex/màu thương hiệu từ app prototype hoặc Web Admin. Chọn một palette thống nhất ngay batch đầu, ghi tokens rồi giữ suốt project. Đây là yêu cầu thiết kế mới, không là lệnh sửa theme code đang chạy.

## Color direction

- Nền chính trắng hoặc neutral rất sáng; card trắng, phân vùng bằng spacing/divider hoặc nền dịu, không phủ mọi card bằng màu.
- Chọn **một màu primary có sắc độ đậm vừa đủ** tạo cảm giác đáng tin và khỏe khoắn. Có thể chọn nhóm xanh lam hoặc xanh ngọc dịu; tự quyết một hướng phù hợp, không trộn nhiều palette.
- Accent thứ hai chỉ dùng tiết chế cho thông tin hỗ trợ/biểu đồ. Primary dành CTA/selected/focus, không tô mọi icon và mọi con số.
- Success/warning/error/info có semantic tokens riêng, nền tint nhạt + chữ/icon tương phản. Không chỉ phân biệt bằng màu.
- Tránh neon, gradient lớn, glassmorphism, glow, bóng đổ nặng, nền tím/đen toàn màn, màu pastel dùng cho chữ nhỏ và rainbow dashboard.
- Xuất swatches gồm background, surface, surfaceSubtle, textPrimary, textSecondary, textDisabled, border, primary/onPrimary/primarySoft, secondary, success/warning/error/info, focus, chart1..3. Ghi cặp chữ/nền dự kiến và kiểm tra contrast khi có công cụ, không tuyên bố đã đo nếu chưa đo.

## Typography and hierarchy

Font sans-serif hỗ trợ tiếng Việt đầy đủ; ưu tiên Roboto/system Android hoặc font tương đương có license phù hợp. Không trộn nhiều font. Dùng sentence case và tiếng Việt có dấu, tránh ALL CAPS dài.

- Hero số liệu quan trọng 28–32 sp, semibold; không đặt nhiều hero cạnh nhau.
- Screen title 22–24 sp; section 18–20 sp; body/input 16 sp; supporting label 14 sp; caption tối thiểu 12 sp chỉ nội dung phụ.
- Line height khoảng 1.4–1.5 cho đoạn văn; tối đa 3 mức weight.
- Cho text scale/wrap, tên dài 2 dòng khi cần; không ellipsis số tiền/trạng thái tài chính quan trọng.
- Một screen có một hierarchy rõ: title → context → nội dung chính → primary action. Form labels luôn nhìn thấy, không chỉ placeholder.

## Layout and native behavior

Thiết kế base frame 390 × 844, thêm variant 360 dp rộng; frame là viewport tham chiếu, không hardcode chiều cao nội dung. Screen scroll khi dài; không thu chữ để nhét mọi thứ vào một ảnh.

Spacing scale 4/8/12/16/24/32; outer gutter 16–20; section gap 24; card padding16. Corner radius card12–16, input/button10–12; pill chỉ chips/badges. Border nhẹ, shadow nhỏ ở layer nổi; tránh card lồng card nhiều tầng.

Hit target ≥48dp, primary button cao khoảng52dp. Icon nhìn20–24dp với vùng chạm rộng. Safe-area trên/dưới; không vẽ notch/phone bezel/system navigation giả thành UI ứng dụng. Bottom CTA không bị keyboard/gesture bar che. Keyboard open phải nhìn thấy field lỗi và action cần dùng.

Full-screen form cho nội dung dài, sheet cho lựa chọn/filter ngắn, dialog cho xác nhận ngắn. Không nhét checkout hoặc profile dài vào sheet thấp. Back/close có destination xác định; form đã sửa cần confirm bỏ thay đổi. Workout đang chạy có confirm thoát.

## Navigation

5 bottom tabs ổn định, icon + label:
1. Trang chủ
2. Dinh dưỡng
3. Tập luyện
4. Cộng đồng
5. Huấn luyện viên

Không dùng một tab như nút action “+”. Notifications qua chuông trên Home; profile/account hub qua avatar; chat/friends từ Community và account hub; appointments từ Home/card và account hub. PT có “Không gian PT” trong hub, không thay 5 tab khi đổi vai trò.

Root tabs giữ nav; auth/camera/session player/checkout/detail sâu có thể ẩn để tập trung, giữ back phù hợp. Selected tab đồng nhất xuyên các màn cùng nhóm. Không đồng thời dùng drawer và hub chứa cùng danh sách dài; bộ này chọn account hub thay drawer chính.

## Reusable component families

AppTopBar; BottomTabs; ScreenContainer; SectionHeader; Avatar; RoleBadge; StatusBadge; Primary/Secondary/DestructiveButton; IconButton; LabeledInput; PasswordInput; SearchField; Date/TimePicker; ChoiceChip; FilterSheet; ConfirmationDialog; InlineError; Toast; EmptyState; ErrorState; LoadingSkeleton; OfflineBanner; PermissionExplanation; PaginatedListFooter.

Domain: NutrientSummary; MealRow; PortionEditor; AIResultNotice; ExerciseRow; SetEntry; SessionTimer; WorkoutSummary; WeightChart; TrainerCard; ServiceCard; AvailabilitySlot; BookingSummary; PaymentStatusPanel; AppointmentCard; SettlementTimeline; RevenueBreakdown; CertificateCard; PostCard; CommentRow; MessageBubble; TicketMessage.

Giữ cùng border/radius/type/icon trong mọi instance. Badge luôn có text; label tiền và đơn vị không viết tắt mơ hồ. Chart có legend, giá trị/đơn vị/ngày và text summary khi không xem được chart.

## Copy and sample data

Tất cả nội dung UI tiếng Việt có dấu; tên component/code tiếng Anh. Dùng dữ liệu hư cấu nhất quán: Hội viên “Minh Anh”, PT “Hoàng Nam”, dịch vụ “Tập sức mạnh cá nhân”, 300.000 ₫/buổi. Sample earned gross300.000 / phí30.000 / phần PT270.000 chỉ minh họa, không client business calculation.

Ảnh món ăn/động tác/PT phù hợp, có nguồn/license khi bàn giao; không ảnh người nổi tiếng, không lấy tài liệu/chứng chỉ có thông tin thật. Không lorem ipsum, không password/key/token trong preview. Ảnh không có thì placeholder trung tính có nghĩa.

Ngày `28/09/2026`, giờ `18:00–19:00`, đơn vị kg/cm/g/kcal, VND `300.000 ₫`. Múi giờ visible tại booking khi cần. Không bắt mọi appointment vào sample date quá khứ khi nối dữ liệu thật.

## States and truthful feedback

Mỗi màn data-driven có success/loading/empty/error/offline; mỗi form có default/focus/invalid/submitting/success và conflict khi nghiệp vụ cần. Phân biệt “Chưa có dữ liệu” với “Không tải được”. Không error→0, không fake success.

AI: idle/photo preview/analyzing/candidate/edit/confirm/error/unavailable. Không fake phần trăm tiến độ; chỉ indeterminate nếu provider không có progress. Không hiện confidence % nếu BE không cung cấp. Ước tính khẩu phần/calo cần user kiểm tra, không tuyên bố phát hiện dị ứng an toàn.

Payment: chưa thanh toán/đang xác minh/đã thanh toán/thất bại/hết hạn/chưa xác định. Booking state, payment state, refund state và settlement state hiển thị riêng. “Đã duyệt chi” không bằng “Đã chuyển tiền”. Mất kết nối sau thanh toán cần kiểm tra trạng thái, không nút trả lại ngay.

Offline: cho xem cached có timestamp và nhập nháp nếu implementation hỗ trợ; tài chính/booking không giả hoàn thành offline. Session tập có pending sync và retry, không mất dữ liệu khi chưa đồng bộ.

## Privacy and capability

Owner profile khác public profile. Sức khỏe, số điện thoại, birthday đầy đủ, nhật ký ăn/tập, chứng chỉ raw private, chứng từ và thông tin ngân hàng không xuất hiện public. Không có Admin buttons trong app Member/PT.

paymentsEnabled, aiScanEnabled, aiChatEnabled, aiAdaptiveEnabled là capability ý niệm thiết kế, không tự định nghĩa wire fields. Khi chưa khả dụng: thông báo ngắn và fallback manual; không tên model/runtime/key trong UI phổ thông. Không tự gọi Gemini từ client.

VIP/rewards đổi tiền: chỉ future/unavailable preview riêng, không số dư giả, không nút rút/mua active. PT revenue là tiền công buổi tập, không ví rewards. Không hứa payout tự động hoặc deadline chưa được vận hành chốt.

## Export expectations

Gắn ID từ SCREENS.md cho từng frame. Cung cấp component map, token table, state variants và destination từng CTA. UI components nhận data/status/callbacks, không nhúng fetch/token/business math trong presentation.

Nếu hỗ trợ React Native, dùng View/Text/Pressable/ScrollView/FlatList, StyleSheet/theme tokens và callbacks; tương thích Expo/TypeScript, không DOM/window/localStorage. Không tự thêm SDK/payment/model.

Nếu chỉ xuất HTML/Tailwind, ghi rõ là web reference cần chuyển RN; dùng semantic components/tokens và bố cục dễ chuyển, không khẳng định native-ready. Không thiết kế màn thành một bitmap hoặc absolute-position mọi phần tử. Export states/data samples riêng để bỏ được fixtures khi tích hợp.
