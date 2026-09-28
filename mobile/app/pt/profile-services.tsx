import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/services/AuthContext';
import { ptService } from '@/services/api/ptService';
import type { Service, ServiceInput, ServiceUpdate } from '@/services/api/types';
import { ProfileServicesPresentation } from '@/features/pt/ProfileServicesPresentation';

export default function ProfileServicesRoute() {
  const router = useRouter();
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ptService.getMyServices();
      setServices(data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải danh sách dịch vụ. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCreateService = async (input: ServiceInput) => {
    const created = await ptService.createService(input);
    setServices((prev) => [...prev, created]);
  };

  const handleUpdateService = async (id: string, input: ServiceUpdate) => {
    const updated = await ptService.updateService(id, input);
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const handleDeleteService = async (id: string) => {
    await ptService.deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateBio = async (bioText: string) => {
    // Updates profile on server
    await ptService.updateMyProfile({
      fitness_goal: bioText,
    });
  };

  const ptName = user?.profile?.name || 'Huấn luyện viên';
  const experienceYears = user?.profile?.exp || 0;
  const rating = 4.9; // Default display score
  const reviewsCount = user?.reviews?.length || 0;
  const specialties = user?.profile?.spec || [];
  const bio = user?.profile?.goal || user?.profile?.bio || '';

  return (
    <ProfileServicesPresentation
      ptName={ptName}
      avatarUrl={user?.profile?.avatar || null}
      experienceYears={experienceYears}
      rating={rating}
      reviewsCount={reviewsCount}
      specialties={specialties}
      bio={bio}
      services={services}
      loading={loading}
      error={error}
      onRefresh={fetchServices}
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/dashboard');
        }
      }}
      onCreateService={handleCreateService}
      onUpdateService={handleUpdateService}
      onDeleteService={handleDeleteService}
      onUpdateBio={handleUpdateBio}
    />
  );
}
