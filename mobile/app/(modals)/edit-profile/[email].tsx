/**
 * EditProfileScreen (FP-024 edit).
 * Sua avatar (placeholder), name, bio, goal, phone, birthday, gender, height, weight.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import { Card, Button, Chip, Input, Avatar } from '@/components/ui';

const GENDERS = ['Nam', 'Nữ', 'Khác'] as const;

export default function EditProfileScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { user: viewer, refresh } = useAuth();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [goal, setGoal] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<string>('Nam');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    if (!viewer) return;
    setName(viewer.profile.name);
    setBio(viewer.profile.bio);
    setGoal(viewer.profile.goal);
    setPhone(viewer.profile.phone);
    setBirthday(viewer.profile.birthday);
    setGender(viewer.profile.gender);
    setHeight(String(viewer.profile.height));
    setWeight(String(viewer.profile.weight));
  }, [viewer]);

  if (!viewer || viewer.email !== email) return null;

  const onSave = async () => {
    await mockUserService.saveUser({
      ...viewer,
      profile: {
        ...viewer.profile,
        name: name.trim() || viewer.profile.name,
        bio,
        goal,
        phone,
        birthday,
        gender: gender as typeof GENDERS[number],
        height: Number(height) || viewer.profile.height,
        weight: Number(weight) || viewer.profile.weight,
      },
    });
    await refresh();
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Sửa hồ sơ</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Avatar name={name || viewer.profile.name} size={80} tone="primary" border />
          <Text style={{ color: resolveColor(theme, 'onSurfaceDisabled'), fontSize: 11 }}>Avatar picker: phase 3</Text>
        </View>
        <Card variant="default">
          <Input label="Tên" value={name} onChangeText={setName} />
          <Input label="Bio" value={bio} onChangeText={setBio} />
          <Input label="Mục tiêu" value={goal} onChangeText={setGoal} />
          <Input label="Số điện thoại" value={phone} onChangeText={setPhone} />
          <Input label="Ngày sinh (YYYY-MM-DD)" value={birthday} onChangeText={setBirthday} />
          <View style={{ gap: 8, marginTop: 8 }}>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, fontWeight: '600' }}>Giới tính</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {GENDERS.map((g) => (
                <Chip key={g} label={g} selected={gender === g} onPress={() => setGender(g)} />
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Input label="Chiều cao (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Cân nặng (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
            </View>
          </View>
        </Card>
        <Button label="Lưu" variant="primary" fullWidth onPress={onSave} />
        <Button label="Hủy" variant="tertiary" fullWidth onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
