import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/design-system/ScreenContainer';
import { colors, spacing, typography } from '@/theme/designTokens';

export default function ReplaceMealRoute() {
  return <ScreenContainer edges={['top', 'bottom']}><View style={styles.center}><Text style={[typography.title2, styles.title]}>Chưa có gợi ý thay thế từ máy chủ</Text><Text style={[typography.body, styles.body]}>Bạn vẫn có thể ghi món ăn thực tế bằng biểu mẫu thủ công. Ứng dụng không tự tạo danh sách món giả.</Text><TouchableOpacity style={styles.button} onPress={() => router.replace('/nutrition/manual-entry' as never)}><Text style={styles.buttonText}>Nhập món thủ công</Text></TouchableOpacity><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Quay lại</Text></TouchableOpacity></View></ScreenContainer>;
}
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }, title: { color: colors.textPrimary, textAlign: 'center' }, body: { color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.lg }, button: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }, buttonText: { color: colors.white, fontWeight: '700' }, back: { color: colors.textSecondary, marginTop: spacing.lg } });
