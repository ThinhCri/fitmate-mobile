import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function WorkoutLogAlias() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/workout/session/${encodeURIComponent(id)}` as never} />;
}
