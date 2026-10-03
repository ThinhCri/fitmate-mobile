# Báo Cáo Thay Đổi & Tiến Trình Xử Lý: Ẩn/Hiện Menu Xanh SM & Khởi Động BE/FE

> **Tài liệu phục vụ review:** Ghi lại toàn bộ yêu cầu, kiến trúc xử lý, danh sách tất cả các tệp thay đổi/thêm mới (cả Frontend và Backend), cùng kết quả kiểm thử tự động để người dùng kiểm tra lại bất cứ lúc nào.

> **Lưu ý sau review 2026-10-03:** Các số test, cổng server và trạng thái tiến trình bên dưới chỉ là bằng chứng tại thời điểm thực hiện, không phải trạng thái hiện tại. Không lưu hoặc hướng dẫn thay mật khẩu thật trong tài liệu UI. Backend và Mobile phải đọc `.env` riêng, không commit secret.

---

## 1. Yêu Cầu Của Người Dùng (User Requests)

1. **Yêu cầu 1 (Tính năng UI Mobile):**
   - "Hiện tại tôi muốn là khi mà kéo đến cuối màn á thì cái thanh menu nó tự ẩn xuống bên dưới để thấy các nội dung cuối cùng và khi mà kéo lên 1 tí thì nó hiện lên. Giống xanh sm á."
   - Mục tiêu: Tự động trượt ẩn thanh menu bo tròn (`FloatingTabBar`) khi lướt xuống hoặc chạm đáy màn hình để không che nội dung cuối; trồi lên lại ngay lập tức khi người dùng kéo ngược lên 1 tí; đảm bảo luôn hiện ở đỉnh trang và khi đổi tab; tự ẩn khi bàn phím mở.
2. **Yêu cầu 2 (Kiểm tra & Vận hành):**
   - Hướng dẫn chạy kiểm thử Backend và Frontend.
   - Khắc phục các lỗi phát sinh trong quá trình chạy máy chủ (lỗi thiếu khóa `JWT_SIGNING_KEY`, lỗi sai mật khẩu DB `password authentication failed`).
   - Tự động chạy toàn bộ test kiểm tra, đảm bảo PASS 100% trước khi bàn giao.
   - Ghi lại đầy đủ mọi thay đổi vào file review này.

---

## 2. Toàn Bộ Danh Sách Tệp Đã Thêm Mới & Chỉnh Sửa

### A. Frontend Mobile (`FitmateAI_FE`):
| STT | Đường dẫn tệp | Loại thao tác | Mục đích chi tiết |
| :--- | :--- | :--- | :--- |
| 1 | `mobile/src/context/scrollVisibilityLogic.ts` | **Tạo mới** | Thuật toán tính toán cuộn độc lập (chạm đáy, cuộn xuống, kéo lên 1 tí, chống rung ngón tay, chống nảy trang iOS) — tách biệt thuần túy để Vitest test siêu tốc trên Node. |
| 2 | `mobile/src/context/TabBarVisibilityContext.tsx` | **Tạo mới** | React Context & Provider quản lý `Animated.Value`, chuyển động trượt 60fps mượt mà, lắng nghe bàn phím và cung cấp hook `useTabBarScroll`. |
| 3 | `mobile/src/context/index.ts` | **Tạo mới** | Export tập trung `TabBarVisibilityProvider`, `useTabBarVisibility`, `useTabBarScroll`. |
| 4 | `mobile/src/context/__tests__/tabBarVisibility.test.ts` | **Tạo mới** | Bộ unit test kiểm tra 6 tình huống cuộn (đầu trang, chạm đáy, cuộn xuống, kéo lên 1 tí, chuyển động nhỏ, nảy đáy iOS). |
| 5 | `mobile/src/components/ui/FloatingTabBar.tsx` | **Chỉnh sửa** | Bọc thanh pill vào `<Animated.View>`, gắn hiệu ứng `translateY` mượt mà và chuyển `pointerEvents` khi ẩn/hiện để tránh chạm nhầm. |
| 6 | `mobile/app/(tabs)/_layout.tsx` | **Chỉnh sửa** | Bọc layout các tab vào `TabBarVisibilityProvider` và gắn `TabsActiveWatcher` để tự hiện lại menu mỗi khi người dùng đổi tab. |
| 7 | `mobile/src/features/dashboard/MemberHomePresentation.tsx` | **Chỉnh sửa** | Gắn `useTabBarScroll` vào `ScrollView` màn hình Trang chủ (Dashboard). |
| 8 | `mobile/src/features/nutrition/NutritionDiaryPresentation.tsx` | **Chỉnh sửa** | Gắn `useTabBarScroll` vào `ScrollView` màn hình Nhật ký Dinh dưỡng (Nutrition). |
| 9 | `mobile/src/features/workout/WorkoutOverviewPresentation.tsx` | **Chỉnh sửa** | Gắn `useTabBarScroll` vào `ScrollView` màn hình Kế hoạch Tập luyện (Workout). |
| 10 | `mobile/src/features/community/CommunityFeedPresentation.tsx` | **Chỉnh sửa** | Gắn `useTabBarScroll` vào `ScrollView` màn hình Cộng đồng (Social) và tăng `paddingBottom` lên 112dp. |
| 11 | `mobile/src/features/trainer/TrainerListPresentation.tsx` | **Chỉnh sửa** | Gắn `useTabBarScroll` vào `FlatList` danh sách Huấn luyện viên PT (Marketplace). |
| 12 | `docs/mobile-redesign/handoff.md` | **Chỉnh sửa** | Cập nhật nhật ký bàn giao kỹ thuật của dự án di động. |
| 13 | `docs/mobile-redesign/review-tabbar-hide-on-scroll.md` | **Tạo mới** | File tài liệu tổng hợp này. |

