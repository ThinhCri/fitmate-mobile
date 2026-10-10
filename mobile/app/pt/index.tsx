import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PtOverviewPresentation, PtOverviewPresentationProps } from '@/features/pt/PtOverviewPresentation';
import { ptDashboardService } from '@/services/api/ptDashboardService';

type Overview = Pick<PtOverviewPresentationProps, 'ptName' | 'isVerified' | 'certificateName' | 'rating' | 'reviewCount' | 'isAcceptingClients' | 'pendingTasks' | 'upcomingSessions'>;
export default function PtOverviewScreen() {
  const router = useRouter(); const [data, setData] = useState<Overview | null>(null); const [error, setError] = useState('');
  useEffect(() => { ptDashboardService.getOverview().then(setData).catch((e) => setError(e instanceof Error ? e.message : 'Không thể tải tổng quan PT.')); }, []);
  if (!data) return <View style={[styles.container, styles.center]}>{error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator />}</View>;
  return <View style={styles.container}><PtOverviewPresentation {...data} onToggleStatus={() => Alert.alert('Chưa hỗ trợ', 'Máy chủ chưa có API bật/tắt nhận học viên. Hãy quản lý từng dịch vụ trong hồ sơ PT.')} onNavigateToServices={() => router.push('/pt/profile-services' as never)} onNavigateToSchedule={() => router.push('/pt/schedule' as never)} onNavigateToCertificates={() => router.push('/pt/certificates' as never)} onNavigateToSessions={() => data.upcomingSessions[0] ? router.push(`/pt/session/${data.upcomingSessions[0].id}` as never) : Alert.alert('Chưa có buổi tập', 'Hiện không có lịch hẹn sắp tới.')} onNavigateToRevenue={() => router.push('/pt/revenue' as never)} onNavigateToPackages={() => router.push('/pt/packages' as never)} onSelectSession={(id) => router.push(`/pt/session/${id}` as never)} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAFC' }, center: { justifyContent: 'center', alignItems: 'center', padding: 24 }, error: { color: '#DC2626', textAlign: 'center' } });
