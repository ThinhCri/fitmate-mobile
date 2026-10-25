import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Heart, Send, X } from 'lucide-react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/design-system/Avatar';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { CommunityPostViewModel, PostCommentViewModel } from './communityTypes';

interface Props {
  visible: boolean;
  post: CommunityPostViewModel | null;
  onClose: () => void;
  onSend: (text: string, parentCommentId?: string) => Promise<boolean>;
  onLike: (commentId: string) => Promise<void>;
}

export function CommentsSheet({ visible, post, onClose, onSend, onLike }: Props) {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<PostCommentViewModel | null>(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const comments = post?.comments || [];
  useEffect(() => { if (!visible) { setText(''); setReplyTo(null); } }, [visible]);
  const roots = useMemo(() => comments.filter((item) => !item.parentCommentId).map((item, index) => ({ item, index })).sort((a, b) => ((b.item.likesCount || 0) - (a.item.likesCount || 0)) || (b.index - a.index)).map(({ item }) => item), [comments]);
  const replies = useMemo(() => comments.reduce<Record<string, PostCommentViewModel[]>>((all, item) => { if (item.parentCommentId) (all[item.parentCommentId] ||= []).push(item); return all; }, {}), [comments]);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const ok = await onSend(text.trim(), replyTo?.id);
    setSending(false);
    if (ok) { setText(''); setReplyTo(null); }
  };

  const renderComment = (comment: PostCommentViewModel, nested = false) => (
    <View key={comment.id} style={[styles.comment, nested && styles.reply]}>
      <Avatar name={comment.authorName} size="sm" />
      <View style={styles.commentBody}>
        <Text style={styles.author}>{comment.authorName} <Text style={styles.time}>{comment.createdAt}</Text></Text>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={() => { setReplyTo(comment); setTimeout(() => inputRef.current?.focus(), 50); }}><Text style={styles.replyText}>Trả lời</Text></TouchableOpacity>
          {(comment.likesCount || 0) > 0 && <Text style={styles.likeCount}>{comment.likesCount} lượt thích</Text>}
        </View>
      </View>
      <TouchableOpacity style={styles.likeButton} onPress={() => void onLike(comment.id)} accessibilityLabel="Thích bình luận">
        <Heart size={18} color={comment.likedByViewer ? colors.danger : colors.textMuted} fill={comment.likedByViewer ? colors.danger : 'transparent'} />
      </TouchableOpacity>
    </View>
  );

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <SafeAreaProvider>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.backdrop}>
      <TouchableOpacity style={styles.dismissArea} onPress={onClose} accessibilityRole="button" accessibilityLabel="Đóng bình luận" />
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}><Text style={styles.title}>Bình luận</Text><TouchableOpacity style={styles.iconButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Đóng bình luận"><X size={22} color={colors.textPrimary} /></TouchableOpacity></View>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
          {roots.length ? roots.map((root) => <View key={root.id}>{renderComment(root)}{(replies[root.id] || []).map((reply) => renderComment(reply, true))}</View>) : <Text style={styles.empty}>Chưa có bình luận. Hãy bắt đầu cuộc trò chuyện.</Text>}
        </ScrollView>
        {replyTo && <View style={styles.replyBanner}><Text style={styles.replyBannerText}>Đang trả lời {replyTo.authorName}</Text><TouchableOpacity onPress={() => setReplyTo(null)}><Text style={styles.cancel}>Hủy</Text></TouchableOpacity></View>}
        <View style={styles.composer}><TextInput ref={inputRef} value={text} onChangeText={setText} accessibilityLabel="Nội dung bình luận" placeholder="Thêm bình luận..." placeholderTextColor={colors.textMuted} style={styles.input} multiline /><TouchableOpacity style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Gửi bình luận" onPress={() => void submit()} disabled={!text.trim() || sending}><Send size={22} color={text.trim() ? colors.primary : colors.textMuted} /></TouchableOpacity></View>
      </SafeAreaView>
    </KeyboardAvoidingView>
    </SafeAreaProvider>
  </Modal>;
}

const styles = StyleSheet.create({
  iconButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)', justifyContent: 'flex-end' }, dismissArea: { flex: 1 }, sheet: { height: '78%', backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }, handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 8 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }, title: { ...typography.title3, color: colors.textPrimary }, list: { flex: 1 }, listContent: { padding: spacing.md, gap: spacing.md }, comment: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs }, reply: { marginLeft: 42 }, commentBody: { flex: 1, gap: 3 }, author: { fontSize: 13, fontWeight: '700', color: colors.textPrimary }, time: { fontSize: 11, fontWeight: '400', color: colors.textMuted }, commentText: { fontSize: 14, lineHeight: 19, color: colors.textPrimary }, commentActions: { flexDirection: 'row', gap: spacing.md }, replyText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary }, likeCount: { fontSize: 12, color: colors.textMuted }, likeButton: { width: 36, alignItems: 'center', paddingTop: 5 }, empty: { textAlign: 'center', color: colors.textMuted, paddingTop: 48 }, replyBanner: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.surfaceSubtle }, replyBannerText: { fontSize: 12, color: colors.textSecondary }, cancel: { fontSize: 12, color: colors.primary, fontWeight: '700' }, composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }, input: { flex: 1, maxHeight: 96, minHeight: 42, borderRadius: radius.full, backgroundColor: colors.surfaceSubtle, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.textPrimary },
});
