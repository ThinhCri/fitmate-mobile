import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  HelpCircle,
  FileText,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Card } from '@/components/design-system/Card';
import { PrimaryButton } from '@/components/design-system/Buttons';
import {
  CreateTicketFormValues,
  TicketCategory,
} from './supportTypes';

export interface CreateTicketPresentationProps {
  initialValues?: Partial<CreateTicketFormValues>;
  isSubmitting?: boolean;
  onBack: () => void;
  onSubmit: (values: CreateTicketFormValues) => void;
}

const CATEGORIES: { key: TicketCategory; label: string; desc: string }[] = [
  {
    key: 'booking_dispute',
    label: 'Tranh chấp buổi tập / Hoàn tiền',
    desc: 'Buổi tập không diễn ra, PT vắng mặt hoặc sai lệch thời gian',
  },
  {
    key: 'billing',
    label: 'Vấn đề thanh toán / Ví & Thẻ',
    desc: 'Trừ tiền nhưng chưa ghi nhận đơn, lỗi cổng thanh toán',
  },
  {
    key: 'pt_complaint',
    label: 'Phản ánh HLV PT',
    desc: 'Vi phạm chuẩn mực chuyên môn hoặc thái độ không phù hợp',
  },
  {
    key: 'app_bug',
    label: 'Báo lỗi ứng dụng / Kỹ thuật',
    desc: 'Tính năng bị lỗi, crash hoặc không hiển thị đúng dữ liệu',
  },
  {
    key: 'other',
    label: 'Yêu cầu khác',
    desc: 'Thắc mắc chung về chính sách nền tảng Fitmate',
  },
];

export function CreateTicketPresentation({
  initialValues,
  isSubmitting = false,
  onBack,
  onSubmit,
}: CreateTicketPresentationProps) {
  const [category, setCategory] = useState<TicketCategory>(
    initialValues?.category || 'booking_dispute'
  );
  const [subject, setSubject] = useState(initialValues?.subject || '');
  const [message, setMessage] = useState(initialValues?.message || '');
  const linkedBookingId = initialValues?.linkedBookingId;

  const handleSubmit = () => {
    if (!subject.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề yêu cầu.');
      return;
    }
    if (!message.trim() || message.trim().length < 15) {
      Alert.alert('Thiếu chi tiết', 'Vui lòng mô tả chi tiết tối thiểu 15 ký tự.');
      return;
    }

    onSubmit({
      category,
      subject: subject.trim(),
      message: message.trim(),
      linkedBookingId,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconBtn}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gửi yêu cầu hỗ trợ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Linked Booking context if present */}
        {linkedBookingId && (
          <Card style={styles.linkedBookingCard}>
            <View style={styles.linkedHeader}>
              <Calendar size={16} color={colors.primary} />
              <Text style={styles.linkedTitle}>Liên kết đơn đặt lịch</Text>
            </View>
            <Text style={styles.linkedText}>
              Mã lịch hẹn: <Text style={styles.linkedBold}>{linkedBookingId}</Text>
            </Text>
            <Text style={styles.linkedSub}>
              Yêu cầu của bạn sẽ được gắn trực tiếp vào hồ sơ buổi tập này để đối chiếu.
            </Text>
          </Card>
        )}

        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục yêu cầu:</Text>
          <View style={styles.categoryList}>
            {CATEGORIES.map((c) => {
              const isSelected = category === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemSelected,
                  ]}
                  onPress={() => setCategory(c.key)}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  />
                  <View style={styles.categoryTextContainer}>
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && styles.categoryLabelSelected,
                      ]}
                    >
                      {c.label}
                    </Text>
                    <Text style={styles.categoryDesc}>{c.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Subject Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiêu đề yêu cầu:</Text>
          <TextInput
            style={styles.subjectInput}
            placeholder="Ví dụ: Phản ánh lịch hẹn lúc 18:00 bị hủy không báo trước"
            placeholderTextColor={colors.textMuted}
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
          />
        </View>

        {/* Message Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả chi tiết sự việc:</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Mô tả cụ thể thời gian, địa điểm, diễn biến sự việc để bộ phận hỗ trợ giải quyết chính xác..."
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{message.length}/1000 ký tự</Text>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNoticeBox}>
          <ShieldCheck size={16} color={colors.primary} />
          <Text style={styles.privacyNoticeText}>
            Lưu ý bảo mật: Không cung cấp mật khẩu đăng nhập, mã OTP hoặc thông tin nhạy cảm.
            Mọi yêu cầu gửi tới không cam kết can thiệp trái với hợp đồng bảo vệ hai bên.
          </Text>
        </View>

        {/* Submit Button */}
        <View style={styles.btnWrapper}>
          <PrimaryButton
            label={isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            onPress={handleSubmit}
            disabled={isSubmitting || !subject.trim() || message.trim().length < 15}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  linkedBookingCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    gap: 4,
  },
  linkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  linkedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  linkedText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  linkedBold: {
    fontWeight: '700',
  },
  linkedSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  categoryList: {
    gap: spacing.xs,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryTextContainer: {
    flex: 1,
    gap: 2,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  categoryLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  categoryDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subjectInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  messageInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 120,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
  },
  privacyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  privacyNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  btnWrapper: {
    marginTop: spacing.sm,
  },
});
