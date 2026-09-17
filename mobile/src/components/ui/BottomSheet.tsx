import React, { useCallback, useImperativeHandle, useMemo, useRef, forwardRef } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import BottomSheetLib, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeProvider';

export type BottomSheetRef = {
  expand: () => void;
  close: () => void;
};

export type BottomSheetProps = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number;
  enablePanDownToClose?: boolean;
  onClose?: () => void;
};

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(function BottomSheet(
  { children, snapPoints = ['50%', '90%'], initialIndex = -1, enablePanDownToClose = true, onClose },
  ref
) {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetLib>(null);

  useImperativeHandle(ref, () => ({
    expand: () => sheetRef.current?.expand(),
    close: () => sheetRef.current?.close(),
  }));

  const memoSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetLib
      ref={sheetRef}
      index={initialIndex}
      snapPoints={memoSnapPoints}
      enablePanDownToClose={enablePanDownToClose}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: theme.semantic.outline,
        width: 36,
      }}
      backgroundStyle={{
        backgroundColor: theme.semantic.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      style={styles.shadow}
    >
      <BottomSheetView style={styles.content}>{children}</BottomSheetView>
    </BottomSheetLib>
  );
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
});
