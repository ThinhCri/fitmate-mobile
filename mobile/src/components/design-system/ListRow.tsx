import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme/designTokens';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  leftIcon,
  rightElement,
  showChevron = true,
  onPress,
  destructive = false,
  style,
  disabled = false,
}) => {
  const content = (
    <View style={[styles.container, style]}>
      {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}
      <View style={styles.textContainer}>
        <Text
          style={[
            typography.bodyMedium,
            styles.title,
            destructive && styles.destructiveText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              typography.caption,
              styles.subtitle,
              disabled && styles.disabledText,
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightElement ? (
        <View style={styles.rightElementContainer}>{rightElement}</View>
      ) : null}
      {showChevron && onPress ? (
        <ChevronRight size={20} color={colors.textMuted} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}`}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  touchable: {
    minHeight: 48,
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  leftIconContainer: {
    marginRight: spacing.lg,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  destructiveText: {
    color: colors.danger,
  },
  disabledText: {
    color: colors.textMuted,
  },
  rightElementContainer: {
    marginLeft: spacing.sm,
  },
});
