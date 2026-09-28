import { MemberDashboardSummary } from '@/services/api/types';

export const memberHomeFixture: MemberDashboardSummary = {
  greetingName: 'Hùng',
  dateLabel: 'Hôm nay, 28 tháng 9',
  calories: {
    consumed: 1450,
    target: 2000,
    burned: 250,
  },
  macros: {
    protein: { currentGrams: 85, targetGrams: 140 },
    carbs: { currentGrams: 160, targetGrams: 220 },
    fat: { currentGrams: 45, targetGrams: 65 },
  },
  water: {
    consumedMl: 1500,
    targetMl: 2500,
  },
  streakDays: 5,
  todayWorkout: {
    id: 'workout-today-1',
    title: 'Thân trên & Cơ lõi (Upper Body)',
    durationMinutes: 45,
    exerciseCount: 6,
    isCompleted: false,
  },
  todayMeals: [
    {
      id: 'meal-1',
      name: 'Bánh mì ngũ cốc & trứng luộc',
      type: 'breakfast',
      calories: 380,
      time: '07:30',
    },
    {
      id: 'meal-2',
      name: 'Ức gà nướng & cơm gạo lứt',
      type: 'lunch',
      calories: 550,
      time: '12:15',
    },
  ],
};
