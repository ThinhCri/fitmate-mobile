import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { systemService } from '@/services/api/systemService';
import { colors, spacing, typography } from '@/theme/designTokens';

export default function AiWorkoutAdjustScreen() {
  const router = useRouter(); const [reason, setReason] = useState<string | null>(null);
  useEffect(() => { systemService.getCapabilities().then((caps) => setReason(caps.ai.workout_adjust ? 'Backend đã bật khả năng AI nhưng chưa công bố API proposal/apply trong OpenAPI hiện tại.' : caps.ai.status_reason || 'Điều chỉnh giáo án bằng AI hiện chưa khả dụng.')).catch(() => setReason('Không thể xác minh trạng thái AI từ máy chủ.')); }, []);
  return <View style={styles.container}>{reason === null ? <ActivityIndicator /> : <><Text style={[typography.title2, styles.title]}>Điều chỉnh giáo án bằng AI</Text><Text style={[typography.body, styles.body]}>{reason}</Text><TouchableOpacity style={styles.button} onPress={() => router.replace('/workout/editor' as never)}><Text style={styles.buttonText}>Chỉnh sửa thủ công</Text></TouchableOpacity><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Quay lại</Text></TouchableOpacity></>}</View>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.background }, title: { color: colors.textPrimary, textAlign: 'center' }, body: { color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.lg }, button: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }, buttonText: { color: colors.white, fontWeight: '700' }, back: { color: colors.textSecondary, marginTop: spacing.lg } });
