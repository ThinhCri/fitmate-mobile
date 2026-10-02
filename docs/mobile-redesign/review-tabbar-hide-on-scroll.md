# Báo Cáo Thay Đổi: Tính Năng Tự Động Ẩn/Hiện Thanh Menu Theo Thao Tác Cuộn (Kiểu Xanh SM)

> **Tài liệu phục vụ review:** Ghi lại toàn bộ yêu cầu, kiến trúc xử lý, danh sách tệp thay đổi và nội dung chi tiết để người dùng kiểm tra lại.

---

## 1. Yêu Cầu Của Người Dùng (User Request)

- **Mô tả:** "Hiện tại tôi muốn là khi mà kéo đến cuối màn á thì cái thanh menu nó tự ẩn xuống bên dưới để thấy các nội dung cuối cùng và khi mà kéo lên 1 tí thì nó hiện lên. Giống xanh sm á."
- **Mục tiêu UX:**
  1. Tránh việc thanh menu nổi (`FloatingTabBar`) che khuất các nội dung, nút bấm hoặc thẻ quan trọng nằm ở cuối màn hình.
  2. Khi người dùng cuộn/lướt xuống (xem tiếp nội dung bên dưới) hoặc kéo chạm đáy trang: Thanh menu tự động trượt mượt mà xuống phía dưới mép màn hình và ẩn đi.
  3. Khi người dùng kéo ngược lên dù chỉ 1 chút (thao tác vuốt xuống để xem lại nội dung trên): Thanh menu lập tức trồi lên lại để tiện chuyển tab.
  4. Luôn đảm bảo thanh menu hiển thị khi ở trên cùng màn hình (đỉnh trang) và tự động khôi phục hiển thị mỗi khi chuyển tab.
  5. Khi thanh menu ẩn: Không chặn các thao tác chạm ở đáy màn hình (chạm thẳng vào nội dung bên dưới).
  6. Tự động ẩn khi bàn phím mở ra và hiện lại khi bàn phím đóng lại.

---

## 2. Danh Sách Tệp Đã Thêm Mới & Chỉnh Sửa

| STT | Đường dẫn tệp | Loại thao tác | Mục đích |
| :--- | :--- | :--- | :--- |
| 1 | `mobile/src/context/TabBarVisibilityContext.tsx` | **Tạo mới** | Context & Provider tính toán cuộn, quản lý giá trị `Animated.Value`, cung cấp hook `useTabBarScroll`. |
| 2 | `mobile/src/context/index.ts` | **Tạo mới** | Export tập trung `TabBarVisibilityProvider`, `useTabBarVisibility`, `useTabBarScroll`. |
| 3 | `mobile/src/context/__tests__/tabBarVisibility.test.ts` | **Tạo mới** | Bộ unit test kiểm tra logic cuộn: chạm đáy, kéo lên 1 tí, ở đỉnh trang, chống rung tay, chống nảy iOS. |
| 4 | `mobile/src/components/ui/FloatingTabBar.tsx` | **Chỉnh sửa** | Bọc thanh pill vào `Animated.View`, chuyển động `translateY` mượt mà và chuyển `pointerEvents` khi ẩn/hiện. |
| 5 | `mobile/app/(tabs)/_layout.tsx` | **Chỉnh sửa** | Bọc layout các tab vào `TabBarVisibilityProvider` và thêm `TabsActiveWatcher` để tự hiện lại menu khi đổi tab. |
| 6 | `mobile/src/features/dashboard/MemberHomePresentation.tsx` | **Chỉnh sửa** | Gắn `useTabBarScroll` vào `ScrollView` màn hình Trang chủ (Dashboard). |
| 7 | `mobile/src/features/nutrition/NutritionDiaryPresentation.tsx` | **Chỉnh sửa** | Gắn `useTabBarScroll` vào `ScrollView` màn hình Nhật ký Dinh dưỡng (Nutrition). |
| 8 | `mobile/src/features/workout/WorkoutOverviewPresentation.tsx` | **Chỉnh sửa** | Gắn `useTabBarScroll` vào `ScrollView` màn hình Kế hoạch Tập luyện (Workout). |
| 9 | `mobile/src/features/community/CommunityFeedPresentation.tsx` | **Chỉnh sửa** | Gắn `useTabBarScroll` vào `ScrollView` màn hình Cộng đồng (Social) và tăng `paddingBottom` lên 112dp. |
| 10 | `mobile/src/features/trainer/TrainerListPresentation.tsx` | **Chỉnh sửa** | Gắn `useTabBarScroll` vào `FlatList` danh sách Huấn luyện viên PT (Marketplace). |
| 11 | `docs/mobile-redesign/handoff.md` | **Chỉnh sửa** | Cập nhật nhật ký bàn giao tiến độ kỹ thuật của dự án. |

