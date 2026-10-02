export type ScrollVisibilityAction = 'show' | 'hide' | 'none';

/**
 * Hàm tính toán hành vi hiển thị/ẩn của thanh FloatingTabBar dựa trên sự kiện cuộn.
 * Tuân thủ trải nghiệm giống Xanh SM / Grab:
 * - Ở đầu trang (offset <= 15): Luôn hiện thanh menu.
 * - Chạm / gần cuối màn hình (isCloseToBottom): Luôn ẩn thanh menu để không che nội dung cuối.
 * - Lướt xuống (diff > 12): Ẩn thanh menu xuống dưới.
 * - Lướt ngược lên 1 tí (diff < -10): Hiện lại thanh menu ngay lập tức.
 * - Bouncing / overscroll cuối trang (iOS rubber-band): Giữ nguyên, không nhấp nháy.
 */
export function computeScrollVisibilityAction({
  currentY,
  lastOffsetY,
  layoutHeight,
  contentHeight,
}: {
  currentY: number;
  lastOffsetY: number;
  layoutHeight: number;
  contentHeight: number;
}): ScrollVisibilityAction {
  // 1. Luôn hiển thị thanh menu khi ở gần đỉnh màn hình hoặc khi kéo nảy đầu trang
  if (currentY <= 15) {
    return 'show';
  }

  // 2. Tránh nhấp nháy khi overscroll / nảy ở đáy trang (iOS rubber-banding)
  if (contentHeight > 0 && currentY > contentHeight - layoutHeight + 15) {
    return 'none';
  }

  // 3. Khi kéo đến cuối màn hình -> ẩn thanh menu để thấy trọn vẹn nội dung cuối cùng
  const isCloseToBottom =
    contentHeight > 0 && layoutHeight + currentY >= contentHeight - 35;
  if (isCloseToBottom) {
    return 'hide';
  }

  const diff = currentY - lastOffsetY;

  // 4. Kéo màn hình xuống (lướt xuống để xem nội dung bên dưới) -> ẩn thanh menu
  if (diff > 12) {
    return 'hide';
  }

  // 5. Kéo màn hình lên 1 tí (lướt ngược lên trên) -> hiện lại thanh menu ngay lập tức
  if (diff < -10) {
    return 'show';
  }

  return 'none';
}
