/**
 * VIPSheet (MOB-120, FP-032).
 * 2 plan: 1 thang (199k) + 12 thang (1.999k, tiet kiem 17%).
 * Mua -> role update thanh 'VIP Hoi vien'.
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Gem, Check } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import { Card, Button } from '@/components/ui';
import { ToastService } from '@/components/ui/Toast';
import { formatVnd } from '@/utils/format';

const PLANS = [
  {
    id: 'vip-1m',
    label: '1 tháng',
    price: 199000,
    saving: null,
    popular: false,
  },
  {
    id: 'vip-12m',
    label: '12 tháng',
    price: 1999000,
    saving: '~17%',
    popular: true,
  },
];

export default function VipSheet() {
  const { user, refresh } = useAuth();
  const theme = useTheme();
  const [selected, setSelected] = useState(PLANS[0].id);

  if (!user) return null;

  const purchase = async () => {
    const plan = PLANS.find((p) => p.id === selected);
    if (!plan) return;
    await mockUserService.saveUser({ ...user, profile: { ...user.profile, name: user.profile.name + ' (VIP)' } });
    await refresh();
    ToastService.show({ message: `Đã nâng cấp VIP — gói ${plan.label}!`, tone: 'achievement' });
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>VIP</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card variant="highlighted">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: resolveColor(theme, 'tertiaryContainer'),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Gem color={resolveColor(theme, 'tertiary')} size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Fitmate VIP</Text>
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>
                Mở khóa tính năng nâng cao.
              </Text>
            </View>
          </View>
        </Card>
        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>Quyền lợi:</Text>
          <View style={{ gap: 6, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Check color={resolveColor(theme, 'success')} size={14} />
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>AI Companion không giới hạn</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Check color={resolveColor(theme, 'success')} size={14} />
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>Bài viết kiến thức cao cấp</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Check color={resolveColor(theme, 'success')} size={14} />
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>Ưu đãi đặt lịch PT (-10%)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Check color={resolveColor(theme, 'success')} size={14} />
              <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 13 }}>Huy hiệu VIP trên profile</Text>
            </View>
          </View>
        </Card>

        <View style={{ gap: 8 }}>
          {PLANS.map((p) => (
            <Pressable key={p.id} onPress={() => setSelected(p.id)}>
              <Card variant={selected === p.id ? 'highlighted' : 'default'}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: selected === p.id ? resolveColor(theme, 'primary') : resolveColor(theme, 'outline'),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selected === p.id && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: resolveColor(theme, 'primary') }} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{p.label}</Text>
                    {p.saving && (
                      <Text style={{ color: resolveColor(theme, 'success'), fontSize: 11, fontWeight: '600' }}>Tiết kiệm {p.saving}</Text>
                    )}
                  </View>
                  <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '800' }}>{formatVnd(p.price)}</Text>
                  {p.popular && (
                    <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: resolveColor(theme, 'secondary') }}>
                      <Text style={{ color: resolveColor(theme, 'onSecondary'), fontSize: 9, fontWeight: '700' }}>HOT</Text>
                    </View>
                  )}
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        <Button label="Mua ngay (demo)" variant="achievement" fullWidth onPress={purchase} />
        <Text style={{ color: resolveColor(theme, 'onSurfaceDisabled'), fontSize: 11, textAlign: 'center' }}>
          Mô phỏng demo — không có giao dịch thật.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
