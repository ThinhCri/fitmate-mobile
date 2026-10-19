/**
 * GradientBackground — nền gradient nhẹ nhàng, trong suốt mờ mờ
 * cho các màn hình tab chính.
 *
 * Sử dụng gradient dọc từ mint nhạt → trắng ngà, tạo cảm giác
 * "glass feel" khi kết hợp với card trắng nổi bên trên.
 */
import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Preset gradient: 'default' | 'warm' | 'cool' */
  variant?: 'default' | 'warm' | 'cool';
}

const GRADIENT_PRESETS = {
  default: {
    colors: ['#EFF8F4', '#F6FAF8', '#FAFCFB', '#FFFFFF'] as const,
    locations: [0, 0.3, 0.65, 1] as const,
  },
  warm: {
    colors: ['#FEF9E7', '#FDF5F0', '#F8FCFA', '#FFFFFF'] as const,
    locations: [0, 0.3, 0.65, 1] as const,
  },
  cool: {
    colors: ['#E8F4FD', '#EDF8F5', '#F8FCFA', '#FFFFFF'] as const,
    locations: [0, 0.3, 0.65, 1] as const,
  },
} as const;

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const preset = GRADIENT_PRESETS[variant];

  return (
    <LinearGradient
      colors={[...preset.colors]}
      locations={[...preset.locations]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
