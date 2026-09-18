/**
 * MarketplaceScreen (FP-021, MOB-113).
 * Filter chip + PT cards.
 */
import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeCheck, Star, Search } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Chip, Avatar, Button } from '@/components/ui';
import { DEFAULT_USERS } from '@/mocks/fixtures';
import { formatVnd } from '@/utils/format';

type Filter = 'all' | 'verified' | 'pending' | 'priceAsc' | 'priceDesc' | 'rating';

export default function MarketplaceScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState<Filter>('all');

  const pts = useMemo(() => {
    const list = Object.values(DEFAULT_USERS).filter((u) => u.profile.isPt);
    if (filter === 'verified') return list.filter((u) => u.profile.isVerified);
    if (filter === 'pending') return list.filter((u) => !u.profile.isVerified);
    if (filter === 'priceAsc') return [...list].sort((a, b) => a.profile.price - b.profile.price);
    if (filter === 'priceDesc') return [...list].sort((a, b) => b.profile.price - a.profile.price);
    if (filter === 'rating') return [...list].sort((a, b) => b.reviews.length - a.reviews.length);
    return list;
  }, [filter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top']}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 24, fontWeight: '800' }}>Huấn luyện viên</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Tất cả" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Verified" selected={filter === 'verified'} onPress={() => setFilter('verified')} />
          <Chip label="Giá tăng" selected={filter === 'priceAsc'} onPress={() => setFilter('priceAsc')} />
          <Chip label="Giá giảm" selected={filter === 'priceDesc'} onPress={() => setFilter('priceDesc')} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}>

        {pts.length === 0 ? (
          <Card variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center', padding: 24 }}>
              Không có PT nào.
            </Text>
          </Card>
        ) : (
          pts.map((p) => (
            <Pressable key={p.email} onPress={() => router.push(`/(modals)/profile/${p.email}`)}>
              <Card variant="default">
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Avatar name={p.profile.name} size={56} tone={p.profile.isVerified ? 'tertiary' : 'secondary'} border />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{p.profile.name}</Text>
                      {p.profile.isVerified && <BadgeCheck color={resolveColor(theme, 'tertiary')} size={14} />}
                    </View>
                    <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                      {p.profile.bio}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                      <Chip label={`${p.profile.exp} năm KN`} />
                      <Chip label={formatVnd(p.profile.price) + '/buổi'} />
                    </View>
                    {p.reviews.length > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                        <Star color={resolveColor(theme, 'warning')} fill={resolveColor(theme, 'warning')} size={14} />
                        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>
                          {p.reviews.length} reviews
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Button
                  label="Đặt lịch"
                  variant="primary"
                  size="sm"
                  onPress={() => router.push(`/(modals)/booking/${p.email}`)}
                />
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
