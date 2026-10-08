import {
  WorkoutPlanViewModel,
  WorkoutHistoryItemViewModel,
  WorkoutSessionSummaryViewModel,
  WeightRecordViewModel,
} from '@/features/workout/workoutTypes';
import type { IWorkoutRepository, MonthlyWorkoutStats } from '../workoutRepository';
import { mockUserService } from '@/services/mockUserService';

const MOCK_PLAN: WorkoutPlanViewModel = {
  id: 'plan-1',
  title: 'Upper Body A — Sức mạnh',
  category: 'Sức mạnh • Thân trên',
  description: 'Tập trung kích thích nhóm cơ ngực, vai và tay sau với các bài compound chính.',
  durationMinutes: 45,
  caloriesEstimate: 320,
  isActive: true,
  coachName: 'HLV Tuấn Anh',
  coachVerified: true,
  coachNotes: 'Nghỉ đủ 90s giữa các hiệp tạ nặng. Chú ý khóa khớp cổ tay khi đẩy ngực.',
  exercises: [
    {
      id: 'ex-1',
      name: 'Đẩy ngực tạ đòn (Barbell Bench Press)',
      type: 'reps',
      sets: 4,
      repsPerSet: 10,
      restSeconds: 90,
      caloriesEstimate: 80,
      targetMuscle: 'Ngực',
      instructions: 'Hạ thanh đòn chạm ngực dưới, đẩy dứt khoát không khóa khớp cùi chỏ quá mạnh.',
    },
    {
      id: 'ex-2',
      name: 'Đẩy tạ đơn dốc lên (Incline DB Press)',
      type: 'reps',
      sets: 3,
      repsPerSet: 12,
      restSeconds: 60,
      caloriesEstimate: 70,
      targetMuscle: 'Ngực trên',
    },
    {
      id: 'ex-3',
      name: 'Plank giữ thăng bằng',
      type: 'time',
      sets: 3,
      durationSeconds: 60,
      restSeconds: 45,
      caloriesEstimate: 40,
      targetMuscle: 'Core',
    },
  ],
};

const MOCK_SESSIONS: WorkoutHistoryItemViewModel[] = [
  {
    id: 'ses-1',
    planId: 'plan-1',
    planTitle: 'Upper Body A — Thể lực & Sức mạnh',
    category: 'Thân trên',
    completedAt: 'Hôm nay, 18:45',
    durationSeconds: 2535,
    totalVolumeKg: 3450,
    caloriesBurned: 295,
    completedSets: 6,
    totalSets: 7,
    syncStatus: 'pending',
  },
  {
    id: 'ses-2',
    planId: 'plan-2',
    planTitle: 'Lower Body & Core B',
    category: 'Thân dưới',
    completedAt: 'Thứ Năm, 26/09/2026',
    durationSeconds: 2700,
    totalVolumeKg: 4200,
    caloriesBurned: 350,
    completedSets: 8,
    totalSets: 8,
    syncStatus: 'synced',
  },
  {
    id: 'ses-3',
    planId: 'plan-3',
    planTitle: 'Cardio HIIT & Bụng',
    category: 'Cardio',
    completedAt: 'Thứ Ba, 24/09/2026',
    durationSeconds: 1800,
    totalVolumeKg: 0,
    caloriesBurned: 280,
    completedSets: 5,
    totalSets: 5,
    syncStatus: 'synced',
  },
];

const MOCK_MONTHLY_STATS: MonthlyWorkoutStats = {
  monthYear: 'Tháng 9/2026',
  completedCount: 24,
  targetCount: 25,
  totalVolumeKg: 38450,
  caloriesBurned: 7200,
  averageDurationMinutes: 45,
};

const MOCK_SESSION_DETAIL: WorkoutSessionSummaryViewModel = {
  id: 'ses-20260928-098',
  planId: 'plan-1',
  planTitle: 'Upper Body A — Thể lực & Sức mạnh',
  startedAt: 'Thứ Hai, 28/09/2026 • 18:00 - 18:42:15',
  endedAt: '18:42:15',
  durationSeconds: 2535,
  caloriesBurned: 295,
  totalExercises: 2,
  completedExercises: 2,
  totalSets: 7,
  completedSets: 6,
  syncStatus: 'pending',
  records: [
    {
      exerciseId: 'ex-1',
      exerciseName: 'Đẩy ngực tạ đòn (Barbell Bench Press)',
      sets: [
        { setNumber: 1, repsCompleted: 10, status: 'completed' },
        { setNumber: 2, repsCompleted: 10, status: 'completed' },
        { setNumber: 3, repsCompleted: 10, status: 'completed' },
        { setNumber: 4, repsCompleted: 8, status: 'completed' },
      ],
    },
    {
      exerciseId: 'ex-2',
      exerciseName: 'Đẩy tạ đơn dốc lên (Incline DB Press)',
      sets: [
        { setNumber: 1, repsCompleted: 12, status: 'completed' },
        { setNumber: 2, repsCompleted: 10, status: 'completed' },
        { setNumber: 3, status: 'skipped' },
      ],
    },
  ],
};

