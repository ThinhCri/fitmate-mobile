import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  tone = 'neutral',
  style,
}) => {
  const getToneStyles = () => {
    switch (tone) {
      case 'success':
        return { bg: colors.successLight, text: colors.primaryDark };
      case 'warning':
        return { bg: colors.warningLight, text: '#B45309' };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger };
      case 'info':
        return { bg: colors.infoLight, text: colors.secondary };
      case 'neutral':
      default:
        return { bg: colors.surfaceSubtle, text: colors.textSecondary };
    }
  };

  const { bg, text } = getToneStyles();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[typography.badge, { color: text }]}>{label}</Text>
    </View>
  );
};

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text
        style={[
          typography.bodyMedium,
          selected ? styles.chipTextSelected : styles.chipTextUnselected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export interface FilterChipGroupProps {
  items: Array<{ id: string; label: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
}

export const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
  items,
  selectedId,
  onSelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipGroup}
    >
      {items.map((item) => (
        <FilterChip
          key={item.id}
          label={item.label}
          selected={item.id === selectedId}
          onPress={() => onSelect(item.id)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
  },
  chip: {
    minHeight: 48,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  chipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
});
