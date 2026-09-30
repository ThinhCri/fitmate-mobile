import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  Flashlight,
  Grid,
  Lightbulb,
  Sun,
  Image as ImageIcon,
  Edit3,
  Camera,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { PrimaryButton, SecondaryButton } from '@/components/design-system/Buttons';

export interface CameraScanPresentationProps {
  onBack: () => void;
  onCapture: () => void;
  onPickGallery: () => void;
  onManualEntryPress: () => void;
  hasPermission?: boolean;
  onRequestPermission?: () => void;
  isAiAvailable?: boolean;
}

export const CameraScanPresentation: React.FC<CameraScanPresentationProps> = ({
  onBack,
  onCapture,
  onPickGallery,
  onManualEntryPress,
  hasPermission = true,
  onRequestPermission,
  isAiAvailable = true,
}) => {
  const [flashOn, setFlashOn] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconCircle}>
          <Camera size={36} color={colors.primary} />
        </View>
        <Text style={[typography.title2, styles.permissionTitle]}>Cần quyền truy cập máy ảnh</Text>
        <Text style={[typography.body, styles.permissionDesc]}>
          Fitmate cần quyền máy ảnh để nhận diện món ăn và ước tính dinh dưỡng tự động cho bạn.
        </Text>
        <PrimaryButton
          label="Cấp quyền máy ảnh"
          onPress={onRequestPermission ?? (() => {})}
          fullWidth
          style={{ marginTop: spacing.md }}
        />
        <SecondaryButton
          label="Nhập món thủ công thay thế"
          onPress={onManualEntryPress}
          fullWidth
          style={{ marginTop: spacing.sm }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Navigation Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={[typography.title3, styles.topBarTitle]}>Chụp ảnh món ăn</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Top Utility HUD */}
      <View style={styles.utilBar}>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={[typography.captionMedium, styles.statusText]}>
            {isAiAvailable ? 'AI Vision Ready' : 'AI Offline (Thủ công)'}
          </Text>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setFlashOn((prev) => !prev)}
            style={[styles.toolBtn, flashOn && styles.toolBtnActive]}
            accessibilityRole="button"
            accessibilityLabel="Bật tắt flash"
          >
            <Flashlight size={18} color={flashOn ? colors.primary : colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowGrid((prev) => !prev)}
            style={[styles.toolBtn, showGrid && styles.toolBtnActive]}
            accessibilityRole="button"
            accessibilityLabel="Bật tắt lưới căn chỉnh"
          >
            <Grid size={18} color={showGrid ? colors.primary : colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lighting Quality Banner */}
      <View style={styles.lightingBanner}>
        <Sun size={18} color={colors.success} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.captionMedium, styles.lightingTitle]}>
            Ánh sáng tốt • Đặt toàn bộ dĩa thức ăn vào khung
          </Text>
        </View>
      </View>

      {/* Camera Viewfinder Box (4:3 ratio) */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.viewfinderBox}>
          {/* Mock Camera Background Preview Feed */}
          <View style={styles.cameraPlaceholder}>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.6)' }]}>
              Khung ngắm máy ảnh trực tiếp
            </Text>
          </View>

          {/* Grid lines */}
          {showGrid ? (
            <View style={styles.gridOverlay}>
              <View style={styles.gridRow}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
              </View>
            </View>
          ) : null}

          {/* Reticle Focus Corners */}
          <View style={styles.reticleTopLeft} />
          <View style={styles.reticleTopRight} />
          <View style={styles.reticleBottomLeft} />
          <View style={styles.reticleBottomRight} />

          {/* Center Target */}
          <View style={styles.reticleCenter}>
            <View style={styles.reticlePing} />
            <View style={styles.reticleDot} />
          </View>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          onPress={onPickGallery}
          style={styles.galleryBtn}
          accessibilityRole="button"
          accessibilityLabel="Chọn ảnh từ thư viện"
        >
          <ImageIcon size={24} color={colors.white} />
          <Text style={[typography.caption, styles.btnLabel]}>Thư viện</Text>
        </TouchableOpacity>

        {/* Shutter Button */}
        <TouchableOpacity
          onPress={onCapture}
          style={styles.shutterOuter}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Chụp ảnh món ăn"
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onManualEntryPress}
          style={styles.galleryBtn}
          accessibilityRole="button"
          accessibilityLabel="Nhập món thủ công"
        >
          <Edit3 size={24} color={colors.white} />
          <Text style={[typography.caption, styles.btnLabel]}>Nhập tay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  permissionIconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  permissionDesc: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    minHeight: 48,
  },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    color: colors.white,
  },
  utilBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  statusText: {
    color: colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnActive: {
    backgroundColor: colors.white,
  },
  lightingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  lightingTitle: {
    color: colors.white,
  },
  viewfinderContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  viewfinderBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.3,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  reticleTopLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
    borderTopLeftRadius: 6,
  },
  reticleTopRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
    borderTopRightRadius: 6,
  },
  reticleBottomLeft: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 28,
    height: 28,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
    borderBottomLeftRadius: 6,
  },
  reticleBottomRight: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 28,
    height: 28,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  reticleCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticlePing: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(16,185,129,0.5)',
  },
  reticleDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  galleryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    gap: 4,
  },
  btnLabel: {
    color: colors.white,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.white,
  },
});