let previewWeightRecords: WeightRecordViewModel[] = [
  {
    id: 'w-1',
    weightKg: 67.8,
    recordedAt: 'Hôm nay, 07:15',
    notes: 'Đo sau khi thức dậy',
    differenceFromPreviousKg: -0.1,
  },
  {
    id: 'w-2',
    weightKg: 67.9,
    recordedAt: 'Hôm qua, 07:10',
    notes: 'Sau khi chạy bộ',
    differenceFromPreviousKg: -0.1,
  },
  {
    id: 'w-3',
    weightKg: 68.0,
    recordedAt: '26/09/2026, 07:20',
    differenceFromPreviousKg: -0.2,
  },
  {
    id: 'w-4',
    weightKg: 68.2,
    recordedAt: '24/09/2026, 07:05',
    differenceFromPreviousKg: -0.3,
  },
];

export class PreviewWorkoutRepository implements IWorkoutRepository {
  async listExerciseCatalog() {
    return MOCK_PLAN.exercises.map((exercise) => ({
      id: exercise.id,
      slug: exercise.id,
      nameVi: exercise.name,
      nameEn: exercise.name,
      type: exercise.type,
      difficulty: 'beginner',
      equipment: undefined,
      primaryMuscles: exercise.targetMuscle ? [exercise.targetMuscle] : [],
      secondaryMuscles: [],
      instructionsVi: exercise.instructions ? [exercise.instructions] : [],
      imageStartUrl: undefined,
      imageEndUrl: undefined,
      source: 'development-preview',
      sourceLicense: 'preview-only',
    }));
  }

  async createPlan(_plan: Partial<WorkoutPlanViewModel>): Promise<string> { return `preview-plan-${Date.now()}`; }
  async updatePlan(_id: string, _plan: Partial<WorkoutPlanViewModel>): Promise<void> {}
  async deletePlan(_id: string): Promise<void> {}
  async listPlans(): Promise<WorkoutPlanViewModel[]> {
    return [{ ...MOCK_PLAN, exercises: [...MOCK_PLAN.exercises] }];
  }

  async getPlan(id: string): Promise<WorkoutPlanViewModel> {
    return {
      ...MOCK_PLAN,
      id: id || MOCK_PLAN.id,
    };
  }

  async getHistory(): Promise<{
    sessions: WorkoutHistoryItemViewModel[];
    stats: MonthlyWorkoutStats;
  }> {
    return {
      sessions: [...MOCK_SESSIONS],
      stats: { ...MOCK_MONTHLY_STATS },
    };
  }

  async getSessionDetail(id: string): Promise<WorkoutSessionSummaryViewModel> {
    return {
      ...MOCK_SESSION_DETAIL,
      id: id || MOCK_SESSION_DETAIL.id,
    };
  }

  async getWeightRecords(): Promise<{
    records: WeightRecordViewModel[];
    currentWeightKg: number;
    goalWeightKg: number;
    changeLast7DaysKg: number;
  }> {
    return {
      records: [...previewWeightRecords],
      currentWeightKg: previewWeightRecords[0]?.weightKg ?? 67.8,
      goalWeightKg: 65.0,
      changeLast7DaysKg: -0.4,
    };
  }

  async addWeightRecord(weightKg: number, notes?: string): Promise<WeightRecordViewModel> {
    const prevWeight = previewWeightRecords[0]?.weightKg ?? weightKg;
    const newRecord: WeightRecordViewModel = {
      id: `w-${Date.now()}`,
      weightKg,
      recordedAt: 'Vừa xong',
      notes,
      differenceFromPreviousKg: Number((weightKg - prevWeight).toFixed(1)),
    };
    previewWeightRecords = [newRecord, ...previewWeightRecords];
    return newRecord;
  }

  async deleteWeightRecord(id: string): Promise<void> {
    previewWeightRecords = previewWeightRecords.filter((r) => r.id !== id);
  }

  async getWorkoutGoals() {
    return { targetWeightKg: 65, monthlyWorkoutTarget: 12 };
  }

  async updateWorkoutGoals(goals: { targetWeightKg?: number | null; monthlyWorkoutTarget?: number | null }) {
    return {
      targetWeightKg: goals.targetWeightKg ?? 65,
      monthlyWorkoutTarget: goals.monthlyWorkoutTarget ?? 12,
    };
  }

  async recordWorkoutCompletion(params: {
    planId?: string;
    day?: string;
    name?: string;
    durationMinutes: number;
    caloriesBurned: number;
    completedSets: number;
    plannedSets: number;
    status: 'completed' | 'endedEarly';
    results: import('@/features/workout/workoutTypes').ActiveWorkoutResult[];
  }): Promise<string> {
    const user = await mockUserService.getCurrentUser();
    if (user) {
      await mockUserService.saveUser({
        ...user,
        caloriesBurned: (user.caloriesBurned || 0) + params.caloriesBurned,
        workoutHistory: [
          ...(user.workoutHistory || []),
          {
            id: `wh-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            day: params.day || 'T2',
            durationMin: params.durationMinutes,
            caloriesBurned: params.caloriesBurned,
            exercises: 4,
            completedSets: params.completedSets,
            plannedSets: params.plannedSets,
            status: params.status,
          },
        ],
      });
    }
    return `preview-session-${Date.now()}`;
  }

  async saveMedicalSurvey(conditions: string[], notes: string): Promise<void> {
    const user = await mockUserService.getCurrentUser();
    if (user) {
      await mockUserService.saveUser({
        ...user,
        medicalConditions: conditions,
        medicalNotes: notes,
      });
    }
  }
}

export const previewWorkoutRepository = new PreviewWorkoutRepository();
