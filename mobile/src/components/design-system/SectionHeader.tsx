import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '@/theme/designTokens';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, typography.title3]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, typography.caption]}>{subtitle}</Text>
        ) : null}
      </View>
      {actionText && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={styles.actionButton}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.actionText, typography.bodyMedium]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
