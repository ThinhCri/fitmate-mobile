/**
 * AvatarPicker — FP-024: 6 preset + reset default.
 * Image picker thatch (require expo-image-picker cho upload that).
 */
import { View, Text, Pressable, Image, Alert } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Button } from '@/components/ui';
import { ToastService } from '@/components/ui/Toast';
import { Check } from 'lucide-react-native';

// 6 preset avatars (data URI PNG nho, transparent se giong initial)
const PRESET_AVATARS = [
  { id: 'preset-1', label: 'Xanh dương', color: '#0F766E' },
  { id: 'preset-2', label: 'Cam ấm', color: '#7C2D12' },
  { id: 'preset-3', label: 'Tím', color: '#9333EA' },
  { id: 'preset-4', label: 'Xanh lá', color: '#16A34A' },
  { id: 'preset-5', label: 'Vàng', color: '#CA8A04' },
  { id: 'preset-6', label: 'Hồng', color: '#DB2777' },
];

export interface AvatarPickerProps {
  currentAvatar: string | null;
  userName: string;
  onSelectPreset: (color: string) => Promise<void>;
  onReset: () => Promise<void>;
  onUpload: () => Promise<void>;
}

export function AvatarPicker({ currentAvatar, userName, onSelectPreset, onReset, onUpload }: AvatarPickerProps) {
  const theme = useTheme();

  const handleUpload = async () => {
    try {
      await onUpload();
    } catch (e) {
      Alert.alert('Lỗi upload', 'Không thể chọn ảnh lúc này. Thử lại sau.');
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <Card variant="default">
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 13, fontWeight: '700', marginBottom: 8 }}>
          Ảnh đại diện hiện tại
        </Text>
        <View style={{ alignItems: 'center', padding: 12 }}>
          {currentAvatar && currentAvatar.startsWith('http') ? (
            <Image source={{ uri: currentAvatar }} style={{ width: 80, height: 80, borderRadius: 40 }} />
          ) : currentAvatar && currentAvatar.startsWith('#') ? (
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: currentAvatar, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>{userName[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          ) : (
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: resolveColor(theme, 'primaryContainer'), alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: resolveColor(theme, 'onPrimaryContainer'), fontSize: 28, fontWeight: '700' }}>{userName[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          )}
        </View>
      </Card>

      <Card variant="default">
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 13, fontWeight: '700', marginBottom: 8 }}>
          Chọn màu preset
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {PRESET_AVATARS.map((preset) => {
            const isCurrent = currentAvatar === preset.color;
            return (
              <Pressable
                key={preset.id}
                accessibilityRole="button"
                accessibilityLabel={`Preset ${preset.label}`}
                onPress={async () => {
                  await onSelectPreset(preset.color);
                  ToastService.show({ message: `Đã đổi avatar: ${preset.label}`, tone: 'success' });
                }}
                style={{ alignItems: 'center', gap: 4 }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: preset.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: isCurrent ? 3 : 0,
                    borderColor: resolveColor(theme, 'primary'),
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{userName[0]?.toUpperCase() ?? '?'}</Text>
                  {isCurrent && (
                    <View style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: resolveColor(theme, 'primary'), alignItems: 'center', justifyContent: 'center' }}>
                      <Check color="#fff" size={14} />
                    </View>
                  )}
                </View>
                <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 10 }}>{preset.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Button label="Tải ảnh lên (demo)" variant="secondary" fullWidth onPress={handleUpload} />
      <Button label="Đặt lại mặc định" variant="ghost" fullWidth onPress={onReset} />
    </View>
  );
}

export default AvatarPicker;
