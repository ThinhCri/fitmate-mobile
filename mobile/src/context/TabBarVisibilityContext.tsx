import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';

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

export interface TabBarVisibilityContextType {
  /** Giá trị Animated từ 0 (hiển thị) đến 1 (ẩn xuống dưới màn hình) */
  animProgress: Animated.Value;
  /** Trạng thái hiển thị hiện tại của thanh menu */
  isVisible: boolean;
  /** Buộc hiển thị lại thanh menu */
  showTabBar: () => void;
  /** Buộc ẩn thanh menu xuống dưới */
  hideTabBar: () => void;
  /** Callback xử lý sự kiện cuộn từ ScrollView / FlatList */
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const defaultAnimProgress = new Animated.Value(0);

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType>({
  animProgress: defaultAnimProgress,
  isVisible: true,
  showTabBar: () => {},
  hideTabBar: () => {},
  handleScroll: () => {},
});

export interface TabBarVisibilityProviderProps {
  children: ReactNode;
}

/**
 * Provider quản lý hiển thị/ẩn thanh FloatingTabBar theo thao tác cuộn (giống Xanh SM).
 * - Kéo lướt xuống dưới (xem nội dung bên dưới) hoặc kéo sát đáy: Tự ẩn thanh menu để không che nội dung cuối.
 * - Kéo lướt ngược lên 1 tí: Tự trượt hiện lại ngay lập tức.
 * - Khi ở đầu trang hoặc đổi tab: Luôn hiển thị.
 */
export function TabBarVisibilityProvider({ children }: TabBarVisibilityProviderProps) {
  const animProgress = useRef(new Animated.Value(0)).current;
  const isVisibleRef = useRef(true);
  const [isVisible, setIsVisible] = useState(true);
  const lastOffsetY = useRef(0);

  const showTabBar = useCallback(() => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setIsVisible(true);
      Animated.timing(animProgress, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [animProgress]);

  const hideTabBar = useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setIsVisible(false);
      Animated.timing(animProgress, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [animProgress]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const currentY = contentOffset?.y ?? 0;

      const action = computeScrollVisibilityAction({
        currentY,
        lastOffsetY: lastOffsetY.current,
        layoutHeight: layoutMeasurement?.height ?? 0,
        contentHeight: contentSize?.height ?? 0,
      });

      if (action === 'show') {
        showTabBar();
      } else if (action === 'hide') {
        hideTabBar();
      }

      lastOffsetY.current = currentY;
    },
    [showTabBar, hideTabBar]
  );

  // Tự động ẩn thanh menu khi mở bàn phím và hiện lại khi đóng bàn phím
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        hideTabBar();
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        showTabBar();
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [hideTabBar, showTabBar]);

  return (
    <TabBarVisibilityContext.Provider
      value={{
        animProgress,
        isVisible,
        showTabBar,
        hideTabBar,
        handleScroll,
      }}
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility(): TabBarVisibilityContextType {
  return useContext(TabBarVisibilityContext);
}

/**
 * Hook gắn vào bất kỳ ScrollView hoặc FlatList nào trong các màn hình thuộc tab bar.
 * Tự động đồng bộ sự kiện cuộn để ẩn/hiện thanh menu giống Xanh SM.
 */
export function useTabBarScroll(
  customOnScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
) {
  const context = useContext(TabBarVisibilityContext);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      context?.handleScroll(event);
      customOnScroll?.(event);
    },
    [context, customOnScroll]
  );

  return {
    onScroll,
    scrollEventThrottle: 16,
    isVisible: context ? context.isVisible : true,
    showTabBar: context ? context.showTabBar : () => {},
    hideTabBar: context ? context.hideTabBar : () => {},
  };
}
