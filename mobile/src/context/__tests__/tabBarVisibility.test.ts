import { describe, it, expect } from 'vitest';
import { computeScrollVisibilityAction } from '../scrollVisibilityLogic';

describe('TabBarVisibility Hide-on-Scroll Logic (Xanh SM style)', () => {
  it('1. Luôn hiển thị thanh menu khi người dùng ở đầu trang (currentY <= 15)', () => {
    const action = computeScrollVisibilityAction({
      currentY: 5,
      lastOffsetY: 20,
      layoutHeight: 800,
      contentHeight: 2000,
    });
    expect(action).toBe('show');
  });

  it('2. Ẩn thanh menu khi người dùng kéo đến cuối màn hình (isCloseToBottom)', () => {
    // layout 800, currentY 1180, total content 2000 => 800 + 1180 = 1980 >= 2000 - 35
    const action = computeScrollVisibilityAction({
      currentY: 1180,
      lastOffsetY: 1170,
      layoutHeight: 800,
      contentHeight: 2000,
    });
    expect(action).toBe('hide');
  });

  it('3. Ẩn thanh menu khi người dùng lướt xuống dưới với khoảng cuộn rõ rệt (diff > 12)', () => {
    const action = computeScrollVisibilityAction({
      currentY: 200,
      lastOffsetY: 180, // diff = +20 (> 12)
      layoutHeight: 800,
      contentHeight: 2000,
    });
    expect(action).toBe('hide');
  });

  it('4. Hiện thanh menu ngay lập tức khi người dùng kéo lên 1 tí (diff < -10)', () => {
    const action = computeScrollVisibilityAction({
      currentY: 300,
      lastOffsetY: 320, // diff = -20 (< -10)
      layoutHeight: 800,
      contentHeight: 2000,
    });
    expect(action).toBe('show');
  });

  it('5. Không đổi trạng thái khi chuyển động quá nhỏ (chống rung ngón tay)', () => {
    const action = computeScrollVisibilityAction({
      currentY: 205,
      lastOffsetY: 200, // diff = +5 (nhỏ hơn ngưỡng 12)
      layoutHeight: 800,
      contentHeight: 2000,
    });
    expect(action).toBe('none');
  });

  it('6. Không nhấp nháy khi overscroll / nảy cuối trang trên iOS', () => {
    // max scroll offset is contentHeight - layoutHeight = 1200
    // user pulls past bottom to 1250 (rubber-band)
    const action = computeScrollVisibilityAction({
      currentY: 1250,
      lastOffsetY: 1260, // springing back up
      layoutHeight: 800,
      contentHeight: 2000,
    });
    expect(action).toBe('none');
  });
});
