/**
 * Profile modal — route: /profile/[email]
 * Hien thi HV (Section 5.2) hoac PT (Section 5.3) tuy theo role.
 * Self view co nut Sua; other view co Dat lich/Nhan tin/Ket ban.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Pencil, Calendar, MessageCircle, UserPlus, UserMinus, Star, BadgeCheck } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import type { User } from '@/types';
import { Avatar, Button, Card, Chip, Badge } from '@/components/ui';
import { formatVnd, formatDate, formatStreak } from '@/utils/format';

export default function ProfileModal() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { user: viewer } = useAuth();
  const theme = useTheme();
  const [profile, setProfile] = useState<User | null>(null);
  const [tab, setTab] = useState<'info' | 'posts' | 'reviews'>('info');

  useEffect(() => {
    (async () => {
      if (!email) return;
      const u = await mockUserService.getUserByEmail(email);
      setProfile(u);
    })();
  }, [email]);

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }}>
        <Text style={{ padding: 16, color: resolveColor(theme, 'onSurfaceVariant') }}>Đang tải hồ sơ...</Text>
      </SafeAreaView>
    );
  }

  const isSelf = viewer?.email === profile.email;
  const isPt = profile.profile.isPt;
  const isVerified = isPt && profile.profile.isVerified;

  // Hero bg: member -> primaryContainer; PT verified -> tertiaryContainer; PT pending -> secondaryContainer
  const heroBgKey = isPt ? (isVerified ? 'tertiaryContainer' : 'secondaryContainer') : 'primaryContainer';
  const heroBorderKey = isPt ? (isVerified ? 'tertiary' : 'secondary') : 'primary';
  const roleBgKey = isPt ? (isVerified ? 'tertiaryContainer' : 'secondaryContainer') : 'primaryContainer';
  const roleFgKey = isPt ? (isVerified ? 'onTertiaryContainer' : 'onSecondaryContainer') : 'onPrimaryContainer';
  const roleLabel = isPt ? (isVerified ? 'HLV' : 'HLV (chờ duyệt)') : 'Hội viên';

  const isFriend = viewer?.friendsList.includes(profile.email) ?? false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero */}
        <View
          style={{
            backgroundColor: resolveColor(theme, heroBgKey),
            paddingTop: 16,
            paddingBottom: 24,
            alignItems: 'center',
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start', marginLeft: 8 }}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
              <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
            </Pressable>
          </View>
          <Avatar name={profile.profile.name} size={100} tone={isVerified ? 'tertiary' : 'primary'} border />
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 24, fontWeight: '700' }}>{profile.profile.name}</Text>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: resolveColor(theme, roleBgKey),
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {isVerified && <BadgeCheck color={resolveColor(theme, roleFgKey)} size={14} />}
            <Text style={{ color: resolveColor(theme, roleFgKey), fontSize: 12, fontWeight: '600' }}>{roleLabel}</Text>
          </View>

          {/* Quick actions row */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {isSelf ? (
              <Button
                label="Sửa hồ sơ"
                variant="primary"
                size="md"
                iconLeft={<Pencil color={resolveColor(theme, 'onPrimary')} size={16} />}
                onPress={() => router.push(`/(modals)/edit-profile/${profile.email}`)}
              />
            ) : (
              <>
                <Button
                  label="Đặt lịch"
                  variant="primary"
                  size="md"
                  iconLeft={<Calendar color={resolveColor(theme, 'onPrimary')} size={16} />}
                  onPress={() => router.push(`/(modals)/booking/${profile.email}`)}
                />
                <Button
                  label="Nhắn tin"
                  variant="secondary"
                  size="md"
                  iconLeft={<MessageCircle color={resolveColor(theme, 'onSurface')} size={16} />}
                  onPress={() => router.push(`/(modals)/chat/${profile.email}`)}
                />
                <Button
                  label={isFriend ? 'Hủy kết bạn' : 'Kết bạn'}
                  variant="secondary"
                  size="md"
                  iconLeft={isFriend ? <UserMinus color={resolveColor(theme, 'onSurface')} size={16} /> : <UserPlus color={resolveColor(theme, 'onSurface')} size={16} />}
                  onPress={() => {
                    /* TODO MOB-115 phase 3: friend request sheet */
                  }}
                />
              </>
            )}
          </View>
        </View>

        {/* Friend status chip row */}
        {!isSelf && viewer && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Chip
              label={isFriend ? 'Bạn bè' : viewer.sentRequests.includes(profile.email) ? 'Đã gửi' : 'Kết bạn'}
              selected={isFriend}
            />
          </View>
        )}

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 }}>
          <Chip label="Thông tin" selected={tab === 'info'} onPress={() => setTab('info')} />
          <Chip label={`Bài viết (${profile.posts.length})`} selected={tab === 'posts'} onPress={() => setTab('posts')} />
          {isPt && <Chip label={`Reviews (${profile.reviews.length})`} selected={tab === 'reviews'} onPress={() => setTab('reviews')} />}
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {tab === 'info' && <InfoSection profile={profile} />}
          {tab === 'posts' && <PostsSection profile={profile} />}
          {tab === 'reviews' && isPt && <ReviewsSection profile={profile} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoSection({ profile }: { profile: User }) {
  const theme = useTheme();
  const isPt = profile.profile.isPt;

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14 }}>{label}</Text>
      <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' }}>
        {value || '—'}
      </Text>
    </View>
  );

  return (
    <>
      <Card variant="default">
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
          {isPt ? 'Thông tin HLV' : 'Mục tiêu'}
        </Text>
        {profile.profile.goal ? (
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, marginBottom: 8 }}>{profile.profile.goal}</Text>
        ) : null}
        <Row label="Email" value={profile.email} />
        <Row label="Số điện thoại" value={profile.profile.phone} />
        <Row label="Ngày sinh" value={formatDate(profile.profile.birthday)} />
        <Row label="Giới tính" value={profile.profile.gender} />
        <Row label="Chiều cao" value={`${profile.profile.height} cm`} />
        <Row label="Cân nặng" value={`${profile.profile.weight} kg`} />
      </Card>

      {!isPt && (
        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
            Sức khỏe (chỉ hội viên)
          </Text>
          <Row label="Bệnh nền" value={profile.profile.medicalCondition || 'Không có'} />
          <Row label="Dị ứng" value={profile.profile.allergies.length > 0 ? profile.profile.allergies.join(', ') : 'Không có'} />
          <Row label="Ngày tập" value={profile.profile.trainingDays.join(', ')} />
          <Row label="Khung giờ" value={profile.profile.trainingTime} />
        </Card>
      )}

      {isPt && (
        <>
          <Card variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Chuyên môn</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {profile.profile.spec.map((s) => (
                <Chip key={s} label={s} tone="warm" />
              ))}
            </View>
            <Row label="Kinh nghiệm" value={`${profile.profile.exp} năm`} />
            <Row label="Giá" value={`${formatVnd(profile.profile.price)}/buổi`} />
            <Row label="Ngày dạy" value={profile.profile.trainingDays.join(', ')} />
            <Row label="Giờ trống" value={profile.profile.trainingTime} />
          </Card>
          <Card variant="default">
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
              Chứng chỉ ({profile.profile.certificates.length})
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Badge
                text={profile.profile.certificateStatus === 'verified' ? 'Đã duyệt' : profile.profile.certificateStatus === 'pending' ? 'Đang duyệt' : 'Chưa duyệt'}
                tone={profile.profile.certificateStatus === 'verified' ? 'success' : profile.profile.certificateStatus === 'pending' ? 'warning' : 'error'}
              />
            </View>
          </Card>
        </>
      )}

      <Card variant="flat">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, alignItems: 'center', padding: 8, borderRadius: 12, backgroundColor: resolveColor(theme, 'secondaryContainer') }}>
            <Text style={{ color: resolveColor(theme, 'onSecondaryContainer'), fontSize: 18, fontWeight: '800' }}>{profile.streak}</Text>
            <Text style={{ color: resolveColor(theme, 'onSecondaryContainer'), fontSize: 11 }}>Streak</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', padding: 8, borderRadius: 12, backgroundColor: resolveColor(theme, 'primaryContainer') }}>
            <Text style={{ color: resolveColor(theme, 'onPrimaryContainer'), fontSize: 18, fontWeight: '800' }}>{profile.rewardPoints}</Text>
            <Text style={{ color: resolveColor(theme, 'onPrimaryContainer'), fontSize: 11 }}>Điểm thưởng</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', padding: 8, borderRadius: 12, backgroundColor: resolveColor(theme, 'surfaceContainerHigh') }}>
            <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '800' }}>{profile.friendsList.length}</Text>
            <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11 }}>Bạn bè</Text>
          </View>
        </View>
      </Card>
    </>
  );
}

