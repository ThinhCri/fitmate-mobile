/**
 * Input primitive — Material outlined (always-float label).
 *
 * Per design-system:
 *  - default border outline 1dp
 *  - focused border primary 2dp, label primary
 *  - error border error 2dp, label error
 *  - disabled bg surfaceContainerLow
 */
import { useState, type ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  rightIcon?: ReactNode; // alias for trailingIcon
  leftIcon?: ReactNode; // alias for leadingIcon
  disabled?: boolean;
}

export function Input({
  label,
  helperText,
  errorText,
  leadingIcon,
  trailingIcon,
  rightIcon,
  leftIcon,
  disabled,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const resolvedLeading = leadingIcon ?? leftIcon;
  const resolvedTrailing = trailingIcon ?? rightIcon;
  const [focused, setFocused] = useState(false);

  const hasError = !!errorText;
  let borderColor: string;
  let borderWidth = 1;
  let labelColor: string;

  if (disabled) {
    borderColor = resolveColor(theme, 'outlineVariant');
    labelColor = resolveColor(theme, 'onSurfaceDisabled');
  } else if (hasError) {
    borderColor = resolveColor(theme, 'error');
    borderWidth = 2;
    labelColor = resolveColor(theme, 'error');
  } else if (focused) {
    borderColor = resolveColor(theme, 'primary');
    borderWidth = 2;
    labelColor = resolveColor(theme, 'primary');
  } else {
    borderColor = resolveColor(theme, 'outline');
    labelColor = resolveColor(theme, 'onSurfaceVariant');
  }

  const bgColor = disabled
    ? resolveColor(theme, 'surfaceContainerLow')
    : resolveColor(theme, 'surfaceContainerLowest');

  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          borderColor,
          borderWidth,
          borderRadius: theme.tokens.radius.md,
          backgroundColor: bgColor,
          paddingHorizontal: 12,
          minHeight: 56,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          opacity: disabled ? theme.tokens.opacity.disabled : 1,
        }}
      >
        {resolvedLeading}
        <View style={{ flex: 1 }}>
          <Text style={{ color: labelColor, fontSize: 12, fontWeight: '600', marginBottom: 2 }}>{label}</Text>
          <TextInput
            editable={!disabled}
            placeholderTextColor={resolveColor(theme, 'onSurfaceDisabled')}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, padding: 0 }}
            {...rest}
          />
        </View>
        {resolvedTrailing}
      </View>
      {(errorText || helperText) && (
        <Text style={{ color: hasError ? resolveColor(theme, 'error') : resolveColor(theme, 'onSurfaceVariant'), fontSize: 12 }}>
          {errorText || helperText}
        </Text>
      )}
    </View>
  );
}
