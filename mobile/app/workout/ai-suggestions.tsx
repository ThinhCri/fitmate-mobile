import { checkAiAccess } from '@/services/aiAccess';
import { systemService } from '@/services/api/systemService';
import { stageAiPlan } from '@/features/workout/aiPlanDraft';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { apiClient } from '@/services/api/client';
import { useAuth } from '@/services/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/designTokens';

interface Suggestion {
  suggested_plan_name: string; description: string | null; source: string; disclaimer: string | null;
  exercises: { exercise_name: string; sets: number; reps: number; rest_seconds: number | null; notes: string | null }[];
}
export default function AiWorkoutSuggestions() {
  const { user } = useAuth();
  const [goal, setGoal] = useState(''); const [equipment, setEquipment] = useState('');
  const [level, setLevel] = useState('Mới bắt đầu'); const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [result, setResult] = useState<Suggestion | null>(null);
  const [accessMessage, setAccessMessage] = useState(''); const [available, setAvailable] = useState(false); const [checking, setChecking] = useState(true);
  const generation = useRef(0); const pending = useRef(false);
  useEffect(() => { generation.current++; pending.current = false; setBusy(false); setResult(null); setError(''); setGoal(''); setEquipment(''); setNotes(''); return () => { generation.current++; }; }, [user?.id]);
  const loadAccess = async () => { const version=generation.current; setChecking(true); systemService.clearCache(); try { const access=await checkAiAccess('workout'); if(version !== generation.current) return; setAvailable(access.allowed); setAccessMessage(access.message); } catch { if(version !== generation.current) return; setAvailable(false); setAccessMessage('Không kiểm tra được dịch vụ AI. Vui lòng thử lại.'); } finally { if(version === generation.current) setChecking(false); } };
  useEffect(() => { void loadAccess(); }, [user?.id]);
  const review = () => { if (!user || !result) return; try { const id=stageAiPlan(user.id,result); router.push({pathname:'/workout/editor',params:{aiDraft:id}} as never); } catch(e) {setError(e instanceof Error ? e.message : 'Không mở được gợi ý.');} };
  const suggest = async () => {
    if (pending.current || !user || !goal.trim()) return;
    const version = generation.current; pending.current = true; setBusy(true); setError(''); setResult(null);
    try {
      const access=await checkAiAccess('workout'); if (!access.allowed) { setAvailable(false); setAccessMessage(access.message); return; }
      const response = await apiClient<Suggestion>('/me/workout/suggestions', { method: 'POST', body: JSON.stringify({
        goal: goal.trim(), fitness_level: level, equipment: equipment.split(',').map(x => x.trim()).filter(Boolean), notes: notes.trim() || null,
      }) });
      if (version === generation.current) setResult(response);
    } catch (e) { if (version === generation.current) setError(e instanceof Error ? e.message : 'Không lấy được gợi ý.'); }
    finally { if (version === generation.current) { pending.current = false; setBusy(false); } }
  };
  return <SafeAreaView style={styles.screen}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
    <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => router.back()}><Text style={styles.link}>← Quay lại</Text></TouchableOpacity>
    <Text style={typography.title1}>Gợi ý tập luyện AI</Text>
    <Text style={typography.body}>Mỗi yêu cầu thành công dùng 1 lượt AI trò chuyện. Gợi ý không tự thay đổi kế hoạch; không dùng để điều trị chấn thương hoặc bệnh lý.</Text>
    <Text accessibilityRole="text" style={typography.body}>{checking ? 'Đang kiểm tra dịch vụ AI…' : accessMessage}</Text>
    <TouchableOpacity accessibilityRole="button" style={styles.button} disabled={checking || busy} onPress={() => void loadAccess()}><Text style={styles.link}>Kiểm tra lại dịch vụ / lượt AI</Text></TouchableOpacity>
    <Text style={typography.title3}>Mục tiêu</Text>
    <TextInput style={styles.input} accessibilityLabel="Mục tiêu tập luyện" maxLength={200} value={goal} onChangeText={setGoal} placeholder="Ví dụ: duy trì vận động, tập toàn thân" editable={!busy} />
    <Text style={typography.title3}>Mức độ</Text>
    <View style={styles.row}>{['Mới bắt đầu', 'Trung bình', 'Nâng cao'].map(value => <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: level === value }} style={[styles.chip, level === value && styles.selected]} disabled={busy} onPress={() => setLevel(value)}><Text>{value}</Text></TouchableOpacity>)}</View>
    <Text style={typography.title3}>Thiết bị có sẵn</Text>
    <TextInput style={styles.input} accessibilityLabel="Thiết bị tập" value={equipment} maxLength={300} onChangeText={setEquipment} placeholder="Phân cách bằng dấu phẩy; để trống nếu không có" editable={!busy} />
    <Text style={typography.title3}>Lưu ý của bạn</Text>
    <TextInput style={styles.input} accessibilityLabel="Lưu ý tập luyện" value={notes} maxLength={1000} onChangeText={setNotes} placeholder="Giới hạn vận động hoặc nhu cầu cần lưu ý" multiline editable={!busy} />
    {error ? <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text> : null}
    <TouchableOpacity accessibilityRole="button" style={styles.button} disabled={busy || checking || !available || !goal.trim()} onPress={() => void suggest()}>{busy ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.link}>Nhận gợi ý</Text>}</TouchableOpacity>
    {result && <View style={styles.card}><Text style={typography.title2}>{result.suggested_plan_name}</Text><Text style={typography.body}>{result.description}</Text>
      {result.exercises.map((item, index) => <View key={`${index}-${item.exercise_name}`} style={styles.card}><Text style={typography.title3}>{item.exercise_name}</Text><Text style={typography.body}>{item.sets} hiệp × {item.reps} lần · Nghỉ {item.rest_seconds} giây</Text><Text style={typography.body}>{item.notes}</Text></View>)}
      <Text style={typography.caption}>{result.disclaimer}</Text>
      {result.exercises.length > 0 && <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={review}><Text style={styles.link}>Xem lại và chỉnh sửa trước khi lưu</Text></TouchableOpacity>}
    </View>}
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.md, paddingBottom: 48, gap: spacing.md },
  input: { ...typography.body, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, minHeight: 48, padding: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, chip: { minHeight: 48, justifyContent: 'center', padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.primaryLight }, card: { gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md },
  button: { minHeight: 48, justifyContent: 'center', alignItems: 'center' }, link: { ...typography.body, color: colors.primary },
});
