import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { AlertCircle, WifiOff, FileQuestion, Inbox } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { PrimaryButton, SecondaryButton } from './Buttons';

export interface FeedbackStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const LoadingSkeleton: React.FC<{
  count?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ count = 3, style }) => {
  return (
    <View style={[styles.skeletonContainer, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonLines}>
            <View style={[styles.skeletonLine, { width: '70%' }]} />
            <View style={[styles.skeletonLine, { width: '45%' }]} />
            <View style={[styles.skeletonLine, { width: '30%' }]} />
          </View>
        </View>
      ))}
      <View style={styles.loadingSpinnerRow}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={[typography.caption, styles.loadingText]}>
          Đang đồng bộ dữ liệu...
        </Text>
      </View>
    </View>
  );
};

export const EmptyState: React.FC<FeedbackStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.centeredContainer, style]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSubtle }]}>
        <Inbox size={32} color={colors.textSecondary} />
      </View>
      <Text style={[typography.title3, styles.stateTitle]}>{title}</Text>
      {description ? (
        <Text style={[typography.body, styles.stateDescription]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <SecondaryButton
          label={actionLabel}
          onPress={onAction}
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
};

export const ErrorState: React.FC<FeedbackStateProps> = ({
  title,
  description,
  actionLabel = 'Thử lại',
  onAction,
  style,
}) => {
  return (
    <View style={[styles.centeredContainer, style]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.dangerLight }]}>
        <AlertCircle size={32} color={colors.danger} />
      </View>
      <Text style={[typography.title3, styles.stateTitle]}>{title}</Text>
      {description ? (
        <Text style={[typography.body, styles.stateDescription]}>
          {description}
        </Text>
      ) : null}
      {onAction ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
};

export const OfflineState: React.FC<FeedbackStateProps> = ({
  title = 'Không có kết nối mạng',
  description = 'Vui lòng kiểm tra lại Wi-Fi hoặc dữ liệu di động của bạn để tiếp tục.',
  actionLabel = 'Kết nối lại',
  onAction,
  style,
}) => {
  return (
    <View style={[styles.centeredContainer, style]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.warningLight }]}>
        <WifiOff size={32} color={colors.warning} />
      </View>
      <Text style={[typography.title3, styles.stateTitle]}>{title}</Text>
      <Text style={[typography.body, styles.stateDescription]}>
        {description}
      </Text>
      {onAction ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
};

export const NotFoundErrorState: React.FC<FeedbackStateProps> = ({
  title = 'Không tìm thấy dữ liệu',
  description = 'Dữ liệu hoặc huấn luyện viên này không tồn tại hoặc đã được chuyển đi.',
  actionLabel = 'Quay về danh sách',
  onAction,
  style,
}) => {
  return (
    <View style={[styles.centeredContainer, style]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSubtle }]}>
        <FileQuestion size={32} color={colors.textSecondary} />
      </View>
      <Text style={[typography.title3, styles.stateTitle]}>{title}</Text>
      <Text style={[typography.body, styles.stateDescription]}>
        {description}
      </Text>
      {onAction ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stateTitle: {
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stateDescription: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  actionButton: {
    minWidth: 160,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skeletonAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSubtle,
    marginRight: spacing.md,
  },
  skeletonLines: {
    flex: 1,
    justifyContent: 'space-around',
  },
  skeletonLine: {
    height: 12,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xs,
  },
  loadingSpinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});
