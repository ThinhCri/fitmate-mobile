import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MemberHomePresentation } from '@/features/dashboard/MemberHomePresentation';
import { dashboardService } from '@/services/api/dashboardService';
import type { MemberDashboardSummary } from '@/services/api/types';
import { useAuth } from '@/services/AuthContext';
import { requestInitialPermissionsOnce } from '@/services/initialPermissions';
import { getSupportRepository } from '@/repositories/supportRepository';
import { colors, spacing, typography } from '@/theme/designTokens';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<MemberDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try { setData(await dashboardService.getMemberDashboard()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải trang chủ.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const loadUnreadNotificationCount = useCallback(async () => {
    try {
      const notifications = await getSupportRepository().getNotifications();
      setUnreadNotificationCount(notifications.filter((item) => !item.isRead).length);
    } catch {
      // Notification count is secondary; keep the Dashboard usable if it fails.
      setUnreadNotificationCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadUnreadNotificationCount();
    }, [loadUnreadNotificationCount])
  );

  useEffect(() => {
    if (!data || !user) return;

    // Permission dialogs must never block login or appear on an auth screen.
    // Wait until the authenticated dashboard has rendered and its navigation
    // transition/initial interactions have completed.
    const interaction = InteractionManager.runAfterInteractions(() => {
      void requestInitialPermissionsOnce(user.email).catch(() => {});
    });

    return () => interaction.cancel();
  }, [data, user]);

  if (loading && !data) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  if (error && !data) return <View style={styles.center}><Text style={[typography.body, styles.error]}>{error}</Text><TouchableOpacity onPress={() => void load()} style={styles.retry}><Text style={styles.retryText}>Thử lại</Text></TouchableOpacity></View>;
  if (!data) return null;
  return <MemberHomePresentation data={data} unreadNotificationCount={unreadNotificationCount} refreshing={refreshing} onRefresh={() => { void load(true); void loadUnreadNotificationCount(); }}
    onLogMealPress={() => router.push('/nutrition/manual-entry' as never)}
    onScanMealPress={() => router.push('/nutrition/scan' as never)}
    onStartWorkoutPress={() => router.push('/(tabs)/workout' as never)}
    onFindTrainerPress={() => router.push('/(tabs)/marketplace' as never)}
    onWorkoutDetailPress={(id) => router.push(`/workout/plan/${id}` as never)}
    onNotificationPress={() => router.push('/notifications' as never)}
    onAccountPress={() => router.push('/account' as never)} />;
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.background },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  retry: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 8 },
  retryText: { color: colors.white, fontWeight: '700' },
});
