import { useCallback } from 'react';

import { FREE_DAILY_QUOTA, useSettingsStore } from '@/store/settings';
import { useSubscriptionStore } from '@/store/subscription';

/**
 * Combined entitlement + quota check.
 *
 * Returns `canTransform` (bool) plus a `consume()` that the caller
 * should await *after* a successful transform. We split the check
 * from the consume so the UI can show the paywall before spending
 * anything (both AI dollars and the kid's patience).
 */
export function useQuota() {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const { dailyQuotaUsed, resetQuotaIfNewDay, incrementQuota } =
    useSettingsStore();

  // Cheap to call on every render; internally a no-op when the day
  // hasn't rolled over.
  resetQuotaIfNewDay();

  const remaining = Math.max(0, FREE_DAILY_QUOTA - dailyQuotaUsed);
  const canTransform = isPro || remaining > 0;

  const consume = useCallback(() => {
    if (isPro) return;
    incrementQuota();
  }, [isPro, incrementQuota]);

  return { canTransform, remaining, isPro, consume };
}
