import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ConfirmHoldPresentation } from '../../src/features/booking/ConfirmHoldPresentation';
import { BookingHoldQuoteViewModel } from '../../src/features/booking/bookingTypes';

const MOCK_QUOTE: BookingHoldQuoteViewModel = {
  bookingId: 'bk-hold-8921',
  coach: {
    id: 'coach-1',
    name: 'HLV Hoàng Nam',
    title: 'NASM-CPT',
    specialty: 'Tập sức mạnh cá nhân 1-kèm-1',
    rating: 4.95,
    reviewCount: 120,
    isVerified: true,
  },
  service: {
    id: 'srv-1',
    name: 'Tập sức mạnh cá nhân 1-kèm-1',
    durationMinutes: 60,
    priceVnd: 300000,
    description: 'Tập trung kỹ thuật tạ đòn, sửa tư thế.',
    locationName: 'Fitmate Gym Thảo Điền',
    locationAddress: 'P. Thảo Điền, TP. Thủ Đức',
  },
  selectedDate: 'Thứ Hai, 28/09/2026',
  selectedTimeSlot: '18:00 - 19:00',
  location: 'Fitmate Gym Thảo Điền (P. Thảo Điền, TP. Thủ Đức)',
  servicePriceVnd: 300000,
  platformFeeVnd: 0,
  totalVnd: 300000,
  holdExpiresAt: '2026-09-28T18:10:00Z',
  remainingSeconds: 582, // 09:42
};

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate gateway handoff
    setTimeout(() => {
      setIsProcessing(false);
      router.replace('/booking/payment-return' as any);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <ConfirmHoldPresentation
        quote={MOCK_QUOTE}
        isProcessing={isProcessing}
        onPayPayOS={handlePay}
        onCancelHold={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
