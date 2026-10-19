import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/designTokens';

type BrandMarkProps = { compact?: boolean; light?: boolean };

export function BrandMark({ compact = false, light = false }: BrandMarkProps) {
  const size = compact ? 40 : 68;
  return (
    <View style={styles.row} accessible accessibilityLabel="Fitmate">
      <View style={[styles.symbol, { width: size, height: size, borderRadius: compact ? 12 : 20 }]}>
        <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" accessibilityElementsHidden>
          <Path d="M9 7h26l8 8-8 8v-7H19v8h15l-6 9h-9v12H9V7Z" fill="#FFFFFF" />
        </Svg>
      </View>
      <Text style={[styles.wordmark, compact && styles.compactWordmark, light && styles.lightWordmark]}>Fitmate</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  symbol: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  wordmark: { color: colors.textPrimary, fontSize: 27, fontWeight: '800', letterSpacing: -0.8 },
  compactWordmark: { fontSize: 21 },
  lightWordmark: { color: colors.white },
});
