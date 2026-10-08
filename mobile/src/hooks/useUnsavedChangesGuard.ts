import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from 'expo-router';

type PendingNavigationAction = { type: string; payload?: object; source?: string; target?: string };
type GuardNavigation = {
  dispatch: (action: PendingNavigationAction) => void;
  addListener: (event: 'beforeRemove', callback: (event: { preventDefault: () => void; data: { action: PendingNavigationAction } }) => void) => () => void;
};

export function useUnsavedChangesGuard(shouldPrevent: boolean, onDiscard: () => void) {
  const navigation = useNavigation<GuardNavigation>();
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
