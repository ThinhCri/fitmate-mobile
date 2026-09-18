/**
 * HomepageBackground — gradient + watermark logo phia sau.
 *
 * DEC-025 (2026-09-18):
 *  - Layer A: solid bg = page bg (cool white).
 *  - Layer B: LinearGradient mint teal hai goc (top-left deep mint -> page bg).
 *  - Layer C: Watermark logo "Fitmate" text-style phia sau, opacity 6%.
 *  - Layer D: noi dung va card phia tren.
 *
 * Chinh sach:
 *  - Watermark dung `watermarkInk` token (cung primary teal), opacity 6%.
 *  - Khong nhan touch (pointerEvents="none"), khong xuat hien accessibility tree.
 *  - Nen co dinh (absolute) — khong parallax, khong animate.
 *  - Card noi dung phai surface dac (white) de doc ro.
 */
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';

export interface HomepageBackgroundProps {
  children: React.ReactNode;
}

export function HomepageBackground({ children }: HomepageBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Layer A: solid base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F5F8F8' }]} />

      {/* Layer B: gradient top-left (deeper mint) + bottom-right (page bg) */}
      <LinearGradient
        colors={['#CFE0DE', '#DDEEEC', '#F5F8F8']}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Layer C: Watermark logo (text-style "Fitmate") */}
      <WatermarkLogo />

      {/* Layer D: noi dung */}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

/**
 * WatermarkLogo — text-style "Fitmate" mat, khong nhan touch.
 * Dung font hien co, font weight 800, size rat lon (~180dp), opacity 6%.
 */
function WatermarkLogo() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const ink = resolveColor(theme, 'watermarkInk');

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        StyleSheet.absoluteFill,
        {
          // Logo canh giua, lech len top (~120dp duoi top edge) de khong canh text noi dung
          paddingTop: insets.top + 110,
          alignItems: 'center',
        },
      ]}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontSize: 168,
          fontWeight: '900',
          letterSpacing: -4,
          color: ink,
          opacity: theme.tokens.opacity.watermark,
          // Tao depth bang shadow nhe trong cung tone (rat nhe).
          textShadowColor: ink,
          textShadowRadius: 24,
          textShadowOffset: { width: 0, height: 0 },
        }}
      >
        Fitmate
      </Text>
    </View>
  );
}
