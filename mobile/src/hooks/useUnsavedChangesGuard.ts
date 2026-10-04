import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from 'expo-router';

type PendingNavigationAction = Parameters<ReturnType<typeof useNavigation>['dispatch']>[0];

export function useUnsavedChangesGuard(shouldPrevent: boolean, onDiscard: () => void) {
  const navigation = useNavigation();
  const [pendingAction, setPendingAction] = useState<PendingNavigationAction | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldPrevent) return;
    return navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();
      setPendingAction(event.data.action);
      setVisible(true);
    });
  }, [navigation, shouldPrevent]);

  const cancel = useCallback(() => {
    setVisible(false);
    setPendingAction(null);
  }, []);

  const discard = useCallback(() => {
    if (!pendingAction) return;
    setVisible(false);
    onDiscard();
    requestAnimationFrame(() => navigation.dispatch(pendingAction));
    setPendingAction(null);
  }, [navigation, onDiscard, pendingAction]);

  return { visible, cancel, discard };
}
