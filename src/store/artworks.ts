import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { deleteIfExists } from '@/services/storage';
import type { StylePresetId } from '@/constants/styles';

/**
 * A single piece of kid-art. We store enough metadata to rehydrate
 * the coloring canvas if the child wants to keep working on it.
 */
export type Artwork = {
  id: string;
  createdAt: number;
  styleId: StylePresetId | 'daily' | 'prompt';
  /** Stable URI of the line-art source (the thing the kid colors). */
  lineArtUri: string;
  /** Optional colored export URI (produced when they save their work). */
  coloredUri?: string;
  title?: string;
  favorite: boolean;
};

type State = {
  items: Artwork[];
};

type Actions = {
  add: (art: Omit<Artwork, 'id' | 'createdAt' | 'favorite'>) => Artwork;
  update: (id: string, patch: Partial<Artwork>) => void;
  remove: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  clearAll: () => Promise<void>;
};

export const useArtworksStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: [],

      add: (partial) => {
        const art: Artwork = {
          id: `art_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: Date.now(),
          favorite: false,
          ...partial,
        };
        set((s) => ({ items: [art, ...s.items] }));
        return art;
      },

      update: (id, patch) =>
        set((s) => ({
          items: s.items.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      remove: async (id) => {
        const target = get().items.find((a) => a.id === id);
        set((s) => ({ items: s.items.filter((a) => a.id !== id) }));
        if (target) {
          // Fire-and-forget file cleanup so the UI never waits on I/O.
          await Promise.all([
            deleteIfExists(target.lineArtUri),
            target.coloredUri ? deleteIfExists(target.coloredUri) : Promise.resolve(),
          ]);
        }
      },

      toggleFavorite: (id) =>
        set((s) => ({
          items: s.items.map((a) =>
            a.id === id ? { ...a, favorite: !a.favorite } : a
          ),
        })),

      clearAll: async () => {
        const items = get().items;
        set({ items: [] });
        await Promise.all(
          items.flatMap((a) => [
            deleteIfExists(a.lineArtUri),
            a.coloredUri ? deleteIfExists(a.coloredUri) : Promise.resolve(),
          ])
        );
      },
    }),
    {
      name: 'kidsketch.artworks',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the actual list. We never want to hydrate an
      // in-flight function reference.
      partialize: (s) => ({ items: s.items }),
    }
  )
);
