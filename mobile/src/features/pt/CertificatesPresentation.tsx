import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  User as UserIcon,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  FileText,
  FileCheck,
  Send,
  X,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import type { PtCertificate, UploadFilePayload } from '@/services/api/types';
import { ImagePickerService } from '@/services/imagePicker';

export interface CertificatesPresentationProps {
  certificates: PtCertificate[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onRefresh: () => void;
  onBack: () => void;
  onSubmitCertificate: (data: {
    title: string;
    issued_by: string;
    code: string;
    issue_date: string;
    file: UploadFilePayload;
  }) => Promise<void>;
  verificationStatus?: string;
}

export function CertificatesPresentation({
  certificates,
  loading,
  submitting,
  error,
  onRefresh,
  onBack,
  onSubmitCertificate,
  verificationStatus,
}: CertificatesPresentationProps) {
  // Form state for adding new certificate
  const [title, setTitle] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [code, setCode] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<UploadFilePayload | null>(null);

  const handlePickFile = async () => {
    try {
      const picked = await ImagePickerService.pickFromLibrary({
        allowsEditing: false,
        quality: 0.85,
      });
      if (picked && picked.uri) {
        const uriParts = picked.uri.split('/');
        const fileName =
          picked.fileName || uriParts[uriParts.length - 1] || 'certificate.jpg';
        const ext = fileName.split('.').pop()?.toLowerCase();

        if (ext === 'pdf' || picked.mimeType === 'application/pdf') {
          Alert.alert(
            'Định dạng không hỗ trợ',
            'Chỉ chấp nhận tệp hình ảnh (JPEG, PNG, WebP) có dung lượng tối đa 5MB. Định dạng PDF không được hỗ trợ.'
          );
          return;
        }

        let mimeType = picked.mimeType || 'image/jpeg';
        if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'webp') mimeType = 'image/webp';
        else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';

        if (picked.fileSize && picked.fileSize > 5 * 1024 * 1024) {
          Alert.alert(
            'Tệp quá lớn',
            'Dung lượng tệp vượt quá 5MB. Vui lòng chọn tệp hình ảnh nhỏ hơn.'
          );
          return;
        }

        setSelectedFile({
          uri: picked.uri,
          name: fileName,
          type: mimeType,
          size: picked.fileSize,
        });
      }
    } catch {
      Alert.alert('Lỗi chọn tệp', 'Không thể mở thư viện ảnh');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên chứng chỉ');
      return;
    }
    if (!issuedBy.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tổ chức cấp chứng chỉ');
      return;
    }
    if (!code.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mã chứng chỉ');
      return;
    }
    if (!issueDate.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập ngày cấp (YYYY-MM-DD)');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Thiếu tài liệu', 'Vui lòng chọn ảnh chụp hoặc scan chứng chỉ');
      return;
    }

