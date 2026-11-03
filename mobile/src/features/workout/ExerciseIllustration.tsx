import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImageOff } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme/designTokens';
import { Image as CachedImage } from 'expo-image';

export function ExerciseIllustration({ uri, label, onRetry }: {
  uri?: string;
  label: string;
  onRetry?: () => Promise<void>;
}) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [retrying, setRetrying] = useState(false);
  // Only the shared exercise catalog is public/stable. Keep signed private media
  // keyed by the full URL so an account change cannot reuse another user's URL.
  const publicPath = uri?.split('?')[0];
  const isCatalogMedia = /\/exercise-catalog\/[A-Za-z0-9_-]+\/[01]\.jpg$/.test(publicPath ?? '');
  const cacheKey = isCatalogMedia ? publicPath : uri;
  const automaticRetryKey = useRef<string | undefined>(undefined);
  useEffect(() => { automaticRetryKey.current = undefined; }, [cacheKey]);
  useEffect(() => { setFailed(false); setLoading(true); }, [uri]);

  async function retry() {
    setRetrying(true);
    try {
      await onRetry?.();
      setFailed(false);
      setLoading(true);
      setAttempt(value => value + 1);
    } catch { setFailed(true); }
    finally { setRetrying(false); }
  }

  return <View style={styles.frame}>
    {uri && !failed ? <CachedImage key={`${uri}-${attempt}`} source={{ uri, cacheKey }} style={styles.image} contentFit="contain" cachePolicy="memory-disk"
      accessibilityLabel={label} onLoad={() => setLoading(false)} onError={() => {
        setFailed(true); setLoading(false);
        // Renew a potentially expired catalog URL once, never loop on missing objects.
        if (onRetry && isCatalogMedia && cacheKey && automaticRetryKey.current !== cacheKey) {
          automaticRetryKey.current = cacheKey;
          void retry();
        }
      }} /> : null}
    {uri && !failed && loading ? <View style={styles.placeholder}><ActivityIndicator color={colors.primary} /><Text style={styles.caption}>Đang tải ảnh…</Text></View> : null}
    {!uri || failed ? <View style={styles.placeholder}>
      <ImageOff size={24} color={colors.textMuted} />
      <Text style={styles.caption}>{uri ? 'Không tải được ảnh' : 'Chưa có ảnh minh họa'}</Text>
      {uri ? <TouchableOpacity onPress={() => void retry()} disabled={retrying} accessibilityRole="button" accessibilityLabel={`Tải lại ${label}`} style={styles.retry}>
        <Text style={styles.retryText}>{retrying ? 'Đang tải…' : 'Tải lại'}</Text>
      </TouchableOpacity> : null}
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  frame: { height: 170, width: '100%', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceSubtle },
  image: { height: '100%', width: '100%' },
  placeholder: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, padding: spacing.sm },
  caption: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  retry: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  retryText: { ...typography.captionMedium, color: colors.primary },
});
