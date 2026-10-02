import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ptService, SubmitCertificateInput } from '@/services/api/ptService';
import type { PtCertificate } from '@/services/api/types';
import { CertificatesPresentation } from '@/features/pt/CertificatesPresentation';
import { useAuth } from '@/services/AuthContext';

export default function CertificatesRoute() {
  const router = useRouter();
  const { user, logout, setUser } = useAuth();

  const [certificates, setCertificates] = useState<PtCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ptService.getMyCertificates();
      const items = data?.items || [];
      setCertificates(items);
      const hasApproved = items.some((item) => ['approved', '1'].includes(String(item.status).toLowerCase()));
      if (hasApproved && user) setUser({ ...user, ptVerificationStatus: 'approved' });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải danh sách chứng chỉ. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  }, [setUser, user]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleSubmitCertificate = async (data: SubmitCertificateInput) => {
    setSubmitting(true);
    try {
      const created = await ptService.submitCertificate(data);
      setCertificates((prev) => [created, ...prev]);
      if (user) setUser({ ...user, ptVerificationStatus: 'pendingreview' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CertificatesPresentation
      certificates={certificates}
      loading={loading}
      submitting={submitting}
      error={error}
      onRefresh={fetchCertificates}
      onBack={() => {
        if (user?.role === 'pt' && user.ptVerificationStatus !== 'approved') {
          void logout().then(() => router.replace('/(auth)/login'));
          return;
        }
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/dashboard');
        }
      }}
      onSubmitCertificate={handleSubmitCertificate}
      verificationStatus={user?.ptVerificationStatus}
    />
  );
}
