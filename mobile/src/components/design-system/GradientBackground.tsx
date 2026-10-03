/**
 * GradientBackground — nền gradient nhẹ nhàng, trong suốt mờ mờ
 * cho các màn hình tab chính.
 *
 * Sử dụng gradient dọc từ mint nhạt → trắng ngà, tạo cảm giác
 * "glass feel" khi kết hợp với card trắng nổi bên trên.
 */
import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Preset gradient: 'default' | 'warm' | 'cool' */
  variant?: 'default' | 'warm' | 'cool';
}

const GRADIENT_PRESETS = {
  default: {
    colors: ['#E8FAF0', '#F0FDF8', '#F8FCFA', '#FFFFFF'] as const,
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
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={['rgba(15,118,110,0.20)', 'rgba(110,231,183,0.04)']}
          style={[styles.ambientOrb, styles.orbTop]}
        />
        <LinearGradient
          colors={['rgba(250,204,21,0.14)', 'rgba(255,255,255,0.02)']}
          style={[styles.ambientOrb, styles.orbRight]}
        />
        <LinearGradient
          colors={['rgba(59,130,246,0.10)', 'rgba(255,255,255,0.02)']}
          style={[styles.ambientOrb, styles.orbBottom]}
        />
        <Text style={styles.watermark}>Fitmate</Text>
      </View>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  ambientOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbTop: {
    width: 310,
    height: 310,
    top: -115,
    left: -90,
    transform: [{ rotate: '-18deg' }],
  },
  orbRight: {
    width: 230,
    height: 230,
    top: 250,
    right: -105,
    transform: [{ rotate: '20deg' }],
  },
  orbBottom: {
    width: 280,
    height: 280,
    bottom: 40,
    left: -145,
  },
  watermark: {
    position: 'absolute',
    top: 84,
    right: -30,
    color: 'rgba(15,118,110,0.055)',
    fontSize: 92,
    fontWeight: '900',
    letterSpacing: -4,
    transform: [{ rotate: '-8deg' }],
  },
});
