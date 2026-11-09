import { aiSubscriptionService, aiUsageService } from './api/aiUsageService';

const listeners = new Set<(userId: string) => void>();
export function notifyAiPlanChanged(userId: string) {
  for (const listener of listeners) listener(userId);
}
export function subscribeAiPlanChanged(listener: (userId: string) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export async function loadAiPlanState() {
  let subscription = await aiSubscriptionService.getStatus();
  const usage = await aiUsageService.getStatus();
  // A background recovery can finish between these requests. Re-read once;
  // never label a contradictory/unknown response as a confirmed free plan.
  if (subscription.plan !== usage.plan) subscription = await aiSubscriptionService.getStatus();
  if (subscription.plan !== usage.plan)
    throw new Error('Gói AI vừa thay đổi. Vui lòng thử tải lại.');
  return { subscription, usage };
}
