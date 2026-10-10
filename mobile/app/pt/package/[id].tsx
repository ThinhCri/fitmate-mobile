import { useLocalSearchParams } from 'expo-router';
import { SessionPackageDetailScreen } from '@/features/booking/SessionPackageDetailScreen';

export default function AssignedPackageDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SessionPackageDetailScreen id={id ?? ''} asPt />;
}
