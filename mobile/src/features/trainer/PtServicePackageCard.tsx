import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Clock,
  MapPin,
  Sparkles,
  Target,
  PackageCheck,
  CheckCircle2,
  Video,
  Award,
} from 'lucide-react-native';
import { colors, radius, shadow, spacing } from '@/theme/designTokens';

export interface PtServicePackageCardModel {
  id: string;
  name: string;
  priceVnd: number;
  package4PriceVnd?: number;
  package8PriceVnd?: number;
  durationMinutes: number;
  serviceKind?: 'one_to_one' | 'assessment_and_plan';
  deliveryMode?: 'in_person' | 'online';
  description?: string;
  targetAudience?: string;
  requiredEquipment?: string;
  deliverable?: string;
  locationName?: string;
  locationAddress?: string;
}

export interface PtServicePackageCardProps {
  service: PtServicePackageCardModel;
  selectable?: boolean;
  selected?: boolean;
  onPress?: () => void;
}

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

function computeSavingsPct(singlePrice: number, count: number, packagePrice: number): number {
  const full = singlePrice * count;
  if (full <= 0 || packagePrice <= 0 || packagePrice >= full) return 0;
  return Math.round(((full - packagePrice) / full) * 100);
}

export const PtServicePackageCard: React.FC<PtServicePackageCardProps> = ({
  service,
  selectable = false,
  selected = false,
  onPress,
}) => {
  const isOnline = service.deliveryMode === 'online';
  const isAssessment = service.serviceKind === 'assessment_and_plan';
  const pkg4 = service.package4PriceVnd ?? 0;
  const pkg8 = service.package8PriceVnd ?? 0;
  const save4 = computeSavingsPct(service.priceVnd, 4, pkg4);
  const save8 = computeSavingsPct(service.priceVnd, 8, pkg8);

  const locationLabel = isOnline
    ? 'Online qua Google Meet'
    : [service.locationName, service.locationAddress].filter(Boolean).join(' · ');

  const cardContent = (
    <View
      style={[
        styles.card,
        shadow.card,
        selectable && styles.cardSelectable,
        selected && styles.cardSelected,
      ]}
    >
      {/* Top Tags Strip */}
      <View style={styles.tagRow}>
        <View style={[styles.tagPill, isOnline ? styles.tagOnline : styles.tagInPerson]}>
          {isOnline ? (
            <Video size={12} color="#1D4ED8" />
          ) : (
            <MapPin size={12} color="#0F766E" />
          )}
          <Text style={[styles.tagText, isOnline ? styles.tagOnlineText : styles.tagInPersonText]}>
            {isOnline ? 'Trực tuyến' : 'Trực tiếp'}
          </Text>
        </View>

        <View style={[styles.tagPill, isAssessment ? styles.tagAssessment : styles.tagOneToOne]}>
          <Award size={12} color={isAssessment ? '#B45309' : '#4338CA'} />
          <Text style={[styles.tagText, isAssessment ? styles.tagAssessmentText : styles.tagOneToOneText]}>
            {isAssessment ? 'Đánh giá & lộ trình' : 'Huấn luyện 1–1'}
          </Text>
        </View>

        <View style={[styles.tagPill, styles.tagDuration]}>
          <Clock size={12} color="#334155" />
          <Text style={styles.tagDurationText}>{service.durationMinutes} phút/buổi</Text>
        </View>

        {selectable && selected && (
          <View style={styles.selectedChip}>
            <CheckCircle2 size={12} color="#FFFFFF" />
            <Text style={styles.selectedChipText}>Đang chọn</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{service.name}</Text>

      {/* Tiered Pricing Grid */}
      <View style={styles.pricingGrid}>
        <View style={[styles.priceTierBox, styles.tierSingle]}>
          <Text style={styles.tierLabelSingle}>Lẻ 1 buổi</Text>
          <Text style={styles.tierValueSingle}>{formatVnd(service.priceVnd)}</Text>
          <Text style={styles.tierSubSingle}>/ buổi {service.durationMinutes}p</Text>
        </View>

        {pkg4 > 0 && (
          <View style={[styles.priceTierBox, styles.tierPkg4]}>
            <View style={styles.tierLabelRow}>
              <Text style={styles.tierLabelPkg4}>Gói 4 buổi</Text>
              {save4 > 0 && (
                <View style={styles.saveBadge4}>
                  <Text style={styles.saveText4}>-{save4}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.tierValuePkg4}>{formatVnd(pkg4)}</Text>
            <Text style={styles.tierSubPkg4}>~{formatVnd(Math.round(pkg4 / 4))}/buổi</Text>
          </View>
        )}

        {pkg8 > 0 && (
          <View style={[styles.priceTierBox, styles.tierPkg8]}>
            <View style={styles.tierLabelRow}>
              <Text style={styles.tierLabelPkg8}>Gói 8 buổi</Text>
              {save8 > 0 && (
                <View style={styles.saveBadge8}>
                  <Text style={styles.saveText8}>-{save8}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.tierValuePkg8}>{formatVnd(pkg8)}</Text>
            <Text style={styles.tierSubPkg8}>~{formatVnd(Math.round(pkg8 / 8))}/buổi</Text>
          </View>
        )}
      </View>

      {/* Short Description Highlight */}
      {!!service.description && (
        <View style={styles.descBox}>
          <Text style={styles.descText}>{service.description}</Text>
        </View>
      )}

      {/* Structured Detail Rows with Color Coding */}
      {(!!service.targetAudience ||
        !!service.deliverable ||
        !!service.requiredEquipment ||
        !!locationLabel) && (
        <View style={styles.detailsSection}>
          {!!service.targetAudience && (
            <View style={styles.detailRow}>
              <View style={[styles.detailIconWrap, { backgroundColor: '#CCFBF1' }]}>
                <Target size={14} color="#0F766E" />
              </View>
              <View style={styles.detailTextCol}>
                <Text style={[styles.detailLabel, { color: '#0F766E' }]}>Phù hợp với</Text>
                <Text style={styles.detailValue}>{service.targetAudience}</Text>
              </View>
            </View>
          )}

          {!!service.deliverable && (
            <View style={[styles.detailRow, styles.detailRowHighlight]}>
              <View style={[styles.detailIconWrap, { backgroundColor: '#DBEAFE' }]}>
                <Sparkles size={14} color="#1D4ED8" />
              </View>
              <View style={styles.detailTextCol}>
                <Text style={[styles.detailLabel, { color: '#1D4ED8' }]}>Bạn nhận được</Text>
                <Text style={styles.detailValue}>{service.deliverable}</Text>
              </View>
            </View>
          )}

          {!!service.requiredEquipment && (
            <View style={styles.detailRow}>
              <View style={[styles.detailIconWrap, { backgroundColor: '#FFEDD5' }]}>
                <PackageCheck size={14} color="#C2410C" />
              </View>
              <View style={styles.detailTextCol}>
                <Text style={[styles.detailLabel, { color: '#C2410C' }]}>Cần chuẩn bị</Text>
                <Text style={styles.detailValue}>{service.requiredEquipment}</Text>
              </View>
            </View>
          )}

          {!!locationLabel && (
            <View style={styles.detailRow}>
              <View style={[styles.detailIconWrap, { backgroundColor: '#FCE7F3' }]}>
                <MapPin size={14} color="#BE185D" />
              </View>
              <View style={styles.detailTextCol}>
                <Text style={[styles.detailLabel, { color: '#BE185D' }]}>Địa điểm</Text>
                <Text style={styles.detailValue}>{locationLabel}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`Chọn gói ${service.name}, giá ${service.priceVnd.toLocaleString('vi-VN')} đồng`}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.md,
  },
  cardSelectable: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#F0FDFA',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  tagOnline: { backgroundColor: '#DBEAFE' },
  tagInPerson: { backgroundColor: '#CCFBF1' },
  tagAssessment: { backgroundColor: '#FEF3C7' },
  tagOneToOne: { backgroundColor: '#EEF2FF' },
  tagDuration: { backgroundColor: '#F1F5F9' },
  tagText: { fontSize: 11, fontWeight: '700' },
  tagOnlineText: { color: '#1D4ED8' },
  tagInPersonText: { color: '#0F766E' },
  tagAssessmentText: { color: '#B45309' },
  tagOneToOneText: { color: '#4338CA' },
  tagDurationText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginLeft: 'auto',
  },
  selectedChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 23,
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceTierBox: {
    flex: 1,
    minWidth: 96,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 2,
  },
  tierLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  tierSingle: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  tierLabelSingle: { fontSize: 11, fontWeight: '700', color: '#047857' },
  tierValueSingle: { fontSize: 15, fontWeight: '800', color: '#065F46' },
  tierSubSingle: { fontSize: 10, color: '#059669', fontWeight: '500' },

  tierPkg4: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  tierLabelPkg4: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  tierValuePkg4: { fontSize: 15, fontWeight: '800', color: '#1E40AF' },
  tierSubPkg4: { fontSize: 10, color: '#2563EB', fontWeight: '500' },
  saveBadge4: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  saveText4: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },

  tierPkg8: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  tierLabelPkg8: { fontSize: 11, fontWeight: '700', color: '#B45309' },
  tierValuePkg8: { fontSize: 15, fontWeight: '800', color: '#92400E' },
  tierSubPkg8: { fontSize: 10, color: '#D97706', fontWeight: '500' },
  saveBadge8: {
    backgroundColor: '#D97706',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  saveText8: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },

  descBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#94A3B8',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  descText: {
    fontSize: 13.5,
    color: '#1E293B',
    lineHeight: 20,
  },
  detailsSection: {
    gap: 8,
    paddingTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  detailRowHighlight: {
    backgroundColor: '#F0F9FF',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  detailIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  detailTextCol: {
    flex: 1,
    gap: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 19,
    fontWeight: '500',
  },
});
