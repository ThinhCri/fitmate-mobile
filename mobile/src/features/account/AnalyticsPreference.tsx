import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme/designTokens';

export function AnalyticsPreference({ available, enabled, busy = false, onChange }: {
  available: boolean;
  enabled: boolean;
  busy?: boolean;
  onChange?: (enabled: boolean) => void;
}) {
  return <View style={styles.row}>
    <View style={styles.description}>
      <Text style={styles.title}>Chia sẻ thống kê sử dụng</Text>
      <Text style={styles.hint}>{available
        ? 'Cho phép Google Analytics thu thập thống kê để cải thiện app. Không bắt buộc; bạn có thể tắt bất kỳ lúc nào.'
        : 'Bản cài này chưa có cấu hình thống kê. Cần cập nhật bản Android mới; không thể bật từ máy chủ.'}</Text>
    </View>
    <Switch accessibilityLabel="Chia sẻ thống kê sử dụng" value={available && enabled}
      disabled={!available || busy} onValueChange={onChange} />
  </View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  description: { flex: 1, paddingRight: spacing.sm },
  title: { ...typography.bodyMedium, color: colors.textPrimary },
  hint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});
