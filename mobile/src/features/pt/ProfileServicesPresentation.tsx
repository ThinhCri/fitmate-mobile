import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  User as UserIcon,
  Camera,
  Check,
  Star,
  ShieldCheck,
  Dumbbell,
  Brain,
  Stethoscope,
  Clock,
  Info,
  Pencil,
  Sliders,
  PlusCircle,
  Shield,
  Trash2,
  X,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import type { Service, ServiceInput, ServiceUpdate, TrainerReviewViewModel } from '@/services/api/types';
import { PtReviewList } from '@/features/trainer/PtReviewList';

export interface ProfileServicesPresentationProps {
  ptName: string;
  avatarUrl: string | null;
  experienceYears: number | null;
  rating?: number;
  reviewsCount?: number;
  specialties: string[];
  bio: string;
  services: Service[];
  loading: boolean;
  error: string | null;
  meetConnected: boolean;
  meetBusy: boolean;
  onConnectMeet: () => void;
  onDisconnectMeet: () => void;
  onRefresh: () => void;
  onBack: () => void;
  onCreateService: (input: ServiceInput) => Promise<void>;
  onUpdateService: (id: string, input: ServiceUpdate) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  onUpdateBio?: (bio: string) => Promise<void>;
  onAvatarPress?: () => void;
  avatarUploading?: boolean;
  reviews?: TrainerReviewViewModel[];
}

