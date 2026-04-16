import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Entitlement store. The UI only cares about `isPro` + the active
 * `offeringId`; everything else (receipts, expiry) stays in
 * RevenueCat and is resolved on app resume.
 */
export type SubscriptionState = {
  isPro: boolean;
  offeringId: 'family_monthly' | 'family_yearly' | null;
  grantedAt: number | null;
};

type Actions = {
  grant: (offeringId: SubscriptionState['offeringId']) => void;
  revoke: () => void;
};

export const useSubscriptionStore = create<SubscriptionState & Actions>()(
  persist(
    (set) => ({
      isPro: false,
      offeringId: null,
      grantedAt: null,
      grant: (offeringId) =>
        set({ isPro: true, offeringId, grantedAt: Date.now() }),
      revoke: () => set({ isPro: false, offeringId: null, grantedAt: null }),
    }),
    {
      name: 'kidsketch.subscription',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
