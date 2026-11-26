import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { trainersService } from '@/services/api/trainersService';
import { ptService } from '@/services/api/ptService';
import { mapPTPublicDetailToDetail, type AvailabilitySlot } from '@/services/api/types';
import { sessionPackageService } from '@/services/api/sessionPackageService';

const displayTime = (value: string) => new Date(value).toLocaleString('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit',
  day: '2-digit', month: '2-digit', year: 'numeric',
});

export default function PackageCreateScreen() {
  const router = useRouter();
  const { ptId, serviceId } = useLocalSearchParams<{ ptId?: string; serviceId?: string }>();
  const [service, setService] = useState<ReturnType<typeof mapPTPublicDetailToDetail>['services'][number] | null>(null);
  const [trainerName, setTrainerName] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [count, setCount] = useState<4 | 8>(4);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const request = useRef<{ signature: string; key: string } | null>(null);

  const load = useCallback(async () => {
    if (!ptId || !serviceId) { setError('Thiếu thông tin PT hoặc dịch vụ.'); setLoading(false); return; }
    setLoading(true);
    try {
      const [raw, availability] = await Promise.all([
        trainersService.getTrainer(ptId),
        ptService.getTrainerAvailability(ptId, {
          from: new Date().toISOString(),
          to: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ]);
      const trainer = mapPTPublicDetailToDetail(raw);
      const matching = trainer.services.find(s => s.id === serviceId && s.isActive);
      if (!trainer.isVerified || !matching) throw new Error('Dịch vụ này không còn nhận lịch.');
      if (matching.package4PriceVnd <= 0 && matching.package8PriceVnd <= 0)
        throw new Error('PT chưa mở bán gói 4 hoặc 8 buổi cho dịch vụ này.');
      setTrainerName(trainer.name);
      setService(matching);
      setCount(matching.package4PriceVnd > 0 ? 4 : 8);
      setSelected([]);
      setSlots(availability.filter(s => s.status === 'open' &&
        Date.parse(s.slot_start_utc) >= Date.now() + 30 * 60 * 1000 &&
        s.duration_minutes >= matching.durationMinutes).sort((a, b) =>
        Date.parse(a.slot_start_utc) - Date.parse(b.slot_start_utc)));
      setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải lịch PT.'); }
    finally { setLoading(false); }
  }, [ptId, serviceId]);

  useEffect(() => { void load(); }, [load]);

  const toggle = (start: string) => {
    request.current = null;
    setSelected(current => current.includes(start) ? current.filter(x => x !== start) :
      current.length < count ? [...current, start].sort() : current);
  };

  const createHold = () => {
    if (!ptId || !service || selected.length !== count || busy ||
        (count === 4 ? service.package4PriceVnd : service.package8PriceVnd) <= 0) return;
    const shortNotice = selected.some(x => Date.parse(x) < Date.now() + 48 * 60 * 60 * 1000);
    const message = `Bạn chọn ${count} buổi với ${trainerName}. Giá và thời hạn giữ chỗ sẽ được máy chủ xác nhận trước thanh toán. Bản thân bạn sẽ chọn lịch ngay bây giờ.` +
      (shortNotice ? '\n\nCó buổi bắt đầu trong vòng 48 giờ. Nếu tự bận hoặc vắng mặt, buổi đó không được hoàn tiền/giữ lượt.' : '');
    Alert.alert('Xác nhận lịch gói', message, [
      { text: 'Xem lại', style: 'cancel' },
      { text: 'Giữ lịch', onPress: async () => {
        if (busy) return;
        setBusy(true);
        const signature = `${ptId}:${service.id}:${selected.join(',')}`;
        if (request.current?.signature !== signature)
          request.current = { signature, key: `package-${Date.now()}-${Math.random().toString(36).slice(2)}` };
        try {
          const held = await sessionPackageService.createHold({
            pt_user_id: ptId, service_id: service.id,
            delivery_mode: service.deliveryMode as 'in_person' | 'online',
            slot_starts_utc: selected,
          }, request.current.key);
          request.current = null;
          router.replace(`/booking/package/${held.id}` as never);
        } catch (cause) {
          Alert.alert('Chưa giữ được lịch', cause instanceof Error ? cause.message : 'Hãy tải lại lịch và thử lại.');
          void load();
        } finally { setBusy(false); }
      } },
    ]);
  };

  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={typography.title1}>Đặt gói PT</Text></View>
    {loading ? <View style={styles.center}><ActivityIndicator color={colors.primary} /><Text>Đang tải lịch...</Text></View> :
      error || !service ? <View style={styles.center}><Text style={styles.error}>{error || 'Không còn dịch vụ.'}</Text><Pressable onPress={() => void load()} style={styles.button}><Text style={styles.buttonText}>Tải lại</Text></Pressable></View> :
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>
              {service.deliveryMode === 'online' ? 'Online qua Google Meet' : 'Tập trực tiếp tại phòng'}
            </Text>
          </View>
          <Text style={styles.summaryTrainer}>{trainerName}</Text>
          <Text style={styles.summaryService}>{service.name}</Text>
          <Text style={styles.summaryLocation}>
            {service.deliveryMode === 'online'
              ? `Thời lượng ${service.durationMinutes} phút/buổi · Kết nối trực tuyến`
              : `${service.locationName} · ${service.locationAddress}`}
          </Text>
          <View style={styles.summaryNoticeBox}>
            <Text style={styles.summaryNoticeText}>
              Giá do PT công bố; máy chủ sẽ chốt và phân bổ theo từng buổi khi bạn giữ lịch (chưa thu tiền ở bước này).
            </Text>
          </View>
        </View>
        <Text style={typography.title2}>Chọn gói số buổi</Text>
        <View style={styles.row}>{([4, 8] as const).map(n => {
          const price = n === 4 ? service.package4PriceVnd : service.package8PriceVnd;
          const isSelected = count === n;
          const full = service.priceVnd * n;
          const savePct = full > 0 && price > 0 && price < full ? Math.round(((full - price) / full) * 100) : 0;
          return <Pressable key={n} disabled={price <= 0} onPress={() => { setCount(n); setSelected([]); request.current = null; }}
            style={[styles.choice, n === 4 ? styles.choice4 : styles.choice8, isSelected && styles.active, price <= 0 && styles.disabled]} accessibilityRole="button">
            <View style={styles.choiceTopRow}>
              <Text style={isSelected ? styles.activeText : (n === 4 ? styles.choiceTitle4 : styles.choiceTitle8)}>Gói {n} buổi</Text>
              {savePct > 0 && (
                <View style={[styles.savePill, isSelected && styles.savePillActive]}>
                  <Text style={styles.savePillText}>-{savePct}%</Text>
                </View>
              )}
            </View>
            <Text style={isSelected ? styles.activePrice : styles.choicePrice}>
              {price > 0 ? `${price.toLocaleString('vi-VN')} ₫` : 'Chưa mở bán'}
            </Text>
            {price > 0 && (
              <Text style={isSelected ? styles.activeSub : styles.choiceSub}>
                ~{Math.round(price / n).toLocaleString('vi-VN')} ₫/buổi
              </Text>
            )}
          </Pressable>;
        })}</View>
        <Text style={typography.title2}>Chọn {count} khung giờ ({selected.length}/{count})</Text>
        {slots.length < count ? <Text style={styles.note}>PT hiện có {slots.length} khung giờ phù hợp trong 4 tuần tới; cần ít nhất {count} khung giờ để đặt gói này. Bạn có thể chọn gói ít buổi hơn hoặc quay lại sau.</Text> : null}
        {slots.map(slot => <Pressable key={slot.id} onPress={() => toggle(slot.slot_start_utc)}
          accessibilityRole="checkbox" accessibilityState={{ checked: selected.includes(slot.slot_start_utc) }} style={[styles.slot, selected.includes(slot.slot_start_utc) && styles.active]}>
          <Text style={selected.includes(slot.slot_start_utc) ? styles.activeText : styles.choiceText}>{displayTime(slot.slot_start_utc)} · {slot.duration_minutes} phút</Text>
        </Pressable>)}
        <Pressable disabled={busy || selected.length !== count} onPress={createHold} style={[styles.button, (busy || selected.length !== count) && styles.disabled]}><Text style={styles.buttonText}>{busy ? 'Đang giữ lịch...' : 'Tiếp tục'}</Text></Pressable>
      </ScrollView>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  back: { width: 48, height: 48, justifyContent: 'center' }, backText: { fontSize: 32, color: colors.textPrimary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  summaryCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: '#CBD5E1', borderLeftWidth: 4, borderLeftColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs },
  summaryBadge: { alignSelf: 'flex-start', backgroundColor: '#CCFBF1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  summaryBadgeText: { fontSize: 11, fontWeight: '700', color: '#0F766E' },
  summaryTrainer: { fontSize: 13, fontWeight: '600', color: '#0F766E', marginTop: 4 },
  summaryService: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  summaryLocation: { fontSize: 13, color: '#334155' },
  summaryNoticeBox: { backgroundColor: '#F8FAFC', borderRadius: radius.sm, padding: spacing.sm, marginTop: 4 },
  summaryNoticeText: { fontSize: 12, color: '#475569', lineHeight: 17 },
  row: { flexDirection: 'row', gap: spacing.sm },
  choice: { flex: 1, minHeight: 76, justifyContent: 'center', alignItems: 'center', borderRadius: radius.md, borderWidth: 1.5, padding: spacing.sm, gap: 2 },
  choice4: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  choice8: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
  choiceTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  choiceTitle4: { fontSize: 13, fontWeight: '700', color: '#1D4ED8' },
  choiceTitle8: { fontSize: 13, fontWeight: '700', color: '#B45309' },
  choicePrice: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  choiceSub: { fontSize: 11, fontWeight: '500', color: '#475569' },
  savePill: { backgroundColor: '#DC2626', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  savePillActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  savePillText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  slot: { minHeight: 48, justifyContent: 'center', padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  activeText: { fontSize: 13, fontWeight: '700', color: colors.white },
  activePrice: { fontSize: 15, fontWeight: '800', color: colors.white },
  activeSub: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.88)' },
  choiceText: { ...typography.bodyBold, color: colors.textPrimary },
  note: { ...typography.caption, color: colors.textSecondary }, error: { ...typography.body, color: colors.danger },
  button: { minHeight: 48, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  disabled: { opacity: 0.5 }, buttonText: { ...typography.bodyBold, color: colors.white },
});