export function ProfileServicesPresentation({
  ptName,
  avatarUrl,
  experienceYears,
  rating,
  reviewsCount,
  specialties,
  bio,
  services,
  loading,
  error,
  meetConnected,
  meetBusy,
  onConnectMeet,
  onDisconnectMeet,
  onRefresh,
  onBack,
  onCreateService,
  onUpdateService,
  onDeleteService,
  onUpdateBio,
  onAvatarPress,
  avatarUploading = false,
  reviews = [],
}: ProfileServicesPresentationProps) {
  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [bioSubmitting, setBioSubmitting] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});

  const openBioModal = () => {
    setBioInput(bio || '');
    setBioModalVisible(true);
  };

  const handleBioSubmit = async () => {
    if (!onUpdateBio) return;
    setBioSubmitting(true);
    try {
      await onUpdateBio(bioInput.trim());
      setBioModalVisible(false);
    } catch (err) {
      Alert.alert('Lỗi cập nhật', err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setBioSubmitting(false);
    }
  };

  // Form states
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [package4Price, setPackage4Price] = useState('');
  const [package8Price, setPackage8Price] = useState('');
  const [serviceDuration, setServiceDuration] = useState('60');
  const [serviceKind, setServiceKind] = useState<ServiceInput['service_kind']>('one_to_one');
  const [deliveryMode, setDeliveryMode] = useState<ServiceInput['delivery_mode']>('in_person');
  const [targetAudience, setTargetAudience] = useState('');
  const [requiredEquipment, setRequiredEquipment] = useState('');
  const [deliverable, setDeliverable] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeServicesCount = services.filter((s) => s.is_active).length;

  const openCreateModal = () => {
    setServiceName('');
    setServiceDescription('');
    setServicePrice('300000');
    setPackage4Price('');
    setPackage8Price('');
    setServiceDuration('60');
    setServiceKind('one_to_one');
    setDeliveryMode('in_person');
    setTargetAudience('');
    setRequiredEquipment('');
    setDeliverable('');
    setLocationName('');
    setLocationAddress('');
    setCreateModalVisible(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description || '');
    setServicePrice(service.price_vnd.toString());
    setPackage4Price(service.package_4_price_vnd ? String(service.package_4_price_vnd) : '');
    setPackage8Price(service.package_8_price_vnd ? String(service.package_8_price_vnd) : '');
    setServiceDuration(service.duration_minutes.toString());
    setServiceKind(service.service_kind ?? 'one_to_one');
    setDeliveryMode(service.delivery_mode ?? 'in_person');
    setTargetAudience(service.target_audience ?? '');
    setRequiredEquipment(service.required_equipment ?? '');
    setDeliverable(service.deliverable ?? '');
    setLocationName(service.location_name ?? '');
    setLocationAddress(service.location_address ?? '');
    setEditModalVisible(true);
  };

  const readPackagePrices = (singlePrice: number): { four: number; eight: number } | null => {
    const parse = (value: string) => value.trim() === '' ? 0 : Number(value.trim());
    const four = parse(package4Price);
    const eight = parse(package8Price);
    if (![four, eight].every(Number.isSafeInteger) || four < 0 || eight < 0 ||
        four > singlePrice * 4 || eight > singlePrice * 8) {
      Alert.alert('Giá gói không hợp lệ', 'Để trống nếu chưa mở bán. Giá gói phải lớn hơn 0 và không cao hơn tổng giá mua lẻ.');
      return null;
    }
    return { four, eight };
  };

  const handleCreateSubmit = async () => {
    const price = Number(servicePrice.trim());
    const packagePrices = readPackagePrices(price);
    const duration = parseInt(serviceDuration, 10);

    if (!serviceName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên gói dịch vụ');
      return;
    }
    if (!Number.isSafeInteger(price) || price < 0) {
      Alert.alert('Lỗi', 'Giá dịch vụ không hợp lệ');
      return;
    }
    if (!packagePrices) return;
    if (isNaN(duration) || duration < 15 || duration > 240) {
      Alert.alert('Lỗi', 'Thời lượng phải từ 15 đến 240 phút');
      return;
    }
    const details = buildDetails();
    if (!details) return;

    setSubmitting(true);
    try {
      await onCreateService({
        name: serviceName.trim(),
        description: serviceDescription.trim(),
        price_vnd: price,
        package_4_price_vnd: packagePrices.four,
        package_8_price_vnd: packagePrices.eight,
        duration_minutes: duration,
        ...details,
      });
      setCreateModalVisible(false);
    } catch (err) {
      Alert.alert('Lỗi tạo dịch vụ', err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingService) return;
    const price = Number(servicePrice.trim());
    const packagePrices = readPackagePrices(price);
    const duration = parseInt(serviceDuration, 10);

    if (!serviceName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên gói dịch vụ');
      return;
    }
    if (!Number.isSafeInteger(price) || price < 0) {
      Alert.alert('Lỗi', 'Giá dịch vụ không hợp lệ');
      return;
    }
    if (!packagePrices) return;
    if (isNaN(duration) || duration < 15 || duration > 240) {
      Alert.alert('Lỗi', 'Thời lượng phải từ 15 đến 240 phút');
      return;
    }
    const details = buildDetails();
    if (!details) return;

    setSubmitting(true);
    try {
      await onUpdateService(editingService.id, {
        name: serviceName.trim(),
        description: serviceDescription.trim(),
        price_vnd: price,
        package_4_price_vnd: packagePrices.four,
        package_8_price_vnd: packagePrices.eight,
        duration_minutes: duration,
        ...details,
      });
      setEditModalVisible(false);
      setEditingService(null);
    } catch (err) {
      Alert.alert('Lỗi cập nhật', err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const buildDetails = (): Pick<ServiceInput, 'service_kind' | 'delivery_mode' | 'target_audience' | 'required_equipment' | 'deliverable' | 'location_name' | 'location_address'> | null => {
    if (serviceDescription.trim().length < 20) {
      Alert.alert('Thiếu mô tả', 'Hãy mô tả cụ thể học viên sẽ làm gì trong buổi tập (ít nhất 20 ký tự).');
      return null;
    }
    if (!targetAudience.trim() || !requiredEquipment.trim() || !deliverable.trim()) {
      Alert.alert('Thiếu thông tin', 'Hãy ghi đối tượng phù hợp, dụng cụ cần chuẩn bị và kết quả học viên nhận được.');
      return null;
    }
    if (deliveryMode === 'in_person' && (!locationName.trim() || !locationAddress.trim())) {
      Alert.alert('Thiếu địa điểm', 'Buổi tập trực tiếp cần một tên và địa chỉ địa điểm cố định.');
      return null;
    }
    return {
      service_kind: serviceKind,
      delivery_mode: deliveryMode,
      target_audience: targetAudience.trim(),
      required_equipment: requiredEquipment.trim(),
      deliverable: deliverable.trim(),
      location_name: deliveryMode === 'in_person' ? locationName.trim() : undefined,
      location_address: deliveryMode === 'in_person' ? locationAddress.trim() : undefined,
    };
  };

  const handleToggleStatus = async (service: Service) => {
    if (togglingIds[service.id]) return;
    setTogglingIds((prev) => ({ ...prev, [service.id]: true }));
    try {
      await onUpdateService(service.id, {
        is_active: !service.is_active,
      });
    } catch (err) {
      Alert.alert('Không thể đổi trạng thái', err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setTogglingIds((prev) => ({ ...prev, [service.id]: false }));
    }
  };

  const handleDeleteConfirm = (service: Service) => {
    Alert.alert(
      'Xóa gói dịch vụ',
      `Bạn có chắc chắn muốn xóa "${service.name}"? Thao tác này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteService(service.id);
            } catch (err) {
              Alert.alert('Không thể xóa', err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
            }
          },
        },
      ]
    );
  };

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Gói Tập & Dịch Vụ</Text>
        <View style={styles.headerAvatar}>
          {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.headerAvatarImage} /> : <UserIcon size={18} color={colors.white} />}
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                {avatarUploading ? <ActivityIndicator size="small" color={colors.primary} /> : avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarImage} /> : <UserIcon size={32} color={colors.primary} />}
              </View>
              {onAvatarPress ? <Pressable onPress={onAvatarPress} disabled={avatarUploading} style={styles.avatarTapOverlay} accessibilityRole="button" accessibilityLabel="Cập nhật ảnh đại diện" /> : null}
              <View style={styles.onlineBadge}>
                {onAvatarPress ? <Camera size={10} color={colors.white} /> : <Check size={10} color={colors.white} />}
              </View>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.ptName}>{ptName}</Text>
              </View>
              <Text style={styles.expText}>
                {experienceYears !== null ? `${experienceYears} năm kinh nghiệm` : 'Chưa cập nhật kinh nghiệm'}
              </Text>
              <View style={styles.ratingRow}>
                {rating !== undefined && rating > 0 ? (
                  <>
                    <Star size={16} color={colors.warning} fill={colors.warning} />
                    <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.reviewsText}>
                      {reviewsCount !== undefined && reviewsCount > 0
                        ? `${reviewsCount} đánh giá`
                        : 'Chưa có đánh giá'}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.reviewsText}>Chưa có đánh giá</Text>
                )}
              </View>
            </View>
          </View>

          {/* Bento Stats Row */}
          <View style={styles.bentoRow}>
            <View style={styles.bentoItem}>
              <View style={styles.bentoIconPrimary}>
                <ShieldCheck size={18} color={colors.primary} />
              </View>
              <View style={styles.bentoTextCol}>
                <Text style={styles.bentoLabel}>Kinh nghiệm</Text>
                <Text style={styles.bentoValue}>{experienceYears !== null ? `${experienceYears} năm kinh nghiệm` : 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.bentoItem}>
              <View style={styles.bentoIconProtein}>
                <Dumbbell size={18} color={colors.primary} />
              </View>
              <View style={styles.bentoTextCol}>
                <Text style={styles.bentoLabel}>Gói đang chạy</Text>
                <Text style={styles.bentoValue}>{activeServicesCount} gói tích cực</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 1: Professional Bio & Specialties */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Brain size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Thông tin chuyên môn</Text>
            </View>
            <Pressable
              style={styles.editBioButton}
              onPress={openBioModal}
              accessibilityRole="button"
              accessibilityLabel="Chỉnh sửa tiểu sử"
            >
              <Pencil size={13} color={colors.white} style={{ marginRight: 5 }} />
              <Text style={styles.editBioText}>Chỉnh sửa</Text>
            </Pressable>
          </View>

          {/* Specialties Pills */}
          <View style={styles.specialtiesBlock}>
            <Text style={styles.blockSubHeader}>Chuyên môn mũi nhọn</Text>
            {specialties.length > 0 ? (
              <View style={styles.pillsRow}>
                {specialties.map((spec, index) => (
                  <View key={index} style={styles.pillBadge}>
                    <Stethoscope size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.pillText}>{spec}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptySpecialtyText}>Chưa cập nhật chuyên môn</Text>
            )}
          </View>

          {/* Bio Box - Clickable with Clear Edit Affordance */}
          <Pressable
            style={({ pressed }) => [
              styles.bioContainer,
              pressed && { opacity: 0.85, borderColor: colors.primary },
            ]}
            onPress={openBioModal}
            accessibilityRole="button"
            accessibilityLabel="Chạm để chỉnh sửa tiểu sử huấn luyện viên"
          >
            <View style={styles.bioHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.bioLabel}>Tiểu sử hiển thị cho học viên</Text>
                <Pencil size={12} color={colors.primary} />
              </View>
              <Text style={styles.bioPublicStatus}>Công khai • Chạm để sửa</Text>
            </View>
            <Text style={[styles.bioText, !bio && styles.bioTextEmpty]}>
              {bio ? `“${bio}”` : 'Chưa cập nhật tiểu sử. Chạm vào đây để viết lời giới thiệu thu hút học viên... ✎'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Google Meet cho buổi tập online</Text>
          <Text style={styles.serviceDescription}>
            {meetConnected
              ? 'Đã kết nối. Fitmate tạo link riêng khi học viên giữ chỗ; chỉ hai bên thấy link sau thanh toán.'
              : 'Kết nối tài khoản Google của bạn trước khi mở bán dịch vụ online. Dịch vụ trực tiếp không cần bước này.'}
          </Text>
          <Pressable
            style={styles.addServiceButton}
            disabled={meetBusy}
            onPress={meetConnected ? onDisconnectMeet : onConnectMeet}
            accessibilityRole="button"
          >
            <Text style={styles.addServiceButtonText}>
              {meetBusy ? 'Đang xử lý...' : meetConnected ? 'Ngắt kết nối' : 'Kết nối Google Meet'}
            </Text>
          </Pressable>
          <Pressable onPress={onRefresh} accessibilityRole="button">
            <Text style={styles.editBioText}>Kiểm tra lại trạng thái kết nối</Text>
          </Pressable>
        </View>

        {/* Section 2: Services List */}
        <View style={styles.servicesHeaderRow}>
          <View style={styles.sectionTitleWithIcon}>
            <Dumbbell size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Gói dịch vụ huấn luyện</Text>
          </View>
          <View style={styles.activeCountBadge}>
            <Text style={styles.activeCountText}>{activeServicesCount} đang hoạt động</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingSubtext}>Đang tải danh sách dịch vụ...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Dumbbell size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có gói dịch vụ nào</Text>
            <Text style={styles.emptySubtitle}>
              Tạo gói dịch vụ đầu tiên để học viên có thể đăng ký lịch tập cùng bạn.
            </Text>
          </View>
        ) : (
          services.map((item) => (
            <View key={item.id} style={styles.serviceCard}>
              <View style={styles.serviceCardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.serviceTitleRow}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        item.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          item.is_active ? styles.statusTextActive : styles.statusTextInactive,
                        ]}
                      >
                        {item.is_active ? 'Đang nhận khách' : (item.delivery_mode === 'online' && !meetConnected ? 'Chưa kết nối Meet' : 'Tạm ngưng')}
                      </Text>
                    </View>
                  </View>
                  {item.description ? (
                    <Text style={styles.serviceDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  <Text style={styles.serviceDescription}>
                    {item.service_kind === 'assessment_and_plan' ? 'Đánh giá & lập kế hoạch' : 'Buổi tập 1–1'} · {item.delivery_mode === 'online' ? 'Trực tuyến' : 'Trực tiếp'}
                  </Text>
                  {!!item.target_audience && <Text style={styles.serviceDescription}>Phù hợp: {item.target_audience}</Text>}
                  {!!item.required_equipment && <Text style={styles.serviceDescription}>Cần chuẩn bị: {item.required_equipment}</Text>}
                  {!!item.deliverable && <Text style={styles.serviceDescription}>Nhận được: {item.deliverable}</Text>}
                  {!!item.location_name && <Text style={styles.serviceDescription}>Địa điểm: {item.location_name} — {item.location_address}</Text>}
                </View>
                <Switch
                  value={item.is_active}
                  disabled={Boolean(togglingIds[item.id]) || (item.delivery_mode === 'online' && !meetConnected)}
                  onValueChange={() => handleToggleStatus(item)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>

              {/* Price & Duration */}
              <View style={styles.priceDurationRow}>
                <View style={styles.priceCol}>
                  <Text style={styles.priceValue}>{formatVnd(item.price_vnd)}</Text>
                  <Text style={styles.priceUnit}> đ / buổi</Text>
                </View>
                <View style={styles.durationCol}>
                  <Clock size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.durationText}>{item.duration_minutes} phút chuẩn</Text>
                </View>
              </View>

              <Text style={styles.serviceDescription}>Gói 4 buổi: {item.package_4_price_vnd > 0 ? `${formatVnd(item.package_4_price_vnd)} đ` : 'Chưa mở bán'}</Text>
              <Text style={styles.serviceDescription}>Gói 8 buổi: {item.package_8_price_vnd > 0 ? `${formatVnd(item.package_8_price_vnd)} đ` : 'Chưa mở bán'}</Text>

              {/* Snapshot Note */}
              <View style={styles.snapshotNote}>
                <Info size={14} color={colors.textMuted} style={{ marginRight: 6, marginTop: 2 }} />
                <Text style={styles.snapshotText}>
                  Giá áp dụng cho các buổi đặt mới, không sửa snapshot booking cũ đã chốt.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActionsRow}>
                <Pressable
                  style={styles.editServiceButton}
                  onPress={() => openEditModal(item)}
                >
                  <Sliders size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.editServiceText}>Chỉnh sửa</Text>
                </Pressable>
                <Pressable
                  style={styles.deleteServiceButton}
                  onPress={() => handleDeleteConfirm(item)}
                >
                  <Trash2 size={16} color={colors.danger} style={{ marginRight: 6 }} />
                  <Text style={styles.deleteServiceText}>Xóa</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        {/* Add Service Button */}
        <Pressable
          style={styles.addServiceButton}
          onPress={openCreateModal}
          accessibilityRole="button"
          accessibilityLabel="Thêm gói dịch vụ mới"
        >
          <PlusCircle size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.addServiceButtonText}>+ Thêm gói dịch vụ mới</Text>
        </Pressable>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Star size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Đánh giá từ học viên ({reviews.length})</Text>
            </View>
          </View>
          <PtReviewList reviews={reviews} />
        </View>

        {/* System Safety Notice */}
        <View style={styles.safetyNoticeBox}>
          <Shield size={22} color={colors.warning} style={{ marginRight: 10, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.safetyNoticeTitle}>Quy chuẩn vận hành dịch vụ</Text>
            <Text style={styles.safetyNoticeContent}>
              Mọi gói dịch vụ hiển thị công khai trên ứng dụng cần tuân thủ thời lượng chuẩn tối thiểu 15 phút. Khi xóa gói, lịch hẹn của học viên đã thanh toán vẫn được bảo lưu trọn vẹn theo hợp đồng.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Create / Edit Service Modal with Keyboard Avoiding */}
      <Modal
        visible={createModalVisible || editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setCreateModalVisible(false);
          setEditModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {createModalVisible ? 'Thêm gói dịch vụ mới' : 'Chỉnh sửa dịch vụ'}
              </Text>
              <Pressable
                onPress={() => {
                  setCreateModalVisible(false);
                  setEditModalVisible(false);
                }}
                style={styles.closeModalButton}
              >
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Tên gói dịch vụ <Text style={{ color: colors.danger }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={serviceName}
                  onChangeText={setServiceName}
                  placeholder="Ví dụ: Tập sức mạnh cá nhân 1-kèm-1"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mô tả chi tiết</Text>
                <TextInput
                  style={[styles.textInput, { height: 72, textAlignVertical: 'top' }]}
                  value={serviceDescription}
                  onChangeText={setServiceDescription}
                  placeholder="Địa điểm tập, phương pháp hoặc lưu ý cho học viên..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Loại dịch vụ *</Text>
                <View style={styles.formRow}>
                  <Pressable style={[styles.choiceButton, serviceKind === 'one_to_one' && styles.choiceSelected]} onPress={() => setServiceKind('one_to_one')}>
                    <Text>Buổi tập 1–1</Text>
                  </Pressable>
                  <Pressable style={[styles.choiceButton, serviceKind === 'assessment_and_plan' && styles.choiceSelected]} onPress={() => setServiceKind('assessment_and_plan')}>
                    <Text>Đánh giá & lập kế hoạch</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hình thức *</Text>
                <View style={styles.formRow}>
                  <Pressable style={[styles.choiceButton, deliveryMode === 'in_person' && styles.choiceSelected]} onPress={() => setDeliveryMode('in_person')}>
                    <Text>Trực tiếp</Text>
                  </Pressable>
                  <Pressable style={[styles.choiceButton, deliveryMode === 'online' && styles.choiceSelected]} onPress={() => setDeliveryMode('online')}>
                    <Text>Online</Text>
                  </Pressable>
                </View>
                {deliveryMode === 'online' && <Text style={styles.serviceDescription}>{meetConnected ? 'Link Google Meet sẽ được tạo riêng cho từng buổi khi học viên giữ chỗ.' : 'Hãy kết nối Google Meet trước khi bật dịch vụ online.'}</Text>}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phù hợp với ai? *</Text>
                <TextInput style={styles.textInput} value={targetAudience} onChangeText={setTargetAudience} placeholder="Ví dụ: người mới tập muốn tăng sức mạnh" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cần chuẩn bị dụng cụ gì? *</Text>
                <TextInput style={styles.textInput} value={requiredEquipment} onChangeText={setRequiredEquipment} placeholder="Ví dụ: giày tập; không cần dụng cụ khác" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Học viên sẽ nhận được gì? *</Text>
                <TextInput style={styles.textInput} value={deliverable} onChangeText={setDeliverable} placeholder="Ví dụ: hướng dẫn kỹ thuật và kế hoạch 4 tuần" placeholderTextColor={colors.textMuted} />
              </View>
              {deliveryMode === 'in_person' && <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tên địa điểm cố định *</Text>
                  <TextInput style={styles.textInput} value={locationName} onChangeText={setLocationName} placeholder="Ví dụ: Fit Gym Quận 1" placeholderTextColor={colors.textMuted} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Địa chỉ đầy đủ *</Text>
                  <TextInput style={styles.textInput} value={locationAddress} onChangeText={setLocationAddress} placeholder="Số nhà, đường, phường, quận, thành phố" placeholderTextColor={colors.textMuted} />
                </View>
              </>}

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: spacing.sm }]}>
                  <Text style={styles.formLabel}>
                    Giá buổi tập (VNĐ) <Text style={{ color: colors.danger }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={servicePrice}
                    onChangeText={setServicePrice}
                    placeholder="300000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>
                    Thời lượng (phút) <Text style={{ color: colors.danger }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={serviceDuration}
                    onChangeText={setServiceDuration}
                    placeholder="60"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.serviceDescription}>Giá gói 4/8 buổi do bạn đặt. Để trống để chưa mở bán; giá gói không được cao hơn mua lẻ. Hội viên chọn đủ lịch trước khi trả tiền.</Text>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giá trọn gói 4 buổi (VNĐ)</Text>
                <TextInput style={styles.textInput} value={package4Price} onChangeText={setPackage4Price}
                  placeholder="Chưa mở bán" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giá trọn gói 8 buổi (VNĐ)</Text>
                <TextInput style={styles.textInput} value={package8Price} onChangeText={setPackage8Price}
                  placeholder="Chưa mở bán" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.cancelModalButton}
                  onPress={() => {
                    setCreateModalVisible(false);
                    setEditModalVisible(false);
                  }}
                  disabled={submitting}
                >
                  <Text style={styles.cancelModalText}>Hủy</Text>
                </Pressable>

                <Pressable
                  style={styles.submitModalButton}
                  onPress={createModalVisible ? handleCreateSubmit : handleEditSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.submitModalText}>
                      {createModalVisible ? 'Tạo gói' : 'Lưu thay đổi'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Bio Modal with Keyboard Avoiding */}
      <Modal
        visible={bioModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBioModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa tiểu sử HLV</Text>
              <Pressable
                onPress={() => setBioModalVisible(false)}
                disabled={bioSubmitting}
                style={styles.closeModalButton}
              >
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={{ paddingVertical: spacing.sm }}>
              <Text style={styles.formLabel}>Tiểu sử hiển thị cho học viên</Text>
              <TextInput
                style={[styles.textInput, { height: 110, textAlignVertical: 'top' }]}
                value={bioInput}
                onChangeText={setBioInput}
                placeholder="Giới thiệu bản thân, phong cách huấn luyện, triết lý tập luyện..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={5}
                maxLength={500}
              />
              <Text style={[styles.serviceDescription, { textAlign: 'right', marginTop: 4 }]}>
                {bioInput.length}/500 ký tự
              </Text>

              <View style={[styles.modalActions, { marginTop: spacing.md }]}>
                <Pressable
                  style={styles.cancelModalButton}
                  onPress={() => setBioModalVisible(false)}
                  disabled={bioSubmitting}
                >
                  <Text style={styles.cancelModalText}>Hủy</Text>
                </Pressable>

                <Pressable
                  style={styles.submitModalButton}
                  onPress={handleBioSubmit}
                  disabled={bioSubmitting}
                >
                  {bioSubmitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.submitModalText}>Lưu thay đổi</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 48,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
  },
  avatarTapOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.full,
    zIndex: 1,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ptName: {
    ...typography.title2,
    color: colors.textPrimary,
    marginRight: spacing.xs,
  },
  expText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  dotSeparator: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: 6,
  },
  reviewsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bentoRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  bentoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
  },
  bentoIconPrimary: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  bentoIconProtein: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  bentoTextCol: {
    flex: 1,
  },
  bentoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bentoValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  editBioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  editBioText: {
    ...typography.captionMedium,
    color: colors.white,
    fontWeight: '700',
  },
  specialtiesBlock: {
    marginBottom: spacing.md,
  },
  blockSubHeader: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  pillText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  bioContainer: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bioLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  bioPublicStatus: {
    ...typography.caption,
    color: colors.primary,
  },
  bioText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bioTextEmpty: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  emptySpecialtyText: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  activeCountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
  },
  activeCountText: {
    ...typography.captionMedium,
    color: colors.success,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    padding: spacing.lg,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
  },
  retryButtonText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  emptyContainer: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  serviceCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  serviceName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusBadgeActive: {
    backgroundColor: colors.successLight,
  },
  statusBadgeInactive: {
    backgroundColor: colors.border,
  },
  statusBadgeText: {
    ...typography.captionMedium,
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextInactive: {
    color: colors.textSecondary,
  },
  serviceDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  priceDurationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    marginBottom: spacing.sm,
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 28,
    color: colors.primary,
  },
  priceUnit: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  durationCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  snapshotNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    marginBottom: spacing.md,
  },
  snapshotText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editServiceButton: {
    flex: 1,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editServiceText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  deleteServiceButton: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerLight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteServiceText: {
    ...typography.bodyMedium,
    color: colors.danger,
  },
  addServiceButton: {
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addServiceButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  safetyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.warningLight,
  },
  safetyNoticeTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  safetyNoticeContent: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  closeModalButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
  },
  choiceButton: {
    flex: 1,
    minHeight: 44,
    marginRight: spacing.xs,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  choiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  formLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelModalButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  submitModalButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitModalText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