    try {
      await onSubmitCertificate({
        title: title.trim(),
        issued_by: issuedBy.trim(),
        code: code.trim(),
        issue_date: issueDate.trim(),
        file: selectedFile,
      });

      // Reset form on success
      setTitle('');
      setIssuedBy('');
      setCode('');
      setIssueDate('');
      setSelectedFile(null);
      Alert.alert('Thành công', 'Chứng chỉ đã được gửi thẩm duyệt thành công và đang chờ xét duyệt.');
    } catch (err) {
      Alert.alert('Lỗi gửi chứng chỉ', err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'approved') {
      return (
        <View style={[styles.statusBadge, styles.badgeApproved]}>
          <CheckCircle2 size={13} color={colors.success} style={{ marginRight: 4 }} />
          <Text style={[styles.statusBadgeText, styles.textApproved]}>ĐÃ DUYỆT (Approved)</Text>
        </View>
      );
    }
    if (status === 'rejected') {
      return (
        <View style={[styles.statusBadge, styles.badgeRejected]}>
          <AlertCircle size={13} color={colors.danger} style={{ marginRight: 4 }} />
          <Text style={[styles.statusBadgeText, styles.textRejected]}>BỊ TỪ CHỐI (Rejected)</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, styles.badgePending]}>
        <Clock size={13} color={colors.warning} style={{ marginRight: 4 }} />
        <Text style={[styles.statusBadgeText, styles.textPending]}>CHỜ DUYỆT (Pending Review)</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Chứng Chỉ Của Tôi</Text>
        <View style={styles.headerAvatar}>
          <UserIcon size={18} color={colors.white} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        {verificationStatus && verificationStatus !== 'approved' && (
          <View style={styles.auditBanner}>
            <Clock size={22} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.auditBannerTitle}>{verificationStatus === 'needsmoreinformation' ? 'Hồ sơ cần bổ sung' : verificationStatus === 'pendingreview' ? 'Hồ sơ đang chờ xét duyệt' : 'Hoàn thiện hồ sơ xác minh PT'}</Text>
              <Text style={styles.auditBannerText}>{verificationStatus === 'needsmoreinformation' ? 'Vui lòng xem lý do từ chối ở chứng chỉ và gửi lại ảnh hoặc thông tin chính xác.' : verificationStatus === 'pendingreview' ? 'Bạn chưa thể sử dụng chức năng PT cho đến khi Admin kiểm tra và duyệt hồ sơ.' : 'Hãy gửi ít nhất một chứng chỉ có ảnh rõ ràng. Sau đó hệ thống sẽ chuyển hồ sơ sang chờ duyệt.'}</Text>
            </View>
          </View>
        )}
        {/* Fitmate Audit Standards Banner */}
        <View style={styles.auditBanner}>
          <View style={styles.auditIconBox}>
            <ShieldCheck size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.auditBannerTitle}>Tiêu chuẩn kiểm duyệt Fitmate</Text>
            <Text style={styles.auditBannerText}>
              Admin Fitmate sẽ xem thông tin, ảnh chứng chỉ và đối chiếu thủ công trước khi quyết định duyệt tài khoản PT.
            </Text>
          </View>
        </View>

        {/* Saved Certificates Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Chứng chỉ đã lưu</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{certificates.length}</Text>
            </View>
          </View>
          <View style={styles.securityRow}>
            <Lock size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.securityText}>Chỉ Admin được xem ảnh gốc</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải chứng chỉ...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={onRefresh}>
              <Text style={styles.retryText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : certificates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có chứng chỉ nào</Text>
            <Text style={styles.emptySubtitle}>
              Tải lên chứng chỉ của bạn bên dưới để tăng độ uy tín và mở nhận học viên.
            </Text>
          </View>
        ) : (
          certificates.map((cert) => (
            <View key={cert.id} style={styles.certCard}>
              <View style={styles.certCardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeWrapRow}>{renderStatusBadge(cert.status)}</View>
                  <Text style={styles.certTitle}>{cert.title}</Text>
                  <Text style={styles.certIssuer}>{cert.issued_by}</Text>
                </View>
              </View>

              {/* Data Grid */}
              <View style={styles.certGrid}>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>Mã chứng chỉ</Text>
                  <Text style={styles.gridValueCode}>#{cert.code}</Text>
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>Ngày cấp</Text>
                  <Text style={styles.gridValue}>{cert.issue_date}</Text>
                </View>
              </View>

              {/* Rejection Note if Rejected */}
              {cert.status === 'rejected' && cert.reject_reason ? (
                <View style={styles.rejectNoteBox}>
                  <AlertCircle size={16} color={colors.danger} style={{ marginRight: 6, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rejectNoteTitle}>Lý do từ chối:</Text>
                    <Text style={styles.rejectNoteText}>{cert.reject_reason}</Text>
                  </View>
                </View>
              ) : null}

              {/* Secure Document Preview Placeholder */}
              <View style={styles.secureDocBox}>
                <View style={styles.secureDocOverlay}>
                  <Lock size={16} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.secureDocText}>Bản gốc bảo mật theo chuẩn Fitmate</Text>
                </View>
                <Text style={styles.secureDocSub}>Đang hiển thị công khai mã xác thực trên hồ sơ HLV</Text>
              </View>
            </View>
          ))
        )}

        {/* Section 2: Upload New Certificate */}
        <View style={styles.uploadSectionHeader}>
          <Text style={styles.uploadSectionTitle}>Thêm chứng chỉ mới</Text>
          <Text style={styles.uploadSectionSub}>
            Bổ sung bằng cấp chuyên ngành, chứng chỉ thể thao hoặc sơ cấp cứu để nâng hạng tín nhiệm trên hồ sơ.
          </Text>
        </View>

        <View style={styles.formCard}>
          {/* File Picker Area */}
          <Text style={styles.fieldLabel}>Tài liệu đính kèm (Ảnh chụp hoặc scan) *</Text>
          {selectedFile ? (
            <View style={styles.selectedFileBox}>
              <View style={styles.selectedFileLeft}>
                <FileCheck size={24} color={colors.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.selectedFileType}>Tệp đã sẵn sàng tải lên</Text>
                </View>
              </View>
              <Pressable onPress={() => setSelectedFile(null)} style={styles.removeFileBtn}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.dropZone} onPress={handlePickFile}>
              <View style={styles.uploadIconCircle}>
                <UploadCloud size={26} color={colors.primary} />
              </View>
              <Text style={styles.dropZoneTitle}>Nhấn để chọn tệp chứng chỉ</Text>
              <Text style={styles.dropZoneSub}>Hỗ trợ ảnh định dạng JPG, PNG, WebP (Tối đa 5MB)</Text>
            </Pressable>
          )}

          {/* Form Fields */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Tên chứng chỉ <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ví dụ: Certified Personal Trainer (NASM-CPT)"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Tổ chức cấp bằng <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={issuedBy}
              onChangeText={setIssuedBy}
              placeholder="Ví dụ: NASM, ACE, ISSA, Đại học TDTT..."
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.fieldGroup, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.fieldLabel}>
                Mã chứng nhận <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="Ví dụ: #NASM-882941"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>
                Ngày cấp (YYYY-MM-DD) <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={issueDate}
                onChangeText={setIssueDate}
                placeholder="2023-05-15"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Send size={18} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Gửi thẩm duyệt chứng chỉ</Text>
              </>
            )}
          </Pressable>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 48,
  },
  auditBanner: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  auditIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  auditBannerTitle: {
    ...typography.bodyBold,
    color: colors.primary,
    marginBottom: 4,
  },
  auditBannerText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    marginLeft: 6,
  },
  countText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    padding: spacing.lg,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
  },
  retryText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  emptyContainer: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  certCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  certCardHeader: {
    marginBottom: spacing.md,
  },
  badgeWrapRow: {
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeApproved: {
    backgroundColor: colors.successLight,
  },
  badgePending: {
    backgroundColor: colors.warningLight,
  },
  badgeRejected: {
    backgroundColor: colors.dangerLight,
  },
  statusBadgeText: {
    ...typography.captionMedium,
    fontSize: 11,
  },
  textApproved: {
    color: colors.success,
  },
  textPending: {
    color: colors.warning,
  },
  textRejected: {
    color: colors.danger,
  },
  certTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  certIssuer: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  certGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  gridCol: {
    flex: 1,
  },
  gridLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  gridValueCode: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  gridValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  rejectNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  rejectNoteTitle: {
    ...typography.captionMedium,
    color: colors.danger,
    marginBottom: 2,
  },
  rejectNoteText: {
    ...typography.caption,
    color: colors.danger,
    lineHeight: 18,
  },
  secureDocBox: {
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  secureDocOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  secureDocText: {
    ...typography.captionMedium,
    color: colors.white,
  },
  secureDocSub: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  uploadSectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  uploadSectionTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  uploadSectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  dropZone: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dropZoneTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  dropZoneSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  selectedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  selectedFileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedFileName: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  selectedFileType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeFileBtn: {
    padding: spacing.xs,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
  },
  fieldLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitBtn: {
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