### B. Backend .NET 8 (`FitmateAI_BE`):
| STT | Đường dẫn tệp | Loại thao tác | Mục đích chi tiết |
| :--- | :--- | :--- | :--- |
| 14 | `src/Fitmate.Api/DotEnvLoader.cs` | **Tạo mới** | Class helper tự động tìm và đọc file `.env` cục bộ khi chạy trực tiếp `dotnet run` trên máy tính, tránh lỗi thiếu biến môi trường. |
| 15 | `src/Fitmate.Api/Program.cs` | **Chỉnh sửa** | Gọi `DotEnvLoader.Load()` ngay tại dòng đầu tiên của file startup để nạp đầy đủ cấu hình trước khi khởi động Web Host. |
| 16 | `.env` | **Cấu hình local, không commit** | Người vận hành tự đặt credentials khớp với PostgreSQL local. Giá trị thật không được ghi trong tài liệu hoặc Git. |

---

## 3. Chi Tiết Lỗi Gặp Phải Và Cách Khắc Phục

### 3.1. Lỗi thiếu `JWT_SIGNING_KEY` khi chạy `dotnet run`
- **Nguyên nhân:** Lệnh `dotnet run` của .NET mặc định không tự động đọc file `.env` trên ổ cứng (file này trước đây do Docker Compose tự nạp). Do đó `JwtOptionsLoader.cs` báo lỗi `JwtOptions.SigningKey must be configured`.
- **Khắc phục:** Viết thêm [`DotEnvLoader.cs`](file:///d:/Ky8/exe201/FitmateAI_BE/src/Fitmate.Api/DotEnvLoader.cs) tự động quét file `.env` tại thư mục gốc và nạp vào biến môi trường trước khi ứng dụng khởi chạy.

### 3.2. Lỗi `password authentication failed for user "fitmate"`
- **Nguyên nhân:** Credentials trong `.env` không khớp PostgreSQL đang chạy. Named volume có thể giữ mật khẩu được tạo từ lần khởi tạo đầu tiên.
- **Khắc phục:** Đối chiếu đúng cấu hình của database local hiện tại. Không ghi mật khẩu thật vào tài liệu và không xóa volume có dữ liệu người dùng để chữa lỗi.

### 3.3. Lỗi `address already in use` trên cổng 5116
- **Nguyên nhân:** Cổng 5116 báo bận vì container Docker `fitmateai_be-api-1` **đang chạy sẵn Backend ở chế độ hot-reload (`dotnet watch run`)**.
- **Khắc phục:** Đã kiểm tra trực tiếp qua `curl http://localhost:5116/swagger/index.html` và nhận kết quả **HTTP 200 OK**. Backend đã hoạt động sẵn sàng từ container này.

### 3.4. Lỗi Vitest import type trong `tabBarVisibility.test.ts`
- **Nguyên nhân:** Rollup/Vite parser trên Node gặp lỗi cú pháp khi import inline type từ file có chứa component của `react-native`.
- **Khắc phục:** Tách toàn bộ hàm tính toán logic cuộn sang [`scrollVisibilityLogic.ts`](file:///d:/Ky8/exe201/FitmateAI_FE/mobile/src/context/scrollVisibilityLogic.ts) thuần TypeScript, tách riêng `export type` trong [`index.ts`](file:///d:/Ky8/exe201/FitmateAI_FE/mobile/src/context/index.ts). Bài test chạy thành công 100%.

---

## 4. Báo Cáo Kết Quả Kiểm Thử (All Tests Succeeded)

### ✅ Backend (.NET 8):
- **Lệnh thực hiện:** `dotnet test --no-build`
- **Fitmate.UnitTests:** `Passed: 879`, `Failed: 0`, `Skipped: 0` (Thời gian: 8s)
- **Fitmate.IntegrationTests:** `Passed: 61`, `Failed: 0`, `Skipped: 0` (Thời gian: 21s)
- **👉 Tổng cộng:** **940 / 940 tests của Backend PASS 100%!**

### ✅ Frontend Mobile (React Native / TypeScript):
- **Kiểm tra kiểu dữ liệu:** `npm run type-check` (`tsc --noEmit`) hoàn thành với **0 lỗi**.
- **Kiểm tra logic thanh menu ẩn/hiện:** `npx vitest run src/context/__tests__/tabBarVisibility.test.ts`
  - `Passed: 6 / 6 tests` (Thời gian: 6ms)
  - Xác nhận chính xác:
    1. Luôn hiện thanh menu khi ở đầu trang (`currentY <= 15`).
    2. Tự ẩn thanh menu khi kéo tới cuối màn hình (`isCloseToBottom`).
    3. Tự ẩn thanh menu khi lướt cuộn xuống (`diff > 12`).
    4. Hiện lại ngay lập tức khi kéo ngược lên 1 tí (`diff < -10`).
    5. Chống rung ngón tay khi chuyển động quá nhỏ (`diff <= 12`).
    6. Chống nhấp nháy khi overscroll / nảy cuối trang trên iOS.

---

## 5. Hướng Dẫn Thao Tác Kiểm Tra Thực Tế

1. **Backend:** Kiểm tra cổng thực tế từ output `dotnet run` hoặc mapping Docker hiện tại; không giả định tiến trình cũ vẫn chạy ở `5116`.
2. **Khởi động Frontend Mobile:**
   Mở terminal tại `d:\Ky8\exe201\FitmateAI_FE\mobile` và chạy:
   ```powershell
   npx expo start -c
   ```
   - Bấm `a` để mở trên máy ảo Android (đã kết nối sẵn IP `10.0.2.2:5116`).
   - Hoặc quét mã QR trên điện thoại qua ứng dụng Expo Go.

---

## 6. Yêu Cầu Bổ Sung: Nền Gradient Glass Feel + Card Trắng Nổi

### 6.1. Yêu cầu
- "Cho tôi màu nền như đó đi (giống FloatingTabBar — nhìn xuyên, nhạt nhạt đẹp), mấy cái có nội dung thì màu bọc mấy nó trắng trắng và sắp xếp như nó."
- Phạm vi: Tất cả 5 tab trong Mobile App (Dashboard, Workout, Nutrition, Social, Marketplace).

### 6.2. Giải pháp
- Tạo component `GradientBackground` sử dụng `expo-linear-gradient` (đã có sẵn trong `package.json`).
- Gradient dọc từ mint nhạt `#E8FAF0` → `#F0FDF8` → `#F8FCFA` → `#FFFFFF` (trắng).
- Card giữ nguyên nền trắng `#FFFFFF` với viền + shadow nhẹ → nổi lên trên nền gradient, tạo cảm giác "glass feel".

### 6.3. Tệp thay đổi

| STT | Đường dẫn tệp | Loại thao tác | Mục đích chi tiết |
| :--- | :--- | :--- | :--- |
| 17 | `mobile/src/components/design-system/GradientBackground.tsx` | **Tạo mới** | Component nền gradient mint-to-white, hỗ trợ 3 preset (default / warm / cool), dùng `expo-linear-gradient`. |
| 18 | `mobile/src/features/dashboard/MemberHomePresentation.tsx` | **Chỉnh sửa** | Bọc `ScrollView` trong `GradientBackground`, đổi container bg → transparent. |
| 19 | `mobile/src/features/workout/WorkoutOverviewPresentation.tsx` | **Chỉnh sửa** | Bọc `ScrollView` trong `GradientBackground`, đổi container bg → transparent. |
| 20 | `mobile/src/features/nutrition/NutritionDiaryPresentation.tsx` | **Chỉnh sửa** | Bọc `ScrollView` trong `GradientBackground`, đổi container bg → transparent. |
| 21 | `mobile/src/features/community/CommunityFeedPresentation.tsx` | **Chỉnh sửa** | Bọc `ScrollView` trong `GradientBackground`, đổi container bg → transparent. |
| 22 | `mobile/src/features/trainer/TrainerListPresentation.tsx` | **Chỉnh sửa** | Bọc `View` + `FlatList` trong `GradientBackground`, đổi container bg → transparent. |
| 23 | `mobile/src/components/design-system/Card.tsx` | **Chỉnh sửa** | Tăng shadow offset/radius cho variant `surface` để card nổi rõ hơn trên nền gradient. |

---

## 7. Kết quả review và sửa bổ sung — 2026-10-03

- Nền gradient phẳng được bổ sung ba lớp màu môi trường và watermark mờ nằm phía sau nội dung. Nhờ vậy card/tab bar bán trong suốt có chi tiết nền để tạo cảm giác chiều sâu thay vì chỉ đổi màu nền.
- Card chuẩn chuyển sang trắng gần đục, viền trắng nhẹ, bo góc lớn và bóng mềm. Không làm card chứa nhiều chữ quá trong vì sẽ giảm khả năng đọc.
- `BlurView` trên Android trước đây không chỉ định blur method nên thường chỉ hiện tint. Bản sửa dùng `dimezisBlurViewSdk31Plus` trên Android 12 trở lên và giữ fallback bán trong suốt trên thiết bị cũ.
- Thanh tab dùng margin ngang 16dp thật thay vì công thức phần trăm phụ thuộc giả định chiều rộng màn hình.
- Offset cuộn được reset khi đổi tab; sự kiện cuộn đầu tiên của tab mới không còn so với offset của tab trước.
- Chưa chạy command kiểm thử tự động trong lượt này theo quy tắc hiện hành của repository. Cần kiểm tra trên Android thật vì mức blur và hiệu năng phụ thuộc phiên bản hệ điều hành/GPU.
