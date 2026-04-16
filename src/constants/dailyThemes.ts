import { colors } from '@/theme';

/**
 * Daily themes rotate on a 7-day cycle based on day-of-week. A true
 * remote-curated feed is a Phase-2 concern; this static cycle is
 * enough for MVP and still drives the "come back tomorrow" habit loop.
 *
 * Each theme's `seedImage` is a pre-generated coloring page we ship
 * with the app so the feature works fully offline for the free tier.
 */
export type DailyTheme = {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  tint: string;
  /** Prompt fed to AI when the user taps "make my own version". */
  prompt: string;
};

export const DAILY_THEMES: readonly DailyTheme[] = [
  {
    id: 'ocean',
    title: 'Ocean Friends',
    tagline: 'Dive in and meet the fish',
    emoji: '🐠',
    tint: colors.skyBlue,
    prompt: 'Cute coloring page of friendly ocean animals, bold outlines.',
  },
  {
    id: 'space',
    title: 'Space Explorer',
    tagline: 'Blast off to the stars',
    emoji: '🚀',
    tint: colors.lavender,
    prompt: 'Kid-friendly coloring page of a rocket and planets, thick outlines.',
  },
  {
    id: 'dinosaur',
    title: 'Dino Day',
    tagline: 'ROAR! Meet the dinosaurs',
    emoji: '🦖',
    tint: colors.grassGreen,
    prompt: 'Cartoon dinosaur coloring page, playful, bold outlines.',
  },
  {
    id: 'forest',
    title: 'Forest Friends',
    tagline: 'A walk with woodland pals',
    emoji: '🦊',
    tint: colors.coralOrange,
    prompt: 'Cute forest animal coloring page, rounded shapes, bold outlines.',
  },
  {
    id: 'superhero',
    title: 'Tiny Hero',
    tagline: 'Who will you save today?',
    emoji: '🦸',
    tint: colors.sunYellow,
    prompt: 'Child-safe superhero coloring page, cape, bold outlines.',
  },
  {
    id: 'farm',
    title: 'Farm Morning',
    tagline: 'The animals are waking up',
    emoji: '🐮',
    tint: colors.grassGreen,
    prompt: 'Cute farm animal coloring page, sunny, bold outlines.',
  },
  {
    id: 'fairytale',
    title: 'Fairytale Castle',
    tagline: 'Unicorns, dragons & magic',
    emoji: '🏰',
    tint: colors.lavender,
    prompt: 'Whimsical fairytale castle coloring page, bold outlines.',
  },
];

export function themeOfTheDay(now: Date = new Date()): DailyTheme {
  // Zero-base mapping by local day-of-year keeps the theme stable for
  // a calendar day even if the user scrubs the app clock.
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  const idx = day % DAILY_THEMES.length;
  // Safe because DAILY_THEMES has >0 entries and idx is in-range.
  return DAILY_THEMES[idx]!;
}
