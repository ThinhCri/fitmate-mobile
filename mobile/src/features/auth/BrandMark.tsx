import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '@/theme/designTokens';

type BrandMarkProps = {
  compact?: boolean;
  light?: boolean;
  showTagline?: boolean;
};

export function BrandMark({ compact = false, light = false, showTagline = !compact }: BrandMarkProps) {
  const size = compact ? 42 : 60;
  return (
    <View style={styles.row} accessible accessibilityLabel="Fitmate - Bạn đồng hành cho fitness">
      <View style={[styles.symbolWrapper, { width: size, height: size, borderRadius: compact ? 10 : 14 }]}>
        <Image
          source={require('../../../assets/brand/brand-symbol.png')}
          style={{ width: size, height: size, borderRadius: compact ? 10 : 14 }}
          resizeMode="cover"
          accessibilityElementsHidden
        />
      </View>
      <View style={styles.wordmarkCol}>
        <View style={styles.nameRow}>
          <Text style={[styles.wordmarkFit, compact && styles.compactWordmarkFit, light && styles.lightWordmark]}>
            FIT
          </Text>
          <Text style={[styles.wordmarkMate, compact && styles.compactWordmarkMate]}>
            MATE
          </Text>
        </View>
        {showTagline && (
          <Text style={[styles.tagline, light && styles.lightTagline]}>
            Bạn đồng hành cho fitness
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symbolWrapper: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  wordmarkCol: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmarkFit: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  compactWordmarkFit: {
    fontSize: 21,
  },
  wordmarkMate: {
    color: '#22C55E',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  compactWordmarkMate: {
    fontSize: 21,
  },
  lightWordmark: {
    color: colors.white,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
    letterSpacing: -0.2,
  },
  lightTagline: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
