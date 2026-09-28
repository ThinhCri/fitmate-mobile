import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme/designTokens';

export interface AppTopBarProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  hideDivider?: boolean;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
  hideDivider = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        !hideDivider && styles.divider,
        style,
      ]}
    >
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.center}>
        {title ? (
          <Text
            style={[styles.title, typography.title2]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            style={[styles.subtitle, typography.caption]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>{rightAction || null}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  left: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 2,
  },
  right: {
    minWidth: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
