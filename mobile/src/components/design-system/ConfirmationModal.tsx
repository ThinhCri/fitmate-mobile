import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme/designTokens';
import { DestructiveButton, PrimaryButton, SecondaryButton } from './Buttons';
import { ModalShell } from './ModalShell';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Tiếp tục chỉnh sửa',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const ConfirmButton = destructive ? DestructiveButton : SecondaryButton;

  return (
    <ModalShell visible={visible} onClose={onCancel} title={title}>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        <ConfirmButton label={confirmLabel} onPress={onConfirm} />
        <PrimaryButton label={cancelLabel} onPress={onCancel} />
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
});
