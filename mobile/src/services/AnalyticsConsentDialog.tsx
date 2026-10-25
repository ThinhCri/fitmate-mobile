import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

export function AnalyticsConsentDialog({ visible, busy, error, onChoose }: {
  visible: boolean;
  busy: boolean;
  error: string | null;
  onChoose: (enabled: boolean) => void;
}) {
  return <Modal visible={visible} transparent animationType="fade"
    onRequestClose={() => { if (!busy) onChoose(false); }}>
    <View style={styles.backdrop}>
      <View style={styles.card} accessibilityViewIsModal>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">Giúp Fitmate tốt hơn</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng và không đồng ý thống kê"
            disabled={busy} onPress={() => onChoose(false)} style={styles.close}>
            <X size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView>
          <Text style={styles.body}>Bạn có đồng ý cho Fitmate gửi thống kê sử dụng đến Google Analytics để cải thiện ứng dụng không?</Text>
          <Text style={styles.body}>Thống kê gồm các màn hình bạn mở và thông tin kỹ thuật cơ bản của ứng dụng, thiết bị. Fitmate không đưa tên, email, nội dung trò chuyện, ảnh hay chỉ số sức khỏe vào các sự kiện thống kê này.</Text>
          <Text style={styles.body}>Không bắt buộc. Bạn vẫn dùng app bình thường nếu từ chối và có thể đổi lựa chọn tại Hồ sơ → Cài đặt ứng dụng &amp; Bảo mật.</Text>
          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </ScrollView>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => onChoose(false)} style={styles.button}>
            <Text style={styles.buttonText}>Không đồng ý</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => onChoose(true)} style={[styles.button, styles.accept]}>
            {busy ? <ActivityIndicator color={colors.white} /> : <Text style={[styles.buttonText, styles.acceptText]}>Đồng ý</Text>}
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.backdrop },
  card: { width: '100%', maxWidth: 440, maxHeight: '85%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  title: { ...typography.title2, color: colors.textPrimary, flex: 1 },
  close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  body: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  button: { flexBasis: '45%', flexGrow: 1, flexShrink: 1, minWidth: 120, minHeight: 48, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  accept: { backgroundColor: colors.primary, borderColor: colors.primary },
  // Give Android the full label width; don't shrink-wrap Vietnamese text to a
  // rounded intrinsic measurement or force accents into a fixed line height.
  buttonText: { width: '100%', textAlign: 'center', includeFontPadding: true, color: colors.textPrimary, fontSize: typography.body.fontSize, fontWeight: '600' },
  acceptText: { color: colors.white },
});