---

## 3. Chi Tiết Nội Dung Thay Đổi Ở Từng Tệp

### 3.1. `mobile/src/context/TabBarVisibilityContext.tsx` (Tạo mới)
- Xây dựng hàm độc lập `computeScrollVisibilityAction`:
  - `currentY <= 15`: Trả về `'show'` (luôn hiện ở đỉnh trang).
  - Chạm đáy (`layoutHeight + currentY >= contentHeight - 35`): Trả về `'hide'` (ẩn để thấy hết nội dung cuối).
  - `diff > 12` (lướt xuống): Trả về `'hide'`.
  - `diff < -10` (kéo lên 1 tí): Trả về `'show'`.
  - Bouncing iOS (`currentY > contentHeight - layoutHeight + 15`): Trả về `'none'` (tránh rung lắc).
- Tạo `TabBarVisibilityProvider` dùng `Animated.timing` với `useNativeDriver: true` và `Easing.out(Easing.cubic)` đảm bảo 60fps mượt mà trên điện thoại.
- Lắng nghe sự kiện mở/đóng bàn phím qua `Keyboard.addListener`.
- Cung cấp hook `useTabBarScroll(customOnScroll)` có thể truyền vào bất kỳ `ScrollView` hay `FlatList` nào.

### 3.2. `mobile/src/components/ui/FloatingTabBar.tsx` (Chỉnh sửa)
- Lấy `animProgress` và `isVisible` từ `useTabBarVisibility()`.
- Tính khoảng cách trượt ẩn an toàn: `hideDistance = PILL_HEIGHT + bottomPad + 32`.
- Nội suy `translateY` từ 0 đến `hideDistance`.
- Đổi thẻ ngoài cùng từ `<View>` thành `<Animated.View style={[{ transform: [{ translateY }] }]}>`.
- Thiết lập `pointerEvents={isVisible ? 'box-none' : 'none'}` để khi menu trượt ẩn thì người dùng bấm vào các nút ở đáy màn hình không bị chạm nhầm vào thanh menu.

### 3.3. `mobile/app/(tabs)/_layout.tsx` (Chỉnh sửa)
- Bọc toàn bộ thẻ `<Tabs>` trong `<TabBarVisibilityProvider>`.
- Bổ sung component phụ `<TabsActiveWatcher activeRoute={activeRoute} />` gọi `showTabBar()` mỗi khi chuyển tab, giúp màn hình mới luôn hiển thị menu ban đầu.

### 3.4. Các màn hình chính (Dashboard, Nutrition, Workout, Social, Trainer)
- Nhận diện thao tác cuộn bằng cách gọi `const { onScroll: handleScroll, scrollEventThrottle } = useTabBarScroll(externalOnScroll)`.
- Gắn `onScroll={handleScroll}` và `scrollEventThrottle={scrollEventThrottle}` vào `ScrollView` / `FlatList`.
- Điều chỉnh `paddingBottom: 112` ở màn hình Cộng đồng để đảm bảo các bài viết cuối cùng có khoảng trống thoải mái khi xem.

---

## 4. Hướng Dẫn Kiểm Tra Lại (Verification)

Mở terminal tại thư mục `mobile` và chạy các lệnh:

```powershell
# 1. Kiểm tra lỗi kiểu dữ liệu (TypeScript)
npm run type-check

# 2. Chạy kiểm thử tự động cho logic cuộn
npm test -- src/context/__tests__/tabBarVisibility.test.ts

# 3. Khởi động app để trải nghiệm thực tế trên điện thoại hoặc máy ảo
npx expo start -c
```
