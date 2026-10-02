import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';
import {
  computeScrollVisibilityAction,
  type ScrollVisibilityAction,
} from './scrollVisibilityLogic';

export {
  computeScrollVisibilityAction,
  type ScrollVisibilityAction,
};

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
