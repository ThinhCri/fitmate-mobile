import React, { useEffect, useState, useCallback } from 'react';
import { AppState, Alert, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/services/AuthContext';
import { ptService } from '@/services/api/ptService';
import { trainersService } from '@/services/api/trainersService';
import { getAccountRepository } from '@/repositories/accountRepository';
import { ImagePickerService } from '@/services/imagePicker';
import { resolveOptionalApiResourceUrl } from '@/services/api/resourceUrl';
import {
  mapReviewToViewModel,
  type PTPublicDetail,
  type Service,
  type ServiceInput,
  type ServiceUpdate,
  type TrainerReviewViewModel,
} from '@/services/api/types';
import { ProfileServicesPresentation } from '@/features/pt/ProfileServicesPresentation';

export default function ProfileServicesRoute() {
  const router = useRouter();
  const { user, refresh } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [trainerDetail, setTrainerDetail] = useState<PTPublicDetail | null>(null);
  const [ptProfile, setPtProfile] = useState<{
    bio?: string | null;
    specialty?: string | null;
    experience_years?: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetConnected, setMeetConnected] = useState(false);
  const [meetBusy, setMeetBusy] = useState(false);
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [reviews, setReviews] = useState<TrainerReviewViewModel[]>([]);
  const [reviewStats, setReviewStats] = useState<{ rating: number; total: number } | null>(null);

  const fetchMeetConnection = useCallback(async () => {
    try {
      setMeetConnected((await ptService.getGoogleMeetConnection()).connected);
    } catch {
      setMeetConnected(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ptService.getMyServices(true);
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

  const fetchTrainerDetail = useCallback(async () => {
    try {
      const myPt = await ptService.getMyPtProfile();
      setPtProfile(myPt);
    } catch {
      // ignore
    }
    const userId = (user as { id?: string })?.id;
    if (!userId) return;
    const [detailRes, reviewsRes] = await Promise.allSettled([
      trainersService.getTrainer(userId),
      trainersService.getTrainerReviews(userId, 20),
    ]);
    setTrainerDetail(detailRes.status === 'fulfilled' ? detailRes.value : null);
    if (reviewsRes.status === 'fulfilled') {
      setReviews((reviewsRes.value.reviews || []).map(mapReviewToViewModel));
      setReviewStats({ rating: reviewsRes.value.average_rating, total: reviewsRes.value.total_reviews });
    } else if (detailRes.status === 'fulfilled' && detailRes.value.reviews) {
      setReviews(detailRes.value.reviews.map(mapReviewToViewModel));
      setReviewStats({ rating: detailRes.value.rating, total: detailRes.value.reviews_count });
    }
  }, [user]);

  useEffect(() => {
    fetchServices();
    fetchTrainerDetail();
    fetchMeetConnection();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void fetchMeetConnection();
    });
    return () => subscription.remove();
  }, [fetchServices, fetchTrainerDetail, fetchMeetConnection]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void fetchTrainerDetail();
    }, [refresh, fetchTrainerDetail])
  );

  const handleConnectMeet = async () => {
    setMeetBusy(true);
    try {
      const { authorization_url } = await ptService.startGoogleMeetConnection();
      await Linking.openURL(authorization_url);
    } catch (err) {
      Alert.alert('Không thể kết nối Google Meet', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setMeetBusy(false);
    }
  };

  const handleDisconnectMeet = () => Alert.alert('Ngắt kết nối Google Meet?',
    'Dịch vụ online sẽ ngừng nhận lịch mới. Lịch đã thanh toán vẫn được giữ.', [
      { text: 'Để sau', style: 'cancel' },
      { text: 'Ngắt kết nối', style: 'destructive', onPress: async () => {
        setMeetBusy(true);
        try {
          await ptService.disconnectGoogleMeet();
          setMeetConnected(false);
          await fetchServices();
        } catch (err) {
          Alert.alert('Không thể ngắt kết nối', err instanceof Error ? err.message : 'Vui lòng thử lại.');
        } finally {
          setMeetBusy(false);
        }
      } },
    ]);

  const handleCreateService = async (input: ServiceInput) => {
    const created = await ptService.createService(input);
    setServices((prev) => [...prev, created]);
  };

  const handleUpdateService = async (id: string, input: ServiceUpdate) => {
    const previous = services;
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...input } : s)));
    try {
      const updated = await ptService.updateService(id, input);
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      setServices(previous);
      throw err;
    }
  };

  const handleDeleteService = async (id: string) => {
    await ptService.deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateBio = async (newBio: string) => {
    await ptService.updatePtProfile({ bio: newBio });
    setPtProfile((prev) => (prev ? { ...prev, bio: newBio } : { bio: newBio }));
  };

  const handleAvatarUpload = async (source: 'camera' | 'library') => {
    if (avatarUploading) return;
    const image = source === 'camera'
      ? await ImagePickerService.pickFromCamera({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePickerService.pickFromLibrary({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!image) return;

    setAvatarUploading(true);
    try {
      const repo = getAccountRepository();
      const uploaded = await repo.updateAvatar(image);
      const attachedUrl = await repo.attachAvatar(uploaded.storageKey);
      setAvatarOverride(attachedUrl);
      await Promise.all([refresh(), fetchTrainerDetail()]);
      Alert.alert('Thành công', 'Ảnh đại diện PT đã được cập nhật.');
    } catch (err) {
      Alert.alert('Không thể cập nhật ảnh đại diện', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarPress = () => {
    Alert.alert('Cập nhật ảnh đại diện PT', 'Chọn nguồn ảnh', [
      { text: 'Chụp ảnh', onPress: () => { void handleAvatarUpload('camera'); } },
      { text: 'Chọn từ thư viện', onPress: () => { void handleAvatarUpload('library'); } },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const ptName = user?.profile?.name || 'Huấn luyện viên';
  const experienceYears = ptProfile?.experience_years ?? trainerDetail?.experience_years ?? user?.profile?.exp ?? null;
  const rating = reviewStats?.rating ?? trainerDetail?.rating;
  const reviewsCount = reviewStats?.total ?? trainerDetail?.reviews_count;
  const specialties = ptProfile?.specialty ? [ptProfile.specialty] : (user?.profile?.spec || []);
  const bio = ptProfile?.bio ?? trainerDetail?.bio ?? user?.profile?.bio ?? '';

  return (
    <ProfileServicesPresentation
      ptName={ptName}
      avatarUrl={avatarOverride ?? resolveOptionalApiResourceUrl(trainerDetail?.avatar_url) ?? user?.profile?.avatar ?? null}
      onAvatarPress={handleAvatarPress}
      avatarUploading={avatarUploading}
      experienceYears={experienceYears}
      rating={rating}
      reviewsCount={reviewsCount}
      reviews={reviews}
      specialties={specialties}
      bio={bio}
      services={services}
      loading={loading}
      error={error}
      meetConnected={meetConnected}
      meetBusy={meetBusy}
      onConnectMeet={handleConnectMeet}
      onDisconnectMeet={handleDisconnectMeet}
      onRefresh={() => {
        fetchServices();
        fetchTrainerDetail();
        fetchMeetConnection();
      }}
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
