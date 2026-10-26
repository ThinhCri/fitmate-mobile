import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Star, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { colors, radius, shadow, spacing, typography } from '@/theme/designTokens';
import { Badge } from './BadgesAndChips';

export interface TrainerCardProps {
  id: string;
  name: string;
  avatarUrl?: string | null;
  specialties: string[];
  rating: number;
  reviewCount: number;
  sessionPriceVnd: number | null;
  experienceYears?: number | null;
  isVerified?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const TrainerCard: React.FC<TrainerCardProps> = ({
  name,
  avatarUrl,
  specialties,
  rating,
  reviewCount,
  sessionPriceVnd,
  isVerified,
  onPress,
  style,
}) => {
  const formattedPrice = sessionPriceVnd === null ? 'Chưa công bố giá' : new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(sessionPriceVnd);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, shadow.card, style]}
      accessibilityRole="button"
    >
      <View style={styles.headerRow}>
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          {isVerified ? (
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={12} color={colors.white} />
            </View>
          ) : null}
        </View>

        <View style={styles.infoCol}>
          <Text style={[typography.title3, styles.name]} numberOfLines={1}>
            {name}
          </Text>

          <View style={styles.ratingRow}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={[typography.captionMedium, styles.ratingText]}>
              {rating.toFixed(1)}
            </Text>
            <Text style={[typography.caption, styles.reviewCount]}>
              ({reviewCount} đánh giá)
            </Text>
          </View>

          <View style={styles.specialtiesRow}>
            {specialties.slice(0, 2).map((item, idx) => (
              <Badge
                key={`${item}-${idx}`}
                label={item}
                tone="neutral"
                style={styles.specialtyBadge}
              />
            ))}
            {specialties.length > 2 ? (
              <Badge
                label={`+${specialties.length - 2}`}
                tone="neutral"
                style={styles.specialtyBadge}
              />
            ) : null}
          </View>
        </View>

        <ChevronRight size={20} color={colors.textMuted} />
      </View>

      <View style={styles.footerRow}>
        <View>
          <Text style={[typography.caption, styles.priceLabel]}>Giá buổi tập</Text>
          <Text style={[typography.bodyBold, styles.priceValue]}>
            {formattedPrice}
            {sessionPriceVnd !== null && <Text style={[typography.caption, styles.pricePerSession]}>/buổi</Text>}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSubtle,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 3,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    color: colors.textPrimary,
    marginLeft: 4,
    fontWeight: '600',
  },
  reviewCount: {
    color: colors.textSecondary,
    marginLeft: 4,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: 4,
  },
  specialtyBadge: {
    marginRight: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  priceLabel: {
    color: colors.textSecondary,
  },
  priceValue: {
    color: colors.primaryDark,
  },
  pricePerSession: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
});
