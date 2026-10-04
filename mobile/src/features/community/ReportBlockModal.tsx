import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  ShieldAlert,
  Shield,
  UserX,
  Check,
  AlertCircle,
  Lock,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { ModalShell } from '@/components/design-system/ModalShell';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';
import {
  ReportRequest,
  ReportTargetType,
  ReportReasonType,
} from './communityTypes';

export interface ReportBlockModalProps {
  visible: boolean;
  targetId: string;
  targetType: ReportTargetType;
  targetAuthorId: string;
  targetAuthorName: string;
  targetSummary?: string;
  onClose: () => void;
  onSubmitReport: (report: ReportRequest) => Promise<boolean> | void;
  onConfirmBlock: (userId: string) => Promise<boolean> | void;
}

const REPORT_REASONS: {
  key: ReportReasonType;
  title: string;
  subtitle: string;
}[] = [
  {
    key: 'spam',
    title: 'Spam, quảng cáo không phù hợp',
    subtitle: 'Nội dung trùng lặp, mời chào sản phẩm ngoài luồng',
  },
  {
    key: 'hate',
    title: 'Ngôn từ thù ghét, xúc phạm người khác',
    subtitle: 'Miệt thị ngoại hình, body shaming hoặc quấy rối',
  },
  {
    key: 'health_misinfo',
    title: 'Thông tin sai lệch về sức khỏe / Y tế nguy hiểm',
    subtitle: 'Khuyên dùng chất kích thích cấm, chế độ ép cân gây hại',
  },
  {
    key: 'impersonation',
    title: 'Giả mạo danh tính HLV hoặc chuyên gia',
    subtitle: 'Sử dụng chứng chỉ thể hình giả, mạo danh cá nhân khác',
  },
  {
    key: 'other',
    title: 'Khác (Nhập chi tiết)',
    subtitle: 'Vi phạm tiêu chuẩn cộng đồng chưa được liệt kê',
  },
];

export function ReportBlockModal({
  visible,
  targetId,
  targetType,
  targetAuthorId,
  targetAuthorName,
  targetSummary,
  onClose,
  onSubmitReport,
  onConfirmBlock,
}: ReportBlockModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReasonType>('spam');
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const targetTypeLabel =
    targetType === 'post'
      ? 'bài viết'
      : targetType === 'comment'
      ? 'bình luận'
      : 'người dùng';

  const handleSubmit = async () => {
    if (selectedReason === 'other' && detail.trim().length < 10) {
      Alert.alert(
        'Yêu cầu chi tiết',
        'Vui lòng nhập mô tả chi tiết tối thiểu 10 ký tự cho lý do khác.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReport({
        targetId,
        targetType,
        targetAuthorName,
        targetSummary,
        reason: selectedReason,
        detail: detail.trim(),
      });
      Alert.alert(
        'Đã gửi báo cáo',
        'Cảm ơn bạn đã đóng góp xây dựng cộng đồng Fitmate văn minh, lành mạnh.',
        [{ text: 'Đóng', onPress: onClose }]
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi báo cáo lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = () => {
    Alert.alert(
      'Xác nhận chặn người dùng',
      `Bạn và ${targetAuthorName} sẽ không thể xem bài viết hay tương tác với nhau. Quyết định này không xóa lịch sử đặt lịch PT trước đó. Bạn vẫn muốn chặn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chặn',
          style: 'destructive',
          onPress: async () => {
            setIsBlocking(true);
            try {
              await onConfirmBlock(targetAuthorId);
              Alert.alert('Đã chặn', `Đã chặn ${targetAuthorName}.`, [
                { text: 'Đóng', onPress: onClose },
              ]);
            } catch {
              Alert.alert('Lỗi', 'Không thể thực hiện lúc này.');
            } finally {
              setIsBlocking(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ModalShell visible={visible} onClose={onClose} title="Báo cáo vi phạm hoặc Chặn">
      <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        {/* Target Summary Card */}
        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>Đối tượng được báo cáo ({targetTypeLabel}):</Text>
          <Text style={styles.targetAuthor}>Tác giả: {targetAuthorName}</Text>
          {targetSummary && (
            <Text style={styles.targetSnippet} numberOfLines={2}>
              {`"${targetSummary}"`}
            </Text>
          )}
        </View>

        {/* Reason Selector */}
        <Text style={styles.sectionTitle}>Lý do báo cáo:</Text>
        <View style={styles.reasonList}>
          {REPORT_REASONS.map((r) => {
            const isSelected = selectedReason === r.key;
            return (
              <TouchableOpacity
                key={r.key}
                style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
                onPress={() => setSelectedReason(r.key)}
              >
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <Check size={12} color="#FFFFFF" />}
                </View>
                <View style={styles.reasonTextContainer}>
                  <Text style={[styles.reasonTitle, isSelected && styles.reasonTitleSelected]}>
                    {r.title}
                  </Text>
                  <Text style={styles.reasonSubtitle}>{r.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detail Input */}
        <Text style={styles.sectionTitle}>Mô tả chi tiết vi phạm:</Text>
        <TextInput
          style={styles.detailInput}
          multiline
          placeholder="Mô tả cụ thể ngữ cảnh vi phạm để kiểm duyệt viên đối chiếu nhanh..."
          placeholderTextColor={colors.textMuted}
          value={detail}
          onChangeText={setDetail}
          maxLength={300}
        />
        <Text style={styles.charCount}>{detail.length}/300 ký tự</Text>

        {/* Anonymity Notice */}
        <View style={styles.anonymityBox}>
          <Shield size={16} color={colors.primary} />
          <Text style={styles.anonymityText}>
            Báo cáo của bạn được ẩn danh hoàn toàn. Ban Quản Trị Fitmate sẽ xử lý trong 24 giờ.
            Gửi báo cáo không tự động chặn người này.
          </Text>
        </View>

        {/* Submit Report Button */}
        <View style={styles.reportBtnWrapper}>
          <PrimaryButton
            label={isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo vi phạm'}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>

        {/* Divider OR */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>HOẶC</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Block User Section */}
        <View style={styles.blockSection}>
          <View style={styles.blockHeader}>
            <UserX size={18} color={colors.danger} />
            <Text style={styles.blockTitle}>Chặn người dùng này</Text>
          </View>
          <Text style={styles.blockDesc}>
            Hai bên sẽ không nhìn thấy bài viết hoặc tương tác với nhau trên cộng đồng.
          </Text>
          <TouchableOpacity
            style={styles.blockBtn}
            onPress={handleBlock}
            disabled={isBlocking}
          >
            <Text style={styles.blockBtnText}>
              {isBlocking ? 'Đang xử lý...' : `Chặn ${targetAuthorName}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    maxHeight: 520,
  },
  targetCard: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    gap: 2,
  },
  targetLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  targetAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  targetSnippet: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  reasonList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  reasonTextContainer: {
    flex: 1,
    gap: 2,
  },
  reasonTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  reasonTitleSelected: {
    color: colors.primary,
  },
  reasonSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  anonymityBox: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  anonymityText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 16,
  },
  reportBtnWrapper: {
    marginBottom: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  blockSection: {
    backgroundColor: '#FEF2F2',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  blockTitle: {
    ...typography.title3,
    color: colors.danger,
    fontWeight: '700',
  },
  blockDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  blockBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  blockBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
});
