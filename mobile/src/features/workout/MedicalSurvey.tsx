/**
 * MedicalSurvey — FP-019: y tế trước khi tập.
 */
import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '@/theme';
import { resolveColor } from '@/theme/ThemeProvider';
import { Card, Chip, Button, Input } from '@/components/ui';

export interface MedicalSurveyProps {
  onSubmit: (data: { conditions: string[]; notes: string }) => void;
  defaultConditions?: string[];
  defaultNotes?: string;
}

const CONDITIONS = [
  'Tiểu đường', 'Huyết áp cao', 'Tim mạch', 'Hen suyễn', 'Đau lưng', 'Đau khớp',
];

export function MedicalSurvey({ onSubmit, defaultConditions = [], defaultNotes = '' }: MedicalSurveyProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<string[]>(defaultConditions);
  const [notes, setNotes] = useState(defaultNotes);

  const toggle = (c: string) => {
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Card variant="default">
        <Text style={{ color: resolveColor(theme, 'onSurface'), fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
          Khảo sát y tế
        </Text>
        <Text style={{ color: resolveColor(theme, 'onSurfaceVariant'), fontSize: 12, marginBottom: 12 }}>
          Chọn tình trạng sức khoẻ hiện tại (có thể chọn nhiều).
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CONDITIONS.map((c) => (
            <Chip key={c} label={c} selected={selected.includes(c)} onPress={() => toggle(c)} />
          ))}
        </View>
      </Card>
      <Input
        label="Ghi chú cho PT"
        value={notes}
        onChangeText={setNotes}
        placeholder="Mô tả chi tiết nếu cần..."
        multiline
        numberOfLines={4}
      />
      <Button label="Lưu khảo sát" variant="primary" fullWidth onPress={() => onSubmit({ conditions: selected, notes })} />
    </ScrollView>
  );
}

export default MedicalSurvey;
