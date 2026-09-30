import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

export interface ModalShellProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  position?: 'bottom' | 'center';
}

export const ModalShell: React.FC<ModalShellProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  containerStyle,
  position = 'bottom',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[
            styles.backdrop,
            position === 'bottom' ? styles.backdropBottom : styles.backdropCenter,
          ]}
        >
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[
                styles.modalBox,
                position === 'bottom' ? styles.bottomSheet : styles.centerDialog,
                containerStyle,
              ]}
            >
              {title ? (
                <View style={styles.header}>
                  <Text style={[typography.title3, styles.headerTitle]} numberOfLines={1}>
                    {title}
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    accessibilityRole="button"
                    accessibilityLabel="Đóng hộp thoại"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.body}>{children}</View>

              {footer ? <View style={styles.footer}>{footer}</View> : null}
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
  },
  backdropBottom: {
    justifyContent: 'flex-end',
  },
  backdropCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalBox: {
    backgroundColor: colors.surface,
    width: '100%',
    maxHeight: '85%',
  },
  bottomSheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxxl,
  },
  centerDialog: {
    borderRadius: radius.lg,
    maxWidth: 400,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
  },
  closeButton: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
});
