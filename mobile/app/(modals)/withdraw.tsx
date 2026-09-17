/**
 * WithdrawSheet (MOB-120, FP-031).
 * Voucher tab (4 voucher cung dinh) + Withdraw tab (bank/account/name/amount).
 * Validation: amount >= 50, amount <= rewardPoints.
 */
import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Gift, CreditCard } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import * as mockUserService from '@/services/mockUserService';
import { Card, Button, Input, Chip } from '@/components/ui';
import { ToastService } from '@/components/ui/Toast';
import { formatVnd } from '@/utils/format';

const VOUCHERS = [
  { id: 'v1', cost: 50, label: 'Voucher 50k', value: 50000 },
  { id: 'v2', cost: 100, label: 'Voucher 100k', value: 100000 },
  { id: 'v3', cost: 200, label: 'Voucher 200k', value: 200000 },
  { id: 'v4', cost: 500, label: 'Voucher 500k', value: 500000 },
];

type Segment = 'voucher' | 'withdraw';

export default function WithdrawSheet() {
  const { user, refresh } = useAuth();
  const theme = useTheme();
  const [segment, setSegment] = useState<Segment>('voucher');

  // Withdraw form
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');

  if (!user) return null;
  const value = user.rewardPoints * 1000;

  const redeemVoucher = async (voucherId: string, cost: number) => {
    if (user.rewardPoints < cost) {
      Alert.alert('Không đủ điểm', `Bạn cần ${cost} điểm để đổi voucher này.`);
      return;
    }
    await mockUserService.saveUser({ ...user, rewardPoints: user.rewardPoints - cost });
    await refresh();
    ToastService.show({ message: `Đã đổi ${cost} điểm → voucher!`, tone: 'success' });
  };

  const submitWithdraw = async () => {
    const numAmount = parseInt(amount, 10);
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin ngân hàng.');
      return;
    }
    if (isNaN(numAmount) || numAmount < 50) {
      Alert.alert('Số điểm không hợp lệ', 'Tối thiểu 50 điểm để rút.');
      return;
    }
    if (numAmount > user.rewardPoints) {
      Alert.alert('Vượt quá số dư', `Bạn chỉ có ${user.rewardPoints} điểm.`);
      return;
    }
    await mockUserService.saveUser({ ...user, rewardPoints: user.rewardPoints - numAmount });
    await refresh();
    ToastService.show({ message: `Đã gửi yêu cầu rút ${numAmount} điểm!`, tone: 'success' });
    setBankName(''); setAccountNumber(''); setAccountName(''); setAmount('');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: resolveColor(theme, 'surface') }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={resolveColor(theme, 'onSurface')} size={24} />
        </Pressable>
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 18, fontWeight: '700' }}>Rút thưởng</Text>
      </View>

      <View style={{ padding: 16, gap: 12 }}>
        <Card variant="default">
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>Điểm hiện có</Text>
          <Text style={{ color: resolveColor(theme, 'success'), fontSize: 32, fontWeight: '800' }}>
            {user.rewardPoints} điểm
          </Text>
          <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginTop: 4 }}>
            Tương đương {formatVnd(value)}
          </Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Voucher" selected={segment === 'voucher'} onPress={() => setSegment('voucher')} iconLeft={<Gift size={14} color={resolveColor(theme, segment === 'voucher' ? 'onPrimaryContainer' : 'onSurface')} />} />
          <Chip label="Rút tiền" selected={segment === 'withdraw'} onPress={() => setSegment('withdraw')} iconLeft={<CreditCard size={14} color={resolveColor(theme, segment === 'withdraw' ? 'onPrimaryContainer' : 'onSurface')} />} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {segment === 'voucher' && VOUCHERS.map((v) => (
          <Card key={v.id} variant="default">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: resolveColor(theme, 'secondaryContainer'), alignItems: 'center', justifyContent: 'center' }}>
                <Gift color={resolveColor(theme, 'onSecondaryContainer')} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 14, fontWeight: '700' }}>{v.label}</Text>
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>{v.cost} điểm</Text>
              </View>
              <Button label="Đổi ngay" variant="primary" size="sm" onPress={() => redeemVoucher(v.id, v.cost)} />
            </View>
          </Card>
        ))}

        {segment === 'withdraw' && (
          <Card variant="default">
            <View style={{ gap: 12 }}>
              <Input label="Tên ngân hàng" value={bankName} onChangeText={setBankName} placeholder="VD: Vietcombank" />
              <Input label="Số tài khoản" value={accountNumber} onChangeText={setAccountNumber} placeholder="VD: 1234567890" keyboardType="numeric" />
              <Input label="Chủ tài khoản" value={accountName} onChangeText={setAccountName} placeholder="VD: NGUYEN VAN A" autoCapitalize="characters" />
              <Input label="Số điểm muốn rút (tối thiểu 50)" value={amount} onChangeText={setAmount} placeholder="VD: 100" keyboardType="numeric" />
              <Button label="Gửi yêu cầu rút" variant="primary" fullWidth onPress={submitWithdraw} />
              <Text style={{ color: resolveColor(theme, 'onSurfaceDisabled'), fontSize: 11, textAlign: 'center' }}>
                Đây là mô phỏng demo, không có giao dịch thật.
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
