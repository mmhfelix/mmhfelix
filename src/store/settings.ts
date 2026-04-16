import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Parental controls + app-level preferences.
 *
 * `nsfwFilter` is *force-true* at the UI layer — we expose a setter
 * here only for future admin overrides. Kids must never be able to
 * flip it from inside the app.
 */
export type SettingsState = {
  nsfwFilter: true; // invariant: always true
  dailyTimeLimitMin: number | null; // null = no limit
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  parentalPin: string | null;
  /** Count of photos transformed today — resets daily from the UI. */
  dailyQuotaUsed: number;
  dailyQuotaDate: string; // YYYY-MM-DD
};

type Actions = {
  setDailyTimeLimit: (min: number | null) => void;
  setSoundEnabled: (v: boolean) => void;
  setHapticsEnabled: (v: boolean) => void;
  setParentalPin: (pin: string | null) => void;
  incrementQuota: () => void;
  resetQuotaIfNewDay: () => void;
};

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const useSettingsStore = create<SettingsState & Actions>()(
  persist(
    (set, get) => ({
      nsfwFilter: true,
      dailyTimeLimitMin: null,
      soundEnabled: true,
      hapticsEnabled: true,
      parentalPin: null,
      dailyQuotaUsed: 0,
      dailyQuotaDate: todayKey(),

      setDailyTimeLimit: (min) => set({ dailyTimeLimitMin: min }),
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setHapticsEnabled: (v) => set({ hapticsEnabled: v }),
      setParentalPin: (pin) => set({ parentalPin: pin }),

      incrementQuota: () => {
        get().resetQuotaIfNewDay();
        set((s) => ({ dailyQuotaUsed: s.dailyQuotaUsed + 1 }));
      },

      resetQuotaIfNewDay: () => {
        const today = todayKey();
        if (get().dailyQuotaDate !== today) {
          set({ dailyQuotaDate: today, dailyQuotaUsed: 0 });
        }
      },
    }),
    {
      name: 'kidsketch.settings',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Free tier = 3 AI transforms per day. Keep in sync with pricing copy. */
export const FREE_DAILY_QUOTA = 3;
