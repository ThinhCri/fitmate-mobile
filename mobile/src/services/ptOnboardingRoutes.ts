/** Routes an unapproved PT must be able to reach to finish onboarding. */
export function canAccessUnverifiedPtPath(path: string): boolean {
  return path === '/pt/certificates' ||
    path === '/pt/verify-phone' ||
    path === '/(auth)' ||
    path.startsWith('/(auth)/');
}
