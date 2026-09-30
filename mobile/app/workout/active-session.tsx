import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ActiveSessionPresentation,
  SessionPhase,
} from '../../src/features/workout/ActiveSessionPresentation';
import { CheckpointRestoreModal, EndEarlyModal } from '../../src/features/workout/SessionModals';
import { WorkoutPlanViewModel } from '../../src/features/workout/workoutTypes';

const ACTIVE_PLAN: WorkoutPlanViewModel = {
  id: 'plan-1',
  title: 'Upper Body A — Sức mạnh',
  category: 'Sức mạnh • Thân trên',
  description: 'Tập trung kích thích nhóm cơ ngực, vai và tay sau.',
  durationMinutes: 45,
  caloriesEstimate: 320,
  isActive: true,
  exercises: [
    {
      id: 'ex-1',
      name: 'Đẩy ngực tạ đòn (Bench Press)',
      type: 'reps',
      sets: 4,
      repsPerSet: 10,
      restSeconds: 90,
      caloriesEstimate: 80,
    },
    {
      id: 'ex-2',
      name: 'Đẩy tạ đơn dốc lên (Incline DB Press)',
      type: 'reps',
      sets: 3,
      repsPerSet: 12,
      restSeconds: 60,
      caloriesEstimate: 70,
    },
  ],
};

export default function ActiveSessionScreen() {
  const router = useRouter();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [phase, setPhase] = useState<SessionPhase>('exercise');
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showEndEarlyModal, setShowEndEarlyModal] = useState(false);

  const currentExercise = ACTIVE_PLAN.exercises[currentExerciseIndex];
  const nextExercise = ACTIVE_PLAN.exercises[currentExerciseIndex + 1];

  const handleCompleteSet = (_actualReps?: number) => {
    if (currentSetIndex + 1 < currentExercise.sets) {
      setCurrentSetIndex(currentSetIndex + 1);
      setPhase('rest');
      setRemainingSeconds(currentExercise.restSeconds);
    } else if (currentExerciseIndex + 1 < ACTIVE_PLAN.exercises.length) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      setPhase('rest');
      setRemainingSeconds(currentExercise.restSeconds);
    } else {
      router.replace('/workout/summary' as any);
    }
  };

  const handleSkipRest = () => {
    setPhase('exercise');
  };

  const handleTogglePause = () => {
    setPhase(phase === 'paused' ? 'exercise' : 'paused');
  };

  const handleSkipExercise = () => {
    if (currentExerciseIndex + 1 < ACTIVE_PLAN.exercises.length) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      setPhase('exercise');
    } else {
      router.replace('/workout/summary' as any);
    }
  };

  return (
    <View style={styles.container}>
      <ActiveSessionPresentation
        planTitle={ACTIVE_PLAN.title}
        currentExercise={currentExercise}
        currentSetIndex={currentSetIndex}
        totalSets={currentExercise.sets}
        currentExerciseIndex={currentExerciseIndex}
        totalExercises={ACTIVE_PLAN.exercises.length}
        nextExercise={nextExercise}
        phase={phase}
        remainingSeconds={remainingSeconds}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        onCompleteSet={handleCompleteSet}
        onSkipRest={handleSkipRest}
        onTogglePause={handleTogglePause}
        onSkipExercise={handleSkipExercise}
        onEndEarly={() => setShowEndEarlyModal(true)}
      />

      <CheckpointRestoreModal
        visible={showRestoreModal}
        planTitle={ACTIVE_PLAN.title}
        startedAtText="25 phút trước"
        completedSets={3}
        totalSets={7}
        currentExerciseName="Incline DB Press"
        progressPercent={40}
        onResume={() => setShowRestoreModal(false)}
        onDiscard={() => {
          setShowRestoreModal(false);
          router.back();
        }}
      />

      <EndEarlyModal
        visible={showEndEarlyModal}
        completedExercises={currentExerciseIndex}
        totalExercises={ACTIVE_PLAN.exercises.length}
        completedSets={currentSetIndex + 1}
        skippedSets={ACTIVE_PLAN.exercises.reduce((s, e) => s + e.sets, 0) - (currentSetIndex + 1)}
        onSaveAndExit={() => {
          setShowEndEarlyModal(false);
          router.replace('/workout/summary' as any);
        }}
        onContinue={() => setShowEndEarlyModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
