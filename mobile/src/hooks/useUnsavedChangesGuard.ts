import { useCallback, useState } from 'react';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import type { NavigationAction } from '@react-navigation/native';

export function useUnsavedChangesGuard(shouldPrevent: boolean, onDiscard: () => void) {
  const navigation = useNavigation();
  const [pendingAction, setPendingAction] = useState<NavigationAction | null>(null);
  const [visible, setVisible] = useState(false);

  usePreventRemove(shouldPrevent, ({ data }) => {
    setPendingAction(data.action);
    setVisible(true);
  });

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
