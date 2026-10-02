# Báo Cáo Thay Đổi & Tiến Trình Xử Lý: Ẩn/Hiện Menu Xanh SM & Khởi Động BE/FE

> **Tài liệu phục vụ review:** Ghi lại toàn bộ yêu cầu, kiến trúc xử lý, danh sách tất cả các tệp thay đổi/thêm mới (cả Frontend và Backend), cùng kết quả kiểm thử tự động để người dùng kiểm tra lại bất cứ lúc nào.

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
| 16 | `.env` | **Chỉnh sửa** | Sửa `DB_PASSWORD=dev` để khớp chính xác với mật khẩu của PostgreSQL local/Docker (trước đó bị đặt nhầm thành `localverify300pw`). |

---

## 3. Chi Tiết Lỗi Gặp Phải Và Cách Khắc Phục

### 3.1. Lỗi thiếu `JWT_SIGNING_KEY` khi chạy `dotnet run`
- **Nguyên nhân:** Lệnh `dotnet run` của .NET mặc định không tự động đọc file `.env` trên ổ cứng (file này trước đây do Docker Compose tự nạp). Do đó `JwtOptionsLoader.cs` báo lỗi `JwtOptions.SigningKey must be configured`.
- **Khắc phục:** Viết thêm [`DotEnvLoader.cs`](file:///d:/Ky8/exe201/FitmateAI_BE/src/Fitmate.Api/DotEnvLoader.cs) tự động quét file `.env` tại thư mục gốc và nạp vào biến môi trường trước khi ứng dụng khởi chạy.

### 3.2. Lỗi `password authentication failed for user "fitmate"`
- **Nguyên nhân:** Trong file `.env` của Backend, biến `DB_PASSWORD` đang để giá trị `localverify300pw`, trong khi instance database PostgreSQL Docker thực tế được khởi tạo với mật khẩu là `dev`.
- **Khắc phục:** Cập nhật lại `DB_PASSWORD=dev` trong `.env`.

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

1. **Backend:** Đang chạy sẵn sàng tại `http://localhost:5116` (Swagger: `http://localhost:5116/swagger`).
2. **Khởi động Frontend Mobile:**
   Mở terminal tại `d:\Ky8\exe201\FitmateAI_FE\mobile` và chạy:
   ```powershell
   npx expo start -c
   ```
   - Bấm `a` để mở trên máy ảo Android (đã kết nối sẵn IP `10.0.2.2:5116`).
   - Hoặc quét mã QR trên điện thoại qua ứng dụng Expo Go.
