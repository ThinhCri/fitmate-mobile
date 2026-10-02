import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
export default function MessageAlias() { const { id } = useLocalSearchParams<{ id: string }>(); return <Redirect href={`/chat/${encodeURIComponent(id)}` as never} />; }
