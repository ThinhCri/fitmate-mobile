import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radius, typography } from '@/theme/designTokens';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  showVerifiedBadge?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 80,
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'md',
  showVerifiedBadge = false,
  style,
}) => {
  const dimension = SIZE_MAP[size];
  const initial = name && name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : '?';

  return (
    <View style={[{ width: dimension, height: dimension }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
            },
          ]}
        >
          <Text
            style={[
              typography.title2,
              styles.initialText,
              { fontSize: dimension * 0.4 },
            ]}
          >
            {initial}
          </Text>
        </View>
      )}
      {showVerifiedBadge ? (
        <View
          style={[
            styles.badge,
            {
              width: Math.max(16, dimension * 0.3),
              height: Math.max(16, dimension * 0.3),
              borderRadius: Math.max(8, dimension * 0.15),
            },
          ]}
        >
          <Check size={Math.max(10, dimension * 0.2)} color={colors.white} strokeWidth={3} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceSubtle,
  },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  initialText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
