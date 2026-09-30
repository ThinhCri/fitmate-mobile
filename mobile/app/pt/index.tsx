import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PtOverviewPresentation } from '../../src/features/pt/PtOverviewPresentation';

const MOCK_TASKS = [
  {
    id: 't-1',
    title: '1 chứng chỉ chờ cập nhật thời hạn',
    type: 'warning' as const,
    linkTarget: '/pt/certificates',
  },
  {
    id: 't-2',
    title: 'Cập nhật lịch rảnh tuần tới',
    type: 'info' as const,
    linkTarget: '/pt/schedule',
  },
];

const MOCK_UPCOMING = [
  {
    id: 'ses-1',
    clientName: 'Trần Văn Minh',
    serviceName: 'Tập sức mạnh cá nhân 1-kèm-1',
    timeString: '18:00 - 19:00 • Hôm nay',
    location: 'Fitmate Gym Thảo Điền',
  },
  {
    id: 'ses-2',
    clientName: 'Nguyễn Thị Hoa',
    serviceName: 'Cardio giảm mỡ chuyên sâu',
    timeString: '09:00 - 10:00 • Ngày mai',
    location: 'Fitmate Studio Quận 1',
  },
];

export default function PtOverviewScreen() {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(true);

  return (
    <View style={styles.container}>
      <PtOverviewPresentation
        ptName="HLV Hoàng Nam"
        isVerified={true}
        certificateName="NASM-CPT • Đã kiểm định"
        rating={4.95}
        reviewCount={120}
        isAcceptingClients={isAccepting}
        pendingTasks={MOCK_TASKS}
        upcomingSessions={MOCK_UPCOMING}
        onToggleStatus={() => setIsAccepting(!isAccepting)}
        onNavigateToServices={() => router.push('/pt/profile-services' as any)}
        onNavigateToSchedule={() => router.push('/pt/schedule' as any)}
        onNavigateToCertificates={() => router.push('/pt/certificates' as any)}
        onNavigateToSessions={() => router.push('/pt/session/ses-1' as any)}
        onNavigateToRevenue={() => router.push('/pt/revenue' as any)}
        onSelectSession={(id) => router.push(`/pt/session/${id}` as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
