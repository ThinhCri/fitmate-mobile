import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { MemberHomePresentation } from '@/features/dashboard/MemberHomePresentation';
import { dashboardService } from '@/services/api/dashboardService';
import type { MemberDashboardSummary } from '@/services/api/types';
import { colors, spacing, typography } from '@/theme/designTokens';

export default function DashboardScreen() {
  const [data, setData] = useState<MemberDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try { setData(await dashboardService.getMemberDashboard()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải trang chủ.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading && !data) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  if (error && !data) return <View style={styles.center}><Text style={[typography.body, styles.error]}>{error}</Text><TouchableOpacity onPress={() => void load()} style={styles.retry}><Text style={styles.retryText}>Thử lại</Text></TouchableOpacity></View>;
  if (!data) return null;
  return <MemberHomePresentation data={data} refreshing={refreshing} onRefresh={() => void load(true)}
    onLogMealPress={() => router.push('/nutrition/manual-entry' as never)}
    onScanMealPress={() => router.push('/nutrition/scan' as never)}
    onStartWorkoutPress={() => router.push('/(tabs)/workout' as never)}
    onFindTrainerPress={() => router.push('/(tabs)/marketplace' as never)}
    onWorkoutDetailPress={(id) => router.push(`/workout/plan/${id}` as never)}
    onNotificationPress={() => router.push('/notifications' as never)} />;
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.background },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  retry: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 8 },
  retryText: { color: colors.white, fontWeight: '700' },
});
