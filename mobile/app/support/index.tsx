import { colors } from '@/theme/designTokens';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  SupportTicketsPresentation,
  SupportTicketSummaryViewModel,
} from '@/features/support';
import { getSupportRepository } from '@/repositories/supportRepository';

export default function SupportTicketsScreen() {
  const [tickets, setTickets] = useState<SupportTicketSummaryViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupportRepository()
      .getTickets()
      .then((data) => {
        setTickets(data);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || 'Không thể tải danh sách phiếu hỗ trợ');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SupportTicketsPresentation
        tickets={tickets}
        onBack={() => router.back()}
        onSelectTicket={(ticketId) => router.push(`/support/${ticketId}` as any)}
        onCreateTicketPress={() => router.push('/support/create' as any)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
  },
});
