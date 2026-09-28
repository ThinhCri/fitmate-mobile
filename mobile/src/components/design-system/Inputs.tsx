import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

export interface SearchInputProps extends TextInputProps {
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Tìm kiếm huấn luyện viên...',
  containerStyle,
  ...props
}) => {
  return (
    <View style={[styles.searchContainer, containerStyle]}>
      <Search size={20} color={colors.textMuted} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, typography.body]}
        returnKeyType="search"
        {...props}
      />
      {value && value.length > 0 ? (
        <TouchableOpacity
          onPress={onClear}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Xóa tìm kiếm"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      {label ? (
        <Text style={[styles.label, typography.captionMedium]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.fieldInput,
          typography.body,
          error ? styles.inputError : null,
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text style={[styles.errorText, typography.caption]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContainer: {
    marginVertical: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fieldInput: {
    minHeight: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
