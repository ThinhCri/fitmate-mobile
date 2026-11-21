import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Flag, Pencil, Trash2, UserX, X } from 'lucide-react-native';
import { colors, radius, spacing } from '@/theme/designTokens';
import { CommunityPostViewModel } from './communityTypes';

interface Props {
  post: CommunityPostViewModel | null;
  onClose: () => void;
  onEdit: (post: CommunityPostViewModel) => void;
  onDelete: (post: CommunityPostViewModel) => void;
  onReport: (post: CommunityPostViewModel) => void;
  onBlock: (post: CommunityPostViewModel) => void;
}

export function PostActionsSheet({ post, onClose, onEdit, onDelete, onReport, onBlock }: Props) {
  return (
    <Modal visible={Boolean(post)} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} accessibilityLabel="Đóng tùy chọn bài viết" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Tùy chọn bài viết</Text>
              <Text style={styles.subtitle}>{post?.isOwner ? 'Quản lý bài viết của bạn' : `Bài viết của ${post?.authorName || 'người dùng'}`}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Đóng">
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {post?.isOwner ? (
            <>
              <ActionRow icon={<Pencil size={21} color={colors.textPrimary} />} title="Chỉnh sửa bài viết" description="Thay đổi nội dung bài viết" onPress={() => onEdit(post)} />
              <ActionRow danger icon={<Trash2 size={21} color={colors.danger} />} title="Xóa bài viết" description="Bài viết sẽ bị xóa vĩnh viễn" onPress={() => onDelete(post)} />
            </>
          ) : post ? (
            <>
              <ActionRow icon={<Flag size={21} color={colors.danger} />} title="Báo cáo bài viết" description="Gửi nội dung này cho Fitmate xem xét" onPress={() => onReport(post)} />
              <ActionRow danger icon={<UserX size={21} color={colors.danger} />} title="Chặn người dùng" description={`Bạn và ${post.authorName} sẽ không thể tương tác`} onPress={() => onBlock(post)} />
            </>
          ) : null}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ActionRow({ icon, title, description, danger, onPress }: { icon: React.ReactNode; title: string; description: string; danger?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.72}>
      <View style={[styles.iconBox, danger && styles.dangerIconBox]}>{icon}</View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, danger && styles.dangerText]}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.42)' },
  dismissArea: { flex: 1 },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: spacing.md, paddingBottom: spacing.xl, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 20, shadowOffset: { width: 0, height: -6 }, elevation: 18 },
  handle: { alignSelf: 'center', width: 42, height: 5, borderRadius: radius.full, backgroundColor: colors.border, marginTop: spacing.sm, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  closeButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSubtle },
  actionRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingVertical: spacing.sm },
  iconBox: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSubtle },
  dangerIconBox: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  actionCopy: { flex: 1 },
  actionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  dangerText: { color: colors.danger },
  actionDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  cancelButton: { marginTop: spacing.md, minHeight: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSubtle },
  cancelText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
});