function PostsSection({ profile }: { profile: User }) {
  const theme = useTheme();
  if (profile.posts.length === 0) {
    return (
      <Card variant="default">
        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center', paddingVertical: 24 }}>
          Chưa có bài viết nào.
        </Text>
      </Card>
    );
  }
  return (
    <>
      {profile.posts.map((p) => (
        <Card key={p.id} variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, lineHeight: 20 }}>{p.content}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {p.tags.map((t) => (
              <Chip key={t} label={`#${t}`} />
            ))}
          </View>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, marginTop: 8 }}>
            {formatDate(p.timestamp)}
          </Text>
        </Card>
      ))}
    </>
  );
}

function ReviewsSection({ profile }: { profile: User }) {
  const theme = useTheme();
  if (profile.reviews.length === 0) {
    return (
      <Card variant="default">
        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 14, textAlign: 'center', paddingVertical: 24 }}>
          Chưa có đánh giá nào.
        </Text>
      </Card>
    );
  }
  return (
    <>
      {profile.reviews.map((r) => (
        <Card key={r.id} variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                color={i < r.rating ? resolveColor(theme, 'warning') : resolveColor(theme, 'outlineVariant')}
                fill={i < r.rating ? resolveColor(theme, 'warning') : 'transparent'}
                size={16}
              />
            ))}
          </View>
          <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, marginTop: 8 }}>{r.text}</Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 11, marginTop: 8 }}>
            {formatDate(r.timestamp)}
          </Text>
        </Card>
      ))}
    </>
  );
}
