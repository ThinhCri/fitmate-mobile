import { useLocalSearchParams } from 'expo-router';
import { SessionPackageDetailScreen } from '@/features/booking/SessionPackageDetailScreen';

export default function MyPackageDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SessionPackageDetailScreen id={id ?? ''} asPt={false} />;
}
