/**
 * SearchUsersScreen (MOB-105, FP-006) — search by name/bio/spec, filter by category.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import type { User } from '@/types';
import { Avatar, Card, Chip, Input } from '@/components/ui';

type Category = 'all' | 'pt' | 'member' | 'mentor';

export default function SearchScreen() {
  const { user: viewer } = useAuth();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [results, setResults] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      const all = await mockUserService.getAllUsers();
      let list = Object.values(all).filter((u) => u.email !== viewer?.email);
      if (category === 'pt') list = list.filter((u) => u.profile.isPt);
      else if (category === 'member') list = list.filter((u) => !u.profile.isPt && u.streak < 30);
      else if (category === 'mentor') list = list.filter((u) => !u.profile.isPt && u.streak >= 30);
      if (query.trim()) {
        const q = query.toLowerCase();
        list = list.filter(
          (u) =>
            u.profile.name.toLowerCase().includes(q) ||
            u.profile.bio.toLowerCase().includes(q) ||
            u.profile.spec.some((s) => s.toLowerCase().includes(q)),
        );
      }
      setResults(list);
    })();
  }, [query, category, viewer]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Tìm kiếm</Text>
      </View>
      <View style={{ paddingHorizontal: 12, gap: 8 }}>
        <Input label="Tìm theo tên, bio, chuyên môn" value={query} onChangeText={setQuery} placeholder="Nhập từ khoá..." />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <Chip label="Tất cả" selected={category === 'all'} onPress={() => setCategory('all')} />
          <Chip label="PT" selected={category === 'pt'} onPress={() => setCategory('pt')} />
          <Chip label="Hội viên" selected={category === 'member'} onPress={() => setCategory('member')} />
          <Chip label="Mentor" selected={category === 'mentor'} onPress={() => setCategory('mentor')} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 8 }}>
        {results.length === 0 ? (
          <Card variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center', padding: 24 }}>
              Không có kết quả.
            </Text>
          </Card>
        ) : (
          results.map((u) => (
            <Pressable
              key={u.email}
              accessibilityRole="button"
              onPress={() => router.push(`/(modals)/profile/${u.email}`)}
            >
              <Card variant="default">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar name={u.profile.name} size={48} tone={u.profile.isPt && u.profile.isVerified ? 'tertiary' : 'primary'} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>
                      {u.profile.name}
                    </Text>
                    <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                      {u.profile.bio || u.email}
                    </Text>
                  </View>
                  {u.profile.isPt && (
                    <Chip label={u.profile.isVerified ? 'Verified' : 'Pending'} tone={u.profile.isVerified ? 'achievement' : 'warm'} />
                  )}
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
