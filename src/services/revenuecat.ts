import Constants from 'expo-constants';

/**
 * RevenueCat adapter.
 *
 * We expose a sync-ish API that matches how the UI wants to think
 * about entitlements ("is this user Pro?") rather than exposing
 * native receipts. Real integration happens in Phase 2 once we have
 * App Store / Play Console listings; until then a dev-mode toggle in
 * the settings store flips the Pro flag for QA.
 */

export type Offering = {
  id: string;
  title: string;
  priceLabel: string;
  period: 'month' | 'year';
  highlighted?: boolean;
  badge?: string;
};

/** Canonical price ladder — matches the spec in the PRD. */
export const OFFERINGS: readonly Offering[] = [
  {
    id: 'family_monthly',
    title: 'Family Monthly',
    priceLabel: '$4.99 / month',
    period: 'month',
  },
  {
    id: 'family_yearly',
    title: 'Family Yearly',
    priceLabel: '$29.99 / year',
    period: 'year',
    highlighted: true,
    badge: 'Save 50%',
  },
];

export async function initRevenueCat(userId?: string): Promise<void> {
  const extra = (Constants.expoConfig?.extra ?? {}) as {
    revenueCatApiKey?: string;
  };
  const key = extra.revenueCatApiKey;
  if (!key) return; // Not configured — UI runs in demo-purchase mode.
  // Intentionally left as a stub so this file doesn't require the
  // react-native-purchases native module at install time. When you're
  // ready:
  //   import Purchases from 'react-native-purchases';
  //   await Purchases.configure({ apiKey: key, appUserID: userId });
  if (__DEV__) console.log('[rc] configure', { userId });
}

/**
 * Pretend-purchase that resolves after a short delay. The paywall UI
 * checks the result; the real implementation replaces this with
 * Purchases.purchasePackage().
 */
export async function purchase(offeringId: string): Promise<'granted' | 'cancelled'> {
  await new Promise((r) => setTimeout(r, 600));
  if (__DEV__) console.log('[rc] mock purchase', offeringId);
  return 'granted';
}

export async function restore(): Promise<'granted' | 'none'> {
  await new Promise((r) => setTimeout(r, 400));
  return 'none';
}
