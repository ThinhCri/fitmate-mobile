# Fitmate — Bộ giao thiết kế cho Stitch

Ngày 2026-09-28. Chỉ tạo tài liệu thiết kế; không thay code, theme hay nghiệp vụ đang chạy. Thiết kế mới theo yêu cầu sáng, sạch, chuyên nghiệp của user; không sao chép giao diện Admin Web. Đây là target UI, không xác nhận các API/capability đã hoàn thành.

## Cách dùng ít thao tác nhất

1. Tạo project **App/mobile** trong Stitch.
2. Đưa [DESIGN.md](DESIGN.md) vào phần design system/tài liệu thiết kế nếu giao diện Stitch có hỗ trợ. Nếu không, đính kèm trong hội thoại dự án.
3. Đính kèm [SCREENS.md](SCREENS.md) trong hội thoại để Stitch có đầy đủ nội dung màn hình.
4. Copy nguyên khối đầu tiên trong [STITCH-PROMPT.md](STITCH-PROMPT.md) gửi vào hội thoại. Prompt yêu cầu bắt đầu với năm màn đại diện; các màn còn lại chia batch để tránh bỏ sót và đổi style.
5. Khi ưng style, gửi lần lượt các prompt batch ở cuối file. Giữ cùng project; không tạo lại design system mỗi batch.
6. Trước xuất code, gửi prompt kiểm kê cuối để Stitch báo màn/variant/link còn thiếu. Giữ screen IDs để Antigravity nối đúng.

Nếu Stitch không đọc attachment, dán nội dung DESIGN.md một lần, sau đó dán từng mục SCREENS.md tương ứng batch. Không chỉ gửi tên màn như “làm trang dinh dưỡng” vì dễ mất fields/states.

## Điều có thể và không thể kỳ vọng

Stitch có thể tạo thiết kế và xuất frontend code; đích app hiện tại của repo là **React Native + Expo + TypeScript + Expo Router**, không phải website. Nếu output là HTML/CSS/Tailwind, không thể dán nguyên vào React Native; cần chuyển components/layout/navigation. Yêu cầu Stitch xuất RN nếu công cụ hỗ trợ, nếu không giữ code web như bản tham chiếu và dùng token/screen IDs/component map để chuyển.

Ngay cả output RN cũng cần review dependencies, safe-area/keyboard/accessibility và nối adapters/auth/state với BE. Không hứa chỉ thêm một hàm gọi API là production-ready. Mock design data chỉ phục vụ preview; không fallback vào app khi API lỗi.

## Nguồn nghiệp vụ và điểm khác prototype cũ

Đọc production/README, business-requirements, shared-business-rules và payment-manual-settlement trong docs của repo này; production baseline BE và cập nhật manual settlement ưu tiên hơn screen-specs prototype.

- Không quick login/mật khẩu mẫu, bấm tăng streak, duyệt chứng chỉ giả hoặc fake scan timer.
- Hồ sơ sức khỏe private; public profile không hiện bệnh/dị ứng/số điện thoại/ngày sinh đầy đủ/cân nặng cá nhân.
- payOS checkout ngoài app, BE xác nhận trạng thái; redirect không là đã trả tiền.
- PT chờ Admin xác nhận buổi/khách/PT/chứng từ rồi chi thủ công; không tự rút và không hứa lịch trả tiền cố định.
- Gemini là phương án adapter có thể dùng cho demo thật; **chưa được coi đã tích hợp**. UI AI không phụ thuộc provider, có unavailable/manual fallback.
- VIP/rewards đổi tiền giữ như future feature, không dựng luồng mua/rút tiền thật.

## Cơ sở thiết kế tham khảo

Áp dụng có chọn lọc, không sao chép một app cụ thể:

- [Android: layout và navigation](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns): navigation chính 3–5 đích; chọn 5 tab ngang hàng cho Fitmate.
- [Android: touch targets](https://support.google.com/accessibility/android/answer/7101858): vùng chạm tối thiểu 48 × 48 dp, icon nhìn nhỏ hơn nhưng hit area đủ lớn.
- [W3C: contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum): chữ thường 4.5:1, chữ lớn 3:1; màu nhạt chỉ dùng nền, không dùng text khó đọc.
- [Google: giới thiệu Stitch](https://developers.googleblog.com/stitch-a-new-way-to-design-uis/): tạo UI và xuất frontend code là bước thiết kế/phát triển, không thay nghiệm thu backend.

Màu/token cụ thể là đề xuất do Stitch chọn theo DESIGN.md, chưa đo contrast hoặc nghiệm thu render ở lượt tài liệu này. Không tự thay design-system.md cũ trước khi user duyệt thiết kế.
