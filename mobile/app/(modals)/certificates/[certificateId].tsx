/**
 * PTCertificatesScreen (MOB-117, FP-028).
 * List + status pill + tap image -> fullscreen modal + self actions
 * (request verification, add cert) + admin simulate (Duyet / Reset).
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, TextInput, Image, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BadgeCheck, Clock, X, Plus, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import { useAuth } from '@/services/AuthContext';
import type { User, Certificate } from '@/types';
import { Card, Badge, Button, Input, Chip } from '@/components/ui';
import { ToastService } from '@/components/ui/Toast';
import { formatDate } from '@/utils/format';

export default function PTCertificatesScreen() {
  const { certificateId, email } = useLocalSearchParams<{ certificateId?: string; email?: string }>();
  const { user: viewer, refresh } = useAuth();
  const theme = useTheme();
  const [profile, setProfile] = useState<User | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [addingCert, setAddingCert] = useState(false);
  const [certForm, setCertForm] = useState({ name: '', organization: '', code: '', type: 'Personal Training', issueDate: new Date().toISOString().slice(0, 10) });

  const targetId = certificateId || email;
  const isSelf = (viewer?.id && targetId && viewer.id === targetId) || viewer?.email === targetId || !targetId;

  useEffect(() => {
    (async () => {
      const u = targetId ? await mockUserService.getUserById(targetId) : viewer;
      setProfile(u);
    })();
  }, [targetId, viewer]);

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface'), padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: resolveColor(theme, 'onSurface'), marginBottom: 8 }}>
          Không tìm thấy chứng chỉ
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={{ padding: 12 }}>
          <Text style={{ color: resolveColor(theme, 'primary'), fontWeight: '600' }}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const statusTone =
    profile.profile.certificateStatus === 'verified' ? 'success'
      : profile.profile.certificateStatus === 'pending' ? 'warning'
        : 'error';
  const statusText =
    profile.profile.certificateStatus === 'verified' ? 'Đã duyệt'
      : profile.profile.certificateStatus === 'pending' ? 'Đang duyệt'
        : 'Chưa duyệt';

  const requestVerification = async () => {
    await mockUserService.updateOtherUser(profile.email, (u) => ({
      ...u,
      profile: { ...u.profile, certificateStatus: 'pending' },
    }));
    const updated = await mockUserService.getUserByEmail(profile.email);
    if (updated) setProfile(updated);
    ToastService.show({ message: 'Đã gửi yêu cầu xét duyệt chứng chỉ!', tone: 'info' });
  };

  const saveNewCert = async () => {
    if (!certForm.name.trim() || !certForm.organization.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền tên chứng chỉ và tổ chức.');
      return;
    }
    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      name: certForm.name.trim(),
      organization: certForm.organization.trim(),
      code: certForm.code.trim() || 'N/A',
      type: certForm.type,
      issueDate: certForm.issueDate,
      image: null,
    };
    await mockUserService.updateOtherUser(profile.email, (u) => ({
      ...u,
      profile: {
        ...u.profile,
        certificates: [...u.profile.certificates, newCert],
        certificateStatus: 'pending',
      },
    }));
    const updated = await mockUserService.getUserByEmail(profile.email);
    if (updated) setProfile(updated);
    setAddingCert(false);
    setCertForm({ name: '', organization: '', code: '', type: 'Personal Training', issueDate: new Date().toISOString().slice(0, 10) });
    ToastService.show({ message: 'Đã thêm chứng chỉ. Trạng thái: Đang duyệt.', tone: 'success' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700', flex: 1 }}>Chứng chỉ</Text>
      </View>
      <View style={{ paddingHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Badge text={statusText} tone={statusTone} />
        {isSelf && profile.profile.certificateStatus === 'unverified' && (
          <Button label="Yêu cầu xét duyệt" variant="primary" size="sm" onPress={requestVerification} iconLeft={<ShieldCheck size={12} color={resolveColor(theme, 'onPrimary')} />} />
        )}
        {isSelf && (
          <Button label="+ Thêm chứng chỉ" variant="secondary" size="sm" onPress={() => setAddingCert(true)} iconLeft={<Plus size={12} color={resolveColor(theme, 'onSecondaryContainer')} />} />
        )}
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
            <Pressable key={c.id} onPress={() => c.image && setFullscreenImage(c.image)}>
              <Card variant="default">
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
                      Mã: {c.code} • Loại: {c.type}
                    </Text>
                    {c.image && (
                      <View style={{ marginTop: 8, height: 100, borderRadius: 8, backgroundColor: resolveColor(theme, 'surfaceContainerLow'), alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>(ảnh chứng chỉ)</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Fullscreen image modal */}
      <Modal visible={fullscreenImage !== null} transparent animationType="fade" onRequestClose={() => setFullscreenImage(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' }} onPress={() => setFullscreenImage(null)}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {fullscreenImage && (
              <Image source={{ uri: fullscreenImage }} style={{ width: '90%', height: '80%' }} resizeMode="contain" />
            )}
            <Pressable onPress={() => setFullscreenImage(null)} style={{ position: 'absolute', top: 40, right: 20 }}>
              <X color="#fff" size={28} />
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Add cert modal */}
      <Modal visible={addingCert} transparent animationType="slide" onRequestClose={() => setAddingCert(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: resolveColor(theme, 'surface'), borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 }}>
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Thêm chứng chỉ</Text>
            <Input label="Tên chứng chỉ" value={certForm.name} onChangeText={(v) => setCertForm({ ...certForm, name: v })} placeholder="VD: NASM CPT" />
            <Input label="Tổ chức cấp" value={certForm.organization} onChangeText={(v) => setCertForm({ ...certForm, organization: v })} placeholder="VD: NASM" />
            <Input label="Mã chứng chỉ" value={certForm.code} onChangeText={(v) => setCertForm({ ...certForm, code: v })} placeholder="VD: NASM-12345" />
            <Input label="Loại" value={certForm.type} onChangeText={(v) => setCertForm({ ...certForm, type: v })} placeholder="VD: Personal Training" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label="Hủy" variant="ghost" fullWidth onPress={() => setAddingCert(false)} />
              <Button label="Lưu" variant="primary" fullWidth onPress={saveNewCert} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
