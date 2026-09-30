import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

export interface BaseButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
}

export const PrimaryButton: React.FC<BaseButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  labelStyle,
  leftIcon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles.primary,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              typography.bodyBold,
              styles.primaryLabel,
              leftIcon ? { marginLeft: spacing.sm } : null,
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export const SecondaryButton: React.FC<BaseButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  labelStyle,
  leftIcon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        styles.secondary,
        fullWidth && styles.fullWidth,
        disabled && styles.disabledSecondary,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              typography.bodyBold,
              styles.secondaryLabel,
              leftIcon ? { marginLeft: spacing.sm } : null,
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export const GhostButton: React.FC<BaseButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  labelStyle,
  leftIcon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.6}
      style={[
        styles.base,
        styles.ghost,
        fullWidth && styles.fullWidth,
        disabled && styles.disabledGhost,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              typography.bodyMedium,
              styles.ghostLabel,
              leftIcon ? { marginLeft: spacing.sm } : null,
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export const DestructiveButton: React.FC<BaseButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  labelStyle,
  leftIcon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles.destructive,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              typography.bodyBold,
              styles.destructiveLabel,
              leftIcon ? { marginLeft: spacing.sm } : null,
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryLabel: {
    color: colors.white,
    textAlign: 'center',
  },
  disabled: {
    backgroundColor: colors.border,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryLabel: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  disabledSecondary: {
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceSubtle,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostLabel: {
    color: colors.primary,
    textAlign: 'center',
  },
  disabledGhost: {
    opacity: 0.5,
  },
  destructive: {
    backgroundColor: colors.danger,
  },
  destructiveLabel: {
    color: colors.white,
    textAlign: 'center',
  },
  iconButtonBase: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  iconButtonFilled: {
    backgroundColor: colors.surfaceSubtle,
  },
  iconButtonOutlined: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  variant?: 'ghost' | 'filled' | 'outlined';
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  disabled = false,
  variant = 'ghost',
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.iconButtonBase,
        variant === 'filled' && styles.iconButtonFilled,
        variant === 'outlined' && styles.iconButtonOutlined,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
};
