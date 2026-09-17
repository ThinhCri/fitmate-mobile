/**
 * PTCertificatesScreen (MOB-117, FP-028) — list + status pill.
 * Phase 2 skeleton: list cert + status, tap to view fullscreen.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BadgeCheck, Clock, X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import type { User, Certificate } from '@/types';
import { Card, Badge, Button } from '@/components/ui';
import { formatDate } from '@/utils/format';

export default function PTCertificatesScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const theme = useTheme();
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      if (!email) return;
      const u = await mockUserService.getUserByEmail(email);
      setProfile(u);
    })();
  }, [email]);

  if (!profile) return null;

  const statusTone =
    profile.profile.certificateStatus === 'verified' ? 'success'
      : profile.profile.certificateStatus === 'pending' ? 'warning'
        : 'error';
  const statusText =
    profile.profile.certificateStatus === 'verified' ? 'Đã duyệt'
      : profile.profile.certificateStatus === 'pending' ? 'Đang duyệt'
        : 'Chưa duyệt';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Chứng chỉ</Text>
      </View>
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <Badge text={statusText} tone={statusTone} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {profile.profile.certificates.length === 0 ? (
          <Card variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center', padding: 24 }}>
              Chưa có chứng chỉ nào.
            </Text>
          </Card>
        ) : (
          profile.profile.certificates.map((c: Certificate) => (
            <Card key={c.id} variant="default">
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                {statusTone === 'success' ? (
                  <BadgeCheck color={resolveColor(theme, 'success')} size={20} />
                ) : statusTone === 'warning' ? (
                  <Clock color={resolveColor(theme, 'warning')} size={20} />
                ) : (
                  <X color={resolveColor(theme, 'error')} size={20} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{c.name}</Text>
                  <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 2 }}>
                    {c.organization} • {formatDate(c.issueDate)}
                  </Text>
                  <Text style={{ color: resolveColor(theme, 'onSurfaceDisabled'), fontSize: 11, marginTop: 2 }}>
                    Mã: {c.code}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
