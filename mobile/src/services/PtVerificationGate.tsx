import { useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import { useAuth } from './AuthContext';

/** Prevents an unapproved PT from bypassing onboarding with a deep link. */
export function PtVerificationGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading || !user || user.role !== 'pt' || user.ptVerificationStatus === 'approved') return;
    const path = '/' + segments.join('/');
    const allowed = path.startsWith('/pt/certificates') || path.startsWith('/(auth)');
    if (!allowed) router.replace('/pt/certificates');
  }, [loading, segments, user]);

  return null;
}

