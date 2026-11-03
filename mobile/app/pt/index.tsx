import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { PtOverviewPresentation, PtOverviewPresentationProps } from '@/features/pt/PtOverviewPresentation';
import { ptDashboardService } from '@/services/api/ptDashboardService';
import { useAuth } from '@/services/AuthContext';

type Overview = Pick<PtOverviewPresentationProps, 'ptName' | 'isVerified' | 'certificateName' | 'rating' | 'reviewCount' | 'isAcceptingClients' | 'pendingTasks' | 'upcomingSessions'>;
export default function PtOverviewScreen() {
  const router = useRouter(); const [data, setData] = useState<Overview | null>(null); const [error, setError] = useState('');
  const { user, loading } = useAuth();
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(useCallback(() => {
    if (loading || !user) return;
    if (user.role !== 'pt' || user.ptVerificationStatus !== 'approved') {
      router.replace('/pt/certificates');
      return;
    }
    let active = true; setError('');
    ptDashboardService.getOverview().then((value) => { if (active) setData(value); }).catch((e) => {
      if (active) setError(e instanceof Error ? e.message : 'Không thể tải tổng quan PT.');
    });
    return () => { active = false; };
  }, [loading, router, user, attempt]));
  if (!data) return <View style={[styles.container, styles.center]}>{error ? <><Text style={styles.error}>{error}</Text><TouchableOpacity accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center' }} onPress={() => setAttempt((value) => value + 1)}><Text>Thử lại</Text></TouchableOpacity></> : <ActivityIndicator />}</View>;
  return <View style={styles.container}><PtOverviewPresentation {...data} onToggleStatus={() => router.push('/pt/profile-services' as never)} onSelectTask={(target) => router.push(target as never)} onNavigateToServices={() => router.push('/pt/profile-services' as never)} onNavigateToSchedule={() => router.push('/pt/schedule' as never)} onNavigateToCertificates={() => router.push('/pt/certificates' as never)} onNavigateToSessions={() => router.push('/pt/sessions' as never)} onNavigateToRevenue={() => router.push('/pt/revenue' as never)} onNavigateToPackages={() => router.push('/pt/packages' as never)} onSelectSession={(id) => router.push(`/pt/session/${id}` as never)} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAFC' }, center: { justifyContent: 'center', alignItems: 'center', padding: 24 }, error: { color: '#DC2626', textAlign: 'center' } });
